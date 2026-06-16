import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import {
  Box,
  DataAnalysis,
  House,
  MagicStick,
  Menu as MenuIcon,
  Setting,
  WarningFilled
} from '@element-plus/icons-vue'

export function resolvePortalIcon(iconName?: string) {
  if (!iconName) {
    return MenuIcon
  }
  const directMatch = ElementPlusIconsVue[iconName as keyof typeof ElementPlusIconsVue]
  if (directMatch) {
    return directMatch
  }
  const normalizedName = iconName
    .trim()
    .replace(/(^|[-_\s]+)(\w)/g, (_, __, char: string) => char.toUpperCase())
    .replace(/[^\w]/g, '')
  return ElementPlusIconsVue[normalizedName as keyof typeof ElementPlusIconsVue] ?? MenuIcon
}

export function resolveFallbackTabIcon(moduleCode?: string, tabId?: string) {
  if (tabId === '/portal') {
    return House
  }
  switch (moduleCode) {
    case 'sys':
      return Setting
    case 'wms':
      return Box
    case 'mes':
      return DataAnalysis
    case 'ai':
      return MagicStick
    default:
      return WarningFilled
  }
}
