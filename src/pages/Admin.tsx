import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAdmin, loginAdmin, logoutAdmin } from '../utils/storage';
import '../styles/blog.css';

const Admin: React.FC = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const loggedIn = isAdmin();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginAdmin(password)) {
      navigate('/');
    } else {
      setError('비밀번호가 올바르지 않습니다.');
    }
  };

  const handleLogout = () => {
    logoutAdmin();
    navigate('/');
  };

  if (loggedIn) {
    return (
      <div className="container">
        <article className="post-detail">
          <header>
            <h1>관리자 설정</h1>
          </header>
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <p style={{ marginBottom: '20px', fontSize: '1.2rem' }}>현재 관리자로 로그인되어 있습니다.</p>
            <button 
              onClick={handleLogout} 
              className="delete-btn" 
              style={{ width: 'auto', padding: '10px 30px' }}
            >
              로그아웃
            </button>
          </div>
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
