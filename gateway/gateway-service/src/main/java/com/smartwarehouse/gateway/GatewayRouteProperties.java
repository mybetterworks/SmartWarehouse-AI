package com.smartwarehouse.gateway;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * 网关下游服务地址配置。
 *
 * <p>本地开发默认指向各服务端口；测试和正式环境通过 Nacos、环境变量或容器配置覆盖。</p>
 */
@ConfigurationProperties(prefix = "smartwarehouse.gateway.routes")
public record GatewayRouteProperties(String sys, String wms, String mes, String task, String ai) {

    public GatewayRouteProperties {
        sys = defaultUri(sys, "http://127.0.0.1:9201");
        wms = defaultUri(wms, "http://127.0.0.1:9202");
        mes = defaultUri(mes, "http://127.0.0.1:9203");
        task = defaultUri(task, "http://127.0.0.1:9204");
        ai = defaultUri(ai, "http://127.0.0.1:9205");
    }

    private static String defaultUri(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }
}
