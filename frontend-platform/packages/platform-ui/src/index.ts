import '@smartwarehouse/platform-theme/style.css'
import './style.css'

import type { App, Component, Plugin } from 'vue'
import AgentStepTimelineComponent from './components/AgentStepTimeline/AgentStepTimeline.vue'
import AlertPanelComponent from './components/AlertPanel/AlertPanel.vue'
import ApplyStatusTimelineComponent from './components/ApplyStatusTimeline/ApplyStatusTimeline.vue'
import BatchOperationBarComponent from './components/BatchOperationBar/BatchOperationBar.vue'
import BreadcrumbNavComponent from './components/BreadcrumbNav/BreadcrumbNav.vue'
import ChatBIResultTableComponent from './components/ChatBIResultTable/ChatBIResultTable.vue'
import ChatPanelComponent from './components/ChatPanel/ChatPanel.vue'
import DashboardGridComponent from './components/DashboardGrid/DashboardGrid.vue'
import DeliveryStatusStepsComponent from './components/DeliveryStatusSteps/DeliveryStatusSteps.vue'
import DictSelectComponent from './components/DictSelect/DictSelect.vue'
import DictTagComponent from './components/DictTag/DictTag.vue'
import DrawerFormComponent from './components/DrawerForm/DrawerForm.vue'
import ExcelExportComponent from './components/ExcelExport/ExcelExport.vue'
import ExcelImportComponent from './components/ExcelImport/ExcelImport.vue'
import FileUploadComponent from './components/FileUpload/FileUpload.vue'
import ImportErrorTableComponent from './components/ImportErrorTable/ImportErrorTable.vue'
import ImportTaskPanelComponent from './components/ImportTaskPanel/ImportTaskPanel.vue'
import JigsawCaptchaComponent from './components/JigsawCaptcha/JigsawCaptcha.vue'
import LocationTreeSelectComponent from './components/LocationTreeSelect/LocationTreeSelect.vue'
import LoginFormComponent from './components/LoginForm/LoginForm.vue'
import MarkdownRendererComponent from './components/MarkdownRenderer/MarkdownRenderer.vue'
import MaterialRequirementEditorComponent from './components/MaterialRequirementEditor/MaterialRequirementEditor.vue'
import MaterialSelectComponent from './components/MaterialSelect/MaterialSelect.vue'
import OrgTreeSelectComponent from './components/OrgTreeSelect/OrgTreeSelect.vue'
import PermissionButtonComponent from './components/PermissionButton/PermissionButton.vue'
import PlatformFormComponent from './components/PlatformForm/PlatformForm.vue'
import PlatformLayoutComponent from './components/PlatformLayout/PlatformLayout.vue'
import PlatformModalFormComponent from './components/PlatformModalForm/PlatformModalForm.vue'
import PlatformPageComponent from './components/PlatformPage/PlatformPage.vue'
import PlatformSearchFormComponent from './components/PlatformSearchForm/PlatformSearchForm.vue'
import PlatformTableComponent from './components/PlatformTable/PlatformTable.vue'
import PromptInputComponent from './components/PromptInput/PromptInput.vue'
import RankListComponent from './components/RankList/RankList.vue'
import RealtimeBadgeComponent from './components/RealtimeBadge/RealtimeBadge.vue'
import SideMenuComponent from './components/SideMenu/SideMenu.vue'
import SqlPreviewComponent from './components/SqlPreview/SqlPreview.vue'
import StatCardComponent from './components/StatCard/StatCard.vue'
import StatusTagComponent from './components/StatusTag/StatusTag.vue'
import ToolCallTraceComponent from './components/ToolCallTrace/ToolCallTrace.vue'
import UploadProgressComponent from './components/UploadProgress/UploadProgress.vue'
import UserDropdownComponent from './components/UserDropdown/UserDropdown.vue'
import UserSelectComponent from './components/UserSelect/UserSelect.vue'
import WarehouseSelectComponent from './components/WarehouseSelect/WarehouseSelect.vue'
import WorkOrderSelectComponent from './components/WorkOrderSelect/WorkOrderSelect.vue'

// 统一组件表用于 app.use(SmartWarehousePlatformUi) 全量注册，乙方项目也可以按需单独导入组件。
const components: Record<string, Component> = {
  AgentStepTimeline: AgentStepTimelineComponent,
  AlertPanel: AlertPanelComponent,
  ApplyStatusTimeline: ApplyStatusTimelineComponent,
  BatchOperationBar: BatchOperationBarComponent,
  BreadcrumbNav: BreadcrumbNavComponent,
  ChatBIResultTable: ChatBIResultTableComponent,
  ChatPanel: ChatPanelComponent,
  DashboardGrid: DashboardGridComponent,
  DeliveryStatusSteps: DeliveryStatusStepsComponent,
  DictSelect: DictSelectComponent,
  DictTag: DictTagComponent,
  DrawerForm: DrawerFormComponent,
  ExcelExport: ExcelExportComponent,
  ExcelImport: ExcelImportComponent,
  FileUpload: FileUploadComponent,
  ImportErrorTable: ImportErrorTableComponent,
  ImportTaskPanel: ImportTaskPanelComponent,
  JigsawCaptcha: JigsawCaptchaComponent,
  LocationTreeSelect: LocationTreeSelectComponent,
  LoginForm: LoginFormComponent,
  MarkdownRenderer: MarkdownRendererComponent,
  MaterialRequirementEditor: MaterialRequirementEditorComponent,
  MaterialSelect: MaterialSelectComponent,
  OrgTreeSelect: OrgTreeSelectComponent,
  PermissionButton: PermissionButtonComponent,
  PlatformForm: PlatformFormComponent,
  PlatformLayout: PlatformLayoutComponent,
  PlatformModalForm: PlatformModalFormComponent,
  PlatformPage: PlatformPageComponent,
  PlatformSearchForm: PlatformSearchFormComponent,
  PlatformTable: PlatformTableComponent,
  PromptInput: PromptInputComponent,
  RankList: RankListComponent,
  RealtimeBadge: RealtimeBadgeComponent,
  SideMenu: SideMenuComponent,
  SqlPreview: SqlPreviewComponent,
  StatCard: StatCardComponent,
  StatusTag: StatusTagComponent,
  ToolCallTrace: ToolCallTraceComponent,
  UploadProgress: UploadProgressComponent,
  UserDropdown: UserDropdownComponent,
  UserSelect: UserSelectComponent,
  WarehouseSelect: WarehouseSelectComponent,
  WorkOrderSelect: WorkOrderSelectComponent
}

export const SmartWarehousePlatformUi: Plugin = {
  install(app: App) {
    // 全量注册时保持组件名与导出名一致，便于文档示例、模板使用和 IDE 自动补全。
    Object.entries(components).forEach(([name, component]) => {
      app.component(name, component)
    })
  }
}

// 下面保留按需导出，乙方前端推荐按需引入，减少业务子应用构建体积。
export { AgentStepTimelineComponent as AgentStepTimeline }
export { AlertPanelComponent as AlertPanel }
export { ApplyStatusTimelineComponent as ApplyStatusTimeline }
export { BatchOperationBarComponent as BatchOperationBar }
export { BreadcrumbNavComponent as BreadcrumbNav }
export { ChatBIResultTableComponent as ChatBIResultTable }
export { ChatPanelComponent as ChatPanel }
export { DashboardGridComponent as DashboardGrid }
export { DeliveryStatusStepsComponent as DeliveryStatusSteps }
export { DictSelectComponent as DictSelect }
export { DictTagComponent as DictTag }
export { DrawerFormComponent as DrawerForm }
export { ExcelExportComponent as ExcelExport }
export { ExcelImportComponent as ExcelImport }
export { FileUploadComponent as FileUpload }
export { ImportErrorTableComponent as ImportErrorTable }
export { ImportTaskPanelComponent as ImportTaskPanel }
export { JigsawCaptchaComponent as JigsawCaptcha }
export { LocationTreeSelectComponent as LocationTreeSelect }
export { LoginFormComponent as LoginForm }
export { MarkdownRendererComponent as MarkdownRenderer }
export { MaterialRequirementEditorComponent as MaterialRequirementEditor }
export { MaterialSelectComponent as MaterialSelect }
export { OrgTreeSelectComponent as OrgTreeSelect }
export { PermissionButtonComponent as PermissionButton }
export { PlatformFormComponent as PlatformForm }
export { PlatformLayoutComponent as PlatformLayout }
export { PlatformModalFormComponent as PlatformModalForm }
export { PlatformPageComponent as PlatformPage }
export { PlatformSearchFormComponent as PlatformSearchForm }
export { PlatformTableComponent as PlatformTable }
export { PromptInputComponent as PromptInput }
export { RankListComponent as RankList }
export { RealtimeBadgeComponent as RealtimeBadge }
export { SideMenuComponent as SideMenu }
export { SqlPreviewComponent as SqlPreview }
export { StatCardComponent as StatCard }
export { StatusTagComponent as StatusTag }
export { ToolCallTraceComponent as ToolCallTrace }
export { UploadProgressComponent as UploadProgress }
export { UserDropdownComponent as UserDropdown }
export { UserSelectComponent as UserSelect }
export { WarehouseSelectComponent as WarehouseSelect }
export { WorkOrderSelectComponent as WorkOrderSelect }
export { useWebSocketClient } from './hooks/useWebSocketClient'
export type {
  PlatformAgentStep,
  PlatformAlertItem,
  PlatformChatMessage,
  PlatformFormFieldSchema,
  PlatformImportTask,
  PlatformMaterialRequirement,
  PlatformRankItem,
  PlatformTableColumn,
  PlatformTablePagination,
  PortalNotice,
  PortalProfile,
  PortalWorkbench,
  PlatformStatCardItem,
  PlatformToolCallRecord
} from './types'

export default SmartWarehousePlatformUi
