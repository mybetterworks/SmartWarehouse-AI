<template>
  <PlatformLayout
    v-model:collapsed="collapsed"
    title="SmartWarehouse-AI"
    :menus="standaloneMenus"
    :breadcrumbs="sys.breadcrumbs"
    :user="user"
    :active-path="sys.activeRoute"
    :show-workbench-button="false"
    :show-module-drawer-trigger="false"
    @logout="emit('logout')"
    @breadcrumb-click="handleBreadcrumbClick"
    @user-command="sys.handleUserCommand"
    @menu-click="handleMenuClick"
  >
    <SysContentView
      :active-route="sys.activeRoute"
      :active-dict-code="sys.activeDictCode"
      :state="sys.state"
      :loading="sys.loading"
      :show-toolbar="true"
      :user-columns="sys.userColumns"
      :role-columns="sys.roleColumns"
      :menu-columns="sys.menuColumns"
      :dept-columns="sys.deptColumns"
      :post-columns="sys.postColumns"
      :dict-columns="sys.dictColumns"
      :dict-item-columns="sys.dictItemColumns"
      :module-columns="sys.moduleColumns"
      :login-log-columns="sys.loginLogColumns"
      :oper-log-columns="sys.operLogColumns"
      :risk-columns="sys.riskColumns"
      @refresh="sys.loadAll"
      @update:active-dict-code="sys.activeDictCode = $event"
      @change-dict="sys.reloadDictItems"
      @create-user="sys.openUserDialog()"
      @edit-user="sys.openUserDialog"
      @warehouse-user="sys.openPermissionDialog"
      @delete-user="sys.deleteUser"
      @create-role="sys.openRoleDialog()"
      @edit-role="sys.openRoleDialog"
      @role-menus="sys.openRoleMenuDialog"
      @delete-role="sys.deleteRole"
      @create-menu="sys.openMenuDialog()"
      @edit-menu="sys.openMenuDialog"
      @delete-menu="sys.deleteMenu"
      @create-dept="sys.openDeptDialog()"
      @edit-dept="sys.openDeptDialog"
      @delete-dept="sys.deleteDept"
      @create-post="sys.openPostDialog()"
      @edit-post="sys.openPostDialog"
      @delete-post="sys.deletePost"
      @create-dict-type="sys.openDictTypeDialog()"
      @edit-dict-type="sys.openDictTypeDialog"
      @delete-dict-type="sys.deleteDictType"
      @create-dict-item="sys.openDictItemDialog()"
      @edit-dict-item="sys.openDictItemDialog"
      @delete-dict-item="sys.deleteDictItem"
      @create-module="sys.openModuleDialog()"
      @edit-module="sys.openModuleDialog"
      @delete-module="sys.deleteModule"
    />
  </PlatformLayout>
  <SysManagementDialogs :user="user" :sys="sysApi" />
</template>

<script setup lang="ts">
import { PlatformLayout } from '@smartwarehouse/platform-ui'
import type { BreadcrumbItem, LoginUser, MenuItem, NavMenuItem } from '@smartwarehouse/platform-types'
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import SysContentView from './SysContentView.vue'
import SysManagementDialogs from './SysManagementDialogs.vue'
import { resolveSysLocationFromLocation, useSysManagement } from './useSysManagement'

const props = defineProps<{
  user: LoginUser
  menus: MenuItem[]
}>()

const emit = defineEmits<{
  logout: []
}>()

const collapsed = ref(false)
const sysApi = useSysManagement()
const sys = reactive(sysApi)
const standaloneMenus = computed<NavMenuItem[]>(() => {
  const resolved = sys.resolveSysMenus(props.menus)
  return resolved.length ? resolved : sys.sysMenus
})

onMounted(async () => {
  sys.syncRoute(resolveSysLocationFromLocation())
  await sys.loadAll()
  window.addEventListener('popstate', syncCurrentRoute)
})

onUnmounted(() => {
  window.removeEventListener('popstate', syncCurrentRoute)
})

function handleMenuClick(menu: NavMenuItem): void {
  const nextPath = menu.path || '/sys/users'
  sys.syncRoute(nextPath)
  writeActiveRouteToLocation(nextPath)
}

function handleBreadcrumbClick(item: BreadcrumbItem): void {
  if (!item.path) {
    return
  }
  sys.syncRoute(item.path)
  writeActiveRouteToLocation(item.path)
}

function syncCurrentRoute(): void {
  sys.syncRoute(resolveSysLocationFromLocation())
}

function writeActiveRouteToLocation(path: string): void {
  if (window.location.pathname === '/sys' || window.location.pathname.startsWith('/sys/')) {
    window.history.pushState(null, '', path)
    return
  }
  const url = new URL(window.location.href)
  url.searchParams.set('redirect', path)
  window.history.replaceState(null, '', url.toString())
}
</script>
