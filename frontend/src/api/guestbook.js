const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function fetchGuestbook() {
  const res = await fetch(`${API_BASE_URL}/guestbook`);
  const body = await res.json();

  if (body.status !== 'ok') {
    throw new Error(body.message || '방명록을 불러오지 못했습니다.');
  }

  return body.data;
}

export async function createGuestbookEntry({ name, message }) {
  const res = await fetch(`${API_BASE_URL}/guestbook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, message }),
  });
  const body = await res.json();

  if (body.status !== 'ok') {
    throw new Error(body.message || '방명록 등록에 실패했습니다.');
  }

  return body.data;
}
