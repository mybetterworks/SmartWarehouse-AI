# SmartWarehouse-AI 详细设计说明书

## 1. 文档说明

### 1.1 文档目的

本文档在概要设计基础上进一步描述 SmartWarehouse-AI 的模块设计、接口设计、核心流程设计、事件设计、异常处理、幂等控制、权限控制、缓存设计和 AI 服务设计，为编码实现提供直接依据。

### 1.2 项目英文名称

SmartWarehouse-AI

### 1.3 设计约束

1. 项目根目录即开发根目录。
2. 文档统一存放在 `docs` 目录。
3. 根 `pom.xml` 只聚合，不做强 parent。
4. Java 服务继承 `platform-parent`。
5. Java 服务导入 `platform-bom`。
6. 不包含 `task-client`、`mes-client`、`wms-client` 模块。
7. Maven 与 npm 制品使用阿里云效 release / snapshot 仓库管理。
8. 前端项目 `frontend-platform`、`wms-web`、`mes-web`、`ai-web` 直接放在项目根目录，与后端项目平级。

### 1.4 商用协作设计约束

项目当前仍使用根目录下的 Git 仓库统一管理全部代码，但设计和开发时必须按独立项目处理：

| 责任方 | 项目目录 | 开发边界 |
|---|---|---|
| 甲方平台团队 | `platform`、`gateway`、`sys`、`task` | 维护基础底座、网关、权限、风控、任务统计、统一规范和公共组件。 |
| 乙方 A | `wms` | 独立开发仓储后端服务，只通过 `wms-api` 暴露契约。 |
| 乙方 B | `mes` | 独立开发生产后端服务，只通过 `mes-api` 暴露契约。 |
| 乙方 C | `ai` | 独立开发 Python AI 后端服务，通过 REST / MCP 与平台集成。 |
| 甲方前端团队 | `frontend-platform` | 独立开发前端底座、统一登录、门户基座、`sys-web` 和平台 npm 包。 |
| 乙方 A 前端团队 | `wms-web` | 独立开发 WMS 前端页面。 |
| 乙方 B 前端团队 | `mes-web` | 独立开发 MES 前端页面。 |
| 乙方 C 前端团队 | `ai-web` | 独立开发 AI 前端页面。 |

独立项目约束：

1. 甲方基础底座变更必须优先保证向后兼容。
2. 乙方不得直接修改甲方 `platform` 公共源码，确需变更时通过评审后发布新版本。
3. 乙方不得直接依赖其他乙方服务实现源码，只能依赖 `*-api` 制品、REST 接口或 MQ 事件。
4. 乙方前端不得直接依赖 `frontend-platform` 源码，只能通过 `@smartwarehouse/*` npm 包接入平台能力。
5. CI/CD 应支持按目录独立构建、独立测试和独立部署。
6. Maven 制品统一发布到阿里云效 Maven 仓库，npm 制品统一发布到阿里云效 npm 仓库。

## 2. 模块详细设计

### 2.1 platform-parent

模块路径：

```text
platform/platform-parent
```

职责：

- 统一 Java 版本。
- 统一编码。
- 统一 Maven 编译插件。
- 统一测试插件。
- 统一 Spring Boot Maven Plugin。
- 统一 Maven deploy 配置。
- 统一 release / snapshot 仓库地址。

不承担：

- 不定义业务代码。
- 不定义具体服务路由。
- 不直接实现公共工具类。

### 2.2 platform-bom

模块路径：

```text
platform/platform-bom
```

职责：

- 统一第三方依赖版本。
- 统一内部平台组件版本。
- 统一 API 模块版本。

管理依赖类型：

```text
Spring Boot
Spring Cloud
Spring Cloud Alibaba
Nacos Client
Sentinel
Seata
Dubbo
MyBatis Plus
Redis
RabbitMQ
JWT
Knife4j
Lombok
MapStruct
Hutool
platform-common-*
sys-api
task-api
mes-api
wms-api
```

### 2.3 platform-common-core

核心类设计：

```text
com.smartwarehouse.common.core.domain.R
com.smartwarehouse.common.core.domain.PageQuery
com.smartwarehouse.common.core.domain.PageResult
com.smartwarehouse.common.core.exception.BizException
com.smartwarehouse.common.core.enums.ErrorCode
com.smartwarehouse.common.core.utils.DateUtils
com.smartwarehouse.common.core.utils.JsonUtils
```

统一响应结构：

```json
{
  "code": "0",
  "message": "success",
  "data": {},
  "traceId": "..."
}
```

### 2.4 platform-common-web

职责：

- 全局异常处理。
- 请求上下文。
- 参数校验错误处理。
- TraceId Filter。
- WebMvc 配置。

关键类：

```text
GlobalExceptionHandler
TraceIdFilter
RequestContextHolder
ValidationErrorHandler
```

### 2.5 platform-common-data

职责：

- MyBatis Plus 自动填充。
- 分页查询。
- 数据权限 SQL 拦截。
- 审计字段处理。

通用字段：

```text
id
tenant_id
created_by
created_time
updated_by
updated_time
deleted
version
```

### 2.6 platform-common-security-lite

职责：

- JWT 解析。
- 当前登录用户上下文。
- 权限注解。
- 数据权限上下文。

核心模型：

```text
LoginUser
DataScope
PermissionContext
WarehousePermission
```

### 2.7 platform-common-redis

职责：

- RedisTemplate 配置。
- 缓存工具。
- 分布式锁。
- Lua 脚本执行。
- Token 黑名单工具。

核心 Key：

```text
auth:blacklist:{tokenId}
login:fail:user:{username}
login:fail:ip:{ip}
stock:available:{materialId}:{warehouseId}
lock:stock:{materialId}:{warehouseId}
id:seq:{bizType}:{date}
```

### 2.8 platform-common-mq

职责：

- RabbitMQ 交换机、队列、路由 Key 常量。
- 消息发送封装。
- 消息消费幂等。
- 重试和死信封装。

事件基类：

```text
BaseEvent
  eventId
  eventType
  eventVersion
  occurredAt
  traceId
  sourceService
  bizId
```

### 2.9 platform-common-id

职责：

- Snowflake ID。
- 业务单号生成。
- Redis 自增序列。

业务单号规则：

```text
WO + yyyyMMdd + 6位序列
MA + yyyyMMdd + 6位序列
IN + yyyyMMdd + 6位序列
OUT + yyyyMMdd + 6位序列
STK + yyyyMMdd + 8位序列
```

## 3. gateway-service 详细设计

### 3.1 包结构

```text
com.smartwarehouse.gateway
├── config
├── filter
├── handler
├── security
└── route
```

### 3.2 路由设计

| 路由 ID | Path | 目标服务 |
|---|---|---|
| `sys-route` | `/api/sys/**` | `sys-service` |
| `mes-route` | `/api/mes/**` | `mes-service` |
| `wms-route` | `/api/wms/**` | `wms-service` |
| `task-route` | `/api/task/**` | `task-service` |
| `ai-route` | `/api/ai/**` | `ai-service` |

### 3.3 网关过滤器

处理顺序：

```text
TraceIdGlobalFilter
  -> CorsFilter
  -> JwtAuthFilter
  -> TokenBlacklistFilter
  -> PermissionFilter
  -> SentinelGatewayFilter
```

免登录接口：

```text
/api/sys/auth/login
/api/sys/auth/refresh
/api/sys/auth/captcha/jigsaw
/api/sys/auth/captcha/verify
/api/ai/health
/actuator/health
```

## 4. sys-service 详细设计

### 4.1 包结构

```text
com.smartwarehouse.sys
├── api
├── controller
├── application
├── domain
├── infrastructure
├── security
├── risk
└── log
```

### 4.2 登录接口

接口：

```text
POST /api/sys/auth/login
```

请求：

```json
{
  "username": "admin",
  "password": "123456",
  "captchaTicket": "optional",
  "captchaVerifyToken": "optional"
}
```

响应：

```json
{
  "accessToken": "...",
  "refreshToken": "...",
  "expiresIn": 7200
}
```

处理流程：

```text
校验参数
  -> 查询用户
  -> 校验账号状态
  -> 校验风控状态
  -> 若账号连续失败已达 3 次，校验拼图验证码通过凭证
  -> 校验密码
  -> 登录成功后清理失败次数和验证码风控状态
  -> 生成 Token
  -> 记录登录日志
```

### 4.3 随机拼图验证码接口

生成拼图挑战：

```text
GET /api/sys/auth/captcha/jigsaw?username=admin
```

响应：

```json
{
  "captchaTicket": "...",
  "backgroundImage": "base64...",
  "sliderImage": "base64...",
  "y": 128,
  "expiresIn": 120
}
```

校验拼图结果：

```text
POST /api/sys/auth/captcha/verify
```

请求：

```json
{
  "captchaTicket": "...",
  "x": 236,
  "track": []
}
```

响应：

```json
{
  "captchaVerifyToken": "...",
  "expiresIn": 120
}
```

设计规则：

- 用户连续失败未达到 3 次时，登录接口不强制要求拼图验证码。
- 用户连续失败达到 3 次后，登录接口必须携带有效的 `captchaVerifyToken`。
- 拼图背景图和缺口位置随机生成。
- 拼图挑战、验证结果和过期时间存放在 Redis。
- 拼图校验成功只表示通过验证码，不代表登录成功。
- 用户登录成功后，清理失败次数、拼图挑战和验证码通过凭证。

### 4.4 退出接口

接口：

```text
POST /api/sys/auth/logout
```

处理流程：

```text
解析 Token
  -> 计算剩余有效期
  -> 写入 Redis 黑名单
  -> 记录操作日志
```

### 4.5 登录风控设计

Redis Key：

```text
login:fail:user:{username}
login:fail:ip:{ip}
login:lock:user:{username}
login:lock:ip:{ip}
login:captcha:required:user:{username}
login:jigsaw:challenge:{captchaTicket}
login:jigsaw:passed:{captchaVerifyToken}
```

规则：

| 规则 | 处理 |
|---|---|
| 用户连续失败 3 次 | 启用随机拼图验证码 |
| 用户连续失败 5 次 | 锁定用户 10 分钟 |
| IP 1 分钟失败 20 次 | 锁定 IP 5 分钟 |
| 账号禁用 | 禁止登录 |
| Token 在黑名单 | 拒绝访问 |

### 4.6 数据权限设计

数据权限范围：

```text
ALL              全部数据
DEPT             本部门数据
DEPT_AND_CHILD   本部门及下级部门
SELF             本人数据
WAREHOUSE        指定仓库数据
```

仓库管理员只能查看自己负责仓库的数据。

实现方式：

- 登录后将仓库权限列表放入登录上下文。
- 查询 WMS 数据时传递用户上下文。
- `platform-common-data` 根据数据权限拼接查询条件。

## 5. mes-service 详细设计

### 5.1 模块结构

```text
mes
├── mes-api
└── mes-service
```

不包含：

```text
mes-client
```

### 5.2 mes-api 设计

内容：

```text
WorkOrderApi
MaterialApplyApi
DeliveryStatusApi
WorkOrderDTO
MaterialRequirementDTO
MaterialApplyDTO
DeliveryStatusDTO
```

### 5.3 mes-service 包结构

```text
com.smartwarehouse.mes
├── controller
├── application
├── domain
├── infrastructure
├── mq
└── listener
```

### 5.4 工单创建

接口：

```text
POST /api/mes/work-orders
```

处理：

```text
生成工单号
  -> 保存工单主表
  -> 保存工单物料需求
  -> 状态为 DRAFT
```

### 5.5 工单发布

接口：

```text
POST /api/mes/work-orders/{id}/release
```

处理：

```text
校验工单存在
  -> 校验已绑定物料
  -> 更新状态为 RELEASED
  -> 发送 WorkOrderReleasedEvent
```

### 5.6 物料申请

接口：

```text
POST /api/mes/work-orders/{id}/material-apply
```

处理：

```text
校验工单状态
  -> 生成申请号
  -> 写入 mes_material_apply
  -> 状态 PROCESSING
  -> 发送 MaterialApplyCreatedEvent
```

幂等规则：

- 同一工单、同一物料、同一申请批次只允许存在一条有效申请。
- `request_id` 建唯一索引。

### 5.7 库存分配结果监听

监听事件：

```text
InventoryAllocatedEvent
InventoryAllocateFailedEvent
```

处理：

```text
校验 eventId 幂等
  -> 查询物料申请
  -> 更新申请状态
  -> 更新工单物料分配状态
  -> 必要时更新工单状态
```

## 6. wms-service 详细设计

### 6.1 模块结构

```text
wms
├── wms-api
└── wms-service
```

不包含：

```text
wms-client
```

### 6.2 wms-api 设计

内容：

```text
MaterialApi
InventoryApi
InboundApi
OutboundApi
WarehouseApi
MaterialDTO
InventoryLockRequest
InventoryLockResponse
InventoryBatchDTO
InboundOrderDTO
OutboundOrderDTO
```

### 6.3 wms-service 包结构

```text
com.smartwarehouse.wms
├── controller
├── application
├── domain
├── infrastructure
├── inventory
├── inbound
├── outbound
├── importdata
├── mq
└── listener
```

### 6.4 入库审核

接口：

```text
POST /api/wms/inbound-orders/{id}/approve
```

处理：

```text
校验入库单状态
  -> 生成库存批次
  -> 增加可用库存
  -> 写入库存流水
  -> 更新入库单状态
```

事务：

- 单服务本地事务即可。
- 若扩展跨服务通知，可通过 MQ 异步通知 Task。

### 6.5 库存预扣 Lua 设计

Redis Key：

```text
stock:available:{materialId}:{warehouseId}
```

Lua 逻辑：

```text
读取可用库存
  -> 如果库存不存在，返回 STOCK_NOT_FOUND
  -> 如果库存小于申请数量，返回 INSUFFICIENT_STOCK
  -> 扣减库存
  -> 返回 SUCCESS
```

数据库落库失败补偿：

```text
Redis 预扣成功
  -> 数据库锁定失败
  -> 发送库存回补任务
  -> Redis 增加回补数量
  -> 记录补偿日志
```

### 6.6 物料申请事件消费

监听：

```text
MaterialApplyCreatedEvent
```

处理：

```text
校验 eventId 是否已消费
  -> 执行 Redis 预扣
  -> 查询库存批次
  -> 按批次锁定库存
  -> 写入库存流水
  -> 生成出库任务
  -> 发布 InventoryAllocatedEvent
```

批次分配策略：

- 默认先进先出。
- 有效期近的批次优先。
- 同一申请可以拆分多个批次。

### 6.7 离线上传

接口：

```text
POST /api/wms/import/inbound
GET  /api/wms/import/tasks/{taskId}
GET  /api/wms/import/tasks/{taskId}/errors
```

处理：

```text
上传文件
  -> 创建导入任务
  -> 异步解析文件
  -> 校验物料、仓库、库位、数量、批次
  -> 合法数据生成入库单
  -> 错误数据写入错误表
  -> 更新任务进度
```

## 7. task-service 详细设计

### 7.1 模块结构

```text
task
├── task-api
└── task-service
```

不包含：

```text
task-client
```

### 7.2 task-api 设计

内容：

```text
StatApi
RankApi
AlertApi
DailyStatDTO
RankDTO
StockAlertDTO
```

### 7.3 task-service 包结构

```text
com.smartwarehouse.task
├── controller
├── job
├── stat
├── rank
├── compensation
├── websocket
└── listener
```

### 7.4 定时任务

| 任务 | 频率 | 说明 |
|---|---|---|
| 安全库存扫描 | 每 5 分钟 | 扫描库存低于安全库存的物料。 |
| 日统计生成 | 每天 00:10 | 生成昨日入库、出库、申请统计。 |
| 排行快照 | 每 10 分钟 | 将 Redis 排行快照落库。 |
| 补偿扫描 | 每 1 分钟 | 处理失败补偿任务。 |
| Token 黑名单清理 | 每小时 | 清理过期黑名单 Key。 |

### 7.5 实时排行

Redis ZSet：

```text
rank:material:apply
rank:warehouse:outbound
rank:line:demand
rank:workorder:success
```

更新方式：

- 消费业务事件实时更新。
- 定时落库保存快照。
- WebSocket 推送前端看板。

## 8. ai-service 详细设计

### 8.1 包结构

```text
ai_service
├── api
├── rag
├── prompts
├── agents
├── mcp
├── chatbi
├── clients
├── vector_db
├── schemas
└── core
```

### 8.2 RAG 流程

```text
用户提问
  -> 问题改写
  -> 向量检索
  -> 召回文档片段
  -> 可选重排
  -> 组装 Prompt
  -> LLM 生成答案
  -> 返回引用来源
```

### 8.3 多 Agent 设计

| Agent | 职责 |
|---|---|
| `RouterAgent` | 判断问题类型。 |
| `WmsQaAgent` | 回答仓储、库存、入库、出库问题。 |
| `MesAgent` | 分析工单、物料申请、配送状态。 |
| `BiAgent` | 自然语言转 SQL，生成统计结果。 |
| `RiskAgent` | 分析登录风控、库存异常、任务失败。 |

### 8.4 MCP 工具设计

工具：

```text
query_inventory
query_work_order
query_material_apply
query_stock_alert
query_daily_stat
run_safe_sql
```

MCP 工具约束：

- 只允许只读查询。
- SQL 必须经过白名单校验。
- 禁止 delete、update、insert、drop、alter。
- 必须记录工具调用日志。

### 8.5 ChatBI 设计

流程：

```text
用户输入自然语言问题
  -> 识别指标和维度
  -> 选择数据源
  -> 生成 SQL
  -> SQL 安全校验
  -> 执行查询
  -> 生成文字解释
  -> 返回表格和图表建议
```

示例：

```text
问题：最近 7 天哪个物料申请次数最多？
数据源：mes_material_apply
指标：申请次数
维度：物料
时间范围：最近 7 天
```

## 9. 前端项目详细设计

### 9.1 前端项目结构

前端项目直接放在 SmartWarehouse-AI 根目录，与后端项目平级：

```text
frontend-platform
wms-web
mes-web
ai-web
```

### 9.2 frontend-platform 设计

`frontend-platform` 由甲方维护，建议结构：

```text
frontend-platform
├── packages
│   ├── platform-ui
│   ├── platform-sdk
│   ├── platform-theme
│   └── platform-types
└── apps
    ├── portal-shell
    └── sys-web
```

职责：

- `portal-shell`：统一登录页、门户框架、Token 管理、菜单装载、模块入口、退出登录。
- `sys-web`：用户、角色、菜单、部门、岗位、字典、登录日志、操作日志、风控记录、数据权限页面。
- `platform-ui`：基于 Element Plus 的平台组件库。
- `platform-sdk`：统一 request、auth、dict、user、org、file 等 SDK。
- `platform-theme`：主题变量、全局样式和设计规范。
- `platform-types`：前端共享类型定义。

### 9.3 乙方前端项目设计

乙方前端项目：

| 项目 | 责任方 | 页面范围 |
|---|---|---|
| `wms-web` | 乙方 A | 物料、仓库、库区、库位、入库、出库、库存批次、库存流水、离线上传。 |
| `mes-web` | 乙方 B | 工单、工单物料、物料申请、配送状态。 |
| `ai-web` | 乙方 C | RAG 问答、ChatBI、多 Agent、MCP 工具调用记录。 |

每个乙方前端项目建议结构：

```text
<module>-web
├── package.json
├── src
│   ├── api
│   ├── assets
│   ├── components
│   ├── router
│   ├── stores
│   ├── views
│   └── module.ts
└── deploy
```

### 9.4 统一登录与模块加载

登录流程：

```text
用户访问 portal-shell
  -> 展示统一登录页
  -> 调用 /api/sys/auth/login
  -> 保存 Access Token 和 Refresh Token
  -> 拉取用户信息、菜单权限、数据权限
  -> 根据菜单和模块描述加载 sys-web / wms-web / mes-web / ai-web
```

路由前缀：

```text
sys-web -> /sys
wms-web -> /wms
mes-web -> /mes
ai-web -> /ai
```

API 前缀：

```text
/api/sys/**
/api/wms/**
/api/mes/**
/api/task/**
/api/ai/**
```

### 9.5 前端 npm 依赖边界

乙方前端不得通过相对路径引用 `frontend-platform` 源码，只能依赖甲方发布到阿里云效 npm 制品库的包：

```text
@smartwarehouse/platform-ui
@smartwarehouse/platform-sdk
@smartwarehouse/platform-theme
@smartwarehouse/platform-types
```

依赖规则：

- 正式版本从 npm release 仓库安装。
- 联调版本从 npm snapshot 仓库安装，或使用 `next` / `snapshot` dist-tag。
- 乙方项目应锁定平台包版本，避免被 `latest` 自动升级影响。
- 权限按钮、字典下拉、用户选择、组织选择、文件上传下载、接口请求等能力优先使用甲方平台包。

## 10. 消息事件详细设计

### 10.1 交换机设计

| 交换机 | 类型 | 说明 |
|---|---|---|
| `smart.topic.exchange` | topic | 业务事件交换机。 |
| `smart.dlx.exchange` | topic | 死信交换机。 |

### 10.2 队列设计

| 队列 | Routing Key | 消费者 |
|---|---|---|
| `wms.material.apply.queue` | `mes.material.apply.created` | wms-service |
| `mes.inventory.result.queue` | `wms.inventory.*` | mes-service |
| `task.biz.event.queue` | `*.biz.*` | task-service |
| `task.compensation.queue` | `*.compensation.*` | task-service |

### 10.3 MaterialApplyCreatedEvent

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

### 10.4 InventoryAllocatedEvent

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

### 10.5 InventoryAllocateFailedEvent

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

## 11. 缓存详细设计

### 11.1 Token 黑名单

```text
Key: auth:blacklist:{jti}
Value: userId
TTL: Token 剩余有效期
```

### 11.2 登录失败次数

```text
Key: login:fail:user:{username}
Value: failCount
TTL: 10 分钟
```

### 11.3 IP 登录失败次数

```text
Key: login:fail:ip:{ip}
Value: failCount
TTL: 1 分钟
```

### 11.4 随机拼图验证码

是否要求验证码：

```text
Key: login:captcha:required:user:{username}
Value: true
TTL: 10 分钟
```

拼图挑战：

```text
Key: login:jigsaw:challenge:{captchaTicket}
Value: 缺口坐标、背景图标识、允许误差、生成时间
TTL: 2 分钟
```

验证码通过凭证：

```text
Key: login:jigsaw:passed:{captchaVerifyToken}
Value: username
TTL: 2 分钟
```

### 11.5 库存可用量

```text
Key: stock:available:{materialId}:{warehouseId}
Value: availableQty
```

### 11.6 排行榜

```text
Key: rank:material:apply
Type: ZSet
Member: materialId
Score: applyCount
```

## 12. 权限详细设计

### 12.1 菜单权限

前端菜单由用户角色决定：

```text
用户 -> 用户角色 -> 角色菜单 -> 菜单树
```

### 12.2 接口权限

后端接口通过权限标识控制：

```text
sys:user:list
sys:role:create
wms:material:list
wms:inventory:lock
mes:workorder:create
task:rank:view
ai:chatbi:query
```

### 12.3 数据权限

WMS 数据按仓库隔离：

```text
user_id -> warehouse_id list
```

查询库存、入库单、出库单时自动附加仓库条件。

## 13. 异常码设计

### 13.1 通用异常码

| 异常码 | 说明 |
|---|---|
| `0` | 成功 |
| `400` | 请求参数错误 |
| `401` | 未认证 |
| `403` | 无权限 |
| `404` | 资源不存在 |
| `429` | 请求过于频繁 |
| `500` | 系统异常 |

### 13.2 业务异常码

| 异常码 | 说明 |
|---|---|
| `SYS_001` | 用户不存在 |
| `SYS_002` | 密码错误 |
| `SYS_003` | 账号已锁定 |
| `SYS_004` | 需要随机拼图验证码 |
| `SYS_005` | 拼图验证码校验失败 |
| `WMS_001` | 物料不存在 |
| `WMS_002` | 库存不足 |
| `WMS_003` | 库存批次不存在 |
| `MES_001` | 工单不存在 |
| `MES_002` | 工单状态不允许操作 |
| `TASK_001` | 任务执行失败 |
| `AI_001` | AI 服务繁忙 |
| `AI_002` | SQL 安全校验失败 |

## 14. 幂等详细设计

| 场景 | 幂等 Key | 落地方式 |
|---|---|---|
| 物料申请 | `request_id` | 数据库唯一索引。 |
| MQ 消费 | `event_id` | 消费记录表或 Redis。 |
| 库存锁定 | `apply_id + material_id` | 数据库唯一索引。 |
| 退出登录 | `jti` | Redis 黑名单覆盖写。 |
| 离线导入 | `file_hash` | 导入任务唯一约束。 |
| MCP 工具调用 | `tool_call_id` | AI 调用日志。 |

## 15. 阿里云效制品库详细设计

### 15.1 Maven 发布到 release 仓库

Java 正式版本：

```text
1.0.0
1.1.0
2.0.0
```

### 15.2 Maven 发布到 snapshot 仓库

Java 开发版本：

```text
1.0.1-SNAPSHOT
1.1.0-SNAPSHOT
```

### 15.3 Maven 发布模块

```text
platform-parent
platform-bom
platform-common-core
platform-common-web
platform-common-data
platform-common-security-lite
platform-common-redis
platform-common-mq
platform-common-log
platform-common-id
sys-api
task-api
mes-api
wms-api
```

### 15.4 npm 发布规则

前端 npm 制品统一通过阿里云效 npm 制品库管理。

内部包命名建议：

```text
@smartwarehouse/platform-ui
@smartwarehouse/platform-sdk
@smartwarehouse/platform-theme
@smartwarehouse/platform-types
```

正式版本：

```text
1.0.0
1.1.0
2.0.0
```

联调版本：

```text
1.1.0-beta.1
1.1.0-snapshot.1
```

npm 仓库规则：

- 正式版本发布到 npm release 仓库。
- 联调版本发布到 npm snapshot 仓库，或使用 `next` / `snapshot` dist-tag。
- `frontend-platform`、`wms-web`、`mes-web`、`ai-web` 通过各自 `.npmrc` 将 `@smartwarehouse` scope 指向阿里云效 npm registry。
- 乙方前端模块只通过 npm 包复用甲方平台组件、SDK、主题和类型定义。

### 15.5 不发布为普通依赖的模块

```text
gateway-service
sys-service
task-service
mes-service
wms-service
```

这些模块只发布 Docker 镜像或可执行 Jar。

## 16. K8s 多实例开发详细设计

### 16.1 无状态服务设计

以下服务必须按无状态服务开发：

```text
gateway-service
sys-service
task-service
wms-service
mes-service
ai-service
```

禁止将可靠业务状态只保存在本地内存或 Pod 本地磁盘中，包括：

```text
登录 Session
刷新 Token
Token 黑名单
登录失败次数
随机拼图验证码
库存预扣状态
导入任务进度
定时任务执行状态
WebSocket 用户连接路由
AI 会话上下文
RAG 文档和向量索引
```

状态存储位置：

| 状态 | 存储位置 |
|---|---|
| Token 黑名单、登录失败次数、拼图验证码 | Redis |
| 用户、角色、菜单、日志、风控记录 | MySQL |
| 库存预扣、实时排行、分布式锁 | Redis |
| 库存批次、库存流水、导入任务 | MySQL |
| MQ 事件、异步补偿 | RabbitMQ + MySQL |
| 上传文件、AI 文档 | MinIO / OSS / PVC |
| RAG 向量 | Vector DB / 持久化卷 |

### 16.2 配置外置设计

代码中禁止硬编码：

```text
localhost
127.0.0.1
固定 IP
固定 Pod 名称
数据库账号密码
Redis 密码
RabbitMQ 密码
JWT Secret
LLM API Key
对象存储密钥
```

配置来源：

```text
Nacos
K8s ConfigMap
K8s Secret
环境变量
启动参数
```

建议所有服务支持以下配置项：

```text
SPRING_PROFILES_ACTIVE
NACOS_SERVER_ADDR
MYSQL_HOST
REDIS_MODE
REDIS_NODES
RABBITMQ_ADDRESSES
SEATA_TX_GROUP
JWT_SECRET
OBJECT_STORAGE_ENDPOINT
AI_MODEL_API_KEY
```

### 16.3 健康检查设计

Java 服务提供：

```text
/actuator/health/liveness
/actuator/health/readiness
/actuator/health
```

AI 服务提供：

```text
/health/live
/health/ready
```

检查规则：

| 检查 | 说明 |
|---|---|
| Liveness | 判断进程是否存活，失败后由 K8s 重启容器。 |
| Readiness | 判断实例是否可以接收流量，应考虑数据库、Redis、MQ 等关键依赖。 |
| Startup | 用于 AI 服务或启动较慢的 Java 服务，避免启动期被误杀。 |

健康检查不能执行重 SQL、LLM 调用、大文件检查等高成本操作。

### 16.4 优雅停机设计

Pod 收到 SIGTERM 后必须：

```text
停止接收新请求
等待正在处理的 HTTP 请求完成
停止拉取新的 MQ 消息
已接收 MQ 消息处理成功后再 ack
完成或回滚数据库事务
关闭 WebSocket 连接或通知客户端重连
释放分布式锁
停止 AI 长任务接收
```

RabbitMQ 消费者必须在业务处理成功后再 ack，不能在消费开始时提前 ack。

### 16.5 MQ 多实例消费设计

多实例消费时必须满足：

```text
eventId 幂等
业务唯一键幂等
失败可重试
超过重试次数进入死信队列
死信可人工或任务补偿
消费日志可追踪
```

推荐消费流程：

```text
收到消息
  -> 校验 eventId 是否已处理
  -> 执行业务逻辑
  -> 写消费记录
  -> ack
```

异常处理：

```text
可重试异常 -> nack / retry
不可恢复异常 -> dead letter
```

### 16.6 定时任务集群设计

`task-service` 多实例部署后，以下任务不能重复执行：

```text
安全库存扫描
每日运营统计
排行快照落库
补偿任务扫描
过期 Token 清理
导入任务补偿
```

实现方案任选其一：

```text
XXL-Job
Quartz JDBC 集群模式
ShedLock + Redis/MySQL
K8s CronJob
Redis 分布式锁
K8s Leader Election
```

如果使用 `@Scheduled`，必须增加分布式锁，例如：

```text
lock:job:stock-alert-scan
lock:job:daily-stat
lock:job:rank-snapshot
```

### 16.7 Redis Cluster 设计

Redis 用于库存预扣、登录风控、Token 黑名单、排行、幂等和分布式锁。开发时要兼容 standalone、sentinel、cluster 模式。

Redis Cluster 注意事项：

1. Lua 脚本涉及多个 key 时，key 应位于同一个 hash slot。
2. 多 key 使用 hash tag，例如 `{materialId}`。
3. 分布式锁必须设置过期时间。
4. 释放锁必须校验 value，不能误删其他实例的锁。
5. Redis 不是库存最终事实来源，MySQL 库存批次和库存流水才是最终依据。

库存 key 示例：

```text
stock:{materialId}:available:{warehouseId}
stock:{materialId}:locked:{warehouseId}
lock:stock:{materialId}:{warehouseId}
```

### 16.8 分布式 ID 设计

Snowflake 的 workerId 不能写死，避免多个 Pod 生成重复 ID。

推荐 workerId 分配方式：

```text
Redis 分配
Nacos 分配
数据库登记
StatefulSet ordinal
Pod 名称哈希并检测冲突
```

业务单号序列不能依赖本地内存自增，建议使用 Redis INCR、数据库序列表或分布式 ID 组件。

### 16.9 文件与对象存储设计

离线上传入库文件、错误报告、AI 文档不得只保存在 Pod 本地目录。

推荐存储：

```text
MinIO
阿里云 OSS
PVC
NFS
```

离线上传推荐流程：

```text
前端上传文件
  -> wms-service 保存到对象存储
  -> 记录 wms_import_task
  -> RabbitMQ 异步解析
  -> 解析结果落库
  -> 错误报告保存到对象存储
```

### 16.10 WebSocket 多实例设计

`task-service` 多实例部署后，WebSocket 连接可能分散在不同 Pod。

禁止假设所有用户连接都在同一个实例。推荐方案：

```text
连接信息保存到 Redis
Redis Pub/Sub 或 RabbitMQ 广播推送事件
每个 WebSocket 实例只向本实例连接用户推送
必要时 Ingress 启用 sticky session
```

推送事件必须包含：

```text
userId
messageType
traceId
bizId
payload
```

### 16.11 AI 服务 K8s 设计

`ai-service` 多实例部署时：

1. 会话状态不能只放进程内存。
2. RAG 文档不能只放本地磁盘。
3. 向量库必须持久化或使用独立向量数据库。
4. LLM API Key 使用 Secret 管理。
5. LLM 调用要设置超时、重试、限流和熔断。
6. ChatBI SQL 必须只读、限制超时时间和最大返回行数。

### 16.12 前端 K8s / Nginx 设计

前端项目支持独立构建镜像或静态资源包：

```text
frontend-platform -> /
sys-web           -> /apps/sys/
wms-web           -> /apps/wms/
mes-web           -> /apps/mes/
ai-web            -> /apps/ai/
```

开发要求：

- 前端不能写死 API 域名。
- 所有接口通过 Gateway 的 `/api/**` 访问。
- Vite base path 支持环境变量配置。
- Nginx 支持 history fallback。
- 运行时配置可通过 `config.json` 或 Nginx 注入。
- 前端镜像不包含 npm 发布 token 和私有 registry 凭据。

### 16.13 数据库连接池与资源限制

多 Pod 会放大数据库连接数。每个服务需要显式配置连接池：

```text
maximumPoolSize
minimumIdle
connectionTimeout
idleTimeout
maxLifetime
```

K8s 部署时需要设置：

```text
resources.requests.cpu
resources.requests.memory
resources.limits.cpu
resources.limits.memory
```

Java 服务需要结合容器内存配置 JVM，例如：

```text
-XX:MaxRAMPercentage
-XX:InitialRAMPercentage
```

### 16.14 滚动发布兼容设计

K8s 滚动升级时，新旧版本会短时间共存。开发时必须保证：

```text
接口新增字段向后兼容
MQ 事件新增字段向后兼容
数据库字段先加后用
前端和后端短时间版本不一致时可用
废弃字段先 Deprecated，再跨版本删除
```

推荐发布顺序：

```text
数据库兼容变更
  -> 后端兼容版本
  -> 前端版本
  -> 清理废弃字段或接口
```
