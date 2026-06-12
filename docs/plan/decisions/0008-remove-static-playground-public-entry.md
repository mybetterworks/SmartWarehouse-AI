# 0008 删除预设式静态 Playground，保留组件与场景模板两入口

## 状态

ACCEPTED

## 背景

V01 组件文档站曾保留 `Playground` 入口，但当前实现只能在固定预设之间切换，并不能像 Element Plus 官网 Playground 一样在线修改代码并实时预览样式。

企业级组件库文档站的公开入口需要清晰、稳定、可解释。静态预设 Playground 与“场景模板”能力重复，又达不到真实调试工具的预期，继续保留会增加维护成本并干扰乙方开发人员判断。

## 决策

删除当前预设式静态 Playground：

1. 顶部公开导航只保留 `组件` 和 `场景模板`。
2. 删除 `/playground` 页面、`PlaygroundWorkbench.vue`、`ComponentPlayground.vue` 和 Playground 专属样式。
3. 删除 `componentCatalog.ts` 中的 `playgroundPreset` 元数据。
4. 组件详情页和场景模板详情页继续承担样式预览、Vue + TypeScript 示例代码、参数说明和组合模板说明。
5. 后续只有在实现真实在线代码编辑和实时预览能力时，才重新引入 Playground。

## 影响

- `frontend-platform/apps/docs` 当前公开入口变为两类：`/component/overview` 和 `/scenario/overview`。
- 乙方查组件时从 `组件` 入口进入，复制组合结构时从 `场景模板` 入口进入。
- 静态 Playground 不再作为验收项，也不再要求新增组件维护 Playground 预设。
- `0006-enterprise-component-docs-three-entry-structure.md` 状态改为 `SUPERSEDED`。

## 后续动作

1. 新增组件时维护 `componentCatalog`、`componentDocs` 和 `/component/<slug>`。
2. 新增组合模板时维护 `scenarioTemplateCatalog`、`scenarioTemplateDocs` 和 `/scenario/<slug>`。
3. 如果未来恢复 Playground，必须采用真实可编辑方案，例如 `@vue/repl`、浏览器 import map、平台包 ESM 静态资源和 iframe 沙箱预览，并通过构建、路由、浏览器交互和安全检查。
