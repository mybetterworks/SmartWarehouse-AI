# 基于 Element Plus 的前端组件二次封装说明

## 1. 目标

本文档用于说明如何基于 Element Plus 建设企业级前端平台组件库，供甲方统一维护，并提供给多个乙方业务模块使用。

核心目标：

- 统一前端页面风格和交互规范。
- 降低乙方重复开发成本。
- 统一权限、字典、用户、组织、上传下载等平台能力。
- 甲方负责前端项目底座、统一登录入口和 `sys-web` 系统管理页面。
- WMS、MES、AI 由不同乙方分别负责各自业务前端开发。
- 通过 `portal-shell` 提供一个登录页面，登录后访问所有后端服务对应的前端模块。
- 保持乙方业务模块独立开发、独立构建、独立发布。
- 避免每个乙方自行封装一套不同风格的组件。

基本原则：

```text
Element Plus 负责基础 UI 能力
甲方组件库负责企业业务场景封装
乙方模块负责具体业务页面开发
```

不建议甲方重新封装所有 Element Plus 基础组件，例如 `el-button`、`el-input`、`el-select`。更合理的方式是：普通基础组件直接使用 Element Plus，高频企业业务场景由甲方封装。

## 2. 推荐技术栈

建议使用：

- Vue 3
- TypeScript
- Vite
- Element Plus
- Pinia
- Vue Router
- pnpm
- VitePress 作为组件演示和文档站点工具

组件库建议发布为 npm 包：

```text
@smartwarehouse/platform-ui
@smartwarehouse/platform-sdk
@smartwarehouse/platform-theme
@smartwarehouse/platform-icons
@smartwarehouse/platform-types
```

## 3. 推荐封装范围

第一期不建议做太大，优先封装最影响统一性的企业后台组件。

建议第一期封装：

| 组件 | 作用 |
|---|---|
| `PlatformPage` | 页面统一容器 |
| `PlatformSearchForm` | 标准查询表单 |
| `PlatformTable` | 标准列表表格 |
| `PlatformModalForm` | 弹窗表单 |
| `PermissionButton` | 权限按钮 |
| `DictSelect` | 字典下拉 |
| `UserSelect` | 用户选择 |
| `OrgTreeSelect` | 组织树选择 |
| `FileUpload` | 文件上传 |
| `ExcelImport` | Excel 导入 |
| `ExcelExport` | Excel 导出 |
| `StatusTag` | 状态标签 |

暂不建议全量封装：

- `ElButton`
- `ElInput`
- `ElSelect`
- `ElDialog`
- `ElForm`
- `ElTable`
- `ElTabs`
- `ElMenu`

这些基础组件可以允许乙方直接使用。

## 4. 项目结构

SmartWarehouse-AI 前端结构统一采用：

```text
甲方平台前端基座 + 乙方业务前端独立项目
```

当前项目仍可放在 SmartWarehouse-AI 根目录下统一 Git 管理，但前端开发、构建、发布和权限边界应按照独立项目处理。甲方平台前端用于维护统一登录入口、门户基座、组件库、SDK、主题、类型定义、系统管理前端和组件文档。乙方业务前端模块独立开发，通过阿里云效 npm 制品仓库安装甲方发布的平台包。

推荐前端项目直接放在 SmartWarehouse-AI 项目根目录，与 `gateway`、`sys`、`wms`、`mes`、`ai` 等后端项目平级：

```text
frontend-platform
  packages
    platform-ui
    platform-sdk
    platform-theme
    platform-types
  apps
    portal-shell
    sys-web

wms-web

mes-web

ai-web
```

其中：

- `frontend-platform` 由甲方维护，负责前端平台、统一登录页、门户基座、组件库、SDK、主题、类型定义、组件文档和系统管理前端。
- `portal-shell` 由甲方维护，提供统一登录页面、Token 管理、菜单装载、模块入口和微前端加载能力。用户登录一次后，可以通过 Gateway 访问 `sys`、`wms`、`mes`、`task`、`ai` 等服务。
- `sys-web` 由甲方维护，负责用户、角色、菜单、部门、岗位、字典、登录日志、操作日志、登录风控和数据权限页面。
- `wms-web` 按独立项目开发，可移交给负责 WMS 的乙方。
- `mes-web` 按独立项目开发，可移交给负责 MES 的乙方。
- `ai-web` 按独立项目开发，可移交给负责 AI 的乙方。
- `wms-web`、`mes-web`、`ai-web` 不放入 `frontend-platform` 内部包目录中，避免平台底座和乙方业务源码耦合。

甲方平台前端项目 `frontend-platform` 结构建议如下：

```text
frontend-platform
  pnpm-workspace.yaml
  package.json

  packages
    platform-ui
      src
        components
          PermissionButton
            index.ts
            PermissionButton.vue
          DictSelect
            index.ts
            DictSelect.vue
          PlatformTable
            index.ts
            PlatformTable.vue
          PlatformSearchForm
            index.ts
            PlatformSearchForm.vue

        hooks
          usePermission.ts
          useDict.ts

        styles
          index.scss
          variables.scss
          element-plus.scss

        utils
          install.ts

        index.ts

      examples
        playground
          src
            App.vue
            main.ts
          vite.config.ts

      docs
        .vitepress
          config.ts
        index.md
        components
          dict-select.md
          platform-table.md
          permission-button.md

      package.json
      vite.config.ts
      tsconfig.json

    platform-sdk
    platform-theme
    platform-types

  apps
    portal-shell
    sys-web
```

乙方业务前端独立项目结构建议如下：

```text
wms-web
  src
    api
    assets
    components
    router
    stores
    views
    module.ts
  package.json
  vite.config.ts
  tsconfig.json
  .env.development
  .env.production

mes-web
  src
    api
    assets
    components
    router
    stores
    views
    module.ts
  package.json
  vite.config.ts
  tsconfig.json
  .env.development
  .env.production

ai-web
  src
    api
    assets
    components
    router
    stores
    views
    module.ts
  package.json
  vite.config.ts
  tsconfig.json
  .env.development
  .env.production
```

乙方模块通过阿里云效制品仓库安装甲方平台包：

```bash
pnpm add @smartwarehouse/platform-ui
pnpm add @smartwarehouse/platform-sdk
pnpm add @smartwarehouse/platform-theme
```

不允许将 `wms-web`、`mes-web`、`ai-web` 的业务源码直接放入甲方 `frontend-platform` 平台项目中，避免平台项目过大、权限复杂、责任边界不清。

### 4.1 分项目注意事项

一开始就按独立项目开发后，需要重点控制以下边界。

#### 4.1.1 不允许跨项目源码引用

`wms-web`、`mes-web`、`ai-web`、`frontend-platform` 之间不允许通过相对路径互相引用源码。

不推荐：

```ts
import { DictSelect } from '../frontend-platform/packages/platform-ui/src'
import MaterialSelect from '../wms-web/src/components/MaterialSelect.vue'
```

推荐：

```ts
import { DictSelect } from '@smartwarehouse/platform-ui'
import { request } from '@smartwarehouse/platform-sdk'
```

公共能力必须沉淀到：

```text
@smartwarehouse/platform-ui
@smartwarehouse/platform-sdk
@smartwarehouse/platform-theme
@smartwarehouse/platform-types
```

并通过阿里云效制品仓库分发。

#### 4.1.2 每个业务前端项目必须可以独立开发和构建

`wms-web`、`mes-web`、`ai-web` 都应具备独立运行能力：

```bash
pnpm install
pnpm dev
pnpm build
```

不能依赖 `frontend-platform` 源码才能启动。

#### 4.1.3 路由前缀必须独立

每个模块必须有固定路由前缀：

```text
sys-web -> /sys
wms-web -> /wms
mes-web -> /mes
ai-web -> /ai
```

例如：

```text
/wms/material
/wms/inventory
/mes/work-order
/mes/material-apply
/ai/chat
/ai/chatbi
```

#### 4.1.4 API 前缀必须独立

前端接口统一通过 `platform-sdk` 的 request 访问，且按服务划分 API 前缀：

```text
/api/sys/**
/api/wms/**
/api/mes/**
/api/ai/**
```

不允许在业务模块中写死后端 IP、端口或完整域名。

#### 4.1.5 权限编码必须按模块隔离

建议权限编码格式：

```text
模块:资源:动作
```

例如：

```text
sys:user:list
wms:material:add
mes:work-order:create
ai:chatbi:query
```

这样后期乙方只维护自己模块的权限编码。

#### 4.1.6 每个业务模块需要暴露模块描述

每个乙方模块建议提供 `module.ts`，用于声明模块基本信息：

```ts
export default {
  name: 'wms',
  title: '仓储管理',
  routePrefix: '/wms',
  entry: '/apps/wms/',
  apiPrefix: '/api/wms',
  permissions: [
    'wms:material:list',
    'wms:material:add'
  ]
}
```

`portal-shell` 后续可基于模块描述完成菜单、路由和微前端加载。

#### 4.1.7 CI/CD 独立

每个前端项目应有自己的流水线：

```text
frontend-platform
  构建 portal-shell
  构建 sys-web
  构建 platform-ui
  发布 @smartwarehouse/platform-ui 等 npm 包

wms-web
  构建 wms-web
  发布到 /apps/wms/

mes-web
  构建 mes-web
  发布到 /apps/mes/

ai-web
  构建 ai-web
  发布到 /apps/ai/
```

这样后期乙方可以独立发布业务模块，不影响甲方平台前端项目。

#### 4.1.8 项目权限独立

建议项目权限按职责分配：

```text
frontend-platform
  甲方平台团队维护

wms-web
  甲方可管理，WMS 乙方可开发

mes-web
  甲方可管理，MES 乙方可开发

ai-web
  甲方可管理，AI 乙方可开发
```

乙方不应直接拥有 `frontend-platform` 平台底座的修改权限。

#### 4.1.9 公共能力先沉淀再复用

如果 `wms-web`、`mes-web` 和 `ai-web` 都需要同一个能力，不要互相复制或互相引用，应判断是否沉淀到：

```text
platform-ui
platform-sdk
platform-types
```

例如：

- 字典下拉放到 `platform-ui`。
- 统一 request 放到 `platform-sdk`。
- 用户、组织、租户类型放到 `platform-types`。
- 主题变量放到 `platform-theme`。

#### 4.1.10 K8s 与 Nginx 部署注意事项

项目在 K8s 中部署时，前端仍然按独立项目构建和发布，由 `portal-shell` 统一承载登录入口，再通过模块入口加载各业务前端。

推荐部署路径如下：

```text
frontend-platform/apps/portal-shell  -> /
frontend-platform/apps/sys-web       -> /apps/sys/
wms-web                              -> /apps/wms/
mes-web                              -> /apps/mes/
ai-web                               -> /apps/ai/
```

开发时需要注意：

1. 每个项目的构建产物必须支持独立部署到自己的 `entry_url`，不要假设所有静态资源都在根路径。
2. `wms-web`、`mes-web`、`ai-web` 的 Vite `base` 或等价配置应与 `entry_url` 对齐，例如 `/apps/wms/`、`/apps/mes/`、`/apps/ai/`。
3. 业务前端访问后端时统一调用 `/api/sys/**`、`/api/wms/**`、`/api/mes/**`、`/api/ai/**`，由 K8s Ingress、Nginx 或 Gateway 转发，不允许写死 Pod IP、Service IP、NodePort 或环境域名。
4. 环境差异配置建议通过运行时配置文件注入，例如 `/config/runtime-config.json`，避免每个环境都重新打包前端镜像。
5. Nginx 需要为每个前端模块配置 history fallback，刷新 `/wms/material`、`/mes/work-order`、`/ai/chatbi` 等页面时不能 404。
6. 前端容器镜像只包含构建后的静态资源和 Nginx 配置，不应包含 `.npmrc`、阿里云效 token、源码目录或构建缓存。
7. 独立发布业务前端时，需要保证 `sys_frontend_module.entry_url` 中登记的入口路径与实际 Nginx 发布路径一致。
8. 甲方升级 `platform-ui`、`platform-sdk`、`platform-theme` 后，乙方项目应通过版本号显式升级并完成回归，不建议自动浮动到最新版本。

## 5. 创建组件库项目

在甲方 `frontend-platform` workspace 中创建组件库包：

```bash
pnpm create vite packages/platform-ui --template vue-ts
```

安装依赖：

```bash
pnpm add vue element-plus
```

建议在发布组件库时，将 `vue` 和 `element-plus` 配置为 `peerDependencies`：

```json
{
  "name": "@smartwarehouse/platform-ui",
  "version": "1.0.0",
  "peerDependencies": {
    "vue": "^3.0.0",
    "element-plus": "^2.0.0"
  }
}
```

这样可以避免多个业务模块重复打包不同版本的 Vue 和 Element Plus。

## 6. 封装权限按钮

`PermissionButton` 用于统一按钮权限控制。组件内部仍然使用 `el-button`，但权限判断由平台统一处理。

示例：

```vue
<template>
  <el-button
    v-if="visible"
    v-bind="$attrs"
  >
    <slot />
  </el-button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  permission?: string
}>()

const hasPermission = (code?: string) => {
  if (!code) return true
  // 实际项目中调用 platform-sdk 的权限能力
  return true
}

const visible = computed(() => hasPermission(props.permission))
</script>
```

乙方使用：

```vue
<PermissionButton permission="wms:material:add" type="primary">
  新增
</PermissionButton>
```

## 7. 封装字典下拉

`DictSelect` 用于统一系统字典加载、缓存和展示。

示例：

```vue
<template>
  <el-select v-model="modelValueProxy" v-bind="$attrs">
    <el-option
      v-for="item in options"
      :key="item.value"
      :label="item.label"
      :value="item.value"
    />
  </el-select>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

const props = defineProps<{
  modelValue?: string | number
  dictType: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string | number | undefined]
}>()

const options = ref<Array<{ label: string; value: string | number }>>([])

const modelValueProxy = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value)
})

onMounted(async () => {
  // 实际项目中从 platform-sdk 获取字典
  options.value = []
})
</script>
```

乙方使用：

```vue
<DictSelect
  v-model="form.materialType"
  dict-type="MATERIAL_TYPE"
/>
```

## 8. 封装标准表格

`PlatformTable` 用于统一列表页的常见能力：

- loading
- 分页
- 空状态
- 错误处理
- 列配置
- 多选
- 操作列
- 刷新
- 查询请求

乙方使用方式建议设计成：

```vue
<PlatformTable
  :columns="columns"
  :request="queryMaterialList"
/>
```

示例列配置：

```ts
const columns = [
  { prop: 'code', label: '物料编码' },
  { prop: 'name', label: '物料名称' },
  { prop: 'materialTypeName', label: '物料类型' }
]
```

这类组件可以显著统一各乙方的列表页面风格。

## 9. 提供统一安装入口

每个组件提供 `install` 方法，再通过 `src/index.ts` 统一导出。

示例：

```ts
import type { App } from 'vue'
import PermissionButton from './components/PermissionButton'
import DictSelect from './components/DictSelect'
import PlatformTable from './components/PlatformTable'

const components = [
  PermissionButton,
  DictSelect,
  PlatformTable
]

export {
  PermissionButton,
  DictSelect,
  PlatformTable
}

export default {
  install(app: App) {
    components.forEach(component => {
      app.use(component)
    })
  }
}
```

乙方项目中使用：

```ts
import PlatformUI from '@smartwarehouse/platform-ui'
import '@smartwarehouse/platform-ui/dist/style.css'

app.use(PlatformUI)
```

也可以按需引入：

```ts
import { DictSelect } from '@smartwarehouse/platform-ui'
```

## 10. 统一主题和样式

甲方需要统一：

- 主题色
- 字体
- 间距
- 圆角
- 表格密度
- 按钮尺寸
- 表单 label 宽度
- 弹窗宽度
- 页面背景

建议在组件库中提供：

```text
styles/variables.scss
styles/element-plus.scss
styles/index.scss
```

乙方统一引入：

```ts
import '@smartwarehouse/platform-ui/dist/style.css'
```

如需主题切换，可以使用 CSS Variables：

```css
:root {
  --platform-primary-color: #1677ff;
  --platform-page-bg: #f5f7fa;
  --platform-border-radius: 4px;
}
```

## 11. 配置组件库打包

使用 Vite library mode：

```ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'PlatformUI',
      fileName: 'platform-ui'
    },
    rollupOptions: {
      external: ['vue', 'element-plus'],
      output: {
        globals: {
          vue: 'Vue',
          'element-plus': 'ElementPlus'
        }
      }
    }
  }
})
```

重点：

```text
vue 和 element-plus 不建议打进组件库产物
```

## 12. 建设组件演示项目和文档站点

`platform-ui` 项目中必须包含组件演示项目，用于测试、展示所有二次封装组件的效果。演示项目应当可以在本地启动，也可以构建后部署成网页，供甲方、乙方开发人员直接访问。

建议提供两个能力：

```text
examples/playground
  用于本地开发、调试和验证组件效果

docs
  用于生成可访问的组件说明网站
```

组件文档站点建议做成类似 Element Plus 官网的组件总览页面，开发人员可以通过浏览器查看：

- 已封装组件总览。
- 组件分类，例如基础、表单、数据展示、反馈、业务组件。
- 每个组件的实际渲染效果。
- 每个组件的基础用法。
- 每个组件的典型业务场景。
- 每个组件的示例代码。
- Props、Events、Slots 说明。
- 注意事项和最佳实践。
- 版本变更说明。

统一使用 VitePress 建设组件演示和文档站点。

VitePress 用于生成类似 Element Plus 官网的组件文档页面，承载组件总览、组件效果预览、示例代码、Props、Events、Slots、注意事项和版本说明。

文档站点至少包括：

- 组件用途
- 基础用法
- Props
- Events
- Slots
- 示例代码
- 在线效果预览
- 注意事项
- 版本变更

建议文档路径：

```text
docs/components/dict-select.md
docs/components/platform-table.md
docs/components/permission-button.md
```

建议增加本地启动脚本：

```json
{
  "scripts": {
    "dev:playground": "vite --config examples/playground/vite.config.ts",
    "dev:docs": "vitepress dev docs",
    "build:docs": "vitepress build docs"
  }
}
```

组件文档站点构建后，应部署到统一网页地址，例如：

```text
https://frontend-docs.smartwarehouse-ai.local/platform-ui
```

或者挂载到统一前端门户下：

```text
https://portal.smartwarehouse-ai.local/docs/platform-ui
```

要求：

- 每新增一个二次封装组件，必须同步增加演示页面。
- 每新增一个二次封装组件，必须同步增加组件说明。
- 组件发布前必须在演示项目中完成效果验证。
- 乙方使用组件时应优先查看组件文档站点，而不是直接阅读源码。

## 13. 发布到阿里云效制品仓库

组件库构建：

```bash
pnpm build
```

发布到阿里云效制品仓库的 npm 私有仓库：

```bash
pnpm publish
```

发布后形成版本：

```text
@smartwarehouse/platform-ui@1.0.0
```

乙方安装：

```bash
pnpm add @smartwarehouse/platform-ui@1.0.0
```

乙方项目需要配置 `.npmrc`，将甲方私有 scope 指向阿里云效制品仓库。示例：

```text
@smartwarehouse:registry=https://<云效制品仓库 npm registry 地址>/
//<云效制品仓库 npm registry 地址>/:_authToken=<访问令牌>
```

建议由甲方统一提供：

- 云效制品仓库 npm registry 地址。
- 只读 token，供乙方安装依赖。
- 发布 token，供甲方组件库流水线发布版本。
- npm scope 命名规则，例如 `@smartwarehouse/*`。
- 组件库版本升级和回滚规范。

K8s 镜像构建时需要额外注意：

- `.npmrc` 和 npm token 只允许在 CI 构建阶段使用，不允许进入最终运行镜像。
- 推荐使用多阶段构建，第一阶段安装依赖并执行 `pnpm build`，第二阶段只复制 `dist` 产物和 Nginx 配置。
- 甲方 `frontend-platform` 发布 `@smartwarehouse/*` 包后，乙方项目通过锁定版本构建镜像，避免不同 Pod 因依赖漂移产生前端行为差异。
- 生产环境镜像应基于 release 版本依赖构建；开发、测试环境可以使用 snapshot 版本验证。

## 14. 乙方项目接入方式

乙方项目安装依赖：

```bash
pnpm add element-plus
pnpm add @smartwarehouse/platform-ui
```

入口文件中注册：

```ts
import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import PlatformUI from '@smartwarehouse/platform-ui'

import 'element-plus/dist/index.css'
import '@smartwarehouse/platform-ui/dist/style.css'

const app = createApp(App)

app.use(ElementPlus)
app.use(PlatformUI)

app.mount('#app')
```

页面中使用：

```vue
<DictSelect dict-type="MATERIAL_TYPE" v-model="form.type" />

<PermissionButton permission="wms:material:add" type="primary">
  新增
</PermissionButton>
```

## 15. 乙方使用规范

建议甲方明确以下规则：

```text
普通 UI：可以直接用 Element Plus
权限按钮：必须用 PermissionButton
字典下拉：必须用 DictSelect
用户选择：必须用 UserSelect
组织选择：必须用 OrgTreeSelect
标准表格：优先用 PlatformTable
上传下载：必须用甲方 FileUpload / Download SDK
接口请求：必须用 platform-sdk 的 request
```

不建议乙方：

- 自己实现登录逻辑。
- 自己维护权限判断。
- 自己封装一套字典下拉。
- 自己写死后端接口地址。
- 私自覆盖 Element Plus 全局样式。
- 复制甲方组件源码后自行修改。

## 16. 版本管理

组件库必须按版本发布。

推荐规则：

```text
修复 bug：1.0.0 -> 1.0.1
新增兼容能力：1.0.0 -> 1.1.0
破坏性升级：1.0.0 -> 2.0.0
```

乙方项目建议锁定版本：

```json
{
  "@smartwarehouse/platform-ui": "1.0.0"
}
```

不建议使用：

```json
{
  "@smartwarehouse/platform-ui": "latest"
}
```

避免甲方升级组件库后，乙方项目出现不可控变更。

## 17. 推荐推进顺序

建议按以下顺序推进：

1. 创建甲方平台前端项目 `frontend-platform`。
2. 在 `frontend-platform` 中建立 `packages/platform-ui`、`packages/platform-sdk`、`packages/platform-theme`、`packages/platform-types`。
3. 在 `frontend-platform` 中建立 `apps/portal-shell`、`apps/sys-web`，其中 `portal-shell` 负责统一登录页和模块入口。
4. 创建独立业务前端项目 `wms-web`。
5. 创建独立业务前端项目 `mes-web`。
6. 创建独立业务前端项目 `ai-web`。
7. 配置阿里云效制品仓库 npm 私有仓库和 `@smartwarehouse/*` scope。
8. 在 `platform-ui` 中接入 Vue、TypeScript、Element Plus。
9. 配置 `platform-ui` 的 Vite library build。
10. 统一主题和样式变量。
11. 封装 `PermissionButton`。
12. 封装 `DictSelect`。
13. 封装 `PlatformTable`。
14. 封装 `PlatformSearchForm`。
15. 封装 `FileUpload`、`ExcelImport`、`ExcelExport`。
16. 建设 `examples/playground` 组件演示项目。
17. 使用 VitePress 建设类似 Element Plus 的组件总览和文档站点。
18. 将组件演示和文档站点部署为可通过网页访问的地址。
19. 发布 `@smartwarehouse/platform-ui`、`@smartwarehouse/platform-sdk`、`@smartwarehouse/platform-theme` 到阿里云效制品仓库。
20. 在 `wms-web`、`mes-web`、`ai-web` 中安装甲方平台 npm 包并完成试点接入。
21. 根据试点反馈调整组件 API。
22. 将 `wms-web`、`mes-web`、`ai-web` 按项目权限移交给对应乙方独立开发。

## 18. 当前项目适配检查

根据 SmartWarehouse-AI 当前项目架构，已检查并调整原文中与当前项目不符的信息：

| 原文内容 | 不符合点 | 推荐修改内容 | 本次处理 |
|---|---|---|---|
| `mdm-web` | 当前项目没有 MDM 前端模块，业务模块是 WMS、MES、AI。 | 修改为 `wms-web`，并补充 `mes-web`、`ai-web`。 | 已调整 |
| `mes-web` 描述为 MES/MOM | 当前项目只定义 MES 生产执行服务，不涉及完整 MOM。 | 保留 `mes-web`，描述修改为 MES 独立前端项目。 | 已调整 |
| `frontend-platform` 独立仓库表述 | 当前项目仍使用 SmartWarehouse-AI 根目录 Git 统一管理，但开发时按独立项目处理。 | 修改为根目录平级的 `frontend-platform`、`wms-web`、`mes-web`、`ai-web` 推荐结构，并强调独立开发、独立构建、独立发布。 | 已调整 |
| 缺少统一登录入口说明 | 当前目标要求一个登录页面访问所有服务。 | 明确 `portal-shell` 由甲方维护统一登录页、Token 管理、菜单装载和模块入口，登录后通过 Gateway 访问 `sys`、`wms`、`mes`、`task`、`ai`。 | 已调整 |
| `@company/*` npm scope | 与 SmartWarehouse-AI 项目命名不一致。 | 修改为 `@smartwarehouse/*`。 | 已调整 |
| `/api/mdm`、`mdm:*`、`/mdm` | 当前项目无 MDM 服务和路由。 | 修改为 `/api/wms`、`wms:*`、`/wms`，并补充 `/api/ai`、`/ai`。 | 已调整 |
| `frontend-docs.company.com`、`portal.company.com` | 示例域名与当前项目不一致。 | 修改为 `frontend-docs.smartwarehouse-ai.local` 和 `portal.smartwarehouse-ai.local` 示例地址。 | 已调整 |

推荐最终前端职责边界：

| 责任方 | 前端项目 | 主要职责 |
|---|---|---|
| 甲方平台团队 | `frontend-platform/apps/portal-shell` | 统一登录页、门户框架、Token 管理、菜单装载、模块入口。 |
| 甲方平台团队 | `frontend-platform/apps/sys-web` | 用户、角色、菜单、部门、岗位、字典、日志、登录风控、数据权限页面。 |
| 甲方平台团队 | `frontend-platform/packages/*` | `platform-ui`、`platform-sdk`、`platform-theme`、`platform-types` 等基础包。 |
| 乙方 A | `wms-web` | 物料、仓库、库区、库位、入库、出库、库存批次、库存流水、离线上传页面。 |
| 乙方 B | `mes-web` | 工单、工单物料、物料申请、配送状态页面。 |
| 乙方 C | `ai-web` | RAG 问答、ChatBI、多 Agent、MCP 工具调用页面。 |

## 19. 最终建议

基于 Element Plus 二次封装的重点不是重写 Element Plus，而是在其基础上沉淀企业后台的标准业务场景。

推荐最终形成：

```text
frontend-platform
  甲方平台前端 workspace，包含 portal-shell、sys-web、platform-ui、platform-sdk、platform-theme、platform-types

wms-web
  WMS 独立前端项目，后续可移交 WMS 乙方独立开发

mes-web
  MES 独立前端项目，后续可移交 MES 乙方独立开发

ai-web
  AI 独立前端项目，后续可移交 AI 乙方独立开发

@smartwarehouse/platform-ui
  基于 Element Plus 的平台组件库

@smartwarehouse/platform-sdk
  request、auth、dict、user、org、tenant、file 等平台能力

@smartwarehouse/platform-theme
  主题变量、全局样式和设计规范
```

乙方开发方式：

```text
直接用 Element Plus 处理普通 UI
使用 platform-ui 处理标准业务页面
使用 platform-sdk 调用平台能力
```

一句话总结：

```text
Element Plus 提供基础组件；
甲方二次封装提供企业级统一体验；
乙方在独立前端项目中基于统一组件和 SDK 开发业务模块。
```
