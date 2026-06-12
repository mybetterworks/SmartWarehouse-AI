<template>
  <PlatformTable :columns="columns" :data="tableRows" :pagination="pagination" show-index @page-change="emit('pageChange', $event)">
    <template #cell-reason="{ row }">
      <el-tag type="danger" effect="light">{{ row.reason }}</el-tag>
    </template>
  </PlatformTable>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ImportErrorRow, TableColumn, TablePagination } from '@smartwarehouse/platform-types'
import PlatformTable from '../PlatformTable/PlatformTable.vue'

// ImportErrorTable 展示离线导入校验失败明细，常用于 WMS 入库数据离线上传后的人工修正。
const props = withDefaults(
  defineProps<{
    rows?: ImportErrorRow[]
    pagination?: TablePagination
  }>(),
  {
    rows: () => []
  }
)

const emit = defineEmits<{
  pageChange: [pagination: TablePagination]
}>()

// 错误表格列保持稳定，便于导入任务详情页、弹窗和抽屉中复用相同阅读体验。
const columns: TableColumn[] = [
  { prop: 'rowNo', label: '行号', width: 90, align: 'center' },
  { prop: 'field', label: '字段', width: 140 },
  { prop: 'value', label: '原始值', minWidth: 160, showOverflowTooltip: true },
  { prop: 'reason', label: '失败原因', minWidth: 220 }
]

// PlatformTable 的通用入参是 Record 数组，业务强类型行在这里转换，避免污染通用表格类型定义。
const tableRows = computed<Record<string, unknown>[]>(() => props.rows.map((item) => ({ ...item })))
</script>
