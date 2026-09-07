import { fetchPosts, fetchPost } from './api/posts';

// App.js(및 그 하위 페이지)는 react-router-dom을 가져오는데, CRA(react-scripts 5)에
// 번들된 Jest는 아직 package.json "exports" 맵을 지원하지 않아 react-router-dom
// 최신 버전을 import하는 순간 테스트 자체가 깨진다(Web/08_PITFALLS.md §2). 그래서
// 라우터를 거치지 않는 모듈만 여기서 검증한다 — 화면 단위 테스트는 CRA를 벗어나거나
// Jest 설정을 직접 오버라이드할 도구(craco 등)를 도입하기 전까지 보류한다.
test('posts api exposes fetchPosts and fetchPost', () => {
  expect(typeof fetchPosts).toBe('function');
  expect(typeof fetchPost).toBe('function');
});
