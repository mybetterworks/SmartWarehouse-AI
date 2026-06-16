package com.smartwarehouse.gateway.config;

import com.smartwarehouse.gateway.GatewayRouteProperties;
import com.smartwarehouse.platform.security.JwtProperties;
import com.smartwarehouse.platform.security.JwtTokenService;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * 网关基础配置。
 *
 * <p>V02 使用固定路由完成本地联调；后续可替换为 Nacos 服务发现路由或动态路由配置。</p>
 */
@Configuration
public class GatewayConfig {

    @Bean
    public JwtTokenService jwtTokenService(JwtProperties properties) {
        return new JwtTokenService(properties);
    }

    @Bean
    public RouteLocator smartWarehouseRoutes(RouteLocatorBuilder builder, GatewayRouteProperties routes) {
        return builder.routes()
                .route("sys-route", route -> route.path("/api/sys/**").uri(routes.sys()))
                .route("wms-route", route -> route.path("/api/wms/**").filters(filter -> filter.setStatus(HttpStatus.SERVICE_UNAVAILABLE)).uri(routes.wms()))
                .route("mes-route", route -> route.path("/api/mes/**").filters(filter -> filter.setStatus(HttpStatus.SERVICE_UNAVAILABLE)).uri(routes.mes()))
                .route("task-route", route -> route.path("/api/task/**").filters(filter -> filter.setStatus(HttpStatus.SERVICE_UNAVAILABLE)).uri(routes.task()))
                .route("ai-route", route -> route.path("/api/ai/**").filters(filter -> filter.setStatus(HttpStatus.SERVICE_UNAVAILABLE)).uri(routes.ai()))
                .build();
    }

    @Bean
    public CorsWebFilter corsWebFilter() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of("*"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setExposedHeaders(List.of("X-Trace-Id"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return new CorsWebFilter(source);
    }
}
