# 0009 门户统一前端路由入口

## 状态

SUPERSEDED

已被 `0010-vite-plugin-federation-runtime-micro-frontend.md` 替代。保留本决策作为 V02 从“跨端口跳转”收敛到“统一门户路由”的历史记录。

## 背景

V02 早期优化已去掉 iframe 和 URL Token，但 `portal-shell` 进入系统管理时仍跳转到 `http://localhost:5175/apps/sys/?redirect=...`。这让总控制台和子应用形成多个前端入口，用户会感知为离开门户，也不符合“所有前端服务都在 `http://localhost:5174/` 中直接通过路由访问”的要求。

## 决策

1. `portal-shell` 是本地开发和门户集成的唯一前端入口，本地统一入口为 `http://localhost:5174/`。
2. 系统管理在门户中使用 `/sys/**` 路由，例如 `/sys/users`、`/sys/roles`。
3. 后续 WMS、MES、AI、task 前端分别使用 `/wms/**`、`/mes/**`、`/ai/**`、`/task/**`。
4. 各子项目仍保持独立开发、独立构建和独立 dev server 调试能力，但门户集成必须提供 embedded/route 入口，由 `portal-shell` 通过包名或正式 npm 制品承载。
5. 门户集成不得使用 iframe、`window.open`、跨端口跳转、URL Token 或 `redirect` 参数跨应用跳转作为正式方案。

## 影响

- `sys-web` 新增 `@smartwarehouse/sys-web/embedded` 导出入口。
- `portal-shell` 通过 workspace 包名依赖 `@smartwarehouse/sys-web`，在 `/sys/**` 下承载系统管理页面。
- `platform-ui` 的 `SideMenu` 支持一级目录点击派发，点击“系统管理”目录可进入默认页面。
- V03 及后续乙方前端开发时，`wms-web`、`mes-web`、`ai-web` 需要按同样模式提供门户可承载入口。

## 后续动作

1. 后续不再按 embedded/route 方案扩展 WMS/MES/AI。
2. V03/V04/V05 按 `0010` 决策提供 Module Federation remoteEntry、远程容器名和暴露模块。
