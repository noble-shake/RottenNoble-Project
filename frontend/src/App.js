import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import PostList from './pages/PostList/PostList';
import PostDetail from './pages/PostDetail/PostDetail';
import Guestbook from './pages/Guestbook/Guestbook';

function App() {
  return (
    <BrowserRouter>
      <nav style={{ padding: '12px 20px', borderBottom: '1px solid #ccc' }}>
        <Link to="/" style={{ marginRight: '16px' }}>게시판</Link>
        <Link to="/guestbook">방명록</Link>
      </nav>
      <Routes>
        <Route path="/" element={<PostList />} />
        <Route path="/posts/:id" element={<PostDetail />} />
        <Route path="/guestbook" element={<Guestbook />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
