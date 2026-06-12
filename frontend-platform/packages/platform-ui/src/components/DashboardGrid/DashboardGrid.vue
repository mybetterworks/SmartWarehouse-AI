<template>
  <section class="sw-dashboard-grid" :style="{ '--sw-dashboard-min': minWidth }">
    <slot />
  </section>
</template>

<script setup lang="ts">
// DashboardGrid 只提供响应式网格容器，内部卡片可以是统计、排行、预警或实时状态组件。
// minWidth 作为 CSS 变量暴露，业务页面可按看板密度调整最小列宽。
withDefaults(
  defineProps<{
    minWidth?: string
  }>(),
  {
    minWidth: '220px'
  }
)
</script>
