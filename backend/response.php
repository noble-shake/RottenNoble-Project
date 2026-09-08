<?php
// backend/response.php
// 모든 엔드포인트가 반복하던 CORS/JSON 봉투 처리를 한 곳으로 뽑았다
// (Web/03_ARCHITECTURE.md §1 신호표 — 같은 코드가 3번째 파일에서도 반복돼 뽑음).

// 2026-09-08까지 전 엔드포인트가 와일드카드(`*`)를 썼다 — MEMO-WEB-02가 "인증 붙는 엔드포인트에
// 그대로 복사하면 안 된다"고 경고했던 바로 그 항목. 헤더 토큰 인증이라 CSRF엔 원래도 안전했지만
// (StudyProject의 CORS.md 참고), 스캐너가 이것저것 찔러보는 걸 본 뒤 명시적 origin 허용목록으로
// 좁혔다 — 방어 심층화 차원.
const ALLOWED_ORIGINS = [
    'https://rotten-noble.com',
    'https://www.rotten-noble.com',
    'http://localhost:3000', // 프런트 로컬 개발 서버(npm start)
];

function allow_cors(array $methods = ['GET']): void
{
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if (in_array($origin, ALLOWED_ORIGINS, true)) {
        header('Access-Control-Allow-Origin: ' . $origin);
    }
    header('Vary: Origin');
    header('Access-Control-Allow-Methods: ' . implode(', ', $methods) . ', OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');

    if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}

function send_json($data, int $httpCode = 200): void
{
    header('Content-Type: application/json; charset=UTF-8');
    http_response_code($httpCode);
    echo json_encode(['status' => 'ok', 'data' => $data]);
    exit;
}

function send_error(string $message, int $httpCode = 400): void
{
    header('Content-Type: application/json; charset=UTF-8');
    http_response_code($httpCode);
    echo json_encode(['status' => 'error', 'message' => $message]);
    exit;
}
