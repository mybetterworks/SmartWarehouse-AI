<template>
  <div class="sw-markdown" v-html="html" />
</template>

<script setup lang="ts">
import { computed } from 'vue'

// MarkdownRenderer 是轻量 Markdown 展示器，只支持 AI 回复中常用的标题、粗体、行内代码和列表。
// 不引入完整 Markdown 引擎是为了保持平台组件库体积可控，并降低 HTML 注入面。
const props = withDefaults(
  defineProps<{
    content?: string
  }>(),
  {
    content: ''
  }
)

const html = computed(() => renderMarkdown(props.content))

function escapeHtml(value: string): string {
  // 先转义 HTML，再做有限 Markdown 替换，避免 AI 返回的脚本或标签被 v-html 直接执行。
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function renderInline(value: string): string {
  // 只支持最常用的行内语法，复杂表格、代码块等内容后续可交给专门的安全 Markdown 引擎。
  return escapeHtml(value)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
}

function renderMarkdown(value: string): string {
  // 按行渲染可以满足 RAG 摘要和 ChatBI 解释的基础展示，同时保持实现容易阅读。
  return value
    .split('\n')
    .map((line) => {
      if (!line.trim()) {
        return '<br />'
      }
      if (line.startsWith('### ')) {
        return `<h3>${renderInline(line.slice(4))}</h3>`
      }
      if (line.startsWith('## ')) {
        return `<h2>${renderInline(line.slice(3))}</h2>`
      }
      if (line.startsWith('# ')) {
        return `<h1>${renderInline(line.slice(2))}</h1>`
      }
      if (line.startsWith('- ')) {
        return `<p class="sw-markdown__li">${renderInline(line.slice(2))}</p>`
      }
      return `<p>${renderInline(line)}</p>`
    })
    .join('')
}
</script>
