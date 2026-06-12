import type { ApiResult } from '@smartwarehouse/platform-types'
import { getRuntimeConfig } from './config'
import { getAccessToken, setAccessToken } from './token'

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export interface RequestOptions<TBody = unknown> {
  url: string
  method?: HttpMethod
  body?: TBody
  params?: Record<string, string | number | boolean | undefined | null>
  headers?: Record<string, string>
  signal?: AbortSignal
}

export class ApiError extends Error {
  readonly code: string
  readonly traceId?: string

  // 统一封装后端业务错误，页面只需要捕获 ApiError 即可拿到错误码和链路追踪号。
  constructor(message: string, code: string, traceId?: string) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.traceId = traceId
  }
}

let refreshHandler: (() => Promise<string | undefined>) | undefined

// 刷新 Token 的真实逻辑放在门户或 sys 前端中注册，SDK 只负责在 401 时调用扩展点。
export function setRefreshTokenHandler(handler: (() => Promise<string | undefined>) | undefined): void {
  refreshHandler = handler
}

function buildUrl(url: string, params?: RequestOptions['params']): string {
  const { apiBaseUrl } = getRuntimeConfig()
  // 业务页面可以传相对业务路径，SDK 统一拼到 /api，避免每个页面硬编码网关前缀。
  const normalizedUrl = url.startsWith('/api/') || url === '/api' ? url : `${apiBaseUrl}${url.startsWith('/') ? url : `/${url}`}`
  const search = new URLSearchParams()

  // 过滤 undefined/null，避免把未填写的查询条件传成字符串 "undefined" 或 "null"。
  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      search.set(key, String(value))
    }
  })

  const query = search.toString()
  return query ? `${normalizedUrl}?${query}` : normalizedUrl
}

async function parseApiResult<T>(response: Response): Promise<ApiResult<T>> {
  const traceId = response.headers.get(getRuntimeConfig().traceHeader) ?? undefined
  const contentType = response.headers.get('content-type') ?? ''

  // 文件下载、网关错误页等场景可能不是 JSON，这里仍返回统一结构，方便上层显示状态和 traceId。
  if (!contentType.includes('application/json')) {
    return {
      code: response.ok ? 'SUCCESS' : String(response.status),
      message: response.statusText,
      data: undefined as T,
      traceId
    }
  }

  const body = (await response.json()) as ApiResult<T>
  return {
    ...body,
    traceId: body.traceId ?? traceId
  }
}

export async function request<TData, TBody = unknown>(options: RequestOptions<TBody>): Promise<TData> {
  const config = getRuntimeConfig()
  const token = getAccessToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers ?? {})
  }

  if (token) {
    // Token Header 名称通过运行时配置控制，便于后端统一约定变化时不改所有业务页面。
    headers[config.tokenHeader] = token
  }

  const response = await fetch(buildUrl(options.url, options.params), {
    method: options.method ?? 'GET',
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    signal: options.signal
  })

  if (response.status === 401 && refreshHandler) {
    // 首次请求遇到 401 时尝试刷新 Access Token，刷新成功后用原参数重放一次请求。
    const nextToken = await refreshHandler()
    if (nextToken) {
      setAccessToken(nextToken)
      return request<TData, TBody>(options)
    }
  }

  const result = await parseApiResult<TData>(response)
  // 兼容不同后端模板常见的成功码，后续真实项目可收敛为统一 SUCCESS。
  const success = response.ok && ['0', 'SUCCESS', 'OK'].includes(result.code)

  if (!success) {
    throw new ApiError(result.message || 'Request failed', result.code, result.traceId)
  }

  return result.data
}
