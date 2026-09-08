package com.rottennoble.backend.service;

import com.rottennoble.backend.exception.UnauthorizedException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Duration;
import java.util.HexFormat;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

// PHP backend/auth.php(require_admin) + login.php + logout.php를 이관.
// 토큰 자체는 Redis "admin_session:{token}" -> "admin" 값이 있어야만 유효한 opaque
// 세션 토큰(JWT 아님) — 로그아웃 시 Redis DEL 한 번으로 즉시 무효화된다.
@Service
public class AdminSessionService {

    private static final String SESSION_KEY_PREFIX = "admin_session:";
    private static final Pattern BEARER_PATTERN = Pattern.compile("^Bearer\\s+(.+)$");
    private static final SecureRandom RANDOM = new SecureRandom();

    private final StringRedisTemplate redisTemplate;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Value("${admin.username}")
    private String adminUsername;

    @Value("${admin.password-hash}")
    private String adminPasswordHash;

    @Value("${admin.session-ttl-seconds}")
    private long sessionTtlSeconds;

    public AdminSessionService(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public String login(String username, String password) {
        boolean validUser = username != null && !username.isBlank() && username.equals(adminUsername);
        boolean validPass = password != null && !password.isEmpty() && passwordEncoder.matches(password, adminPasswordHash);

        if (!validUser || !validPass) {
            throw new UnauthorizedException("아이디 또는 비밀번호가 올바르지 않습니다.");
        }

        String token = generateToken();
        redisTemplate.opsForValue().set(SESSION_KEY_PREFIX + token, "admin", Duration.ofSeconds(sessionTtlSeconds));
        return token;
    }

    public void logout(String token) {
        if (token != null) {
            redisTemplate.delete(SESSION_KEY_PREFIX + token);
        }
    }

    public boolean isValidToken(String token) {
        return "admin".equals(redisTemplate.opsForValue().get(SESSION_KEY_PREFIX + token));
    }

    // Apache가 Authorization 헤더를 안 넘겨주는 경우까지 방어하던 PHP auth.php의
    // get_authorization_header()와 동일하게, 서블릿 컨테이너가 표준 헤더를 그대로
    // 넘겨주는 걸 전제로 Bearer 토큰만 파싱한다.
    public String extractToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header == null) {
            return null;
        }
        Matcher matcher = BEARER_PATTERN.matcher(header);
        return matcher.matches() ? matcher.group(1) : null;
    }

    private String generateToken() {
        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        return HexFormat.of().formatHex(bytes);
    }
}
