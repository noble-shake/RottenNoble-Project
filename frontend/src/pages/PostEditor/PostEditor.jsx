import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchPost, createPost, updatePost } from '../../api/posts';

function PostEditor() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    fetchPost(id)
      .then((post) => {
        setTitle(post.title);
        setContent(post.content);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const action = isEdit ? updatePost(id, { title, content }) : createPost({ title, content });

    action
      .then((post) => navigate(`/posts/${post.id}`))
      .catch((err) => setError(err.message))
      .finally(() => setSubmitting(false));
  };

  if (loading) return <div className="page"><p className="hint-text">불러오는 중…</p></div>;

  return (
    <div className="page">
      <span className="eyebrow">{isEdit ? 'Edit' : 'New Entry'}</span>
      <h1>{isEdit ? '게시글 수정' : '새 게시글'}</h1>
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="post-title">제목</label>
          <input
            id="post-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={255}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="post-content">내용</label>
          <textarea
            id="post-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={12}
            required
          />
        </div>
        {error && <p className="error-text">{error}</p>}
        <button type="submit" disabled={submitting}>
          {submitting ? '저장 중…' : '저장'}
        </button>
      </form>
    </div>
  );
}

export default PostEditor;
