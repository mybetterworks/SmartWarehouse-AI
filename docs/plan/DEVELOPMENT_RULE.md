# SmartWarehouse-AI 开发要求

## 1. 基本原则

1. 项目根目录就是开发根目录。
2. `docs/design` 是正式设计文档目录。
3. `docs/plan` 是提示词开发、进度、复盘、决策、技能和手搓步骤目录。
4. 所有开发必须以 `docs/design` 和 `docs/plan` 为依据。
5. 每次开发只处理当前版本范围，避免一次性做完全部功能。
6. 每个版本结束时必须形成可演示或可运行成果。
7. 开发顺序按“甲方组件库二次开发 -> 甲方前后端基座开发 -> 乙方各自前后端项目开发 -> 多乙方交互业务开发”推进。
8. 业务模块按前后端一起交付，不允许先完成所有后端再集中补前端。
9. Jenkins 测试环境和阿里弹性容器正式环境要尽早接入，并贯穿后续版本。

## 2. 本地开发环境

本地开发系统：

```text
Windows 11
```

本地已安装工具：

```text
JDK 17
Maven
Docker Desktop
Node v22.22.3
Jenkins
```

使用规则：

1. Java 服务使用本地 JDK 17 和 Maven 开发、编译、测试。
2. 前端项目使用本地 Node v22.22.3 开发、构建、测试。
3. 中间件、数据库和基础设施优先使用 Docker 容器。
4. Jenkins 负责本地构建、自动测试和测试环境发布。
5. 阿里弹性容器负责正式环境部署和正式版本演示。
6. 不要求本地安装 MySQL、Redis、RabbitMQ、Nacos、Sentinel、Seata、Nginx、Vector DB、MinIO 等服务。

## 3. Docker 与中间件规则

本地中间件统一通过 Docker Desktop 启动：

| 类型 | 本地运行方式 |
|---|---|
| MySQL | Docker 容器 |
| Redis | Docker 容器 |
| RabbitMQ | Docker 容器 |
| Nacos | Docker 容器 |
| Sentinel | Docker 容器 |
| Seata | Docker 容器 |
| Nginx | Docker 容器 |
| Vector DB | Docker 容器 |
| MinIO / OSS 替代服务 | Docker 容器 |

规则：

1. 本地开发不得假设宿主机已经安装数据库和中间件。
2. Docker Compose 文件应支持一键启动本地依赖。
3. 端口、账号、密码必须集中配置，不能散落在业务代码中。
4. 数据库初始化脚本按服务拆分，避免所有服务共用一个 SQL 文件。
5. 中间件容器用于开发验证，测试环境由 Jenkins 触发本地 Docker / Docker Compose 发布。
6. 正式环境由阿里弹性容器部署正式镜像。
7. K8s 相关设计仍作为多实例、无状态和云原生部署约束，但版本开发不等到最后才处理部署。

## 4. Git 提交规则

1. AI 可以修改文件、运行验证、整理文档。
2. `git commit` 必须由用户手动执行。
3. `git push` 必须由用户手动执行。
4. AI 不得自动执行 `git commit`、`git push`、`git reset --hard`。
5. 如果存在用户未提交修改，AI 必须尊重现有改动，不得回滚无关内容。
6. AI 可以自动维护 `.gitignore`，但不得自动提交。
7. 每次新增模块、依赖、构建输出、日志、本地配置、密钥文件或工具缓存时，都要检查是否需要同步更新 `.gitignore`。
8. 每次开发完成后都要检查准备纳入 Git 的文件是否包含隐私、敏感数据、账号、密码、token、API Key、私钥、数据库连接串、Jenkins 凭证、阿里云密钥、LLM Key 或个人信息。
9. 如果发现敏感信息，必须先移出 Git 管理范围，并改为统一配置、环境变量、Nacos、K8s Secret、Jenkins Credentials、阿里弹性容器环境变量或 `.example` 模板管理。
10. 每个版本建议用户手动提交一次，提交信息可按以下格式：

```text
feat(V01): implement owner component library
feat(V02): implement owner platform base and cicd
feat(V03): implement wms fullstack module
docs(plan): update milestone progress and study notes
```

### 4.1 .gitignore 自动维护规则

`.gitignore` 需要随着项目开发自动更新，常见忽略对象包括：

```text
target/
node_modules/
dist/
.vite/
.idea/
.vscode/
logs/
*.log
.env
.env.*
!.env.example
*.local
application-local.yml
application-local.yaml
bootstrap-local.yml
bootstrap-local.yaml
.npmrc
*.pem
*.key
*.p12
*.jks
```

规则：

1. 新增 Java、前端、Python、Docker、Jenkins、阿里弹性容器相关文件时，自动判断是否需要更新 `.gitignore`。
2. 可以提交 `.env.example`、`application-example.yml`、`bootstrap-example.yml` 等示例模板，但模板中只能放占位符。
3. 真实账号、密码、token、API Key、私钥、证书和本地路径不得提交。
4. 如果某类文件需要被 Git 管理，必须确认其中不包含敏感信息。

### 4.2 敏感信息检查规则

开发过程中要重点检查以下内容：

```text
password=
pwd=
secret=
token=
api_key=
access_key=
secret_key=
Authorization
Bearer
BEGIN PRIVATE KEY
BEGIN RSA PRIVATE KEY
_authToken
jdbc:mysql://
redis://
amqp://
oss://
```

处理规则：

1. 发现敏感信息后，不直接删除业务配置，而是改为统一配置或设置管理。
2. Java 服务使用 Nacos、环境变量、启动参数或 Secret 管理敏感配置。
3. 前端只保留运行时公开配置，不保存任何后端密钥、npm token 或云厂商密钥。
4. Jenkins 凭证使用 Jenkins Credentials 管理。
5. 阿里弹性容器正式环境使用环境变量、Secret 或平台配置项管理。
6. AI 服务的 LLM API Key、向量库密码、数据库只读账号通过环境变量或 Secret 注入。
7. 文档和示例中只能出现占位符，例如 `<DB_PASSWORD>`、`<ALIYUN_ACCESS_KEY>`、`<LLM_API_KEY>`。

## 5. 项目边界规则

甲方维护：

```text
platform
gateway
sys
task
frontend-platform
```

乙方维护：

```text
wms
mes
ai
wms-web
mes-web
ai-web
```

边界要求：

1. 当前仍使用根目录下同一个 Git 仓库管理。
2. 开发、构建、测试、发布时必须按独立项目处理。
3. 乙方后端不得直接依赖甲方服务源码，应通过 `*-api` 或接口契约集成。
4. 乙方前端不得直接引用 `frontend-platform` 源码，应通过 `@smartwarehouse/*` npm 包接入。
5. 不新增 `task-client`、`mes-client`、`wms-client` 模块。
6. 公共能力先沉淀到平台包，再通过制品库分发。

## 6. 模块全栈开发规则

开发时按真实项目模块推进，每个业务模块都要形成前后端闭环。

推荐顺序：

```text
V01 甲方组件库二次开发
V02 甲方前后端基座 + Jenkins / 阿里弹性容器基线
V03 WMS 乙方前后端模块
V04 MES 乙方前后端模块
V05 AI 乙方前后端模块
V06 甲方 task 运营统计前后端模块
V07 MES + WMS + task 多方交互业务
V08 AI + 业务服务多方交互、正式发布加固
```

规则：

1. WMS 版本必须同时开发 `wms` 后端和 `wms-web` 前端。
2. MES 版本必须同时开发 `mes` 后端和 `mes-web` 前端。
3. AI 版本必须同时开发 `ai` 后端和 `ai-web` 前端。
4. task 版本必须同时开发 `task` 后端和门户或运营看板前端。
5. 每个业务模块版本都必须包含接口联调、权限验证、Jenkins 测试发布和阿里弹性容器正式发布检查。
6. 多乙方交互版本再开发跨模块协同，例如 MES 物料申请触发 WMS 库存分配、task 统计排行、AI ChatBI 查询业务数据。

## 7. Maven 与 npm 制品规则

Maven 制品：

1. `platform-parent` 统一 Maven 构建规范。
2. `platform-bom` 统一依赖版本。
3. `platform-common-*` 和 `*-api` 可发布到阿里云效 Maven 制品库。
4. 稳定版本发布到 release 仓库。
5. 开发联调版本发布到 snapshot 仓库。
6. 业务服务启动模块不作为普通依赖发布。

npm 制品：

1. `@smartwarehouse/platform-ui` 发布平台组件。
2. `@smartwarehouse/platform-sdk` 发布请求、权限、Token 等前端 SDK。
3. `@smartwarehouse/platform-theme` 发布主题。
4. `@smartwarehouse/platform-types` 发布通用类型。
5. 稳定版本使用 release npm 仓库或 `latest` tag。
6. 联调版本使用 snapshot npm 仓库或 `next` / `snapshot` tag。
7. `.npmrc` 和 token 只允许用于构建阶段，不得进入最终镜像。

## 8. Jenkins 与阿里弹性容器发布规则

项目不把部署放到最后处理。从 V02 开始，每个版本都要保留测试环境和正式环境发布能力。

### 8.1 Jenkins 测试环境

Jenkins 职责：

1. 拉取当前代码。
2. 安装或读取 Maven、npm、Python 依赖。
3. 执行 Java 单元测试、前端构建、AI 测试。
4. 构建测试镜像或测试构建产物。
5. 启动或更新本地 Docker / Docker Compose 测试环境。
6. 输出测试报告和构建日志。

Jenkins 发布要求：

1. 每个版本完成后都要有可执行或可描述的 Jenkins 流水线。
2. 测试版本使用 snapshot Maven/npm 制品。
3. Jenkins 不负责正式环境发布。
4. Jenkins 凭证不得写入代码仓库。

### 8.2 阿里弹性容器正式环境

阿里弹性容器职责：

1. 使用正式镜像和 release 制品部署正式环境。
2. 承载 Gateway、后端服务、AI 服务和前端 Nginx 静态服务。
3. 使用环境变量或密钥管理正式环境配置。
4. 支持版本回滚和正式演示。

正式发布要求：

1. 正式版本使用 release Maven/npm 制品。
2. 正式镜像不得包含 `.npmrc`、token、构建缓存或明文密钥。
3. 每个版本验收通过后，都要记录阿里弹性容器正式发布检查结果。
4. 功能未达到正式发布条件时，也要在 milestone 实现记录中说明阻塞原因。

## 9. K8s 开发规则

正式环境优先使用阿里弹性容器部署，同时保留 K8s 多实例、无状态、可滚动发布的云原生设计约束。开发阶段必须提前满足以下要求：

1. `gateway-service`、`sys-service`、`task-service`、`wms-service`、`mes-service`、`ai-service` 按无状态服务开发。
2. 登录状态、Token 黑名单、验证码、库存预扣、导入任务进度、WebSocket 路由、定时任务状态不得只存在本地内存。
3. 配置外置到 Nacos、ConfigMap、Secret 或环境变量。
4. 所有后端服务提供健康检查接口，支持 Liveness、Readiness、Startup Probe。
5. HTTP 请求、RabbitMQ 消费、数据库事务、WebSocket 连接和 AI 长任务必须支持优雅停机。
6. 核心写操作、MQ 消费、定时补偿、库存锁定、文件导入、AI 工具调用必须支持幂等。
7. 定时任务使用集群调度、分布式锁、K8s CronJob 或 Leader Election。
8. 离线上传文件、AI 文档、RAG 原始文件使用对象存储、PVC、MinIO 或 OSS，不保存到单个 Pod 本地目录。
9. 日志输出到 stdout / stderr，并携带 traceId、serviceName、podName、bizId。
10. 数据库迁移使用 Flyway、Liquibase、Migration Job 或 CI/CD，避免多个 Pod 同时执行 DDL。
11. 滚动发布时保证接口、MQ 事件、数据库字段、前端调用短时间新旧版本兼容。

## 10. 开发与验证规则

1. 后端功能必须补充必要单元测试或集成测试。
2. 前端页面必须保证路由、权限、接口调用、构建结果可验证。
3. AI 功能必须提供最小可运行样例和可重复验证方式。
4. 高并发库存、MQ 消费、幂等、登录风控、数据权限必须有重点验证。
5. 业务模块必须前后端联调验证，不允许只验后端接口。
6. 每个版本完成后按对应 milestone 的验收操作过程执行。
7. 每个版本都要记录 Jenkins 测试发布结果。
8. 从 V02 开始，每个版本都要记录阿里弹性容器正式发布检查结果。
9. 验证结果写入 milestone 的“实现记录”。

## 11. 文档更新规则

每个版本完成后必须更新：

1. `docs/plan/PROGRESS.md`
2. 当前 `docs/plan/milestones/Vxx-*.md`
3. 当前 `docs/plan/study/Vxx-*-study.md`
4. 当前 `docs/plan/handle/Vxx-*-handle.md`
5. 根目录 `README.md`

必要时更新：

1. `docs/plan/decisions/*.md`
2. `docs/plan/skill/*.md`
3. `docs/design/*.md`

更新要求：

1. 设计发生变化时，通常先更新或新增决策，再同步正式设计文档；如果用户明确要求某次调整不计入 decisions，则不修改 `docs/plan/decisions`。
2. 验证、复盘、决策记录判断、skill 沉淀、手搓步骤生成是每次 vibe coding 开发完成后的自动动作，不需要用户单独发命令触发。
3. 复杂通用能力沉淀为 skill。
4. 使用既有 skill 时，如果发现流程已经失效、遗漏关键步骤、与当前项目规则不一致，或本次问题解决后改变了正确流程，必须在问题解决后自动更新对应 skill。
5. skill 更新应说明失效原因、修正后的流程、适用场景和检查清单变化，避免后续继续复用错误流程。
6. 每次新增或修改文件后，自动检查 `.gitignore` 是否需要更新，并记录 `.gitignore` 更新结果。
7. 每次开发完成前，自动检查准备纳入 Git 的文件是否存在敏感信息，并记录敏感信息检查结果。
8. 版本开发完成后必须同步更新根目录 `README.md`，包括项目结构、已完成功能、技术栈、运行方式、发布方式、文档入口和当前状态。
9. 修改代码、业务流程、模块边界、技术栈、部署方式、CI/CD 规则或安全规则时，也必须同步检查并更新根目录 `README.md`。
10. 手搓步骤要能让开发者按命令和关键代码还原实现。
11. 面试点要简洁，问题具有代表性，回答能直接用于表达项目价值。
