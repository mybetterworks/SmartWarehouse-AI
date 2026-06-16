package com.smartwarehouse.sys.controller;

import com.smartwarehouse.platform.core.R;
import com.smartwarehouse.platform.log.OperationLog;
import com.smartwarehouse.sys.api.SysDtos.MenuSaveRequest;
import com.smartwarehouse.sys.api.SysDtos.MenuView;
import com.smartwarehouse.sys.application.SysManagementService;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 菜单管理接口。
 */
@RestController
@RequestMapping("/api/sys/menus")
public class SysMenuController {

    private final SysManagementService service;

    public SysMenuController(SysManagementService service) {
        this.service = service;
    }

    @GetMapping("/tree")
    public R<List<MenuView>> menus(@RequestAttribute("loginUserId") Long userId) {
        return R.ok(service.menuTreeForUser(userId));
    }

    @PostMapping
    @OperationLog(module = "sys", operation = "新增菜单")
    public R<MenuView> createMenu(@RequestBody MenuSaveRequest request) {
        return R.ok(service.saveMenu(null, request));
    }

    @PutMapping("/{id}")
    @OperationLog(module = "sys", operation = "修改菜单")
    public R<MenuView> updateMenu(@PathVariable Long id, @RequestBody MenuSaveRequest request) {
        return R.ok(service.saveMenu(id, request));
    }

    @DeleteMapping("/{id}")
    @OperationLog(module = "sys", operation = "删除菜单")
    public R<Void> deleteMenu(@PathVariable Long id) {
        service.deleteMenu(id);
        return R.ok();
    }
}
