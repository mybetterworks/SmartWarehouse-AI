# V07 MES、WMS、task 多方交互业务

## 1. 版本状态

```text
状态：TODO
负责人：甲方平台团队统筹，WMS 乙方和 MES 乙方配合
前置版本：V06
输出结果：MES 物料申请触发 WMS 库存分配，task 统计排行和预警联动
```

## 2. 版本开发输入边界

本文件已经内置 V07 需要的设计信息。开发 V07 时以本文件、`docs/plan/ROADMAP.md`、`docs/plan/DEVELOPMENT_RULE.md`、`docs/plan/PROGRESS.md` 为准，不需要再读取 `docs/design` 下的设计文档。

V07 只开发 MES、WMS、task 的跨乙方交互业务，包括物料申请事件、库存预扣、库存锁定、分配结果回写、统计排行联动、WebSocket 推送和高并发库存申请验证。不开发 AI 业务数据深度分析，AI 联动放到 V08。

## 3. 版本目标

1. 打通 MES 物料申请与 WMS 库存预扣/分配。
2. 使用 RabbitMQ 传递物料申请和库存分配结果事件。
3. 使用 Redis Lua 模拟类似秒杀的库存原子预扣。
4. WMS 根据库存批次执行锁定、生成出库单和库存流水。
5. MES 消费库存分配成功/失败事件，更新申请、工单物料、工单和配送状态。
6. task 消费 MES/WMS 事件，更新统计、排行、预警和 WebSocket 推送。
7. 前端联调 `mes-web`、`wms-web` 和运营看板，实现跨模块可演示流程。
8. 完成高并发物料申请压测，验证库存不超卖、事件幂等、重复投递不重复扣减。
9. 通过 Jenkins 发布跨模块测试版本，通过阿里弹性容器发布正式联动版本检查。

## 4. 项目与代码架构及模块边界

### 4.1 后端参与模块

```text
mes/mes-api
mes/mes-service
wms/wms-api
wms/wms-service
task/task-api
task/task-service
platform/platform-common-mq
platform/platform-common-redis
platform/platform-common-id
```

禁止新增：

```text
mes-client
wms-client
task-client
```

### 4.2 前端参与模块

```text
mes-web
wms-web
frontend-platform 运营看板 / task 页面
```

### 4.3 协作边界

1. MES、WMS、task 只能通过 `*-api`、REST 或 MQ 事件集成。
2. MES 不直接访问 `smart_wms` 数据库。
3. WMS 不直接访问 `smart_mes` 数据库。
4. task 统计优先消费事件，必要时通过公开接口定时校准。
5. 跨服务写操作优先使用本地事务 + MQ 事件 + 幂等消费 + 补偿，不优先使用强一致分布式事务。
6. Seata 仅在明确需要强一致的短事务场景使用，不覆盖文件解析、WebSocket 推送或 AI 任务。

## 5. 业务功能要求与核心业务流程

### 5.1 工单物料申请完整流程

```text
生产主管创建工单
  -> 绑定所需物料
  -> 发布工单
  -> 提交物料申请
  -> MES 写入 mes_material_apply，状态 PROCESSING
  -> MES 发送 MaterialApplyCreatedEvent
  -> WMS 消费事件并校验 eventId 幂等
  -> WMS 执行 Redis Lua 库存预扣
  -> WMS 查询库存批次，按 FIFO / 近效期优先锁定批次
  -> WMS 写入库存流水 LOCK
  -> WMS 生成出库单和出库明细
  -> WMS 发布 InventoryAllocatedEvent 或 InventoryAllocateFailedEvent
  -> MES 消费分配结果事件
  -> MES 更新申请状态、工单物料分配状态、工单状态和配送状态
  -> task 消费 MES/WMS 事件，更新统计、排行和预警
  -> task WebSocket 推送前端
```

### 5.2 高并发库存申请

目标：模拟“生产任务大量释放，同时申请库存”的秒杀场景。

核心规则：

1. MES 支持批量发布工单或批量提交物料申请。
2. 每个申请必须有全局唯一 `request_id`。
3. WMS 先用 Redis Lua 原子预扣，快速判断库存是否足够。
4. Redis 不是最终事实来源，MySQL `wms_inventory_batch` 和 `wms_inventory_flow` 是最终依据。
5. 数据库锁定失败时必须回补 Redis 并记录补偿任务。
6. 重复 MQ 消息不得重复扣库存。
7. 本地压测目标：1000 QPS 级别验证。

### 5.3 配送状态联动

```text
WMS 生成出库单
  -> MES 创建或更新 mes_delivery_status 为 WAIT_PICK
  -> WMS 出库状态变化
  -> 发布 DeliveryStatusChangedEvent
  -> MES 更新配送状态
```

V07 至少支持从库存分配成功到 `WAIT_PICK` 的自动状态创建，并预留后续出库配送状态事件。

## 6. 消息事件设计

### 6.1 RabbitMQ 交换机

| 交换机 | 类型 | 说明 |
|---|---|---|
| `smart.topic.exchange` | topic | 业务事件交换机。 |
| `smart.dlx.exchange` | topic | 死信交换机。 |

### 6.2 队列

| 队列 | Routing Key | 消费者 |
|---|---|---|
| `wms.material.apply.queue` | `mes.material.apply.created` | `wms-service` |
| `mes.inventory.result.queue` | `wms.inventory.*` | `mes-service` |
| `task.biz.event.queue` | `*.biz.*` | `task-service` |
| `task.compensation.queue` | `*.compensation.*` | `task-service` |

### 6.3 事件公共字段

```text
eventId
eventType
eventVersion
occurredAt
traceId
sourceService
bizId
payload
```

### 6.4 MaterialApplyCreatedEvent

生产者：MES  
消费者：WMS、task

Routing Key：

```text
mes.material.apply.created
```

字段：

```text
eventId
eventType
eventVersion
occurredAt
traceId
sourceService
applyId
applyNo
workOrderId
workOrderNo
materialId
materialCode
warehouseId
applyQty
requestId
```

### 6.5 InventoryAllocatedEvent

生产者：WMS  
消费者：MES、task

Routing Key：

```text
wms.inventory.allocated
```

字段：

```text
eventId
eventType
eventVersion
occurredAt
traceId
sourceService
applyId
applyNo
workOrderId
materialId
allocatedQty
outboundOrderId
batchDetails
```

`batchDetails` 包含：

```text
batchId
batchNo
locationId
allocatedQty
expireDate
```

### 6.6 InventoryAllocateFailedEvent

生产者：WMS  
消费者：MES、task

Routing Key：

```text
wms.inventory.allocate.failed
```

字段：

```text
eventId
eventType
eventVersion
occurredAt
traceId
sourceService
applyId
applyNo
workOrderId
materialId
applyQty
failCode
failReason
```

### 6.7 DeliveryStatusChangedEvent

生产者：WMS  
消费者：MES、task

Routing Key：

```text
wms.delivery.status.changed
```

字段：

```text
eventId
eventType
eventVersion
occurredAt
traceId
sourceService
applyId
workOrderId
outboundOrderId
deliveryStatus
remark
```

## 7. 接口设计

### 7.1 MES 新增/调整接口

```text
POST /api/mes/work-orders/{id}/material-apply
POST /api/mes/work-orders/batch-release
POST /api/mes/material-applies/batch
GET  /api/mes/material-applies/{id}/allocation-result
GET  /api/mes/work-orders/{id}/allocation-status
GET  /api/mes/work-orders/{id}/delivery-status
```

批量申请请求：

```json
{
  "batchNo": "BATCH-20260611-001",
  "items": [
    {
      "requestId": "REQ-001",
      "workOrderId": 1,
      "warehouseId": 1,
      "materialId": 1,
      "materialCode": "MAT-CPU-001",
      "applyQty": 10
    }
  ]
}
```

### 7.2 WMS 新增/调整接口

```text
POST /api/wms/inventory/preload
POST /api/wms/inventory/lock
POST /api/wms/inventory/unlock
GET  /api/wms/inventory-batches/available
GET  /api/wms/outbound-orders/by-apply/{applyId}
POST /api/wms/outbound-orders/{id}/delivery-status
```

说明：

1. `/inventory/preload` 用于将 MySQL 可用库存同步到 Redis，供高并发预扣。
2. `/inventory/lock` 可作为内部或测试接口，真实业务由 MQ 消费触发。
3. `/inventory/unlock` 用于失败补偿和人工回滚。

### 7.3 task 新增/调整接口

```text
GET  /api/task/ranks/material-apply
GET  /api/task/ranks/warehouse-outbound
GET  /api/task/ranks/line-demand
POST /api/task/compensations/scan
GET  /api/task/event-consume-logs
```

## 8. 数据库设计

V07 复用并补强以下表。

### 8.1 MES 表

`mes_material_apply` 必须确保：

```text
request_id varchar(128) UK
status varchar(32) -- PROCESSING/SUCCESS/FAILED/CANCELLED
allocated_qty decimal(18,4)
fail_reason varchar(255)
```

`mes_work_order_material` 必须支持：

```text
allocated_qty decimal(18,4)
status varchar(32) -- PENDING/ALLOCATING/ALLOCATED/FAILED
```

`mes_delivery_status` 必须支持：

```text
apply_id bigint IDX
outbound_order_id bigint IDX
work_order_id bigint IDX
status varchar(32)
status_time datetime
```

建议新增或确认 MQ 消费幂等记录：

```text
mes_event_consume_log(
  id bigint PK,
  event_id varchar(128) UK,
  event_type varchar(128),
  status varchar(32),
  error_message varchar(1024),
  created_time datetime
)
```

如不新增独立表，也必须使用 Redis 幂等 Key 或 task_event_consume_log 保证幂等。

### 8.2 WMS 表

`wms_inventory_batch` 必须保证：

```text
available_qty >= 0
locked_qty >= 0
total_qty = available_qty + locked_qty
version int
```

`wms_inventory_flow` 用于记录：

```text
LOCK
UNLOCK
OUTBOUND
```

建议唯一约束：

```text
uk_inventory_flow_biz(biz_type, biz_id, flow_type, batch_id)
```

`wms_outbound_order` 关联：

```text
work_order_id
apply_id
status -- CREATED/PICKING/OUTBOUND/DELIVERING/DELIVERED
```

建议新增或确认 MQ 消费幂等记录：

```text
wms_event_consume_log(
  id bigint PK,
  event_id varchar(128) UK,
  event_type varchar(128),
  status varchar(32),
  error_message varchar(1024),
  created_time datetime
)
```

### 8.3 task 表

必须使用：

```text
task_event_consume_log(event_id UK, event_type, consumer, status, error_message, created_time)
task_rank_snapshot(rank_type, rank_date, rank_key, rank_name, score, rank_no)
task_stat_daily(stat_date, warehouse_id, inbound_qty, outbound_qty, apply_count, apply_success_count, apply_fail_count)
task_compensation_log(biz_type, biz_id, event_id, status, retry_count, next_retry_time, error_message)
```

## 9. Redis 设计

### 9.1 库存预扣 Key

为兼容 Redis Cluster，建议使用 hash tag：

```text
stock:{materialId}:available:{warehouseId}
stock:{materialId}:locked:{warehouseId}
lock:stock:{materialId}:{warehouseId}
```

### 9.2 Lua 预扣逻辑

```text
读取可用库存
  -> 库存不存在返回 STOCK_NOT_FOUND
  -> 库存小于申请数量返回 INSUFFICIENT_STOCK
  -> 扣减可用库存
  -> 增加预扣或锁定计数
  -> 返回 SUCCESS
```

### 9.3 数据库落库失败补偿

```text
Redis 预扣成功
  -> 数据库锁定失败
  -> 发送库存回补任务
  -> Redis 增加回补数量
  -> 写入 task_compensation_log
```

### 9.4 排行 Key

```text
rank:material:apply
rank:warehouse:outbound
rank:line:demand
rank:workorder:success
```

## 10. 前端联调设计

### 10.1 mes-web

需要展示：

```text
提交物料申请
批量释放生产任务
申请状态 PROCESSING/SUCCESS/FAILED
物料分配明细
配送状态
失败原因
```

### 10.2 wms-web

需要展示：

```text
库存预扣/锁定结果
出库单
出库明细
库存流水 LOCK/UNLOCK/OUTBOUND
库存不足失败记录
```

### 10.3 运营看板

需要展示：

```text
热门申请物料排行
仓库出库排行
生产线需求排行
申请成功/失败统计
安全库存预警
WebSocket 实时提示
```

## 11. K8s / 多实例开发约束

1. MQ 消费必须 `eventId` 幂等。
2. RabbitMQ 消费者必须业务处理成功后再 ack。
3. 可重试异常进入重试，不可恢复异常进入死信。
4. 库存锁定必须有数据库唯一约束或乐观锁兜底。
5. Redis Lua 多 key 必须处于同一 hash slot 或避免跨 slot。
6. task 定时补偿必须集群防重复。
7. WebSocket 多实例推送使用 Redis Pub/Sub 或 RabbitMQ 广播。
8. 所有服务日志输出 stdout，携带 `traceId`、`eventId`、`applyId`、`workOrderId`。

## 12. Jenkins 与阿里弹性容器

Jenkins 跨模块测试流水线：

```text
构建 mes-api / mes-service / mes-web
构建 wms-api / wms-service / wms-web
构建 task-api / task-service / 运营前端
启动 MySQL/Redis/RabbitMQ/Nacos
执行数据库迁移
执行单元测试
执行 MQ 集成测试
执行高并发库存申请压测
发布测试环境
执行端到端验收脚本
```

阿里弹性容器正式联动发布检查：

```text
所有服务正式镜像 tag
release 依赖版本
RabbitMQ 队列和死信配置
Redis Cluster / Sentinel 配置
数据库迁移兼容滚动发布
健康检查
资源限制
回滚顺序
```

推荐发布顺序：

```text
数据库兼容变更
  -> platform 公共包
  -> wms-service
  -> mes-service
  -> task-service
  -> 前端模块
```

## 13. 开发步骤提示词

```text
请开发 V07 MES、WMS、task 多方交互业务。

要求：
1. 只根据本 milestone、ROADMAP、DEVELOPMENT_RULE、PROGRESS 开发，不再读取 docs/design。
2. 先确认 V03、V04、V06 各自模块已可独立演示。
3. MES 提交物料申请后发送 MaterialApplyCreatedEvent。
4. WMS 消费物料申请事件，执行 Redis Lua 库存预扣和数据库库存批次锁定。
5. WMS 生成库存流水和出库单。
6. WMS 发送 InventoryAllocatedEvent 或 InventoryAllocateFailedEvent。
7. MES 消费库存分配结果，更新申请状态、工单物料状态、工单状态和配送状态。
8. task 消费 MES/WMS 事件，更新统计、排行和预警，并通过 WebSocket 推送。
9. 前端联调 mes-web、wms-web 和运营看板，展示完整业务流。
10. 所有 MQ 消费必须支持 eventId 幂等。
11. 实现高并发申请压测脚本，验证不超卖。
12. 补充跨模块 Jenkins 测试发布流程。
13. 补充阿里弹性容器正式联动版本发布检查。
14. 自动检查并更新 .gitignore，避免 target、dist、node_modules、压测报告临时文件、日志、.env、本地配置和密钥入库。
15. 检查本次准备纳入 Git 的文件是否存在账号、密码、token、API Key、私钥或内部地址，如存在必须改为环境变量、Secret、Jenkins 凭证或示例模板。
16. 更新本文件实现记录、对应 study、handle、PROGRESS 和根 README。
```

## 14. 自动测试提示词

```text
请验证 V07 MES、WMS、task 多方交互业务。

测试项：
1. MES 提交物料申请后 RabbitMQ 有 MaterialApplyCreatedEvent。
2. WMS 消费事件后 Redis 库存预扣不超卖。
3. WMS 锁定数据库库存批次并写入 LOCK 流水。
4. 分配成功后 MES 申请状态变为 SUCCESS，工单物料状态更新。
5. 分配失败后 MES 记录失败原因。
6. WMS 生成出库单并可在 wms-web 查询。
7. task 消费事件后排行和统计更新。
8. WebSocket 可推送排行或预警变化。
9. 重复 eventId 不重复扣库存、不重复统计。
10. 高并发压测 1000 QPS 级别不出现库存负数。
11. 前端可以从 MES 页面一路查看到 WMS 分配和 task 看板变化。
12. Jenkins 跨模块测试发布成功。
13. 阿里弹性容器正式联动发布检查通过。
14. 构建产物不包含敏感凭证。
```

## 15. 验收标准

1. MES、WMS、task 多方交互流程可演示。
2. 高并发库存预扣不超卖。
3. MQ 消费和跨模块事件处理幂等。
4. 前端能展示跨模块状态变化。
5. 失败场景有补偿记录或可追踪日志。
6. 测试环境和正式环境发布检查都有记录。

## 16. 验收操作过程

```text
1. 登录仓库管理员账号创建物料、仓库、库存。
2. 登录生产主管账号创建工单并绑定物料。
3. 发布工单并提交物料申请。
4. 登录仓库管理员账号查看 WMS 库存分配结果、出库单和库存流水。
5. 登录运营账号查看排行、统计和预警。
6. 重复投递同一事件，验证幂等。
7. 执行高并发申请压测，验证库存不为负。
8. 执行 Jenkins 跨模块测试发布。
9. 检查阿里弹性容器正式联动发布配置。
```

## 17. 实现记录

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
