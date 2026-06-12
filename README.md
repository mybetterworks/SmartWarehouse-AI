# SmartWarehouse-AI

SmartWarehouse-AI 是一个面向制造执行与仓储物流协同场景的分布式微服务实践项目。项目以个人实践和简历项目展示为目标，通过最小 MVP 业务闭环验证 Java 微服务、前后端独立协作、AI 应用集成、持续交付和云原生部署设计能力。

## 项目定位

系统模拟制造企业中的生产执行与仓储协同流程，不依赖外部 ERP、MES 或 WMS 上游系统，所有业务数据在系统内部形成闭环。

核心业务链路：

```text
系统登录与权限控制
  -> WMS 维护物料、仓库、库区、库位和库存
  -> MES 创建工单并提交物料申请
  -> WMS 分配库存并更新配送状态
  -> task 统计运营数据、排行和预警
  -> AI 提供 RAG 问答、ChatBI 查询和业务分析
```

## 核心能力

### 甲方平台能力

- `platform`：Maven 构建规范、依赖版本、公共核心包、Web、数据访问、安全、Redis、MQ、ID 等基础能力。
- `gateway`：统一入口、路由、认证鉴权、限流、熔断。
- `sys`：登录、退出、刷新 Token、用户、角色、菜单、部门、岗位、字典、登录日志、操作日志、数据权限。
- 登录风控：用户连续登录失败 3 次后启用随机拼图验证码。
- `task`：定时任务、运营统计、实时排行、安全库存预警、WebSocket 推送。
- `frontend-platform`：统一登录入口、门户基座、`sys-web` 页面、平台组件库、SDK、主题和类型定义。

V01 已完成的甲方前端平台包：

- `@smartwarehouse/platform-ui`：基于 Element Plus 的后台组合组件库。
- `@smartwarehouse/platform-sdk`：统一 request、runtime config、token、permission、dict mock 能力。
- `@smartwarehouse/platform-theme`：主题变量和 Element Plus 样式覆盖。
- `@smartwarehouse/platform-types`：统一响应、分页、用户、菜单、模块注册、字典和表格类型。

### 乙方业务能力

- `wms` / `wms-web`：物料、仓库、库区、库位、入库、出库、库存批次、库存流水、安全库存预警、离线上传入库数据。
- `mes` / `mes-web`：工单、工单物料、物料申请、物料分配状态、配送状态。
- `ai` / `ai-web`：RAG 知识库问答、Prompt 工程、多 Agent、MCP 工具调用、ChatBI、向量数据库。

## 技术栈

| 类型 | 技术 |
|---|---|
| Java 后端 | JDK 17、Spring Boot、Spring Cloud Alibaba、Spring Security、JWT |
| 微服务治理 | Nacos、Sentinel、Gateway |
| 数据与缓存 | MySQL、Redis、Flyway / Liquibase |
| 消息与事务 | RabbitMQ、Seata、幂等、补偿 |
| 实时能力 | WebSocket、Redis Pub/Sub 或 RabbitMQ 广播 |
| 前端 | Vue、Vite、TypeScript、Element Plus、Pinia、Vue Router |
| AI | Python、FastAPI、LangChain、RAG、多 Agent、MCP、ChatBI、Vector DB |
| 本地环境 | Windows 11、JDK 17、Maven、Docker Desktop、Node v22.22.3 |
| 测试发布 | Jenkins、本地 Docker / Docker Compose 测试环境 |
| 正式发布 | 阿里弹性容器、正式镜像、环境变量、健康检查 |
| 制品管理 | 阿里云效 Maven / npm release 与 snapshot 仓库 |

## 项目结构

```text
SmartWarehouse-AI
├── README.md
├── docs
│   ├── design
│   └── plan
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

说明：

- `docs/design`：正式设计文档目录，存放需求、概要设计、详细设计、数据库设计和前端组件封装说明。
- `docs/plan`：提示词驱动开发目录，存放路线图、开发规则、进度、版本计划、决策、skill、study 和 handle。
- 当前代码使用同一个 Git 仓库管理，但开发、构建、测试、发布时按独立项目处理。

## 当前可运行内容

### V01 甲方组件库

V01 已完成 `frontend-platform` pnpm workspace、四个平台 npm 包和 VitePress 企业组件文档站点。当前文档站公开入口为：

- `组件`：`/component/overview`，提供与具体业务无关的组件级总览、基础 / 布局 / 数据录入 / 数据展示 / 反馈与流程 / 高级组件分类，以及每个底层组件独立的样式预览、Vue + TypeScript 示例代码、Props、Events、Slots、Types 和注意事项。
- `场景模板`：`/scenario/overview`，保留原组件页中“大块功能组合展示”的价值，展示登录风控、标准查询表格、离线导入、流程状态、运营看板和 AI 工作台等多组件组合模板；场景模板会列出底层组件并链接到对应单组件文档。

预设式静态 Playground 已删除。后续只有升级为支持在线修改代码并实时预览样式的真实 Playground 时，才恢复独立入口。

```powershell
cd frontend-platform
corepack pnpm install
corepack pnpm build
corepack pnpm --filter @smartwarehouse/platform-ui publish --dry-run --no-git-checks
corepack pnpm --filter @smartwarehouse/component-docs dev -- --port 5173
```

组件文档本地启动后访问：

```text
http://localhost:5173/component/overview
http://localhost:5173/scenario/overview
```

说明：

- 本地使用 `corepack pnpm`，避免 Windows PowerShell 执行策略或未安装全局 pnpm 导致命令失败。
- 仓库只提交 `.npmrc.example` 占位模板，真实阿里云效 npm token 由本地环境、Jenkins Credentials 或发布环境注入。
- V01 不接真实后端接口，组件文档和场景模板使用 mock / preset 数据。
- 组件详情页已完成单组件边界重构：`/component/<slug>` 只展示一个底层组件；原 `/component/business-selects`、`/component/dashboard`、`/component/ai-workbench` 仅作为迁移提示，组合内容统一进入 `/scenario/*`。
- 组件详情页已完成表格布局修复：Element Plus 表格表头与第一行无异常空白，表格、AI/BI、SQL、Agent、MCP 等长内容不会超出“基础用法”容器。
- `frontend-platform` 源码已按学习友好规则补充中文注释，重点说明组件职责、业务边界、接口替换点和安全注意事项。

## 开发节奏

项目按真实商用协作模式推进，不采用“先做完所有后端，再统一补前端”的方式。

版本节奏：

```text
V01 甲方组件库二次开发
  -> V02 甲方前后端基座开发 + CI/CD 基线
  -> V03 WMS 乙方前后端项目开发
  -> V04 MES 乙方前后端项目开发
  -> V05 AI 乙方前后端项目开发
  -> V06 task 甲方运营前后端项目开发
  -> V07 MES + WMS + task 多方交互业务开发
  -> V08 AI + 业务服务多方交互与正式发布加固
```

每个业务模块都要求前后端一起开发、联调、测试和验收。Jenkins 从平台基座版本开始负责测试环境发布，阿里弹性容器负责正式环境部署和演示。

## 文档入口

- [软件需求规格说明书](docs/design/software-requirements-specification.md)
- [概要设计说明书](docs/design/high-level-design.md)
- [详细设计说明书](docs/design/detailed-design.md)
- [数据库设计说明书](docs/design/database-design.md)
- [Element Plus 组件二次封装说明](docs/design/element-plus-wrapper-guide.md)
- [开发路线图](docs/plan/ROADMAP.md)
- [开发要求](docs/plan/DEVELOPMENT_RULE.md)
- [开发总进度](docs/plan/PROGRESS.md)

## Git 与安全规则

- `git commit` 和 `git push` 必须手动执行。
- 开发过程中自动维护 `.gitignore`，避免构建产物、依赖目录、日志、本地配置和密钥文件进入 Git。
- 提交前必须检查隐私和敏感信息，包括账号、密码、token、API Key、私钥、数据库连接串、Jenkins 凭证、阿里云密钥、LLM Key 等。
- 真实敏感配置必须通过环境变量、Nacos、Secret、Jenkins Credentials、阿里弹性容器环境配置或 `.example` 模板管理。

## 当前状态

当前 V01 甲方组件库二次开发与最小项目骨架已完成，已通过 `corepack pnpm build`、`corepack pnpm publish:dry-run` 和本地 preview HTTP 路由验证。组件文档站当前为“组件 / 场景模板”两入口企业组件库结构：`组件` 入口按底层组件独立展示且与业务组合解耦，`场景模板` 入口承载多组件组合模板，二者复用 `componentCatalog.ts` 和 `CatalogOverview.vue` 的总览能力，并分别通过 `ComponentDetail.vue`、`componentDocs.ts`、`ScenarioTemplateDetail.vue`、`scenarioTemplateDocs.ts` 管理详情页，避免后续重复维护。预设式静态 Playground 已删除；后续只有升级为支持在线修改代码并实时预览样式的真实 Playground 时才恢复。当前已完成表格布局、LoginForm 示例外框一致性、AI Workbench 长内容溢出、Vue + TypeScript 示例代码规范化、45 个组件独立详情页补齐，以及 `frontend-platform` 源码中文注释补强。下一步进入 V02 甲方前后端基座开发与 CI/CD 基线，重点推进 `platform`、`gateway`、`sys`、`frontend-platform/apps/portal-shell`、`frontend-platform/apps/sys-web`，并接入 Jenkins 测试环境和阿里弹性容器正式发布检查。
