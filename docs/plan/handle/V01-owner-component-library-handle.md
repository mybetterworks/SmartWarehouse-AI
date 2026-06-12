# V01 手搓步骤：甲方组件库二次开发

## 1. 环境准备

```text
Windows 11
Node v22.22.3
Corepack pnpm 10.12.1
阿里云效 npm snapshot 仓库
```

## 2. 命令步骤

```powershell
node -v
corepack pnpm -v
cd frontend-platform
corepack pnpm install
corepack pnpm build
corepack pnpm --filter @smartwarehouse/platform-ui build
corepack pnpm --filter @smartwarehouse/platform-sdk build
corepack pnpm --filter @smartwarehouse/platform-theme build
corepack pnpm --filter @smartwarehouse/platform-types build
corepack pnpm --filter @smartwarehouse/platform-ui publish --dry-run --no-git-checks
```

## 3. 关键代码位置

```text
frontend-platform/packages/platform-ui
frontend-platform/packages/platform-sdk
frontend-platform/packages/platform-theme
frontend-platform/packages/platform-types
frontend-platform/packages/platform-ui/src/hooks/useWebSocketClient.ts
frontend-platform/apps/docs
frontend-platform/apps/docs/src/componentCatalog.ts
frontend-platform/apps/docs/src/ComponentOverview.vue
frontend-platform/apps/docs/src/PlaygroundWorkbench.vue
frontend-platform/apps/docs/component
frontend-platform/.npmrc.example
frontend-platform/pnpm-lock.yaml
```

## 4. 核心代码片段

```ts
// platform-sdk/src/permission.ts
let currentUser: LoginUser | undefined
let permissionSet = new Set<string>()
const permissionListeners = new Set<() => void>()

export function setPermissions(permissions: string[]): void {
  permissionSet = new Set(permissions)
  permissionListeners.forEach((listener) => listener())
}

export function hasPermission(permission?: string | string[]): boolean {
  const values = Array.isArray(permission) ? permission : [permission]
  return values.some((item) => permissionSet.has(item))
}

export function subscribePermissionChange(listener: () => void): () => void {
  permissionListeners.add(listener)
  return () => permissionListeners.delete(listener)
}
```

```ts
// PermissionButton.vue
const permissionVersion = ref(0)
const allowed = computed(() => {
  permissionVersion.value
  return hasPermission(props.permission)
})

onMounted(() => {
  unsubscribe = subscribePermissionChange(() => {
    permissionVersion.value += 1
  })
})
```

```ts
// platform-sdk/src/request.ts
function buildUrl(url: string, params?: RequestOptions['params']): string {
  const { apiBaseUrl } = getRuntimeConfig()
  const normalizedUrl = url.startsWith('/api/') || url === '/api' ? url : `${apiBaseUrl}${url.startsWith('/') ? url : `/${url}`}`
  const search = new URLSearchParams()
  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      search.set(key, String(value))
    }
  })
  const query = search.toString()
  return query ? `${normalizedUrl}?${query}` : normalizedUrl
}
```

```vue
<!-- ComponentPlayground.vue -->
<PlatformPage title="平台组件演示">
  <template #toolbar>
    <PermissionButton permission="sys:user:create">新建用户</PermissionButton>
    <PermissionButton permission="wms:material:add" mode="disable">新增物料</PermissionButton>
  </template>
  <PlatformSearchForm :model="query">
    <el-form-item label="物料类型">
      <DictSelect v-model="query.materialType" dict-type="material_type" />
    </el-form-item>
  </PlatformSearchForm>
  <PlatformTable :columns="columns" :data="tableData" :pagination="pagination" />
</PlatformPage>
```

```ts
// platform-ui/src/index.ts
export const SmartWarehousePlatformUi = {
  install(app) {
    Object.entries(components).forEach(([name, component]) => {
      app.component(name, component)
    })
  }
}

export { WorkOrderSelectComponent as WorkOrderSelect }
export default SmartWarehousePlatformUi
```

```ts
// platform-sdk/src/options.ts
export async function getWarehouseOptions(): Promise<SelectOption[]> {
  return warehouseOptions
}

export async function getMaterialOptions(): Promise<SelectOption[]> {
  return materialOptions
}

export async function getWorkOrderOptions(): Promise<SelectOption[]> {
  return workOrderOptions
}
```

```ts
// platform-sdk/src/websocket.ts
export function createWebSocketClient<T = unknown>(options: WebSocketClientOptions<T>): WebSocketClient<T> {
  let socket: WebSocket | undefined

  function connect(): void {
    socket = new WebSocket(normalizeWebSocketUrl(options.url), options.protocols)
    socket.addEventListener('message', (event) => {
      options.onMessage?.(parseMessage<T>(event.data))
    })
  }

  return { connect, disconnect, send, getSocket: () => socket }
}
```

```ts
// apps/docs/src/componentCatalog.ts
export const componentCatalog = [
  {
    slug: 'platform-table',
    name: 'PlatformTable',
    title: '表格',
    group: 'data-display',
    groupName: '数据展示',
    status: 'documented',
    description: '统一列表表格，支持分页、选择列、序号列、排序、操作列和单元格插槽。',
    scenarios: ['数据列表', '后台管理页', '查询结果展示'],
    docsPath: '/component/platform-table',
    playgroundPreset: 'table',
    since: '0.1.0',
    tags: ['table', 'data']
  }
]
```

```vue
<!-- apps/docs/src/PlaygroundWorkbench.vue -->
<section class="sw-repl">
  <header class="sw-repl__toolbar">
    <el-select v-model="activePreset" @change="resetCode">
      <el-option label="PlatformTable" value="table" />
      <el-option label="LoginForm + JigsawCaptcha" value="login" />
    </el-select>
    <el-button @click="resetCode">Reset</el-button>
    <el-button type="primary" @click="copyCode">Copy</el-button>
  </header>
  <div class="sw-repl__body">
    <textarea v-model="currentCode" />
    <section class="sw-repl__preview">
      <PlatformTable v-if="activePreset === 'table'" :columns="columns" :data="tableRows" />
      <LoginForm v-else :risk-state="riskState" />
    </section>
  </div>
</section>
```

## 5. 验证命令

```powershell
cd frontend-platform
corepack pnpm build
corepack pnpm build:packages
corepack pnpm publish:dry-run
corepack pnpm --filter @smartwarehouse/platform-ui publish --dry-run --no-git-checks

# 临时启动文档站点
corepack pnpm --filter @smartwarehouse/component-docs dev -- --port 5173

# 敏感信息扫描
cd ..
rg -n -i "password|pwd|secret|token|api[_-]?key|access[_-]?key|secret[_-]?key|_authToken|Authorization|Bearer|BEGIN PRIVATE KEY|BEGIN RSA PRIVATE KEY|jdbc:mysql://|redis://|amqp://|oss://" frontend-platform deploy platform gateway sys task mes wms ai wms-web mes-web ai-web README.md docs/plan/milestones/V01-owner-component-library.md docs/plan/study/V01-owner-component-library-study.md docs/plan/handle/V01-owner-component-library-handle.md -g '!node_modules' -g '!dist' -g '!coverage' -g '!*.log'

# 检查 VitePress 构建产物中的关键页面
Get-ChildItem -Recurse frontend-platform\apps\docs\.vitepress\dist -Filter *.html

# 检查组件详情页示例代码是否统一标注 Vue + TypeScript
@'
const fs = require('fs');
const path = require('path');
const dirs = [
  path.join('frontend-platform', 'apps', 'docs', 'component'),
  path.join('frontend-platform', 'apps', 'docs', 'components')
];
const bad = [];
const oldHeading = '## ' + '\u793a\u4f8b\u4ee3\u7801';
for (const dir of dirs) {
  for (const name of fs.readdirSync(dir)) {
    if (!name.endsWith('.md')) continue;
    const file = path.join(dir, name);
    const text = fs.readFileSync(file, 'utf8');
    const hasBadHeading = text.split(/\r?\n/).includes(oldHeading);
    const vueBlocks = [...text.matchAll(/```vue\n([\s\S]*?)```/g)].map((m) => m[1]);
    const vueBlocksMissingTs = vueBlocks.filter((block) => !block.includes('<script setup lang="ts">')).length;
    if (hasBadHeading || vueBlocksMissingTs > 0) {
      bad.push({ file, hasBadHeading, vueBlocks: vueBlocks.length, vueBlocksMissingTs });
    }
  }
}
console.log(JSON.stringify(bad, null, 2));
process.exit(bad.length ? 1 : 0);
'@ | node -
```

## 6. 常见错误

1. 组件库混入业务逻辑。
2. 组件没有演示页面。
3. npm token 写入仓库或构建产物。
4. Windows 只有 Corepack，没有全局 pnpm，脚本中直接写 `pnpm` 会失败。
5. Vite build 清空 `dist`，导致先生成的 `.d.ts` 被删除。
6. SDK 权限集合不是响应式状态，按钮权限运行时更新后页面不刷新。
7. 新增组件文件后忘记在 `platform-ui/src/index.ts` 导出，业务项目或文档站从 npm 包入口导入时会失败。
8. 业务强类型数组直接传给通用 `PlatformTable` 的 `Record<string, unknown>[]` 入参，TypeScript 会报索引签名不兼容。
9. 只跑包构建不跑文档站构建，可能发现不了文档演示和发布包入口的集成问题。
10. 只有一个综合演示页，没有组件总览、Props、Events、Slots 和 Playground，乙方使用组件时仍要翻源码。
11. 企业组件库文档站公开模块过多，会让组件库变成项目演示站；公开导航应收敛到“组件 / 场景模板 / Playground”，其中组件页保持业务无关，场景模板页承载多组件组合。
12. VitePress dev server 返回客户端入口壳，直接搜索 HTTP HTML 可能找不到页面正文；应检查 build 后 `.vitepress/dist` 静态 HTML。
13. 内置浏览器可能拦截 localhost，这时不要绕行提交敏感数据，改用构建、HTTP 状态和静态产物检查。
14. VitePress `.vp-doc` 默认 Markdown 表格样式会污染 Element Plus 内部表格，导致表头和第一行之间出现异常空白；应对 `.vp-doc .el-table` 内部 table、tr、th、td 做局部 reset。
15. 文档 Demo 容器宽度通常小于业务页面宽度，表格型组件示例应控制列宽，避免为了展示完整业务字段而撑出“基础用法”容器。
16. 为了让 LoginForm 变窄而直接缩小外层 `.sw-doc-preview`，会导致基础用法方框宽度与其他组件不一致；应使用内部居中 wrapper 控制组件宽度。
17. AI Workbench、ChatBI、SQL、Agent、MCP 工具调用等内容包含长文本、长 SQL 和 JSON，只靠组件样式可能仍会被 VitePress `pre/code` 默认样式覆盖。
18. 示例代码标题只写“示例代码”或代码块不带 `<script setup lang="ts">`，会让乙方复制后缺少 TypeScript 类型契约。
19. 在 Vue SFC 的字符串预设中直接写 `</script>`，会提前结束外层 `<script setup>`，需要写成 `<\/script>`。

## 7. 手动还原步骤

1. 创建根目录占位：`deploy`、`platform`、`gateway`、`sys`、`task`、`mes`、`wms`、`ai`、`wms-web`、`mes-web`、`ai-web`。
2. 创建 `frontend-platform/package.json`、`pnpm-workspace.yaml`、`tsconfig.base.json` 和 `.npmrc.example`。
3. 创建 `platform-types`，实现 `ApiResult`、`PageQuery`、`PageResult`、`LoginUser`、`MenuItem`、`FrontendModule`、`DictOption`、`RuntimeConfig` 等类型。
4. 创建 `platform-sdk`，实现 runtime config、token、permission、dict mock、request。
5. 创建 `platform-theme`，实现主题变量和 Element Plus 样式覆盖。
6. 创建 `platform-ui`，封装 V01 需要的 12 个组件。
7. 根据后续 V02-V08 高频页面补充组件库：
   - 门户与登录：`PlatformLayout`、`SideMenu`、`BreadcrumbNav`、`UserDropdown`、`LoginForm`、`JigsawCaptcha`。
   - 页面与表单：`PlatformForm`、`DrawerForm`、增强 `PlatformTable`。
   - 选择器：`WarehouseSelect`、`LocationTreeSelect`、`MaterialSelect`、`WorkOrderSelect`。
   - WMS / MES：`UploadProgress`、`ImportTaskPanel`、`ImportErrorTable`、`MaterialRequirementEditor`、`ApplyStatusTimeline`、`DeliveryStatusSteps`。
   - Task / AI：`DashboardGrid`、`StatCard`、`RankList`、`AlertPanel`、`RealtimeBadge`、`ChatPanel`、`PromptInput`、`MarkdownRenderer`、`ChatBIResultTable`、`SqlPreview`、`AgentStepTimeline`、`ToolCallTrace`。
8. 在 `platform-sdk` 增加 `options.ts` 和 `websocket.ts`，在 `platform-ui` 增加 `useWebSocketClient`。
9. 更新 `platform-ui/src/index.ts`，每个新增组件都要加入按需导出和 `install(app)` 组件表。
10. 创建或更新 `frontend-platform/apps/docs`，接入 VitePress、Element Plus 和平台组件演示。
11. 执行 `corepack pnpm install`、`corepack pnpm build` 和 dry-run 发布检查。
12. 用浏览器访问 `http://localhost:5173/` 或 `http://127.0.0.1:5173/`，确认门户登录、WMS/MES、运营统计与 AI 分组正常显示且控制台无 error。
13. 将文档站升级为企业组件库两入口结构：
   - `/component/overview`：业务无关的组件级总览入口。
   - `/scenario/overview`：多组件组合的场景模板总览入口。
   - `/component/*.md`：核心组件或组件组详情页。
14. 新增或更新 `componentCatalog.ts`，集中登记 `componentGroups`、`componentCatalog`、`scenarioTemplateGroups`、`scenarioTemplateCatalog`，其中单组件进入 `componentCatalog`，多组件组合模板进入 `scenarioTemplateCatalog`。
15. 新增或更新 `CatalogOverview.vue`，让 `/component/overview` 和 `/scenario/overview` 复用同一套总览、分组、卡片、状态和标签展示逻辑。
16. 新增或更新 `.vitepress/config.ts`，顶部公开导航只保留“组件”“场景模板”，/component 路径配置组件侧边栏和 CONTENTS，/scenario 路径配置场景模板侧边栏和 CONTENTS。
17. 新增或更新 `.vitepress/theme/style.css`，提供组件总览、场景模板总览、组件索引、API 文档和移动端布局样式。
18. 执行 `corepack pnpm build`、`corepack pnpm publish:dry-run`。
19. 如浏览器验证被拦截，则检查 `.vitepress/dist` 静态 HTML 是否包含关键页面内容。
20. 更新 `.gitignore`、milestone、study、handle、PROGRESS 和根 README；如果用户明确要求只更新 `docs/plan`，则在当前任务中仅更新计划文档并记录说明。
21. 修复 VitePress + Element Plus 表格间距问题时，先检查是否是 `.vp-doc table`、`tr`、`th`、`td` 默认样式污染，再决定是否修改组件本身。
22. 对文档站中的表格组件做浏览器验证时，至少检查表头与第一行间距、表格是否超出 `.sw-doc-preview`、页面是否出现横向滚动。
23. 对 LoginForm 等窄组件做文档站展示时，外层仍使用统一 `.sw-doc-preview`，内部增加居中 wrapper，例如 `.sw-doc-preview__center`。
24. 对 AI Workbench 等复杂组件做文档站展示时，同时检查组件 CSS 和 VitePress theme CSS，确保长 SQL、JSON、Agent 步骤和工具调用 trace 都不会撑破容器。
25. 编写组件详情页示例代码时，标题统一写成 `示例代码（Vue + TypeScript）`，代码块统一使用 `vue` fence 和 `<script setup lang="ts">`。
26. 不恢复预设式静态 Playground；除非单独实现真实在线编辑和实时预览能力，否则不新增 `/playground`、Playground 组件或 `playgroundPreset` 元数据。

## 8. 改进记录

```text
日期：2026-06-11
改进内容：根脚本统一改为 corepack pnpm；platform-ui 构建顺序改为 vite build 后再生成声明文件；PermissionButton 增加权限变化订阅刷新；VitePress theme 增加 Element Plus SSR provider；.gitignore 增加 VitePress、pnpm 和 tgz 忽略项。
原因：保证 Windows 11 环境可复现、npm tarball 包含类型声明、权限状态变化能反映到按钮 UI、文档站点构建输出更干净、构建产物和发布包不进入 Git。
验证结果：corepack pnpm build 成功；platform-ui publish --dry-run 成功且包含 .d.ts；浏览器验证组件演示页面通过；敏感信息扫描未发现真实密钥。
```

```text
日期：2026-06-11
改进内容：在当前 V01 中补全后续需要的平台组件，新增门户登录、schema 表单、业务选择器、导入任务、物料需求、配送状态、看板、AI 对话、ChatBI、Agent、MCP 工具调用组件；补充 SDK mock 选项源、WebSocket 客户端和 useWebSocketClient；更新组件文档站。
关键命令：corepack pnpm build:packages；corepack pnpm build；corepack pnpm publish:dry-run；corepack pnpm --filter @smartwarehouse/component-docs dev -- --port 5173。
问题处理：WorkOrderSelect 漏导出导致文档站构建失败，补充 index.ts 导出后恢复；ImportErrorTable 通过 tableRows computed 解决业务强类型数组与通用表格 Record 入参不兼容。
验证结果：完整构建成功；dry-run 成功；浏览器验证关键分组全部存在，控制台无 error；.gitignore 无需新增；敏感扫描未发现真实密钥。
```

```text
日期：2026-06-11
改进内容：将 apps/docs 从综合演示页升级为正式组件文档站，新增首页、组件总览、组件详情、Playground、业务场景样例；新增 componentCatalog 元数据和 9 个核心组件/分类详情页；新增决策 0004。
关键命令：corepack pnpm build；corepack pnpm publish:dry-run；corepack pnpm --filter @smartwarehouse/component-docs dev -- --port 5173 --host 127.0.0.1。
问题处理：浏览器插件访问 localhost 被 ERR_BLOCKED_BY_CLIENT 拦截，改为使用构建成功、HTTP 200 和 .vitepress/dist 静态 HTML 关键词检查；VitePress dev server 返回客户端入口壳，不直接用于正文关键词验证。
验证结果：完整构建成功；dry-run 成功；首页、组件总览、Playground、业务样例、PlatformTable 详情、AI 工作台详情的静态 HTML 关键词检查通过；敏感扫描未发现真实密钥。
```

```text
日期：2026-06-11
改进内容：将 apps/docs 重构为企业级自定义组件库文档站，公开模块只保留“组件”和“Playground”；新增 /component/overview 与 /component/* 路由；旧 /、/components、/examples、/release 改为兼容入口；Playground 改为版本工具栏、代码编辑区、预设预览区的分栏工作台。
关键命令：corepack pnpm build:packages；corepack pnpm build；corepack pnpm publish:dry-run；corepack pnpm --filter @smartwarehouse/component-docs dev。
问题处理：@vue/repl 真运行模式需要浏览器端 import map 稳定加载本地 workspace 包，本次采用可运行的预设 Playground 降级方案，保证构建和演示稳定。
验证结果：完整构建成功；dry-run 成功；/component/overview、/component/platform-table、/playground 路由返回 200；浏览器桌面和移动端检查通过；敏感扫描未发现真实密钥。
```

```text
日期：2026-06-11
改进内容：修复组件文档站表格布局问题，避免 VitePress Markdown 表格样式污染 Element Plus 内部表格；收紧 MaterialRequirementEditor 列宽并移除表头/表体强制横向滚动；调整 PlatformTable 文档示例列宽和 actions-width。
关键文件：
- frontend-platform/apps/docs/.vitepress/theme/style.css
- frontend-platform/packages/platform-ui/src/components/MaterialRequirementEditor/MaterialRequirementEditor.vue
- frontend-platform/packages/platform-ui/src/style.css
- frontend-platform/apps/docs/component/platform-table.md
关键命令：corepack pnpm build:packages；corepack pnpm build；corepack pnpm publish:dry-run。
浏览器验证：/component/material-requirement-editor 表头与第一行间距为 0，表格未超出基础用法容器；/component/platform-table 状态列和操作列完整展示。
验证结果：完整构建成功；dry-run 成功；.gitignore 无需新增规则；敏感扫描未发现真实密钥。
```

```text
日期：2026-06-12
改进内容：修复组件文档站展示一致性与 TypeScript 示例规范问题；LoginForm 基础用法外层恢复统一宽度，内部使用居中窄容器；AI Workbench 增加长内容换行和宽度约束；组件详情页和 Playground 示例统一为 Vue + TypeScript。
关键文件：
- frontend-platform/apps/docs/.vitepress/theme/style.css
- frontend-platform/packages/platform-ui/src/style.css
- frontend-platform/apps/docs/component/login-form.md
- frontend-platform/apps/docs/component/ai-workbench.md
- frontend-platform/apps/docs/components/login-form.md
- frontend-platform/apps/docs/components/ai-workbench.md
- frontend-platform/apps/docs/src/PlaygroundWorkbench.vue
关键命令：
- corepack pnpm build
- corepack pnpm publish:dry-run
- corepack pnpm --filter @smartwarehouse/component-docs dev -- --port 5174 --host 127.0.0.1
浏览器验证：
- /component/login-form：外层基础用法方框宽度与其他组件一致，LoginForm 在内部居中展示，页面无横向溢出。
- /component/ai-workbench：AI 工作台内容未超出外部方框，SQL / Agent / MCP 长内容在容器内换行，页面无横向溢出。
脚本验证：Node 检查 component 与 components 目录下 Vue 示例代码块均包含 `<script setup lang="ts">`，且不存在未标注 TypeScript 的 `## 示例代码` 标题。
验证结果：完整构建成功；dry-run 成功；.gitignore 无需新增规则；敏感扫描未发现真实密钥。
```

```text
日期：2026-06-12
改进内容：将企业组件文档站从“组件 + Playground”调整为“组件 / 场景模板 / Playground”三入口；组件页按单组件级别和业务无关分类展示，原大块功能组合展示改名为场景模板；组件总览与场景模板总览复用 CatalogOverview.vue。
关键文件：
- frontend-platform/apps/docs/.vitepress/config.ts
- frontend-platform/apps/docs/src/componentCatalog.ts
- frontend-platform/apps/docs/src/CatalogOverview.vue
- frontend-platform/apps/docs/src/ComponentOverview.vue
- frontend-platform/apps/docs/src/ScenarioTemplateOverview.vue
- frontend-platform/apps/docs/component/overview.md
- frontend-platform/apps/docs/scenario/overview.md
关键命令：
- corepack pnpm --filter @smartwarehouse/component-docs build
- corepack pnpm build
- corepack pnpm publish:dry-run
验证重点：
- 顶部公开导航只显示“组件”“场景模板”“Playground”。
- /component/overview 展示基础、布局、数据录入、数据展示、反馈与流程、高级组件六类单组件目录。
- /scenario/overview 展示平台基础、表单与列表、流程与长任务、看板与智能等多组件组合模板。
- /component/overview 与 /scenario/overview 复用同一个 CatalogOverview.vue，不复制总览 UI。
验证结果：文档站构建通过；完整构建通过；publish:dry-run 通过；HTTP 检查 /component/overview、/scenario/overview、/playground 均返回 200；浏览器检查 45 个组件、10 个场景模板、三入口导航和 390px 移动端无横向溢出均通过；敏感信息扫描未发现真实密钥。
```

```text
日期：2026-06-12
改进内容：将 /component/* 从“部分组件共用组合详情页”重构为严格单组件详情页；/scenario/* 承载多组件组合模板。
关键文件：
- frontend-platform/apps/docs/src/componentCatalog.ts
- frontend-platform/apps/docs/src/componentDocs.ts
- frontend-platform/apps/docs/src/ComponentDetail.vue
- frontend-platform/apps/docs/src/scenarioTemplateDocs.ts
- frontend-platform/apps/docs/src/ScenarioTemplateDetail.vue
- frontend-platform/apps/docs/.vitepress/config.ts
- frontend-platform/apps/docs/.vitepress/theme/style.css
- frontend-platform/apps/docs/component/*.md
- frontend-platform/apps/docs/scenario/*.md
手搓步骤：
1. 在 componentCatalog.ts 中把组件级元数据和场景模板元数据分开，componentCatalog 的 docsPath 固定为 /component/<slug>，scenarioTemplateCatalog 的 docsPath 固定为 /scenario/<slug>。
2. 新建 componentDocs.ts，按 slug 维护 Props、Events、Slots、Types、Vue + TypeScript 示例代码和注意事项。
3. 新建 ComponentDetail.vue，通过 slug 读取 componentDocs，并统一渲染标题、基础用法、示例代码、API 表、Types、注意事项和关联场景模板。
4. 新建 scenarioTemplateDocs.ts 和 ScenarioTemplateDetail.vue，专门渲染多组件组合模板，并列出底层组件链接。
5. 将每个 /component/<slug>.md 改为只导入 ComponentDetail 并传入对应 slug。
6. 将 /component/business-selects、/component/dashboard、/component/ai-workbench 改为迁移提示页，分别指向 /scenario/business-selects、/scenario/ops-dashboard、/scenario/ai-workbench。
7. 为 10 个场景模板新增 /scenario/<slug>.md，统一导入 ScenarioTemplateDetail。
8. 将旧 /components/* 兼容路径改为跳转提示，避免旧组合正文继续被访问。
9. 在 .vitepress/config.ts 中恢复中文导航和侧边栏，确保顶部只有“组件 / 场景模板”。
10. 在 .vitepress/theme/style.css 中补充 sw-component-detail、sw-api-table、sw-demo-inline、sw-doc-preview--layout 等样式。
关键命令：
- cd frontend-platform
- corepack pnpm --filter @smartwarehouse/component-docs build
- corepack pnpm build
- corepack pnpm publish:dry-run
- cd apps/docs
- corepack pnpm exec vitepress preview . --host 127.0.0.1 --port 4174
路由验收：
- /component/overview
- /component/status-tag
- /component/warehouse-select
- /component/chat-panel
- /scenario/overview
- /scenario/ai-workbench
常见错误：
- 不要让多个组件共用 /component/business-selects、/component/dashboard、/component/ai-workbench 这类组合 docsPath。
- 不要把组合 Demo 写回组件详情页；组件详情页最多提供“关联场景模板”链接。
- pnpm script 透传 preview 参数时可能被包装，导致仍占用默认 4173；可进入 apps/docs 后直接使用 corepack pnpm exec vitepress preview . --host 127.0.0.1 --port 4174。
- PowerShell 中 $PID 是只读变量，停止预览端口进程时不要用 foreach ($pid in ...)，改用 $procId。
验证结果：
- component-docs build 成功；完整构建成功；publish:dry-run 成功。
- preview HTTP 检查 7 个核心路由均返回 200，端口 4174 验证后已关闭。
- .gitignore 已新增 `.tmp*/`；敏感扫描未发现真实密钥。
```

```text
日期：2026-06-12
改进内容：删除预设式静态 Playground，组件文档站公开入口收敛为“组件 / 场景模板”。
关键文件：
- frontend-platform/apps/docs/.vitepress/config.ts
- frontend-platform/apps/docs/.vitepress/theme/style.css
- frontend-platform/apps/docs/src/componentCatalog.ts
- frontend-platform/apps/docs/index.md
- frontend-platform/apps/docs/examples.md
- frontend-platform/apps/docs/release.md
- frontend-platform/apps/docs/component/overview.md
- frontend-platform/apps/docs/scenario/overview.md
删除文件：
- frontend-platform/apps/docs/playground.md
- frontend-platform/apps/docs/src/PlaygroundWorkbench.vue
- frontend-platform/apps/docs/src/ComponentPlayground.vue
手搓步骤：
1. 从 .vitepress/config.ts 顶部 nav 删除 Playground，只保留组件和场景模板。
2. 删除 playground.md、PlaygroundWorkbench.vue、ComponentPlayground.vue。
3. 从 componentCatalog.ts 删除 playgroundPreset 类型字段和所有条目中的 playgroundPreset 配置。
4. 从 VitePress theme 中删除 .sw-playground* 和 .sw-repl* 专属样式。
5. 更新 index.md、examples.md、release.md、component/overview.md、scenario/overview.md，去掉 /playground 入口和 Playground 预设说明。
6. 构建后启动 preview，检查 /component/overview、/component/status-tag、/component/warehouse-select、/scenario/overview、/scenario/ai-workbench 正常访问。
7. 检查 /playground 不再作为有效文档站路由。
8. 同步更新 README、ROADMAP、DEVELOPMENT_RULE、PROGRESS、milestone、study、handle、skill 和 decisions。
关键命令：
- cd frontend-platform
- corepack pnpm --filter @smartwarehouse/component-docs build
- corepack pnpm build
- corepack pnpm publish:dry-run
- cd apps/docs
- corepack pnpm exec vitepress preview . --host 127.0.0.1 --port 4174
路由验收：
- /component/overview
- /component/status-tag
- /component/warehouse-select
- /component/chat-panel
- /scenario/overview
- /scenario/ai-workbench
- /playground 应不再作为有效路由
常见错误：
- 只删 nav 不删 playground.md，会让旧路由继续被生成。
- 只删页面不删 playgroundPreset，会让后续目录元数据继续暗示需要 Playground。
- 将固定预设演示换个名字保留，会继续和场景模板重复；除非实现真实在线编辑实时预览，否则不恢复。
验证结果：
- component-docs build 成功；完整构建成功；publish:dry-run 成功。
- preview HTTP 检查组件总览、单组件详情和场景模板详情返回 200，/playground 不再返回有效页面。
- Browser 验证顶部公开导航只包含“组件”“场景模板”。
- .gitignore 无需新增规则；敏感扫描未发现真实密钥。
```

```text
日期：2026-06-12
改进内容：检查并补强 frontend-platform 源码中文注释，提升组件库源码的学习友好度。
关键文件范围：
- frontend-platform/packages/platform-sdk/src/*
- frontend-platform/packages/platform-types/src/index.ts
- frontend-platform/packages/platform-ui/src/components/*
- frontend-platform/packages/platform-ui/src/hooks/useWebSocketClient.ts
- frontend-platform/apps/docs/src/*
手搓步骤：
1. 使用 rg 找出缺少中文注释的 ts/vue 文件：
   rg --files-without-match "//.*[一-龥]|<!--.*[一-龥]|/\\*.*[一-龥]" frontend-platform/packages/platform-ui/src/components frontend-platform/packages/platform-ui/src/hooks frontend-platform/packages/platform-sdk/src frontend-platform/packages/platform-types/src frontend-platform/apps/docs/src -g "*.ts" -g "*.vue"
2. 先检查 SDK、types、文档站渲染器和核心组件是否已有业务边界说明。
3. 对布局、菜单、页面、状态、看板、流程、表单、字典、选择器、上传导入导出、AI/BI 展示组件分组补注释。
4. 注释重点写“组件负责什么、不负责什么、数据从哪里来、真实接口将来在哪里替换、安全校验由谁兜底”。
5. 避免在模板标签旁大量写语法解释，保持注释密度服务阅读。
6. 补注释后重新运行覆盖检查，确认检查范围内没有遗漏文件。
7. 执行完整构建：
   cd frontend-platform
   corepack pnpm build
8. 构建通过后同步更新 README、PROGRESS、milestone、study 和 handle。
常见错误：
- 只给复杂组件加注释，忽略轻量组件；轻量组件后续更容易被错误塞入接口请求和业务规则。
- 注释只解释语法，不解释边界；这类注释会增加阅读噪音。
- AI/SQL/MCP 展示组件没有写清安全边界，容易让人误以为前端展示层可以执行 SQL 或直接调用工具。
- 选择器组件没有写清 mock 数据替换位置，后续接真实接口时容易在多个组件中重复写 HTTP 请求。
验证结果：
- 注释覆盖检查通过，检查范围内 ts/vue 源码均包含中文说明。
- frontend-platform 完整构建成功，四个平台包和 VitePress 文档站均通过。
- .gitignore 无需新增规则；敏感扫描未发现真实密钥。
```

## 9. 发布 snapshot/release 版
1.修改配置
- 到阿里云效中下载snapshot和release库的npmrc文件，将两个文件内容按照下方格式进行合并，放到frontend-platform根目录下，并重命名为.npmrc
```text
# 所有包从阿里云效私库下载（它代理了官方 npm）
registry=https://packages.aliyun.com/xxxxxxxxxxxx/npm/repo-qbic/

# 认证
always-auth=true

# snapshot 仓库的 token
//packages.aliyun.com/xxxxxxxxxxxx/npm/repo-qbic/:_authToken=你的真实token

# release 仓库的 token
//packages.aliyun.com/xxxxxxxxxxxx/npm/repo-dmjby/:_authToken=你的真实token

# 二进制包国内镜像（加速 node-sass 等编译）
sass_binary_site="https://npmmirror.com/mirrors/node-sass/"
phantomjs_cdnurl="https://cdn.npmmirror.com/binaries/phantomjs"
electron_mirror="https://cdn.npmmirror.com/binaries/electron/"
sqlite3_binary_host_mirror="https://foxgis.oss-cn-shanghai.aliyuncs.com/"
chromedriver_cdnurl="https://cdn.npmmirror.com/binaries/chromedriver"
```
- 修改packages下每个子包的package.json，删除publishConfig.registry字段，改为在.npmrc中统一配置registry地址
- 在frontend-platform目录下的package.json文件中的scripts下，添加发布脚本
```json
    "publish:dry-run:snapshot": "corepack pnpm --filter @smartwarehouse/platform-types publish --registry https://packages.aliyun.com/62b95dfe487c500c27f679ef/npm/repo-qbic/ --tag snapshot --no-git-checks --dry-run && corepack pnpm --filter @smartwarehouse/platform-theme publish --registry https://packages.aliyun.com/62b95dfe487c500c27f679ef/npm/repo-qbic/ --tag snapshot --no-git-checks --dry-run && corepack pnpm --filter @smartwarehouse/platform-sdk publish --registry https://packages.aliyun.com/62b95dfe487c500c27f679ef/npm/repo-qbic/ --tag snapshot --no-git-checks --dry-run && corepack pnpm --filter @smartwarehouse/platform-ui publish --registry https://packages.aliyun.com/62b95dfe487c500c27f679ef/npm/repo-qbic/ --tag snapshot --no-git-checks --dry-run",

    "publish:dry-run:release": "corepack pnpm --filter @smartwarehouse/platform-types publish --registry https://packages.aliyun.com/62b95dfe487c500c27f679ef/npm/repo-dmjby/ --no-git-checks --dry-run && corepack pnpm --filter @smartwarehouse/platform-theme publish --registry https://packages.aliyun.com/62b95dfe487c500c27f679ef/npm/repo-dmjby/ --no-git-checks --dry-run && corepack pnpm --filter @smartwarehouse/platform-sdk publish --registry https://packages.aliyun.com/62b95dfe487c500c27f679ef/npm/repo-dmjby/ --no-git-checks --dry-run && corepack pnpm --filter @smartwarehouse/platform-ui publish --registry https://packages.aliyun.com/62b95dfe487c500c27f679ef/npm/repo-dmjby/ --no-git-checks --dry-run",

    "publish:snapshot": "corepack pnpm --filter @smartwarehouse/platform-types publish --registry https://packages.aliyun.com/62b95dfe487c500c27f679ef/npm/repo-qbic/ --tag snapshot --no-git-checks && corepack pnpm --filter @smartwarehouse/platform-theme publish --registry https://packages.aliyun.com/62b95dfe487c500c27f679ef/npm/repo-qbic/ --tag snapshot --no-git-checks && corepack pnpm --filter @smartwarehouse/platform-sdk publish --registry https://packages.aliyun.com/62b95dfe487c500c27f679ef/npm/repo-qbic/ --tag snapshot --no-git-checks && corepack pnpm --filter @smartwarehouse/platform-ui publish --registry https://packages.aliyun.com/62b95dfe487c500c27f679ef/npm/repo-qbic/ --tag snapshot --no-git-checks",

    "publish:release": "corepack pnpm --filter @smartwarehouse/platform-types publish --registry https://packages.aliyun.com/62b95dfe487c500c27f679ef/npm/repo-dmjby/ --no-git-checks && corepack pnpm --filter @smartwarehouse/platform-theme publish --registry https://packages.aliyun.com/62b95dfe487c500c27f679ef/npm/repo-dmjby/ --no-git-checks && corepack pnpm --filter @smartwarehouse/platform-sdk publish --registry https://packages.aliyun.com/62b95dfe487c500c27f679ef/npm/repo-dmjby/ --no-git-checks && corepack pnpm --filter @smartwarehouse/platform-ui publish --registry https://packages.aliyun.com/62b95dfe487c500c27f679ef/npm/repo-dmjby/ --no-git-checks",
```
2.发布
- cd E:\Code\codex\SmartWarehouse-AI\frontend-platform
- corepack pnpm install 
- corepack pnpm build

发布 snapshot 前
不改版本号。直接在当前版本上发。如果你要递增 snapshot 序号（比如修正 bug 后重新发），则四个子包的 version 统一改：
0.1.0-snapshot.1 → 0.1.0-snapshot.2

- corepack pnpm publish:dry-run:snapshot   # snapshot预演
- corepack pnpm publish:snapshot           # snapshot正式发

发布 release 前
四个子包的 package.json 中 version 统一去掉 -snapshot.N 后缀：
0.1.0-snapshot.2 → 0.1.0

- corepack pnpm publish:dry-run:release    # release预演
- corepack pnpm publish:release            # release正式发

- git tag frontend-platform/v0.1.0
- git push origin frontend-platform/v0.1.0

发布 release 后（开始下个迭代）
四个子包的 version 统一改为下个版本的第一个 snapshot：
0.1.0 → 0.2.0-snapshot.1

根 package.json 的 version 字段不需要改，因为它不发布到 npm。

3.验证
- 发布 snapshot 版验证
  - mkdir E:\Code\temp\test-smartwarehouse-ui
  - cd E:\Code\temp\test-smartwarehouse-ui

  - corepack pnpm init
  - npm config set @smartwarehouse:registry "https://packages.aliyun.com/62b95dfe487c500c27f679ef/npm/repo-qbic/"
  - corepack pnpm add @smartwarehouse/platform-ui@snapshot @smartwarehouse/platform-sdk@snapshot @smartwarehouse/platform-theme@snapshot @smartwarehouse/platform-types@snapshot
  能安装成功，就说明云效 npm 私库发布链路打通了。
- 发布 release 版验证
  - mkdir E:\Code\temp\test-smartwarehouse-ui-release
  - cd E:\Code\temp\test-smartwarehouse-ui-release
  - corepack pnpm init
  - npm config set @smartwarehouse:registry "https://packages.aliyun.com/xxxxxxxxxxxxx/npm/repo-qbic-release/"
  - corepack pnpm add @smartwarehouse/platform-ui@latest @smartwarehouse/platform-sdk@latest @smartwarehouse/platform-theme@latest @smartwarehouse/platform-types@latest
- 更新 snapshot 版验证
  - cd E:\Code\temp\test-smartwarehouse-ui
  - corepack pnpm remove @smartwarehouse/platform-ui  （清理缓存验证最新包）
  - corepack pnpm add @smartwarehouse/platform-ui@snapshot @smartwarehouse/platform-sdk@snapshot @smartwarehouse/platform-theme@snapshot @smartwarehouse/platform-types@snapshot
- 更新 release 版验证
  - cd E:\Code\temp\test-smartwarehouse-ui-release
  - corepack pnpm remove @smartwarehouse/platform-ui  （清理缓存验证最新包）
  - corepack pnpm add @smartwarehouse/platform-ui@latest @smartwarehouse/platform-sdk@latest @smartwarehouse/platform-theme@latest @smartwarehouse/platform-types@latest

## 10.版本号规则
当前：v0.1.0-snapshot.1
测试通过后 → 发布 release v0.1.0
然后开始开发 → v0.2.0-snapshot.1

