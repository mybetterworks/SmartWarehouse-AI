<template>
  <section class="sw-platform-page">
    <header v-if="title || description || $slots.toolbar" class="sw-platform-page__header">
      <div>
        <h1 v-if="title" class="sw-platform-page__title">{{ title }}</h1>
        <p v-if="description" class="sw-platform-page__description">{{ description }}</p>
      </div>
      <div v-if="$slots.toolbar" class="sw-platform-page__toolbar">
        <slot name="toolbar" />
      </div>
    </header>

    <main class="sw-platform-page__body">
      <slot />
    </main>
  </section>
</template>

<script setup lang="ts">
// PlatformPage 统一后台页面标题、说明、工具栏和正文区域。
// 组件不关心页面类型，列表页、详情页、看板页都可以通过 slot 放入各自内容。
defineProps<{
  title?: string
  description?: string
}>()
</script>
