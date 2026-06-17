export const validSysRoutes = [
  '/sys/users',
  '/sys/roles',
  '/sys/menus',
  '/sys/depts',
  '/sys/posts',
  '/sys/dicts',
  '/sys/dicts/items',
  '/sys/modules',
  '/sys/login-logs',
  '/sys/oper-logs',
  '/sys/risk-records'
] as const

export type ValidSysRoute = (typeof validSysRoutes)[number]

export const sysRouteAliases: Record<string, (typeof validSysRoutes)[number]> = {
  '/sys/audit': '/sys/login-logs'
}

export function normalizeSysRoute(path?: string | null): ValidSysRoute {
  if (!path) {
    return '/sys/users'
  }
  const normalized = sysRouteAliases[path] ?? path
  return validSysRoutes.includes(normalized as ValidSysRoute) ? (normalized as ValidSysRoute) : '/sys/users'
}
