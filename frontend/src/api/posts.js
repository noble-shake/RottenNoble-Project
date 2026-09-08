import { authHeaders } from './auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, options);
  const body = await res.json();

  if (body.status !== 'ok') {
    throw new Error(body.message || '요청에 실패했습니다.');
  }

  return body.data;
}

export function fetchPosts() {
  return request('/posts');
}

export function fetchPost(id) {
  return request(`/posts/${encodeURIComponent(id)}`);
}

export function createPost({ title, content }) {
  return request('/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ title, content }),
  });
}

export function updatePost(id, { title, content }) {
  return request(`/posts/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ title, content }),
  });
}

export function deletePost(id) {
  return request(`/posts/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { ...authHeaders() },
  });
}
