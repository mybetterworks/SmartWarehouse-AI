<template>
  <section class="sys-route-panel sys-user-page">
    <PlatformSearchForm
      class="sys-user-page__search"
      :model="query"
      :collapsible="false"
      @search="emit('search')"
      @reset="emit('reset')"
    >
      <el-form-item label="账号">
        <el-input v-model="query.username" placeholder="请输入账号" clearable @keyup.enter="emit('search')" />
      </el-form-item>
      <el-form-item label="姓名">
        <el-input v-model="query.nickname" placeholder="请输入姓名" clearable @keyup.enter="emit('search')" />
      </el-form-item>
      <el-form-item label="手机号">
        <el-input v-model="query.phone" placeholder="请输入手机号" clearable @keyup.enter="emit('search')" />
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="query.status" placeholder="全部状态" clearable>
          <el-option v-for="option in statusOptions" :key="option.value || 'all'" :label="option.label" :value="option.value" />
        </el-select>
      </el-form-item>
    </PlatformSearchForm>

    <section class="sys-user-page__table-panel">
      <section class="sys-action-bar sys-user-page__actions">
        <el-button type="primary" @click="emit('create')">新增</el-button>
        <el-button type="danger" plain :disabled="selectedCount === 0" @click="emit('deleteSelected')">删除</el-button>
      </section>

      <PlatformTable
        :columns="columns"
        :data="users"
        :loading="loading"
        :pagination="pagination"
        :show-index="false"
        row-key="id"
        selectable
        actions-width="208"
        height="100%"
        @page-change="handlePageChange"
        @selection-change="handleSelectionChange"
      >
        <template #cell-status="{ row }">
          <StatusTag :status="String(row.status)" />
        </template>
        <template #cell-roles="{ row }">
          <el-tag v-for="role in (row.roles as string[])" :key="role" class="sys-tag" effect="light">{{ role }}</el-tag>
        </template>
        <template #cell-warehouseIds="{ row }">
          <span>{{ (row.warehouseIds as number[]).join(', ') || '-' }}</span>
        </template>
        <template #actions="{ row }">
          <el-button text type="primary" @click="emit('edit', row as UserView)">编辑</el-button>
          <el-button text @click="emit('warehouse', row as UserView)">仓库</el-button>
          <el-button text type="danger" @click="emit('delete', row as UserView)">删除</el-button>
        </template>
      </PlatformTable>
    </section>
  </section>
</template>

<script setup lang="ts">
import { PlatformSearchForm, PlatformTable, StatusTag } from '@smartwarehouse/platform-ui'
import type { TableColumn, TablePagination } from '@smartwarehouse/platform-types'
import type { UserListQuery, UserView } from '../api'

defineProps<{
  columns: TableColumn[]
  users: UserView[]
  query: UserListQuery
  pagination: TablePagination
  loading?: boolean
  selectedCount: number
}>()

const emit = defineEmits<{
  search: []
  reset: []
  create: []
  deleteSelected: []
  pageChange: [pagination: TablePagination]
  selectionChange: [rows: UserView[]]
  edit: [row: UserView]
  warehouse: [row: UserView]
  delete: [row: UserView]
}>()

const statusOptions = [
  { label: '全部', value: '' },
  { label: '启用', value: 'ENABLED' },
  { label: '停用', value: 'DISABLED' }
]

function handlePageChange(pagination: TablePagination): void {
  emit('pageChange', pagination)
}

function handleSelectionChange(rows: Record<string, unknown>[]): void {
  emit('selectionChange', rows as UserView[])
}
</script>
