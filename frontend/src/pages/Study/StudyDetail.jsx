import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchStudyDoc } from '../../api/study';
import Markdown from '../../markdown/Markdown';
import MermaidDiagram from '../../components/MermaidDiagram';
import { stripStudyDocFrontmatter, linkifyRelativeStudyLinks } from '../../utils/studyDoc';

function renderCode(block, key) {
  if (block.lang === 'mermaid') {
    return <MermaidDiagram key={key} source={block.content} />;
  }
  return null;
}

function StudyDetail() {
  const params = useParams();
  const slug = params['*'];
  const [doc, setDoc] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setDoc(null);
    fetchStudyDoc(slug)
      .then(setDoc)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="page page-wide">
        <p className="hint-text">불러오는 중…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page page-wide">
        <p className="error-text">문서를 불러오지 못했습니다: {error}</p>
        <Link to="/study">← Study 목록으로</Link>
      </div>
    );
  }

  const body = linkifyRelativeStudyLinks(stripStudyDocFrontmatter(doc.content), doc.slug);

  return (
    <div className="page page-wide">
      <Link to="/study">← Study 목록으로</Link>
      <span className="eyebrow" style={{ marginTop: '18px' }}>
        {doc.meta.category.join(', ') || 'Study'}
      </span>
      <h1>{doc.title || doc.slug}</h1>
      <span className="meta">
        {doc.meta.status || '상태 미기록'}
        {doc.meta.asOf ? ` · ${doc.meta.asOf}` : ''}
        {doc.meta.relatedRepo ? ` · ${doc.meta.relatedRepo}` : ''}
      </span>

      <div className="study-body">
        <Markdown text={body} renderCode={renderCode} />
      </div>

      {doc.flow && (
        <div className="study-flow card">
          <h2>플로우차트</h2>
          <Markdown text={doc.flow} renderCode={renderCode} />
        </div>
      )}
    </div>
  );
}

export default StudyDetail;
