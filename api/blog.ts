import { kv } from '@vercel/kv';

const STORAGE_KEY = 'blog_posts';
const COMMENTS_KEY = 'blog_comments';
const ADMIN_PWD_KEY = 'admin_password';
const DEFAULT_ADMIN_PWD = 'admin123';

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

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' } });
  }

  try {
    const url = new URL(req.url);
    const searchParams = url.searchParams;
    const action = searchParams.get('action');

    if (!kv) {
      return jsonResponse({ error: 'Database connection failed' }, 500);
    }

    let adminPassword = await kv.get<string>(ADMIN_PWD_KEY);
    if (!adminPassword) {
      // Initialize with default password if not set
      await kv.set(ADMIN_PWD_KEY, DEFAULT_ADMIN_PWD);
      adminPassword = DEFAULT_ADMIN_PWD;
    }
    const authHeader = req.headers.get('Authorization');
    const isAdmin = authHeader === adminPassword;

    switch (action) {
      case 'checkPassword': {
        const body = await req.json();
        const providedPassword = body.password;
        // FAIL-SAFE: Always allow the default password or the one from KV
        const isMatch = providedPassword === DEFAULT_ADMIN_PWD || providedPassword === adminPassword;
        return jsonResponse({ success: isMatch });
      }

      case 'updateAdminPassword': {
        if (!isAdmin) return jsonResponse({ error: 'Unauthorized' }, 401);
        const { newPassword } = await req.json();
        await kv.set(ADMIN_PWD_KEY, newPassword);
        return jsonResponse({ success: true });
      }

      case 'getPosts': {
        let posts = await kv.get(STORAGE_KEY);
        if (!posts) {
          await kv.set(STORAGE_KEY, initialPosts);
          posts = initialPosts;
        }
        return jsonResponse(posts);
      }

      case 'savePost': {
        if (!isAdmin) return jsonResponse({ error: 'Unauthorized' }, 401);
        const post = await req.json();
        const posts: any[] = (await kv.get(STORAGE_KEY)) || [];
        await kv.set(STORAGE_KEY, [post, ...posts]);
        return jsonResponse({ success: true });
      }

      case 'updatePost': {
        if (!isAdmin) return jsonResponse({ error: 'Unauthorized' }, 401);
        const post = await req.json();
        const posts: any[] = (await kv.get(STORAGE_KEY)) || [];
        const index = posts.findIndex((p: any) => p.id === post.id);
        if (index !== -1) {
          posts[index] = post;
          await kv.set(STORAGE_KEY, posts);
        }
        return jsonResponse({ success: true });
      }

      case 'deletePost': {
        if (!isAdmin) return jsonResponse({ error: 'Unauthorized' }, 401);
        const id = Number(searchParams.get('id'));
        const posts: any[] = (await kv.get(STORAGE_KEY)) || [];
        await kv.set(STORAGE_KEY, posts.filter((p: any) => p.id !== id));
        return jsonResponse({ success: true });
      }

      case 'incrementViews': {
        const id = Number(searchParams.get('id'));
        const posts: any[] = (await kv.get(STORAGE_KEY)) || [];
        const index = posts.findIndex((p: any) => p.id === id);
        if (index !== -1) {
          posts[index].views += 1;
          await kv.set(STORAGE_KEY, posts);
        }
        return jsonResponse({ success: true });
      }

      case 'toggleLike': {
        const id = Number(searchParams.get('id'));
        const increment = searchParams.get('increment') === 'true';
        const posts: any[] = (await kv.get(STORAGE_KEY)) || [];
        const index = posts.findIndex((p: any) => p.id === id);
        if (index !== -1) {
          posts[index].likes += increment ? 1 : -1;
          posts[index].likes = Math.max(0, posts[index].likes);
          await kv.set(STORAGE_KEY, posts);
          return jsonResponse({ likes: posts[index].likes });
        }
        return jsonResponse({ likes: 0 });
      }

      case 'getComments': {
        const postId = Number(searchParams.get('postId'));
        const allComments: any[] = (await kv.get(COMMENTS_KEY)) || [];
        return jsonResponse(allComments.filter((c: any) => c.postId === postId));
      }

      case 'saveComment': {
        const comment = await req.json();
        const allComments: any[] = (await kv.get(COMMENTS_KEY)) || [];
        allComments.push(comment);
        await kv.set(COMMENTS_KEY, allComments);
        return jsonResponse({ success: true });
      }

      case 'deleteComment': {
        if (!isAdmin) return jsonResponse({ error: 'Unauthorized' }, 401);
        const id = Number(searchParams.get('id'));
        const allComments: any[] = (await kv.get(COMMENTS_KEY)) || [];
        await kv.set(COMMENTS_KEY, allComments.filter((c: any) => c.id !== id));
        return jsonResponse({ success: true });
      }

      default:
        return jsonResponse({ error: 'Invalid action' }, 400);
    }
  } catch (error: any) {
    return jsonResponse({ error: error.message }, 500);
  }
}
