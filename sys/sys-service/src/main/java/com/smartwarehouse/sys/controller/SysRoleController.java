package com.smartwarehouse.sys.controller;

import com.smartwarehouse.platform.core.PageQuery;
import com.smartwarehouse.platform.core.PageResult;
import com.smartwarehouse.platform.core.R;
import com.smartwarehouse.platform.log.OperationLog;
import com.smartwarehouse.sys.api.SysDtos.IdsRequest;
import com.smartwarehouse.sys.api.SysDtos.RoleSaveRequest;
import com.smartwarehouse.sys.api.SysDtos.RoleView;
import com.smartwarehouse.sys.application.SysManagementService;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * 角色管理接口。
 */
@RestController
@RequestMapping("/api/sys/roles")
public class SysRoleController {

    private final SysManagementService service;

    public SysRoleController(SysManagementService service) {
        this.service = service;
    }

    @GetMapping
    public R<PageResult<RoleView>> roles(@RequestParam(required = false) Integer pageNo,
                                         @RequestParam(required = false) Integer pageSize) {
        return R.ok(service.roles(PageQuery.of(pageNo, pageSize)));
    }

    @PostMapping
    @OperationLog(module = "sys", operation = "新增角色")
    public R<RoleView> createRole(@RequestBody RoleSaveRequest request) {
        return R.ok(service.saveRole(null, request));
    }

    @PutMapping("/{id}")
    @OperationLog(module = "sys", operation = "修改角色")
    public R<RoleView> updateRole(@PathVariable Long id, @RequestBody RoleSaveRequest request) {
        return R.ok(service.saveRole(id, request));
    }

    @DeleteMapping("/{id}")
    @OperationLog(module = "sys", operation = "删除角色")
    public R<Void> deleteRole(@PathVariable Long id) {
        service.deleteRole(id);
        return R.ok();
    }

    @PutMapping("/{id}/menus")
    @OperationLog(module = "sys", operation = "分配角色菜单")
    public R<Void> updateRoleMenus(@PathVariable Long id, @RequestBody IdsRequest request) {
        service.updateRoleMenus(id, request);
        return R.ok();
    }
}
