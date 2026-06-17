<template>
  <PlatformLayout
    v-model:collapsed="collapsed"
    title="SmartWarehouse-AI"
    :menus="standaloneMenus"
    :breadcrumbs="breadcrumbs"
    :user="user"
    :active-path="layoutActivePath"
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
      :menu-tree-options="sys.menuTreeOptions"
      :dept-tree-options="sys.deptTreeOptions"
      :loading="sys.loading"
      :show-toolbar="true"
      :user-query="sys.userQuery"
      :role-query="sys.roleQuery"
      :menu-query="sys.menuQuery"
      :dept-query="sys.deptQuery"
      :post-query="sys.postQuery"
      :dict-type-query="sys.dictTypeQuery"
      :dict-item-query="sys.dictItemQuery"
      :module-query="sys.moduleQuery"
      :login-log-query="sys.loginLogQuery"
      :oper-log-query="sys.operLogQuery"
      :risk-record-query="sys.riskRecordQuery"
      :user-pagination="sys.userPagination"
      :role-pagination="sys.rolePagination"
      :menu-pagination="sys.menuPagination"
      :dept-pagination="sys.deptPagination"
      :post-pagination="sys.postPagination"
      :dict-type-pagination="sys.dictTypePagination"
      :dict-item-pagination="sys.dictItemPagination"
      :module-pagination="sys.modulePagination"
      :login-log-pagination="sys.loginLogPagination"
      :oper-log-pagination="sys.operLogPagination"
      :risk-record-pagination="sys.riskRecordPagination"
      :user-selection-count="sys.userSelectionCount"
      :role-selection-count="sys.roleSelectionCount"
      :post-selection-count="sys.postSelectionCount"
      :dict-type-selection-count="sys.dictTypeSelectionCount"
      :dict-item-selection-count="sys.dictItemSelectionCount"
      :module-selection-count="sys.moduleSelectionCount"
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
      @search-users="sys.searchUsers"
      @reset-users="sys.resetUserQuery"
      @delete-selected-users="sys.deleteSelectedUsers"
      @user-page-change="sys.handleUserPageChange"
      @user-selection-change="sys.handleUserSelectionChange"
      @search-roles="sys.searchRoles"
      @reset-roles="sys.resetRoleQuery"
      @role-page-change="sys.handleRolePageChange"
      @role-selection-change="sys.handleRoleSelectionChange"
      @delete-selected-roles="sys.deleteSelectedRoles"
      @search-menus="sys.searchMenus"
      @reset-menus="sys.resetMenuQuery"
      @menu-page-change="sys.handleMenuPageChange"
      @create-user="sys.openUserDialog()"
      @edit-user="sys.openUserDialog"
      @warehouse-user="sys.openPermissionDialog"
      @delete-user="sys.deleteUser"
      @create-role="sys.openRoleDialog()"
      @edit-role="sys.openRoleDialog"
      @role-menus="sys.openRoleMenuDialog"
      @delete-role="sys.deleteRole"
      @create-menu="sys.openMenuDialog()"
      @create-child-menu="sys.openMenuChildDialog"
      @edit-menu="sys.openMenuDialog"
      @delete-menu="sys.deleteMenu"
      @search-depts="sys.searchDepts"
      @reset-depts="sys.resetDeptQuery"
      @dept-page-change="sys.handleDeptPageChange"
      @create-dept="sys.openDeptDialog()"
      @create-child-dept="sys.openDeptChildDialog"
      @edit-dept="sys.openDeptDialog"
      @delete-dept="sys.deleteDept"
      @search-posts="sys.searchPosts"
      @reset-posts="sys.resetPostQuery"
      @post-page-change="sys.handlePostPageChange"
      @post-selection-change="sys.handlePostSelectionChange"
      @create-post="sys.openPostDialog()"
      @delete-selected-posts="sys.deleteSelectedPosts"
      @edit-post="sys.openPostDialog"
      @delete-post="sys.deletePost"
      @search-dict-types="sys.searchDictTypes"
      @reset-dict-types="sys.resetDictTypeQuery"
      @dict-type-page-change="sys.handleDictTypePageChange"
      @dict-type-selection-change="sys.handleDictTypeSelectionChange"
      @create-dict-type="sys.openDictTypeDialog()"
      @delete-selected-dict-types="sys.deleteSelectedDictTypes"
      @edit-dict-type="sys.openDictTypeDialog"
      @view-dict-items="handleViewDictItems"
      @delete-dict-type="sys.deleteDictType"
      @search-dict-items="sys.searchDictItems"
      @reset-dict-items="sys.resetDictItemQuery"
      @dict-item-page-change="sys.handleDictItemPageChange"
      @dict-item-selection-change="sys.handleDictItemSelectionChange"
      @create-dict-item="sys.openDictItemDialog()"
      @delete-selected-dict-items="sys.deleteSelectedDictItems"
      @edit-dict-item="sys.openDictItemDialog"
      @delete-dict-item="sys.deleteDictItem"
      @back-to-dict-types="handleBackToDictTypes"
      @search-modules="sys.searchModules"
      @reset-modules="sys.resetModuleQuery"
      @module-page-change="sys.handleModulePageChange"
      @module-selection-change="sys.handleModuleSelectionChange"
      @create-module="sys.openModuleDialog()"
      @delete-selected-modules="sys.deleteSelectedModules"
      @edit-module="sys.openModuleDialog"
      @delete-module="sys.deleteModule"
      @search-login-logs="sys.searchLoginLogs"
      @reset-login-logs="sys.resetLoginLogQuery"
      @login-log-page-change="sys.handleLoginLogPageChange"
      @search-oper-logs="sys.searchOperLogs"
      @reset-oper-logs="sys.resetOperLogQuery"
      @oper-log-page-change="sys.handleOperLogPageChange"
      @search-risk-records="sys.searchRiskRecords"
      @reset-risk-records="sys.resetRiskRecordQuery"
      @risk-record-page-change="sys.handleRiskRecordPageChange"
    />
  </PlatformLayout>
  <SysManagementDialogs :user="user" :sys="sysApi" />
</template>

<script setup lang="ts">
import { PlatformLayout } from '@smartwarehouse/platform-ui'
import type { BreadcrumbItem, LoginUser, MenuItem, NavMenuItem } from '@smartwarehouse/platform-types'
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { normalizeMenuPath, resolveMenuBreadcrumbTrail, type BreadcrumbMenuNode } from '../../shared/menuBreadcrumbs'
import type { SimpleRecord } from './api'
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

const layoutActivePath = computed(() => (sys.activeRoute === '/sys/dicts/items' ? '/sys/dicts' : sys.activeRoute))

const breadcrumbMenus = computed<BreadcrumbMenuNode[]>(() => {
  const sysModuleMenus = props.menus.filter((item) => item.moduleCode === 'sys')
  if (sysModuleMenus.length) {
    return sysModuleMenus.some((item) => normalizeMenuPath(item.path) === '/sys')
      ? sysModuleMenus
      : [createSysRootMenu(sysModuleMenus)]
  }
  return [createSysRootMenu(sys.sysMenus.map(toBreadcrumbMenuNode))]
})

const breadcrumbs = computed<BreadcrumbItem[]>(() => {
  const trail = resolveMenuBreadcrumbTrail(breadcrumbMenus.value, sys.activeRoute)
  if (!trail.length) {
    return [{ title: '系统管理' }]
  }
  return trail[0]?.title === '系统管理' ? trail : [{ title: '系统管理' }, ...trail]
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
  applyInternalRoute(nextPath)
}

function handleBreadcrumbClick(item: BreadcrumbItem): void {
  if (!item.path) {
    return
  }
  applyInternalRoute(item.path)
}

function handleViewDictItems(row: SimpleRecord): void {
  applyInternalRoute(sys.openDictItemsRoute(row))
  void sys.reloadDictItems()
}

function handleBackToDictTypes(): void {
  applyInternalRoute(sys.backToDictTypesRoute())
}

function syncCurrentRoute(): void {
  sys.syncRoute(resolveSysLocationFromLocation())
}

function applyInternalRoute(fullPath: string): void {
  sys.syncRoute(fullPath)
  writeActiveRouteToLocation(fullPath)
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

function createSysRootMenu(children: BreadcrumbMenuNode[]): BreadcrumbMenuNode {
  return {
    title: '系统管理',
    path: '/sys',
    children
  }
}

function toBreadcrumbMenuNode(menu: NavMenuItem): BreadcrumbMenuNode {
  return {
    title: menu.title,
    path: menu.path,
    children: menu.children?.map(toBreadcrumbMenuNode)
  }
}
</script>
