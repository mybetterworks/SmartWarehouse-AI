package com.smartwarehouse.sys.controller;

import com.smartwarehouse.platform.core.PageQuery;
import com.smartwarehouse.platform.core.PageResult;
import com.smartwarehouse.platform.core.R;
import com.smartwarehouse.platform.log.OperationLog;
import com.smartwarehouse.sys.api.SysDtos.DictItemSaveRequest;
import com.smartwarehouse.sys.api.SysDtos.DictItemView;
import com.smartwarehouse.sys.api.SysDtos.DictTypeSaveRequest;
import com.smartwarehouse.sys.api.SysDtos.DictTypeView;
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
 * 字典管理接口。
 */
@RestController
@RequestMapping("/api/sys")
public class SysDictController {

    private final SysManagementService service;

    public SysDictController(SysManagementService service) {
        this.service = service;
    }

    @GetMapping("/dict-types")
    public R<PageResult<DictTypeView>> dictTypes(@RequestParam(required = false) Integer pageNo,
                                                 @RequestParam(required = false) Integer pageSize) {
        return R.ok(service.dictTypes(PageQuery.of(pageNo, pageSize)));
    }

    @PostMapping("/dict-types")
    @OperationLog(module = "sys", operation = "新增字典类型")
    public R<DictTypeView> createDictType(@RequestBody DictTypeSaveRequest request) {
        return R.ok(service.saveDictType(null, request));
    }

    @PutMapping("/dict-types/{id}")
    @OperationLog(module = "sys", operation = "修改字典类型")
    public R<DictTypeView> updateDictType(@PathVariable Long id, @RequestBody DictTypeSaveRequest request) {
        return R.ok(service.saveDictType(id, request));
    }

    @DeleteMapping("/dict-types/{id}")
    @OperationLog(module = "sys", operation = "删除字典类型")
    public R<Void> deleteDictType(@PathVariable Long id) {
        service.deleteDictType(id);
        return R.ok();
    }

    @GetMapping("/dict-items")
    public R<List<DictItemView>> dictItems(@RequestParam String dictCode) {
        return R.ok(service.dictItems(dictCode));
    }

    @PostMapping("/dict-items")
    @OperationLog(module = "sys", operation = "新增字典项")
    public R<DictItemView> createDictItem(@RequestBody DictItemSaveRequest request) {
        return R.ok(service.saveDictItem(null, request));
    }

    @PutMapping("/dict-items/{id}")
    @OperationLog(module = "sys", operation = "修改字典项")
    public R<DictItemView> updateDictItem(@PathVariable Long id, @RequestBody DictItemSaveRequest request) {
        return R.ok(service.saveDictItem(id, request));
    }

    @DeleteMapping("/dict-items/{id}")
    @OperationLog(module = "sys", operation = "删除字典项")
    public R<Void> deleteDictItem(@PathVariable Long id) {
        service.deleteDictItem(id);
        return R.ok();
    }
}
