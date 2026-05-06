import { kv } from '@vercel/kv';

// Note: In a real app, you'd want to secure the write/delete operations with a token or session.
// For this migration, we'll implement the logic to match the existing storage.ts.

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
  // Ultra-fast response helper
  const jsonResponse = (data: any, status = 200) => {
    return new Response(JSON.stringify(data), {
      status,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, max-age=0',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      }
    });
  };

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' } });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    // 1. Login is now COMPLETELY independent of KV to prevent any timeouts
    if (action === 'checkPassword') {
      const body = await req.json();
      const providedPassword = body.password;
      
      // Fallback priority: KV_ADMIN_PASSWORD env var > DEFAULT_ADMIN_PWD
      const envPassword = process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PWD;
      
      const isMatch = providedPassword === envPassword;
      return jsonResponse({ 
        success: isMatch, 
        message: isMatch ? 'Match' : 'Wrong password'
      });
    }

    // For other actions, keep KV but with strict error handling
    if (!kv) {
      if (action === 'getPosts') return jsonResponse(initialPosts); // Fallback for posts
      return jsonResponse({ error: 'Database not connected' }, 500);
    }

    const searchParams = url.searchParams;
    switch (action) {
      case 'updateAdminPassword': {
        const { newPassword } = await req.json();
        if (!newPassword || newPassword.length < 4) {
          return jsonResponse({ error: 'Password too short' }, 400);
        }
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
        const post = await req.json();
        const posts: any[] = (await kv.get(STORAGE_KEY)) || [];
        const updatedPosts = [post, ...posts];
        await kv.set(STORAGE_KEY, updatedPosts);
        return jsonResponse({ success: true });
      }

      case 'updatePost': {
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
        const id = Number(searchParams.get('id'));
        const posts: any[] = (await kv.get(STORAGE_KEY)) || [];
        const updatedPosts = posts.filter((p: any) => p.id !== id);
        await kv.set(STORAGE_KEY, updatedPosts);
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
        let currentLikes = 0;
        if (index !== -1) {
          if (increment) {
            posts[index].likes += 1;
          } else {
            posts[index].likes = Math.max(0, posts[index].likes - 1);
          }
          await kv.set(STORAGE_KEY, posts);
          currentLikes = posts[index].likes;
        }
        return jsonResponse({ likes: currentLikes });
      }

      case 'getComments': {
        const postId = Number(searchParams.get('postId'));
        const allComments: any[] = (await kv.get(COMMENTS_KEY)) || [];
        const filtered = allComments.filter((c: any) => c.postId === postId);
        return jsonResponse(filtered);
      }

      case 'saveComment': {
        const comment = await req.json();
        const allComments: any[] = (await kv.get(COMMENTS_KEY)) || [];
        allComments.push(comment);
        await kv.set(COMMENTS_KEY, allComments);
        return jsonResponse({ success: true });
      }

      case 'deleteComment': {
        const id = Number(searchParams.get('id'));
        const allComments: any[] = (await kv.get(COMMENTS_KEY)) || [];
        const filtered = allComments.filter((c: any) => c.id !== id);
        await kv.set(COMMENTS_KEY, filtered);
        return jsonResponse({ success: true });
      }

      default:
        return jsonResponse({ error: 'Invalid action' }, 400);
    }
  } catch (globalError: any) {
    return jsonResponse({ 
      error: 'Global Server Error', 
      message: globalError.message,
      stack: globalError.stack
    }, 500);
  }
}

