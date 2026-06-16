package com.smartwarehouse.platform.redis;

/**
 * Redis Key 命名工具。
 *
 * <p>先把 V02 登录风控和 Token 黑名单 Key 固定下来，后续真正接入 Redis 时不会在各服务散落字符串。</p>
 */
public final class RedisKeys {

    private RedisKeys() {
    }

    public static String tokenBlacklist(String jti) {
        return "auth:blacklist:" + jti;
    }

    public static String userLoginFail(String username) {
        return "login:fail:user:" + username;
    }

    public static String ipLoginFail(String ip) {
        return "login:fail:ip:" + ip;
    }

    public static String userLoginLock(String username) {
        return "login:lock:user:" + username;
    }

    public static String ipLoginLock(String ip) {
        return "login:lock:ip:" + ip;
    }

    public static String jigsawChallenge(String ticket) {
        return "login:jigsaw:challenge:" + ticket;
    }

    public static String jigsawPassed(String token) {
        return "login:jigsaw:passed:" + token;
    }
}
