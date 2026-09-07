import { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import PostList from './pages/PostList/PostList';
import PostDetail from './pages/PostDetail/PostDetail';
import Guestbook from './pages/Guestbook/Guestbook';
import Login from './pages/Login/Login';
import PostEditor from './pages/PostEditor/PostEditor';
import { isLoggedIn, logout } from './api/auth';

function Nav() {
  const navigate = useNavigate();
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());

  const handleLogout = () => {
    logout().finally(() => {
      setLoggedIn(false);
      navigate('/');
    });
  };

  return (
    <nav style={{ padding: '12px 20px', borderBottom: '1px solid #ccc' }}>
      <Link to="/" style={{ marginRight: '16px' }}>게시판</Link>
      <Link to="/guestbook" style={{ marginRight: '16px' }}>방명록</Link>
      {loggedIn ? (
        <>
          <Link to="/posts/new" style={{ marginRight: '16px' }}>글쓰기</Link>
          <button onClick={handleLogout}>로그아웃</button>
        </>
      ) : (
        <Link to="/login">로그인</Link>
      )}
    </nav>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Nav />
      <Routes>
        <Route path="/" element={<PostList />} />
        <Route path="/posts/new" element={<PostEditor />} />
        <Route path="/posts/:id" element={<PostDetail />} />
        <Route path="/posts/:id/edit" element={<PostEditor />} />
        <Route path="/guestbook" element={<Guestbook />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
