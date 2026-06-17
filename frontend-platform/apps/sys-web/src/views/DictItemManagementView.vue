<template>
  <SysListPage
    :columns="columns"
    :data="dictItems"
    :query="query"
    :pagination="pagination"
    :loading="loading"
    selectable
    :actions-width="160"
    @search="emit('search')"
    @reset="emit('reset')"
    @page-change="emit('pageChange', $event)"
    @selection-change="handleSelectionChange"
  >
    <template #search>
      <el-form-item label="字典编码">
        <el-input :model-value="dictCode" placeholder="未选择字典类型" disabled />
      </el-form-item>
      <el-form-item label="显示文本">
        <el-input v-model="query.itemLabel" placeholder="请输入显示文本" clearable @keyup.enter="emit('search')" />
      </el-form-item>
      <el-form-item label="数据值">
        <el-input v-model="query.itemValue" placeholder="请输入数据值" clearable @keyup.enter="emit('search')" />
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="query.status" placeholder="全部状态" clearable>
          <el-option v-for="option in statusOptions" :key="option.value || 'all'" :label="option.label" :value="option.value" />
        </el-select>
      </el-form-item>
    </template>

    <template #actions>
      <el-button type="primary" :disabled="!dictCode" @click="emit('create')">新增</el-button>
      <el-button type="danger" plain :disabled="selectedCount === 0" @click="emit('deleteSelected')">删除</el-button>
      <el-button type="info" plain @click="emit('back')">返回字典管理</el-button>
    </template>

    <template #cell-status="{ row }">
      <StatusTag :status="String(row.status)" />
    </template>
    <template #row-actions="{ row }">
      <el-button text type="primary" @click.stop="emit('edit', row as SimpleRecord)">修改</el-button>
      <el-button text type="danger" @click.stop="emit('delete', row as SimpleRecord)">删除</el-button>
    </template>
  </SysListPage>
</template>

<script setup lang="ts">
import { StatusTag } from '@smartwarehouse/platform-ui'
import type { TableColumn, TablePagination } from '@smartwarehouse/platform-types'
import type { DictItemListQuery, SimpleRecord } from '../api'
import SysListPage from './SysListPage.vue'

defineProps<{
  columns: TableColumn[]
  dictItems: SimpleRecord[]
  query: DictItemListQuery
  pagination: TablePagination
  dictCode: string
  loading?: boolean
  selectedCount: number
}>()

const emit = defineEmits<{
  search: []
  reset: []
  pageChange: [pagination: TablePagination]
  selectionChange: [rows: SimpleRecord[]]
  create: []
  deleteSelected: []
  edit: [row: SimpleRecord]
  delete: [row: SimpleRecord]
  back: []
}>()

const statusOptions = [
  { label: '全部', value: '' },
  { label: '启用', value: 'ENABLED' },
  { label: '停用', value: 'DISABLED' }
]

function handleSelectionChange(rows: Record<string, unknown>[]): void {
  emit('selectionChange', rows as SimpleRecord[])
}
</script>
