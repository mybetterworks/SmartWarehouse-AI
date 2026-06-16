<template>
  <section class="sys-route-panel">
    <section class="sys-action-bar">
      <el-button type="primary" @click="emit('create')">新增用户</el-button>
    </section>
    <PlatformTable :columns="columns" :data="users" row-key="id" show-index actions-width="240">
      <template #cell-status="{ row }">
        <StatusTag :status="String(row.status)" />
      </template>
      <template #cell-roles="{ row }">
        <el-tag v-for="role in row.roles as string[]" :key="role" class="sys-tag" effect="light">{{ role }}</el-tag>
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
</template>

<script setup lang="ts">
import { PlatformTable, StatusTag } from '@smartwarehouse/platform-ui'
import type { TableColumn } from '@smartwarehouse/platform-types'
import type { UserView } from '../api'

defineProps<{
  columns: TableColumn[]
  users: UserView[]
}>()

const emit = defineEmits<{
  create: []
  edit: [row: UserView]
  warehouse: [row: UserView]
  delete: [row: UserView]
}>()
</script>
