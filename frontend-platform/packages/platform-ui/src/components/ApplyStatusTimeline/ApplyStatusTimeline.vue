<template>
  <el-timeline class="sw-status-timeline">
    <el-timeline-item
      v-for="item in items"
      :key="`${item.title}-${item.time ?? ''}`"
      :timestamp="item.time"
      :type="item.status"
      placement="top"
    >
      <strong>{{ item.title }}</strong>
      <p v-if="item.description">{{ item.description }}</p>
    </el-timeline-item>
  </el-timeline>
</template>

<script setup lang="ts">
import type { TimelineItem } from '@smartwarehouse/platform-types'

// ApplyStatusTimeline 只展示申请流转轨迹，适合 MES 物料申请、WMS 分配、审批节点等场景。
// 节点顺序和状态由业务接口返回，组件不主动排序，避免破坏服务端审计顺序。
withDefaults(
  defineProps<{
    items?: TimelineItem[]
  }>(),
  {
    items: () => []
  }
)
</script>
