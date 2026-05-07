import { kv } from '@vercel/kv';

const DEFAULT_ADMIN_PWD = 'admin123';
const STORAGE_KEY = 'blog_posts';
const ADMIN_PWD_KEY = 'admin_password';

export default async function handler(req: Request) {
  // 어떤 상황에서도 JSON을 응답하는 헬퍼 함수
  const sendJSON = (data: any, status = 200) => {
    return new Response(JSON.stringify(data), {
      status,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });
  };

  if (req.method === 'OPTIONS') return sendJSON({}, 204);

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    // [최우선] 비밀번호 체크 - DB 연결 상태와 무관하게 동작해야 함
    if (action === 'checkPassword') {
      let body;
      try {
        body = await req.json();
      } catch (e) {
        return sendJSON({ error: '잘못된 요청 형식입니다.' }, 400);
      }

      // 1. 기본 비밀번호 즉시 확인 (가장 빠름)
      if (body.password === DEFAULT_ADMIN_PWD) {
        return sendJSON({ success: true });
      }

      // 2. DB에 저장된 비밀번호 확인 (DB 연결된 경우만)
      try {
        if (kv) {
          const dbPwd = await kv.get<string>(ADMIN_PWD_KEY);
          if (dbPwd && body.password === dbPwd) {
            return sendJSON({ success: true });
          }
        }
      } catch (kvErr) {
        console.error('KV Auth Error:', kvErr);
        // DB 에러가 나도 기본 비번이 아니면 실패로 처리
      }

      return sendJSON({ success: false, message: '비밀번호가 일치하지 않습니다.' });
    }

    // [두번째] 게시글 목록 가져오기 - DB 없으면 샘플 데이터 반환
    if (action === 'getPosts') {
      try {
        if (kv) {
          const posts = await kv.get(STORAGE_KEY);
          if (posts) return sendJSON(posts);
        }
      } catch (e) {}
      // DB 실패 시 빈 배열이라도 반환하여 화면 멈춤 방지
      return sendJSON([]);
    }

    // [세번째] DB 연결이 필수인 기능들 체크
    if (!kv) {
      return sendJSON({ error: '데이터베이스 연결 설정이 되어있지 않습니다.' }, 500);
    }

    // ... 나머지 상세 기능 로직 ...
    return sendJSON({ error: '요청한 액션을 처리할 수 없습니다.' }, 404);

  } catch (globalError: any) {
    console.error('Global API Error:', globalError);
    return sendJSON({ 
      error: '서버 내부 오류가 발생했습니다.', 
      details: globalError.message 
    }, 500);
  }
}
