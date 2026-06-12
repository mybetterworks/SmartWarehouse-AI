import type { LoginUser } from '@smartwarehouse/platform-types'

let currentUser: LoginUser | undefined
let permissionSet = new Set<string>()
const permissionListeners = new Set<() => void>()

// 权限状态不是 Vue ref，因此用订阅通知让 PermissionButton 等组件在登录/切换用户后主动刷新。
function notifyPermissionChanged(): void {
  permissionListeners.forEach((listener) => listener())
}

// 登录成功或刷新用户信息后调用，统一更新当前用户、角色和按钮权限集合。
export function setCurrentUser(user: LoginUser | undefined): void {
  currentUser = user
  permissionSet = new Set(user?.permissions ?? [])
  notifyPermissionChanged()
}

export function getCurrentUser(): LoginUser | undefined {
  return currentUser
}

export function setPermissions(permissions: string[]): void {
  permissionSet = new Set(permissions)
  notifyPermissionChanged()
}

export function getPermissions(): string[] {
  return Array.from(permissionSet)
}

// permission 支持字符串或数组；数组语义为“满足任意一个权限即可显示/启用”。
export function hasPermission(permission?: string | string[]): boolean {
  if (!permission || (Array.isArray(permission) && permission.length === 0)) {
    return true
  }

  const values = Array.isArray(permission) ? permission : [permission]
  return values.some((item) => permissionSet.has(item))
}

// 角色判断与权限判断分开，便于页面同时支持菜单权限、按钮权限和角色兜底逻辑。
export function hasRole(role?: string | string[]): boolean {
  if (!role) {
    return true
  }

  const roles = currentUser?.roles ?? []
  const values = Array.isArray(role) ? role : [role]
  return values.some((item) => roles.includes(item))
}

// 返回取消订阅函数，组件卸载时必须调用，避免长期打开后台页面产生无效监听。
export function subscribePermissionChange(listener: () => void): () => void {
  permissionListeners.add(listener)
  return () => {
    permissionListeners.delete(listener)
  }
}
