<template>
  <section class="sys-route-panel">
    <section class="sys-action-bar">
      <el-button type="primary" @click="emit('create')">新增角色</el-button>
    </section>
    <PlatformTable :columns="columns" :data="roles" row-key="id" show-index actions-width="240">
      <template #cell-status="{ row }">
        <StatusTag :status="String(row.status)" />
      </template>
      <template #cell-menuIds="{ row }">
        <span>{{ (row.menuIds as number[]).length }} 个菜单</span>
      </template>
      <template #actions="{ row }">
        <el-button text type="primary" @click="emit('edit', row as RoleView)">编辑</el-button>
        <el-button text @click="emit('menus', row as RoleView)">菜单</el-button>
        <el-button text type="danger" @click="emit('delete', row as RoleView)">删除</el-button>
      </template>
    </PlatformTable>
  </section>
</template>

<script setup lang="ts">
import { PlatformTable, StatusTag } from '@smartwarehouse/platform-ui'
import type { TableColumn } from '@smartwarehouse/platform-types'
import type { RoleView } from '../api'

defineProps<{
  columns: TableColumn[]
  roles: RoleView[]
}>()

const emit = defineEmits<{
  create: []
  edit: [row: RoleView]
  menus: [row: RoleView]
  delete: [row: RoleView]
}>()
</script>
