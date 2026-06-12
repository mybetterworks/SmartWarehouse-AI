<template>
  <el-timeline class="sw-agent-steps">
    <el-timeline-item v-for="step in steps" :key="step.id" :type="statusType(step.status)" :timestamp="step.finishedAt || step.startedAt">
      <div class="sw-agent-steps__item">
        <strong>{{ step.title }}</strong>
        <el-tag size="small" :type="statusType(step.status)" effect="light">{{ statusLabel(step.status) }}</el-tag>
      </div>
      <p v-if="step.description">{{ step.description }}</p>
      <pre v-if="step.detail"><code>{{ step.detail }}</code></pre>
    </el-timeline-item>
  </el-timeline>
</template>

<script setup lang="ts">
import type { AgentStep, StatusTone } from '@smartwarehouse/platform-types'

// AgentStepTimeline 用于解释 AI 多 Agent 的执行链路，展示规划、工具调用和汇总状态。
// 组件只渲染后端或 ai-service 返回的步骤，不在前端推导 Agent 状态，保证可审计链路来自服务端。
withDefaults(
  defineProps<{
    steps?: AgentStep[]
  }>(),
  {
    steps: () => []
  }
)

function statusType(status: AgentStep['status']): StatusTone {
  // 将 AI 执行状态映射到 Element Plus 色调，保持 Agent、MCP、任务流程的状态表达一致。
  if (status === 'success') return 'success'
  if (status === 'failed') return 'danger'
  if (status === 'running') return 'primary'
  return 'info'
}

function statusLabel(status: AgentStep['status']): string {
  // 文档站和业务页面统一使用中文状态文案，减少各乙方项目重复维护翻译表。
  const labels = {
    waiting: '等待',
    running: '执行中',
    success: '成功',
    failed: '失败'
  }
  return labels[status]
}
</script>
