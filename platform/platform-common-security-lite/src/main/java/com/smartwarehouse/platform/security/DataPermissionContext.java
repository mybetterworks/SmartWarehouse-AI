package com.smartwarehouse.platform.security;

import java.util.List;

/**
 * 当前请求的数据权限上下文。
 *
 * <p>V02 主要由 sys-web 配置数据权限；真正的 SQL 过滤在后续 WMS/MES 查询中接入。</p>
 */
public record DataPermissionContext(DataScope scope, List<Long> warehouseIds, Long deptId, Long userId) {

    public DataPermissionContext {
        scope = scope == null ? DataScope.SELF : scope;
        warehouseIds = warehouseIds == null ? List.of() : List.copyOf(warehouseIds);
    }
}
