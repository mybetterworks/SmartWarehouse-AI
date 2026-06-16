package com.smartwarehouse.gateway.filter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartwarehouse.platform.core.ErrorCode;
import com.smartwarehouse.platform.core.R;
import com.smartwarehouse.platform.redis.RedisKeys;
import com.smartwarehouse.platform.security.JwtClaims;
import com.smartwarehouse.platform.security.JwtTokenService;
import org.springframework.data.redis.core.ReactiveStringRedisTemplate;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.util.List;

/**
 * JWT 认证过滤器。
 *
 * <p>网关只放行公开认证接口和健康检查，其余请求必须携带 Access Token。
 * Token 黑名单在 V02 由 sys-service 验证，正式多实例应切到 Redis 共享黑名单。</p>
 */
@Component
public class JwtAuthGlobalFilter implements GlobalFilter, Ordered {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();
    private static final List<String> PUBLIC_PATHS = List.of(
            "/api/sys/auth/login",
            "/api/sys/auth/refresh",
            "/api/sys/auth/risk-state",
            "/api/sys/auth/captcha/jigsaw",
            "/api/sys/auth/captcha/verify",
            "/actuator/health"
    );

    private final JwtTokenService jwtTokenService;
    private final ReactiveStringRedisTemplate redisTemplate;

    public JwtAuthGlobalFilter(JwtTokenService jwtTokenService, ReactiveStringRedisTemplate redisTemplate) {
        this.jwtTokenService = jwtTokenService;
        this.redisTemplate = redisTemplate;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String path = exchange.getRequest().getPath().value();
        if (isPublic(path) || "OPTIONS".equalsIgnoreCase(exchange.getRequest().getMethod().name())) {
            return chain.filter(exchange);
        }

        String token = extractToken(exchange);
        if (token == null || token.isBlank()) {
            return unauthorized(exchange);
        }

        try {
            JwtClaims claims = jwtTokenService.parse(token);
            if (!"access".equals(claims.tokenType())) {
                return unauthorized(exchange);
            }
            return blacklisted(claims.jti())
                    .flatMap(blacklisted -> {
                        if (blacklisted) {
                            return unauthorized(exchange);
                        }
                        ServerHttpRequest request = exchange.getRequest().mutate()
                                // 统一向下游补齐 Authorization，兼容只读取标准 Bearer Token 的服务。
                                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                                .header("X-User-Id", String.valueOf(claims.userId()))
                                .header("X-Username", claims.username())
                                .header("X-Roles", String.join(",", claims.roles()))
                                .header("X-Warehouse-Ids", claims.warehouseIds().toString())
                                .build();
                        return chain.filter(exchange.mutate().request(request).build());
                    });
        } catch (Exception ex) {
            return unauthorized(exchange);
        }
    }

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE + 20;
    }

    private boolean isPublic(String path) {
        return PUBLIC_PATHS.stream().anyMatch(path::startsWith);
    }

    private String extractToken(ServerWebExchange exchange) {
        String authorization = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        String token = jwtTokenService.extractBearerToken(authorization);
        if (token != null && !token.isBlank()) {
            return token;
        }
        return exchange.getRequest().getHeaders().getFirst("X-Access-Token");
    }

    private Mono<Boolean> blacklisted(String jti) {
        return redisTemplate.hasKey(RedisKeys.tokenBlacklist(jti)).onErrorReturn(false);
    }

    private Mono<Void> unauthorized(ServerWebExchange exchange) {
        return writeJson(exchange, HttpStatus.UNAUTHORIZED, R.fail(ErrorCode.UNAUTHORIZED.code(), ErrorCode.UNAUTHORIZED.message()));
    }

    private Mono<Void> writeJson(ServerWebExchange exchange, HttpStatus status, R<Void> body) {
        try {
            exchange.getResponse().setStatusCode(status);
            exchange.getResponse().getHeaders().setContentType(MediaType.APPLICATION_JSON);
            byte[] bytes = OBJECT_MAPPER.writeValueAsString(body).getBytes(StandardCharsets.UTF_8);
            DataBuffer buffer = exchange.getResponse().bufferFactory().wrap(bytes);
            return exchange.getResponse().writeWith(Mono.just(buffer));
        } catch (Exception ex) {
            return exchange.getResponse().setComplete();
        }
    }
}
