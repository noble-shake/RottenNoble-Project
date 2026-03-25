<?php
// backend/index.php
header("Content-Type: application/json; charset=UTF-8");

echo json_encode([
    "status" => "online",
    "message" => "Synology NAS 프로젝트 백엔드 서버가 작동 중입니다.",
    "server_time" => date("Y-m-d H:i:s")
]);