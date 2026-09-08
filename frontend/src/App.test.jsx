import { render, screen } from '@testing-library/react';
import App from './App';
import { fetchPosts, fetchPost } from './api/posts';
import { fetchGuestbook, createGuestbookEntry } from './api/guestbook';

// CRA/Jest는 package.json의 exports 필드를 못 읽어 react-router-dom을 import하는 코드가
// 테스트에서만 깨졌었다(Web/08_PITFALLS.md §2) — Vite/Vitest로 옮기면서 우회하던 함수 존재
// 검증 대신 실제 <App/> 렌더 테스트로 정상화한다.
test('renders nav with brand and main links', () => {
  render(<App />);
  expect(screen.getByText('Rotten Noble')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: '게시판' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: '방명록' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: '로그인' })).toBeInTheDocument();
});

test('posts api exposes fetchPosts and fetchPost', () => {
  expect(typeof fetchPosts).toBe('function');
  expect(typeof fetchPost).toBe('function');
});

test('guestbook api exposes fetchGuestbook and createGuestbookEntry', () => {
  expect(typeof fetchGuestbook).toBe('function');
  expect(typeof createGuestbookEntry).toBe('function');
});
