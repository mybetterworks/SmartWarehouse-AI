import type { FrontendModule, ModuleCode } from '@smartwarehouse/platform-types'
import type { Component } from 'vue'
import {
  __federation_method_getRemote,
  __federation_method_setRemote,
  __federation_method_unwrapDefault
} from 'virtual:__federation__'

export interface MicroFrontendModule {
  moduleCode: ModuleCode
  moduleName: string
  routePrefix: string
  remoteName: string
  remoteEntry: string
  exposedModule: string
}

interface RemoteFallback {
  remoteName: string
  remoteEntry: string
  exposedModule: string
}

const MICRO_FRONTEND_MODULES = new Set<ModuleCode>(['sys', 'wms', 'mes', 'ai'])

const LOCAL_REMOTE_FALLBACKS: Record<string, RemoteFallback> = {
  sys: {
    remoteName: 'smart_sys_web',
    remoteEntry: 'http://localhost:5175/apps/sys/assets/remoteEntry.js',
    exposedModule: './RemoteApp'
  },
  wms: {
    remoteName: 'smart_wms_web',
    remoteEntry: 'http://localhost:5176/apps/wms/assets/remoteEntry.js',
    exposedModule: './RemoteApp'
  },
  mes: {
    remoteName: 'smart_mes_web',
    remoteEntry: 'http://localhost:5177/apps/mes/assets/remoteEntry.js',
    exposedModule: './RemoteApp'
  },
  ai: {
    remoteName: 'smart_ai_web',
    remoteEntry: 'http://localhost:5178/apps/ai/assets/remoteEntry.js',
    exposedModule: './RemoteApp'
  }
}

const componentCache = new Map<string, Component>()

export function isMicroFrontendModule(module: FrontendModule): boolean {
  return MICRO_FRONTEND_MODULES.has(module.moduleCode)
}

export function toMicroFrontendModule(module: FrontendModule): MicroFrontendModule {
  const fallback = LOCAL_REMOTE_FALLBACKS[module.moduleCode]
  const remoteEntry = resolveRemoteEntry(module, fallback)
  return {
    moduleCode: module.moduleCode,
    moduleName: module.moduleName,
    routePrefix: module.routePrefix || `/${module.moduleCode}`,
    remoteName: module.remoteName || fallback.remoteName,
    remoteEntry,
    exposedModule: module.exposedModule || fallback.exposedModule
  }
}

export async function loadRemoteComponent(module: MicroFrontendModule): Promise<Component> {
  const cacheKey = `${module.remoteName}:${module.remoteEntry}:${module.exposedModule}`
  const cached = componentCache.get(cacheKey)
  if (cached) {
    return cached
  }

  // 每次加载前重新注册 remote，URL 带时间戳防止浏览器缓存
  // __federation_method_setRemote 会覆盖插件内部的上次注册状态
  __federation_method_setRemote(module.remoteName, {
    url: () => Promise.resolve(`${module.remoteEntry}?t=${Date.now()}`),  // 函数形式，每次都走网络
    format: 'esm',
    from: 'vite'
  })
  const remoteModule = await __federation_method_getRemote(module.remoteName, module.exposedModule)
  const component = __federation_method_unwrapDefault(remoteModule) as Component
  componentCache.set(cacheKey, component)
  return component
}

function resolveRemoteEntry(module: FrontendModule, fallback: RemoteFallback): string {
  if (module.remoteEntry) {
    return normalizeRemoteUrl(module.remoteEntry)
  }
  if (module.entryUrl && isRemoteEntry(module.entryUrl)) {
    return normalizeRemoteUrl(module.entryUrl)
  }
  return fallback.remoteEntry
}

function isRemoteEntry(url: string): boolean {
  return /remoteEntry\.js(?:[?#].*)?$/i.test(url)
}

function normalizeRemoteUrl(url: string): string {
  return new URL(url, window.location.origin).toString()
}
