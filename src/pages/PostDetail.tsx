import React, { useMemo, useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { getPosts, deletePost, isAdmin, getComments, saveComment, deleteComment } from '../utils/storage';
import type { Comment } from '../data/posts';
import '../styles/blog.css';

const PostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const adminMode = isAdmin();

  // 게시글 정보
  const post = useMemo(() => {
    const posts = getPosts();
    return posts.find((p) => p.id === Number(id)) || null;
  }, [id]);

  // 댓글 상태
  const [comments, setComments] = useState<Comment[]>([]);
  const [author, setAuthor] = useState('');
  const [password, setPassword] = useState('');
  const [commentContent, setCommentContent] = useState('');

  useEffect(() => {
    if (id) {
      setComments(getComments(Number(id)));
    }
  }, [id]);

  const handlePostDelete = () => {
    if (window.confirm('정말로 게시글을 삭제하시겠습니까?')) {
      deletePost(Number(id));
      navigate('/');
    }
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!author || !password || !commentContent) {
      alert('이름, 비밀번호, 내용을 모두 입력해주세요.');
      return;
    }

    const newComment: Comment = {
      id: Date.now(),
      postId: Number(id),
      author,
      password,
      content: commentContent,
      date: new Date().toLocaleString()
    };

    saveComment(newComment);
    setComments(prev => [...prev, newComment]);
    setAuthor('');
    setPassword('');
    setCommentContent('');
  };

  const handleCommentDelete = (commentId: number) => {
    if (window.confirm('관리자 권한으로 이 댓글을 삭제하시겠습니까?')) {
      deleteComment(commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
    }
  };

  if (!post) {
    return (
      <div className="container">
        <h2 style={{ color: '#e74c3c' }}>게시글을 찾지 못했습니다.</h2>
        <Link to="/" className="post-link">목록으로 돌아가기</Link>
      </div>
    );
  }

  return (
    <div className="container">
      <article className="post-detail">
        <header className="post-detail-header">
          <div className="post-meta">
            <span className="category-badge">{post.category}</span>
            <span>{post.date}</span>
          </div>
          {adminMode && (
            <nav className="post-actions" aria-label="게시글 작업">
              <Link to={`/edit/${post.id}`} className="edit-btn" aria-label="게시글 수정">수정</Link>
              <button onClick={handlePostDelete} className="delete-btn" aria-label="게시글 삭제">삭제</button>
            </nav>
          )}
        </header>

        <h1 style={{ fontSize: '2.5rem', marginBottom: '20px' }}>{post.title}</h1>

        {post.imageUrl && (
          <div className="post-detail-image">
            <img src={post.imageUrl} alt="" role="presentation" />
          </div>
        )}

        <hr style={{ border: 'none', borderTop: '1px solid #eee', marginBottom: '30px' }} />

        <section className="post-content markdown-body" aria-label="본문" style={{ minHeight: '200px' }}>
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </section>

        {/* 첨부 파일 섹션 */}
        {post.attachments && post.attachments.length > 0 && (
          <section className="attachments-section" style={{ marginTop: '30px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            <h4 style={{ marginBottom: '10px' }}>첨부 파일</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {post.attachments.map((file, index) => (
                <li key={index} style={{ marginBottom: '8px' }}>
                  <a 
                    href={file.data} 
                    download={file.name}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px', 
                      color: 'var(--primary-color)', 
                      textDecoration: 'none',
                      fontWeight: 500
                    }}
                  >
                    <span role="img" aria-label="file">📁</span>
                    {file.name}
                    <span style={{ fontSize: '0.8rem', color: '#888' }}>(다운로드)</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* 댓글 섹션 */}
        <section className="comments-section" style={{ marginTop: '60px', borderTop: '2px solid #eee', paddingTop: '40px' }}>
          <h3>댓글 ({comments.length})</h3>
          
          <ul style={{ listStyle: 'none', padding: 0, marginTop: '20px' }}>
            {comments.map(c => (
              <li key={c.id} className="comment-item" style={{ position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <strong>{c.author}</strong>
                  <span style={{ fontSize: '0.85rem', color: '#888' }}>{c.date}</span>
                </div>
                <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{c.content}</p>
                {adminMode && (
                  <button 
                    onClick={() => handleCommentDelete(c.id)}
                    style={{ 
                      position: 'absolute', 
                      top: '24px', 
                      right: '24px', 
                      backgroundColor: 'transparent', 
                      color: '#e11d48', 
                      border: 'none', 
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 700
                    }}
                  >
                    삭제
                  </button>
                )}
              </li>
            ))}
            {comments.length === 0 && <p style={{ color: '#888', textAlign: 'center', padding: '40px 0' }}>첫 번째 댓글을 남겨보세요!</p>}
          </ul>

          <form onSubmit={handleCommentSubmit} style={{ marginTop: '40px', backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px' }}>
            <h4 style={{ marginBottom: '15px' }}>댓글 작성</h4>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <input 
                type="text" 
                placeholder="이름" 
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                style={{ flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
              <input 
                type="password" 
                placeholder="비밀번호" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            <textarea 
              placeholder="댓글 내용을 입력하세요" 
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', minHeight: '80px', marginBottom: '10px' }}
            />
            <button type="submit" className="submit-btn" style={{ width: '100%' }}>댓글 등록</button>
          </form>
        </section>

        <footer style={{ marginTop: '40px' }}>
          <Link to="/" className="post-link" aria-label="목록으로 돌아가기">
            &larr; 목록으로 돌아가기
          </Link>
        </footer>
      </article>
    </div>
  );
};

export default PostDetail;
