package com.smartwarehouse.sys.log;

import com.smartwarehouse.platform.core.TraceIdHolder;
import com.smartwarehouse.platform.log.OperationLog;
import com.smartwarehouse.sys.infrastructure.SysRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

/**
 * 系统操作日志切面。
 *
 * <p>Controller 方法标记 {@link OperationLog} 后，本切面自动记录用户、模块、操作、URI、请求方式、
 * 执行结果、耗时和 traceId。这样业务代码只关注业务动作，审计逻辑统一沉淀在基础能力里。</p>
 */
@Aspect
@Component
public class SysOperationLogAspect {

    private final SysRepository repository;

    public SysOperationLogAspect(SysRepository repository) {
        this.repository = repository;
    }

    @Around("@annotation(operationLog)")
    public Object around(ProceedingJoinPoint joinPoint, OperationLog operationLog) throws Throwable {
        long start = System.currentTimeMillis();
        HttpServletRequest request = currentRequest();
        try {
            Object result = joinPoint.proceed();
            appendLog(request, operationLog, "SUCCESS", null, System.currentTimeMillis() - start);
            return result;
        } catch (Throwable ex) {
            appendLog(request, operationLog, "FAILED", ex.getMessage(), System.currentTimeMillis() - start);
            throw ex;
        }
    }

    private void appendLog(HttpServletRequest request, OperationLog operationLog, String status, String errorMessage, long costMs) {
        Long userId = request == null ? null : (Long) request.getAttribute("loginUserId");
        String username = request == null ? null : String.valueOf(request.getAttribute("loginUsername"));
        if ("null".equals(username)) {
            username = null;
        }
        repository.appendOperLog(
                userId,
                username,
                operationLog.module(),
                operationLog.operation(),
                request == null ? "" : request.getRequestURI(),
                request == null ? "" : request.getMethod(),
                status,
                errorMessage,
                costMs,
                clientIp(request),
                TraceIdHolder.get()
        );
    }

    private HttpServletRequest currentRequest() {
        if (RequestContextHolder.getRequestAttributes() instanceof ServletRequestAttributes attributes) {
            return attributes.getRequest();
        }
        return null;
    }

    private String clientIp(HttpServletRequest request) {
        if (request == null) {
            return "";
        }
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
