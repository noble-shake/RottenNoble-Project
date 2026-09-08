package com.rottennoble.server.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

// PHP 시절 response.php의 손으로 짠 allow_cors()(헤더 직접 세팅 + OPTIONS 직접 처리)를
// Spring의 내장 CORS 처리로 대체한다 — 프리플라이트(OPTIONS) 응답을 프레임워크가 알아서
// 만들어주므로 그 부분에서 놓칠 여지가 없어진다.
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Value("${app.cors.allowed-origins}")
    private String allowedOriginsRaw;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        String[] origins = allowedOriginsRaw.split(",");
        registry.addMapping("/api/**")
                .allowedOrigins(origins)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("Content-Type", "Authorization")
                .allowCredentials(false);
    }
}
