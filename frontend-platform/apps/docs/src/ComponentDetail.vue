<template>
  <section v-if="doc" class="sw-component-detail">
    <header class="sw-component-detail__hero">
      <p class="sw-doc-eyebrow">Component</p>
      <h1>{{ doc.name }} {{ doc.title }}</h1>
      <p>{{ doc.description }}</p>
      <div class="sw-component-detail__tags">
        <el-tag v-for="scene in doc.scenarios" :key="scene" effect="plain">{{ scene }}</el-tag>
      </div>
    </header>

    <h2 id="basic-usage">基础用法</h2>
    <div class="sw-doc-preview" :class="previewClass">
      <template v-if="doc.slug === 'icon'">
        <div class="sw-demo-inline">
          <el-button :icon="Search">查询</el-button>
          <el-button type="primary" :icon="Edit">编辑</el-button>
          <el-button type="success" :icon="Download">下载</el-button>
          <el-button type="warning" :icon="Upload">上传</el-button>
          <el-button type="danger" :icon="Delete">删除</el-button>
        </div>
      </template>

      <template v-else-if="doc.slug === 'status-tag'">
        <div class="sw-demo-inline">
          <StatusTag status="PENDING" />
          <StatusTag status="PROCESSING" />
          <StatusTag status="DONE" />
          <StatusTag status="FAILED" />
          <StatusTag status="CUSTOM" text="自定义" />
        </div>
      </template>

      <template v-else-if="doc.slug === 'dict-tag'">
        <div class="sw-demo-inline">
          <DictTag dict-type="material_type" value="RAW" />
          <DictTag dict-type="material_type" value="WIP" />
          <DictTag dict-type="biz_status" value="DONE" />
        </div>
      </template>

      <template v-else-if="doc.slug === 'permission-button'">
        <div class="sw-demo-inline">
          <PermissionButton permission="wms:material:add" type="primary">有权限按钮</PermissionButton>
          <PermissionButton permission="wms:material:delete" mode="disable" type="danger">禁用按钮</PermissionButton>
        </div>
      </template>

      <template v-else-if="doc.slug === 'platform-layout'">
        <PlatformLayout
          title="SmartWarehouse-AI"
          :menus="menus"
          :breadcrumbs="breadcrumbs"
          :user="demoUser"
          active-path="/wms/material"
        >
          <div class="sw-demo-panel">页面内容区</div>
        </PlatformLayout>
      </template>

      <template v-else-if="doc.slug === 'platform-page'">
        <PlatformPage title="物料管理" description="维护物料编码、名称、规格和状态">
          <template #toolbar>
            <PermissionButton permission="wms:material:add">新增</PermissionButton>
          </template>
          <div class="sw-demo-panel">页面主体内容</div>
        </PlatformPage>
      </template>

      <template v-else-if="doc.slug === 'breadcrumb-nav'">
        <BreadcrumbNav :items="breadcrumbs" />
      </template>

      <template v-else-if="doc.slug === 'side-menu'">
        <SideMenu :menus="menus" active-path="/wms/material" />
      </template>

      <template v-else-if="doc.slug === 'user-dropdown'">
        <UserDropdown :user="demoUser" />
      </template>

      <template v-else-if="doc.slug === 'platform-form'">
        <PlatformForm :model="formModel" :fields="formFields">
          <template #footer>
            <el-button>取消</el-button>
            <el-button type="primary">保存</el-button>
          </template>
        </PlatformForm>
      </template>

      <template v-else-if="doc.slug === 'platform-search-form'">
        <PlatformSearchForm :model="queryModel">
          <el-form-item label="关键字">
            <el-input v-model="queryModel.keyword" placeholder="请输入" />
          </el-form-item>
          <el-form-item label="状态">
            <DictSelect v-model="queryModel.status" dict-type="biz_status" />
          </el-form-item>
        </PlatformSearchForm>
      </template>

      <template v-else-if="doc.slug === 'platform-modal-form'">
        <el-button type="primary" @click="modalVisible = true">打开弹窗</el-button>
        <PlatformModalForm v-model="modalVisible" title="新增记录" @submit="modalVisible = false">
          <el-input placeholder="表单内容" />
        </PlatformModalForm>
      </template>

      <template v-else-if="doc.slug === 'drawer-form'">
        <el-button type="primary" @click="drawerVisible = true">打开抽屉</el-button>
        <DrawerForm v-model="drawerVisible" title="编辑详情" @submit="drawerVisible = false">
          <el-input type="textarea" placeholder="详情内容" />
        </DrawerForm>
      </template>

      <template v-else-if="doc.slug === 'dict-select'">
        <DictSelect v-model="dictValue" dict-type="material_type" />
      </template>

      <template v-else-if="doc.slug === 'user-select'">
        <UserSelect v-model="selectModels.userId" />
      </template>

      <template v-else-if="doc.slug === 'org-tree-select'">
        <OrgTreeSelect v-model="selectModels.orgId" />
      </template>

      <template v-else-if="doc.slug === 'warehouse-select'">
        <WarehouseSelect v-model="selectModels.warehouseId" />
      </template>

      <template v-else-if="doc.slug === 'location-tree-select'">
        <LocationTreeSelect v-model="selectModels.locationId" />
      </template>

      <template v-else-if="doc.slug === 'material-select'">
        <MaterialSelect v-model="selectModels.materialId" />
      </template>

      <template v-else-if="doc.slug === 'work-order-select'">
        <WorkOrderSelect v-model="selectModels.workOrderId" />
      </template>

      <template v-else-if="doc.slug === 'platform-table'">
        <PlatformTable :columns="tableColumns" :data="tableRows" :pagination="pagination" selectable show-index>
          <template #cell-status="{ row }">
            <StatusTag :status="row.status" />
          </template>
          <template #actions>
            <el-button text type="primary">查看</el-button>
          </template>
        </PlatformTable>
      </template>

      <template v-else-if="doc.slug === 'batch-operation-bar'">
        <BatchOperationBar :selected-count="3">
          <el-button type="danger" plain>批量删除</el-button>
          <el-button plain>批量导出</el-button>
        </BatchOperationBar>
      </template>

      <template v-else-if="doc.slug === 'dashboard-grid'">
        <DashboardGrid>
          <StatCard v-for="item in statItems" :key="item.key" :item="item" />
        </DashboardGrid>
      </template>

      <template v-else-if="doc.slug === 'stat-card'">
        <StatCard :item="statItems[0]" />
      </template>

      <template v-else-if="doc.slug === 'rank-list'">
        <RankList title="物料申请排行" :items="rankItems" />
      </template>

      <template v-else-if="doc.slug === 'alert-panel'">
        <AlertPanel title="库存预警" :items="alertItems" />
      </template>

      <template v-else-if="doc.slug === 'realtime-badge'">
        <div class="sw-demo-inline">
          <RealtimeBadge online />
          <RealtimeBadge :online="false" offline-text="推送断开" />
        </div>
      </template>

      <template v-else-if="doc.slug === 'file-upload'">
        <FileUpload v-model="files" accept=".xlsx,.csv" tip="仅上传离线导入模板文件" />
      </template>

      <template v-else-if="doc.slug === 'excel-import'">
        <ExcelImport template-text="下载入库模板" />
      </template>

      <template v-else-if="doc.slug === 'excel-export'">
        <ExcelExport text="导出错误明细" />
      </template>

      <template v-else-if="doc.slug === 'upload-progress'">
        <UploadProgress :task="importTasks[0]" />
      </template>

      <template v-else-if="doc.slug === 'import-task-panel'">
        <ImportTaskPanel :tasks="importTasks" />
      </template>

      <template v-else-if="doc.slug === 'import-error-table'">
        <ImportErrorTable :rows="importErrors" />
      </template>

      <template v-else-if="doc.slug === 'apply-status-timeline'">
        <ApplyStatusTimeline :items="timelineItems" />
      </template>

      <template v-else-if="doc.slug === 'delivery-status-steps'">
        <DeliveryStatusSteps status="PICKING" :steps="deliverySteps" />
      </template>

      <template v-else-if="doc.slug === 'login-form'">
        <div class="sw-doc-preview__center">
          <LoginForm :risk-state="riskState" />
        </div>
      </template>

      <template v-else-if="doc.slug === 'jigsaw-captcha'">
        <div class="sw-doc-preview__center">
          <JigsawCaptcha />
        </div>
      </template>

      <template v-else-if="doc.slug === 'material-requirement-editor'">
        <MaterialRequirementEditor v-model="requirements" />
      </template>

      <template v-else-if="doc.slug === 'chat-panel'">
        <ChatPanel v-model="prompt" :messages="messages" @send="appendMessage" />
      </template>

      <template v-else-if="doc.slug === 'prompt-input'">
        <PromptInput v-model="prompt" hint="请输入自然语言问题" />
      </template>

      <template v-else-if="doc.slug === 'markdown-renderer'">
        <MarkdownRenderer content="**控制器外壳** 当前库存低于安全库存，请优先补货。" />
      </template>

      <template v-else-if="doc.slug === 'chatbi-result-table'">
        <ChatBIResultTable :columns="chatBiColumns" :data="chatBiRows" :sql="chatBiSql" />
      </template>

      <template v-else-if="doc.slug === 'sql-preview'">
        <SqlPreview title="只读 SQL" :sql="chatBiSql" />
      </template>

      <template v-else-if="doc.slug === 'agent-step-timeline'">
        <AgentStepTimeline :steps="agentSteps" />
      </template>

      <template v-else-if="doc.slug === 'tool-call-trace'">
        <ToolCallTrace :records="toolCalls" />
      </template>
    </div>

    <h2 id="code">示例代码（Vue + TypeScript）</h2>
    <p class="sw-component-detail__code-note">
      以下示例均使用 <code>&lt;script setup lang="ts"&gt;</code> 编写。
    </p>
    <pre class="sw-code-block"><code>{{ doc.code }}</code></pre>

    <h2 id="props">Props</h2>
    <ApiTable :rows="doc.props" empty-text="该组件不暴露 Props。" />

    <h2 id="events">Events</h2>
    <ApiTable :rows="doc.events" empty-text="该组件不暴露 Events。" />

    <h2 id="slots">Slots</h2>
    <ApiTable :rows="doc.slots" empty-text="该组件不暴露 Slots。" />

    <h2 id="types">Types</h2>
    <pre class="sw-code-block"><code>{{ doc.types }}</code></pre>

    <h2 id="notes">注意事项</h2>
    <ul>
      <li v-for="note in doc.notes" :key="note">{{ note }}</li>
    </ul>

    <template v-if="doc.relatedTemplates.length">
      <h2 id="related-templates">关联场景模板</h2>
      <div class="sw-component-detail__links">
        <a v-for="template in doc.relatedTemplates" :key="template.path" :href="template.path">{{ template.name }}</a>
      </div>
    </template>
  </section>
  <el-alert v-else type="warning" title="组件文档不存在" :closable="false" />
</template>

<script setup lang="ts">
import { computed, defineComponent, h, onMounted, reactive, ref, type PropType } from 'vue'
import { Delete, Download, Edit, Search, Upload } from '@element-plus/icons-vue'
import type { UploadUserFile } from 'element-plus'
import { setPermissions } from '@smartwarehouse/platform-sdk'
import type {
  AgentStep,
  AlertItem,
  BreadcrumbItem,
  ChatBIColumn,
  ChatMessage,
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
  BreadcrumbNav,
  ChatBIResultTable,
  ChatPanel,
  DashboardGrid,
  DeliveryStatusSteps,
  DictSelect,
  DictTag,
  DrawerForm,
  ExcelExport,
  ExcelImport,
  FileUpload,
  ImportErrorTable,
  ImportTaskPanel,
  JigsawCaptcha,
  LocationTreeSelect,
  LoginForm,
  MarkdownRenderer,
  MaterialRequirementEditor,
  MaterialSelect,
  OrgTreeSelect,
  PermissionButton,
  PlatformForm,
  PlatformLayout,
  PlatformModalForm,
  PlatformPage,
  PlatformSearchForm,
  PlatformTable,
  PromptInput,
  RankList,
  RealtimeBadge,
  SideMenu,
  SqlPreview,
  StatCard,
  StatusTag,
  ToolCallTrace,
  UploadProgress,
  UserDropdown,
  UserSelect,
  WarehouseSelect,
  WorkOrderSelect
} from '@smartwarehouse/platform-ui'
import type { ApiRow } from './componentDocs'
import { getComponentDoc } from './componentDocs'

const props = defineProps<{
  slug: string
}>()

const doc = computed(() => getComponentDoc(props.slug))
// 布局类和窄组件需要不同预览容器，但外层仍保持统一 Demo 规范。
const previewClass = computed(() => ({
  'sw-doc-preview--layout': doc.value?.slug === 'platform-layout',
  'sw-doc-preview--narrow': ['login-form', 'jigsaw-captcha', 'prompt-input'].includes(doc.value?.slug ?? '')
}))

const ApiTable = defineComponent({
  name: 'ApiTable',
  props: {
    rows: {
      type: Array as PropType<ApiRow[]>,
      required: true
    },
    emptyText: {
      type: String,
      required: true
    }
  },
  setup(tableProps) {
    // API 表通过渲染函数复用 Props、Events、Slots 三类数据，避免模板里重复三套表格。
    return () =>
      tableProps.rows.length
        ? h('table', { class: 'sw-api-table' }, [
            h('thead', [h('tr', [h('th', '名称'), h('th', '类型'), h('th', '默认值'), h('th', '说明')])]),
            h(
              'tbody',
              tableProps.rows.map((row) =>
                h('tr', [
                  h('td', [h('code', row.name)]),
                  h('td', [h('code', row.type)]),
                  h('td', row.defaultValue ? [h('code', row.defaultValue)] : '-'),
                  h('td', row.description)
                ])
              )
            )
          ])
        : h('p', { class: 'sw-doc-empty' }, tableProps.emptyText)
  }
})

const menus: NavMenuItem[] = [
  { id: 'sys', title: '系统管理', path: '/sys', moduleCode: 'sys' },
  {
    id: 'wms',
    title: '仓储管理',
    path: '/wms',
    moduleCode: 'wms',
    children: [{ id: 'material', title: '物料管理', path: '/wms/material', moduleCode: 'wms' }]
  }
]

// 以下 demo 数据只服务组件文档站预览，真实业务数据应由 sys/wms/mes/task/ai 服务接口提供。
const breadcrumbs: BreadcrumbItem[] = [{ title: '首页', path: '/' }, { title: '物料管理' }]
const demoUser: LoginUser = {
  userId: '1',
  username: 'admin',
  nickname: '平台管理员',
  roles: ['admin'],
  permissions: ['wms:material:add']
}

const formModel = reactive<Record<string, unknown>>({
  materialName: '控制器外壳',
  type: 'RAW',
  enabled: true
})

const formFields: FormFieldSchema[] = [
  { prop: 'materialName', label: '物料名称', required: true },
  { prop: 'type', label: '物料类型', type: 'select', options: [{ label: '原材料', value: 'RAW' }] },
  { prop: 'enabled', label: '启用', type: 'switch' }
]

const queryModel = reactive<Record<string, unknown>>({
  keyword: '',
  status: 'PENDING'
})

const modalVisible = ref(false)
const drawerVisible = ref(false)
const dictValue = ref<string | number | undefined>('RAW')
const files = ref<UploadUserFile[]>([])

const selectModels = reactive({
  userId: 'u_admin',
  orgId: 'org_wms',
  warehouseId: 'wh_raw_01',
  locationId: 'loc_raw_a_0101',
  materialId: 'mat_001',
  workOrderId: 'wo_20260611_001'
})

const tableColumns: TableColumn[] = [
  { prop: 'code', label: '编码', width: 120 },
  { prop: 'name', label: '名称', minWidth: 160, showOverflowTooltip: true },
  { prop: 'status', label: '状态', width: 120, align: 'center' }
]

const tableRows = [
  { id: '1', code: 'MAT-001', name: '控制器外壳', status: 'PENDING' },
  { id: '2', code: 'MAT-002', name: '装配线束', status: 'PROCESSING' }
]

const pagination = reactive<TablePagination>({ pageNo: 1, pageSize: 10, total: 2 })

const statItems: StatCardItem[] = [
  { key: 'inbound', title: '今日入库', value: 128, unit: '单', trend: '+12%', tone: 'success' },
  { key: 'alert', title: '安全库存预警', value: 12, unit: '项', trend: '+3', tone: 'warning' }
]

const rankItems: RankItem[] = [
  { key: 'mat_001', name: '控制器外壳', value: 168, unit: '次', percent: 92, trend: 'up' },
  { key: 'mat_002', name: '装配线束', value: 124, unit: '次', percent: 76, trend: 'flat' }
]

const alertItems: AlertItem[] = [
  { id: 'a1', title: '控制器外壳低于安全库存', level: 'warning', time: '09:30' },
  { id: 'a2', title: '二号半成品仓待补货', level: 'info', time: '10:05' }
]

const importTasks: ImportTask[] = [
  {
    taskId: 'task_001',
    fileName: 'inbound-20260611.xlsx',
    status: 'PROCESSING',
    progress: 72,
    totalCount: 100,
    successCount: 70,
    failureCount: 2,
    message: '正在校验物料、仓库、库位和批次'
  }
]

const importErrors: ImportErrorRow[] = [
  { rowNo: 12, field: 'locationCode', value: 'A-99-01', reason: '库位不存在' },
  { rowNo: 18, field: 'quantity', value: -3, reason: '数量必须大于 0' }
]

const timelineItems: TimelineItem[] = [
  { title: '提交申请', status: 'success', time: '09:00', description: '生产计划提交物料申请' },
  { title: '库存分配', status: 'primary', time: '09:20', description: 'WMS 锁定可用库存' },
  { title: '配送中', status: 'info', time: '09:40', description: '线边配送待签收' }
]

const deliverySteps = [
  { status: 'APPLIED', title: '已申请' },
  { status: 'ALLOCATED', title: '已分配' },
  { status: 'PICKING', title: '拣货中' },
  { status: 'DELIVERED', title: '已配送' }
]

const riskState: LoginRiskState = {
  failureCount: 3,
  captchaRequired: true,
  message: '连续失败 3 次后启用随机拼图验证码'
}

const requirements = ref<MaterialRequirement[]>([
  {
    materialId: 'mat_001',
    materialCode: 'MAT-001',
    materialName: '控制器外壳',
    requiredQty: 12,
    allocatedQty: 8,
    unit: '个',
    status: 'PROCESSING'
  }
])

const prompt = ref('最近 7 天申请次数最多的物料是什么？')
const messages = ref<ChatMessage[]>([
  { id: 'm1', role: 'assistant', content: '你好，我可以查询库存与工单。', time: '09:30' }
])

const chatBiColumns: ChatBIColumn[] = [
  { prop: 'materialName', label: '物料名称', width: 180 },
  { prop: 'applyCount', label: '申请次数', width: 120, align: 'right' }
]

const chatBiRows = [{ materialName: '控制器外壳', applyCount: 168 }]
const chatBiSql = 'select material_name, count(*) apply_count from mes_material_apply group by material_name'

const agentSteps: AgentStep[] = [
  { id: 's1', title: '理解问题', status: 'success', description: '识别统计周期和指标' },
  { id: 's2', title: '调用工具', status: 'running', description: '查询物料申请排行' }
]

const toolCalls: ToolCallRecord[] = [
  {
    id: 't1',
    toolName: 'query_inventory_rank',
    serverName: 'mcp-business',
    status: 'success',
    input: '{"days":7}',
    output: '{"top":"MAT-001"}',
    durationMs: 86,
    time: '09:40'
  }
]

onMounted(() => {
  // 文档站中演示 PermissionButton 时需要预置权限，真实项目由登录后用户权限初始化。
  setPermissions(['wms:material:add'])
})

function appendMessage(value: string): void {
  const text = value.trim()
  if (!text) {
    return
  }

  // 文档站只模拟用户发送消息，不调用真实 AI 接口，避免组件文档与业务服务耦合。
  messages.value.push({ id: String(Date.now()), role: 'user', content: text, time: '刚刚' })
  prompt.value = ''
}
</script>
