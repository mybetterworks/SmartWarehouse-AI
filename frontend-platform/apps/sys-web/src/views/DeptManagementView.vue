<template>
  <section class="sys-route-panel sys-user-page sys-tree-page">
    <PlatformSearchForm
      class="sys-user-page__search"
      :model="query"
      :collapsible="false"
      @search="handleSearch"
      @reset="handleReset"
    >
      <el-form-item label="部门编码">
        <el-input v-model="query.deptCode" placeholder="请输入部门编码" clearable @keyup.enter="handleSearch" />
      </el-form-item>
      <el-form-item label="部门名称">
        <el-input v-model="query.deptName" placeholder="请输入部门名称" clearable @keyup.enter="handleSearch" />
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="query.status" placeholder="全部状态" clearable>
          <el-option label="启用" value="ENABLED" />
          <el-option label="停用" value="DISABLED" />
        </el-select>
      </el-form-item>
    </PlatformSearchForm>

    <section class="sys-user-page__table-panel">
      <section class="sys-action-bar sys-user-page__actions">
        <el-button type="primary" @click="emit('createDept')">新增</el-button>
      </section>

      <PlatformTable
        :columns="columns"
        :data="filteredDepts"
        :loading="loading"
        :pagination="undefined"
        :show-index="false"
        row-key="id"
        :tree-props="{ children: 'children' }"
        :default-expand-all="shouldExpandAll"
        :expand-row-keys="expandedRowKeys"
        actions-width="208"
        height="100%"
      >
        <template #cell-deptName="{ row }">
          <div class="sys-tree-cell">
            <span class="sys-tree-cell__leading">
              <span class="sys-tree-cell__text">{{ String(row.deptName ?? '-') }}</span>
            </span>
          </div>
        </template>
        <template #cell-status="{ row }">
          <StatusTag :status="String(row.status)" />
        </template>
        <template #actions="{ row }">
          <el-button text @click="emit('createChildDept', row as TreeNodeView)">新增</el-button>
          <el-button text type="primary" @click="emit('editDept', row as TreeNodeView)">修改</el-button>
          <el-button text type="danger" @click="emit('deleteDept', row as TreeNodeView)">删除</el-button>
        </template>
      </PlatformTable>
    </section>
  </section>
</template>

<script setup lang="ts">
import { PlatformSearchForm, PlatformTable, StatusTag } from '@smartwarehouse/platform-ui'
import type { TableColumn } from '@smartwarehouse/platform-types'
import { computed } from 'vue'
import type { DeptListQuery, TreeNodeView } from '../api'

const props = defineProps<{
  columns: TableColumn[]
  depts: TreeNodeView[]
  query: DeptListQuery
  loading?: boolean
}>()

const emit = defineEmits<{
  search: []
  reset: []
  createDept: []
  createChildDept: [row: TreeNodeView]
  editDept: [row: TreeNodeView]
  deleteDept: [row: TreeNodeView]
}>()

const filteredDepts = computed(() => filterTree(props.depts, matchesDeptQuery))
const hasActiveFilters = computed(() => {
  const query = props.query
  return Boolean(query.deptCode?.trim() || query.deptName?.trim() || query.status?.trim())
})
const shouldExpandAll = computed(() => !hasActiveFilters.value)
const expandedRowKeys = computed(() => (hasActiveFilters.value ? collectExpandableParentIds(filteredDepts.value) : undefined))

function matchesDeptQuery(node: TreeNodeView): boolean {
  const deptCode = props.query.deptCode?.trim().toLowerCase()
  const deptName = props.query.deptName?.trim().toLowerCase()
  const status = props.query.status?.trim()

  const hitDeptCode = !deptCode || String(node.deptCode ?? '').toLowerCase().includes(deptCode)
  const hitDeptName = !deptName || String(node.deptName ?? '').toLowerCase().includes(deptName)
  const hitStatus = !status || String(node.status ?? '') === status

  return hitDeptCode && hitDeptName && hitStatus
}

function filterTree(source: TreeNodeView[], matcher: (node: TreeNodeView) => boolean): TreeNodeView[] {
  return source.reduce<TreeNodeView[]>((result, item) => {
    const children = filterTree(item.children ?? [], matcher)
    if (matcher(item) || children.length) {
      result.push({
        ...item,
        children
      })
    }
    return result
  }, [])
}

function handleSearch(): void {
  emit('search')
}

function handleReset(): void {
  emit('reset')
}

function collectExpandableParentIds(nodes: TreeNodeView[]): number[] {
  const keys: number[] = []
  visitTree(nodes, (node) => {
    if ((node.children?.length ?? 0) > 0) {
      keys.push(node.id)
    }
  })
  return keys
}

function visitTree(nodes: TreeNodeView[], visitor: (node: TreeNodeView) => void): void {
  for (const node of nodes) {
    visitor(node)
    if (node.children?.length) {
      visitTree(node.children, visitor)
    }
  }
}
</script>
