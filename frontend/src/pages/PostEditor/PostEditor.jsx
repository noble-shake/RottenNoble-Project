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

  if (loading) return <p style={{ padding: '20px' }}>불러오는 중…</p>;

  return (
    <div style={{ padding: '20px', maxWidth: '600px' }}>
      <h1>{isEdit ? '게시글 수정' : '새 게시글'}</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <input
            type="text"
            placeholder="제목"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={255}
            style={{ width: '100%' }}
            required
          />
        </div>
        <div style={{ marginTop: '8px' }}>
          <textarea
            placeholder="내용"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            style={{ width: '100%' }}
            required
          />
        </div>
        {error && <p style={{ color: 'crimson' }}>{error}</p>}
        <button type="submit" disabled={submitting} style={{ marginTop: '8px' }}>
          {submitting ? '저장 중…' : '저장'}
        </button>
      </form>
    </div>
  );
}

export default PostEditor;
