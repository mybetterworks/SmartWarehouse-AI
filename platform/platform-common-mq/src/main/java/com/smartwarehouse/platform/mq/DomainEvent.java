package com.smartwarehouse.platform.mq;

import java.time.LocalDateTime;

/**
 * 领域事件基类。
 *
 * <p>V02 暂不真正发送 RabbitMQ，但先统一事件字段，后续 WMS/MES/task 的异步事件可以直接继承这套契约。</p>
 */
public record DomainEvent<T>(String eventId, String eventType, String traceId, T payload, LocalDateTime createdTime) {
}
