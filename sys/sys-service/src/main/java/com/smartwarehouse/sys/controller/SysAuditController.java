package com.smartwarehouse.sys.controller;

import com.smartwarehouse.platform.core.PageQuery;
import com.smartwarehouse.platform.core.PageResult;
import com.smartwarehouse.platform.core.R;
import com.smartwarehouse.sys.api.SysDtos.LoginLogQueryRequest;
import com.smartwarehouse.sys.api.SysDtos.LoginLogView;
import com.smartwarehouse.sys.api.SysDtos.OperLogQueryRequest;
import com.smartwarehouse.sys.api.SysDtos.OperLogView;
import com.smartwarehouse.sys.api.SysDtos.RiskRecordQueryRequest;
import com.smartwarehouse.sys.api.SysDtos.RiskRecordView;
import com.smartwarehouse.sys.application.SysManagementService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

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
    public R<PageResult<LoginLogView>> loginLogs(@RequestParam(required = false) Integer pageNo,
                                                 @RequestParam(required = false) Integer pageSize,
                                                 @RequestParam(required = false) String username,
                                                 @RequestParam(required = false) String loginStatus,
                                                 @RequestParam(required = false) String loginIp) {
        return R.ok(service.loginLogs(
                PageQuery.of(pageNo, pageSize),
                new LoginLogQueryRequest(username, loginStatus, loginIp)
        ));
    }

    @GetMapping("/oper-logs")
    public R<PageResult<OperLogView>> operLogs(@RequestParam(required = false) Integer pageNo,
                                               @RequestParam(required = false) Integer pageSize,
                                               @RequestParam(required = false) String username,
                                               @RequestParam(required = false) String module,
                                               @RequestParam(required = false) String operation,
                                               @RequestParam(required = false) String resultStatus) {
        return R.ok(service.operLogs(
                PageQuery.of(pageNo, pageSize),
                new OperLogQueryRequest(username, module, operation, resultStatus)
        ));
    }

    @GetMapping("/risk-records")
    public R<PageResult<RiskRecordView>> riskRecords(@RequestParam(required = false) Integer pageNo,
                                                     @RequestParam(required = false) Integer pageSize,
                                                     @RequestParam(required = false) String riskType,
                                                     @RequestParam(required = false) String riskTarget,
                                                     @RequestParam(required = false) String action) {
        return R.ok(service.riskRecords(
                PageQuery.of(pageNo, pageSize),
                new RiskRecordQueryRequest(riskType, riskTarget, action)
        ));
    }
}
