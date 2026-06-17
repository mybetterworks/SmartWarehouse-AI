<template>
  <PlatformPage :title="resolvedTitle" :description="resolvedDescription" :class="{ 'sys-content-page--plain': isPlainRoute }">
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
      :query="roleQuery"
      :pagination="rolePagination"
      :loading="loading"
      :selected-count="roleSelectionCount"
      @search="emit('searchRoles')"
      @reset="emit('resetRoles')"
      @page-change="emit('rolePageChange', $event)"
      @selection-change="emit('roleSelectionChange', $event)"
      @create="emit('createRole')"
      @delete-selected="emit('deleteSelectedRoles')"
      @edit="emit('editRole', $event)"
      @menus="emit('roleMenus', $event)"
      @delete="emit('deleteRole', $event)"
    />

    <MenuManagementView
      v-else-if="activeRoute === '/sys/menus'"
      :columns="menuColumns"
      :menus="menuTreeOptions"
      :query="menuQuery"
      :loading="loading"
      @search="emit('searchMenus')"
      @reset="emit('resetMenus')"
      @create="emit('createMenu')"
      @create-child="emit('createChildMenu', $event)"
      @edit="emit('editMenu', $event)"
      @delete="emit('deleteMenu', $event)"
    />

    <DeptManagementView
      v-else-if="activeRoute === '/sys/depts'"
      :columns="deptColumns"
      :depts="deptTreeOptions"
      :query="deptQuery"
      :loading="loading"
      @search="emit('searchDepts')"
      @reset="emit('resetDepts')"
      @create-dept="emit('createDept')"
      @create-child-dept="emit('createChildDept', $event)"
      @edit-dept="emit('editDept', $event)"
      @delete-dept="emit('deleteDept', $event)"
    />

    <PostManagementView
      v-else-if="activeRoute === '/sys/posts'"
      :columns="postColumns"
      :posts="state.posts"
      :query="postQuery"
      :pagination="postPagination"
      :loading="loading"
      :selected-count="postSelectionCount"
      @search="emit('searchPosts')"
      @reset="emit('resetPosts')"
      @page-change="emit('postPageChange', $event)"
      @selection-change="emit('postSelectionChange', $event)"
      @create-post="emit('createPost')"
      @delete-selected="emit('deleteSelectedPosts')"
      @edit-post="emit('editPost', $event)"
      @delete-post="emit('deletePost', $event)"
    />

    <DictManagementView
      v-else-if="activeRoute === '/sys/dicts'"
      :columns="dictColumns"
      :dict-types="state.dictTypes"
      :query="dictTypeQuery"
      :pagination="dictTypePagination"
      :loading="loading"
      :selected-count="dictTypeSelectionCount"
      @search="emit('searchDictTypes')"
      @reset="emit('resetDictTypes')"
      @page-change="emit('dictTypePageChange', $event)"
      @selection-change="emit('dictTypeSelectionChange', $event)"
      @create="emit('createDictType')"
      @delete-selected="emit('deleteSelectedDictTypes')"
      @edit="emit('editDictType', $event)"
      @view-items="emit('viewDictItems', $event)"
      @delete="emit('deleteDictType', $event)"
    />

    <DictItemManagementView
      v-else-if="activeRoute === '/sys/dicts/items'"
      :columns="dictItemColumns"
      :dict-items="state.dictItems"
      :query="dictItemQuery"
      :pagination="dictItemPagination"
      :dict-code="activeDictCode"
      :loading="loading"
      :selected-count="dictItemSelectionCount"
      @search="emit('searchDictItems')"
      @reset="emit('resetDictItems')"
      @page-change="emit('dictItemPageChange', $event)"
      @selection-change="emit('dictItemSelectionChange', $event)"
      @create="emit('createDictItem')"
      @delete-selected="emit('deleteSelectedDictItems')"
      @edit="emit('editDictItem', $event)"
      @delete="emit('deleteDictItem', $event)"
      @back="emit('backToDictTypes')"
    />

    <FrontendModuleManagementView
      v-else-if="activeRoute === '/sys/modules'"
      :columns="moduleColumns"
      :modules="state.modules"
      :query="moduleQuery"
      :pagination="modulePagination"
      :loading="loading"
      :selected-count="moduleSelectionCount"
      @search="emit('searchModules')"
      @reset="emit('resetModules')"
      @page-change="emit('modulePageChange', $event)"
      @selection-change="emit('moduleSelectionChange', $event)"
      @create="emit('createModule')"
      @delete-selected="emit('deleteSelectedModules')"
      @edit="emit('editModule', $event)"
      @delete="emit('deleteModule', $event)"
    />

    <AuditLogView
      v-else-if="activeRoute === '/sys/login-logs'"
      :columns="loginLogColumns"
      :records="state.loginLogs"
      :query="loginLogQuery"
      :pagination="loginLogPagination"
      :loading="loading"
      @search="emit('searchLoginLogs')"
      @reset="emit('resetLoginLogs')"
      @page-change="emit('loginLogPageChange', $event)"
    >
      <template #search>
        <el-form-item label="账号">
          <el-input v-model="loginLogQuery.username" placeholder="请输入账号" clearable @keyup.enter="emit('searchLoginLogs')" />
        </el-form-item>
        <el-form-item label="结果">
          <el-select v-model="loginLogQuery.loginStatus" placeholder="全部结果" clearable>
            <el-option label="成功" value="SUCCESS" />
            <el-option label="失败" value="FAIL" />
          </el-select>
        </el-form-item>
        <el-form-item label="IP">
          <el-input v-model="loginLogQuery.loginIp" placeholder="请输入 IP" clearable @keyup.enter="emit('searchLoginLogs')" />
        </el-form-item>
      </template>
    </AuditLogView>

    <AuditLogView
      v-else-if="activeRoute === '/sys/oper-logs'"
      :columns="operLogColumns"
      :records="state.operLogs"
      :query="operLogQuery"
      :pagination="operLogPagination"
      :loading="loading"
      @search="emit('searchOperLogs')"
      @reset="emit('resetOperLogs')"
      @page-change="emit('operLogPageChange', $event)"
    >
      <template #search>
        <el-form-item label="账号">
          <el-input v-model="operLogQuery.username" placeholder="请输入账号" clearable @keyup.enter="emit('searchOperLogs')" />
        </el-form-item>
        <el-form-item label="模块">
          <el-input v-model="operLogQuery.module" placeholder="请输入模块" clearable @keyup.enter="emit('searchOperLogs')" />
        </el-form-item>
        <el-form-item label="操作">
          <el-input v-model="operLogQuery.operation" placeholder="请输入操作" clearable @keyup.enter="emit('searchOperLogs')" />
        </el-form-item>
        <el-form-item label="结果">
          <el-select v-model="operLogQuery.resultStatus" placeholder="全部结果" clearable>
            <el-option label="成功" value="SUCCESS" />
            <el-option label="失败" value="FAIL" />
          </el-select>
        </el-form-item>
      </template>
    </AuditLogView>

    <RiskRecordView
      v-else
      :columns="riskColumns"
      :risk-records="state.riskRecords"
      :query="riskRecordQuery"
      :pagination="riskRecordPagination"
      :loading="loading"
      @search="emit('searchRiskRecords')"
      @reset="emit('resetRiskRecords')"
      @page-change="emit('riskRecordPageChange', $event)"
    />
  </PlatformPage>
</template>

<script setup lang="ts">
import { PlatformPage } from '@smartwarehouse/platform-ui'
import type { TableColumn, TablePagination } from '@smartwarehouse/platform-types'
import { computed } from 'vue'
import type {
  DeptListQuery,
  DictItemListQuery,
  DictTypeListQuery,
  LoginLogListQuery,
  MenuListQuery,
  ModuleListQuery,
  OperLogListQuery,
  PostListQuery,
  RiskRecordListQuery,
  RoleListQuery,
  RoleView,
  SimpleRecord,
  SysPageState,
  TreeNodeView,
  UserListQuery,
  UserView
} from './api'
import AuditLogView from './views/AuditLogView.vue'
import DeptManagementView from './views/DeptManagementView.vue'
import DictItemManagementView from './views/DictItemManagementView.vue'
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
  menuTreeOptions: TreeNodeView[]
  deptTreeOptions: TreeNodeView[]
  loading?: boolean
  showToolbar?: boolean
  userQuery: UserListQuery
  roleQuery: RoleListQuery
  menuQuery: MenuListQuery
  deptQuery: DeptListQuery
  postQuery: PostListQuery
  dictTypeQuery: DictTypeListQuery
  dictItemQuery: DictItemListQuery
  moduleQuery: ModuleListQuery
  loginLogQuery: LoginLogListQuery
  operLogQuery: OperLogListQuery
  riskRecordQuery: RiskRecordListQuery
  userPagination: TablePagination
  rolePagination: TablePagination
  menuPagination: TablePagination
  deptPagination: TablePagination
  postPagination: TablePagination
  dictTypePagination: TablePagination
  dictItemPagination: TablePagination
  modulePagination: TablePagination
  loginLogPagination: TablePagination
  operLogPagination: TablePagination
  riskRecordPagination: TablePagination
  userSelectionCount: number
  roleSelectionCount: number
  postSelectionCount: number
  dictTypeSelectionCount: number
  dictItemSelectionCount: number
  moduleSelectionCount: number
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
  searchUsers: []
  resetUsers: []
  createUser: []
  deleteSelectedUsers: []
  userPageChange: [pagination: TablePagination]
  userSelectionChange: [rows: UserView[]]
  editUser: [row: UserView]
  warehouseUser: [row: UserView]
  deleteUser: [row: UserView]
  searchRoles: []
  resetRoles: []
  rolePageChange: [pagination: TablePagination]
  roleSelectionChange: [rows: RoleView[]]
  createRole: []
  deleteSelectedRoles: []
  editRole: [row: RoleView]
  roleMenus: [row: RoleView]
  deleteRole: [row: RoleView]
  searchMenus: []
  resetMenus: []
  menuPageChange: [pagination: TablePagination]
  createMenu: []
  createChildMenu: [row: TreeNodeView]
  editMenu: [row: TreeNodeView]
  deleteMenu: [row: TreeNodeView]
  searchDepts: []
  resetDepts: []
  deptPageChange: [pagination: TablePagination]
  createDept: []
  createChildDept: [row: TreeNodeView]
  editDept: [row: TreeNodeView]
  deleteDept: [row: TreeNodeView]
  searchPosts: []
  resetPosts: []
  postPageChange: [pagination: TablePagination]
  postSelectionChange: [rows: SimpleRecord[]]
  createPost: []
  deleteSelectedPosts: []
  editPost: [row: SimpleRecord]
  deletePost: [row: SimpleRecord]
  searchDictTypes: []
  resetDictTypes: []
  dictTypePageChange: [pagination: TablePagination]
  dictTypeSelectionChange: [rows: SimpleRecord[]]
  createDictType: []
  deleteSelectedDictTypes: []
  editDictType: [row: SimpleRecord]
  viewDictItems: [row: SimpleRecord]
  deleteDictType: [row: SimpleRecord]
  searchDictItems: []
  resetDictItems: []
  dictItemPageChange: [pagination: TablePagination]
  dictItemSelectionChange: [rows: SimpleRecord[]]
  createDictItem: []
  deleteSelectedDictItems: []
  editDictItem: [row: SimpleRecord]
  deleteDictItem: [row: SimpleRecord]
  backToDictTypes: []
  searchModules: []
  resetModules: []
  modulePageChange: [pagination: TablePagination]
  moduleSelectionChange: [rows: SimpleRecord[]]
  createModule: []
  deleteSelectedModules: []
  editModule: [row: SimpleRecord]
  deleteModule: [row: SimpleRecord]
  searchLoginLogs: []
  resetLoginLogs: []
  loginLogPageChange: [pagination: TablePagination]
  searchOperLogs: []
  resetOperLogs: []
  operLogPageChange: [pagination: TablePagination]
  searchRiskRecords: []
  resetRiskRecords: []
  riskRecordPageChange: [pagination: TablePagination]
}>()

const pageMeta = computed(() => {
  const meta: Record<string, { title: string; description: string }> = {
    '/sys/users': { title: '用户管理', description: '维护平台用户、角色和仓库授权。' },
    '/sys/roles': { title: '角色管理', description: '配置角色、菜单授权和数据范围。' },
    '/sys/menus': { title: '菜单管理', description: '维护 sys 模块菜单结构与权限点。' },
    '/sys/depts': { title: '部门管理', description: '维护组织结构和部门信息。' },
    '/sys/posts': { title: '岗位管理', description: '维护岗位信息与状态。' },
    '/sys/dicts': { title: '字典管理', description: '维护基础字典类型。' },
    '/sys/dicts/items': { title: '字典数据', description: '维护当前字典类型下的字典数据。' },
    '/sys/modules': { title: '前端模块', description: '维护模块 remote 注册和路由前缀。' },
    '/sys/login-logs': { title: '登录日志', description: '查看用户登录记录。' },
    '/sys/oper-logs': { title: '操作日志', description: '查看后台操作审计记录。' },
    '/sys/risk-records': { title: '风控记录', description: '查看登录和风险处置记录。' }
  }
  return meta[props.activeRoute] ?? meta['/sys/users']
})

const plainRoutes = new Set([
  '/sys/users',
  '/sys/roles',
  '/sys/menus',
  '/sys/depts',
  '/sys/posts',
  '/sys/dicts',
  '/sys/dicts/items',
  '/sys/modules',
  '/sys/login-logs',
  '/sys/oper-logs',
  '/sys/risk-records'
])

const isPlainRoute = computed(() => plainRoutes.has(props.activeRoute))
const showPageToolbar = computed(() => Boolean(props.showToolbar) && !isPlainRoute.value)
const resolvedTitle = computed(() => (isPlainRoute.value ? undefined : pageMeta.value.title))
const resolvedDescription = computed(() => (isPlainRoute.value ? undefined : pageMeta.value.description))
</script>
