<?php
// backend/create_post.php
require 'response.php';
require 'auth.php';
require 'db.php';

allow_cors(['POST']);

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    $conn->close();
    send_error('POST만 허용됩니다.', 405);
}

require_admin();

$body = json_decode(file_get_contents('php://input'), true);
$title = trim((string)($body['title'] ?? ''));
$content = trim((string)($body['content'] ?? ''));

if ($title === '' || mb_strlen($title) > 255) {
    $conn->close();
    send_error('제목은 1~255자여야 합니다.', 400);
}
if ($content === '') {
    $conn->close();
    send_error('내용을 입력하세요.', 400);
}

$stmt = $conn->prepare("INSERT INTO posts (title, content) VALUES (?, ?)");
$stmt->bind_param("ss", $title, $content);
$stmt->execute();
$newId = $stmt->insert_id;
$stmt->close();
$conn->close();

send_json(['id' => $newId, 'title' => $title, 'content' => $content], 201);
?>
