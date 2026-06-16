package com.smartwarehouse.sys;

import com.smartwarehouse.platform.security.JwtProperties;
import com.smartwarehouse.sys.config.SysServiceProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

/**
 * sys-service 启动类。
 *
 * <p>V02 负责认证、登录风控、系统管理和审计日志，是后续 WMS/MES/AI 接入统一登录的基础。</p>
 */
@SpringBootApplication(scanBasePackages = {"com.smartwarehouse.sys", "com.smartwarehouse.platform"})
@EnableConfigurationProperties({JwtProperties.class, SysServiceProperties.class})
public class SysServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(SysServiceApplication.class, args);
    }
}
