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
    @workbench-click="navigateTo('/portal')"
    @breadcrumb-click="handleBreadcrumbClick"
    @module-select="handleModuleSelect"
  >
    <PlatformPage
      v-if="isPortalRoute"
      title="平台工作台"
      description="查看个人信息、消息、常用模块、最近访问和登录记录。"
    >
      <template #toolbar>
        <el-button type="primary" :loading="workbenchLoading" @click="reloadWorkbench">刷新工作台</el-button>
      </template>

      <section class="portal-workbench">
        <article class="portal-card portal-card--hero">
          <div>
            <p class="portal-card__eyebrow">Profile</p>
            <h2>{{ workbench?.profile.nickname || user?.nickname || user?.username }}</h2>
            <p>账号：{{ workbench?.profile.username || user?.username }}</p>
            <p>角色：{{ (workbench?.profile.roles || user?.roles || []).join(', ') || '-' }}</p>
            <p>最近登录：{{ formatDateTime(workbench?.profile.lastLoginTime) }} / {{ workbench?.profile.lastLoginIp || '-' }}</p>
          </div>
          <div class="portal-card__pill-list">
            <span v-for="role in workbench?.profile.roles || []" :key="role" class="portal-pill">{{ role }}</span>
          </div>
        </article>

        <article class="portal-card">
          <header class="portal-card__header">
            <div>
              <p class="portal-card__eyebrow">Notices</p>
              <h3>消息列表</h3>
            </div>
          </header>
          <ul class="portal-list">
            <li v-for="notice in workbench?.notices || []" :key="notice.id" class="portal-list__item">
              <div>
                <strong>{{ notice.title }}</strong>
                <p>{{ notice.content }}</p>
              </div>
              <span class="portal-list__meta">{{ notice.level }}</span>
            </li>
            <li v-if="!(workbench?.notices?.length)" class="portal-list__item portal-list__item--empty">暂无消息</li>
          </ul>
        </article>

        <article class="portal-card">
          <header class="portal-card__header">
            <div>
              <p class="portal-card__eyebrow">Common</p>
              <h3>常用模块</h3>
            </div>
          </header>
          <div class="portal-module-grid">
            <button
              v-for="module in workbench?.commonModules || []"
              :key="`common-${module.moduleCode}`"
              type="button"
              class="portal-module-card"
              @click="openModule(module)"
            >
              <span>{{ module.moduleCode.toUpperCase() }}</span>
              <strong>{{ module.moduleName }}</strong>
              <small>{{ module.routePrefix }}</small>
            </button>
            <div v-if="!(workbench?.commonModules?.length)" class="portal-module-empty">暂无常用模块</div>
          </div>
        </article>

        <article class="portal-card">
          <header class="portal-card__header">
            <div>
              <p class="portal-card__eyebrow">Recent</p>
              <h3>最近访问</h3>
            </div>
          </header>
          <div class="portal-module-grid">
            <button
              v-for="module in workbench?.recentModules || []"
              :key="`recent-${module.moduleCode}`"
              type="button"
              class="portal-module-card portal-module-card--soft"
              @click="openModule(module)"
            >
              <span>{{ module.moduleCode.toUpperCase() }}</span>
              <strong>{{ module.moduleName }}</strong>
              <small>{{ module.routePrefix }}</small>
            </button>
            <div v-if="!(workbench?.recentModules?.length)" class="portal-module-empty">暂无最近访问</div>
          </div>
        </article>

        <article class="portal-card">
          <header class="portal-card__header">
            <div>
              <p class="portal-card__eyebrow">Security</p>
              <h3>登录记录</h3>
            </div>
          </header>
          <ul class="portal-list">
            <li v-for="item in workbench?.loginRecords || []" :key="String(item.id || item.loginTime)" class="portal-list__item">
              <div>
                <strong>{{ String(item.username || '-') }}</strong>
                <p>{{ String(item.loginIp || '-') }} / {{ String(item.loginStatus || '-') }}</p>
              </div>
              <span class="portal-list__meta">{{ formatDateTime(String(item.loginTime || '')) }}</span>
            </li>
            <li v-if="!(workbench?.loginRecords?.length)" class="portal-list__item portal-list__item--empty">暂无登录记录</li>
          </ul>
        </article>
      </section>
    </PlatformPage>

    <MicroFrontendOutlet
      v-else-if="activeMicroModule"
      :key="`${activeMicroModule.remoteName}:${activeMicroModule.remoteEntry}:${currentPath}`"
      :module="activeMicroModule"
      :route-path="currentPath"
      @back="navigateTo('/portal')"
      @retry="reloadPortal"
    />

    <PlatformPage
      v-else-if="activeModule"
      :title="activeModule.moduleName"
      :description="`${activeModule.routePrefix} 当前未接入 remote，先展示宿主降级页。`"
    >
      <section class="portal-module-placeholder">
        <h2>{{ activeModule.moduleName }} 暂未接入</h2>
        <p>当前模块还没有提供可加载的 remote 内容，门户壳层和导航保持可用。</p>
        <p>模块路由：{{ activeModule.routePrefix }}</p>
      </section>
    </PlatformPage>

    <PlatformPage v-else title="模块未授权或未配置" description="当前路由没有匹配到已授权模块，请返回工作台或检查模块注册。">
      <template #toolbar>
        <el-button type="primary" @click="navigateTo('/portal')">返回工作台</el-button>
      </template>
    </PlatformPage>
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
import { LoginForm, PlatformLayout, PlatformPage } from '@smartwarehouse/platform-ui'
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
  type CaptchaChallenge,
  verifyCaptcha
} from './api'
import MicroFrontendOutlet from './MicroFrontendOutlet.vue'
import { isMicroFrontendModule, toMicroFrontendModule } from './microFrontend'

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
const currentPath = ref(normalizeBrowserPath(window.location.pathname))
const lastTrackedModuleCode = ref('')

const isPortalRoute = computed(() => currentPath.value === '/portal')
const activeModule = computed(() => modules.value.find((module) => isRouteInModule(currentPath.value, module)))
const activeMicroModule = computed(() => {
  if (!activeModule.value || !isMicroFrontendModule(activeModule.value)) {
    return undefined
  }
  return toMicroFrontendModule(activeModule.value)
})
const activeNavMenus = computed<NavMenuItem[]>(() => {
  if (!activeModule.value) {
    return []
  }
  const moduleMenus = menus.value
    .filter((menu) => menu.moduleCode === activeModule.value?.moduleCode)
    .map(toNavMenu)
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
    await reloadPortal()
    if (window.location.pathname === '/') {
      replaceRoute('/portal')
    }
  } catch {
    user.value = undefined
    riskState.value = await loadRiskState(lastUsername.value)
  }
})

onUnmounted(() => {
  window.removeEventListener('popstate', syncCurrentPath)
})

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
    await reloadPortal()
    replaceRoute('/portal')
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
  user.value = undefined
  menus.value = []
  modules.value = []
  workbench.value = undefined
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
  navigateTo(menu.path)
}

function handleBreadcrumbClick(item: BreadcrumbItem): void {
  if (!item.path) {
    return
  }
  navigateTo(item.path)
}

function handleModuleSelect(module: FrontendModule): void {
  openModule(module)
}

function openModule(module: FrontendModule, targetPath?: string): void {
  navigateTo(resolveModuleRoute(module, targetPath))
}

function resolveModuleRoute(module: FrontendModule, targetPath?: string): string {
  const moduleRoot = normalizeInternalRoute(module.routePrefix || `/${module.moduleCode}`)
  if (targetPath) {
    const normalizedTarget = normalizeInternalRoute(targetPath)
    if (normalizedTarget !== moduleRoot) {
      return normalizedTarget
    }
  }
  if (module.moduleCode === 'sys') {
    return '/sys/users'
  }
  return moduleRoot
}

function navigateTo(path: string): void {
  const nextPath = normalizeInternalRoute(path)
  if (currentPath.value === nextPath && window.location.pathname === nextPath) {
    return
  }
  window.history.pushState(null, '', nextPath)
  currentPath.value = nextPath
}

function replaceRoute(path: string): void {
  const nextPath = normalizeInternalRoute(path)
  window.history.replaceState(null, '', nextPath)
  currentPath.value = nextPath
}

function syncCurrentPath(): void {
  currentPath.value = normalizeBrowserPath(window.location.pathname)
}

function normalizeBrowserPath(path: string): string {
  return normalizeInternalRoute(path === '/' ? '/portal' : path)
}

function normalizeInternalRoute(path: string): string {
  if (!path || path === '/') {
    return '/portal'
  }
  const normalized = path.startsWith('/') ? path : `/${path}`
  return normalized.replace(/\/+$/, '') || '/portal'
}

function isRouteInModule(path: string, module: FrontendModule): boolean {
  const prefix = normalizeInternalRoute(module.routePrefix || `/${module.moduleCode}`)
  return path === prefix || path.startsWith(`${prefix}/`)
}

function resetPasswordForm(): void {
  passwordForm.oldPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
}

function formatDateTime(value?: string): string {
  if (!value) {
    return '-'
  }
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString()
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
  const normalizedRootPath = normalizeInternalRoute(moduleRootPath)
  const [rootMenu] = menus
  return normalizeInternalRoute(rootMenu.path) === normalizedRootPath && rootMenu.children?.length ? rootMenu.children : menus
}
</script>
