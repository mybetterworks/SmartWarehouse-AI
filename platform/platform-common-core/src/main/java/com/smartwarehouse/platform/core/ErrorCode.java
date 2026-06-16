package com.smartwarehouse.platform.core;

/**
 * 平台级错误码。
 *
 * <p>先覆盖 V02 登录、风控、权限、参数校验和网关鉴权场景，后续业务模块可继续扩展业务错误码。</p>
 */
public enum ErrorCode {
    PARAM_ERROR("PARAM_ERROR", "参数错误"),
    UNAUTHORIZED("UNAUTHORIZED", "未登录或登录已过期"),
    FORBIDDEN("FORBIDDEN", "无访问权限"),
    LOGIN_FAILED("LOGIN_FAILED", "账号或密码错误"),
    CAPTCHA_REQUIRED("CAPTCHA_REQUIRED", "需要完成拼图验证码"),
    CAPTCHA_INVALID("CAPTCHA_INVALID", "拼图验证码无效"),
    ACCOUNT_LOCKED("ACCOUNT_LOCKED", "账号已被锁定"),
    IP_LOCKED("IP_LOCKED", "当前 IP 登录失败过多"),
    DATA_NOT_FOUND("DATA_NOT_FOUND", "数据不存在"),
    SYSTEM_ERROR("SYSTEM_ERROR", "系统异常");

    private final String code;
    private final String message;

    ErrorCode(String code, String message) {
        this.code = code;
        this.message = message;
    }

    public String code() {
        return code;
    }

    public String message() {
        return message;
    }
}
