import { kv } from '@vercel/kv';

const DEFAULT_ADMIN_PWD = 'admin123';
const STORAGE_KEY = 'blog_posts';
const COMMENTS_KEY = 'blog_comments';
const ADMIN_PWD_KEY = 'admin_password';

const initialPosts = [
  { 
    id: 1, 
    title: 'React 입문', 
    excerpt: '리액트를 처음 시작하는 초보자를 위한 가이드입니다.',
    content: '리액트는 사용자 인터페이스를 만들기 위한 자바스크립트 라이브러리입니다. 이 글에서는 리액트의 기본 개념인 컴포넌트, Props, State에 대해 알아봅니다.',
    date: '2026-04-22',
    category: 'React',
    likes: 0,
    views: 0
  },
  { 
    id: 2, 
    title: 'Vite로 프로젝트 설정', 
    excerpt: 'Vite를 사용하여 빠르고 현대적인 개발 환경을 구축하는 방법을 알아봅니다.',
    content: 'Vite는 최신 브라우저의 네이티브 ES 모듈 기능을 사용하는 빠른 빌드 도구입니다. 기존 Webpack보다 훨씬 빠른 개발 서버 시작과 HMR(Hot Module Replacement)을 제공합니다.',
    date: '2026-04-22',
    category: 'Tool',
    likes: 0,
    views: 0
  },
  { 
    id: 3, 
    title: 'TypeScript 공부법', 
    excerpt: '타입스크립트를 효과적으로 학습하는 단계별 로드맵을 제안합니다.',
    content: '타입스크립트는 자바스크립트에 정적 타입을 추가한 언어입니다. 코드의 안정성을 높이고 개발자의 실수를 줄여주는 강력한 도구입니다.',
    date: '2026-04-22',
    category: 'TypeScript',
    likes: 0,
    views: 0
  },
];

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

    if (!kv) {
      return res.status(500).json({ error: 'Database connection failed' });
    }

    // 관리자 비밀번호 가져오기
    let adminPassword = await kv.get(ADMIN_PWD_KEY);
    if (!adminPassword) {
      await kv.set(ADMIN_PWD_KEY, DEFAULT_ADMIN_PWD);
      adminPassword = DEFAULT_ADMIN_PWD;
    }

    // 권한 확인 (헤더의 Authorization 값과 비교)
    const authHeader = req.headers['authorization'];
    const isAdmin = authHeader === adminPassword;

    switch (action) {
      case 'checkPassword': {
        const { password } = req.body;
        const isMatch = password === DEFAULT_ADMIN_PWD || password === adminPassword;
        return res.status(200).json({ success: isMatch });
      }

      case 'updateAdminPassword': {
        if (!isAdmin) return res.status(401).json({ error: 'Unauthorized' });
        const { newPassword } = req.body;
        await kv.set(ADMIN_PWD_KEY, newPassword);
        return res.status(200).json({ success: true });
      }

      case 'getPosts': {
        let posts = await kv.get(STORAGE_KEY);
        if (!posts) {
          await kv.set(STORAGE_KEY, initialPosts);
          posts = initialPosts;
        }
        return res.status(200).json(posts);
      }

      case 'savePost': {
        if (!isAdmin) return res.status(401).json({ error: 'Unauthorized' });
        const post = req.body;
        const posts = (await kv.get(STORAGE_KEY)) || [];
        await kv.set(STORAGE_KEY, [post, ...posts]);
        return res.status(200).json({ success: true });
      }

      case 'updatePost': {
        if (!isAdmin) return res.status(401).json({ error: 'Unauthorized' });
        const post = req.body;
        const posts = (await kv.get(STORAGE_KEY)) || [];
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
        const posts = (await kv.get(STORAGE_KEY)) || [];
        await kv.set(STORAGE_KEY, posts.filter((p) => p.id !== id));
        return res.status(200).json({ success: true });
      }

      case 'incrementViews': {
        const id = Number(req.query.id);
        const posts = (await kv.get(STORAGE_KEY)) || [];
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
        const posts = (await kv.get(STORAGE_KEY)) || [];
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
        const allComments = (await kv.get(COMMENTS_KEY)) || [];
        return res.status(200).json(allComments.filter((c) => c.postId === postId));
      }

      case 'saveComment': {
        const comment = req.body;
        const allComments = (await kv.get(COMMENTS_KEY)) || [];
        allComments.push(comment);
        await kv.set(COMMENTS_KEY, allComments);
        return res.status(200).json({ success: true });
      }

      case 'deleteComment': {
        if (!isAdmin) return res.status(401).json({ error: 'Unauthorized' });
        const id = Number(req.query.id);
        const allComments = (await kv.get(COMMENTS_KEY)) || [];
        await kv.set(COMMENTS_KEY, allComments.filter((c) => c.id !== id));
        return res.status(200).json({ success: true });
      }

      default:
        return res.status(404).json({ error: 'Not Found' });
    }
  } catch (err) {
    console.error('API Error:', err);
    return res.status(500).json({ error: 'Server Error', message: err.message });
  }
}
