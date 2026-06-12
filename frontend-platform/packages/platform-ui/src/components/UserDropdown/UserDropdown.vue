<template>
  <el-dropdown class="sw-user-dropdown" trigger="click" @command="handleCommand">
    <button class="sw-user-dropdown__trigger" type="button">
      <el-avatar :size="28">{{ avatarText }}</el-avatar>
      <span class="sw-user-dropdown__name">{{ user?.nickname || user?.username || '未登录' }}</span>
      <el-icon><ArrowDown /></el-icon>
    </button>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item command="profile">个人信息</el-dropdown-item>
        <el-dropdown-item command="password">修改密码</el-dropdown-item>
        <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ArrowDown } from '@element-plus/icons-vue'
import type { LoginUser } from '@smartwarehouse/platform-types'

// UserDropdown 统一顶部用户入口，展示当前用户并抛出个人信息、改密、退出等命令。
// 退出登录涉及 Token 清理、后端登出和路由跳转，必须由门户或 sys 前端处理。
const props = defineProps<{
  user?: LoginUser
}>()

const emit = defineEmits<{
  command: [command: string]
  logout: []
}>()

// 头像取昵称或账号首字，未登录时显示“访”，避免空用户状态下顶部区域塌陷。
const avatarText = computed(() => (props.user?.nickname || props.user?.username || '访').slice(0, 1))

function handleCommand(command: string): void {
  if (command === 'logout') {
    // logout 单独抛出，方便父级执行清理登录态、调用退出接口和跳转登录页。
    emit('logout')
    return
  }

  // 其他菜单命令保持字符串透传，业务项目可以按需增加 profile、password 之外的命令。
  emit('command', command)
}
</script>
