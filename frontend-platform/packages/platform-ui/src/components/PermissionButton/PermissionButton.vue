<template>
  <el-button
    v-if="visible"
    v-bind="$attrs"
    :type="type"
    :disabled="disabled || (!allowed && mode === 'disable')"
    @click="emit('click')"
  >
    <slot />
  </el-button>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { hasPermission, subscribePermissionChange } from '@smartwarehouse/platform-sdk'

const props = withDefaults(
  defineProps<{
    permission?: string | string[]
    mode?: 'hide' | 'disable'
    type?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'default'
    disabled?: boolean
  }>(),
  {
    mode: 'hide',
    type: 'primary',
    disabled: false
  }
)

const emit = defineEmits<{
  click: []
}>()

const permissionVersion = ref(0)
let unsubscribe: (() => void) | undefined

// permissionSet 在 SDK 内部不是响应式对象，这里用版本号触发 computed 重新计算按钮权限。
const allowed = computed(() => {
  permissionVersion.value
  return hasPermission(props.permission)
})
// hide 模式直接隐藏无权限按钮；disable 模式保留按钮位置，适合需要展示但禁止操作的场景。
const visible = computed(() => allowed.value || props.mode === 'disable')

onMounted(() => {
  // 登录、退出或切换用户后权限集合会变化，按钮需要订阅 SDK 通知刷新自身状态。
  unsubscribe = subscribePermissionChange(() => {
    permissionVersion.value += 1
  })
})

onBeforeUnmount(() => {
  // 后台页面长时间运行时要释放监听，避免反复进入页面造成无效订阅累积。
  unsubscribe?.()
})
</script>
