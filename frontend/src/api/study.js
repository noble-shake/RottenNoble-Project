const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

async function request(path) {
  const res = await fetch(`${API_BASE_URL}${path}`);
  const body = await res.json();

  if (body.status !== 'ok') {
    throw new Error(body.message || '요청에 실패했습니다.');
  }

  return body.data;
}

export function fetchStudyDocs() {
  return request('/get_study_docs.php');
}

export function fetchStudyDoc(slug) {
  return request(`/get_study_doc.php?slug=${encodeURIComponent(slug)}`);
}
