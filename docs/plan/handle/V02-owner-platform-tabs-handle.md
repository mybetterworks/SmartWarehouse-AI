# 版本：V02 门户壳层持久化 Tabs

完成日期：2026-06-16

状态：DONE

## 1. 目标

为 `portal-shell` 增加统一的模块 tab 持久化能力，满足以下要求：

- 每打开一个模块，顶部下方新增一个 tab。
- 当前页面对应的 tab 高亮显示。
- tab 标签显示模块图标和名称。
- 刷新页面后恢复已打开的 tab，并回到刷新前正在查看的 tab。
- hosted remote 页面如果把关键状态写入 URL，则刷新后继续恢复到相同状态。

## 2. 关键文件

- `frontend-platform/apps/portal-shell/src/App.vue`
- `frontend-platform/apps/portal-shell/src/PortalTabPane.vue`
- `frontend-platform/apps/portal-shell/src/PortalWorkbenchView.vue`
- `frontend-platform/apps/portal-shell/src/MicroFrontendOutlet.vue`
- `frontend-platform/apps/portal-shell/src/portalTabs.ts`
- `frontend-platform/apps/portal-shell/src/routeUtils.ts`
- `frontend-platform/apps/portal-shell/src/tabIcons.ts`
- `frontend-platform/apps/portal-shell/src/style.css`
- `frontend-platform/packages/platform-ui/src/components/PlatformLayout/PlatformLayout.vue`
- `frontend-platform/apps/sys-web/src/HostedRemote.vue`
- `frontend-platform/apps/sys-web/src/useSysManagement.ts`

## 3. 实现要点

### 3.1 门户壳层负责 tabs

- `PlatformLayout` 的 `subheader` 插槽作为统一 tab 承载区。
- `portal-shell` 自己维护 `tabs`、`activeTabId`、`currentFullPath`。
- `/portal` 固定为不可关闭的工作台 tab。
- 业务模块 tab 根据菜单匹配结果自动生成标题和图标。

### 3.2 持久化策略

- 当前版本采用“一条 pathname 一个 tab”。
- tab 快照保存在 localStorage，key 为 `sw.portal.tabs:<userId>`。
- `fullPath` 保存完整路径，包括 query 与 hash。
- 刷新恢复时：
  - localStorage 负责恢复 tab 列表。
  - 浏览器当前 URL 负责恢复当前激活 tab。
  - `KeepAlive` 负责 tab 未关闭前的组件内存态缓存。

### 3.3 hosted remote 协定

- host 传给 remote：
  - `routePath`
  - `routeFullPath`
  - `hosted=true`
- remote 内部如果发生页面切换或需要刷新恢复的条件切换，必须回传：

```ts
emit('routeChange', {
  fullPath: '/sys/dicts?dictCode=data_scope',
  mode: 'replace'
})
```

- 推荐约定：
  - 只需要“切 tab 不丢”的状态，保留在组件内即可。
  - 需要“刷新后也恢复”的状态，必须写入 `fullPath` 的 query。

## 4. 模块开发使用方法

### 4.1 新 hosted 模块如何接入

1. 在门户可授权菜单中配置模块与页面路径。
2. remote 暴露的入口组件只负责内容区，不自行渲染门户级 `PlatformLayout` 与 tabs。
3. remote 接收 `routePath` / `routeFullPath` 后，按传入路径初始化页面。
4. 页面内部如果切换了二级路由或关键筛选条件，向 host 发出 `routeChange`。

### 4.2 什么时候要把状态写进 URL

- 应写进 URL：
  - 当前选中的字典类型
  - 当前二级子页面
  - 需要刷新后恢复的查询条件主键
  - 可以被分享或被书签化的状态

- 不必写进 URL：
  - 临时展开面板
  - 尚未提交的表单输入
  - 只要求切 tab 返回后不丢失的页面局部状态

## 5. 注意事项

### 5.1 当前版本的限制

- 当前版本是“一条 pathname 一个 tab”。
- 同一路径不同 query 不会拆成多个 tab，而是复用同一个 tab 并更新 `fullPath`。
- 如果未来要支持“同一模块多条件同时打开多个 tab”，需要单独设计 `tabKey`。

### 5.2 开发联调方式

- `portal-shell` host 建议用 `dev` 启动。
- 被门户动态加载的 remote 建议优先用 `preview` 启动。
- 原因：
  - `vite dev` 下访问 `/apps/<module>/assets/remoteEntry.js` 可能返回 HTML，而不是真正的 federation entry。
  - 这会导致 host 侧出现 `Failed to fetch dynamically imported module`。

推荐联调组合：

```powershell
corepack pnpm --filter @smartwarehouse/portal-shell dev
corepack pnpm --filter @smartwarehouse/sys-web build
corepack pnpm --filter @smartwarehouse/sys-web preview
```

### 5.3 刷新恢复的边界

- tab 列表恢复依赖 localStorage。
- 当前 tab 恢复依赖浏览器当前 URL。
- hosted 页面内部状态恢复依赖 remote 是否正确把关键状态写进 `routeFullPath`。
- 如果 remote 没有回传完整 `fullPath`，门户只能恢复到该页面的默认态。

## 6. 本次验证结果

- 本地构建通过：
  - `corepack pnpm --filter @smartwarehouse/platform-ui build`
  - `corepack pnpm --filter @smartwarehouse/sys-web build`
  - `corepack pnpm --filter @smartwarehouse/portal-shell build`

- 浏览器验收通过：
  - 门户登录后显示工作台 tab。
  - 从工作台打开系统管理后，新增“用户管理” tab。
  - 再打开“角色管理”“字典管理”后，tab 列表继续累加，当前 tab 高亮正常。
  - 刷新 `http://localhost:5174/sys/users` 后，已打开 tabs 保留，当前仍停留在“用户管理”。
  - 字典管理切换到 `dictCode=data_scope` 后，刷新仍保持 `data_scope`，不会回退到默认字典类型。
