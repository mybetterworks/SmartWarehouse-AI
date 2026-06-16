<template>
  <main v-if="!user" class="portal-login">
    <section class="portal-login__intro">
      <p class="portal-login__eyebrow">SmartWarehouse-AI</p>
      <h1>统一门户入口</h1>
      <p>登录后保留统一顶部栏和内容区，工作台、系统管理和各业务模块都在同一壳层里切换。</p>
    </section>
    <section class="portal-login__panel">
      <LoginForm
        :loading="loginLoading"
        :risk-state="riskState"
        :captcha-target="captchaChallenge?.targetX"
        :captcha-verifier="verifyCurrentCaptcha"
        @submit="handleLogin"
        @captcha-reset="loadCaptcha"
      />
      <el-alert v-if="loginError" class="portal-login__error" type="error" :title="loginError" show-icon :closable="false" />
    </section>
  </main>

  <PlatformLayout
    v-else
    v-model:collapsed="collapsed"
    title="SmartWarehouse-AI"
    :menus="activeNavMenus"
    :breadcrumbs="breadcrumbs"
    :user="user"
    :active-path="currentPath"
    :show-aside="!isPortalRoute"
    :show-workbench-button="false"
    show-workbench-drawer-button
    :show-module-drawer-trigger="true"
    :module-entries="modules"
    :active-module-code="activeModule?.moduleCode"
    @logout="handleLogout"
    @user-command="handleUserCommand"
    @menu-click="handleMenuClick"
    @workbench-click="activateRoute('/portal')"
    @breadcrumb-click="handleBreadcrumbClick"
    @module-select="handleModuleSelect"
  >
    <template #subheader>
      <section class="portal-tabs-shell">
        <el-tabs class="portal-tabs" type="card" closable :model-value="activeTabId" @tab-change="handleTabChange" @tab-remove="handleTabRemove">
          <el-tab-pane v-for="tab in tabs" :key="tab.id" :name="tab.id" :closable="tab.closable">
            <template #label>
              <span class="portal-tabs__label">
                <el-icon class="portal-tabs__icon">
                  <component :is="tab.icon ? resolvePortalIcon(tab.icon) : resolveFallbackTabIcon(tab.moduleCode, tab.id)" />
                </el-icon>
                <span class="portal-tabs__text">{{ tab.title }}</span>
              </span>
            </template>
          </el-tab-pane>
        </el-tabs>
      </section>
    </template>

    <section class="portal-tab-view">
      <KeepAlive :max="maxCachedTabs">
        <PortalTabPane
          v-if="activeTab"
          :key="activeTab.id"
          :tab="activeTab"
          :modules="modules"
          :user="user"
          :workbench="workbench"
          :workbench-loading="workbenchLoading"
          @open-module="openModule"
          @navigate="activateRoute($event)"
          @retry="reloadPortal"
          @reload-workbench="reloadWorkbench"
          @route-change="handleHostedRouteChange"
        />
      </KeepAlive>
    </section>
  </PlatformLayout>

  <el-dialog v-model="profileDialogVisible" title="个人信息" width="520px">
    <el-descriptions :column="1" border>
      <el-descriptions-item label="账号">{{ user?.username }}</el-descriptions-item>
      <el-descriptions-item label="姓名">{{ user?.nickname }}</el-descriptions-item>
      <el-descriptions-item label="角色">{{ user?.roles?.join(', ') || '-' }}</el-descriptions-item>
      <el-descriptions-item label="仓库权限">{{ user?.warehouseIds?.join(', ') || '-' }}</el-descriptions-item>
    </el-descriptions>
  </el-dialog>

  <el-dialog v-model="passwordDialogVisible" title="修改密码" width="520px">
    <el-form :model="passwordForm" label-width="96px">
      <el-form-item label="旧密码">
        <el-input v-model="passwordForm.oldPassword" type="password" show-password />
      </el-form-item>
      <el-form-item label="新密码">
        <el-input v-model="passwordForm.newPassword" type="password" show-password />
      </el-form-item>
      <el-form-item label="确认密码">
        <el-input v-model="passwordForm.confirmPassword" type="password" show-password @keyup.enter="submitPassword" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="passwordDialogVisible = false">取消</el-button>
      <el-button type="primary" :loading="passwordSubmitting" @click="submitPassword">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ApiError } from '@smartwarehouse/platform-sdk'
import { LoginForm, PlatformLayout } from '@smartwarehouse/platform-ui'
import type {
  BreadcrumbItem,
  FrontendModule,
  LoginFormModel,
  LoginRiskState,
  LoginUser,
  MenuItem,
  NavMenuItem,
  PortalWorkbench
} from '@smartwarehouse/platform-types'
import { ElMessage } from 'element-plus'
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import {
  changePassword,
  createCaptcha,
  loadMe,
  loadMenus,
  loadModules,
  loadRiskState,
  loadWorkbench,
  login,
  logout,
  recordPortalAccess,
  verifyCaptcha,
  type CaptchaChallenge
} from './api'
import PortalTabPane, { type PortalTabRouteChangePayload } from './PortalTabPane.vue'
import { createWorkbenchTab, loadPortalTabSnapshot, savePortalTabSnapshot, type PortalTabRecord, WORKBENCH_TAB_ID } from './portalTabs'
import { extractPortalPath, getBrowserFullPath, isRouteInModule, normalizePortalFullPath, normalizePortalPath, resolveModuleRoute } from './routeUtils'
import { resolveFallbackTabIcon, resolvePortalIcon } from './tabIcons'

type HistoryMode = 'push' | 'replace' | 'none'

const maxCachedTabs = 8

const user = ref<LoginUser>()
const menus = ref<MenuItem[]>([])
const modules = ref<FrontendModule[]>([])
const workbench = ref<PortalWorkbench>()
const riskState = ref<LoginRiskState>()
const captchaChallenge = ref<CaptchaChallenge>()
const loginLoading = ref(false)
const workbenchLoading = ref(false)
const loginError = ref('')
const collapsed = ref(false)
const lastUsername = ref('admin')
const profileDialogVisible = ref(false)
const passwordDialogVisible = ref(false)
const passwordSubmitting = ref(false)
const passwordForm = reactive({ oldPassword: '', newPassword: '', confirmPassword: '' })
const currentFullPath = ref(getBrowserFullPath())
const tabs = ref<PortalTabRecord[]>([createWorkbenchTab()])
const activeTabId = ref(WORKBENCH_TAB_ID)
const lastTrackedModuleCode = ref('')
const tabsReady = ref(false)

const currentPath = computed(() => extractPortalPath(currentFullPath.value))
const storageKey = computed(() => (user.value ? `sw.portal.tabs:${user.value.userId}` : ''))
const isPortalRoute = computed(() => currentPath.value === WORKBENCH_TAB_ID)
const activeTab = computed(() => tabs.value.find((tab) => tab.id === activeTabId.value) ?? tabs.value[0])
const activeModule = computed(() => modules.value.find((module) => isRouteInModule(currentPath.value, module)))
const navMenus = computed(() => menus.value.map(toNavMenu))
const flatNavMenus = computed(() => flattenMenus(navMenus.value))
const activeNavMenus = computed<NavMenuItem[]>(() => {
  if (!activeModule.value) {
    return []
  }
  const moduleMenus = navMenus.value.filter((menu) => menu.moduleCode === activeModule.value?.moduleCode)
  return unwrapModuleRootMenus(moduleMenus, activeModule.value.routePrefix || `/${activeModule.value.moduleCode}`)
})
const breadcrumbs = computed<BreadcrumbItem[]>(() => {
  if (isPortalRoute.value) {
    return [{ title: '工作台', path: '/portal' }]
  }
  if (activeModule.value) {
    return [
      { title: '工作台', path: '/portal' },
      { title: activeModule.value.moduleName, path: currentPath.value }
    ]
  }
  return [{ title: '工作台', path: '/portal' }]
})

onMounted(async () => {
  window.addEventListener('popstate', syncCurrentPath)
  try {
    user.value = await loadMe()
    await initializeAuthenticatedShell()
  } catch {
    user.value = undefined
    riskState.value = await loadRiskState(lastUsername.value)
  }
})

onUnmounted(() => {
  window.removeEventListener('popstate', syncCurrentPath)
})

watch(
  [tabs, activeTabId, storageKey],
  ([nextTabs, nextActiveTabId, nextStorageKey]) => {
    if (!nextStorageKey || !tabsReady.value) {
      return
    }
    savePortalTabSnapshot(nextStorageKey, nextTabs, nextActiveTabId)
  },
  { deep: true }
)

watch(
  () => activeModule.value?.moduleCode,
  async (moduleCode) => {
    if (!moduleCode || moduleCode === lastTrackedModuleCode.value) {
      return
    }
    lastTrackedModuleCode.value = moduleCode
    await recordPortalAccess(moduleCode, currentPath.value)
    await reloadWorkbench()
  }
)

async function initializeAuthenticatedShell(): Promise<void> {
  const restoredSnapshot = storageKey.value ? loadPortalTabSnapshot(storageKey.value) : undefined
  tabsReady.value = false
  await reloadPortal()
  currentFullPath.value = window.location.pathname === '/' ? '/portal' : getBrowserFullPath()
  if (window.location.pathname === '/') {
    updateBrowserHistory(currentFullPath.value, 'replace')
  }
  restoreTabsFromStorage(restoredSnapshot)
  tabsReady.value = true
  persistPortalTabs()
}

async function handleLogin(model: LoginFormModel): Promise<void> {
  loginLoading.value = true
  loginError.value = ''
  lastUsername.value = model.username || lastUsername.value
  try {
    await login({
      username: model.username,
      password: model.password,
      captchaTicket: captchaChallenge.value?.captchaTicket,
      captchaVerifyToken: model.captchaToken
    })
    user.value = await loadMe()
    await initializeAuthenticatedShell()
    ElMessage.success('登录成功')
  } catch (error) {
    const apiError = error as ApiError
    loginError.value = apiError.message || '登录失败'
    riskState.value = await loadRiskState(lastUsername.value)
    if (riskState.value.captchaRequired) {
      await loadCaptcha()
    }
  } finally {
    loginLoading.value = false
  }
}

async function loadCaptcha(): Promise<void> {
  captchaChallenge.value = await createCaptcha(lastUsername.value)
}

async function verifyCurrentCaptcha(x: number): Promise<string> {
  if (!captchaChallenge.value) {
    await loadCaptcha()
  }
  const result = await verifyCaptcha(captchaChallenge.value!.captchaTicket, x)
  return result.captchaVerifyToken
}

async function reloadPortal(): Promise<void> {
  const [nextMenus, nextModules] = await Promise.all([loadMenus(), loadModules()])
  menus.value = nextMenus
  modules.value = nextModules
  tabs.value = reconcileTabs(tabs.value)
  if (!tabs.value.some((tab) => tab.id === activeTabId.value)) {
    activeTabId.value = WORKBENCH_TAB_ID
    currentFullPath.value = WORKBENCH_TAB_ID
    updateBrowserHistory(currentFullPath.value, 'replace')
  }
  await reloadWorkbench()
}

async function reloadWorkbench(): Promise<void> {
  if (!user.value) {
    workbench.value = undefined
    return
  }
  workbenchLoading.value = true
  try {
    workbench.value = await loadWorkbench()
  } finally {
    workbenchLoading.value = false
  }
}

async function handleLogout(): Promise<void> {
  await logout()
  tabsReady.value = false
  user.value = undefined
  menus.value = []
  modules.value = []
  workbench.value = undefined
  tabs.value = [createWorkbenchTab()]
  activeTabId.value = WORKBENCH_TAB_ID
  lastTrackedModuleCode.value = ''
  riskState.value = await loadRiskState(lastUsername.value)
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

async function submitPassword(): Promise<void> {
  passwordSubmitting.value = true
  try {
    await changePassword(passwordForm)
    ElMessage.success('密码修改成功')
    passwordDialogVisible.value = false
    resetPasswordForm()
  } finally {
    passwordSubmitting.value = false
  }
}

function handleMenuClick(menu: NavMenuItem): void {
  activateRoute(menu.path)
}

function handleBreadcrumbClick(item: BreadcrumbItem): void {
  if (!item.path) {
    return
  }
  activateRoute(item.path)
}

function handleModuleSelect(module: FrontendModule): void {
  openModule(module)
}

function handleTabChange(name: string | number): void {
  const nextTabId = String(name)
  const nextTab = tabs.value.find((tab) => tab.id === nextTabId)
  if (!nextTab) {
    return
  }
  activeTabId.value = nextTab.id
  currentFullPath.value = nextTab.fullPath
  updateBrowserHistory(nextTab.fullPath, 'push')
}

function handleTabRemove(name: string | number): void {
  closeTab(String(name))
}

function handleHostedRouteChange(payload: PortalTabRouteChangePayload): void {
  const normalizedFullPath = normalizePortalFullPath(payload.fullPath)
  const nextTabId = extractPortalPath(normalizedFullPath)
  if (nextTabId === activeTabId.value) {
    activateRoute(normalizedFullPath, { historyMode: payload.mode ?? 'replace', preferIncomingFullPath: true })
    return
  }
  const previousActiveTab = activeTab.value
  if (previousActiveTab?.closable) {
    tabs.value = tabs.value.filter((tab) => tab.id !== previousActiveTab.id)
  }
  activateRoute(normalizedFullPath, { historyMode: payload.mode ?? 'replace', preferIncomingFullPath: true })
}

function openModule(module: FrontendModule, targetPath?: string): void {
  activateRoute(resolveModuleRoute(module, targetPath))
}

function activateRoute(
  target: string,
  options: {
    historyMode?: HistoryMode
    preferIncomingFullPath?: boolean
  } = {}
): void {
  const incomingFullPath = normalizePortalFullPath(target)
  const tabId = extractPortalPath(incomingFullPath)
  const existingIndex = tabs.value.findIndex((tab) => tab.id === tabId)

  let nextTab: PortalTabRecord
  if (existingIndex >= 0) {
    if (options.preferIncomingFullPath) {
      nextTab = buildTabRecord(incomingFullPath)
      tabs.value.splice(existingIndex, 1, nextTab)
    } else {
      nextTab = tabs.value[existingIndex]
    }
  } else {
    nextTab = upsertTab(incomingFullPath)
  }

  activeTabId.value = nextTab.id
  currentFullPath.value = nextTab.fullPath
  updateBrowserHistory(nextTab.fullPath, options.historyMode ?? 'push')
}

function closeTab(tabId: string): void {
  const index = tabs.value.findIndex((tab) => tab.id === tabId)
  if (index < 0 || !tabs.value[index].closable) {
    return
  }

  const isClosingActiveTab = activeTabId.value === tabId
  tabs.value.splice(index, 1)

  if (!isClosingActiveTab) {
    return
  }

  const nextTab = tabs.value[index - 1] ?? tabs.value[index] ?? tabs.value[0] ?? createWorkbenchTab()
  activeTabId.value = nextTab.id
  currentFullPath.value = nextTab.fullPath
  updateBrowserHistory(nextTab.fullPath, 'replace')
}

function restoreTabsFromStorage(snapshot = storageKey.value ? loadPortalTabSnapshot(storageKey.value) : undefined): void {
  tabs.value = reconcileTabs(snapshot?.tabs ?? [])
  activeTabId.value = WORKBENCH_TAB_ID
  activateRoute(currentFullPath.value, { historyMode: 'none', preferIncomingFullPath: true })
}

function persistPortalTabs(): void {
  if (!storageKey.value || !tabsReady.value) {
    return
  }
  savePortalTabSnapshot(storageKey.value, tabs.value, activeTabId.value)
}

function syncCurrentPath(): void {
  currentFullPath.value = getBrowserFullPath()
  if (!user.value) {
    return
  }
  activateRoute(currentFullPath.value, { historyMode: 'none', preferIncomingFullPath: true })
}

function updateBrowserHistory(fullPath: string, mode: HistoryMode): void {
  if (mode === 'none') {
    return
  }
  const normalizedFullPath = normalizePortalFullPath(fullPath)
  if (getBrowserFullPath() === normalizedFullPath) {
    return
  }
  if (mode === 'replace') {
    window.history.replaceState(null, '', normalizedFullPath)
    return
  }
  window.history.pushState(null, '', normalizedFullPath)
}

function upsertTab(fullPath: string): PortalTabRecord {
  const nextTab = buildTabRecord(fullPath)
  const existingIndex = tabs.value.findIndex((tab) => tab.id === nextTab.id)
  if (existingIndex >= 0) {
    tabs.value.splice(existingIndex, 1, nextTab)
    return nextTab
  }
  tabs.value = [...tabs.value, nextTab]
  return nextTab
}

function reconcileTabs(candidates: PortalTabRecord[]): PortalTabRecord[] {
  const normalizedTabs: PortalTabRecord[] = [createWorkbenchTab()]
  const seen = new Set<string>([WORKBENCH_TAB_ID])

  for (const candidate of candidates) {
    const normalizedFullPath = normalizePortalFullPath(candidate.fullPath)
    const tabId = extractPortalPath(normalizedFullPath)
    if (seen.has(tabId)) {
      continue
    }
    if (tabId !== WORKBENCH_TAB_ID && !findModuleForPath(tabId)) {
      continue
    }
    normalizedTabs.push(buildTabRecord(normalizedFullPath))
    seen.add(tabId)
  }

  return normalizedTabs
}

function buildTabRecord(fullPath: string): PortalTabRecord {
  const normalizedFullPath = normalizePortalFullPath(fullPath)
  const tabId = extractPortalPath(normalizedFullPath)

  if (tabId === WORKBENCH_TAB_ID) {
    return createWorkbenchTab()
  }

  const matchedMenu = findBestMenuMatch(tabId)
  if (matchedMenu) {
    return {
      id: tabId,
      fullPath: normalizedFullPath,
      title: matchedMenu.title,
      icon: matchedMenu.icon,
      moduleCode: matchedMenu.moduleCode,
      closable: true,
      cacheable: true
    }
  }

  const matchedModule = findModuleForPath(tabId)
  if (matchedModule) {
    return {
      id: tabId,
      fullPath: normalizedFullPath,
      title: matchedModule.moduleName,
      moduleCode: matchedModule.moduleCode,
      closable: true,
      cacheable: true
    }
  }

  return {
    id: tabId,
    fullPath: normalizedFullPath,
    title: '未授权页面',
    icon: 'WarningFilled',
    closable: true,
    cacheable: false
  }
}

function findModuleForPath(pathOrFullPath: string): FrontendModule | undefined {
  return modules.value.find((module) => isRouteInModule(pathOrFullPath, module))
}

function findBestMenuMatch(path: string): NavMenuItem | undefined {
  return [...flatNavMenus.value]
    .sort((left, right) => normalizePortalPath(right.path).length - normalizePortalPath(left.path).length)
    .find((menu) => {
      const menuPath = normalizePortalPath(menu.path)
      return path === menuPath || path.startsWith(`${menuPath}/`)
    })
}

function flattenMenus(items: NavMenuItem[]): NavMenuItem[] {
  return items.flatMap((item) => [item, ...flattenMenus(item.children ?? [])])
}

function resetPasswordForm(): void {
  passwordForm.oldPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
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

function unwrapModuleRootMenus(items: NavMenuItem[], moduleRootPath: string): NavMenuItem[] {
  if (items.length !== 1) {
    return items
  }
  const normalizedRootPath = normalizePortalPath(moduleRootPath)
  const [rootMenu] = items
  return normalizePortalPath(rootMenu.path) === normalizedRootPath && rootMenu.children?.length ? rootMenu.children : items
}
</script>
