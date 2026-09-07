<?php
// backend/response.php
// 모든 엔드포인트가 반복하던 CORS/JSON 봉투 처리를 한 곳으로 뽑았다
// (Web/03_ARCHITECTURE.md §1 신호표 — 같은 코드가 3번째 파일에서도 반복돼 뽑음).

function allow_cors(array $methods = ['GET']): void
{
    // 공개 읽기/쓰기 엔드포인트 전용 — 인증(쿠키·토큰)이 붙는 엔드포인트가 생기면
    // 와일드카드 대신 명시적 origin 허용목록으로 바꿔야 한다 (MEMO-WEB-02).
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: ' . implode(', ', $methods) . ', OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');

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
