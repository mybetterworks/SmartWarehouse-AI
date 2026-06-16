package com.smartwarehouse.platform.core;

/**
 * 业务异常。
 *
 * <p>Controller 和网关过滤器只抛 BizException，由统一异常处理器转换成 {@link R}，
 * 避免每个接口都手写 try/catch。</p>
 */
public class BizException extends RuntimeException {

    private final String code;

    public BizException(ErrorCode errorCode) {
        this(errorCode.code(), errorCode.message());
    }

    public BizException(String code, String message) {
        super(message);
        this.code = code;
    }

    public String getCode() {
        return code;
    }
}
