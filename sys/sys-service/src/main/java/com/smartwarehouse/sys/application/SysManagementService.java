package com.smartwarehouse.sys.application;

import com.smartwarehouse.platform.core.PageQuery;
import com.smartwarehouse.platform.core.PageResult;
import com.smartwarehouse.sys.api.SysDtos.*;
import com.smartwarehouse.sys.infrastructure.SysRepository;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 系统管理应用服务。
 *
 * <p>Controller 不直接操作仓库，便于后续在这里补充操作日志、权限校验、事务和数据权限 SQL。</p>
 */
@Service
public class SysManagementService {

    private final SysRepository repository;

    public SysManagementService(SysRepository repository) {
        this.repository = repository;
    }

    public PageResult<UserView> users(PageQuery query, UserQueryRequest request) {
        return repository.pageUsers(query, request);
    }

    public UserView saveUser(Long id, UserSaveRequest request) {
        return repository.saveUser(id, request);
    }

    public void deleteUser(Long id) {
        repository.deleteUser(id);
    }

    public UserView updateUserStatus(Long id, StatusUpdateRequest request) {
        return repository.updateUserStatus(id, request.status());
    }

    public void updateUserRoles(Long id, IdsRequest request) {
        repository.updateUserRoles(id, request.ids());
    }

    public void updateUserWarehouses(Long id, IdsRequest request) {
        repository.updateUserWarehouses(id, request.ids());
    }

    public PageResult<RoleView> roles(PageQuery query, RoleQueryRequest request) {
        return repository.pageRoles(query, request);
    }

    public List<RoleView> allRoles() {
        return repository.listRoles();
    }

    public RoleView saveRole(Long id, RoleSaveRequest request) {
        return repository.saveRole(id, request);
    }

    public void deleteRole(Long id) {
        repository.deleteRole(id);
    }

    public void updateRoleMenus(Long id, IdsRequest request) {
        repository.updateRoleMenus(id, request.ids());
    }

    public List<MenuView> menuTree() {
        return repository.menuTree();
    }

    public PageResult<MenuView> menus(PageQuery query, MenuQueryRequest request) {
        return repository.pageMenus(query, request);
    }

    public List<MenuView> menuTreeForUser(Long userId) {
        return repository.menuTreeForUser(userId);
    }

    public MenuView saveMenu(Long id, MenuSaveRequest request) {
        return repository.saveMenu(id, request);
    }

    public void deleteMenu(Long id) {
        repository.deleteMenu(id);
    }

    public List<DeptView> deptTree() {
        return repository.deptTree();
    }

    public PageResult<DeptView> depts(PageQuery query, DeptQueryRequest request) {
        return repository.pageDepts(query, request);
    }

    public DeptView saveDept(Long id, DeptSaveRequest request) {
        return repository.saveDept(id, request);
    }

    public void deleteDept(Long id) {
        repository.deleteDept(id);
    }

    public PageResult<PostView> posts(PageQuery query, PostQueryRequest request) {
        return repository.pagePosts(query, request);
    }

    public List<PostView> allPosts() {
        return repository.listPosts();
    }

    public PostView savePost(Long id, PostSaveRequest request) {
        return repository.savePost(id, request);
    }

    public void deletePost(Long id) {
        repository.deletePost(id);
    }

    public PageResult<DictTypeView> dictTypes(PageQuery query, DictTypeQueryRequest request) {
        return repository.pageDictTypes(query, request);
    }

    public DictTypeView saveDictType(Long id, DictTypeSaveRequest request) {
        return repository.saveDictType(id, request);
    }

    public void deleteDictType(Long id) {
        repository.deleteDictType(id);
    }

    public PageResult<DictItemView> dictItems(PageQuery query, DictItemQueryRequest request) {
        return repository.pageDictItems(query, request);
    }

    public DictItemView saveDictItem(Long id, DictItemSaveRequest request) {
        return repository.saveDictItem(id, request);
    }

    public void deleteDictItem(Long id) {
        repository.deleteDictItem(id);
    }

    public PageResult<FrontendModuleView> frontendModules(PageQuery query, FrontendModuleQueryRequest request) {
        return repository.pageFrontendModules(query, request);
    }

    public List<FrontendModuleView> enabledFrontendModules() {
        return repository.listEnabledFrontendModules();
    }

    public List<FrontendModuleView> enabledFrontendModulesForUser(Long userId) {
        return repository.listEnabledFrontendModulesForUser(userId);
    }

    public FrontendModuleView saveFrontendModule(Long id, FrontendModuleSaveRequest request) {
        return repository.saveFrontendModule(id, request);
    }

    public void deleteFrontendModule(Long id) {
        repository.deleteFrontendModule(id);
    }

    public PortalWorkbenchView portalWorkbench(Long userId) {
        return repository.loadPortalWorkbench(userId);
    }

    public void recordPortalAccess(Long userId, PortalAccessLogRequest request) {
        if (request == null || request.moduleCode() == null || request.moduleCode().isBlank()) {
            return;
        }
        if ("portal".equalsIgnoreCase(request.moduleCode())) {
            return;
        }
        repository.appendPortalAccessLog(userId, request.moduleCode(), request.routePath());
    }

    public PageResult<LoginLogView> loginLogs(PageQuery query, LoginLogQueryRequest request) {
        return repository.pageLoginLogs(query, request);
    }

    public PageResult<OperLogView> operLogs(PageQuery query, OperLogQueryRequest request) {
        return repository.pageOperLogs(query, request);
    }

    public PageResult<RiskRecordView> riskRecords(PageQuery query, RiskRecordQueryRequest request) {
        return repository.pageRiskRecords(query, request);
    }
}
