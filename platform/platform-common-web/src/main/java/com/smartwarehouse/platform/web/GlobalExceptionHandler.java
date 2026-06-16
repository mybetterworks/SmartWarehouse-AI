package com.smartwarehouse.platform.web;

import com.smartwarehouse.platform.core.BizException;
import com.smartwarehouse.platform.core.ErrorCode;
import com.smartwarehouse.platform.core.R;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * 统一异常处理器。
 *
 * <p>业务异常、参数异常和未知异常都转换成统一响应结构，前端 SDK 可以稳定解析 code/message/traceId。</p>
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BizException.class)
    @ResponseStatus(HttpStatus.OK)
    public R<Void> handleBizException(BizException ex) {
        return R.fail(ex.getCode(), ex.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.OK)
    public R<Void> handleValidationException(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(error -> error.getField() + " " + error.getDefaultMessage())
                .orElse(ErrorCode.PARAM_ERROR.message());
        return R.fail(ErrorCode.PARAM_ERROR.code(), message);
    }

    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public R<Void> handleException(Exception ex) {
        return R.fail(ErrorCode.SYSTEM_ERROR.code(), ex.getMessage());
    }
}
