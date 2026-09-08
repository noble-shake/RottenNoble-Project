package com.rottennoble.backend.service;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import static org.junit.jupiter.api.Assertions.assertTrue;

// PHP password_hash(PASSWORD_BCRYPT)가 만드는 해시는 "$2y$" prefix를 쓴다.
// Spring Security의 BCryptPasswordEncoder가 이 prefix를 검증 가능한지 확인한다
// (실행 계획 8-7단계 — 재해시 없이 기존 backend/config.local.php의 admin_password_hash를
// 그대로 재사용할 수 있는지 판단하는 근거).
class BcryptCompatibilityTest {

    @Test
    void matchesDollar2yPrefixedHash() {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String rawPassword = "test-password-1234";

        String dollar2aHash = encoder.encode(rawPassword);
        String dollar2yHash = "$2y$" + dollar2aHash.substring(4);

        assertTrue(encoder.matches(rawPassword, dollar2yHash),
                "BCryptPasswordEncoder가 $2y$ prefix 해시를 검증하지 못함 — 재해시가 필요하다는 뜻");
    }
}
