<template>
  <el-select
    :model-value="modelValue"
    :placeholder="placeholder"
    :disabled="disabled"
    clearable
    filterable
    @update:model-value="emit('update:modelValue', $event)"
  >
    <el-option
      v-for="item in options"
      :key="String(item.value)"
      :label="item.label"
      :value="item.value"
      :disabled="item.disabled"
    />
  </el-select>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { getDictOptions } from '@smartwarehouse/platform-sdk'
import type { DictOption } from '@smartwarehouse/platform-types'

// DictSelect 根据 dictType 加载字典选项，适合状态、类型、等级等枚举型字段。
// 当前通过 SDK mock 演示，V02 接入 sys-service 后可在 SDK 中替换为真实字典接口。
const props = withDefaults(
  defineProps<{
    modelValue?: string | number
    dictType: string
    placeholder?: string
    disabled?: boolean
  }>(),
  {
    placeholder: '请选择',
    disabled: false
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: string | number | undefined]
}>()

const options = ref<DictOption[]>([])

async function loadOptions(): Promise<void> {
  // 保持异步加载方式，后续增加缓存、租户隔离或数据权限时无需改动组件用法。
  options.value = await getDictOptions(props.dictType)
}

onMounted(loadOptions)
// dictType 变化时重新加载，支持同一表单中根据业务类型切换字典来源。
watch(() => props.dictType, loadOptions)
</script>
