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
import { getWorkOrderOptions } from '@smartwarehouse/platform-sdk'
import type { SelectOption } from '@smartwarehouse/platform-types'

// WorkOrderSelect 用于 MES 工单绑定、物料申请查询等场景。
// 组件只展示可选工单，工单状态、是否允许申请物料等规则应由 MES 接口返回或页面控制。
withDefaults(
  defineProps<{
    modelValue?: string
    placeholder?: string
    disabled?: boolean
  }>(),
  {
    placeholder: '请选择工单',
    disabled: false
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: string | undefined]
}>()

const options = ref<SelectOption[]>([])

onMounted(async () => {
  // V01 使用 SDK mock 工单选项，后续接入 mes-service 时不需要改变组件 API。
  options.value = await getWorkOrderOptions()
})
</script>
