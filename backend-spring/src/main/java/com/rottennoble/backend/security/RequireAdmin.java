package com.rottennoble.backend.security;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

// PHP backend/auth.php의 require_admin() 호출을 대신한다 — 이 애노테이션이 붙은
// 컨트롤러 메서드만 AdminSessionInterceptor가 Redis 세션 토큰을 검사한다.
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface RequireAdmin {
}
