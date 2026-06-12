# Vue Element Plus 前端模块开发 Skill

## 1. 适用场景

用于开发 `frontend-platform`、`wms-web`、`mes-web`、`ai-web` 中的 Vue + Element Plus 页面、平台组件、SDK、主题和类型定义。

## 2. 输入

- 当前 milestone 文件。
- `docs/plan/ROADMAP.md`、`docs/plan/DEVELOPMENT_RULE.md`、`docs/plan/PROGRESS.md`。
- 目标前端项目目录。
- 后端接口前缀和权限编码。

说明：当前各 milestone 已经提前沉淀了 `docs/design` 中与本版本相关的前端设计、接口、页面和验收要求。常规版本开发时不要重复读取 `docs/design`，只有发现 milestone 与正式设计冲突、需要修改正式设计，或用户明确要求追溯设计依据时才读取 `docs/design`。

## 3. 执行步骤

1. 确认当前项目是甲方 `frontend-platform` 还是乙方业务前端。
2. 确认路由前缀：`/sys`、`/wms`、`/mes`、`/ai`。
3. 确认静态资源入口：`/apps/sys/`、`/apps/wms/`、`/apps/mes/`、`/apps/ai/`。
4. 所有请求通过 `platform-sdk` 访问 `/api/**`。
5. 不写死后端 IP、端口或完整域名。
6. 不跨项目相对路径引用源码。
7. 通用组件优先沉淀到 `platform-ui`。
8. 通用类型优先沉淀到 `platform-types`。
9. 页面使用菜单权限和按钮权限控制。
10. 如果本地没有全局 `pnpm`，使用 `corepack pnpm` 执行安装、构建、dry-run 和 dev server。
11. 如果 SDK 中的权限、用户、字典、运行时配置等状态会影响 Vue 组件渲染，要提供响应式适配、订阅机制或显式刷新机制。
12. 组件库发布前必须检查 tarball 是否包含运行时代码、样式和 `.d.ts` 声明文件。
13. 新增 `platform-ui` 组件后，必须同时维护按需导出、默认 `install(app)` 组件表、类型导出和文档演示。
14. 组件演示项目必须从 `@smartwarehouse/platform-ui` 包入口导入组件，不通过相对路径引用源码，以便提前发现漏导出问题。
15. 业务强类型数据传入通用组件前，应在业务组件内部做适配，不要为了某个业务类型污染通用组件类型。
16. 组件文档站采用企业组件库两入口结构：`组件` 和 `场景模板`；新增单组件必须同步更新 `/component/overview`、对应组件详情或总览状态。
17. 组件详情页至少包含用途、效果预览、示例代码、Props、Events、Slots 或注意事项。
18. 多组件组合、大块功能展示和页面级复用结构应放入 `/scenario/overview` 场景模板；业务验收页面不再放在组件文档站公开导航中，避免组件库站点退化为单项目演示页。
19. 完成构建、路由刷新、权限和接口联调验证；组件库改动必须同时跑包构建和文档站构建。
20. 在 VitePress 组件文档中展示 Element Plus 组件时，注意 `.vp-doc` Markdown 默认样式可能污染组件内部 DOM；发现表格间距、边框、padding 异常时，优先对 `.vp-doc .el-table` 等第三方组件容器做局部 reset。
21. 表格类组件在文档 Demo 中要单独校验容器宽度、列宽、固定列和横向滚动；示例列宽应服务文档阅读，不应照搬真实业务页面的大宽度配置。
22. 组件详情页的“基础用法”外层 Demo 容器必须保持统一宽度和统一样式；窄组件通过内部 wrapper 控制自身宽度，不缩窄外层 `.sw-doc-preview`。
23. AI、BI、日志、SQL、JSON、Agent、MCP 工具调用等长内容组件，必须同时检查组件 CSS 和 VitePress theme CSS，确保 `pre/code`、表格、折叠面板和 trace 内容不会撑破文档容器。
24. 组件详情页示例代码默认使用 Vue + TypeScript SFC 写法，标题统一标注 `示例代码（Vue + TypeScript）`，Vue 代码块统一包含 `<script setup lang="ts">`。
25. 不再维护预设式静态 Playground；除非实现真实在线代码编辑和实时预览能力，否则不得恢复 `/playground` 公开入口、Playground 组件或 `playgroundPreset` 元数据。
26. `组件` 与 `场景模板` 的总览页面必须复用 `apps/docs/src/CatalogOverview.vue`，目录数据集中维护在 `apps/docs/src/componentCatalog.ts`，不要复制两套卡片、分组、状态和搜索展示逻辑。
27. `组件` 入口必须保持单组件详情边界：每个 `componentCatalog` 条目必须指向自己的 `/component/<slug>`，不得多个组件共用一个组合详情页。
28. 单组件详情页统一通过 `ComponentDetail.vue` 和 `componentDocs.ts` 维护样式预览、Vue + TypeScript 示例、Props、Events、Slots、Types、注意事项和关联场景模板。
29. 多组件组合、大块业务片段、页面级模板统一通过 `ScenarioTemplateDetail.vue` 和 `scenarioTemplateDocs.ts` 维护，并放到 `/scenario/<slug>`。
30. 旧组合路由如 `/component/business-selects`、`/component/dashboard`、`/component/ai-workbench` 只能作为迁移提示或兼容跳转，不再承载组合正文。
31. 为 Vue 组件、组合式函数、SDK 方法、复杂 computed/watch、权限判断、运行时配置、请求拦截、组件 props 适配和关键交互流程补充详细中文注释，说明业务含义、设计原因和使用注意事项。

## 4. 检查清单

- [ ] 项目可以独立安装依赖。
- [ ] 项目可以独立构建。
- [ ] Windows 11 环境下可以通过 `corepack pnpm` 复现安装和构建。
- [ ] Vite base 与 entry_url 一致。
- [ ] 请求统一走 `/api/**`。
- [ ] 不包含 `.npmrc` 和 npm token 到最终镜像。
- [ ] 页面刷新不 404。
- [ ] 菜单和按钮权限生效。
- [ ] 组件库 dry-run 发布包包含 `.d.ts`。
- [ ] 新增组件已加入 `platform-ui/src/index.ts` 的按需导出和默认 `install(app)` 组件表。
- [ ] 文档站从包入口导入新增组件并构建通过。
- [ ] 新增组件已登记到 `apps/docs/src/componentCatalog.ts`。
- [ ] 组件级元数据已放入 `componentCatalog`，场景模板元数据已放入 `scenarioTemplateCatalog`，两类目录没有互相混淆。
- [ ] `componentCatalog` 中每个条目的 `docsPath` 都是唯一的 `/component/<slug>`，不存在多个组件共享一个组合页面。
- [ ] `/component/<slug>` 只展示一个底层组件的 Demo、代码和 API；组合内容已迁移到 `/scenario/<slug>`。
- [ ] 场景模板详情页列出了底层组件，并能链接回对应单组件文档。
- [ ] `/component/overview` 与 `/scenario/overview` 均复用 `CatalogOverview.vue`，没有复制总览 UI 实现。
- [ ] 核心组件已有详情页，包含效果、代码、Props、Events、Slots 或注意事项。
- [ ] 组件详情页或场景模板详情页中至少有一个可运行示例。
- [ ] VitePress build 后的 `.vitepress/dist` 中能找到新增页面和关键文本。
- [ ] 文本、表格、按钮在移动和桌面尺寸下不明显溢出。
- [ ] Element Plus 表格在 VitePress 文档中没有表头与第一行异常空白。
- [ ] 表格 Demo 没有超出 `.sw-doc-preview` 等基础用法容器。
- [ ] `LoginForm` 等窄组件没有缩窄外层 Demo 容器，而是通过内部居中 wrapper 控制组件宽度。
- [ ] AI / BI / SQL / JSON / Agent / MCP 等长内容组件在文档站中没有撑破外层 Demo 容器。
- [ ] 组件详情页示例标题统一为 `示例代码（Vue + TypeScript）`。
- [ ] Vue 示例代码块均包含 `<script setup lang="ts">`。
- [ ] 未新增预设式静态 Playground；如恢复 Playground，必须是可在线编辑代码并实时预览样式的真实调试工具。
- [ ] 组件、组合式函数、SDK 方法、关键交互逻辑、复杂状态计算和业务适配代码已有详细中文注释。

## 5. 推荐提示词

```text
请使用 docs/plan/skill/vue-element-plus-module-skill.md，开发当前 milestone 中的前端模块。优先复用 @smartwarehouse/platform-ui 和 platform-sdk，保持甲方平台和乙方业务前端边界清晰。
```

## 6. 常见坑

1. 业务前端直接引用 `frontend-platform` 源码。
2. Vite base 仍为 `/`，部署到 `/apps/wms/` 后资源 404。
3. 路由刷新没有 Nginx history fallback。
4. 业务页面写死后端地址，部署后跨环境失败。
5. 把 npm token 打进最终镜像。
6. milestone 已经包含版本设计输入，但 skill 仍要求重复读取 `docs/design`，造成 token 浪费和开发边界漂移。
7. 先生成 `.d.ts` 再运行 Vite build，导致声明文件被清空。
8. 权限状态存在 SDK 普通变量中，组件运行时不刷新。
9. 新增组件文件后忘记在 `platform-ui/src/index.ts` 导出，导致业务项目或文档站从 npm 包入口导入失败。
10. 只跑 `build:packages`，没有跑文档站构建，遗漏组件演示、入口导出和 VitePress SSR 问题。
11. 业务专用强类型数组直接传给通用表格，导致 TypeScript 索引签名不兼容；应在业务组件内部转换为通用表格行。
12. 只有综合演示页，没有组件总览、组件详情和场景模板，乙方接入时仍需要阅读源码。
13. 将首页、业务样例、发布说明都放进公开导航，会让企业组件库站点退化为项目演示站；公开入口应收敛为组件和场景模板，其中组件页保持业务无关，场景模板承载多组件组合。
14. VitePress dev server 的 HTML 可能是客户端入口壳，直接搜索 HTTP 响应正文会误判；需要检查 build 后静态 HTML 或进行浏览器 DOM 验证。
15. 浏览器插件可能拦截 localhost，本地验证应保留构建、HTTP 状态和静态产物检查作为兜底。
16. VitePress `.vp-doc table` 默认样式影响 Element Plus 内部表格，造成表头和第一行之间出现空白、边框或 padding 异常。
17. 为避免表格超出文档 Demo 容器，直接给表头/表体加横向滚动可能产生新的“空白行”观感；应优先调整示例列宽或组件列宽，再保留必要的内部滚动。
18. 为了控制 LoginForm 这类窄组件而缩窄 `.sw-doc-preview`，会让组件详情页基础用法方框宽度不统一。
19. AI Workbench 这类复杂组件只改组件内部 CSS，不补 VitePress theme 覆盖，可能仍被 `.vp-doc pre/code` 默认样式撑破容器。
20. 示例代码没有标注 TypeScript，乙方复制后容易丢失事件入参、业务模型和枚举类型约束。
21. 为了保留入口而维护一个只能切换固定预设的静态 Playground，会和场景模板重复且不能满足真实调试预期；除非升级为实时编辑预览，否则应删除。
22. 多个底层组件共用一个 `/component/*` 组合详情页，会让组件 API 边界不清，后续参数变更也容易漏改文档。
23. 场景模板正文继续放在组件入口，会让企业组件库退化为项目页面演示；组件入口只保留单组件文档，组合模板放 `/scenario/*`。
24. VitePress preview 如果通过 pnpm script 透传参数失败，可能仍占用默认 4173；可进入 `apps/docs` 后直接使用 `corepack pnpm exec vitepress preview . --host 127.0.0.1 --port 4174`。
25. 组件封装只写类型和实现、不写中文注释，后续学习时很难理解 props 设计、事件触发时机、权限判断、状态同步和样式覆盖的原因。

## 7. 更新记录

```text
日期：2026-06-11
原因：V01 开发发现旧流程仍要求读取 docs/design，且未覆盖 Windows Corepack、组件声明文件和 SDK 状态同步问题。
修正：常规版本开发改为以当前 milestone 为直接输入；补充 corepack pnpm、权限订阅刷新、dry-run 类型声明检查。
验证：V01 corepack pnpm build 成功；platform-ui publish --dry-run 包含 .d.ts；浏览器验证 PermissionButton 权限刷新正常。
```

```text
日期：2026-06-11
原因：V01 组件库补强时新增大量后续业务组件，发现旧流程没有明确要求维护 platform-ui 包入口、默认 install(app) 组件表和文档站包入口验证。
修正：执行步骤补充新增组件后必须维护按需导出、默认 install 表、类型导出和文档演示；检查清单补充入口导出和文档站构建；常见坑补充 WorkOrderSelect 漏导出、只跑包构建不跑文档站、业务强类型数组与通用表格类型不兼容。
验证：corepack pnpm build:packages 成功；corepack pnpm build 成功；corepack pnpm publish:dry-run 成功；浏览器访问 http://127.0.0.1:5173/ 验证关键组件分组显示正常且控制台无 error。
```

```text
日期：2026-06-11
原因：V01 组件文档体系补强时，明确单一综合演示页不能支撑甲方组件库和多乙方协作，需要正式组件总览、详情页、Playground 和业务场景样例。
修正：执行步骤补充四层文档结构；检查清单补充 componentCatalog、详情页、Playground/业务样例和静态产物验证；常见坑补充首页堆 demo、缺少组件 API 文档、VitePress dev server HTML 误判和 localhost 被浏览器插件拦截。
验证：corepack pnpm build 成功；corepack pnpm publish:dry-run 成功；.vitepress/dist 首页、组件总览、Playground、业务样例、PlatformTable 详情和 AI 工作台详情关键词检查通过。
```

```text
日期：2026-06-11
原因：用户确认组件文档站应贴近企业级自定义组件库，而不是 SmartWarehouse-AI 项目演示页；旧四层结构中的首页、业务样例、发布说明会造成公开模块过多。
修正：组件文档站结构改为两模块：组件与 Playground；公开导航只保留 `/component/overview` 和 `/playground`；新增组件时更新 componentCatalog、/component 详情页和 Playground 预设；旧路径只做兼容入口。
验证：corepack pnpm build:packages 成功；corepack pnpm build 成功；/component/overview、/component/platform-table、/playground 构建产物存在并包含预期关键文本。
```

```text
日期：2026-06-11
原因：组件详情页出现 Element Plus 表格标题行与第一行之间异常空白，MaterialRequirementEditor 表格超出基础用法容器；排查发现 VitePress Markdown 表格样式会污染 Element Plus 内部 table，同时文档 Demo 容器宽度小于业务页面。
修正：补充 VitePress + Element Plus 表格局部 reset 规则；新增表格 Demo 宽度、固定列和横向滚动检查；补充文档示例列宽应适配文档容器的规则。
验证：/component/material-requirement-editor 和 /component/platform-table 浏览器检查通过；corepack pnpm build:packages 成功；corepack pnpm build 成功；corepack pnpm publish:dry-run 成功。
```

```text
日期：2026-06-12
原因：组件详情页出现 LoginForm 基础用法外框宽度不统一、AI Workbench 长内容超出外框、示例代码未统一 TypeScript 标注的问题。
修正：补充 Demo 外层容器必须统一、窄组件使用内部居中 wrapper、AI/BI/SQL/Agent/MCP 长内容需要同时处理组件样式和 VitePress theme 样式、示例代码统一使用 Vue + TypeScript SFC、Playground 字符串预设中闭合 script 标签必须转义的规则。
验证：/component/login-form 和 /component/ai-workbench 浏览器检查通过；Node 脚本确认 component 与 components 目录下 Vue 示例代码块均包含 `<script setup lang="ts">`；corepack pnpm build 成功；corepack pnpm publish:dry-run 成功。
```

```text
日期：2026-06-12
原因：用户确认当前“组件”页仍按大块功能分类，应该拆成业务无关的组件级目录，同时保留原大块功能组合展示并改名为“场景模板”。
修正：组件文档站结构从两模块调整为三入口：组件、场景模板、Playground；组件页按基础、布局、数据录入、数据展示、反馈与流程、高级组件展示单组件；场景模板页承载登录风控、查询表格、离线导入、运营看板、AI 工作台等多组件组合；两类总览复用 CatalogOverview.vue，元数据集中维护在 componentCatalog.ts。
验证：corepack pnpm --filter @smartwarehouse/component-docs build 成功；后续需继续执行完整 corepack pnpm build、publish:dry-run、路由和浏览器验证。
```

```text
日期：2026-06-12
原因：三入口结构完成后仍发现部分组件详情共用组合页面，用户明确要求组件页必须独立展示每个底层组件的样式、代码、参数等信息。
修正：新增单组件详情边界规则；componentCatalog 每个条目必须唯一指向 /component/<slug>；单组件详情由 ComponentDetail.vue + componentDocs.ts 维护，场景模板详情由 ScenarioTemplateDetail.vue + scenarioTemplateDocs.ts 维护；旧组合组件路由只做迁移提示。
验证：corepack pnpm --filter @smartwarehouse/component-docs build 成功；corepack pnpm build 成功；corepack pnpm publish:dry-run 成功；preview HTTP 检查组件总览、单组件详情、场景模板详情和 Playground 路由均返回 200。
```

```text
日期：2026-06-12
原因：用户确认当前 Playground 只能静态演示固定预设，不支持在线修改代码和实时显示样式，存在感不足且会让组件文档站功能显得混乱。
修正：组件文档站流程从三入口调整为两入口：组件、场景模板；删除 Playground 预设维护要求；新增规则要求不得恢复预设式静态 Playground，除非升级为真实在线编辑实时预览工具。
验证：corepack pnpm --filter @smartwarehouse/component-docs build 成功；后续完整构建、dry-run、preview HTTP 和浏览器验证结果写入 PROGRESS 与 milestone。
```
