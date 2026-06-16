import { scenarioTemplateCatalog } from './componentCatalog'

// 场景模板文档描述多个组件如何组合成页面片段，区别于 /component 下的单组件 API 文档。
export interface ScenarioTemplateDoc {
  slug: string
  name: string
  title: string
  description: string
  scenarios: string[]
  components: string[]
  code: string
  notes: string[]
}

// 示例代码保持可复制的 Vue + TypeScript 片段，业务项目复制后再接入真实接口和权限编码。
const scenarioCode: Record<string, string> = {
  'portal-workbench': `<script setup lang="ts">
import { ref } from 'vue'
import { House } from '@element-plus/icons-vue'
import { PlatformLayout, PlatformPage } from '@smartwarehouse/platform-ui'
import type { FrontendModule, LoginUser } from '@smartwarehouse/platform-types'

const modules: FrontendModule[] = [
  {
    moduleCode: 'sys',
    moduleName: '系统管理',
    routePrefix: '/sys',
    entryUrl: 'http://localhost:5175',
    apiPrefix: '/api/sys',
    ownerType: 'OWNER'
  },
  {
    moduleCode: 'wms',
    moduleName: '仓储管理',
    routePrefix: '/wms',
    entryUrl: 'http://localhost:5176',
    apiPrefix: '/api/wms',
    ownerType: 'VENDOR'
  }
]
const user: LoginUser = { userId: '1', username: 'admin', nickname: '平台管理员', roles: ['admin'], permissions: [] }
const activeTabId = ref('/portal')
</script>

<template>
  <PlatformLayout
    title="SmartWarehouse-AI"
    :user="user"
    :menus="[]"
    :breadcrumbs="[{ title: '工作台', path: '/portal' }]"
    :module-entries="modules"
    :show-workbench-button="false"
    show-workbench-drawer-button
    show-module-drawer-trigger
    :show-aside="false"
    @module-select="console.log('switch module', $event)"
  >
    <template #subheader>
      <el-tabs type="card" :model-value="activeTabId">
        <el-tab-pane name="/portal" :closable="false">
          <template #label>
            <span style="display: inline-flex; align-items: center; gap: 8px;">
              <el-icon><House /></el-icon>
              <span>平台工作台</span>
            </span>
          </template>
        </el-tab-pane>
      </el-tabs>
    </template>

    <PlatformPage
      title="平台工作台"
      description="工作台作为固定首个 tab 展示，portal-shell 刷新后仍可恢复当前 tab 与最近打开模块。"
    >
      <div>这里可以放个人信息、消息列表、常用模块、最近访问和登录记录。</div>
    </PlatformPage>
  </PlatformLayout>
</template>`,
  'standard-layout': `<script setup lang="ts">
import { computed, ref } from 'vue'
import { CollectionTag, Lock, User } from '@element-plus/icons-vue'
import { PlatformLayout, PlatformPage } from '@smartwarehouse/platform-ui'
import type { BreadcrumbItem, FrontendModule, LoginUser, NavMenuItem } from '@smartwarehouse/platform-types'

const menus: NavMenuItem[] = [
  { id: 'sys-users', title: '用户管理', path: '/sys/users', icon: 'User', moduleCode: 'sys' },
  { id: 'sys-roles', title: '角色管理', path: '/sys/roles', icon: 'Lock', moduleCode: 'sys' },
  {
    id: 'sys-base',
    title: '基础配置',
    path: '/sys/base',
    icon: 'Setting',
    moduleCode: 'sys',
    children: [
      { id: 'sys-dicts', title: '字典管理', path: '/sys/dicts', icon: 'CollectionTag', moduleCode: 'sys' },
      { id: 'sys-menus', title: '菜单管理', path: '/sys/menus', icon: 'Grid', moduleCode: 'sys' }
    ]
  }
]
const modules: FrontendModule[] = [
  {
    moduleCode: 'sys',
    moduleName: '系统管理',
    routePrefix: '/sys',
    entryUrl: 'http://localhost:5175',
    apiPrefix: '/api/sys',
    ownerType: 'OWNER'
  },
  {
    moduleCode: 'wms',
    moduleName: '仓储管理',
    routePrefix: '/wms',
    entryUrl: 'http://localhost:5176',
    apiPrefix: '/api/wms',
    ownerType: 'VENDOR'
  }
]
const user: LoginUser = { userId: '1', username: 'admin', nickname: '平台管理员', roles: ['admin'], permissions: [] }
const collapsed = ref(false)
const activePath = ref('/sys/users')
const tabs = [
  { id: '/sys/users', title: '用户管理', icon: User },
  { id: '/sys/roles', title: '角色管理', icon: Lock },
  { id: '/sys/dicts', title: '字典管理', icon: CollectionTag }
]
const breadcrumbs = computed<BreadcrumbItem[]>(() => [{ title: '工作台', path: '/portal' }, { title: '系统管理', path: activePath.value }])
const activeTab = computed(() => tabs.find((tab) => tab.id === activePath.value) ?? tabs[0])

function activateTab(path: string): void {
  if (tabs.some((tab) => tab.id === path)) {
    activePath.value = path
  }
}

function handleTabChange(name: string | number): void {
  activateTab(String(name))
}

function handleMenuClick(menu: NavMenuItem): void {
  activateTab(menu.path)
}
</script>

<template>
  <PlatformLayout
    title="SmartWarehouse-AI"
    :menus="menus"
    :breadcrumbs="breadcrumbs"
    :user="user"
    :active-path="activePath"
    :module-entries="modules"
    active-module-code="sys"
    :show-workbench-button="false"
    show-workbench-drawer-button
    show-module-drawer-trigger
    v-model:collapsed="collapsed"
    @menu-click="handleMenuClick"
    @module-select="console.log('switch module', $event)"
  >
    <template #subheader>
      <el-tabs type="card" :model-value="activePath" @tab-change="handleTabChange">
        <el-tab-pane v-for="tab in tabs" :key="tab.id" :name="tab.id">
          <template #label>
            <span style="display: inline-flex; align-items: center; gap: 8px;">
              <el-icon><component :is="tab.icon" /></el-icon>
              <span>{{ tab.title }}</span>
            </span>
          </template>
        </el-tab-pane>
      </el-tabs>
    </template>

    <PlatformPage
      :title="activeTab.title"
      description="host 在 subheader 承载模块 tabs，remote 子应用只维护当前 tab 下的内容区状态。"
    >
      <div>切换到其他 tab 再返回时，可结合 KeepAlive 与 tab 快照恢复查询条件、滚动位置和临时编辑态。</div>
    </PlatformPage>
  </PlatformLayout>
</template>`,
  'standard-page': `<script setup lang="ts">
import { PermissionButton, PlatformPage } from '@smartwarehouse/platform-ui'
</script>

<template>
  <PlatformPage title="物料管理" description="维护物料基础资料">
    <template #toolbar>
      <PermissionButton permission="wms:material:add">新增</PermissionButton>
    </template>
    <slot />
  </PlatformPage>
</template>`,
  'login-risk-control': `<script setup lang="ts">
import { LoginForm } from '@smartwarehouse/platform-ui'
import type { LoginRiskState } from '@smartwarehouse/platform-types'

const riskState: LoginRiskState = { failureCount: 3, captchaRequired: true, message: '连续失败 3 次后启用随机拼图验证码' }
</script>

<template>
  <LoginForm :risk-state="riskState" />
</template>`,
  'query-table': `<script setup lang="ts">
import { reactive, ref } from 'vue'
import { BatchOperationBar, PlatformSearchForm, PlatformTable, StatusTag } from '@smartwarehouse/platform-ui'
import type { TableColumn } from '@smartwarehouse/platform-types'

const query = reactive({ keyword: '' })
const selected = ref<Record<string, unknown>[]>([])
const columns: TableColumn[] = [{ prop: 'name', label: '名称' }, { prop: 'status', label: '状态' }]
const rows = [{ id: '1', name: '控制器外壳', status: 'PENDING' }]
</script>

<template>
  <PlatformSearchForm :model="query" />
  <BatchOperationBar v-if="selected.length" :selected-count="selected.length" />
  <PlatformTable :columns="columns" :data="rows" selectable @selection-change="selected = $event">
    <template #cell-status="{ row }">
      <StatusTag :status="row.status" />
    </template>
  </PlatformTable>
</template>`,
  'schema-form': `<script setup lang="ts">
import { reactive } from 'vue'
import { PlatformForm } from '@smartwarehouse/platform-ui'
import type { FormFieldSchema } from '@smartwarehouse/platform-types'

const model = reactive({})
const fields: FormFieldSchema[] = [{ prop: 'name', label: '名称', required: true }]
</script>

<template>
  <PlatformForm :model="model" :fields="fields">
    <template #footer>
      <el-button type="primary">保存</el-button>
    </template>
  </PlatformForm>
</template>`,
  'business-selects': `<script setup lang="ts">
import { ref } from 'vue'
import { LocationTreeSelect, MaterialSelect, WarehouseSelect, WorkOrderSelect } from '@smartwarehouse/platform-ui'

const warehouseId = ref('wh_raw_01')
const locationId = ref('loc_raw_a_0101')
const materialId = ref('mat_001')
const workOrderId = ref('wo_20260611_001')
</script>

<template>
  <WarehouseSelect v-model="warehouseId" />
  <LocationTreeSelect v-model="locationId" />
  <MaterialSelect v-model="materialId" />
  <WorkOrderSelect v-model="workOrderId" />
</template>`,
  'offline-import': `<script setup lang="ts">
import { ExcelImport, ImportErrorTable, ImportTaskPanel } from '@smartwarehouse/platform-ui'
import type { ImportErrorRow, ImportTask } from '@smartwarehouse/platform-types'

const tasks: ImportTask[] = []
const errors: ImportErrorRow[] = []
</script>

<template>
  <ExcelImport />
  <ImportTaskPanel :tasks="tasks" />
  <ImportErrorTable :rows="errors" />
</template>`,
  'material-flow': `<script setup lang="ts">
import { ref } from 'vue'
import { ApplyStatusTimeline, DeliveryStatusSteps, MaterialRequirementEditor } from '@smartwarehouse/platform-ui'
import type { MaterialRequirement, TimelineItem } from '@smartwarehouse/platform-types'

const requirements = ref<MaterialRequirement[]>([])
const timeline: TimelineItem[] = [{ title: '提交申请', status: 'success' }]
</script>

<template>
  <MaterialRequirementEditor v-model="requirements" />
  <ApplyStatusTimeline :items="timeline" />
  <DeliveryStatusSteps status="ALLOCATED" />
</template>`,
  'ops-dashboard': `<script setup lang="ts">
import { AlertPanel, DashboardGrid, RankList, RealtimeBadge, StatCard } from '@smartwarehouse/platform-ui'
</script>

<template>
  <RealtimeBadge online />
  <DashboardGrid>
    <StatCard :item="{ key: 'inbound', title: '今日入库', value: 128 }" />
    <RankList />
    <AlertPanel />
  </DashboardGrid>
</template>`,
  'ai-workbench': `<script setup lang="ts">
import { ref } from 'vue'
import { AgentStepTimeline, ChatBIResultTable, ChatPanel, ToolCallTrace } from '@smartwarehouse/platform-ui'
import type { ChatMessage } from '@smartwarehouse/platform-types'

const prompt = ref('')
const messages: ChatMessage[] = [{ id: 'm1', role: 'assistant', content: '你好' }]
</script>

<template>
  <ChatPanel v-model="prompt" :messages="messages" />
  <ChatBIResultTable />
  <AgentStepTimeline />
  <ToolCallTrace />
</template>`
}

const defaultNotes = [
  '场景模板用于说明多个底层组件如何协作，不替代单组件 API 文档。',
  '复制模板到业务项目后，应把接口调用、权限码和路由配置放到业务项目自己的边界内。',
  '模板中出现的业务名词仅用于演示，组件本身不绑定 WMS、MES 或 AI 的具体后端实现。',
  'host 专属能力如“工作台”按钮和模块抽屉，在 standalone 子应用中默认应隐藏；不要暴露无法工作的空入口。'
]

const scenarioNotes: Partial<Record<string, string[]>> = {
  'portal-workbench': [
    'portal-shell 推荐把“平台工作台”作为固定首 tab，并通过 PlatformLayout 的 subheader 插槽统一承载 tab 栏。',
    '刷新恢复至少要保存 activeTabId、tabs 列表和每个 tab 对应的 fullPath，避免刷新后只剩默认首页。'
  ],
  'standard-layout': [
    '标准后台布局推荐由 host 管理左侧菜单、breadcrumb 和 tabs；remote 子应用只渲染 tabs 下方的业务内容区。',
    '如果需要切换 tab 后仍保留查询条件、滚动位置和临时编辑态，建议组合 KeepAlive 与路由级 tab snapshot。'
  ]
}

export const scenarioTemplateDocs: ScenarioTemplateDoc[] = scenarioTemplateCatalog.map((item) => ({
  slug: item.slug,
  name: item.name,
  title: item.title,
  description: item.description,
  scenarios: item.scenarios,
  components: item.components ?? [],
  code: scenarioCode[item.slug] ?? '',
  notes: [...defaultNotes, ...(scenarioNotes[item.slug] ?? [])]
}))

export function getScenarioTemplateDoc(slug: string): ScenarioTemplateDoc | undefined {
  return scenarioTemplateDocs.find((item) => item.slug === slug)
}
