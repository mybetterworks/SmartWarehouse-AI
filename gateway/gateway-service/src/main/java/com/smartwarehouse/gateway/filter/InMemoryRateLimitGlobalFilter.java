package com.smartwarehouse.gateway.filter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartwarehouse.platform.core.ErrorCode;
import com.smartwarehouse.platform.core.R;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * V02 基础限流过滤器。
 *
 * <p>正式环境建议用 Sentinel Gateway 或 Redis 令牌桶；这里用内存窗口先验证网关限流链路和降级响应格式。</p>
 */
@Component
public class InMemoryRateLimitGlobalFilter implements GlobalFilter, Ordered {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();
    private static final int LIMIT_PER_MINUTE = 600;

    private final Map<String, WindowCounter> counters = new ConcurrentHashMap<>();

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String ip = exchange.getRequest().getRemoteAddress() == null
                ? "unknown"
                : exchange.getRequest().getRemoteAddress().getAddress().getHostAddress();
        String key = ip + ":" + exchange.getRequest().getPath().value();
        WindowCounter counter = counters.compute(key, (ignored, old) -> {
            long nowMinute = Instant.now().getEpochSecond() / 60;
            if (old == null || old.minute() != nowMinute) {
                return new WindowCounter(nowMinute, new AtomicInteger(1));
            }
            old.count().incrementAndGet();
            return old;
        });
        if (counter.count().get() > LIMIT_PER_MINUTE) {
            return writeJson(exchange);
        }
        return chain.filter(exchange);
    }

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE + 10;
    }

    private Mono<Void> writeJson(ServerWebExchange exchange) {
        try {
            exchange.getResponse().setStatusCode(HttpStatus.TOO_MANY_REQUESTS);
            exchange.getResponse().getHeaders().setContentType(MediaType.APPLICATION_JSON);
            byte[] bytes = OBJECT_MAPPER.writeValueAsString(R.fail("RATE_LIMITED", "请求过于频繁，请稍后重试"))
                    .getBytes(StandardCharsets.UTF_8);
            DataBuffer buffer = exchange.getResponse().bufferFactory().wrap(bytes);
            return exchange.getResponse().writeWith(Mono.just(buffer));
        } catch (Exception ex) {
            return exchange.getResponse().setComplete();
        }
    }

    private record WindowCounter(long minute, AtomicInteger count) {
    }
}
