import { onBeforeUnmount, ref } from 'vue'
import { createWebSocketClient, type WebSocketClientOptions } from '@smartwarehouse/platform-sdk'
import type { WebSocketMessage } from '@smartwarehouse/platform-types'

export function useWebSocketClient<T = unknown>(options: WebSocketClientOptions<T>) {
  const connected = ref(false)
  const latestMessage = ref<WebSocketMessage<T>>()
  // 组合式函数把 SDK 的命令式客户端转换为 Vue 响应式状态，方便看板和导入进度组件直接绑定。
  const client = createWebSocketClient<T>({
    ...options,
    onOpen: () => {
      connected.value = true
      options.onOpen?.()
    },
    onClose: () => {
      connected.value = false
      options.onClose?.()
    },
    onMessage: (message) => {
      // 保存最近一条消息，简单场景无需额外写消息队列就能展示实时状态。
      latestMessage.value = message
      options.onMessage?.(message)
    }
  })

  onBeforeUnmount(() => {
    // 组件卸载时主动断开连接，避免切换页面后旧 WebSocket 继续接收推送。
    client.disconnect()
  })

  return {
    connected,
    latestMessage,
    connect: client.connect,
    disconnect: client.disconnect,
    send: client.send
  }
}
