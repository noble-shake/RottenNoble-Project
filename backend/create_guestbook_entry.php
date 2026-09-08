<?php
// backend/create_guestbook_entry.php
require 'response.php';
require __DIR__ . '/lib/rate_limit.php';
require __DIR__ . '/lib/crypto.php';
require 'db.php';

allow_cors(['POST']);

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    $conn->close();
    send_error('POST만 허용됩니다.', 405);
}

// 도배 방지 — IP당 1시간에 5건으로 제한한다.
rate_limit_check('guestbook_write', 5, 3600);

$body = json_decode(file_get_contents('php://input'), true);
$name = trim((string)($body['name'] ?? ''));
$message = trim((string)($body['message'] ?? ''));

// 스키마(backend/sql/schema.sql)의 컬럼 길이와 맞춘다.
if ($name === '' || mb_strlen($name) > 50) {
    $conn->close();
    send_error('이름은 1~50자여야 합니다.', 400);
}
if ($message === '' || mb_strlen($message) > 500) {
    $conn->close();
    send_error('메시지는 1~500자여야 합니다.', 400);
}

// DB가 통째로 유출돼도 이름은 키 없이 못 읽도록 저장 전에 암호화한다 — 길이 검증은 평문 기준으로
// 이미 끝났으니 여기서부터는 암호화된 값만 다룬다.
$encryptedName = encrypt_field($name);

$stmt = $conn->prepare("INSERT INTO guestbook (name, message) VALUES (?, ?)");
$stmt->bind_param("ss", $encryptedName, $message);
$stmt->execute();
$newId = $stmt->insert_id;
$stmt->close();
$conn->close();

send_json(['id' => $newId, 'name' => $name, 'message' => $message], 201);
?>
