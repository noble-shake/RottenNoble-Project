<?php
// backend/login.php
require 'response.php';
require 'auth.php';

allow_cors(['POST']);

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    send_error('POST만 허용됩니다.', 405);
}

$body = json_decode(file_get_contents('php://input'), true);
$username = trim((string)($body['username'] ?? ''));
$password = (string)($body['password'] ?? '');

$config = require __DIR__ . '/config.local.php';

$validUser = $username !== '' && $username === ($config['admin_user'] ?? null);
$validPass = $password !== '' && password_verify($password, $config['admin_password_hash'] ?? '');

if (!$validUser || !$validPass) {
    send_error('아이디 또는 비밀번호가 올바르지 않습니다.', 401);
}

$token = bin2hex(random_bytes(32));

try {
    $redis = redis_connect();
    $redis->set("admin_session:$token", 'admin', 86400);
    $redis->close();
} catch (Throwable $e) {
    send_error('세션 저장소 연결 실패: ' . $e->getMessage(), 500);
}

send_json(['token' => $token]);
?>
