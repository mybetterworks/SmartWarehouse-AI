<template>
  <el-dialog :model-value="modelValue" :title="title" :width="width" destroy-on-close @close="handleCancel">
    <div class="sw-modal-form__body">
      <slot />
    </div>
    <template #footer>
      <div class="sw-modal-form__footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" :loading="loading" @click="emit('submit')">提交</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue: boolean
    title?: string
    width?: string | number
    loading?: boolean
  }>(),
  {
    title: '编辑',
    width: '640px',
    loading: false
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: []
  cancel: []
}>()

// 关闭弹窗时同时通知 v-model 和 cancel，页面既能同步可见状态，也能做临时表单清理。
function handleCancel(): void {
  emit('update:modelValue', false)
  emit('cancel')
}
</script>
