package com.smartwarehouse.sys.risk;

import com.smartwarehouse.platform.core.BizException;
import com.smartwarehouse.platform.core.ErrorCode;
import com.smartwarehouse.platform.redis.RedisKeys;
import com.smartwarehouse.sys.api.AuthDtos.CaptchaChallengeResponse;
import com.smartwarehouse.sys.api.AuthDtos.CaptchaVerifyResponse;
import com.smartwarehouse.sys.api.AuthDtos.RiskStateResponse;
import com.smartwarehouse.sys.infrastructure.SysRepository;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.connection.RedisConnection;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

/**
 * 登录风控服务。
 *
 * <p>商业化版本优先使用 Redis 保存失败次数、锁定状态、验证码挑战和验证码通过票据。
 * 如果本地单元测试没有启动 Redis，会降级到内存 Map，避免测试被外部中间件阻塞；Docker 联调和正式环境必须使用 Redis。</p>
 */
@Service
public class LoginRiskService {

    private static final int CAPTCHA_THRESHOLD = 3;
    private static final int USER_LOCK_THRESHOLD = 5;
    private static final int IP_LOCK_THRESHOLD = 20;

    private final Map<String, FailState> userFails = new ConcurrentHashMap<>();
    private final Map<String, FailState> ipFails = new ConcurrentHashMap<>();
    private final Map<String, CaptchaChallenge> challenges = new ConcurrentHashMap<>();
    private final Map<String, Instant> passedTokens = new ConcurrentHashMap<>();
    private final SysRepository repository;
    private final StringRedisTemplate redisTemplate;

    public LoginRiskService(SysRepository repository, StringRedisTemplate redisTemplate) {
        this.repository = repository;
        this.redisTemplate = redisTemplate;
    }

    public RiskStateResponse currentState(String username) {
        RiskStateResponse redisState = redisRiskState(username);
        if (redisState != null) {
            return redisState;
        }
        FailState state = userFails.getOrDefault(normalize(username), new FailState(0, null));
        boolean locked = state.lockedUntil() != null && state.lockedUntil().isAfter(Instant.now());
        return new RiskStateResponse(state.failures(), state.failures() >= CAPTCHA_THRESHOLD,
                locked ? state.lockedUntil().toString() : null,
                locked ? "账号已锁定，请稍后再试" : (state.failures() >= CAPTCHA_THRESHOLD ? "连续失败后需要完成拼图验证码" : ""));
    }

    public void checkBeforeLogin(String username, String ip, String verifyToken) {
        if (redisAvailable()) {
            checkBeforeLoginByRedis(username, ip, verifyToken);
            return;
        }
        Instant now = Instant.now();
        FailState userState = userFails.get(normalize(username));
        FailState ipState = ipFails.get(ip);

        if (isLocked(userState, now)) {
            throw new BizException(ErrorCode.ACCOUNT_LOCKED);
        }
        if (isLocked(ipState, now)) {
            throw new BizException(ErrorCode.IP_LOCKED);
        }
        if (userState != null && userState.failures() >= CAPTCHA_THRESHOLD && !consumePassedToken(verifyToken, now)) {
            throw new BizException(ErrorCode.CAPTCHA_REQUIRED);
        }
    }

    public void recordFailure(String username, String ip, String reason) {
        if (redisAvailable()) {
            recordFailureByRedis(username, ip, reason);
            return;
        }
        FailState userState = increase(userFails, normalize(username), USER_LOCK_THRESHOLD, Duration.ofMinutes(10));
        FailState ipState = increase(ipFails, ip, IP_LOCK_THRESHOLD, Duration.ofMinutes(5));
        repository.appendRiskRecord("LOGIN_FAIL", username, "MEDIUM", "COUNT_FAILURE", reason,
                userState.lockedUntil() == null ? null : userState.lockedUntil().toString(),
                "{\"ipFailures\":" + ipState.failures() + "}");
    }

    public void clearSuccess(String username, String ip) {
        if (redisAvailable()) {
            redisTemplate.delete(RedisKeys.userLoginFail(normalize(username)));
            redisTemplate.delete(RedisKeys.userLoginLock(normalize(username)));
            redisTemplate.delete(RedisKeys.ipLoginFail(ip));
            redisTemplate.delete(RedisKeys.ipLoginLock(ip));
            return;
        }
        userFails.remove(normalize(username));
        ipFails.remove(ip);
    }

    public CaptchaChallengeResponse createChallenge(String username) {
        String ticket = UUID.randomUUID().toString();
        int targetX = 35 + (int) (Math.random() * 45);
        int y = 40 + (int) (Math.random() * 80);
        Instant expiresAt = Instant.now().plusSeconds(120);
        CaptchaChallenge challenge = new CaptchaChallenge(ticket, normalize(username), targetX, y, expiresAt);
        if (redisAvailable()) {
            redisTemplate.opsForValue().set(RedisKeys.jigsawChallenge(ticket), challenge.toRedisValue(), 120, TimeUnit.SECONDS);
        } else {
            challenges.put(ticket, challenge);
        }
        repository.appendRiskRecord("JIGSAW_CAPTCHA", username, "LOW", "CREATE_CHALLENGE", "连续失败触发拼图验证码",
                expiresAt.toString(), "{\"ticket\":\"" + ticket + "\"}");
        // targetX 是 V02 本地联调字段，便于封装组件和后端票据校验对齐；正式验证码应只依赖图片缺口和后端校验。
        return new CaptchaChallengeResponse(ticket, toSvgData("背景", "#eef5ff", targetX), toSvgData("滑块", "#4f7cff", targetX), y, targetX, 120);
    }

    public CaptchaVerifyResponse verify(String ticket, int x) {
        CaptchaChallenge challenge = loadChallenge(ticket);
        Instant now = Instant.now();
        if (challenge == null || challenge.expiresAt().isBefore(now)) {
            throw new BizException(ErrorCode.CAPTCHA_INVALID);
        }
        if (Math.abs(challenge.targetX() - x) > 8) {
            throw new BizException(ErrorCode.CAPTCHA_INVALID);
        }

        removeChallenge(ticket);
        String token = "jigsaw-" + UUID.randomUUID();
        if (redisAvailable()) {
            redisTemplate.opsForValue().set(RedisKeys.jigsawPassed(token), "1", 120, TimeUnit.SECONDS);
        } else {
            passedTokens.put(token, now.plusSeconds(120));
        }
        repository.appendRiskRecord("JIGSAW_CAPTCHA", challenge.username(), "LOW", "VERIFY_SUCCESS", "拼图验证码通过",
                now.plusSeconds(120).toString(), "{\"ticket\":\"" + ticket + "\"}");
        return new CaptchaVerifyResponse(token, 120);
    }

    private FailState increase(Map<String, FailState> target, String key, int lockThreshold, Duration lockDuration) {
        Instant now = Instant.now();
        return target.compute(key, (ignored, old) -> {
            int failures = old == null ? 1 : old.failures() + 1;
            Instant lockedUntil = failures >= lockThreshold ? now.plus(lockDuration) : null;
            return new FailState(failures, lockedUntil);
        });
    }

    private boolean consumePassedToken(String token, Instant now) {
        if (token == null || token.isBlank()) {
            return false;
        }
        if (redisAvailable()) {
            String key = RedisKeys.jigsawPassed(token);
            Boolean exists = redisTemplate.hasKey(key);
            if (Boolean.TRUE.equals(exists)) {
                redisTemplate.delete(key);
                return true;
            }
            return false;
        }
        Instant expiresAt = passedTokens.remove(token);
        return expiresAt != null && expiresAt.isAfter(now);
    }

    private RiskStateResponse redisRiskState(String username) {
        if (!redisAvailable()) {
            return null;
        }
        String normalized = normalize(username);
        int failures = parseInt(redisTemplate.opsForValue().get(RedisKeys.userLoginFail(normalized)));
        String lockedUntil = redisTemplate.opsForValue().get(RedisKeys.userLoginLock(normalized));
        boolean locked = lockedUntil != null && !lockedUntil.isBlank();
        return new RiskStateResponse(failures, failures >= CAPTCHA_THRESHOLD, lockedUntil,
                locked ? "账号已锁定，请稍后再试" : (failures >= CAPTCHA_THRESHOLD ? "连续失败后需要完成拼图验证码" : ""));
    }

    private void checkBeforeLoginByRedis(String username, String ip, String verifyToken) {
        if (Boolean.TRUE.equals(redisTemplate.hasKey(RedisKeys.userLoginLock(normalize(username))))) {
            throw new BizException(ErrorCode.ACCOUNT_LOCKED);
        }
        if (Boolean.TRUE.equals(redisTemplate.hasKey(RedisKeys.ipLoginLock(ip)))) {
            throw new BizException(ErrorCode.IP_LOCKED);
        }
        int failures = parseInt(redisTemplate.opsForValue().get(RedisKeys.userLoginFail(normalize(username))));
        if (failures >= CAPTCHA_THRESHOLD && !consumePassedToken(verifyToken, Instant.now())) {
            throw new BizException(ErrorCode.CAPTCHA_REQUIRED);
        }
    }

    private void recordFailureByRedis(String username, String ip, String reason) {
        String userKey = RedisKeys.userLoginFail(normalize(username));
        String ipKey = RedisKeys.ipLoginFail(ip);
        long userFailures = incrementWithTtl(userKey, Duration.ofMinutes(10));
        long ipFailures = incrementWithTtl(ipKey, Duration.ofMinutes(5));
        Instant userLockedUntil = null;
        if (userFailures >= USER_LOCK_THRESHOLD) {
            userLockedUntil = Instant.now().plus(Duration.ofMinutes(10));
            redisTemplate.opsForValue().set(RedisKeys.userLoginLock(normalize(username)), userLockedUntil.toString(), 10, TimeUnit.MINUTES);
        }
        if (ipFailures >= IP_LOCK_THRESHOLD) {
            redisTemplate.opsForValue().set(RedisKeys.ipLoginLock(ip), Instant.now().plus(Duration.ofMinutes(5)).toString(), 5, TimeUnit.MINUTES);
        }
        repository.appendRiskRecord("LOGIN_FAIL", username, "MEDIUM", "COUNT_FAILURE", reason,
                userLockedUntil == null ? null : userLockedUntil.toString(), "{\"ipFailures\":" + ipFailures + "}");
    }

    private long incrementWithTtl(String key, Duration ttl) {
        Long value = redisTemplate.opsForValue().increment(key);
        redisTemplate.expire(key, ttl);
        return value == null ? 0 : value;
    }

    private CaptchaChallenge loadChallenge(String ticket) {
        if (redisAvailable()) {
            String value = redisTemplate.opsForValue().get(RedisKeys.jigsawChallenge(ticket));
            return CaptchaChallenge.fromRedisValue(value);
        }
        return challenges.get(ticket);
    }

    private void removeChallenge(String ticket) {
        if (redisAvailable()) {
            redisTemplate.delete(RedisKeys.jigsawChallenge(ticket));
        } else {
            challenges.remove(ticket);
        }
    }

    private boolean redisAvailable() {
        try {
            if (redisTemplate == null || redisTemplate.getConnectionFactory() == null) {
                return false;
            }
            RedisConnection connection = redisTemplate.getConnectionFactory().getConnection();
            try {
                return connection.ping() != null;
            } finally {
                connection.close();
            }
        } catch (Exception ex) {
            return false;
        }
    }

    private int parseInt(String value) {
        if (value == null || value.isBlank()) {
            return 0;
        }
        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException ex) {
            return 0;
        }
    }

    private boolean isLocked(FailState state, Instant now) {
        return state != null && state.lockedUntil() != null && state.lockedUntil().isAfter(now);
    }

    private String normalize(String username) {
        return username == null ? "" : username.toLowerCase();
    }

    private String toSvgData(String label, String color, int targetX) {
        String svg = "<svg xmlns='http://www.w3.org/2000/svg' width='320' height='160'>"
                + "<rect width='320' height='160' fill='" + color + "'/>"
                + "<text x='18' y='48' fill='#1f2a44' font-size='20'>SmartWarehouse-AI " + label + "</text>"
                + "<rect x='" + (targetX * 3) + "' y='72' width='36' height='36' rx='6' fill='#ffffff' opacity='.8'/>"
                + "</svg>";
        return "data:image/svg+xml;base64," + Base64.getEncoder().encodeToString(svg.getBytes(StandardCharsets.UTF_8));
    }

    private record FailState(int failures, Instant lockedUntil) {
    }

    private record CaptchaChallenge(String ticket, String username, int targetX, int y, Instant expiresAt) {
        private String toRedisValue() {
            return ticket + "|" + username + "|" + targetX + "|" + y + "|" + expiresAt;
        }

        private static CaptchaChallenge fromRedisValue(String value) {
            if (value == null || value.isBlank()) {
                return null;
            }
            String[] parts = value.split("\\|");
            if (parts.length != 5) {
                return null;
            }
            return new CaptchaChallenge(parts[0], parts[1], Integer.parseInt(parts[2]), Integer.parseInt(parts[3]), Instant.parse(parts[4]));
        }
    }
}
