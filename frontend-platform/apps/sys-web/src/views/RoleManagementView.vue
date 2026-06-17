<template>
  <SysListPage
    :columns="columns"
    :data="roles"
    :query="query"
    :pagination="pagination"
    :loading="loading"
    selectable
    :actions-width="208"
    @search="emit('search')"
    @reset="emit('reset')"
    @page-change="emit('pageChange', $event)"
    @selection-change="handleSelectionChange"
  >
    <template #search>
      <el-form-item label="角色编码">
        <el-input v-model="query.roleCode" placeholder="请输入角色编码" clearable @keyup.enter="emit('search')" />
      </el-form-item>
      <el-form-item label="角色名称">
        <el-input v-model="query.roleName" placeholder="请输入角色名称" clearable @keyup.enter="emit('search')" />
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="query.status" placeholder="全部状态" clearable>
          <el-option v-for="option in statusOptions" :key="option.value || 'all'" :label="option.label" :value="option.value" />
        </el-select>
      </el-form-item>
    </template>

    <template #actions>
      <el-button type="primary" @click="emit('create')">新增</el-button>
      <el-button type="danger" plain :disabled="selectedCount === 0" @click="emit('deleteSelected')">删除</el-button>
    </template>

    <template #cell-status="{ row }">
      <StatusTag :status="String(row.status)" />
    </template>
    <template #cell-menuIds="{ row }">
      <span>{{ (row.menuIds as number[]).length }} 个菜单</span>
    </template>
    <template #row-actions="{ row }">
      <el-button text type="primary" @click="emit('edit', row as RoleView)">编辑</el-button>
      <el-button text @click="emit('menus', row as RoleView)">菜单</el-button>
      <el-button text type="danger" @click="emit('delete', row as RoleView)">删除</el-button>
    </template>
  </SysListPage>
</template>

<script setup lang="ts">
import { StatusTag } from '@smartwarehouse/platform-ui'
import type { TableColumn, TablePagination } from '@smartwarehouse/platform-types'
import type { RoleListQuery, RoleView } from '../api'
import SysListPage from './SysListPage.vue'

defineProps<{
  columns: TableColumn[]
  roles: RoleView[]
  query: RoleListQuery
  pagination: TablePagination
  loading?: boolean
  selectedCount: number
}>()

const emit = defineEmits<{
  search: []
  reset: []
  pageChange: [pagination: TablePagination]
  selectionChange: [rows: RoleView[]]
  create: []
  deleteSelected: []
  edit: [row: RoleView]
  menus: [row: RoleView]
  delete: [row: RoleView]
}>()

const statusOptions = [
  { label: '全部', value: '' },
  { label: '启用', value: 'ENABLED' },
  { label: '停用', value: 'DISABLED' }
]

function handleSelectionChange(rows: Record<string, unknown>[]): void {
  emit('selectionChange', rows as RoleView[])
}
</script>
