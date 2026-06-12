import type { RuntimeConfig } from '@smartwarehouse/platform-types'

// 运行时配置允许在不同环境部署时由外部注入，避免前端包写死网关地址、上传地址和请求头名称。
declare global {
  interface Window {
    __SMARTWAREHOUSE_RUNTIME_CONFIG__?: Partial<RuntimeConfig>
  }
}

// 默认值面向本地开发和网关统一入口；正式环境可通过 window.__SMARTWAREHOUSE_RUNTIME_CONFIG__ 覆盖。
const defaultRuntimeConfig: RuntimeConfig = {
  apiBaseUrl: '/api',
  tokenHeader: 'X-Access-Token',
  traceHeader: 'X-Trace-Id',
  uploadUrl: '/api/files/upload'
}

let runtimeConfig: RuntimeConfig = {
  ...defaultRuntimeConfig,
  ...(typeof window !== 'undefined' ? window.__SMARTWAREHOUSE_RUNTIME_CONFIG__ : {})
}

// 页面和组件统一从这里读取配置，保证后续切换 Nginx/Gateway/容器环境时只改一处。
export function getRuntimeConfig(): RuntimeConfig {
  return runtimeConfig
}

// 提供给门户启动阶段或测试用例覆盖配置，例如切换 API 前缀、TraceId Header 或上传地址。
export function setRuntimeConfig(config: Partial<RuntimeConfig>): RuntimeConfig {
  runtimeConfig = {
    ...runtimeConfig,
    ...config
  }
  return runtimeConfig
}

// 测试、退出登录或切换租户时可恢复默认配置，避免上一次运行的配置污染后续验证。
export function resetRuntimeConfig(): RuntimeConfig {
  runtimeConfig = {
    ...defaultRuntimeConfig,
    ...(typeof window !== 'undefined' ? window.__SMARTWAREHOUSE_RUNTIME_CONFIG__ : {})
  }
  return runtimeConfig
}
