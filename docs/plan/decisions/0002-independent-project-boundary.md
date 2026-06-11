# 0002 甲方与乙方独立项目边界

## 状态

ACCEPTED

## 背景

SmartWarehouse-AI 模拟真实商用框架协作模式。甲方负责平台底座和公共能力，多个乙方分别负责业务服务和对应前端。当前代码仍放在根目录同一个 Git 仓库中，但开发、构建、测试和发布必须按独立项目处理。

## 决策

甲方维护：

```text
platform
gateway
sys
task
frontend-platform
```

乙方维护：

```text
wms
mes
ai
wms-web
mes-web
ai-web
```

协作规则：

1. 根目录统一 Git 管理。
2. 各一级目录按独立项目开发。
3. Java 服务通过 `*-api` 或 REST / Dubbo 接口协作。
4. 不新增 `task-client`、`mes-client`、`wms-client`。
5. 前端公共能力通过 `@smartwarehouse/*` npm 包分发。
6. 乙方前端不得直接依赖 `frontend-platform` 源码。

## 影响

1. V01 创建项目骨架时必须保持一级目录独立。
2. V02 到 V08 开发时不得跨项目直接引用源码。
3. 制品库和接口契约成为协作边界。

## 后续动作

1. 在 `DEVELOPMENT_RULE.md` 中固化边界规则。
2. 在每个 milestone 中检查是否违反独立项目边界。
3. 如后续引入独立仓库或 contracts 仓库，新增决策记录。
