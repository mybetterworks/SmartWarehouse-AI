<template>
  <section class="sw-import-panel">
    <header class="sw-import-panel__header">
      <div>
        <h3>{{ title }}</h3>
        <p>{{ description }}</p>
      </div>
      <el-button size="small" :icon="Refresh" @click="emit('refresh')">刷新</el-button>
    </header>
    <div class="sw-import-panel__list">
      <UploadProgress v-for="task in tasks" :key="task.taskId" :task="task" />
      <el-empty v-if="tasks.length === 0" description="暂无导入任务" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { Refresh } from '@element-plus/icons-vue'
import type { ImportTask } from '@smartwarehouse/platform-types'
import UploadProgress from '../UploadProgress/UploadProgress.vue'

withDefaults(
  defineProps<{
    title?: string
    description?: string
    tasks?: ImportTask[]
  }>(),
  {
    title: '离线导入任务',
    description: '用于查看 Excel / CSV 离线上传后的异步处理进度。',
    tasks: () => []
  }
)

const emit = defineEmits<{
  refresh: []
}>()

// 本组件只展示导入任务进度，不直接轮询接口；刷新动作由业务页面接入 WMS 任务接口后实现。
</script>
