# 0011 门户壳层归 host，sys remote 只负责托管内容区

## 状态

ACCEPTED

## 背景

V02 已经通过 `vite-plugin-federation` 完成了 `portal-shell` host 与多个 remote 的运行时加载，但随着门户工作台、模块抽屉导航、统一后台布局和 sys hosted 模式的改造，原先“host 统一路由 + remote 自带独立壳层”的边界已经不够清晰：

1. `portal-shell` 跳转到 `sys-web` 时会出现登录页闪现，说明 remote 仍在门户托管场景下尝试走独立登录壳层。
2. 进入 `sys-web` 后无法稳定返回平台总控制台，也无法在统一顶部层级切换其他模块，说明“统一后台壳层”没有真正收口到 host。
3. 工作台首页需要展示消息、最近访问、常用模块和登录记录，这些数据跨越 host、sys-service 和模块授权边界，必须有明确的数据模型与归属。
4. `sys-web` 仍然需要保留独立开发与独立登录调试能力，因此“host 专属入口”和“standalone 调试入口”必须在能力边界上彻底分开。

## 决策

1. `portal-shell` 是唯一的登录后统一后台壳层。
   - 登录后始终保留统一顶部栏和内容区。
   - `/portal` 作为工作台首页。
   - `/sys/**`、`/wms/**`、`/mes/**`、`/ai/**` 继续在同一壳层内切换。

2. `sys-web` 拆分为两种运行模式。
   - `standalone`：保留独立登录与独立调试能力，使用新的标准后台布局，但隐藏 host 专属工作台按钮和模块抽屉。
   - `hosted`：只渲染系统管理内容区，不渲染登录页、不渲染自身 `PlatformLayout`、不渲染顶部 tabs。

3. 统一后台布局能力先沉淀在组件库。
   - `PlatformLayout` 由组件库负责扩展 `showAside`、`showWorkbenchButton`、`showModuleDrawerTrigger`、`moduleEntries`、`activeModuleCode` 等 props。
   - 工作台按钮和模块抽屉事件统一为 `workbenchClick`、`moduleSelect`。
   - host 与 standalone 都复用同一个布局组件能力，但是否显示 host 专属入口由接入方决定。

4. 工作台数据归属 `sys-service`，不归属任何 remote。
   - `GET /api/sys/portal/workbench` 由 sys-service 聚合个人信息、消息、常用模块、最近访问和登录记录。
   - `POST /api/sys/portal/access-log` 只记录“模块切换”级别的访问，不记录 `/portal`，也不记录模块内部页面跳转。
   - 常用模块和最近访问都以访问记录自动推导，并与当前用户授权模块求交集。

5. 其他 remote 的边界保持最小化。
   - 本轮仅 `sys-web` 完整接入“standalone 壳层 + hosted 内容区”双模式。
   - `wms-web`、`mes-web`、`ai-web` 当前仍保持“内容区 remote + 独立调试入口”模式，不新增统一 standalone 后台壳层。
   - 在没有 host 的情况下，这些模块不得显示工作台按钮、模块抽屉或任何会触发错误的空跳转入口。

## 影响

- `portal-shell` 负责统一登录后体验、工作台首页、顶部固定“工作台”按钮、模块抽屉、按当前模块过滤的侧边菜单，以及模块切换级访问记录上报。
- `sys-web` 的 remote 暴露从“完整独立应用”收口为“hosted 内容组件”，从根源消除 portal -> sys 跳转时登录页闪现。
- `PlatformLayout` 与组件文档、场景模板同步升级，形成 `portal-workbench` 与新版 `standard-layout` 的标准模板。
- `sys-service` 新增 `sys_portal_notice`、`sys_portal_access_log` 以及工作台聚合接口，工作台权限对所有已登录用户开放，不受 `sys:*` 或 `ADMIN` 约束。
- 后续 V03/V04/V05 接入其他 remote 时，继续沿用“host 负责壳层，remote 负责内容区”的边界，不再允许子应用把自己的登录壳层或门户导航强行带回 host 场景。

## 后续动作

1. V03 及后续乙方模块如果需要正式接入统一后台壳层，应先复用 `PlatformLayout` 的 host/standalone 边界，而不是重新设计独立导航模式。
2. Jenkins 和页面验收脚本后续应补充 portal-hosted 与 standalone 双模式的 E2E 验证，至少覆盖“无登录页闪现”“工作台返回”“host 专属入口隐藏”三项。
3. 后续如果 `wms-web`、`mes-web`、`ai-web` 也要支持独立后台壳层，应复用本 ADR 的边界，不再把 host 专属能力做成 remote 默认行为。
