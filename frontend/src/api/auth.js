const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const TOKEN_KEY = 'rotten_admin_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function isLoggedIn() {
  return !!getToken();
}

export async function login(username, password) {
  const res = await fetch(`${API_BASE_URL}/login.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const body = await res.json();

  if (body.status !== 'ok') {
    throw new Error(body.message || '로그인에 실패했습니다.');
  }

  localStorage.setItem(TOKEN_KEY, body.data.token);
}

export async function logout() {
  const token = getToken();
  localStorage.removeItem(TOKEN_KEY);

  if (token) {
    await fetch(`${API_BASE_URL}/logout.php`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
  }
}

export function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
