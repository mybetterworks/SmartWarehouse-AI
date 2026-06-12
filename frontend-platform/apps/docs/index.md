<script setup lang="ts">
import { inBrowser } from 'vitepress'

if (inBrowser) {
  window.location.replace('/component/overview')
}
</script>

# SmartWarehouse-AI Platform UI

当前文档站采用企业组件库结构，公开模块为 `组件` 和 `场景模板`。

如果没有自动跳转，请进入 [组件总览](/component/overview)。

## 模块入口

| 模块 | 路由 | 用途 |
|---|---|---|
| 组件 | `/component/overview` | 与业务无关的组件级索引、组件详情、API、示例代码。 |
| 场景模板 | `/scenario/overview` | 多个组件组合成的登录、查询表格、导入、看板和 AI 工作台模板。 |

## npm 包

```text
@smartwarehouse/platform-ui
@smartwarehouse/platform-sdk
@smartwarehouse/platform-theme
@smartwarehouse/platform-types
```

乙方项目只允许通过 npm 包接入平台能力：

```ts
import { PlatformTable, MaterialSelect } from '@smartwarehouse/platform-ui'
import { request } from '@smartwarehouse/platform-sdk'
```
