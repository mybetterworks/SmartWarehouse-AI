package com.smartwarehouse.sys.controller;

import com.smartwarehouse.platform.core.R;
import com.smartwarehouse.sys.api.SysDtos.PortalAccessLogRequest;
import com.smartwarehouse.sys.api.SysDtos.PortalWorkbenchView;
import com.smartwarehouse.sys.application.SysManagementService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 门户工作台接口。
 */
@RestController
@RequestMapping("/api/sys/portal")
public class SysPortalController {

    private final SysManagementService service;

    public SysPortalController(SysManagementService service) {
        this.service = service;
    }

    @GetMapping("/workbench")
    public R<PortalWorkbenchView> workbench(@RequestAttribute("loginUserId") Long userId) {
        return R.ok(service.portalWorkbench(userId));
    }

    @PostMapping("/access-log")
    public R<Void> accessLog(@RequestAttribute("loginUserId") Long userId, @RequestBody PortalAccessLogRequest request) {
        service.recordPortalAccess(userId, request);
        return R.ok();
    }
}
