import type { SelectOption, TreeOption } from '@smartwarehouse/platform-types'

// 这些选项数据用于 V01 组件库演示，模拟后续 sys/wms/mes 服务返回的用户、仓库、物料和工单。
const userOptions: SelectOption[] = [
  { label: '平台管理员', value: 'u_admin', description: '甲方平台团队' },
  { label: '仓库主管', value: 'u_wms_manager', description: '负责一号仓' },
  { label: '生产计划员', value: 'u_mes_planner', description: '负责装配一线' },
  { label: 'AI 运维工程师', value: 'u_ai_ops', description: '维护知识库与 Agent' }
]

const orgTree: TreeOption[] = [
  {
    label: '智能制造事业部',
    value: 'org_mfg',
    children: [
      { label: '仓储物流组', value: 'org_wms' },
      { label: '生产执行组', value: 'org_mes' },
      { label: '运营统计组', value: 'org_task' }
    ]
  }
]

const warehouseOptions: SelectOption[] = [
  { label: '一号原料仓', value: 'wh_raw_01', description: '原材料与采购入库' },
  { label: '二号半成品仓', value: 'wh_wip_02', description: '线边与半成品暂存' },
  { label: '三号成品仓', value: 'wh_fg_03', description: '成品发货与调拨' }
]

const locationTree: TreeOption[] = [
  {
    label: '一号原料仓',
    value: 'wh_raw_01',
    children: [
      {
        label: 'A 区',
        value: 'area_raw_a',
        children: [
          { label: 'A-01-01', value: 'loc_raw_a_0101' },
          { label: 'A-01-02', value: 'loc_raw_a_0102' }
        ]
      },
      {
        label: 'B 区',
        value: 'area_raw_b',
        children: [{ label: 'B-02-01', value: 'loc_raw_b_0201' }]
      }
    ]
  },
  {
    label: '二号半成品仓',
    value: 'wh_wip_02',
    children: [{ label: '线边暂存区', value: 'area_wip_line', children: [{ label: 'L-01', value: 'loc_wip_l_01' }] }]
  }
]

const materialOptions: SelectOption[] = [
  { label: 'MAT-001 控制器外壳', value: 'mat_001', description: '原材料 / 个' },
  { label: 'MAT-002 装配线束', value: 'mat_002', description: '半成品 / 条' },
  { label: 'MAT-003 成品模组', value: 'mat_003', description: '成品 / 套' },
  { label: 'MAT-004 传感器组件', value: 'mat_004', description: '原材料 / 个' }
]

const workOrderOptions: SelectOption[] = [
  { label: 'WO-20260611-001 控制器装配', value: 'wo_20260611_001', description: '装配一线' },
  { label: 'WO-20260611-002 成品模组测试', value: 'wo_20260611_002', description: '测试二线' },
  { label: 'WO-20260611-003 线束预装', value: 'wo_20260611_003', description: '预装工位' }
]

// 下面方法保持 Promise 形态，便于将来无缝替换成真实 HTTP 请求或缓存查询。
export async function getUserOptions(): Promise<SelectOption[]> {
  return userOptions
}

export async function getOrgTree(): Promise<TreeOption[]> {
  return orgTree
}

export async function getWarehouseOptions(): Promise<SelectOption[]> {
  return warehouseOptions
}

export async function getLocationTree(): Promise<TreeOption[]> {
  return locationTree
}

export async function getMaterialOptions(): Promise<SelectOption[]> {
  return materialOptions
}

export async function getWorkOrderOptions(): Promise<SelectOption[]> {
  return workOrderOptions
}
