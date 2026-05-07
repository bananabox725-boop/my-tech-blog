import { kv } from '@vercel/kv';

const STORAGE_KEY = 'blog_posts';
const COMMENTS_KEY = 'blog_comments';
const ADMIN_PWD_KEY = 'admin_password';
const DEFAULT_ADMIN_PWD = 'admin123';

const initialPosts = [
  { id: 1, title: 'React 입문', excerpt: '리액트를 처음 시작하는 초보자를 위한 가이드입니다.', content: '내용 생략...', date: '2026-04-22', category: 'React', likes: 0, views: 0 },
];

export default async function handler(req: Request) {
  const jsonResponse = (data: any, status = 200) => {
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

  if (req.method === 'OPTIONS') return jsonResponse({}, 204);

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    // [중요] 비밀번호 체크는 DB 연결 확인보다 먼저 실행하여 DB 지연 영향을 최소화
    if (action === 'checkPassword') {
      const body = await req.json();
      
      // 1. 우선 기본 비밀번호와 직접 비교 (DB 안 거침)
      if (body.password === DEFAULT_ADMIN_PWD) {
        return jsonResponse({ success: true });
      }

      // 2. 기본값이 아니면 DB 조회 (여기서 실패해도 위에서 기본값은 통과됨)
      if (kv) {
        const dbPwd = await kv.get<string>(ADMIN_PWD_KEY);
        if (dbPwd && body.password === dbPwd) {
          return jsonResponse({ success: true });
        }
      }
      
      return jsonResponse({ success: false, message: 'Invalid password' });
    }

    // 나머지 액션들은 DB 연결 필수
    if (!kv) {
      return jsonResponse({ error: '데이터베이스(KV) 연결에 실패했습니다. Vercel 설정을 확인하세요.' }, 500);
    }

    const adminPassword = (await kv.get<string>(ADMIN_PWD_KEY)) || DEFAULT_ADMIN_PWD;
    const authHeader = req.headers.get('Authorization');
    const isAdmin = authHeader === adminPassword;

    switch (action) {
      case 'getPosts': {
        let posts = await kv.get(STORAGE_KEY);
        if (!posts) {
          await kv.set(STORAGE_KEY, initialPosts);
          posts = initialPosts;
        }
        return jsonResponse(posts);
      }
      // ... 기타 기능들 생략 (필요시 추가 복구)
      default:
        return jsonResponse({ error: 'Invalid action' }, 400);
    }
  } catch (error: any) {
    return jsonResponse({ error: 'Server Error', message: error.message }, 500);
  }
}
