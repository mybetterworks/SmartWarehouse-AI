package com.smartwarehouse.platform.security;

import java.time.Instant;
import java.util.List;

/**
 * 平台 JWT Claims。
 *
 * <p>只放轻量身份和权限摘要，避免把用户完整资料塞进 Token 导致过大或权限变更不易失效。</p>
 */
public record JwtClaims(
        String jti,
        String tokenType,
        Long userId,
        String username,
        String nickname,
        List<String> roles,
        List<String> permissions,
        List<Long> warehouseIds,
        Instant issuedAt,
        Instant expiresAt
) {
    public boolean expired(Instant now) {
        return expiresAt == null || !expiresAt.isAfter(now);
    }
}
