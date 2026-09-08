package com.rottennoble.backend.security;

import com.rottennoble.backend.exception.UnauthorizedException;
import com.rottennoble.backend.service.AdminSessionService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class AdminSessionInterceptor implements HandlerInterceptor {

    private final AdminSessionService adminSessionService;

    public AdminSessionInterceptor(AdminSessionService adminSessionService) {
        this.adminSessionService = adminSessionService;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        if (!(handler instanceof HandlerMethod handlerMethod)) {
            return true;
        }
        if (handlerMethod.getMethodAnnotation(RequireAdmin.class) == null) {
            return true;
        }

        String token = adminSessionService.extractToken(request);
        if (token == null) {
            throw new UnauthorizedException("로그인이 필요합니다.");
        }
        if (!adminSessionService.isValidToken(token)) {
            throw new UnauthorizedException("세션이 유효하지 않거나 만료되었습니다.");
        }
        return true;
    }
}
