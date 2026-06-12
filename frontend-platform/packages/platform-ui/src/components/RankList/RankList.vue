<template>
  <section class="sw-rank-list">
    <header class="sw-rank-list__header">
      <h3>{{ title }}</h3>
      <slot name="extra" />
    </header>
    <ol>
      <li v-for="(item, index) in items" :key="item.key">
        <span class="sw-rank-list__index">{{ index + 1 }}</span>
        <span class="sw-rank-list__name">{{ item.name }}</span>
        <el-progress class="sw-rank-list__bar" :percentage="item.percent ?? getPercent(item.value)" :show-text="false" />
        <strong>{{ item.value }}{{ item.unit ?? '' }}</strong>
      </li>
    </ol>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { RankItem } from '@smartwarehouse/platform-types'

const props = withDefaults(
  defineProps<{
    title?: string
    items?: RankItem[]
  }>(),
  {
    title: '实时排行',
    items: () => []
  }
)

// 百分比以当前列表最大值为基准，只用于视觉长度；真实排名值仍以 item.value 为准。
const maxValue = computed(() => Math.max(1, ...props.items.map((item) => item.value)))

function getPercent(value: number): number {
  // 未传 percent 时自动换算进度条比例，方便实时排行接口只返回数值。
  return Math.round((value / maxValue.value) * 100)
}
</script>
