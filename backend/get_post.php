<?php
// backend/get_post.php
require 'response.php';
require 'db.php';

allow_cors();

$id = $_GET['id'] ?? null;

if ($id === null || !ctype_digit((string)$id)) {
    $conn->close();
    send_error('id가 필요합니다.', 400);
}

$stmt = $conn->prepare("SELECT id, title, content, created_at FROM posts WHERE id = ?");
$stmt->bind_param("i", $id);
$stmt->execute();
$result = $stmt->get_result();
$post = $result->fetch_assoc();
$stmt->close();
$conn->close();

if (!$post) {
    send_error('게시글을 찾을 수 없습니다.', 404);
}

send_json($post);
?>
