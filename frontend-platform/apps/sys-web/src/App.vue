<template>
  <main v-if="!user" class="sys-login">
    <section class="sys-login__panel">
      <h1>系统管理</h1>
      <p>独立模式下可直接登录调试；作为门户托管内容时不会渲染这里。</p>

      <el-form label-position="top" @submit.prevent>
        <el-form-item label="账号">
          <el-input v-model="loginForm.username" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="loginForm.password" type="password" show-password @keyup.enter="handleLogin" />
        </el-form-item>
        <el-button type="primary" :loading="loading" @click="handleLogin">登录系统管理</el-button>
      </el-form>

      <el-alert v-if="errorText" class="sys-login__error" type="error" :title="errorText" show-icon :closable="false" />
    </section>
  </main>

  <StandaloneShell v-else :user="user" :menus="menus" @logout="handleLogout" />
</template>

<script setup lang="ts">
import { clearTokens } from '@smartwarehouse/platform-sdk'
import type { LoginUser, MenuItem } from '@smartwarehouse/platform-types'
import { ElMessage } from 'element-plus'
import { onMounted, reactive, ref } from 'vue'
import { loadMe, loadMenus, login, logout } from './api'
import StandaloneShell from './StandaloneShell.vue'
import { ensureSysManagementAccess } from './useSysManagement'

const user = ref<LoginUser>()
const menus = ref<MenuItem[]>([])
const loading = ref(false)
const errorText = ref('')
const loginForm = reactive({ username: 'admin', password: '' })

onMounted(async () => {
  try {
    const currentUser = await loadMe()
    ensureSysManagementAccess(currentUser)
    user.value = currentUser
    menus.value = await loadMenus()
  } catch {
    clearTokens()
    user.value = undefined
  }
})

async function handleLogin(): Promise<void> {
  loading.value = true
  errorText.value = ''
  try {
    await login(loginForm.username, loginForm.password)
    const currentUser = await loadMe()
    ensureSysManagementAccess(currentUser)
    user.value = currentUser
    menus.value = await loadMenus()
    ElMessage.success('系统管理登录成功')
  } catch (error) {
    clearTokens()
    user.value = undefined
    errorText.value = error instanceof Error ? error.message : '登录失败'
  } finally {
    loading.value = false
  }
}

async function handleLogout(): Promise<void> {
  await logout()
  user.value = undefined
}
</script>
