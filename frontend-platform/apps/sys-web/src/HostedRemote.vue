<template>
  <section class="sys-hosted">
    <SysContentView
      :active-route="sys.activeRoute"
      :active-dict-code="sys.activeDictCode"
      :state="sys.state"
      :menu-tree-options="sys.menuTreeOptions"
      :dept-tree-options="sys.deptTreeOptions"
      :loading="sys.loading"
      :show-toolbar="false"
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
  </section>
  <SysManagementDialogs :sys="sysApi" />
</template>

<script setup lang="ts">
import { onMounted, reactive, watch } from 'vue'
import type { SimpleRecord } from './api'
import SysManagementDialogs from './SysManagementDialogs.vue'
import SysContentView from './SysContentView.vue'
import { normalizeSysRoute } from './pages'
import { useSysManagement } from './useSysManagement'

type RouteChangePayload = {
  fullPath: string
  mode?: 'push' | 'replace'
}

const props = withDefaults(
  defineProps<{
    routePath: string
    routeFullPath?: string
    hosted?: boolean
  }>(),
  {
    routeFullPath: '',
    hosted: true
  }
)

const emit = defineEmits<{
  routeChange: [payload: RouteChangePayload]
}>()

const sysApi = useSysManagement()
const sys = reactive(sysApi)

onMounted(async () => {
  const incomingFullPath = resolveIncomingFullPath()
  syncIncomingRoute(incomingFullPath)
  await sys.loadAll()
  await restoreRequestedDictCode(incomingFullPath)
  syncHostedRoute('replace')
})

watch(
  () => props.routeFullPath || props.routePath,
  async (value) => {
    syncIncomingRoute(value)
    await restoreRequestedDictCode(value)
    syncHostedRoute('replace')
  }
)

function resolveIncomingFullPath(): string {
  return props.routeFullPath || props.routePath
}

function syncIncomingRoute(value: string): void {
  sys.syncRoute(value)
}

async function restoreRequestedDictCode(value: string): Promise<void> {
  const requestedDictCode = resolveRequestedDictCode(value)
  if (!requestedDictCode || sys.activeDictCode === requestedDictCode) {
    return
  }
  sys.activeDictCode = requestedDictCode
  await sys.reloadDictItems()
}

function handleViewDictItems(row: SimpleRecord): void {
  emit('routeChange', { fullPath: sys.openDictItemsRoute(row), mode: 'push' })
}

function handleBackToDictTypes(): void {
  emit('routeChange', { fullPath: sys.backToDictTypesRoute(), mode: 'push' })
}

function syncHostedRoute(mode: 'push' | 'replace'): void {
  if (!props.hosted) {
    return
  }
  const expectedFullPath = buildHostedFullPath()
  const incomingFullPath = normalizeIncomingFullPath(resolveIncomingFullPath())
  if (expectedFullPath === incomingFullPath) {
    return
  }
  emit('routeChange', { fullPath: expectedFullPath, mode })
}

function buildHostedFullPath(): string {
  const url = new URL(resolveIncomingFullPath() || '/sys/users', window.location.origin)
  url.pathname = sys.activeRoute
  if (sys.activeRoute === '/sys/dicts/items') {
    if (sys.activeDictCode) {
      url.searchParams.set('dictCode', sys.activeDictCode)
    } else {
      url.searchParams.delete('dictCode')
    }
  } else {
    url.searchParams.delete('dictCode')
  }
  return `${url.pathname}${url.search}${url.hash}`
}

function normalizeIncomingFullPath(value: string): string {
  const url = new URL(value || '/sys/users', window.location.origin)
  const pathname = url.pathname.startsWith('/sys') ? url.pathname.replace(/\/+$/, '') || '/sys' : normalizeSysRoute(url.pathname)
  return `${pathname}${url.search}${url.hash}`
}

function resolveRequestedDictCode(value: string): string {
  const url = new URL(value || '/sys/users', window.location.origin)
  return normalizeSysRoute(url.pathname) === '/sys/dicts/items' ? url.searchParams.get('dictCode') ?? '' : ''
}
</script>
