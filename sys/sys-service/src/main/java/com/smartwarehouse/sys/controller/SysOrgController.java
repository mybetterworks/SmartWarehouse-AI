package com.smartwarehouse.sys.controller;

import com.smartwarehouse.platform.core.PageQuery;
import com.smartwarehouse.platform.core.PageResult;
import com.smartwarehouse.platform.core.R;
import com.smartwarehouse.platform.log.OperationLog;
import com.smartwarehouse.sys.api.SysDtos.DeptQueryRequest;
import com.smartwarehouse.sys.api.SysDtos.DeptSaveRequest;
import com.smartwarehouse.sys.api.SysDtos.DeptView;
import com.smartwarehouse.sys.api.SysDtos.PostQueryRequest;
import com.smartwarehouse.sys.api.SysDtos.PostSaveRequest;
import com.smartwarehouse.sys.api.SysDtos.PostView;
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

import java.util.List;

/**
 * 组织与岗位管理接口。
 */
@RestController
@RequestMapping("/api/sys")
public class SysOrgController {

    private final SysManagementService service;

    public SysOrgController(SysManagementService service) {
        this.service = service;
    }

    @GetMapping("/depts")
    public R<PageResult<DeptView>> pageDepts(@RequestParam(required = false) Integer pageNo,
                                             @RequestParam(required = false) Integer pageSize,
                                             @RequestParam(required = false) String deptCode,
                                             @RequestParam(required = false) String deptName,
                                             @RequestParam(required = false) String status) {
        return R.ok(service.depts(PageQuery.of(pageNo, pageSize), new DeptQueryRequest(deptCode, deptName, status)));
    }

    @GetMapping("/depts/tree")
    public R<List<DeptView>> depts() {
        return R.ok(service.deptTree());
    }

    @PostMapping("/depts")
    @OperationLog(module = "sys", operation = "新增部门")
    public R<DeptView> createDept(@RequestBody DeptSaveRequest request) {
        return R.ok(service.saveDept(null, request));
    }

    @PutMapping("/depts/{id}")
    @OperationLog(module = "sys", operation = "修改部门")
    public R<DeptView> updateDept(@PathVariable Long id, @RequestBody DeptSaveRequest request) {
        return R.ok(service.saveDept(id, request));
    }

    @DeleteMapping("/depts/{id}")
    @OperationLog(module = "sys", operation = "删除部门")
    public R<Void> deleteDept(@PathVariable Long id) {
        service.deleteDept(id);
        return R.ok();
    }

    @GetMapping("/posts")
    public R<PageResult<PostView>> posts(@RequestParam(required = false) Integer pageNo,
                                         @RequestParam(required = false) Integer pageSize,
                                         @RequestParam(required = false) String postCode,
                                         @RequestParam(required = false) String postName,
                                         @RequestParam(required = false) String status) {
        return R.ok(service.posts(PageQuery.of(pageNo, pageSize), new PostQueryRequest(postCode, postName, status)));
    }

    @GetMapping("/posts/all")
    public R<List<PostView>> allPosts() {
        return R.ok(service.allPosts());
    }

    @PostMapping("/posts")
    @OperationLog(module = "sys", operation = "新增岗位")
    public R<PostView> createPost(@RequestBody PostSaveRequest request) {
        return R.ok(service.savePost(null, request));
    }

    @PutMapping("/posts/{id}")
    @OperationLog(module = "sys", operation = "修改岗位")
    public R<PostView> updatePost(@PathVariable Long id, @RequestBody PostSaveRequest request) {
        return R.ok(service.savePost(id, request));
    }

    @DeleteMapping("/posts/{id}")
    @OperationLog(module = "sys", operation = "删除岗位")
    public R<Void> deletePost(@PathVariable Long id) {
        service.deletePost(id);
        return R.ok();
    }
}
