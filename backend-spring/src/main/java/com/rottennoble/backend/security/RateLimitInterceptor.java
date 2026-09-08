package com.rottennoble.backend.security;

import com.rottennoble.backend.exception.ApiException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import java.time.Duration;

// 2026-09-08 rotten-noble.com이 실제로 스캔/프로빙(SQL 인젝션 시도 포함)을 당한 뒤 발견된 갭
// 대응 — prepared statement 덕에 인젝션 자체는 막혔지만, login에 요청 제한이 없어 무차별
// 대입/DoS에 열려 있었다. PHP 시절 마련됐던 패치(rate-limit-and-cors 브랜치)가 배포되지 않은
// 채 이 프로젝트가 Spring Boot로 전환됐으므로, 여기서 처음부터 반영한다.
@Component
public class RateLimitInterceptor implements HandlerInterceptor {

    private static final Logger log = LoggerFactory.getLogger(RateLimitInterceptor.class);
    private static final String KEY_PREFIX = "ratelimit:";

    private final StringRedisTemplate redisTemplate;

    public RateLimitInterceptor(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        if (!(handler instanceof HandlerMethod handlerMethod)) {
            return true;
        }
        RateLimit rateLimit = handlerMethod.getMethodAnnotation(RateLimit.class);
        if (rateLimit == null) {
            return true;
        }

        String key = KEY_PREFIX + handlerMethod.getMethod().getName() + ":" + clientIp(request);

        try {
            Long count = redisTemplate.opsForValue().increment(key);
            if (count != null && count == 1L) {
                redisTemplate.expire(key, Duration.ofSeconds(rateLimit.windowSeconds()));
            }
            if (count != null && count > rateLimit.limit()) {
                throw new ApiException("요청이 너무 많습니다. 잠시 후 다시 시도하세요.", HttpStatus.TOO_MANY_REQUESTS);
            }
        } catch (ApiException ex) {
            throw ex;
        } catch (Exception ex) {
            // Redis 장애 시 막지 않고 통과 — 가용성을 인증/rate-limit보다 우선한다.
            log.warn("Rate limit check failed, allowing request through: {}", ex.getMessage());
        }

        return true;
    }

    private String clientIp(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
