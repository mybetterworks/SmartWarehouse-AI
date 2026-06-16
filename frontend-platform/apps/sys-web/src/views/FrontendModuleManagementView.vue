<template>
  <section class="sys-route-panel">
    <section class="sys-action-bar">
      <el-button type="primary" @click="emit('create')">新增模块</el-button>
    </section>
    <PlatformTable :columns="columns" :data="modules" row-key="id" show-index actions-width="180">
      <template #cell-status="{ row }">
        <StatusTag :status="String(row.status)" />
      </template>
      <template #actions="{ row }">
        <el-button text type="primary" @click="emit('edit', row as SimpleRecord)">编辑</el-button>
        <el-button text type="danger" @click="emit('delete', row as SimpleRecord)">删除</el-button>
      </template>
    </PlatformTable>
  </section>
</template>

<script setup lang="ts">
import { PlatformTable, StatusTag } from '@smartwarehouse/platform-ui'
import type { TableColumn } from '@smartwarehouse/platform-types'
import type { SimpleRecord } from '../api'

defineProps<{
  columns: TableColumn[]
  modules: SimpleRecord[]
}>()

const emit = defineEmits<{
  create: []
  edit: [row: SimpleRecord]
  delete: [row: SimpleRecord]
}>()
</script>
