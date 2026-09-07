import { useEffect, useState } from 'react';
import { fetchGuestbook, createGuestbookEntry } from '../../api/guestbook';

function Guestbook() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [submitError, setSubmitError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const loadEntries = () => {
    setLoading(true);
    fetchGuestbook()
      .then(setEntries)
      .catch((err) => setLoadError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(loadEntries, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitting(true);

    createGuestbookEntry({ name, message })
      .then(() => {
        setName('');
        setMessage('');
        loadEntries();
      })
      .catch((err) => setSubmitError(err.message))
      .finally(() => setSubmitting(false));
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>방명록</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <div>
          <input
            type="text"
            placeholder="이름"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={50}
            required
          />
        </div>
        <div style={{ marginTop: '8px' }}>
          <textarea
            placeholder="메시지"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={500}
            rows={3}
            required
          />
        </div>
        {submitError && <p style={{ color: 'crimson' }}>{submitError}</p>}
        <button type="submit" disabled={submitting} style={{ marginTop: '8px' }}>
          {submitting ? '등록 중…' : '남기기'}
        </button>
      </form>

      {loading && <p>불러오는 중…</p>}
      {loadError && <p>방명록을 불러오지 못했습니다: {loadError}</p>}
      {!loading && !loadError && entries.length === 0 && <p>아직 방명록이 없습니다.</p>}

      {entries.map((entry) => (
        <div key={entry.id} style={{ borderBottom: '1px solid #ccc', marginBottom: '10px', paddingBottom: '10px' }}>
          <strong>{entry.name}</strong>
          <p style={{ whiteSpace: 'pre-wrap' }}>{entry.message}</p>
          <small>{entry.created_at}</small>
        </div>
      ))}
    </div>
  );
}

export default Guestbook;
