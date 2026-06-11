# V07 MES、WMS、task 多方交互业务

## 1. 版本状态

```text
状态：TODO
负责人：甲方平台团队统筹，WMS 乙方和 MES 乙方配合
前置版本：V06
输出结果：MES 物料申请触发 WMS 库存分配，task 统计排行和预警联动
```

## 2. 版本目标

1. 打通 MES 物料申请与 WMS 库存预扣/分配。
2. 使用 RabbitMQ 传递物料申请和库存分配结果事件。
3. task 消费业务事件，更新统计、排行和预警。
4. 前端联调 MES、WMS、运营看板，实现跨模块可演示流程。
5. 通过 Jenkins 发布跨模块测试版本，通过阿里弹性容器发布正式联动版本检查。

## 3. 版本实现的技术栈

| 类型 | 技术 |
|---|---|
| 后端 | mes-service、wms-service、task-service |
| 消息 | RabbitMQ、重试、死信、eventId 幂等 |
| 缓存 | Redis Lua 库存预扣、Redis ZSet 排行 |
| 前端 | mes-web、wms-web、portal-shell 运营看板 |
| CI/CD | Jenkins、阿里弹性容器 |

## 4. 相关表结构

```text
mes_material_apply
mes_delivery_status
wms_inventory_batch
wms_inventory_flow
task_event_consume_log
task_stat_daily
task_rank_snapshot
task_compensation_log
```

相关事件：

```text
MaterialApplyCreatedEvent
InventoryAllocatedEvent
InventoryAllocateFailedEvent
StockAlertGeneratedEvent
```

## 5. 开发步骤提示词

```text
请开发 V07 MES、WMS、task 多方交互业务。

要求：
1. 先确认 V03、V04、V06 各自模块已可独立演示。
2. MES 提交物料申请后发送 MaterialApplyCreatedEvent。
3. WMS 消费物料申请事件，执行库存预扣和分配。
4. WMS 发送 InventoryAllocatedEvent 或 InventoryAllocateFailedEvent。
5. MES 消费库存分配结果，更新申请状态和配送状态。
6. task 消费 MES/WMS 事件，更新统计、排行和预警。
7. 前端联调 mes-web、wms-web 和运营看板，展示完整业务流。
8. 所有 MQ 消费必须支持 eventId 幂等。
9. 补充跨模块 Jenkins 测试发布流程。
10. 补充阿里弹性容器正式联动版本发布检查。
11. 更新本文件实现记录、study、handle 和 PROGRESS.md。
```

## 6. 自动测试提示词

```text
请验证 V07 MES、WMS、task 多方交互业务。

测试项：
1. MES 提交物料申请后 RabbitMQ 有事件。
2. WMS 消费事件后库存预扣不超卖。
3. 分配成功后 MES 申请状态变为已分配。
4. 分配失败后 MES 记录失败原因。
5. task 消费事件后排行和统计更新。
6. 重复 eventId 不重复扣库存、不重复统计。
7. 前端可以从 MES 页面一路查看到 WMS 分配和 task 看板变化。
8. Jenkins 跨模块测试发布成功。
9. 阿里弹性容器正式联动发布检查通过。
```

## 7. 验收标准

1. MES、WMS、task 多方交互流程可演示。
2. 高并发库存预扣不超卖。
3. MQ 消费和跨模块事件处理幂等。
4. 前端能展示跨模块状态变化。
5. 测试环境和正式环境发布检查都有记录。

## 8. 验收操作过程

```text
1. 登录生产主管账号创建工单并提交物料申请。
2. 登录仓库管理员账号查看 WMS 库存分配结果。
3. 登录运营账号查看排行、统计和预警。
4. 重复投递同一事件，验证幂等。
5. 执行 Jenkins 跨模块测试发布。
6. 检查阿里弹性容器正式联动发布配置。
```

## 9. 实现记录

```text
日期：
实现内容：
前端完成内容：
后端完成内容：
接口联调结果：
Jenkins 测试发布结果：
阿里弹性容器正式发布检查：
验证命令：
验证结果：
问题记录：
改进记录：
```
