<template>
  <section class="sw-sql-preview">
    <header>
      <strong>{{ title }}</strong>
      <el-button text size="small" @click="copySql">复制</el-button>
    </header>
    <pre><code>{{ sql || '暂无 SQL' }}</code></pre>
  </section>
</template>

<script setup lang="ts">
// SqlPreview 用于展示 ChatBI 生成的只读 SQL，帮助用户理解自然语言问题如何被转换。
// 组件不执行 SQL，也不做权限判断；真实执行和白名单限制必须由 ai-service 后端完成。
const props = withDefaults(
  defineProps<{
    title?: string
    sql?: string
  }>(),
  {
    title: 'SQL 预览',
    sql: ''
  }
)

async function copySql(): Promise<void> {
  if (typeof navigator === 'undefined' || !navigator.clipboard || !props.sql) {
    // SSR、无剪贴板权限或没有 SQL 时直接返回，避免文档站构建和低权限浏览器报错。
    return
  }

  // 复制只服务排查和学习，不能替代后端审计；真实 ChatBI 查询仍要记录用户、权限和执行链路。
  await navigator.clipboard.writeText(props.sql)
}
</script>
