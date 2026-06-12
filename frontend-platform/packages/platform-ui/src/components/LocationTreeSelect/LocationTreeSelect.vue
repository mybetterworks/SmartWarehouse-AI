<template>
  <el-tree-select
    :model-value="modelValue"
    :data="options"
    :placeholder="placeholder"
    :disabled="disabled"
    clearable
    filterable
    check-strictly
    node-key="value"
    @update:model-value="emit('update:modelValue', $event)"
  />
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getLocationTree } from '@smartwarehouse/platform-sdk'
import type { TreeOption } from '@smartwarehouse/platform-types'

// LocationTreeSelect 统一仓库、库区、库位的层级选择体验。
// 真实 WMS 接入后，库位树应在 SDK 或业务层按仓库管理员的数据权限过滤后再传给组件。
withDefaults(
  defineProps<{
    modelValue?: string
    placeholder?: string
    disabled?: boolean
  }>(),
  {
    placeholder: '请选择库位',
    disabled: false
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: string | undefined]
}>()

const options = ref<TreeOption[]>([])

onMounted(async () => {
  // V01 使用 SDK mock 树，保持异步形态是为了后续替换真实 WMS 库位接口时不改组件调用方式。
  options.value = await getLocationTree()
})
</script>
