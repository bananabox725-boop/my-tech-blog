import type { Post, Comment } from '../data/posts';

const ADMIN_KEY = 'blog_is_admin';

export const getPosts = async (): Promise<Post[]> => {
  try {
    const res = await fetch('/api/blog?action=getPosts');
    return await res.json();
  } catch (e) {
    console.error('Failed to fetch posts', e);
    return [];
  }
};

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

export const isAdmin = (): boolean => localStorage.getItem(ADMIN_KEY) !== null;
export const logoutAdmin = () => localStorage.removeItem(ADMIN_KEY);
export const getAdminToken = () => localStorage.getItem(ADMIN_KEY) || '';
