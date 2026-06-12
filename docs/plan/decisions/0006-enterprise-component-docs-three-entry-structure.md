# 0006 企业组件库文档站三入口结构

## 状态

SUPERSEDED

## 日期

2026-06-12

## 背景

V01 企业组件库文档站此前采用 `组件 + Playground` 两模块结构。该结构去掉了首页、业务样例、发布说明等过多公开入口，但后续评审发现原 `组件` 页面仍按大块功能组合展示，更接近业务场景模板，而不是业务无关的单组件目录。

本决策已被 `0008-remove-static-playground-public-entry.md` 替代。原因是后续确认当前 Playground 只是预设式静态演示，不能在线修改代码并实时预览样式，继续保留会让文档站功能显得混乱。当前有效公开入口为 `组件` 和 `场景模板`。

企业级自定义组件库的核心使用方式包括两类：

1. 乙方开发人员按单组件查找 API、示例、Props、Events、Slots 和类型。
2. 甲方平台团队沉淀多组件组合的页面级复用结构，例如登录风控、查询表格、离线导入、流程状态、运营看板和 AI 工作台。

这两类信息粒度不同，应该在导航上分开；但展示代码应复用，避免后续修改组件卡片、分组、状态或响应式规则时需要维护多套实现。

## 决策

`frontend-platform/apps/docs` 公开入口固定为三个：

1. `组件`：入口为 `/component/overview`，展示与具体业务无关的组件级目录和组件详情。
2. `场景模板`：入口为 `/scenario/overview`，展示多个平台组件组合形成的页面级复用模板。
3. `Playground`：入口为 `/playground`，提供版本工具栏、代码编辑区、预设预览区、Reset 和 Copy 操作。

`组件` 页面按以下组件级分类组织：

- 基础
- 布局
- 数据录入
- 数据展示
- 反馈与流程
- 高级组件

`场景模板` 页面承载原大块功能组合展示，包括但不限于：

- 标准后台布局
- 标准页面容器
- 登录风控模板
- 标准查询表格模板
- Schema 表单模板
- 业务选择器模板
- 离线导入模板
- 物料需求流程模板
- 运营看板模板
- AI 工作台模板

实现约束：

1. `组件` 与 `场景模板` 必须复用 `apps/docs/src/CatalogOverview.vue`。
2. 组件级目录维护在 `apps/docs/src/componentCatalog.ts` 的 `componentGroups` 与 `componentCatalog`。
3. 场景模板目录维护在 `apps/docs/src/componentCatalog.ts` 的 `scenarioTemplateGroups` 与 `scenarioTemplateCatalog`。
4. 不得为 `/component/overview` 和 `/scenario/overview` 复制两套总览卡片、分组、状态和标签展示代码。
5. 旧路径 `/`、`/components`、`/examples`、`/release` 仅作为兼容入口或提示页，不进入顶部公开导航。

## 影响

- 组件库文档站更符合企业级自定义组件库定位。
- 乙方开发人员可以在 `组件` 入口按单组件查找 API 和示例。
- 甲方平台团队可以在 `场景模板` 入口沉淀多组件组合最佳实践。
- 旧决策 `0005-enterprise-component-docs-two-module-structure.md` 标记为 `SUPERSEDED`。
- 后续新增平台组件或模板时，需要先判断是单组件还是多组件组合，再写入对应 catalog。
- 本决策定义三入口信息架构；单组件详情页与场景模板详情页的更细边界由 `0007-component-docs-single-component-boundary.md` 继续约束。

## 后续动作

1. 新增单组件时更新 `componentCatalog`，并补充 `/component/<slug>` 详情页。
2. 新增多组件组合模板时更新 `scenarioTemplateCatalog`，必要时补充可复制示例或 Playground 预设。
3. 发布平台组件前必须执行 `corepack pnpm build` 和 `corepack pnpm publish:dry-run`。
4. 文档站视觉规则调整时优先修改 `CatalogOverview.vue` 或共享样式，避免同时修改组件页和场景模板页。
5. 后续组件参数变更时同步更新单组件详情元数据和关联场景模板链接。

## 验证

```powershell
cd frontend-platform
corepack pnpm --filter @smartwarehouse/component-docs build
corepack pnpm build
corepack pnpm publish:dry-run
```

验证结果：

- `/component/overview` 展示组件级目录。
- `/scenario/overview` 展示场景模板目录。
- `/playground` 保持可用。
- 顶部公开导航为 `组件`、`场景模板`、`Playground`。
- `ComponentOverview.vue` 与 `ScenarioTemplateOverview.vue` 复用 `CatalogOverview.vue`。
