import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { fetchPost, deletePost } from '../../api/posts';
import { isLoggedIn } from '../../api/auth';

function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchPost(id)
      .then(setPost)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = () => {
    if (!window.confirm('이 게시글을 삭제할까요? 되돌릴 수 없습니다.')) return;
    setDeleting(true);
    deletePost(id)
      .then(() => navigate('/'))
      .catch((err) => {
        setError(err.message);
        setDeleting(false);
      });
  };

  if (loading) return <div className="page"><p className="hint-text">불러오는 중…</p></div>;

  if (error) {
    return (
      <div className="page">
        <p className="error-text">게시글을 불러오지 못했습니다: {error}</p>
        <Link to="/">← 목록으로</Link>
      </div>
    );
  }

  return (
    <div className="page">
      <div style={{ display: 'flex', gap: '12px', marginBottom: '18px' }}>
        <Link to="/">← 목록으로</Link>
        {isLoggedIn() && <Link to={`/posts/${id}/edit`}>수정</Link>}
        {isLoggedIn() && (
          <button className="link" onClick={handleDelete} disabled={deleting}>
            {deleting ? '삭제 중…' : '삭제'}
          </button>
        )}
      </div>
      <h1>{post.title}</h1>
      <span className="meta">{post.created_at}</span>
      <p style={{ whiteSpace: 'pre-wrap', marginTop: '20px' }}>{post.content}</p>
    </div>
  );
}

export default PostDetail;
