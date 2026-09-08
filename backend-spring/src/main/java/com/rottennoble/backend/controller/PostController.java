package com.rottennoble.backend.controller;

import com.rottennoble.backend.dto.ApiResponse;
import com.rottennoble.backend.dto.PostRequest;
import com.rottennoble.backend.dto.PostResponse;
import com.rottennoble.backend.security.RateLimit;
import com.rottennoble.backend.security.RequireAdmin;
import com.rottennoble.backend.service.PostService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    @GetMapping
    public ApiResponse<List<PostResponse>> getAll() {
        return ApiResponse.ok(postService.getAll());
    }

    @GetMapping("/{id}")
    public ApiResponse<PostResponse> getOne(@PathVariable int id) {
        return ApiResponse.ok(postService.getById(id));
    }

    // 관리자 전용이지만, 탈취된/브루트포스된 토큰으로도 분당 요청 폭주는 못 하게 IP당 분당 60회로 제한.
    @RequireAdmin
    @RateLimit(limit = 60, windowSeconds = 60)
    @PostMapping
    public ResponseEntity<ApiResponse<PostResponse>> create(@RequestBody PostRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(postService.create(request)));
    }

    @RequireAdmin
    @RateLimit(limit = 60, windowSeconds = 60)
    @PutMapping("/{id}")
    public ApiResponse<PostResponse> update(@PathVariable int id, @RequestBody PostRequest request) {
        return ApiResponse.ok(postService.update(id, request));
    }

    @RequireAdmin
    @RateLimit(limit = 60, windowSeconds = 60)
    @DeleteMapping("/{id}")
    public ApiResponse<Map<String, Object>> delete(@PathVariable int id) {
        postService.delete(id);
        return ApiResponse.ok(Map.of("id", id, "deleted", true));
    }
}
