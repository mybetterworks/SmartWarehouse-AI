<template>
  <main class="vendor-app">
    <PlatformPage title="仓储管理" description="乙方 WMS 前端微应用，当前以最小远程模块验证独立部署和运行时加载能力。">
      <template #toolbar>
        <el-button type="primary">新建入库单</el-button>
        <el-button>离线上传</el-button>
      </template>

      <section class="vendor-grid">
        <StatCard v-for="item in statCards" :key="item.key" :item="item" />
      </section>

      <PlatformTable :columns="columns" :data="rows" row-key="materialCode" show-index />
    </PlatformPage>
  </main>
</template>

<script setup lang="ts">
import { PlatformPage, PlatformTable, StatCard } from '@smartwarehouse/platform-ui'
import type { StatCardItem, TableColumn } from '@smartwarehouse/platform-types'

// 远程模块中的统计卡片也必须遵守平台组件库契约，后续接入 WMS 接口时只替换数据来源。
const statCards: StatCardItem[] = [
  { key: 'material-count', title: '物料种类', value: 128, unit: '种' },
  { key: 'safety-alert', title: '安全库存预警', value: 6, unit: '条', tone: 'warning' },
  { key: 'inbound-today', title: '今日入库', value: 32, unit: '单', tone: 'success' }
]

// 最小 WMS 远程页面先展示库存核心字段，用于验证乙方模块可独立构建、发布和被门户运行时加载。
const columns: TableColumn[] = [
  { prop: 'materialCode', label: '物料编码', minWidth: 140 },
  { prop: 'materialName', label: '物料名称', minWidth: 160 },
  { prop: 'warehouse', label: '仓库', minWidth: 140 },
  { prop: 'stockQty', label: '可用库存', width: 120 },
  { prop: 'status', label: '状态', width: 120 }
]

const rows = [
  { materialCode: 'MAT-001', materialName: '标准螺栓', warehouse: '一号原料仓', stockQty: 1200, status: '正常' },
  { materialCode: 'MAT-018', materialName: '控制面板', warehouse: '电子件仓', stockQty: 68, status: '预警' },
  { materialCode: 'MAT-036', materialName: '包装纸箱', warehouse: '辅料仓', stockQty: 420, status: '正常' }
]
</script>
