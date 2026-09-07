<?php
// backend/get_post.php
include 'db.php';

header("Content-Type: application/json; charset=UTF-8");
// 공개 읽기 전용 엔드포인트라 와일드카드로 연다. 인증이 붙는 엔드포인트가 생기면
// 쿠키/자격증명이 오가므로 와일드카드 대신 명시적 origin 허용목록으로 바꿔야 한다.
header("Access-Control-Allow-Origin: *");

$id = $_GET['id'] ?? null;

if ($id === null || !ctype_digit((string)$id)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "id가 필요합니다."]);
    exit;
}

$stmt = $conn->prepare("SELECT id, title, content, created_at FROM posts WHERE id = ?");
$stmt->bind_param("i", $id);
$stmt->execute();
$result = $stmt->get_result();
$post = $result->fetch_assoc();

if (!$post) {
    http_response_code(404);
    echo json_encode(["status" => "error", "message" => "게시글을 찾을 수 없습니다."]);
    $stmt->close();
    $conn->close();
    exit;
}

echo json_encode(["status" => "ok", "data" => $post]);

$stmt->close();
$conn->close();
?>
