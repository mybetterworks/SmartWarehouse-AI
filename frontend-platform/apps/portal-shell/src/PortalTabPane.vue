<template>
  <section class="portal-tab-pane">
    <PortalWorkbenchView
      v-if="isPortalRoute"
      :user="user"
      :workbench="workbench"
      :workbench-loading="workbenchLoading"
      @reload="emit('reloadWorkbench')"
      @open-module="emit('openModule', $event)"
    />

    <MicroFrontendOutlet
      v-else-if="activeMicroModule"
      :module="activeMicroModule"
      :route-path="routePath"
      :route-full-path="tab.fullPath"
      @back="emit('navigate', '/portal')"
      @retry="emit('retry')"
      @route-change="emit('routeChange', $event)"
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
        <el-button type="primary" @click="emit('navigate', '/portal')">返回工作台</el-button>
      </template>
    </PlatformPage>
  </section>
</template>

<script setup lang="ts">
import { PlatformPage } from '@smartwarehouse/platform-ui'
import type { FrontendModule, LoginUser, PortalWorkbench } from '@smartwarehouse/platform-types'
import { computed } from 'vue'
import MicroFrontendOutlet from './MicroFrontendOutlet.vue'
import PortalWorkbenchView from './PortalWorkbenchView.vue'
import { isMicroFrontendModule, toMicroFrontendModule } from './microFrontend'
import type { PortalTabRecord } from './portalTabs'
import { extractPortalPath, isRouteInModule } from './routeUtils'

export interface PortalTabRouteChangePayload {
  fullPath: string
  mode?: 'push' | 'replace'
}

const props = defineProps<{
  tab: PortalTabRecord
  modules: FrontendModule[]
  user?: LoginUser
  workbench?: PortalWorkbench
  workbenchLoading?: boolean
}>()

const emit = defineEmits<{
  openModule: [module: FrontendModule]
  navigate: [path: string]
  retry: []
  reloadWorkbench: []
  routeChange: [payload: PortalTabRouteChangePayload]
}>()

const routePath = computed(() => extractPortalPath(props.tab.fullPath))
const isPortalRoute = computed(() => routePath.value === '/portal')
const activeModule = computed(() => props.modules.find((module) => isRouteInModule(routePath.value, module)))
const activeMicroModule = computed(() => {
  if (!activeModule.value || !isMicroFrontendModule(activeModule.value)) {
    return undefined
  }
  return toMicroFrontendModule(activeModule.value)
})
</script>
