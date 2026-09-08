package com.rottennoble.server.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.SecureRandom;
import java.util.Arrays;
import java.util.Base64;

// backend/lib/crypto.php(AES-256-GCM)와 완전히 같은 저장 포맷을 쓴다 — "enc:v1:" 접두사 +
// base64(iv[12] + tag[16] + ciphertext). 같은 field_encryption_key를 쓰면 PHP가 암호화해둔
// 기존 방명록 데이터를 이 서버가 그대로 복호화할 수 있다(반대도 마찬가지).
//
// 주의: Java의 Cipher는 GCM 암호화 결과로 (ciphertext + tag)를 이어붙여 반환/기대하지만,
// PHP의 openssl_encrypt(OPENSSL_RAW_DATA)는 tag를 별도 out-파라미터로 분리해서 반환한다.
// 저장 포맷(iv+tag+ciphertext)을 맞추려면 이 차이를 여기서 명시적으로 조정해야 한다 — 이 부분이
// 이 클래스에서 가장 실수하기 쉬운 지점이다.
@Service
public class CryptoService {

    private static final String PREFIX = "enc:v1:";
    private static final int IV_LEN = 12;
    private static final int TAG_LEN_BITS = 128;
    private static final int TAG_LEN_BYTES = TAG_LEN_BITS / 8;

    private final byte[] key;

    public CryptoService(@Value("${app.encryption.field-key}") String base64Key) {
        if (base64Key == null || base64Key.isBlank()) {
            throw new IllegalStateException(
                    "app.encryption.field-key(FIELD_ENCRYPTION_KEY)가 설정되지 않았습니다.");
        }
        byte[] decoded = Base64.getDecoder().decode(base64Key);
        if (decoded.length != 32) {
            throw new IllegalStateException("field encryption key는 32바이트(AES-256)여야 합니다.");
        }
        this.key = decoded;
    }

    public String encrypt(String plaintext) {
        try {
            byte[] iv = new byte[IV_LEN];
            new SecureRandom().nextBytes(iv);

            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.ENCRYPT_MODE, new SecretKeySpec(key, "AES"),
                    new GCMParameterSpec(TAG_LEN_BITS, iv));
            byte[] ciphertextAndTag = cipher.doFinal(plaintext.getBytes(StandardCharsets.UTF_8));

            int ctLen = ciphertextAndTag.length - TAG_LEN_BYTES;
            byte[] ciphertext = Arrays.copyOfRange(ciphertextAndTag, 0, ctLen);
            byte[] tag = Arrays.copyOfRange(ciphertextAndTag, ctLen, ciphertextAndTag.length);

            ByteBuffer buf = ByteBuffer.allocate(IV_LEN + TAG_LEN_BYTES + ciphertext.length);
            buf.put(iv).put(tag).put(ciphertext);
            return PREFIX + Base64.getEncoder().encodeToString(buf.array());
        } catch (GeneralSecurityException e) {
            throw new RuntimeException("필드 암호화 실패", e);
        }
    }

    // 접두사가 없으면 암호화 도입 이전(또는 PHP 쪽 마이그레이션 이전)의 레거시 평문 값으로 보고
    // 그대로 반환한다 — backend/lib/crypto.php의 decrypt_field()와 동일한 하위 호환 규칙.
    public String decrypt(String stored) {
        if (stored == null || !stored.startsWith(PREFIX)) {
            return stored;
        }

        try {
            byte[] raw = Base64.getDecoder().decode(stored.substring(PREFIX.length()));
            if (raw.length < IV_LEN + TAG_LEN_BYTES) {
                return stored;
            }

            byte[] iv = Arrays.copyOfRange(raw, 0, IV_LEN);
            byte[] tag = Arrays.copyOfRange(raw, IV_LEN, IV_LEN + TAG_LEN_BYTES);
            byte[] ciphertext = Arrays.copyOfRange(raw, IV_LEN + TAG_LEN_BYTES, raw.length);

            byte[] ciphertextAndTag = new byte[ciphertext.length + tag.length];
            System.arraycopy(ciphertext, 0, ciphertextAndTag, 0, ciphertext.length);
            System.arraycopy(tag, 0, ciphertextAndTag, ciphertext.length, tag.length);

            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.DECRYPT_MODE, new SecretKeySpec(key, "AES"),
                    new GCMParameterSpec(TAG_LEN_BITS, iv));
            byte[] plaintext = cipher.doFinal(ciphertextAndTag);
            return new String(plaintext, StandardCharsets.UTF_8);
        } catch (Exception e) {
            // 복호화 실패(변조/손상/키 불일치) 시 원문 그대로 반환 — PHP 쪽과 동일한 방어적 처리.
            return stored;
        }
    }
}
