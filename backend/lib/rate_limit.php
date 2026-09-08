<?php
// backend/lib/rate_limit.php
// IP당 짧은 시간 창 안의 요청 횟수를 Redis INCR로 세어 제한한다 — 로그인 무차별 대입,
// 방명록 도배, 관리자 엔드포인트 남용 방지. Redis 연결이 안 되면 제한 없이 통과시킨다
// (rate limit이 로그인/방명록 자체의 가용성을 해치면 안 된다).
require_once __DIR__ . '/../auth.php'; // redis_connect() 재사용

function client_ip(): string
{
    // 공유기 포트포워딩 뒤에서도 실제 클라이언트 IP를 보려면 X-Forwarded-For를 먼저 본다
    // (Apache/리버스 프록시가 이 헤더를 채워주는 환경 기준 — 값이 없으면 REMOTE_ADDR로 대체).
    if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $parts = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
        return trim($parts[0]);
    }
    return $_SERVER['REMOTE_ADDR'] ?? 'unknown';
}

// 초과하면 send_error(429)로 즉시 응답하고 종료한다(response.php를 먼저 require한 스크립트에서만 호출).
function rate_limit_check(string $bucket, int $maxRequests, int $windowSeconds): void
{
    $key = 'rate_limit:' . $bucket . ':' . client_ip();

    try {
        $redis = redis_connect();
        $count = $redis->incr($key);
        if ($count === 1) {
            $redis->expire($key, $windowSeconds);
        }
        $redis->close();
    } catch (Throwable $e) {
        return;
    }

    if ($count > $maxRequests) {
        send_error('요청이 너무 많습니다. 잠시 후 다시 시도하세요.', 429);
    }
}
