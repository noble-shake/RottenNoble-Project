// frontend/src/markdown/Markdown.jsx
// StudyProject 문서(사람이 읽는 "교재" 스타일 마크다운 — 헤딩/표/목록/인용/코드펜스/Mermaid)를
// 렌더링하기 위한 최소 구현. 프로젝트에 마크다운 npm 패키지가 없고(이 환경엔 node/npm이 없어
// package-lock.json을 안전하게 갱신할 수 없음), StudyProject/VIEWER도 이미 "의존성 없는" 접근을
// 택하고 있어 같은 방향으로 맞췄다. CommonMark 전체가 아니라 StudyProject 문서가 실제로 쓰는
// 문법만 지원한다.

function splitLines(text) {
  return text.replace(/\r\n/g, '\n').split('\n');
}

function isHr(line) {
  return /^(-{3,}|\*{3,}|_{3,})\s*$/.test(line.trim());
}

function isHeadingLine(line) {
  return /^#{1,6}\s+/.test(line);
}

function isFenceLine(line) {
  return /^```/.test(line);
}

function isQuoteLine(line) {
  return /^>\s?/.test(line);
}

function isListItemLine(line) {
  return /^(\s*)([-*]|\d+\.)\s+/.test(line);
}

function isTableSeparatorLine(line) {
  return line.includes('-') && /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/.test(line);
}

function splitTableRow(line) {
  let trimmed = line.trim();
  if (trimmed.startsWith('|')) trimmed = trimmed.slice(1);
  if (trimmed.endsWith('|')) trimmed = trimmed.slice(0, -1);
  return trimmed.split('|').map((cell) => cell.trim());
}

export function parseMarkdownBlocks(text) {
  const lines = splitLines(text);
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === '') {
      i++;
      continue;
    }

    if (isFenceLine(line)) {
      const lang = line.replace(/^```\s*/, '').trim();
      const codeLines = [];
      i++;
      while (i < lines.length && !isFenceLine(lines[i])) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // 닫는 펜스 건너뛰기
      blocks.push({ type: 'code', lang, content: codeLines.join('\n') });
      continue;
    }

    if (isHr(line)) {
      blocks.push({ type: 'hr' });
      i++;
      continue;
    }

    if (isHeadingLine(line)) {
      const m = line.match(/^(#{1,6})\s+(.*)$/);
      blocks.push({ type: 'heading', level: m[1].length, text: m[2].trim() });
      i++;
      continue;
    }

    if (line.includes('|') && i + 1 < lines.length && isTableSeparatorLine(lines[i + 1])) {
      const header = splitTableRow(line);
      i += 2;
      const rows = [];
      while (i < lines.length && lines[i].trim() !== '' && lines[i].includes('|')) {
        rows.push(splitTableRow(lines[i]));
        i++;
      }
      blocks.push({ type: 'table', header, rows });
      continue;
    }

    if (isQuoteLine(line)) {
      const quoteLines = [];
      while (i < lines.length && isQuoteLine(lines[i])) {
        quoteLines.push(lines[i].replace(/^>\s?/, ''));
        i++;
      }
      blocks.push({ type: 'blockquote', text: quoteLines.join(' ') });
      continue;
    }

    if (isListItemLine(line)) {
      const firstMarker = line.match(/^(\s*)([-*]|\d+\.)\s+(.*)$/);
      const ordered = /^\d+\.$/.test(firstMarker[2]);
      const items = [];
      let current = firstMarker[3];
      i++;
      while (i < lines.length) {
        const l = lines[i];
        if (l.trim() === '') break;
        const itemMatch = l.match(/^(\s*)([-*]|\d+\.)\s+(.*)$/);
        if (itemMatch) {
          items.push(current);
          current = itemMatch[3];
        } else if (/^\s+\S/.test(l)) {
          current += ' ' + l.trim();
        } else {
          break;
        }
        i++;
      }
      items.push(current);
      blocks.push({ type: 'list', ordered, items });
      continue;
    }

    const paraLines = [line];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !isHr(lines[i]) &&
      !isHeadingLine(lines[i]) &&
      !isFenceLine(lines[i]) &&
      !isQuoteLine(lines[i]) &&
      !isListItemLine(lines[i]) &&
      !(lines[i].includes('|') && i + 1 < lines.length && isTableSeparatorLine(lines[i + 1]))
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    blocks.push({ type: 'paragraph', text: paraLines.join(' ') });
  }

  return blocks;
}

function parseInline(text, keyPrefix) {
  const nodes = [];
  let key = 0;
  const pattern = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\[[^\]]+\]\([^)]+\))|(\*[^*]+\*)|(_[^_]+_)/g;
  let lastIndex = 0;
  let m;

  while ((m = pattern.exec(text)) !== null) {
    if (m.index > lastIndex) {
      nodes.push(text.slice(lastIndex, m.index));
    }
    const token = m[0];
    const k = `${keyPrefix}-i${key++}`;

    if (token.startsWith('`')) {
      nodes.push(<code key={k}>{token.slice(1, -1)}</code>);
    } else if (token.startsWith('**')) {
      nodes.push(<strong key={k}>{parseInline(token.slice(2, -2), k)}</strong>);
    } else if (token.startsWith('[')) {
      const linkMatch = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      const href = linkMatch[2];
      const isInternal = href.startsWith('#');
      nodes.push(
        <a key={k} href={href} {...(isInternal ? {} : { target: '_blank', rel: 'noreferrer' })}>
          {linkMatch[1]}
        </a>
      );
    } else {
      nodes.push(<em key={k}>{token.slice(1, -1)}</em>);
    }
    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

function Table({ blockKey, header, rows }) {
  return (
    <div className="study-table-wrap">
      <table>
        <thead>
          <tr>
            {header.map((h, idx) => (
              <th key={`${blockKey}-h${idx}`}>{parseInline(h, `${blockKey}-h${idx}`)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ridx) => (
            <tr key={`${blockKey}-r${ridx}`}>
              {row.map((cell, cidx) => (
                <td key={`${blockKey}-r${ridx}-c${cidx}`}>
                  {parseInline(cell, `${blockKey}-r${ridx}-c${cidx}`)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// renderCode(block, key)를 넘기면 코드 블록(특히 lang === 'mermaid')을 커스텀 렌더링할 수 있다.
// 넘기지 않거나 null을 반환하면 기본 <pre><code>로 그린다.
function Markdown({ text, renderCode }) {
  const blocks = parseMarkdownBlocks(text || '');

  return (
    <>
      {blocks.map((block, idx) => {
        const key = `b${idx}`;

        switch (block.type) {
          case 'heading': {
            // 본문 헤딩은 페이지가 이미 그리는 문서 제목(h1)과 겹치지 않도록 한 단계 낮춘다.
            const HeadingTag = `h${Math.min(block.level + 1, 6)}`;
            return <HeadingTag key={key}>{parseInline(block.text, key)}</HeadingTag>;
          }
          case 'hr':
            return <hr key={key} />;
          case 'blockquote':
            return <blockquote key={key}>{parseInline(block.text, key)}</blockquote>;
          case 'code': {
            const custom = renderCode ? renderCode(block, key) : null;
            if (custom) return custom;
            return (
              <pre key={key}>
                <code>{block.content}</code>
              </pre>
            );
          }
          case 'table':
            return <Table key={key} blockKey={key} header={block.header} rows={block.rows} />;
          case 'list': {
            const ListTag = block.ordered ? 'ol' : 'ul';
            return (
              <ListTag key={key}>
                {block.items.map((item, i2) => (
                  <li key={`${key}-i${i2}`}>{parseInline(item, `${key}-i${i2}`)}</li>
                ))}
              </ListTag>
            );
          }
          case 'paragraph':
          default:
            return <p key={key}>{parseInline(block.text, key)}</p>;
        }
      })}
    </>
  );
}

export default Markdown;
