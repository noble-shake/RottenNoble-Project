# Rotten Noble

Synology NAS로 직접 운영하는 개인 포트폴리오 블로그(게시글 + 방명록).

- **프런트엔드**: React 19 + Vite (`frontend/`)
- **백엔드**: Spring Boot 4.1.1 (Java 21) — `backend-spring/`. PHP 백엔드(`backend/`)는 2026-09-08 이관 후 레거시로 보관 중
- **데이터베이스**: MariaDB 10
- **인증**: Redis opaque 세션 토큰 (관리자 1명)

## 로컬 실행

각 폴더의 README 참고:
- [`backend-spring/README.md`](backend-spring/README.md)
- [`frontend/README.md`](frontend/README.md)

## 배포

`rotten-noble.com`/`www.rotten-noble.com`은 NAS Web Station 정적 호스팅, 백엔드 API는
`api.rotten-noble.com` 서브도메인 + DSM 역방향 프록시로 Docker 컨테이너(`backend-spring/`)에 연결.
상세 절차는 [`backend-spring/README.md`](backend-spring/README.md) 참고.
