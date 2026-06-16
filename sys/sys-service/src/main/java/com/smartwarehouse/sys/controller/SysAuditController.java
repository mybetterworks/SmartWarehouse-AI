package com.smartwarehouse.sys.controller;

import com.smartwarehouse.platform.core.R;
import com.smartwarehouse.sys.api.SysDtos.LoginLogView;
import com.smartwarehouse.sys.api.SysDtos.OperLogView;
import com.smartwarehouse.sys.api.SysDtos.RiskRecordView;
import com.smartwarehouse.sys.application.SysManagementService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 审计日志与登录风控记录查询接口。
 */
@RestController
@RequestMapping("/api/sys")
public class SysAuditController {

    private final SysManagementService service;

    public SysAuditController(SysManagementService service) {
        this.service = service;
    }

    @GetMapping("/login-logs")
    public R<List<LoginLogView>> loginLogs() {
        return R.ok(service.loginLogs());
    }

    @GetMapping("/oper-logs")
    public R<List<OperLogView>> operLogs() {
        return R.ok(service.operLogs());
    }

    @GetMapping("/risk-records")
    public R<List<RiskRecordView>> riskRecords() {
        return R.ok(service.riskRecords());
    }
}
