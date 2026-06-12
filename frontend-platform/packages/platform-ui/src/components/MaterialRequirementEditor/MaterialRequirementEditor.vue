<template>
  <div class="sw-material-editor">
    <div class="sw-material-editor__toolbar">
      <strong>工单所需物料</strong>
      <el-button v-if="!disabled" size="small" type="primary" :icon="Plus" @click="addRow">新增物料</el-button>
    </div>
    <el-table class="sw-material-editor__table" :data="rows" border>
      <el-table-column label="物料" min-width="170">
        <template #default="{ row, $index }">
          <MaterialSelect
            :model-value="row.materialId"
            :disabled="disabled"
            @update:model-value="updateMaterial($index, $event)"
          />
        </template>
      </el-table-column>
      <el-table-column label="需求数量" width="118">
        <template #default="{ row }">
          <el-input-number v-model="row.requiredQty" :disabled="disabled" :min="0" controls-position="right" @change="emitChange" />
        </template>
      </el-table-column>
      <el-table-column label="单位" width="76">
        <template #default="{ row }">
          <el-input v-model="row.unit" :disabled="disabled" @change="emitChange" />
        </template>
      </el-table-column>
      <el-table-column label="已分配" width="80" align="right">
        <template #default="{ row }">{{ row.allocatedQty ?? 0 }}</template>
      </el-table-column>
      <el-table-column label="状态" width="88" align="center">
        <template #default="{ row }">
          <StatusTag :status="row.status || 'PENDING'" />
        </template>
      </el-table-column>
      <el-table-column v-if="!disabled" label="操作" width="68" align="center">
        <template #default="{ $index }">
          <el-button text type="danger" @click="removeRow($index)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import type { MaterialRequirement } from '@smartwarehouse/platform-types'
import MaterialSelect from '../MaterialSelect/MaterialSelect.vue'
import StatusTag from '../StatusTag/StatusTag.vue'

const props = withDefaults(
  defineProps<{
    modelValue?: MaterialRequirement[]
    disabled?: boolean
  }>(),
  {
    modelValue: () => [],
    disabled: false
  }
)

const emit = defineEmits<{
  'update:modelValue': [rows: MaterialRequirement[]]
}>()

const rows = ref<MaterialRequirement[]>([])

watch(
  () => props.modelValue,
  (value) => {
    // 内部维护副本，避免用户编辑表格时直接改父组件传入的数组引用。
    rows.value = value.map((item) => ({ ...item }))
  },
  { immediate: true, deep: true }
)

function addRow(): void {
  // 新增物料默认处于待分配状态，贴合 MES 提交物料申请后的最小业务流程。
  rows.value.push({
    materialId: '',
    materialName: '',
    requiredQty: 1,
    allocatedQty: 0,
    unit: '个',
    status: 'PENDING'
  })
  emitChange()
}

function removeRow(index: number): void {
  // 删除后立即向外同步，父组件可据此更新工单物料申请草稿。
  rows.value.splice(index, 1)
  emitChange()
}

function updateMaterial(index: number, materialId?: string): void {
  const row = rows.value[index]
  if (!row) {
    return
  }

  // 当前组件只记录选择结果；真实物料名称、规格和库存信息应由业务页面或后端接口补齐。
  row.materialId = materialId ?? ''
  row.materialName = materialId ?? ''
  emitChange()
}

function emitChange(): void {
  // 对外继续发副本，避免父子组件共享同一行对象导致状态难以追踪。
  emit(
    'update:modelValue',
    rows.value.map((item) => ({ ...item }))
  )
}
</script>
