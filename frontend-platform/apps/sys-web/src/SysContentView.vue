<template>
  <PlatformPage :title="resolvedTitle" :description="resolvedDescription" :class="{ 'sys-content-page--plain': isUserRoute }">
    <template v-if="showPageToolbar" #toolbar>
      <el-button type="primary" :loading="loading" @click="emit('refresh')">刷新数据</el-button>
    </template>

    <UserManagementView
      v-if="activeRoute === '/sys/users'"
      :columns="userColumns"
      :loading="loading"
      :query="userQuery"
      :pagination="userPagination"
      :selected-count="userSelectionCount"
      :users="state.users"
      @search="emit('searchUsers')"
      @reset="emit('resetUsers')"
      @create="emit('createUser')"
      @delete-selected="emit('deleteSelectedUsers')"
      @page-change="emit('userPageChange', $event)"
      @selection-change="emit('userSelectionChange', $event)"
      @edit="emit('editUser', $event)"
      @warehouse="emit('warehouseUser', $event)"
      @delete="emit('deleteUser', $event)"
    />
    <RoleManagementView
      v-else-if="activeRoute === '/sys/roles'"
      :columns="roleColumns"
      :roles="state.roles"
      @create="emit('createRole')"
      @edit="emit('editRole', $event)"
      @menus="emit('roleMenus', $event)"
      @delete="emit('deleteRole', $event)"
    />
    <MenuManagementView
      v-else-if="activeRoute === '/sys/menus'"
      :columns="menuColumns"
      :menus="state.menus"
      @create="emit('createMenu')"
      @edit="emit('editMenu', $event)"
      @delete="emit('deleteMenu', $event)"
    />
    <DeptManagementView
      v-else-if="activeRoute === '/sys/depts'"
      :columns="deptColumns"
      :depts="state.depts"
      @create-dept="emit('createDept')"
      @edit-dept="emit('editDept', $event)"
      @delete-dept="emit('deleteDept', $event)"
    />
    <PostManagementView
      v-else-if="activeRoute === '/sys/posts'"
      :columns="postColumns"
      :posts="state.posts"
      @create-post="emit('createPost')"
      @edit-post="emit('editPost', $event)"
      @delete-post="emit('deletePost', $event)"
    />
    <DictManagementView
      v-else-if="activeRoute === '/sys/dicts'"
      :active-dict-code="activeDictCode"
      :dict-columns="dictColumns"
      :dict-item-columns="dictItemColumns"
      :dict-types="state.dictTypes"
      :dict-items="state.dictItems"
      @update:active-dict-code="emit('update:activeDictCode', $event)"
      @change-dict="emit('changeDict')"
      @create-type="emit('createDictType')"
      @edit-type="emit('editDictType', $event)"
      @delete-type="emit('deleteDictType', $event)"
      @create-item="emit('createDictItem')"
      @edit-item="emit('editDictItem', $event)"
      @delete-item="emit('deleteDictItem', $event)"
    />
    <FrontendModuleManagementView
      v-else-if="activeRoute === '/sys/modules'"
      :columns="moduleColumns"
      :modules="state.modules"
      @create="emit('createModule')"
      @edit="emit('editModule', $event)"
      @delete="emit('deleteModule', $event)"
    />
    <AuditLogView v-else-if="activeRoute === '/sys/login-logs'" :columns="loginLogColumns" :records="state.loginLogs" />
    <AuditLogView v-else-if="activeRoute === '/sys/oper-logs'" :columns="operLogColumns" :records="state.operLogs" />
    <RiskRecordView v-else :columns="riskColumns" :risk-records="state.riskRecords" />
  </PlatformPage>
</template>

<script setup lang="ts">
import { PlatformPage } from '@smartwarehouse/platform-ui'
import type { TableColumn, TablePagination } from '@smartwarehouse/platform-types'
import { computed } from 'vue'
import type { RoleView, SimpleRecord, SysPageState, TreeNodeView, UserListQuery, UserView } from './api'
import AuditLogView from './views/AuditLogView.vue'
import DeptManagementView from './views/DeptManagementView.vue'
import DictManagementView from './views/DictManagementView.vue'
import FrontendModuleManagementView from './views/FrontendModuleManagementView.vue'
import MenuManagementView from './views/MenuManagementView.vue'
import PostManagementView from './views/PostManagementView.vue'
import RiskRecordView from './views/RiskRecordView.vue'
import RoleManagementView from './views/RoleManagementView.vue'
import UserManagementView from './views/UserManagementView.vue'

const props = defineProps<{
  activeRoute: string
  activeDictCode: string
  state: SysPageState
  loading?: boolean
  showToolbar?: boolean
  userQuery: UserListQuery
  userPagination: TablePagination
  userSelectionCount: number
  userColumns: TableColumn[]
  roleColumns: TableColumn[]
  menuColumns: TableColumn[]
  deptColumns: TableColumn[]
  postColumns: TableColumn[]
  dictColumns: TableColumn[]
  dictItemColumns: TableColumn[]
  moduleColumns: TableColumn[]
  loginLogColumns: TableColumn[]
  operLogColumns: TableColumn[]
  riskColumns: TableColumn[]
}>()

const emit = defineEmits<{
  refresh: []
  'update:activeDictCode': [value: string]
  changeDict: []
  searchUsers: []
  resetUsers: []
  createUser: []
  deleteSelectedUsers: []
  userPageChange: [pagination: TablePagination]
  userSelectionChange: [rows: UserView[]]
  editUser: [row: UserView]
  warehouseUser: [row: UserView]
  deleteUser: [row: UserView]
  createRole: []
  editRole: [row: RoleView]
  roleMenus: [row: RoleView]
  deleteRole: [row: RoleView]
  createMenu: []
  editMenu: [row: TreeNodeView]
  deleteMenu: [row: TreeNodeView]
  createDept: []
  editDept: [row: TreeNodeView]
  deleteDept: [row: TreeNodeView]
  createPost: []
  editPost: [row: SimpleRecord]
  deletePost: [row: SimpleRecord]
  createDictType: []
  editDictType: [row: SimpleRecord]
  deleteDictType: [row: SimpleRecord]
  createDictItem: []
  editDictItem: [row: SimpleRecord]
  deleteDictItem: [row: SimpleRecord]
  createModule: []
  editModule: [row: SimpleRecord]
  deleteModule: [row: SimpleRecord]
}>()

const pageMeta = computed(() => {
  const meta: Record<string, { title: string; description: string }> = {
    '/sys/users': { title: '用户管理', description: '维护平台用户、角色和仓库授权。' },
    '/sys/roles': { title: '角色管理', description: '配置角色、菜单授权和数据范围。' },
    '/sys/menus': { title: '菜单管理', description: '维护 sys 模块菜单结构与权限点。' },
    '/sys/depts': { title: '部门管理', description: '维护组织结构和部门信息。' },
    '/sys/posts': { title: '岗位管理', description: '维护岗位信息与状态。' },
    '/sys/dicts': { title: '字典管理', description: '维护基础字典类型与字典项。' },
    '/sys/modules': { title: '前端模块', description: '维护模块 remote 注册和路由前缀。' },
    '/sys/login-logs': { title: '登录日志', description: '查看用户登录记录。' },
    '/sys/oper-logs': { title: '操作日志', description: '查看后台操作审计记录。' },
    '/sys/risk-records': { title: '风控记录', description: '查看登录和风险处置记录。' }
  }
  return meta[props.activeRoute] ?? meta['/sys/users']
})

const isUserRoute = computed(() => props.activeRoute === '/sys/users')
const showPageToolbar = computed(() => Boolean(props.showToolbar) && !isUserRoute.value)
const resolvedTitle = computed(() => (isUserRoute.value ? undefined : pageMeta.value.title))
const resolvedDescription = computed(() => (isUserRoute.value ? undefined : pageMeta.value.description))
</script>
