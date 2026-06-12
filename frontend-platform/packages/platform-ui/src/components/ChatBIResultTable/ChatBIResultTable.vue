<template>
  <section class="sw-chatbi-result">
    <SqlPreview v-if="sql" :sql="sql" />
    <PlatformTable :columns="resolvedColumns" :data="data" :loading="loading" :pagination="pagination" @page-change="emit('pageChange', $event)" />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ChatBIColumn, TableColumn, TablePagination } from '@smartwarehouse/platform-types'
import PlatformTable from '../PlatformTable/PlatformTable.vue'
import SqlPreview from '../SqlPreview/SqlPreview.vue'

const props = withDefaults(
  defineProps<{
    columns?: ChatBIColumn[]
    data?: Record<string, unknown>[]
    sql?: string
    loading?: boolean
    pagination?: TablePagination
  }>(),
  {
    columns: () => [],
    data: () => [],
    sql: '',
    loading: false
  }
)

const emit = defineEmits<{
  pageChange: [pagination: TablePagination]
}>()

const resolvedColumns = computed<TableColumn[]>(() => {
  if (props.columns.length > 0) {
    return props.columns
  }

  // ChatBI 返回字段可能由模型生成，未显式传列配置时根据第一行结果自动生成兜底表头。
  const first = props.data[0]
  return first ? Object.keys(first).map((key) => ({ prop: key, label: key, minWidth: 120, showOverflowTooltip: true })) : []
})
</script>
