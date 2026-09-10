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

## 머지 전 필수: 로컬 빌드 확인

`.github/workflows/deploy.yml`이 `develop` 브랜치 푸시(= PR 머지 포함)마다 자동으로 프로덕션에
빌드+배포한다 — **별도 스테이징 환경이 없다.** `develop`에 머지하는 순간 그게 곧 라이브 배포다.

그래서 PR을 `develop`에 머지하기 전에, 리뷰어(에이전트 세션 포함)는 반드시 로컬에서 직접 빌드해
컴파일 여부를 확인해야 한다 — diff만 보고 "맞겠지"로 넘기지 않는다:

```bash
# 프런트엔드 (Node.js 24+, deploy.yml과 맞춘다)
cd frontend && npm ci && npm run build

# 백엔드 (Java 21 + Maven)
cd backend-spring && ./mvnw clean package -DskipTests
```

두 명령 다 에러 없이 끝나야 머지 가능. 이 저장소 작업 세션에 Node/Java가 없다면 먼저 설치부터
한다(예: `winget install OpenJS.NodeJS`, `winget install EclipseAdoptium.Temurin.21.JDK`) — "이
세션엔 없어서 못 봤다"로 넘어가지 않는다.
