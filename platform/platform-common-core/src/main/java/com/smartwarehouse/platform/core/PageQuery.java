package com.smartwarehouse.platform.core;

/**
 * 通用分页查询参数。
 *
 * <p>分页参数在 Controller 层统一修正，避免前端传入 0、负数或过大 pageSize 时拖垮查询。</p>
 */
public record PageQuery(int pageNo, int pageSize) {

    public PageQuery {
        pageNo = Math.max(pageNo, 1);
        pageSize = Math.min(Math.max(pageSize, 1), 200);
    }

    public static PageQuery of(Integer pageNo, Integer pageSize) {
        return new PageQuery(pageNo == null ? 1 : pageNo, pageSize == null ? 10 : pageSize);
    }
}
