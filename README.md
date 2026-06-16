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

### V02 甲方前后端基座与 CI/CD 基线

V02 已完成甲方平台基座、网关、系统权限服务、统一门户、系统管理前端和发布基线。

后端已完成：

- `platform`：`platform-parent`、`platform-bom`、`platform-common-core/web/data/security-lite/redis/mq/log/id`。
- `gateway/gateway-service`：`/api/sys/**` 路由、WMS/MES/task/AI 路由预留、Nacos 服务发现、`lb://sys-service` 负载路由、TraceId、CORS、JWT 鉴权、基础限流和降级响应。
- `sys/sys-api`：认证、登录风控和系统管理 DTO 契约。
- `sys/sys-service`：Nacos 服务注册，登录、退出、刷新 Token、当前用户、修改密码、拼图验证码、用户、角色、菜单、部门、岗位、字典、前端模块、数据权限、登录日志、操作日志和风控记录。
- `sys-service` 代码已按用户、角色、菜单、组织岗位、字典、前端模块、审计日志、风控记录拆分 Controller，不再使用单个系统管理控制器承载所有接口。
- 登录风控：连续失败 3 次启用随机拼图验证码，连续失败 5 次锁定账号 10 分钟。
- 数据库脚本：`deploy/mysql/init-sys-db.sql` 提供 `smart_sys` 表结构。

前端已完成：

- `frontend-platform/apps/portal-shell`：统一登录页、后端拼图验证码联调、Token 管理、授权菜单装载、Module Federation host、微前端运行时加载、模块降级页、个人信息、修改密码和退出登录。
- `frontend-platform/apps/sys-web`：支持独立登录和独立调试，同时作为 `smart_sys_web` remote 暴露 `./RemoteApp`，由 `portal-shell` 在 `/sys/**` 下运行时加载，提供用户、角色、菜单、部门岗位、字典、前端模块、审计日志、风控记录和仓库数据权限配置页面。
- `wms-web`、`mes-web`、`ai-web`：已建立最小 Module Federation remote 骨架，分别暴露 `smart_wms_web`、`smart_mes_web`、`smart_ai_web`，后续乙方可独立更新自己的前端制品和模块注册信息。
- `portal-shell` 进入系统管理或乙方模块时停留在 `http://localhost:5174/`，例如 `/portal` 点击系统管理后进入 `/sys/users`，点击 WMS/MES/AI 进入 `/wms`、`/mes`、`/ai`，不再 iframe 嵌套、不再新开浏览器页面、不再跳转到独立 dev server，也不要求二次登录。
- `sys_frontend_module` 已支持 `remote_name`、`remote_entry`、`exposed_module`，作为门户运行时加载微前端的模块注册中心。
- `sys-web` 页面已按业务域拆分到 `src/views`，`App.vue` 只负责应用壳层、登录态、模块切换和公共弹窗编排。
- `portal-shell` 和 `sys-web` 均通过 `@smartwarehouse/*` 包名使用平台包，`package.json` 使用 `workspace:*`，代码不引用 `../../packages/**` 源码相对路径。
- `LoginForm` 和 `JigsawCaptcha` 已增强为可接后端验证码 verifier 的通用登录风控组件，并同步更新组件文档。

CI/CD 与部署基线：

- `deploy/jenkins/Jenkinsfile`：覆盖 Java 测试、前端安装构建、Docker 镜像构建、本地 Docker Compose 测试发布和健康检查。
- `deploy/local/docker-compose.yml`：提供 MySQL、Redis、Nacos、Sentinel、gateway-service、sys-service 本地集成配置。
- `gateway/deploy/Dockerfile`、`sys/deploy/Dockerfile`、`frontend-platform/apps/portal-shell/deploy/Dockerfile`、`frontend-platform/apps/sys-web/deploy/Dockerfile`：提供服务镜像构建模板。
- `deploy/aliyun-eci/formal-release-checklist.md`：记录阿里弹性容器正式发布检查清单。

V02 验证命令：

```powershell
docker compose -f deploy/local/docker-compose.yml up -d mysql redis rabbitmq nacos
mvn test -q
mvn package -DskipTests -q

cd frontend-platform
corepack pnpm install
corepack pnpm build
cd ..

docker compose -f deploy/local/docker-compose.yml config
```

V02 本地默认配置已经和 `deploy/local/docker-compose.yml` 对齐。直接启动 Java 服务时，`sys-service` 默认连接 Docker MySQL `127.0.0.1:13306`、Docker Redis `127.0.0.1:16381` 和 Nacos `127.0.0.1:18848`，`gateway` 默认连接 Docker Redis `127.0.0.1:16381` 和 Nacos `127.0.0.1:18848`，并通过 `lb://sys-service` 转发系统管理接口，不需要再额外修改数据库、Redis 或 Nacos 配置。

```powershell
java -jar sys/sys-service/target/sys-service-*.jar
java -jar gateway/gateway-service/target/gateway-service-*.jar
```

联调结果：

- `gateway-service` 和 `sys-service` 健康检查返回 `UP`。
- 未登录访问 `/api/sys/users` 返回 `401`。
- 登录成功返回 Access Token 和 Refresh Token。
- 携带 Token 可访问 `/api/sys/auth/me` 和 `/api/sys/users`。
- 连续 3 次错误登录后，`/api/sys/auth/risk-state?username=admin` 返回 `captchaRequired=true`。
- `mvn test` 已包含 `LocalDockerMiddlewareAcceptanceTest`，会使用同一套默认配置连接真实 Docker MySQL/Redis，验证登录、模块查询和岗位增改删。

说明：

- V02 的 sys 数据、登录日志、操作日志、风控记录和前端模块注册已落库到 Docker MySQL；Token 黑名单、登录风控计数、验证码挑战和验证码通过 token 优先使用 Docker Redis。
- H2 测试只用于快速验证基础逻辑，V02 验收结论以真实 Docker MySQL/Redis 和网关联调结果为准。
- Docker 镜像构建检查曾因 Docker Hub 基础镜像网络连接超时阻塞；网络可用或配置镜像加速器后，可重试 Jenkinsfile 中的 Docker Build 阶段。
- AI 不会自动向阿里云效 npm 私库推送 snapshot/release 制品，也不会自动执行 `pnpm publish` 或 `npm publish`。平台包版本号设置和真实发布必须由用户手动执行。

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

当前 V01 甲方组件库二次开发与 V02 甲方前后端基座开发均已完成。V01 已完成企业组件库、组件文档站和源码中文注释补强；V02 已完成 `platform`、`gateway`、`sys`、`frontend-platform/apps/portal-shell`、`frontend-platform/apps/sys-web`、`wms-web`、`mes-web`、`ai-web` 的微前端 remote 骨架、Jenkins 测试发布基线和阿里弹性容器正式发布检查清单。已通过 `mvn -pl sys/sys-service -am test`、`corepack pnpm build:packages`、`corepack pnpm --filter @smartwarehouse/portal-shell build`、`corepack pnpm build:remotes`、真实 Docker MySQL/Redis/Nacos 验收测试、remoteEntry HTTP 检查和浏览器运行时加载/降级验证。下一步进入 V03 WMS 乙方前后端模块开发，重点在现有 `wms-web` remote 骨架上推进物料、仓库、库存、入库出库和离线上传闭环。


## V02 最新补齐说明

2026-06-14 已按商业系统标准对 V02 做二次补齐：sys-service 已连接 Docker MySQL 和 Redis，系统管理数据、日志、风控记录和前端模块注册均落库或写入共享中间件；gateway 与 sys-service 已完成双层 Token 鉴权和 Redis 黑名单校验；portal-shell 与 sys-web 已完成统一登录、模块入口和完整系统管理页面。

已验证内容包括：Maven 测试与打包、真实 Docker MySQL/Redis/RabbitMQ 健康检查、`LocalDockerMiddlewareAcceptanceTest`、无额外环境变量的 sys-service/gateway 默认启动、网关接口联调、登录/退出/黑名单、三次失败启用拼图验证码、岗位增改删与操作日志、前端包构建、portal-shell/sys-web 浏览器页面验收和 compose 配置检查。Docker 镜像构建检查目前受 Docker Hub 基础镜像拉取网络超时阻塞，网络恢复或配置镜像加速器后可重试 docker compose -f deploy/local/docker-compose.yml build sys-service gateway-service。

敏感信息处理也已同步：真实 .npmrc 继续由本地文件管理且被 .gitignore 忽略，.npmrc.example、V01 handle 和 frontend-platform/package.json 不再写死具体云效 npm registry 地址，真实地址与 token 通过本地 .npmrc、Jenkins Credentials 或环境变量注入。

2026-06-15 已继续按商业软件架构标准优化 V02：gateway/sys-service 已接入 Nacos，Nacos 本地端口使用 `18848/19848` 避免冲突；gateway 默认通过 `lb://sys-service` 路由系统管理接口。portal-shell 登录后通过统一前端路由承载系统管理，访问路径保持在 `http://localhost:5174/sys/**`，不再使用 iframe、postMessage、URL Token、跨端口 `redirect` 或跳转到 `localhost:5175`，也不再二次登录。右上角个人信息和修改密码入口已补齐，修改密码后端接口为 `PUT /api/sys/auth/password`。sys-service 已拆分系统管理 Controller，sys-web 已拆分业务 views，后续功能开发继续按模块维护。

本次优化已验证：`docker compose -f deploy/local/docker-compose.yml up -d mysql redis rabbitmq nacos`、`mvn -q -pl sys/sys-service,gateway/gateway-service -am test`、`mvn -q -pl sys/sys-service,gateway/gateway-service -am package -DskipTests`、`corepack pnpm build:packages`、`corepack pnpm --filter @smartwarehouse/portal-shell --filter @smartwarehouse/sys-web build` 均通过。浏览器验证中，`http://localhost:5174/` 已有登录态时规范到 `http://localhost:5174/portal`；点击左侧“系统管理”直接进入 `http://localhost:5174/sys/users`，点击系统管理内“角色管理”进入 `http://localhost:5174/sys/roles`；使用 `wms_manager / 123456` 登录后只显示“仓储管理”，不显示“系统管理”“生产执行”“运营看板”“AI 助手”。该阶段的 embedded 承载方式已被后续 Module Federation 运行时加载方案替代。

2026-06-15 继续修复 V02 权限边界：`sys-service` 作为统一认证中心，允许 `wms_manager` 这类业务账号登录总门户，但系统管理接口已增加服务端授权兜底。除认证接口、授权菜单树和授权模块列表外，访问 sys 管理接口必须具备 `ADMIN` 角色或 `sys:*` 权限。已验证 `wms_manager / 123456` 可访问 `/api/sys/auth/me`，菜单和模块只返回 WMS，但访问 `/api/sys/users` 返回 `FORBIDDEN`；`sys-web` 独立登录时也会提示“当前账号无系统管理访问权限”。

2026-06-15 已将 V02 前端基座升级为 `vite-plugin-federation` 微前端架构：`portal-shell` 作为 host 运行时加载 `sys-web`、`wms-web`、`mes-web`、`ai-web` remote，不再构建期静态依赖乙方前端。乙方发布新版本时，只需要发布自己的静态制品并更新 `sys_frontend_module.remote_entry` 等模块注册信息，不需要重新构建或发布 `portal-shell`。若某个 remote 加载失败或超时，门户会显示当前模块降级页，其他模块继续可用。

本次微前端改造已验证：`corepack pnpm install`、`corepack pnpm build:packages`、`corepack pnpm --filter @smartwarehouse/portal-shell build`、`corepack pnpm build:remotes`、`mvn -pl sys/sys-service -am test` 均通过；临时 preview 验证四个 remoteEntry 均返回 200；浏览器验证 `/sys/users`、`/wms`、`/mes`、`/ai` 可在门户路由内运行时加载，停止 `ai-web` 后 `/ai` 显示降级页且 `/wms` 仍正常。

微前端收口已完成：`sys-web` 不再暴露旧的 `@smartwarehouse/sys-web/embedded` 构建期入口，当前系统管理、WMS、MES、AI 前端模块统一通过 `remoteEntry.js` + `./RemoteApp` 运行时加载。最新复验已通过 `corepack pnpm build:packages`、`corepack pnpm --filter @smartwarehouse/portal-shell build`、`corepack pnpm build:remotes`、`mvn -pl sys/sys-service -am test`，并确认四个本地 preview remoteEntry 均返回 200；备用端口 `5184` 下 `/portal`、`/sys/users`、`/wms`、`/mes`、`/ai` 的 SPA 路由 HTTP 检查均返回 200。
