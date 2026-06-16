package com.smartwarehouse.platform.web;

import com.smartwarehouse.platform.core.TraceIdHolder;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * WebMVC TraceId 过滤器。
 *
 * <p>所有 sys-service 请求都会带上 X-Trace-Id 响应头，后续操作日志、登录日志和问题排查都能按 traceId 串起来。</p>
 */
public class TraceIdFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            TraceIdHolder.set(request.getHeader(TraceIdHolder.TRACE_HEADER));
            response.setHeader(TraceIdHolder.TRACE_HEADER, TraceIdHolder.get());
            filterChain.doFilter(request, response);
        } finally {
            TraceIdHolder.clear();
        }
    }
}
