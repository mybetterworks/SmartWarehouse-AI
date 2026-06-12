const accessTokenKey = 'smartwarehouse.accessToken'
const refreshTokenKey = 'smartwarehouse.refreshToken'

// VitePress SSR、单元测试或 Node 构建阶段没有 window/localStorage，需要先做环境判断。
function hasStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

// Access Token 用于普通接口鉴权；这里只做轻量存取，具体安全策略由门户和后端共同控制。
export function getAccessToken(): string | undefined {
  return hasStorage() ? window.localStorage.getItem(accessTokenKey) ?? undefined : undefined
}

export function setAccessToken(value: string): void {
  if (hasStorage()) {
    window.localStorage.setItem(accessTokenKey, value)
  }
}

// Refresh Token 只在刷新登录态时使用，后续真实项目可替换为更安全的 httpOnly Cookie 方案。
export function getRefreshToken(): string | undefined {
  return hasStorage() ? window.localStorage.getItem(refreshTokenKey) ?? undefined : undefined
}

export function setRefreshToken(value: string): void {
  if (hasStorage()) {
    window.localStorage.setItem(refreshTokenKey, value)
  }
}

// 退出登录、Token 失效或安全风控触发时统一清理本地登录态。
export function clearTokens(): void {
  if (hasStorage()) {
    window.localStorage.removeItem(accessTokenKey)
    window.localStorage.removeItem(refreshTokenKey)
  }
}
