package com.smartwarehouse.platform.core;

/**
 * 统一接口响应体。
 *
 * <p>V02 先让 gateway、sys-service 和前端 SDK 对齐同一种响应结构，后续 WMS、MES、AI
 * 只要复用这个结构，就能减少前端针对不同乙方接口做适配的成本。</p>
 */
public record R<T>(String code, String message, T data, String traceId) {

    public static final String SUCCESS_CODE = "SUCCESS";

    public static <T> R<T> ok(T data) {
        return new R<>(SUCCESS_CODE, "success", data, TraceIdHolder.get());
    }

    public static R<Void> ok() {
        return ok(null);
    }

    public static <T> R<T> fail(String code, String message) {
        return new R<>(code, message, null, TraceIdHolder.get());
    }
}
