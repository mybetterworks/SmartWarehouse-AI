<template>
  <SysListPage
    :columns="columns"
    :data="posts"
    :query="query"
    :pagination="pagination"
    :loading="loading"
    selectable
    @search="emit('search')"
    @reset="emit('reset')"
    @page-change="emit('pageChange', $event)"
    @selection-change="handleSelectionChange"
  >
    <template #search>
      <el-form-item label="岗位编码">
        <el-input v-model="query.postCode" placeholder="请输入岗位编码" clearable @keyup.enter="emit('search')" />
      </el-form-item>
      <el-form-item label="岗位名称">
        <el-input v-model="query.postName" placeholder="请输入岗位名称" clearable @keyup.enter="emit('search')" />
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="query.status" placeholder="全部状态" clearable>
          <el-option label="启用" value="ENABLED" />
          <el-option label="停用" value="DISABLED" />
        </el-select>
      </el-form-item>
    </template>

    <template #actions>
      <el-button type="primary" @click="emit('createPost')">新增</el-button>
      <el-button type="danger" plain :disabled="selectedCount === 0" @click="emit('deleteSelected')">删除</el-button>
    </template>

    <template #cell-status="{ row }">
      <StatusTag :status="String(row.status)" />
    </template>
    <template #row-actions="{ row }">
      <el-button text type="primary" @click="emit('editPost', row as SimpleRecord)">编辑</el-button>
      <el-button text type="danger" @click="emit('deletePost', row as SimpleRecord)">删除</el-button>
    </template>
  </SysListPage>
</template>

<script setup lang="ts">
import { StatusTag } from '@smartwarehouse/platform-ui'
import type { TableColumn, TablePagination } from '@smartwarehouse/platform-types'
import type { PostListQuery, SimpleRecord } from '../api'
import SysListPage from './SysListPage.vue'

defineProps<{
  columns: TableColumn[]
  posts: SimpleRecord[]
  query: PostListQuery
  pagination: TablePagination
  loading?: boolean
  selectedCount: number
}>()

const emit = defineEmits<{
  search: []
  reset: []
  pageChange: [pagination: TablePagination]
  selectionChange: [rows: SimpleRecord[]]
  createPost: []
  deleteSelected: []
  editPost: [row: SimpleRecord]
  deletePost: [row: SimpleRecord]
}>()

function handleSelectionChange(rows: Record<string, unknown>[]): void {
  emit('selectionChange', rows as SimpleRecord[])
}
</script>
