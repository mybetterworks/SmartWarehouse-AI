# V01 甲方组件库二次开发与最小项目骨架

## 1. 版本状态

```text
状态：DONE
负责人：甲方前端团队
前置版本：无
输出结果：可复用的甲方前端组件库、SDK、主题、类型包和最小项目骨架
```

## 2. 版本开发输入边界

本文件已经内置本版本需要的设计信息。开发 V01 时以本文件、`docs/plan/ROADMAP.md`、`docs/plan/DEVELOPMENT_RULE.md`、`docs/plan/PROGRESS.md` 为准，不需要再读取 `docs/design` 下的设计文档。

本版本只做甲方前端组件库二次封装、前端平台 workspace 和最小根目录骨架，不开发 Java 微服务业务逻辑，不开发 WMS/MES/AI 业务页面，不接入真实后端接口。

## 3. 版本目标

1. 初始化 SmartWarehouse-AI 最小开发根目录骨架。
2. 初始化 `frontend-platform`，作为甲方前端底座和组件库 workspace。
3. 创建并实现 `platform-ui`、`platform-sdk`、`platform-theme`、`platform-types`。
4. 基于 Element Plus 封装第一批企业后台高频组件。
5. 建设组件演示项目和 VitePress 组件文档站点。
6. 准备阿里云效 npm snapshot 发布配置，保证 token 不进入仓库或镜像。
7. 为后续 `portal-shell`、`sys-web`、`wms-web`、`mes-web`、`ai-web` 复用平台包打基础。

## 4. 项目与代码架构

### 4.1 根目录最小骨架

V01 允许创建以下根目录占位或最小工程入口：

```text
SmartWarehouse-AI
├── README.md
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

本版本的主要实现目录是：

```text
frontend-platform
├── pnpm-workspace.yaml
├── package.json
├── packages
│   ├── platform-ui
│   ├── platform-sdk
│   ├── platform-theme
│   └── platform-types
└── apps
    └── docs
```

### 4.2 甲方平台包职责

| 包名 | 职责 |
|---|---|
| `@smartwarehouse/platform-ui` | 基于 Element Plus 的企业后台组件库，不重写 Element Plus 基础组件。 |
| `@smartwarehouse/platform-sdk` | 统一 request、auth、token、permission、dict、user、org、file 能力的前端 SDK。 |
| `@smartwarehouse/platform-theme` | 主题变量、Element Plus 样式覆盖、页面背景、间距、圆角、表格密度等统一样式。 |
| `@smartwarehouse/platform-types` | 用户、角色、菜单、字典、组织、模块注册、分页、统一响应等共享类型定义。 |

### 4.3 乙方复用边界

后续 `wms-web`、`mes-web`、`ai-web` 只能通过 npm 包复用甲方能力：

```ts
import { DictSelect, PermissionButton } from '@smartwarehouse/platform-ui'
import { request } from '@smartwarehouse/platform-sdk'
```

禁止通过相对路径引用甲方源码：

```ts
import { DictSelect } from '../frontend-platform/packages/platform-ui/src'
```

## 5. 业务功能要求

本版本的业务功能是“前端平台能力准备”，不直接实现制造或仓储业务流程。

必须完成的组件：

| 组件 | 作用 | 后续业务场景 |
|---|---|---|
| `PlatformPage` | 页面统一容器，统一标题区、工具区、内容区和页边距。 | sys、wms、mes、ai 所有后台页面。 |
| `PlatformSearchForm` | 标准查询表单，支持展开收起、重置、搜索。 | 用户列表、物料列表、工单列表、库存列表。 |
| `PlatformTable` | 标准列表表格，支持 loading、分页、空态、错误态、操作列。 | 业务数据列表页。 |
| `PlatformModalForm` | 标准弹窗表单，统一提交、取消、loading。 | 新增/编辑用户、物料、工单。 |
| `PermissionButton` | 权限按钮，根据权限码控制显示或禁用。 | `sys:user:create`、`wms:material:add` 等按钮权限。 |
| `DictSelect` | 字典下拉，支持字典缓存和禁用态。 | 物料类型、状态、入库类型。 |
| `UserSelect` | 用户选择。 | 仓库负责人、操作人筛选。 |
| `OrgTreeSelect` | 组织树选择。 | 部门、组织筛选。 |
| `FileUpload` | 文件上传。 | WMS 离线上传、AI 文档上传。 |
| `ExcelImport` | Excel 导入入口。 | WMS 入库数据导入。 |
| `ExcelExport` | Excel 导出入口。 | 导入错误明细导出、列表导出。 |
| `StatusTag` | 状态标签。 | 工单状态、导入状态、库存预警状态。 |

暂不封装 `ElButton`、`ElInput`、`ElSelect`、`ElDialog`、`ElForm`、`ElTable`、`ElTabs`、`ElMenu` 等基础组件，乙方可直接使用 Element Plus。

## 6. SDK 与接口设计

本版本没有真实后端接口，但必须设计 SDK 形态，供 V02 起接入真实 Gateway。

### 6.1 统一响应类型

```ts
export interface ApiResult<T> {
  code: string
  message: string
  data: T
  traceId?: string
}
```

### 6.2 分页类型

```ts
export interface PageQuery {
  pageNo: number
  pageSize: number
}

export interface PageResult<T> {
  records: T[]
  total: number
  pageNo: number
  pageSize: number
}
```

### 6.3 登录与权限类型

```ts
export interface LoginUser {
  userId: string
  username: string
  nickname: string
  roles: string[]
  permissions: string[]
  warehouseIds?: string[]
}

export interface MenuItem {
  id: string
  parentId?: string
  moduleCode: 'sys' | 'wms' | 'mes' | 'task' | 'ai'
  name: string
  path: string
  component?: string
  permission?: string
  visible: boolean
  children?: MenuItem[]
}
```

### 6.4 模块注册类型

后续 `portal-shell` 根据该结构加载各业务模块：

```ts
export interface FrontendModule {
  moduleCode: 'sys' | 'wms' | 'mes' | 'ai'
  moduleName: string
  routePrefix: string
  entryUrl: string
  apiPrefix: string
  ownerType: 'OWNER' | 'VENDOR'
}
```

### 6.5 request SDK 约束

`platform-sdk` 的 request 必须满足：

1. 默认通过相对路径访问 `/api/**`，禁止写死后端域名、IP、端口。
2. 自动携带 Access Token。
3. 支持 401 后刷新 Token 的扩展点，真实刷新逻辑在 V02 实现。
4. 自动透传或读取 `traceId`。
5. 统一处理业务错误码。
6. 支持运行时配置，例如 `/config/runtime-config.json`。

## 7. 前端页面与演示要求

### 7.1 组件演示

必须提供可运行的组件文档站演示，至少包含：

```text
组件总览
PlatformPage 示例
PlatformSearchForm 示例
PlatformTable 示例
PlatformModalForm 示例
PermissionButton 示例
DictSelect 示例
FileUpload 示例
StatusTag 示例
```

### 7.2 文档站点

使用 VitePress 建设组件文档站点，至少包括：

```text
组件用途
基础用法
Props
Events
Slots
示例代码
注意事项
版本变更
```

建议文档路径：

```text
frontend-platform/packages/platform-ui/docs/components/permission-button.md
frontend-platform/packages/platform-ui/docs/components/dict-select.md
frontend-platform/packages/platform-ui/docs/components/platform-table.md
```

## 8. 数据库设计

本版本不创建业务表，也不创建数据库迁移脚本。

组件演示可使用 mock 数据，但类型设计必须兼容后续表结构：

```text
sys_dict_type
sys_dict_item
sys_menu
sys_frontend_module
sys_user
sys_role
```

V01 不允许为了演示而引入真实账号、真实 token、真实云效 registry 凭证。

## 9. 制品与发布设计

### 9.1 npm 包命名

```text
@smartwarehouse/platform-ui
@smartwarehouse/platform-sdk
@smartwarehouse/platform-theme
@smartwarehouse/platform-types
```

### 9.2 版本规则

```text
正式版本：1.0.0、1.1.0
联调版本：1.0.1-snapshot.1、1.1.0-beta.1
```

### 9.3 阿里云效 npm 仓库

必须预留 release / snapshot 仓库配置，但不得提交真实 token：

```text
@smartwarehouse:registry=${SMARTWAREHOUSE_NPM_REGISTRY}
//registry.example.com/:_authToken=${SMARTWAREHOUSE_NPM_TOKEN}
```

`.npmrc` 中如出现真实 token 必须改为示例模板或 Jenkins 凭证注入。

## 10. K8s / Nginx 设计约束

本版本不部署 K8s，但组件库和前端工程必须提前兼容：

1. 构建产物支持独立部署。
2. 前端运行时配置不写死环境地址。
3. 最终镜像不得包含 `.npmrc`、npm token、源码目录或构建缓存。
4. 后续模块路径约定为：

```text
frontend-platform/apps/portal-shell -> /
frontend-platform/apps/sys-web      -> /apps/sys/
wms-web                             -> /apps/wms/
mes-web                             -> /apps/mes/
ai-web                              -> /apps/ai/
```

## 11. 开发步骤提示词

```text
请开发 V01 甲方组件库二次开发与最小项目骨架版本。

要求：
1. 只根据本 milestone、ROADMAP、DEVELOPMENT_RULE、PROGRESS 开发，不再读取 docs/design。
2. 创建 SmartWarehouse-AI 最小目录骨架，重点实现 frontend-platform。
3. 初始化 frontend-platform pnpm workspace。
4. 创建 packages/platform-ui、platform-sdk、platform-theme、platform-types。
5. platform-ui 封装 PlatformPage、PlatformSearchForm、PlatformTable、PlatformModalForm、PermissionButton、DictSelect、UserSelect、OrgTreeSelect、FileUpload、ExcelImport、ExcelExport、StatusTag。
6. platform-sdk 实现 request、token、permission、dict mock、runtime config 基础能力。
7. platform-theme 提供 CSS Variables、Element Plus 样式入口和统一主题变量。
8. platform-types 提供统一响应、分页、用户、菜单、模块注册、字典等类型。
9. 建设 VitePress 企业组件文档站点，公开入口为组件和场景模板。
10. 准备阿里云效 npm snapshot/release 发布脚本，不提交真实 token。
11. 自动检查并更新 .gitignore，避免 node_modules、dist、coverage、.env、本地配置、token 文件进入 Git。
12. 更新本文件实现记录、对应 study、handle、PROGRESS 和根 README。
```

## 12. 自动测试提示词

```text
请验证 V01 甲方组件库二次开发。

检查项：
1. frontend-platform 可以独立 pnpm install。
2. platform-ui、platform-sdk、platform-theme、platform-types 可以独立 build。
3. docs 站点可以运行并展示核心组件和场景模板。
4. PermissionButton 能根据权限码显示/隐藏。
5. DictSelect 能加载 mock 字典并支持 v-model。
6. PlatformTable 能展示分页、loading、空态和操作列。
7. request SDK 默认访问相对路径 /api/**。
8. 构建产物不包含 .npmrc、npm token、私有 registry 凭证。
9. npm publish 可以 dry-run。
10. git diff 只包含本版本允许修改的文件。
```

## 13. 验收标准

1. 甲方组件库可构建。
2. 组件演示页面可运行。
3. 平台 SDK 提供统一请求、Token 工具、权限工具和运行时配置入口。
4. 主题和类型包可被业务前端引用。
5. 阿里云效 npm snapshot/release 发布准备完成，真实凭证不入库。
6. 后续 V02、V03、V04、V05 可以直接通过 `@smartwarehouse/*` 包复用平台能力。

## 14. 验收操作过程

```powershell
cd frontend-platform
corepack pnpm install
corepack pnpm build
corepack pnpm --filter @smartwarehouse/platform-ui build
corepack pnpm --filter @smartwarehouse/platform-sdk build
corepack pnpm --filter @smartwarehouse/platform-theme build
corepack pnpm --filter @smartwarehouse/platform-types build
corepack pnpm --filter @smartwarehouse/platform-ui publish --dry-run --no-git-checks
```

## 15. 实现记录

```text
日期：2026-06-11
实现内容：完成 SmartWarehouse-AI 最小根目录骨架和 frontend-platform 甲方组件库 workspace。
前端完成内容：
- 创建 frontend-platform pnpm workspace。
- 创建 @smartwarehouse/platform-types，提供统一响应、分页、用户、菜单、模块注册、字典、表格等共享类型。
- 创建 @smartwarehouse/platform-sdk，提供 runtime config、request、token、permission、dict mock 能力，request 默认走 /api/** 相对路径。
- 创建 @smartwarehouse/platform-theme，提供 CSS Variables、Element Plus 主题覆盖和统一样式入口。
- 创建 @smartwarehouse/platform-ui，封装 PlatformPage、PlatformSearchForm、PlatformTable、PlatformModalForm、PermissionButton、DictSelect、UserSelect、OrgTreeSelect、FileUpload、ExcelImport、ExcelExport、StatusTag。
- 创建 apps/docs VitePress 文档与组件演示站点。
- 创建 deploy、platform、gateway、sys、task、mes、wms、ai、wms-web、mes-web、ai-web 最小占位说明。
后端完成内容：无
接口联调结果：本版本使用 mock，不接入真实后端
Jenkins 测试发布结果：V01 仅准备组件构建，Jenkins 从 V02 接入
阿里弹性容器正式发布检查：V01 仅准备组件制品，不部署正式服务
验证命令：
- corepack pnpm install
- corepack pnpm build
- corepack pnpm --filter @smartwarehouse/platform-ui publish --dry-run --no-git-checks
- 浏览器访问 http://localhost:5173/ 验证组件演示
- rg -n -i "password|pwd|secret|token|api[_-]?key|access[_-]?key|secret[_-]?key|_authToken|Authorization|Bearer|BEGIN PRIVATE KEY|BEGIN RSA PRIVATE KEY|jdbc:mysql://|redis://|amqp://|oss://" frontend-platform deploy platform gateway sys task mes wms ai wms-web mes-web ai-web README.md docs/plan/milestones/V01-owner-component-library.md docs/plan/study/V01-owner-component-library-study.md docs/plan/handle/V01-owner-component-library-handle.md -g '!node_modules' -g '!dist' -g '!coverage' -g '!*.log'
验证结果：
- pnpm install 成功，生成 pnpm-lock.yaml。
- 四个平台包和 VitePress 文档站点构建成功。
- platform-ui dry-run 发布成功，tarball 包含组件声明文件。
- 浏览器验证通过：组件总览、平台组件演示、权限按钮、禁用按钮、表格、文件上传和 Excel 导入均正常渲染。
- .gitignore 已覆盖 node_modules、dist、.vite、.vitepress、.pnpm-store、coverage、.env、.npmrc、日志、证书和 tgz 发布包。
- 敏感信息扫描未发现真实账号、密码、token、API Key、私钥或内部地址；命中项均为占位符、文档说明或 SDK 字段命名。
问题记录：
- 本机未暴露全局 pnpm 命令，已将 workspace 根脚本改为 corepack pnpm，保证 Windows 11 环境可复现。
- 初版 platform-ui 构建顺序导致发布包缺少 .d.ts，已调整为先 Vite build 再 vue-tsc emitDeclarationOnly。
- PermissionButton 使用非响应式权限集合时，挂载后设置权限不会刷新；已在 platform-sdk 增加 permission change 订阅能力，并在 PermissionButton 中订阅刷新。
改进记录：
- VitePress SSR 补充 Element Plus ID/ZIndex provider，消除 SSR provider 警告。
- .gitignore 增加 .vitepress/cache、.vitepress/dist、.pnpm-store、*.tgz、pnpm-debug.log*。
- 已更新 vue-element-plus-module-skill，修正已过期的 docs/design 重复读取流程，并补充 Corepack 和权限状态同步经验。
```

```text
日期：2026-06-11
实现内容：在 V01 当前版本内补全后续开发需要的 frontend-platform 平台组件、SDK 类型和演示文档。
前端完成内容：
- platform-types 增加登录风控、导航菜单、面包屑、表单 schema、统计卡片、排行、预警、导入任务、导入错误、工单物料需求、AI 消息、ChatBI、Agent 步骤、MCP 工具调用和 WebSocket 消息类型。
- platform-sdk 增加用户、组织、仓库、库位、物料、工单 mock 选项源，增加 createWebSocketClient，供后续实时排行、导入进度、预警推送复用。
- platform-ui 增加门户与登录组件：PlatformLayout、SideMenu、BreadcrumbNav、UserDropdown、LoginForm、JigsawCaptcha。
- platform-ui 增加表单与数据组件：PlatformForm、DrawerForm、BatchOperationBar、DictTag，并增强 PlatformTable 的选择列、序号列、排序事件、操作列宽和 pageSizes。
- platform-ui 增加业务选择器：WarehouseSelect、LocationTreeSelect、MaterialSelect、WorkOrderSelect。
- platform-ui 增加 WMS 离线上传组件：UploadProgress、ImportTaskPanel、ImportErrorTable。
- platform-ui 增加 MES 业务组件：MaterialRequirementEditor、ApplyStatusTimeline、DeliveryStatusSteps。
- platform-ui 增加 Task 运营看板组件：DashboardGrid、StatCard、RankList、AlertPanel、RealtimeBadge。
- platform-ui 增加 AI 工作台组件：ChatPanel、PromptInput、MarkdownRenderer、ChatBIResultTable、SqlPreview、AgentStepTimeline、ToolCallTrace。
- platform-ui 增加默认 install(app) 插件入口，同时保留按需导出。
- apps/docs 组件演示页和组件规范文档已按门户、表单、WMS、MES、Task、AI 分组更新。
后端完成内容：无
接口联调结果：本次仍使用 frontend-platform mock 数据源，不接入真实后端；组件 API 已为 V02-V08 对接真实接口预留。
Jenkins 测试发布结果：V01 仍不接入 Jenkins，后续从 V02 开始记录测试环境发布。
阿里弹性容器正式发布检查：V01 不部署正式环境；本次完成 npm dry-run 发布检查，确认平台包可进入阿里云效 npm 私库流程。
验证命令：
- corepack pnpm build:packages
- corepack pnpm build
- corepack pnpm publish:dry-run
- corepack pnpm --filter @smartwarehouse/component-docs dev -- --port 5173
- 浏览器访问 http://127.0.0.1:5173/，检查关键分组文本和控制台错误
- git status --short --ignored frontend-platform docs/plan
- rg -n -i "password|pwd|secret|token|api[_-]?key|access[_-]?key|secret[_-]?key|_authToken|Authorization|Bearer|BEGIN PRIVATE KEY|BEGIN RSA PRIVATE KEY|jdbc:mysql://|redis://|amqp://|oss://" frontend-platform docs/plan -g "!node_modules" -g "!dist" -g "!coverage" -g "!*.log"
验证结果：
- frontend-platform 完整构建成功，四个平台包和 VitePress 文档站均通过。
- publish:dry-run 成功，platform-ui tarball 包含新增组件 .d.ts、样式和运行时代码。
- 浏览器验证通过：平台组件演示页可打开，门户与登录、查询表格与表单、WMS 与 MES、运营统计与 AI 等关键分组均正常显示；控制台无 error。
- .gitignore 已覆盖本次构建产生的 node_modules、dist、.vitepress/cache、.vitepress/dist、tgz 等内容，本次无需新增规则。
- 敏感信息扫描未发现真实账号、密码、token、API Key、私钥或内部地址；命中项为文档安全规则、占位符、字段名、登录表单字段和 pnpm-lock 包名。
问题记录：
- 初次完整构建时 ComponentPlayground 引用了 WorkOrderSelect，但 platform-ui 入口漏导出，已补充导出并复测通过。
- ImportErrorTable 的业务行类型不能直接传给通用 PlatformTable 的 Record 数据类型，已在组件内部转换为 tableRows。
- 浏览器验证时当前浏览器 API 不支持 networkidle 等待状态，已改用 load 状态和页面关键文本/控制台检查。
改进记录：
- V01 组件库已从最小 12 个组件扩展为覆盖后续 V02-V08 高频页面的组件集合。
- 已更新 ROADMAP、PROGRESS、study、handle 和 vue-element-plus-module-skill。
- 本次按用户要求不新增 decisions。
```

```text
日期：2026-06-11
实现内容：以架构师视角评估并落地 frontend-platform 组件文档与 Playground 体系。
最终方案：
- 首页：说明甲方组件库定位、甲方/乙方协作边界、架构师评估结论和文档入口。
- 组件总览：参考 Element Plus Overview 的信息结构，但按 SmartWarehouse-AI 业务域分类展示平台组件。
- 组件详情：核心组件提供效果预览、代码、Props、Events、Slots、注意事项和业务边界。
- Playground：提供可调参数的交互样例，用于验证 PlatformTable、LoginForm、ImportTaskPanel、ChatPanel / ChatBIResultTable 等组件组合。
- 业务场景样例：保留原综合演示页，用于验收门户、查询表格、WMS/MES、运营统计和 AI 工作台整体效果。
前端完成内容：
- 新增 apps/docs/src/componentCatalog.ts，集中维护组件分类、说明、场景和详情链接。
- 新增 ComponentOverview.vue，形成类似组件库官网的组件总览页。
- 新增 PlaygroundWorkbench.vue，提供标准表格、登录风控、WMS 导入、AI ChatBI 四个可调 Playground。
- 新增 examples.md，将原综合演示页从首页迁移为业务场景样例。
- 新增组件详情页：platform-layout、platform-table、platform-form、login-form、business-selects、import-task-panel、material-requirement-editor、dashboard、ai-workbench。
- 更新 VitePress nav/sidebar，形成首页、组件总览、Playground、业务样例、发布说明、核心组件、业务组件的文档导航。
- 更新文档站主题样式，补充总览卡片、预览区、Playground 控制区和代码块样式。
后端完成内容：无
接口联调结果：本次为组件文档和 Playground，不接入真实后端。
Jenkins 测试发布结果：V01 不接入 Jenkins，后续从 V02 开始记录。
阿里弹性容器正式发布检查：V01 不部署正式服务；本次通过 npm dry-run 验证平台包发布流程仍可用。
验证命令：
- corepack pnpm build
- corepack pnpm publish:dry-run
- corepack pnpm --filter @smartwarehouse/component-docs dev -- --port 5173 --host 127.0.0.1
- 静态构建产物关键词检查：首页、组件总览、Playground、业务样例、PlatformTable 详情、AI 工作台详情
验证结果：
- frontend-platform 完整构建成功，平台包和 VitePress 文档站均通过。
- publish:dry-run 成功，四个平台包均可 dry-run 发布。
- HTTP 检查确认首页、组件总览、Playground、业务样例路由返回 200。
- 浏览器插件访问 localhost 被浏览器侧拦截，已改用 VitePress 构建产物和 HTTP 状态验证。
- .vitepress/dist 静态产物关键词检查全部通过。
问题记录：
- VitePress dev server 返回客户端入口壳，直接 HTTP 搜索页面正文不可靠；改为检查构建后的 SSR 静态 HTML。
- 内置浏览器插件打开 localhost / 127.0.0.1 时被 `ERR_BLOCKED_BY_CLIENT` 拦截，本次未继续绕行。
改进记录：
- 新增决策 `docs/plan/decisions/0004-component-docs-and-playground-structure.md`。
- 已更新 ROADMAP、PROGRESS、study、handle 和 vue-element-plus-module-skill。
```

```text
日期：2026-06-11
实现内容：将 frontend-platform/apps/docs 从项目演示型文档站重构为企业级自定义组件库文档站。
最终方案：
- 公开模块只保留两个：组件、Playground。
- 组件模块使用 /component/overview 作为入口，提供左侧组件分类、中间正文文档、右侧 CONTENTS 锚点、组件总览和核心组件详情。
- Playground 使用 /playground，提供版本工具栏、代码编辑区、预设预览区、Reset 和 Copy 操作。
- 旧 /、/components、/examples、/release 路径仅作为兼容入口，不再作为公开模块维护。
- 本次没有修改 @smartwarehouse/platform-ui、platform-sdk、platform-theme、platform-types 的对外 API。
前端完成内容：
- 更新 VitePress nav/sidebar，顶部导航仅保留“组件”和“Playground”，/component 路径启用组件侧边栏和 CONTENTS。
- 重构 componentCatalog.ts，增加 slug、group、groupName、docsPath、playgroundPreset、since、tags 等企业组件库元数据。
- 新增 /component/overview.md 和 9 个核心组件/组件组详情页：platform-layout、platform-table、platform-form、login-form、business-selects、import-task-panel、material-requirement-editor、dashboard、ai-workbench。
- 重写 ComponentOverview.vue，将分类从项目业务域调整为基础 / Layout、数据录入、数据展示、反馈与流程、业务组件、智能组件。
- 重写 PlaygroundWorkbench.vue，形成类似 Element Plus Playground 的分栏工作台；因本地 workspace 包在浏览器 import map 中存在兼容风险，本次采用可运行的预设 Playground 降级方案，并保留代码编辑与预览体验。
- 更新旧入口 index.md、components.md、examples.md、release.md 为兼容跳转或轻量提示页。
- 更新 VitePress 主题样式，补充企业组件库总览、组件索引、API 文档、代码编辑区、预览区和响应式布局。
后端完成内容：无。
接口联调结果：本次为组件文档站重构，不接入真实后端。
Jenkins 测试发布结果：V01 不接入 Jenkins，V02 开始记录。
阿里弹性容器正式发布检查：V01 不部署正式服务；npm dry-run 发布检查通过。
验证命令：
- corepack pnpm build:packages
- corepack pnpm build
- corepack pnpm publish:dry-run
- corepack pnpm --filter @smartwarehouse/component-docs dev
- HTTP 检查 /component/overview、/component/platform-table、/playground 返回 200
- 浏览器检查桌面和移动端核心布局
- .gitignore 规则检查
- 敏感信息扫描
验证结果：
- platform-types、platform-theme、platform-sdk、platform-ui 构建成功。
- VitePress 文档站构建成功，新 /component 路由和 /playground 均生成静态页面。
- publish:dry-run 成功，平台包发布流程不受文档站重构影响。
- 浏览器验证通过：/component/overview 具备企业组件库总览，/component/platform-table 具备 Demo、代码和 API 表，/playground 具备版本工具栏、代码编辑区和预览区；移动端无明显文字重叠。
- .gitignore 已覆盖 node_modules、dist、.vitepress/cache、.vitepress/dist、.npmrc、.env、*.tgz 等，本次无需新增规则。
- 敏感信息扫描未发现真实账号、密码、token、API Key、私钥或内部地址；命中项均为文档安全规则、占位符或字段命名。
问题记录：
- 真实 @vue/repl 需要浏览器端 import map 稳定加载 workspace 构建包；当前本地组件库更适合采用预设 Playground，避免引入无法稳定验收的运行时编译风险。
改进记录：
- 决策 0004 已标记为 SUPERSEDED。
- 新增决策 0005，记录企业组件库两模块结构。
- 已更新 ROADMAP、DEVELOPMENT_RULE、PROGRESS、study、handle、vue-element-plus-module-skill 和根 README。
```

```text
日期：2026-06-11
实现内容：修复企业组件文档站表格布局问题。
问题背景：
- 组件详情页中的 Element Plus 表格标题行与第一行之间出现异常空白，多个表格均受影响。
- MaterialRequirementEditor 的“工单所需物料”表格宽度超出中间“基础用法”预览容器。
原因分析：
- VitePress `.vp-doc` 默认 Markdown 表格样式会作用到 Element Plus 内部 table、tr、th、td，导致 Element Plus 表格布局出现异常间距。
- MaterialRequirementEditor 原列宽总和超过文档 Demo 容器可用宽度，同时表头/表体强制横向滚动会在表头下方形成类似空白行的横向条。
前端完成内容：
- 在 apps/docs/.vitepress/theme/style.css 中为 `.vp-doc .el-table` 内部 table、tr、th、td 增加局部 reset，只清理 VitePress Markdown 表格污染，不覆盖 Element Plus 自身列宽算法。
- 在 MaterialRequirementEditor 中缩小物料、需求数量、单位、已分配、状态和操作列宽。
- 移除 MaterialRequirementEditor 表格表头/表体强制 `overflow-x: auto` 样式，使表格在文档 Demo 容器内自然展示。
- 调整 PlatformTable 文档示例列宽和 `actions-width`，保证状态列和操作列在当前文档内容宽度下完整展示。
后端完成内容：无。
接口联调结果：本次为组件文档站和组件样式修复，不接入真实后端。
Jenkins 测试发布结果：V01 不接入 Jenkins，V02 开始记录。
阿里弹性容器正式发布检查：V01 不部署正式服务；npm dry-run 发布检查通过。
验证命令：
- corepack pnpm build:packages
- corepack pnpm build
- corepack pnpm publish:dry-run
- 浏览器访问 /component/material-requirement-editor
- 浏览器访问 /component/platform-table
- rg -n -i "password|pwd|secret|token|api[_-]?key|access[_-]?key|secret[_-]?key|_authToken|Authorization|Bearer|BEGIN PRIVATE KEY|BEGIN RSA PRIVATE KEY|jdbc:mysql://|redis://|amqp://|oss://" frontend-platform docs/plan README.md -g "!**/node_modules/**" -g "!**/dist/**" -g "!**/.vitepress/cache/**" -g "!**/.vitepress/dist/**" -g "!**/coverage/**" -g "!**/*.log"
验证结果：
- MaterialRequirementEditor 表头与第一行间距为 0，表格未超出基础用法容器，页面无横向溢出。
- PlatformTable 表头与第一行间距为 0，状态列和操作列完整展示，表格未超出基础用法容器。
- frontend-platform 完整构建成功，VitePress 文档站构建成功。
- publish:dry-run 成功，四个平台包均可 dry-run 发布。
- .gitignore 已覆盖 node_modules、dist、.vitepress/cache、.vitepress/dist、.npmrc、.env、*.tgz、日志和密钥文件，本次无需新增规则。
- 敏感信息扫描未发现真实账号、密码、token、API Key、私钥或内部地址；命中项均为文档安全规则、占位符或字段命名。
改进记录：
- 已更新 PROGRESS、study、handle、vue-element-plus-module-skill 和根 README。
- 本次属于 V01 视觉与文档站质量修复，无新增重大设计取舍，不新增 decisions。
```

```text
日期：2026-06-12
实现内容：修复企业组件文档站展示一致性问题，并统一示例代码 TypeScript 规范。
问题背景：
- LoginForm 登录表单详情页“基础用法”外层方框宽度与其他组件 Demo 容器不一致。
- AI Workbench 智能工作台详情页“基础用法”中的 ChatBI、SQL、Agent、MCP 工具调用等内容会超出外部方框。
- 组件详情页和 Playground 中的示例代码需要明确使用 TypeScript 语法，避免乙方复制示例后再补类型。
原因分析：
- LoginForm 为了保持登录表单自身宽度，直接缩窄了外层 `.sw-doc-preview`，导致文档站 Demo 容器视觉不统一。
- AI 工作台内部包含表格、SQL 代码、Agent 步骤和工具调用 JSON 等长内容，组件样式和 VitePress `.vp-doc pre/code` 默认样式叠加后，部分长内容没有按文档容器换行。
- 旧示例代码存在标题只写“示例代码”、代码块未统一声明 `<script setup lang="ts">` 的情况，不利于企业级组件库的强类型复制使用。
前端完成内容：
- LoginForm 详情页外层恢复标准 `.sw-doc-preview`，新增 `.sw-doc-preview__center` 作为内部居中窄容器，保证外框宽度统一且表单仍保持合适宽度。
- AI Workbench 详情页补充 TypeScript 类型导入和适合文档容器的 ChatBI 列宽。
- platform-ui 样式补充 AI 工作台、ChatBI、SQL、Agent、MCP 工具调用等容器的 `min-width: 0`、`max-width: 100%`、`overflow-wrap` 和 `pre-wrap`。
- VitePress theme 样式补充 `.sw-doc-preview` 子元素收缩、居中容器，以及 `.vp-doc` 下 AI 代码块的高优先级换行规则。
- 组件详情页公开路径 `/component/*.md` 与兼容路径 `/components/*.md` 的示例标题统一为 `示例代码（Vue + TypeScript）`，Vue 示例代码块统一包含 `<script setup lang="ts">`。
- Playground 预设代码统一为 Vue + TypeScript SFC 片段；在 Vue 字符串中保留闭合 `script` 标签时使用 `<\/script>`，避免破坏外层 SFC 编译。
后端完成内容：无。
接口联调结果：本次为组件文档站展示与示例代码规范修复，不接入真实后端。
Jenkins 测试发布结果：V01 不接入 Jenkins，V02 开始记录。
阿里弹性容器正式发布检查：V01 不部署正式服务；npm dry-run 发布检查通过。
验证命令：
- corepack pnpm build
- corepack pnpm publish:dry-run
- 浏览器访问 /component/login-form
- 浏览器访问 /component/ai-workbench
- Node 脚本检查 component 与 components 目录下 Vue 示例代码块是否包含 `<script setup lang="ts">`
- rg -n -i "password|pwd|secret|token|api[_-]?key|access[_-]?key|secret[_-]?key|_authToken|Authorization|Bearer|BEGIN PRIVATE KEY|BEGIN RSA PRIVATE KEY|jdbc:mysql://|redis://|amqp://|oss://" frontend-platform docs/plan README.md -g "!**/node_modules/**" -g "!**/dist/**" -g "!**/.vitepress/cache/**" -g "!**/.vitepress/dist/**" -g "!**/coverage/**" -g "!**/*.log"
验证结果：
- LoginForm 外层基础用法方框宽度与其他组件一致，表单在内部居中显示，页面无横向溢出。
- AI Workbench 基础用法内容未超出外部方框，SQL / Agent / MCP 长内容在容器内换行，页面无横向溢出。
- 示例代码标题均已标注 `Vue + TypeScript`，Vue 示例代码块均包含 `<script setup lang="ts">`。
- frontend-platform 完整构建成功，VitePress 文档站构建成功。
- publish:dry-run 成功，四个平台包均可 dry-run 发布；registry 登录提示为 dry-run 场景下的预期提示。
- .gitignore 已覆盖 node_modules、dist、.vitepress/cache、.vitepress/dist、.npmrc、.env、*.tgz、日志和密钥文件，本次无需新增规则。
- 敏感信息扫描未发现真实账号、密码、token、API Key、私钥或内部地址；命中项均为文档安全规则、占位符、字段名或 pnpm-lock 包名。
改进记录：
- 已更新 PROGRESS、study、handle、vue-element-plus-module-skill 和根 README。
- 本次属于 V01 组件文档站质量修复，无新增重大设计取舍，不新增 decisions。
```

```text
日期：2026-06-12
实现内容：将 frontend-platform/apps/docs 企业组件文档站调整为“组件 / 场景模板 / Playground”三入口结构。
问题背景：
- 当前组件页按大块功能组合展示，更像业务场景模板，不符合企业组件库按单组件查找、阅读 API 和复制示例的主要诉求。
- 仍需要保留原大块功能组合展示价值，因此将其改名为“场景模板”，与单组件目录分开。
前端完成内容：
- 顶部公开导航调整为“组件”“场景模板”“Playground”。
- `/component/overview` 改为业务无关的组件级总览，分类为基础、布局、数据录入、数据展示、反馈与流程、高级组件，并覆盖用户要求的组件清单。
- 新增 `/scenario/overview`，承载标准后台布局、标准页面容器、登录风控模板、标准查询表格模板、Schema 表单模板、业务选择器模板、离线导入模板、物料需求流程模板、运营看板模板和 AI 工作台模板。
- 新增 `CatalogOverview.vue`，让组件页和场景模板页复用统一总览展示逻辑。
- 重构 `componentCatalog.ts`，集中维护 `componentGroups`、`componentCatalog`、`scenarioTemplateGroups`、`scenarioTemplateCatalog`。
- 更新 VitePress sidebar，让 `/component/` 与 `/scenario/` 分别读取对应元数据生成导航。
后端完成内容：无。
接口联调结果：本次为组件文档站信息架构调整，不接入真实后端。
Jenkins 测试发布结果：V01 不接入 Jenkins，V02 开始记录。
阿里弹性容器正式发布检查：V01 不部署正式服务；npm dry-run 发布检查通过。
验证命令：
- corepack pnpm --filter @smartwarehouse/component-docs build
- corepack pnpm build
- corepack pnpm publish:dry-run
- 浏览器访问 /component/overview、/scenario/overview、/playground
- .gitignore 规则检查
- 敏感信息扫描
验证结果：
- 文档站构建成功，完整构建和 dry-run 通过。
- HTTP 检查 /component/overview、/scenario/overview、/playground 均返回 200。
- 浏览器验证通过：/component/overview 展示组件级目录，/scenario/overview 展示多组件组合模板，/playground 保持可用。
- 顶部公开导航为三个一级入口：组件、场景模板、Playground。
- 组件页全量目录检查通过：45 个组件均命中，6 个组件分类均命中。
- 场景模板页全量目录检查通过：10 个模板均命中，4 个模板分类均命中。
- 移动端 390px 宽度检查通过，三个入口均无横向溢出。
- 组件总览和场景模板总览复用 CatalogOverview.vue，无重复总览 UI 实现。
- .gitignore 无需新增规则；敏感信息扫描未发现真实密钥。
改进记录：
- 决策 0005 已标记为 SUPERSEDED。
- 新增决策 0006，记录企业组件库文档站三入口结构。
- 已更新 README、ROADMAP、DEVELOPMENT_RULE、PROGRESS、study、handle 和 vue-element-plus-module-skill。
```

```text
日期：2026-06-12
实现内容：将组件入口补强为严格单组件详情文档，场景模板入口承载所有多组件组合内容。
问题背景：
- 三入口结构完成后，组件页虽然已按组件清单展示，但部分组件详情仍复用旧组合页面，例如 WarehouseSelect / LocationTreeSelect / MaterialSelect / WorkOrderSelect 指向 business-selects，DashboardGrid / StatCard / RankList / AlertPanel / RealtimeBadge 指向 dashboard，ChatPanel / ChatBI / Agent / MCP 相关组件指向 ai-workbench。
- 用户确认组件页应该独立展示每个底层组件的样式、代码、参数等信息，不应该展示场景模板正文。
前端完成内容：
- 重写 apps/docs/src/componentCatalog.ts，所有 componentCatalog 条目均使用 /component/<slug>；所有 scenarioTemplateCatalog 条目均使用 /scenario/<slug>。
- 新增 apps/docs/src/componentDocs.ts 和 ComponentDetail.vue，集中维护单组件 Props、Events、Slots、Types、Vue + TypeScript 示例代码、基础用法 Demo、注意事项和关联场景模板。
- 新增 apps/docs/src/scenarioTemplateDocs.ts 和 ScenarioTemplateDetail.vue，集中维护场景模板详情、底层组件链接、组合 Demo 和模板示例代码。
- 为 45 个组件生成独立 /component/<slug> 页面；为 10 个模板生成独立 /scenario/<slug> 页面。
- 将 /component/business-selects、/component/dashboard、/component/ai-workbench 改为迁移提示页；将旧 /components/* 兼容路径改为跳转提示，避免继续暴露旧组合正文。
- 更新 .vitepress/config.ts，恢复正常中文导航、侧边栏和 CONTENTS 配置。
- 更新 .vitepress/theme/style.css，补充组件详情页、API 表格、关联模板链接、布局组件预览和统一 Demo 容器样式。
后端完成内容：无。
接口联调结果：本次为组件文档站重构，不接入真实后端。
Jenkins 测试发布结果：V01 不接入 Jenkins，V02 开始记录。
阿里弹性容器正式发布检查：V01 不部署正式服务；npm dry-run 发布检查通过。
验证命令：
- corepack pnpm --filter @smartwarehouse/component-docs build
- corepack pnpm build
- corepack pnpm publish:dry-run
- VitePress preview HTTP 检查 /component/overview、/component/status-tag、/component/warehouse-select、/component/chat-panel、/scenario/overview、/scenario/ai-workbench、/playground
验证结果：
- 文档站构建成功，完整构建成功，publish:dry-run 成功。
- 组件总览、单组件详情、场景模板总览、场景模板详情和 Playground 路由均可访问。
- 组件侧边栏全部指向 /component/<slug>，场景模板侧边栏全部指向 /scenario/<slug>。
- 旧组合组件页只显示迁移提示，不再承载组合正文。
- preview 端口 4174 验证后已关闭。
问题记录：
- preview 第一次通过 pnpm script 传参时参数被包装，仍尝试占用默认 4173；改为在 apps/docs 下直接执行 corepack pnpm exec vitepress preview . --host 127.0.0.1 --port 4174。
- 本地未安装 Playwright，且没有可调用的 in-app browser 工具；本次采用构建、静态产物和 HTTP 路由验证作为兜底。
改进记录：
- 新增决策 0007，记录“组件入口必须保持单组件详情边界，组合内容只能进入场景模板”。
- 已更新 README、ROADMAP、PROGRESS、study、handle 和 vue-element-plus-module-skill。
```

```text
日期：2026-06-12
实现内容：删除预设式静态 Playground，组件文档站公开入口收敛为“组件 / 场景模板”。
问题背景：
- 当前 Playground 只能静态演示固定预设和对应代码，不能像 Element Plus 官网 Playground 一样在线修改代码并实时显示样式。
- 静态 Playground 与场景模板能力重复，继续保留会增加维护成本并让企业组件库文档站显得功能混乱。
前端完成内容：
- 删除 frontend-platform/apps/docs/playground.md。
- 删除 frontend-platform/apps/docs/src/PlaygroundWorkbench.vue。
- 删除 frontend-platform/apps/docs/src/ComponentPlayground.vue。
- 更新 .vitepress/config.ts，顶部公开导航只保留“组件”“场景模板”。
- 更新 componentCatalog.ts，删除 playgroundPreset 字段和所有 Playground 预设配置。
- 更新 .vitepress/theme/style.css，删除 .sw-playground* 和 .sw-repl* 专属样式。
- 更新 index.md、examples.md、release.md、component/overview.md、scenario/overview.md，去掉 /playground 链接和 Playground 预设说明。
后端完成内容：无。
接口联调结果：本次为组件文档站信息架构收口，不接入真实后端。
Jenkins 测试发布结果：V01 不接入 Jenkins，V02 开始记录。
阿里弹性容器正式发布检查：V01 不部署正式服务；npm dry-run 发布检查通过。
验证命令：
- corepack pnpm --filter @smartwarehouse/component-docs build
- corepack pnpm build
- corepack pnpm publish:dry-run
- corepack pnpm exec vitepress preview . --host 127.0.0.1 --port 4174
验证结果：
- 文档站构建成功，完整构建成功，publish:dry-run 成功。
- VitePress preview HTTP 检查 /component/overview、/component/status-tag、/component/warehouse-select、/component/chat-panel、/scenario/overview、/scenario/ai-workbench 均返回 200。
- /playground 返回 404，.vitepress/dist/playground.html 不存在。
- Browser 验证 /component/overview 与 /scenario/overview 可见导航中不包含 Playground。
- preview 端口 4174 验证后已关闭。
.gitignore 与敏感信息：
- .gitignore 已覆盖 node_modules、dist、.vitepress/cache、.vitepress/dist、.npmrc、.env、*.tgz、日志、密钥、本地配置和 .tmp*/，本次无需新增规则。
- 敏感信息扫描未发现真实账号、密码、token、API Key、私钥或内部地址；命中项均为文档规则、示例占位符、字段名、示例 registry 或历史决策说明。
改进记录：
- 决策 0006 已标记为 SUPERSEDED。
- 新增决策 0008，记录删除预设式静态 Playground，当前有效入口为组件和场景模板。
- 已更新 README、ROADMAP、DEVELOPMENT_RULE、PROGRESS、study、handle 和 vue-element-plus-module-skill。
```

```text
日期：2026-06-12
实现内容：检查并补强 frontend-platform 源码中文注释，落实“学习友好、关键代码说明、业务边界说明”的开发规则。
问题背景：
- 用户要求开发代码时增加详细中文注释，包括方法、类、关键代码行等，便于个人实践项目学习理解。
- frontend-platform 中部分轻量组件只有中文 UI 文案，没有源码层面的职责边界和设计原因说明。
前端完成内容：
- platform-sdk：为 runtime config、request、token、permission、dict、options、websocket 和统一导出入口补充中文注释，说明环境切换、Token 刷新扩展点、权限订阅、mock 数据替换和 WebSocket 重连边界。
- platform-types：为共享类型补充中文注释，说明模块边界、登录风控、菜单权限、运行时配置、表格表单、离线导入、工单物料、AI 消息、Agent 步骤和 MCP 工具调用含义。
- platform-ui：为布局、页面、菜单、面包屑、用户菜单、状态标签、字典、选择器、上传导入导出、表格表单、批量操作、任务进度、流程状态、看板、实时状态、AI 输入、SQL 预览、Markdown、Agent 时间线和工具轨迹等组件补充中文注释。
- apps/docs/src：为组件总览、场景模板总览、目录元数据、单组件详情、场景模板详情和 mock 示例数据补充中文注释。
注释原则：
- 说明业务含义、设计原因、接口替换点、安全边界和后续接入方式。
- 避免只重复语法含义的空注释。
后端完成内容：无。
接口联调结果：本次为前端源码注释增强，不接入真实后端。
Jenkins 测试发布结果：V01 不接入 Jenkins，V02 开始记录。
阿里弹性容器正式发布检查：V01 不部署正式服务。
验证命令：
- rg --files-without-match "//.*[一-龥]|<!--.*[一-龥]|/\\*.*[一-龥]" frontend-platform/packages/platform-ui/src/components frontend-platform/packages/platform-ui/src/hooks frontend-platform/packages/platform-sdk/src frontend-platform/packages/platform-types/src frontend-platform/apps/docs/src -g "*.ts" -g "*.vue"
- corepack pnpm build
验证结果：
- 注释覆盖检查通过，检查范围内的 ts/vue 源码文件均包含中文说明。
- frontend-platform 完整构建成功，四个平台包和 VitePress 文档站均通过。
- VitePress 构建仍有空 chunk、第三方依赖 #__PURE__ 注释和 chunk 大小提示，不影响构建结果。
.gitignore 与敏感信息：
- .gitignore 已覆盖 node_modules、dist、.vitepress/cache、.vitepress/dist、.npmrc、.env、*.tgz、日志、密钥、本地配置和 .tmp*/，本次无需新增规则。
- 敏感信息扫描未发现真实账号、密码、token、API Key、私钥或内部地址；命中项均为字段名、示例占位符或安全规则说明。
改进记录：
- 已更新 README、PROGRESS、study 和 handle。
- 本次不涉及重大架构取舍，不新增 decisions。
```
