<template>
  <section class="sw-alert-panel">
    <header class="sw-alert-panel__header">
      <h3>{{ title }}</h3>
      <el-badge :value="items.length" type="danger" />
    </header>
    <div class="sw-alert-panel__list">
      <el-alert
        v-for="item in items"
        :key="item.id"
        :title="item.title"
        :description="formatDescription(item)"
        :type="item.level === 'danger' ? 'error' : item.level"
        show-icon
        :closable="false"
      />
      <el-empty v-if="items.length === 0" description="暂无预警" />
    </div>
  </section>
</template>

<script setup lang="ts">
import type { AlertItem } from '@smartwarehouse/platform-types'

// AlertPanel 聚合展示安全库存、登录风控、任务异常等预警项。
// 预警规则和级别应由后端或统计任务计算，组件只负责按统一样式呈现。
withDefaults(
  defineProps<{
    title?: string
    items?: AlertItem[]
  }>(),
  {
    title: '安全库存预警',
    items: () => []
  }
)

function formatDescription(item: AlertItem): string {
  // 描述与时间合并展示，避免卡片内出现多行碎片信息；缺失字段会被自动过滤。
  return [item.message, item.time].filter(Boolean).join(' · ')
}
</script>
