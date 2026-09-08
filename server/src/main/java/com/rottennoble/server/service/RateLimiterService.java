package com.rottennoble.server.service;

import com.rottennoble.server.exception.ApiException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.Duration;

// backend/lib/rate_limit.php와 같은 알고리즘(Redis INCR + 첫 요청에만 EXPIRE = 고정 창)을 쓴다.
// Redis 연결 자체가 안 되면 제한 없이 통과시킨다 — rate limiting이 로그인/방명록의 가용성을
// 해치면 안 된다는 원칙은 PHP 쪽과 동일하게 유지한다.
@Service
public class RateLimiterService {

    private final StringRedisTemplate redis;

    public RateLimiterService(StringRedisTemplate redis) {
        this.redis = redis;
    }

    public void check(String bucket, String clientIp, long maxRequests, Duration window) {
        String key = "rate_limit:" + bucket + ":" + clientIp;
        Long count;

        try {
            count = redis.opsForValue().increment(key);
            if (count != null && count == 1L) {
                redis.expire(key, window);
            }
        } catch (Exception e) {
            return; // Redis 장애 시 제한 없이 통과
        }

        if (count != null && count > maxRequests) {
            throw new ApiException("요청이 너무 많습니다. 잠시 후 다시 시도하세요.", HttpStatus.TOO_MANY_REQUESTS);
        }
    }

    public static String clientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
