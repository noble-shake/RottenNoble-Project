# RottenNoble Backend (Spring Boot)

PHP 백엔드(`../backend`)를 대체하는 Spring Boot 이관본. 엔드포인트는 REST 컨벤션(`/api/posts`, `/api/guestbook`, `/api/auth/*`, `/api/health`)으로 재설계했고, 응답 봉투(`{status:'ok'|'error', data|message}')는 기존 PHP와 동일하게 유지한다.

## 로컬 실행

1. `src/main/resources/application-local.example.yml`을 `application-local.yml`로 복사(이미 돼 있으면 생략) — DB/Redis 접속정보와 관리자 계정 해시를 채운다. 이 파일은 `.gitignore`에 등록되어 있다.
2. XAMPP MariaDB 기동 (`RottenNobleDB` 스키마가 이미 있어야 함 — 기존 PHP 프로젝트와 로컬 DB를 공유한다)
3. 로컬 Redis: `docker compose -f docker-compose.local.yml up -d`
4. `./mvnw spring-boot:run` (또는 `mvn spring-boot:run`)
5. `curl http://localhost:8080/api/health`

## 빌드/도커

```bash
./mvnw clean package -DskipTests
docker build -t rottennoble-backend .
```

## NAS 배포 (요약)

`application-prod.yml`은 전부 환경변수로 값을 주입받는다 — 컨테이너 실행 시 `-e`로 넘긴다:

```bash
docker run -d --name rottennoble-backend \
  -p 8080:8080 \
  -e SPRING_PROFILES_ACTIVE=prod \
  -e DB_HOST=<NAS LAN IP> -e DB_USER=<...> -e DB_PASSWORD=<...> \
  -e REDIS_HOST=<NAS LAN IP> \
  -e ADMIN_USERNAME=<...> -e ADMIN_PASSWORD_HASH=<...> \
  rottennoble-backend
```

**서브도메인 방식**(DSM 7.1.1 역방향 프록시가 경로 기반 라우팅을 지원하지 않아 채택 — 도메인:포트 단위로만 매핑 가능):

1. 가비아 DNS 관리툴에서 A레코드 `api` → NAS 공인 IP 추가 (기존 `@`/`www`와 동일한 IP)
2. DSM 제어판 > 보안 > 인증서에서 기존 `rotten-noble.com` 인증서를 갱신하며 SAN에 `api.rotten-noble.com` 추가(또는 별도 인증서 발급)
3. DSM 제어판 > 로그인 포털 > 고급 > 역방향 프록시: Source `api.rotten-noble.com:443` → Destination `localhost:8080`
4. `curl https://api.rotten-noble.com/api/health` 외부 접속 확인
5. 프런트는 이미 `.env.production`이 `https://api.rotten-noble.com/api`를 가리키도록 맞춰 재빌드해뒀다 — 기존 정적 배포 절차(`npm run build` → `dist/` scp)로 다시 올리면 된다.
