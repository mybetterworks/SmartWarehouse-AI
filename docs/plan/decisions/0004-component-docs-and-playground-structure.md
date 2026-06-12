# 0004 组件文档站与 Playground 结构

## 状态

SUPERSEDED

## 日期

2026-06-11

## 背景

`frontend-platform` 是甲方维护的平台前端项目，后续 `wms-web`、`mes-web`、`ai-web` 等乙方前端项目只能通过 `@smartwarehouse/*` npm 包复用平台能力。

仅有一个综合组件演示页只能证明组件可以渲染，但无法满足真实企业协作中的组件查找、参数说明、代码复制、Playground 调试、发布验收和版本兼容要求。

## 替代说明

本决策已被 `0005-enterprise-component-docs-two-module-structure.md` 替代，随后又被 `0006-enterprise-component-docs-three-entry-structure.md` 和 `0008-remove-static-playground-public-entry.md` 继续替代。原因是后续架构评估认为首页、业务场景样例和发布说明进入公开导航后，会让组件库站点偏向单项目演示；而单一 `组件` 入口承载多组件组合展示时，又会削弱组件级目录的清晰度；预设式静态 Playground 又无法达到真实在线调试体验。当前有效公开入口为 `组件` 和 `场景模板`。

## 决策

`frontend-platform/apps/docs` 采用四层组件文档结构：

1. 首页：说明平台组件库定位、甲方/乙方协作边界、文档入口和架构师评估结论。
2. 组件总览：类似 Element Plus Overview，但按 SmartWarehouse-AI 业务域分类展示组件。
3. 组件详情：为核心组件提供效果预览、代码示例、Props、Events、Slots、注意事项和业务边界。
4. Playground：提供可调参数的交互样例，用于验证组件状态、参数和组合行为。
5. 业务场景样例：保留综合演示页，用于验收组件能否组合成门户、WMS、MES、Task、AI 页面。

## 约束

1. 普通基础 UI 仍直接使用 Element Plus，不在甲方组件库中重复封装。
2. 组件详情页必须从 `@smartwarehouse/platform-ui` 包入口导入组件，禁止通过相对路径引用源码。
3. 新增平台组件时必须同步更新：
   - `apps/docs/src/componentCatalog.ts`
   - 对应组件详情页或分类详情页
   - Playground 或业务场景样例
   - `apps/docs/release.md`
4. 发布平台组件前必须执行 `corepack pnpm build`，确保文档站和平台包同时构建通过。

## 影响

- 乙方开发人员可以通过组件总览、详情页和 Playground 学习组件用法。
- 甲方平台团队发布组件前拥有更明确的文档验收标准。
- 后续组件 API 变更更容易通过文档和 Playground 暴露影响面。

## 验证

```powershell
cd frontend-platform
corepack pnpm build
corepack pnpm publish:dry-run
```

验证结果：

- 平台包构建成功。
- VitePress 文档站构建成功。
- npm publish dry-run 成功。
- 静态构建产物包含首页、组件总览、Playground、业务场景样例和核心组件详情页。
