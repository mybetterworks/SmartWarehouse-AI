# 场景模板

场景模板保留原组件页面中“大块功能组合展示”的价值，但不再占用 `组件` 入口。这里展示多个平台组件如何组合成一个可复用页面结构，用于甲方平台基座和乙方业务项目快速落地。

<script setup lang="ts">
import ScenarioTemplateOverview from '../src/ScenarioTemplateOverview.vue'
</script>

<ScenarioTemplateOverview />

## 使用原则

1. 单个组件的 Props、Events、Slots、Types 和基础用法放在 [组件](/component/overview)。
2. 两个及以上组件组合出的页面片段、业务区块和可复用工作台放在场景模板。
3. 场景模板可以包含轻量业务语义，但不能绑定具体后端接口、账号、密钥或单项目私有逻辑。
4. 业务前端可以复制模板结构，但仍应通过 `@smartwarehouse/platform-ui`、`@smartwarehouse/platform-sdk`、`@smartwarehouse/platform-theme`、`@smartwarehouse/platform-types` 接入。

## 文档状态

`可查看示例` 表示模板已经关联到现有详情页；`总览登记` 表示模板已纳入规划，后续会按使用频率补充完整示例。
