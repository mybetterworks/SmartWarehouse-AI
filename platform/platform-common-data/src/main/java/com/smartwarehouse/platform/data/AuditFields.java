package com.smartwarehouse.platform.data;

import java.time.LocalDateTime;

/**
 * 审计字段模型。
 *
 * <p>V02 的内存实现也保留审计字段，后续切换 MyBatis Plus 实体时可直接映射到 created_time、updated_time。</p>
 */
public record AuditFields(Long createdBy, LocalDateTime createdTime, Long updatedBy, LocalDateTime updatedTime) {

    public static AuditFields create(Long operatorId) {
        LocalDateTime now = LocalDateTime.now();
        return new AuditFields(operatorId, now, operatorId, now);
    }

    public AuditFields update(Long operatorId) {
        return new AuditFields(createdBy, createdTime, operatorId, LocalDateTime.now());
    }
}
