import { useState } from 'react';
import { login } from '../../api/auth';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    login(username, password)
      // Nav의 로그인 상태는 마운트 시점에만 읽으므로, 전체 새로고침으로
      // 이동해 확실히 최신 상태를 반영한다(전역 상태 라이브러리는 이 규모엔 과함).
      .then(() => { window.location.href = '/'; })
      .catch((err) => {
        setError(err.message);
        setSubmitting(false);
      });
  };

  return (
    <div style={{ padding: '20px', maxWidth: '320px' }}>
      <h1>관리자 로그인</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <input
            type="text"
            placeholder="아이디"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div style={{ marginTop: '8px' }}>
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p style={{ color: 'crimson' }}>{error}</p>}
        <button type="submit" disabled={submitting} style={{ marginTop: '8px' }}>
          {submitting ? '로그인 중…' : '로그인'}
        </button>
      </form>
    </div>
  );
}

export default Login;
