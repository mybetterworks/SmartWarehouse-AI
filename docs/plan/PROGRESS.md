# SmartWarehouse-AI 开发总进度

## 1. 当前阶段

当前阶段：提示词系统初始化后，开发计划已按真实商用项目节奏重排。

已完成：

- `docs/design` 已作为设计文档目录，并采用扁平存储。
- 已形成软件需求规格说明书、概要设计说明书、详细设计说明书、数据库设计说明书和前端组件封装说明。
- 已初始化 `docs/plan` 提示词开发体系。
- 已调整开发顺序：先甲方组件库，再甲方前后端基座，再乙方各自前后端模块，最后多乙方交互业务。
- 已将 `docs/design` 中的架构、业务功能、接口设计、数据库设计、前端组件、K8s、多实例、Jenkins、阿里弹性容器等要求按 V01-V08 拆分沉淀到各 milestone。
- 后续开发具体版本时，直接读取当前 milestone，不再重复读取 `docs/design`，除非发生设计冲突、正式设计变更或用户明确要求追溯。
- 本次计划调整按用户要求不写入 `decisions`。

## 2. 当前版本

| 项目 | 当前值 |
|---|---|
| 当前版本 | V01 |
| 当前状态 | TODO |
| 当前任务 | 甲方组件库二次开发与最小项目骨架 |
| 对应文件 | `milestones/V01-owner-component-library.md` |

## 3. 版本总览

| 版本 | 文件 | 状态 | 目标 |
|---|---|---|---|
| V01 | `milestones/V01-owner-component-library.md` | TODO | 甲方组件库二次开发，初始化最小项目骨架，发布平台 npm snapshot 包 |
| V02 | `milestones/V02-owner-platform-base-cicd.md` | TODO | 甲方前后端基座，完成 platform/gateway/sys/portal-shell/sys-web，并接入 Jenkins 与阿里弹性容器基线 |
| V03 | `milestones/V03-wms-fullstack-basic.md` | TODO | WMS 乙方前后端模块，完成 wms + wms-web 的物料、仓库、库存、入库出库、离线上传闭环 |
| V04 | `milestones/V04-mes-fullstack-basic.md` | TODO | MES 乙方前后端模块，完成 mes + mes-web 的工单、物料需求、物料申请、配送状态闭环 |
| V05 | `milestones/V05-ai-fullstack-basic.md` | TODO | AI 乙方前后端模块，完成 ai + ai-web 的 RAG、ChatBI、多 Agent、MCP 最小闭环 |
| V06 | `milestones/V06-task-ops-fullstack.md` | TODO | 甲方 task 运营模块全栈能力，完成 task 后端、运营看板、实时排行、预警、WebSocket |
| V07 | `milestones/V07-cross-vendor-mes-wms-task.md` | TODO | 多乙方交互业务，完成 MES 物料申请、WMS 库存分配、task 统计排行与预警联动 |
| V08 | `milestones/V08-ai-business-release-hardening.md` | TODO | AI 与业务服务交互、正式发布加固、可观测性、阿里弹性容器正式演示 |

状态说明：

```text
TODO        未开始
IN_PROGRESS 开发中
VERIFYING   验证中
DONE        已完成
BLOCKED     阻塞
```

## 4. 开发节奏

```text
V01 甲方组件库二次开发
  -> V02 甲方前后端基座开发 + CI/CD 基线
  -> V03 WMS 乙方前后端项目开发
  -> V04 MES 乙方前后端项目开发
  -> V05 AI 乙方前后端项目开发
  -> V06 task 甲方运营前后端项目开发
  -> V07 MES + WMS + task 多方交互业务开发
  -> V08 AI + 业务服务多方交互与正式发布加固
```

约束：

1. 每个业务模块都按前后端一起开发和验收。
2. 从 V02 开始，每个版本都要保留 Jenkins 测试环境发布记录。
3. 从 V02 开始，每个版本都要保留阿里弹性容器正式环境发布检查记录。
4. 不再采用“全部后端完成后再统一开发前端”的节奏。
5. 不再把部署能力放到最后一个版本才接入。

## 5. 下一步开发计划

下一步从 V01 开始：

```text
请根据 docs/plan/ROADMAP.md、docs/plan/DEVELOPMENT_RULE.md、docs/plan/PROGRESS.md 和 docs/plan/milestones/V01-owner-component-library.md，开发 V01 甲方组件库二次开发与最小项目骨架版本。开发时直接使用 V01 milestone 中的版本开发输入边界，不要重复读取 docs/design，除非发现设计冲突或用户明确要求。
```

V01 完成后需要更新：

- `PROGRESS.md`
- `milestones/V01-owner-component-library.md`
- `study/V01-owner-component-library-study.md`
- `handle/V01-owner-component-library-handle.md`
- 根目录 `README.md`

## 6. 进度记录模板

每次版本推进后，按以下格式追加记录：

```text
日期：
版本：
状态：
完成内容：
前端完成内容：
后端完成内容：
接口联调结果：
Jenkins 测试发布结果：
阿里弹性容器正式发布检查：
.gitignore 更新结果：
敏感信息检查结果：
README 更新结果：
验证结果：
遗留问题：
下一步：
相关决策：
相关 skill：
```

## 7. 实现记录

### 2026-06-11 提示词系统初始化

状态：DONE

完成内容：

- 初始化 `docs/plan` 目录结构。
- 创建 ROADMAP、DEVELOPMENT_RULE、PROGRESS、milestones、decisions、skill、study、handle 文档体系。

验证结果：

- 已完成文件结构和关键词验证。

### 2026-06-11 开发计划重排

状态：DONE

完成内容：

- 调整开发顺序为甲方组件库、甲方前后端基座、乙方各自前后端模块、多乙方交互业务。
- 明确每个业务模块必须前后端同步开发和验收。
- 明确 Jenkins 负责测试环境，本地构建测试发布。
- 明确阿里弹性容器负责正式环境部署和正式版本演示。
- 按用户要求，本次调整不写入 `docs/plan/decisions`。

下一步：

- 开始 V01 甲方组件库二次开发与最小项目骨架。

### 2026-06-11 milestone 开发输入补全

状态：DONE

完成内容：

- 将 `docs/design` 下正式设计文档中的项目架构、业务功能、接口设计、数据库设计、前端组件封装、K8s 多实例、Jenkins 和阿里弹性容器要求拆分到 V01-V08 milestone。
- 每个 milestone 都补充了版本开发输入边界，明确后续开发该版本时不需要重复读取 `docs/design`。
- 每个 milestone 都补充了代码架构、业务功能、接口设计、数据库设计、前端页面、测试、验收和发布检查要求。
- 同步调整 ROADMAP、DEVELOPMENT_RULE、PROGRESS 和版本拆分决策说明，避免提示词入口与 milestone 说明不一致。

下一步：

- 开始 V01 甲方组件库二次开发与最小项目骨架。
