<template>
  <el-menu
    class="sw-side-menu"
    :default-active="activePath"
    :collapse="collapsed"
    :collapse-transition="false"
    @select="handleSelect"
  >
    <template v-for="menu in visibleMenus" :key="menu.id">
      <el-sub-menu v-if="menu.children?.length" :index="menu.path">
        <template #title>
          <el-icon><MenuIcon /></el-icon>
          <span>{{ menu.title }}</span>
        </template>
        <el-menu-item
          v-for="child in getVisibleChildren(menu)"
          :key="child.id"
          :index="child.path"
          @click="emit('menuClick', child)"
        >
          {{ child.title }}
        </el-menu-item>
      </el-sub-menu>
      <el-menu-item v-else :index="menu.path" @click="emit('menuClick', menu)">
        <el-icon><MenuIcon /></el-icon>
        <template #title>{{ menu.title }}</template>
      </el-menu-item>
    </template>
  </el-menu>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Menu as MenuIcon } from '@element-plus/icons-vue'
import type { NavMenuItem } from '@smartwarehouse/platform-types'

const props = withDefaults(
  defineProps<{
    menus?: NavMenuItem[]
    activePath?: string
    collapsed?: boolean
  }>(),
  {
    menus: () => [],
    activePath: '',
    collapsed: false
  }
)

const emit = defineEmits<{
  menuClick: [menu: NavMenuItem]
  select: [path: string]
}>()

// 菜单权限已经由 sys-service 或门户层过滤，这里只做 visible 兜底，避免展示被标记隐藏的菜单项。
const visibleMenus = computed(() => props.menus.filter((item) => item.visible !== false))

function getVisibleChildren(menu: NavMenuItem): NavMenuItem[] {
  // 子菜单也独立过滤，支持父菜单可见但部分按钮/页面对子角色隐藏的场景。
  return (menu.children ?? []).filter((item) => item.visible !== false)
}

function handleSelect(path: string): void {
  // select 只抛出路径，具体是否使用 Vue Router、微前端跳转或外链跳转由父级决定。
  emit('select', path)
}
</script>
