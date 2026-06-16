package com.smartwarehouse.sys.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * sys-service 本地运行参数。
 *
 * <p>workerId 后续多实例部署时可由环境变量或 Pod 名称哈希生成，V02 先通过配置注入。</p>
 */
@ConfigurationProperties(prefix = "smartwarehouse.sys")
public record SysServiceProperties(long workerId) {

    public SysServiceProperties {
        if (workerId < 0) {
            workerId = 1;
        }
    }
}
