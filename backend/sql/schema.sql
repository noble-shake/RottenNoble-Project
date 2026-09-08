-- backend/sql/schema.sql
-- 수동으로 반영하는 스키마 기록 (04_CURRENT_PROJECT.md §4 "DB 마이그레이션 방법: 수동 SQL").
-- 로컬 XAMPP와 NAS MariaDB 양쪽에 이 파일 기준으로 테이블이 있는지 맞춰 둔다.
-- 마이그레이션 도구는 아직 없음 — 테이블이 하나 더 늘어나면 도입을 검토한다.

CREATE TABLE IF NOT EXISTS posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS guestbook (
    id INT AUTO_INCREMENT PRIMARY KEY,
    -- 애플리케이션이 AES-256-GCM으로 암호화해서 저장한다(backend/lib/crypto.php, 2026-09-08).
    -- 평문 길이 제한(1~50자)은 create_guestbook_entry.php가 암호화 전에 검사하고, 암호화된
    -- 값 자체는 base64라 원래 길이보다 훨씬 길어지므로 TEXT로 둔다.
    name TEXT NOT NULL,
    message VARCHAR(500) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 마이그레이션(2026-09-08): 이 스키마보다 먼저 배포되어 guestbook 테이블이 이미 있다면
-- (CREATE TABLE IF NOT EXISTS라 위 정의가 적용되지 않는다) 아래 한 줄만 실행한다.
-- 기존 평문 name 값은 그대로 남아있어도 문제없다 — decrypt_field()가 'enc:v1:' 접두사가 없는
-- 값을 레거시 평문으로 인식해 그대로 반환하므로 별도 백필 없이 바로 호환된다.
-- ALTER TABLE guestbook MODIFY name TEXT NOT NULL;
