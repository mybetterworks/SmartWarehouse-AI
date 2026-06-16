<template>
  <section class="sys-route-panel">
    <section class="sys-action-bar">
      <el-button type="primary" @click="emit('create')">新增菜单</el-button>
    </section>
    <PlatformTable :columns="columns" :data="menus" row-key="id" show-index actions-width="180">
      <template #cell-menuName="{ row }">
        <div class="sys-menu-name-cell">
          <el-icon v-if="row.icon" class="sys-menu-name-cell__icon">
            <component :is="resolveMenuIcon(String(row.icon))" />
          </el-icon>
          <span>{{ String(row.menuName ?? '-') }}</span>
        </div>
      </template>
      <template #cell-visible="{ row }">
        <el-tag :type="row.visible ? 'success' : 'info'">{{ row.visible ? '显示' : '隐藏' }}</el-tag>
      </template>
      <template #cell-status="{ row }">
        <StatusTag :status="String(row.status)" />
      </template>
      <template #actions="{ row }">
        <el-button text type="primary" @click="emit('edit', row as TreeNodeView)">编辑</el-button>
        <el-button text type="danger" @click="emit('delete', row as TreeNodeView)">删除</el-button>
      </template>
    </PlatformTable>
  </section>
</template>

<script setup lang="ts">
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { Menu as MenuIcon } from '@element-plus/icons-vue'
import { PlatformTable, StatusTag } from '@smartwarehouse/platform-ui'
import type { TableColumn } from '@smartwarehouse/platform-types'
import type { TreeNodeView } from '../api'

defineProps<{
  columns: TableColumn[]
  menus: TreeNodeView[]
}>()

const emit = defineEmits<{
  create: []
  edit: [row: TreeNodeView]
  delete: [row: TreeNodeView]
}>()

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

<style scoped>
.sys-menu-name-cell {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.sys-menu-name-cell__icon {
  color: var(--el-text-color-regular);
}
</style>
