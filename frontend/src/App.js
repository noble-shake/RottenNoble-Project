import React, { useEffect, useState } from 'react';

function App() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch('http://localhost/RottenNoble_Apache/get_posts.php')
      .then(res => res.json())
      .then(data => setPosts(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1>NAS 게시판</h1>
      {posts.map(post => (
        <div key={post.id} style={{ borderBottom: '1px solid #ccc', marginBottom: '10px' }}>
          <h3>{post.title}</h3>
          <p>{post.content}</p>
          <small>{post.created_at}</small>
        </div>
      ))}
    </div>
  );
}

export default App;