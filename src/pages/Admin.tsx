import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { isAdmin, loginAdmin, logoutAdmin, getPosts, deletePost, updateAdminPassword } from '../utils/storage';
import type { Post } from '../data/posts';
import '../styles/blog.css';

const Admin: React.FC = () => {
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);
  const navigate = useNavigate();
  const loggedIn = isAdmin();

  useEffect(() => {
    const fetchPosts = async () => {
      if (loggedIn) {
        const data = await getPosts();
        setPosts(data);
      }
    };
    fetchPosts();
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
    } else {
      setError('비밀번호 변경에 실패했습니다.');
    }
  };

  const handleLogout = () => {
    logoutAdmin();
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
            <button 
              onClick={handleLogout} 
              className="delete-btn" 
              style={{ width: 'auto', padding: '8px 20px' }}
            >
              로그아웃
            </button>
          </header>

          {/* 비밀번호 변경 섹션 */}
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
              <button type="submit" className="submit-btn">변경하기</button>
            </form>
          </section>

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
