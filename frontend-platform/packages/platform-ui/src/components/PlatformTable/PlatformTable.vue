<template>
  <div class="sw-table">
    <el-alert v-if="error" class="sw-table__alert" type="error" :title="error" show-icon :closable="false" />
    <el-table
      v-loading="loading"
      :data="data"
      :row-key="rowKey"
      :height="height"
      :tree-props="treeProps"
      :default-expand-all="defaultExpandAll"
      :expand-row-keys="expandRowKeys"
      stripe
      border
      @selection-change="emit('selectionChange', $event)"
      @sort-change="emit('sortChange', $event)"
    >
      <el-table-column v-if="selectable" type="selection" width="48" align="center" />
      <el-table-column v-if="showIndex" type="index" label="#" width="56" align="center" />
      <el-table-column
        v-for="column in columns"
        :key="column.prop ?? column.label"
        :prop="column.prop"
        :label="column.label"
        :width="column.width"
        :min-width="column.minWidth"
        :fixed="column.fixed"
        :align="column.align"
        :sortable="column.sortable"
        :show-overflow-tooltip="column.showOverflowTooltip"
      >
        <template #default="scope">
          <slot
            :name="column.prop ? `cell-${column.prop}` : 'cell'"
            :row="scope.row"
            :column="column"
            :value="getCellValue(scope.row, column.prop)"
          >
            {{ renderCell(scope.row, column) }}
          </slot>
        </template>
      </el-table-column>

      <el-table-column v-if="$slots.actions" label="操作" fixed="right" :width="actionsWidth" align="center">
        <template #default="scope">
          <div class="sw-table__actions">
            <slot name="actions" :row="scope.row" />
          </div>
        </template>
      </el-table-column>

      <template #empty>
        <el-empty description="暂无数据" />
      </template>
    </el-table>

    <div v-if="pagination" class="sw-table__pagination">
      <el-pagination
        background
        layout="total, sizes, prev, pager, next"
        :current-page="pagination.pageNo"
        :page-size="pagination.pageSize"
        :page-sizes="pageSizes"
        :total="pagination.total"
        @current-change="handleCurrentChange"
        @size-change="handleSizeChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TableColumn, TablePagination } from '@smartwarehouse/platform-types'

const props = withDefaults(
  defineProps<{
    columns: TableColumn[]
    data: Record<string, unknown>[]
    loading?: boolean
    error?: string
    pagination?: TablePagination
    rowKey?: string
    selectable?: boolean
    showIndex?: boolean
    actionsWidth?: string | number
    pageSizes?: number[]
    height?: string | number
    treeProps?: Record<string, string>
    defaultExpandAll?: boolean
    expandRowKeys?: Array<string | number>
  }>(),
  {
    loading: false,
    error: '',
    rowKey: 'id',
    selectable: false,
    showIndex: false,
    actionsWidth: 160,
    pageSizes: () => [10, 20, 50, 100],
    treeProps: () => ({}),
    defaultExpandAll: false,
    expandRowKeys: undefined
  }
)

const emit = defineEmits<{
  pageChange: [pagination: TablePagination]
  selectionChange: [rows: Record<string, unknown>[]]
  sortChange: [sort: { column: unknown; prop: string; order: string | null }]
}>()

// 根据列配置读取单元格值，列没有 prop 时交给插槽完全自定义渲染。
function getCellValue(row: Record<string, unknown>, prop?: string): unknown {
  return prop ? row[prop] : undefined
}

// 表格默认渲染逻辑只做轻量兜底；复杂状态、按钮、金额等内容应通过 cell-* 插槽扩展。
function renderCell(row: Record<string, unknown>, column: TableColumn): string {
  if (column.formatter) {
    return column.formatter(row)
  }

  const value = getCellValue(row, column.prop)
  return value === undefined || value === null || value === '' ? '-' : String(value)
}

// 翻页只向外抛出新的分页参数，不在组件内请求接口，保持通用表格与具体业务解耦。
function handleCurrentChange(pageNo: number): void {
  if (!props.pagination) {
    return
  }

  emit('pageChange', {
    ...props.pagination,
    pageNo
  })
}

// 修改每页条数时回到第一页，这是后台列表常见约定，避免原页码超过新的最大页数。
function handleSizeChange(pageSize: number): void {
  if (!props.pagination) {
    return
  }

  emit('pageChange', {
    ...props.pagination,
    pageNo: 1,
    pageSize
  })
}
</script>
