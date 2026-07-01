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

## 7. maven发布流程

- maven制品包括：
  - platform-parent
  - platform-bom
  - platform-common-core
  - platform-common-web
  - platform-common-data
  - platform-common-security-lite
  - platform-common-redis
  - platform-common-mq
  - platform-common-log
  - platform-common-id
  - sys-api
  - task-api
  - mes-api
  - wms-api

- 发布snapshot版
  - 修改版本号为0.1.0-SNAPSHOT
  - cd E:\Code\codex\SmartWarehouse-AI
  - mvn -pl platform/platform-bom,platform/platform-parent,platform/platform-common-core,platform/platform-common-log,platform/platform-common-web,platform/platform-common-data,platform/platform-common-security-lite,platform/platform-common-redis,platform/platform-common-mq,platform/platform-common-id,sys/sys-api clean install -DskipTests
  - mvn -pl platform/platform-bom clean deploy -DskipTests
  - mvn -pl platform/platform-parent clean deploy -DskipTests
  - mvn -pl platform/platform-common-core,platform/platform-common-log,platform/platform-common-web,platform/platform-common-data,platform/platform-common-security-lite,platform/platform-common-redis,platform/platform-common-mq,platform/platform-common-id,sys/sys-api clean deploy -DskipTests
  - 如果第三条遇到依赖解析问题，再改用：
  - mvn -pl platform/platform-common-core,platform/platform-common-log,platform/platform-common-web,platform/platform-common-data,platform/platform-common-security-lite,platform/platform-common-redis,platform/platform-common-mq,platform/platform-common-id,sys/sys-api -am clean deploy -DskipTests

- 发布release版
  - 修改版本号为0.1.0
  - cd E:\Code\codex\SmartWarehouse-AI
  - mvn -pl platform/platform-bom,platform/platform-parent,platform/platform-common-core,platform/platform-common-log,platform/platform-common-web,platform/platform-common-data,platform/platform-common-security-lite,platform/platform-common-redis,platform/platform-common-mq,platform/platform-common-id,sys/sys-api clean install -DskipTests
  - mvn -pl platform/platform-bom clean deploy -DskipTests
  - mvn -pl platform/platform-parent clean deploy -DskipTests
  - mvn -pl platform/platform-common-core,platform/platform-common-log,platform/platform-common-web,platform/platform-common-data,platform/platform-common-security-lite,platform/platform-common-redis,platform/platform-common-mq,platform/platform-common-id,sys/sys-api clean deploy -DskipTests

## 8.npm发布

- 发布npm制品对象范围：
  @smartwarehouse/platform-types
  @smartwarehouse/platform-theme
  @smartwarehouse/platform-sdk
  @smartwarehouse/platform-ui
- 确认.npmrc文件
```text
registry=<你的云效 npm snapshot 仓库 registry 地址>
@smartwarehouse:registry=<你的云效 npm snapshot 仓库 registry 地址>

always-auth=true

//<你的 snapshot registry host 和 path>/:_authToken=${SMARTWAREHOUSE_SNAPSHOT_TOKEN}
//<你的 release registry host 和 path>/:_authToken=${SMARTWAREHOUSE_RELEASE_TOKEN}

sass_binary_site=https://npmmirror.com/mirrors/node-sass/
phantomjs_cdnurl=https://cdn.npmmirror.com/binaries/phantomjs
electron_mirror=https://cdn.npmmirror.com/binaries/electron/
chromedriver_cdnurl=https://cdn.npmmirror.com/binaries/chromedriver
```
- 发布snapshot版
  - 修改版本号为：0.2.0-snapshot.1
  - 修改.npmrc文件的registry和@smartwarehouse:registry为snapshot仓库地址
  - cd E:\Code\codex\SmartWarehouse-AI\frontend-platform
  - 启用 Node.js 自带的 Corepack 包管理器代理。
    corepack enable
  - 下载并激活指定版本的 pnpm。
    corepack prepare pnpm@10.12.1 --activate
  - 按照 pnpm-lock.yaml 精确安装依赖。
    corepack pnpm install --frozen-lockfile
  - 构建要发布的 4 个 npm 平台包。
    corepack pnpm build:packages
  - 只构建组件文档站。
    corepack pnpm --filter @smartwarehouse/component-docs build
  - 预演 snapshot 发布，不真正上传 npm 包。
    corepack pnpm publish:dry-run:snapshot
  - 真正发布 snapshot npm 制品。
    corepack pnpm publish:snapshot

- 发布release版
  - 修改版本号为：0.2.0
  - 修改.npmrc文件的registry和@smartwarehouse:registry为release仓库地址
  - cd E:\Code\codex\SmartWarehouse-AI\frontend-platform
  - 启用 Node.js 自带的 Corepack 包管理器代理。
    corepack enable
  - 下载并激活指定版本的 pnpm。
    corepack prepare pnpm@10.12.1 --activate
  - 按照 pnpm-lock.yaml 精确安装依赖。
    corepack pnpm install --frozen-lockfile
  - 构建要发布的 4 个 npm 平台包。
    corepack pnpm build:packages
  - 只构建组件文档站。
    corepack pnpm --filter @smartwarehouse/component-docs build
  - 预演 release 发布，不真正上传 npm 包。
    corepack pnpm publish:dry-run:release
  - 真正发布 release npm 制品。
    corepack pnpm publish:release

- pom脚本命令中不需要指定仓库地址，仓库地址以.npmrc文件中的registry和@smartwarehouse:registry设置的为准

## 9.镜像发布
- 在Jenkins构建时
  - 勾选PUSH_ACR_RELEASE
  - 填写RELEASE_VERSION
  - 勾选PUSH_LATEST


