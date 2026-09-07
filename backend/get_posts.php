<?php
// backend/get_posts.php
require 'response.php';
require 'db.php';

allow_cors();

$sql = "SELECT id, title, content, created_at FROM posts ORDER BY created_at DESC";
$result = $conn->query($sql);

$posts = [];

if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $posts[] = $row;
    }
}

$conn->close();
send_json($posts);
?>
