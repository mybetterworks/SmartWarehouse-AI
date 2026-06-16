# 0012 门户壳层持久化 Tab 与 hosted 路由协定

## 状态
ACCEPTED

## 背景

在 `portal-shell` 通过 Module Federation 承载 `sys-web` 之后，门户已经具备统一壳层、统一菜单、统一顶部操作区和 hosted remote 内容区，但用户继续提出了两个更进一步的交互要求：

1. 每打开一个模块，都要在顶栏下方新增一个 tab，并在当前 tab 高亮显示。
2. 刷新页面后，不仅要恢复打开过的 tab，还要回到刷新前正在查看的 tab。
3. 用户在某个模块页内切换筛选条件、切换字典类型等，如果这些状态需要在刷新后恢复，就不能只依赖组件内存状态。
4. 这个能力不能只为 `sys-web` 写死，而是要沉淀为后续其他 hosted 系统可复用的门户壳层标准能力。

如果没有统一协定，host 与 remote 会同时尝试管理“当前页状态”“当前 tab”“刷新恢复”，最终导致：

- tab 页只恢复列表，不恢复当前页。
- remote 内部筛选状态刷新丢失。
- host 与 remote 对同一路径的理解不一致，出现刷新后回到默认页或默认筛选的问题。

## 决策

1. `portal-shell` 负责唯一的 tab 状态管理。
   - tab 列表、当前激活 tab、浏览器地址同步、刷新后的 tab 恢复，都由 `portal-shell` 维护。
   - tab UI 统一渲染在 `PlatformLayout` 的 `subheader` 插槽中。
   - remote 不自行渲染门户级 tabs。

2. 第一版 tab 规则采用“一个 pathname 对应一个 tab”。
   - `id` 使用标准化后的 pathname，例如 `/portal`、`/sys/users`、`/sys/dicts`。
   - `query` 和 `hash` 作为该 tab 的页面状态，不创建新 tab，只更新同一路径 tab 的 `fullPath`。
   - 这保证同一路径的 hosted 页面在切换筛选条件时不会无限新增 tabs。

3. tab 持久化采用“`KeepAlive` + localStorage 快照 + URL 全路径恢复”的组合方案。
   - `KeepAlive` 负责 tab 未关闭前的内存态保留，适合表单临时状态、列表滚动位置、已展开面板等会话内状态。
   - localStorage 负责恢复“打开过哪些 tab”。
   - 浏览器当前 URL 负责恢复“刷新时正在看的那个 tab”。
   - tab 快照按用户隔离存储，key 规则为 `sw.portal.tabs:<userId>`。

4. hosted 模块必须遵守统一路由协定。
   - host 传入 `routePath` 与 `routeFullPath`。
   - remote 如果在内部切换了同一模块下的页面或查询条件，必须向上抛出 `routeChange({ fullPath, mode })`。
   - `fullPath` 必须包含需要刷新恢复的 query，例如字典页的 `dictCode`。
   - 如果某个状态只要求“切 tab 不丢”，不要求“刷新后恢复”，可以只放在组件状态里，不必写入 URL。

5. 开发态联调远程模块时，remote 需要优先使用 `preview` 服务而不是 `vite dev` 服务暴露 `remoteEntry.js`。
   - `vite dev` 场景下，请求 `/apps/sys/assets/remoteEntry.js` 可能返回 HTML 入口页，而不是真正的 federation entry。
   - `portal-shell` 作为 host 联调 hosted remote 时，应优先连到 `preview` 产物对应的 `remoteEntry.js`。

## 影响

- `PlatformLayout` 新增 `subheader` 插槽，成为门户承载 tab 的标准位置。
- `portal-shell` 成为所有 hosted 系统的 tab 容器和刷新恢复入口。
- `sys-web` 这类 hosted remote 需要显式处理 `routeFullPath`，并在内部状态变化后回传完整路径。
- 后续 `wms-web`、`mes-web`、`ai-web` 如果也接入 hosted 路由细分页面，应复用同一套协定，而不是重新定义各自的 tab 恢复方式。
- 当前 v1 规则下，同一路径不同 query 不拆分新 tab；如果未来要支持“同一模块多条件并排开多个 tab”，需要新增独立 `tabKey` 方案。

## 后续动作

1. 后续 hosted 模块接入时，优先检查是否已经正确消费 `routeFullPath` 并回传 `routeChange`。
2. 如某个业务页存在“同一路径需要同时打开多个实例”的需求，再单独追加新的 ADR 设计 `tabKey` 机制。
3. E2E 验收脚本后续应补齐以下场景：
   - 打开多个模块 tab。
   - 刷新后恢复 tab 列表和当前 tab。
   - hosted 页面通过 query 恢复筛选状态。
