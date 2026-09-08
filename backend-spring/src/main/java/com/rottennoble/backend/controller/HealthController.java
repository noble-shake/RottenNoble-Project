package com.rottennoble.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
public class HealthController {

    @GetMapping("/api/health")
    public Map<String, Object> health() {
        return Map.of(
                "status", "online",
                "message", "Synology NAS 프로젝트 백엔드 서버(Spring Boot)가 작동 중입니다.",
                "serverTime", LocalDateTime.now().toString()
        );
    }
}
