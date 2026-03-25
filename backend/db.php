<?php
// backend/db.php
$host = "localhost";
$user = "root";
$pass = ""; // XAMPP 기본값은 비어있음
$db_name = "my_database";

try {
    $conn = new mysqli($host, $user, $pass, $db_name);
    if ($conn->connect_error) {
        throw new Exception("연결 실패: " . $conn->connect_error);
    }
} catch (Exception $e) {
    // DB가 아직 없어도 에러 메시지만 출력하도록 설정
    $db_status = $e->getMessage();
}