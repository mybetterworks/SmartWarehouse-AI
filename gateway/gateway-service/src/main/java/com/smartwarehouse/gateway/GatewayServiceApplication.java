package com.smartwarehouse.gateway;

import com.smartwarehouse.platform.security.JwtProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

/**
 * gateway-service 启动类。
 *
 * <p>网关是所有前端请求的统一入口，负责 TraceId、认证、限流、降级和路由转发。</p>
 */
@SpringBootApplication(scanBasePackages = {"com.smartwarehouse.gateway", "com.smartwarehouse.platform"})
@EnableConfigurationProperties({JwtProperties.class, GatewayRouteProperties.class})
public class GatewayServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(GatewayServiceApplication.class, args);
    }
}
