<template>
  <span class="sw-realtime-badge" :class="{ 'sw-realtime-badge--online': online }">
    <span class="sw-realtime-badge__dot" />
    {{ online ? onlineText : offlineText }}
  </span>
</template>

<script setup lang="ts">
// RealtimeBadge 只表达 WebSocket 或推送通道的连接状态，不负责建立连接。
// 真实连接由 platform-sdk/createWebSocketClient 或业务组合式函数管理。
withDefaults(
  defineProps<{
    online?: boolean
    onlineText?: string
    offlineText?: string
  }>(),
  {
    online: false,
    onlineText: '实时连接',
    offlineText: '未连接'
  }
)
</script>
