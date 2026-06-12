# PlatformTable

## 用途

统一后台列表页表格，支持 loading、错误态、空态、分页、字段插槽和操作列。

## 基础用法

```vue
<PlatformTable :columns="columns" :data="records" :pagination="pagination" @page-change="loadData">
  <template #actions="{ row }">
    <el-button text type="primary">查看</el-button>
  </template>
</PlatformTable>
```

## Props

| 名称 | 类型 | 说明 |
|---|---|---|
| `columns` | `TableColumn[]` | 列配置。 |
| `data` | `Record<string, unknown>[]` | 表格数据。 |
| `loading` | `boolean` | 加载状态。 |
| `error` | `string` | 错误提示。 |
| `pagination` | `TablePagination` | 分页配置。 |
| `rowKey` | `string` | 行主键。 |

## Events

| 名称 | 说明 |
|---|---|
| `pageChange` | 当前页或页大小变化。 |

## 注意事项

业务页面可以通过 `cell-${prop}` 插槽定制单元格，但不应在组件库中写入 WMS、MES、AI 的业务逻辑。
