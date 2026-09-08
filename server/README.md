# server — Java/Spring Boot 백엔드 (PHP 대체)

`backend/`(PHP)를 대체하는 새 백엔드. 스키마는 그대로 재사용한다 — `backend/sql/schema.sql`의
`posts`/`guestbook` 테이블을 그대로 쓰고, Hibernate가 스키마를 새로 만들거나 바꾸지 않는다
(`ddl-auto: validate`, 시작 시 엔티티 매핑이 기존 테이블과 맞는지만 확인).

## 이 환경에서 확인 못 한 것

이 프로젝트는 java/maven이 없는 환경에서 작성됐다 — **컴파일 자체를 한 번도 못 해봤다.**
로컬에서 반드시 먼저 확인할 것:

```
cd server
cp .env.example .env   # 값 채우기
docker compose --env-file .env up --build
```

또는 로컬에 JDK 17 + Maven이 있다면:

```
cd server
mvn spring-boot:run
```

## 기존 PHP와의 관계

- **API 계약이 다르다.** PHP는 `get_posts.php`/`create_post.php`처럼 파일 하나 = 엔드포인트
  하나, id는 body에 넣어 전부 POST였다. 이 서버는 `/api/posts`(GET/POST),
  `/api/posts/{id}`(GET/PUT/DELETE) 같은 REST 관례를 쓴다 — 기존 CRA 프런트는 이 서버를 바로
  호출할 수 없다. 새 계약에 맞춘 프런트 API 클라이언트는 Phase 2(Vite 마이그레이션)에서
  같이 바꾼다.
- **관리자 비밀번호 해시는 그대로 재사용 가능하다.** `password_hash()`(PHP, bcrypt)로 만든
  해시를 `ADMIN_PASSWORD_HASH`에 그대로 넣으면 `BCryptPasswordEncoder`가 검증한다 — bcrypt는
  `$2y$`/`$2a$`/`$2b$` 표기만 다를 뿐 같은 알고리즘이라 호환된다(로컬에서 직접 확인 필요).
- **방명록 암호화 키도 그대로 재사용 가능하다.** `backend/lib/crypto.php`와 정확히 같은 저장
  포맷(`enc:v1:` + base64(iv+tag+ciphertext))을 쓰므로, 같은 `FIELD_ENCRYPTION_KEY`를 쓰면
  PHP가 암호화해둔 기존 방명록 이름도 이 서버가 그대로 복호화한다.
- **CORS/rate limiting/암호화는 PHP 쪽에서 이미 한 번 강화해둔 버전을 그대로 이식했다** — 2026-09-08
  스캔/프로빙 대응으로 PHP에 추가한 것과 동일한 정책(로그인 5분 5회, 방명록 1시간 5건, 관리자
  쓰기 분당 60회, 명시적 origin 허용목록)을 처음부터 갖고 시작한다.

## StudyProject 문서

이 스택 전환의 배경과 PHP와의 차이점은 StudyProject에도 정리한다(진행 중) —
`ComputerScience/WebDevelopment/Spring-Boot.md` 등.
