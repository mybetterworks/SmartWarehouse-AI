<template>
  <el-steps class="sw-delivery-steps" :active="activeIndex" finish-status="success" process-status="process" align-center>
    <el-step v-for="step in normalizedSteps" :key="step.status" :title="step.title" :description="step.description" />
  </el-steps>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// DeliveryStatusSteps 表达 MES 物料申请到 WMS 配送的最小状态链路。
// 默认步骤服务演示和常规流程，真实项目可传入 steps 适配更细的仓配节点。
const props = withDefaults(
  defineProps<{
    status?: string
    steps?: Array<{ status: string; title: string; description?: string }>
  }>(),
  {
    status: 'PENDING',
    steps: () => [
      { status: 'PENDING', title: '待分配', description: '物料申请已提交' },
      { status: 'ALLOCATING', title: '分配中', description: 'WMS 正在预占库存' },
      { status: 'ALLOCATED', title: '已分配', description: '库存批次已锁定' },
      { status: 'DELIVERING', title: '配送中', description: '仓储正在配送' },
      { status: 'DELIVERED', title: '已送达', description: '生产线已签收' }
    ]
  }
)

// 保持 computed 形态，后续如果步骤需要按权限、仓库或工单类型过滤，可以在这里集中扩展。
const normalizedSteps = computed(() => props.steps)
// 找不到状态时回退到第一个节点，避免接口返回未知状态导致步骤条完全空白。
const activeIndex = computed(() => Math.max(0, normalizedSteps.value.findIndex((item) => item.status === props.status)))
</script>
