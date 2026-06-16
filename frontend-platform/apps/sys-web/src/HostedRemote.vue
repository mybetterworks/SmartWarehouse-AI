<template>
  <section class="sys-hosted">
    <SysContentView
      :active-route="sys.activeRoute"
      :active-dict-code="sys.activeDictCode"
      :state="sys.state"
      :loading="sys.loading"
      :show-toolbar="false"
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
  </section>
  <SysManagementDialogs :sys="sysApi" />
</template>

<script setup lang="ts">
import { onMounted, reactive, watch } from 'vue'
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

watch(
  () => [sys.activeRoute, sys.activeDictCode],
  () => {
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
  if (!requestedDictCode) {
    return
  }
  const matchedType = sys.state.dictTypes.some((item) => String(item.dictCode) === requestedDictCode)
  if (!matchedType || sys.activeDictCode === requestedDictCode) {
    return
  }
  sys.activeDictCode = requestedDictCode
  await sys.reloadDictItems()
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
  url.pathname = normalizeSysRoute(url.pathname)
  if (url.pathname === '/sys/dicts') {
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
  return normalizeSysRoute(url.pathname) === '/sys/dicts' ? url.searchParams.get('dictCode') ?? '' : ''
}
</script>
