import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import mermaid from 'mermaid';
import { fetchStudyDoc } from '../../api/study';

mermaid.initialize({ startOnLoad: false, theme: 'dark' });

// StudyProject 문서는 "../Infrastructure/Redis.md" 같은 상대 경로로 서로를 링크한다 —
// 이 앱의 라우트(/study/{category}/{slug})로 바꿔준다.
function resolveDocLink(href, currentCategory) {
  if (!href || href.startsWith('http') || href.endsWith('.flow.md')) return null;
  if (!href.endsWith('.md')) return null;

  const parts = href.split('/').filter((p) => p !== '.');
  let category = currentCategory;
  let rest = parts;
  if (parts[0] === '..') {
    rest = parts.slice(1);
    category = rest[0];
    rest = rest.slice(1);
  }
  const filename = rest[rest.length - 1];
  if (!filename) return null;
  const slug = filename.replace(/\.md$/, '');
  return `/study/${category}/${slug}`;
}

function extractMermaidSource(flowContent) {
  if (!flowContent) return null;
  // 문서가 CRLF로 저장돼 있어 \r까지 같이 지운다.
  const match = flowContent.replace(/\r/g, '').match(/```mermaid\n([\s\S]*?)```/);
  return match ? match[1].trim() : null;
}

function FlowChart({ source }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!source || !containerRef.current) return;
    let cancelled = false;
    const id = `flow-${Math.random().toString(36).slice(2)}`;
    mermaid.render(id, source).then(({ svg }) => {
      if (!cancelled && containerRef.current) {
        containerRef.current.innerHTML = svg;
      }
    });
    return () => {
      cancelled = true;
    };
  }, [source]);

  if (!source) return null;

  return (
    <section id="flowchart" style={{ marginTop: '32px' }}>
      <h2>플로우차트</h2>
      <div ref={containerRef} style={{ overflowX: 'auto' }} />
    </section>
  );
}

function DocLink({ href, currentCategory, children }) {
  const internal = resolveDocLink(href, currentCategory);
  if (internal) {
    return <Link to={internal}>{children}</Link>;
  }
  if (href && href.endsWith('.flow.md')) {
    return <a href="#flowchart">{children}</a>;
  }
  return (
    <a href={href} target="_blank" rel="noreferrer noopener">
      {children}
    </a>
  );
}

function StudyDoc() {
  const { category, slug } = useParams();
  const [doc, setDoc] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchStudyDoc(category, slug)
      .then(setDoc)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [category, slug]);

  if (loading) return <div className="page"><p className="hint-text">불러오는 중…</p></div>;

  if (error) {
    return (
      <div className="page">
        <p className="error-text">문서를 불러오지 못했습니다: {error}</p>
        <Link to="/study">← 스터디 목록으로</Link>
      </div>
    );
  }

  const mermaidSource = extractMermaidSource(doc.flowContent);

  return (
    <div className="page study-doc">
      <Link to="/study">← 스터디 목록으로</Link>
      <div style={{ marginTop: '18px' }}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            a: ({ href, children }) => (
              <DocLink href={href} currentCategory={category}>
                {children}
              </DocLink>
            ),
          }}
        >
          {doc.content}
        </ReactMarkdown>
      </div>
      <FlowChart source={mermaidSource} />
    </div>
  );
}

export default StudyDoc;
