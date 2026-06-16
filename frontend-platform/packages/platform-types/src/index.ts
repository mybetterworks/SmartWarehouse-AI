// 模块编码用于统一标识甲方和乙方前后端模块，菜单、权限、路由和统计都围绕它关联。
export type ModuleCode = 'sys' | 'wms' | 'mes' | 'task' | 'ai'

// OWNER 表示甲方平台能力，VENDOR 表示乙方业务项目，用于模块注册和协作边界说明。
export type OwnerType = 'OWNER' | 'VENDOR'

export type OptionValue = string | number

export type StatusTone = 'success' | 'warning' | 'danger' | 'info' | 'primary'

export type SortOrder = 'ascending' | 'descending' | null

export interface ApiResult<T> {
  code: string
  message: string
  data: T
  traceId?: string
}

export interface PageQuery {
  pageNo: number
  pageSize: number
}

export interface PageResult<T> {
  records: T[]
  total: number
  pageNo: number
  pageSize: number
}

// 登录用户只保留前端权限判断需要的信息，仓库数据权限仍由后端做最终约束。
export interface LoginUser {
  userId: string
  username: string
  nickname: string
  roles: string[]
  permissions: string[]
  warehouseIds?: string[]
}

export interface LoginFormModel {
  username: string
  password: string
  rememberMe?: boolean
  captchaToken?: string
}

// 登录风控状态由 sys-service 计算，前端根据该状态展示拼图验证码或锁定提示。
export interface LoginRiskState {
  failureCount: number
  captchaRequired: boolean
  lockedUntil?: string
  message?: string
}

// 菜单项来自 sys-service，既支撑路由渲染，也支撑不同角色看到不同菜单。
export interface MenuItem {
  id: string | number
  parentId?: string | number
  moduleCode: ModuleCode
  name?: string
  menuName?: string
  path: string
  icon?: string
  component?: string
  permission?: string
  visible: boolean
  children?: MenuItem[]
}

export interface NavMenuItem {
  id: string | number
  title: string
  path: string
  icon?: string
  moduleCode?: ModuleCode
  permission?: string
  visible?: boolean
  children?: NavMenuItem[]
}

export interface BreadcrumbItem {
  title: string
  path?: string
}

// 前端模块注册信息用于 portal-shell 聚合多个独立子应用入口。
export interface FrontendModule {
  moduleCode: ModuleCode
  moduleName: string
  routePrefix: string
  entryUrl: string
  apiPrefix: string
  ownerType: OwnerType
  ownerName?: string
  status?: string
  sortNo?: number
  // 微前端运行时加载字段由 sys-service 模块注册中心维护，乙方发版时只更新 remoteEntry 即可切换版本。
  remoteName?: string
  remoteEntry?: string
  exposedModule?: string
}

export interface PortalNotice {
  id: string | number
  title: string
  content: string
  level: 'info' | 'warning' | 'danger' | 'success' | string
  publishedTime?: string
}

export interface PortalProfile {
  userId: string
  username: string
  nickname: string
  roles: string[]
  permissions: string[]
  warehouseIds?: string[]
  lastLoginTime?: string
  lastLoginIp?: string
}

export interface PortalWorkbench {
  profile: PortalProfile
  notices: PortalNotice[]
  commonModules: FrontendModule[]
  recentModules: FrontendModule[]
  loginRecords: Array<Record<string, unknown>>
}

export interface DictOption {
  label: string
  value: OptionValue
  color?: string
  disabled?: boolean
}

export interface TreeOption {
  label: string
  value: string
  disabled?: boolean
  children?: TreeOption[]
}

export interface SelectOption {
  label: string
  value: string
  disabled?: boolean
  description?: string
  meta?: Record<string, unknown>
}

// 运行时配置不写死在构建产物中，测试和正式环境可通过外部配置注入。
export interface RuntimeConfig {
  apiBaseUrl: string
  tokenHeader: string
  traceHeader: string
  uploadUrl: string
}

// 通用表格列只描述展示能力，复杂业务渲染通过插槽实现，避免耦合具体业务字段。
export interface TableColumn {
  prop?: string
  label: string
  width?: string | number
  minWidth?: string | number
  fixed?: true | 'left' | 'right'
  align?: 'left' | 'center' | 'right'
  sortable?: boolean | 'custom'
  showOverflowTooltip?: boolean
  formatter?: (row: Record<string, unknown>) => string
}

export interface TablePagination {
  pageNo: number
  pageSize: number
  total: number
}

export type FormFieldType = 'input' | 'textarea' | 'select' | 'tree-select' | 'date' | 'datetime' | 'number' | 'switch'

// Schema 表单字段用于快速生成中等复杂度表单，复杂控件仍建议在业务页面自定义。
export interface FormFieldSchema {
  prop: string
  label: string
  type?: FormFieldType
  placeholder?: string
  options?: SelectOption[] | DictOption[] | TreeOption[]
  required?: boolean
  span?: number
  disabled?: boolean
}

export interface StatCardItem {
  key: string
  title: string
  value: string | number
  unit?: string
  trend?: string
  tone?: StatusTone
  icon?: string
}

export interface RankItem {
  key: string
  name: string
  value: number
  unit?: string
  percent?: number
  trend?: 'up' | 'down' | 'flat'
}

export interface AlertItem {
  id: string
  title: string
  message?: string
  level: 'info' | 'warning' | 'danger'
  time?: string
  moduleCode?: ModuleCode
}

export interface TimelineItem {
  title: string
  description?: string
  status?: StatusTone
  time?: string
}

// 离线导入任务用于展示 Excel/CSV 异步处理进度，可由任务接口或 WebSocket 推送刷新。
export interface ImportTask {
  taskId: string
  fileName: string
  status: 'PENDING' | 'PROCESSING' | 'DONE' | 'FAILED'
  progress: number
  totalCount: number
  successCount: number
  failureCount: number
  message?: string
}

export interface ImportErrorRow {
  rowNo: number
  field: string
  value?: string | number
  reason: string
}

// 工单物料需求是 MES 与 WMS 协同的关键模型，既表达需求数量，也表达库存分配结果。
export interface MaterialRequirement {
  materialId: string
  materialCode?: string
  materialName: string
  requiredQty: number
  allocatedQty?: number
  unit: string
  status?: string
}

// AI 对话消息统一 role，便于 RAG、ChatBI、Agent 和 MCP 工具消息复用同一面板。
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system' | 'tool'
  content: string
  time?: string
  loading?: boolean
}

export interface ChatBIColumn {
  prop: string
  label: string
  width?: string | number
  align?: 'left' | 'center' | 'right'
}

// AgentStep 用于解释多 Agent 执行过程，让用户看到规划、工具调用和汇总的链路。
export interface AgentStep {
  id: string
  title: string
  status: 'waiting' | 'running' | 'success' | 'failed'
  description?: string
  startedAt?: string
  finishedAt?: string
  detail?: string
}

// ToolCallRecord 记录 MCP 工具调用轨迹，便于排查工具入参、输出、耗时和失败原因。
export interface ToolCallRecord {
  id: string
  toolName: string
  serverName?: string
  status: 'running' | 'success' | 'failed'
  input?: string
  output?: string
  durationMs?: number
  time?: string
}

export interface WebSocketMessage<T = unknown> {
  type: string
  payload: T
  traceId?: string
  time?: string
}
