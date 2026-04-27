import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { isAdmin } from '../utils/storage';

const Header: React.FC = () => {
  const admin = isAdmin();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <header style={{ 
      backgroundColor: 'var(--header-bg)', 
      backdropFilter: 'blur(8px)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      borderBottom: '1px solid var(--border-light)'
    }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '80px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Link to="/" style={{ textDecoration: 'none' }} aria-label="insite blind Home">
            <h1>insite blind</h1>
          </Link>
          <button 
            onClick={toggleTheme} 
            style={{ 
              background: 'none', 
              border: 'none', 
              fontSize: '1.5rem', 
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '12px',
              backgroundColor: 'var(--border-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            aria-label="테마 변경"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
        <nav aria-label="주요 네비게이션">
          <ul style={{ listStyle: 'none', display: 'flex', gap: '20px', margin: 0, padding: 0 }}>
            <li>
              <Link to="/" style={{ textDecoration: 'none', color: 'var(--text-main)', fontWeight: 500 }}>홈</Link>
            </li>
            {admin && (
              <li>
                <Link to="/create" style={{
                  textDecoration: 'none',
                  backgroundColor: 'var(--primary-color)',
                  color: '#fff',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontWeight: 600
                }}>글쓰기</Link>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;