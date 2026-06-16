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

    public PageResult<UserView> users(PageQuery query) {
        return repository.pageUsers(query);
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

    public PageResult<RoleView> roles(PageQuery query) {
        return repository.pageRoles(query);
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

    public DeptView saveDept(Long id, DeptSaveRequest request) {
        return repository.saveDept(id, request);
    }

    public void deleteDept(Long id) {
        repository.deleteDept(id);
    }

    public PageResult<PostView> posts(PageQuery query) {
        return repository.pagePosts(query);
    }

    public PostView savePost(Long id, PostSaveRequest request) {
        return repository.savePost(id, request);
    }

    public void deletePost(Long id) {
        repository.deletePost(id);
    }

    public PageResult<DictTypeView> dictTypes(PageQuery query) {
        return repository.pageDictTypes(query);
    }

    public DictTypeView saveDictType(Long id, DictTypeSaveRequest request) {
        return repository.saveDictType(id, request);
    }

    public void deleteDictType(Long id) {
        repository.deleteDictType(id);
    }

    public List<DictItemView> dictItems(String dictCode) {
        return repository.listDictItems(dictCode);
    }

    public DictItemView saveDictItem(Long id, DictItemSaveRequest request) {
        return repository.saveDictItem(id, request);
    }

    public void deleteDictItem(Long id) {
        repository.deleteDictItem(id);
    }

    public PageResult<FrontendModuleView> frontendModules(PageQuery query) {
        return repository.pageFrontendModules(query);
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

    public List<LoginLogView> loginLogs() {
        return repository.loginLogs();
    }

    public List<OperLogView> operLogs() {
        return repository.operLogs();
    }

    public List<RiskRecordView> riskRecords() {
        return repository.riskRecords();
    }
}
