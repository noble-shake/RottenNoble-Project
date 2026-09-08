package com.rottennoble.backend.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

// PHP backend/response.php의 send_json/send_error 봉투와 같은 형태를 유지한다:
// 성공 {status:'ok', data}, 실패 {status:'error', message}.
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiResponse<T>(String status, T data, String message) {

    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>("ok", data, null);
    }

    public static ApiResponse<Void> error(String message) {
        return new ApiResponse<>("error", null, message);
    }
}
