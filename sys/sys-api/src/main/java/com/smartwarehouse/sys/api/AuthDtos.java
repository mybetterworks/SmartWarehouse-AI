package com.smartwarehouse.sys.api;

import java.util.List;

/**
 * 认证与登录风控接口契约。
 *
 * <p>portal-shell 只依赖这些 DTO，不感知 sys-service 内部使用内存、MySQL 还是 Redis 实现。</p>
 */
public final class AuthDtos {

    private AuthDtos() {
    }

    public record LoginRequest(String username, String password, String captchaTicket, String captchaVerifyToken) {
    }

    public record LoginResponse(String accessToken, String refreshToken, long expiresIn) {
    }

    public record RefreshRequest(String refreshToken) {
    }

    public record ChangePasswordRequest(String oldPassword, String newPassword, String confirmPassword) {
    }

    public record CaptchaChallengeResponse(String captchaTicket, String backgroundImage, String sliderImage, int y,
                                           int targetX, long expiresIn) {
    }

    public record CaptchaVerifyRequest(String captchaTicket, int x, List<Integer> track) {
        public CaptchaVerifyRequest {
            track = track == null ? List.of() : List.copyOf(track);
        }
    }

    public record CaptchaVerifyResponse(String captchaVerifyToken, long expiresIn) {
    }

    public record RiskStateResponse(int failureCount, boolean captchaRequired, String lockedUntil, String message) {
    }
}
