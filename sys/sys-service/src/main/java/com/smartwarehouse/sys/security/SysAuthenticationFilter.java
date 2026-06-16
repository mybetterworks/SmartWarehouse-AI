package com.smartwarehouse.sys.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartwarehouse.platform.core.ErrorCode;
import com.smartwarehouse.platform.core.R;
import com.smartwarehouse.platform.security.JwtClaims;
import com.smartwarehouse.platform.security.JwtTokenService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;

/**
 * sys-service 服务内认证过滤器。
 *
 * <p>商业系统不能只依赖网关鉴权，因为本地联调、测试环境或容器网络里可能直接访问后端端口。
 * 该过滤器保护 `/api/sys/**` 管理接口，公开登录、刷新、风控查询和验证码接口，其余接口必须携带 Access Token。</p>
 */
@Component
public class SysAuthenticationFilter extends OncePerRequestFilter {

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
    private final TokenBlacklistService tokenBlacklistService;

    public SysAuthenticationFilter(JwtTokenService jwtTokenService, TokenBlacklistService tokenBlacklistService) {
        this.jwtTokenService = jwtTokenService;
        this.tokenBlacklistService = tokenBlacklistService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String path = request.getRequestURI();
        if (!path.startsWith("/api/sys/") || isPublic(path) || "OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            String token = requiredToken(request);
            JwtClaims claims = jwtTokenService.parse(token);
            if (!"access".equals(claims.tokenType()) || tokenBlacklistService.contains(claims.jti())) {
                writeUnauthorized(response);
                return;
            }

            // 把身份摘要挂到 request，操作日志 AOP 可以直接读取，避免每个 Controller 重复解析 Token。
            request.setAttribute("loginUserId", claims.userId());
            request.setAttribute("loginUsername", claims.username());
            request.setAttribute("loginRoles", claims.roles());
            request.setAttribute("loginPermissions", claims.permissions());
            request.setAttribute("loginWarehouseIds", claims.warehouseIds());
            if (requiresSysManagementPermission(path) && !hasSysManagementPermission(claims)) {
                writeForbidden(response);
                return;
            }
            filterChain.doFilter(request, response);
        } catch (Exception ex) {
            writeUnauthorized(response);
        }
    }

    private boolean isPublic(String path) {
        return PUBLIC_PATHS.stream().anyMatch(path::startsWith);
    }

    private String requiredToken(HttpServletRequest request) {
        String token = jwtTokenService.extractBearerToken(request.getHeader(HttpHeaders.AUTHORIZATION));
        if (token != null && !token.isBlank()) {
            return token;
        }
        return request.getHeader("X-Access-Token");
    }

    private boolean requiresSysManagementPermission(String path) {
        if (path.startsWith("/api/sys/auth/")) {
            return false;
        }
        if ("/api/sys/menus/tree".equals(path)) {
            return false;
        }
        if ("/api/sys/frontend-modules/enabled".equals(path)) {
            return false;
        }
        return !path.startsWith("/api/sys/portal/");
    }

    private boolean hasSysManagementPermission(JwtClaims claims) {
        if (claims.roles().contains("ADMIN")) {
            return true;
        }
        return claims.permissions().stream().anyMatch(permission -> permission != null && permission.startsWith("sys:"));
    }

    private void writeUnauthorized(HttpServletResponse response) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write(OBJECT_MAPPER.writeValueAsString(
                R.fail(ErrorCode.UNAUTHORIZED.code(), ErrorCode.UNAUTHORIZED.message())));
    }

    private void writeForbidden(HttpServletResponse response) throws IOException {
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write(OBJECT_MAPPER.writeValueAsString(
                R.fail(ErrorCode.FORBIDDEN.code(), ErrorCode.FORBIDDEN.message())));
    }
}
