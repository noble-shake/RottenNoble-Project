import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchStudyDocs } from '../../api/study';

function groupByCategory(docs) {
  const groups = new Map();
  for (const doc of docs) {
    if (!groups.has(doc.category)) groups.set(doc.category, []);
    groups.get(doc.category).push(doc);
  }
  return groups;
}

function StudyList() {
  const [docs, setDocs] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudyDocs()
      .then(setDocs)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page"><p className="hint-text">불러오는 중…</p></div>;
  if (error) return <div className="page"><p className="error-text">불러오지 못했습니다: {error}</p></div>;

  const groups = groupByCategory(docs);

  return (
    <div className="page">
      <span className="eyebrow">Study</span>
      <h1>스터디</h1>
      <p className="hint-text">이 프로젝트를 만들며 궁금해져서 파고든 주제들.</p>

      {[...groups.entries()].map(([category, categoryDocs]) => (
        <section key={category} style={{ marginTop: '28px' }}>
          <h2>{category}</h2>
          <ul>
            {categoryDocs.map((doc) => (
              <li key={doc.slug}>
                <Link to={`/study/${category}/${doc.slug}`}>{doc.title}</Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

export default StudyList;
