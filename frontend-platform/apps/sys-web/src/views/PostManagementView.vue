<template>
  <section class="sys-route-panel">
    <section class="sys-action-bar">
      <el-button type="primary" @click="emit('createPost')">新增岗位</el-button>
    </section>
    <PlatformTable :columns="columns" :data="posts" row-key="id" show-index actions-width="160">
      <template #cell-status="{ row }">
        <StatusTag :status="String(row.status)" />
      </template>
      <template #actions="{ row }">
        <el-button text type="primary" @click="emit('editPost', row as SimpleRecord)">编辑</el-button>
        <el-button text type="danger" @click="emit('deletePost', row as SimpleRecord)">删除</el-button>
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
  posts: SimpleRecord[]
}>()

const emit = defineEmits<{
  createPost: []
  editPost: [row: SimpleRecord]
  deletePost: [row: SimpleRecord]
}>()
</script>
