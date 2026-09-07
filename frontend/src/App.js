import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PostList from './pages/PostList/PostList';
import PostDetail from './pages/PostDetail/PostDetail';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PostList />} />
        <Route path="/posts/:id" element={<PostDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
