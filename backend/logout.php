<?php
// backend/logout.php
require 'response.php';
require 'auth.php';

allow_cors(['POST']);

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    send_error('POST만 허용됩니다.', 405);
}

$header = get_authorization_header();

if ($header && preg_match('/^Bearer\s+(.+)$/', $header, $m)) {
    try {
        $redis = redis_connect();
        $redis->del('admin_session:' . $m[1]);
        $redis->close();
    } catch (Throwable $e) {
        // 로그아웃은 세션 저장소가 잠깐 안 되더라도 클라이언트가 토큰을
        // 버리면 사실상 끝나므로, 여기서 실패해도 조용히 넘어간다.
    }
}

send_json(['loggedOut' => true]);
?>
