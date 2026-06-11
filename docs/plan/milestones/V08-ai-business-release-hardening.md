# V08 AI 与业务服务交互及发布加固

## 1. 版本状态

```text
状态：TODO
负责人：甲方平台团队统筹，AI/WMS/MES 乙方配合
前置版本：V07
输出结果：AI 与业务服务深度联动，正式环境发布、可观测性和弹性容器演示完善
```

## 2. 版本开发输入边界

本文件已经内置 V08 需要的设计信息。开发 V08 时以本文件、`docs/plan/ROADMAP.md`、`docs/plan/DEVELOPMENT_RULE.md`、`docs/plan/PROGRESS.md` 为准，不需要再读取 `docs/design` 下的设计文档。

V08 是全链路收口版本，重点是 AI 与真实业务数据交互、ChatBI 安全查询、多 Agent 业务分析、MCP 工具调用追踪、Jenkins 全链路测试、阿里弹性容器正式环境发布加固、可观测性和回滚说明。不新增大范围业务模块。

## 3. 版本目标

1. AI 通过 MCP / REST 查询 WMS、MES、task、sys 业务数据。
2. ChatBI 支持库存、工单、入库、出库、排行、预警、登录风控等只读查询。
3. 多 Agent 支持库存风险、登录风控、任务失败、物料申请失败率分析。
4. `ai-web` 展示业务问答、ChatBI 结果、Agent 分析和 MCP 调用记录。
5. 完善 Jenkins 全链路测试流水线。
6. 完善阿里弹性容器正式环境部署、回滚、健康检查和可观测性。
7. 完善日志 traceId、serviceName、podName 或实例标识、bizId。
8. 检查 release/snapshot 制品版本边界，确保正式环境使用 release 依赖。

## 4. 项目与代码架构及模块边界

### 4.1 后端参与模块

```text
ai/ai-service
sys/sys-api
sys/sys-service
wms/wms-api
wms/wms-service
mes/mes-api
mes/mes-service
task/task-api
task/task-service
gateway/gateway-service
platform/platform-common-*
```

### 4.2 前端参与模块

```text
ai-web
frontend-platform/apps/portal-shell
frontend-platform 运营看板
wms-web
mes-web
```

### 4.3 集成边界

1. AI 不直接依赖 Java 服务实现源码。
2. AI 通过 REST 或 MCP Tool 查询业务数据。
3. ChatBI 使用只读账号或受控只读 API。
4. AI 不能参与业务写事务。
5. MCP 工具默认只读，禁止 delete、update、insert、drop、alter、truncate、create。
6. 查询类工具必须限制超时、最大返回行数和可访问表范围。

## 5. AI 业务功能与集成要求

### 5.1 MCP 工具接入真实业务

工具清单：

| 工具 | 数据来源 | 说明 |
|---|---|---|
| `query_inventory` | WMS | 查询物料库存、库存批次、仓库库存。 |
| `query_work_order` | MES | 查询工单、工单状态、生产线。 |
| `query_material_apply` | MES | 查询物料申请、成功失败状态、失败原因。 |
| `query_stock_alert` | task / WMS | 查询安全库存预警。 |
| `query_daily_stat` | task | 查询每日入库、出库、申请统计。 |
| `query_rank` | task | 查询热门物料、仓库作业、生产线需求排行。 |
| `query_login_risk` | sys | 查询登录风控记录。 |
| `run_safe_sql` | 只读数据源 | 执行白名单 SELECT 查询。 |

每次工具调用必须写入 `ai_mcp_tool_call_log`。

### 5.2 ChatBI 真实业务查询

支持问题示例：

```text
今天哪个仓库出库最多？
最近 7 天申请次数最多的物料是什么？
哪些物料低于安全库存？
哪个生产线物料申请失败率最高？
最近登录风控最多的账号有哪些？
最近 7 天哪个工单物料分配失败最多？
```

ChatBI 流程：

```text
用户输入自然语言问题
  -> 识别指标和维度
  -> 选择数据源
  -> 生成 SQL 或调用只读业务 API
  -> SQL 安全校验
  -> 执行查询
  -> 生成文字解释
  -> 返回表格、摘要和图表建议
  -> 写入 ai_bi_query_record
```

安全要求：

1. 只允许查询白名单表或白名单 API。
2. 只允许 `SELECT`。
3. 强制追加最大返回行数。
4. 强制查询超时。
5. 禁止多语句。
6. 禁止访问系统表、用户密码、token、secret、配置表敏感字段。
7. 记录 `generated_sql`、`safe_status`、`result_summary`、`cost_ms`。

### 5.3 多 Agent 业务分析

Agent 能力：

| Agent | V08 职责 |
|---|---|
| `RouterAgent` | 判断问题进入 RAG、WMS、MES、BI、Risk 或综合分析。 |
| `WmsQaAgent` | 结合 WMS 数据和知识库分析库存、入库、出库、预警。 |
| `MesAgent` | 分析工单、物料申请、配送状态、申请失败原因。 |
| `BiAgent` | 调用 ChatBI 返回统计结果和解释。 |
| `RiskAgent` | 分析登录风控、库存异常、任务失败、补偿失败。 |
| `OpsAgent` | 综合 task 统计、排行、预警给出运营建议。 |

### 5.4 AI 降级

当 LLM、向量库或业务服务不可用时：

1. RAG 返回友好错误和 traceId。
2. ChatBI 不执行不完整 SQL。
3. Agent 显示具体不可用工具。
4. `ai_mcp_tool_call_log` 记录失败状态。
5. 前端展示可理解的失败原因。

## 6. 接口设计

### 6.1 AI 业务查询接口

```text
POST /api/ai/rag/chat
POST /api/ai/chatbi/query
POST /api/ai/agents/analyze
GET  /api/ai/mcp/tool-call-logs
GET  /api/ai/chatbi/records
```

### 6.2 MCP 工具内部调用

```text
POST /api/ai/mcp/tools/query_inventory
POST /api/ai/mcp/tools/query_work_order
POST /api/ai/mcp/tools/query_material_apply
POST /api/ai/mcp/tools/query_stock_alert
POST /api/ai/mcp/tools/query_daily_stat
POST /api/ai/mcp/tools/query_rank
POST /api/ai/mcp/tools/query_login_risk
POST /api/ai/mcp/tools/run_safe_sql
```

如这些接口只供 AI 内部使用，需要通过权限或内部访问策略限制。

### 6.3 业务服务只读接口补充

WMS：

```text
GET /api/wms/ai/inventory-summary
GET /api/wms/ai/inventory-batches
GET /api/wms/ai/inbound-summary
GET /api/wms/ai/outbound-summary
GET /api/wms/ai/stock-alerts
```

MES：

```text
GET /api/mes/ai/work-orders
GET /api/mes/ai/material-applies
GET /api/mes/ai/delivery-status
GET /api/mes/ai/failure-summary
```

task：

```text
GET /api/task/ai/daily-stats
GET /api/task/ai/ranks
GET /api/task/ai/compensations
GET /api/task/ai/job-logs
```

sys：

```text
GET /api/sys/ai/risk-records
GET /api/sys/ai/login-risk-summary
```

所有 AI 只读接口必须脱敏，禁止返回密码、token、secret、内部连接串。

## 7. 前端页面设计

### 7.1 ai-web 增强

需要增强：

```text
/ai/rag-chat             支持引用业务知识和 SOP
/ai/chatbi               支持业务问题、SQL 展示、安全状态、表格、摘要
/ai/agent                支持库存风险、登录风控、任务失败分析
/ai/mcp-tool-log         支持按工具、状态、用户、时间筛选
```

页面要求：

1. ChatBI 展示生成 SQL，但对敏感字段脱敏。
2. Agent 分析展示使用过的工具和 traceId。
3. MCP 日志可查看 request/response 摘要，敏感字段脱敏。
4. AI 页面所有接口走 `/api/ai/**`。

### 7.2 业务前端入口联动

可在以下页面增加 AI 分析入口：

```text
wms-web 库存批次 / 安全库存预警页面 -> AI 分析库存风险
mes-web 物料申请页面 -> AI 分析失败原因
task 运营看板 -> AI 生成运营摘要
sys-web 风控记录页面 -> AI 分析登录风险
```

入口可以是按钮或跳转链接，实际分析由 `ai-web` 承载。

## 8. 数据库设计

V08 复用以下表：

```text
ai_bi_query_record
ai_mcp_tool_call_log
ai_chat_session
ai_chat_message
ai_document
ai_document_chunk
sys_risk_record
wms_inventory_batch
wms_inventory_flow
wms_stock_alert
mes_work_order
mes_material_apply
mes_delivery_status
task_stat_daily
task_rank_snapshot
task_job_log
task_compensation_log
```

### 8.1 ai_bi_query_record 加固要求

确认字段：

```text
id bigint PK
user_id bigint IDX
question varchar(1024)
generated_sql text
safe_status varchar(32) -- PASS/REJECT
result_summary text
cost_ms bigint
created_time datetime IDX
```

建议扩展：

```text
data_source varchar(64)
row_count int
trace_id varchar(64)
error_message varchar(1024)
```

### 8.2 ai_mcp_tool_call_log 加固要求

确认字段：

```text
id bigint PK
tool_call_id varchar(128) UK
tool_name varchar(128) IDX
user_id bigint IDX
request_json text
response_json text
status varchar(32) IDX -- SUCCESS/FAILED
error_message varchar(1024)
created_time datetime IDX
```

建议扩展：

```text
trace_id varchar(64)
cost_ms bigint
biz_id varchar(128)
```

### 8.3 敏感字段处理

AI 查询与日志不得保存：

```text
用户密码密文
Access Token
Refresh Token
JWT Secret
LLM API Key
数据库密码
对象存储密钥
Jenkins 凭证
云效 token
```

如 request/response 包含敏感字段，必须脱敏后写日志。

## 9. 可观测性与日志设计

所有服务日志必须输出 stdout / stderr，并统一携带：

```text
traceId
serviceName
podName 或 instanceId
userId
bizId
eventId
toolCallId
```

AI 工具调用链路：

```text
用户问题 traceId
  -> ai-service
  -> MCP toolCallId
  -> business service /api/*/ai/**
  -> ai_mcp_tool_call_log
  -> ai_bi_query_record
```

健康检查：

Java：

```text
/actuator/health/liveness
/actuator/health/readiness
/actuator/health
```

AI：

```text
/health/live
/health/ready
```

健康检查不得执行 LLM 调用、重 SQL 或大文件检查。

## 10. Jenkins 全链路测试流水线

必须覆盖：

```text
platform 公共包构建
gateway/sys/wms/mes/task Java 构建和测试
ai-service Python 测试
frontend-platform/wms-web/mes-web/ai-web 前端构建
Docker 镜像构建
数据库迁移检查
中间件启动
端到端业务测试
AI ChatBI 安全测试
MCP 工具调用测试
测试环境发布
健康检查
测试报告归档
```

端到端测试流程：

```text
登录
  -> 创建 WMS 物料和库存
  -> 创建 MES 工单和物料申请
  -> WMS 分配库存
  -> task 更新统计排行
  -> AI 查询库存/工单/预警
  -> ChatBI 查询统计
```

## 11. 阿里弹性容器正式发布加固

正式环境要求：

```text
使用 release Maven/npm 制品
镜像 tag 不使用 latest
配置通过环境变量、Nacos、ConfigMap、Secret 注入
密钥通过 Secret 或 Jenkins 凭证注入
健康检查配置完整
资源 requests/limits 完整
日志输出 stdout
回滚说明完整
```

发布检查清单：

```text
gateway-service replicas >= 2
sys-service replicas >= 2
wms-service replicas >= 2
mes-service replicas >= 2
task-service replicas >= 2
ai-service replicas >= 2
Redis / RabbitMQ / MySQL / Vector DB / 对象存储可用
WebSocket 转发可用
Nginx history fallback 可用
/apps/sys/、/apps/wms/、/apps/mes/、/apps/ai/ 可访问
/api/** 统一走 Gateway
```

回滚原则：

```text
数据库先兼容变更
后端先发布兼容版本
前端后发布
回滚时优先回滚前端，再回滚后端
数据库破坏性变更跨版本延后执行
```

## 12. K8s / 多实例最终约束

1. 所有服务无状态。
2. Token 黑名单、登录风控、库存预扣、排行、分布式锁在 Redis。
3. 文件、RAG 文档、导入错误报告在对象存储或 PVC。
4. MQ 消费幂等，失败可重试，死信可追踪。
5. 定时任务集群防重复。
6. WebSocket 支持多实例路由或广播。
7. ChatBI 只读且限流。
8. LLM 调用超时、重试、熔断。
9. 前端支持独立 base path：

```text
frontend-platform/apps/portal-shell -> /
frontend-platform/apps/sys-web      -> /apps/sys/
wms-web                             -> /apps/wms/
mes-web                             -> /apps/mes/
ai-web                              -> /apps/ai/
```

10. 前端镜像不得包含 `.npmrc`、npm token、源码目录或构建缓存。

## 13. 开发步骤提示词

```text
请开发 V08 AI 与业务服务交互及发布加固。

要求：
1. 只根据本 milestone、ROADMAP、DEVELOPMENT_RULE、PROGRESS 开发，不再读取 docs/design。
2. 先确认 V07 多方交互业务已可演示。
3. AI MCP 工具封装 WMS、MES、task、sys 查询能力。
4. WMS/MES/task/sys 提供 AI 只读查询接口，返回数据必须脱敏。
5. ChatBI 使用只读账号或只读 API 和白名单查询业务数据。
6. ChatBI 禁止危险 SQL，限制超时和最大返回行数。
7. 多 Agent 可分析库存风险、登录风控、任务失败、物料申请失败率。
8. ai-web 展示业务问答、ChatBI 结果、Agent 分析和 MCP 调用记录。
9. 业务页面可增加跳转到 AI 分析的入口。
10. Jenkins 流水线覆盖全链路构建、测试、镜像构建和测试环境发布。
11. 阿里弹性容器正式环境支持正式镜像、环境变量、密钥、健康检查、回滚说明。
12. 完善日志 traceId、serviceName、podName 或实例标识、bizId。
13. 自动检查并更新 .gitignore，避免 target、dist、node_modules、__pycache__、.venv、向量库本地数据、上传文件、日志、.env、本地配置和密钥入库。
14. 检查本次准备纳入 Git 的文件是否存在账号、密码、token、API Key、私钥或内部地址，如存在必须改为环境变量、Secret、Jenkins 凭证或示例模板。
15. 更新本文件实现记录、对应 study、handle、PROGRESS 和根 README。
```

## 14. 自动测试提示词

```text
请验证 V08 AI 与业务服务交互及发布加固。

测试项：
1. AI 可以通过 MCP / REST 查询 WMS、MES、task、sys 数据。
2. AI 只读接口不返回密码、token、secret、内部连接串。
3. ChatBI 只能执行只读 SELECT，并限制超时和返回行数。
4. 危险 SQL 被拒绝并写入 ai_bi_query_record。
5. Agent 可以生成库存风险、登录风控、任务失败分析。
6. ai-web 可以展示 AI 分析结果和调用记录。
7. MCP 工具调用写入 ai_mcp_tool_call_log，并包含 traceId。
8. Jenkins 全链路测试发布成功。
9. 阿里弹性容器正式环境部署检查、健康检查和回滚说明完整。
10. 日志和 traceId 可用于定位跨服务请求。
11. 正式环境依赖使用 release，测试环境可使用 snapshot。
12. 构建产物和镜像不包含密钥、token、私有 registry 凭证。
```

## 15. 验收标准

1. AI 能解释和分析真实业务数据。
2. ChatBI 安全限制有效。
3. 多 Agent 和 MCP 调用可追踪。
4. 业务服务 AI 只读接口脱敏且受权限控制。
5. Jenkins 覆盖完整测试环境发布。
6. 阿里弹性容器正式环境可演示、可回滚、可观测。

## 16. 验收操作过程

```text
1. 执行完整业务流程：登录、工单、物料申请、库存分配、统计预警。
2. 在 ai-web 提问库存、工单、预警相关问题。
3. 执行 ChatBI 查询并查看 SQL 记录。
4. 尝试危险 SQL，验证被拒绝。
5. 触发 Agent 分析并查看 MCP 调用日志。
6. 从 WMS/MES/task/sys 页面跳转 AI 分析入口。
7. 执行 Jenkins 全链路流水线。
8. 检查阿里弹性容器正式环境部署、健康检查、日志和回滚说明。
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
