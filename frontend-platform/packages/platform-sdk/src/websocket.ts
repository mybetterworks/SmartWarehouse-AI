import type { WebSocketMessage } from '@smartwarehouse/platform-types'

export interface WebSocketClientOptions<T = unknown> {
  url: string
  protocols?: string | string[]
  reconnect?: boolean
  reconnectInterval?: number
  heartbeatInterval?: number
  heartbeatPayload?: string
  onOpen?: () => void
  onClose?: () => void
  onError?: (event: Event) => void
  onMessage?: (message: WebSocketMessage<T>) => void
}

export interface WebSocketClient<T = unknown> {
  connect: () => void
  disconnect: () => void
  send: (message: WebSocketMessage<T> | string) => void
  getSocket: () => WebSocket | undefined
}

function normalizeWebSocketUrl(url: string): string {
  // 如果调用方传入完整 ws/wss 地址，说明已经由业务自行决定连接目标，SDK 不再改写。
  if (url.startsWith('ws://') || url.startsWith('wss://')) {
    return url
  }

  if (typeof window === 'undefined') {
    return url
  }

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const path = url.startsWith('/') ? url : `/${url}`
  // 默认复用当前页面 host，方便 Nginx/Gateway 在不同环境代理 WebSocket。
  return `${protocol}//${window.location.host}${path}`
}

function parseMessage<T>(data: unknown): WebSocketMessage<T> {
  // 二进制消息保留原始 payload，避免导入进度、实时排行之外的扩展消息被强行 JSON 化。
  if (typeof data !== 'string') {
    return { type: 'binary', payload: data as T }
  }

  try {
    return JSON.parse(data) as WebSocketMessage<T>
  } catch {
    // 服务端如果推送纯文本，仍包装成统一消息结构，页面层无需处理多种返回类型。
    return { type: 'text', payload: data as T }
  }
}

// WebSocket 客户端封装重连、心跳和消息解析，业务组件只关心具体消息 payload。
export function createWebSocketClient<T = unknown>(options: WebSocketClientOptions<T>): WebSocketClient<T> {
  let socket: WebSocket | undefined
  let reconnectTimer: ReturnType<typeof setTimeout> | undefined
  let heartbeatTimer: ReturnType<typeof setInterval> | undefined
  let closedByUser = false

  function clearTimers(): void {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = undefined
    }
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer)
      heartbeatTimer = undefined
    }
  }

  function startHeartbeat(): void {
    if (!options.heartbeatInterval) {
      return
    }

    heartbeatTimer = setInterval(() => {
      if (socket?.readyState === WebSocket.OPEN) {
        // 心跳默认使用 PING 消息，保持连接活跃，也方便后端网关识别空闲连接。
        socket.send(options.heartbeatPayload ?? JSON.stringify({ type: 'PING', payload: {} }))
      }
    }, options.heartbeatInterval)
  }

  function connect(): void {
    // SSR 或测试环境可能不存在 WebSocket，全局无对象时直接跳过连接。
    if (typeof WebSocket === 'undefined') {
      return
    }

    closedByUser = false
    clearTimers()
    socket = new WebSocket(normalizeWebSocketUrl(options.url), options.protocols)

    socket.addEventListener('open', () => {
      options.onOpen?.()
      startHeartbeat()
    })

    socket.addEventListener('message', (event) => {
      options.onMessage?.(parseMessage<T>(event.data))
    })

    socket.addEventListener('error', (event) => {
      options.onError?.(event)
    })

    socket.addEventListener('close', () => {
      clearTimers()
      options.onClose?.()

      if (!closedByUser && options.reconnect !== false) {
        // 非用户主动断开时才重连，避免页面卸载后仍不断创建连接。
        reconnectTimer = setTimeout(connect, options.reconnectInterval ?? 3000)
      }
    })
  }

  function disconnect(): void {
    closedByUser = true
    clearTimers()
    socket?.close()
    socket = undefined
  }

  function send(message: WebSocketMessage<T> | string): void {
    // 未连接时静默丢弃，避免调用方在组件初始化阶段发送消息导致报错。
    if (socket?.readyState !== WebSocket.OPEN) {
      return
    }

    socket.send(typeof message === 'string' ? message : JSON.stringify(message))
  }

  return {
    connect,
    disconnect,
    send,
    getSocket: () => socket
  }
}
