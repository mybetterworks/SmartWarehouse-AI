<template>
  <el-upload
    :action="actionUrl"
    :limit="limit"
    :accept="accept"
    :file-list="modelValue"
    :auto-upload="autoUpload"
    :disabled="disabled"
    @update:file-list="emit('update:modelValue', $event)"
  >
    <el-button type="primary">选择文件</el-button>
    <template v-if="tip" #tip>
      <div class="sw-file-upload__tip">{{ tip }}</div>
    </template>
  </el-upload>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { UploadUserFile } from 'element-plus'
import { getRuntimeConfig } from '@smartwarehouse/platform-sdk'

// FileUpload 是通用文件选择/上传外壳，默认上传地址来自运行时配置，避免构建时写死环境地址。
// 对于离线上传这类异步任务，业务页面可以关闭 autoUpload，拿到文件后自行调用任务接口。
const props = withDefaults(
  defineProps<{
    modelValue?: UploadUserFile[]
    action?: string
    accept?: string
    tip?: string
    limit?: number
    autoUpload?: boolean
    disabled?: boolean
  }>(),
  {
    modelValue: () => [],
    accept: '',
    tip: '',
    limit: 1,
    autoUpload: false,
    disabled: false
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: UploadUserFile[]]
}>()

// action 优先使用调用方传入值，否则使用 SDK 运行时配置中的统一上传入口。
const actionUrl = computed(() => props.action ?? getRuntimeConfig().uploadUrl)
</script>
