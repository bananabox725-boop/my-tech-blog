import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { isAdmin, loginAdmin, logoutAdmin, getPosts, deletePost, updateAdminPassword, getCategories, saveCategories } from '../utils/storage';
import type { Post } from '../data/posts';
import '../styles/blog.css';

const Admin: React.FC = () => {
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [categoryMsg, setCategoryMsg] = useState('');
  const navigate = useNavigate();
  const loggedIn = isAdmin();

  useEffect(() => {
    const fetchData = async () => {
      if (loggedIn) {
        const [data, cats] = await Promise.all([getPosts(), getCategories()]);
        setPosts(data);
        setCategories(cats);
      }
    };
    fetchData();
  }, [loggedIn]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const success = await loginAdmin(password);
      if (success) {
        const data = await getPosts();
        setPosts(data);
        navigate('/admin');
      } else {
        setError('비밀번호가 올바르지 않습니다.');
        alert('로그인 실패: 비밀번호를 확인해주세요.');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(`오류 발생: ${err.message}`);
      alert(`서버 통신 오류: ${err.message}`);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    if (newPassword.length < 4) {
      setError('비밀번호는 최소 4자 이상이어야 합니다.');
      return;
    }

    const result = await updateAdminPassword(newPassword);
    if (result) {
      setSuccess('비밀번호가 성공적으로 변경되었습니다.');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setSuccess('');
        setShowPasswordForm(false);
      }, 2000);
    } else {
      setError('비밀번호 변경에 실패했습니다.');
    }
  };

  const handleAddCategory = async () => {
    const trimmed = newCategory.trim();
    if (!trimmed) return;
    if (categories.includes(trimmed)) {
      setCategoryMsg('이미 존재하는 카테고리입니다.');
      return;
    }
    const updated = [...categories, trimmed];
    const ok = await saveCategories(updated);
    if (ok) {
      setCategories(updated);
      setNewCategory('');
      setCategoryMsg('카테고리가 추가되었습니다.');
      setTimeout(() => setCategoryMsg(''), 2000);
    }
  };

  const handleDeleteCategory = async (cat: string) => {
    const updated = categories.filter(c => c !== cat);
    const ok = await saveCategories(updated);
    if (ok) {
      setCategories(updated);
      setCategoryMsg(`'${cat}' 카테고리가 삭제되었습니다.`);
      setTimeout(() => setCategoryMsg(''), 2000);
    }
  };

  const handleLogout = async () => {
    await logoutAdmin();
    navigate('/');
  };

  const handleDeletePost = async (id: number) => {
    if (window.confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
      await deletePost(id);
      const data = await getPosts();
      setPosts(data);
    }
  };

  if (loggedIn) {
    return (
      <div className="container">
        <article className="post-detail">
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <h1>관리자 설정</h1>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => { setShowCategoryForm(v => !v); setCategoryMsg(''); setNewCategory(''); }}
                className="edit-btn"
                style={{ width: 'auto', padding: '8px 20px' }}
              >
                카테고리 수정
              </button>
              <button
                onClick={() => { setShowPasswordForm(v => !v); setError(''); setSuccess(''); setNewPassword(''); setConfirmPassword(''); }}
                className="edit-btn"
                style={{ width: 'auto', padding: '8px 20px' }}
              >
                비밀번호 변경
              </button>
              <button
                onClick={handleLogout}
                className="delete-btn"
                style={{ width: 'auto', padding: '8px 20px' }}
              >
                로그아웃
              </button>
            </div>
          </header>

          {/* 카테고리 관리 섹션 (토글) */}
          {showCategoryForm && (
            <section style={{ marginBottom: '30px', padding: '24px', backgroundColor: 'var(--bg-app)', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
              <h2 style={{ marginBottom: '20px' }}>카테고리 관리</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
                {categories.map(cat => (
                  <span key={cat} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '20px', fontSize: '0.9rem' }}>
                    {cat}
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(cat)}
                      style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontSize: '1rem', lineHeight: 1, padding: 0 }}
                      aria-label={`${cat} 삭제`}
                    >×</button>
                  </span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '10px', maxWidth: '400px' }}>
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCategory())}
                  placeholder="새 카테고리 이름"
                  style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }}
                />
                <button type="button" onClick={handleAddCategory} className="submit-btn" style={{ padding: '8px 20px' }}>추가</button>
              </div>
              {categoryMsg && <p style={{ marginTop: '12px', fontSize: '0.9rem', color: categoryMsg.includes('삭제') || categoryMsg.includes('추가') ? '#2ecc71' : '#e74c3c' }}>{categoryMsg}</p>}
              <button type="button" onClick={() => setShowCategoryForm(false)} className="edit-btn" style={{ marginTop: '16px', padding: '8px 20px' }}>닫기</button>
            </section>
          )}

          {/* 비밀번호 변경 섹션 (토글) */}
          {showPasswordForm && (
            <section style={{ marginBottom: '50px', padding: '24px', backgroundColor: 'var(--bg-app)', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
              <h2 style={{ marginBottom: '20px' }}>비밀번호 변경</h2>
              <form onSubmit={handlePasswordChange} style={{ maxWidth: '400px' }}>
                <div className="form-group">
                  <label htmlFor="newPassword">새 비밀번호</label>
                  <input
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="새 비밀번호 입력"
                    autoFocus
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="confirmPassword">비밀번호 확인</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="비밀번호 다시 입력"
                  />
                </div>
                {error && <p style={{ color: '#e74c3c', marginBottom: '15px', fontSize: '0.9rem' }}>{error}</p>}
                {success && <p style={{ color: '#2ecc71', marginBottom: '15px', fontSize: '0.9rem' }}>{success}</p>}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" className="submit-btn">변경하기</button>
                  <button type="button" onClick={() => setShowPasswordForm(false)} className="edit-btn" style={{ padding: '10px 20px' }}>취소</button>
                </div>
              </form>
            </section>
          )}

          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2>게시글 관리</h2>
              <Link to="/create" className="submit-btn" style={{ textDecoration: 'none', fontSize: '0.9rem' }}>
                새 글 작성
              </Link>
            </div>

            <div className="admin-post-list">
              {posts.length > 0 ? (
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-light)', textAlign: 'left' }}>
                      <th style={{ padding: '12px' }}>제목</th>
                      <th style={{ padding: '12px' }}>카테고리</th>
                      <th style={{ padding: '12px' }}>작성일</th>
                      <th style={{ padding: '12px', textAlign: 'right' }}>관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {posts.map(post => (
                      <tr key={post.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <td style={{ padding: '12px' }}>
                          <Link to={`/post/${post.id}`} style={{ color: 'var(--text-main)', textDecoration: 'none', fontWeight: 500 }}>
                            {post.title}
                          </Link>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span className="category-badge" style={{ marginBottom: 0 }}>{post.category}</span>
                        </td>
                        <td style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{post.date}</td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <Link to={`/edit/${post.id}`} className="edit-btn" style={{ textDecoration: 'none', padding: '6px 12px' }}>수정</Link>
                            <button onClick={() => handleDeletePost(post.id)} className="delete-btn" style={{ padding: '6px 12px' }}>삭제</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>게시글이 없습니다.</p>
              )}
            </div>
          </section>
        </article>
      </div>
    );
  }

  return (
    <div className="container">
      <article className="post-detail">
        <header>
          <h1>관리자 로그인</h1>
        </header>
        <form onSubmit={handleLogin} style={{ maxWidth: '400px', margin: '0 auto', padding: '40px 0' }}>
          <div className="form-group">
            <label htmlFor="password">관리자 비밀번호</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              autoFocus
            />
          </div>
          {error && <p style={{ color: '#e74c3c', marginBottom: '15px' }}>{error}</p>}
          <button type="submit" className="submit-btn" style={{ width: '100%' }}>
            로그인
          </button>
        </form>
      </article>
    </div>
  );
};

export default Admin;
