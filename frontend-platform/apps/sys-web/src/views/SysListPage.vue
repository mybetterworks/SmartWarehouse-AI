<template>
  <section class="sys-route-panel sys-user-page">
    <PlatformSearchForm
      v-if="$slots.search"
      class="sys-user-page__search"
      :model="query"
      :collapsible="false"
      @search="emit('search')"
      @reset="emit('reset')"
    >
      <slot name="search" />
    </PlatformSearchForm>

    <section class="sys-user-page__table-panel">
      <section v-if="$slots.actions" class="sys-action-bar sys-user-page__actions">
        <slot name="actions" />
      </section>

      <PlatformTable
        :columns="columns"
        :data="data"
        :loading="loading"
        :pagination="pagination"
        :row-key="rowKey"
        :selectable="selectable"
        :show-index="showIndex"
        :actions-width="actionsWidth"
        :tree-props="treeProps"
        :default-expand-all="defaultExpandAll"
        height="100%"
        v-bind="$attrs"
        @page-change="emit('pageChange', $event)"
        @selection-change="emit('selectionChange', $event)"
      >
        <template v-if="$slots['cell-status']" #cell-status="scope">
          <slot name="cell-status" v-bind="scope" />
        </template>
        <template v-if="$slots['cell-menuIds']" #cell-menuIds="scope">
          <slot name="cell-menuIds" v-bind="scope" />
        </template>
        <template v-if="$slots['cell-roles']" #cell-roles="scope">
          <slot name="cell-roles" v-bind="scope" />
        </template>
        <template v-if="$slots['cell-warehouseIds']" #cell-warehouseIds="scope">
          <slot name="cell-warehouseIds" v-bind="scope" />
        </template>
        <template v-if="$slots['row-actions']" #actions="scope">
          <slot name="row-actions" v-bind="scope" />
        </template>
      </PlatformTable>
    </section>
  </section>
</template>

<script setup lang="ts">
import { PlatformSearchForm, PlatformTable } from '@smartwarehouse/platform-ui'
import type { TableColumn, TablePagination } from '@smartwarehouse/platform-types'

withDefaults(
  defineProps<{
    columns: TableColumn[]
    data: Record<string, unknown>[]
    query?: Record<string, unknown>
    pagination?: TablePagination
    loading?: boolean
    rowKey?: string
    selectable?: boolean
    showIndex?: boolean
    actionsWidth?: number | string
    treeProps?: Record<string, string>
    defaultExpandAll?: boolean
  }>(),
  {
    query: () => ({}),
    loading: false,
    rowKey: 'id',
    selectable: false,
    showIndex: false,
    actionsWidth: 160,
    treeProps: () => ({}),
    defaultExpandAll: false
  }
)

const emit = defineEmits<{
  search: []
  reset: []
  pageChange: [pagination: TablePagination]
  selectionChange: [rows: Record<string, unknown>[]]
}>()
</script>
