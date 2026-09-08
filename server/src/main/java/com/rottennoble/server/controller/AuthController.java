package com.rottennoble.server.controller;

import com.rottennoble.server.dto.ApiResponse;
import com.rottennoble.server.dto.LoginRequest;
import com.rottennoble.server.exception.ApiException;
import com.rottennoble.server.service.RateLimiterService;
import com.rottennoble.server.service.SessionService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final SessionService sessionService;
    private final RateLimiterService rateLimiter;
    private final PasswordEncoder passwordEncoder;
    private final String adminUsername;
    private final String adminPasswordHash;

    public AuthController(SessionService sessionService,
                           RateLimiterService rateLimiter,
                           PasswordEncoder passwordEncoder,
                           @Value("${app.admin.username}") String adminUsername,
                           @Value("${app.admin.password-hash}") String adminPasswordHash) {
        this.sessionService = sessionService;
        this.rateLimiter = rateLimiter;
        this.passwordEncoder = passwordEncoder;
        this.adminUsername = adminUsername;
        this.adminPasswordHash = adminPasswordHash;
    }

    @PostMapping("/login")
    public ApiResponse<Map<String, String>> login(@RequestBody LoginRequest req, HttpServletRequest request) {
        // 무차별 대입 방지 — 성공/실패와 무관하게 IP당 5분 5회(backend/login.php와 동일 한도).
        rateLimiter.check("login", RateLimiterService.clientIp(request), 5, Duration.ofMinutes(5));

        String username = req.username() == null ? "" : req.username().trim();
        String password = req.password() == null ? "" : req.password();

        boolean validUser = !username.isEmpty() && username.equals(adminUsername);
        boolean validPass = !password.isEmpty()
                && adminPasswordHash != null && !adminPasswordHash.isBlank()
                && passwordEncoder.matches(password, adminPasswordHash);

        if (!validUser || !validPass) {
            throw new ApiException("아이디 또는 비밀번호가 올바르지 않습니다.", HttpStatus.UNAUTHORIZED);
        }

        String token = sessionService.createSession("admin", Duration.ofDays(1));
        return ApiResponse.ok(Map.of("token", token));
    }

    @PostMapping("/logout")
    public ApiResponse<Map<String, Boolean>> logout(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            sessionService.destroySession(header.substring("Bearer ".length()));
        }
        return ApiResponse.ok(Map.of("loggedOut", true));
    }
}
