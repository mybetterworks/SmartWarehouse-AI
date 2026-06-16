<template>
  <div class="sw-captcha">
    <div class="sw-captcha__board">
      <div class="sw-captcha__target" :style="{ left: `${target}%` }" />
      <div class="sw-captcha__piece" :class="{ 'sw-captcha__piece--ok': verified }" :style="{ left: `${sliderValue}%` }" />
    </div>
    <el-slider v-model="sliderValue" :show-tooltip="false" :disabled="verified || verifying" @change="handleChange" />
    <div class="sw-captcha__footer">
      <span>{{ footerText }}</span>
      <el-button text size="small" @click="reset">刷新</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const props = defineProps<{
  /**
   * 后端挑战返回的目标位置。V02 portal-shell 用它让前端滑块位置与 sys-service 票据校验保持一致。
   * 未传入时仍使用组件本地随机目标，便于文档站和单组件演示。
   */
  target?: number
  /**
   * 后端验证码校验函数。返回一次性 captchaVerifyToken；未传入时组件继续生成本地演示 token。
   */
  verifier?: (x: number) => Promise<string>
}>()

const emit = defineEmits<{
  success: [token: string]
  reset: []
}>()

const sliderValue = ref(0)
const target = ref(props.target ?? createTarget())
const verifying = ref(false)
const errorText = ref('')
// 允许 4% 的误差，模拟真实拼图验证码中的容错区间，避免用户必须精确到同一像素。
const verified = computed(() => Math.abs(sliderValue.value - target.value) <= 4)
const footerText = computed(() => {
  if (verifying.value) {
    return '正在校验'
  }
  if (errorText.value) {
    return errorText.value
  }
  return verified.value ? '验证通过' : '拖动滑块完成拼图验证'
})

watch(
  () => props.target,
  (nextTarget) => {
    // 后端重新下发挑战时同步目标位置，并清空旧滑块状态，避免旧验证码结果被复用。
    if (typeof nextTarget === 'number') {
      sliderValue.value = 0
      errorText.value = ''
      target.value = nextTarget
    }
  }
)

function createTarget(): number {
  // 目标位置限制在中间区域，避免太靠边导致验证过于简单或视觉不自然。
  return Math.floor(35 + Math.random() * 45)
}

async function handleChange(): Promise<void> {
  if (!verified.value) {
    errorText.value = '位置不正确，请重新拖动'
    return
  }

  verifying.value = true
  errorText.value = ''
  try {
    // 如果业务传入 verifier，说明验证码由后端签发和校验；否则保留本地演示模式。
    const token = props.verifier ? await props.verifier(sliderValue.value) : `captcha-${Date.now()}`
    emit('success', token)
  } catch (error) {
    errorText.value = error instanceof Error ? error.message : '验证失败，请重试'
    sliderValue.value = 0
  } finally {
    verifying.value = false
  }
}

function reset(): void {
  // 刷新时重新生成目标位置，并通知父组件清理已通过的风控状态。
  sliderValue.value = 0
  errorText.value = ''
  target.value = props.target ?? createTarget()
  emit('reset')
}
</script>
