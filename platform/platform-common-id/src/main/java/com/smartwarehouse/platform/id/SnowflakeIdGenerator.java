package com.smartwarehouse.platform.id;

import java.time.Instant;
import java.util.concurrent.atomic.AtomicLong;

/**
 * 轻量 Snowflake ID 生成器。
 *
 * <p>workerId 在 V02 通过配置传入，后续多实例部署时可以改成 Redis/Nacos/数据库登记或 Pod 名哈希，
 * 避免多个实例使用同一 workerId 导致 ID 冲突。</p>
 */
public class SnowflakeIdGenerator {

    private static final long EPOCH = Instant.parse("2026-01-01T00:00:00Z").toEpochMilli();
    private static final long WORKER_BITS = 10L;
    private static final long SEQUENCE_BITS = 12L;
    private static final long MAX_WORKER_ID = (1L << WORKER_BITS) - 1;
    private static final long SEQUENCE_MASK = (1L << SEQUENCE_BITS) - 1;

    private final long workerId;
    private final AtomicLong lastTimestamp = new AtomicLong(-1L);
    private final AtomicLong sequence = new AtomicLong(0L);

    public SnowflakeIdGenerator(long workerId) {
        if (workerId < 0 || workerId > MAX_WORKER_ID) {
            throw new IllegalArgumentException("workerId must be between 0 and " + MAX_WORKER_ID);
        }
        this.workerId = workerId;
    }

    public synchronized long nextId() {
        long now = System.currentTimeMillis();
        long previous = lastTimestamp.get();

        if (now == previous) {
            long nextSequence = (sequence.incrementAndGet()) & SEQUENCE_MASK;
            if (nextSequence == 0) {
                now = waitNextMillis(previous);
            }
        } else {
            sequence.set(0L);
        }

        lastTimestamp.set(now);
        return ((now - EPOCH) << (WORKER_BITS + SEQUENCE_BITS)) | (workerId << SEQUENCE_BITS) | sequence.get();
    }

    private long waitNextMillis(long currentTimestamp) {
        long now = System.currentTimeMillis();
        while (now <= currentTimestamp) {
            now = System.currentTimeMillis();
        }
        return now;
    }
}
