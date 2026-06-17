package com.smartwarehouse.sys.controller;

import com.smartwarehouse.platform.core.PageQuery;
import com.smartwarehouse.platform.core.PageResult;
import com.smartwarehouse.platform.core.R;
import com.smartwarehouse.platform.log.OperationLog;
import com.smartwarehouse.sys.api.SysDtos.FrontendModuleQueryRequest;
import com.smartwarehouse.sys.api.SysDtos.FrontendModuleSaveRequest;
import com.smartwarehouse.sys.api.SysDtos.FrontendModuleView;
import com.smartwarehouse.sys.application.SysManagementService;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 前端模块注册接口。
 */
@RestController
@RequestMapping("/api/sys/frontend-modules")
public class SysFrontendModuleController {

    private final SysManagementService service;

    public SysFrontendModuleController(SysManagementService service) {
        this.service = service;
    }

    @GetMapping
    public R<PageResult<FrontendModuleView>> frontendModules(@RequestParam(required = false) Integer pageNo,
                                                             @RequestParam(required = false) Integer pageSize,
                                                             @RequestParam(required = false) String moduleCode,
                                                             @RequestParam(required = false) String moduleName,
                                                             @RequestParam(required = false) String ownerName,
                                                             @RequestParam(required = false) String status) {
        return R.ok(service.frontendModules(
                PageQuery.of(pageNo, pageSize),
                new FrontendModuleQueryRequest(moduleCode, moduleName, ownerName, status)
        ));
    }

    @GetMapping("/enabled")
    public R<List<FrontendModuleView>> enabledFrontendModules(@RequestAttribute("loginUserId") Long userId) {
        return R.ok(service.enabledFrontendModulesForUser(userId));
    }

    @PostMapping
    @OperationLog(module = "sys", operation = "新增前端模块")
    public R<FrontendModuleView> createFrontendModule(@RequestBody FrontendModuleSaveRequest request) {
        return R.ok(service.saveFrontendModule(null, request));
    }

    @PutMapping("/{id}")
    @OperationLog(module = "sys", operation = "修改前端模块")
    public R<FrontendModuleView> updateFrontendModule(@PathVariable Long id, @RequestBody FrontendModuleSaveRequest request) {
        return R.ok(service.saveFrontendModule(id, request));
    }

    @DeleteMapping("/{id}")
    @OperationLog(module = "sys", operation = "删除前端模块")
    public R<Void> deleteFrontendModule(@PathVariable Long id) {
        service.deleteFrontendModule(id);
        return R.ok();
    }
}
