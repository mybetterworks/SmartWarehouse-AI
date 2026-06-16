export interface PortalTabRecord {
  id: string
  fullPath: string
  title: string
  icon?: string
  moduleCode?: string
  closable: boolean
  cacheable: boolean
}

export interface PortalTabSnapshot {
  version: 1
  activeTabId: string
  tabs: PortalTabRecord[]
}

export const WORKBENCH_TAB_ID = '/portal'
const STORAGE_VERSION = 1

export function createWorkbenchTab(): PortalTabRecord {
  return {
    id: WORKBENCH_TAB_ID,
    fullPath: WORKBENCH_TAB_ID,
    title: '平台工作台',
    icon: 'House',
    closable: false,
    cacheable: true
  }
}

export function loadPortalTabSnapshot(storageKey: string): PortalTabSnapshot | undefined {
  if (!storageKey || !canUseStorage()) {
    return undefined
  }
  try {
    const raw = window.localStorage.getItem(storageKey)
    if (!raw) {
      return undefined
    }
    const parsed = JSON.parse(raw) as Partial<PortalTabSnapshot>
    if (parsed.version !== STORAGE_VERSION) {
      return undefined
    }
    return {
      version: STORAGE_VERSION,
      activeTabId: typeof parsed.activeTabId === 'string' ? parsed.activeTabId : WORKBENCH_TAB_ID,
      tabs: sanitizePortalTabs(parsed.tabs)
    }
  } catch {
    return undefined
  }
}

export function savePortalTabSnapshot(storageKey: string, tabs: PortalTabRecord[], activeTabId: string): void {
  if (!storageKey || !canUseStorage()) {
    return
  }
  const snapshot: PortalTabSnapshot = {
    version: STORAGE_VERSION,
    activeTabId,
    tabs
  }
  window.localStorage.setItem(storageKey, JSON.stringify(snapshot))
}

export function sanitizePortalTabs(value: unknown): PortalTabRecord[] {
  if (!Array.isArray(value)) {
    return []
  }
  return value
    .map((item) => sanitizePortalTab(item))
    .filter((item): item is PortalTabRecord => Boolean(item))
}

function sanitizePortalTab(value: unknown): PortalTabRecord | undefined {
  if (!value || typeof value !== 'object') {
    return undefined
  }
  const candidate = value as Partial<PortalTabRecord>
  if (typeof candidate.id !== 'string' || typeof candidate.fullPath !== 'string' || typeof candidate.title !== 'string') {
    return undefined
  }
  return {
    id: candidate.id,
    fullPath: candidate.fullPath,
    title: candidate.title,
    icon: typeof candidate.icon === 'string' ? candidate.icon : undefined,
    moduleCode: typeof candidate.moduleCode === 'string' ? candidate.moduleCode : undefined,
    closable: candidate.closable !== false,
    cacheable: candidate.cacheable !== false
  }
}

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}
