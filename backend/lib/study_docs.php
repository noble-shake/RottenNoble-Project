<?php
// backend/lib/study_docs.php
// StudyProject 저장소(별도 git 체크아웃, backend/config.local.php의 study_project_path)에서
// 학습 문서를 읽어 파싱하는 공통 헬퍼. 콘텐츠 원본은 StudyProject repo에만 존재한다 —
// 계속 갱신되는 문서라 이 프로젝트 DB에 복제하면 금방 낡으므로 복제하지 않는다.

// 실패하면 send_error()로 즉시 응답하고 종료한다(response.php를 먼저 require한 스크립트에서만 호출).
function study_project_root(): string
{
    static $root = null;
    if ($root === null) {
        $config = require __DIR__ . '/../config.local.php';
        $path = $config['study_project_path'] ?? null;
        if (!$path || !is_dir($path)) {
            send_error('StudyProject 경로가 설정되지 않았거나 존재하지 않습니다 (config.local.php의 study_project_path).', 500);
        }
        $root = realpath($path);
    }
    return $root;
}

// "ComputerScience/Network/CORS" 같은 슬러그를 실제 .md 파일 경로로 바꾸고, 그 경로가
// $root 바깥으로 벗어나지 않는지 검증한다 (path traversal 방지).
function resolve_study_doc_path(string $root, string $slug): ?string
{
    $slug = str_replace('\\', '/', $slug);
    if ($slug === '' || strpos($slug, '..') !== false) {
        return null;
    }

    $candidate = $root . '/' . ltrim($slug, '/') . '.md';
    $real = realpath($candidate);
    if ($real === false) {
        return null;
    }

    $rootWithSep = $root . DIRECTORY_SEPARATOR;
    if (strncmp($real, $rootWithSep, strlen($rootWithSep)) !== 0) {
        return null;
    }

    return $real;
}

// ComputerScience/ 아래 모든 .md 파일을 찾는다. `_TEMPLATE.md`, `*.flow.md`, `VIEWER/`는 제외.
function scan_study_docs(string $root): array
{
    $csRoot = $root . '/ComputerScience';
    if (!is_dir($csRoot)) {
        return [];
    }

    $files = [];
    $iterator = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($csRoot, FilesystemIterator::SKIP_DOTS)
    );

    foreach ($iterator as $fileInfo) {
        if (!$fileInfo->isFile()) {
            continue;
        }
        $name = $fileInfo->getFilename();
        if (substr($name, -8) === '.flow.md') {
            continue;
        }
        if (substr($name, -3) !== '.md') {
            continue;
        }
        $files[] = $fileInfo->getPathname();
    }

    sort($files);
    return $files;
}

// 문서 맨 위 "# 제목"과, 첫 `---` ~ 두 번째 `---` 사이의 "- **필드**: 값" 메타데이터 블록을
// 파싱한다 (StudyProject/_TEMPLATE.md 양식).
function parse_study_doc(string $content): array
{
    $title = '';
    if (preg_match('/^#\s+(.+)$/m', $content, $m)) {
        $title = trim($m[1]);
    }

    $meta = [
        'category' => [],
        'status' => null,
        'asOf' => null,
        'relatedRepo' => null,
    ];

    if (preg_match('/^---[ \t]*$(.*?)^---[ \t]*$/ms', $content, $m)) {
        $block = $m[1];

        if (preg_match('/\*\*카테고리\*\*:\s*(.+)/u', $block, $mm)) {
            $meta['category'] = array_values(array_filter(array_map('trim', explode(',', $mm[1]))));
        }
        if (preg_match('/\*\*상태\*\*:\s*(.+)/u', $block, $mm)) {
            $meta['status'] = trim($mm[1]);
        }
        if (preg_match('/\*\*기준\s*시점\*\*:\s*(.+)/u', $block, $mm)) {
            $meta['asOf'] = trim($mm[1]);
        }
        if (preg_match('/\*\*관련\s*레포지토리\*\*:\s*(.+)/u', $block, $mm)) {
            $repo = trim($mm[1]);
            $meta['relatedRepo'] = ($repo === '-' || $repo === '') ? null : $repo;
        }
    }

    return ['title' => $title, 'meta' => $meta];
}

// 파일 경로를 study_project_root() 기준 슬러그("ComputerScience/Network/CORS")로 바꾼다.
function study_doc_slug(string $root, string $path): string
{
    $rel = str_replace('\\', '/', substr($path, strlen($root)));
    $rel = ltrim($rel, '/');
    return preg_replace('/\.md$/', '', $rel);
}
