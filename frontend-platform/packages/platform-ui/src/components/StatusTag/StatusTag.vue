<template>
  <el-tag :type="tagType" effect="light" round>{{ label }}</el-tag>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// StatusTag 收敛常见流程状态的中文文案和颜色，避免各业务页面重复维护状态标签。
const props = withDefaults(
  defineProps<{
    status?: string
    text?: string
  }>(),
  {
    status: 'PENDING',
    text: ''
  }
)

// 这里只放平台通用状态；如果业务存在专属状态，优先传 text 或使用 DictTag 绑定字典。
const statusMap: Record<string, { label: string; type: 'success' | 'warning' | 'danger' | 'info' | 'primary' }> = {
  PENDING: { label: '待处理', type: 'warning' },
  PROCESSING: { label: '处理中', type: 'primary' },
  DONE: { label: '已完成', type: 'success' },
  FAILED: { label: '异常', type: 'danger' },
  DISABLED: { label: '停用', type: 'info' }
}

// text 优先级高于映射表，允许业务页面在不扩展组件的情况下覆盖展示文案。
const label = computed(() => props.text || statusMap[props.status]?.label || props.status)
const tagType = computed(() => statusMap[props.status]?.type ?? 'info')
</script>
