<?php
// backend/db.php
$host = "localhost"; // NAS에 올렸을 때는 보통 localhost 혹은 127.0.0.1
$user = "root";
$pass = "Noblessoblige123!@#"; 
$db_name = "RottenNobleDB";

$conn = new mysqli($host, $user, $pass, $db_name);

if ($conn->connect_error) {
    die(json_encode(["error" => "DB 연결 실패: " . $conn->connect_error]));
}

// 한글 깨짐 방지
$conn->set_charset("utf8mb4");
?>