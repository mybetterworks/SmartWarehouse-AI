package com.smartwarehouse.platform.core;

import java.util.UUID;

/**
 * 当前线程 TraceId 上下文。
 *
 * <p>V02 的 WebMVC 服务使用 ThreadLocal 保存 traceId；gateway 是 WebFlux，单独在响应头里透传。
 * 后续接入日志链路时可替换为 MDC 或 OpenTelemetry。</p>
 */
public final class TraceIdHolder {

    public static final String TRACE_HEADER = "X-Trace-Id";
    private static final ThreadLocal<String> TRACE_ID = new ThreadLocal<>();

    private TraceIdHolder() {
    }

    public static String get() {
        String value = TRACE_ID.get();
        if (value == null || value.isBlank()) {
            value = create();
            TRACE_ID.set(value);
        }
        return value;
    }

    public static void set(String traceId) {
        TRACE_ID.set((traceId == null || traceId.isBlank()) ? create() : traceId);
    }

    public static String create() {
        return "trace-" + UUID.randomUUID().toString().replace("-", "");
    }

    public static void clear() {
        TRACE_ID.remove();
    }
}
