# SmartWarehouse-AI 开发总进度

## 1. 当前阶段

当前阶段：提示词系统初始化后，开发计划已按真实商用项目节奏重排。

已完成：

- `docs/design` 已作为设计文档目录，并采用扁平存储。
- 已形成软件需求规格说明书、概要设计说明书、详细设计说明书、数据库设计说明书和前端组件封装说明。
- 已初始化 `docs/plan` 提示词开发体系。
- 已调整开发顺序：先甲方组件库，再甲方前后端基座，再乙方各自前后端模块，最后多乙方交互业务。
- 已将 `docs/design` 中的架构、业务功能、接口设计、数据库设计、前端组件、K8s、多实例、Jenkins、阿里弹性容器等要求按 V01-V08 拆分沉淀到各 milestone。
- 后续开发具体版本时，直接读取当前 milestone，不再重复读取 `docs/design`，除非发生设计冲突、正式设计变更或用户明确要求追溯。
- 本次计划调整按用户要求不写入 `decisions`。

## 2. 当前版本

| 项目 | 当前值 |
|---|---|
| 当前版本 | V02 |
| 当前状态 | TODO |
| 当前任务 | 甲方前后端基座开发与 CI/CD 基线 |
| 对应文件 | `milestones/V02-owner-platform-base-cicd.md` |

## 3. 版本总览

| 版本 | 文件 | 状态 | 目标 |
|---|---|---|---|
| V01 | `milestones/V01-owner-component-library.md` | DONE | 甲方组件库二次开发，初始化最小项目骨架，发布平台 npm snapshot 包 |
| V02 | `milestones/V02-owner-platform-base-cicd.md` | TODO | 甲方前后端基座，完成 platform/gateway/sys/portal-shell/sys-web，并接入 Jenkins 与阿里弹性容器基线 |
| V03 | `milestones/V03-wms-fullstack-basic.md` | TODO | WMS 乙方前后端模块，完成 wms + wms-web 的物料、仓库、库存、入库出库、离线上传闭环 |
| V04 | `milestones/V04-mes-fullstack-basic.md` | TODO | MES 乙方前后端模块，完成 mes + mes-web 的工单、物料需求、物料申请、配送状态闭环 |
| V05 | `milestones/V05-ai-fullstack-basic.md` | TODO | AI 乙方前后端模块，完成 ai + ai-web 的 RAG、ChatBI、多 Agent、MCP 最小闭环 |
| V06 | `milestones/V06-task-ops-fullstack.md` | TODO | 甲方 task 运营模块全栈能力，完成 task 后端、运营看板、实时排行、预警、WebSocket |
| V07 | `milestones/V07-cross-vendor-mes-wms-task.md` | TODO | 多乙方交互业务，完成 MES 物料申请、WMS 库存分配、task 统计排行与预警联动 |
| V08 | `milestones/V08-ai-business-release-hardening.md` | TODO | AI 与业务服务交互、正式发布加固、可观测性、阿里弹性容器正式演示 |

状态说明：

```text
TODO        未开始
IN_PROGRESS 开发中
VERIFYING   验证中
DONE        已完成
BLOCKED     阻塞
```

## 4. 开发节奏

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

约束：

1. 每个业务模块都按前后端一起开发和验收。
2. 从 V02 开始，每个版本都要保留 Jenkins 测试环境发布记录。
3. 从 V02 开始，每个版本都要保留阿里弹性容器正式环境发布检查记录。
4. 不再采用“全部后端完成后再统一开发前端”的节奏。
5. 不再把部署能力放到最后一个版本才接入。

## 5. 下一步开发计划

下一步从 V02 开始：

```text
请根据 docs/plan/ROADMAP.md、docs/plan/DEVELOPMENT_RULE.md、docs/plan/PROGRESS.md 和 docs/plan/milestones/V02-owner-platform-base-cicd.md，开发 V02 甲方前后端基座开发与 CI/CD 基线版本。开发时直接使用 V02 milestone 中的版本开发输入边界，不要重复读取 docs/design，除非发现设计冲突或用户明确要求。
```

V02 完成后需要更新：

- `PROGRESS.md`
- `milestones/V02-owner-platform-base-cicd.md`
- `study/V02-owner-platform-base-cicd-study.md`
- `handle/V02-owner-platform-base-cicd-handle.md`
- 根目录 `README.md`

## 6. 进度记录模板

每次版本推进后，按以下格式追加记录：

```text
日期：
版本：
状态：
完成内容：
前端完成内容：
后端完成内容：
接口联调结果：
Jenkins 测试发布结果：
阿里弹性容器正式发布检查：
.gitignore 更新结果：
敏感信息检查结果：
README 更新结果：
验证结果：
遗留问题：
下一步：
相关决策：
相关 skill：
```

## 7. 实现记录

### 2026-06-11 提示词系统初始化

状态：DONE

完成内容：

- 初始化 `docs/plan` 目录结构。
- 创建 ROADMAP、DEVELOPMENT_RULE、PROGRESS、milestones、decisions、skill、study、handle 文档体系。

验证结果：

- 已完成文件结构和关键词验证。

### 2026-06-11 开发计划重排

状态：DONE

完成内容：

- 调整开发顺序为甲方组件库、甲方前后端基座、乙方各自前后端模块、多乙方交互业务。
- 明确每个业务模块必须前后端同步开发和验收。
- 明确 Jenkins 负责测试环境，本地构建测试发布。
- 明确阿里弹性容器负责正式环境部署和正式版本演示。
- 按用户要求，本次调整不写入 `docs/plan/decisions`。

下一步：

- 开始 V01 甲方组件库二次开发与最小项目骨架。

### 2026-06-11 milestone 开发输入补全

状态：DONE

完成内容：

- 将 `docs/design` 下正式设计文档中的项目架构、业务功能、接口设计、数据库设计、前端组件封装、K8s 多实例、Jenkins 和阿里弹性容器要求拆分到 V01-V08 milestone。
- 每个 milestone 都补充了版本开发输入边界，明确后续开发该版本时不需要重复读取 `docs/design`。
- 每个 milestone 都补充了代码架构、业务功能、接口设计、数据库设计、前端页面、测试、验收和发布检查要求。
- 同步调整 ROADMAP、DEVELOPMENT_RULE、PROGRESS 和版本拆分决策说明，避免提示词入口与 milestone 说明不一致。

下一步：

- 开始 V01 甲方组件库二次开发与最小项目骨架。

### 2026-06-11 V01 甲方组件库二次开发完成

版本：V01

状态：DONE

完成内容：

- 完成 SmartWarehouse-AI 最小根目录骨架，占位保留 `deploy`、`platform`、`gateway`、`sys`、`task`、`mes`、`wms`、`ai`、`wms-web`、`mes-web`、`ai-web`。
- 完成 `frontend-platform` pnpm workspace。
- 完成 `@smartwarehouse/platform-types`、`@smartwarehouse/platform-sdk`、`@smartwarehouse/platform-theme`、`@smartwarehouse/platform-ui`。
- 完成 `frontend-platform/apps/docs` VitePress 组件文档与演示站点。

前端完成内容：

- 封装 PlatformPage、PlatformSearchForm、PlatformTable、PlatformModalForm、PermissionButton、DictSelect、UserSelect、OrgTreeSelect、FileUpload、ExcelImport、ExcelExport、StatusTag。
- SDK 提供 request、runtime config、token、permission、dict mock 能力。
- 主题包提供 CSS Variables 和 Element Plus 覆盖。
- 类型包提供统一响应、分页、用户、菜单、模块注册、字典和表格类型。

后端完成内容：无，V01 不开发 Java / Python 后端。

接口联调结果：本版本使用 mock，不接入真实后端接口。

Jenkins 测试发布结果：V01 仅完成组件制品构建；Jenkins 从 V02 正式接入。

阿里弹性容器正式发布检查：V01 不部署正式服务，仅完成 npm 制品 dry-run 检查。

.gitignore 更新结果：

- 已补充 `.vitepress/cache/`、`.vitepress/dist/`、`.pnpm-store/`、`*.tgz`、`pnpm-debug.log*`。
- `node_modules/`、`dist/`、日志、`.npmrc`、`.env`、证书密钥和本地配置均已忽略。

敏感信息检查结果：

- 未发现真实账号、密码、token、API Key、私钥或内部地址。
- 命中项均为 `.npmrc.example` 环境变量占位符、文档安全说明、SDK 字段命名或 pnpm-lock 包名。

README 更新结果：已同步根目录 README，补充 V01 已完成内容和 V02 下一步。

验证结果：

- `corepack pnpm install` 成功。
- `corepack pnpm build` 成功。
- `corepack pnpm --filter @smartwarehouse/platform-ui publish --dry-run --no-git-checks` 成功，tarball 包含类型声明。
- 浏览器访问 `http://localhost:5173/` 验证通过，组件演示页面渲染正常。

遗留问题：

- V01 不接真实后端、不接 Jenkins、不部署阿里弹性容器，按 milestone 约束留到 V02 及后续版本。
- VitePress 构建存在第三方依赖注释和 chunk 大小提示，不影响构建结果。

下一步：

- 开始 V02 甲方前后端基座开发与 CI/CD 基线。

相关决策：无新增重大设计取舍，不新增 decisions。

相关 skill：

- 使用并更新 `docs/plan/skill/vue-element-plus-module-skill.md`。
- 使用 `docs/plan/skill/gitignore-secret-scan-skill.md`，流程仍有效，无需修改。

### 2026-06-11 V01 组件库后续组件补强完成

版本：V01

状态：DONE

完成内容：

- 在当前 V01 内补齐后续 V02-V08 会复用的平台组件，不新开版本，不改变 V02 作为下一版本的状态。
- `platform-types` 增加导航、登录风控、表单 schema、导入任务、工单物料、统计排行、预警、AI 消息、ChatBI、Agent、MCP 工具调用和 WebSocket 消息类型。
- `platform-sdk` 增加用户、组织、仓库、库位、物料、工单 mock 选项源，以及 WebSocket 客户端。
- `platform-ui` 增加门户登录、表单表格、业务选择器、WMS/MES、Task 看板、AI 工作台组件，并提供默认 `install(app)` 插件入口。
- `apps/docs` 组件演示页和组件规范文档已按门户、表单、WMS、MES、Task、AI 分组更新。

前端完成内容：

- 新增门户与登录组件：PlatformLayout、SideMenu、BreadcrumbNav、UserDropdown、LoginForm、JigsawCaptcha。
- 新增/增强页面与数据组件：PlatformForm、DrawerForm、BatchOperationBar、DictTag、增强 PlatformTable。
- 新增业务选择器：WarehouseSelect、LocationTreeSelect、MaterialSelect、WorkOrderSelect。
- 新增 WMS/MES 组件：UploadProgress、ImportTaskPanel、ImportErrorTable、MaterialRequirementEditor、ApplyStatusTimeline、DeliveryStatusSteps。
- 新增 Task/AI 组件：DashboardGrid、StatCard、RankList、AlertPanel、RealtimeBadge、ChatPanel、PromptInput、MarkdownRenderer、ChatBIResultTable、SqlPreview、AgentStepTimeline、ToolCallTrace。

后端完成内容：无，V01 仍只处理甲方前端组件库。

接口联调结果：使用 SDK mock 数据源，不接入真实后端；组件 API 为后续 Gateway 接口预留。

Jenkins 测试发布结果：V01 不接入 Jenkins，V02 开始正式记录。

阿里弹性容器正式发布检查：V01 不部署正式服务；本次通过 npm dry-run 验证制品可发布。

.gitignore 更新结果：

- 已检查新增构建产物和缓存目录，现有 `.gitignore` 已覆盖 `node_modules/`、`dist/`、`.vitepress/cache/`、`.vitepress/dist/`、`.pnpm-store/`、`*.tgz`、日志、`.npmrc`、`.env` 和密钥文件。
- 本次无需新增 `.gitignore` 规则。

敏感信息检查结果：

- 未发现真实账号、密码、token、API Key、私钥或内部地址。
- 命中项为文档安全规则、占位符、SDK 字段名、登录表单字段、`.npmrc.example` 环境变量占位符和 pnpm-lock 包名。

README 更新结果：本次用户要求更新 `docs/plan` 相关文档，未改动根目录 README。

验证结果：

- `corepack pnpm build:packages` 成功。
- `corepack pnpm build` 成功。
- `corepack pnpm publish:dry-run` 成功，四个平台包均可 dry-run 发布。
- 浏览器访问 `http://127.0.0.1:5173/` 验证通过，关键分组文本全部存在，控制台无 error。

遗留问题：

- VitePress 构建仍存在第三方依赖 `#__PURE__` 注释提示和 chunk 大小提示，不影响构建结果。
- 组件仍以 mock 数据演示，真实接口接入留到 V02 及后续业务版本。

下一步：

- 继续 V02 甲方前后端基座开发与 CI/CD 基线。

相关决策：无新增重大设计取舍，不新增 decisions。

相关 skill：

- 使用并更新 `docs/plan/skill/vue-element-plus-module-skill.md`，补充新增组件必须维护入口导出、默认 install 表和文档站构建验证。
- 使用 `docs/plan/skill/gitignore-secret-scan-skill.md`，流程仍有效，无需修改。

### 2026-06-11 V01 组件文档与 Playground 体系完成

版本：V01

状态：DONE

完成内容：

- 以架构师视角评估平台组件演示页，确认单一综合演示页不能替代正式组件文档和 Playground。
- 确定 `frontend-platform/apps/docs` 采用首页、组件总览、组件详情、Playground、业务场景样例的四层文档结构。
- 新增组件目录元数据 `componentCatalog.ts`，集中维护组件分类、说明、业务场景和详情链接。
- 新增类似组件库官网的组件总览页，按门户与登录、页面与表单、数据展示、业务选择器、文件导入导出、WMS/MES、Task、AI 分类。
- 新增 Playground，支持标准表格、登录风控、WMS 导入、AI ChatBI 四个可调参数场景。
- 将原综合演示页迁移为业务场景样例，用于整体验收。
- 新增 9 个核心组件/分类详情页，包含效果预览、示例代码、Props、Events、Slots 和注意事项。
- 新增决策 `0004-component-docs-and-playground-structure.md`。

前端完成内容：

- 修改 `apps/docs/index.md` 为文档站首页。
- 重写 `apps/docs/components.md` 为组件总览入口。
- 新增 `apps/docs/playground.md`、`apps/docs/examples.md`。
- 新增 `apps/docs/components/*.md` 核心详情页。
- 更新 `.vitepress/config.ts` 的 nav/sidebar。
- 更新 `.vitepress/theme/style.css` 的文档站样式。

后端完成内容：无。

接口联调结果：本次为文档站和 Playground，不接入真实后端。

Jenkins 测试发布结果：V01 不接入 Jenkins，V02 开始记录。

阿里弹性容器正式发布检查：V01 不部署正式服务；npm dry-run 发布检查通过。

.gitignore 更新结果：

- 已检查 `.vitepress/cache/`、`.vitepress/dist/`、`node_modules/`、`dist/` 等构建产物已被现有 `.gitignore` 覆盖。
- 本次无需新增 `.gitignore` 规则。

敏感信息检查结果：

- 未发现真实账号、密码、token、API Key、私钥或内部地址。
- 命中项为文档安全规则、占位符、SDK 字段名、登录表单字段、`.npmrc.example` 环境变量占位符和 pnpm-lock 包名。

README 更新结果：本次用户要求调整 `docs/plan` 下相关文档，未改动根目录 README。

验证结果：

- `corepack pnpm build` 成功。
- `corepack pnpm publish:dry-run` 成功。
- HTTP 检查确认 `/`、`/components`、`/playground`、`/examples` 返回 200。
- 浏览器插件访问 localhost 被浏览器侧 `ERR_BLOCKED_BY_CLIENT` 拦截，未强行绕行。
- VitePress 静态构建产物关键词检查全部通过：首页、组件总览、Playground、业务样例、PlatformTable 详情、AI 工作台详情均包含预期内容。

遗留问题：

- VitePress 构建仍有第三方依赖注释提示和 chunk 大小提示，不影响构建结果。
- 组件详情页目前覆盖核心组件和分类页，非核心组件仍在总览中说明；后续新增组件时按决策 0004 持续补齐。

下一步：

- 继续 V02 甲方前后端基座开发与 CI/CD 基线。

相关决策：

- 新增 `docs/plan/decisions/0004-component-docs-and-playground-structure.md`。

相关 skill：

- 使用并更新 `docs/plan/skill/vue-element-plus-module-skill.md`，补充组件文档站四层结构、文档详情页、Playground 和静态产物验证规则。
- 使用 `docs/plan/skill/gitignore-secret-scan-skill.md`，流程仍有效，无需修改。

### 2026-06-11 V01 企业组件文档站两模块重构完成

版本：V01

状态：DONE

完成内容：

- 将 `frontend-platform/apps/docs` 从项目演示型文档站重构为企业级自定义组件库文档站。
- 公开模块只保留 `组件` 和 `Playground`。
- 新增 `/component/overview` 组件入口，采用左侧组件分类、中间文档正文、右侧 CONTENTS 的组件库官网结构。
- 新增 `/component/*` 核心组件详情页，覆盖 PlatformLayout、PlatformTable、PlatformForm、LoginForm、业务选择器、导入任务、物料流程、Dashboard 和 AI Workbench。
- 重构 `componentCatalog.ts`，补充 slug、group、docsPath、playgroundPreset、since、tags 等企业组件库元数据。
- 重构 Playground 为版本工具栏、代码编辑区、预设预览区的分栏工作台。
- 旧 `/`、`/components`、`/examples`、`/release` 路径仅保留兼容入口，不再作为公开模块。

前端完成内容：

- 更新 VitePress nav/sidebar，顶部公开导航仅保留“组件”和“Playground”。
- 更新 VitePress theme 样式，补充企业组件总览、组件索引、文档 Demo、API 表格、Playground 编辑器和预览区布局。
- 未修改 `@smartwarehouse/platform-ui`、`platform-sdk`、`platform-theme`、`platform-types` 的对外 API。

后端完成内容：无。

接口联调结果：本次为组件文档站重构，不接入真实后端。

Jenkins 测试发布结果：V01 不接入 Jenkins，V02 开始记录。

阿里弹性容器正式发布检查：V01 不部署正式服务；本次通过 npm dry-run 验证平台包发布流程仍可用。

.gitignore 更新结果：

- 已检查 `.gitignore`，现有规则已覆盖 `node_modules/`、`dist/`、`.vitepress/cache/`、`.vitepress/dist/`、`.npmrc`、`.env`、`*.tgz`、日志和密钥文件。
- 本次无需新增规则。

敏感信息检查结果：

- 未发现真实账号、密码、token、API Key、私钥或内部地址。
- 命中项均为文档安全规则、示例占位符或字段名。

README 更新结果：已同步根目录 README，补充 V01 当前文档站为“组件 + Playground”两模块结构。

验证结果：

- `corepack pnpm build:packages` 成功。
- `corepack pnpm build` 成功。
- `corepack pnpm publish:dry-run` 成功。
- `/component/overview`、`/component/platform-table`、`/playground` 路由 HTTP 检查通过。
- 浏览器桌面与移动端检查通过，组件页和 Playground 页面无明显文字重叠。

遗留问题：

- 当前 Playground 采用预设可运行模式，不使用 `@vue/repl` 真运行模式；原因是浏览器 import map 加载本地 workspace 私有包存在兼容风险。
- 后续如平台包发布到可浏览器访问的内部静态资源服务，可升级为 `@vue/repl` 模式。

下一步：

- 继续 V02 甲方前后端基座开发与 CI/CD 基线。

相关决策：

- `docs/plan/decisions/0004-component-docs-and-playground-structure.md` 已标记为 `SUPERSEDED`。
- 新增 `docs/plan/decisions/0005-enterprise-component-docs-two-module-structure.md`。

相关 skill：

- 使用并更新 `docs/plan/skill/vue-element-plus-module-skill.md`，将旧四层文档站流程修正为企业组件库两模块流程。
- 使用 `docs/plan/skill/gitignore-secret-scan-skill.md`，流程仍有效，无需修改。

### 2026-06-11 V01 组件文档站表格布局修复

版本：V01

状态：DONE

完成内容：

- 修复 VitePress 文档正文默认 Markdown 表格样式污染 Element Plus 内部表格的问题。
- 修复组件详情页中 Element Plus 表格标题行与第一行之间出现异常空白的问题。
- 修复 `MaterialRequirementEditor` 物料需求表格超出“基础用法”预览容器的问题。
- 调整 `PlatformTable` 文档示例列宽和操作列宽，保证在当前企业组件文档站内容宽度下完整展示状态列和操作列。

前端完成内容：

- 在 `apps/docs/.vitepress/theme/style.css` 中对 `.vp-doc .el-table` 内部 table、tr、th、td 做局部 reset，避免 VitePress Markdown 表格规则影响 Element Plus 表格。
- 在 `platform-ui` 中收紧 `MaterialRequirementEditor` 各列宽度，移除表头/表体强制横向滚动样式，使表格自然落入文档 Demo 容器。
- 更新 `/component/platform-table` 示例，使用适合文档容器的列宽和 `actions-width`。

后端完成内容：无。

接口联调结果：本次为组件文档站和组件样式修复，不接入真实后端。

Jenkins 测试发布结果：V01 不接入 Jenkins，V02 开始记录。

阿里弹性容器正式发布检查：V01 不部署正式服务；本次通过 npm dry-run 验证平台包发布流程仍可用。

.gitignore 更新结果：

- 已检查 `.gitignore`，现有规则已覆盖 `node_modules/`、`dist/`、`.vitepress/cache/`、`.vitepress/dist/`、`.npmrc`、`.env`、`*.tgz`、日志和密钥文件。
- 本次无需新增规则。

敏感信息检查结果：

- 未发现真实账号、密码、token、API Key、私钥或内部地址。
- 命中项均为文档安全规则、示例占位符、字段名、登录表单字段或 pnpm-lock 包名。

README 更新结果：已同步根目录 README，补充 V01 组件文档站表格布局已完成修复和验证。

验证结果：

- 浏览器验证 `/component/material-requirement-editor`：表头与第一行间距为 0，表格未超出基础用法容器，页面无横向溢出。
- 浏览器验证 `/component/platform-table`：表头与第一行间距为 0，状态列和操作列完整展示，表格未超出基础用法容器。
- `corepack pnpm build:packages` 成功。
- `corepack pnpm build` 成功。
- `corepack pnpm publish:dry-run` 成功，四个平台包均可 dry-run 发布。

遗留问题：

- VitePress 构建仍有第三方依赖 `#__PURE__` 注释提示和 chunk 大小提示，不影响构建结果。

下一步：

- 继续 V02 甲方前后端基座开发与 CI/CD 基线。

相关决策：无新增重大设计取舍，不新增 decisions。

相关 skill：

- 使用并更新 `docs/plan/skill/vue-element-plus-module-skill.md`，补充 VitePress Markdown 表格样式污染 Element Plus 表格的处理规则。
- 使用 `docs/plan/skill/gitignore-secret-scan-skill.md`，流程仍有效，无需修改。

### 2026-06-12 V01 组件文档站展示一致性与 TypeScript 示例规范修复

版本：V01

状态：DONE

完成内容：

- 修复 `LoginForm` 详情页“基础用法”示例外框宽度与其他组件不一致的问题：外层统一使用标准 `.sw-doc-preview`，登录表单通过内部居中容器控制自身宽度。
- 修复 `AI Workbench` 详情页“基础用法”示例内容超出外部方框的问题：为 AI 工作台、ChatBI、SQL、Agent、MCP 工具调用等长内容增加宽度约束和换行策略。
- 将组件详情页和 Playground 预设中的示例代码统一为 Vue + TypeScript 写法，示例标题统一标注为 `示例代码（Vue + TypeScript）`，代码块使用 `<script setup lang="ts">`。
- 修正 VitePress 文档主题中对 `pre` / `code` 的覆盖优先级，避免文档站默认代码样式覆盖组件内部长代码换行规则。

前端完成内容：

- 更新 `frontend-platform/apps/docs/component/login-form.md` 和兼容路径 `components/login-form.md`，将窄宽度控制从外层 Demo 容器迁移到 `.sw-doc-preview__center` 内部容器。
- 更新 `frontend-platform/apps/docs/component/ai-workbench.md` 和兼容路径 `components/ai-workbench.md`，补充 TypeScript 类型导入和适合文档容器的 ChatBI 列宽。
- 更新 `frontend-platform/packages/platform-ui/src/style.css`，补充 AI 工作台相关容器的 `min-width: 0`、`max-width: 100%`、`overflow-wrap` 和 `pre-wrap` 规则。
- 更新 `frontend-platform/apps/docs/.vitepress/theme/style.css`，补充文档站下 `.sw-doc-preview` 子元素收缩、居中容器、以及 AI 长代码块换行规则。
- 更新 `frontend-platform/apps/docs/component/*.md`、`frontend-platform/apps/docs/components/*.md` 和 `PlaygroundWorkbench.vue`，统一示例代码为 Vue + TypeScript SFC 片段。

后端完成内容：无。

接口联调结果：本次为组件文档站展示与示例代码规范修复，不接入真实后端。

Jenkins 测试发布结果：V01 不接入 Jenkins，V02 开始记录。

阿里弹性容器正式发布检查：V01 不部署正式服务；本次通过 npm dry-run 验证平台包发布流程仍可用。

.gitignore 更新结果：

- 已检查 `.gitignore`，现有规则已覆盖 `node_modules/`、`dist/`、`.vitepress/cache/`、`.vitepress/dist/`、`.npmrc`、`.env`、`*.tgz`、日志、密钥和本地配置文件。
- 本次无需新增规则。

敏感信息检查结果：

- 未发现真实账号、密码、token、API Key、私钥或内部地址。
- 命中项均为文档安全规则、示例占位符、字段名、登录表单字段或 pnpm-lock 包名。

README 更新结果：已同步根目录 README，补充 V01 组件文档站已完成展示一致性修复和 TypeScript 示例规范化。

验证结果：

- `corepack pnpm build` 成功。
- `corepack pnpm publish:dry-run` 成功，四个平台包均可 dry-run 发布；registry 登录提示为 dry-run 场景下的预期提示。
- 浏览器验证 `/component/login-form`：外层 Demo 容器宽度与其他组件一致，登录表单居中展示，页面无横向溢出，示例代码标题和代码块均标注 TypeScript。
- 浏览器验证 `/component/ai-workbench`：AI 工作台内容未超出基础用法容器，SQL / Agent / MCP 长代码内容在容器内换行，页面无横向溢出，示例代码标题和代码块均标注 TypeScript。
- 示例代码脚本检查通过：`component` 与 `components` 目录下 Vue 示例代码块均包含 `<script setup lang="ts">`，不存在未标注 TypeScript 的 `## 示例代码` 标题。

遗留问题：

- VitePress 构建仍有第三方依赖 `#__PURE__` 注释提示和 chunk 大小提示，不影响构建结果。
- `PlaygroundWorkbench.vue` 仍采用预设可运行模式；如后续接入稳定内网静态包服务，可再升级为 `@vue/repl` 真运行模式。

下一步：

- 继续 V02 甲方前后端基座开发与 CI/CD 基线。

相关决策：无新增重大设计取舍，不新增 decisions。

相关 skill：

- 使用并更新 `docs/plan/skill/vue-element-plus-module-skill.md`，补充组件详情页 Demo 外框一致性、AI 长内容换行、Vue + TypeScript 示例代码规范，以及 Playground 字符串中闭合 `script` 标签转义规则。
- 使用 `docs/plan/skill/gitignore-secret-scan-skill.md`，流程仍有效，无需修改。

### 2026-06-12 V01 企业组件文档站三入口重构完成

版本：V01

状态：DONE

完成内容：

- 将 `frontend-platform/apps/docs` 顶部公开导航调整为 `组件`、`场景模板`、`Playground` 三个一级入口。
- 将当前按大块功能组合展示的原“组件”页改名并迁移为 `场景模板`，入口为 `/scenario/overview`。
- 将新的 `组件` 页调整为业务无关的组件级目录，入口为 `/component/overview`，按基础、布局、数据录入、数据展示、反馈与流程、高级组件展示。
- `组件` 与 `场景模板` 复用 `CatalogOverview.vue` 总览展示组件，目录数据集中维护在 `componentCatalog.ts`，避免复制分组卡片和状态展示逻辑。
- 旧 `/examples`、`/components`、`/release` 等兼容入口不再作为公开导航模块。

前端完成内容：

- 更新 `apps/docs/src/componentCatalog.ts`，拆分 `componentCatalog` 与 `scenarioTemplateCatalog`，补齐用户要求的组件级分类与组件清单。
- 新增 `apps/docs/src/CatalogOverview.vue`，作为组件总览与场景模板总览的共享展示组件。
- 更新 `ComponentOverview.vue` 为纯组件级总览，新增 `ScenarioTemplateOverview.vue` 作为场景模板总览。
- 更新 `.vitepress/config.ts`，新增 `/scenario/` sidebar，顶部导航固定为三入口。
- 新增 `/scenario/overview.md`，更新 `/component/overview.md`、`index.md`、`components.md`、`examples.md`、`release.md` 的入口说明。

后端完成内容：无，本次为 V01 组件文档站信息架构修正。

接口联调结果：本次不接入真实后端接口，组件文档站继续使用 mock / preset 数据。

Jenkins 测试发布结果：V01 不接入 Jenkins，V02 开始正式记录测试环境发布。

阿里弹性容器正式发布检查：V01 不部署正式服务；通过 npm dry-run 验证平台包发布流程。

.gitignore 更新结果：

- 已检查现有 `.gitignore`，仍覆盖 `node_modules/`、`dist/`、`.vitepress/cache/`、`.vitepress/dist/`、`.npmrc`、`.env`、`*.tgz`、日志、密钥和本地配置文件。
- 本次无需新增 `.gitignore` 规则。

敏感信息检查结果：

- 未发现真实账号、密码、token、API Key、私钥或内部地址。
- 命中项为文档安全规则、示例占位符、字段名或依赖包名。

README 更新结果：已同步根目录 README，补充当前文档站为“组件 / 场景模板 / Playground”三入口结构，并说明 `组件` 与 `场景模板` 复用 `CatalogOverview.vue`。

验证结果：

- `corepack pnpm --filter @smartwarehouse/component-docs build` 成功。
- `corepack pnpm build` 成功。
- `corepack pnpm publish:dry-run` 成功。
- HTTP 检查 `/component/overview`、`/scenario/overview`、`/playground` 均返回 200。
- 浏览器验证 `/component/overview`、`/scenario/overview`、`/playground` 通过，顶部导航为 `组件`、`场景模板`、`Playground` 三入口。
- 浏览器全量组件目录检查通过：组件页 45 个组件均命中，基础、布局、数据录入、数据展示、反馈与流程、高级组件 6 个分类均命中。
- 浏览器全量场景模板目录检查通过：场景模板页 10 个模板均命中，平台基础模板、表单与列表模板、流程与长任务模板、看板与智能模板 4 个分类均命中。
- 浏览器移动端 390px 宽度检查通过，三个入口均无横向溢出。

遗留问题：

- 部分 `overview` 状态的单组件尚未拥有独立详情页，后续可逐步补齐。
- Playground 仍采用预设可运行模式，后续如有稳定内部静态资源服务，可评估升级为 `@vue/repl` 真运行模式。

下一步：

- 继续 V02 甲方前后端基座开发与 CI/CD 基线。

相关决策：

- `docs/plan/decisions/0005-enterprise-component-docs-two-module-structure.md` 标记为 `SUPERSEDED`。
- 新增 `docs/plan/decisions/0006-enterprise-component-docs-three-entry-structure.md`。

相关 skill：

- 使用并更新 `docs/plan/skill/vue-element-plus-module-skill.md`，将组件文档站流程修正为三入口结构，并补充 `CatalogOverview.vue` 与 `componentCatalog.ts` 复用规则。
- 使用 `docs/plan/skill/gitignore-secret-scan-skill.md`，流程仍有效，无需修改。

### 2026-06-12 V01 组件入口单组件详情边界重构完成

版本：V01

状态：DONE

完成内容：

- 将 `组件` 入口从“组件级目录但部分条目仍指向组合页面”修正为严格的单组件文档入口。
- 为 45 个组件补齐独立 `/component/<slug>` 路由，每个页面只展示一个底层组件的样式预览、Vue + TypeScript 示例代码、Props、Events、Slots、Types、注意事项和关联场景模板。
- 新增 `ComponentDetail.vue` 与 `componentDocs.ts`，集中维护单组件详情渲染和 API 元数据，避免每个组件 Markdown 页面重复写文档结构。
- 新增 `ScenarioTemplateDetail.vue` 与 `scenarioTemplateDocs.ts`，让 `/scenario/<slug>` 承载多组件组合模板、底层组件链接、模板示例和使用注意事项。
- 将旧组合组件路由 `/component/business-selects`、`/component/dashboard`、`/component/ai-workbench` 改为迁移提示页，正文迁移到 `/scenario/business-selects`、`/scenario/ops-dashboard`、`/scenario/ai-workbench`。
- 将旧 `/components/*` 兼容路径改为跳转提示，避免继续暴露旧组合正文。
- 修复此前 `componentCatalog.ts` 与 `.vitepress/config.ts` 中的中文乱码，恢复组件分类、导航、侧边栏和状态文案的 UTF-8 展示。

前端完成内容：

- 重写 `frontend-platform/apps/docs/src/componentCatalog.ts`，所有 `componentCatalog` 条目均指向 `/component/<slug>`，所有 `scenarioTemplateCatalog` 条目均指向 `/scenario/<slug>`。
- 新增 `frontend-platform/apps/docs/src/componentDocs.ts`，按组件维护 Props、Events、Slots、Types、Vue + TypeScript 示例代码和注意事项。
- 新增 `frontend-platform/apps/docs/src/ComponentDetail.vue`，统一渲染单组件详情页和基础用法 Demo。
- 新增 `frontend-platform/apps/docs/src/scenarioTemplateDocs.ts` 与 `ScenarioTemplateDetail.vue`，统一渲染场景模板详情页。
- 新增 45 个组件详情路由和 10 个场景模板详情路由。
- 更新 VitePress theme，补充组件详情页、API 表格、关联模板链接、布局组件预览和统一 Demo 容器样式。

后端完成内容：无，本次为 V01 组件文档站信息架构和文档详情重构。

接口联调结果：本次不接入真实后端接口，组件文档站继续使用 mock / preset 数据。

Jenkins 测试发布结果：V01 不接入 Jenkins，V02 开始正式记录测试环境发布。

阿里弹性容器正式发布检查：V01 不部署正式服务；通过 npm dry-run 验证平台包发布流程。

.gitignore 更新结果：

- 已检查现有 `.gitignore`，仍覆盖 `node_modules/`、`dist/`、`.vitepress/cache/`、`.vitepress/dist/`、`.npmrc`、`.env`、`*.tgz`、日志、密钥和本地配置文件。
- 本次执行 preview 时临时生成 `.tmp-docs-preview/` 日志目录，已在根 `.gitignore` 新增 `.tmp*/`，避免临时验证日志进入 Git。

敏感信息检查结果：

- 未发现真实账号、密码、token、API Key、私钥或内部地址。
- 命中项为文档安全规则、示例占位符、字段名、示例 registry 或依赖包名。

README 更新结果：已同步根目录 README，补充 45 个单组件详情页、场景模板详情页、共享详情渲染器和 preview HTTP 路由验证结果。

验证结果：

- `corepack pnpm --filter @smartwarehouse/component-docs build` 成功。
- `corepack pnpm build` 成功。
- `corepack pnpm publish:dry-run` 成功，四个平台包均可 dry-run 发布；registry 登录提示为 dry-run 场景下的预期提示。
- VitePress preview HTTP 检查通过：`/component/overview`、`/component/status-tag`、`/component/warehouse-select`、`/component/chat-panel`、`/scenario/overview`、`/scenario/ai-workbench`、`/playground` 均返回 200。
- preview 端口 `4174` 验证后已关闭。
- 静态构建产物检查通过：顶部公开导航为 `组件`、`场景模板`、`Playground`，组件侧边栏指向单组件路由，场景模板侧边栏指向 `/scenario/*`。

遗留问题：

- 当前未接入 Playwright 或浏览器截图工具，只完成构建、静态产物和 HTTP 路由验证；后续可补充文档站视觉回归测试。
- VitePress 构建仍有第三方依赖 `#__PURE__` 注释提示和 chunk 大小提示，不影响构建结果。
- `PlaygroundWorkbench.vue` 仍采用预设可运行模式；如后续接入稳定内网静态包服务，可再升级为 `@vue/repl` 真运行模式。

下一步：

- 继续 V02 甲方前后端基座开发与 CI/CD 基线。

相关决策：

- 新增 `docs/plan/decisions/0007-component-docs-single-component-boundary.md`，记录组件入口必须保持单组件详情边界。

相关 skill：

- 使用并更新 `docs/plan/skill/vue-element-plus-module-skill.md`，补充单组件详情页与场景模板详情页边界、`ComponentDetail.vue` / `componentDocs.ts` 复用规则，以及旧组合路由迁移规则。
- 使用 `docs/plan/skill/gitignore-secret-scan-skill.md`，流程仍有效，无需修改。

### 2026-06-12 V01 删除预设式静态 Playground 完成

版本：V01

状态：DONE

完成内容：

- 按方案 A 删除 `frontend-platform/apps/docs` 中的预设式静态 Playground。
- 顶部公开导航收敛为 `组件` 和 `场景模板` 两个一级入口。
- 删除 `/playground` 页面、`PlaygroundWorkbench.vue`、`ComponentPlayground.vue`。
- 从 `componentCatalog.ts` 删除 `playgroundPreset` 元数据，避免后续新增组件继续维护静态预设。
- 从 VitePress theme 中删除 `.sw-playground*` 和 `.sw-repl*` 专属样式。
- 更新文档站兼容入口与说明文案，去掉 `/playground` 链接和 Playground 预设描述。

前端完成内容：

- `frontend-platform/apps/docs/.vitepress/config.ts`：删除 Playground 顶部导航。
- `frontend-platform/apps/docs/src/componentCatalog.ts`：删除 `playgroundPreset` 字段和所有条目配置。
- `frontend-platform/apps/docs/.vitepress/theme/style.css`：删除 Playground / REPL 专属样式。
- `frontend-platform/apps/docs/index.md`、`examples.md`、`release.md`、`component/overview.md`、`scenario/overview.md`：更新为两入口说明。

后端完成内容：无，本次为 V01 组件文档站信息架构收口。

接口联调结果：本次不接入真实后端接口。

Jenkins 测试发布结果：V01 不接入 Jenkins，V02 开始正式记录测试环境发布。

阿里弹性容器正式发布检查：V01 不部署正式服务；通过 npm dry-run 验证平台包发布流程。

.gitignore 更新结果：

- 已检查现有 `.gitignore`，仍覆盖 `node_modules/`、`dist/`、`.vitepress/cache/`、`.vitepress/dist/`、`.npmrc`、`.env`、`*.tgz`、日志、密钥、本地配置和 `.tmp*/` 临时目录。
- 本次无需新增 `.gitignore` 规则。

敏感信息检查结果：

- 未发现真实账号、密码、token、API Key、私钥或内部地址。
- 命中项为文档安全规则、示例占位符、字段名、示例 registry 或历史决策说明。

README 更新结果：已同步根目录 README，说明当前文档站为 `组件 / 场景模板` 两入口，静态 Playground 已删除，后续只有实现真实在线编辑实时预览时才恢复。

验证结果：

- `corepack pnpm --filter @smartwarehouse/component-docs build` 成功。
- `corepack pnpm build` 成功。
- `corepack pnpm publish:dry-run` 成功，四个平台包均可 dry-run 发布；registry 登录提示为 dry-run 场景下的预期提示。
- VitePress preview HTTP 检查通过：`/component/overview`、`/component/status-tag`、`/component/warehouse-select`、`/component/chat-panel`、`/scenario/overview`、`/scenario/ai-workbench` 均返回 200。
- `/playground` 返回 404，`.vitepress/dist/playground.html` 不存在。
- Browser 验证通过：`/component/overview` 和 `/scenario/overview` 可见导航中不包含 Playground，顶部公开入口只显示 `组件` 和 `场景模板`。
- preview 端口 `4174` 验证后已关闭。

遗留问题：

- 当前没有 Playground。后续如确有需要，必须单独实现基于 `@vue/repl`、浏览器 import map、平台包 ESM 静态资源和沙箱预览的真实在线编辑实时预览工具。
- VitePress 构建仍有第三方依赖 `#__PURE__` 注释提示、chunk 大小提示和空 chunk 提示，不影响构建结果。

下一步：

- 继续 V02 甲方前后端基座开发与 CI/CD 基线。

相关决策：

- `docs/plan/decisions/0006-enterprise-component-docs-three-entry-structure.md` 已标记为 `SUPERSEDED`。
- 新增 `docs/plan/decisions/0008-remove-static-playground-public-entry.md`，记录删除预设式静态 Playground、保留两入口结构。

相关 skill：

- 使用并更新 `docs/plan/skill/vue-element-plus-module-skill.md`，将组件文档站流程修正为两入口结构，并补充不得恢复预设式静态 Playground 的规则。
- 使用 `docs/plan/skill/gitignore-secret-scan-skill.md`，流程仍有效，无需修改。

### 2026-06-12 开发代码中文注释规则补充

状态：DONE

完成内容：

- 在 `DEVELOPMENT_RULE.md` 新增“代码注释与学习友好规则”，要求开发代码时补充详细中文注释。
- 在 `ROADMAP.md` 的开发推荐指令和提示词系统运行规则中补充中文注释要求。
- 在 Java、Vue、Python 三个核心开发 skill 中补充执行步骤、检查清单和常见坑，确保后续微服务、前端和 AI 服务开发都会检查注释质量。
- 在 `SKILL_TEMPLATE.md` 中补充中文注释检查项，保证后续新增 skill 也继承该规则。

执行要求：

- 类、组件、方法、函数、组合式函数、DTO、事件对象、配置类、任务类和关键业务流程都应增加中文说明。
- 关键代码行需要说明业务含义、设计原因和注意事项，尤其是幂等、事务、缓存、MQ、权限、登录风控、库存预扣、异步任务、RAG、Agent、MCP 和 ChatBI SQL 限制。
- 注释要服务学习理解，避免只重复语法含义的空注释。

验证结果：

- 已通过 `rg` 检查确认 `docs/plan` 中新增了“详细中文注释”和“学习友好”相关规则。

### 2026-06-12 V01 frontend-platform 源码中文注释补强完成

版本：V01

状态：DONE

完成内容：

- 检查 `frontend-platform` 下 `packages` 和 `apps/docs/src` 的 TypeScript / Vue 源码注释覆盖情况。
- 为 `platform-sdk` 的运行时配置、请求封装、Token、权限、字典、选项、WebSocket 和统一导出入口补充中文注释。
- 为 `platform-types` 的模块编码、用户、登录风控、菜单、运行时配置、表格、表单、导入任务、物料需求、AI 消息、Agent 步骤和 MCP 工具调用类型补充中文注释。
- 为 `platform-ui` 的布局、页面容器、菜单、面包屑、用户菜单、状态标签、字典、选择器、上传导入导出、表格、表单、批量操作、任务进度、流程状态、看板、实时状态、AI 输入、SQL 预览、Markdown 渲染、Agent 时间线和工具轨迹等组件补充中文注释。
- 为 `apps/docs/src` 的组件总览、场景模板总览、目录元数据、单组件详情渲染器、场景模板详情渲染器和示例数据补充中文注释。

注释原则：

- 注释重点说明组件职责、业务边界、设计原因、后续真实接口替换点和安全注意事项。
- 避免只解释语法，例如不写“这里定义变量”这类空注释。
- 对登录风控、权限、字典、数据权限、WMS 离线上传、MES 物料申请、Task 实时看板、AI/RAG/ChatBI/MCP 展示等后续关键业务衔接点增加学习说明。

后端完成内容：无，本次为 V01 前端组件库源码可读性增强。

接口联调结果：本次不接入真实后端接口。

Jenkins 测试发布结果：V01 不接入 Jenkins，V02 开始记录测试环境发布。

阿里弹性容器正式发布检查：V01 不部署正式服务。

.gitignore 更新结果：

- 已检查现有 `.gitignore`，覆盖 `node_modules/`、`dist/`、`.vitepress/cache/`、`.vitepress/dist/`、`.npmrc`、`.env`、`*.tgz`、日志、密钥、本地配置和 `.tmp*/` 临时目录。
- 本次未产生新的构建产物类型，无需新增 `.gitignore` 规则。

敏感信息检查结果：

- 未发现真实账号、密码、token、API Key、私钥或内部地址。
- 命中项均为字段名、示例占位符、文档安全规则、Token 变量名或 mock 演示说明。

README 更新结果：已同步根目录 README，补充说明 V01 源码已按学习友好规则完成中文注释补强。

验证结果：

- 中文注释覆盖检查通过：`frontend-platform/packages` 与 `frontend-platform/apps/docs/src` 范围内的 `ts/vue` 源码文件均包含中文说明。
- `corepack pnpm build` 成功，四个平台包和 VitePress 文档站均构建通过。
- 构建仍存在 VitePress / 第三方依赖既有提示：空 chunk、`#__PURE__` 注释提示和 chunk 大小提示，不影响构建结果。

遗留问题：

- 当前补充的是源码注释和学习说明，没有新增单元测试。
- 后续开发业务功能时仍需要在新增类、组件、方法、组合式函数、关键业务代码行中同步补充中文注释。

下一步：

- 继续 V02 甲方前后端基座开发与 CI/CD 基线。

相关决策：无新增重大设计取舍，不新增 decisions。

相关 skill：

- `docs/plan/skill/vue-element-plus-module-skill.md` 的中文注释规则仍有效，无需调整。
- `docs/plan/skill/gitignore-secret-scan-skill.md` 流程仍有效，无需调整。
