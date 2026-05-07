import type { Post, Comment } from '../data/posts';

const ADMIN_KEY = 'blog_is_admin';

// 관리자 인증 관련
export const isAdmin = (): boolean => localStorage.getItem(ADMIN_KEY) !== null;
export const getAdminToken = () => localStorage.getItem(ADMIN_KEY) || '';
export const logoutAdmin = () => localStorage.removeItem(ADMIN_KEY);

export const loginAdmin = async (password: string): Promise<boolean> => {
  try {
    const res = await fetch('/api/blog?action=checkPassword', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    const data = await res.json();
    if (data.success) {
      localStorage.setItem(ADMIN_KEY, password);
      return true;
    }
    return false;
  } catch (e) {
    console.error('Login error:', e);
    return false;
  }
};

export const updateAdminPassword = async (newPassword: string): Promise<boolean> => {
  const res = await fetch('/api/blog?action=updateAdminPassword', {
    method: 'POST',
    headers: {
      'Authorization': getAdminToken(),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ newPassword })
  });
  const data = await res.json();
  if (data.success) {
    localStorage.setItem(ADMIN_KEY, newPassword);
    return true;
  }
  return false;
};

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
      'Authorization': getAdminToken()
    },
    body: JSON.stringify(post),
  });
};

export const updatePost = async (post: Post) => {
  await fetch('/api/blog?action=updatePost', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': getAdminToken()
    },
    body: JSON.stringify(post),
  });
};

export const deletePost = async (id: number) => {
  await fetch(`/api/blog?action=deletePost&id=${id}`, {
    headers: { 'Authorization': getAdminToken() }
  });
};

export const incrementViews = async (id: number) => {
  await fetch(`/api/blog?action=incrementViews&id=${id}`);
};

export const toggleLike = async (id: number): Promise<number> => {
  const isLiked = isPostLiked(id);
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
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(comment),
  });
};

export const deleteComment = async (commentId: number) => {
  await fetch(`/api/blog?action=deleteComment&id=${commentId}`, {
    headers: { 'Authorization': getAdminToken() }
  });
};
