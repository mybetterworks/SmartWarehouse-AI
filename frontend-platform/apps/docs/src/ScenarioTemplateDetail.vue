<template>
  <section v-if="doc" class="sw-component-detail">
    <header class="sw-component-detail__hero">
      <p class="sw-doc-eyebrow">Scenario Template</p>
      <h1>{{ doc.name }}</h1>
      <p>{{ doc.description }}</p>
      <div class="sw-component-detail__tags">
        <el-tag v-for="scene in doc.scenarios" :key="scene" effect="plain">{{ scene }}</el-tag>
      </div>
    </header>

    <h2 id="components">底层组件</h2>
    <div class="sw-component-detail__links">
      <a v-for="component in doc.components" :key="component" :href="componentPath(component)">{{ component }}</a>
    </div>

    <h2 id="basic-usage">基础用法</h2>
    <div class="sw-doc-preview" :class="{ 'sw-doc-preview--layout': ['portal-workbench', 'standard-layout'].includes(doc.slug) }">
      <template v-if="doc.slug === 'portal-workbench'">
        <PlatformLayout
          title="SmartWarehouse-AI"
          brand-abbr="SW-AI"
          :menus="[]"
          :breadcrumbs="portalBreadcrumbs"
          :user="demoUser"
          :module-entries="moduleEntries"
          show-workbench-drawer-button
          show-module-drawer-trigger
          :show-aside="false"
        >
          <PlatformPage title="Portal Workbench" description="The portal home keeps the content area full width and surfaces workbench modules only.">
            <div class="sw-demo-grid">
              <div class="sw-demo-panel">
                <strong>Profile</strong>
                <p>{{ demoUser.nickname }} / {{ demoUser.username }}</p>
              </div>
              <div class="sw-demo-panel">
                <strong>Messages</strong>
                <p>3 pending approvals, 2 inventory alerts</p>
              </div>
              <div class="sw-demo-panel">
                <strong>Common Modules</strong>
                <p>System Management, Warehouse Management</p>
              </div>
              <div class="sw-demo-panel">
                <strong>Login Records</strong>
                <p>Last sign-in: today 09:30 / Shanghai</p>
              </div>
            </div>
          </PlatformPage>
        </PlatformLayout>
      </template>

      <template v-else-if="doc.slug === 'standard-layout'">
        <PlatformLayout
          title="SW-AI"
          brand-abbr="SW-AI"
          :menus="menus"
          :breadcrumbs="workbenchBreadcrumbs"
          :user="demoUser"
          :module-entries="moduleEntries"
          active-module-code="sys"
          show-workbench-drawer-button
          show-module-drawer-trigger
          v-model:collapsed="layoutCollapsed"
        >
          <div class="sw-demo-panel">业务子应用内容区</div>
        </PlatformLayout>
      </template>

      <template v-else-if="doc.slug === 'standard-page'">
        <PlatformPage title="物料管理" description="维护物料基础资料">
          <template #toolbar>
            <PermissionButton permission="wms:material:add">新增</PermissionButton>
          </template>
          <PlatformTable :columns="tableColumns" :data="tableRows" />
        </PlatformPage>
      </template>

      <template v-else-if="doc.slug === 'login-risk-control'">
        <div class="sw-doc-preview__center">
          <LoginForm :risk-state="riskState" />
        </div>
      </template>

      <template v-else-if="doc.slug === 'query-table'">
        <PlatformSearchForm :model="queryModel">
          <el-form-item label="关键词">
            <el-input v-model="queryModel.keyword" placeholder="请输入关键词" />
          </el-form-item>
        </PlatformSearchForm>
        <BatchOperationBar :selected-count="2">
          <el-button plain>批量导出</el-button>
        </BatchOperationBar>
        <PlatformTable :columns="tableColumns" :data="tableRows" :pagination="pagination" selectable>
          <template #cell-status="{ row }">
            <StatusTag :status="row.status" />
          </template>
        </PlatformTable>
      </template>

      <template v-else-if="doc.slug === 'schema-form'">
        <PlatformForm :model="formModel" :fields="formFields">
          <template #footer>
            <el-button>取消</el-button>
            <el-button type="primary">保存</el-button>
          </template>
        </PlatformForm>
      </template>

      <template v-else-if="doc.slug === 'business-selects'">
        <div class="sw-demo-grid">
          <WarehouseSelect v-model="selectModels.warehouseId" />
          <LocationTreeSelect v-model="selectModels.locationId" />
          <MaterialSelect v-model="selectModels.materialId" />
          <WorkOrderSelect v-model="selectModels.workOrderId" />
        </div>
      </template>

      <template v-else-if="doc.slug === 'offline-import'">
        <ExcelImport template-text="下载入库模板" />
        <ImportTaskPanel :tasks="importTasks" />
        <ImportErrorTable :rows="importErrors" />
      </template>

      <template v-else-if="doc.slug === 'material-flow'">
        <MaterialRequirementEditor v-model="requirements" />
        <div class="sw-demo-grid">
          <ApplyStatusTimeline :items="timelineItems" />
          <DeliveryStatusSteps status="PICKING" :steps="deliverySteps" />
        </div>
      </template>

      <template v-else-if="doc.slug === 'ops-dashboard'">
        <RealtimeBadge online />
        <DashboardGrid>
          <StatCard v-for="item in statItems" :key="item.key" :item="item" />
          <RankList title="物料申请排行" :items="rankItems" />
          <AlertPanel title="库存预警" :items="alertItems" />
        </DashboardGrid>
      </template>

      <template v-else-if="doc.slug === 'ai-workbench'">
        <ChatPanel v-model="prompt" :messages="messages" />
        <ChatBIResultTable :columns="chatBiColumns" :data="chatBiRows" :sql="chatBiSql" />
        <div class="sw-demo-grid">
          <AgentStepTimeline :steps="agentSteps" />
          <ToolCallTrace :records="toolCalls" />
        </div>
      </template>
    </div>

    <h2 id="code">示例代码（Vue + TypeScript）</h2>
    <p class="sw-component-detail__code-note">
      场景模板示例同样使用 <code>&lt;script setup lang="ts"&gt;</code>，复制到业务项目后再接入真实接口。
    </p>
    <pre class="sw-code-block"><code>{{ doc.code }}</code></pre>

    <h2 id="notes">注意事项</h2>
    <ul>
      <li v-for="note in doc.notes" :key="note">{{ note }}</li>
    </ul>
  </section>
  <el-alert v-else type="warning" title="场景模板不存在" :closable="false" />
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import type {
  AgentStep,
  AlertItem,
  BreadcrumbItem,
  ChatBIColumn,
  ChatMessage,
  FrontendModule,
  FormFieldSchema,
  ImportErrorRow,
  ImportTask,
  LoginRiskState,
  LoginUser,
  MaterialRequirement,
  NavMenuItem,
  RankItem,
  StatCardItem,
  TableColumn,
  TablePagination,
  TimelineItem,
  ToolCallRecord
} from '@smartwarehouse/platform-types'
import {
  AgentStepTimeline,
  AlertPanel,
  ApplyStatusTimeline,
  BatchOperationBar,
  ChatBIResultTable,
  ChatPanel,
  DashboardGrid,
  DeliveryStatusSteps,
  ExcelImport,
  ImportErrorTable,
  ImportTaskPanel,
  LocationTreeSelect,
  LoginForm,
  MaterialRequirementEditor,
  MaterialSelect,
  PermissionButton,
  PlatformForm,
  PlatformLayout,
  PlatformPage,
  PlatformSearchForm,
  PlatformTable,
  RankList,
  RealtimeBadge,
  StatCard,
  StatusTag,
  ToolCallTrace,
  WarehouseSelect,
  WorkOrderSelect
} from '@smartwarehouse/platform-ui'
import { componentCatalog } from './componentCatalog'
import { getScenarioTemplateDoc } from './scenarioTemplateDocs'

const props = defineProps<{
  slug: string
}>()

const doc = getScenarioTemplateDoc(props.slug)

const menus: NavMenuItem[] = [
  { id: 'sys', title: '系统管理', path: '/sys', moduleCode: 'sys' },
  { id: 'wms', title: '仓储管理', path: '/wms/material', moduleCode: 'wms' }
]

const moduleEntries: FrontendModule[] = [
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

const portalBreadcrumbs: BreadcrumbItem[] = [{ title: '工作台', path: '/portal' }]
const workbenchBreadcrumbs: BreadcrumbItem[] = [{ title: '工作台', path: '/portal' }, { title: '系统管理', path: '/sys/users' }]
const breadcrumbs: BreadcrumbItem[] = [{ title: '首页', path: '/' }, { title: '物料管理' }]
const demoUser: LoginUser = { userId: '1', username: 'admin', nickname: '平台管理员', roles: ['admin'], permissions: [] }
const layoutCollapsed = ref(false)

const riskState: LoginRiskState = {
  failureCount: 3,
  captchaRequired: true,
  message: '连续失败 3 次后启用随机拼图验证码'
}

const queryModel = reactive({ keyword: '' })
const formModel = reactive<Record<string, unknown>>({ name: '控制器外壳', type: 'RAW' })
const formFields: FormFieldSchema[] = [
  { prop: 'name', label: '名称', required: true },
  { prop: 'type', label: '类型', type: 'select', options: [{ label: '原材料', value: 'RAW' }] }
]

const selectModels = reactive({
  warehouseId: 'wh_raw_01',
  locationId: 'loc_raw_a_0101',
  materialId: 'mat_001',
  workOrderId: 'wo_20260611_001'
})

const tableColumns: TableColumn[] = [
  { prop: 'code', label: '编码', width: 120 },
  { prop: 'name', label: '名称', minWidth: 160 },
  { prop: 'status', label: '状态', width: 120, align: 'center' }
]

const tableRows = [
  { id: '1', code: 'MAT-001', name: '控制器外壳', status: 'PENDING' },
  { id: '2', code: 'MAT-002', name: '装配线束', status: 'DONE' }
]

const pagination = reactive<TablePagination>({ pageNo: 1, pageSize: 10, total: 2 })

const importTasks: ImportTask[] = [
  { taskId: 'task_001', fileName: 'inbound.xlsx', status: 'PROCESSING', progress: 72, totalCount: 100, successCount: 70, failureCount: 2 }
]

const importErrors: ImportErrorRow[] = [{ rowNo: 12, field: 'locationCode', value: 'A-99-01', reason: '库位不存在' }]

const requirements = ref<MaterialRequirement[]>([
  { materialId: 'mat_001', materialCode: 'MAT-001', materialName: '控制器外壳', requiredQty: 12, allocatedQty: 8, unit: '个', status: 'PROCESSING' }
])

const timelineItems: TimelineItem[] = [
  { title: '提交申请', status: 'success', time: '09:00' },
  { title: '库存分配', status: 'primary', time: '09:20' },
  { title: '配送中', status: 'info', time: '09:40' }
]

const deliverySteps = [
  { status: 'APPLIED', title: '已申请' },
  { status: 'ALLOCATED', title: '已分配' },
  { status: 'PICKING', title: '拣货中' },
  { status: 'DELIVERED', title: '已配送' }
]

const statItems: StatCardItem[] = [
  { key: 'inbound', title: '今日入库', value: 128, unit: '单', tone: 'success' },
  { key: 'alert', title: '安全库存预警', value: 12, unit: '项', tone: 'warning' }
]

const rankItems: RankItem[] = [{ key: 'mat_001', name: '控制器外壳', value: 168, unit: '次', percent: 92, trend: 'up' }]
const alertItems: AlertItem[] = [{ id: 'a1', title: '控制器外壳低于安全库存', level: 'warning', time: '09:30' }]

const prompt = ref('')
const messages: ChatMessage[] = [{ id: 'm1', role: 'assistant', content: '你好，我可以查询库存与工单。' }]
const chatBiColumns: ChatBIColumn[] = [{ prop: 'materialName', label: '物料名称' }, { prop: 'applyCount', label: '申请次数', align: 'right' }]
const chatBiRows = [{ materialName: '控制器外壳', applyCount: 168 }]
const chatBiSql = 'select material_name, count(*) apply_count from mes_material_apply group by material_name'
const agentSteps: AgentStep[] = [{ id: 's1', title: '理解问题', status: 'success' }, { id: 's2', title: '调用工具', status: 'running' }]
const toolCalls: ToolCallRecord[] = [{ id: 't1', toolName: 'query_inventory_rank', serverName: 'mcp-business', status: 'success', durationMs: 86 }]

function componentPath(componentName: string): string {
  const item = componentCatalog.find((component) => component.name === componentName)
  return item?.docsPath ?? '/component/overview'
}
</script>
