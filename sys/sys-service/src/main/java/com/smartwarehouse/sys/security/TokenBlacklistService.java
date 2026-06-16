package com.smartwarehouse.sys.security;

import com.smartwarehouse.platform.redis.RedisKeys;
import org.springframework.data.redis.connection.RedisConnection;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

/**
 * Token 黑名单服务。
 *
 * <p>商业化基座优先把黑名单写入 Redis，gateway 和 sys-service 都读取同一份状态。
 * 当单元测试未启动 Redis 时，服务会降级到内存 Map，避免测试依赖外部容器。</p>
 */
@Service
public class TokenBlacklistService {

    private final Map<String, Instant> blacklist = new ConcurrentHashMap<>();
    private final StringRedisTemplate redisTemplate;

    public TokenBlacklistService(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public void add(String jti, Instant expiresAt) {
        if (redisAvailable()) {
            long ttlSeconds = Math.max(Duration.between(Instant.now(), expiresAt).toSeconds(), 1);
            redisTemplate.opsForValue().set(RedisKeys.tokenBlacklist(jti), "1", ttlSeconds, TimeUnit.SECONDS);
            return;
        }
        blacklist.put(jti, expiresAt);
    }

    public boolean contains(String jti) {
        if (redisAvailable()) {
            return Boolean.TRUE.equals(redisTemplate.hasKey(RedisKeys.tokenBlacklist(jti)));
        }
        Instant expiresAt = blacklist.get(jti);
        if (expiresAt == null) {
            return false;
        }
        if (expiresAt.isBefore(Instant.now())) {
            blacklist.remove(jti);
            return false;
        }
        return true;
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
}
