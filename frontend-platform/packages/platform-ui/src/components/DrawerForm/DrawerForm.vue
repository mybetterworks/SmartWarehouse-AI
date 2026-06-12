<template>
  <el-drawer :model-value="modelValue" :title="title" :size="size" destroy-on-close @close="handleCancel">
    <div class="sw-drawer-form">
      <slot />
    </div>
    <template #footer>
      <div class="sw-drawer-form__footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" :loading="loading" @click="emit('submit')">提交</el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
// DrawerForm 统一右侧抽屉表单外壳，适合较长配置、详情编辑和不希望离开当前列表页的场景。
// 表单字段和提交逻辑通过 slot 与 submit 事件交给业务页面，组件库只沉淀交互骨架。
withDefaults(
  defineProps<{
    modelValue: boolean
    title?: string
    size?: string | number
    loading?: boolean
  }>(),
  {
    title: '编辑',
    size: '520px',
    loading: false
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: []
  cancel: []
}>()

function handleCancel(): void {
  // 关闭时同时同步 v-model 并抛出 cancel，父级可以清理草稿、重置校验或释放临时资源。
  emit('update:modelValue', false)
  emit('cancel')
}
</script>
