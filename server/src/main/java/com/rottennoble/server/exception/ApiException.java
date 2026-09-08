package com.rottennoble.server.exception;

import org.springframework.http.HttpStatus;

// backend/response.php의 send_error()에 대응 — 컨트롤러/서비스가 이걸 던지면
// GlobalExceptionHandler가 {status:"error", message} 봉투 + 지정한 HTTP 코드로 바꿔준다.
public class ApiException extends RuntimeException {

    private final HttpStatus status;

    public ApiException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
