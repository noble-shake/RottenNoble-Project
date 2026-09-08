package com.rottennoble.server.service;

import com.rottennoble.server.exception.ApiException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Duration;
import java.util.HexFormat;

// backend/auth.php의 require_admin()/redis_connect() 짝에 대응 — 같은 Redis 인스턴스에
// "admin_session:{token}" -> "admin" 형태로 저장하는 opaque 세션 토큰 방식을 그대로 유지한다
// (MEMO-WEB-04: 관리자 1명 규모엔 즉시 무효화가 되는 이 방식이 JWT보다 낫다는 결정 유지).
@Service
public class SessionService {

    private static final String SESSION_PREFIX = "admin_session:";

    private final StringRedisTemplate redis;

    public SessionService(StringRedisTemplate redis) {
        this.redis = redis;
    }

    public String createSession(String role, Duration ttl) {
        String token = generateToken();
        redis.opsForValue().set(SESSION_PREFIX + token, role, ttl);
        return token;
    }

    // 실패하면 ApiException(401)을 던진다 — 호출자(컨트롤러)는 그 이후 코드를 실행하지 않는다.
    public void requireAdmin(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            throw new ApiException("로그인이 필요합니다.", HttpStatus.UNAUTHORIZED);
        }

        String token = header.substring("Bearer ".length());
        String value = redis.opsForValue().get(SESSION_PREFIX + token);
        if (!"admin".equals(value)) {
            throw new ApiException("세션이 유효하지 않거나 만료되었습니다.", HttpStatus.UNAUTHORIZED);
        }
    }

    public void destroySession(String token) {
        try {
            redis.delete(SESSION_PREFIX + token);
        } catch (Exception e) {
            // 로그아웃은 세션 저장소가 잠깐 안 되더라도 클라이언트가 토큰을 버리면 사실상 끝나므로
            // 조용히 넘어간다(backend/logout.php와 동일한 방침).
        }
    }

    private String generateToken() {
        byte[] bytes = new byte[32];
        new SecureRandom().nextBytes(bytes);
        return HexFormat.of().formatHex(bytes);
    }
}
