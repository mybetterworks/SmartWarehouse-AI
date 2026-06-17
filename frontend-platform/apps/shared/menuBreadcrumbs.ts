export interface BreadcrumbMenuNode {
  path?: string
  title?: string
  menuName?: string
  name?: string
  children?: BreadcrumbMenuNode[]
}

export interface ResolvedBreadcrumbItem {
  title: string
  path?: string
}

interface BreadcrumbTrailCandidate {
  trail: ResolvedBreadcrumbItem[]
  score: number
}

export function normalizeMenuPath(path?: string | null): string {
  if (!path) {
    return ''
  }

  try {
    const url = new URL(path, 'http://smartwarehouse.local')
    return trimTrailingSlash(url.pathname)
  } catch {
    return trimTrailingSlash(path)
  }
}

export function resolveMenuBreadcrumbTrail(menus: ReadonlyArray<BreadcrumbMenuNode>, currentPath: string): ResolvedBreadcrumbItem[] {
  const normalizedCurrentPath = normalizeMenuPath(currentPath)
  if (!normalizedCurrentPath) {
    return []
  }

  return findExactTrail(menus, normalizedCurrentPath) ?? findBestPrefixTrail(menus, normalizedCurrentPath)?.trail ?? []
}

function findExactTrail(items: ReadonlyArray<BreadcrumbMenuNode>, currentPath: string): ResolvedBreadcrumbItem[] | undefined {
  for (const item of items) {
    const normalizedItemPath = normalizeMenuPath(item.path)
    if (normalizedItemPath && normalizedItemPath === currentPath) {
      return [toBreadcrumbItem(item)]
    }

    const childTrail = findExactTrail(item.children ?? [], currentPath)
    if (childTrail?.length) {
      return [toBreadcrumbItem(item), ...childTrail]
    }
  }

  return undefined
}

function findBestPrefixTrail(items: ReadonlyArray<BreadcrumbMenuNode>, currentPath: string): BreadcrumbTrailCandidate | undefined {
  let bestCandidate: BreadcrumbTrailCandidate | undefined

  for (const item of items) {
    const normalizedItemPath = normalizeMenuPath(item.path)
    if (normalizedItemPath && isRoutePrefix(normalizedItemPath, currentPath)) {
      bestCandidate = chooseBetterTrail(bestCandidate, {
        trail: [toBreadcrumbItem(item)],
        score: normalizedItemPath.length
      })
    }

    const childCandidate = findBestPrefixTrail(item.children ?? [], currentPath)
    if (childCandidate) {
      bestCandidate = chooseBetterTrail(bestCandidate, {
        trail: [toBreadcrumbItem(item), ...childCandidate.trail],
        score: childCandidate.score
      })
    }
  }

  return bestCandidate
}

function chooseBetterTrail(
  current: BreadcrumbTrailCandidate | undefined,
  candidate: BreadcrumbTrailCandidate
): BreadcrumbTrailCandidate {
  if (!current) {
    return candidate
  }

  if (candidate.score !== current.score) {
    return candidate.score > current.score ? candidate : current
  }

  return candidate.trail.length > current.trail.length ? candidate : current
}

function toBreadcrumbItem(item: BreadcrumbMenuNode): ResolvedBreadcrumbItem {
  return {
    title: item.title || item.menuName || item.name || 'Unnamed menu'
  }
}

function isRoutePrefix(route: string, currentPath: string): boolean {
  if (route === currentPath) {
    return true
  }

  if (route === '/') {
    return currentPath === '/'
  }

  return currentPath.startsWith(`${route}/`)
}

function trimTrailingSlash(path: string): string {
  return path.replace(/\/+$/, '') || '/'
}
