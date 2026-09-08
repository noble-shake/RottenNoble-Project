package com.rottennoble.backend.dto;

import com.rottennoble.backend.entity.GuestbookEntry;

import java.time.LocalDateTime;

public record GuestbookResponse(Integer id, String name, String message, LocalDateTime createdAt) {
    public static GuestbookResponse from(GuestbookEntry entry) {
        return new GuestbookResponse(entry.getId(), entry.getName(), entry.getMessage(), entry.getCreatedAt());
    }
}
