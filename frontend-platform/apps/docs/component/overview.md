# 组件

SmartWarehouse-AI Platform UI 是甲方维护的企业级自定义组件库。组件页不按 WMS、MES、AI 等业务域分类，而是按组件能力分类展示单个组件，便于乙方前端按需查找、复制示例和理解 API 边界。

<script setup lang="ts">
import ComponentOverview from '../src/ComponentOverview.vue'
</script>

<ComponentOverview />

## 使用原则

1. 基础输入、按钮、弹窗、菜单等能力优先直接使用 Element Plus。
2. 多个业务系统重复出现的页面结构、数据展示、流程反馈和选择器，优先沉淀到 Platform UI。
3. 业务前端只通过 `@smartwarehouse/platform-ui`、`@smartwarehouse/platform-sdk`、`@smartwarehouse/platform-theme`、`@smartwarehouse/platform-types` 接入平台能力。
4. 新增组件时必须同步登记组件元数据、补充详情文档或总览状态，并在组件详情页或场景模板中提供可运行样例。
5. 多个组件组合成的页面级用法放到 [场景模板](/scenario/overview)，不要混入单组件目录。

## 安装

```bash
corepack pnpm add @smartwarehouse/platform-ui @smartwarehouse/platform-theme
```

## 全量注册

```ts
import { createApp } from 'vue'
import SmartWarehousePlatformUi from '@smartwarehouse/platform-ui'
import '@smartwarehouse/platform-ui/style.css'

const app = createApp(App)
app.use(SmartWarehousePlatformUi)
app.mount('#app')
```

## 按需使用

```ts
import { PlatformTable, StatusTag } from '@smartwarehouse/platform-ui'
```

## 文档状态

`文档完整` 表示该组件已经具备详情页、基础示例、API 表和注意事项；`总览登记` 表示该组件已纳入组件库索引，后续会按使用频率补齐详情文档。
