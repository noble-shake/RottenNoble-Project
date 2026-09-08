<?php
// backend/lib/crypto.php
// 방명록 이름처럼 DB에 저장되는 개인정보를 AES-256-GCM으로 암호화/복호화한다. DB가 통째로
// 유출돼도 이름만큼은 키 없이는 읽을 수 없게 하는 것이 목적 — message는 애초에 방문자가 공개
// 게시판에 쓰는 글이라 암호화 대상에 넣지 않았다.
//
// 키는 backend/config.local.php의 field_encryption_key(base64, 32바이트)에서 읽는다.
// `openssl rand -base64 32` 한 번으로 생성해서 넣는다 — 키를 바꾸면 그 전에 암호화된 값은
// 복호화가 안 되므로(회전하려면 재암호화 스크립트가 별도로 필요), 처음 한 번 정하면 함부로 안 바꾼다.

// 실패하면 send_error()로 즉시 응답하고 종료한다(response.php를 먼저 require한 스크립트에서만 호출).
function field_encryption_key(): string
{
    static $key = null;
    if ($key === null) {
        $config = require __DIR__ . '/../config.local.php';
        $b64 = $config['field_encryption_key'] ?? '';
        $decoded = $b64 !== '' ? base64_decode($b64, true) : false;
        if ($decoded === false || strlen($decoded) !== 32) {
            send_error('field_encryption_key가 설정되지 않았거나 올바르지 않습니다 (config.local.php).', 500);
        }
        $key = $decoded;
    }
    return $key;
}

function encrypt_field(string $plaintext): string
{
    $iv = random_bytes(12); // GCM 표준 96비트 nonce
    $tag = '';
    $ciphertext = openssl_encrypt($plaintext, 'aes-256-gcm', field_encryption_key(), OPENSSL_RAW_DATA, $iv, $tag);
    if ($ciphertext === false) {
        throw new RuntimeException('필드 암호화 실패');
    }
    // "enc:v1:" 접두사로 암호화 도입 이전의 레거시 평문 값과 구분한다.
    return 'enc:v1:' . base64_encode($iv . $tag . $ciphertext);
}

// 접두사가 없으면 암호화 도입 전에 저장된 레거시 평문 값으로 보고 그대로 반환한다 —
// 기존 배포 데이터를 깨뜨리지 않기 위한 하위 호환.
function decrypt_field(string $stored): string
{
    if (strpos($stored, 'enc:v1:') !== 0) {
        return $stored;
    }

    $raw = base64_decode(substr($stored, 7), true);
    if ($raw === false || strlen($raw) < 28) {
        return $stored;
    }

    $iv = substr($raw, 0, 12);
    $tag = substr($raw, 12, 16);
    $ciphertext = substr($raw, 28);

    $plaintext = openssl_decrypt($ciphertext, 'aes-256-gcm', field_encryption_key(), OPENSSL_RAW_DATA, $iv, $tag);
    return $plaintext === false ? $stored : $plaintext;
}
