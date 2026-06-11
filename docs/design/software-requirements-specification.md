# SmartWarehouse-AI 软件需求规格说明书

## 1. 文档说明

### 1.1 文档目的

本文档用于定义 SmartWarehouse-AI 项目的业务目标、功能需求、非功能需求、用户角色、业务流程、外部接口和验收标准，为后续概要设计、详细设计、数据库设计、开发、测试和部署提供依据。

### 1.2 项目名称

- 中文名称：智能制造仓储协同平台
- 英文名称：SmartWarehouse-AI

### 1.3 项目定位

SmartWarehouse-AI 是一个面向制造执行和仓储物流协同场景的分布式微服务实践项目。系统围绕生产工单、物料申请、库存预占、入库出库、库存流水、安全库存预警、登录风控、实时排行、离线上传和 AI 智能问答形成完整业务闭环。

项目同时覆盖 Java 微服务体系和 Python AI 服务体系：

- Java 侧基于 Spring Cloud Alibaba 构建微服务系统。
- Python 侧基于 LangChain 构建 RAG、多 Agent、MCP 和 ChatBI 能力。
- 前端基于 Vue 构建甲方平台前端和多个乙方业务前端，其中 `frontend-platform` 提供统一登录、门户基座和 `sys-web` 页面，`wms-web`、`mes-web`、`ai-web` 分别承载乙方业务页面。
- Maven 与 npm 依赖统一通过阿里云效制品仓库管理，区分 release 生产库和 snapshot 非生产库。

### 1.4 项目开发根目录

项目根目录即开发根目录：

```text
SmartWarehouse-AI
```

所有后端、前端、AI、部署、文档都在该根目录下组织。前端项目直接放在项目根目录，与 Java 后端服务和 Python AI 服务平级。

## 2. 项目背景

制造企业在生产过程中通常需要生产部门和仓储部门协同完成物料准备。生产计划发布后，多个工单可能在短时间内同时申请同一种物料，仓储系统需要处理库存预占、库存锁定、出库配送和库存流水记录。

在真实企业环境中，这类系统通常还需要：

- 统一登录认证和权限控制。
- 仓库级、部门级、角色级数据权限。
- 高并发物料申请下的库存一致性控制。
- MQ 异步削峰和失败补偿。
- 定时统计和实时排行。
- 离线 Excel / CSV 数据导入。
- 登录风控和审计日志。
- AI 问答、库存分析和自然语言 BI 查询。

SmartWarehouse-AI 以最小 MVP 方式模拟上述业务，不依赖外部 ERP、MES 或 WMS 上游系统，所有业务数据均在系统内部生成和流转。

## 3. 业务目标

### 3.1 核心目标

1. 实现生产工单到仓储库存分配的完整闭环。
2. 支持高并发物料申请，模拟类似秒杀的库存抢占场景。
3. 支持系统权限、登录风控、操作日志、登录日志和数据权限。
4. 支持物料、仓库、库区、库位、库存批次、库存流水、入库和出库管理。
5. 支持离线上传入库数据并异步处理。
6. 支持定时任务、运营统计、安全库存预警和实时排行。
7. 支持基于 LangChain 的 RAG、多 Agent、MCP 和 ChatBI 能力。
8. 使用阿里云效 release / snapshot 制品仓库管理 Maven 和 npm 依赖。

### 3.2 MVP 边界

系统只实现能验证业务场景和技术栈的最小闭环，不追求完整生产级 MES / WMS 复杂度。

MVP 包含：

- 基础组织和权限。
- 基础物料和库存。
- 工单和物料申请。
- 库存预占、锁定、出库和配送状态。
- 运营统计和排行。
- AI 问答和 ChatBI。

MVP 不包含：

- 复杂 APS 排产。
- 完整财务结算。
- 真实设备接入。
- 复杂条码和 PDA 作业。
- 多工厂复杂组织核算。
- 完整主数据治理。

## 4. 项目架构需求

### 4.1 总体项目结构

项目采用单仓库聚合结构：

```text
SmartWarehouse-AI
├── README.md
├── pom.xml
├── docs
├── deploy
├── platform
├── gateway
├── sys
├── task
├── mes
├── wms
├── ai
├── frontend-platform
├── wms-web
├── mes-web
└── ai-web
```

根 `pom.xml` 只负责 Maven 模块聚合，不作为强 parent。

### 4.2 商用协作架构要求

项目在设计时按商用框架和多团队协作模式考虑。当前仍使用根目录下的 Git 仓库统一管理所有项目代码，便于个人实践项目整体提交、检索、构建和演示；但开发、构建、发版和职责边界必须按照独立项目处理。

团队职责划分：

| 责任方 | 负责目录 | 说明 |
|---|---|---|
| 甲方平台团队 | `platform`、`gateway`、`sys`、`task`、`deploy` | 维护技术底座、网关、权限中心、任务统计、集成部署和运行治理。 |
| 乙方 A | `wms` | 负责仓储后端服务开发，包括物料、仓库、库存、入库、出库、离线上传。 |
| 乙方 B | `mes` | 负责生产执行后端服务开发，包括工单、物料申请、配送状态。 |
| 乙方 C | `ai` | 负责 AI 后端服务开发，包括 RAG、Prompt、多 Agent、MCP、ChatBI。 |
| 甲方前端团队 | `frontend-platform` | 负责前端底座、统一登录入口、门户基座、平台组件库、SDK、主题、类型定义和 `sys-web` 页面。 |
| 乙方 A 前端团队 | `wms-web` | 负责 WMS 前端页面开发。 |
| 乙方 B 前端团队 | `mes-web` | 负责 MES 前端页面开发。 |
| 乙方 C 前端团队 | `ai-web` | 负责 AI 前端页面开发。 |

独立项目开发规则：

1. 每个一级业务目录必须能够独立理解、独立构建、独立测试和独立部署。
2. Java 服务以各自目录下的 `pom.xml` 作为服务项目入口。
3. Python AI 服务以 `ai/pyproject.toml` 或 `ai/requirements.txt` 作为项目入口。
4. 前端项目直接放在根目录，`frontend-platform`、`wms-web`、`mes-web`、`ai-web` 均以各自 `package.json` 作为项目入口。
5. 乙方服务不得直接引用其他服务的实现源码，只能依赖对方发布的 `*-api` Maven 制品或通过 REST / MQ 事件集成。
6. 乙方前端不得直接引用 `frontend-platform` 源码，只能通过 `@smartwarehouse/*` npm 包接入平台组件、SDK、主题和类型定义。
7. 甲方平台底座变更必须保持兼容，破坏性变更需要提前发布版本和迁移说明。
8. CI/CD 可以按目录触发，例如只构建 `wms`、只构建 `mes`、只构建 `ai`、只构建 `frontend-platform`、只构建 `wms-web`、只构建 `mes-web` 或只构建 `ai-web`。

### 4.3 Maven 架构要求

Java 模块必须遵守以下规则：

1. 所有 Java 服务模块继承 `platform/platform-parent`。
2. 所有 Java 服务模块导入 `platform/platform-bom`。
3. 公共能力沉淀在 `platform-common-*` 模块中。
4. 服务间接口通过 `*-api` 模块暴露。
5. 项目架构中不包含 `task-client`、`mes-client`、`wms-client` 模块。
6. 启动服务模块不允许被其他服务作为 Maven 普通依赖引用。
7. API 模块和平台公共模块发布到阿里云效 Maven 制品仓库。

### 4.4 阿里云效制品仓库要求

项目使用阿里云效制品仓库统一管理 Maven 和 npm 制品。

Maven 仓库：

| 仓库类型 | 用途 | 版本示例 |
|---|---|---|
| release 生产库 | 发布稳定版本 | `1.0.0`、`1.1.0` |
| snapshot 非生产库 | 发布开发联调版本 | `1.0.1-SNAPSHOT`、`1.1.0-SNAPSHOT` |

发布规则：

- 带 `-SNAPSHOT` 后缀的制品发布到 snapshot 仓库。
- 不带 `-SNAPSHOT` 后缀的正式制品发布到 release 仓库。
- `platform-parent`、`platform-bom`、`platform-common-*`、`sys-api`、`task-api`、`mes-api`、`wms-api` 均需要发布为 Maven 制品。

npm 仓库：

| 仓库类型 | 用途 | 版本示例 |
|---|---|---|
| release 生产库 | 发布稳定前端包、平台组件包、前端 SDK | `1.0.0`、`1.1.0` |
| snapshot 非生产库 | 发布开发联调包 | `1.1.0-snapshot.1`、`1.1.0-beta.1` |

npm 管理规则：

- 前端依赖安装统一走阿里云效 npm 私有仓库代理或私有源。
- 企业级前端组件、API 类型定义、前端 SDK 可发布为 `@smartwarehouse/*` scope 下的 npm 包。
- 稳定版本使用 release npm 仓库和 `latest` tag。
- 联调版本使用 snapshot npm 仓库或 `next` / `snapshot` tag。
- 乙方前端或独立模块不得复制甲方前端基础包源码，应通过 npm 版本依赖接入。

### 4.5 K8s 部署开发要求

项目最终部署时使用 Kubernetes，所有中间件、微服务、数据库、前端静态资源服务都要支持集群或多实例。开发阶段必须按多 Pod、多实例、可重启、可扩缩容、可滚动发布的方式设计。

开发约束：

1. `gateway-service`、`sys-service`、`task-service`、`wms-service`、`mes-service`、`ai-service` 必须按无状态服务设计。
2. 登录 Session、Token 黑名单、刷新 Token、登录失败次数、拼图验证码、库存预扣状态、导入任务进度、WebSocket 连接路由、定时任务执行状态不得只保存在本地内存。
3. 所有中间件地址、服务地址、账号密码、JWT 密钥、LLM API Key、对象存储密钥必须外置到 Nacos、ConfigMap、Secret 或环境变量。
4. 所有服务必须提供健康检查接口，支持 K8s Liveness、Readiness、Startup Probe。
5. 所有服务必须支持优雅停机，尤其是 HTTP 请求、RabbitMQ 消费、数据库事务、WebSocket 连接和 AI 长耗时请求。
6. 所有核心写操作和 MQ 消费必须支持幂等，避免 Pod 重启、网络重试、MQ 重投导致重复处理。
7. `task-service` 的定时任务必须使用集群调度、分布式锁、K8s CronJob 或 Leader Election，不能依赖普通单实例 `@Scheduled`。
8. 离线上传文件、AI 文档、RAG 原始文件不得只保存在 Pod 本地磁盘，应使用对象存储、PVC、MinIO 或 OSS。
9. 前端项目必须支持通过 Nginx 独立部署到 `/apps/sys/`、`/apps/wms/`、`/apps/mes/`、`/apps/ai/` 等路径，并统一通过 Gateway 访问 `/api/**`。
10. 日志必须输出到标准输出，并携带 `traceId`、服务名、实例标识、用户 ID 或业务 ID。

## 5. 用户角色

### 5.1 系统管理员

职责：

- 管理用户、角色、菜单、部门、岗位和字典。
- 配置用户角色和菜单权限。
- 查看登录日志、操作日志和风控记录。
- 管理数据权限策略。

### 5.2 仓库管理员

职责：

- 维护物料、仓库、库区、库位。
- 创建和审核入库单。
- 管理库存批次和库存流水。
- 处理出库单和配送状态。
- 上传离线入库数据。
- 查看自己负责仓库的数据。

### 5.3 生产主管

职责：

- 创建生产工单。
- 绑定工单所需物料。
- 发布工单并提交物料申请。
- 查看物料分配结果和配送状态。

### 5.4 运营人员

职责：

- 查看出入库统计。
- 查看物料申请排行。
- 查看仓库作业排行。
- 查看安全库存预警。
- 使用 ChatBI 查询业务数据。

### 5.5 AI 助手用户

职责：

- 使用 RAG 知识问答。
- 查询仓储操作规则和系统使用说明。
- 使用自然语言查询库存、工单、出入库和预警数据。

## 6. 功能需求

### 6.1 网关服务需求

模块：`gateway/gateway-service`

功能需求：

| 编号 | 需求 |
|---|---|
| GW-FR-001 | 支持统一 API 路由转发。 |
| GW-FR-002 | 支持 JWT Token 鉴权。 |
| GW-FR-003 | 支持 Token 黑名单校验。 |
| GW-FR-004 | 支持跨域配置。 |
| GW-FR-005 | 支持 Sentinel 网关限流。 |
| GW-FR-006 | 支持服务降级响应。 |
| GW-FR-007 | 支持请求 TraceId 透传。 |

### 6.2 系统权限服务需求

模块：`sys/sys-service`

功能需求：

| 编号 | 需求 |
|---|---|
| SYS-FR-001 | 用户登录，登录成功后签发 Access Token 和 Refresh Token。 |
| SYS-FR-002 | 用户退出，将 Token 加入 Redis 黑名单。 |
| SYS-FR-003 | 支持 Refresh Token 刷新 Access Token。 |
| SYS-FR-004 | 支持用户管理。 |
| SYS-FR-005 | 支持角色管理。 |
| SYS-FR-006 | 支持菜单管理。 |
| SYS-FR-007 | 支持部门管理。 |
| SYS-FR-008 | 支持岗位管理。 |
| SYS-FR-009 | 支持字典管理。 |
| SYS-FR-010 | 支持角色菜单权限。 |
| SYS-FR-011 | 支持仓库级数据权限。 |
| SYS-FR-012 | 支持登录日志记录。 |
| SYS-FR-013 | 支持操作日志记录。 |
| SYS-FR-014 | 支持登录失败次数风控。 |
| SYS-FR-015 | 支持 IP 高频登录风控。 |
| SYS-FR-016 | 支持账号临时锁定。 |
| SYS-FR-017 | 支持用户连续失败 3 次后启用随机拼图验证码。 |

登录风控规则：

- 同一账号连续失败 3 次后，后续登录必须先通过随机拼图验证码。
- 同一账号连续失败 5 次，锁定 10 分钟。
- 同一 IP 1 分钟内失败超过 20 次，触发 IP 风控。
- 退出登录后 Token 在剩余有效期内加入黑名单。
- 所有登录成功和失败都记录登录日志。
- 用户登录成功后，清理该账号的失败次数和拼图验证码风控状态。

### 6.3 仓储服务需求

模块：`wms/wms-service`

功能需求：

| 编号 | 需求 |
|---|---|
| WMS-FR-001 | 支持物料新增、修改、禁用、查询。 |
| WMS-FR-002 | 支持仓库、库区、库位管理。 |
| WMS-FR-003 | 支持创建入库单。 |
| WMS-FR-004 | 支持审核入库单并生成库存批次。 |
| WMS-FR-005 | 支持创建出库单。 |
| WMS-FR-006 | 支持库存批次查询。 |
| WMS-FR-007 | 支持库存流水查询。 |
| WMS-FR-008 | 支持库存预占和锁定。 |
| WMS-FR-009 | 支持库存解锁。 |
| WMS-FR-010 | 支持安全库存预警。 |
| WMS-FR-011 | 支持离线上传入库数据。 |
| WMS-FR-012 | 支持导入任务进度查询。 |
| WMS-FR-013 | 支持错误数据记录和导出。 |

库存规则：

- 可用库存不能小于 0。
- 锁定库存不能小于 0。
- 总库存等于可用库存与锁定库存之和。
- 高并发物料申请优先使用 Redis Lua 预扣库存。
- 数据库最终落库时必须写入库存流水。

### 6.4 生产执行服务需求

模块：`mes/mes-service`

功能需求：

| 编号 | 需求 |
|---|---|
| MES-FR-001 | 支持创建工单。 |
| MES-FR-002 | 支持绑定工单所需物料。 |
| MES-FR-003 | 支持发布工单。 |
| MES-FR-004 | 支持提交物料申请。 |
| MES-FR-005 | 支持批量释放生产任务，模拟高并发申请库存。 |
| MES-FR-006 | 支持查看物料分配状态。 |
| MES-FR-007 | 支持查看配送状态。 |
| MES-FR-008 | 支持接收库存分配成功或失败事件。 |
| MES-FR-009 | 支持物料申请幂等控制。 |

工单状态：

```text
DRAFT       草稿
RELEASED    已发布
ALLOCATING  物料分配中
ALLOCATED   物料已分配
PARTIAL     部分分配
FAILED      分配失败
CLOSED      已关闭
```

物料申请状态：

```text
PENDING     待申请
PROCESSING 处理中
SUCCESS    申请成功
FAILED     申请失败
CANCELLED  已取消
```

### 6.5 任务统计服务需求

模块：`task/task-service`

功能需求：

| 编号 | 需求 |
|---|---|
| TASK-FR-001 | 支持定时扫描安全库存。 |
| TASK-FR-002 | 支持每日入库、出库、申请量统计。 |
| TASK-FR-003 | 支持热门申请物料排行。 |
| TASK-FR-004 | 支持仓库作业量排行。 |
| TASK-FR-005 | 支持生产线物料需求排行。 |
| TASK-FR-006 | 支持失败消息补偿任务。 |
| TASK-FR-007 | 支持过期 Token 黑名单清理。 |
| TASK-FR-008 | 支持 WebSocket 推送预警和排行。 |

实时排行使用 Redis ZSet：

```text
rank:material:apply
rank:warehouse:outbound
rank:line:demand
rank:workorder:success
```

### 6.6 AI 服务需求

模块：`ai/ai-service`

功能需求：

| 编号 | 需求 |
|---|---|
| AI-FR-001 | 支持 RAG 知识库问答。 |
| AI-FR-002 | 支持系统操作手册、仓储 SOP、异常处理文档向量化。 |
| AI-FR-003 | 支持 Prompt 模板管理。 |
| AI-FR-004 | 支持多 Agent 路由。 |
| AI-FR-005 | 支持 WMS 问答 Agent。 |
| AI-FR-006 | 支持 MES 分析 Agent。 |
| AI-FR-007 | 支持 ChatBI Agent。 |
| AI-FR-008 | 支持 MCP 工具调用。 |
| AI-FR-009 | 支持自然语言生成 SQL 查询。 |
| AI-FR-010 | 支持 AI 查询记录和工具调用日志。 |

ChatBI 示例问题：

- 今天哪个仓库出库最多？
- 最近 7 天申请次数最多的物料是什么？
- 哪些物料低于安全库存？
- 哪个生产线物料申请失败率最高？

### 6.7 前端需求

前端项目：

```text
frontend-platform
wms-web
mes-web
ai-web
```

前端总体要求：

- `frontend-platform` 由甲方维护，负责统一登录页、门户框架、Token 管理、菜单装载、模块入口、`sys-web` 系统管理页面和平台 npm 包。
- `wms-web`、`mes-web`、`ai-web` 由不同乙方按独立前端项目开发、构建和发布。
- 用户只通过 `portal-shell` 提供的统一登录页面登录一次，登录后根据菜单权限进入系统管理、仓储、生产、运营统计和 AI 页面。
- 乙方前端项目通过 `@smartwarehouse/platform-ui`、`@smartwarehouse/platform-sdk`、`@smartwarehouse/platform-theme`、`@smartwarehouse/platform-types` 复用甲方平台能力。
- 前端项目统一通过 Gateway 访问后端接口，不允许写死后端 IP、端口或完整域名。

页面需求：

| 前端项目 | 责任方 | 页面 |
|---|---|---|
| `frontend-platform/apps/portal-shell` | 甲方 | 统一登录页、门户首页、菜单装载、模块入口、用户信息、退出登录。 |
| `frontend-platform/apps/sys-web` | 甲方 | 用户、角色、菜单、部门、岗位、字典、登录日志、操作日志、风控记录、数据权限。 |
| `wms-web` | 乙方 A | 物料、仓库、库区、库位、库存批次、入库单、出库单、离线上传、导入进度、库存流水。 |
| `mes-web` | 乙方 B | 工单、工单物料、物料申请、配送状态。 |
| `ai-web` | 乙方 C | RAG 问答、ChatBI、多 Agent 分析、MCP 工具调用记录。 |
| `frontend-platform/apps/portal-shell` 或业务看板页面 | 甲方 / 业务方 | 出入库统计、库存预警、实时排行、运营看板入口。 |

## 7. 关键业务流程

### 7.1 工单物料申请流程

```text
生产主管创建工单
  -> 绑定所需物料
  -> 发布工单
  -> 提交物料申请
  -> MES 发送物料申请事件
  -> WMS 进行 Redis 库存预扣
  -> WMS 锁定数据库库存批次
  -> WMS 写入库存流水
  -> WMS 发布库存分配结果事件
  -> MES 更新申请状态
  -> Task 更新排行和统计
  -> WebSocket 推送前端
```

### 7.2 离线上传入库流程

```text
仓库管理员上传 Excel / CSV
  -> WMS 创建导入任务
  -> 解析文件并写入临时校验结果
  -> 校验物料、仓库、库位、批次、数量
  -> 合法数据异步入库
  -> 生成入库单、库存批次、库存流水
  -> 错误数据写入错误明细
  -> WebSocket 或轮询查看导入进度
```

### 7.3 登录风控流程

```text
用户提交账号密码
  -> Sys 校验账号状态
  -> Redis 校验账号/IP 风控状态
  -> 若账号连续失败已达 3 次，校验随机拼图验证码
  -> 校验密码
  -> 成功则签发 Token
  -> 失败则累加失败次数
  -> 达到 3 次失败则启用随机拼图验证码
  -> 达到锁定阈值则锁定账号或 IP
  -> 记录登录日志
```

## 8. 非功能需求

### 8.1 性能需求

| 编号 | 需求 |
|---|---|
| NFR-PERF-001 | 普通查询接口 95% 响应时间小于 500ms。 |
| NFR-PERF-002 | 登录接口 95% 响应时间小于 800ms。 |
| NFR-PERF-003 | 高并发物料申请支持本地压测 1000 QPS 级别验证。 |
| NFR-PERF-004 | 离线导入支持单文件 1 万行以内数据。 |
| NFR-PERF-005 | AI 问答普通 RAG 查询 95% 响应时间小于 10 秒。 |

### 8.2 安全需求

| 编号 | 需求 |
|---|---|
| NFR-SEC-001 | 所有业务接口默认需要登录认证。 |
| NFR-SEC-002 | 使用 JWT 进行用户身份传递。 |
| NFR-SEC-003 | 密码必须加密存储。 |
| NFR-SEC-004 | 支持角色权限和菜单权限。 |
| NFR-SEC-005 | 支持仓库级数据权限。 |
| NFR-SEC-006 | 支持登录风控和 Token 黑名单。 |
| NFR-SEC-007 | 操作日志需要记录操作人、IP、接口和结果。 |

### 8.3 可用性需求

| 编号 | 需求 |
|---|---|
| NFR-AVL-001 | 网关支持限流和降级。 |
| NFR-AVL-002 | MQ 消费失败支持重试和死信。 |
| NFR-AVL-003 | 库存分配失败支持补偿任务。 |
| NFR-AVL-004 | AI 服务不可用时返回友好降级信息。 |
| NFR-AVL-005 | 所有微服务支持 K8s 多实例部署、滚动发布和优雅停机。 |
| NFR-AVL-006 | 定时任务支持集群环境下单次有效执行，避免多 Pod 重复执行。 |
| NFR-AVL-007 | WebSocket 推送支持多实例连接路由或广播机制。 |

### 8.4 可维护性需求

| 编号 | 需求 |
|---|---|
| NFR-MNT-001 | 服务间接口必须放在 `*-api` 模块。 |
| NFR-MNT-002 | 公共代码必须沉淀到 `platform-common-*`。 |
| NFR-MNT-003 | 依赖版本必须由 `platform-bom` 管理。 |
| NFR-MNT-004 | Maven 构建规范必须由 `platform-parent` 管理。 |
| NFR-MNT-005 | 不允许新增 `task-client`、`mes-client`、`wms-client` 模块。 |
| NFR-MNT-006 | 配置必须外置，禁止在代码中硬编码中间件地址、固定 IP、账号密码和密钥。 |
| NFR-MNT-007 | 数据库结构变更必须版本化，建议使用 Flyway、Liquibase 或独立 Migration Job。 |

### 8.5 可观测性需求

| 编号 | 需求 |
|---|---|
| NFR-OBS-001 | 所有请求需要 TraceId。 |
| NFR-OBS-002 | 关键业务操作需要操作日志。 |
| NFR-OBS-003 | MQ 消息需要记录 eventId 和 traceId。 |
| NFR-OBS-004 | 定时任务需要任务执行日志。 |
| NFR-OBS-005 | AI 工具调用需要记录调用日志。 |
| NFR-OBS-006 | K8s 环境日志必须输出到 stdout / stderr，便于日志采集。 |
| NFR-OBS-007 | 健康检查、资源使用、接口耗时、MQ 消费失败、任务补偿次数需要可观测。 |

## 9. 外部接口需求

### 9.1 前端到网关

前端统一访问 Gateway：

```text
/api/sys/**
/api/wms/**
/api/mes/**
/api/task/**
/api/ai/**
```

### 9.2 Java 服务间接口

Java 服务间调用优先依赖 `*-api`：

```text
sys-api
task-api
mes-api
wms-api
```

不使用以下模块：

```text
task-client
mes-client
wms-client
```

### 9.3 AI 服务接口

AI 服务通过 REST 调用 Java 服务公开接口，并通过 MCP Tool 封装业务查询能力。

## 10. 验收标准

### 10.1 功能验收

1. 管理员可以完成用户、角色、菜单、部门、岗位、字典维护。
2. 用户可以登录、退出、刷新 Token。
3. 连续登录失败 3 次可以触发随机拼图验证码，达到锁定阈值后可以触发风控锁定。
4. 仓库管理员可以维护物料、仓库、库区、库位。
5. 仓库管理员可以创建入库单并生成库存批次和流水。
6. 生产主管可以创建工单、绑定物料、发布工单并提交物料申请。
7. 多个工单同时申请同一物料时不会出现库存超卖。
8. 物料申请结果可以异步更新并推送前端。
9. 离线上传可以导入合法数据并记录错误数据。
10. 运营看板可以展示统计、排行和预警。
11. AI 助手可以回答知识库问题和执行 ChatBI 查询。
12. 用户可以通过 `frontend-platform/apps/portal-shell` 的统一登录页面登录，并按菜单权限访问 `sys-web`、`wms-web`、`mes-web`、`ai-web`。

### 10.2 架构验收

1. 项目英文名称统一为 SmartWarehouse-AI。
2. 项目根目录即开发根目录。
3. 文档存放在 `docs` 目录。
4. 根 `pom.xml` 只聚合，不做强 parent。
5. Java 服务继承 `platform-parent`。
6. Java 服务导入 `platform-bom`。
7. 不存在 `task-client`、`mes-client`、`wms-client` 模块。
8. 甲方维护 `platform`、`gateway`、`sys`、`task` 基础底座，乙方按独立项目方式开发 `mes`、`wms`、`ai`。
9. `frontend-platform`、`wms-web`、`mes-web`、`ai-web` 直接位于项目根目录，并按独立前端项目开发、构建和发布。
10. 甲方维护 `frontend-platform`，乙方分别维护 `wms-web`、`mes-web`、`ai-web`。
11. Maven 和 npm 制品能够按 snapshot / release 规则发布到阿里云效。
12. 用户连续失败 3 次后能够启用随机拼图验证码，并在登录成功后清理风控状态。
