package com.smartwarehouse.sys.config;

import com.smartwarehouse.platform.id.SnowflakeIdGenerator;
import com.smartwarehouse.platform.security.JwtProperties;
import com.smartwarehouse.platform.security.JwtTokenService;
import com.smartwarehouse.platform.web.TraceIdFilter;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;

/**
 * sys-service 基础 Bean 配置。
 *
 * <p>把 JWT、ID 和 TraceId 这些平台能力集中注册，业务 Controller 只关注业务流程。</p>
 */
@Configuration
public class SysBeanConfig {

    @Bean
    public JwtTokenService jwtTokenService(JwtProperties properties) {
        return new JwtTokenService(properties);
    }

    @Bean
    public SnowflakeIdGenerator snowflakeIdGenerator(SysServiceProperties properties) {
        return new SnowflakeIdGenerator(properties.workerId());
    }

    @Bean
    public FilterRegistrationBean<TraceIdFilter> traceIdFilter() {
        FilterRegistrationBean<TraceIdFilter> registration = new FilterRegistrationBean<>(new TraceIdFilter());
        registration.setOrder(Ordered.HIGHEST_PRECEDENCE);
        registration.addUrlPatterns("/*");
        return registration;
    }
}
