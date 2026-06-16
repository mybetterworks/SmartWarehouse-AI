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
</script>

<template>
  <PlatformLayout
    :user="user"
    brand-abbr="SW-AI"
    :menus="[]"
    :breadcrumbs="[{ title: '工作台', path: '/portal' }]"
    :module-entries="modules"
    show-workbench-drawer-button
    show-module-drawer-trigger
    :show-aside="false"
    @module-select="console.log('switch module', $event)"
  >
    <PlatformPage title="平台工作台" description="工作台首页不显示左侧菜单，只展示模块化控制台内容。">
      <div>这里可以放个人信息、消息列表、常用模块、最近访问和登录记录。</div>
    </PlatformPage>
  </PlatformLayout>
</template>`,
  'standard-layout': `<script setup lang="ts">
import { ref } from 'vue'
import { PlatformLayout } from '@smartwarehouse/platform-ui'
import type { BreadcrumbItem, FrontendModule, LoginUser, NavMenuItem } from '@smartwarehouse/platform-types'

const menus: NavMenuItem[] = [{ id: 'sys-users', title: '用户管理', path: '/sys/users', moduleCode: 'sys' }]
const breadcrumbs: BreadcrumbItem[] = [{ title: '工作台', path: '/portal' }, { title: '系统管理', path: '/sys/users' }]
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
</script>

<template>
  <PlatformLayout
    title="SW-AI"
    brand-abbr="SW-AI"
    :menus="menus"
    :breadcrumbs="breadcrumbs"
    :user="user"
    :module-entries="modules"
    active-module-code="sys"
    show-workbench-drawer-button
    show-module-drawer-trigger
    v-model:collapsed="collapsed"
    @module-select="console.log('switch module', $event)"
  >
    <router-view />
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

export const scenarioTemplateDocs: ScenarioTemplateDoc[] = scenarioTemplateCatalog.map((item) => ({
  slug: item.slug,
  name: item.name,
  title: item.title,
  description: item.description,
  scenarios: item.scenarios,
  components: item.components ?? [],
  code: scenarioCode[item.slug] ?? '',
  notes: defaultNotes
}))

export function getScenarioTemplateDoc(slug: string): ScenarioTemplateDoc | undefined {
  return scenarioTemplateDocs.find((item) => item.slug === slug)
}
