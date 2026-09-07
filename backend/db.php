<?php
// backend/db.php
// DB 접속 정보는 여기 직접 쓰지 않습니다 — backend/config.local.php(gitignore됨)에서 읽습니다.
// 로컬에서 처음 셋업하는 경우: backend/config.example.php를 backend/config.local.php로
// 복사한 뒤 실제 값을 채우세요.

$configPath = __DIR__ . '/config.local.php';

if (!file_exists($configPath)) {
    die(json_encode([
        "error" => "backend/config.local.php가 없습니다. config.example.php를 복사해서 만드세요.",
    ]));
}

$config = require $configPath;

$conn = new mysqli($config['db_host'], $config['db_user'], $config['db_pass'], $config['db_name']);

if ($conn->connect_error) {
    die(json_encode(["error" => "DB 연결 실패: " . $conn->connect_error]));
}

// 한글 깨짐 방지
$conn->set_charset("utf8mb4");
?>
