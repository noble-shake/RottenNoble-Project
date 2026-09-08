package com.rottennoble.server.dto;

import java.time.LocalDateTime;

// GuestbookEntry 엔티티는 name을 암호화된 채로 들고 있다 — 응답에는 복호화된 값을 담은 이
// 뷰(view) 타입을 쓴다(엔티티를 그대로 직렬화하면 암호문이 그대로 나가버린다).
public record GuestbookEntryView(Long id, String name, String message, LocalDateTime createdAt) {
}
