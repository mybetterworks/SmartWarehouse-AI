<template>
  <CatalogOverview
    eyebrow="SmartWarehouse-AI Platform UI"
    title="组件"
    description="与具体业务无关的企业级前端组件索引。组件页按照组件粒度展示，每个条目对应一个可复用组件或组件使用规范，已有详情的组件可进入文档页查看 API、示例代码和注意事项。"
    :groups="componentGroups"
    :items="componentCatalog"
    total-label="Components"
    documented-label="Documented"
    group-label="Categories"
  />
</template>

<script setup lang="ts">
import CatalogOverview from './CatalogOverview.vue'
import { componentCatalog, componentGroups } from './componentCatalog'

// 组件入口只展示业务无关的单组件目录，所有列表渲染能力复用 CatalogOverview。
// 后续新增组件时优先维护 componentCatalog，避免在页面模板中硬编码卡片。
</script>
