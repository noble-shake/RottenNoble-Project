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
    <div className="page page-narrow">
      <span className="eyebrow">Private</span>
      <h1>관리자 로그인</h1>
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="login-username">아이디</label>
          <input
            id="login-username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="login-password">비밀번호</label>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="error-text">{error}</p>}
        <button type="submit" disabled={submitting}>
          {submitting ? '로그인 중…' : '로그인'}
        </button>
      </form>
    </div>
  );
}

export default Login;
