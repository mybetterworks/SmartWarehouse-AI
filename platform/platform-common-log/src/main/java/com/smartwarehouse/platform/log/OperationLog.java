package com.smartwarehouse.platform.log;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 操作日志标记注解。
 *
 * <p>V02 先作为 Controller 关键操作的语义标记，后续可通过 AOP 写入 sys_oper_log。</p>
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface OperationLog {

    /**
     * 业务模块，例如 sys、wms、mes、task、ai。
     */
    String module();

    /**
     * 操作名称，例如“新增用户”“角色授权”。
     */
    String operation();
}
