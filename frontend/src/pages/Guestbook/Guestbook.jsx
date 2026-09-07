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
    <div className="page">
      <span className="eyebrow">Guestbook</span>
      <h1>방명록</h1>

      <form onSubmit={handleSubmit} className="card" style={{ marginBottom: '28px' }}>
        <div className="field">
          <label htmlFor="gb-name">이름</label>
          <input
            id="gb-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={50}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="gb-message">메시지</label>
          <textarea
            id="gb-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={500}
            rows={3}
            required
          />
        </div>
        {submitError && <p className="error-text">{submitError}</p>}
        <button type="submit" disabled={submitting}>
          {submitting ? '등록 중…' : '남기기'}
        </button>
      </form>

      {loading && <p className="hint-text">불러오는 중…</p>}
      {loadError && <p className="error-text">방명록을 불러오지 못했습니다: {loadError}</p>}
      {!loading && !loadError && entries.length === 0 && <p className="hint-text">아직 방명록이 없습니다.</p>}

      {entries.map((entry) => (
        <div key={entry.id} className="post-item">
          <strong>{entry.name}</strong>
          <p style={{ whiteSpace: 'pre-wrap', margin: '6px 0' }}>{entry.message}</p>
          <span className="meta">{entry.created_at}</span>
        </div>
      ))}
    </div>
  );
}

export default Guestbook;
