# V01 甲方组件库二次开发与最小项目骨架

## 1. 版本状态

```text
状态：TODO
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
    └── component-docs 或 docs/playground
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

必须提供可运行的 playground 或文档演示，至少包含：

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
9. 建设组件 playground 和 VitePress 文档站点。
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
3. playground 或 docs 站点可以运行并展示核心组件。
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
pnpm install
pnpm build
pnpm --filter @smartwarehouse/platform-ui build
pnpm --filter @smartwarehouse/platform-sdk build
pnpm --filter @smartwarehouse/platform-theme build
pnpm --filter @smartwarehouse/platform-types build
pnpm --filter @smartwarehouse/platform-ui publish --dry-run
```

## 15. 实现记录

```text
日期：
实现内容：
前端完成内容：
后端完成内容：无
接口联调结果：本版本使用 mock，不接入真实后端
Jenkins 测试发布结果：V01 仅准备组件构建，Jenkins 从 V02 接入
阿里弹性容器正式发布检查：V01 仅准备组件制品，不部署正式服务
验证命令：
验证结果：
问题记录：
改进记录：
```
