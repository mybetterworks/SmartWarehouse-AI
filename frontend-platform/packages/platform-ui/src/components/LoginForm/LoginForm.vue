<template>
  <el-form class="sw-login-form" :model="form" label-position="top" @submit.prevent>
    <el-form-item label="账号">
      <el-input v-model="form.username" :prefix-icon="User" placeholder="请输入账号" autocomplete="username" />
    </el-form-item>
    <el-form-item label="密码">
      <el-input
        v-model="form.password"
        :prefix-icon="Lock"
        placeholder="请输入密码"
        type="password"
        autocomplete="current-password"
        show-password
        @keyup.enter="handleSubmit"
      />
    </el-form-item>
    <el-form-item v-if="captchaRequired" label="安全验证">
      <JigsawCaptcha @success="handleCaptchaSuccess" />
    </el-form-item>
    <div class="sw-login-form__row">
      <el-checkbox v-model="form.rememberMe">记住账号</el-checkbox>
      <el-tag v-if="riskText" type="warning" effect="light">{{ riskText }}</el-tag>
    </div>
    <el-button class="sw-login-form__submit" type="primary" :loading="loading" @click="handleSubmit">登录</el-button>
  </el-form>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { Lock, User } from '@element-plus/icons-vue'
import type { LoginFormModel, LoginRiskState } from '@smartwarehouse/platform-types'
import JigsawCaptcha from '../JigsawCaptcha/JigsawCaptcha.vue'

const props = withDefaults(
  defineProps<{
    loading?: boolean
    riskState?: LoginRiskState
  }>(),
  {
    loading: false
  }
)

const emit = defineEmits<{
  submit: [model: LoginFormModel]
}>()

const form = reactive<LoginFormModel>({
  username: '',
  password: '',
  rememberMe: false,
  captchaToken: ''
})

// 登录风控由后端/sys 页面传入状态；组件只根据状态决定是否展示拼图验证码。
const captchaRequired = computed(() => props.riskState?.captchaRequired === true)
const riskText = computed(() => props.riskState?.message || (captchaRequired.value ? '连续失败后需要验证' : ''))

watch(captchaRequired, (required) => {
  if (required) {
    // 风控状态刚切换为需要验证码时，清空旧 token，避免复用上一次验证结果。
    form.captchaToken = ''
  }
})

// 拼图组件只返回一次性验证 token，真正校验仍交给登录接口，避免前端自行信任验证结果。
function handleCaptchaSuccess(token: string): void {
  form.captchaToken = token
}

function handleSubmit(): void {
  // 需要验证码但尚未通过时不提交，减少无效登录请求，也符合连续失败 3 次后的风控流程。
  if (captchaRequired.value && !form.captchaToken) {
    return
  }

  // 使用浅拷贝向外提交，避免父组件直接修改内部 reactive 表单对象。
  emit('submit', { ...form })
}
</script>
