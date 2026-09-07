import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchPosts } from '../../api/posts';

function PostList() {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts()
      .then(setPosts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>불러오는 중…</p>;
  if (error) return <p>게시글 목록을 불러오지 못했습니다: {error}</p>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>NAS 게시판</h1>
      {posts.length === 0 && <p>게시글이 없습니다.</p>}
      {posts.map((post) => (
        <div key={post.id} style={{ borderBottom: '1px solid #ccc', marginBottom: '10px', paddingBottom: '10px' }}>
          <h3>
            <Link to={`/posts/${post.id}`}>{post.title}</Link>
          </h3>
          <small>{post.created_at}</small>
        </div>
      ))}
    </div>
  );
}

export default PostList;
