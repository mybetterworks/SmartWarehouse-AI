<template>
  <section class="micro-outlet">
    <div v-if="loading" class="micro-outlet__state">
      <el-skeleton :rows="6" animated />
      <p>正在加载 {{ module.moduleName }} 微前端...</p>
    </div>

    <component
      v-else-if="remoteComponent"
      :is="remoteComponent"
      :route-path="routePath"
      :route-full-path="routeFullPath"
      :hosted="true"
      @route-change="emit('routeChange', $event)"
    />

    <PlatformPage
      v-else
      title="微前端模块加载失败"
      :description="`${module.moduleName} 暂时不可用，门户和其他模块不会受到影响。`"
    >
      <template #toolbar>
        <el-button @click="emit('back')">返回总控制台</el-button>
        <el-button type="primary" @click="loadRemote">重新加载</el-button>
      </template>

      <el-alert type="error" show-icon :closable="false" :title="errorText || '远程模块加载失败'" />
      <div class="micro-outlet__meta">
        <p><strong>模块编码：</strong>{{ module.moduleCode }}</p>
        <p><strong>远程容器：</strong>{{ module.remoteName }}</p>
        <p><strong>远程入口：</strong>{{ module.remoteEntry }}</p>
        <p><strong>暴露模块：</strong>{{ module.exposedModule }}</p>
        <p><strong>当前路由：</strong>{{ routePath }}</p>
      </div>
    </PlatformPage>
  </section>
</template>

<script setup lang="ts">
import { PlatformPage } from '@smartwarehouse/platform-ui'
import type { Component } from 'vue'
import { markRaw, onMounted, ref, shallowRef, watch } from 'vue'
import { loadRemoteComponent, type MicroFrontendModule } from './microFrontend'

const props = defineProps<{
  module: MicroFrontendModule
  routePath: string
  routeFullPath: string
}>()

const emit = defineEmits<{
  back: []
  retry: []
  routeChange: [{ fullPath: string; mode?: 'push' | 'replace' }]
}>()

const loading = ref(false)
const errorText = ref('')
const remoteComponent = shallowRef<Component>()
const remoteLoadTimeoutMs = 8000

onMounted(loadRemote)

watch(
  () => `${props.module.remoteName}:${props.module.remoteEntry}:${props.module.exposedModule}`,
  () => loadRemote()
)

async function loadRemote(): Promise<void> {
  loading.value = true
  errorText.value = ''
  remoteComponent.value = undefined
  try {
    remoteComponent.value = markRaw(await withTimeout(loadRemoteComponent(props.module), remoteLoadTimeoutMs))
  } catch (error) {
    errorText.value = error instanceof Error ? error.message : String(error)
    emit('retry')
  } finally {
    loading.value = false
  }
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => {
      reject(new Error(`远程模块加载超时，请检查 remoteEntry 是否可访问：${props.module.remoteEntry}`))
    }, timeoutMs)

    promise
      .then(resolve)
      .catch(reject)
      .finally(() => window.clearTimeout(timer))
  })
}
</script>
