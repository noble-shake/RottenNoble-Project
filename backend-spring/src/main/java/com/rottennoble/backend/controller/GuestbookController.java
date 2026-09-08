package com.rottennoble.backend.controller;

import com.rottennoble.backend.dto.ApiResponse;
import com.rottennoble.backend.dto.GuestbookRequest;
import com.rottennoble.backend.dto.GuestbookResponse;
import com.rottennoble.backend.security.RateLimit;
import com.rottennoble.backend.service.GuestbookService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/guestbook")
public class GuestbookController {

    private final GuestbookService guestbookService;

    public GuestbookController(GuestbookService guestbookService) {
        this.guestbookService = guestbookService;
    }

    @GetMapping
    public ApiResponse<List<GuestbookResponse>> getAll() {
        return ApiResponse.ok(guestbookService.getAll());
    }

    // 인증 없음 — 방명록은 누구나 작성 가능(기존 PHP create_guestbook_entry.php와 동일).
    // IP당 1시간에 5건으로 도배 방지(2026-09-08 스캔/프로빙 사건 대응).
    @RateLimit(limit = 5, windowSeconds = 3600)
    @PostMapping
    public ResponseEntity<ApiResponse<GuestbookResponse>> create(@RequestBody GuestbookRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(guestbookService.create(request)));
    }
}
