import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchPosts } from '../../api/posts';

function Home() {
  const [recentPosts, setRecentPosts] = useState([]);

  useEffect(() => {
    fetchPosts()
      .then((posts) => setRecentPosts(posts.slice(0, 3)))
      .catch(() => setRecentPosts([]));
  }, []);

  return (
    <div className="hero-page">
      <section className="hero">
        <span className="eyebrow">Game Dev Journal</span>
        <h1 className="hero-title">
          빛이 부서지는 방식을
          <br />
          기록합니다
        </h1>
        <p className="hero-sub">Unity 셰이더, 그래픽스 실험을 기록하는 개인 포트폴리오.</p>
        <Link className="btn" to="/posts">게시판 보기</Link>
      </section>

      {recentPosts.length > 0 && (
        <section className="recent">
          <span className="eyebrow">최근 글</span>
          <div className="recent-grid">
            {recentPosts.map((post) => (
              <Link key={post.id} className="recent-card" to={`/posts/${post.id}`}>
                <span className="recent-date">{post.created_at}</span>
                <h3>{post.title}</h3>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default Home;
