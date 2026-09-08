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

    'redis' => [
        'host' => 'localhost',
        'port' => 6379,
    ],

    // password_hash('실제비밀번호', PASSWORD_BCRYPT)의 결과만 넣는다 — 평문 금지.
    'admin_user' => 'admin',
    'admin_password_hash' => '',

    // 방명록 이름 등 DB에 저장되는 개인정보를 AES-256-GCM으로 암호화하는 키(backend/lib/crypto.php).
    // `openssl rand -base64 32`로 한 번 생성해서 넣는다 — 나중에 바꾸면 그 전에 암호화된 값은
    // 복호화가 안 된다(재암호화 스크립트 없이는 키 회전 불가).
    'field_encryption_key' => '',
];
