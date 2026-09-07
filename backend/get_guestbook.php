<?php
// backend/get_guestbook.php
require 'response.php';
require 'db.php';

allow_cors();

$sql = "SELECT id, name, message, created_at FROM guestbook ORDER BY created_at DESC";
$result = $conn->query($sql);

$entries = [];

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $entries[] = $row;
    }
}

$conn->close();
send_json($entries);
?>
