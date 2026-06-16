import {
  clearTokens,
  getRefreshToken,
  request,
  setAccessToken,
  setCurrentUser,
  setRefreshToken,
  setRefreshTokenHandler
} from '@smartwarehouse/platform-sdk'
import type { LoginUser, MenuItem, PageResult } from '@smartwarehouse/platform-types'

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface ChangePasswordPayload {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}

export interface UserView extends Record<string, unknown> {
  id: number
  username: string
  nickname: string
  phone?: string
  email?: string
  deptId?: number
  postId?: number
  status: string
  roles: string[]
  warehouseIds: number[]
}

export interface RoleView extends Record<string, unknown> {
  id: number
  roleCode: string
  roleName: string
  dataScope: string
  status: string
  menuIds: number[]
}

export interface TreeNodeView extends Record<string, unknown> {
  id: number
  parentId: number
  menuType?: string
  menuName?: string
  path?: string
  component?: string
  permission?: string
  icon?: string
  visible?: boolean
  sortNo?: number
  deptCode?: string
  deptName?: string
  moduleCode?: string
  status?: string
  children?: TreeNodeView[]
}

export interface SimpleRecord extends Record<string, unknown> {
  id: number
  moduleCode?: string
  moduleName?: string
  routePrefix?: string
  entryUrl?: string
  remoteName?: string
  remoteEntry?: string
  exposedModule?: string
  apiPrefix?: string
  ownerType?: string
  ownerName?: string
  dictCode?: string
  dictName?: string
  itemLabel?: string
  itemValue?: string
  postCode?: string
  postName?: string
  sortNo?: number
  status?: string
}

export interface UserForm {
  username: string
  password?: string
  nickname: string
  phone?: string
  email?: string
  deptId?: number
  postId?: number
  status: string
}

export interface RoleForm {
  roleCode: string
  roleName: string
  dataScope: string
  status: string
  remark?: string
}

export interface ModuleForm {
  moduleCode: string
  moduleName: string
  routePrefix: string
  entryUrl: string
  remoteName?: string
  remoteEntry?: string
  exposedModule?: string
  apiPrefix: string
  ownerType: string
  ownerName: string
  status: string
  sortNo: number
}

export interface MenuForm {
  parentId: number
  menuName: string
  menuType: string
  moduleCode: string
  path: string
  component?: string
  permission?: string
  icon?: string
  sortNo: number
  visible: boolean
  status: string
}

export interface DeptForm {
  parentId: number
  deptCode: string
  deptName: string
  sortNo: number
  status: string
}

export interface PostForm {
  postCode: string
  postName: string
  sortNo: number
  status: string
}

export interface DictTypeForm {
  dictCode: string
  dictName: string
  status: string
}

export interface DictItemForm {
  dictCode: string
  itemLabel: string
  itemValue: string
  sortNo: number
  status: string
}

export interface SysPageState {
  users: UserView[]
  roles: RoleView[]
  menus: TreeNodeView[]
  depts: TreeNodeView[]
  posts: SimpleRecord[]
  dictTypes: SimpleRecord[]
  dictItems: SimpleRecord[]
  modules: SimpleRecord[]
  loginLogs: SimpleRecord[]
  operLogs: SimpleRecord[]
  riskRecords: SimpleRecord[]
}

setRefreshTokenHandler(async () => {
  const refreshToken = getRefreshToken()
  if (!refreshToken) {
    return undefined
  }
  const result = await request<LoginResponse>({
    url: '/sys/auth/refresh',
    method: 'POST',
    body: { refreshToken }
  })
  setAccessToken(result.accessToken)
  setRefreshToken(result.refreshToken)
  return result.accessToken
})

export async function login(username: string, password: string): Promise<LoginResponse> {
  const result = await request<LoginResponse>({
    url: '/sys/auth/login',
    method: 'POST',
    body: { username, password }
  })
  setAccessToken(result.accessToken)
  setRefreshToken(result.refreshToken)
  return result
}

export async function logout(): Promise<void> {
  try {
    await request<void>({ url: '/sys/auth/logout', method: 'POST' })
  } finally {
    clearTokens()
    setCurrentUser(undefined)
  }
}

export async function loadMe(): Promise<LoginUser> {
  const user = await request<LoginUser>({ url: '/sys/auth/me' })
  setCurrentUser(user)
  return user
}

export function changePassword(payload: ChangePasswordPayload): Promise<void> {
  return request<void>({
    url: '/sys/auth/password',
    method: 'PUT',
    body: payload
  })
}

export function loadMenus(): Promise<MenuItem[]> {
  return request<MenuItem[]>({ url: '/sys/menus/tree' })
}

export const sysApi = {
  users: () => request<PageResult<UserView>>({ url: '/sys/users' }),
  saveUser: (id: number | undefined, body: UserForm) =>
    request<UserView>({ url: id ? `/sys/users/${id}` : '/sys/users', method: id ? 'PUT' : 'POST', body }),
  deleteUser: (id: number) => request<void>({ url: `/sys/users/${id}`, method: 'DELETE' }),
  updateUserStatus: (id: number, status: string) =>
    request<UserView>({ url: `/sys/users/${id}/status`, method: 'PUT', body: { status } }),
  updateUserRoles: (id: number, ids: number[]) =>
    request<void>({ url: `/sys/users/${id}/roles`, method: 'PUT', body: { ids } }),
  updateUserWarehouses: (id: number, ids: number[]) =>
    request<void>({ url: `/sys/users/${id}/warehouses`, method: 'PUT', body: { ids } }),
  roles: () => request<PageResult<RoleView>>({ url: '/sys/roles' }),
  saveRole: (id: number | undefined, body: RoleForm) =>
    request<RoleView>({ url: id ? `/sys/roles/${id}` : '/sys/roles', method: id ? 'PUT' : 'POST', body }),
  deleteRole: (id: number) => request<void>({ url: `/sys/roles/${id}`, method: 'DELETE' }),
  updateRoleMenus: (id: number, ids: number[]) =>
    request<void>({ url: `/sys/roles/${id}/menus`, method: 'PUT', body: { ids } }),
  menus: () => request<TreeNodeView[]>({ url: '/sys/menus/tree' }),
  saveMenu: (id: number | undefined, body: MenuForm) =>
    request<TreeNodeView>({ url: id ? `/sys/menus/${id}` : '/sys/menus', method: id ? 'PUT' : 'POST', body }),
  deleteMenu: (id: number) => request<void>({ url: `/sys/menus/${id}`, method: 'DELETE' }),
  depts: () => request<TreeNodeView[]>({ url: '/sys/depts/tree' }),
  saveDept: (id: number | undefined, body: DeptForm) =>
    request<TreeNodeView>({ url: id ? `/sys/depts/${id}` : '/sys/depts', method: id ? 'PUT' : 'POST', body }),
  deleteDept: (id: number) => request<void>({ url: `/sys/depts/${id}`, method: 'DELETE' }),
  posts: () => request<PageResult<SimpleRecord>>({ url: '/sys/posts' }),
  savePost: (id: number | undefined, body: PostForm) =>
    request<SimpleRecord>({ url: id ? `/sys/posts/${id}` : '/sys/posts', method: id ? 'PUT' : 'POST', body }),
  deletePost: (id: number) => request<void>({ url: `/sys/posts/${id}`, method: 'DELETE' }),
  dictTypes: () => request<PageResult<SimpleRecord>>({ url: '/sys/dict-types' }),
  saveDictType: (id: number | undefined, body: DictTypeForm) =>
    request<SimpleRecord>({ url: id ? `/sys/dict-types/${id}` : '/sys/dict-types', method: id ? 'PUT' : 'POST', body }),
  deleteDictType: (id: number) => request<void>({ url: `/sys/dict-types/${id}`, method: 'DELETE' }),
  dictItems: (dictCode: string) => request<SimpleRecord[]>({ url: '/sys/dict-items', params: { dictCode } }),
  saveDictItem: (id: number | undefined, body: DictItemForm) =>
    request<SimpleRecord>({ url: id ? `/sys/dict-items/${id}` : '/sys/dict-items', method: id ? 'PUT' : 'POST', body }),
  deleteDictItem: (id: number) => request<void>({ url: `/sys/dict-items/${id}`, method: 'DELETE' }),
  modules: () => request<PageResult<SimpleRecord>>({ url: '/sys/frontend-modules' }),
  saveModule: (id: number | undefined, body: ModuleForm) =>
    request<SimpleRecord>({ url: id ? `/sys/frontend-modules/${id}` : '/sys/frontend-modules', method: id ? 'PUT' : 'POST', body }),
  deleteModule: (id: number) => request<void>({ url: `/sys/frontend-modules/${id}`, method: 'DELETE' }),
  loginLogs: () => request<SimpleRecord[]>({ url: '/sys/login-logs' }),
  operLogs: () => request<SimpleRecord[]>({ url: '/sys/oper-logs' }),
  riskRecords: () => request<SimpleRecord[]>({ url: '/sys/risk-records' })
}

export async function loadSysPageState(activeDictCode?: string): Promise<SysPageState> {
  const [userPage, rolePage, menuTree, deptTree, postPage, dictPage, modulePage, loginLogList, operLogList, riskList] =
    await Promise.all([
      sysApi.users(),
      sysApi.roles(),
      sysApi.menus(),
      sysApi.depts(),
      sysApi.posts(),
      sysApi.dictTypes(),
      sysApi.modules(),
      sysApi.loginLogs(),
      sysApi.operLogs(),
      sysApi.riskRecords()
    ])

  const currentDictCode =
    activeDictCode && dictPage.records.some((item) => String(item.dictCode) === activeDictCode)
      ? activeDictCode
      : String(dictPage.records[0]?.dictCode ?? '')

  return {
    users: userPage.records,
    roles: rolePage.records,
    menus: menuTree,
    depts: deptTree,
    posts: postPage.records,
    dictTypes: dictPage.records,
    dictItems: currentDictCode ? await sysApi.dictItems(currentDictCode) : [],
    modules: modulePage.records,
    loginLogs: loginLogList,
    operLogs: operLogList,
    riskRecords: riskList
  }
}
