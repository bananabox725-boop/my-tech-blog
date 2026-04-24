import { posts as initialPosts } from '../data/posts';
import type { Post, Comment } from '../data/posts';

const STORAGE_KEY = 'blog_posts';
const COMMENTS_KEY = 'blog_comments';
const ADMIN_KEY = 'blog_is_admin';

// 게시글 관련
export const getPosts = (): Post[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialPosts));
    return initialPosts;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error('Failed to parse posts from localStorage', e);
    return initialPosts;
  }
};

export const savePost = (post: Post) => {
  const posts = getPosts();
  const updatedPosts = [post, ...posts];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPosts));
};

export const deletePost = (id: number) => {
  const posts = getPosts();
  const updatedPosts = posts.filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPosts));
};

export const updatePost = (post: Post) => {
  const posts = getPosts();
  const index = posts.findIndex(p => p.id === post.id);
  if (index !== -1) {
    posts[index] = post;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  }
};

// 댓글 관련
export const getComments = (postId: number): Comment[] => {
  const stored = localStorage.getItem(COMMENTS_KEY);
  if (!stored) return [];
  try {
    const allComments: Comment[] = JSON.parse(stored);
    return allComments.filter(c => c.postId === postId);
  } catch (e) {
    console.error('Failed to parse comments', e);
    return [];
  }
};

export const saveComment = (comment: Comment) => {
  const stored = localStorage.getItem(COMMENTS_KEY);
  let allComments: Comment[] = [];
  if (stored) {
    try {
      allComments = JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse comments', e);
    }
  }
  allComments.push(comment);
  localStorage.setItem(COMMENTS_KEY, JSON.stringify(allComments));
};

export const deleteComment = (commentId: number) => {
  const stored = localStorage.getItem(COMMENTS_KEY);
  if (!stored) return;
  try {
    const allComments: Comment[] = JSON.parse(stored);
    const filtered = allComments.filter(c => c.id !== commentId);
    localStorage.setItem(COMMENTS_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error('Failed to delete comment', e);
  }
};

// 관리자 인증 관련
export const isAdmin = (): boolean => {
  return localStorage.getItem(ADMIN_KEY) === 'true';
};

export const loginAdmin = (password: string): boolean => {
  // 실제 서비스라면 보안상 위험하지만, 로컬 전용 앱이므로 하드코딩된 암호를 사용합니다.
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
  if (!localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialPosts));
  }
};
