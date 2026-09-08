import { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import PostList from './pages/PostList/PostList';
import PostDetail from './pages/PostDetail/PostDetail';
import Guestbook from './pages/Guestbook/Guestbook';
import Login from './pages/Login/Login';
import PostEditor from './pages/PostEditor/PostEditor';
import StudyList from './pages/Study/StudyList';
import StudyDetail from './pages/Study/StudyDetail';
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
    <nav className="site-nav">
      <span className="brand">Rotten Noble</span>
      <Link to="/">게시판</Link>
      <Link to="/guestbook">방명록</Link>
      <Link to="/study">Study</Link>
      <span className="spacer" />
      {loggedIn ? (
        <>
          <Link to="/posts/new">글쓰기</Link>
          <button className="link" onClick={handleLogout}>로그아웃</button>
        </>
      ) : (
        <Link to="/login">로그인</Link>
      )}
    </nav>
  );
}

function App() {
  useEffect(() => {
    // Study 문서의 Mermaid 플로우차트를 렌더링하기 전에 한 번만 초기화해야 테마가 적용된다
    // (StudyProject/VIEWER와 같은 패턴). public/index.html이 vendor/mermaid.min.js를 로드한다.
    if (window.mermaid) {
      window.mermaid.initialize({ startOnLoad: false, theme: 'dark' });
    }
  }, []);

  return (
    <HashRouter>
      <Nav />
      <Routes>
        <Route path="/" element={<PostList />} />
        <Route path="/posts/new" element={<PostEditor />} />
        <Route path="/posts/:id" element={<PostDetail />} />
        <Route path="/posts/:id/edit" element={<PostEditor />} />
        <Route path="/guestbook" element={<Guestbook />} />
        <Route path="/login" element={<Login />} />
        <Route path="/study" element={<StudyList />} />
        <Route path="/study/*" element={<StudyDetail />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
