<?php
// backend/config.example.php
// 실제 값이 들어가는 backend/config.local.php의 템플릿입니다.
// 이 파일은 git에 커밋됩니다 — 여기에는 절대 실제 비밀번호를 쓰지 마세요.
//
// 사용법: 이 파일을 backend/config.local.php로 복사한 뒤 실제 값을 채우세요.
// config.local.php는 .gitignore에 등록되어 있어 git에 올라가지 않습니다.

return [
    'db_host' => 'localhost',
    'db_user' => 'root',
    'db_pass' => '',
    'db_name' => 'RottenNobleDB',
];
