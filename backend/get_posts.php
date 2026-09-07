<?php
// backend/get_posts.php
include 'db.php';

header("Content-Type: application/json; charset=UTF-8");
// 공개 읽기 전용 엔드포인트라 와일드카드로 연다. 인증이 붙는 엔드포인트가 생기면
// 쿠키/자격증명이 오가므로 와일드카드 대신 명시적 origin 허용목록으로 바꿔야 한다.
header("Access-Control-Allow-Origin: *");

$sql = "SELECT id, title, content, created_at FROM posts ORDER BY created_at DESC";
$result = $conn->query($sql);

$posts = [];

if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $posts[] = $row;
    }
}

echo json_encode(["status" => "ok", "data" => $posts]);
$conn->close();
?>
