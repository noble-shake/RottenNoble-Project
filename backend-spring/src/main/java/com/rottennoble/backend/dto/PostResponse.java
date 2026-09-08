package com.rottennoble.backend.dto;

import com.rottennoble.backend.entity.Post;

import java.time.LocalDateTime;

public record PostResponse(Integer id, String title, String content, LocalDateTime createdAt) {
    public static PostResponse from(Post post) {
        return new PostResponse(post.getId(), post.getTitle(), post.getContent(), post.getCreatedAt());
    }
}
