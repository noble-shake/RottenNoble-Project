// frontend/src/utils/studyDoc.js
// StudyProject 문서 원문에서 "# 제목"과 메타데이터 블록(첫 `---` ~ 두 번째 `---`)을 잘라내
// 본문 마크다운만 남긴다. 제목/메타는 backend/lib/study_docs.php가 이미 구조화해서
// 따로 내려주므로(문서의 meta 필드), 화면에는 그 구조화된 값을 쓰고 본문에서는 중복 표시하지 않는다.
export function stripStudyDocFrontmatter(content) {
  if (!content) return '';

  const withoutTitle = content.replace(/^#[^\n]*\n/, '');
  const frontmatterMatch = withoutTitle.match(/^\s*\n?---[ \t]*\r?\n[\s\S]*?\r?\n---[ \t]*\r?\n/);

  if (frontmatterMatch) {
    return withoutTitle.slice(frontmatterMatch[0].length).trim();
  }

  return withoutTitle.trim();
}

// "같이 보기" 등에 쓰이는 StudyProject 내부 상대 링크(`../Security/Foo.md`, `./Bar.md`)를
// 문서 슬러그 기준으로 풀어 앱 내부 라우트(`#/study/ComputerScience/Security/Foo`)로 바꾼다.
// HashRouter라 앞에 `#`만 붙이면 클라이언트 라우팅으로 바로 이동한다(별도 <Link> 불필요).
function resolveRelativeStudySlug(currentSlug, relPath) {
  const currentDir = currentSlug.split('/').slice(0, -1);
  const parts = relPath.replace(/\.md$/, '').split('/');
  const stack = [...currentDir];

  parts.forEach((part) => {
    if (part === '.' || part === '') return;
    if (part === '..') stack.pop();
    else stack.push(part);
  });

  return stack.join('/');
}

export function linkifyRelativeStudyLinks(markdown, currentSlug) {
  if (!markdown) return markdown;
  return markdown.replace(/\]\((\.\.?\/[^)]+\.md)\)/g, (full, relPath) => {
    const slug = resolveRelativeStudySlug(currentSlug, relPath);
    return `](#/study/${slug})`;
  });
}
