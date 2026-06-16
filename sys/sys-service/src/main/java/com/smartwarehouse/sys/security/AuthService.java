package com.smartwarehouse.sys.security;

import com.smartwarehouse.platform.core.BizException;
import com.smartwarehouse.platform.core.ErrorCode;
import com.smartwarehouse.platform.core.TraceIdHolder;
import com.smartwarehouse.platform.security.JwtClaims;
import com.smartwarehouse.platform.security.JwtTokenService;
import com.smartwarehouse.platform.security.LoginUser;
import com.smartwarehouse.sys.api.AuthDtos.ChangePasswordRequest;
import com.smartwarehouse.sys.api.AuthDtos.LoginRequest;
import com.smartwarehouse.sys.api.AuthDtos.LoginResponse;
import com.smartwarehouse.sys.api.AuthDtos.RefreshRequest;
import com.smartwarehouse.sys.api.SysDtos.LoginUserView;
import com.smartwarehouse.sys.infrastructure.SysRepository;
import com.smartwarehouse.sys.infrastructure.SysRepository.UserRecord;
import com.smartwarehouse.sys.risk.LoginRiskService;
import org.springframework.stereotype.Service;

import java.time.Instant;

/**
 * 认证应用服务。
 *
 * <p>这里串联用户校验、登录风控、JWT 签发、Token 黑名单和登录日志，是 V02 登录闭环的核心。</p>
 */
@Service
public class AuthService {

    private final SysRepository repository;
    private final LoginRiskService riskService;
    private final JwtTokenService jwtTokenService;
    private final TokenBlacklistService tokenBlacklistService;

    public AuthService(SysRepository repository, LoginRiskService riskService, JwtTokenService jwtTokenService,
                       TokenBlacklistService tokenBlacklistService) {
        this.repository = repository;
        this.riskService = riskService;
        this.jwtTokenService = jwtTokenService;
        this.tokenBlacklistService = tokenBlacklistService;
    }

    public LoginResponse login(LoginRequest request, String ip, String userAgent) {
        String username = request.username() == null ? "" : request.username().trim();
        riskService.checkBeforeLogin(username, ip, request.captchaVerifyToken());
        UserRecord user = repository.findUserByUsername(username);

        if (user == null || !"ENABLED".equals(user.status()) || !repository.passwordMatches(user, request.password())) {
            riskService.recordFailure(username, ip, "账号、状态或密码校验失败");
            repository.appendLoginLog(username, user == null ? null : user.id(), ip, userAgent, "FAIL",
                    "账号或密码错误", TraceIdHolder.get());
            throw new BizException(ErrorCode.LOGIN_FAILED);
        }

        riskService.clearSuccess(username, ip);
        repository.updateLoginSuccess(user.id(), ip);
        repository.appendLoginLog(username, user.id(), ip, userAgent, "SUCCESS", null, TraceIdHolder.get());
        return issue(repository.toLoginUser(user));
    }

    public LoginResponse refresh(RefreshRequest request) {
        JwtClaims claims = jwtTokenService.parse(request.refreshToken());
        if (!"refresh".equals(claims.tokenType()) || tokenBlacklistService.contains(claims.jti())) {
            throw new BizException(ErrorCode.UNAUTHORIZED);
        }
        UserRecord user = repository.findUserById(claims.userId());
        if (user == null || !"ENABLED".equals(user.status())) {
            throw new BizException(ErrorCode.UNAUTHORIZED);
        }
        return issue(repository.toLoginUser(user));
    }

    public void logout(String token) {
        JwtClaims claims = jwtTokenService.parse(token);
        tokenBlacklistService.add(claims.jti(), claims.expiresAt());
    }

    public LoginUserView me(String token) {
        JwtClaims claims = jwtTokenService.parse(token);
        if (tokenBlacklistService.contains(claims.jti())) {
            throw new BizException(ErrorCode.UNAUTHORIZED);
        }
        UserRecord user = repository.findUserById(claims.userId());
        if (user == null) {
            throw new BizException(ErrorCode.UNAUTHORIZED);
        }
        return repository.toLoginUser(user);
    }

    public void changePassword(String token, ChangePasswordRequest request) {
        JwtClaims claims = jwtTokenService.parse(token);
        if (tokenBlacklistService.contains(claims.jti())) {
            throw new BizException(ErrorCode.UNAUTHORIZED);
        }
        UserRecord user = repository.findUserById(claims.userId());
        if (user == null || !"ENABLED".equals(user.status())) {
            throw new BizException(ErrorCode.UNAUTHORIZED);
        }
        if (!repository.passwordMatches(user, request.oldPassword())) {
            throw new BizException(ErrorCode.LOGIN_FAILED.code(), "旧密码不正确");
        }
        if (request.newPassword() == null || request.newPassword().length() < 6) {
            throw new BizException(ErrorCode.PARAM_ERROR.code(), "新密码至少 6 位");
        }
        if (!request.newPassword().equals(request.confirmPassword())) {
            throw new BizException(ErrorCode.PARAM_ERROR.code(), "两次输入的新密码不一致");
        }
        repository.updatePassword(user.id(), request.newPassword());
    }

    private LoginResponse issue(LoginUserView user) {
        LoginUser loginUser = new LoginUser(user.userId(), user.username(), user.nickname(),
                user.roles(), user.permissions(), user.warehouseIds());
        String accessToken = jwtTokenService.issueAccessToken(loginUser);
        String refreshToken = jwtTokenService.issueRefreshToken(loginUser);
        return new LoginResponse(accessToken, refreshToken, 7200);
    }
}
