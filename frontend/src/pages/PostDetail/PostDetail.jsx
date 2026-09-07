import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchPost } from '../../api/posts';

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

  if (loading) return <p style={{ padding: '20px' }}>불러오는 중…</p>;

  if (error) {
    return (
      <div style={{ padding: '20px' }}>
        <p>게시글을 불러오지 못했습니다: {error}</p>
        <Link to="/">목록으로</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <Link to="/">← 목록으로</Link>
      <h1>{post.title}</h1>
      <small>{post.created_at}</small>
      <p style={{ whiteSpace: 'pre-wrap', marginTop: '16px' }}>{post.content}</p>
    </div>
  );
}

export default PostDetail;
