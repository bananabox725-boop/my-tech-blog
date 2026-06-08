import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getPosts, updatePost, deletePost, getCategories } from '../utils/storage';
import type { Post } from '../data/posts';
import '../styles/blog.css';

const EditPost: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('React');
  const [content, setContent] = useState('');
  const [contentType, setContentType] = useState<'markdown' | 'html'>('markdown');
  const [imageUrl, setImageUrl] = useState('');
  const [attachments, setAttachments] = useState<{ name: string; data: string; type: string }[]>([]);
  const [existingCategories, setExistingCategories] = useState<string[]>([]);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    const fetchPostData = async () => {
      setLoading(true);
      const posts = await getPosts();
      const foundPost = posts.find(p => p.id === Number(id));

      if (foundPost) {
        setPost(foundPost);
        setTitle(foundPost.title);
        setCategory(foundPost.category);
        setContent(foundPost.content);
        setContentType(foundPost.contentType || 'markdown');
        setImageUrl(foundPost.imageUrl || '');
        setAttachments(foundPost.attachments || []);

        const cats = await getCategories();
        setExistingCategories(cats);
      } else {
        alert('게시글을 찾지 못했습니다.');
        navigate('/');
      }
      setLoading(false);
    };
    fetchPostData();
  }, [id, navigate]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newAttachments: { name: string; data: string; type: string }[] = [];
    const fileArray = Array.from(files);

    fileArray.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          newAttachments.push({
            name: file.name,
            data: event.target.result as string,
            type: file.type
          });
          if (newAttachments.length === fileArray.length) {
            setAttachments(prev => [...prev, ...newAttachments]);
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const getExcerpt = (text: string) => {
    const stripped = contentType === 'html' ? text.replace(/<[^>]+>/g, '') : text;
    return stripped.substring(0, 100) + '...';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !content) {
      alert('제목과 내용을 입력해주세요.');
      return;
    }

    const updatedPost: Post = {
      id: Number(id),
      title,
      category,
      content,
      contentType,
      imageUrl: imageUrl || undefined,
      attachments: attachments.length > 0 ? attachments : undefined,
      excerpt: getExcerpt(content),
      date: post?.date || new Date().toISOString().split('T')[0],
      likes: post?.likes || 0,
      views: post?.views || 0
    };

    await updatePost(updatedPost);
    navigate(`/post/${id}`);
  };

  const handleDelete = async () => {
    if (window.confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
      await deletePost(Number(id));
      navigate('/');
    }
  };

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: '8px 20px',
    border: 'none',
    borderBottom: active ? '2px solid var(--primary-color)' : '2px solid transparent',
    background: 'none',
    cursor: 'pointer',
    fontWeight: active ? 700 : 400,
    color: active ? 'var(--primary-color)' : 'var(--text-muted)',
    fontSize: '0.95rem',
    transition: 'all 0.2s',
  });

  if (loading) {
    return (
      <div className="container">
        <p>게시글을 불러오는 중입니다...</p>
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="container">
      <article className="post-detail">
        <header>
          <h2>게시글 수정</h2>
        </header>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">제목</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목을 입력하세요"
              aria-required="true"
            />
          </div>
          <div className="form-group">
            <label htmlFor="category">카테고리</label>
            <select id="category" value={category} onChange={(e) => setCategory(e.target.value)}>
              {existingCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="imageUrl">이미지 URL (선택 사항)</label>
            <input
              type="text"
              id="imageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="이미지 주소를 입력하세요"
            />
          </div>

          <div className="form-group">
            <label htmlFor="files">첨부 파일</label>
            <input
              type="file"
              id="files"
              multiple
              onChange={handleFileChange}
              style={{ marginBottom: '10px' }}
            />
            {attachments.length > 0 && (
              <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.9rem' }}>
                {attachments.map((file, index) => (
                  <li key={index} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px', backgroundColor: '#f0f0f0', marginBottom: '5px', borderRadius: '4px' }}>
                    <span>{file.name}</span>
                    <button type="button" onClick={() => removeAttachment(index)} style={{ border: 'none', background: 'none', color: '#e74c3c', cursor: 'pointer' }}>삭제</button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ margin: 0 }}>내용</label>
              <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border-light)' }}>
                <button type="button" style={tabStyle(contentType === 'markdown' && !previewMode)} onClick={() => { setContentType('markdown'); setPreviewMode(false); }}>
                  Markdown
                </button>
                <button type="button" style={tabStyle(contentType === 'html' && !previewMode)} onClick={() => { setContentType('html'); setPreviewMode(false); }}>
                  HTML
                </button>
                <button type="button" style={tabStyle(previewMode)} onClick={() => setPreviewMode(p => !p)}>
                  미리보기
                </button>
              </div>
            </div>

            {previewMode && contentType === 'html' ? (
              <div
                className="post-content markdown-body"
                dangerouslySetInnerHTML={{ __html: content }}
                style={{ minHeight: '300px', padding: '16px', border: '1px solid var(--border-light)', borderRadius: '8px', backgroundColor: 'var(--bg-card)' }}
              />
            ) : previewMode && contentType === 'markdown' ? (
              <div
                className="post-content markdown-body"
                style={{ minHeight: '300px', padding: '16px', border: '1px solid var(--border-light)', borderRadius: '8px', backgroundColor: 'var(--bg-card)' }}
              >
                <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>마크다운 미리보기는 게시물 상세 페이지에서 확인하세요.</p>
              </div>
            ) : (
              <textarea
                id="content"
                rows={15}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={contentType === 'markdown'
                  ? '마크다운 형식으로 작성하세요. (예: **굵게**, ### 제목, [링크](https://주소))'
                  : 'HTML5 형식으로 작성하세요. (예: <h2>제목</h2>, <p>본문</p>, <strong>굵게</strong>)'}
                aria-required="true"
              />
            )}

            {!previewMode && contentType === 'markdown' && (
              <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '8px', lineHeight: '1.5' }}>
                💡 <b>마크다운 팁:</b> 하이퍼링크 <code>[링크이름](https://주소)</code> · 굵게 <code>**내용**</code> · 제목 <code>### 제목</code>
              </p>
            )}
            {!previewMode && contentType === 'html' && (
              <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '8px', lineHeight: '1.5' }}>
                💡 <b>HTML 팁:</b> <code>&lt;h2&gt;제목&lt;/h2&gt;</code> · <code>&lt;p&gt;본문&lt;/p&gt;</code> · <code>&lt;a href="..."&gt;링크&lt;/a&gt;</code> · <code>&lt;img src="..." /&gt;</code> · <code>&lt;ul&gt;&lt;li&gt;...&lt;/li&gt;&lt;/ul&gt;</code>
              </p>
            )}
          </div>

          <div className="form-actions" style={{ display: 'flex', gap: '10px', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="submit-btn">저장</button>
              <button type="button" className="cancel-btn" onClick={() => navigate(-1)}>취소</button>
            </div>
            <button type="button" className="delete-btn" onClick={handleDelete}>삭제</button>
          </div>
        </form>
      </article>
    </div>
  );
};

export default EditPost;
