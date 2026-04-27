import React, { useMemo, useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { 
  getPosts, 
  deletePost, 
  isAdmin, 
  getComments, 
  saveComment, 
  deleteComment, 
  incrementViews, 
  toggleLike, 
  isPostLiked 
} from '../utils/storage';
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

  // 목차(TOC) 추출
  const toc = useMemo(() => {
    if (!post) return [];
    const tokens = post.content.split('\n');
    return tokens
      .filter(line => line.startsWith('#'))
      .map(line => {
        const level = line.match(/^#+/)?.[0].length || 0;
        const text = line.replace(/^#+\s*/, '');
        const anchor = text.toLowerCase().replace(/[^\wㄱ-ㅎㅏ-ㅣ가-힣]+/g, '-');
        return { level, text, anchor };
      });
  }, [post]);

  // 댓글 및 인터랙션 상태
  const [comments, setComments] = useState<Comment[]>([]);
  const [likes, setLikes] = useState(post?.likes || 0);
  const [liked, setLiked] = useState(false);
  const [author, setAuthor] = useState('');
  const [password, setPassword] = useState('');
  const [commentContent, setCommentContent] = useState('');

  useEffect(() => {
    if (id) {
      setComments(getComments(Number(id)));
      setLiked(isPostLiked(Number(id)));
      incrementViews(Number(id));
    }
  }, [id]);

  const handleLike = () => {
    const newLikes = toggleLike(Number(id));
    setLikes(newLikes);
    setLiked(prev => !prev);
  };

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
    <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '40px', alignItems: 'start' }}>
      <article className="post-detail">
        <header className="post-detail-header">
          <div className="post-meta">
            <span className="category-badge">{post.category}</span>
            <div style={{ display: 'flex', gap: '15px', color: 'var(--text-muted)' }}>
              <span>👁️ {post.views || 0}</span>
              <span>❤️ {likes}</span>
              <span>{post.date}</span>
            </div>
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

        <hr style={{ border: 'none', borderTop: '1px solid var(--border-light)', marginBottom: '30px' }} />

        <section className="post-content markdown-body" aria-label="본문" style={{ minHeight: '200px' }}>
          <ReactMarkdown
            components={{
              code({ node, inline, className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || '');
                return !inline && match ? (
                  <SyntaxHighlighter
                    style={vscDarkPlus as any}
                    language={match[1]}
                    PreTag="div"
                    {...props}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              },
              h1: ({children}) => <h1 id={String(children).toLowerCase().replace(/[^\wㄱ-ㅎㅏ-ㅣ가-힣]+/g, '-')}>{children}</h1>,
              h2: ({children}) => <h2 id={String(children).toLowerCase().replace(/[^\wㄱ-ㅎㅏ-ㅣ가-힣]+/g, '-')}>{children}</h2>,
              h3: ({children}) => <h3 id={String(children).toLowerCase().replace(/[^\wㄱ-ㅎㅏ-ㅣ가-힣]+/g, '-')}>{children}</h3>,
            }}
          >
            {post.content}
          </ReactMarkdown>
        </section>

        {/* 좋아요 버튼 */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '60px' }}>
          <button 
            onClick={handleLike}
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              gap: '8px', 
              background: 'none', 
              border: liked ? '2px solid #ef4444' : '2px solid var(--border-light)', 
              padding: '16px 32px', 
              borderRadius: '20px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              backgroundColor: liked ? '#fef2f2' : 'transparent',
              color: liked ? '#ef4444' : 'var(--text-main)'
            }}
          >
            <span style={{ fontSize: '1.5rem' }}>{liked ? '❤️' : '🤍'}</span>
            <span style={{ fontWeight: 700 }}>{likes}</span>
          </button>
        </div>

        {/* 첨부 파일 섹션 */}
        {post.attachments && post.attachments.length > 0 && (
          <section className="attachments-section" style={{ marginTop: '50px', padding: '20px', backgroundColor: 'var(--bg-app)', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
            <h4 style={{ marginBottom: '15px' }}>첨부 파일</h4>
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
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>(다운로드)</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* 댓글 섹션 */}
        <section className="comments-section" style={{ marginTop: '60px', borderTop: '2px solid var(--border-light)', paddingTop: '40px' }}>
          <h3>댓글 ({comments.length})</h3>
          
          <ul style={{ listStyle: 'none', padding: 0, marginTop: '20px' }}>
            {comments.map(c => (
              <li key={c.id} className="comment-item" style={{ position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <strong>{c.author}</strong>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{c.date}</span>
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
            {comments.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0' }}>첫 번째 댓글을 남겨보세요!</p>}
          </ul>

          <form onSubmit={handleCommentSubmit} style={{ marginTop: '40px', backgroundColor: 'var(--bg-app)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
            <h4 style={{ marginBottom: '15px' }}>댓글 작성</h4>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <input 
                type="text" 
                placeholder="이름" 
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                style={{ flex: 1, padding: '10px', border: '1px solid var(--border-light)', borderRadius: '8px', backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }}
              />
              <input 
                type="password" 
                placeholder="비밀번호" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ flex: 1, padding: '10px', border: '1px solid var(--border-light)', borderRadius: '8px', backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }}
              />
            </div>
            <textarea 
              placeholder="댓글 내용을 입력하세요" 
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              style={{ width: '100%', padding: '12px', border: '1px solid var(--border-light)', borderRadius: '8px', minHeight: '100px', marginBottom: '10px', backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }}
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

      {/* 목차(TOC) 사이드바 */}
      <aside style={{ position: 'sticky', top: '120px', alignSelf: 'start', display: toc.length > 0 ? 'block' : 'none' }}>
        <h4 style={{ marginBottom: '15px', color: 'var(--text-main)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>목차</h4>
        <nav>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, borderLeft: '2px solid var(--border-light)' }}>
            {toc.map((item, idx) => (
              <li key={idx} style={{ paddingLeft: `${(item.level - 1) * 15 + 15}px`, marginBottom: '10px' }}>
                <a 
                  href={`#${item.anchor}`}
                  style={{ 
                    fontSize: '0.9rem', 
                    color: 'var(--text-muted)', 
                    textDecoration: 'none',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--primary-color)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                >
                  {item.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </div>
  );
};

export default PostDetail;

