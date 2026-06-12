<template>
  <el-tag :type="tagType" effect="light" round>{{ label }}</el-tag>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { getDictOptions } from '@smartwarehouse/platform-sdk'
import type { DictOption } from '@smartwarehouse/platform-types'

// DictTag 用于把后端返回的字典 value 渲染成统一标签，避免各页面重复写状态映射。
const props = defineProps<{
  dictType: string
  value?: string | number
  fallback?: string
}>()

const options = ref<DictOption[]>([])

// 只按 value 匹配字典项；如果后端返回未知值，下面 label 会保留原始值便于排查数据问题。
const matched = computed(() => options.value.find((item) => item.value === props.value))
const label = computed(() => matched.value?.label ?? props.fallback ?? String(props.value ?? '-'))
const tagType = computed(() => colorToType(matched.value?.color))

async function loadOptions(): Promise<void> {
  // 字典来源集中在 SDK，后续接入 sys-service 缓存、刷新和多租户逻辑时组件不需要改。
  options.value = await getDictOptions(props.dictType)
}

function colorToType(color?: string): 'success' | 'warning' | 'danger' | 'info' | 'primary' {
  // 后端或字典表可以使用业务色名，组件在这里收敛为 Element Plus 支持的标签类型。
  if (color === 'green') return 'success'
  if (color === 'orange' || color === 'yellow') return 'warning'
  if (color === 'red') return 'danger'
  if (color === 'blue') return 'primary'
  return 'info'
}

onMounted(loadOptions)
// 同一标签组件复用到不同字典类型时要重新取数，例如状态字典切换到单据类型字典。
watch(() => props.dictType, loadOptions)
</script>
