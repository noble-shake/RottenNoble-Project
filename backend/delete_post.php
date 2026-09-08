<?php
// backend/delete_post.php
require 'response.php';
require 'auth.php';
require __DIR__ . '/lib/rate_limit.php';
require 'db.php';

allow_cors(['POST']);

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    $conn->close();
    send_error('POST만 허용됩니다.', 405);
}

rate_limit_check('admin_write', 60, 60);

require_admin();

$body = json_decode(file_get_contents('php://input'), true);
$id = $body['id'] ?? null;

if ($id === null || !ctype_digit((string)$id)) {
    $conn->close();
    send_error('id가 필요합니다.', 400);
}

$stmt = $conn->prepare("DELETE FROM posts WHERE id = ?");
$stmt->bind_param("i", $id);
$stmt->execute();
$affected = $stmt->affected_rows;
$stmt->close();
$conn->close();

if ($affected === 0) {
    send_error('게시글을 찾을 수 없습니다.', 404);
}

send_json(['id' => (int)$id, 'deleted' => true]);
?>
