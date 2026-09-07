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
    name VARCHAR(50) NOT NULL,
    message VARCHAR(500) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
