<?php
// backend/get_study_doc.php
// StudyProject 문서 하나의 원문(+ 있으면 .flow.md 플로우차트 companion)을 반환한다.
// 프런트가 마크다운/Mermaid를 그대로 클라이언트 사이드에서 렌더링한다 — 서버는 원문만 내려준다.
require 'response.php';
require __DIR__ . '/auth.php'; // redis_connect() 재사용
require __DIR__ . '/lib/study_docs.php';

allow_cors();

$slug = $_GET['slug'] ?? '';
if ($slug === '') {
    send_error('slug 파라미터가 필요합니다.', 400);
}

$root = study_project_root();
$path = resolve_study_doc_path($root, $slug);
if ($path === null || !is_file($path)) {
    send_error('문서를 찾을 수 없습니다.', 404);
}

// 파일 mtime을 캐시 키에 포함시켜, StudyProject가 갱신(git pull)되면 캐시가 자동으로 무효화된다.
$cacheKey = 'study_doc:' . md5($slug) . ':' . filemtime($path);

try {
    $redis = redis_connect();
    $cached = $redis->get($cacheKey);
    $redis->close();
    if ($cached !== null) {
        send_json(json_decode($cached, true));
    }
} catch (Throwable $e) {
    // Redis 없이도 문서 조회는 계속 동작해야 한다 — 캐시만 건너뛴다.
}

$parsed = parse_study_doc(file_get_contents($path));

$flowPath = preg_replace('/\.md$/', '.flow.md', $path);
$flow = is_file($flowPath) ? file_get_contents($flowPath) : null;

$data = [
    'slug' => $slug,
    'title' => $parsed['title'],
    'meta' => $parsed['meta'],
    'content' => file_get_contents($path),
    'flow' => $flow,
];

try {
    $redis = redis_connect();
    $redis->set($cacheKey, json_encode($data), 300);
    $redis->close();
} catch (Throwable $e) {
    // 캐시 저장 실패는 무시.
}

send_json($data);
