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

  return (
    <div className="page">
      <span className="eyebrow">Journal</span>
      <h1>게시판</h1>

      {loading && <p className="hint-text">불러오는 중…</p>}
      {error && <p className="error-text">게시글 목록을 불러오지 못했습니다: {error}</p>}
      {!loading && !error && posts.length === 0 && <p className="hint-text">게시글이 없습니다.</p>}

      {posts.map((post) => (
        <div key={post.id} className="post-item">
          <h3>
            <Link to={`/posts/${post.id}`}>{post.title}</Link>
          </h3>
          <span className="meta">{post.created_at}</span>
        </div>
      ))}
    </div>
  );
}

export default PostList;
