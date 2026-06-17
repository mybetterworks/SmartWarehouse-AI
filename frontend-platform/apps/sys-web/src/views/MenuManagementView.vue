<template>
  <section class="sys-route-panel sys-user-page sys-tree-page">
    <PlatformSearchForm
      class="sys-user-page__search"
      :model="query"
      :collapsible="false"
      @search="handleSearch"
      @reset="handleReset"
    >
      <el-form-item label="菜单名称">
        <el-input v-model="query.menuName" placeholder="请输入菜单名称" clearable @keyup.enter="handleSearch" />
      </el-form-item>
      <el-form-item label="菜单类型">
        <el-select v-model="query.menuType" placeholder="全部类型" clearable>
          <el-option label="目录" value="DIR" />
          <el-option label="菜单" value="MENU" />
          <el-option label="按钮" value="BUTTON" />
        </el-select>
      </el-form-item>
      <el-form-item label="模块编码">
        <el-input v-model="query.moduleCode" placeholder="请输入模块编码" clearable @keyup.enter="handleSearch" />
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="query.status" placeholder="全部状态" clearable>
          <el-option label="启用" value="ENABLED" />
          <el-option label="停用" value="DISABLED" />
        </el-select>
      </el-form-item>
      <el-form-item label="是否显示">
        <el-select v-model="query.visible" placeholder="全部" clearable>
          <el-option label="显示" :value="true" />
          <el-option label="隐藏" :value="false" />
        </el-select>
      </el-form-item>
    </PlatformSearchForm>

    <section class="sys-user-page__table-panel">
      <section class="sys-action-bar sys-user-page__actions">
        <el-button type="primary" @click="emit('create')">新增</el-button>
      </section>

      <PlatformTable
        :columns="columns"
        :data="filteredMenus"
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
        <template #cell-menuName="{ row }">
          <div class="sys-tree-cell">
            <span class="sys-tree-cell__leading">
              <el-icon v-if="row.icon" class="sys-tree-cell__icon">
                <component :is="resolveMenuIcon(String(row.icon))" />
              </el-icon>
              <span v-else class="sys-tree-cell__icon-placeholder" aria-hidden="true"></span>
              <span class="sys-tree-cell__text">{{ String(row.menuName ?? '-') }}</span>
            </span>
          </div>
        </template>
        <template #cell-visible="{ row }">
          <el-tag :type="row.visible ? 'success' : 'info'" effect="light">{{ row.visible ? '显示' : '隐藏' }}</el-tag>
        </template>
        <template #cell-status="{ row }">
          <StatusTag :status="String(row.status)" />
        </template>
        <template #actions="{ row }">
          <el-button text @click="emit('createChild', row as TreeNodeView)">新增</el-button>
          <el-button text type="primary" @click="emit('edit', row as TreeNodeView)">修改</el-button>
          <el-button text type="danger" @click="emit('delete', row as TreeNodeView)">删除</el-button>
        </template>
      </PlatformTable>
    </section>
  </section>
</template>

<script setup lang="ts">
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { Menu as MenuIcon } from '@element-plus/icons-vue'
import { PlatformSearchForm, PlatformTable, StatusTag } from '@smartwarehouse/platform-ui'
import type { TableColumn } from '@smartwarehouse/platform-types'
import { computed } from 'vue'
import type { MenuListQuery, TreeNodeView } from '../api'

const props = defineProps<{
  columns: TableColumn[]
  menus: TreeNodeView[]
  query: MenuListQuery
  loading?: boolean
}>()

const emit = defineEmits<{
  search: []
  reset: []
  create: []
  createChild: [row: TreeNodeView]
  edit: [row: TreeNodeView]
  delete: [row: TreeNodeView]
}>()

const filteredMenus = computed(() => filterTree(props.menus, matchesMenuQuery))
const hasActiveFilters = computed(() => {
  const query = props.query
  return Boolean(
    query.menuName?.trim() ||
      query.menuType?.trim() ||
      query.moduleCode?.trim() ||
      query.status?.trim() ||
      typeof query.visible === 'boolean'
  )
})
const shouldExpandAll = computed(() => !hasActiveFilters.value)
const expandedRowKeys = computed(() => (hasActiveFilters.value ? collectExpandableParentIds(filteredMenus.value) : undefined))

function matchesMenuQuery(node: TreeNodeView): boolean {
  const menuName = props.query.menuName?.trim().toLowerCase()
  const menuType = props.query.menuType?.trim()
  const moduleCode = props.query.moduleCode?.trim().toLowerCase()
  const status = props.query.status?.trim()
  const visible = props.query.visible

  const hitMenuName = !menuName || String(node.menuName ?? '').toLowerCase().includes(menuName)
  const hitMenuType = !menuType || String(node.menuType ?? '') === menuType
  const hitModuleCode = !moduleCode || String(node.moduleCode ?? '').toLowerCase().includes(moduleCode)
  const hitStatus = !status || String(node.status ?? '') === status
  const hitVisible = typeof visible !== 'boolean' || node.visible === visible

  return hitMenuName && hitMenuType && hitModuleCode && hitStatus && hitVisible
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

function resolveMenuIcon(iconName: string) {
  const directMatch = ElementPlusIconsVue[iconName as keyof typeof ElementPlusIconsVue]
  if (directMatch) {
    return directMatch
  }

  const normalizedName = iconName
    .trim()
    .replace(/(^|[-_\s]+)(\w)/g, (_, __, char: string) => char.toUpperCase())
    .replace(/[^\w]/g, '')

  return ElementPlusIconsVue[normalizedName as keyof typeof ElementPlusIconsVue] ?? MenuIcon
}
</script>
