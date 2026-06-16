import { componentCatalog, scenarioTemplateCatalog } from './componentCatalog'

// 组件详情页的 API 行模型，统一描述 Props、Events、Slots，便于 ComponentDetail 复用表格渲染。
export interface ApiRow {
  name: string
  type: string
  defaultValue?: string
  description: string
}

export interface ComponentDoc {
  slug: string
  name: string
  title: string
  description: string
  scenarios: string[]
  relatedTemplates: Array<{ name: string; path: string }>
  props: ApiRow[]
  events: ApiRow[]
  slots: ApiRow[]
  types: string
  code: string
  notes: string[]
}

type ComponentDocConfig = {
  props?: ApiRow[]
  events?: ApiRow[]
  slots?: ApiRow[]
  types?: string
  code?: string
  notes?: string[]
}

// 默认类型说明用于轻量组件，避免每个组件都重复写“无额外类型”的文案。
const emptyTypes = '该组件不暴露额外业务类型，按 Props 类型约束使用。'

// 通用注意事项强调组件库边界：组件负责展示和交互，不负责具体业务接口。
const commonNotes = [
  '组件只负责交互外观和前端状态表达，不在组件内部耦合具体业务接口。',
  '业务项目应通过后端接口、SDK 或页面层状态传入数据，避免在组件内写死业务规则。'
]

function prop(name: string, type: string, defaultValue: string, description: string): ApiRow {
  return { name, type, defaultValue, description }
}

function event(name: string, type: string, description: string): ApiRow {
  return { name, type, description }
}

function slot(name: string, type: string, description: string): ApiRow {
  return { name, type, description }
}

function basicImportCode(componentName: string, template: string): string {
  // 所有示例都从包入口导入组件，用文档站构建反向验证 platform-ui 是否漏导出。
  return `<script setup lang="ts">
import { ${componentName} } from '@smartwarehouse/platform-ui'
</script>

<template>
${template}
</template>`
}

function vModelCode(componentName: string, modelName: string, defaultValue: string, template: string): string {
  return `<script setup lang="ts">
import { ref } from 'vue'
import { ${componentName} } from '@smartwarehouse/platform-ui'

const ${modelName} = ref<string | undefined>(${defaultValue})
</script>

<template>
${template}
</template>`
}

function selectCode(componentName: string, modelName: string, defaultValue: string): string {
  return vModelCode(componentName, modelName, defaultValue, `  <${componentName} v-model="${modelName}" />`)
}

const codeExamples: Record<string, string> = {
  icon: `<script setup lang="ts">
import { Delete, Download, Edit, Search, Upload } from '@element-plus/icons-vue'
</script>

<template>
  <el-button :icon="Search">查询</el-button>
  <el-button type="primary" :icon="Edit">编辑</el-button>
  <el-button type="success" :icon="Download">下载</el-button>
  <el-button type="warning" :icon="Upload">上传</el-button>
  <el-button type="danger" :icon="Delete">删除</el-button>
</template>`,
  'status-tag': basicImportCode(
    'StatusTag',
    `  <StatusTag status="PENDING" />
  <StatusTag status="PROCESSING" />
  <StatusTag status="DONE" />
  <StatusTag status="FAILED" />
  <StatusTag status="CUSTOM" text="自定义" />`
  ),
  'dict-tag': basicImportCode('DictTag', `  <DictTag dict-type="material_type" value="RAW" />`),
  'permission-button': `<script setup lang="ts">
import { onMounted } from 'vue'
import { setPermissions } from '@smartwarehouse/platform-sdk'
import { PermissionButton } from '@smartwarehouse/platform-ui'

onMounted(() => {
  setPermissions(['wms:material:add'])
})
</script>

<template>
  <PermissionButton permission="wms:material:add" type="primary">
    新增物料
  </PermissionButton>
</template>`,
  'platform-layout': `<script setup lang="ts">
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
  }
]
const user: LoginUser = { userId: '1', username: 'admin', nickname: '平台管理员', roles: ['admin'], permissions: [] }
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
    show-workbench-button
    show-module-drawer-trigger
    @workbench-click="console.log('workbench')"
    @module-select="console.log($event)"
  >
    <div>页面内容</div>
  </PlatformLayout>
</template>`,
  'platform-page': `<script setup lang="ts">
import { PlatformPage, PermissionButton } from '@smartwarehouse/platform-ui'
</script>

<template>
  <PlatformPage title="物料管理" description="维护物料编码、名称、规格和状态">
    <template #toolbar>
      <PermissionButton permission="wms:material:add">新增</PermissionButton>
    </template>
    <div>页面主体内容</div>
  </PlatformPage>
</template>`,
  'breadcrumb-nav': `<script setup lang="ts">
import { BreadcrumbNav } from '@smartwarehouse/platform-ui'
import type { BreadcrumbItem } from '@smartwarehouse/platform-types'

const items: BreadcrumbItem[] = [{ title: '首页', path: '/' }, { title: '物料管理' }]
</script>

<template>
  <BreadcrumbNav :items="items" />
</template>`,
  'side-menu': `<script setup lang="ts">
import { SideMenu } from '@smartwarehouse/platform-ui'
import type { NavMenuItem } from '@smartwarehouse/platform-types'

const menus: NavMenuItem[] = [{ id: 'wms', title: '仓储管理', path: '/wms', moduleCode: 'wms' }]
</script>

<template>
  <SideMenu :menus="menus" active-path="/wms" />
</template>`,
  'user-dropdown': `<script setup lang="ts">
import { UserDropdown } from '@smartwarehouse/platform-ui'
import type { LoginUser } from '@smartwarehouse/platform-types'

const user: LoginUser = { userId: '1', username: 'admin', nickname: '平台管理员', roles: ['admin'], permissions: [] }
</script>

<template>
  <UserDropdown :user="user" @logout="console.log('logout')" />
</template>`,
  'platform-form': `<script setup lang="ts">
import { reactive } from 'vue'
import { PlatformForm } from '@smartwarehouse/platform-ui'
import type { FormFieldSchema } from '@smartwarehouse/platform-types'

const model = reactive<Record<string, unknown>>({ materialName: '', type: 'RAW', enabled: true })
const fields: FormFieldSchema[] = [
  { prop: 'materialName', label: '物料名称', required: true },
  { prop: 'type', label: '物料类型', type: 'select', options: [{ label: '原材料', value: 'RAW' }] },
  { prop: 'enabled', label: '启用', type: 'switch' }
]
</script>

<template>
  <PlatformForm :model="model" :fields="fields" />
</template>`,
  'platform-search-form': `<script setup lang="ts">
import { reactive } from 'vue'
import { PlatformSearchForm } from '@smartwarehouse/platform-ui'

const query = reactive({ keyword: '', status: '' })
</script>

<template>
  <PlatformSearchForm :model="query" @search="console.log(query)" @reset="query.keyword = ''">
    <el-form-item label="关键字">
      <el-input v-model="query.keyword" placeholder="请输入" />
    </el-form-item>
  </PlatformSearchForm>
</template>`,
  'platform-modal-form': `<script setup lang="ts">
import { ref } from 'vue'
import { PlatformModalForm } from '@smartwarehouse/platform-ui'

const visible = ref(false)
</script>

<template>
  <el-button type="primary" @click="visible = true">打开弹窗</el-button>
  <PlatformModalForm v-model="visible" title="新增记录" @submit="visible = false">
    <el-input placeholder="表单内容" />
  </PlatformModalForm>
</template>`,
  'drawer-form': `<script setup lang="ts">
import { ref } from 'vue'
import { DrawerForm } from '@smartwarehouse/platform-ui'

const visible = ref(false)
</script>

<template>
  <el-button type="primary" @click="visible = true">打开抽屉</el-button>
  <DrawerForm v-model="visible" title="编辑详情" @submit="visible = false">
    <el-input type="textarea" placeholder="详情内容" />
  </DrawerForm>
</template>`,
  'dict-select': `<script setup lang="ts">
import { ref } from 'vue'
import { DictSelect } from '@smartwarehouse/platform-ui'

const materialType = ref<string | number | undefined>('RAW')
</script>

<template>
  <DictSelect v-model="materialType" dict-type="material_type" />
</template>`,
  'user-select': selectCode('UserSelect', 'userId', "'u_admin'"),
  'org-tree-select': selectCode('OrgTreeSelect', 'orgId', "'org_wms'"),
  'warehouse-select': selectCode('WarehouseSelect', 'warehouseId', "'wh_raw_01'"),
  'location-tree-select': selectCode('LocationTreeSelect', 'locationId', "'loc_raw_a_0101'"),
  'material-select': selectCode('MaterialSelect', 'materialId', "'mat_001'"),
  'work-order-select': selectCode('WorkOrderSelect', 'workOrderId', "'wo_20260611_001'"),
  'platform-table': `<script setup lang="ts">
import { reactive } from 'vue'
import { PlatformTable, StatusTag } from '@smartwarehouse/platform-ui'
import type { TableColumn, TablePagination } from '@smartwarehouse/platform-types'

const columns: TableColumn[] = [
  { prop: 'code', label: '编码', width: 120 },
  { prop: 'name', label: '名称', minWidth: 160 },
  { prop: 'status', label: '状态', width: 120, align: 'center' }
]
const records = [{ id: '1', code: 'MAT-001', name: '控制器外壳', status: 'PENDING' }]
const pagination = reactive<TablePagination>({ pageNo: 1, pageSize: 10, total: 1 })
</script>

<template>
  <PlatformTable :columns="columns" :data="records" :pagination="pagination" selectable show-index>
    <template #cell-status="{ row }">
      <StatusTag :status="row.status" />
    </template>
  </PlatformTable>
</template>`,
  'batch-operation-bar': basicImportCode(
    'BatchOperationBar',
    `  <BatchOperationBar :selected-count="3" @clear="console.log('clear selected')">
    <el-button type="danger" plain>批量删除</el-button>
    <el-button plain>批量导出</el-button>
  </BatchOperationBar>`
  ),
  'dashboard-grid': `<script setup lang="ts">
import { DashboardGrid, StatCard } from '@smartwarehouse/platform-ui'
import type { StatCardItem } from '@smartwarehouse/platform-types'

const items: StatCardItem[] = [
  { key: 'inbound', title: '今日入库', value: 128, unit: '单', tone: 'success' },
  { key: 'outbound', title: '今日出库', value: 96, unit: '单', tone: 'primary' }
]
</script>

<template>
  <DashboardGrid>
    <StatCard v-for="item in items" :key="item.key" :item="item" />
  </DashboardGrid>
</template>`,
  'stat-card': `<script setup lang="ts">
import { StatCard } from '@smartwarehouse/platform-ui'
import type { StatCardItem } from '@smartwarehouse/platform-types'

const item: StatCardItem = { key: 'safe-stock', title: '安全库存预警', value: 12, unit: '项', trend: '+3', tone: 'warning' }
</script>

<template>
  <StatCard :item="item" />
</template>`,
  'rank-list': `<script setup lang="ts">
import { RankList } from '@smartwarehouse/platform-ui'
import type { RankItem } from '@smartwarehouse/platform-types'

const items: RankItem[] = [{ key: 'mat_001', name: '控制器外壳', value: 168, unit: '次', percent: 92, trend: 'up' }]
</script>

<template>
  <RankList title="物料申请排行" :items="items" />
</template>`,
  'alert-panel': `<script setup lang="ts">
import { AlertPanel } from '@smartwarehouse/platform-ui'
import type { AlertItem } from '@smartwarehouse/platform-types'

const items: AlertItem[] = [{ id: 'a1', title: '控制器外壳低于安全库存', level: 'warning', time: '09:30' }]
</script>

<template>
  <AlertPanel title="库存预警" :items="items" />
</template>`,
  'realtime-badge': basicImportCode(
    'RealtimeBadge',
    `  <RealtimeBadge online />
  <RealtimeBadge :online="false" offline-text="推送断开" />`
  ),
  'file-upload': `<script setup lang="ts">
import { ref } from 'vue'
import { FileUpload } from '@smartwarehouse/platform-ui'
import type { UploadUserFile } from 'element-plus'

const files = ref<UploadUserFile[]>([])
</script>

<template>
  <FileUpload v-model="files" accept=".xlsx,.csv" tip="仅上传离线导入模板文件" />
</template>`,
  'excel-import': basicImportCode(
    'ExcelImport',
    `  <ExcelImport
    template-text="下载入库模板"
    @import="(file) => console.log(file.name)"
    @download-template="console.log('download template')"
  />`
  ),
  'excel-export': basicImportCode('ExcelExport', `  <ExcelExport text="导出错误明细" @export="console.log('export')" />`),
  'upload-progress': `<script setup lang="ts">
import { UploadProgress } from '@smartwarehouse/platform-ui'
import type { ImportTask } from '@smartwarehouse/platform-types'

const task: ImportTask = {
  taskId: 'task_001',
  fileName: 'inbound.xlsx',
  status: 'PROCESSING',
  progress: 72,
  totalCount: 100,
  successCount: 70,
  failureCount: 2
}
</script>

<template>
  <UploadProgress :task="task" />
</template>`,
  'import-task-panel': `<script setup lang="ts">
import { ImportTaskPanel } from '@smartwarehouse/platform-ui'
import type { ImportTask } from '@smartwarehouse/platform-types'

const tasks: ImportTask[] = [{ taskId: 'task_001', fileName: 'inbound.xlsx', status: 'PROCESSING', progress: 72, totalCount: 100, successCount: 70, failureCount: 2 }]
</script>

<template>
  <ImportTaskPanel :tasks="tasks" @refresh="console.log('refresh')" />
</template>`,
  'import-error-table': `<script setup lang="ts">
import { ImportErrorTable } from '@smartwarehouse/platform-ui'
import type { ImportErrorRow } from '@smartwarehouse/platform-types'

const rows: ImportErrorRow[] = [{ rowNo: 12, field: 'locationCode', value: 'A-99-01', reason: '库位不存在' }]
</script>

<template>
  <ImportErrorTable :rows="rows" />
</template>`,
  'apply-status-timeline': `<script setup lang="ts">
import { ApplyStatusTimeline } from '@smartwarehouse/platform-ui'
import type { TimelineItem } from '@smartwarehouse/platform-types'

const items: TimelineItem[] = [{ title: '提交申请', status: 'success', time: '09:00' }, { title: '库存分配', status: 'primary', time: '09:20' }]
</script>

<template>
  <ApplyStatusTimeline :items="items" />
</template>`,
  'delivery-status-steps': basicImportCode(
    'DeliveryStatusSteps',
    `  <DeliveryStatusSteps
    status="PICKING"
    :steps="[
      { status: 'APPLIED', title: '已申请' },
      { status: 'ALLOCATED', title: '已分配' },
      { status: 'PICKING', title: '拣货中' },
      { status: 'DELIVERED', title: '已配送' }
    ]"
  />`
  ),
  'login-form': `<script setup lang="ts">
import { LoginForm } from '@smartwarehouse/platform-ui'
import type { LoginFormModel, LoginRiskState } from '@smartwarehouse/platform-types'

const riskState: LoginRiskState = { failureCount: 3, captchaRequired: true, message: '连续失败 3 次后启用随机拼图验证码' }

async function verifyCaptcha(x: number): Promise<string> {
  console.log('slider x:', x)
  return 'captcha-verify-token'
}

function login(model: LoginFormModel): void {
  console.log(model.username)
}
</script>

<template>
  <LoginForm :risk-state="riskState" :captcha-target="48" :captcha-verifier="verifyCaptcha" @submit="login" />
</template>`,
  'jigsaw-captcha': `<script setup lang="ts">
import { JigsawCaptcha } from '@smartwarehouse/platform-ui'

async function verifyCaptcha(x: number): Promise<string> {
  console.log('slider x:', x)
  return 'captcha-verify-token'
}
</script>

<template>
  <JigsawCaptcha :target="48" :verifier="verifyCaptcha" @success="(token) => console.log(token)" />
</template>`,
  'material-requirement-editor': `<script setup lang="ts">
import { ref } from 'vue'
import { MaterialRequirementEditor } from '@smartwarehouse/platform-ui'
import type { MaterialRequirement } from '@smartwarehouse/platform-types'

const rows = ref<MaterialRequirement[]>([
  { materialId: 'mat_001', materialCode: 'MAT-001', materialName: '控制器外壳', requiredQty: 12, allocatedQty: 8, unit: '个', status: 'PROCESSING' }
])
</script>

<template>
  <MaterialRequirementEditor v-model="rows" />
</template>`,
  'chat-panel': `<script setup lang="ts">
import { ref } from 'vue'
import { ChatPanel } from '@smartwarehouse/platform-ui'
import type { ChatMessage } from '@smartwarehouse/platform-types'

const prompt = ref('')
const messages = ref<ChatMessage[]>([{ id: 'm1', role: 'assistant', content: '你好，我可以查询库存与工单。' }])
</script>

<template>
  <ChatPanel v-model="prompt" :messages="messages" @send="messages.push({ id: Date.now().toString(), role: 'user', content: $event })" />
</template>`,
  'prompt-input': `<script setup lang="ts">
import { ref } from 'vue'
import { PromptInput } from '@smartwarehouse/platform-ui'

const prompt = ref('')
</script>

<template>
  <PromptInput v-model="prompt" hint="请输入自然语言问题" @send="console.log($event)" />
</template>`,
  'markdown-renderer': basicImportCode(
    'MarkdownRenderer',
    `  <MarkdownRenderer content="**控制器外壳** 当前库存低于安全库存，请优先补货。" />`
  ),
  'chatbi-result-table': `<script setup lang="ts">
import { ChatBIResultTable } from '@smartwarehouse/platform-ui'
import type { ChatBIColumn } from '@smartwarehouse/platform-types'

const columns: ChatBIColumn[] = [{ prop: 'materialName', label: '物料名称' }, { prop: 'applyCount', label: '申请次数', align: 'right' }]
const rows = [{ materialName: '控制器外壳', applyCount: 168 }]
const sql = 'select material_name, count(*) apply_count from mes_material_apply group by material_name'
</script>

<template>
  <ChatBIResultTable :columns="columns" :data="rows" :sql="sql" />
</template>`,
  'sql-preview': basicImportCode(
    'SqlPreview',
    `  <SqlPreview
    title="只读 SQL"
    sql="select material_name, count(*) apply_count from mes_material_apply group by material_name"
  />`
  ),
  'agent-step-timeline': `<script setup lang="ts">
import { AgentStepTimeline } from '@smartwarehouse/platform-ui'
import type { AgentStep } from '@smartwarehouse/platform-types'

const steps: AgentStep[] = [{ id: 's1', title: '理解问题', status: 'success' }, { id: 's2', title: '调用工具', status: 'running' }]
</script>

<template>
  <AgentStepTimeline :steps="steps" />
</template>`,
  'tool-call-trace': `<script setup lang="ts">
import { ToolCallTrace } from '@smartwarehouse/platform-ui'
import type { ToolCallRecord } from '@smartwarehouse/platform-types'

const records: ToolCallRecord[] = [{ id: 't1', toolName: 'query_inventory', serverName: 'mcp-business', status: 'success', input: '{\"material\":\"MAT-001\"}', output: '{\"qty\":120}', durationMs: 86 }]
</script>

<template>
  <ToolCallTrace :records="records" />
</template>`
}

const componentConfig: Record<string, ComponentDocConfig> = {
  icon: {
    props: [],
    events: [],
    slots: [],
    types: '图标规范不提供平台组件类型。业务前端按 Element Plus Icons 的组件类型使用。',
    notes: ['按钮、菜单、工具栏优先使用 Element Plus Icons，不在业务代码里手写 SVG。']
  },
  'status-tag': {
    props: [
      prop('status', 'string', 'PENDING', '状态值。内置 PENDING、PROCESSING、DONE、FAILED、DISABLED。'),
      prop('text', 'string', "''", '自定义展示文案，传入后优先于内置状态文案。')
    ]
  },
  'dict-tag': {
    props: [
      prop('dictType', 'string', '必填', '字典类型，例如 material_type、biz_status。'),
      prop('value', 'string | number', '-', '字典值。'),
      prop('fallback', 'string', '-', '未命中字典时的兜底展示文本。')
    ]
  },
  'permission-button': {
    props: [
      prop('permission', 'string | string[]', '-', '权限码，数组时任意一个命中即可。'),
      prop('mode', "'hide' | 'disable'", 'hide', '无权限时隐藏或禁用。'),
      prop('type', "'primary' | 'success' | 'warning' | 'danger' | 'info' | 'default'", 'primary', 'Element Plus 按钮类型。'),
      prop('disabled', 'boolean', 'false', '外部禁用状态。')
    ],
    events: [event('click', '[]', '按钮点击。')],
    slots: [slot('default', '-', '按钮文本或图标内容。')]
  },
  'platform-layout': {
    props: [
      prop('title', 'string', 'SmartWarehouse-AI', '顶部品牌标题。'),
      prop('menus', 'NavMenuItem[]', '[]', '侧边菜单数据。'),
      prop('breadcrumbs', 'BreadcrumbItem[]', '[]', '面包屑数据。'),
      prop('user', 'LoginUser', '-', '当前登录用户。'),
      prop('activePath', 'string', "''", '当前激活菜单路径。'),
      prop('collapsed', 'boolean', 'false', '侧边栏是否收起。'),
      prop('showAside', 'boolean', 'true', '是否显示左侧侧边栏。'),
      prop('brandAbbr', 'string', "''", '品牌区优先显示的缩写文案，例如 SW-AI；未传时回退为 title。'),
      prop('showWorkbenchButton', 'boolean', 'false', '是否显示顶部“工作台”按钮。'),
      prop('showWorkbenchDrawerButton', 'boolean', 'false', '是否在模块抽屉中显示“返回工作台”按钮。'),
      prop('showModuleDrawerTrigger', 'boolean', 'false', '是否显示左上角模块抽屉触发按钮。'),
      prop('moduleEntries', 'FrontendModule[]', '[]', '模块抽屉的数据源。'),
      prop('activeModuleCode', 'string', "''", '当前高亮的模块编码。')
    ],
    events: [
      event('update:collapsed', '[value: boolean]', '侧边栏收起状态变化。'),
      event('menuClick', '[menu: NavMenuItem]', '点击菜单项。'),
      event('userCommand', '[command: string]', '用户菜单命令。'),
      event('logout', '[]', '点击退出登录。'),
      event('workbenchClick', '[]', '点击工作台按钮。'),
      event('moduleSelect', '[module: FrontendModule]', '在模块抽屉中选择模块。')
    ],
    slots: [slot('default', '-', '主内容区。')],
    notes: [
      'showAside=false 时适合门户工作台页，内容区会占满主区域。',
      'showWorkbenchButton 与 showModuleDrawerTrigger 属于 host 专属能力，standalone 子应用应按场景隐藏。',
      'moduleEntries 仅负责数据展示与选择，不负责远程模块加载。'
    ]
  },
  'platform-page': {
    props: [prop('title', 'string', '-', '页面标题。'), prop('description', 'string', '-', '页面描述。')],
    slots: [slot('toolbar', '-', '右侧工具栏。'), slot('default', '-', '页面主体内容。')]
  },
  'breadcrumb-nav': {
    props: [prop('items', 'BreadcrumbItem[]', '[]', '面包屑项。')]
  },
  'side-menu': {
    props: [
      prop('menus', 'NavMenuItem[]', '[]', '菜单项。'),
      prop('activePath', 'string', "''", '当前激活路径。'),
      prop('collapsed', 'boolean', 'false', '是否收起。')
    ],
    events: [event('menuClick', '[menu: NavMenuItem]', '点击菜单。'), event('select', '[path: string]', '选择菜单路径。')]
  },
  'user-dropdown': {
    props: [prop('user', 'LoginUser', '-', '当前用户。')],
    events: [event('command', '[command: string]', '点击用户菜单命令。'), event('logout', '[]', '点击退出登录。')]
  },
  'platform-form': {
    props: [
      prop('model', 'Record<string, unknown>', '必填', '表单模型。'),
      prop('fields', 'FormFieldSchema[]', '必填', '字段 schema。'),
      prop('labelWidth', 'string', '96px', '标签宽度。'),
      prop('defaultSpan', 'number', '12', '默认栅格跨度。')
    ],
    slots: [slot('footer', '-', '表单底部操作区。')]
  },
  'platform-search-form': {
    props: [
      prop('model', 'Record<string, unknown>', '{}', '查询模型。'),
      prop('labelWidth', 'string', '88px', '标签宽度。'),
      prop('collapsible', 'boolean', 'true', '是否展示展开/收起按钮。')
    ],
    events: [event('search', '[]', '点击搜索。'), event('reset', '[]', '点击重置。')],
    slots: [slot('default', '{ expanded: boolean }', '查询条件内容。'), slot('actions', '{ expanded: boolean }', '自定义操作区。')]
  },
  'platform-modal-form': {
    props: [
      prop('modelValue', 'boolean', '必填', '弹窗显示状态。'),
      prop('title', 'string', '编辑', '弹窗标题。'),
      prop('width', 'string | number', '640px', '弹窗宽度。'),
      prop('loading', 'boolean', 'false', '提交按钮 loading。')
    ],
    events: [event('update:modelValue', '[value: boolean]', '显示状态变化。'), event('submit', '[]', '点击提交。'), event('cancel', '[]', '关闭或取消。')],
    slots: [slot('default', '-', '表单内容。')]
  },
  'drawer-form': {
    props: [
      prop('modelValue', 'boolean', '必填', '抽屉显示状态。'),
      prop('title', 'string', '编辑', '抽屉标题。'),
      prop('size', 'string | number', '520px', '抽屉宽度。'),
      prop('loading', 'boolean', 'false', '提交按钮 loading。')
    ],
    events: [event('update:modelValue', '[value: boolean]', '显示状态变化。'), event('submit', '[]', '点击提交。'), event('cancel', '[]', '关闭或取消。')],
    slots: [slot('default', '-', '表单内容。')]
  },
  'dict-select': {
    props: [
      prop('modelValue', 'string | number', '-', '选中值。'),
      prop('dictType', 'string', '必填', '字典类型。'),
      prop('placeholder', 'string', '请选择', '占位文本。'),
      prop('disabled', 'boolean', 'false', '是否禁用。')
    ],
    events: [event('update:modelValue', '[value: string | number | undefined]', '选中值变化。')]
  },
  'user-select': { props: sharedSelectProps('请选择用户'), events: sharedModelEvents() },
  'org-tree-select': { props: sharedSelectProps('请选择组织'), events: sharedModelEvents() },
  'warehouse-select': { props: sharedSelectProps('请选择仓库'), events: sharedModelEvents() },
  'location-tree-select': { props: sharedSelectProps('请选择库位'), events: sharedModelEvents() },
  'material-select': { props: sharedSelectProps('请选择物料'), events: sharedModelEvents() },
  'work-order-select': { props: sharedSelectProps('请选择工单'), events: sharedModelEvents() },
  'platform-table': {
    props: [
      prop('columns', 'TableColumn[]', '必填', '列配置。'),
      prop('data', 'Record<string, unknown>[]', '必填', '表格数据。'),
      prop('loading', 'boolean', 'false', '加载状态。'),
      prop('error', 'string', "''", '错误提示。'),
      prop('pagination', 'TablePagination', '-', '分页配置。'),
      prop('rowKey', 'string', 'id', '行主键。'),
      prop('selectable', 'boolean', 'false', '是否展示选择列。'),
      prop('showIndex', 'boolean', 'false', '是否展示序号列。'),
      prop('actionsWidth', 'string | number', '160', '操作列宽度。'),
      prop('pageSizes', 'number[]', '[10, 20, 50, 100]', '页大小选项。'),
      prop('height', 'string | number', '-', '表格高度。')
    ],
    events: [
      event('pageChange', '[pagination: TablePagination]', '分页变化。'),
      event('selectionChange', '[rows: Record<string, unknown>[]]', '多选行变化。'),
      event('sortChange', '[sort: { column: unknown; prop: string; order: string | null }]', '排序变化。')
    ],
    slots: [slot('cell-${prop}', '{ row, column, index }', '自定义某一列单元格。'), slot('actions', '{ row }', '操作列。')]
  },
  'batch-operation-bar': {
    props: [prop('selectedCount', 'number', '0', '已选择数量。')],
    events: [event('clear', '[]', '清空选择。')],
    slots: [slot('default', '-', '批量操作按钮。')]
  },
  'dashboard-grid': {
    props: [prop('minWidth', 'string', '220px', '每个网格项最小宽度。')],
    slots: [slot('default', '-', '看板子组件。')]
  },
  'stat-card': {
    props: [prop('item', 'StatCardItem', '必填', '指标卡片数据。')]
  },
  'rank-list': {
    props: [prop('title', 'string', '实时排行', '列表标题。'), prop('items', 'RankItem[]', '[]', '排行数据。')]
  },
  'alert-panel': {
    props: [prop('title', 'string', '安全库存预警', '面板标题。'), prop('items', 'AlertItem[]', '[]', '预警项。')]
  },
  'realtime-badge': {
    props: [
      prop('online', 'boolean', 'true', '是否在线。'),
      prop('onlineText', 'string', '实时在线', '在线文案。'),
      prop('offlineText', 'string', '连接断开', '离线文案。')
    ]
  },
  'file-upload': {
    props: [
      prop('modelValue', 'UploadUserFile[]', '[]', '文件列表。'),
      prop('action', 'string', '#', '上传地址。'),
      prop('accept', 'string', '-', '文件类型限制。'),
      prop('tip', 'string', '-', '提示文案。'),
      prop('limit', 'number', '1', '文件数量限制。'),
      prop('autoUpload', 'boolean', 'false', '是否自动上传。'),
      prop('disabled', 'boolean', 'false', '是否禁用。')
    ],
    events: [event('update:modelValue', '[value: UploadUserFile[]]', '文件列表变化。')]
  },
  'excel-import': {
    props: [prop('templateText', 'string', '下载模板', '模板下载按钮文案。')],
    events: [event('import', '[file: File]', '选择文件后触发。'), event('downloadTemplate', '[]', '点击下载模板。')]
  },
  'excel-export': {
    props: [
      prop('text', 'string', '导出', '按钮文案。'),
      prop('type', "'primary' | 'success' | 'warning' | 'danger' | 'info' | 'default'", 'primary', '按钮类型。'),
      prop('loading', 'boolean', 'false', '导出 loading。')
    ],
    events: [event('export', '[]', '点击导出。')]
  },
  'upload-progress': {
    props: [prop('task', 'ImportTask', '必填', '上传或导入任务。')]
  },
  'import-task-panel': {
    props: [
      prop('title', 'string', '导入任务', '面板标题。'),
      prop('description', 'string', '-', '面板描述。'),
      prop('tasks', 'ImportTask[]', '[]', '导入任务列表。')
    ],
    events: [event('refresh', '[]', '点击刷新。')]
  },
  'import-error-table': {
    props: [prop('rows', 'ImportErrorRow[]', '[]', '错误行。'), prop('pagination', 'TablePagination', '-', '分页配置。')],
    events: [event('pageChange', '[pagination: TablePagination]', '分页变化。')]
  },
  'apply-status-timeline': {
    props: [prop('items', 'TimelineItem[]', '[]', '时间线节点。')]
  },
  'delivery-status-steps': {
    props: [
      prop('status', 'string', '-', '当前状态值。'),
      prop('steps', 'Array<{ status: string; title: string; description?: string }>', '[]', '步骤配置。')
    ]
  },
  'login-form': {
    props: [
      prop('loading', 'boolean', 'false', '登录按钮 loading。'),
      prop('riskState', 'LoginRiskState', '-', '登录风控状态。'),
      prop('captchaTarget', 'number', '-', '后端挑战对应的滑块目标位置，未传入时使用本地演示目标。'),
      prop('captchaVerifier', '(x: number) => Promise<string>', '-', '后端验证码校验函数，返回一次性验证码通过 token。')
    ],
    events: [event('submit', '[model: LoginFormModel]', '提交登录表单。'), event('captchaReset', '[]', '用户刷新验证码。')]
  },
  'jigsaw-captcha': {
    props: [
      prop('target', 'number', '-', '滑块目标位置，适用于后端挑战和前端展示对齐。'),
      prop('verifier', '(x: number) => Promise<string>', '-', '后端校验函数，未传入时使用本地演示 token。')
    ],
    events: [event('success', '[token: string]', '拼图验证成功。'), event('reset', '[]', '刷新拼图。')]
  },
  'material-requirement-editor': {
    props: [prop('modelValue', 'MaterialRequirement[]', '[]', '物料需求行。'), prop('disabled', 'boolean', 'false', '是否只读。')],
    events: [event('update:modelValue', '[rows: MaterialRequirement[]]', '需求行变化。')]
  },
  'chat-panel': {
    props: [
      prop('messages', 'ChatMessage[]', '[]', '消息列表。'),
      prop('modelValue', 'string', "''", '输入框内容。'),
      prop('loading', 'boolean', 'false', '发送或回答 loading。')
    ],
    events: [event('update:modelValue', '[value: string]', '输入内容变化。'), event('send', '[value: string]', '发送消息。')]
  },
  'prompt-input': {
    props: [
      prop('modelValue', 'string', "''", '输入内容。'),
      prop('placeholder', 'string', '请输入问题或指令', '占位文本。'),
      prop('hint', 'string', '-', '底部提示。'),
      prop('rows', 'number', '3', '文本域行数。'),
      prop('loading', 'boolean', 'false', '发送 loading。'),
      prop('disabled', 'boolean', 'false', '是否禁用。')
    ],
    events: [event('update:modelValue', '[value: string]', '输入内容变化。'), event('send', '[value: string]', '发送。')]
  },
  'markdown-renderer': {
    props: [prop('content', 'string', "''", 'Markdown 文本。')]
  },
  'chatbi-result-table': {
    props: [
      prop('columns', 'ChatBIColumn[]', '[]', '结果列配置。'),
      prop('data', 'Record<string, unknown>[]', '[]', '结果数据。'),
      prop('sql', 'string', "''", 'SQL 预览内容。'),
      prop('loading', 'boolean', 'false', '加载状态。'),
      prop('pagination', 'TablePagination', '-', '分页配置。')
    ],
    events: [event('pageChange', '[pagination: TablePagination]', '分页变化。')]
  },
  'sql-preview': {
    props: [prop('title', 'string', 'SQL 预览', '标题。'), prop('sql', 'string', "''", 'SQL 文本。')]
  },
  'agent-step-timeline': {
    props: [prop('steps', 'AgentStep[]', '[]', 'Agent 执行步骤。')]
  },
  'tool-call-trace': {
    props: [prop('records', 'ToolCallRecord[]', '[]', '工具调用记录。')]
  }
}

function sharedSelectProps(placeholder: string): ApiRow[] {
  return [
    prop('modelValue', 'string', '-', '选中值。'),
    prop('placeholder', 'string', placeholder, '占位文本。'),
    prop('disabled', 'boolean', 'false', '是否禁用。')
  ]
}

function sharedModelEvents(): ApiRow[] {
  return [event('update:modelValue', '[value: string | undefined]', '选中值变化。')]
}

function relatedTemplates(componentName: string): Array<{ name: string; path: string }> {
  return scenarioTemplateCatalog
    .filter((item) => item.components?.includes(componentName))
    .map((item) => ({ name: item.name, path: item.docsPath ?? `/scenario/${item.slug}` }))
}

function typesFor(slug: string): string {
  const map: Record<string, string> = {
    'platform-layout': `interface NavMenuItem {
  id: string
  title: string
  path: string
  moduleCode?: 'sys' | 'wms' | 'mes' | 'task' | 'ai'
  children?: NavMenuItem[]
}

interface FrontendModule {
  moduleCode: 'sys' | 'wms' | 'mes' | 'task' | 'ai'
  moduleName: string
  routePrefix: string
  entryUrl: string
  apiPrefix: string
  ownerType: 'OWNER' | 'VENDOR'
}`,
    'platform-form': `interface FormFieldSchema {
  prop: string
  label: string
  type?: 'input' | 'textarea' | 'select' | 'tree-select' | 'date' | 'datetime' | 'number' | 'switch'
  options?: SelectOption[] | DictOption[] | TreeOption[]
  required?: boolean
  span?: number
}`,
    'platform-table': `interface TableColumn {
  prop?: string
  label: string
  width?: string | number
  minWidth?: string | number
  align?: 'left' | 'center' | 'right'
  sortable?: boolean | 'custom'
}`,
    'stat-card': `interface StatCardItem {
  key: string
  title: string
  value: string | number
  unit?: string
  trend?: string
  tone?: StatusTone
}`,
    'rank-list': `interface RankItem {
  key: string
  name: string
  value: number
  unit?: string
  percent?: number
  trend?: 'up' | 'down' | 'flat'
}`,
    'alert-panel': `interface AlertItem {
  id: string
  title: string
  message?: string
  level: 'info' | 'warning' | 'danger'
  time?: string
}`,
    'upload-progress': importTaskType,
    'import-task-panel': importTaskType,
    'import-error-table': `interface ImportErrorRow {
  rowNo: number
  field: string
  value?: string | number
  reason: string
}`,
    'apply-status-timeline': `interface TimelineItem {
  title: string
  description?: string
  status?: StatusTone
  time?: string
}`,
    'login-form': `interface LoginRiskState {
  failureCount: number
  captchaRequired: boolean
  lockedUntil?: string
  message?: string
}`,
    'material-requirement-editor': `interface MaterialRequirement {
  materialId: string
  materialCode?: string
  materialName: string
  requiredQty: number
  allocatedQty?: number
  unit: string
  status?: string
}`,
    'chat-panel': `interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system' | 'tool'
  content: string
  time?: string
  loading?: boolean
}`,
    'chatbi-result-table': `interface ChatBIColumn {
  prop: string
  label: string
  width?: string | number
  align?: 'left' | 'center' | 'right'
}`,
    'agent-step-timeline': `interface AgentStep {
  id: string
  title: string
  status: 'waiting' | 'running' | 'success' | 'failed'
  description?: string
}`,
    'tool-call-trace': `interface ToolCallRecord {
  id: string
  toolName: string
  serverName?: string
  status: 'running' | 'success' | 'failed'
  input?: string
  output?: string
  durationMs?: number
}`
  }

  return map[slug] ?? emptyTypes
}

const importTaskType = `interface ImportTask {
  taskId: string
  fileName: string
  status: 'PENDING' | 'PROCESSING' | 'DONE' | 'FAILED'
  progress: number
  totalCount: number
  successCount: number
  failureCount: number
}`

export const componentDocs: ComponentDoc[] = componentCatalog.map((item) => {
  const config = componentConfig[item.slug] ?? {}
  return {
    slug: item.slug,
    name: item.name,
    title: item.title,
    description: item.description,
    scenarios: item.scenarios,
    relatedTemplates: relatedTemplates(item.name),
    props: config.props ?? [],
    events: config.events ?? [],
    slots: config.slots ?? [],
    types: config.types ?? typesFor(item.slug),
    code: config.code ?? codeExamples[item.slug] ?? basicImportCode(item.name, `  <${item.name} />`),
    notes: [...commonNotes, ...(config.notes ?? [])]
  }
})

export function getComponentDoc(slug: string): ComponentDoc | undefined {
  return componentDocs.find((item) => item.slug === slug)
}
