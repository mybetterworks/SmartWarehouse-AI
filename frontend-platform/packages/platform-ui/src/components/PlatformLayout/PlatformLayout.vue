<template>
  <div class="sw-layout" :class="layoutClasses">
    <aside v-if="showAside" class="sw-layout__aside">
      <div class="sw-layout__brand">
        <slot name="brand">
          <span class="sw-layout__brand-mark">SW</span>
          <span v-if="!collapsed" class="sw-layout__brand-text">{{ brandText }}</span>
        </slot>
      </div>
      <div class="sw-layout__aside-menu">
        <SideMenu :menus="menus" :active-path="activePath" :collapsed="collapsed" @menu-click="emit('menuClick', $event)" />
      </div>
      <button
        type="button"
        class="sw-layout__aside-toggle"
        :class="{ 'sw-layout__aside-toggle--collapsed': collapsed }"
        :aria-label="collapsed ? 'Expand sidebar' : 'Collapse sidebar'"
        @click="toggleCollapsed"
      >
        <span class="sw-layout__aside-toggle-pill" aria-hidden="true">
          <span class="sw-layout__aside-toggle-icon">
            <component :is="collapsed ? ArrowRight : ArrowLeft" />
          </span>
        </span>
      </button>
    </aside>

    <section class="sw-layout__main">
      <header class="sw-layout__header">
        <div class="sw-layout__header-left">
          <div v-if="showHeaderBrand" class="sw-layout__header-brand">
            <span class="sw-layout__brand-mark">SW</span>
            <span class="sw-layout__header-brand-text">{{ brandText }}</span>
            <el-button
              v-if="showModuleDrawerTrigger"
              class="sw-layout__header-button sw-layout__header-button--menu"
              text
              @click="moduleDrawerVisible = true"
            >
              <span aria-hidden="true">&#8801;</span>
            </el-button>
          </div>
          <el-button
            v-else-if="showModuleDrawerTrigger"
            class="sw-layout__header-button sw-layout__header-button--menu"
            text
            @click="moduleDrawerVisible = true"
          >
            <span aria-hidden="true">&#8801;</span>
          </el-button>
          <BreadcrumbNav :items="breadcrumbs" @item-click="handleBreadcrumbClick" />
        </div>
        <div class="sw-layout__spacer" />
        <div class="sw-layout__header-actions">
          <el-button v-if="showWorkbenchButton" class="sw-layout__workbench-button" type="primary" plain @click="emit('workbenchClick')">
            工作台
          </el-button>
          <slot name="header-actions" />
          <UserDropdown :user="user" @command="emit('userCommand', $event)" @logout="emit('logout')" />
        </div>
      </header>
      <main class="sw-layout__content">
        <slot />
      </main>
    </section>
  </div>

  <el-drawer
    v-model="moduleDrawerVisible"
    class="sw-layout__module-drawer"
    direction="ltr"
    size="min(760px, 100%)"
    :with-header="false"
    append-to-body
  >
    <section class="sw-layout__drawer-shell">
      <header class="sw-layout__drawer-header">
        <div>
          <p class="sw-layout__drawer-eyebrow">Modules</p>
          <h2>全部模块</h2>
        </div>
        <el-button text :icon="Close" @click="moduleDrawerVisible = false" />
      </header>
      <el-input v-model="moduleKeyword" class="sw-layout__drawer-search" placeholder="搜索模块名称、编码或路由" clearable />
      <div v-if="showWorkbenchDrawerButton" class="sw-layout__drawer-actions">
        <el-button class="sw-layout__drawer-workbench" type="primary" plain @click="handleWorkbenchClick">
          返回工作台
        </el-button>
      </div>
      <div class="sw-layout__drawer-grid">
        <button
          v-for="module in filteredModuleEntries"
          :key="module.moduleCode"
          type="button"
          class="sw-layout__module-card"
          :class="{ 'sw-layout__module-card--active': module.moduleCode === activeModuleCode }"
          @click="selectModule(module)"
        >
          <div class="sw-layout__module-card-head">
            <span class="sw-layout__module-badge">{{ module.moduleCode.toUpperCase() }}</span>
            <span class="sw-layout__module-owner">{{ module.ownerType === 'OWNER' ? 'OWNER' : 'VENDOR' }}</span>
          </div>
          <h3>{{ module.moduleName }}</h3>
          <p>{{ module.routePrefix }}</p>
        </button>
        <div v-if="!filteredModuleEntries.length" class="sw-layout__module-empty">
          没有匹配的模块
        </div>
      </div>
    </section>
  </el-drawer>
</template>

<script setup lang="ts">
import { ArrowLeft, ArrowRight, Close } from '@element-plus/icons-vue'
import type { BreadcrumbItem, FrontendModule, LoginUser, NavMenuItem } from '@smartwarehouse/platform-types'
import { computed, ref } from 'vue'
import BreadcrumbNav from '../BreadcrumbNav/BreadcrumbNav.vue'
import SideMenu from '../SideMenu/SideMenu.vue'
import UserDropdown from '../UserDropdown/UserDropdown.vue'

const props = withDefaults(
  defineProps<{
    title?: string
    menus?: NavMenuItem[]
    breadcrumbs?: BreadcrumbItem[]
    user?: LoginUser
    activePath?: string
    collapsed?: boolean
    showAside?: boolean
    brandAbbr?: string
    showWorkbenchButton?: boolean
    showWorkbenchDrawerButton?: boolean
    showModuleDrawerTrigger?: boolean
    moduleEntries?: FrontendModule[]
    activeModuleCode?: string
  }>(),
  {
    title: 'SmartWarehouse-AI',
    menus: () => [],
    breadcrumbs: () => [],
    activePath: '',
    collapsed: false,
    showAside: true,
    brandAbbr: '',
    showWorkbenchButton: false,
    showWorkbenchDrawerButton: false,
    showModuleDrawerTrigger: false,
    moduleEntries: () => [],
    activeModuleCode: ''
  }
)

const emit = defineEmits<{
  'update:collapsed': [value: boolean]
  menuClick: [menu: NavMenuItem]
  userCommand: [command: string]
  logout: []
  workbenchClick: []
  breadcrumbClick: [item: BreadcrumbItem]
  moduleSelect: [module: FrontendModule]
}>()

const moduleDrawerVisible = ref(false)
const moduleKeyword = ref('')

const layoutClasses = computed(() => ({
  'sw-layout--collapsed': props.collapsed,
  'sw-layout--no-aside': !props.showAside
}))

const showHeaderBrand = computed(() => !props.showAside)
const brandText = computed(() => props.brandAbbr || props.title)

const filteredModuleEntries = computed(() => {
  const keyword = moduleKeyword.value.trim().toLowerCase()
  if (!keyword) {
    return props.moduleEntries
  }
  return props.moduleEntries.filter((item) =>
    [item.moduleCode, item.moduleName, item.routePrefix]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(keyword))
  )
})

function toggleCollapsed(): void {
  emit('update:collapsed', !props.collapsed)
}

function handleWorkbenchClick(): void {
  moduleDrawerVisible.value = false
  emit('workbenchClick')
}

function handleBreadcrumbClick(item: BreadcrumbItem): void {
  if (item.path === '/portal') {
    handleWorkbenchClick()
    return
  }
  emit('breadcrumbClick', item)
}

function selectModule(module: FrontendModule): void {
  moduleDrawerVisible.value = false
  emit('moduleSelect', module)
}
</script>
