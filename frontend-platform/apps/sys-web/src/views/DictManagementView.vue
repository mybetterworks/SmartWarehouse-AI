<template>
  <section class="sys-route-panel">
    <section class="sys-dict-layout">
      <aside class="sys-panel sys-dict-sidebar">
        <header class="sys-panel__header sys-dict-sidebar__header">
          <div>
            <h2>字典类型</h2>
            <p class="sys-dict-sidebar__hint">点击左侧类型，右侧立即查看该类型下的字典项。</p>
          </div>
          <el-button type="primary" @click="emit('createType')">新增类型</el-button>
        </header>

        <section class="sys-dict-filter">
          <el-input v-model="filters.keyword" clearable placeholder="按字典名称或编码筛选" />
          <div class="sys-dict-filter__row">
            <el-select v-model="filters.status" clearable placeholder="全部状态">
              <el-option label="全部状态" value="" />
              <el-option label="启用" value="ENABLED" />
              <el-option label="禁用" value="DISABLED" />
            </el-select>
            <el-button text @click="resetTypeFilters">重置</el-button>
          </div>
          <p class="sys-dict-filter__summary">已显示 {{ filteredDictTypes.length }} / {{ dictTypes.length }} 个类型</p>
        </section>

        <el-scrollbar class="sys-dict-sidebar__scroll">
          <ul v-if="filteredDictTypes.length" class="sys-dict-type-list">
            <li v-for="item in filteredDictTypes" :key="item.id" class="sys-dict-type-list__row">
              <article
                class="sys-dict-type-card"
                :class="{ 'sys-dict-type-card--active': isActiveType(item) }"
                role="button"
                tabindex="0"
                @click="selectType(item)"
                @keydown.enter.prevent="selectType(item)"
                @keydown.space.prevent="selectType(item)"
              >
                <div class="sys-dict-type-card__header">
                  <strong class="sys-dict-type-card__title">{{ String(item.dictName ?? '-') }}</strong>
                  <div class="sys-dict-type-card__actions">
                    <el-button text type="primary" size="small" class="sys-dict-type-card__action" @click.stop="emit('editType', item as SimpleRecord)">
                      编辑
                    </el-button>
                    <el-button text type="danger" size="small" class="sys-dict-type-card__action" @click.stop="emit('deleteType', item as SimpleRecord)">
                      删除
                    </el-button>
                  </div>
                </div>
                <div class="sys-dict-type-card__meta">
                  <span class="sys-dict-type-card__code">{{ String(item.dictCode ?? '-') }}</span>
                  <StatusTag class="sys-dict-type-list__status" :status="String(item.status)" />
                </div>
              </article>
            </li>
          </ul>
          <div v-else class="sys-dict-sidebar__empty">
            <el-empty :description="dictTypes.length ? '没有符合条件的字典类型' : '暂无字典类型'">
              <el-button v-if="dictTypes.length" text type="primary" @click="resetTypeFilters">清空筛选</el-button>
            </el-empty>
          </div>
        </el-scrollbar>
      </aside>

      <article class="sys-panel sys-dict-detail">
        <header class="sys-panel__header sys-dict-detail__header">
          <div>
            <h2>{{ selectedDictTypeName }}</h2>
            <p class="sys-dict-detail__subtitle">
              {{ selectedDictTypeDescription }}
            </p>
          </div>
          <div class="sys-inline-actions sys-dict-detail__actions">
            <StatusTag v-if="selectedDictType" :status="String(selectedDictType.status)" />
            <el-button type="primary" :disabled="!selectedDictType" @click="emit('createItem')">新增字典项</el-button>
          </div>
        </header>

        <section class="sys-dict-detail__surface">
          <PlatformTable v-if="selectedDictType" :columns="dictItemColumns" :data="dictItems" row-key="id" show-index actions-width="160">
            <template #cell-status="{ row }">
              <StatusTag :status="String(row.status)" />
            </template>
            <template #actions="{ row }">
              <el-button text type="primary" @click="emit('editItem', row as SimpleRecord)">编辑</el-button>
              <el-button text type="danger" @click="emit('deleteItem', row as SimpleRecord)">删除</el-button>
            </template>
          </PlatformTable>
          <div v-else class="sys-dict-detail__empty">
            <el-empty description="请先新增或选择字典类型" />
          </div>
        </section>
      </article>
    </section>
  </section>
</template>

<script setup lang="ts">
import { PlatformTable, StatusTag } from '@smartwarehouse/platform-ui'
import type { TableColumn } from '@smartwarehouse/platform-types'
import { computed, reactive, watch } from 'vue'
import type { SimpleRecord } from '../api'

const props = defineProps<{
  dictColumns: TableColumn[]
  dictItemColumns: TableColumn[]
  dictTypes: SimpleRecord[]
  dictItems: SimpleRecord[]
  activeDictCode: string
}>()

const emit = defineEmits<{
  'update:activeDictCode': [value: string]
  changeDict: []
  createType: []
  editType: [row: SimpleRecord]
  deleteType: [row: SimpleRecord]
  createItem: []
  editItem: [row: SimpleRecord]
  deleteItem: [row: SimpleRecord]
}>()

const filters = reactive({
  keyword: '',
  status: ''
})

const filteredDictTypes = computed(() => {
  const keyword = filters.keyword.trim().toLowerCase()

  return props.dictTypes.filter((item) => {
    const dictName = String(item.dictName ?? '')
    const dictCode = String(item.dictCode ?? '')
    const matchesKeyword = !keyword || `${dictName} ${dictCode}`.toLowerCase().includes(keyword)
    const matchesStatus = !filters.status || String(item.status ?? '') === filters.status
    return matchesKeyword && matchesStatus
  })
})

const selectedDictType = computed(() =>
  props.dictTypes.find((item) => String(item.dictCode ?? '') === props.activeDictCode)
)

const selectedDictTypeName = computed(() => String(selectedDictType.value?.dictName ?? '未选择字典类型'))

const selectedDictTypeDescription = computed(() => {
  if (!selectedDictType.value) {
    return filteredDictTypes.value.length ? '左侧选择字典类型后，右侧会展开显示该类型下的字典项。' : '当前筛选条件下没有可查看的字典类型。'
  }
  return `当前查看字典编码：${String(selectedDictType.value.dictCode ?? '-')}`
})

function isActiveType(item: SimpleRecord): boolean {
  return String(item.dictCode ?? '') === props.activeDictCode
}

function selectType(item: SimpleRecord): void {
  const nextCode = String(item.dictCode ?? '')
  if (!nextCode || nextCode === props.activeDictCode) {
    return
  }
  emit('update:activeDictCode', nextCode)
  emit('changeDict')
}

function resetTypeFilters(): void {
  filters.keyword = ''
  filters.status = ''
}

// Keep the detail panel aligned with the currently visible type list.
watch(
  [filteredDictTypes, () => props.activeDictCode],
  ([items, activeCode]) => {
    const hasActiveItem = items.some((item) => String(item.dictCode ?? '') === activeCode)
    if (hasActiveItem) {
      return
    }
    if (!items.length) {
      if (activeCode) {
        emit('update:activeDictCode', '')
      }
      return
    }

    const nextCode = String(items[0]?.dictCode ?? '')
    if (!nextCode || nextCode === activeCode) {
      return
    }

    emit('update:activeDictCode', nextCode)
    emit('changeDict')
  },
  { immediate: true }
)
</script>

<style scoped>
.sys-dict-layout {
  display: grid;
  min-height: 0;
  flex: 1;
  grid-template-columns: minmax(300px, 360px) minmax(0, 1fr);
  gap: 18px;
}

.sys-dict-sidebar,
.sys-dict-detail {
  min-width: 0;
  min-height: 0;
}

.sys-dict-sidebar {
  display: flex;
  flex-direction: column;
}

.sys-dict-sidebar__header,
.sys-dict-detail__header {
  align-items: flex-start;
}

.sys-dict-sidebar__hint,
.sys-dict-detail__subtitle {
  margin: 6px 0 0;
  color: #6b7890;
  font-size: 13px;
  line-height: 1.6;
}

.sys-dict-filter {
  display: grid;
  gap: 10px;
  margin-bottom: 12px;
  padding: 14px;
  border: 1px solid #dbe4f3;
  border-radius: 16px;
  background: linear-gradient(180deg, #fbfdff 0%, #f3f7ff 100%);
}

.sys-dict-filter__row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
}

.sys-dict-filter__summary {
  margin: 0;
  color: #6b7890;
  font-size: 12px;
}

.sys-dict-sidebar__scroll {
  min-height: 0;
  flex: 1;
}

.sys-dict-sidebar__empty {
  display: grid;
  min-height: 240px;
  place-items: center;
}

.sys-dict-type-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.sys-dict-type-list__row {
  min-width: 0;
}

.sys-dict-type-card {
  display: grid;
  gap: 14px;
  padding: 16px;
  border: 1px solid #d9e2f2;
  border-radius: 16px;
  background: linear-gradient(180deg, #ffffff 0%, #f7faff 100%);
  box-shadow: 0 10px 24px rgba(31, 42, 68, 0.06);
  cursor: pointer;
  transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
}

.sys-dict-type-card:hover,
.sys-dict-type-card:focus-visible {
  border-color: #9db7f5;
  box-shadow: 0 14px 30px rgba(52, 93, 184, 0.12);
  transform: translateY(-1px);
  outline: none;
}

.sys-dict-type-card--active {
  border-color: #3b82f6;
  background: linear-gradient(180deg, #eff6ff 0%, #dbeafe 100%);
  box-shadow: 0 16px 34px rgba(59, 130, 246, 0.18);
}

.sys-dict-type-card__header,
.sys-dict-type-card__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-width: 0;
}

.sys-dict-type-card__title {
  min-width: 0;
  flex: 1;
  overflow: hidden;
  color: #1f2a44;
  font-size: 15px;
  font-weight: 700;
  line-height: 1.4;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sys-dict-type-card__actions {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  gap: 2px;
  padding: 2px;
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(8px);
}

.sys-dict-type-card__action {
  margin: 0;
  padding: 6px 10px;
  border-radius: 999px;
}

.sys-dict-type-card__code {
  overflow: hidden;
  color: #6b7890;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', monospace;
}

.sys-dict-type-list__status {
  flex-shrink: 0;
}

.sys-dict-type-card--active .sys-dict-type-card__title {
  color: #1d4ed8;
}

.sys-dict-detail__actions {
  flex-wrap: wrap;
  justify-content: flex-end;
}

.sys-dict-detail {
  display: flex;
  flex-direction: column;
}

.sys-dict-detail__surface {
  min-height: 0;
  flex: 1;
  padding: 16px;
  border: 1px solid #dbe3f0;
  border-radius: 18px;
  background: linear-gradient(180deg, #ffffff 0%, #f9fbff 100%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.85);
}

.sys-dict-detail__empty {
  display: grid;
  min-height: 388px;
  place-items: center;
}

@media (max-width: 1100px) {
  .sys-dict-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .sys-dict-filter__row {
    grid-template-columns: 1fr;
  }

  .sys-dict-type-card__header,
  .sys-dict-type-card__meta {
    align-items: flex-start;
    flex-direction: column;
  }

  .sys-dict-type-card__actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
