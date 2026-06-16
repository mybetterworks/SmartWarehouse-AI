<template>
  <main class="vendor-app">
    <PlatformPage title="AI 助手" description="乙方 AI 前端微应用，当前以最小远程模块验证 RAG、ChatBI 和 Agent 入口。">
      <section class="ai-workbench">
        <ChatPanel
          title="制造仓储智能问答"
          :messages="messages"
          :loading="false"
          placeholder="输入库存、工单或知识库问题"
        />
        <div class="ai-side">
          <StatCard v-for="item in statCards" :key="item.key" :item="item" />
          <el-alert title="远程 AI 模块已运行时加载" type="success" show-icon :closable="false" />
        </div>
      </section>
    </PlatformPage>
  </main>
</template>

<script setup lang="ts">
import { ChatPanel, PlatformPage, StatCard } from '@smartwarehouse/platform-ui'
import type { ChatMessage, StatCardItem } from '@smartwarehouse/platform-types'

// AI 远程模块先使用静态会话验证 ChatPanel 运行时加载，后续接入 ai-service 后替换为真实对话流。
const messages: ChatMessage[] = [
  { id: 'msg-1', role: 'assistant', content: '你好，我可以基于 WMS、MES 和知识库数据回答制造仓储协同问题。' },
  { id: 'msg-2', role: 'user', content: '今天有哪些安全库存预警？' },
  { id: 'msg-3', role: 'assistant', content: '当前示例中有 6 条安全库存预警，后续会接入 ai-service 的 RAG 和 ChatBI 接口。' }
]

// 统计卡片用于展示 AI 模块最小运营指标，保持与平台组件库 StatCard 的统一入参格式。
const statCards: StatCardItem[] = [
  { key: 'knowledge-docs', title: '知识库文档', value: 42, unit: '份' },
  { key: 'qa-today', title: '今日问答', value: 76, unit: '次', tone: 'success' }
]
</script>
