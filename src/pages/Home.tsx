import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { Post } from '../data/posts';
import { getPosts, isAdmin, deletePost } from '../utils/storage';
import '../styles/blog.css';

const Home: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>(() => getPosts());
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const adminMode = isAdmin();

  const filteredPosts = useMemo(() => {
    let result = posts;
    if (activeCategory !== 'All') {
      result = result.filter(post => post.category === activeCategory);
    }
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(post => 
        post.title.toLowerCase().includes(lowerSearch) ||
        post.content.toLowerCase().includes(lowerSearch)
      );
    }
    return result;
  }, [posts, activeCategory, searchTerm]);

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
      deletePost(id);
      setPosts(getPosts());
    }
  };

  const categories = ['All', ...Array.from(new Set(posts.map(post => post.category)))];

  return (
    <div className="container">
      <section className="search-section" aria-labelledby="search-heading">
        <h2 id="search-heading" className="sr-only" style={{ display: 'none' }}>검색 및 필터</h2>
        <div className="search-input-wrapper">
          <label htmlFor="search-input" style={{ display: 'block', marginBottom: '5px' }}>게시글 검색</label>
          <input
            id="search-input"
            type="text"
            placeholder="검색어를 입력하세요 (제목, 내용)"
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </section>

      <section className="category-filters" aria-label="카테고리 필터">
        {categories.map(cat => (
          <button
            key={cat}
            className={activeCategory === cat ? "filter-tab active" : "filter-tab"}
            onClick={() => setActiveCategory(cat)}
            aria-label={`${cat} 카테고리 게시글 보기`}
            aria-pressed={activeCategory === cat}
          >
            {cat}
          </button>
        ))}
      </section>

      <section className="post-list-section">
        {filteredPosts.length > 0 ? (
          <ul className="post-list" style={{ listStyle: 'none', padding: 0 }}>
            {filteredPosts.map(post => (
              <li key={post.id} className="post-item" style={{ marginBottom: '20px' }}>
                <article className="post-card">
                  {post.imageUrl && (
                    <div className="post-card-image">
                      <img src={post.imageUrl} alt="" role="presentation" />
                    </div>
                  )}
                  <div className="post-card-content">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span className="category-badge">{post.category}</span>
                      {adminMode && (
                        <button 
                          onClick={(e) => handleDelete(e, post.id)} 
                          className="delete-btn"
                          style={{ padding: '4px 10px', fontSize: '0.75rem', marginTop: '-10px' }}
                        >
                          삭제
                        </button>
                      )}
                    </div>
                    <h3>{post.title}</h3>
                    <p>{post.excerpt}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#888', fontSize: '0.9rem' }}>{post.date}</span>
                      <Link to={`/post/${post.id}`} className="post-link" aria-label={`${post.title} 상세 보기`}>
                        상세 보기 &rarr;
                      </Link>
                    </div>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        ) : (
          <p>검색 결과가 없습니다.</p>
        )}
      </section>
    </div>
  );
};

export default Home;