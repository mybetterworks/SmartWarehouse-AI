<template>
  <section class="sw-chat-panel">
    <div class="sw-chat-panel__body">
      <article v-for="message in messages" :key="message.id" class="sw-chat-message" :class="`sw-chat-message--${message.role}`">
        <div class="sw-chat-message__role">{{ roleLabel(message.role) }}</div>
        <MarkdownRenderer :content="message.content" />
        <time v-if="message.time">{{ message.time }}</time>
      </article>
      <el-empty v-if="messages.length === 0" description="暂无对话" />
    </div>
    <PromptInput
      :model-value="modelValue"
      :loading="loading"
      @update:model-value="emit('update:modelValue', $event)"
      @send="emit('send', $event)"
    />
  </section>
</template>

<script setup lang="ts">
import type { ChatMessage } from '@smartwarehouse/platform-types'
import MarkdownRenderer from '../MarkdownRenderer/MarkdownRenderer.vue'
import PromptInput from '../PromptInput/PromptInput.vue'

withDefaults(
  defineProps<{
    messages?: ChatMessage[]
    modelValue?: string
    loading?: boolean
  }>(),
  {
    messages: () => [],
    modelValue: '',
    loading: false
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  send: [value: string]
}>()

// AI 消息角色统一映射为中文，便于 ChatBI、RAG 和 Agent 调试页复用同一对话面板。
function roleLabel(role: ChatMessage['role']): string {
  const labels = {
    user: '用户',
    assistant: 'AI',
    system: '系统',
    tool: '工具'
  }
  return labels[role]
}
</script>
