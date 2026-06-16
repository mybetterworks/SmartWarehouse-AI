package com.smartwarehouse.platform.security;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * JWT 配置。
 *
 * <p>密钥必须通过环境变量、Nacos 或 Secret 注入；默认值只用于本地开发验证，正式环境必须覆盖。</p>
 */
@ConfigurationProperties(prefix = "smartwarehouse.jwt")
public class JwtProperties {

    private String secret = "change-me-in-local-dev-only-at-least-32-chars";
    private long accessTtlSeconds = 7200;
    private long refreshTtlSeconds = 604800;
    private String issuer = "SmartWarehouse-AI";

    public String getSecret() {
        return secret;
    }

    public void setSecret(String secret) {
        this.secret = secret;
    }

    public long getAccessTtlSeconds() {
        return accessTtlSeconds;
    }

    public void setAccessTtlSeconds(long accessTtlSeconds) {
        this.accessTtlSeconds = accessTtlSeconds;
    }

    public long getRefreshTtlSeconds() {
        return refreshTtlSeconds;
    }

    public void setRefreshTtlSeconds(long refreshTtlSeconds) {
        this.refreshTtlSeconds = refreshTtlSeconds;
    }

    public String getIssuer() {
        return issuer;
    }

    public void setIssuer(String issuer) {
        this.issuer = issuer;
    }
}
