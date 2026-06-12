<template>
  <el-breadcrumb class="sw-breadcrumb" separator="/">
    <el-breadcrumb-item v-for="item in items" :key="item.path ?? item.title" :to="item.path ? { path: item.path } : undefined">
      {{ item.title }}
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script setup lang="ts">
import type { BreadcrumbItem } from '@smartwarehouse/platform-types'

// 面包屑只承载页面路径展示，不从路由中反推层级。
// 这样 sys、wms、mes、ai 独立前端都可以按自己的路由结构传入统一格式。
withDefaults(
  defineProps<{
    items?: BreadcrumbItem[]
  }>(),
  {
    items: () => []
  }
)
</script>
