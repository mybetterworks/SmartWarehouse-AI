import type { DictOption } from '@smartwarehouse/platform-types'

// V01 阶段没有真实 sys 字典接口，先用内存字典模拟后端返回；V02 后可替换为 request('/sys/dict')。
const dictStore = new Map<string, DictOption[]>([
  [
    'material_type',
    [
      { label: '原材料', value: 'RAW', color: 'blue' },
      { label: '半成品', value: 'WIP', color: 'orange' },
      { label: '成品', value: 'FINISHED', color: 'green' }
    ]
  ],
  [
    'biz_status',
    [
      { label: '待处理', value: 'PENDING', color: 'orange' },
      { label: '处理中', value: 'PROCESSING', color: 'blue' },
      { label: '已完成', value: 'DONE', color: 'green' },
      { label: '异常', value: 'FAILED', color: 'red' }
    ]
  ],
  [
    'inbound_type',
    [
      { label: '采购入库', value: 'PURCHASE' },
      { label: '生产退料', value: 'RETURN' },
      { label: '盘盈入库', value: 'STOCK_GAIN' }
    ]
  ]
])

// 允许业务示例或测试在运行时注册字典，验证组件对不同字典类型的适配能力。
export function registerDict(dictType: string, options: DictOption[]): void {
  dictStore.set(dictType, options)
}

// 保持异步返回形态，后续接真实接口时不需要修改 DictSelect 等调用方。
export async function getDictOptions(dictType: string): Promise<DictOption[]> {
  return dictStore.get(dictType) ?? []
}

// 表格和详情页经常只拿到字典 value，这里统一兜底为原始值，避免未知字典显示为空。
export function getDictLabel(dictType: string, value: string | number): string {
  const option = dictStore.get(dictType)?.find((item) => item.value === value)
  return option?.label ?? String(value)
}
