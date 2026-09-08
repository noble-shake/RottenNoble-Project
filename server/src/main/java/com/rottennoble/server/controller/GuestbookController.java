package com.rottennoble.server.controller;

import com.rottennoble.server.dto.ApiResponse;
import com.rottennoble.server.dto.GuestbookEntryView;
import com.rottennoble.server.dto.GuestbookRequest;
import com.rottennoble.server.entity.GuestbookEntry;
import com.rottennoble.server.exception.ApiException;
import com.rottennoble.server.repository.GuestbookRepository;
import com.rottennoble.server.service.CryptoService;
import com.rottennoble.server.service.RateLimiterService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.util.List;

@RestController
@RequestMapping("/api/guestbook")
public class GuestbookController {

    private final GuestbookRepository guestbookRepository;
    private final CryptoService cryptoService;
    private final RateLimiterService rateLimiter;

    public GuestbookController(GuestbookRepository guestbookRepository, CryptoService cryptoService,
                                RateLimiterService rateLimiter) {
        this.guestbookRepository = guestbookRepository;
        this.cryptoService = cryptoService;
        this.rateLimiter = rateLimiter;
    }

    @GetMapping
    public ApiResponse<List<GuestbookEntryView>> list() {
        List<GuestbookEntryView> views = guestbookRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(e -> new GuestbookEntryView(e.getId(), cryptoService.decrypt(e.getName()), e.getMessage(), e.getCreatedAt()))
                .toList();
        return ApiResponse.ok(views);
    }

    @PostMapping
    public ResponseEntity<ApiResponse<GuestbookEntryView>> create(@RequestBody GuestbookRequest req,
                                                                    HttpServletRequest request) {
        // 인증 없는 공개 작성 엔드포인트라 도배 방지가 핵심 — IP당 1시간 5건(backend/lib/rate_limit.php와 동일 한도).
        rateLimiter.check("guestbook_write", RateLimiterService.clientIp(request), 5, Duration.ofHours(1));

        String name = req.name() == null ? "" : req.name().trim();
        String message = req.message() == null ? "" : req.message().trim();

        if (name.isEmpty() || name.length() > 50) {
            throw new ApiException("이름은 1~50자여야 합니다.", HttpStatus.BAD_REQUEST);
        }
        if (message.isEmpty() || message.length() > 500) {
            throw new ApiException("메시지는 1~500자여야 합니다.", HttpStatus.BAD_REQUEST);
        }

        GuestbookEntry entry = new GuestbookEntry();
        entry.setName(cryptoService.encrypt(name)); // DB엔 암호화된 값만 저장
        entry.setMessage(message);
        GuestbookEntry saved = guestbookRepository.save(entry);

        GuestbookEntryView view = new GuestbookEntryView(saved.getId(), name, saved.getMessage(), saved.getCreatedAt());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(view));
    }
}
