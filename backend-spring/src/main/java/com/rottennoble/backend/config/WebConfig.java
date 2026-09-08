package com.rottennoble.backend.config;

import com.rottennoble.backend.security.AdminSessionInterceptor;
import com.rottennoble.backend.security.RateLimitInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final AdminSessionInterceptor adminSessionInterceptor;
    private final RateLimitInterceptor rateLimitInterceptor;

    public WebConfig(AdminSessionInterceptor adminSessionInterceptor, RateLimitInterceptor rateLimitInterceptor) {
        this.adminSessionInterceptor = adminSessionInterceptor;
        this.rateLimitInterceptor = rateLimitInterceptor;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // rate limit을 인증보다 먼저 걸어 무차별 대입 자체를 먼저 억제한다.
        registry.addInterceptor(rateLimitInterceptor);
        registry.addInterceptor(adminSessionInterceptor);
    }

    // PHP backend/response.php의 allow_cors()와 동일하게 전부 와일드카드로 허용한다.
    // 인증이 쿠키가 아니라 Authorization: Bearer 헤더 방식이라 CORS 자격증명 문제가 없다.
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*");
    }
}
