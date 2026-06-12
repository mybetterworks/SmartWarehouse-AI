<template>
  <div class="sw-upload-progress">
    <div class="sw-upload-progress__header">
      <strong>{{ task.fileName }}</strong>
      <StatusTag :status="task.status" />
    </div>
    <el-progress :percentage="safeProgress" :status="progressStatus" />
    <div class="sw-upload-progress__meta">
      <span>总数 {{ task.totalCount }}</span>
      <span>成功 {{ task.successCount }}</span>
      <span>失败 {{ task.failureCount }}</span>
    </div>
    <p v-if="task.message" class="sw-upload-progress__message">{{ task.message }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ImportTask } from '@smartwarehouse/platform-types'
import StatusTag from '../StatusTag/StatusTag.vue'

// UploadProgress 用于展示导入/上传异步任务的当前进度，尤其适合 WMS 离线上传。
// 任务状态应来自接口轮询或 WebSocket 推送，组件不自行启动定时器，避免重复请求。
const props = defineProps<{
  task: ImportTask
}>()

// 后端进度异常时也限制在 0-100，避免进度条显示越界影响文档站和业务页面观感。
const safeProgress = computed(() => Math.min(100, Math.max(0, props.task.progress)))
const progressStatus = computed(() => {
  // 将业务任务状态收敛为 Element Plus 进度条状态，保持任务面板和单项进度视觉一致。
  if (props.task.status === 'DONE') return 'success'
  if (props.task.status === 'FAILED') return 'exception'
  return undefined
})
</script>
