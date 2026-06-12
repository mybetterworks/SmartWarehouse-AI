# 0007 组件入口单组件详情边界

## 状态

ACCEPTED

## 日期

2026-06-12

## 背景

`0006-enterprise-component-docs-three-entry-structure.md` 曾确定文档站公开入口为 `组件`、`场景模板` 和 `Playground`，后续 `0008-remove-static-playground-public-entry.md` 将公开入口收敛为 `组件` 和 `场景模板`。但实现后继续评审发现，虽然 `组件` 总览已经按单组件目录展示，部分组件条目的详情页仍复用旧组合页面：

- `WarehouseSelect`、`LocationTreeSelect`、`MaterialSelect`、`WorkOrderSelect` 指向业务选择器组合页。
- `DashboardGrid`、`StatCard`、`RankList`、`AlertPanel`、`RealtimeBadge` 指向运营看板组合页。
- `ChatPanel`、`PromptInput`、`MarkdownRenderer`、`ChatBIResultTable`、`SqlPreview`、`AgentStepTimeline`、`ToolCallTrace` 指向 AI 工作台组合页。

这会导致乙方开发人员进入组件详情后看到的是场景模板，而不是单个组件的样式、代码和参数说明。企业级组件库的 `组件` 入口必须用于查单组件 API，组合内容应进入 `场景模板`。

## 决策

`组件` 入口必须保持单组件详情边界：

1. `componentCatalog` 中每个组件条目的 `docsPath` 必须唯一指向 `/component/<slug>`。
2. 每个 `/component/<slug>` 只展示一个底层组件的效果预览、Vue + TypeScript 示例代码、Props、Events、Slots、Types、注意事项和关联场景模板。
3. 多组件组合、大块页面片段和业务工作台只能放在 `/scenario/<slug>`。
4. `/scenario/<slug>` 需要列出底层组件，并链接回对应 `/component/<slug>`。
5. 旧组合组件路径 `/component/business-selects`、`/component/dashboard`、`/component/ai-workbench` 仅保留迁移提示，不再承载组合正文。
6. 旧 `/components/*` 路径仅作为兼容跳转或提示页，不再维护旧正文。

实现约束：

- 单组件详情由 `frontend-platform/apps/docs/src/ComponentDetail.vue` 和 `frontend-platform/apps/docs/src/componentDocs.ts` 维护。
- 场景模板详情由 `frontend-platform/apps/docs/src/ScenarioTemplateDetail.vue` 和 `frontend-platform/apps/docs/src/scenarioTemplateDocs.ts` 维护。
- Markdown 路由文件只负责传入 slug，不复制详情页结构。

## 影响

- `组件` 入口更符合企业级组件库按组件查 API 的使用方式。
- `场景模板` 入口保留组合复用价值，但不会污染单组件文档。
- 后续新增组件时必须同时登记 catalog、补充 componentDocs API 信息和独立组件路由。
- 后续新增模板时必须登记 scenarioTemplateCatalog、补充 scenarioTemplateDocs，并列出底层组件链接。

## 后续动作

1. 新增组件时检查 `componentCatalog` 是否存在重复 `docsPath`。
2. 新增场景模板时检查是否误写到 `componentCatalog`。
3. 组件参数变化时优先更新 `componentDocs.ts`。
4. 模板组合变化时优先更新 `scenarioTemplateDocs.ts`。
5. 文档站验收时同时检查单组件详情和场景模板详情路由。

## 验证

```powershell
cd frontend-platform
corepack pnpm --filter @smartwarehouse/component-docs build
corepack pnpm build
corepack pnpm publish:dry-run
```

路由验证：

```text
/component/overview
/component/status-tag
/component/warehouse-select
/component/chat-panel
/scenario/overview
/scenario/ai-workbench
```

验证结果：

- 组件侧边栏指向 `/component/<slug>`。
- 场景模板侧边栏指向 `/scenario/<slug>`。
- 旧组合组件页仅保留迁移提示。
- 构建、完整构建、publish dry-run 和 preview HTTP 路由检查均通过。
