import { ApiError } from '@smartwarehouse/platform-sdk'
import type { BreadcrumbItem, LoginUser, MenuItem, NavMenuItem, TableColumn } from '@smartwarehouse/platform-types'
import { ElMessage, ElMessageBox, ElTree } from 'element-plus'
import { computed, nextTick, reactive, ref } from 'vue'
import {
  changePassword,
  loadSysPageState,
  sysApi,
  type DeptForm,
  type DictItemForm,
  type DictTypeForm,
  type MenuForm,
  type ModuleForm,
  type PostForm,
  type RoleForm,
  type RoleView,
  type SimpleRecord,
  type SysPageState,
  type TreeNodeView,
  type UserForm,
  type UserView
} from './api'
import { normalizeSysRoute } from './pages'

export function createEmptyState(): SysPageState {
  return {
    users: [],
    roles: [],
    menus: [],
    depts: [],
    posts: [],
    dictTypes: [],
    dictItems: [],
    modules: [],
    loginLogs: [],
    operLogs: [],
    riskRecords: []
  }
}

export function useSysManagement() {
  const loading = ref(false)
  const activeRoute = ref(normalizeSysRoute(resolveSysPathFromLocation()))
  const activeDictCode = ref('')
  const state = reactive<SysPageState>(createEmptyState())
  const profileDialogVisible = ref(false)
  const passwordDialogVisible = ref(false)
  const passwordSubmitting = ref(false)
  const passwordForm = reactive({ oldPassword: '', newPassword: '', confirmPassword: '' })
  const userDialogVisible = ref(false)
  const roleDialogVisible = ref(false)
  const roleMenuDialogVisible = ref(false)
  const permissionDialogVisible = ref(false)
  const menuDialogVisible = ref(false)
  const deptDialogVisible = ref(false)
  const postDialogVisible = ref(false)
  const dictTypeDialogVisible = ref(false)
  const dictItemDialogVisible = ref(false)
  const moduleDialogVisible = ref(false)
  const editingUserId = ref<number>()
  const editingRoleId = ref<number>()
  const editingMenuId = ref<number>()
  const editingDeptId = ref<number>()
  const editingPostId = ref<number>()
  const editingDictTypeId = ref<number>()
  const editingDictItemId = ref<number>()
  const editingModuleId = ref<number>()
  const permissionUserId = ref<number>()
  const roleMenuRoleId = ref<number>()
  const userRoleIds = ref<number[]>([])
  const warehouseInput = ref('')
  const roleMenuTree = ref<InstanceType<typeof ElTree>>()

  const userForm = reactive<UserForm>({ username: '', password: '', nickname: '', phone: '', email: '', status: 'ENABLED' })
  const roleForm = reactive<RoleForm>({ roleCode: '', roleName: '', dataScope: 'SELF', status: 'ENABLED', remark: '' })
  const menuForm = reactive<MenuForm>({
    parentId: 0,
    menuName: '',
    menuType: 'MENU',
    moduleCode: 'sys',
    path: '',
    component: '',
    permission: '',
    icon: '',
    sortNo: 0,
    visible: true,
    status: 'ENABLED'
  })
  const deptForm = reactive<DeptForm>({ parentId: 0, deptCode: '', deptName: '', sortNo: 0, status: 'ENABLED' })
  const postForm = reactive<PostForm>({ postCode: '', postName: '', sortNo: 0, status: 'ENABLED' })
  const dictTypeForm = reactive<DictTypeForm>({ dictCode: '', dictName: '', status: 'ENABLED' })
  const dictItemForm = reactive<DictItemForm>({ dictCode: '', itemLabel: '', itemValue: '', sortNo: 0, status: 'ENABLED' })
  const moduleForm = reactive<ModuleForm>({
    moduleCode: '',
    moduleName: '',
    routePrefix: '',
    entryUrl: '',
    remoteName: '',
    remoteEntry: '',
    exposedModule: './RemoteApp',
    apiPrefix: '',
    ownerType: 'VENDOR',
    ownerName: '',
    status: 'ENABLED',
    sortNo: 10
  })

  const userColumns: TableColumn[] = [
    { prop: 'username', label: '账号', minWidth: 120 },
    { prop: 'nickname', label: '姓名', minWidth: 120 },
    { prop: 'roles', label: '角色', minWidth: 180 },
    { prop: 'warehouseIds', label: '仓库权限', minWidth: 140 },
    { prop: 'status', label: '状态', width: 110 }
  ]
  const roleColumns: TableColumn[] = [
    { prop: 'roleCode', label: '角色编码', minWidth: 150 },
    { prop: 'roleName', label: '角色名称', minWidth: 150 },
    { prop: 'dataScope', label: '数据范围', minWidth: 120 },
    { prop: 'menuIds', label: '菜单权限', width: 110 },
    { prop: 'status', label: '状态', width: 110 }
  ]
  const menuColumns: TableColumn[] = [
    { prop: 'menuName', label: '菜单名称', minWidth: 160 },
    { prop: 'menuType', label: '类型', width: 90 },
    { prop: 'moduleCode', label: '模块', width: 90 },
    { prop: 'path', label: '路径', minWidth: 160 },
    { prop: 'permission', label: '权限标识', minWidth: 170 },
    { prop: 'visible', label: '可见', width: 90 },
    { prop: 'status', label: '状态', width: 100 }
  ]
  const deptColumns: TableColumn[] = [
    { prop: 'deptName', label: '部门名称', minWidth: 150 },
    { prop: 'deptCode', label: '部门编码', minWidth: 130 },
    { prop: 'status', label: '状态', width: 100 }
  ]
  const postColumns: TableColumn[] = [
    { prop: 'postName', label: '岗位名称', minWidth: 150 },
    { prop: 'postCode', label: '岗位编码', minWidth: 150 },
    { prop: 'status', label: '状态', width: 100 }
  ]
  const dictColumns: TableColumn[] = [
    { prop: 'dictCode', label: '字典编码', minWidth: 150 },
    { prop: 'dictName', label: '字典名称', minWidth: 150 },
    { prop: 'status', label: '状态', width: 100 }
  ]
  const dictItemColumns: TableColumn[] = [
    { prop: 'itemLabel', label: '显示文本', minWidth: 140 },
    { prop: 'itemValue', label: '数据值', minWidth: 130 },
    { prop: 'sortNo', label: '排序', width: 80 },
    { prop: 'status', label: '状态', width: 100 }
  ]
  const moduleColumns: TableColumn[] = [
    { prop: 'moduleCode', label: '模块编码', width: 120 },
    { prop: 'moduleName', label: '模块名称', minWidth: 140 },
    { prop: 'remoteName', label: '远程容器', minWidth: 150 },
    { prop: 'remoteEntry', label: '远程入口', minWidth: 260 },
    { prop: 'ownerName', label: '负责人', minWidth: 120 },
    { prop: 'status', label: '状态', width: 100 }
  ]
  const loginLogColumns: TableColumn[] = [
    { prop: 'username', label: '账号', minWidth: 120 },
    { prop: 'loginStatus', label: '结果', width: 100 },
    { prop: 'loginIp', label: 'IP', minWidth: 140 },
    { prop: 'loginTime', label: '时间', minWidth: 180 }
  ]
  const operLogColumns: TableColumn[] = [
    { prop: 'module', label: '模块', width: 100 },
    { prop: 'operation', label: '操作', minWidth: 140 },
    { prop: 'resultStatus', label: '结果', width: 100 },
    { prop: 'createdTime', label: '时间', minWidth: 180 }
  ]
  const riskColumns: TableColumn[] = [
    { prop: 'riskType', label: '类型', minWidth: 140 },
    { prop: 'riskTarget', label: '对象', minWidth: 140 },
    { prop: 'action', label: '动作', minWidth: 140 },
    { prop: 'reason', label: '原因', minWidth: 200 },
    { prop: 'createdTime', label: '时间', minWidth: 180 }
  ]

  const sysMenus = computed<NavMenuItem[]>(() => [
    { id: 'users', title: '用户管理', path: '/sys/users' },
    { id: 'roles', title: '角色管理', path: '/sys/roles' },
    { id: 'menus', title: '菜单管理', path: '/sys/menus' },
    { id: 'depts', title: '部门管理', path: '/sys/depts' },
    { id: 'posts', title: '岗位管理', path: '/sys/posts' },
    { id: 'dicts', title: '字典管理', path: '/sys/dicts' },
    { id: 'modules', title: '前端模块', path: '/sys/modules' },
    {
      id: 'audit',
      title: '安全审计',
      path: '/sys/audit',
      children: [
        { id: 'loginLogs', title: '登录日志', path: '/sys/login-logs' },
        { id: 'operLogs', title: '操作日志', path: '/sys/oper-logs' },
        { id: 'risk', title: '风控记录', path: '/sys/risk-records' }
      ]
    }
  ])

  const breadcrumbs = computed<BreadcrumbItem[]>(() => [{ title: '系统管理', path: activeRoute.value }])

  async function loadAll(): Promise<void> {
    loading.value = true
    try {
      const nextState = await loadSysPageState(activeDictCode.value)
      Object.assign(state, nextState)
      if (!activeDictCode.value || !state.dictTypes.some((item) => String(item.dictCode) === activeDictCode.value)) {
        activeDictCode.value = String(state.dictTypes[0]?.dictCode ?? '')
      }
    } finally {
      loading.value = false
    }
  }

  async function reloadDictItems(): Promise<void> {
    state.dictItems = activeDictCode.value ? await sysApi.dictItems(activeDictCode.value) : []
  }

  function syncRoute(path: string): void {
    activeRoute.value = normalizeSysRoute(path)
  }

  function resolveSysMenus(allMenus: MenuItem[]): NavMenuItem[] {
    const moduleMenus = allMenus.filter((item) => item.moduleCode === 'sys').map(toNavMenu)
    return unwrapModuleRootMenus(moduleMenus, '/sys')
  }

  function toNavMenu(menu: MenuItem): NavMenuItem {
    return {
      id: menu.id,
      title: menu.menuName ?? menu.name ?? 'Unnamed menu',
      path: menu.path,
      icon: menu.icon,
      moduleCode: menu.moduleCode,
      permission: menu.permission,
      visible: menu.visible,
      children: menu.children?.map(toNavMenu)
    }
  }

  function unwrapModuleRootMenus(menus: NavMenuItem[], moduleRootPath: string): NavMenuItem[] {
    if (menus.length !== 1) {
      return menus
    }
    const [rootMenu] = menus
    return rootMenu.path === moduleRootPath && rootMenu.children?.length ? rootMenu.children : menus
  }

  function handleUserCommand(command: string): void {
    if (command === 'profile') {
      profileDialogVisible.value = true
      return
    }
    if (command === 'password') {
      resetPasswordForm()
      passwordDialogVisible.value = true
    }
  }

  async function executeMutation<T>(action: () => Promise<T>): Promise<{ ok: false } | { ok: true; value: T }> {
    try {
      return {
        ok: true,
        value: await action()
      }
    } catch (error) {
      showActionError(error)
      return { ok: false }
    }
  }

  function showActionError(error: unknown): void {
    if (error instanceof ApiError) {
      ElMessage.error(error.message || '操作失败，请稍后重试')
      return
    }
    if (error instanceof Error) {
      ElMessage.error(error.message || '操作失败，请稍后重试')
      return
    }
    ElMessage.error('操作失败，请稍后重试')
  }

  async function submitPassword(): Promise<void> {
    passwordSubmitting.value = true
    try {
      const result = await executeMutation(() => changePassword(passwordForm))
      if (!result.ok) {
        return
      }
      ElMessage.success('密码修改成功')
      passwordDialogVisible.value = false
      resetPasswordForm()
    } finally {
      passwordSubmitting.value = false
    }
  }

  function openUserDialog(row?: UserView): void {
    editingUserId.value = row?.id
    Object.assign(userForm, row ?? { username: '', password: '', nickname: '', phone: '', email: '', deptId: undefined, postId: undefined, status: 'ENABLED' })
    userForm.password = ''
    userRoleIds.value = row ? state.roles.filter((role) => row.roles.includes(role.roleCode)).map((role) => role.id) : []
    userDialogVisible.value = true
  }

  async function saveUser(): Promise<void> {
    const saved = await executeMutation(() => sysApi.saveUser(editingUserId.value, userForm))
    if (!saved.ok) {
      return
    }
    const roleUpdated = await executeMutation(() => sysApi.updateUserRoles(saved.value.id, userRoleIds.value))
    if (!roleUpdated.ok) {
      return
    }
    userDialogVisible.value = false
    await loadAll()
  }

  async function deleteUser(row: UserView): Promise<void> {
    await confirmDelete(`确认删除用户 ${row.username} 吗？`, async () => sysApi.deleteUser(row.id))
  }

  function openRoleDialog(row?: RoleView): void {
    editingRoleId.value = row?.id
    Object.assign(roleForm, row ?? { roleCode: '', roleName: '', dataScope: 'SELF', status: 'ENABLED', remark: '' })
    roleDialogVisible.value = true
  }

  async function saveRole(): Promise<void> {
    const result = await executeMutation(() => sysApi.saveRole(editingRoleId.value, roleForm))
    if (!result.ok) {
      return
    }
    roleDialogVisible.value = false
    await loadAll()
  }

  async function deleteRole(row: RoleView): Promise<void> {
    await confirmDelete(`确认删除角色 ${row.roleName} 吗？`, async () => sysApi.deleteRole(row.id))
  }

  async function openRoleMenuDialog(row: RoleView): Promise<void> {
    roleMenuRoleId.value = row.id
    roleMenuDialogVisible.value = true
    await nextTick()
    roleMenuTree.value?.setCheckedKeys(row.menuIds)
  }

  async function saveRoleMenus(): Promise<void> {
    const checked = roleMenuTree.value?.getCheckedKeys(false) ?? []
    const result = await executeMutation(() => sysApi.updateRoleMenus(roleMenuRoleId.value!, checked.map((item) => Number(item))))
    if (!result.ok) {
      return
    }
    roleMenuDialogVisible.value = false
    await loadAll()
  }

  function openPermissionDialog(row: UserView): void {
    permissionUserId.value = row.id
    warehouseInput.value = row.warehouseIds.join(',')
    permissionDialogVisible.value = true
  }

  async function saveWarehousePermission(): Promise<void> {
    const ids = warehouseInput.value
      .split(',')
      .map((item) => Number(item.trim()))
      .filter((item) => Number.isFinite(item))
    const result = await executeMutation(() => sysApi.updateUserWarehouses(permissionUserId.value!, ids))
    if (!result.ok) {
      return
    }
    permissionDialogVisible.value = false
    await loadAll()
  }

  function openMenuDialog(row?: TreeNodeView): void {
    editingMenuId.value = row?.id
    Object.assign(menuForm, row ?? { parentId: 0, menuName: '', menuType: 'MENU', moduleCode: 'sys', path: '', component: '', permission: '', icon: '', sortNo: 0, visible: true, status: 'ENABLED' })
    menuDialogVisible.value = true
  }

  async function saveMenu(): Promise<void> {
    const result = await executeMutation(() => sysApi.saveMenu(editingMenuId.value, menuForm))
    if (!result.ok) {
      return
    }
    menuDialogVisible.value = false
    await loadAll()
  }

  async function deleteMenu(row: TreeNodeView): Promise<void> {
    await confirmDelete(`确认删除菜单 ${row.menuName} 吗？`, async () => sysApi.deleteMenu(row.id))
  }

  function openDeptDialog(row?: TreeNodeView): void {
    editingDeptId.value = row?.id
    Object.assign(deptForm, row ?? { parentId: 0, deptCode: '', deptName: '', sortNo: 0, status: 'ENABLED' })
    deptDialogVisible.value = true
  }

  async function saveDept(): Promise<void> {
    const result = await executeMutation(() => sysApi.saveDept(editingDeptId.value, deptForm))
    if (!result.ok) {
      return
    }
    deptDialogVisible.value = false
    await loadAll()
  }

  async function deleteDept(row: TreeNodeView): Promise<void> {
    await confirmDelete(`确认删除部门 ${row.deptName} 吗？`, async () => sysApi.deleteDept(row.id))
  }

  function openPostDialog(row?: SimpleRecord): void {
    editingPostId.value = row?.id
    Object.assign(postForm, row ?? { postCode: '', postName: '', sortNo: 0, status: 'ENABLED' })
    postDialogVisible.value = true
  }

  async function savePost(): Promise<void> {
    const result = await executeMutation(() => sysApi.savePost(editingPostId.value, postForm))
    if (!result.ok) {
      return
    }
    postDialogVisible.value = false
    await loadAll()
  }

  async function deletePost(row: SimpleRecord): Promise<void> {
    await confirmDelete(`确认删除岗位 ${row.postName} 吗？`, async () => sysApi.deletePost(row.id))
  }

  function openDictTypeDialog(row?: SimpleRecord): void {
    editingDictTypeId.value = row?.id
    Object.assign(dictTypeForm, row ?? { dictCode: '', dictName: '', status: 'ENABLED' })
    dictTypeDialogVisible.value = true
  }

  async function saveDictType(): Promise<void> {
    const shouldSelectSavedType =
      editingDictTypeId.value === undefined ||
      state.dictTypes.some((item) => item.id === editingDictTypeId.value && String(item.dictCode) === activeDictCode.value)
    const saved = await executeMutation(() => sysApi.saveDictType(editingDictTypeId.value, dictTypeForm))
    if (!saved.ok) {
      return
    }
    if (shouldSelectSavedType) {
      activeDictCode.value = String(saved.value.dictCode ?? '')
    }
    dictTypeDialogVisible.value = false
    await loadAll()
  }

  async function deleteDictType(row: SimpleRecord): Promise<void> {
    await confirmDelete(`确认删除字典 ${row.dictName} 吗？`, async () => sysApi.deleteDictType(row.id))
  }

  function openDictItemDialog(row?: SimpleRecord): void {
    editingDictItemId.value = row?.id
    Object.assign(dictItemForm, row ?? { dictCode: activeDictCode.value, itemLabel: '', itemValue: '', sortNo: 0, status: 'ENABLED' })
    dictItemForm.dictCode = row?.dictCode ? String(row.dictCode) : activeDictCode.value
    dictItemDialogVisible.value = true
  }

  async function saveDictItem(): Promise<void> {
    const result = await executeMutation(() => sysApi.saveDictItem(editingDictItemId.value, dictItemForm))
    if (!result.ok) {
      return
    }
    dictItemDialogVisible.value = false
    await reloadDictItems()
  }

  async function deleteDictItem(row: SimpleRecord): Promise<void> {
    await confirmDelete(`确认删除字典项 ${row.itemLabel} 吗？`, async () => sysApi.deleteDictItem(row.id), reloadDictItems)
  }

  function openModuleDialog(row?: SimpleRecord): void {
    editingModuleId.value = row?.id
    Object.assign(moduleForm, row ?? {
      moduleCode: '',
      moduleName: '',
      routePrefix: '',
      entryUrl: '',
      remoteName: '',
      remoteEntry: '',
      exposedModule: './RemoteApp',
      apiPrefix: '',
      ownerType: 'VENDOR',
      ownerName: '',
      status: 'ENABLED',
      sortNo: 10
    })
    moduleDialogVisible.value = true
  }

  async function saveModule(): Promise<void> {
    const result = await executeMutation(() => sysApi.saveModule(editingModuleId.value, moduleForm))
    if (!result.ok) {
      return
    }
    moduleDialogVisible.value = false
    await loadAll()
  }

  async function deleteModule(row: SimpleRecord): Promise<void> {
    await confirmDelete(`确认删除模块 ${row.moduleName} 吗？`, async () => sysApi.deleteModule(row.id))
  }

  async function confirmDelete(message: string, action: () => Promise<void>, after: () => Promise<void> = loadAll): Promise<void> {
    try {
      await ElMessageBox.confirm(message, '删除确认', { type: 'warning' })
    } catch {
      return
    }
    const result = await executeMutation(action)
    if (!result.ok) {
      return
    }
    ElMessage.success('删除成功')
    await after()
  }

  function resetPasswordForm(): void {
    passwordForm.oldPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
  }

  return {
    loading,
    activeRoute,
    activeDictCode,
    state,
    sysMenus,
    breadcrumbs,
    profileDialogVisible,
    passwordDialogVisible,
    passwordSubmitting,
    passwordForm,
    userDialogVisible,
    roleDialogVisible,
    roleMenuDialogVisible,
    permissionDialogVisible,
    menuDialogVisible,
    deptDialogVisible,
    postDialogVisible,
    dictTypeDialogVisible,
    dictItemDialogVisible,
    moduleDialogVisible,
    userRoleIds,
    warehouseInput,
    roleMenuTree,
    userForm,
    roleForm,
    menuForm,
    deptForm,
    postForm,
    dictTypeForm,
    dictItemForm,
    moduleForm,
    userColumns,
    roleColumns,
    menuColumns,
    deptColumns,
    postColumns,
    dictColumns,
    dictItemColumns,
    moduleColumns,
    loginLogColumns,
    operLogColumns,
    riskColumns,
    loadAll,
    reloadDictItems,
    syncRoute,
    resolveSysMenus,
    handleUserCommand,
    submitPassword,
    openUserDialog,
    saveUser,
    deleteUser,
    openRoleDialog,
    saveRole,
    deleteRole,
    openRoleMenuDialog,
    saveRoleMenus,
    openPermissionDialog,
    saveWarehousePermission,
    openMenuDialog,
    saveMenu,
    deleteMenu,
    openDeptDialog,
    saveDept,
    deleteDept,
    openPostDialog,
    savePost,
    deletePost,
    openDictTypeDialog,
    saveDictType,
    deleteDictType,
    openDictItemDialog,
    saveDictItem,
    deleteDictItem,
    openModuleDialog,
    saveModule,
    deleteModule
  }
}

export type SysManagementApi = ReturnType<typeof useSysManagement>

export function ensureSysManagementAccess(currentUser: LoginUser): void {
  if (!hasSysManagementAccess(currentUser)) {
    throw new Error('Current account has no sys management permission')
  }
}

export function hasSysManagementAccess(currentUser: LoginUser): boolean {
  return currentUser.roles.includes('ADMIN') || currentUser.permissions.some((permission) => permission.startsWith('sys:'))
}

export function resolveSysPathFromLocation(): string {
  const pathname = window.location.pathname
  const redirectPath = new URLSearchParams(window.location.search).get('redirect')
  if (pathname === '/sys' || pathname.startsWith('/sys/')) {
    return pathname
  }
  const basePath = normalizeBasePath(import.meta.env.BASE_URL)
  if (basePath !== '/' && (pathname === basePath || pathname.startsWith(`${basePath}/`))) {
    const nestedPath = pathname.slice(basePath.length)
    return nestedPath && nestedPath !== '/' ? nestedPath : redirectPath ?? '/sys/users'
  }
  return redirectPath ?? '/sys/users'
}

function normalizeBasePath(baseUrl: string): string {
  const normalized = `/${baseUrl.replace(/^\/+|\/+$/g, '')}`
  return normalized === '/' ? '/' : normalized
}
