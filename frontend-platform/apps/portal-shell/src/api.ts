import {
  clearTokens,
  getRefreshToken,
  request,
  setAccessToken,
  setCurrentUser,
  setRefreshToken,
  setRefreshTokenHandler
} from '@smartwarehouse/platform-sdk'
import type { FrontendModule, LoginRiskState, LoginUser, MenuItem, PortalWorkbench } from '@smartwarehouse/platform-types'

export interface LoginPayload {
  username: string
  password: string
  captchaTicket?: string
  captchaVerifyToken?: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface ChangePasswordPayload {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}

export interface CaptchaChallenge {
  captchaTicket: string
  backgroundImage: string
  sliderImage: string
  y: number
  targetX: number
  expiresIn: number
}

export interface CaptchaVerifyResponse {
  captchaVerifyToken: string
  expiresIn: number
}

// 注册刷新 Token 处理器后，平台 SDK 在普通接口遇到 401 时可以自动尝试刷新一次登录态。
setRefreshTokenHandler(async () => {
  const refreshToken = getRefreshToken()
  if (!refreshToken) {
    return undefined
  }
  const result = await request<LoginResponse>({
    url: '/sys/auth/refresh',
    method: 'POST',
    body: { refreshToken }
  })
  setAccessToken(result.accessToken)
  setRefreshToken(result.refreshToken)
  return result.accessToken
})

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const result = await request<LoginResponse>({
    url: '/sys/auth/login',
    method: 'POST',
    body: payload
  })
  setAccessToken(result.accessToken)
  setRefreshToken(result.refreshToken)
  return result
}

export async function logout(): Promise<void> {
  try {
    await request<void>({ url: '/sys/auth/logout', method: 'POST' })
  } finally {
    // 无论后端退出是否成功，前端都要清理本地 Token，避免用户继续误操作。
    clearTokens()
    setCurrentUser(undefined)
  }
}

export async function loadMe(): Promise<LoginUser> {
  const user = await request<LoginUser>({ url: '/sys/auth/me' })
  setCurrentUser(user)
  return user
}

export function changePassword(payload: ChangePasswordPayload): Promise<void> {
  return request<void>({
    url: '/sys/auth/password',
    method: 'PUT',
    body: payload
  })
}

export function loadRiskState(username: string): Promise<LoginRiskState> {
  return request<LoginRiskState>({
    url: '/sys/auth/risk-state',
    params: { username }
  })
}

export function createCaptcha(username: string): Promise<CaptchaChallenge> {
  return request<CaptchaChallenge>({
    url: '/sys/auth/captcha/jigsaw',
    params: { username }
  })
}

export function verifyCaptcha(captchaTicket: string, x: number): Promise<CaptchaVerifyResponse> {
  return request<CaptchaVerifyResponse>({
    url: '/sys/auth/captcha/verify',
    method: 'POST',
    body: { captchaTicket, x, track: [x] }
  })
}

export function loadMenus(): Promise<MenuItem[]> {
  return request<MenuItem[]>({ url: '/sys/menus/tree' })
}

export function loadModules(): Promise<FrontendModule[]> {
  return request<FrontendModule[]>({ url: '/sys/frontend-modules/enabled' })
}

export function loadWorkbench(): Promise<PortalWorkbench> {
  return request<PortalWorkbench>({ url: '/sys/portal/workbench' })
}

export function recordPortalAccess(moduleCode: string, routePath: string): Promise<void> {
  return request<void>({
    url: '/sys/portal/access-log',
    method: 'POST',
    body: { moduleCode, routePath }
  })
}
