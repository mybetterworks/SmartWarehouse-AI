<template>
  <el-collapse class="sw-tool-trace">
    <el-collapse-item v-for="record in records" :key="record.id" :name="record.id">
      <template #title>
        <span class="sw-tool-trace__title">
          <StatusTag :status="record.status === 'success' ? 'DONE' : record.status === 'failed' ? 'FAILED' : 'PROCESSING'" />
          {{ record.toolName }}
          <small v-if="record.serverName"> @ {{ record.serverName }}</small>
        </span>
      </template>
      <dl class="sw-tool-trace__meta">
        <div v-if="record.time">
          <dt>时间</dt>
          <dd>{{ record.time }}</dd>
        </div>
        <div v-if="record.durationMs !== undefined">
          <dt>耗时</dt>
          <dd>{{ record.durationMs }} ms</dd>
        </div>
      </dl>
      <pre v-if="record.input"><code>{{ record.input }}</code></pre>
      <pre v-if="record.output"><code>{{ record.output }}</code></pre>
    </el-collapse-item>
  </el-collapse>
</template>

<script setup lang="ts">
import type { ToolCallRecord } from '@smartwarehouse/platform-types'
import StatusTag from '../StatusTag/StatusTag.vue'

// ToolCallTrace 展示 MCP 工具调用输入、输出、耗时和状态，便于排查 Agent 执行过程。
// 组件只做可观测性展示，工具授权、参数脱敏和调用审计应由 ai-service 统一处理。
withDefaults(
  defineProps<{
    records?: ToolCallRecord[]
  }>(),
  {
    records: () => []
  }
)
</script>
