const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export async function fetchGuestbook() {
  const res = await fetch(`${API_BASE_URL}/get_guestbook.php`);
  const body = await res.json();

  if (body.status !== 'ok') {
    throw new Error(body.message || '방명록을 불러오지 못했습니다.');
  }

  return body.data;
}

export async function createGuestbookEntry({ name, message }) {
  const res = await fetch(`${API_BASE_URL}/create_guestbook_entry.php`, {
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
