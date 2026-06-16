# 0010 vite-plugin-federation 运行时微前端架构

## 状态

ACCEPTED

## 背景

V02 已经完成门户统一路由，但 embedded/route 方案会让 `portal-shell` 在构建期依赖子应用包。后续多个乙方分别维护 `wms-web`、`mes-web`、`ai-web` 时，如果每次乙方发版都要求重新构建甲方门户，就不符合真实商业项目中“乙方独立发布、甲方门户持续运行”的协作要求。

## 决策

1. `portal-shell` 作为 Module Federation host，只负责统一登录、菜单、模块注册读取、运行时加载和降级页。
2. `sys-web`、`wms-web`、`mes-web`、`ai-web` 均作为 remote 独立构建，统一暴露 `./RemoteApp`。
3. 模块注册信息由 `sys_frontend_module` 维护，核心字段为 `remote_name`、`remote_entry`、`exposed_module`，乙方发布新版本时只更新自己的静态制品和模块注册信息。
4. 门户路由仍保持统一入口，例如本地 `http://localhost:5174/sys/users`、`/wms`、`/mes`、`/ai`，但页面内容由运行时 remote 组件加载，不再构建期导入乙方应用。
5. 远程模块加载失败、超时或 remoteEntry 不可访问时，`portal-shell` 只显示当前模块降级页，不影响门户、系统管理和其他已可用模块。
6. 本地联调使用 remote 构建产物加 preview 服务验证，例如 `http://localhost:5176/apps/wms/assets/remoteEntry.js`；普通 dev server 只用于子应用独立开发调试。

## 影响

- `portal-shell` 引入 `@originjs/vite-plugin-federation`，通过 `virtual:__federation__` 在运行时注册 remote。
- `sys-web` 从静态 embedded 入口转为 remote，`wms-web`、`mes-web`、`ai-web` 建立最小 remote 应用骨架。
- `sys-service` 与 MySQL 表 `sys_frontend_module` 增加 `remote_name`、`remote_entry`、`exposed_module` 字段，并提供旧数据卷启动兼容补列。
- `platform-types` 的 `FrontendModule` 增加微前端注册字段。
- 后续乙方前端模块开发必须同时交付 remoteEntry、版本制品、模块注册说明和失败降级验收。

## 后续动作

1. V03 WMS 开发时，在 `wms-web` 现有 remote 骨架上补业务页面和接口联调，不把 WMS 页面静态打进 `portal-shell`。
2. V04/V05 开发 `mes-web`、`ai-web` 时复用同一 host/remote 接入模式。
3. Jenkins 测试环境发布时分别构建 portal-shell 与各 remote，并验证 remoteEntry URL 可访问。
4. 阿里弹性容器正式发布时，乙方只更新自己的前端静态制品和 `sys_frontend_module.remote_entry`。
