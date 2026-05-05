<?php
error_reporting(0); // 에러 출력 끔
include 'db.php';

header("Content-Type: application/json");

$sql = "SELECT * FROM posts ORDER BY created_at DESC";
$result = $conn->query($sql);

$posts = [];

if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $posts[] = $row;
    }
}

echo json_encode($posts);
$conn->close();
?>