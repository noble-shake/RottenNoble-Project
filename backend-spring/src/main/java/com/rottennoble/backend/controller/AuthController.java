package com.rottennoble.backend.controller;

import com.rottennoble.backend.dto.ApiResponse;
import com.rottennoble.backend.dto.LoginRequest;
import com.rottennoble.backend.security.RateLimit;
import com.rottennoble.backend.service.AdminSessionService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AdminSessionService adminSessionService;

    public AuthController(AdminSessionService adminSessionService) {
        this.adminSessionService = adminSessionService;
    }

    // 2026-09-08 실제 스캔/프로빙 사건 이후 대응 — IP당 5분에 5회로 무차별 대입을 억제한다.
    @RateLimit(limit = 5, windowSeconds = 300)
    @PostMapping("/login")
    public ApiResponse<Map<String, String>> login(@RequestBody LoginRequest request) {
        String token = adminSessionService.login(request.username(), request.password());
        return ApiResponse.ok(Map.of("token", token));
    }

    @PostMapping("/logout")
    public ApiResponse<Map<String, Boolean>> logout(HttpServletRequest request) {
        String token = adminSessionService.extractToken(request);
        adminSessionService.logout(token);
        return ApiResponse.ok(Map.of("loggedOut", true));
    }
}
