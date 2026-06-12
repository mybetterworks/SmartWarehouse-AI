<template>
  <el-form class="sw-search-form" :model="model" :inline="true" :label-width="labelWidth">
    <slot :expanded="expanded" />
    <el-form-item>
      <div class="sw-search-form__actions">
        <slot name="actions" :expanded="expanded">
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
          <el-button type="primary" :icon="Search" @click="emit('search')">搜索</el-button>
          <el-button v-if="collapsible" text :icon="expanded ? ArrowUp : ArrowDown" @click="expanded = !expanded">
            {{ expanded ? '收起' : '展开' }}
          </el-button>
        </slot>
      </div>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ArrowDown, ArrowUp, Refresh, Search } from '@element-plus/icons-vue'

withDefaults(
  defineProps<{
    model?: Record<string, unknown>
    labelWidth?: string
    collapsible?: boolean
  }>(),
  {
    model: () => ({}),
    labelWidth: '88px',
    collapsible: true
  }
)

const emit = defineEmits<{
  search: []
  reset: []
}>()

const expanded = ref(false)

// 搜索条件的具体字段由业务页面持有，组件只负责发出重置信号，避免擅自清空复杂查询模型。
function handleReset(): void {
  emit('reset')
}
</script>
