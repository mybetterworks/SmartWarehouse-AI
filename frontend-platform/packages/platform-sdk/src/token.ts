const accessTokenKey = 'smartwarehouse.accessToken'
const refreshTokenKey = 'smartwarehouse.refreshToken'
const tokenCookieMaxAgeSeconds = 60 * 60 * 24 * 7

// VitePress SSR、单元测试或 Node 构建阶段没有 window/localStorage，需要先做环境判断。
function hasStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

// Cookie 不区分端口，适合本地 portal-shell:5174 跳转 sys-web:5175 时共享登录态。
function hasDocument(): boolean {
  return typeof document !== 'undefined'
}

function readStorage(key: string): string | undefined {
  if (!hasStorage()) {
    return undefined
  }
  try {
    return window.localStorage.getItem(key) ?? undefined
  } catch {
    return undefined
  }
}

function writeStorage(key: string, value: string): void {
  if (!hasStorage()) {
    return
  }
  try {
    window.localStorage.setItem(key, value)
  } catch {
    // localStorage 被浏览器策略禁用时，Cookie 桥接仍可继续承担本地开发登录态共享。
  }
}

function removeStorage(key: string): void {
  if (!hasStorage()) {
    return
  }
  try {
    window.localStorage.removeItem(key)
  } catch {
    // 清理失败不阻断退出流程，后续 Cookie 仍会被统一过期。
  }
}

function readCookie(key: string): string | undefined {
  if (!hasDocument()) {
    return undefined
  }
  const prefix = `${encodeURIComponent(key)}=`
  const item = document.cookie
    .split(';')
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(prefix))
  return item ? decodeURIComponent(item.slice(prefix.length)) : undefined
}

function writeCookie(key: string, value: string): void {
  if (!hasDocument()) {
    return
  }
  document.cookie = `${encodeURIComponent(key)}=${encodeURIComponent(value)}; Path=/; Max-Age=${tokenCookieMaxAgeSeconds}; SameSite=Lax`
}

function removeCookie(key: string): void {
  if (!hasDocument()) {
    return
  }
  document.cookie = `${encodeURIComponent(key)}=; Path=/; Max-Age=0; SameSite=Lax`
}

function readToken(key: string): string | undefined {
  const storageValue = readStorage(key)
  if (storageValue) {
    return storageValue
  }
  const cookieValue = readCookie(key)
  if (cookieValue) {
    writeStorage(key, cookieValue)
  }
  return cookieValue
}

function writeToken(key: string, value: string): void {
  writeStorage(key, value)
  writeCookie(key, value)
}

function removeToken(key: string): void {
  removeStorage(key)
  removeCookie(key)
}

// Access Token 用于普通接口鉴权；具体安全策略由门户、网关和后端统一控制。
export function getAccessToken(): string | undefined {
  return readToken(accessTokenKey)
}

export function setAccessToken(value: string): void {
  writeToken(accessTokenKey, value)
}

// Refresh Token 只在刷新登录态时使用，真实商用环境可替换为更安全的 httpOnly Cookie 方案。
export function getRefreshToken(): string | undefined {
  return readToken(refreshTokenKey)
}

export function setRefreshToken(value: string): void {
  writeToken(refreshTokenKey, value)
}

// 退出登录、Token 失效或安全风控触发时统一清理本地登录态。
export function clearTokens(): void {
  removeToken(accessTokenKey)
  removeToken(refreshTokenKey)
}
