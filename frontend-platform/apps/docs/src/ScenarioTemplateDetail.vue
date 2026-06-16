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
          :menus="[]"
          :breadcrumbs="portalBreadcrumbs"
          :user="demoUser"
          :module-entries="moduleEntries"
          :show-workbench-button="false"
          show-workbench-drawer-button
          show-module-drawer-trigger
          :show-aside="false"
        >
          <template #subheader>
            <section class="sw-doc-tabs-shell">
              <el-tabs class="sw-doc-tabs" type="card" :model-value="portalWorkbenchTabId">
                <el-tab-pane name="/portal" :closable="false">
                  <template #label>
                    <span class="sw-doc-tabs__label">
                      <el-icon class="sw-doc-tabs__icon"><House /></el-icon>
                      <span>平台工作台</span>
                    </span>
                  </template>
                </el-tab-pane>
              </el-tabs>
            </section>
          </template>

          <PlatformPage title="平台工作台" description="工作台作为固定首个 tab 呈现，portal-shell 刷新后仍可恢复当前 tab 与最近打开模块。">
            <template #toolbar>
              <el-button type="primary">刷新工作台</el-button>
            </template>
            <div class="sw-doc-layout-note">
              <strong>统一壳层管理 tab。</strong>
              <span>工作台和业务模块都在同一个 portal-shell 内切换，tab 状态由 host 统一持久化。</span>
            </div>
            <div class="sw-demo-grid sw-demo-grid--portal">
              <div class="sw-demo-panel">
                <p class="sw-demo-panel__eyebrow">Profile</p>
                <strong>{{ demoUser.nickname }}</strong>
                <p>{{ demoUser.username }} / 最近登录今日 09:30</p>
              </div>
              <div class="sw-demo-panel">
                <p class="sw-demo-panel__eyebrow">Messages</p>
                <strong>3 条待处理消息</strong>
                <p>2 条库存预警，1 条审批提醒</p>
              </div>
              <div class="sw-demo-panel">
                <p class="sw-demo-panel__eyebrow">Common</p>
                <strong>常用模块</strong>
                <p>系统管理、仓储管理、任务中心</p>
              </div>
              <div class="sw-demo-panel">
                <p class="sw-demo-panel__eyebrow">Security</p>
                <strong>登录记录</strong>
                <p>最近登录：今日 09:30 / Shanghai</p>
              </div>
            </div>
          </PlatformPage>
        </PlatformLayout>
      </template>

      <template v-else-if="doc.slug === 'standard-layout'">
        <PlatformLayout
          title="SmartWarehouse-AI"
          :menus="layoutMenus"
          :breadcrumbs="standardLayoutBreadcrumbs"
          :user="demoUser"
          :active-path="activeLayoutTabId"
          :module-entries="moduleEntries"
          active-module-code="sys"
          :show-workbench-button="false"
          show-workbench-drawer-button
          show-module-drawer-trigger
          v-model:collapsed="layoutCollapsed"
          @menu-click="handleLayoutPreviewMenuClick"
        >
          <template #subheader>
            <section class="sw-doc-tabs-shell">
              <el-tabs class="sw-doc-tabs" type="card" :model-value="activeLayoutTabId" @tab-change="handleLayoutTabChange">
                <el-tab-pane v-for="tab in layoutTabs" :key="tab.id" :name="tab.id">
                  <template #label>
                    <span class="sw-doc-tabs__label">
                      <el-icon class="sw-doc-tabs__icon">
                        <component :is="tab.icon" />
                      </el-icon>
                      <span>{{ tab.title }}</span>
                    </span>
                  </template>
                </el-tab-pane>
              </el-tabs>
            </section>
          </template>

          <PlatformPage :title="layoutPreviewState.title" :description="layoutPreviewState.description">
            <template #toolbar>
              <el-button type="primary">{{ layoutPreviewState.actionText }}</el-button>
            </template>
            <section class="sw-doc-layout-shell">
              <section class="sw-doc-layout-body">
              <div class="sw-doc-layout-note">
                <strong>Host 负责导航与 tabs。</strong>
                <span>{{ layoutPreviewState.note }}</span>
              </div>
              <div class="sw-doc-summary-grid">
                <article v-for="item in layoutPreviewState.metrics" :key="item.label" class="sw-doc-summary-card">
                  <span>{{ item.label }}</span>
                  <strong>{{ item.value }}</strong>
                </article>
              </div>
              <PlatformTable :columns="tableColumns" :data="layoutPreviewState.rows" />
              </section>
            </section>
          </PlatformPage>
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
import { CollectionTag, House, Lock, User } from '@element-plus/icons-vue'
import { computed, reactive, ref } from 'vue'
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

const layoutMenus: NavMenuItem[] = [
  {
    id: 'sys-access',
    title: '组织权限',
    path: '/sys/access',
    icon: 'UserFilled',
    moduleCode: 'sys',
    children: [
      { id: 'sys-users', title: '用户管理', path: '/sys/users', icon: 'User', moduleCode: 'sys' },
      { id: 'sys-roles', title: '角色管理', path: '/sys/roles', icon: 'Lock', moduleCode: 'sys' }
    ]
  },
  {
    id: 'sys-base',
    title: '基础配置',
    path: '/sys/base',
    icon: 'Setting',
    moduleCode: 'sys',
    children: [{ id: 'sys-dicts', title: '字典管理', path: '/sys/dicts', icon: 'CollectionTag', moduleCode: 'sys' }]
  }
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
const breadcrumbs: BreadcrumbItem[] = [{ title: '首页', path: '/' }, { title: '物料管理' }]
const demoUser: LoginUser = { userId: '1', username: 'admin', nickname: '平台管理员', roles: ['admin'], permissions: [] }
const layoutCollapsed = ref(false)
const portalWorkbenchTabId = '/portal'
const activeLayoutTabId = ref('/sys/users')
const layoutTabs = [
  { id: '/sys/users', title: '用户管理', icon: User },
  { id: '/sys/roles', title: '角色管理', icon: Lock },
  { id: '/sys/dicts', title: '字典管理', icon: CollectionTag }
]
const standardLayoutBreadcrumbs = computed<BreadcrumbItem[]>(() => [
  { title: '工作台', path: '/portal' },
  { title: '系统管理', path: activeLayoutTabId.value }
])
const layoutPreviewState = computed(() => {
  switch (activeLayoutTabId.value) {
    case '/sys/roles':
      return {
        title: '角色管理',
        description: '顶部 subheader 承载持久化 tab，角色页只负责当前 tab 的权限配置内容。',
        actionText: '新增角色',
        note: '切换到用户管理或字典管理后再回来，角色页的筛选条件、表格排序和编辑抽屉状态都可以继续保留。',
        metrics: [
          { label: '当前模块', value: '系统管理' },
          { label: '打开 Tabs', value: '3' },
          { label: '缓存策略', value: 'KeepAlive' }
        ],
        rows: [
          { id: '1', code: 'ROLE-ADMIN', name: '平台管理员', status: 'DONE' },
          { id: '2', code: 'ROLE-AUDIT', name: '安全审计员', status: 'PENDING' }
        ]
      }
    case '/sys/dicts':
      return {
        title: '字典管理',
        description: 'host 负责 tab 生命周期，业务页在当前 tab 下承载左右分栏或列表面板等具体内容。',
        actionText: '新增类型',
        note: '当字典管理切换到其他 tab 再返回时，当前选中的字典类型、搜索条件和展开面板状态都应可以恢复。',
        metrics: [
          { label: '当前模块', value: '系统管理' },
          { label: '打开 Tabs', value: '3' },
          { label: '持久化', value: 'localStorage' }
        ],
        rows: [
          { id: '1', code: 'DICT-STATUS', name: '业务状态', status: 'DONE' },
          { id: '2', code: 'DICT-MATERIAL', name: '物料类型', status: 'DONE' }
        ]
      }
    default:
      return {
        title: '用户管理',
        description: '左侧菜单、breadcrumb 和 tabs 由 host 统一组合，右侧只渲染当前 tab 的业务内容。',
        actionText: '新增用户',
        note: '切换到角色管理或字典管理再回来时，用户管理的查询条件、滚动位置和列表选中态仍可保持。',
        metrics: [
          { label: '当前模块', value: '系统管理' },
          { label: '打开 Tabs', value: '3' },
          { label: '当前激活', value: '用户管理' }
        ],
        rows: [
          { id: '1', code: 'USER-001', name: '平台管理员', status: 'DONE' },
          { id: '2', code: 'USER-002', name: '仓储主管', status: 'PENDING' }
        ]
      }
  }
})

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

function setLayoutPreviewPath(path: string): void {
  if (layoutTabs.some((tab) => tab.id === path)) {
    activeLayoutTabId.value = path
  }
}

function handleLayoutTabChange(name: string | number): void {
  setLayoutPreviewPath(String(name))
}

function handleLayoutPreviewMenuClick(menu: NavMenuItem): void {
  setLayoutPreviewPath(menu.path)
}

function componentPath(componentName: string): string {
  const item = componentCatalog.find((component) => component.name === componentName)
  return item?.docsPath ?? '/component/overview'
}
</script>

<style scoped>
.sw-component-detail {
  display: flex;
  flex-direction: column;
  gap: 24px;
  color: #0f172a;
}

.sw-component-detail__hero {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 32px;
  border: 1px solid #dbeafe;
  border-radius: 28px;
  background:
    radial-gradient(circle at top right, rgb(37 99 235 / 12%), transparent 28%),
    linear-gradient(135deg, #f8fbff 0%, #f7fee7 100%);
  box-shadow: 0 18px 40px rgb(15 23 42 / 8%);
}

.sw-component-detail__hero h1,
.sw-component-detail__hero p,
.sw-component-detail__code-note,
.sw-component-detail ul {
  margin: 0;
}

.sw-component-detail__hero p,
.sw-component-detail__code-note,
.sw-component-detail ul {
  color: #475569;
  line-height: 1.7;
}

.sw-component-detail__tags,
.sw-component-detail__links {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.sw-component-detail__links a {
  padding: 8px 14px;
  border: 1px solid #bfdbfe;
  border-radius: 999px;
  color: #1d4ed8;
  background: #eff6ff;
  font-weight: 600;
  text-decoration: none;
}

.sw-doc-preview {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
  border: 1px solid #e2e8f0;
  border-radius: 28px;
  background:
    linear-gradient(180deg, #fff 0%, #f8fafc 100%);
  overflow: hidden;
}

.sw-doc-preview--layout {
  padding: 0;
  background: #dbe4f0;
}

.sw-doc-preview--layout :deep(.sw-layout) {
  height: 720px;
  min-height: 720px;
}

.sw-doc-preview--layout :deep(.sw-platform-page__body) {
  overflow: hidden;
}

.sw-doc-tabs-shell {
  padding-top: 8px;
}

.sw-doc-tabs :deep(.el-tabs__header) {
  margin: 0;
}

.sw-doc-tabs :deep(.el-tabs__nav-wrap) {
  padding-inline: 12px;
}

.sw-doc-tabs :deep(.el-tabs__item) {
  height: 40px;
  padding-inline: 18px;
}

.sw-doc-tabs__label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.sw-doc-tabs__icon {
  font-size: 14px;
}

.sw-doc-layout-shell {
  min-width: 0;
  min-height: 0;
  flex: 1 1 auto;
  overflow: auto;
}

.sw-doc-layout-body {
  display: flex;
  min-width: 0;
  min-height: 0;
  flex-direction: column;
  gap: 16px;
}

.sw-doc-layout-note {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 14px 16px;
  border: 1px solid #bfdbfe;
  border-radius: 16px;
  color: #1e3a8a;
  background:
    linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%);
}

.sw-doc-layout-note strong {
  flex-shrink: 0;
  font-size: 13px;
}

.sw-doc-layout-note span {
  color: #334155;
  line-height: 1.6;
}

.sw-doc-summary-grid,
.sw-demo-grid {
  display: grid;
  gap: 14px;
}

.sw-doc-summary-grid {
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
}

.sw-demo-grid {
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.sw-doc-summary-card,
.sw-demo-panel {
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  background: linear-gradient(180deg, #fff 0%, #f8fafc 100%);
  box-shadow: 0 12px 28px rgb(15 23 42 / 6%);
}

.sw-doc-summary-card {
  padding: 16px;
}

.sw-doc-summary-card span {
  display: block;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #64748b;
}

.sw-doc-summary-card strong {
  display: block;
  margin-top: 10px;
  font-size: 22px;
  color: #0f172a;
}

.sw-demo-panel {
  padding: 18px;
}

.sw-demo-panel__eyebrow {
  margin: 0 0 10px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #64748b;
}

.sw-demo-panel strong {
  display: block;
  margin-bottom: 8px;
  font-size: 18px;
  color: #0f172a;
}

.sw-demo-panel p {
  margin: 0;
  color: #475569;
  line-height: 1.65;
}

.sw-code-block {
  margin: 0;
  padding: 18px 20px;
  border-radius: 20px;
  background: #0f172a;
  color: #e2e8f0;
  overflow: auto;
}

.sw-component-detail ul {
  padding-left: 20px;
}

@media (max-width: 960px) {
  .sw-component-detail__hero,
  .sw-doc-preview {
    padding: 20px;
  }

  .sw-doc-preview--layout {
    padding: 0;
  }

  .sw-doc-preview--layout :deep(.sw-layout) {
    height: 760px;
    min-height: 760px;
  }

  .sw-doc-layout-note {
    flex-direction: column;
  }
}
</style>
