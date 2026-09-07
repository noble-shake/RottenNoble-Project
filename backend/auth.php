<?php
// backend/auth.php
// 관리자 세션 검증 공통 헬퍼. RottenNoble-HttpServer/TCPServer와 같은 Redis
// 인스턴스에 "admin_session:{token} -> 'admin'" 형태로 저장한다(같은 SET ... EX
// 패턴). 관리자는 1명뿐이라 Firebase 없이 PHP가 직접 비밀번호를 확인하고
// 세션 토큰만 그 Redis에 심는다 — 개인 포폴 규모에 Firebase 로그인 UI까지
// 새로 붙이는 건 과함.

require_once __DIR__ . '/lib/redis_client.php';

function redis_config(): array
{
    static $config = null;
    if ($config === null) {
        $full = require __DIR__ . '/config.local.php';
        $config = $full['redis'] ?? ['host' => 'localhost', 'port' => 6379];
    }
    return $config;
}

function redis_connect(): RedisClient
{
    $cfg = redis_config();
    return new RedisClient($cfg['host'], $cfg['port']);
}

function get_authorization_header(): ?string
{
    if (!empty($_SERVER['HTTP_AUTHORIZATION'])) {
        return $_SERVER['HTTP_AUTHORIZATION'];
    }
    // Apache가 기본적으로 Authorization 헤더를 PHP까지 전달하지 않는 경우가
    // 있어(mod_rewrite/CGI 설정에 따라 다름) REDIRECT_ 접두 버전도 같이 본다.
    if (!empty($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        return $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    }
    if (function_exists('getallheaders')) {
        foreach (getallheaders() as $name => $value) {
            if (strcasecmp($name, 'Authorization') === 0) {
                return $value;
            }
        }
    }
    return null;
}

// 실패하면 send_error()로 즉시 응답하고 종료한다(response.php 필요).
function require_admin(): void
{
    $header = get_authorization_header();

    if (!$header || !preg_match('/^Bearer\s+(.+)$/', $header, $m)) {
        send_error('로그인이 필요합니다.', 401);
    }

    $token = $m[1];

    try {
        $redis = redis_connect();
        $value = $redis->get("admin_session:$token");
        $redis->close();
    } catch (Throwable $e) {
        send_error('세션 저장소 연결 실패: ' . $e->getMessage(), 500);
    }

    if ($value !== 'admin') {
        send_error('세션이 유효하지 않거나 만료되었습니다.', 401);
    }
}
