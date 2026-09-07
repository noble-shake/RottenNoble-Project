<?php
// backend/create_guestbook_entry.php
require 'response.php';
require 'db.php';

allow_cors(['POST']);

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    $conn->close();
    send_error('POST만 허용됩니다.', 405);
}

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

$stmt = $conn->prepare("INSERT INTO guestbook (name, message) VALUES (?, ?)");
$stmt->bind_param("ss", $name, $message);
$stmt->execute();
$newId = $stmt->insert_id;
$stmt->close();
$conn->close();

send_json(['id' => $newId, 'name' => $name, 'message' => $message], 201);
?>
