<template>
  <div class="sw-captcha">
    <div class="sw-captcha__board">
      <div class="sw-captcha__target" :style="{ left: `${target}%` }" />
      <div class="sw-captcha__piece" :class="{ 'sw-captcha__piece--ok': verified }" :style="{ left: `${sliderValue}%` }" />
    </div>
    <el-slider v-model="sliderValue" :show-tooltip="false" :disabled="verified" @change="handleChange" />
    <div class="sw-captcha__footer">
      <span>{{ verified ? '验证通过' : '拖动滑块完成拼图验证' }}</span>
      <el-button text size="small" @click="reset">刷新</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const emit = defineEmits<{
  success: [token: string]
  reset: []
}>()

const sliderValue = ref(0)
const target = ref(createTarget())
// 允许 4% 的误差，模拟真实拼图验证码中的容错区间，避免用户必须精确到同一像素。
const verified = computed(() => Math.abs(sliderValue.value - target.value) <= 4)

function createTarget(): number {
  // 目标位置限制在中间区域，避免太靠边导致验证过于简单或视觉不自然。
  return Math.floor(35 + Math.random() * 45)
}

function handleChange(): void {
  if (verified.value) {
    // V01 使用时间戳模拟一次性验证码 token；真实项目应由后端签发并校验。
    emit('success', `captcha-${Date.now()}`)
  }
}

function reset(): void {
  // 刷新时重新生成目标位置，并通知父组件清理已通过的风控状态。
  sliderValue.value = 0
  target.value = createTarget()
  emit('reset')
}
</script>
