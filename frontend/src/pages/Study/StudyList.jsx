import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchStudyDocs } from '../../api/study';

function groupByCategory(docs) {
  const groups = new Map();
  docs.forEach((doc) => {
    const categories = doc.meta.category.length > 0 ? doc.meta.category : ['미분류'];
    const primary = categories[0];
    if (!groups.has(primary)) groups.set(primary, []);
    groups.get(primary).push(doc);
  });
  return Array.from(groups.entries());
}

function StudyList() {
  const [docs, setDocs] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStudyDocs()
      .then(setDocs)
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return (
      <div className="page">
        <p className="error-text">학습 문서를 불러오지 못했습니다: {error}</p>
      </div>
    );
  }

  if (docs === null) {
    return (
      <div className="page">
        <p className="hint-text">불러오는 중…</p>
      </div>
    );
  }

  const grouped = groupByCategory(docs);

  return (
    <div className="page">
      <span className="eyebrow">Study</span>
      <h1>공부한 것들</h1>
      {docs.length === 0 && <p className="hint-text">아직 등록된 학습 문서가 없습니다.</p>}
      {grouped.map(([category, items]) => (
        <section key={category} className="study-group">
          <h2>{category}</h2>
          {items.map((doc) => (
            <div key={doc.slug} className="post-item">
              <h3>
                <Link to={`/study/${doc.slug}`}>{doc.title || doc.slug}</Link>
              </h3>
              <span className="meta">
                {doc.meta.status || '상태 미기록'}
                {doc.meta.asOf ? ` · ${doc.meta.asOf}` : ''}
                {doc.meta.relatedRepo ? ` · ${doc.meta.relatedRepo}` : ''}
              </span>
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}

export default StudyList;
