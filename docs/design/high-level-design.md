# SmartWarehouse-AI 概要设计说明书

## 1. 文档说明

### 1.1 文档目的

本文档描述 SmartWarehouse-AI 的总体技术架构、项目结构、服务划分、部署架构、数据架构、接口架构、安全架构和关键技术方案，为详细设计和开发实现提供依据。

### 1.2 系统名称

- 英文名称：SmartWarehouse-AI
- 中文名称：智能制造仓储协同平台

### 1.3 开发根目录

项目根目录即开发根目录：

```text
SmartWarehouse-AI
```

## 2. 总体架构

SmartWarehouse-AI 采用前后端分离、微服务、事件驱动和 AI 服务独立部署的架构。

项目按商用框架和多乙方协作模式设计：甲方负责维护基础底座和平台服务，包括 `platform`、`gateway`、`sys`、`task`、`frontend-platform`；多个乙方分别负责 `mes`、`wms`、`ai` 后端服务及其对应前端 `mes-web`、`wms-web`、`ai-web` 的开发。当前代码仍放在根目录下同一个 Git 仓库中统一管理，但各一级目录在开发、构建、测试、发布和交付时均按独立项目处理。

整体组成：

- `frontend-platform`：甲方前端底座、统一登录、门户基座、`sys-web` 页面、组件库和 SDK。
- `wms-web`：乙方 A WMS 前端。
- `mes-web`：乙方 B MES 前端。
- `ai-web`：乙方 C AI 前端。
- `gateway`：统一网关。
- `sys`：系统权限服务。
- `mes`：生产执行服务。
- `wms`：仓储管理服务。
- `task`：任务统计服务。
- `ai`：Python AI 服务。
- `platform`：Java 平台技术底座。
- `deploy`：本地和集成部署配置。
- `docs`：项目文档。

总体架构图：

```text
用户浏览器
   |
   v
Nginx
   |
   +-- frontend-platform / portal-shell / sys-web
   +-- wms-web
   +-- mes-web
   +-- ai-web
   |
   v
gateway-service
   |
   +-- sys-service
   +-- mes-service
   +-- wms-service
   +-- task-service
   +-- ai-service

公共基础设施：
Nacos / Sentinel / Seata / MySQL / Redis / RabbitMQ / Vector DB
```

## 3. 项目目录架构

最终项目结构如下：

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

### 3.1 根 pom 设计

根 `pom.xml` 只负责聚合模块，不作为强 parent。

职责：

- 聚合 Java 子模块。
- 支持本地一次性构建。
- 不直接管理依赖版本。
- 不直接定义所有服务的强制构建规范。

### 3.2 商用协作与项目边界

当前采用单 Git 仓库管理全部项目，主要用于统一演示、统一文档、统一集成部署和本地联调。实际开发时按独立项目划分职责：

| 责任方 | 独立项目目录 | 交付内容 |
|---|---|---|
| 甲方平台团队 | `platform` | Maven parent、BOM、公共能力包和技术规范。 |
| 甲方平台团队 | `gateway` | 网关服务、路由、鉴权、限流和降级。 |
| 甲方平台团队 | `sys` | 认证授权、用户权限、登录风控、日志和数据权限。 |
| 甲方平台团队 | `task` | 定时任务、运营统计、实时排行和补偿任务。 |
| 乙方 A | `wms` | 仓储后端服务、WMS API、库存和出入库能力。 |
| 乙方 B | `mes` | 生产后端服务、MES API、工单和物料申请能力。 |
| 乙方 C | `ai` | Python AI 后端、RAG、多 Agent、MCP 和 ChatBI。 |
| 甲方前端团队 | `frontend-platform` | 统一登录、门户基座、`sys-web`、平台组件库、SDK、主题和类型定义。 |
| 乙方 A 前端团队 | `wms-web` | WMS 前端页面。 |
| 乙方 B 前端团队 | `mes-web` | MES 前端页面。 |
| 乙方 C 前端团队 | `ai-web` | AI 前端页面。 |

项目边界规则：

1. 各服务目录拥有独立的项目入口，例如 `pom.xml`、`pyproject.toml` 或 `package.json`。
2. 各服务目录拥有独立的 `deploy` 配置，可单独构建镜像和单独部署。
3. 乙方服务不得直接依赖其他服务的 `service` 实现源码。
4. Java 服务间复用只允许依赖 `*-api` Maven 制品。
5. 乙方前端不得直接依赖 `frontend-platform` 源码，只能通过 `@smartwarehouse/*` npm 包接入平台组件、SDK、主题和类型定义。
6. 前端公共包、平台组件和 SDK 通过阿里云效 npm 制品库安装。
7. 根仓库聚合不改变项目职责边界，CI/CD 可按目录独立触发。

### 3.3 platform 目录

```text
platform
├── pom.xml
├── platform-parent
├── platform-bom
├── platform-common-core
├── platform-common-web
├── platform-common-data
├── platform-common-security-lite
├── platform-common-redis
├── platform-common-mq
├── platform-common-log
└── platform-common-id
```

职责：

| 模块 | 职责 |
|---|---|
| `platform-parent` | 统一 Maven 构建规范。 |
| `platform-bom` | 统一依赖版本。 |
| `platform-common-core` | 统一响应、异常、错误码、分页、基础工具。 |
| `platform-common-web` | Web 通用能力、全局异常、参数校验、请求上下文。 |
| `platform-common-data` | MyBatis Plus、审计字段、数据权限、分页查询。 |
| `platform-common-security-lite` | JWT 解析、登录上下文、权限注解基础能力。 |
| `platform-common-redis` | Redis 缓存、分布式锁、Lua 脚本。 |
| `platform-common-mq` | RabbitMQ 发送、消费幂等、重试、死信。 |
| `platform-common-log` | 操作日志、审计日志、TraceId。 |
| `platform-common-id` | Snowflake、业务单号、Redis 序列。 |

### 3.4 gateway 目录

```text
gateway
├── pom.xml
├── gateway-service
└── deploy
```

职责：

- 统一入口。
- 路由转发。
- JWT 鉴权。
- Token 黑名单校验。
- Sentinel 限流。
- 跨域处理。
- 降级响应。

### 3.5 sys 目录

```text
sys
├── pom.xml
├── sys-api
├── sys-client
├── sys-service
└── deploy
```

说明：

- `sys-api` 定义系统服务对外契约。
- `sys-client` 可保留为系统服务轻量调用封装，例如用户上下文、权限查询或数据权限查询。
- `sys-service` 为系统权限启动服务。

本次架构调整要求去掉：

```text
task-client
mes-client
wms-client
```

### 3.6 task 目录

```text
task
├── pom.xml
├── task-api
├── task-service
└── deploy
```

职责：

- 定时任务。
- 运营统计。
- 实时排行。
- 安全库存预警。
- 消息失败补偿。
- WebSocket 推送。

### 3.7 mes 目录

```text
mes
├── pom.xml
├── mes-api
├── mes-service
└── deploy
```

职责：

- 工单管理。
- 工单物料绑定。
- 物料申请。
- 批量释放生产任务。
- 物料分配状态。
- 配送状态查看。

### 3.8 wms 目录

```text
wms
├── pom.xml
├── wms-api
├── wms-service
└── deploy
```

职责：

- 物料管理。
- 仓库、库区、库位管理。
- 入库单、出库单。
- 库存批次。
- 库存流水。
- 安全库存预警。
- 离线上传入库数据。

### 3.9 ai 目录

```text
ai
├── README.md
├── pyproject.toml
├── requirements.txt
├── ai-service
└── deploy
```

职责：

- RAG 知识库问答。
- Prompt 模板。
- 多 Agent。
- MCP 工具。
- ChatBI。
- 向量数据库适配。
- 调用 Java 服务 REST API。

### 3.10 frontend-platform 目录

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

- 甲方维护前端底座。
- `portal-shell` 提供统一登录页、门户框架、Token 管理、菜单装载和模块入口。
- `sys-web` 提供用户、角色、菜单、部门、岗位、字典、日志、登录风控和数据权限页面。
- `platform-ui` 提供基于 Element Plus 的企业后台标准组件。
- `platform-sdk` 提供 request、auth、dict、user、org、file 等平台能力。
- `platform-theme` 提供主题变量、全局样式和设计规范。
- `platform-types` 提供前端共享类型定义。

### 3.11 wms-web 目录

```text
wms-web
├── package.json
├── src
│   ├── api
│   ├── components
│   ├── router
│   ├── stores
│   ├── views
│   └── module.ts
└── deploy
```

职责：

- 乙方 A 独立开发 WMS 前端。
- 提供物料、仓库、库区、库位、入库、出库、库存批次、库存流水、离线上传页面。
- 通过 `@smartwarehouse/*` npm 包复用甲方平台前端能力。

### 3.12 mes-web 目录

```text
mes-web
├── package.json
├── src
│   ├── api
│   ├── components
│   ├── router
│   ├── stores
│   ├── views
│   └── module.ts
└── deploy
```

职责：

- 乙方 B 独立开发 MES 前端。
- 提供工单、工单物料、物料申请和配送状态页面。
- 通过 `@smartwarehouse/*` npm 包复用甲方平台前端能力。

### 3.13 ai-web 目录

```text
ai-web
├── package.json
├── src
│   ├── api
│   ├── components
│   ├── router
│   ├── stores
│   ├── views
│   └── module.ts
└── deploy
```

职责：

- 乙方 C 独立开发 AI 前端。
- 提供 RAG 问答、ChatBI、多 Agent、MCP 工具调用记录页面。
- 通过 `@smartwarehouse/*` npm 包复用甲方平台前端能力。

## 4. 微服务划分

| 服务 | 技术栈 | 职责 |
|---|---|---|
| `gateway-service` | Spring Cloud Gateway、Sentinel、Redis | 统一入口、路由、鉴权、限流、降级。 |
| `sys-service` | Spring Boot、Spring Security、JWT、Redis、MySQL | 登录、权限、风控、日志、数据权限。 |
| `mes-service` | Spring Boot、RabbitMQ、Redis、MySQL、Seata | 工单、物料申请、配送状态。 |
| `wms-service` | Spring Boot、RabbitMQ、Redis、MySQL、Seata | 仓储、库存、入库、出库、库存流水。 |
| `task-service` | Spring Boot、Redis、RabbitMQ、WebSocket、MySQL | 定时任务、统计、排行、预警、补偿。 |
| `ai-service` | Python、FastAPI、LangChain、Vector DB | RAG、多 Agent、MCP、ChatBI。 |

## 5. 技术架构

### 5.1 Java 技术栈

| 分类 | 技术 |
|---|---|
| 微服务框架 | Spring Boot、Spring Cloud Alibaba |
| 注册配置中心 | Nacos |
| 网关 | Spring Cloud Gateway |
| 认证授权 | Spring Security、JWT |
| 熔断限流 | Sentinel |
| 分布式事务 | Seata |
| RPC / 服务接口 | Dubbo 或 REST，接口定义在 `*-api` |
| 缓存与锁 | Redis |
| 消息队列 | RabbitMQ |
| ORM | MyBatis Plus |
| 数据库 | MySQL |
| 实时推送 | WebSocket |
| 构建 | Maven |
| 制品仓库 | 阿里云效 Maven / npm release / snapshot |

### 5.2 Python AI 技术栈

| 分类 | 技术 |
|---|---|
| Web 框架 | FastAPI |
| AI 编排 | LangChain |
| RAG | 文档切分、向量检索、重排、生成 |
| Agent | Router Agent、WMS Agent、MES Agent、BI Agent |
| MCP | MCP Server / MCP Client |
| ChatBI | NL2SQL、指标解释、结果总结 |
| 向量库 | Chroma / FAISS / Milvus，MVP 推荐 Chroma 或 FAISS |
| 数据模型 | Pydantic |

### 5.3 前端技术栈

| 分类 | 技术 |
|---|---|
| 框架 | Vue |
| 构建 | Vite |
| UI | Element Plus |
| 工程管理 | pnpm |
| 通信 | Axios、WebSocket |
| 平台包 | `@smartwarehouse/platform-ui`、`@smartwarehouse/platform-sdk`、`@smartwarehouse/platform-theme`、`@smartwarehouse/platform-types` |
| 前端项目 | `frontend-platform`、`wms-web`、`mes-web`、`ai-web` |
| 部署 | Nginx |

## 6. 业务架构

### 6.1 业务闭环

```text
系统管理员初始化用户、角色、菜单、仓库数据权限
  -> 仓库管理员维护物料、仓库、库区、库位、库存
  -> 生产主管创建工单并绑定物料
  -> 生产主管发布工单并提交物料申请
  -> WMS 预扣并锁定库存
  -> WMS 生成库存流水和出库任务
  -> MES 更新物料分配和配送状态
  -> Task 统计运营数据和排行
  -> AI 提供问答和 ChatBI 分析
```

### 6.2 高并发物料申请

高并发物料申请模拟“生产任务大量释放，同时申请库存”的秒杀场景。

核心设计：

1. MES 批量发布工单。
2. MES 提交物料申请。
3. Redis Lua 原子预扣库存。
4. RabbitMQ 异步发送物料申请事件。
5. WMS 消费事件并锁定数据库库存。
6. 写入库存流水。
7. 发布库存分配成功或失败事件。
8. MES 更新申请状态。
9. Task 更新排行。
10. WebSocket 推送结果。

### 6.3 离线上传入库

离线上传用于模拟仓库线下盘点、供应商到货或批量入库数据导入。

流程：

1. 上传 Excel / CSV。
2. 创建导入任务。
3. 解析并校验数据。
4. 合法数据生成入库单、库存批次和流水。
5. 错误数据写入错误明细。
6. 前端查看导入进度和错误报告。

### 6.4 AI 智能分析

AI 服务面向三个场景：

- RAG：回答系统使用、仓储 SOP、异常处理问题。
- 多 Agent：根据问题路由到不同业务 Agent。
- ChatBI：自然语言查询工单、库存、入库、出库、排行和预警数据。

## 7. 接口架构

### 7.1 前端接口

前端统一通过 `frontend-platform/apps/portal-shell` 登录，登录成功后由门户加载 `sys-web`、`wms-web`、`mes-web`、`ai-web` 的菜单和模块入口。各前端项目统一访问 Gateway：

```text
/api/sys/**
/api/wms/**
/api/mes/**
/api/task/**
/api/ai/**
```

前端路由前缀：

```text
sys-web -> /sys
wms-web -> /wms
mes-web -> /mes
ai-web -> /ai
```

### 7.2 服务间接口

Java 服务间接口由 API 模块定义：

```text
sys-api
task-api
mes-api
wms-api
```

不设置以下模块：

```text
task-client
mes-client
wms-client
```

服务调用方直接依赖目标服务的 `*-api` 模块，并在自身基础设施层实现调用适配。

### 7.3 事件接口

核心事件：

| 事件 | 生产者 | 消费者 |
|---|---|---|
| `WorkOrderReleasedEvent` | MES | WMS、Task |
| `MaterialApplyCreatedEvent` | MES | WMS、Task |
| `InventoryAllocatedEvent` | WMS | MES、Task |
| `InventoryAllocateFailedEvent` | WMS | MES、Task |
| `InboundImportCreatedEvent` | WMS | Task |
| `StockAlertCreatedEvent` | Task / WMS | WebSocket 推送 |
| `DeliveryStatusChangedEvent` | WMS | MES、Task |

事件公共字段：

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

## 8. 数据架构

### 8.1 数据库划分

| 数据库 | 所属服务 | 说明 |
|---|---|---|
| `smart_sys` | sys-service | 用户、角色、菜单、日志、风控。 |
| `smart_mes` | mes-service | 工单、工单物料、物料申请、配送状态。 |
| `smart_wms` | wms-service | 物料、仓库、库位、库存批次、库存流水。 |
| `smart_task` | task-service | 定时任务、统计、排行、补偿。 |
| `smart_ai` | ai-service | 知识库、聊天记录、BI 查询记录。 |

### 8.2 数据一致性策略

| 场景 | 策略 |
|---|---|
| 入库单审核 | 本地事务或 Seata。 |
| 出库单确认 | 本地事务或 Seata。 |
| 高并发库存申请 | Redis Lua + RabbitMQ + 幂等 + 补偿。 |
| 物料申请状态更新 | MQ 事件最终一致性。 |
| 运营统计 | 事件驱动 + 定时校准。 |
| AI 查询 | 只读访问，不参与业务事务。 |

## 9. 安全架构

### 9.1 认证

- 用户登录由 `sys-service` 处理。
- 登录成功签发 Access Token 和 Refresh Token。
- Gateway 校验 Access Token。
- 退出登录后 Token 写入 Redis 黑名单。

### 9.2 授权

- RBAC 控制菜单和接口权限。
- 数据权限控制仓库可见范围。
- 后端通过登录上下文获取用户、角色、部门、仓库权限。

### 9.3 登录风控

- 账号失败次数限制。
- 用户连续失败 3 次后启用随机拼图验证码。
- IP 高频失败限制。
- 账号临时锁定。
- 登录日志记录。
- 异常登录记录风控事件。
- 随机拼图验证码挑战信息存放在 Redis，验证成功后生成短期有效的验证码通过凭证。

## 10. 部署架构

### 10.1 deploy 目录

```text
deploy
├── local
├── nacos
├── mysql
├── nginx
├── redis
├── rabbitmq
├── seata
└── sentinel
```

### 10.2 本地部署

本地通过 `deploy/local/docker-compose.yml` 启动基础设施：

- MySQL
- Redis
- RabbitMQ
- Nacos
- Sentinel
- Seata
- Nginx
- Vector DB

业务服务可以本地 IDE 启动，也可以通过各服务 `deploy` 目录构建镜像启动。

### 10.3 K8s 目标部署架构

生产和准生产环境使用 Kubernetes 部署。所有中间件、微服务、数据库和前端静态资源服务都要支持集群或多实例。

K8s 目标拓扑：

```text
Ingress / Nginx
  |
  +-- frontend-platform / portal-shell / sys-web
  +-- wms-web
  +-- mes-web
  +-- ai-web
  |
  v
gateway-service Deployment replicas >= 2
  |
  +-- sys-service Deployment replicas >= 2
  +-- task-service Deployment replicas >= 2
  +-- wms-service Deployment replicas >= 2
  +-- mes-service Deployment replicas >= 2
  +-- ai-service Deployment replicas >= 2

中间件：
Nacos Cluster
Sentinel Dashboard
Seata TC Cluster
Redis Cluster / Sentinel
RabbitMQ Cluster
MySQL 主从 / 高可用实例
Vector DB Cluster / 持久化实例
MinIO / OSS / PVC
```

K8s 资源建议：

| 类型 | 对象 |
|---|---|
| 微服务 | Deployment、Service、ConfigMap、Secret、HPA |
| 前端 | Nginx Deployment、Service、Ingress、ConfigMap |
| 定时任务 | K8s CronJob、XXL-Job、ShedLock 或 Leader Election |
| 配置 | Nacos、ConfigMap、Secret |
| 存储 | PVC、对象存储、数据库持久化卷 |
| 可观测性 | stdout 日志、Prometheus、Grafana、OpenTelemetry / SkyWalking |

### 10.4 K8s 开发设计原则

开发阶段必须遵循以下原则：

1. 服务无状态：业务状态不得依赖 Pod 本地内存或本地磁盘。
2. 状态外置：登录状态、验证码、Token 黑名单、库存预扣、导入任务、AI 会话、WebSocket 路由放入 Redis、MySQL、MQ、对象存储或向量库。
3. 配置外置：数据库、中间件、密钥、API Key、限流规则通过 Nacos、ConfigMap、Secret 或环境变量注入。
4. 健康检查：所有后端服务提供 Liveness、Readiness、Startup Probe。
5. 优雅停机：HTTP 请求、MQ 消费、WebSocket、数据库事务和 AI 长任务需要处理 SIGTERM。
6. 多实例幂等：接口请求、MQ 消费、定时补偿、库存锁定、文件导入、AI 工具调用必须支持幂等。
7. 日志标准输出：日志输出到 stdout / stderr，统一携带 traceId、serviceName、podName、bizId。
8. 前端独立部署：`frontend-platform`、`wms-web`、`mes-web`、`ai-web` 支持独立构建、独立镜像和 Nginx base path。
9. 数据库迁移版本化：DDL 和初始化数据通过 Flyway、Liquibase、Migration Job 或 CI/CD 管理，避免多 Pod 同时执行 DDL。
10. 滚动发布兼容：接口、MQ 事件、数据库字段、前端调用必须支持新旧版本短时间共存。

## 11. 制品架构

### 11.1 阿里云效 Maven 和 npm 仓库

| 仓库 | 类型 | 用途 |
|---|---|---|
| `smartwarehouse-maven-release` | Maven release | Java 正式制品。 |
| `smartwarehouse-maven-snapshot` | Maven snapshot | Java 开发和测试制品。 |
| `smartwarehouse-npm-release` | npm release | 前端正式包、组件库、SDK。 |
| `smartwarehouse-npm-snapshot` | npm snapshot | 前端开发联调包。 |

### 11.2 需要发布的 Maven 制品

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

### 11.3 需要发布或代理的 npm 制品

前端依赖统一通过阿里云效 npm 制品库管理。可发布的内部 npm 包包括：

```text
@smartwarehouse/platform-ui
@smartwarehouse/platform-sdk
@smartwarehouse/platform-theme
@smartwarehouse/platform-types
```

npm 版本规则：

- 正式版本发布到 npm release 仓库，例如 `1.0.0`。
- 联调版本发布到 npm snapshot 仓库，或使用 `next` / `snapshot` dist-tag，例如 `1.1.0-beta.1`。
- `frontend-platform`、`wms-web`、`mes-web`、`ai-web` 安装依赖时统一使用阿里云效 npm registry。
- 乙方前端模块或独立页面只能通过 npm 包接入甲方前端基础能力，不复制源码。

### 11.4 不作为依赖发布的模块

以下模块作为可部署产物，不作为其他服务的普通 Maven 依赖：

```text
gateway-service
sys-service
task-service
mes-service
wms-service
```

## 12. 可靠性设计

### 12.1 幂等设计

需要幂等的场景：

- 用户退出。
- 物料申请。
- MQ 消费。
- 库存锁定。
- 库存解锁。
- 离线上传导入。
- AI MCP 工具调用。

实现方式：

- 请求号。
- eventId。
- Redis 幂等 Key。
- 数据库唯一索引。
- 消费记录表。

### 12.2 补偿设计

补偿场景：

- Redis 预扣成功但数据库锁定失败。
- WMS 分配成功但 MES 状态更新失败。
- MQ 消息消费失败。
- 离线导入部分失败。

补偿方式：

- RabbitMQ 重试。
- 死信队列。
- `task-service` 定时扫描补偿。
- 人工重试入口。

## 13. 扩展设计

后续可扩展方向：

- 接入真实条码扫描。
- 增加供应商到货预约。
- 增加库存盘点。
- 增加工单齐套分析。
- 增加 AI 异常归因。
- 增加多租户。
- 增加 OpenTelemetry 链路追踪。
