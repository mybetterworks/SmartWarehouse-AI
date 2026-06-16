<template>
  <main class="vendor-app">
    <PlatformPage title="生产执行" description="乙方 MES 前端微应用，当前以最小远程模块验证工单和物料申请入口。">
      <template #toolbar>
        <el-button type="primary">创建工单</el-button>
        <el-button>提交物料申请</el-button>
      </template>

      <section class="vendor-grid">
        <StatCard v-for="item in statCards" :key="item.key" :item="item" />
      </section>

      <PlatformTable :columns="columns" :data="rows" row-key="workOrderNo" show-index />
    </PlatformPage>
  </main>
</template>

<script setup lang="ts">
import { PlatformPage, PlatformTable, StatCard } from '@smartwarehouse/platform-ui'
import type { StatCardItem, TableColumn } from '@smartwarehouse/platform-types'

// MES 远程模块使用平台统一统计卡片，保持与门户、WMS、AI 模块的展示风格一致。
const statCards: StatCardItem[] = [
  { key: 'running-work-order', title: '进行中工单', value: 18, unit: '张' },
  { key: 'pending-material', title: '待配料', value: 7, unit: '张', tone: 'warning' },
  { key: 'finished-today', title: '今日完工', value: 11, unit: '张', tone: 'success' }
]

// 最小 MES 远程页面聚焦工单和物料状态，后续再逐步替换为 mes-service 的真实接口。
const columns: TableColumn[] = [
  { prop: 'workOrderNo', label: '工单号', minWidth: 150 },
  { prop: 'productName', label: '产品', minWidth: 160 },
  { prop: 'planQty', label: '计划数量', width: 110 },
  { prop: 'materialStatus', label: '物料状态', width: 120 },
  { prop: 'deliveryStatus', label: '配送状态', width: 120 }
]

const rows = [
  { workOrderNo: 'WO-20260615-001', productName: '智能控制柜', planQty: 20, materialStatus: '已分配', deliveryStatus: '配送中' },
  { workOrderNo: 'WO-20260615-002', productName: '包装产线模块', planQty: 12, materialStatus: '待分配', deliveryStatus: '未配送' },
  { workOrderNo: 'WO-20260615-003', productName: '仓储传感器', planQty: 80, materialStatus: '已分配', deliveryStatus: '已送达' }
]
</script>
