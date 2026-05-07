import { kv } from '@vercel/kv';

const DEFAULT_ADMIN_PWD = 'admin123';
const STORAGE_KEY = 'blog_posts';
const ADMIN_PWD_KEY = 'admin_password';

export default async function handler(req, res) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { action } = req.query;

    // 1. 관리자 비밀번호 체크 (최우선 실행)
    if (action === 'checkPassword') {
      const { password } = req.body;
      
      // 기본 비번 즉시 확인
      if (password === DEFAULT_ADMIN_PWD) {
        return res.status(200).json({ success: true });
      }

      // DB 확인
      try {
        if (kv) {
          const dbPwd = await kv.get(ADMIN_PWD_KEY);
          if (dbPwd && password === dbPwd) {
            return res.status(200).json({ success: true });
          }
        }
      } catch (e) {
        console.error('KV Auth Error:', e);
      }

      return res.status(200).json({ success: false, message: 'Invalid password' });
    }

    // 2. 게시글 목록 가져오기
    if (action === 'getPosts') {
      try {
        if (kv) {
          const posts = await kv.get(STORAGE_KEY);
          if (posts) return res.status(200).json(posts);
        }
      } catch (e) {}
      return res.status(200).json([]);
    }

    // 3. DB가 필요한 기타 기능들
    if (!kv) {
      return res.status(500).json({ error: 'Database connection missing' });
    }

    // ... 여기에 다른 액션들(savePost 등) 추가 가능 ...
    
    return res.status(404).json({ error: 'Not Found' });

  } catch (err) {
    console.error('API Error:', err);
    return res.status(500).json({ 
      error: 'Internal Server Error', 
      message: err.message 
    });
  }
}
