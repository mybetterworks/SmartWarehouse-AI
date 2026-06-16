package com.smartwarehouse.platform.mq;

/**
 * RabbitMQ 命名常量。
 *
 * <p>把交换机、队列和死信前缀集中管理，避免后续多个乙方模块自己定义同名不同义的 MQ 资源。</p>
 */
public final class RabbitConstants {

    public static final String PLATFORM_EXCHANGE = "smartwarehouse.platform.exchange";
    public static final String DEAD_LETTER_EXCHANGE = "smartwarehouse.dead-letter.exchange";

    private RabbitConstants() {
    }
}
