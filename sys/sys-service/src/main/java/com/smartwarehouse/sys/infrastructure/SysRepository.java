package com.smartwarehouse.sys.infrastructure;

import com.smartwarehouse.platform.core.PageQuery;
import com.smartwarehouse.platform.core.PageResult;
import com.smartwarehouse.sys.api.SysDtos.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 系统管理仓库契约。
 *
 * <p>Controller 和应用服务只依赖这个接口，不关心底层是 JDBC、MyBatis 还是远程数据服务。
 * V02 商业化修正后默认使用 {@link JdbcSysRepository} 连接 Docker MySQL，保留接口可以降低后续替换 ORM 的成本。</p>
 */
public interface SysRepository {

    UserRecord findUserByUsername(String username);

    UserRecord findUserById(Long id);

    LoginUserView toLoginUser(UserRecord user);

    boolean passwordMatches(UserRecord user, String rawPassword);

    void updatePassword(Long userId, String rawPassword);

    void updateLoginSuccess(Long userId, String ip);

    PageResult<UserView> pageUsers(PageQuery query);

    UserView saveUser(Long id, UserSaveRequest request);

    void deleteUser(Long id);

    UserView updateUserStatus(Long id, String status);

    void updateUserRoles(Long userId, List<Long> roleIds);

    void updateUserWarehouses(Long userId, List<Long> warehouseIds);

    PageResult<RoleView> pageRoles(PageQuery query);

    RoleView saveRole(Long id, RoleSaveRequest request);

    void deleteRole(Long id);

    void updateRoleMenus(Long roleId, List<Long> menuIds);

    List<MenuView> menuTree();

    List<MenuView> menuTreeForUser(Long userId);

    MenuView saveMenu(Long id, MenuSaveRequest request);

    void deleteMenu(Long id);

    List<DeptView> deptTree();

    DeptView saveDept(Long id, DeptSaveRequest request);

    void deleteDept(Long id);

    PageResult<PostView> pagePosts(PageQuery query);

    PostView savePost(Long id, PostSaveRequest request);

    void deletePost(Long id);

    PageResult<DictTypeView> pageDictTypes(PageQuery query);

    DictTypeView saveDictType(Long id, DictTypeSaveRequest request);

    void deleteDictType(Long id);

    List<DictItemView> listDictItems(String dictCode);

    DictItemView saveDictItem(Long id, DictItemSaveRequest request);

    void deleteDictItem(Long id);

    PageResult<FrontendModuleView> pageFrontendModules(PageQuery query);

    List<FrontendModuleView> listEnabledFrontendModules();

    List<FrontendModuleView> listEnabledFrontendModulesForUser(Long userId);

    FrontendModuleView saveFrontendModule(Long id, FrontendModuleSaveRequest request);

    void deleteFrontendModule(Long id);

    PortalWorkbenchView loadPortalWorkbench(Long userId);

    void appendPortalAccessLog(Long userId, String moduleCode, String routePath);

    List<LoginLogView> loginLogs();

    List<OperLogView> operLogs();

    List<RiskRecordView> riskRecords();

    void appendLoginLog(String username, Long userId, String ip, String userAgent, String status,
                        String failReason, String traceId);

    void appendOperLog(Long userId, String username, String module, String operation, String uri,
                       String method, String resultStatus, String errorMessage, long costMs, String ip,
                       String traceId);

    void appendRiskRecord(String type, String target, String level, String action, String reason, String expireTime,
                          String extraJson);

    /**
     * 登录认证需要读取的最小用户记录。
     *
     * <p>密码哈希只在服务端内部比较，不返回给 Controller 或前端，避免泄露敏感字段。</p>
     */
    record UserRecord(Long id, String username, String passwordHash, String nickname, String phone, String email,
                      Long deptId, Long postId, String status, LocalDateTime lastLoginTime, String lastLoginIp) {
    }
}
