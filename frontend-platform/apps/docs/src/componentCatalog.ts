export type CatalogStatus = 'documented' | 'overview'

// 目录分组元数据同时服务左侧侧边栏和总览页分区，key 必须保持稳定，避免链接锚点变化。
export interface CatalogGroupMeta {
  key: string
  name: string
  description: string
}

// 单组件与场景模板共用同一套目录条目结构，通过 docsPath 区分跳转到 /component 还是 /scenario。
export interface CatalogItemMeta {
  slug: string
  name: string
  title: string
  group: string
  groupName: string
  status: CatalogStatus
  description: string
  scenarios: string[]
  docsPath?: string
  since: string
  tags: string[]
  components?: string[]
}

function createGroupNameMap(groups: CatalogGroupMeta[]): Record<string, string> {
  // 预先生成 groupName 映射，新增目录条目时只填 group key，避免每个组件重复写中文分组名。
  return groups.reduce<Record<string, string>>((result, group) => {
    result[group.key] = group.name
    return result
  }, {})
}

// 组件分组必须保持业务无关，便于乙方按“组件能力”查找，而不是按 WMS/MES/AI 项目查找。
export const componentGroups: CatalogGroupMeta[] = [
  {
    key: 'basic',
    name: '基础',
    description: '跨页面复用的轻量展示、权限、状态和图标规范，保持与具体业务无关。'
  },
  {
    key: 'layout',
    name: '布局',
    description: '统一企业后台页面骨架、导航、面包屑、用户入口和页面容器。'
  },
  {
    key: 'data-entry',
    name: '数据录入',
    description: '面向表单、查询、选择器、上传和编辑等高频录入场景。'
  },
  {
    key: 'data-display',
    name: '数据展示',
    description: '沉淀表格、批量操作、统计、排行、预警和实时状态等展示能力。'
  },
  {
    key: 'feedback-flow',
    name: '反馈与流程',
    description: '用于导入进度、错误明细、流程节点和状态流转。'
  },
  {
    key: 'advanced',
    name: '高级组件',
    description: '封装登录风控、复杂编辑、AI 对话、ChatBI、Agent 和工具调用轨迹。'
  }
]

const componentGroupNameMap = createGroupNameMap(componentGroups)

function componentItem(
  item: Omit<CatalogItemMeta, 'groupName' | 'status' | 'docsPath' | 'since'> & {
    status?: CatalogStatus
    docsPath?: string
    since?: string
  }
): CatalogItemMeta {
  // 单组件默认落到 /component/<slug>，这是组件入口保持单组件边界的关键约束。
  return {
    ...item,
    groupName: componentGroupNameMap[item.group],
    status: item.status ?? 'documented',
    docsPath: item.docsPath ?? `/component/${item.slug}`,
    since: item.since ?? '0.1.0'
  }
}

export const componentCatalog: CatalogItemMeta[] = [
  componentItem({
    slug: 'icon',
    name: 'Icon',
    title: '图标规范',
    group: 'basic',
    description: '统一图标使用约定，优先复用 Element Plus Icons 和平台业务图标命名规则。',
    scenarios: ['操作按钮', '导航菜单', '状态提示'],
    tags: ['icon', 'base']
  }),
  componentItem({
    slug: 'status-tag',
    name: 'StatusTag',
    title: '状态标签',
    group: 'basic',
    description: '统一状态值的颜色、文案和标签展示方式。',
    scenarios: ['流程状态', '任务状态', '预警状态'],
    tags: ['tag', 'status']
  }),
  componentItem({
    slug: 'dict-tag',
    name: 'DictTag',
    title: '字典标签',
    group: 'basic',
    description: '根据字典类型和值渲染标签文本，适合枚举和基础字典展示。',
    scenarios: ['枚举展示', '字典展示', '状态映射'],
    tags: ['dict', 'tag']
  }),
  componentItem({
    slug: 'permission-button',
    name: 'PermissionButton',
    title: '权限按钮',
    group: 'basic',
    description: '根据权限码控制按钮显示或禁用，避免业务页面重复写权限判断。',
    scenarios: ['按钮权限', '操作控制', '角色差异'],
    tags: ['permission', 'button']
  }),
  componentItem({
    slug: 'platform-layout',
    name: 'PlatformLayout',
    title: '后台布局',
    group: 'layout',
    description: '提供侧边菜单、顶部栏、面包屑、用户菜单和内容容器，统一多系统后台框架。',
    scenarios: ['企业门户', '系统管理后台', '多业务系统统一外壳'],
    tags: ['layout', 'navigation']
  }),
  componentItem({
    slug: 'platform-page',
    name: 'PlatformPage',
    title: '页面容器',
    group: 'layout',
    description: '统一后台页面标题、描述、工具栏和内容区域。',
    scenarios: ['列表页', '详情页', '看板页'],
    tags: ['page', 'layout']
  }),
  componentItem({
    slug: 'breadcrumb-nav',
    name: 'BreadcrumbNav',
    title: '面包屑',
    group: 'layout',
    description: '统一页面路径提示，用于企业后台多层级页面导航。',
    scenarios: ['页面定位', '路径回溯', '模块导航'],
    tags: ['breadcrumb', 'navigation']
  }),
  componentItem({
    slug: 'side-menu',
    name: 'SideMenu',
    title: '侧边菜单',
    group: 'layout',
    description: '标准化侧边导航菜单，支持层级菜单、激活状态和收起模式。',
    scenarios: ['后台导航', '权限菜单', '模块入口'],
    tags: ['menu', 'navigation']
  }),
  componentItem({
    slug: 'user-dropdown',
    name: 'UserDropdown',
    title: '用户菜单',
    group: 'layout',
    description: '统一登录用户信息、个人设置和退出入口。',
    scenarios: ['用户入口', '退出登录', '个人设置'],
    tags: ['user', 'dropdown']
  }),
  componentItem({
    slug: 'platform-form',
    name: 'PlatformForm',
    title: 'Schema 表单',
    group: 'data-entry',
    description: '基于字段 schema 快速生成中等复杂度表单。',
    scenarios: ['新增编辑', '配置表单', '抽屉表单'],
    tags: ['form', 'schema']
  }),
  componentItem({
    slug: 'platform-search-form',
    name: 'PlatformSearchForm',
    title: '查询表单',
    group: 'data-entry',
    description: '标准查询表单，内置搜索、重置和展开收起动作。',
    scenarios: ['列表筛选', '高级查询', '折叠查询条件'],
    tags: ['search', 'form']
  }),
  componentItem({
    slug: 'platform-modal-form',
    name: 'PlatformModalForm',
    title: '弹窗表单',
    group: 'data-entry',
    description: '统一弹窗表单外壳，沉淀提交、取消和 loading 交互。',
    scenarios: ['新增记录', '编辑记录', '轻量审批'],
    tags: ['modal', 'form']
  }),
  componentItem({
    slug: 'drawer-form',
    name: 'DrawerForm',
    title: '抽屉表单',
    group: 'data-entry',
    description: '适合承载详情编辑和较长表单的右侧抽屉容器。',
    scenarios: ['详情编辑', '长表单', '侧滑配置'],
    tags: ['drawer', 'form']
  }),
  componentItem({
    slug: 'dict-select',
    name: 'DictSelect',
    title: '字典选择器',
    group: 'data-entry',
    description: '按字典类型加载选项，统一枚举型数据录入。',
    scenarios: ['状态选择', '类型选择', '基础字典'],
    tags: ['select', 'dict']
  }),
  componentItem({
    slug: 'user-select',
    name: 'UserSelect',
    title: '用户选择器',
    group: 'data-entry',
    description: '统一用户搜索和选择交互，用于负责人、审批人、操作人等字段。',
    scenarios: ['负责人选择', '审批人选择', '人员筛选'],
    tags: ['select', 'user']
  }),
  componentItem({
    slug: 'org-tree-select',
    name: 'OrgTreeSelect',
    title: '组织树选择',
    group: 'data-entry',
    description: '统一组织、部门等层级数据选择体验。',
    scenarios: ['部门选择', '组织筛选', '权限范围'],
    tags: ['tree-select', 'org']
  }),
  componentItem({
    slug: 'warehouse-select',
    name: 'WarehouseSelect',
    title: '仓库选择器',
    group: 'data-entry',
    description: '面向仓库维度的复用选择器，可配合后端数据权限过滤。',
    scenarios: ['仓库筛选', '单据仓库', '数据权限'],
    tags: ['select', 'entity']
  }),
  componentItem({
    slug: 'location-tree-select',
    name: 'LocationTreeSelect',
    title: '库位树选择',
    group: 'data-entry',
    description: '统一仓库、库区、库位的层级选择体验。',
    scenarios: ['库位选择', '层级筛选', '位置校验'],
    tags: ['tree-select', 'entity']
  }),
  componentItem({
    slug: 'material-select',
    name: 'MaterialSelect',
    title: '物料选择器',
    group: 'data-entry',
    description: '面向物料主数据的复用选择器，隐藏选项加载和展示细节。',
    scenarios: ['物料筛选', '业务单据选择物料', '需求绑定'],
    tags: ['select', 'entity']
  }),
  componentItem({
    slug: 'work-order-select',
    name: 'WorkOrderSelect',
    title: '工单选择器',
    group: 'data-entry',
    description: '面向生产或任务类单据的复用选择器。',
    scenarios: ['单据筛选', '流程关联', '状态查询'],
    tags: ['select', 'entity']
  }),
  componentItem({
    slug: 'platform-table',
    name: 'PlatformTable',
    title: '表格',
    group: 'data-display',
    description: '统一列表表格，支持分页、选择列、序号列、排序、操作列和单元格插槽。',
    scenarios: ['数据列表', '后台管理页', '查询结果展示'],
    tags: ['table', 'data']
  }),
  componentItem({
    slug: 'batch-operation-bar',
    name: 'BatchOperationBar',
    title: '批量操作栏',
    group: 'data-display',
    description: '标准化多选后的批量操作区域，展示选择数量和批量动作。',
    scenarios: ['批量删除', '批量导出', '批量审核'],
    tags: ['batch', 'toolbar']
  }),
  componentItem({
    slug: 'dashboard-grid',
    name: 'DashboardGrid',
    title: '看板网格',
    group: 'data-display',
    description: '用于指标卡片、排行和预警组件的自适应网格容器。',
    scenarios: ['运营看板', '统计概览', '指标分组'],
    tags: ['dashboard', 'grid']
  }),
  componentItem({
    slug: 'stat-card',
    name: 'StatCard',
    title: '统计卡片',
    group: 'data-display',
    description: '展示指标数值、单位、趋势和状态色。',
    scenarios: ['运营指标', '业务 KPI', '实时统计'],
    tags: ['dashboard', 'stat']
  }),
  componentItem({
    slug: 'rank-list',
    name: 'RankList',
    title: '实时排行',
    group: 'data-display',
    description: '展示排行榜类数据，适合实时或周期统计。',
    scenarios: ['热门排行', '作业排行', '指标排行'],
    tags: ['rank', 'dashboard']
  }),
  componentItem({
    slug: 'alert-panel',
    name: 'AlertPanel',
    title: '预警面板',
    group: 'data-display',
    description: '聚合展示风险、异常和待处理提醒。',
    scenarios: ['风险提示', '异常提醒', '待办聚合'],
    tags: ['alert', 'dashboard']
  }),
  componentItem({
    slug: 'realtime-badge',
    name: 'RealtimeBadge',
    title: '实时状态',
    group: 'data-display',
    description: '展示实时连接状态或推送通道状态。',
    scenarios: ['WebSocket 状态', '实时排行', '导入进度推送'],
    tags: ['realtime', 'badge']
  }),
  componentItem({
    slug: 'file-upload',
    name: 'FileUpload',
    title: '文件上传',
    group: 'feedback-flow',
    description: '统一附件、Excel 和文档类文件选择入口。',
    scenarios: ['附件上传', 'Excel 上传', '文档上传'],
    tags: ['upload', 'file']
  }),
  componentItem({
    slug: 'excel-import',
    name: 'ExcelImport',
    title: 'Excel 导入',
    group: 'feedback-flow',
    description: '封装 Excel 文件选择、模板提示和导入动作入口。',
    scenarios: ['批量导入', '模板下载', '离线上传'],
    tags: ['excel', 'import']
  }),
  componentItem({
    slug: 'excel-export',
    name: 'ExcelExport',
    title: 'Excel 导出',
    group: 'feedback-flow',
    description: '统一导出按钮、loading 和导出范围提示。',
    scenarios: ['列表导出', '错误导出', '批量下载'],
    tags: ['excel', 'export']
  }),
  componentItem({
    slug: 'upload-progress',
    name: 'UploadProgress',
    title: '上传进度',
    group: 'feedback-flow',
    description: '展示文件上传或异步导入任务的进度状态。',
    scenarios: ['文件上传', '导入进度', '长任务反馈'],
    tags: ['upload', 'progress']
  }),
  componentItem({
    slug: 'import-task-panel',
    name: 'ImportTaskPanel',
    title: '导入任务面板',
    group: 'feedback-flow',
    description: '展示异步导入任务的进度、成功数、失败数和状态。',
    scenarios: ['离线导入', '长任务进度', '异步校验'],
    tags: ['import', 'progress']
  }),
  componentItem({
    slug: 'import-error-table',
    name: 'ImportErrorTable',
    title: '导入错误表',
    group: 'feedback-flow',
    description: '展示 Excel / CSV 校验失败行和失败原因。',
    scenarios: ['导入错误明细', '错误导出', '人工修正数据'],
    tags: ['import', 'error']
  }),
  componentItem({
    slug: 'apply-status-timeline',
    name: 'ApplyStatusTimeline',
    title: '申请状态时间线',
    group: 'feedback-flow',
    description: '以时间线方式展示申请、审批、分配和配送等节点。',
    scenarios: ['流程节点', '状态流转', '审批轨迹'],
    tags: ['timeline', 'flow']
  }),
  componentItem({
    slug: 'delivery-status-steps',
    name: 'DeliveryStatusSteps',
    title: '配送状态步骤',
    group: 'feedback-flow',
    description: '以步骤条方式展示业务对象的配送或处理状态。',
    scenarios: ['流程状态', '配送状态', '节点流转'],
    tags: ['steps', 'flow']
  }),
  componentItem({
    slug: 'login-form',
    name: 'LoginForm',
    title: '登录表单',
    group: 'advanced',
    description: '统一账号登录表单，支持连续失败后的拼图验证码风控状态展示。',
    scenarios: ['统一登录入口', '登录风控', 'Token 获取入口'],
    tags: ['form', 'security']
  }),
  componentItem({
    slug: 'jigsaw-captcha',
    name: 'JigsawCaptcha',
    title: '拼图验证码',
    group: 'advanced',
    description: '轻量随机拼图验证码，用于风险场景下的人机验证。',
    scenarios: ['登录二次验证', '高风险操作确认', '验证码 token 提交'],
    tags: ['captcha', 'security']
  }),
  componentItem({
    slug: 'material-requirement-editor',
    name: 'MaterialRequirementEditor',
    title: '物料需求编辑',
    group: 'advanced',
    description: '用于多行物料需求录入、数量展示和分配状态表达。',
    scenarios: ['需求编辑', '分配状态', '流程协同'],
    tags: ['editor', 'flow']
  }),
  componentItem({
    slug: 'chat-panel',
    name: 'ChatPanel',
    title: 'AI 对话面板',
    group: 'advanced',
    description: '面向问答、分析和助手类场景的对话容器。',
    scenarios: ['知识问答', '数据问答', '分析助手'],
    tags: ['ai', 'chat']
  }),
  componentItem({
    slug: 'prompt-input',
    name: 'PromptInput',
    title: '提示词输入',
    group: 'advanced',
    description: '面向 AI 问答的提示词输入框，统一发送、loading 和提示文案。',
    scenarios: ['AI 输入', 'Prompt 提交', '助手交互'],
    tags: ['ai', 'prompt']
  }),
  componentItem({
    slug: 'markdown-renderer',
    name: 'MarkdownRenderer',
    title: 'Markdown 渲染',
    group: 'advanced',
    description: '轻量渲染 AI 回复中的 Markdown 文本。',
    scenarios: ['AI 回复', '说明文本', '结果解释'],
    tags: ['markdown', 'ai']
  }),
  componentItem({
    slug: 'chatbi-result-table',
    name: 'ChatBIResultTable',
    title: 'ChatBI 结果表',
    group: 'advanced',
    description: '展示自然语言查询后的结构化结果和 SQL 预览。',
    scenarios: ['数据问答结果', '指标查询', 'SQL 解释'],
    tags: ['chatbi', 'table']
  }),
  componentItem({
    slug: 'sql-preview',
    name: 'SqlPreview',
    title: 'SQL 预览',
    group: 'advanced',
    description: '展示 ChatBI 或分析工具生成的只读 SQL。',
    scenarios: ['SQL 解释', '查询审计', 'AI 结果溯源'],
    tags: ['sql', 'ai']
  }),
  componentItem({
    slug: 'agent-step-timeline',
    name: 'AgentStepTimeline',
    title: 'Agent 步骤',
    group: 'advanced',
    description: '展示 Agent 分析、工具调用和汇总过程。',
    scenarios: ['推理过程', '执行步骤', '可观测性'],
    tags: ['agent', 'timeline']
  }),
  componentItem({
    slug: 'tool-call-trace',
    name: 'ToolCallTrace',
    title: 'MCP 工具轨迹',
    group: 'advanced',
    description: '展示工具调用输入、输出、耗时和状态。',
    scenarios: ['工具审计', 'Agent 调试', 'AI 可观测性'],
    tags: ['mcp', 'trace']
  })
]

// 场景模板允许带轻量业务语义，用于说明多个底层组件如何组合成页面级复用结构。
export const scenarioTemplateGroups: CatalogGroupMeta[] = [
  {
    key: 'foundation',
    name: '平台基础模板',
    description: '把布局、页面容器、权限动作和导航组合成可直接落地的后台基础结构。'
  },
  {
    key: 'form-table',
    name: '表单与列表模板',
    description: '沉淀登录风控、查询表格、Schema 表单和业务选择器等常见组合。'
  },
  {
    key: 'flow',
    name: '流程与长任务模板',
    description: '面向导入任务、流程状态、物料需求和状态流转的组合模板。'
  },
  {
    key: 'analysis',
    name: '看板与智能模板',
    description: '面向运营看板、实时排行、预警、AI 对话和 ChatBI 的组合模板。'
  }
]

const scenarioGroupNameMap = createGroupNameMap(scenarioTemplateGroups)

function scenarioItem(
  item: Omit<CatalogItemMeta, 'groupName' | 'status' | 'docsPath' | 'since'> & {
    status?: CatalogStatus
    docsPath?: string
    since?: string
  }
): CatalogItemMeta {
  // 场景模板默认落到 /scenario/<slug>，避免多组件组合内容混入单组件 API 文档。
  return {
    ...item,
    groupName: scenarioGroupNameMap[item.group],
    status: item.status ?? 'documented',
    docsPath: item.docsPath ?? `/scenario/${item.slug}`,
    since: item.since ?? '0.1.0'
  }
}

export const scenarioTemplateCatalog: CatalogItemMeta[] = [
  scenarioItem({
    slug: 'standard-layout',
    name: '标准后台布局',
    title: 'PlatformLayout + 导航',
    group: 'foundation',
    description: '侧边菜单、顶部栏、面包屑、用户菜单和内容区组合，作为各业务前端的登录后外壳。',
    scenarios: ['门户基座', '系统后台', '业务子应用'],
    components: ['PlatformLayout', 'SideMenu', 'BreadcrumbNav', 'UserDropdown'],
    tags: ['layout', 'template']
  }),
  scenarioItem({
    slug: 'standard-page',
    name: '标准页面容器',
    title: 'PlatformPage + 工具栏',
    group: 'foundation',
    description: '页面标题、描述、工具栏、内容区和权限按钮组合，适合作为列表页与详情页基础模板。',
    scenarios: ['列表页', '详情页', '管理页'],
    components: ['PlatformPage', 'PermissionButton'],
    tags: ['page', 'template']
  }),
  scenarioItem({
    slug: 'login-risk-control',
    name: '登录风控模板',
    title: 'LoginForm + JigsawCaptcha',
    group: 'form-table',
    description: '账号密码登录、连续失败提示和拼图验证码组合，用于统一登录入口。',
    scenarios: ['统一登录', '登录风控', '验证码校验'],
    components: ['LoginForm', 'JigsawCaptcha'],
    tags: ['login', 'security']
  }),
  scenarioItem({
    slug: 'query-table',
    name: '标准查询表格模板',
    title: 'SearchForm + PlatformTable',
    group: 'form-table',
    description: '查询条件、批量操作、分页表格、状态标签和行操作组合，适合管理后台列表页。',
    scenarios: ['查询列表', '批量操作', '分页展示'],
    components: ['PlatformSearchForm', 'PlatformTable', 'BatchOperationBar', 'StatusTag'],
    tags: ['table', 'search']
  }),
  scenarioItem({
    slug: 'schema-form',
    name: 'Schema 表单模板',
    title: 'PlatformForm + footer',
    group: 'form-table',
    description: '字段 schema、表单模型、底部按钮和基础校验组合，适合新增编辑页面。',
    scenarios: ['新增编辑', '配置表单', '表单复用'],
    components: ['PlatformForm', 'PlatformModalForm', 'DrawerForm'],
    tags: ['form', 'schema']
  }),
  scenarioItem({
    slug: 'business-selects',
    name: '业务选择器模板',
    title: 'Entity Selects',
    group: 'form-table',
    description: '仓库、库位、物料、工单等实体选择器组合，作为复杂表单的选项输入模板。',
    scenarios: ['实体筛选', '表单选择', '数据权限'],
    components: ['WarehouseSelect', 'LocationTreeSelect', 'MaterialSelect', 'WorkOrderSelect'],
    tags: ['select', 'entity']
  }),
  scenarioItem({
    slug: 'offline-import',
    name: '离线导入模板',
    title: 'ImportTaskPanel + ImportErrorTable',
    group: 'flow',
    description: '文件上传、异步导入进度、错误明细和刷新动作组合，适合长任务反馈。',
    scenarios: ['离线导入', '文件校验', '错误修正'],
    components: ['FileUpload', 'ExcelImport', 'ImportTaskPanel', 'ImportErrorTable', 'UploadProgress'],
    tags: ['import', 'task']
  }),
  scenarioItem({
    slug: 'material-flow',
    name: '物料需求流程模板',
    title: 'Requirement + Timeline + Steps',
    group: 'flow',
    description: '需求明细、申请时间线和配送步骤组合，用于表达跨系统流程状态。',
    scenarios: ['需求编辑', '流程协同', '状态跟踪'],
    components: ['MaterialRequirementEditor', 'ApplyStatusTimeline', 'DeliveryStatusSteps'],
    tags: ['flow', 'editor']
  }),
  scenarioItem({
    slug: 'ops-dashboard',
    name: '运营看板模板',
    title: 'StatCard + RankList + AlertPanel',
    group: 'analysis',
    description: '统计卡片、实时排行、预警列表和连接状态组合，用于运营监控页面。',
    scenarios: ['运营统计', '实时排行', '安全预警'],
    components: ['DashboardGrid', 'StatCard', 'RankList', 'AlertPanel', 'RealtimeBadge'],
    tags: ['dashboard', 'ops']
  }),
  scenarioItem({
    slug: 'ai-workbench',
    name: 'AI 工作台模板',
    title: 'Chat + ChatBI + Agent',
    group: 'analysis',
    description: 'AI 对话、ChatBI 结果、SQL 预览、Agent 步骤和 MCP 工具轨迹组合。',
    scenarios: ['知识问答', 'ChatBI', 'Agent 调试'],
    components: ['ChatPanel', 'PromptInput', 'MarkdownRenderer', 'ChatBIResultTable', 'SqlPreview', 'AgentStepTimeline', 'ToolCallTrace'],
    tags: ['ai', 'chatbi']
  })
]

export const componentCategories = componentGroups.map((item) => item.name)
export const scenarioTemplateCategories = scenarioTemplateGroups.map((item) => item.name)

export function getCatalogItemsByGroup(items: CatalogItemMeta[], groupKey: string): CatalogItemMeta[] {
  return items.filter((item) => item.group === groupKey)
}

export function getComponentsByGroup(groupKey: string): CatalogItemMeta[] {
  return getCatalogItemsByGroup(componentCatalog, groupKey)
}

export function getScenarioTemplatesByGroup(groupKey: string): CatalogItemMeta[] {
  return getCatalogItemsByGroup(scenarioTemplateCatalog, groupKey)
}
