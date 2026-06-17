<template>
  <SysListPage
    :columns="columns"
    :data="riskRecords"
    :query="query"
    :pagination="pagination"
    :loading="loading"
    :actions-width="0"
    @search="emit('search')"
    @reset="emit('reset')"
    @page-change="emit('pageChange', $event)"
  >
    <template #search>
      <el-form-item label="风险类型">
        <el-input v-model="query.riskType" placeholder="请输入风险类型" clearable @keyup.enter="emit('search')" />
      </el-form-item>
      <el-form-item label="风险对象">
        <el-input v-model="query.riskTarget" placeholder="请输入风险对象" clearable @keyup.enter="emit('search')" />
      </el-form-item>
      <el-form-item label="处理动作">
        <el-input v-model="query.action" placeholder="请输入处理动作" clearable @keyup.enter="emit('search')" />
      </el-form-item>
    </template>
  </SysListPage>
</template>

<script setup lang="ts">
import type { TableColumn, TablePagination } from '@smartwarehouse/platform-types'
import type { RiskRecordListQuery, SimpleRecord } from '../api'
import SysListPage from './SysListPage.vue'

defineProps<{
  columns: TableColumn[]
  riskRecords: SimpleRecord[]
  query: RiskRecordListQuery
  pagination: TablePagination
  loading?: boolean
}>()

const emit = defineEmits<{
  search: []
  reset: []
  pageChange: [pagination: TablePagination]
}>()
</script>
