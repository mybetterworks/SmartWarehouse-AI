package com.smartwarehouse.sys.controller;

import com.smartwarehouse.platform.core.PageQuery;
import com.smartwarehouse.platform.core.PageResult;
import com.smartwarehouse.platform.core.R;
import com.smartwarehouse.platform.log.OperationLog;
import com.smartwarehouse.sys.api.SysDtos.IdsRequest;
import com.smartwarehouse.sys.api.SysDtos.StatusUpdateRequest;
import com.smartwarehouse.sys.api.SysDtos.UserSaveRequest;
import com.smartwarehouse.sys.api.SysDtos.UserView;
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
 * 用户管理接口。
 *
 * <p>用户、角色、菜单、组织等接口按业务模块拆分 Controller，避免商业系统后期把所有 sys 功能堆在一个大类里。</p>
 */
@RestController
@RequestMapping("/api/sys/users")
public class SysUserController {

    private final SysManagementService service;

    public SysUserController(SysManagementService service) {
        this.service = service;
    }

    @GetMapping
    public R<PageResult<UserView>> users(@RequestParam(required = false) Integer pageNo,
                                         @RequestParam(required = false) Integer pageSize) {
        return R.ok(service.users(PageQuery.of(pageNo, pageSize)));
    }

    @PostMapping
    @OperationLog(module = "sys", operation = "新增用户")
    public R<UserView> createUser(@RequestBody UserSaveRequest request) {
        return R.ok(service.saveUser(null, request));
    }

    @PutMapping("/{id}")
    @OperationLog(module = "sys", operation = "修改用户")
    public R<UserView> updateUser(@PathVariable Long id, @RequestBody UserSaveRequest request) {
        return R.ok(service.saveUser(id, request));
    }

    @DeleteMapping("/{id}")
    @OperationLog(module = "sys", operation = "删除用户")
    public R<Void> deleteUser(@PathVariable Long id) {
        service.deleteUser(id);
        return R.ok();
    }

    @PutMapping("/{id}/status")
    @OperationLog(module = "sys", operation = "修改用户状态")
    public R<UserView> updateUserStatus(@PathVariable Long id, @RequestBody StatusUpdateRequest request) {
        return R.ok(service.updateUserStatus(id, request));
    }

    @PutMapping("/{id}/roles")
    @OperationLog(module = "sys", operation = "分配用户角色")
    public R<Void> updateUserRoles(@PathVariable Long id, @RequestBody IdsRequest request) {
        service.updateUserRoles(id, request);
        return R.ok();
    }

    @PutMapping("/{id}/warehouses")
    @OperationLog(module = "sys", operation = "配置仓库数据权限")
    public R<Void> updateUserWarehouses(@PathVariable Long id, @RequestBody IdsRequest request) {
        service.updateUserWarehouses(id, request);
        return R.ok();
    }
}
