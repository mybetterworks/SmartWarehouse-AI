<template>
  <el-breadcrumb class="sw-breadcrumb" separator="/">
    <el-breadcrumb-item
      v-for="item in items"
      :key="item.path ?? item.title"
      :class="{ 'sw-breadcrumb__item--link': Boolean(item.path) }"
      @click="item.path && emit('itemClick', item)"
    >
      {{ item.title }}
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script setup lang="ts">
import type { BreadcrumbItem } from '@smartwarehouse/platform-types'

const emit = defineEmits<{
  itemClick: [item: BreadcrumbItem]
}>()

// BreadcrumbNav only renders breadcrumb items and forwards click intent.
// Route changes remain the responsibility of the host shell or page container.
withDefaults(
  defineProps<{
    items?: BreadcrumbItem[]
  }>(),
  {
    items: () => []
  }
)
</script>
