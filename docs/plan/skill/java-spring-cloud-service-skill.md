# Java Spring Cloud 微服务开发 Skill

## 1. 适用场景

用于开发 `gateway`、`sys`、`task`、`wms`、`mes` 等 Java 微服务，特别是涉及 Spring Cloud Alibaba、Redis、RabbitMQ、MySQL、Seata、Dubbo、JWT 和 K8s 多实例约束的功能。

## 2. 输入

- 当前 milestone 文件。
- `docs/design/high-level-design.md`
- `docs/design/detailed-design.md`
- `docs/design/database-design.md`
- 目标服务目录。
- 相关 API 模块和数据库表。

## 3. 执行步骤

1. 确认目标服务归属甲方或乙方。
2. 确认是否需要新增 `*-api`，不得新增 `task-client`、`mes-client`、`wms-client`。
3. 创建或更新数据库迁移脚本。
4. 实现 Controller、Service、Repository/Mapper、DTO、事件对象。
5. 接入统一响应、异常、分页、审计字段和安全上下文。
6. 涉及写操作时设计幂等键。
7. 涉及 MQ 时设计 eventId、重试、死信和消费日志。
8. 涉及 Redis 时确认 Key 命名、过期时间和 Cluster 兼容。
9. 涉及事务时优先本地事务 + MQ，必要时才使用 Seata。
10. 增加单元测试、集成测试或接口测试。
11. 更新 milestone、study、handle 和 PROGRESS。

## 4. 检查清单

- [ ] 服务是否无状态。
- [ ] 配置是否外置。
- [ ] 是否提供健康检查。
- [ ] 是否支持优雅停机。
- [ ] 核心写操作是否幂等。
- [ ] MQ 消费是否成功后 ack。
- [ ] 数据库索引是否覆盖高频查询。
- [ ] 是否避免跨库物理外键。
- [ ] 是否避免跨项目源码引用。

## 5. 推荐提示词

```text
请使用 docs/plan/skill/java-spring-cloud-service-skill.md，开发当前 milestone 中的 Java 微服务功能。先检查设计文档和已有实现，再进行最小范围修改，完成后运行自动测试并更新 docs/plan 相关文件。
```

## 6. 常见坑

1. 把业务状态放在本地内存，导致 K8s 多实例不可用。
2. 忘记 MQ 消费幂等，重复投递导致重复扣库存。
3. 在服务启动时执行 DDL，多个 Pod 同时启动可能冲突。
4. 乙方服务直接依赖甲方实现源码，破坏项目边界。
5. 只写成功流程，没有验证失败和重试。
