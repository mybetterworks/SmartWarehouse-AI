export const validSysRoutes = [
  '/sys/users',
  '/sys/roles',
  '/sys/menus',
  '/sys/depts',
  '/sys/posts',
  '/sys/dicts',
  '/sys/modules',
  '/sys/login-logs',
  '/sys/oper-logs',
  '/sys/risk-records'
] as const

export const sysRouteAliases: Record<string, (typeof validSysRoutes)[number]> = {
  '/sys/audit': '/sys/login-logs'
}

export function normalizeSysRoute(path?: string | null): (typeof validSysRoutes)[number] {
  if (!path) {
    return '/sys/users'
  }
  const normalized = sysRouteAliases[path] ?? path
  return validSysRoutes.includes(normalized as (typeof validSysRoutes)[number]) ? (normalized as (typeof validSysRoutes)[number]) : '/sys/users'
}
