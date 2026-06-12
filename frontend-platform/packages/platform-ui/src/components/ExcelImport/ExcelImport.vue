<template>
  <div class="sw-excel-actions">
    <input ref="inputRef" type="file" accept=".xlsx,.xls,.csv" hidden @change="handleChange" />
    <el-button type="primary" @click="inputRef?.click()">导入</el-button>
    <el-button v-if="templateText" text @click="emit('downloadTemplate')">{{ templateText }}</el-button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// ExcelImport 负责选择 Excel/CSV 文件和模板下载入口，不直接上传文件。
// WMS 离线上传需要先做业务校验、生成导入任务，再由后端异步处理，因此上传流程必须留给业务页面。
withDefaults(
  defineProps<{
    templateText?: string
  }>(),
  {
    templateText: '下载模板'
  }
)

const emit = defineEmits<{
  import: [file: File]
  downloadTemplate: []
}>()

const inputRef = ref<HTMLInputElement>()

function handleChange(event: Event): void {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (file) {
    // 只把浏览器 File 对象交给父级，后续上传、解析、任务创建和错误处理由 WMS 页面控制。
    emit('import', file)
  }

  // 清空 input 值，允许用户连续选择同一个文件时仍触发 change 事件。
  target.value = ''
}
</script>
