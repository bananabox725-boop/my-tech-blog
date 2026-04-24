import React from 'react';
import { Link } from 'react-router-dom';
import { isAdmin } from '../utils/storage';

const Header: React.FC = () => {
  const admin = isAdmin();

  return (
    <header>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" style={{ textDecoration: 'none' }} aria-label="My Tech Blog Home">
          <h1>My Tech Blog</h1>
        </Link>
        <nav aria-label="주요 네비게이션">
          <ul style={{ listStyle: 'none', display: 'flex', gap: '20px', margin: 0, padding: 0 }}>
            <li>
              <Link to="/" style={{ textDecoration: 'none', color: 'var(--text-color)', fontWeight: 500 }}>홈</Link>
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