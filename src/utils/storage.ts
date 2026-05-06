import type { Post, Comment } from '../data/posts';

const ADMIN_KEY = 'blog_is_admin';

// 게시글 관련
export const getPosts = async (): Promise<Post[]> => {
  try {
    const res = await fetch('/api/blog?action=getPosts');
    return await res.json();
  } catch (e) {
    console.error('Failed to fetch posts', e);
    return [];
  }
};

export const savePost = async (post: Post) => {
  await fetch('/api/blog?action=savePost', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'admin123'
    },
    body: JSON.stringify(post),
  });
};

export const deletePost = async (id: number) => {
  await fetch(`/api/blog?action=deletePost&id=${id}`, {
    headers: {
      'Authorization': 'admin123'
    }
  });
};

export const updatePost = async (post: Post) => {
  await fetch('/api/blog?action=updatePost', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'admin123'
    },
    body: JSON.stringify(post),
  });
};

export const incrementViews = async (id: number) => {
  await fetch(`/api/blog?action=incrementViews&id=${id}`);
};

export const toggleLike = async (id: number): Promise<number> => {
  const isLiked = localStorage.getItem(`liked_${id}`) === 'true';
  const increment = !isLiked;
  
  const res = await fetch(`/api/blog?action=toggleLike&id=${id}&increment=${increment}`);
  const data = await res.json();
  
  if (increment) {
    localStorage.setItem(`liked_${id}`, 'true');
  } else {
    localStorage.removeItem(`liked_${id}`);
  }
  
  return data.likes;
};

export const isPostLiked = (id: number): boolean => {
  return localStorage.getItem(`liked_${id}`) === 'true';
};

// 댓글 관련
export const getComments = async (postId: number): Promise<Comment[]> => {
  try {
    const res = await fetch(`/api/blog?action=getComments&postId=${postId}`);
    return await res.json();
  } catch (e) {
    console.error('Failed to fetch comments', e);
    return [];
  }
};

export const saveComment = async (comment: Comment) => {
  await fetch('/api/blog?action=saveComment', {
    method: 'POST',
    body: JSON.stringify(comment),
  });
};

export const deleteComment = async (commentId: number) => {
  await fetch(`/api/blog?action=deleteComment&id=${commentId}`, {
    headers: {
      'Authorization': 'admin123'
    }
  });
};

// 관리자 인증 관련 (로컬 유지)
export const isAdmin = (): boolean => {
  return localStorage.getItem(ADMIN_KEY) === 'true';
};

export const loginAdmin = (password: string): boolean => {
  if (password === 'admin123') {
    localStorage.setItem(ADMIN_KEY, 'true');
    return true;
  }
  return false;
};

export const logoutAdmin = () => {
  localStorage.removeItem(ADMIN_KEY);
};

export const initStorage = () => {
  // KV handles initialization via getPosts
};
