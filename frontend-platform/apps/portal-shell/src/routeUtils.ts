import type { FrontendModule } from '@smartwarehouse/platform-types'

export function normalizePortalPath(path?: string | null): string {
  if (!path || path === '/') {
    return '/portal'
  }
  const normalized = path.startsWith('/') ? path : `/${path}`
  return normalized.replace(/\/+$/, '') || '/portal'
}

export function normalizePortalFullPath(input?: string | null): string {
  if (!input) {
    return '/portal'
  }
  const url = new URL(input, window.location.origin)
  const pathname = normalizePortalPath(url.pathname)
  return `${pathname}${url.search}${url.hash}`
}

export function extractPortalPath(fullPath: string): string {
  return new URL(normalizePortalFullPath(fullPath), window.location.origin).pathname
}

export function getBrowserFullPath(): string {
  return normalizePortalFullPath(`${window.location.pathname}${window.location.search}${window.location.hash}`)
}

export function isRouteInModule(pathOrFullPath: string, module: FrontendModule): boolean {
  const pathname = extractPortalPath(pathOrFullPath)
  const prefix = normalizePortalPath(module.routePrefix || `/${module.moduleCode}`)
  return pathname === prefix || pathname.startsWith(`${prefix}/`)
}

export function resolveModuleRoute(module: FrontendModule, targetPath?: string): string {
  const moduleRoot = normalizePortalPath(module.routePrefix || `/${module.moduleCode}`)
  if (targetPath) {
    const normalizedTarget = normalizePortalFullPath(targetPath)
    if (normalizedTarget !== moduleRoot) {
      return normalizedTarget
    }
  }
  if (module.moduleCode === 'sys') {
    return '/sys/users'
  }
  return moduleRoot
}
