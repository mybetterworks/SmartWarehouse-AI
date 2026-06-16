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
| 当前版本 | V03 |
| 当前状态 | TODO |
| 当前任务 | WMS 乙方前后端模块开发 |
| 对应文件 | `milestones/V03-wms-fullstack-basic.md` |

## 3. 版本总览

| 版本 | 文件 | 状态 | 目标 |
|---|---|---|---|
| V01 | `milestones/V01-owner-component-library.md` | DONE | 甲方组件库二次开发，初始化最小项目骨架，发布平台 npm snapshot 包 |
| V02 | `milestones/V02-owner-platform-base-cicd.md` | DONE | 甲方前后端基座，完成 platform/gateway/sys/portal-shell/sys-web，并接入 Jenkins 与阿里弹性容器基线 |
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

下一步从 V03 开始：

```text
请根据 docs/plan/ROADMAP.md、docs/plan/DEVELOPMENT_RULE.md、docs/plan/PROGRESS.md 和 docs/plan/milestones/V03-wms-fullstack-basic.md，开发 V03 WMS 乙方前后端模块版本。开发时直接使用 V03 milestone 中的版本开发输入边界，不要重复读取 docs/design，除非发现设计冲突或用户明确要求。
```

V03 完成后需要更新：

- `PROGRESS.md`
- `milestones/V03-wms-fullstack-basic.md`
- `study/V03-wms-fullstack-basic-study.md`
- `handle/V03-wms-fullstack-basic-handle.md`
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

### 2026-06-13 V02 甲方前后端基座与 CI/CD 基线完成

版本：V02

状态：DONE

完成内容：

- 完成根 Maven 聚合 POM，根 POM 仅聚合 `platform`、`gateway`、`sys`。
- 完成 `platform` 甲方技术底座：`platform-parent`、`platform-bom`、`platform-common-core/web/data/security-lite/redis/mq/log/id`。
- 完成 `gateway-service`：`/api/sys/**` 真实路由，WMS/MES/task/AI 路由预留，TraceId、CORS、JWT 鉴权、基础内存限流和降级响应。
- 完成 `sys-api` 与 `sys-service`：登录、退出、刷新 Token、当前用户、拼图验证码、用户、角色、菜单、部门、岗位、字典、前端模块、数据权限、登录日志、操作日志、风控记录。
- 完成登录风控：连续失败 3 次启用拼图验证码，连续失败 5 次锁定账号 10 分钟，同一 IP 失败过多锁定 5 分钟。
- 完成 Jenkinsfile、本地 docker-compose、Dockerfile、Nacos 模板、`smart_sys` 初始化 SQL 和阿里弹性容器正式发布检查清单。

前端完成内容：

- 完成 `frontend-platform/apps/portal-shell`，提供统一登录页、后端拼图验证码校验、Token 管理、用户信息加载、菜单树加载、模块入口加载和退出登录。
- 完成 `frontend-platform/apps/sys-web`，提供用户、角色、菜单、部门岗位、字典、前端模块、审计日志、风控记录和仓库数据权限配置页面。
- `portal-shell` 与 `sys-web` 的 `package.json` 均使用 `@smartwarehouse/*` 的 `workspace:*` 包名依赖。
- 业务代码均通过 `@smartwarehouse/platform-ui`、`@smartwarehouse/platform-sdk`、`@smartwarehouse/platform-theme`、`@smartwarehouse/platform-types` 包名导入，无 `../../packages/**` 源码相对路径。
- 增强 `LoginForm` 与 `JigsawCaptcha`，支持后端验证码 verifier 和挑战目标位置，并同步更新组件文档。

后端完成内容：

- `sys-service` 使用内存仓库形成 V02 MVP 数据闭环，同时提供 `deploy/mysql/init-sys-db.sql` 作为后续 MySQL 落库基础。
- JWT 使用 HMAC-SHA256 轻量实现，claims 包含 jti、tokenType、userId、username、roles、permissions、warehouseIds、iat、exp。
- Token 黑名单、登录失败次数、验证码挑战和验证码通过 token 先使用内存实现，但代码按 Redis Key 语义组织，后续可替换 Redis。
- 新增 `AuthFlowIntegrationTest`，验证登录成功与连续失败 3 次触发验证码。

接口联调结果：

- 启动 `sys-service` 与 `gateway-service` 后，`/actuator/health` 均返回 `UP`。
- 未登录访问 `http://127.0.0.1:9200/api/sys/users` 返回 `401`。
- 使用管理员账号登录返回 `SUCCESS`、Access Token 和 Refresh Token。
- 携带 Token 访问 `/api/sys/auth/me` 返回 `admin`，访问 `/api/sys/users` 返回用户分页数据。
- 连续 3 次错误登录后，`/api/sys/auth/risk-state?username=admin` 返回 `captchaRequired=true`、`failureCount=3`。

Jenkins 测试发布结果：

- 已提供 `deploy/jenkins/Jenkinsfile`，覆盖 checkout、`mvn test`、`corepack pnpm install`、`corepack pnpm build`、Docker 镜像构建、本地 compose 测试发布和健康检查。
- 本地未实际运行 Jenkins 服务，但已用等价命令完成 Java 测试、前端构建、服务启动联调和 compose 配置校验。
- Docker 镜像构建检查因 Docker Hub 基础镜像鉴权/网络连接超时未完成，阻塞于拉取 `eclipse-temurin:17-jre` 与 `nginx:1.27-alpine`；需要网络恢复或配置镜像加速器后重试。

阿里弹性容器正式发布检查：

- 已提供 `deploy/aliyun-eci/formal-release-checklist.md`。
- 检查清单覆盖正式镜像来源、环境变量、Secret、健康检查、资源规格、发布前检查和回滚。
- 未执行真实阿里弹性容器发布。

.gitignore 更新结果：

- 已检查现有 `.gitignore`，覆盖 `target/`、`dist/`、`node_modules/`、`.vitepress/cache/`、`.vitepress/dist/`、`.npmrc`、`.env`、日志、证书密钥、本地配置和 `.tmp*/`。
- 本次无需新增 `.gitignore` 规则。

敏感信息检查结果：

- 未发现真实 token、API Key、私钥、阿里云密钥或 npm 凭证。
- 命中项为字段名、占位符、测试属性、`.npmrc.example` 环境变量占位符和文档模板。
- 已移除 `sys-service` 演示密码默认值，改为通过 `SMARTWAREHOUSE_DEMO_PASSWORD` 或测试属性显式注入。
- AI 未执行 `publish:snapshot`、`publish:release`、`pnpm publish`、`npm publish` 等真实 npm 发布命令。

README 更新结果：

- 已同步根目录 README，补充 V02 已完成后端基座、前端基座、验证命令、发布基线和当前下一步。

验证结果：

- `mvn test -q` 通过。
- `mvn package -DskipTests -q` 通过。
- `corepack pnpm install` 通过。
- `corepack pnpm build` 通过。
- gateway/sys 服务启动联调通过。
- `docker compose -f deploy/local/docker-compose.yml config` 通过。
- `portal-shell`/`sys-web` 依赖规则和源码相对路径扫描通过。
- 敏感信息扫描通过，无真实密钥入库。

遗留问题：

- Docker Hub 网络不可用时无法完成镜像构建，需要后续配置镜像加速器或在可访问网络环境重试。
- V02 内存仓库、Token 黑名单和风控状态只适合 MVP，正式多实例需要替换为 MySQL + Redis。
- Gateway 当前使用内存基础限流，后续需要接入 Sentinel Gateway 或 Redis 限流。

下一步：

- 进入 V03 WMS 乙方前后端模块开发。
- V03 开发时复用 V02 gateway/sys 登录、菜单、数据权限和平台 npm 包。

相关决策：无新增重大设计取舍，不新增 decisions。

相关 skill：

- 使用 `java-spring-cloud-service-skill.md`，流程仍有效，无需修改。
- 使用并复核 `vue-element-plus-module-skill.md`，流程仍有效；本次平台组件增强已按 skill 要求同步更新组件文档。
- 使用 `gitignore-secret-scan-skill.md`，流程仍有效，无需修改。


### 2026-06-14 V02 商业化功能补齐复验

版本：V02

状态：DONE

完成内容：
- 将 sys-service 从内存 MVP 补齐为 Docker MySQL + JDBC 仓储实现，系统管理核心数据全部落库。
- 将登录风控、验证码挑战、验证码通过 token、账号/IP 锁定和 Token 黑名单接入 Redis，并保留测试 fallback。
- 完成 gateway 与 sys-service 双层鉴权、Redis 黑名单校验和操作日志 AOP。
- 补齐 portal-shell 和 sys-web 的商业系统页面：统一登录、模块入口、用户、角色、菜单、部门岗位、字典、前端模块、审计日志、风控记录和仓库数据权限配置。
- 修复 MySQL 初始化字符集问题，deploy/mysql/init-sys-db.sql 增加 SET NAMES utf8mb4，避免中文种子数据乱码。
- 修复 MySQL 8 distinct + order by 兼容问题。
- 将 frontend-platform/package.json、.npmrc.example 和 V01 handle 中的具体云效 npm registry 地址改为占位符或本地 .npmrc 管理。

验证结果：
- mvn -q -pl sys/sys-service,gateway/gateway-service -am test package 通过。
- Docker MySQL、Redis、RabbitMQ 均健康运行并通过命令验证。
- 网关接口联调通过：未登录 401、登录成功、/auth/me、菜单树、用户/角色/部门/岗位/字典/前端模块查询、岗位增改删、操作日志、退出黑名单、三次失败启用验证码均通过。
- corepack pnpm build:packages 通过。
- corepack pnpm --filter @smartwarehouse/portal-shell --filter @smartwarehouse/sys-web build 通过。
- 浏览器验收通过：http://localhost:5174/ 登录后模块入口正常；当时曾通过 http://localhost:5175/apps/sys/ 验证 sys-web 独立调试入口。该集成方式已在 2026-06-15 后续修正中被 `5174` 统一路由承载方案替代。
- docker compose -f deploy/local/docker-compose.yml config 通过。
- Docker 镜像构建因 Docker Hub 基础镜像拉取网络超时未完成，阻塞点为外部网络，不是项目配置错误。

遗留问题：
- 待网络可访问 Docker Hub 或配置镜像加速器后，重跑 docker compose -f deploy/local/docker-compose.yml build sys-service gateway-service。
- V03 开始复用 V02 的真实登录、菜单、数据权限和平台前端包，不再把 sys 能力视为占位。

相关决策：无新增重大设计取舍，不新增 decisions。


### 2026-06-14 V02 默认本地配置与自动测试对齐修正

版本：V02

状态：DONE

修正原因：
- 用户在 IDEA / 本地命令直接启动 `sys-service`、`gateway` 后，页面登录报 `Failed to obtain JDBC Connection`。
- 根因是之前运行验证依赖 AI Shell 中临时注入的环境变量，而服务默认配置仍指向 `127.0.0.1:3306` 和 Redis `6379`；用户直接启动时会误连其他项目容器或连接失败。
- 这暴露出自动测试和人工测试配置不一致的问题，必须修正为“测试通过后，用户按默认配置也能直接启动验证”。

完成内容：
- 更新 `sys-service` 默认配置：MySQL 默认连接 `127.0.0.1:13306/smart_sys`，Redis 默认连接 `127.0.0.1:16381`。
- 更新 `gateway` 默认配置：Redis 默认连接 `127.0.0.1:16381`。
- 更新 `deploy/local/docker-compose.yml` 默认端口：MySQL `13306`、Redis `16381`、RabbitMQ `5673`、RabbitMQ Management `15673`，并补齐本地开发默认值。
- 更新 `deploy/jenkins/Jenkinsfile`，在 Java Test 前先启动 MySQL、Redis、RabbitMQ，保证 Jenkins 自动测试顺序与人工验收顺序一致。
- 新增 `LocalDockerMiddlewareAcceptanceTest`，使用默认配置连接真实 Docker MySQL/Redis，验证健康检查、admin 登录、当前用户、前端模块查询、岗位新增/修改/删除。
- 更新 `DEVELOPMENT_RULE.md`、`ROADMAP.md`、V02 milestone、V02 study、V02 handle、`java-spring-cloud-service-skill.md`、`cicd-jenkins-eci-skill.md` 和根 README。

验证结果：
- `docker compose -f deploy/local/docker-compose.yml config` 通过，默认端口已展示为 MySQL `13306`、Redis `16381`、RabbitMQ `5673`。
- `docker compose -f deploy/local/docker-compose.yml up -d mysql redis rabbitmq` 通过，三个 `smartwarehouse-*` 容器均保持 healthy/running。
- `mvn -q -pl sys/sys-service,gateway/gateway-service -am test` 通过，其中 `LocalDockerMiddlewareAcceptanceTest` 日志显示使用 MySQL 驱动连接真实 Docker MySQL。
- `mvn -q -pl sys/sys-service,gateway/gateway-service -am package -DskipTests` 通过。
- 重新打包后，在不设置数据库、Redis、JWT 等环境变量的情况下临时启动 `sys-service` 和 `gateway`，通过 `http://127.0.0.1:9200/api/sys/auth/login` 使用 `admin / 123456` 登录成功，并通过 `/api/sys/auth/me` 返回 `admin`。
- 旧默认值扫描通过：未发现 `127.0.0.1:3306`、`SMARTWAREHOUSE_REDIS_PORT:6379`、`MYSQL_PORT:-3306`、`REDIS_PORT:-6379` 等作为本地默认连接残留。
- `.gitignore` 已追加 `data/temp/`，避免临时启动日志或验证中间文件进入 Git。
- 敏感信息扫描结果：命中项均为本地开发默认值、文档安全规则、占位符、测试账号或字段名；未发现真实 token、API Key、私钥、云厂商密钥或 npm 凭证。

遗留问题：
- Docker 镜像构建仍受 Docker Hub 基础镜像拉取网络影响，待配置镜像加速器或网络恢复后重试。

相关决策：这是 V02 本地开发和测试流程修正，不新增 decisions。

相关 skill：
- 已更新 `java-spring-cloud-service-skill.md`，补充真实 Docker 中间件验收与默认配置一致性要求。
- 已更新 `cicd-jenkins-eci-skill.md`，补充 Jenkins 必须先启动中间件再运行后端自动测试。


### 2026-06-15 V02 商业化架构优化与门户单点集成

版本：V02

状态：DONE

优化原因：
- 用户以商业软件架构师视角提出 V02 需要继续补强：后台服务接入 Nacos，门户右上角个人信息和修改密码可用，系统管理模块在总控制台当前页面内打开且不再二次登录，后端和前端代码必须按正常业务模块拆分。

完成内容：
- 后端接入 Nacos Discovery：`platform-parent` 引入 Spring Cloud Alibaba 依赖管理，`gateway-service`、`sys-service` 增加 Nacos Discovery 依赖与配置。
- 解决本地 Nacos 端口冲突：SmartWarehouse-AI 宿主机默认使用 Nacos `18848`、gRPC `19848`，Docker Compose 网络内部仍使用 `nacos:8848`。
- Gateway 默认 sys 路由从固定地址调整为 `lb://sys-service`，容器运行时通过 Nacos 服务发现转发到 sys-service。
- `deploy/local/docker-compose.yml` 增加 Nacos 健康检查，gateway/sys 容器依赖 Nacos healthy 后启动；`deploy/jenkins/Jenkinsfile` 在本地中间件阶段同步启动 Nacos。
- sys-service 增加修改密码接口 `PUT /api/sys/auth/password`，校验旧密码、新密码长度、确认密码、Token 有效性和账号状态后更新 MySQL 密码哈希。
- sys-service 删除单体 `SysManagementController`，按用户、角色、菜单、组织岗位、字典、前端模块、审计日志和风控记录拆分 Controller，保持 URL 契约不变。
- portal-shell 点击系统管理不再 `window.open` 新页面，也不再通过 iframe 嵌套 `sys-web`；点击模块或子菜单时使用前端路由在当前页面切换。该阶段曾使用 `redirect` 参数定位目标业务页签，已在后续“门户统一前端路由承载修正”中替换为 `/sys/**` 真实路由。
- portal-shell 增加右上角个人信息和修改密码弹窗；sys-web 在独立模式和门户跳转模式下也支持个人信息和修改密码入口。
- sys-web 去掉 `?shell=portal` 壳层模式和 postMessage Token 同步逻辑；启动时从 `platform-sdk` 恢复登录态。后续已支持根据 `/sys/**` 真实路径切换用户、角色、菜单、部门岗位、字典、模块、日志、风控等页签。
- `platform-sdk` Token 存储从纯 localStorage 增强为 localStorage + 同主机 Cookie 桥接；该能力保留给独立调试场景，门户集成已改为 `localhost:5174` 同端口路由承载，不再依赖跨端口共享。
- sys-service 的 `/api/sys/menus/tree` 和 `/api/sys/frontend-modules/enabled` 改为按当前登录用户角色菜单授权过滤，`wms_manager` 只能拿到 `wms` 模块和仓储菜单。
- sys-web 将用户、角色、菜单、部门岗位、字典、前端模块、审计日志、风控记录拆分到 `src/views` 下的独立页面文件，`App.vue` 收敛为应用壳层、登录态和页面组合。

验证结果：
- `docker compose -f deploy/local/docker-compose.yml config` 通过。
- `docker compose -f deploy/local/docker-compose.yml up -d mysql redis rabbitmq nacos` 通过，MySQL、Redis、RabbitMQ、Nacos 均可用，Nacos 宿主机端口为 `18848`。
- `mvn -q -pl sys/sys-service,gateway/gateway-service -am test` 通过，日志确认 sys-service 可注册到 Nacos；H2 快速测试中显式关闭 Nacos Discovery。
- `mvn -q -pl sys/sys-service,gateway/gateway-service -am package -DskipTests` 通过。
- 临时启动 sys-service 和 gateway 后，健康检查均为 `UP`，通过 gateway 登录 `admin / 123456` 返回 `SUCCESS`，`/api/sys/auth/me` 返回 `admin`，前端模块数量返回 5。
- `corepack pnpm --filter @smartwarehouse/portal-shell --filter @smartwarehouse/sys-web build` 通过。
- `corepack pnpm build:packages`、`corepack pnpm build:apps`、`corepack pnpm build:docs` 均通过；单次 `corepack pnpm build` 因耗时超过本地执行超时被中断，但拆分构建均已通过。
- 浏览器验收通过：打开 `http://localhost:5174/` 使用 `admin / 123456` 登录，点击系统管理后进入系统管理页面，不再出现二次登录页。该阶段曾跳转到 `5175`，已在后续修正为 `http://localhost:5174/sys/users`。
- 浏览器验收通过：打开 `http://localhost:5174/` 使用 `wms_manager / 123456` 登录后，页面只显示“仓储管理”，不显示“系统管理”“生产执行”“运营看板”“AI 助手”。
- 浏览器验收通过：portal-shell 右上角“个人信息”可打开 admin 信息弹窗，“修改密码”可打开旧密码、新密码、确认密码表单；为避免改变测试账号密码，本次未提交保存按钮。

.gitignore 更新结果：
- 已检查现有 `.gitignore`，继续覆盖 `.npmrc`、`.env`、`target/`、`dist/`、`node_modules/`、`.vitepress/cache/`、`.vitepress/dist/`、日志、证书密钥、本地配置、Docker 数据目录和临时目录。
- 本次未产生新的构建产物类型或敏感本地配置文件，无需新增 `.gitignore` 规则。

敏感信息检查结果：
- 未发现真实 token、API Key、私钥、阿里云密钥或 npm 凭证。
- 命中项为本地开发端口、测试账号、字段名、占位符、文档安全规则和示例命令；真实 `.npmrc` 仍由本地文件管理且被忽略。

README 更新结果：
- 已同步根目录 README，补充 V02 Nacos、门户当前页集成、个人信息/修改密码、后端 Controller 拆分、前端 views 拆分和最新验证结果。

遗留问题：
- 真实阿里弹性容器发布仍未执行，仅完成配置清单和本地构建验证；正式发布需用户准备镜像仓库、凭证、Secret 和运行环境后手动触发。
- 修改密码接口已通过后端测试覆盖，浏览器仅验证弹窗可用，没有在真实 admin 账号上点击保存，以免改变后续演示默认密码。
- 后续 V03 开发要继续复用当前 Nacos、Gateway、Token、菜单、数据权限和门户正常跳转集成方式；乙方前端应用不得重新引入 iframe 壳层。

相关决策：本次为 V02 商业化优化落地，未新增独立 decisions；规则已固化到 DEVELOPMENT_RULE、milestone、study、handle 和 skill。

相关 skill：
- 已更新 `java-spring-cloud-service-skill.md`，补充 Nacos Discovery、Controller/Service/Repository 按业务模块拆分和真实 Docker/Nacos 验证规则。
- 已更新 `vue-element-plus-module-skill.md`，补充前端页面拆分、门户正常页面跳转、SDK 同主机 Cookie 桥接和禁止 URL 传 Token 规则。

### 2026-06-15 V02 sys 管理接口权限加固

版本：V02

状态：DONE

修复原因：
- 测试发现 `wms_manager` 虽然只能在门户看到仓储管理模块，但拿到 Token 后仍可直接访问 sys 管理接口，说明之前只完成了菜单/模块展示过滤，没有完成系统管理接口的服务端授权边界。

完成内容：
- `SysAuthenticationFilter` 在完成 JWT 认证后，进一步判断系统管理接口是否需要 `ADMIN` 角色或 `sys:*` 权限。
- `/api/sys/auth/**` 继续作为统一认证中心能力开放给已认证用户；`/api/sys/menus/tree` 和 `/api/sys/frontend-modules/enabled` 继续允许已认证用户访问，但返回结果按当前用户过滤。
- `/api/sys/users`、`/api/sys/roles`、`/api/sys/menus`、`/api/sys/depts`、`/api/sys/posts`、`/api/sys/dict-types`、`/api/sys/frontend-modules`、日志和风控记录等系统管理接口，如果当前用户没有 sys 管理权限，返回 `FORBIDDEN`。
- `sys-web` 登录和会话恢复时增加 sys 管理权限检查；`wms_manager` 直接打开 sys-web 登录后会清理 Token 并提示“当前账号无系统管理访问权限”。

验证结果：
- `mvn -q -pl sys/sys-service,gateway/gateway-service -am test` 通过。
- `LocalDockerMiddlewareAcceptanceTest` 已覆盖：`wms_manager / 123456` 可访问 `/api/sys/auth/me`、可获取过滤后的 WMS 菜单和模块，但访问 `/api/sys/users` 返回 `FORBIDDEN`。
- `corepack pnpm --filter @smartwarehouse/portal-shell --filter @smartwarehouse/sys-web build` 通过。

复盘记录：
- 统一认证中心和业务模块访问权必须分开理解。用户能通过 sys-service 登录总门户，只说明身份有效，不代表能进入系统管理后台。
- 菜单隐藏不是安全边界，后端接口必须有权限兜底；否则低权限账号仍可通过调试工具或直接请求访问管理接口。

### 2026-06-15 V02 门户统一前端路由承载修正

版本：V02

状态：DONE

修复原因：
- 管理员在总控制台进入“系统管理”时，旧方案仍跳转到 `localhost:5175/apps/sys/?redirect=...`。这不是 iframe，也不传 Token，但仍不是用户要求的“所有前端服务都在 `http://localhost:5174/` 内通过路由访问”。
- 左侧“系统管理”一级目录点击后只展开不进入模块，影响总控制台进入模块的实际体验。

完成内容：
- `sys-web` 新增 `@smartwarehouse/sys-web/embedded` 导出入口，供 `portal-shell` 在当前页面内承载系统管理页面；`sys-web` 仍保留 `5175` 独立调试能力。
- `portal-shell` 增加内部路由状态：`/` 自动规范为 `/portal`，点击系统管理默认进入 `/sys/users`，点击未开发模块进入 `/wms`、`/mes`、`/task`、`/ai` 的当前页预留入口。
- `portal-shell` 删除跨端口跳转逻辑，不再使用 `VITE_SYS_WEB_URL`、`resolveLocalDevEntry`、`redirect` 参数进入 `sys-web`。
- `sys-web` 支持从真实路径 `/sys/users`、`/sys/roles` 初始化和切换页签，独立调试时仍兼容 `/apps/sys/` 与 `redirect`。
- `platform-ui` 的 `SideMenu` 支持点击有子菜单的一级目录并派发 `menuClick`，左侧“系统管理”可直接进入默认页面。

验证结果：
- `corepack pnpm install` 通过，workspace 依赖已识别 `@smartwarehouse/sys-web`。
- `corepack pnpm build:packages` 通过。
- `corepack pnpm --filter @smartwarehouse/portal-shell --filter @smartwarehouse/sys-web build` 通过。
- 浏览器验收通过：访问 `http://localhost:5174/` 后规范到 `http://localhost:5174/portal`。
- 浏览器验收通过：点击左侧“系统管理”后直接进入 `http://localhost:5174/sys/users`，没有 iframe，没有二次登录，没有访问 `5175`。
- 浏览器验收通过：在系统管理内点击“角色管理”后 URL 为 `http://localhost:5174/sys/roles`，激活页签为“角色管理”。
- 浏览器验收通过：直接访问 `http://localhost:5174/sys/users` 可以恢复用户管理页面；`5175` 未监听时门户集成仍可用。

.gitignore 与敏感信息：
- 本段为历史阶段记录，当时只新增 workspace 包依赖、embedded 入口和前端路由逻辑，未新增需要提交的构建产物类型；当前方案已改为 Module Federation remoteEntry。
- 未新增真实账号、密码、token、API Key、私钥、内部地址或 npm 凭证。

README 更新结果：
- 已同步根目录 README，说明 V02 当前门户集成统一使用 `5174` 路由承载，`5175` 只作为 sys-web 独立调试入口。
- 注：该 embedded/route 方案已经被后续 `vite-plugin-federation` 微前端方案替代，保留本段仅作为 V02 演进历史记录。

相关决策：
- 新增 `decisions/0009-unified-frontend-route-entry.md`，记录“门户统一前端路由入口”决策。

### 2026-06-15 V02 vite-plugin-federation 微前端架构改造

版本：V02

状态：DONE

调整原因：
- 用户要求 `portal-shell` 启动后，`sys-web`、`wms-web`、`mes-web`、`ai-web` 都通过微前端运行时加载。
- 乙方模块发布新版本时，只更新自己的前端制品和模块注册信息，不重新构建或发布甲方 `portal-shell`。
- 任一乙方模块加载失败时，门户必须显示降级页，不影响门户、sys 和其他模块。

完成内容：
- `frontend-platform` workspace 增加 `@originjs/vite-plugin-federation`，并纳入 `../wms-web`、`../mes-web`、`../ai-web` 三个根目录乙方前端项目。
- `portal-shell` 从构建期静态依赖 `@smartwarehouse/sys-web/embedded` 调整为 Module Federation host，通过 `virtual:__federation__` 在运行时注册和加载 remote。
- `portal-shell` 新增 `MicroFrontendOutlet.vue` 和 `microFrontend.ts`，按模块注册信息加载 remote，并在加载失败或超时时显示模块级降级页。
- `sys-web` 改造为 remote，暴露 `./RemoteApp`；新增 `wms-web`、`mes-web`、`ai-web` 最小 remote 应用骨架，分别暴露 `smart_wms_web`、`smart_mes_web`、`smart_ai_web`。
- `sys-web` 旧的 `@smartwarehouse/sys-web/embedded` 导出入口已清理，当前门户集成只允许通过 remoteEntry 运行时加载。
- `sys_frontend_module` 增加 `remote_name`、`remote_entry`、`exposed_module` 字段，`sys-service` DTO、JDBC 查询、保存接口、H2 测试数据和 MySQL 初始化脚本同步更新。
- 新增 `SysFrontendModuleSchemaInitializer`，用于本地历史 Docker MySQL 数据卷启动时自动补齐缺失列，并只在空值或旧本地默认值时回填本地 preview remoteEntry，避免覆盖正式环境配置。
- `sys-web` 的前端模块管理页面增加远程容器、远程入口、暴露模块字段，便于甲方维护模块注册信息。
- 平台 npm 包 `platform-ui`、`platform-sdk`、`platform-theme`、`platform-types` 增加 `./package.json` exports，解决 Federation 共享包构建读取包元信息的问题。
- `portal-shell` 构建目标调整为 `esnext`，支持 Federation 共享模块生成的 top-level await。
- `StatCard` 等平台组件调用按真实组件 API 修正，WMS/MES/AI remote 页面使用 `StatCardItem`、`ChatMessage` 等平台类型。

验证结果：
- `corepack pnpm install` 通过，workspace 识别 11 个前端项目。
- `corepack pnpm build:packages` 通过。
- `corepack pnpm --filter @smartwarehouse/portal-shell build` 通过。
- `corepack pnpm build:remotes` 通过，`sys-web`、`wms-web`、`mes-web`、`ai-web` 均生成 `assets/remoteEntry.js`。
- `mvn -pl sys/sys-service -am test` 通过，覆盖 H2 认证流程和真实 Docker MySQL/Redis 的 `LocalDockerMiddlewareAcceptanceTest`。
- Docker MySQL 中 `sys_frontend_module` 已补齐 `remote_name`、`remote_entry`、`exposed_module`，本地 remoteEntry 指向 `/apps/<module>/assets/remoteEntry.js` preview 制品路径。
- 临时启动 remote preview：`5175/apps/sys/assets/remoteEntry.js`、`5176/apps/wms/assets/remoteEntry.js`、`5177/apps/mes/assets/remoteEntry.js`、`5178/apps/ai/assets/remoteEntry.js` 均返回 200。
- 临时启动 `portal-shell` 于 `http://localhost:5184/`，浏览器验证 `/sys/users`、`/wms`、`/mes`、`/ai` 均可在门户路由内运行时加载 remote 内容。
- 停止 `ai-web` remote 后刷新 `/ai`，门户显示“微前端模块加载失败”降级页；随后访问 `/wms` 仍能正常展示 WMS remote，证明单个乙方模块失败不影响其他模块。

.gitignore 与敏感信息：
- 现有 `.gitignore` 已覆盖 `node_modules/`、`dist/`、`.vite/`、`.tmp/`、`.npmrc`、`.env`、日志、密钥和本地配置；本次临时 `.tmp/mf-logs` 属于已忽略范围。
- 本次未新增真实 token、API Key、私钥、npm 凭证或阿里云密钥。Docker/MySQL 命令中的默认本地开发账号仅用于本地容器验证，正式环境仍应使用 Secret、环境变量或 Jenkins Credentials。

复盘记录：
- 统一门户路由和微前端运行时加载不是冲突关系：用户访问仍停留在 `portal-shell` 路由下，但页面内容由 remoteEntry 运行时加载。
- remote 侧本地集成应优先验证 build + preview 制品，因为发布后的 remoteEntry 路径受 Vite `base` 影响，实际是 `/apps/<module>/assets/remoteEntry.js`。
- 模块注册中心必须具备远程容器名、远程入口和暴露模块字段，否则乙方发版仍会退化为修改门户代码。
- 加载失败不能只依赖浏览器自然报错，需要有模块级降级页和超时保护。

README 更新结果：
- 已同步根目录 README，补充 V02 当前微前端 host/remote 架构、模块注册字段、构建验证和运行时降级验证。

相关决策：
- `decisions/0009-unified-frontend-route-entry.md` 已标记为 `SUPERSEDED`。
- 新增 `decisions/0010-vite-plugin-federation-runtime-micro-frontend.md`，记录当前 Module Federation 架构。

相关 skill：
- 已更新 `vue-element-plus-module-skill.md`，补充 host/remote、remoteEntry、preview 验证和降级页检查规则。

### 2026-06-15 V02 微前端收口清理

版本：V02

状态：DONE

完成内容：
- 清理 `sys-web` 旧的 `./embedded` package export 和 `src/embedded.ts`，避免后续开发继续按构建期静态依赖方式接入门户。
- 修正 `sys-web` Vite 配置注释，明确系统管理前端当前作为 Module Federation remote 被 `portal-shell` 运行时加载。
- 同步更新 V02 milestone、study、handle、skill 和 README 中容易误导后续开发的历史描述，保留 embedded/route 作为演进历史，但标记为已被 `vite-plugin-federation` 方案替代。

验证结果：
- `corepack pnpm build:packages` 通过。
- `corepack pnpm --filter @smartwarehouse/portal-shell build` 通过。
- `corepack pnpm build:remotes` 通过，`sys-web`、`wms-web`、`mes-web`、`ai-web` 均生成 `assets/remoteEntry.js`。
- `mvn -pl sys/sys-service -am test` 通过，包含 H2 认证流程和真实 Docker MySQL/Redis 的 `LocalDockerMiddlewareAcceptanceTest`。
- 临时启动四个 remote preview 后验证 remoteEntry 均返回 200：`5175/apps/sys/assets/remoteEntry.js`、`5176/apps/wms/assets/remoteEntry.js`、`5177/apps/mes/assets/remoteEntry.js`、`5178/apps/ai/assets/remoteEntry.js`。
- 临时 preview 进程已停止，`5175-5178` 不再监听；用户已有的 `5174` node 进程未被停止。
- 为避免影响用户当前 `5174` 门户进程，额外临时启动 `portal-shell` 到备用端口 `5184`，验证 `/portal`、`/sys/users`、`/wms`、`/mes`、`/ai` 均返回 200，四个 remoteEntry 仍返回 200；验证后已停止 `5175-5178/5184` 临时进程。

.gitignore 与敏感信息：
- `.gitignore` 已覆盖 `node_modules/`、`dist/`、`.vite/`、`.tmp/`、`target/`、`.env`、`.npmrc`、日志、coverage 和 tsbuildinfo。
- 敏感信息扫描未发现真实 npm token、API Key、私钥或云厂商密钥；命中项均为文档中的扫描规则示例和禁止项说明。

### 2026-06-15 V02 门户工作台与 hosted sys 布局改造

版本：V02

状态：DONE

完成内容：
- `sys-service` 新增正式工作台后端能力：`sys_portal_notice`、`sys_portal_access_log` 两张表，初始化消息数据，以及 `GET /api/sys/portal/workbench`、`POST /api/sys/portal/access-log` 两个接口。
- 工作台接口对任意已登录用户开放，不再要求 `ADMIN` 或 `sys:*`；同时保持系统管理接口仍由 `SysAuthenticationFilter` 做服务端权限兜底。
- 工作台聚合数据统一由 `sys-service` 返回 `profile`、`notices`、`commonModules`、`recentModules`、`loginRecords`，其中常用模块和最近访问由访问记录自动推导，并与当前用户授权模块求交集。
- `platform-types`、`platform-ui` 与组件文档同步扩展 `PlatformLayout`：支持 `showAside`、`showWorkbenchButton`、`showModuleDrawerTrigger`、`moduleEntries`、`activeModuleCode`，并新增 `workbenchClick`、`moduleSelect` 事件。
- `portal-shell` 收口为唯一登录后后台壳层：登录后始终渲染统一 `PlatformLayout`，`/portal` 为工作台首页且不显示左侧菜单，进入 `/sys/**`、`/wms/**`、`/mes/**`、`/ai/**` 后再按当前模块显示侧边菜单。
- `portal-shell` 顶部固定提供“工作台”按钮与模块抽屉，模块切换时按 module 维度上报访问记录，不再让 remote 自己承担门户级导航。
- `sys-web` 拆分为 standalone 与 hosted 两种模式：standalone 保留独立登录调试并复用新布局；hosted 模式只输出系统管理内容区，不渲染登录页、自带 `PlatformLayout` 或 tabs。
- `wms-web`、`mes-web`、`ai-web` 本轮继续保持内容区 remote，不新增独立后台壳层；在没有 host 的场景下不暴露工作台按钮或模块抽屉等 host 专属入口。

前端完成内容：
- `frontend-platform/packages/platform-ui/src/components/PlatformLayout/PlatformLayout.vue` 完成 sticky 顶栏、无侧栏全宽布局、模块抽屉搜索与模块卡片高亮。
- `frontend-platform/apps/portal-shell/src/App.vue` 实现统一壳层、工作台五个模块区块、当前模块侧栏过滤、模块切换访问记录上报和 hosted remote 承载。
- `frontend-platform/apps/sys-web/src/App.vue`、`StandaloneShell.vue`、`HostedRemote.vue`、`remote.ts` 完成“独立登录壳层”和“hosted 内容区”拆分。
- `frontend-platform/apps/docs/src/componentDocs.ts`、`componentCatalog.ts`、`scenarioTemplateDocs.ts` 已同步补充 `PlatformLayout` 新 API、`portal-workbench` 模板和新版 `standard-layout` 模板说明。

后端完成内容：
- `sys/sys-api` 新增 `PortalProfileView`、`PortalNoticeView`、`PortalWorkbenchView`、`PortalAccessLogRequest`。
- `sys/sys-service` 在 repository、service、controller、auth filter、MySQL 初始化脚本、H2 schema/data 与集成测试中同步补齐工作台后端能力。
- `AuthFlowIntegrationTest` 补充 admin 与 `wms_manager` 的工作台访问、权限交叉、访问记录推导等验证。

接口联调结果：
- `admin` 可访问 `/api/sys/portal/workbench`，返回个人信息、消息、常用模块、最近访问和登录记录。
- `wms_manager` 可访问工作台接口，但工作台中的常用模块和最近访问只保留自己有权限的模块。
- `wms_manager` 访问 `/api/sys/users` 仍返回 `FORBIDDEN`，证明“统一工作台开放”和“系统管理接口加固”两条边界同时成立。
- `portal-shell` 仅在 active module 变化时调用 `/api/sys/portal/access-log`，避免 sys 内部菜单切换污染统计。

验证结果：
- `mvn -q -pl sys/sys-service -am clean test` 通过。
- `corepack pnpm --filter @smartwarehouse/platform-ui typecheck` 通过。
- `corepack pnpm --filter @smartwarehouse/sys-web build` 通过。
- `corepack pnpm --filter @smartwarehouse/portal-shell build` 通过。
- 本次补文档后，`corepack pnpm --filter @smartwarehouse/component-docs build`、`corepack pnpm build:packages`、`corepack pnpm build:remotes` 均通过。
- 浏览器验收通过：已登录从 `/portal` 进入 `/sys/users` 不再出现 `sys-web` 登录页闪现。
- 浏览器验收通过：`/portal` 不显示左侧菜单，顶部固定显示“工作台”按钮和模块抽屉；进入 `/sys/**` 后只显示 sys 菜单。
- 浏览器验收通过：standalone `sys-web` 可独立登录并使用新左侧菜单布局；standalone `wms/mes/ai` 不显示 host 专属入口，也不出现跳转报错。

.gitignore 更新结果：
- 本次主要为代码与文档收尾，没有新增需要提交的构建产物类型；现有 `.gitignore` 继续覆盖 `node_modules/`、`dist/`、`.vite/`、`target/`、`.env`、`.npmrc`、日志和临时目录。

敏感信息检查结果：
- 未新增真实 token、API Key、私钥、npm 凭证或云厂商密钥。
- 命中项为本地端口、测试账号、字段名、文档规则和示例命令。

README 更新结果：
- 本轮按用户要求重点更新 `docs/plan` 与组件文档，没有额外改动根目录 README。

遗留问题：
- `wms-web`、`mes-web`、`ai-web` 本轮仍未接入新的 standalone 后台壳层，后续如需独立后台布局，应复用本次 `PlatformLayout` 边界，不再把 host 专属入口做成默认行为。
- 工作台消息当前为正式表落库，但仍由初始化 SQL 维护；本轮未做已读状态、消息管理页面和角色定向。

下一步：
- 进入 V03 WMS 版本时，继续沿用“host 负责统一壳层，remote 只负责内容区”的边界，并按需决定乙方模块是否也需要 standalone 标准后台壳层。

相关决策：
- 新增 `docs/plan/decisions/0011-portal-shell-hosted-sys-boundary-and-workbench-model.md`。

相关 skill：
- 继续沿用并落实 `vue-element-plus-module-skill.md` 中的 host/remote、组件文档和页面验收规则。
