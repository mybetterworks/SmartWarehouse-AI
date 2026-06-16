<template>
  <PlatformPage title="平台工作台" description="查看个人信息、消息、常用模块、最近访问和登录记录。">
    <template #toolbar>
      <el-button type="primary" :loading="workbenchLoading" @click="emit('reload')">刷新工作台</el-button>
    </template>

    <section class="portal-workbench-shell">
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
            @click="emit('openModule', module)"
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
            @click="emit('openModule', module)"
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
    </section>
  </PlatformPage>
</template>

<script setup lang="ts">
import { PlatformPage } from '@smartwarehouse/platform-ui'
import type { FrontendModule, LoginUser, PortalWorkbench } from '@smartwarehouse/platform-types'

defineProps<{
  user?: LoginUser
  workbench?: PortalWorkbench
  workbenchLoading?: boolean
}>()

const emit = defineEmits<{
  reload: []
  openModule: [module: FrontendModule]
}>()

function formatDateTime(value?: string): string {
  if (!value) {
    return '-'
  }
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString()
}
</script>
