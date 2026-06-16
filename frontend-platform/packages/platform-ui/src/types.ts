import type {
  AgentStep,
  AlertItem,
  ChatMessage,
  FormFieldSchema,
  ImportTask,
  MaterialRequirement,
  PortalNotice as SharedPortalNotice,
  PortalProfile as SharedPortalProfile,
  PortalWorkbench as SharedPortalWorkbench,
  RankItem,
  StatCardItem,
  TableColumn,
  TablePagination,
  ToolCallRecord
} from '@smartwarehouse/platform-types'

// platform-ui 对外暴露 Platform 前缀类型，乙方只依赖组件包时也能拿到常用类型别名。
export type PlatformTableColumn = TableColumn
export type PlatformTablePagination = TablePagination
export type PlatformFormFieldSchema = FormFieldSchema
export type PlatformStatCardItem = StatCardItem
export type PlatformRankItem = RankItem
export type PlatformAlertItem = AlertItem
export type PlatformImportTask = ImportTask
export type PlatformMaterialRequirement = MaterialRequirement
export type PortalNotice = SharedPortalNotice
export type PortalProfile = SharedPortalProfile
export type PortalWorkbench = SharedPortalWorkbench
export type PlatformChatMessage = ChatMessage
export type PlatformAgentStep = AgentStep
export type PlatformToolCallRecord = ToolCallRecord
