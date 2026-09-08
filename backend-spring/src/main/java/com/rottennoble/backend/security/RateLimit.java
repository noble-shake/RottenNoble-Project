package com.rottennoble.backend.security;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

// 요청자 IP 기준으로 시간 창(windowSeconds) 안에 limit번까지만 허용한다.
// Redis INCR/EXPIRE 기반 — Redis 장애 시엔 막지 않고 통과시킨다(가용성 우선).
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface RateLimit {
    int limit();
    int windowSeconds();
}
