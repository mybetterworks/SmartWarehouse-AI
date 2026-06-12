<template>
  <el-select
    :model-value="modelValue"
    :placeholder="placeholder"
    :disabled="disabled"
    clearable
    filterable
    @update:model-value="emit('update:modelValue', $event)"
  >
    <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" :disabled="item.disabled">
      <span>{{ item.label }}</span>
      <small v-if="item.description" class="sw-select-option__desc">{{ item.description }}</small>
    </el-option>
  </el-select>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getWarehouseOptions } from '@smartwarehouse/platform-sdk'
import type { SelectOption } from '@smartwarehouse/platform-types'

withDefaults(
  defineProps<{
    modelValue?: string
    placeholder?: string
    disabled?: boolean
  }>(),
  {
    placeholder: '请选择仓库',
    disabled: false
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: string | undefined]
}>()

const options = ref<SelectOption[]>([])

onMounted(async () => {
  // V01 先从 SDK mock 数据读取仓库；V03 接入 WMS 后可在 SDK 内替换成真实接口。
  options.value = await getWarehouseOptions()
})
</script>
