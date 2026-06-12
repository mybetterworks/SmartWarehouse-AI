# SmartWarehouse-AI 开发提示词系统总目标

## 1. 根目标

SmartWarehouse-AI 是一个面向制造执行与仓储物流协同场景的个人实践项目。项目通过最小 MVP 闭环验证分布式微服务、前后端独立协作、AI 应用集成、K8s 兼容部署、阿里弹性容器正式发布和制品库管理能力。

本文件是 `docs/plan` 提示词系统的根文件。后续开发时，应先阅读本文，再结合 `PROGRESS.md` 判断当前版本状态，并进入 `milestones` 中对应版本文件执行开发、测试、验收、复盘和文档更新。

正式设计依据以 `docs/design` 下文档为准：

- `docs/design/software-requirements-specification.md`
- `docs/design/high-level-design.md`
- `docs/design/detailed-design.md`
- `docs/design/database-design.md`
- `docs/design/element-plus-wrapper-guide.md`

当前 `docs/design` 的架构、业务、接口、数据库和前端组件要求已经按 V01-V08 的职责拆分沉淀到 `docs/plan/milestones` 下各版本文件。日常开发某个版本时，直接以当前 milestone 的“版本开发输入边界”和版本说明为开发输入，不再重复读取 `docs/design`，避免 token 浪费和版本边界不清。只有发生正式设计变更、发现 milestone 与正式设计矛盾，或用户明确要求追溯设计来源时，才回到 `docs/design` 查证并同步更新。

## 2. 项目总目标

1. 构建一个完整的制造执行与仓储协同业务闭环。
2. 使用 Java + Spring Cloud Alibaba 实现平台、系统权限、仓储、生产、任务统计等微服务。
3. 使用 Python + LangChain 实现 RAG、Prompt、多 Agent、MCP、ChatBI 等 AI 能力。
4. 使用 Vue + Element Plus 实现甲方平台前端和多个乙方业务前端。
5. 使用 Redis、RabbitMQ、WebSocket、Seata、Dubbo、Nginx、K8s、Jenkins、阿里弹性容器等技术验证分布式工程能力和持续交付能力。
6. 使用阿里云效 Maven / npm release 与 snapshot 制品库管理依赖。
7. 形成可演示、可运行、可复盘、可用于简历项目经历的工程成果。

## 3. 当前规划功能

### 3.1 平台与系统能力

- Gateway 统一入口、鉴权、路由、限流、熔断。
- sys-service 用户登录、退出、刷新 Token。
- 用户、角色、菜单、部门、岗位、字典管理。
- 登录风控：连续失败 3 次后启用随机拼图验证码。
- 操作日志、登录日志、风控记录。
- 数据权限：仓库管理员只能查看自己负责的仓库，不同角色看到不同菜单。

### 3.2 仓储 WMS 能力

- 物料管理。
- 仓库、库区、库位管理。
- 入库单、出库单管理。
- 库存批次和库存流水。
- 安全库存预警。
- 离线上传入库数据。
- 高并发库存预扣和幂等处理。

### 3.3 生产 MES 能力

- 创建工单。
- 绑定工单所需物料。
- 提交物料申请。
- 查看物料是否已分配。
- 查看配送状态。

### 3.4 任务统计能力

- 定时任务。
- 运营统计。
- 实时排行。
- 安全库存预警推送。
- 异步补偿和事件消费记录。

### 3.5 AI 能力

- RAG 知识库问答。
- Prompt 工程。
- 多 Agent 协同。
- MCP 工具调用。
- ChatBI 自然语言查询业务数据。
- 向量数据库检索。

### 3.6 前端能力

- `frontend-platform/apps/portal-shell` 统一登录入口和门户基座。
- `frontend-platform/apps/sys-web` 系统管理页面。
- `wms-web` 仓储业务页面。
- `mes-web` 生产业务页面。
- `ai-web` AI 助手页面。
- 甲方平台 npm 包：`platform-ui`、`platform-sdk`、`platform-theme`、`platform-types`。

V01 已补强 `frontend-platform` 组件库，当前平台包覆盖：

- 门户与登录：`PlatformLayout`、`SideMenu`、`BreadcrumbNav`、`UserDropdown`、`LoginForm`、`JigsawCaptcha`。
- 页面与表单：`PlatformPage`、`PlatformSearchForm`、`PlatformForm`、`PlatformModalForm`、`DrawerForm`。
- 数据展示：`PlatformTable`、`BatchOperationBar`、`StatusTag`、`DictTag`。
- 选择器：`DictSelect`、`UserSelect`、`OrgTreeSelect`、`WarehouseSelect`、`LocationTreeSelect`、`MaterialSelect`、`WorkOrderSelect`。
- 文件导入导出：`FileUpload`、`ExcelImport`、`ExcelExport`、`UploadProgress`、`ImportTaskPanel`、`ImportErrorTable`。
- WMS / MES 业务：`MaterialRequirementEditor`、`ApplyStatusTimeline`、`DeliveryStatusSteps`。
- Task 运营看板：`DashboardGrid`、`StatCard`、`RankList`、`AlertPanel`、`RealtimeBadge`。
- AI 工作台：`ChatPanel`、`PromptInput`、`MarkdownRenderer`、`ChatBIResultTable`、`SqlPreview`、`AgentStepTimeline`、`ToolCallTrace`。
- SDK 与类型：业务选项 mock 源、WebSocket 客户端、`useWebSocketClient`、导航/登录风控/导入任务/看板/AI 类型。

V01 已将 `frontend-platform/apps/docs` 重构为企业级组件文档站，当前公开入口固定为两类：

- 组件：使用 `/component/overview` 作为入口，参考 Element Plus 组件站的信息架构，按组件级别展示与业务无关的基础、布局、数据录入、数据展示、反馈与流程、高级组件，提供左侧组件分类、中间文档正文、右侧 CONTENTS 锚点、组件总览和核心组件详情。
- 场景模板：使用 `/scenario/overview` 作为入口，承载原组件页中“大块功能组合展示”的价值，展示登录风控、标准查询表格、Schema 表单、业务选择器、离线导入、物料需求流程、运营看板和 AI 工作台等多组件组合模板。

此前预设式 `/playground` 只能静态切换固定示例，不能达到 Element Plus 官网那种在线编辑代码并实时预览的真实调试体验，已从公开导航、路由、组件代码和元数据中删除。后续只有在明确引入 `@vue/repl`、浏览器 import map、平台包 ESM 静态资源和沙箱预览能力，并能稳定验收实时编辑效果时，才恢复 Playground。

`组件` 和 `场景模板` 必须复用同一套自定义文档总览展示代码，当前由 `apps/docs/src/componentCatalog.ts` 提供组件级目录和场景模板目录元数据，由 `apps/docs/src/CatalogOverview.vue` 统一渲染总览、分组、卡片和状态说明，避免修改组件展示规则时在多个页面重复调整。

`组件` 入口必须保持单组件文档边界：每个 `/component/<slug>` 页面只展示一个底层组件的样式预览、Vue + TypeScript 示例代码、Props、Events、Slots、Types、注意事项和关联场景模板。多组件组合不得继续放在组件详情页；原 `/component/business-selects`、`/component/dashboard`、`/component/ai-workbench` 等组合路径仅保留迁移提示，正文迁移到 `/scenario/*`。

`场景模板` 入口必须保持组合模板边界：每个 `/scenario/<slug>` 页面可以组合多个平台组件，但需要明确列出底层组件并链接回对应 `/component/<slug>` 单组件文档。当前详情页由 `apps/docs/src/ComponentDetail.vue`、`apps/docs/src/componentDocs.ts`、`apps/docs/src/ScenarioTemplateDetail.vue` 和 `apps/docs/src/scenarioTemplateDocs.ts` 分别维护，避免单组件 API 文档与组合模板说明互相污染。

旧的首页、业务场景样例和发布说明不再作为公开模块出现；根路径和旧路径仅作为兼容入口跳转到新的组件或场景模板模块。

组件详情页示例代码统一使用 Vue + TypeScript SFC 片段，标题标注为 `示例代码（Vue + TypeScript）`；文档 Demo 外框保持统一宽度，窄组件通过内部居中容器控制自身尺寸，AI / BI / SQL / Agent / MCP 等长内容组件必须在文档容器内正常换行且不横向溢出。

## 4. 技术栈

| 类型 | 技术 |
|---|---|
| Java 后端 | JDK 17、Spring Boot、Spring Cloud Alibaba、Nacos、Sentinel |
| 安全认证 | Spring Security、JWT、Token 黑名单、数据权限 |
| 数据库 | MySQL、Flyway 或 Liquibase |
| 缓存 | Redis、Lua、分布式锁、排行榜 |
| 消息 | RabbitMQ、重试、死信、消费幂等 |
| 分布式事务 | Seata |
| RPC / 接口 | Dubbo 或 REST、`*-api` 接口契约 |
| 实时推送 | WebSocket |
| 前端 | Vue、Vite、TypeScript、Element Plus、Pinia、Vue Router |
| 前端底座 | `frontend-platform`、`@smartwarehouse/*` npm 包 |
| AI | Python、FastAPI、LangChain、RAG、多 Agent、MCP、ChatBI、Vector DB |
| 测试环境发布 | Jenkins、本地 Docker / Docker Compose 测试环境 |
| 正式环境发布 | 阿里弹性容器、Nginx、K8s 兼容部署设计 |
| 制品 | 阿里云效 Maven release/snapshot、阿里云效 npm release/snapshot |

## 5. 项目结构约定

项目根目录就是开发根目录，各一级目录按独立项目开发、构建、测试和发布。

```text
SmartWarehouse-AI
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

甲方维护：

- `platform`
- `gateway`
- `sys`
- `task`
- `frontend-platform`

乙方维护：

- `wms`
- `mes`
- `ai`
- `wms-web`
- `mes-web`
- `ai-web`

## 6. 开发节奏约定

后续版本开发按真实商用项目协作方式推进，不再采用“先全部后端、再统一前端、最后部署”的方式。

总体顺序：

```text
甲方组件库二次开发
  -> 甲方前后端基座开发
  -> 乙方各自前后端项目开发
  -> 多乙方交互业务开发
```

开发规则：

1. 每开发一个业务模块，都必须同时考虑后端服务、前端页面、接口联调、测试发布和正式发布。
2. `wms` 与 `wms-web` 在同一版本形成 WMS 可演示闭环。
3. `mes` 与 `mes-web` 在同一版本形成 MES 可演示闭环。
4. `ai` 与 `ai-web` 在同一版本形成 AI 可演示闭环。
5. `task` 的统计、排行、预警能力与运营看板或门户页面在同一版本形成可演示闭环。
6. Jenkins 和阿里弹性容器不放到最后才接入；从甲方基座版本开始，每个后续版本都要考虑测试环境和正式环境发布。

发布节奏：

| 环境 | 负责人 | 发布方式 | 使用场景 |
|---|---|---|---|
| 测试环境 | Jenkins | 本地构建、自动测试、Docker 测试环境发布 | 每个版本开发完成后的测试验证 |
| 正式环境 | 阿里弹性容器 | 构建正式镜像并部署正式版本 | 每个版本验收通过后的正式演示 |

## 7. 开发推荐指令

本节只保留需要用户主动发起的开发类指令。验证、复盘、更新决策、沉淀 skill、生成手搓步骤属于 vibe coding 每次开发完成后的自动收尾动作，不需要用户额外发送独立命令。

### 7.1 开发下个版本

```text
请根据 docs/plan/ROADMAP.md、docs/plan/DEVELOPMENT_RULE.md、docs/plan/PROGRESS.md 和当前 TODO 的 milestone，开发下一个版本。
要求：
1. 先检查当前进度和当前 TODO milestone 的版本开发输入边界；不要重复读取 docs/design，除非发现设计冲突或用户明确要求。
2. 只实现当前版本范围内的功能。
3. 如果当前版本包含业务模块，必须同时完成该模块后端、前端、接口联调和验收页面。
4. 完成后运行自动测试、必要启动验证、Jenkins 测试环境验证和阿里弹性容器正式环境发布检查。
5. 更新当前 milestone 的实现记录。
6. 更新对应 study 和 handle 文件。
7. 更新 PROGRESS.md 和根目录 README.md。
8. 自动执行验证、复盘、决策记录判断、skill 检查与更新、手搓步骤更新。
9. 如使用过的 skill 流程失效或因本次问题解决发生变化，必须在问题解决后同步更新对应 skill。
10. 自动检查并更新 `.gitignore`，确保新增的构建产物、临时文件、IDE 文件、日志、密钥文件和本地配置不会进入 Git。
11. 自动检查本次准备纳入 Git 的文件是否存在隐私、敏感数据、账号、密码、token、API Key、私钥或内部地址；如存在，必须改为统一配置、环境变量、Secret、Jenkins 凭证或示例模板管理。
12. 如产生重大设计取舍，按用户要求判断是否新增或更新 decisions 文件。
13. 开发代码时必须增加详细中文注释，覆盖类/组件、方法/函数、关键流程和关键代码行，说明业务含义、设计原因和注意事项，便于学习和手动复现。
```

### 7.2 继续当前版本

```text
请读取 docs/plan/PROGRESS.md，继续当前 IN_PROGRESS 版本的开发。先检查已完成内容和当前 milestone 的版本开发输入边界，再补齐未完成任务。除非发现设计冲突或用户明确要求，不要重复读取 docs/design。完成后自动执行验证、复盘、决策记录判断、skill 检查与更新、.gitignore 更新、敏感信息检查、README 更新、手搓步骤更新，并更新对应 milestone、study、handle、PROGRESS.md 和根目录 README.md。
```

### 7.3 自动收尾动作

以下动作不作为用户手动命令，而是每次版本开发、继续开发、问题修复完成后自动执行：

1. 自动验证当前版本：按当前 milestone 的“自动测试提示词”和“验收操作过程”执行功能验证、前后端联调验证、Jenkins 测试环境发布验证和阿里弹性容器正式环境发布检查。
2. 自动复盘当前版本：更新对应 study 文件中的关键技术点、开发经验、面试题、简洁回答和可继续深入方向。
3. 自动判断是否更新决策：如果产生重大业务或技术取舍，按用户当前要求判断是否写入 `docs/plan/decisions`；用户明确要求不计入 decisions 时，不修改 decisions。
4. 自动沉淀或更新 skill：如果出现复杂通用问题，新增或更新 `docs/plan/skill` 下的 skill；如果使用既有 skill 时发现流程失效、不完整或已被本次实现改变，必须在问题解决后同步修正该 skill。
5. 自动更新 `.gitignore`：每次新增项目、模块、构建脚本、依赖目录、日志目录、本地配置或密钥文件时，检查 `.gitignore` 是否需要补充，并在当前开发任务中同步更新。
6. 自动检查敏感信息：检查准备纳入 Git 的文件是否包含密码、token、API Key、私钥、`.npmrc` 凭证、数据库连接串、Jenkins 凭证、阿里云密钥、LLM Key 或个人隐私；发现后改为统一配置或示例模板。
7. 自动更新根目录 README：版本开发完成、代码结构变化、业务功能变化、技术栈变化、部署方式变化或重要开发规则变化时，必须同步更新根目录 `README.md`。
8. 自动生成手搓步骤：更新对应 handle 文件，补充环境准备、命令、关键代码位置、核心代码片段、验证命令、常见错误和手动还原步骤。

## 8. 提示词系统运行规则

1. 每次开发前先读 `ROADMAP.md`、`DEVELOPMENT_RULE.md`、`PROGRESS.md`。
2. 根据 `PROGRESS.md` 找到当前版本或下一个版本。
3. 按对应 milestone 的范围开发，不跨版本扩张功能；当前 milestone 已包含该版本需要的设计、架构、接口和数据库信息。
4. 每个版本完成后必须可演示或可运行。
5. 每个版本完成后必须更新 milestone、study、handle、`PROGRESS.md` 和根目录 `README.md`。
6. 从甲方基座版本开始，每个版本都要保留 Jenkins 测试发布和阿里弹性容器正式发布的验证记录。
7. 有重大取舍时通常写入 `decisions`；如果用户明确要求某次调整不计入 decisions，则只更新计划文档。
8. 有可复用复杂经验时优先沉淀到 `skill`。
9. 使用既有 skill 发现流程失效、遗漏关键步骤或与当前项目规则不一致时，先解决当前问题，再立即更新对应 skill，确保后续仍正确可用。
10. 每次开发新增文件后都要自动评估 `.gitignore`，避免构建产物、依赖目录、本地配置、日志和密钥文件被提交。
11. 每次开发完成前都要自动做敏感信息检查；发现敏感信息时，先迁移到环境变量、Nacos、Secret、Jenkins 凭证、阿里弹性容器环境配置或 `.example` 模板，再继续验收。
12. 版本开发完成或修改代码、业务、架构、部署、技术栈时，必须同步更新根目录 `README.md`，保证项目入口说明与当前实现一致。
13. 正式设计以 `docs/design` 下文件为准，`docs/plan/milestones` 是按版本拆分后的开发输入；常规版本开发优先读 milestone，正式设计变更才回写或追溯 `docs/design`。
14. 每次新增或修改代码时，都要检查学习友好型中文注释是否充分：类/组件说明职责，方法/函数说明输入输出和业务意图，关键代码行说明设计原因、风险点和对应业务规则。
