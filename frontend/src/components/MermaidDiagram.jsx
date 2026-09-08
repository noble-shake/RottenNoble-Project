// frontend/src/components/MermaidDiagram.jsx
// StudyProject/VIEWER와 같은 패턴: 로컬로 번들한 mermaid.min.js(public/vendor)를
// window.mermaid로 가져와 .mermaid 컨테이너를 렌더링한다.
import { useEffect, useRef } from 'react';

function MermaidDiagram({ source }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !window.mermaid) return;

    el.removeAttribute('data-processed');
    el.textContent = source;

    try {
      window.mermaid.run({ nodes: [el] });
    } catch (e) {
      // 파싱 실패해도 페이지 전체가 죽지 않도록 무시한다 — 원문 텍스트만 남는다.
    }
  }, [source]);

  return <div className="mermaid" ref={ref}>{source}</div>;
}

export default MermaidDiagram;
