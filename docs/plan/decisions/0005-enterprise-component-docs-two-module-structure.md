# 0005 企业组件库文档站两模块结构

## 状态

SUPERSEDED

## 日期

2026-06-11

## 背景

V01 已经完成 `frontend-platform/apps/docs` 组件文档站，但旧方案包含首页、组件总览、组件详情、Playground、业务场景样例和发布说明等多个公开入口。该结构能支撑项目验收，却不够贴近企业级自定义组件库官网。

组件库站点的核心受众是甲方平台团队和多个乙方前端团队。它应优先解决组件查找、API 学习、示例复制、参数验证和版本接入问题，而不是承载 SmartWarehouse-AI 单项目的业务演示。

本决策已被 `0006-enterprise-component-docs-three-entry-structure.md` 替代，随后又被 `0008-remove-static-playground-public-entry.md` 替代。原因是后续评审发现“两模块”方案中的 `组件` 入口仍承担了多组件大块功能组合展示，导致组件页不够业务无关、组件级粒度不够清晰；再后续确认预设式静态 Playground 没有达到真实在线调试价值。当前有效方案为 `组件 / 场景模板` 两入口。

## 决策

`frontend-platform/apps/docs` 公开模块只保留两个：

1. `组件`：入口为 `/component/overview`，提供组件总览、企业组件分类、核心组件详情、Demo、代码示例、Props、Events、Slots、Types 和右侧 CONTENTS。
2. `Playground`：入口为 `/playground`，提供版本工具栏、代码编辑区、预设预览区、Reset 和 Copy 操作。

旧路径处理：

- `/`、`/components`、`/examples`、`/release` 仅作为兼容入口或提示页。
- 旧路径不再进入顶部公开导航。
- 旧组件详情路径 `/components/*` 不再作为主文档路径，新的主路径为 `/component/*`。

## 影响

- 文档站更像企业级组件库官网，信息架构更清晰。
- 乙方开发人员优先从 `/component/overview` 查找组件，从 `/playground` 验证组件行为。
- 业务综合演示不再污染组件库公开导航，后续如需要可放到业务应用、验收文档或内部示例中。
- 旧决策 `0004-component-docs-and-playground-structure.md` 标记为 `SUPERSEDED`。

## 后续动作

1. 新增组件时更新 `apps/docs/src/componentCatalog.ts`。
2. 核心组件必须补充 `/component/<slug>` 详情页。
3. 代表性组件组合应补充 Playground 预设。
4. 发布平台组件前必须执行 `corepack pnpm build` 和 `corepack pnpm publish:dry-run`。
5. 如果后续具备稳定浏览器 import map 或内部静态资源服务，可评估将预设 Playground 升级为 `@vue/repl` 真运行模式。

## 验证

```powershell
cd frontend-platform
corepack pnpm build:packages
corepack pnpm build
corepack pnpm publish:dry-run
```

验证结果：

- 平台包构建成功。
- VitePress 文档站构建成功。
- `/component/overview`、`/component/platform-table`、`/playground` 路由可访问。
- npm publish dry-run 成功。
