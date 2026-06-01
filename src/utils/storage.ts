import type { Post, Comment } from '../data/posts';

const ADMIN_TOKEN_KEY = 'blog_admin_token';

export const isAdmin = (): boolean => localStorage.getItem(ADMIN_TOKEN_KEY) !== null;
export const getAdminToken = () => localStorage.getItem(ADMIN_TOKEN_KEY) || '';

export const logoutAdmin = async () => {
  const token = getAdminToken();
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  if (token) {
    try {
      await fetch('/api/blog?action=logout', {
        method: 'POST',
        headers: { 'Authorization': token },
      });
    } catch (_) {}
  }
};

export const loginAdmin = async (password: string): Promise<boolean> => {
  try {
    const res = await fetch(`/api/blog?action=checkPassword&t=${Date.now()}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || data.message || `서버 응답 오류 (${res.status})`);
    }

    if (data.success && data.token) {
      localStorage.setItem(ADMIN_TOKEN_KEY, data.token);
      return true;
    }

    return false;
  } catch (e: any) {
    console.error('Detailed login error:', e);
    alert(`로그인 중 오류 발생: ${e.message}`);
    throw e;
  }
};

export const getPosts = async (): Promise<Post[]> => {
  try {
    const res = await fetch('/api/blog?action=getPosts');
    if (!res.ok) return [];
    return await res.json();
  } catch (e) {
    return [];
  }
};

export const savePost = async (post: Post) => {
  const res = await fetch('/api/blog?action=savePost', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': getAdminToken() },
    body: JSON.stringify(post),
  });
  if (!res.ok) {
    const data = await res.json();
    alert(`저장 실패: ${data.error || '알 수 없는 오류'}`);
  }
};

export const updatePost = async (post: Post) => {
  await fetch('/api/blog?action=updatePost', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': getAdminToken() },
    body: JSON.stringify(post),
  });
};

export const deletePost = async (id: number) => {
  await fetch(`/api/blog?action=deletePost&id=${id}`, {
    headers: { 'Authorization': getAdminToken() }
  });
};

export const updateAdminPassword = async (newPassword: string): Promise<boolean> => {
  try {
    const res = await fetch('/api/blog?action=updateAdminPassword', {
      method: 'POST',
      headers: {
        'Authorization': getAdminToken(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ newPassword })
    });

    const data = await res.json();
    if (res.ok && data.success) {
      // 비밀번호 변경 후 세션 토큰은 그대로 유지 (서버에서 계속 유효)
      return true;
    } else {
      alert(`비밀번호 변경 실패: ${data.error || '알 수 없는 오류'} (${data.details || ''})`);
      return false;
    }
  } catch (e: any) {
    alert(`네트워크 오류 발생: ${e.message}`);
    return false;
  }
};

export const incrementViews = async (id: number) => {
  await fetch(`/api/blog?action=incrementViews&id=${id}`);
};

export const toggleLike = async (id: number): Promise<number> => {
  const res = await fetch(`/api/blog?action=toggleLike&id=${id}&increment=${!isPostLiked(id)}`);
  const data = await res.json();
  if (res.ok) {
    if (!isPostLiked(id)) localStorage.setItem(`liked_${id}`, 'true');
    else localStorage.removeItem(`liked_${id}`);
  }
  return data.likes || 0;
};

export const isPostLiked = (id: number): boolean => localStorage.getItem(`liked_${id}`) === 'true';

export const getComments = async (postId: number): Promise<Comment[]> => {
  const res = await fetch(`/api/blog?action=getComments&postId=${postId}`);
  return res.ok ? await res.json() : [];
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
