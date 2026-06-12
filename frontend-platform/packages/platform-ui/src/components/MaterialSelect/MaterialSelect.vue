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
import { getMaterialOptions } from '@smartwarehouse/platform-sdk'
import type { SelectOption } from '@smartwarehouse/platform-types'

// MaterialSelect 只处理物料选项展示和选择，不在组件中查询库存、批次或安全库存。
// 库存可用量等业务判断应由 WMS/MES 页面调用接口后决定，避免选择器承担复杂业务规则。
withDefaults(
  defineProps<{
    modelValue?: string
    placeholder?: string
    disabled?: boolean
  }>(),
  {
    placeholder: '请选择物料',
    disabled: false
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: string | undefined]
}>()

const options = ref<SelectOption[]>([])

onMounted(async () => {
  // 当前读取 SDK mock 物料，后续接入真实物料主数据接口时优先替换 SDK 数据源。
  options.value = await getMaterialOptions()
})
</script>
