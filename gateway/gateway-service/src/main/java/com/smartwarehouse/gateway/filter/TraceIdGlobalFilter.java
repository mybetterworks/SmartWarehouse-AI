package com.smartwarehouse.gateway.filter;

import com.smartwarehouse.platform.core.TraceIdHolder;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

/**
 * 网关 TraceId 过滤器。
 *
 * <p>TraceId 在网关生成并透传给下游服务，日志、前端报错和后端排查都能用同一个链路号关联。</p>
 */
@Component
public class TraceIdGlobalFilter implements GlobalFilter, Ordered {

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String traceId = exchange.getRequest().getHeaders().getFirst(TraceIdHolder.TRACE_HEADER);
        if (traceId == null || traceId.isBlank()) {
            traceId = TraceIdHolder.create();
        }
        ServerHttpRequest request = exchange.getRequest().mutate()
                .header(TraceIdHolder.TRACE_HEADER, traceId)
                .build();
        exchange.getResponse().getHeaders().set(TraceIdHolder.TRACE_HEADER, traceId);
        return chain.filter(exchange.mutate().request(request).build());
    }

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE;
    }
}
