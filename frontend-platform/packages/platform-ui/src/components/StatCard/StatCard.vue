<template>
  <section class="sw-stat-card" :class="`sw-stat-card--${item.tone ?? 'primary'}`">
    <div class="sw-stat-card__title">{{ item.title }}</div>
    <div class="sw-stat-card__value">
      <span>{{ item.value }}</span>
      <small v-if="item.unit">{{ item.unit }}</small>
    </div>
    <div v-if="item.trend" class="sw-stat-card__trend">{{ item.trend }}</div>
  </section>
</template>

<script setup lang="ts">
import type { StatCardItem } from '@smartwarehouse/platform-types'

// StatCard 是纯展示组件，指标值、趋势和状态色都由 task-service 或业务页面计算后传入。
// 组件内不做同比/环比计算，避免不同业务口径混在通用 UI 中。
defineProps<{
  item: StatCardItem
}>()
</script>
