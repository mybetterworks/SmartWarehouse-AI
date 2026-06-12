<template>
  <section class="sw-doc-overview">
    <div class="sw-component-hero">
      <p class="sw-doc-eyebrow">{{ eyebrow }}</p>
      <h1>{{ title }}</h1>
      <p>{{ description }}</p>
    </div>

    <div class="sw-component-summary">
      <div>
        <strong>{{ items.length }}</strong>
        <span>{{ totalLabel }}</span>
      </div>
      <div>
        <strong>{{ documentedCount }}</strong>
        <span>{{ documentedLabel }}</span>
      </div>
      <div>
        <strong>{{ groups.length }}</strong>
        <span>{{ groupLabel }}</span>
      </div>
    </div>

    <section v-for="group in groups" :id="group.key" :key="group.key" class="sw-doc-category">
      <div class="sw-doc-category__header">
        <div>
          <h2>{{ group.name }}</h2>
          <p>{{ group.description }}</p>
        </div>
        <span>{{ groupedItems[group.key]?.length ?? 0 }} items</span>
      </div>

      <div class="sw-component-index">
        <a
          v-for="item in groupedItems[group.key]"
          :id="item.slug"
          :key="`${group.key}-${item.slug}-${item.name}`"
          class="sw-component-index__item"
          :class="{ 'sw-component-index__item--disabled': !item.docsPath }"
          :href="item.docsPath ?? `#${item.slug}`"
          :aria-disabled="!item.docsPath"
        >
          <div>
            <strong>{{ item.name }}</strong>
            <span>{{ item.title }}</span>
          </div>
          <p>{{ item.description }}</p>
          <el-tag size="small" :type="item.status === 'documented' ? 'success' : 'info'" effect="light">
            {{ statusText[item.status] }}
          </el-tag>
        </a>
      </div>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CatalogGroupMeta, CatalogItemMeta, CatalogStatus } from './componentCatalog'

const props = withDefaults(
  defineProps<{
    eyebrow: string
    title: string
    description: string
    groups: CatalogGroupMeta[]
    items: CatalogItemMeta[]
    totalLabel?: string
    documentedLabel?: string
    groupLabel?: string
    statusText?: Record<CatalogStatus, string>
  }>(),
  {
    totalLabel: 'Items',
    documentedLabel: 'Documented',
    groupLabel: 'Groups',
    statusText: () => ({
      documented: '文档完整',
      overview: '总览登记'
    })
  }
)

const documentedCount = computed(() => props.items.filter((item) => item.status === 'documented').length)
// 组件总览和场景模板总览共用此分组逻辑，避免两个入口复制卡片布局和状态展示规则。
const groupedItems = computed(() =>
  props.groups.reduce<Record<string, CatalogItemMeta[]>>((result, group) => {
    result[group.key] = props.items.filter((item) => item.group === group.key)
    return result
  }, {})
)
</script>
