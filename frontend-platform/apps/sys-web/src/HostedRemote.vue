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

const props = withDefaults(
  defineProps<{
    routePath: string
    hosted?: boolean
  }>(),
  {
    hosted: true
  }
)

const sysApi = useSysManagement()
const sys = reactive(sysApi)

onMounted(async () => {
  sys.syncRoute(props.routePath)
  await sys.loadAll()
})

watch(
  () => props.routePath,
  (value) => {
    sys.syncRoute(normalizeSysRoute(value))
  }
)
</script>
