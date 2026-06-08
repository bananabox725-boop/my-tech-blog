import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { savePost, getCategories } from '../utils/storage';
import type { Post } from '../data/posts';
import '../styles/blog.css';

const CreatePost: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [content, setContent] = useState('');
  const [contentType, setContentType] = useState<'markdown' | 'html'>('markdown');
  const [imageUrl, setImageUrl] = useState('');
  const [attachments, setAttachments] = useState<{ name: string; data: string; type: string }[]>([]);
  const [existingCategories, setExistingCategories] = useState<string[]>([]);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      const cats = await getCategories();
      setExistingCategories(cats);
      if (cats.length > 0) setCategory(cats[0]);
    };
    fetchCategories();
  }, []);

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

    const newPost: Post = {
      id: Date.now(),
      title,
      category,
      content,
      contentType,
      imageUrl: imageUrl || undefined,
      attachments: attachments.length > 0 ? attachments : undefined,
      excerpt: getExcerpt(content),
      date: new Date().toISOString().split('T')[0],
      likes: 0,
      views: 0
    };

    await savePost(newPost);
    navigate('/');
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

  return (
    <div className="container">
      <article className="post-detail">
        <header>
          <h1>새 글 작성</h1>
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
            {/* 편집 형식 탭 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ margin: 0 }}>내용</label>
              <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border-light)' }}>
                <button type="button" style={tabStyle(contentType === 'markdown')} onClick={() => { setContentType('markdown'); setPreviewMode(false); }}>
                  Markdown
                </button>
                <button type="button" style={tabStyle(contentType === 'html')} onClick={() => { setContentType('html'); setPreviewMode(false); }}>
                  HTML
                </button>
                <button type="button" style={tabStyle(previewMode)} onClick={() => setPreviewMode(p => !p)}>
                  미리보기
                </button>
              </div>
            </div>

            {previewMode ? (
              <div
                className="post-content markdown-body"
                style={{ minHeight: '300px', padding: '16px', border: '1px solid var(--border-light)', borderRadius: '8px', backgroundColor: 'var(--bg-card)' }}
                {...(contentType === 'html'
                  ? { dangerouslySetInnerHTML: { __html: content } }
                  : {})}
              >
                {contentType === 'markdown' && (
                  <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>마크다운 미리보기는 게시물 상세 페이지에서 확인하세요.</p>
                )}
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

          <div className="form-actions" style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" className="submit-btn">작성 완료</button>
            <button type="button" className="cancel-btn" onClick={() => navigate(-1)}>취소</button>
          </div>
        </form>
      </article>
    </div>
  );
};

export default CreatePost;
