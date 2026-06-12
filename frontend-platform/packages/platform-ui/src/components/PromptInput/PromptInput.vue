<template>
  <div class="sw-prompt-input">
    <el-input
      :model-value="modelValue"
      type="textarea"
      :rows="rows"
      :placeholder="placeholder"
      :disabled="disabled"
      @update:model-value="emit('update:modelValue', $event)"
      @keydown.ctrl.enter.prevent="handleSend"
    />
    <div class="sw-prompt-input__footer">
      <span>{{ hint }}</span>
      <el-button type="primary" :icon="Promotion" :loading="loading" :disabled="disabled || !modelValue.trim()" @click="handleSend">
        发送
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Promotion } from '@element-plus/icons-vue'

// PromptInput 是 AI 问答和 ChatBI 输入入口，只负责文本输入、快捷键和发送事件。
// 提示词改写、敏感词过滤、SQL 权限限制等必须由 ai-service 或业务页面处理。
const props = withDefaults(
  defineProps<{
    modelValue?: string
    placeholder?: string
    hint?: string
    rows?: number
    loading?: boolean
    disabled?: boolean
  }>(),
  {
    modelValue: '',
    placeholder: '输入问题，例如：最近 7 天申请次数最多的物料是什么？',
    hint: 'Ctrl + Enter 快速发送',
    rows: 3,
    loading: false,
    disabled: false
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  send: [value: string]
}>()

function handleSend(): void {
  const value = props.modelValue.trim()
  if (!value) {
    // 空提示词不向外提交，减少无效请求，也避免后端记录无意义的 AI 会话。
    return
  }

  // 只抛出用户输入，父级负责调用 RAG、ChatBI、Agent 或 MCP 编排接口。
  emit('send', value)
}
</script>
