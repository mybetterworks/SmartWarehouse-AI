<template>
  <el-menu
    class="sw-side-menu"
    :default-active="activePath"
    :default-openeds="defaultOpeneds"
    :collapse="collapsed"
    :collapse-transition="false"
    @select="handleSelect"
  >
    <SideMenuNode
      v-for="menu in visibleMenus"
      :key="menu.id"
      :menu="menu"
      :resolve-menu-icon="resolveMenuIcon"
      @menu-click="emit('menuClick', $event)"
    />
  </el-menu>
</template>

<script setup lang="ts">
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { Menu as MenuIcon } from '@element-plus/icons-vue'
import type { NavMenuItem } from '@smartwarehouse/platform-types'
import { computed } from 'vue'
import SideMenuNode from './SideMenuNode.vue'

const props = withDefaults(
  defineProps<{
    menus?: NavMenuItem[]
    activePath?: string
    collapsed?: boolean
  }>(),
  {
    menus: () => [],
    activePath: '',
    collapsed: false
  }
)

const emit = defineEmits<{
  menuClick: [menu: NavMenuItem]
  select: [path: string]
}>()

const visibleMenus = computed(() => buildVisibleMenus(props.menus))

const defaultOpeneds = computed(() => {
  if (props.collapsed || !props.activePath) {
    return []
  }
  return findMenuPathChain(visibleMenus.value, props.activePath).slice(0, -1)
})

function handleSelect(path: string): void {
  emit('select', path)
}

function resolveMenuIcon(iconName?: string) {
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

function buildVisibleMenus(menus: NavMenuItem[]): NavMenuItem[] {
  return menus
    .filter((item) => item.visible !== false)
    .map((item) => ({
      ...item,
      children: item.children?.length ? buildVisibleMenus(item.children) : undefined
    }))
}

function findMenuPathChain(menus: NavMenuItem[], targetPath: string, parents: string[] = []): string[] {
  for (const menu of menus) {
    const currentChain = [...parents, menu.path]
    if (menu.path === targetPath) {
      return currentChain
    }
    if (!menu.children?.length) {
      continue
    }
    const matchedChain = findMenuPathChain(menu.children, targetPath, currentChain)
    if (matchedChain.length) {
      return matchedChain
    }
  }
  return []
}
</script>
