<template>
  <CatalogOverview
    eyebrow="SmartWarehouse-AI Platform UI"
    title="场景模板"
    description="由多个平台组件组合成的企业后台可复用模板。场景模板用于说明组件如何协作落地，避免业务项目重复拼装登录、查询表格、导入任务、流程状态、运营看板和 AI 工作台等常见页面结构。"
    :groups="scenarioTemplateGroups"
    :items="scenarioTemplateCatalog"
    total-label="Templates"
    documented-label="Linked Docs"
    group-label="Groups"
    :status-text="{ documented: '可查看示例', overview: '总览登记' }"
  />
</template>

<script setup lang="ts">
import CatalogOverview from './CatalogOverview.vue'
import { scenarioTemplateCatalog, scenarioTemplateGroups } from './componentCatalog'

// 场景模板入口展示多组件组合方案，与 /component 的单组件 API 文档保持边界分离。
// 复用 CatalogOverview 可以保证两个入口的卡片、状态和移动端布局规则一致。
</script>
