<template>
  <el-form class="sw-platform-form" :model="model" :label-width="labelWidth">
    <el-row :gutter="16">
      <el-col v-for="field in fields" :key="field.prop" :span="field.span ?? defaultSpan">
        <el-form-item :label="field.label" :prop="field.prop" :required="field.required">
          <el-input
            v-if="!field.type || field.type === 'input'"
            v-model="model[field.prop]"
            :placeholder="field.placeholder"
            :disabled="field.disabled"
          />
          <el-input
            v-else-if="field.type === 'textarea'"
            v-model="model[field.prop]"
            type="textarea"
            :rows="3"
            :placeholder="field.placeholder"
            :disabled="field.disabled"
          />
          <el-input-number
            v-else-if="field.type === 'number'"
            v-model="model[field.prop]"
            :placeholder="field.placeholder"
            :disabled="field.disabled"
            controls-position="right"
          />
          <el-switch v-else-if="field.type === 'switch'" v-model="model[field.prop]" :disabled="field.disabled" />
          <el-select
            v-else-if="field.type === 'select'"
            v-model="model[field.prop]"
            :placeholder="field.placeholder"
            :disabled="field.disabled"
            clearable
            filterable
          >
            <el-option
              v-for="option in getFlatOptions(field)"
              :key="String(option.value)"
              :label="option.label"
              :value="option.value"
              :disabled="option.disabled"
            />
          </el-select>
          <el-tree-select
            v-else-if="field.type === 'tree-select'"
            v-model="model[field.prop]"
            :data="field.options"
            :placeholder="field.placeholder"
            :disabled="field.disabled"
            clearable
            filterable
            check-strictly
          />
          <el-date-picker
            v-else
            v-model="model[field.prop]"
            :type="field.type === 'datetime' ? 'datetime' : 'date'"
            :placeholder="field.placeholder"
            :disabled="field.disabled"
          />
        </el-form-item>
      </el-col>
    </el-row>
    <div v-if="$slots.footer" class="sw-platform-form__footer">
      <slot name="footer" />
    </div>
  </el-form>
</template>

<script setup lang="ts">
import type { DictOption, FormFieldSchema, SelectOption } from '@smartwarehouse/platform-types'

withDefaults(
  defineProps<{
    model: Record<string, unknown>
    fields: FormFieldSchema[]
    labelWidth?: string
    defaultSpan?: number
  }>(),
  {
    labelWidth: '96px',
    defaultSpan: 12
  }
)

// Schema 表单中的 select 只需要扁平选项；树形数据由 tree-select 分支直接使用 field.options。
function getFlatOptions(field: FormFieldSchema): Array<SelectOption | DictOption> {
  return (field.options ?? []) as Array<SelectOption | DictOption>
}
</script>
