package com.smartwarehouse.platform.security;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartwarehouse.platform.core.BizException;
import com.smartwarehouse.platform.core.ErrorCode;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * 轻量 JWT 签发与解析服务。
 *
 * <p>V02 使用 HMAC-SHA256 实现标准 JWT 三段式结构，减少早期依赖复杂度。
 * 后续如果替换为 Spring Security OAuth2 Resource Server，只要保持 claims 字段兼容，
 * gateway、sys-service 和前端都无需大改。</p>
 */
public class JwtTokenService {

    private static final Base64.Encoder BASE64_URL_ENCODER = Base64.getUrlEncoder().withoutPadding();
    private static final Base64.Decoder BASE64_URL_DECODER = Base64.getUrlDecoder();
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    private final JwtProperties properties;

    public JwtTokenService(JwtProperties properties) {
        this.properties = properties;
    }

    public String issueAccessToken(LoginUser user) {
        return issue(user, "access", properties.getAccessTtlSeconds());
    }

    public String issueRefreshToken(LoginUser user) {
        return issue(user, "refresh", properties.getRefreshTtlSeconds());
    }

    public JwtClaims parse(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length != 3) {
                throw new BizException(ErrorCode.UNAUTHORIZED);
            }

            String unsigned = parts[0] + "." + parts[1];
            String expected = hmac(unsigned);
            if (!MessageDigest.isEqual(expected.getBytes(StandardCharsets.UTF_8), parts[2].getBytes(StandardCharsets.UTF_8))) {
                throw new BizException(ErrorCode.UNAUTHORIZED);
            }

            Map<String, Object> payload = OBJECT_MAPPER.readValue(BASE64_URL_DECODER.decode(parts[1]), new TypeReference<>() {
            });
            JwtClaims claims = toClaims(payload);
            if (claims.expired(Instant.now())) {
                throw new BizException(ErrorCode.UNAUTHORIZED);
            }
            return claims;
        } catch (BizException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new BizException(ErrorCode.UNAUTHORIZED);
        }
    }

    public String extractBearerToken(String authorizationHeader) {
        if (authorizationHeader == null || authorizationHeader.isBlank()) {
            return null;
        }
        return authorizationHeader.startsWith("Bearer ") ? authorizationHeader.substring(7) : authorizationHeader;
    }

    private String issue(LoginUser user, String tokenType, long ttlSeconds) {
        Instant now = Instant.now();
        Map<String, Object> header = Map.of("alg", "HS256", "typ", "JWT");
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("iss", properties.getIssuer());
        payload.put("jti", UUID.randomUUID().toString());
        payload.put("typ", tokenType);
        payload.put("sub", user.username());
        payload.put("userId", user.userId());
        payload.put("nickname", user.nickname());
        payload.put("roles", user.roles());
        payload.put("permissions", user.permissions());
        payload.put("warehouseIds", user.warehouseIds());
        payload.put("iat", now.getEpochSecond());
        payload.put("exp", now.plusSeconds(ttlSeconds).getEpochSecond());

        String unsigned = encodeJson(header) + "." + encodeJson(payload);
        return unsigned + "." + hmac(unsigned);
    }

    private JwtClaims toClaims(Map<String, Object> payload) {
        return new JwtClaims(
                String.valueOf(payload.get("jti")),
                String.valueOf(payload.get("typ")),
                asLong(payload.get("userId")),
                String.valueOf(payload.get("sub")),
                String.valueOf(payload.get("nickname")),
                asStringList(payload.get("roles")),
                asStringList(payload.get("permissions")),
                asLongList(payload.get("warehouseIds")),
                Instant.ofEpochSecond(asLong(payload.get("iat"))),
                Instant.ofEpochSecond(asLong(payload.get("exp")))
        );
    }

    private String encodeJson(Object value) {
        try {
            return BASE64_URL_ENCODER.encodeToString(OBJECT_MAPPER.writeValueAsBytes(value));
        } catch (Exception ex) {
            throw new IllegalStateException("JWT JSON encode failed", ex);
        }
    }

    private String hmac(String unsigned) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(properties.getSecret().getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return BASE64_URL_ENCODER.encodeToString(mac.doFinal(unsigned.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception ex) {
            throw new IllegalStateException("JWT sign failed", ex);
        }
    }

    private long asLong(Object value) {
        if (value instanceof Number number) {
            return number.longValue();
        }
        return Long.parseLong(String.valueOf(value));
    }

    private List<String> asStringList(Object value) {
        if (value instanceof List<?> list) {
            return list.stream().map(String::valueOf).toList();
        }
        return List.of();
    }

    private List<Long> asLongList(Object value) {
        if (value instanceof List<?> list) {
            return list.stream().map(this::asLong).toList();
        }
        return List.of();
    }
}
