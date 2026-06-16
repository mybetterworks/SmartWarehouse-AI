<template>
  <section class="sys-route-panel">
    <section class="sys-action-bar">
      <el-button type="primary" @click="emit('createDept')">新增部门</el-button>
    </section>
    <PlatformTable :columns="columns" :data="depts" row-key="id" show-index actions-width="160">
      <template #cell-status="{ row }">
        <StatusTag :status="String(row.status)" />
      </template>
      <template #actions="{ row }">
        <el-button text type="primary" @click="emit('editDept', row as TreeNodeView)">编辑</el-button>
        <el-button text type="danger" @click="emit('deleteDept', row as TreeNodeView)">删除</el-button>
      </template>
    </PlatformTable>
  </section>
</template>

<script setup lang="ts">
import { PlatformTable, StatusTag } from '@smartwarehouse/platform-ui'
import type { TableColumn } from '@smartwarehouse/platform-types'
import type { TreeNodeView } from '../api'

defineProps<{
  columns: TableColumn[]
  depts: TreeNodeView[]
}>()

const emit = defineEmits<{
  createDept: []
  editDept: [row: TreeNodeView]
  deleteDept: [row: TreeNodeView]
}>()
</script>
