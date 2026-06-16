# 决策记录目录

本目录用于记录 SmartWarehouse-AI 在开发过程中的架构决策、技术决策、边界调整和用户确认结果。

## 1. 文件命名

```text
0001-decision-title.md
0002-decision-title.md
0003-decision-title.md
```

规则：

1. 使用四位序号递增。
2. 一个文件只记录一条决策。
3. 决策一旦创建，不直接删除；如被替代，将状态改为 `SUPERSEDED` 并说明替代文件。

## 2. 状态机

```text
PROPOSED   已提出，等待确认
ACCEPTED   已接受，后续开发必须遵守
REJECTED   已拒绝，不再采用
SUPERSEDED 已被新决策替代
```

## 3. 决策模板

```markdown
# 0000 决策标题

## 状态
PROPOSED

## 背景

说明为什么需要这条决策。

## 决策

说明最终选择。

## 影响

说明影响的服务、文档、代码和后续开发。

## 后续动作

说明需要执行的动作。
```

## 4. 使用规则

1. 架构边界、版本拆分、技术选型、部署策略发生变化时必须记录。
2. 用户明确给出的业务或技术决定必须记录。
3. AI 提出的建议如果需要用户确认，先创建 `PROPOSED` 状态。
4. 已确认的决策改为 `ACCEPTED`，开发时必须遵守。

## 5. 当前决策

| 编号 | 决策 | 状态 |
|---|---|---|
| 0001 | `docs/design` 扁平存储，`docs/plan` 存提示词系统 | ACCEPTED |
| 0002 | 甲方 / 乙方独立项目边界 | ACCEPTED |
| 0003 | 8 个敏捷版本拆分 | ACCEPTED |
| 0004 | 组件文档站与 Playground 四层结构 | SUPERSEDED |
| 0005 | 企业组件库文档站两模块结构 | SUPERSEDED |
| 0006 | 企业组件库文档站三入口结构 | SUPERSEDED |
| 0007 | 组件入口单组件详情边界 | ACCEPTED |
| 0008 | 删除预设式静态 Playground，保留组件与场景模板两入口 | ACCEPTED |
| 0009 | 门户统一前端路由入口，子项目 embedded/route 接入 | SUPERSEDED |
| 0010 | vite-plugin-federation 运行时微前端架构 | ACCEPTED |
| 0011 | 门户壳层作为 host，sys remote 只负责托管内容区 | ACCEPTED |
| 0012 | 门户壳层持久化 Tab 与 hosted 路由协定 | ACCEPTED |
