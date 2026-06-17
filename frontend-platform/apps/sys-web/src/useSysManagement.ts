import { ApiError } from '@smartwarehouse/platform-sdk'
import type { BreadcrumbItem, LoginUser, MenuItem, NavMenuItem, PageResult, TableColumn, TablePagination } from '@smartwarehouse/platform-types'
import { ElMessage, ElMessageBox, ElTree } from 'element-plus'
import { computed, nextTick, reactive, ref } from 'vue'
import {
  changePassword,
  sysApi,
  type DeptForm,
  type DeptListQuery,
  type DictItemForm,
  type DictItemListQuery,
  type DictTypeForm,
  type DictTypeListQuery,
  type LoginLogListQuery,
  type MenuForm,
  type MenuListQuery,
  type ModuleForm,
  type ModuleListQuery,
  type OperLogListQuery,
  type PostForm,
  type PostListQuery,
  type RiskRecordListQuery,
  type RoleForm,
  type RoleListQuery,
  type RoleView,
  type SimpleRecord,
  type SysPageState,
  type TreeNodeView,
  type UserForm,
  type UserListQuery,
  type UserView
} from './api'
import { normalizeSysRoute, type ValidSysRoute } from './pages'

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

function createPagination(): TablePagination {
  return reactive<TablePagination>({ pageNo: 1, pageSize: 10, total: 0 })
}

function createEmptyPageResult<T>(pagination: TablePagination): PageResult<T> {
  return {
    records: [],
    total: 0,
    pageNo: pagination.pageNo,
    pageSize: pagination.pageSize
  }
}

function trimOrUndefined(value?: string | null): string | undefined {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

export function useSysManagement() {
  const loading = ref(false)
  const activeRoute = ref(resolveActiveRoute(resolveSysLocationFromLocation()))
  const activeDictCode = ref('')
  const state = reactive<SysPageState>(createEmptyState())

  const roleOptions = ref<RoleView[]>([])
  const menuTreeOptions = ref<TreeNodeView[]>([])
  const deptTreeOptions = ref<TreeNodeView[]>([])
  const postOptions = ref<SimpleRecord[]>([])

  const userQuery = reactive<UserListQuery>({ username: '', nickname: '', phone: '', status: '' })
  const roleQuery = reactive<RoleListQuery>({ roleCode: '', roleName: '', status: '' })
  const menuQuery = reactive<MenuListQuery>({ menuName: '', menuType: '', moduleCode: '', status: '', visible: undefined })
  const deptQuery = reactive<DeptListQuery>({ deptCode: '', deptName: '', status: '' })
  const postQuery = reactive<PostListQuery>({ postCode: '', postName: '', status: '' })
  const dictTypeQuery = reactive<DictTypeListQuery>({ dictCode: '', dictName: '', status: '' })
  const dictItemQuery = reactive<DictItemListQuery>({ itemLabel: '', itemValue: '', status: '' })
  const moduleQuery = reactive<ModuleListQuery>({ moduleCode: '', moduleName: '', ownerName: '', status: '' })
  const loginLogQuery = reactive<LoginLogListQuery>({ username: '', loginStatus: '', loginIp: '' })
  const operLogQuery = reactive<OperLogListQuery>({ username: '', module: '', operation: '', resultStatus: '' })
  const riskRecordQuery = reactive<RiskRecordListQuery>({ riskType: '', riskTarget: '', action: '' })

  const userPagination = createPagination()
  const rolePagination = createPagination()
  const menuPagination = createPagination()
  const deptPagination = createPagination()
  const postPagination = createPagination()
  const dictTypePagination = createPagination()
  const dictItemPagination = createPagination()
  const modulePagination = createPagination()
  const loginLogPagination = createPagination()
  const operLogPagination = createPagination()
  const riskRecordPagination = createPagination()

  const selectedUsers = ref<UserView[]>([])
  const selectedRoles = ref<RoleView[]>([])
  const selectedPosts = ref<SimpleRecord[]>([])
  const selectedDictTypes = ref<SimpleRecord[]>([])
  const selectedDictItems = ref<SimpleRecord[]>([])
  const selectedModules = ref<SimpleRecord[]>([])
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
    { prop: 'username', label: '账号', minWidth: 120 },
    { prop: 'module', label: '模块', width: 100 },
    { prop: 'operation', label: '操作', minWidth: 160 },
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

  const userSelectionCount = computed(() => selectedUsers.value.length)
  const roleSelectionCount = computed(() => selectedRoles.value.length)
  const postSelectionCount = computed(() => selectedPosts.value.length)
  const dictTypeSelectionCount = computed(() => selectedDictTypes.value.length)
  const dictItemSelectionCount = computed(() => selectedDictItems.value.length)
  const moduleSelectionCount = computed(() => selectedModules.value.length)
  const breadcrumbs = computed<BreadcrumbItem[]>(() => {
    if (activeRoute.value === '/sys/users') {
      return [{ title: '工作台' }, { title: '系统管理' }, { title: '用户管理' }]
    }
    return [{ title: '系统管理', path: activeRoute.value }]
  })

  function applyPage<T>(page: PageResult<T>, pagination: TablePagination, assign: (records: T[]) => void): void {
    assign(page.records)
    pagination.pageNo = page.pageNo
    pagination.pageSize = page.pageSize
    pagination.total = page.total
  }

  async function withLoading<T>(action: () => Promise<T>, showLoading = true): Promise<T> {
    if (showLoading) {
      loading.value = true
    }
    try {
      return await action()
    } finally {
      if (showLoading) {
        loading.value = false
      }
    }
  }

  function buildUserListQuery(): UserListQuery {
    return {
      pageNo: userPagination.pageNo,
      pageSize: userPagination.pageSize,
      username: trimOrUndefined(userQuery.username),
      nickname: trimOrUndefined(userQuery.nickname),
      phone: trimOrUndefined(userQuery.phone),
      status: trimOrUndefined(userQuery.status)
    }
  }

  function buildRoleListQuery(): RoleListQuery {
    return {
      pageNo: rolePagination.pageNo,
      pageSize: rolePagination.pageSize,
      roleCode: trimOrUndefined(roleQuery.roleCode),
      roleName: trimOrUndefined(roleQuery.roleName),
      status: trimOrUndefined(roleQuery.status)
    }
  }

  function buildMenuListQuery(): MenuListQuery {
    return {
      pageNo: menuPagination.pageNo,
      pageSize: menuPagination.pageSize,
      menuName: trimOrUndefined(menuQuery.menuName),
      menuType: trimOrUndefined(menuQuery.menuType),
      moduleCode: trimOrUndefined(menuQuery.moduleCode),
      status: trimOrUndefined(menuQuery.status),
      visible: typeof menuQuery.visible === 'boolean' ? menuQuery.visible : undefined
    }
  }

  function buildDeptListQuery(): DeptListQuery {
    return {
      pageNo: deptPagination.pageNo,
      pageSize: deptPagination.pageSize,
      deptCode: trimOrUndefined(deptQuery.deptCode),
      deptName: trimOrUndefined(deptQuery.deptName),
      status: trimOrUndefined(deptQuery.status)
    }
  }

  function buildPostListQuery(): PostListQuery {
    return {
      pageNo: postPagination.pageNo,
      pageSize: postPagination.pageSize,
      postCode: trimOrUndefined(postQuery.postCode),
      postName: trimOrUndefined(postQuery.postName),
      status: trimOrUndefined(postQuery.status)
    }
  }

  function buildDictTypeListQuery(): DictTypeListQuery {
    return {
      pageNo: dictTypePagination.pageNo,
      pageSize: dictTypePagination.pageSize,
      dictCode: trimOrUndefined(dictTypeQuery.dictCode),
      dictName: trimOrUndefined(dictTypeQuery.dictName),
      status: trimOrUndefined(dictTypeQuery.status)
    }
  }

  function buildDictItemListQuery(): DictItemListQuery {
    return {
      pageNo: dictItemPagination.pageNo,
      pageSize: dictItemPagination.pageSize,
      dictCode: trimOrUndefined(activeDictCode.value),
      itemLabel: trimOrUndefined(dictItemQuery.itemLabel),
      itemValue: trimOrUndefined(dictItemQuery.itemValue),
      status: trimOrUndefined(dictItemQuery.status)
    }
  }

  function buildModuleListQuery(): ModuleListQuery {
    return {
      pageNo: modulePagination.pageNo,
      pageSize: modulePagination.pageSize,
      moduleCode: trimOrUndefined(moduleQuery.moduleCode),
      moduleName: trimOrUndefined(moduleQuery.moduleName),
      ownerName: trimOrUndefined(moduleQuery.ownerName),
      status: trimOrUndefined(moduleQuery.status)
    }
  }

  function buildLoginLogListQuery(): LoginLogListQuery {
    return {
      pageNo: loginLogPagination.pageNo,
      pageSize: loginLogPagination.pageSize,
      username: trimOrUndefined(loginLogQuery.username),
      loginStatus: trimOrUndefined(loginLogQuery.loginStatus),
      loginIp: trimOrUndefined(loginLogQuery.loginIp)
    }
  }

  function buildOperLogListQuery(): OperLogListQuery {
    return {
      pageNo: operLogPagination.pageNo,
      pageSize: operLogPagination.pageSize,
      username: trimOrUndefined(operLogQuery.username),
      module: trimOrUndefined(operLogQuery.module),
      operation: trimOrUndefined(operLogQuery.operation),
      resultStatus: trimOrUndefined(operLogQuery.resultStatus)
    }
  }

  function buildRiskRecordListQuery(): RiskRecordListQuery {
    return {
      pageNo: riskRecordPagination.pageNo,
      pageSize: riskRecordPagination.pageSize,
      riskType: trimOrUndefined(riskRecordQuery.riskType),
      riskTarget: trimOrUndefined(riskRecordQuery.riskTarget),
      action: trimOrUndefined(riskRecordQuery.action)
    }
  }

  function requestUsers(): Promise<PageResult<UserView>> {
    return sysApi.users(buildUserListQuery())
  }

  function requestRoles(): Promise<PageResult<RoleView>> {
    return sysApi.roles(buildRoleListQuery())
  }

  function requestMenus(): Promise<PageResult<TreeNodeView>> {
    return sysApi.menus(buildMenuListQuery())
  }

  function requestDepts(): Promise<PageResult<TreeNodeView>> {
    return sysApi.depts(buildDeptListQuery())
  }

  function requestPosts(): Promise<PageResult<SimpleRecord>> {
    return sysApi.posts(buildPostListQuery())
  }

  function requestDictTypes(): Promise<PageResult<SimpleRecord>> {
    return sysApi.dictTypes(buildDictTypeListQuery())
  }

  function requestDictItems(): Promise<PageResult<SimpleRecord>> {
    return activeDictCode.value ? sysApi.dictItems(buildDictItemListQuery()) : Promise.resolve(createEmptyPageResult<SimpleRecord>(dictItemPagination))
  }

  function requestModules(): Promise<PageResult<SimpleRecord>> {
    return sysApi.modules(buildModuleListQuery())
  }

  function requestLoginLogs(): Promise<PageResult<SimpleRecord>> {
    return sysApi.loginLogs(buildLoginLogListQuery())
  }

  function requestOperLogs(): Promise<PageResult<SimpleRecord>> {
    return sysApi.operLogs(buildOperLogListQuery())
  }

  function requestRiskRecords(): Promise<PageResult<SimpleRecord>> {
    return sysApi.riskRecords(buildRiskRecordListQuery())
  }

  function applyUserPage(page: PageResult<UserView>): void {
    applyPage(page, userPagination, (records) => {
      state.users = records
    })
    selectedUsers.value = []
  }

  function applyRolePage(page: PageResult<RoleView>): void {
    applyPage(page, rolePagination, (records) => {
      state.roles = records
    })
    selectedRoles.value = []
  }

  function applyMenuPage(page: PageResult<TreeNodeView>): void {
    applyPage(page, menuPagination, (records) => {
      state.menus = records
    })
  }

  function applyDeptPage(page: PageResult<TreeNodeView>): void {
    applyPage(page, deptPagination, (records) => {
      state.depts = records
    })
  }

  function applyPostPage(page: PageResult<SimpleRecord>): void {
    applyPage(page, postPagination, (records) => {
      state.posts = records
    })
    selectedPosts.value = []
  }

  function applyDictTypePage(page: PageResult<SimpleRecord>): void {
    applyPage(page, dictTypePagination, (records) => {
      state.dictTypes = records
    })
    selectedDictTypes.value = []
  }

  function applyDictItemPage(page: PageResult<SimpleRecord>): void {
    applyPage(page, dictItemPagination, (records) => {
      state.dictItems = records
    })
    selectedDictItems.value = []
  }

  function applyModulePage(page: PageResult<SimpleRecord>): void {
    applyPage(page, modulePagination, (records) => {
      state.modules = records
    })
    selectedModules.value = []
  }

  function applyLoginLogPage(page: PageResult<SimpleRecord>): void {
    applyPage(page, loginLogPagination, (records) => {
      state.loginLogs = records
    })
  }

  function applyOperLogPage(page: PageResult<SimpleRecord>): void {
    applyPage(page, operLogPagination, (records) => {
      state.operLogs = records
    })
  }

  function applyRiskRecordPage(page: PageResult<SimpleRecord>): void {
    applyPage(page, riskRecordPagination, (records) => {
      state.riskRecords = records
    })
  }

  async function loadReferenceData(): Promise<void> {
    const [roles, menus, depts, posts] = await Promise.all([
      sysApi.allRoles(),
      sysApi.allMenuTree(),
      sysApi.deptTree(),
      sysApi.allPosts()
    ])
    roleOptions.value = roles
    menuTreeOptions.value = menus
    deptTreeOptions.value = depts
    postOptions.value = posts
  }

  async function loadAll(): Promise<void> {
    await withLoading(async () => {
      const [userPage, rolePage, menuPage, deptPage, postPage, dictPage, modulePage, loginLogPage, operLogPage, riskPage] =
        await Promise.all([
          requestUsers(),
          requestRoles(),
          requestMenus(),
          requestDepts(),
          requestPosts(),
          requestDictTypes(),
          requestModules(),
          requestLoginLogs(),
          requestOperLogs(),
          requestRiskRecords()
        ])

      applyUserPage(userPage)
      applyRolePage(rolePage)
      applyMenuPage(menuPage)
      applyDeptPage(deptPage)
      applyPostPage(postPage)
      applyModulePage(modulePage)
      applyLoginLogPage(loginLogPage)
      applyOperLogPage(operLogPage)
      applyRiskRecordPage(riskPage)
      applyDictTypePage(dictPage)
      state.dictItems = []
      applyDictItemPage(await requestDictItems())

      await loadReferenceData()
    })
  }

  async function loadUsers(options: { showLoading?: boolean } = {}): Promise<void> {
    const page = await withLoading(() => requestUsers(), options.showLoading ?? true)
    applyUserPage(page)
  }

  async function loadRoles(options: { showLoading?: boolean } = {}): Promise<void> {
    const page = await withLoading(() => requestRoles(), options.showLoading ?? true)
    applyRolePage(page)
  }

  async function loadMenus(options: { showLoading?: boolean } = {}): Promise<void> {
    const page = await withLoading(() => requestMenus(), options.showLoading ?? true)
    applyMenuPage(page)
  }

  async function loadDepts(options: { showLoading?: boolean } = {}): Promise<void> {
    const page = await withLoading(() => requestDepts(), options.showLoading ?? true)
    applyDeptPage(page)
  }

  async function loadPosts(options: { showLoading?: boolean } = {}): Promise<void> {
    const page = await withLoading(() => requestPosts(), options.showLoading ?? true)
    applyPostPage(page)
  }

  async function loadDictTypes(options: { showLoading?: boolean } = {}): Promise<void> {
    const page = await withLoading(() => requestDictTypes(), options.showLoading ?? true)
    applyDictTypePage(page)
  }

  async function loadDictItems(options: { showLoading?: boolean } = {}): Promise<void> {
    const page = await withLoading(() => requestDictItems(), options.showLoading ?? true)
    applyDictItemPage(page)
  }

  async function loadModules(options: { showLoading?: boolean } = {}): Promise<void> {
    const page = await withLoading(() => requestModules(), options.showLoading ?? true)
    applyModulePage(page)
  }

  async function loadLoginLogs(options: { showLoading?: boolean } = {}): Promise<void> {
    const page = await withLoading(() => requestLoginLogs(), options.showLoading ?? true)
    applyLoginLogPage(page)
  }

  async function loadOperLogs(options: { showLoading?: boolean } = {}): Promise<void> {
    const page = await withLoading(() => requestOperLogs(), options.showLoading ?? true)
    applyOperLogPage(page)
  }

  async function loadRiskRecords(options: { showLoading?: boolean } = {}): Promise<void> {
    const page = await withLoading(() => requestRiskRecords(), options.showLoading ?? true)
    applyRiskRecordPage(page)
  }

  async function searchUsers(): Promise<void> {
    userPagination.pageNo = 1
    await loadUsers()
  }

  async function resetUserQuery(): Promise<void> {
    userQuery.username = ''
    userQuery.nickname = ''
    userQuery.phone = ''
    userQuery.status = ''
    userPagination.pageNo = 1
    await loadUsers()
  }

  async function handleUserPageChange(pagination: TablePagination): Promise<void> {
    userPagination.pageNo = pagination.pageNo
    userPagination.pageSize = pagination.pageSize
    await loadUsers()
  }

  async function searchRoles(): Promise<void> {
    rolePagination.pageNo = 1
    await loadRoles()
  }

  async function resetRoleQuery(): Promise<void> {
    roleQuery.roleCode = ''
    roleQuery.roleName = ''
    roleQuery.status = ''
    rolePagination.pageNo = 1
    await loadRoles()
  }

  async function handleRolePageChange(pagination: TablePagination): Promise<void> {
    rolePagination.pageNo = pagination.pageNo
    rolePagination.pageSize = pagination.pageSize
    await loadRoles()
  }

  async function searchMenus(): Promise<void> {
    menuPagination.pageNo = 1
    await loadMenus()
  }

  async function resetMenuQuery(): Promise<void> {
    menuQuery.menuName = ''
    menuQuery.menuType = ''
    menuQuery.moduleCode = ''
    menuQuery.status = ''
    menuQuery.visible = undefined
    menuPagination.pageNo = 1
    await loadMenus()
  }

  async function handleMenuPageChange(pagination: TablePagination): Promise<void> {
    menuPagination.pageNo = pagination.pageNo
    menuPagination.pageSize = pagination.pageSize
    await loadMenus()
  }

  async function searchDepts(): Promise<void> {
    deptPagination.pageNo = 1
    await loadDepts()
  }

  async function resetDeptQuery(): Promise<void> {
    deptQuery.deptCode = ''
    deptQuery.deptName = ''
    deptQuery.status = ''
    deptPagination.pageNo = 1
    await loadDepts()
  }

  async function handleDeptPageChange(pagination: TablePagination): Promise<void> {
    deptPagination.pageNo = pagination.pageNo
    deptPagination.pageSize = pagination.pageSize
    await loadDepts()
  }

  async function searchPosts(): Promise<void> {
    postPagination.pageNo = 1
    await loadPosts()
  }

  async function resetPostQuery(): Promise<void> {
    postQuery.postCode = ''
    postQuery.postName = ''
    postQuery.status = ''
    postPagination.pageNo = 1
    await loadPosts()
  }

  async function handlePostPageChange(pagination: TablePagination): Promise<void> {
    postPagination.pageNo = pagination.pageNo
    postPagination.pageSize = pagination.pageSize
    await loadPosts()
  }

  async function searchDictTypes(): Promise<void> {
    dictTypePagination.pageNo = 1
    await loadDictTypes()
  }

  async function resetDictTypeQuery(): Promise<void> {
    dictTypeQuery.dictCode = ''
    dictTypeQuery.dictName = ''
    dictTypeQuery.status = ''
    dictTypePagination.pageNo = 1
    await loadDictTypes()
  }

  async function handleDictTypePageChange(pagination: TablePagination): Promise<void> {
    dictTypePagination.pageNo = pagination.pageNo
    dictTypePagination.pageSize = pagination.pageSize
    await loadDictTypes()
  }

  async function searchDictItems(): Promise<void> {
    dictItemPagination.pageNo = 1
    await loadDictItems()
  }

  async function resetDictItemQuery(): Promise<void> {
    dictItemQuery.itemLabel = ''
    dictItemQuery.itemValue = ''
    dictItemQuery.status = ''
    dictItemPagination.pageNo = 1
    await loadDictItems()
  }

  async function handleDictItemPageChange(pagination: TablePagination): Promise<void> {
    dictItemPagination.pageNo = pagination.pageNo
    dictItemPagination.pageSize = pagination.pageSize
    await loadDictItems()
  }

  async function searchModules(): Promise<void> {
    modulePagination.pageNo = 1
    await loadModules()
  }

  async function resetModuleQuery(): Promise<void> {
    moduleQuery.moduleCode = ''
    moduleQuery.moduleName = ''
    moduleQuery.ownerName = ''
    moduleQuery.status = ''
    modulePagination.pageNo = 1
    await loadModules()
  }

  async function handleModulePageChange(pagination: TablePagination): Promise<void> {
    modulePagination.pageNo = pagination.pageNo
    modulePagination.pageSize = pagination.pageSize
    await loadModules()
  }

  async function searchLoginLogs(): Promise<void> {
    loginLogPagination.pageNo = 1
    await loadLoginLogs()
  }

  async function resetLoginLogQuery(): Promise<void> {
    loginLogQuery.username = ''
    loginLogQuery.loginStatus = ''
    loginLogQuery.loginIp = ''
    loginLogPagination.pageNo = 1
    await loadLoginLogs()
  }

  async function handleLoginLogPageChange(pagination: TablePagination): Promise<void> {
    loginLogPagination.pageNo = pagination.pageNo
    loginLogPagination.pageSize = pagination.pageSize
    await loadLoginLogs()
  }

  async function searchOperLogs(): Promise<void> {
    operLogPagination.pageNo = 1
    await loadOperLogs()
  }

  async function resetOperLogQuery(): Promise<void> {
    operLogQuery.username = ''
    operLogQuery.module = ''
    operLogQuery.operation = ''
    operLogQuery.resultStatus = ''
    operLogPagination.pageNo = 1
    await loadOperLogs()
  }

  async function handleOperLogPageChange(pagination: TablePagination): Promise<void> {
    operLogPagination.pageNo = pagination.pageNo
    operLogPagination.pageSize = pagination.pageSize
    await loadOperLogs()
  }

  async function searchRiskRecords(): Promise<void> {
    riskRecordPagination.pageNo = 1
    await loadRiskRecords()
  }

  async function resetRiskRecordQuery(): Promise<void> {
    riskRecordQuery.riskType = ''
    riskRecordQuery.riskTarget = ''
    riskRecordQuery.action = ''
    riskRecordPagination.pageNo = 1
    await loadRiskRecords()
  }

  async function handleRiskRecordPageChange(pagination: TablePagination): Promise<void> {
    riskRecordPagination.pageNo = pagination.pageNo
    riskRecordPagination.pageSize = pagination.pageSize
    await loadRiskRecords()
  }

  function handleUserSelectionChange(rows: UserView[]): void {
    selectedUsers.value = rows
  }

  function handleRoleSelectionChange(rows: RoleView[]): void {
    selectedRoles.value = rows
  }

  function handlePostSelectionChange(rows: SimpleRecord[]): void {
    selectedPosts.value = rows
  }

  function handleDictTypeSelectionChange(rows: SimpleRecord[]): void {
    selectedDictTypes.value = rows
  }

  function handleDictItemSelectionChange(rows: SimpleRecord[]): void {
    selectedDictItems.value = rows
  }

  function handleModuleSelectionChange(rows: SimpleRecord[]): void {
    selectedModules.value = rows
  }

  function preparePageAfterDelete(pagination: TablePagination, currentLength: number, deletedCount = 1): void {
    if (pagination.pageNo > 1 && deletedCount >= currentLength) {
      pagination.pageNo = Math.max(1, pagination.pageNo - 1)
    }
  }

  async function deleteSelectedUsers(): Promise<void> {
    if (!selectedUsers.value.length) {
      ElMessage.warning('请先选择要删除的用户')
      return
    }

    const rows = [...selectedUsers.value]
    try {
      await ElMessageBox.confirm(`确认删除选中的 ${rows.length} 个用户吗？`, '删除确认', { type: 'warning' })
    } catch {
      return
    }

    loading.value = true
    try {
      for (const row of rows) {
        await sysApi.deleteUser(row.id)
      }
      ElMessage.success('删除成功')
      preparePageAfterDelete(userPagination, state.users.length, rows.length)
      await loadUsers({ showLoading: false })
    } catch (error) {
      showActionError(error)
      await loadUsers({ showLoading: false })
    } finally {
      loading.value = false
    }
  }

  async function deleteSelectedRoles(): Promise<void> {
    if (!selectedRoles.value.length) {
      ElMessage.warning('请先选择要删除的角色')
      return
    }

    const rows = [...selectedRoles.value]
    try {
      await ElMessageBox.confirm(`确认删除选中的 ${rows.length} 个角色吗？`, '删除确认', { type: 'warning' })
    } catch {
      return
    }

    loading.value = true
    try {
      for (const row of rows) {
        await sysApi.deleteRole(row.id)
      }
      ElMessage.success('删除成功')
      preparePageAfterDelete(rolePagination, state.roles.length, rows.length)
      await loadAll()
    } catch (error) {
      showActionError(error)
      await loadAll()
    } finally {
      loading.value = false
    }
  }

  async function deleteSelectedPosts(): Promise<void> {
    if (!selectedPosts.value.length) {
      ElMessage.warning('请先选择要删除的岗位')
      return
    }

    const rows = [...selectedPosts.value]
    try {
      await ElMessageBox.confirm(`确认删除选中的 ${rows.length} 个岗位吗？`, '删除确认', { type: 'warning' })
    } catch {
      return
    }

    loading.value = true
    try {
      for (const row of rows) {
        await sysApi.deletePost(row.id)
      }
      ElMessage.success('删除成功')
      preparePageAfterDelete(postPagination, state.posts.length, rows.length)
      await loadAll()
    } catch (error) {
      showActionError(error)
      await loadAll()
    } finally {
      loading.value = false
    }
  }

  async function deleteSelectedDictTypes(): Promise<void> {
    if (!selectedDictTypes.value.length) {
      ElMessage.warning('请先选择要删除的字典类型')
      return
    }

    const rows = [...selectedDictTypes.value]
    try {
      await ElMessageBox.confirm(`确认删除选中的 ${rows.length} 个字典类型吗？`, '删除确认', { type: 'warning' })
    } catch {
      return
    }

    loading.value = true
    try {
      for (const row of rows) {
        await sysApi.deleteDictType(row.id)
      }
      ElMessage.success('删除成功')
      preparePageAfterDelete(dictTypePagination, state.dictTypes.length, rows.length)
      await loadDictTypes({ showLoading: false })
    } catch (error) {
      showActionError(error)
      await loadDictTypes({ showLoading: false })
    } finally {
      loading.value = false
    }
  }

  async function deleteSelectedDictItems(): Promise<void> {
    if (!selectedDictItems.value.length) {
      ElMessage.warning('请先选择要删除的字典数据')
      return
    }

    const rows = [...selectedDictItems.value]
    try {
      await ElMessageBox.confirm(`确认删除选中的 ${rows.length} 个字典数据吗？`, '删除确认', { type: 'warning' })
    } catch {
      return
    }

    loading.value = true
    try {
      for (const row of rows) {
        await sysApi.deleteDictItem(row.id)
      }
      ElMessage.success('删除成功')
      preparePageAfterDelete(dictItemPagination, state.dictItems.length, rows.length)
      await loadDictItems({ showLoading: false })
    } catch (error) {
      showActionError(error)
      await loadDictItems({ showLoading: false })
    } finally {
      loading.value = false
    }
  }

  async function deleteSelectedModules(): Promise<void> {
    if (!selectedModules.value.length) {
      ElMessage.warning('请先选择要删除的模块')
      return
    }

    const rows = [...selectedModules.value]
    try {
      await ElMessageBox.confirm(`确认删除选中的 ${rows.length} 个模块吗？`, '删除确认', { type: 'warning' })
    } catch {
      return
    }

    loading.value = true
    try {
      for (const row of rows) {
        await sysApi.deleteModule(row.id)
      }
      ElMessage.success('删除成功')
      preparePageAfterDelete(modulePagination, state.modules.length, rows.length)
      await loadAll()
    } catch (error) {
      showActionError(error)
      await loadAll()
    } finally {
      loading.value = false
    }
  }

  async function reloadDictItems(): Promise<void> {
    await loadDictItems({ showLoading: false })
  }

  function syncRoute(pathOrFullPath: string): void {
    const route = parseSysLocation(pathOrFullPath)
    activeRoute.value = route.path
    if (route.path === '/sys/dicts/items') {
      activeDictCode.value = route.dictCode
    }
  }

  function openDictItemsRoute(row: SimpleRecord): string {
    const dictCode = String(row.dictCode ?? '')
    dictItemQuery.itemLabel = ''
    dictItemQuery.itemValue = ''
    dictItemQuery.status = ''
    dictItemPagination.pageNo = 1
    return dictCode ? `/sys/dicts/items?dictCode=${encodeURIComponent(dictCode)}` : '/sys/dicts/items'
  }

  function backToDictTypesRoute(): string {
    return '/sys/dicts'
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
    userRoleIds.value = row ? roleOptions.value.filter((role) => row.roles.includes(role.roleCode)).map((role) => role.id) : []
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
    if (!editingUserId.value) {
      userPagination.pageNo = 1
    }
    await loadUsers()
  }

  async function deleteUser(row: UserView): Promise<void> {
    await confirmDelete(
      `确认删除用户 ${row.username} 吗？`,
      async () => sysApi.deleteUser(row.id),
      async () => {
        preparePageAfterDelete(userPagination, state.users.length)
        await loadUsers()
      }
    )
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
    if (!editingRoleId.value) {
      rolePagination.pageNo = 1
    }
    await loadAll()
  }

  async function deleteRole(row: RoleView): Promise<void> {
    await confirmDelete(`确认删除角色 ${row.roleName} 吗？`, async () => sysApi.deleteRole(row.id), async () => {
      preparePageAfterDelete(rolePagination, state.roles.length)
      await loadAll()
    })
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
    await loadUsers()
  }

  function openMenuDialog(row?: TreeNodeView): void {
    editingMenuId.value = row?.id
    Object.assign(menuForm, row ?? { parentId: 0, menuName: '', menuType: 'MENU', moduleCode: 'sys', path: '', component: '', permission: '', icon: '', sortNo: 0, visible: true, status: 'ENABLED' })
    menuDialogVisible.value = true
  }

  function openMenuChildDialog(parent: TreeNodeView): void {
    editingMenuId.value = undefined
    Object.assign(menuForm, {
      parentId: parent.id,
      menuName: '',
      menuType: 'MENU',
      moduleCode: String(parent.moduleCode ?? 'sys'),
      path: '',
      component: '',
      permission: '',
      icon: '',
      sortNo: Number(parent.sortNo ?? 0),
      visible: true,
      status: 'ENABLED'
    })
    menuDialogVisible.value = true
  }

  async function saveMenu(): Promise<void> {
    const result = await executeMutation(() => sysApi.saveMenu(editingMenuId.value, menuForm))
    if (!result.ok) {
      return
    }
    menuDialogVisible.value = false
    if (!editingMenuId.value) {
      menuPagination.pageNo = 1
    }
    await loadAll()
  }

  async function deleteMenu(row: TreeNodeView): Promise<void> {
    await confirmDelete(`确认删除菜单 ${row.menuName} 吗？`, async () => sysApi.deleteMenu(row.id), async () => {
      preparePageAfterDelete(menuPagination, state.menus.length)
      await loadAll()
    })
  }

  function openDeptDialog(row?: TreeNodeView): void {
    editingDeptId.value = row?.id
    Object.assign(deptForm, row ?? { parentId: 0, deptCode: '', deptName: '', sortNo: 0, status: 'ENABLED' })
    deptDialogVisible.value = true
  }

  function openDeptChildDialog(parent: TreeNodeView): void {
    editingDeptId.value = undefined
    Object.assign(deptForm, {
      parentId: parent.id,
      deptCode: '',
      deptName: '',
      sortNo: Number(parent.sortNo ?? 0),
      status: 'ENABLED'
    })
    deptDialogVisible.value = true
  }

  async function saveDept(): Promise<void> {
    const result = await executeMutation(() => sysApi.saveDept(editingDeptId.value, deptForm))
    if (!result.ok) {
      return
    }
    deptDialogVisible.value = false
    if (!editingDeptId.value) {
      deptPagination.pageNo = 1
    }
    await loadAll()
  }

  async function deleteDept(row: TreeNodeView): Promise<void> {
    await confirmDelete(`确认删除部门 ${row.deptName} 吗？`, async () => sysApi.deleteDept(row.id), async () => {
      preparePageAfterDelete(deptPagination, state.depts.length)
      await loadAll()
    })
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
    if (!editingPostId.value) {
      postPagination.pageNo = 1
    }
    await loadAll()
  }

  async function deletePost(row: SimpleRecord): Promise<void> {
    await confirmDelete(`确认删除岗位 ${row.postName} 吗？`, async () => sysApi.deletePost(row.id), async () => {
      preparePageAfterDelete(postPagination, state.posts.length)
      await loadAll()
    })
  }

  function openDictTypeDialog(row?: SimpleRecord): void {
    editingDictTypeId.value = row?.id
    Object.assign(dictTypeForm, row ?? { dictCode: '', dictName: '', status: 'ENABLED' })
    dictTypeDialogVisible.value = true
  }

  async function saveDictType(): Promise<void> {
    const result = await executeMutation(() => sysApi.saveDictType(editingDictTypeId.value, dictTypeForm))
    if (!result.ok) {
      return
    }
    dictTypeDialogVisible.value = false
    if (!editingDictTypeId.value) {
      dictTypePagination.pageNo = 1
    }
    await loadDictTypes()
  }

  async function deleteDictType(row: SimpleRecord): Promise<void> {
    await confirmDelete(`确认删除字典 ${row.dictName} 吗？`, async () => sysApi.deleteDictType(row.id), async () => {
      preparePageAfterDelete(dictTypePagination, state.dictTypes.length)
      await loadDictTypes()
    })
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
    if (!editingDictItemId.value) {
      dictItemPagination.pageNo = 1
    }
    await loadDictItems()
  }

  async function deleteDictItem(row: SimpleRecord): Promise<void> {
    await confirmDelete(`确认删除字典数据 ${row.itemLabel} 吗？`, async () => sysApi.deleteDictItem(row.id), async () => {
      preparePageAfterDelete(dictItemPagination, state.dictItems.length)
      await loadDictItems()
    })
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
    if (!editingModuleId.value) {
      modulePagination.pageNo = 1
    }
    await loadAll()
  }

  async function deleteModule(row: SimpleRecord): Promise<void> {
    await confirmDelete(`确认删除模块 ${row.moduleName} 吗？`, async () => sysApi.deleteModule(row.id), async () => {
      preparePageAfterDelete(modulePagination, state.modules.length)
      await loadAll()
    })
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
    roleOptions,
    menuTreeOptions,
    deptTreeOptions,
    postOptions,
    userQuery,
    roleQuery,
    menuQuery,
    deptQuery,
    postQuery,
    dictTypeQuery,
    dictItemQuery,
    moduleQuery,
    loginLogQuery,
    operLogQuery,
    riskRecordQuery,
    userPagination,
    rolePagination,
    menuPagination,
    deptPagination,
    postPagination,
    dictTypePagination,
    dictItemPagination,
    modulePagination,
    loginLogPagination,
    operLogPagination,
    riskRecordPagination,
    userSelectionCount,
    roleSelectionCount,
    postSelectionCount,
    dictTypeSelectionCount,
    dictItemSelectionCount,
    moduleSelectionCount,
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
    loadUsers,
    loadRoles,
    loadMenus,
    loadDepts,
    loadPosts,
    loadDictTypes,
    loadDictItems,
    loadModules,
    loadLoginLogs,
    loadOperLogs,
    loadRiskRecords,
    searchUsers,
    resetUserQuery,
    handleUserPageChange,
    searchRoles,
    resetRoleQuery,
    handleRolePageChange,
    searchMenus,
    resetMenuQuery,
    handleMenuPageChange,
    searchDepts,
    resetDeptQuery,
    handleDeptPageChange,
    searchPosts,
    resetPostQuery,
    handlePostPageChange,
    searchDictTypes,
    resetDictTypeQuery,
    handleDictTypePageChange,
    searchDictItems,
    resetDictItemQuery,
    handleDictItemPageChange,
    searchModules,
    resetModuleQuery,
    handleModulePageChange,
    searchLoginLogs,
    resetLoginLogQuery,
    handleLoginLogPageChange,
    searchOperLogs,
    resetOperLogQuery,
    handleOperLogPageChange,
    searchRiskRecords,
    resetRiskRecordQuery,
    handleRiskRecordPageChange,
    handleUserSelectionChange,
    handleRoleSelectionChange,
    handlePostSelectionChange,
    handleDictTypeSelectionChange,
    handleDictItemSelectionChange,
    handleModuleSelectionChange,
    reloadDictItems,
    syncRoute,
    openDictItemsRoute,
    backToDictTypesRoute,
    resolveSysMenus,
    handleUserCommand,
    submitPassword,
    openUserDialog,
    saveUser,
    deleteSelectedUsers,
    deleteSelectedRoles,
    deleteSelectedPosts,
    deleteSelectedDictTypes,
    deleteSelectedDictItems,
    deleteSelectedModules,
    deleteUser,
    openRoleDialog,
    saveRole,
    deleteRole,
    openRoleMenuDialog,
    saveRoleMenus,
    openPermissionDialog,
    saveWarehousePermission,
    openMenuDialog,
    openMenuChildDialog,
    saveMenu,
    deleteMenu,
    openDeptDialog,
    openDeptChildDialog,
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
  return parseSysLocation(resolveSysLocationFromLocation()).path
}

export function resolveSysLocationFromLocation(): string {
  const pathname = window.location.pathname
  const redirectPath = new URLSearchParams(window.location.search).get('redirect')
  if (pathname === '/sys' || pathname.startsWith('/sys/')) {
    return `${pathname}${window.location.search}${window.location.hash}`
  }
  const basePath = normalizeBasePath(import.meta.env.BASE_URL)
  if (basePath !== '/' && (pathname === basePath || pathname.startsWith(`${basePath}/`))) {
    const nestedPath = pathname.slice(basePath.length)
    return nestedPath && nestedPath !== '/' ? `${nestedPath}${window.location.search}${window.location.hash}` : redirectPath ?? '/sys/users'
  }
  return redirectPath ?? '/sys/users'
}

function normalizeBasePath(baseUrl: string): string {
  const normalized = `/${baseUrl.replace(/^\/+|\/+$/g, '')}`
  return normalized === '/' ? '/' : normalized
}

function resolveActiveRoute(pathOrFullPath: string): ValidSysRoute {
  return parseSysLocation(pathOrFullPath).path
}

function parseSysLocation(pathOrFullPath: string): { path: ValidSysRoute; dictCode: string } {
  const url = new URL(pathOrFullPath || '/sys/users', window.location.origin)
  return {
    path: normalizeSysRoute(url.pathname),
    dictCode: url.searchParams.get('dictCode') ?? ''
  }
}
