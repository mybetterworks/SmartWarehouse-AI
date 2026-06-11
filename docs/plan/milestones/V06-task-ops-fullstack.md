# V06 甲方 task 运营统计前后端模块

## 1. 版本状态

```text
状态：TODO
负责人：甲方平台团队
前置版本：V05
输出结果：task 后端 + 门户运营看板形成统计、排行、预警、WebSocket 闭环
```

## 2. 版本开发输入边界

本文件已经内置 V06 需要的设计信息。开发 V06 时以本文件、`docs/plan/ROADMAP.md`、`docs/plan/DEVELOPMENT_RULE.md`、`docs/plan/PROGRESS.md` 为准，不需要再读取 `docs/design` 下的设计文档。

V06 只开发甲方 task 运营统计模块和门户运营看板，包括定时任务、运营统计、实时排行、安全库存预警、补偿记录、WebSocket 推送。MES/WMS/task 的完整事件联动放到 V07。

## 3. 版本目标

1. 开发 `task/task-api` 和 `task/task-service`，禁止创建 `task-client`。
2. 在 `frontend-platform` 中开发运营看板或 task 页面。
3. 实现任务执行日志、每日统计、排行快照、补偿日志、事件消费日志。
4. 实现实时排行、安全库存预警、WebSocket 推送。
5. 实现定时任务多实例防重复执行。
6. 接入 V03 WMS 和 V04 MES 的基础数据，用于统计和看板展示。
7. 通过 Jenkins 发布 task 测试版本，通过阿里弹性容器发布 task 正式版本检查。

## 4. 项目与代码架构

### 4.1 后端目录

```text
task
├── pom.xml
├── task-api
├── task-service
└── deploy
    ├── Dockerfile
    ├── docker-compose.task.yml
    ├── nacos-template.yml
    └── README.md
```

`task-api` 契约：

```text
StatApi
RankApi
AlertApi
JobLogApi
CompensationApi
DailyStatDTO
RankDTO
StockAlertDTO
JobLogDTO
```

`task-service` 包结构：

```text
com.smartwarehouse.task
├── controller
├── job
├── stat
├── rank
├── alert
├── compensation
├── websocket
└── listener
```

### 4.2 前端目录

V06 的前端由甲方维护，建议放在：

```text
frontend-platform/apps/portal-shell
frontend-platform/apps/sys-web 或 frontend-platform/apps/ops-web
```

如果不新增 `ops-web`，可在 `portal-shell` 中增加运营看板路由：

```text
/task/dashboard
/task/stat-daily
/task/rank
/task/stock-alert
/task/job-log
/task/compensation
```

## 5. 业务功能要求

### 5.1 定时任务

必须实现以下任务：

| 任务 | 频率 | 说明 |
|---|---|---|
| 安全库存扫描 | 每 5 分钟 | 扫描库存低于安全库存的物料，生成或更新预警。 |
| 日统计生成 | 每天 00:10 | 生成昨日入库、出库、申请统计。 |
| 排行快照 | 每 10 分钟 | 将 Redis 排行快照落库。 |
| 补偿扫描 | 每 1 分钟 | 处理失败补偿任务。 |
| Token 黑名单清理 | 每小时 | 清理过期黑名单 Key 或记录清理日志。 |

多实例约束：

```text
不能依赖普通单实例 @Scheduled
如使用 @Scheduled 必须加 Redis/MySQL 分布式锁
可选择 ShedLock、XXL-Job、Quartz JDBC、K8s CronJob、Leader Election
```

推荐锁：

```text
lock:job:stock-alert-scan
lock:job:daily-stat
lock:job:rank-snapshot
lock:job:compensation-scan
lock:job:token-blacklist-clean
```

### 5.2 运营统计

日统计指标：

```text
统计日期
仓库
入库数量
出库数量
物料申请次数
申请成功次数
申请失败次数
```

V06 可通过查询 WMS/MES 公开接口或只读统计适配器生成统计。V07 起通过 MQ 事件实时增量更新并定时校准。

### 5.3 实时排行

Redis ZSet：

```text
rank:material:apply
rank:warehouse:outbound
rank:line:demand
rank:workorder:success
```

排行类型：

```text
热门申请物料排行
仓库作业量排行
生产线物料需求排行
工单分配成功排行
```

V06 支持手动刷新、定时快照和页面查询。V07 接入 MES/WMS 事件后实时更新。

### 5.4 安全库存预警

来源：

```text
wms_material.safe_stock_qty
wms_inventory_batch.available_qty 汇总
```

规则：

```text
当前库存 < 安全库存 -> OPEN
当前库存越低 alert_level 越高
库存恢复后可标记 PROCESSED 或自动关闭
```

预警推送：

```text
生成预警
  -> 写入 WMS 或 task 侧预警视图/记录
  -> WebSocket 推送运营看板
```

### 5.5 WebSocket 推送

推送类型：

```text
STOCK_ALERT
RANK_CHANGED
DAILY_STAT_UPDATED
JOB_FAILED
```

多实例约束：

1. WebSocket 连接信息不得只保存在本地内存。
2. 推荐 Redis Pub/Sub 或 RabbitMQ 广播推送事件。
3. 每个 WebSocket 实例只向本实例连接的用户推送。
4. 推送事件必须包含：

```text
userId
messageType
traceId
bizId
payload
```

### 5.6 补偿任务

补偿场景：

```text
MQ 消费失败
库存分配失败待回补
WMS 成功但 MES 状态未更新
导入任务部分失败
统计生成失败
```

V06 先实现补偿日志和扫描框架，V07 接入真实跨模块补偿。

## 6. 接口设计

### 6.1 统计接口

```text
GET  /api/task/stats/daily
POST /api/task/stats/daily/generate
GET  /api/task/stats/summary
```

### 6.2 排行接口

```text
GET  /api/task/ranks
GET  /api/task/ranks/{rankType}
POST /api/task/ranks/{rankType}/snapshot
POST /api/task/ranks/{rankType}/refresh
```

### 6.3 预警接口

```text
GET  /api/task/stock-alerts
POST /api/task/stock-alerts/scan
POST /api/task/stock-alerts/{id}/process
POST /api/task/stock-alerts/{id}/ignore
```

### 6.4 任务日志接口

```text
GET /api/task/job-logs
GET /api/task/job-logs/{id}
```

### 6.5 补偿接口

```text
GET  /api/task/compensations
POST /api/task/compensations/{id}/retry
POST /api/task/compensations/scan
```

### 6.6 WebSocket

```text
GET /api/task/ws?token={accessToken}
```

或通过前端运行时配置走 Gateway/Nginx 转发：

```text
/api/task/ws
```

## 7. 前端页面设计

必须实现：

```text
/task/dashboard       运营看板
/task/stat-daily      每日统计
/task/rank            实时排行
/task/stock-alert     安全库存预警
/task/job-log         任务日志
/task/compensation    补偿记录
```

页面要求：

1. 使用 `PlatformPage`、`PlatformSearchForm`、`PlatformTable`、`PermissionButton`、`StatusTag`。
2. 看板展示今日入库、今日出库、申请次数、失败次数、安全库存预警数。
3. 排行页面展示 Redis 实时排行和落库快照。
4. WebSocket 推送到达时刷新看板或局部更新。
5. 所有请求使用 `platform-sdk`，不写死 API 地址。

## 8. 数据库设计

数据库：`smart_task`

### 8.1 task_job_log

```text
id bigint PK
job_name varchar(128) IDX
job_type varchar(64)
status varchar(32) IDX -- SUCCESS/FAILED
start_time datetime IDX
end_time datetime
cost_ms bigint
error_message varchar(1024)
trace_id varchar(64) IDX
```

### 8.2 task_stat_daily

```text
id bigint PK
stat_date date IDX
warehouse_id bigint IDX
inbound_qty decimal(18,4)
outbound_qty decimal(18,4)
apply_count int
apply_success_count int
apply_fail_count int
created_time datetime
```

唯一索引：`uk_task_stat_daily(stat_date, warehouse_id)`

### 8.3 task_rank_snapshot

```text
id bigint PK
rank_type varchar(64) IDX
rank_date date IDX
rank_key varchar(128) IDX
rank_name varchar(128)
score decimal(18,4)
rank_no int
created_time datetime
```

建议唯一索引：`uk_task_rank(rank_type, rank_date, rank_key)`

### 8.4 task_compensation_log

```text
id bigint PK
biz_type varchar(64) IDX
biz_id varchar(128) IDX
event_id varchar(128) IDX
status varchar(32) IDX -- PENDING/SUCCESS/FAILED
retry_count int
max_retry_count int
next_retry_time datetime IDX
error_message varchar(1024)
created_time datetime
updated_time datetime
```

### 8.5 task_event_consume_log

```text
id bigint PK
event_id varchar(128) UK
event_type varchar(128) IDX
consumer varchar(128) IDX
status varchar(32) -- SUCCESS/FAILED
error_message varchar(1024)
created_time datetime IDX
```

## 9. 缓存与消息设计

Redis ZSet：

```text
rank:material:apply
rank:warehouse:outbound
rank:line:demand
rank:workorder:success
```

Redis 分布式锁：

```text
lock:job:stock-alert-scan
lock:job:daily-stat
lock:job:rank-snapshot
lock:job:compensation-scan
```

RabbitMQ 预留队列：

```text
task.biz.event.queue
task.compensation.queue
```

V06 可先建立监听框架和消费幂等记录，V07 接入真实业务事件。

## 10. K8s / 多实例开发约束

1. `task-service` 必须无状态。
2. 定时任务必须集群防重复。
3. WebSocket 路由不得只依赖本地内存。
4. MQ 消费必须在业务成功后 ack，不得提前 ack。
5. 所有配置通过 Nacos、环境变量、ConfigMap 或 Secret 注入。
6. 健康检查提供：

```text
/actuator/health/liveness
/actuator/health/readiness
/actuator/health
```

7. 日志输出 stdout，携带 `traceId`、`serviceName`、`jobName`、`bizId`。

## 11. Jenkins 与阿里弹性容器

Jenkins 测试流水线：

```text
构建 task-api
构建 task-service
运行单元测试和接口测试
构建 task-service Docker 镜像
构建运营看板前端
发布测试环境
执行健康检查、任务冒烟测试和 WebSocket 冒烟测试
```

阿里弹性容器正式发布检查：

```text
正式镜像 tag
release 依赖版本
Nacos 配置
MySQL/Redis/RabbitMQ Secret
WebSocket 转发配置
健康检查
资源限制
回滚说明
```

## 12. 开发步骤提示词

```text
请开发 V06 甲方 task 运营统计前后端模块。

要求：
1. 只根据本 milestone、ROADMAP、DEVELOPMENT_RULE、PROGRESS 开发，不再读取 docs/design。
2. 创建 task-api 和 task-service，不创建 task-client。
3. 实现任务日志、每日统计、实时排行、安全库存预警、补偿记录和事件消费记录。
4. 在 frontend-platform 中实现运营看板、排行、预警、任务日志、补偿记录页面。
5. 实现 WebSocket 连接、鉴权、订阅和消息推送。
6. 定时任务必须支持多实例，不能依赖单实例 @Scheduled；如使用 @Scheduled 必须加分布式锁。
7. task 接口统一走 /api/task/**。
8. 补充 task Jenkins 测试发布流程。
9. 补充 task 阿里弹性容器正式发布检查。
10. 自动检查并更新 .gitignore，避免 target、dist、node_modules、日志、.env、本地配置和密钥入库。
11. 检查本次准备纳入 Git 的文件是否存在账号、密码、token、API Key、私钥或内部地址，如存在必须改为环境变量、Secret、Jenkins 凭证或示例模板。
12. 更新本文件实现记录、对应 study、handle、PROGRESS 和根 README。
```

## 13. 自动测试提示词

```text
请验证 V06 甲方 task 运营统计前后端模块。

测试项：
1. task-service 后端测试通过。
2. 运营看板前端构建通过。
3. 定时任务执行后写入 task_job_log。
4. 统计和排行接口可查询。
5. 安全库存预警可展示。
6. WebSocket 可推送预警或排行变化。
7. 多实例任务不会重复执行。
8. 重复 eventId 不重复消费。
9. Jenkins 测试版本发布成功。
10. 阿里弹性容器正式发布检查通过。
11. 构建产物不包含 token、数据库密码、内部地址。
```

## 14. 验收标准

1. task 后端和运营前端在同一版本可演示。
2. 统计、排行、预警和 WebSocket 形成闭环。
3. 多实例任务有防重复设计。
4. 补偿记录和事件消费记录可追踪。
5. task 测试环境和正式环境发布检查都有记录。

## 15. 验收操作过程

```text
1. 登录运营账号。
2. 进入运营看板。
3. 触发统计任务或等待定时任务执行。
4. 查看每日统计、实时排行和安全库存预警。
5. 打开 WebSocket 客户端或页面，验证推送。
6. 重复触发同一任务，验证分布式锁防重复。
7. 执行 Jenkins task 测试发布。
8. 检查阿里弹性容器 task 正式发布配置。
```

## 16. 实现记录

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
