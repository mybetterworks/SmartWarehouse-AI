<template>
  <el-tree-select
    :model-value="modelValue"
    :data="orgTree"
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
import { getOrgTree } from '@smartwarehouse/platform-sdk'
import type { TreeOption } from '@smartwarehouse/platform-types'

// OrgTreeSelect 用于部门、组织、数据权限范围等层级数据选择。
// 组织树通常来自 sys-service，组件只展示已授权数据，不在前端自行裁剪权限。
withDefaults(
  defineProps<{
    modelValue?: string
    placeholder?: string
    disabled?: boolean
  }>(),
  {
    placeholder: '请选择组织',
    disabled: false
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: string | undefined]
}>()

const orgTree = ref<TreeOption[]>([])

onMounted(async () => {
  // 通过 SDK 获取组织树，便于后续统一加缓存、租户隔离和接口错误处理。
  orgTree.value = await getOrgTree()
})
</script>
