package com.rottennoble.server.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

// spring-boot-starter-security(전체 자동 보안 필터 체인)는 일부러 안 썼다 — BCrypt 해시
// 검증 하나만 필요해서 spring-security-crypto의 인코더 빈만 직접 등록한다.
@Configuration
public class SecurityBeansConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
