import { authHeaders } from './auth';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, options);
  const body = await res.json();

  if (body.status !== 'ok') {
    throw new Error(body.message || '요청에 실패했습니다.');
  }

  return body.data;
}

export function fetchPosts() {
  return request('/get_posts.php');
}

export function fetchPost(id) {
  return request(`/get_post.php?id=${encodeURIComponent(id)}`);
}

export function createPost({ title, content }) {
  return request('/create_post.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ title, content }),
  });
}

export function updatePost(id, { title, content }) {
  return request('/update_post.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ id, title, content }),
  });
}

export function deletePost(id) {
  return request('/delete_post.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ id }),
  });
}
