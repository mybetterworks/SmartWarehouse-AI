<template>
  <div v-if="selectedCount > 0" class="sw-batch-bar">
    <div class="sw-batch-bar__summary">已选择 {{ selectedCount }} 项</div>
    <div class="sw-batch-bar__actions">
      <slot />
      <el-button text @click="emit('clear')">清空</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
// BatchOperationBar 只在存在选中项时展示批量操作区域，批量删除、导出、审核等按钮由 slot 注入。
// 这样通用组件不需要知道业务动作，也不会把 WMS/MES 的操作权限写死在组件库里。
withDefaults(
  defineProps<{
    selectedCount?: number
  }>(),
  {
    selectedCount: 0
  }
)

const emit = defineEmits<{
  // 清空动作只通知父级重置选择项，真正的表格选择状态由业务页面或 PlatformTable 持有。
  clear: []
}>()
</script>
