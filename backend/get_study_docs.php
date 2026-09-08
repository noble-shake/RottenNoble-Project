<?php
// backend/get_study_docs.php
// StudyProject 저장소의 학습 문서 목록을 반환한다 (카테고리/상태 메타데이터 포함).
// 원본은 StudyProject repo에만 있다 — 이 프로젝트 DB에는 아무것도 복제하지 않는다.
require 'response.php';
require __DIR__ . '/auth.php'; // redis_connect() 재사용
require __DIR__ . '/lib/study_docs.php';

allow_cors();

$root = study_project_root();
$cacheKey = 'study_docs:list';

try {
    $redis = redis_connect();
    $cached = $redis->get($cacheKey);
    $redis->close();
    if ($cached !== null) {
        send_json(json_decode($cached, true));
    }
} catch (Throwable $e) {
    // Redis 없이도 목록 조회는 계속 동작해야 한다 — 캐시만 건너뛴다.
}

$docs = [];
foreach (scan_study_docs($root) as $path) {
    $parsed = parse_study_doc(file_get_contents($path));
    $docs[] = [
        'slug' => study_doc_slug($root, $path),
        'title' => $parsed['title'],
        'meta' => $parsed['meta'],
        'hasFlow' => is_file(preg_replace('/\.md$/', '.flow.md', $path)),
    ];
}

try {
    $redis = redis_connect();
    // 목록은 개별 문서 mtime을 다 모아 키를 만들 필요 없이 짧은 TTL로 충분히
    // 최신성을 확보한다 (개별 문서는 get_study_doc.php가 mtime 기반 키로 캐시).
    $redis->set($cacheKey, json_encode($docs), 60);
    $redis->close();
} catch (Throwable $e) {
    // 캐시 저장 실패는 무시 — 다음 요청이 다시 스캔하면 된다.
}

send_json($docs);
