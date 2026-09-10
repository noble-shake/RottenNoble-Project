import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchStudyDocs } from '../../api/study';

const VIEW_MODE_STORAGE_KEY = 'rottennoble_study_view_mode';
// StudyProject/VIEWER/index.html의 프로젝트별 보기와 같은 라벨 — 두 곳에서 문구가 갈리지 않게 맞춘다.
const NO_PROJECT_GROUP = '프로젝트 무관(일반 개념)';

function groupByCategory(docs) {
  const groups = new Map();
  for (const doc of docs) {
    if (!groups.has(doc.category)) groups.set(doc.category, []);
    groups.get(doc.category).push(doc);
  }
  return groups;
}

// doc.repo는 StudyProject 문서 메타 "관련 레포지토리" 필드 값(백엔드 StudyDocService가 파싱) —
// 값이 없으면(순수 개념 학습 등) NO_PROJECT_GROUP으로 묶는다. 그 그룹만 항상 맨 뒤로 보낸다.
function groupByProject(docs) {
  const groups = new Map();
  for (const doc of docs) {
    const key = doc.repo || NO_PROJECT_GROUP;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(doc);
  }
  const sorted = [...groups.entries()].sort(([a], [b]) => {
    if (a === NO_PROJECT_GROUP) return 1;
    if (b === NO_PROJECT_GROUP) return -1;
    return a.localeCompare(b, 'en');
  });
  return new Map(sorted);
}

function readStoredViewMode() {
  try {
    return localStorage.getItem(VIEW_MODE_STORAGE_KEY) || 'category';
  } catch {
    return 'category';
  }
}

function StudyList() {
  const [docs, setDocs] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState(readStoredViewMode);

  useEffect(() => {
    fetchStudyDocs()
      .then(setDocs)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function handleModeChange(mode) {
    setViewMode(mode);
    try {
      localStorage.setItem(VIEW_MODE_STORAGE_KEY, mode);
    } catch {
      // 저장 실패해도 이번 세션의 보기 전환 자체는 계속 동작해야 한다.
    }
  }

  if (loading) return <div className="page"><p className="hint-text">불러오는 중…</p></div>;
  if (error) return <div className="page"><p className="error-text">불러오지 못했습니다: {error}</p></div>;

  const groups = viewMode === 'project' ? groupByProject(docs) : groupByCategory(docs);

  return (
    <div className="page">
      <span className="eyebrow">Study</span>
      <h1>스터디</h1>
      <p className="hint-text">이 프로젝트를 만들며 궁금해져서 파고든 주제들.</p>

      <div className="study-viewmode" role="tablist" aria-label="보기 방식">
        <button
          type="button"
          className={`study-modebtn${viewMode === 'category' ? ' active' : ''}`}
          role="tab"
          aria-selected={viewMode === 'category'}
          onClick={() => handleModeChange('category')}
        >
          기술 스택별
        </button>
        <button
          type="button"
          className={`study-modebtn${viewMode === 'project' ? ' active' : ''}`}
          role="tab"
          aria-selected={viewMode === 'project'}
          onClick={() => handleModeChange('project')}
        >
          프로젝트별
        </button>
      </div>

      {[...groups.entries()].map(([group, groupDocs]) => (
        <section key={group} style={{ marginTop: '28px' }}>
          <h2>{group}</h2>
          <ul>
            {groupDocs.map((doc) => (
              <li key={doc.slug}>
                <Link to={`/study/${doc.category}/${doc.slug}`}>{doc.title}</Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

export default StudyList;
