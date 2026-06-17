package com.smartwarehouse.sys.api;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 系统管理接口契约。
 *
 * <p>DTO 字段贴近 V02 数据库设计，后续从内存仓库切换到 MySQL 实体时可以保持接口稳定。</p>
 */
public final class SysDtos {

    private SysDtos() {
    }

    public record LoginUserView(Long userId, String username, String nickname, List<String> roles,
                                List<String> permissions, List<Long> warehouseIds) {
    }

    public record UserView(Long id, String username, String nickname, String phone, String email, Long deptId,
                           Long postId, String status, List<String> roles, List<Long> warehouseIds,
                           LocalDateTime lastLoginTime, String lastLoginIp) {
    }

    public record UserSaveRequest(String username, String password, String nickname, String phone, String email,
                                  Long deptId, Long postId, String status) {
    }

    public record UserQueryRequest(String username, String nickname, String phone, String status) {
    }

    public record StatusUpdateRequest(String status) {
    }

    public record IdsRequest(List<Long> ids) {
        public IdsRequest {
            ids = ids == null ? List.of() : List.copyOf(ids);
        }
    }

    public record RoleView(Long id, String roleCode, String roleName, String dataScope, String status, String remark,
                           List<Long> menuIds) {
    }

    public record RoleSaveRequest(String roleCode, String roleName, String dataScope, String status, String remark) {
    }

    public record MenuView(Long id, Long parentId, String menuName, String menuType, String moduleCode, String path,
                           String component, String permission, String icon, Integer sortNo, Boolean visible,
                           String status, List<MenuView> children) {
    }

    public record MenuSaveRequest(Long parentId, String menuName, String menuType, String moduleCode, String path,
                                  String component, String permission, String icon, Integer sortNo,
                                  Boolean visible, String status) {
    }

    public record DeptView(Long id, Long parentId, String deptCode, String deptName, Integer sortNo, String status,
                           List<DeptView> children) {
    }

    public record DeptSaveRequest(Long parentId, String deptCode, String deptName, Integer sortNo, String status) {
    }

    public record PostView(Long id, String postCode, String postName, Integer sortNo, String status) {
    }

    public record PostSaveRequest(String postCode, String postName, Integer sortNo, String status) {
    }

    public record DictTypeView(Long id, String dictCode, String dictName, String status) {
    }

    public record DictTypeSaveRequest(String dictCode, String dictName, String status) {
    }

    public record DictItemView(Long id, String dictCode, String itemLabel, String itemValue, Integer sortNo, String status) {
    }

    public record DictItemSaveRequest(String dictCode, String itemLabel, String itemValue, Integer sortNo, String status) {
    }

    public record FrontendModuleView(Long id, String moduleCode, String moduleName, String routePrefix, String entryUrl,
                                     String remoteName, String remoteEntry, String exposedModule, String apiPrefix,
                                     String ownerType, String ownerName, String status, Integer sortNo) {
    }

    public record FrontendModuleSaveRequest(String moduleCode, String moduleName, String routePrefix, String entryUrl,
                                            String remoteName, String remoteEntry, String exposedModule, String apiPrefix,
                                            String ownerType, String ownerName, String status, Integer sortNo) {
    }

    public record PortalProfileView(Long userId, String username, String nickname, List<String> roles,
                                    List<String> permissions, List<Long> warehouseIds,
                                    LocalDateTime lastLoginTime, String lastLoginIp) {
    }

    public record PortalNoticeView(Long id, String title, String content, String level, LocalDateTime publishedTime) {
    }

    public record PortalWorkbenchView(PortalProfileView profile, List<PortalNoticeView> notices,
                                      List<FrontendModuleView> commonModules, List<FrontendModuleView> recentModules,
                                      List<LoginLogView> loginRecords) {
    }

    public record PortalAccessLogRequest(String moduleCode, String routePath) {
    }

    public record LoginLogView(Long id, String username, Long userId, String loginIp, String userAgent,
                               String loginStatus, String failReason, LocalDateTime loginTime, String traceId) {
    }

    public record OperLogView(Long id, Long userId, String username, String module, String operation,
                              String requestUri, String requestMethod, String resultStatus, String errorMessage,
                              Long costMs, String operIp, String traceId, LocalDateTime createdTime) {
    }

    public record RiskRecordView(Long id, String riskType, String riskTarget, String riskLevel, String action,
                                 String reason, String expireTime, String extraJson, LocalDateTime createdTime) {
    }
}
