package com.smartwarehouse.platform.core;

import java.util.List;

/**
 * 通用分页结果。
 *
 * <p>records 永远不返回 null，前端表格就不用在每个页面重复做空值兜底。</p>
 */
public record PageResult<T>(List<T> records, long total, int pageNo, int pageSize) {

    public PageResult {
        records = records == null ? List.of() : List.copyOf(records);
    }

    public static <T> PageResult<T> of(List<T> records, long total, PageQuery query) {
        return new PageResult<>(records, total, query.pageNo(), query.pageSize());
    }
}
