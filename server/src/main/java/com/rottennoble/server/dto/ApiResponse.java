package com.rottennoble.server.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

// backend/response.php의 {status, data|message} 봉투와 같은 모양을 유지한다 — 프런트가 새 API로
// 옮겨갈 때(Phase 2, Vite) 응답 파싱 로직을 그대로 재사용할 수 있게 하기 위해서다.
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    private String status;
    private T data;
    private String message;

    public static <T> ApiResponse<T> ok(T data) {
        ApiResponse<T> response = new ApiResponse<>();
        response.status = "ok";
        response.data = data;
        return response;
    }

    public static ApiResponse<Void> error(String message) {
        ApiResponse<Void> response = new ApiResponse<>();
        response.status = "error";
        response.message = message;
        return response;
    }

    public String getStatus() {
        return status;
    }

    public T getData() {
        return data;
    }

    public String getMessage() {
        return message;
    }
}
