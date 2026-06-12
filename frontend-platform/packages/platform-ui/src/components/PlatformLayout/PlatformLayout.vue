<template>
  <div class="sw-layout" :class="{ 'sw-layout--collapsed': collapsed }">
    <aside class="sw-layout__aside">
      <div class="sw-layout__brand">
        <slot name="brand">
          <span class="sw-layout__brand-mark">SW</span>
          <span v-if="!collapsed" class="sw-layout__brand-text">{{ title }}</span>
        </slot>
      </div>
      <SideMenu :menus="menus" :active-path="activePath" :collapsed="collapsed" @menu-click="emit('menuClick', $event)" />
    </aside>

    <section class="sw-layout__main">
      <header class="sw-layout__header">
        <el-button text :icon="collapsed ? Expand : Fold" @click="toggleCollapsed" />
        <BreadcrumbNav :items="breadcrumbs" />
        <div class="sw-layout__spacer" />
        <slot name="header-actions" />
        <UserDropdown :user="user" @command="emit('userCommand', $event)" @logout="emit('logout')" />
      </header>
      <main class="sw-layout__content">
        <slot />
      </main>
    </section>
  </div>
</template>

<script setup lang="ts">
import { Expand, Fold } from '@element-plus/icons-vue'
import type { BreadcrumbItem, LoginUser, NavMenuItem } from '@smartwarehouse/platform-types'
import BreadcrumbNav from '../BreadcrumbNav/BreadcrumbNav.vue'
import SideMenu from '../SideMenu/SideMenu.vue'
import UserDropdown from '../UserDropdown/UserDropdown.vue'

// PlatformLayout 是登录后的后台外壳，只负责组织侧边栏、顶部栏、面包屑和用户入口。
// 真实路由跳转、菜单数据加载和退出登录清理都交给 portal-shell 或业务应用处理，避免布局组件绑定具体系统。
const props = withDefaults(
  defineProps<{
    title?: string
    menus?: NavMenuItem[]
    breadcrumbs?: BreadcrumbItem[]
    user?: LoginUser
    activePath?: string
    collapsed?: boolean
  }>(),
  {
    title: 'SmartWarehouse-AI',
    menus: () => [],
    breadcrumbs: () => [],
    activePath: '',
    collapsed: false
  }
)

// 对外只抛出用户意图事件，父级可以根据当前项目是 sys、wms、mes 还是 ai 决定具体动作。
const emit = defineEmits<{
  'update:collapsed': [value: boolean]
  menuClick: [menu: NavMenuItem]
  userCommand: [command: string]
  logout: []
}>()

function toggleCollapsed(): void {
  // 折叠状态采用 v-model 风格向外同步，便于外层持久化到本地配置或用户偏好。
  emit('update:collapsed', !props.collapsed)
}
</script>
