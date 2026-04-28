import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getPosts, updatePost, deletePost } from '../utils/storage';
import type { Post } from '../data/posts';
import '../styles/blog.css';

const EditPost: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const post = useMemo(() => {
    const posts = getPosts();
    return posts.find(p => p.id === Number(id));
  }, [id]);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('React');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [attachments, setAttachments] = useState<{ name: string; data: string; type: string }[]>([]);

  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setCategory(post.category);
      setContent(post.content);
      setImageUrl(post.imageUrl || '');
      setAttachments(post.attachments || []);
    } else {
      alert('게시글을 찾지 못했습니다.');
      navigate('/');
    }
  }, [post, navigate]);

  // 기존 포스트에서 카테고리 목록 추출
  const existingCategories = useMemo(() => {
    const posts = getPosts();
    return Array.from(new Set(posts.map(p => p.category)));
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

  const handleSubmit = (e: React.FormEvent) => {
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
      imageUrl: imageUrl || undefined,
      attachments: attachments.length > 0 ? attachments : undefined,
      excerpt: content.substring(0, 100) + '...',
      date: post?.date || new Date().toISOString().split('T')[0],
      likes: post?.likes || 0,
      views: post?.views || 0
    };

    updatePost(updatedPost);
    navigate(`/post/${id}`);
  };

  const handleDelete = () => {
    if (window.confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
      deletePost(Number(id));
      navigate('/');
    }
  };

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
            <input
              type="text"
              id="category"
              list="category-list"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="카테고리를 입력하거나 선택하세요"
            />
            <datalist id="category-list">
              {existingCategories.map(cat => (
                <option key={cat} value={cat} />
              ))}
              {!existingCategories.includes('React') && <option value="React" />}
              {!existingCategories.includes('TypeScript') && <option value="TypeScript" />}
              {!existingCategories.includes('Tool') && <option value="Tool" />}
              {!existingCategories.includes('Life') && <option value="Life" />}
            </datalist>
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
            <label htmlFor="content">내용</label>
            <textarea
              id="content"
              rows={15}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="마크다운 형식을 지원합니다. (예: [링크이름](https://주소))"
              aria-required="true"
            ></textarea>
            <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '8px', lineHeight: '1.5' }}>
              💡 <b>마크다운 팁:</b> 하이퍼링크는 <code>[링크이름](https://주소)</code> 형식으로 입력하세요.<br/>
              굵은 글씨는 <code>**내용**</code>, 제목은 <code>### 제목</code> 처럼 사용 가능합니다.
            </p>
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
