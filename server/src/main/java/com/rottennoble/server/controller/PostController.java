package com.rottennoble.server.controller;

import com.rottennoble.server.dto.ApiResponse;
import com.rottennoble.server.dto.PostRequest;
import com.rottennoble.server.entity.Post;
import com.rottennoble.server.exception.ApiException;
import com.rottennoble.server.repository.PostRepository;
import com.rottennoble.server.service.RateLimiterService;
import com.rottennoble.server.service.SessionService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.util.List;
import java.util.Map;

// PHP 시절 get_posts.php/get_post.php/create_post.php/update_post.php/delete_post.php(파일
// 하나 = 엔드포인트 하나, id는 body에 담아 전부 POST) 다섯 개를 REST 관례(GET/POST/PUT/DELETE,
// id는 경로 변수)로 다시 짰다 — 이 계약은 기존 CRA 프런트(backend/*.php를 직접 호출)와
// 호환되지 않는다. 새 계약에 맞춘 API 클라이언트 교체는 Phase 2(Vite 마이그레이션)에서 같이 한다.
@RestController
@RequestMapping("/api/posts")
public class PostController {

    private final PostRepository postRepository;
    private final SessionService sessionService;
    private final RateLimiterService rateLimiter;

    public PostController(PostRepository postRepository, SessionService sessionService,
                           RateLimiterService rateLimiter) {
        this.postRepository = postRepository;
        this.sessionService = sessionService;
        this.rateLimiter = rateLimiter;
    }

    @GetMapping
    public ApiResponse<List<Post>> list() {
        return ApiResponse.ok(postRepository.findAllByOrderByCreatedAtDesc());
    }

    @GetMapping("/{id}")
    public ApiResponse<Post> get(@PathVariable Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ApiException("게시글을 찾을 수 없습니다.", HttpStatus.NOT_FOUND));
        return ApiResponse.ok(post);
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Post>> create(@RequestBody PostRequest req, HttpServletRequest request) {
        sessionService.requireAdmin(request);
        rateLimiter.check("admin_write", RateLimiterService.clientIp(request), 60, Duration.ofMinutes(1));

        String title = normalize(req.title());
        String content = normalize(req.content());
        validate(title, content);

        Post post = new Post();
        post.setTitle(title);
        post.setContent(content);
        Post saved = postRepository.save(post);

        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(saved));
    }

    @PutMapping("/{id}")
    public ApiResponse<Post> update(@PathVariable Long id, @RequestBody PostRequest req, HttpServletRequest request) {
        sessionService.requireAdmin(request);
        rateLimiter.check("admin_write", RateLimiterService.clientIp(request), 60, Duration.ofMinutes(1));

        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ApiException("게시글을 찾을 수 없습니다.", HttpStatus.NOT_FOUND));

        String title = normalize(req.title());
        String content = normalize(req.content());
        validate(title, content);

        post.setTitle(title);
        post.setContent(content);
        return ApiResponse.ok(postRepository.save(post));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Map<String, Object>> delete(@PathVariable Long id, HttpServletRequest request) {
        sessionService.requireAdmin(request);
        rateLimiter.check("admin_write", RateLimiterService.clientIp(request), 60, Duration.ofMinutes(1));

        if (!postRepository.existsById(id)) {
            throw new ApiException("게시글을 찾을 수 없습니다.", HttpStatus.NOT_FOUND);
        }
        postRepository.deleteById(id);
        return ApiResponse.ok(Map.of("id", id, "deleted", true));
    }

    private static String normalize(String value) {
        return value == null ? "" : value.trim();
    }

    private static void validate(String title, String content) {
        if (title.isEmpty() || title.length() > 255) {
            throw new ApiException("제목은 1~255자여야 합니다.", HttpStatus.BAD_REQUEST);
        }
        if (content.isEmpty()) {
            throw new ApiException("내용을 입력하세요.", HttpStatus.BAD_REQUEST);
        }
    }
}
