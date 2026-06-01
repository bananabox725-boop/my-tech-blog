import Redis from 'ioredis';
import { randomBytes } from 'crypto';

const redis = new Redis(process.env.REDIS_URL as string);

// @vercel/kv 호환 래퍼
const kv = {
  async get<T>(key: string): Promise<T | null> {
    const val = await redis.get(key);
    return val ? (JSON.parse(val) as T) : null;
  },
  async set(key: string, value: unknown, opts?: { ex?: number }): Promise<void> {
    if (opts?.ex) {
      await redis.set(key, JSON.stringify(value), 'EX', opts.ex);
    } else {
      await redis.set(key, JSON.stringify(value));
    }
  },
  async del(key: string): Promise<void> {
    await redis.del(key);
  },
};

const DEFAULT_ADMIN_PWD = process.env.ADMIN_DEFAULT_PASSWORD || 'admin123';
const STORAGE_KEY = 'blog_posts';
const COMMENTS_KEY = 'blog_comments';
const ADMIN_PWD_KEY = 'admin_password';
const CATEGORIES_KEY = 'blog_categories';
const DEFAULT_CATEGORIES = ['일상', '정보', '교육'];
const SESSION_TTL = 86400; // 24시간

interface Post {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  category: string;
  imageUrl?: string;
  attachments?: { name: string; data: string; type: string }[];
  likes: number;
  views: number;
}

interface Comment {
  id: number;
  postId: number;
  author: string;
  password: string;
  content: string;
  date: string;
}

const initialPosts: Post[] = [
  {
    id: 1,
    title: 'React 입문',
    excerpt: '리액트를 처음 시작하는 초보자를 위한 가이드입니다.',
    content: '리액트는 사용자 인터페이스를 만들기 위한 자바스크립트 라이브러리입니다. 이 글에서는 리액트의 기본 개념인 컴포넌트, Props, State에 대해 알아봅니다.',
    date: '2026-04-22',
    category: '교육',
    likes: 0,
    views: 0,
  },
  {
    id: 2,
    title: 'Vite로 프로젝트 설정',
    excerpt: 'Vite를 사용하여 빠르고 현대적인 개발 환경을 구축하는 방법을 알아봅니다.',
    content: 'Vite는 최신 브라우저의 네이티브 ES 모듈 기능을 사용하는 빠른 빌드 도구입니다. 기존 Webpack보다 훨씬 빠른 개발 서버 시작과 HMR(Hot Module Replacement)을 제공합니다.',
    date: '2026-04-22',
    category: '정보',
    likes: 0,
    views: 0,
  },
  {
    id: 3,
    title: 'TypeScript 공부법',
    excerpt: '타입스크립트를 효과적으로 학습하는 단계별 로드맵을 제안합니다.',
    content: '타입스크립트는 자바스크립트에 정적 타입을 추가한 언어입니다. 코드의 안정성을 높이고 개발자의 실수를 줄여주는 강력한 도구입니다.',
    date: '2026-04-22',
    category: '교육',
    likes: 0,
    views: 0,
  },
];

function generateToken(): string {
  return randomBytes(32).toString('hex');
}

function sessionKey(token: string): string {
  return `session:${token}`;
}

export default async function handler(req: any, res: any) {
  const allowedOrigin = process.env.ALLOWED_ORIGIN || '*';
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { action } = req.query;

    // 로그인 — 성공 시 세션 토큰 발급
    if (action === 'checkPassword') {
      const { password } = req.body || {};
      if (!password) {
        return res.status(400).json({ error: '비밀번호가 누락되었습니다.' });
      }

      let adminPassword = DEFAULT_ADMIN_PWD;
      try {
        const dbPwd = await kv.get<string>(ADMIN_PWD_KEY);
        if (dbPwd) adminPassword = dbPwd;
      } catch (kvErr) {
        console.error('KV Auth Error:', kvErr);
      }

      if (password !== adminPassword) {
        return res.status(200).json({ success: false, message: 'Invalid password' });
      }

      const token = generateToken();
      await kv.set(sessionKey(token), 'admin', { ex: SESSION_TTL });
      return res.status(200).json({ success: true, token });
    }

    // 로그아웃 — 세션 토큰 삭제
    if (action === 'logout') {
      const authHeader = req.headers['authorization'] as string | undefined;
      if (authHeader) {
        try {
          await kv.del(sessionKey(authHeader));
        } catch (_) {}
      }
      return res.status(200).json({ success: true });
    }

    // 세션 토큰으로 관리자 권한 확인
    const authHeader = req.headers['authorization'] as string | undefined;
    let isAdmin = false;
    if (authHeader) {
      try {
        const sessionValue = await kv.get<string>(sessionKey(authHeader));
        isAdmin = sessionValue === 'admin';
      } catch (e) {
        console.error('KV Session Fetch Error:', e);
      }
    }

    switch (action) {
      case 'updateAdminPassword': {
        if (!isAdmin) {
          return res.status(401).json({
            error: 'Unauthorized',
            details: '관리자 권한이 없습니다. 다시 로그인해 주세요.',
          });
        }
        const { newPassword } = req.body || {};
        if (!newPassword) {
          return res.status(400).json({ error: '새 비밀번호가 누락되었습니다.' });
        }
        try {
          await kv.set(ADMIN_PWD_KEY, newPassword);
          // 비밀번호 변경 후 현재 세션은 유효하게 유지
          return res.status(200).json({ success: true });
        } catch (dbErr) {
          return res.status(500).json({ error: 'DB 저장 실패', details: (dbErr as Error).message });
        }
      }

      case 'getCategories': {
        let cats = await kv.get<string[]>(CATEGORIES_KEY);
        if (!cats) {
          await kv.set(CATEGORIES_KEY, DEFAULT_CATEGORIES);
          cats = DEFAULT_CATEGORIES;
        }
        return res.status(200).json(cats);
      }

      case 'saveCategories': {
        if (!isAdmin) return res.status(401).json({ error: 'Unauthorized' });
        const { categories } = req.body as { categories: string[] };
        if (!Array.isArray(categories)) return res.status(400).json({ error: '잘못된 형식입니다.' });
        await kv.set(CATEGORIES_KEY, categories);
        return res.status(200).json({ success: true });
      }

      case 'getPosts': {
        let posts = await kv.get<Post[]>(STORAGE_KEY);
        if (!posts) {
          await kv.set(STORAGE_KEY, initialPosts);
          posts = initialPosts;
        }
        return res.status(200).json(posts);
      }

      case 'savePost': {
        if (!isAdmin) return res.status(401).json({ error: 'Unauthorized' });
        const post = req.body as Post;
        const posts = (await kv.get<Post[]>(STORAGE_KEY)) ?? [];
        await kv.set(STORAGE_KEY, [post, ...posts]);
        return res.status(200).json({ success: true });
      }

      case 'updatePost': {
        if (!isAdmin) return res.status(401).json({ error: 'Unauthorized' });
        const post = req.body as Post;
        const posts = (await kv.get<Post[]>(STORAGE_KEY)) ?? [];
        const index = posts.findIndex((p) => p.id === post.id);
        if (index !== -1) {
          posts[index] = post;
          await kv.set(STORAGE_KEY, posts);
        }
        return res.status(200).json({ success: true });
      }

      case 'deletePost': {
        if (!isAdmin) return res.status(401).json({ error: 'Unauthorized' });
        const id = Number(req.query.id);
        const posts = (await kv.get<Post[]>(STORAGE_KEY)) ?? [];
        await kv.set(STORAGE_KEY, posts.filter((p) => p.id !== id));
        return res.status(200).json({ success: true });
      }

      case 'incrementViews': {
        const id = Number(req.query.id);
        const posts = (await kv.get<Post[]>(STORAGE_KEY)) ?? [];
        const index = posts.findIndex((p) => p.id === id);
        if (index !== -1) {
          posts[index].views += 1;
          await kv.set(STORAGE_KEY, posts);
        }
        return res.status(200).json({ success: true });
      }

      case 'toggleLike': {
        const id = Number(req.query.id);
        const increment = req.query.increment === 'true';
        const posts = (await kv.get<Post[]>(STORAGE_KEY)) ?? [];
        const index = posts.findIndex((p) => p.id === id);
        if (index !== -1) {
          posts[index].likes += increment ? 1 : -1;
          posts[index].likes = Math.max(0, posts[index].likes);
          await kv.set(STORAGE_KEY, posts);
          return res.status(200).json({ likes: posts[index].likes });
        }
        return res.status(200).json({ likes: 0 });
      }

      case 'getComments': {
        const postId = Number(req.query.postId);
        const allComments = (await kv.get<Comment[]>(COMMENTS_KEY)) ?? [];
        return res.status(200).json(allComments.filter((c) => c.postId === postId));
      }

      case 'saveComment': {
        const comment = req.body as Comment;
        const allComments = (await kv.get<Comment[]>(COMMENTS_KEY)) ?? [];
        allComments.push(comment);
        await kv.set(COMMENTS_KEY, allComments);
        return res.status(200).json({ success: true });
      }

      case 'deleteComment': {
        if (!isAdmin) return res.status(401).json({ error: 'Unauthorized' });
        const id = Number(req.query.id);
        const allComments = (await kv.get<Comment[]>(COMMENTS_KEY)) ?? [];
        await kv.set(COMMENTS_KEY, allComments.filter((c) => c.id !== id));
        return res.status(200).json({ success: true });
      }

      default:
        return res.status(404).json({ error: 'Not Found' });
    }
  } catch (err) {
    console.error('API Error:', err);
    return res.status(500).json({ error: 'Server Error', message: (err as Error).message });
  }
}
