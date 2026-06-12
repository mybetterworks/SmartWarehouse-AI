<template>
  <el-select
    :model-value="modelValue"
    :placeholder="placeholder"
    :disabled="disabled"
    clearable
    filterable
    @update:model-value="emit('update:modelValue', $event)"
  >
    <el-option v-for="item in users" :key="item.value" :label="item.label" :value="item.value" />
  </el-select>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getUserOptions } from '@smartwarehouse/platform-sdk'
import type { SelectOption } from '@smartwarehouse/platform-types'

// UserSelect 统一负责人、审批人、操作人等用户字段的选择体验。
// 用户范围和部门过滤应由 sys-service 或页面查询条件决定，组件不做权限兜底。
withDefaults(
  defineProps<{
    modelValue?: string
    placeholder?: string
    disabled?: boolean
  }>(),
  {
    placeholder: '请选择用户',
    disabled: false
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: string | undefined]
}>()

const users = ref<SelectOption[]>([])

onMounted(async () => {
  // 保持从 SDK 获取用户选项，后续真实接口、缓存和远程搜索可以在 SDK 层演进。
  users.value = await getUserOptions()
})
</script>
