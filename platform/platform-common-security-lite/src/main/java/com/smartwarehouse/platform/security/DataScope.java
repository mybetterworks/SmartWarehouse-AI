package com.smartwarehouse.platform.security;

/**
 * 数据权限范围。
 *
 * <p>V02 在 sys 中维护配置，V03 起 WMS 会按 WAREHOUSE 等范围过滤仓储数据。</p>
 */
public enum DataScope {
    ALL,
    DEPT,
    DEPT_AND_CHILD,
    SELF,
    WAREHOUSE
}
