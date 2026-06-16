package com.smartwarehouse.sys.controller;

import com.smartwarehouse.platform.core.R;
import com.smartwarehouse.platform.security.JwtTokenService;
import com.smartwarehouse.sys.api.AuthDtos.*;
import com.smartwarehouse.sys.api.SysDtos.LoginUserView;
import com.smartwarehouse.sys.risk.LoginRiskService;
import com.smartwarehouse.sys.security.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * 认证与登录风控接口。
 *
 * <p>这些接口是 portal-shell 的最小登录闭环：登录、刷新、退出、当前用户、拼图挑战和拼图校验。</p>
 */
@RestController
@RequestMapping("/api/sys/auth")
public class AuthController {

    private final AuthService authService;
    private final LoginRiskService loginRiskService;
    private final JwtTokenService jwtTokenService;

    public AuthController(AuthService authService, LoginRiskService loginRiskService, JwtTokenService jwtTokenService) {
        this.authService = authService;
        this.loginRiskService = loginRiskService;
        this.jwtTokenService = jwtTokenService;
    }

    @PostMapping("/login")
    public R<LoginResponse> login(@RequestBody LoginRequest request, HttpServletRequest servletRequest) {
        return R.ok(authService.login(request, clientIp(servletRequest), servletRequest.getHeader("User-Agent")));
    }

    @PostMapping("/logout")
    public R<Void> logout(HttpServletRequest request) {
        authService.logout(requiredToken(request));
        return R.ok();
    }

    @PostMapping("/refresh")
    public R<LoginResponse> refresh(@RequestBody RefreshRequest request) {
        return R.ok(authService.refresh(request));
    }

    @GetMapping("/me")
    public R<LoginUserView> me(HttpServletRequest request) {
        return R.ok(authService.me(requiredToken(request)));
    }

    @PutMapping("/password")
    public R<Void> changePassword(@RequestBody ChangePasswordRequest body, HttpServletRequest request) {
        authService.changePassword(requiredToken(request), body);
        return R.ok();
    }

    @GetMapping("/risk-state")
    public R<RiskStateResponse> riskState(@RequestParam String username) {
        return R.ok(loginRiskService.currentState(username));
    }

    @GetMapping("/captcha/jigsaw")
    public R<CaptchaChallengeResponse> captcha(@RequestParam String username) {
        return R.ok(loginRiskService.createChallenge(username));
    }

    @PostMapping("/captcha/verify")
    public R<CaptchaVerifyResponse> verify(@RequestBody CaptchaVerifyRequest request) {
        return R.ok(loginRiskService.verify(request.captchaTicket(), request.x()));
    }

    private String requiredToken(HttpServletRequest request) {
        String token = jwtTokenService.extractBearerToken(request.getHeader("Authorization"));
        if (token != null && !token.isBlank()) {
            return token;
        }
        // 前端平台 SDK 默认使用 X-Access-Token；sys-service 必须兼容该 Header，
        // 否则 login 成功后 /auth/me、/auth/logout 仍会因为读不到 Token 返回未登录。
        return request.getHeader("X-Access-Token");
    }

    private String clientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
