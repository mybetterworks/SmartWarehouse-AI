<template>
  <el-button :type="type" :loading="loading" @click="emit('export')">
    <slot>{{ text }}</slot>
  </el-button>
</template>

<script setup lang="ts">
// ExcelExport 只提供统一导出按钮和 loading 状态，具体导出范围、权限校验和文件流下载由业务层处理。
withDefaults(
  defineProps<{
    text?: string
    type?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'default'
    loading?: boolean
  }>(),
  {
    text: '导出',
    type: 'default',
    loading: false
  }
)

const emit = defineEmits<{
  // 使用 export 事件而不是内置接口，避免组件库绑定 WMS/MES/Task 的不同导出 API。
  export: []
}>()
</script>
