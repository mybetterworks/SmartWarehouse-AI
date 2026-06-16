<template>
  <el-sub-menu v-if="hasChildren" :index="menu.path">
    <template #title>
      <div class="sw-side-menu__submenu-title">
        <el-icon><component :is="resolveMenuIcon(menu.icon)" /></el-icon>
        <span>{{ menu.title }}</span>
      </div>
    </template>
    <SideMenuNode
      v-for="child in menu.children"
      :key="child.id"
      :menu="child"
      :resolve-menu-icon="resolveMenuIcon"
      @menu-click="emit('menuClick', $event)"
    />
  </el-sub-menu>

  <el-menu-item v-else :index="menu.path" @click="emit('menuClick', menu)">
    <el-icon><component :is="resolveMenuIcon(menu.icon)" /></el-icon>
    <template #title>{{ menu.title }}</template>
  </el-menu-item>
</template>

<script setup lang="ts">
import type { NavMenuItem } from '@smartwarehouse/platform-types'
import { computed } from 'vue'

defineOptions({
  name: 'SideMenuNode'
})

const props = defineProps<{
  menu: NavMenuItem
  resolveMenuIcon: (iconName?: string) => unknown
}>()

const emit = defineEmits<{
  menuClick: [menu: NavMenuItem]
}>()

const hasChildren = computed(() => Boolean(props.menu.children?.length))
</script>
