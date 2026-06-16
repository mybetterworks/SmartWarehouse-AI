package com.smartwarehouse.platform.security;

import java.util.List;

/**
 * 登录用户上下文。
 *
 * <p>这里保留权限、角色和仓库数据权限，既能支撑 gateway/sys 的鉴权，也能让后续业务服务
 * 通过 Header 或 Token claims 获得基础身份信息。</p>
 */
public record LoginUser(
        Long userId,
        String username,
        String nickname,
        List<String> roles,
        List<String> permissions,
        List<Long> warehouseIds
) {
    public LoginUser {
        roles = roles == null ? List.of() : List.copyOf(roles);
        permissions = permissions == null ? List.of() : List.copyOf(permissions);
        warehouseIds = warehouseIds == null ? List.of() : List.copyOf(warehouseIds);
    }
}
