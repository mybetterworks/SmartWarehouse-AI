<template>
  <SysListPage
    :columns="columns"
    :data="records"
    :query="query"
    :pagination="pagination"
    :loading="loading"
    :actions-width="0"
    @search="emit('search')"
    @reset="emit('reset')"
    @page-change="emit('pageChange', $event)"
  >
    <template #search>
      <slot name="search" />
    </template>
  </SysListPage>
</template>

<script setup lang="ts">
import type { TableColumn, TablePagination } from '@smartwarehouse/platform-types'
import SysListPage from './SysListPage.vue'

defineProps<{
  columns: TableColumn[]
  records: Record<string, unknown>[]
  query: Record<string, unknown>
  pagination: TablePagination
  loading?: boolean
}>()

const emit = defineEmits<{
  search: []
  reset: []
  pageChange: [pagination: TablePagination]
}>()
</script>
