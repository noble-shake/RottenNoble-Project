import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchPost } from '../../api/posts';
import { isLoggedIn } from '../../api/auth';

function PostDetail() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchPost(id)
      .then(setPost)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

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
      </div>
      <h1>{post.title}</h1>
      <span className="meta">{post.created_at}</span>
      <p style={{ whiteSpace: 'pre-wrap', marginTop: '20px' }}>{post.content}</p>
    </div>
  );
}

export default PostDetail;
