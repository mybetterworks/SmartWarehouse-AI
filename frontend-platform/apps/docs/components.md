<script setup lang="ts">
import { inBrowser } from 'vitepress'

if (inBrowser) {
  window.location.replace('/component/overview')
}
</script>

# 组件入口已迁移

组件文档已迁移到新的企业组件库结构：[组件总览](/component/overview)。

旧 `/components` 路径仅作为兼容入口，不再作为公开模块维护。
