# V01 学习总结：甲方组件库二次开发

## 1. 版本状态

```text
状态：DONE
完成日期：2026-06-11
```

## 2. 关键技术点

- Element Plus 二次封装边界。
- `platform-ui`、`platform-sdk`、`platform-theme`、`platform-types` 的职责拆分。
- 组件库 peerDependencies、按需打包和样式导出。
- 阿里云效 npm snapshot 包发布。
- pnpm workspace 在 Windows 11 中可通过 Corepack 固定版本执行，避免依赖全局 pnpm。
- Vue 组件库发布时需要同时包含运行时代码、样式和 `.d.ts` 声明文件。
- SDK 中非 Vue 响应式状态如果影响组件渲染，需要提供订阅或事件机制。
- VitePress + Element Plus SSR 需要提供 ID / ZIndex provider，避免 hydration 相关警告。
- 平台组件库补强时，需要先从后续版本页面抽象高频场景，再沉淀为门户、表单、数据、业务选择器、导入任务、运营看板和 AI 工作台组件。
- 通用表格的入参应保持 `Record<string, unknown>[]`，业务专用组件如果使用强类型行数据，可以在组件内部做只读映射，避免污染通用组件类型。
- 组件库入口必须同时维护按需导出和默认 `install(app)` 插件导出，新增组件后要用文档站从构建产物反向引用验证是否漏导出。
- WebSocket 在前端 SDK 中只封装连接、重连、心跳和消息解析，不绑定具体业务主题；业务组件通过 `useWebSocketClient` 组合式函数接入。
- 企业级组件库文档不能只有综合演示页，需要具备组件总览、组件详情和场景模板。
- 组件总览可以参考 Element Plus Overview 的组织方式，但分类应保持业务无关并贴近企业组件库能力，例如基础、布局、数据录入、数据展示、反馈与流程、高级组件。
- 只有支持在线编辑代码并实时预览样式的真实 Playground 才适合作为独立调试入口；固定预设式静态演示应放入组件详情或场景模板，不应单独占用公开导航。
- VitePress dev server 的 HTTP HTML 可能只返回客户端入口壳，页面正文验证更适合检查 build 后的 SSR 静态 HTML。
- VitePress `.vp-doc` 默认 Markdown 表格样式可能影响 Element Plus 内部 table 结构，需要对 `.vp-doc .el-table` 做局部 reset，避免表头与第一行之间出现异常空白。
- 文档站 Demo 容器通常比真实业务页面窄，表格类组件示例需要单独控制列宽、操作列宽和溢出策略，不能简单复用业务页面的大宽度配置。
- 组件详情页的 Demo 外框应保持统一宽度和统一视觉规则。像 LoginForm 这类天然较窄的组件，应通过内部居中容器控制组件自身宽度，而不是缩窄外层 `.sw-doc-preview`。
- AI 工作台、ChatBI、SQL、Agent、MCP 工具调用等组件天然包含长文本、代码、JSON 和表格，必须同时在组件样式与 VitePress theme 中处理 `min-width: 0`、`max-width: 100%`、`overflow-wrap` 和 `pre-wrap`，避免被文档站默认 `pre/code` 样式覆盖。
- 企业级组件库示例代码应默认提供可复制的 Vue + TypeScript SFC 片段，标题明确标注 `示例代码（Vue + TypeScript）`，代码块统一使用 `<script setup lang="ts">`。
- 如果后续恢复真实 Playground，示例代码、运行沙箱和平台包 import map 需要单独设计，不能只维护固定预设字符串。
- 组件级目录和场景模板目录虽然内容不同，但展示规则应复用。通过 `componentCatalog.ts` 维护元数据，通过 `CatalogOverview.vue` 统一渲染总览、分组和卡片，可以避免组件展示规则变更时同时修改多个页面。

## 3. 开发经验

- 公共能力先沉淀为平台包，再让乙方前端通过版本依赖接入。
- 组件库要先有演示页面，否则乙方很难稳定复用。
- npm token 只能存在于构建或发布阶段，不能进入源码和最终镜像。
- 在 Windows PowerShell 中，`npm.ps1` / `pnpm.ps1` 可能受执行策略影响，优先使用 `corepack pnpm` 或 `.cmd` 入口。
- `platform-ui` 先运行 `vue-tsc --emitDeclarationOnly` 再运行 Vite build 会被 Vite 清空 `dist`，正确顺序是先 `vite build`，再生成声明文件。
- `PermissionButton` 依赖的权限状态不能只是普通 `Set`，否则登录后或运行时权限变化不会触发按钮刷新。
- 不要等到 WMS、MES、AI 页面开发时才补组件。当前能从设计文档明确识别的高频场景，可以在 V01 先提供稳定组件 API，后续乙方只对接真实接口。
- 组件演示页应从发布包入口 `@smartwarehouse/platform-ui` 引用组件，而不是从源码相对路径引用，这样能提前发现入口漏导出问题。
- 文档站公开入口不应过多。企业组件库站点当前应收敛为“组件 / 场景模板”：组件入口保持业务无关并按组件级别组织，场景模板入口承载多组件组合；旧首页、业务样例、发布说明只做兼容入口或放到计划/发布文档中。
- 修复组件文档站视觉问题时，要同时看组件源码、文档站主题样式和文档示例本身。表格空白行这类问题不一定来自业务组件，可能来自文档容器的全局 Markdown 样式。
- 组件文档站的“基础用法”容器要先保证统一，再处理单个组件的最佳展示尺寸。统一容器负责文档一致性，内部 wrapper 负责组件展示尺寸。
- 对 AI、BI、日志、代码、JSON 类组件做文档展示时，要在浏览器中检查实际 DOM 溢出，而不只看构建是否成功；构建成功不代表文档容器没有被撑破。
- 示例代码是乙方复制接入的第一入口，组件库文档中的示例应该比内部 demo 更严格：必须有类型导入、事件入参类型、函数返回类型和 TypeScript 标记。

## 4. 面试点

### Q1：为什么先做甲方组件库？

答：真实项目中平台组件、请求 SDK、主题和类型是乙方前端开发的基础。先做好组件库，可以减少后续 WMS、MES、AI 前端重复造轮子。

### Q2：组件库如何避免和业务耦合？

答：组件库只封装通用 UI、请求、主题、权限和类型，不包含 WMS、MES、AI 的业务页面和业务流程。

### Q3：为什么平台前端包要拆成 ui、sdk、theme、types？

答：四类能力的变化频率和依赖方向不同。`types` 最轻，负责共享契约；`sdk` 负责请求、权限和运行时配置；`theme` 负责视觉基线；`ui` 负责组合组件。拆开后乙方可以按需升级，也避免组件库和请求、主题、类型混成一个难维护的大包。

### Q4：组件库发布时为什么必须检查 `.d.ts`？

答：乙方前端使用 TypeScript 开发，如果 npm 包缺少声明文件，IDE 提示、类型校验和二次封装都会变差。本版本通过 dry-run 发现 `platform-ui` 初始 tarball 缺少声明文件，并调整构建顺序解决。

### Q5：为什么 request SDK 默认使用 `/api/**` 相对路径？

答：相对路径可以让不同环境通过 Gateway、Nginx 或运行时配置切换后端入口，避免前端代码写死 IP、域名或端口，适合测试、正式和容器化部署。

### Q6： npm 和 corepack pnpm 有什么区别？

答：npm 和 pnpm 都是 Node.js 的包管理工具，功能类似于 Java 中的 Maven。
Corepack 则是 Node 官方提供的包管理器版本管理工具，用于确保项目使用指定版本的 pnpm。
pnpm 采用全局仓库，不同项目中相同的依赖只存储一份，在`node_modules` 中通过软链接引用。这种机制使得 pnpm 在安装依赖时更快，并且节省磁盘空间。相比之下，npm 会在每个项目中安装一份完整的依赖树，导致安装速度较慢和磁盘占用较大。
实际开发中，新项目越来越倾向于使用 Corepack + pnpm，而老项目仍大量使用 npm。

### Q7：为什么 V01 要提前补齐后续 WMS、MES、AI、Task 组件？

答：项目采用甲方平台和多乙方独立开发模式。甲方组件库越早稳定，乙方越能通过 npm 包复用统一能力，减少后续业务项目中的重复封装和风格漂移。

### Q8：平台组件库是否应该封装所有 Element Plus 基础组件？

答：不应该。普通按钮、输入框、表格基础能力仍直接使用 Element Plus；甲方组件库只封装企业后台高频组合场景，例如权限按钮、标准页面、业务选择器、离线导入任务、状态流转、ChatBI 结果等。

### Q9：组件库如何验证新增组件没有漏导出？

答：组件文档站应从 `@smartwarehouse/platform-ui` 包入口导入组件，并在 `corepack pnpm build` 中构建文档站。如果入口漏导出，文档站会在打包阶段失败。

### Q10：为什么 WebSocket 客户端放在 platform-sdk，而不是直接写在业务页面？

答：实时排行、导入进度、预警推送等多个模块都会用 WebSocket。放在 SDK 可以统一 URL 规范、重连、心跳、消息结构和多环境处理，业务页面只关心具体消息内容。

### Q11：组件文档站为什么最终调整为“组件 / 场景模板”两入口？

答：企业组件库站点的核心任务是让开发者查组件、学 API、复制示例和复用组合模板。组件入口必须保持业务无关，按单组件维度组织；场景模板入口承载多个组件组合后的页面级复用结构，例如登录风控、查询表格、离线导入和 AI 工作台。当前 Playground 只是固定预设演示，不能在线修改代码并实时预览样式，因此不作为公开入口。

### Q12：为什么不能只保留一个大演示页？

答：大演示页适合验收整体效果，但不适合查 Props、Events、Slots，也不利于复制最小示例代码。乙方接入组件时需要精确文档、组件级 API 和可复用场景模板；真实 Playground 可以作为后续增强，但静态预设页不能替代这些基础文档。

### Q13：为什么组件详情页要从 `@smartwarehouse/platform-ui` 包入口导入组件？

答：这样能验证 npm 包入口是否正确导出组件。如果文档页从源码相对路径导入，可能掩盖发布包漏导出问题。

### Q14：VitePress 组件文档中 Element Plus 表格出现表头和第一行间距异常，如何排查？

答：先检查是否是 `.vp-doc table`、`tr`、`th`、`td` 的 Markdown 默认样式影响了 Element Plus 内部表格。修复时应只对 `.vp-doc .el-table` 做局部 reset，保留 Element Plus 自身列宽和滚动逻辑，再用浏览器检查表头与第一行间距、容器溢出和横向滚动。

### Q15：为什么文档 Demo 里的表格列宽要比业务页面更克制？

答：组件详情页通常有左侧导航和右侧目录，中间正文宽度小于真实业务页面。如果示例使用过宽列配置，组件本身可能没问题，但文档演示会溢出，影响乙方阅读和复制示例。示例应展示核心能力，同时保证在文档容器内可读。

### Q16：为什么 LoginForm 不能通过缩窄外层 Demo 容器来控制宽度？

答：企业组件库详情页的 Demo 外框本身是一套统一视觉规范。如果为了某个窄组件直接缩小外层容器，会导致同一文档站中“基础用法”宽度不一致。正确做法是保持外层 `.sw-doc-preview` 标准宽度，再用内部居中 wrapper 控制 LoginForm 自身宽度。

### Q17：为什么组件文档示例代码要统一写成 Vue + TypeScript？

答：本项目的甲方平台包和乙方前端都按 TypeScript 开发。组件文档示例如果只给 JavaScript，会让乙方复制后再补类型，容易漏掉事件入参、业务模型和枚举约束。统一使用 `<script setup lang="ts">` 可以让示例同时承担用法说明和类型契约示范。

### Q18：AI Workbench 这类复杂组件在文档站中为什么容易溢出？

答：AI 工作台常包含 SQL、JSON、Agent 步骤、MCP 工具调用和 ChatBI 表格，内部内容长度不可控；同时 VitePress 对 `.vp-doc pre/code` 有默认样式，可能覆盖组件自身的换行规则。因此既要在组件样式中设置宽度收缩和长文本换行，也要在文档主题里给对应场景补充更高优先级的覆盖。

### Q19：为什么组件总览和场景模板总览要复用同一个展示组件？

答：组件和场景模板只是目录数据不同，分组、卡片、状态、标签、入口链接等展示规则是一致的。如果复制两套页面代码，后续修改卡片样式、状态文案或响应式规则时容易漏改。抽出 `CatalogOverview.vue` 后，两个入口只维护各自元数据，展示逻辑统一演进。

### Q20：组件页和场景模板页的边界怎么划分？

答：单个可复用组件放在组件页，例如 `StatusTag`、`PlatformTable`、`LoginForm`、`ChatPanel`；两个及以上组件组合成的页面片段、流程区块或工作台放在场景模板页，例如 `LoginForm + JigsawCaptcha`、`SearchForm + PlatformTable`、`ImportTaskPanel + ImportErrorTable`。

### Q21：为什么 `WarehouseSelect`、`StatCard`、`ChatPanel` 这类组件不能继续指向组合详情页？

答：乙方查组件时需要看到该组件自己的 Props、Events、Slots、Types 和最小示例。如果多个组件共用一个组合页面，读者需要从场景里反向拆组件，API 边界会变模糊，后续修改组件参数时也容易漏改文档。正确做法是每个底层组件都有独立 `/component/<slug>`，组合页面只作为“关联场景模板”链接存在。

### Q22：单组件文档和场景模板如何避免重复维护？

答：总览层复用 `CatalogOverview.vue` 和 `componentCatalog.ts`；详情层分别用 `ComponentDetail.vue` + `componentDocs.ts` 管单组件 API，用 `ScenarioTemplateDetail.vue` + `scenarioTemplateDocs.ts` 管组合模板。Markdown 文件只保留 slug 包装，避免 45 个组件页面重复写同一套标题、Demo、API 表和注意事项结构。

### Q23：为什么删除当前 Playground，而不是继续保留？

答：当前 Playground 只能切换固定预设，和场景模板能力重复，不能在线修改代码并实时显示样式。企业组件库的公开入口应避免“看起来像调试工具但实际不能调试”的功能。删除静态 Playground 后，文档站更清晰；未来如果恢复，应基于 `@vue/repl`、import map、平台包 ESM 静态资源和沙箱预览实现真实实时调试。


## 5. 可继续深入方向

- 组件文档站点。
- 组件自动化测试。
- npm 包版本兼容策略。
- VitePress 文档站点拆包和 chunk 优化。
- 组件单元测试和可访问性测试。
- 组件库 changelog、release/snapshot 版本自动化。
- 真实 Playground：在线编辑 Vue + TypeScript 示例、实时预览、依赖 import map、iframe 沙箱、复制分享和安全隔离。

## 6. 版本复盘记录

```text
完成内容：完成 frontend-platform workspace、四个平台包、12 个平台组件、VitePress 文档站点、npm dry-run 发布检查和浏览器验证。
遇到问题：本机无全局 pnpm shim；platform-ui 初始发布包缺少 .d.ts；PermissionButton 权限状态运行时更新不刷新；VitePress SSR 输出 Element Plus provider 警告。
解决方式：根脚本统一使用 corepack pnpm；platform-ui 构建顺序改为先 Vite build 再 vue-tsc emitDeclarationOnly；platform-sdk 增加 permission change 订阅，PermissionButton 订阅后刷新；VitePress theme 注入 ID/ZIndex provider。
后续优化：V02 接入真实 sys 权限和字典接口；后续补充组件单元测试、自动化 UI 截图校验和组件版本 changelog。
```

```text
日期：2026-06-11
复盘类型：V01 组件库补强
完成内容：补齐门户登录、表单表格、业务选择器、WMS 导入、MES 物料需求、Task 看板、AI 工作台等后续版本高频组件，并补充 SDK mock 选项源、WebSocket 客户端、类型定义、组件导出和文档演示。
遇到问题：新增 WorkOrderSelect 后忘记在 platform-ui 入口导出，导致 VitePress 从构建产物导入失败；ImportErrorRow 强类型数组不能直接传给通用 PlatformTable。
解决方式：补充 WorkOrderSelect 导出并加入默认 install(app) 组件表；ImportErrorTable 内部通过 computed 转换为 Record<string, unknown>[]。
验证方式：corepack pnpm build:packages、corepack pnpm build、corepack pnpm publish:dry-run、浏览器打开 http://127.0.0.1:5173/ 检查关键分组和控制台 error。
后续优化：可以在 V02 或组件库后续改进中增加 Vitest / Vue Test Utils 单元测试、组件快照测试、文档站分包和更完整的可访问性检查。
```

```text
日期：2026-06-11
复盘类型：V01 组件文档与 Playground 体系补强
完成内容：将 apps/docs 从单一综合演示页升级为首页、组件总览、组件详情、Playground、业务场景样例四层文档体系；新增 componentCatalog 元数据；新增 PlatformLayout、PlatformTable、PlatformForm、LoginForm、业务选择器、离线导入、工单物料、运营看板、AI 工作台详情页。
架构经验：甲方组件库文档要服务多乙方协作，不能只证明组件能渲染，还要说明使用边界、参数契约、事件插槽、业务场景和版本验收方式。
遇到问题：内置浏览器访问 localhost 被 ERR_BLOCKED_BY_CLIENT 拦截；VitePress dev server 的 HTTP 内容不适合直接搜正文。
解决方式：使用 corepack pnpm build 验证 SSR 静态产物，再对 .vitepress/dist 下关键 HTML 做关键词检查；保留 HTTP 200 检查作为路由就绪验证。
验证方式：corepack pnpm build、corepack pnpm publish:dry-run、HTTP 200 检查、静态 HTML 关键词检查。
后续优化：组件详情页可以继续扩展为每个组件一页；Playground 可以引入更多可调 props、事件日志和示例代码实时切换。
```

```text
日期：2026-06-11
复盘类型：V01 企业组件库文档站两模块重构
完成内容：将 apps/docs 从首页、组件总览、业务样例、发布说明等多模块结构重构为“组件 + Playground”两模块；新增 /component/overview 和 /component/* 详情路由；重构 componentCatalog 企业组件元数据；将 Playground 改为版本工具栏、代码编辑区和预设预览区的分栏工作台。
架构经验：组件库文档站应服务跨项目复用，公开导航越接近组件库官网越容易被乙方使用；项目业务样例可以存在于验收文档或业务应用中，但不应污染组件库站点信息架构。
遇到问题：@vue/repl 真实运行模式需要浏览器端 import map 稳定加载本地 workspace 包，当前本地私有包场景存在兼容风险。
解决方式：采用可运行的预设 Playground 降级方案，保留代码编辑、版本栏、预设切换、预览和复制体验，同时确保 VitePress SSR 和静态构建稳定。
验证方式：corepack pnpm build:packages、corepack pnpm build、corepack pnpm publish:dry-run、路由 HTTP 检查、浏览器桌面/移动端检查、敏感信息扫描。
后续优化：如果平台包发布到可浏览器访问的 npm/CDN 或内部静态资源服务，可再升级为 @vue/repl 真运行模式。
```

```text
日期：2026-06-11
复盘类型：V01 组件文档站表格布局修复
完成内容：修复 VitePress Markdown 表格样式污染 Element Plus 表格导致的表头与第一行异常空白；修复 MaterialRequirementEditor 表格超出基础用法容器；调整 PlatformTable 文档示例列宽。
架构经验：企业组件库文档站不只是代码 API 文档，也要保证示例在真实文档布局中专业、稳定、可复制。文档站主题样式应局部隔离第三方组件内部 DOM，避免全局 Markdown 样式破坏组件库展示。
遇到问题：MaterialRequirementEditor 初步通过横向滚动避免外溢，但表头下方滚动条会被用户感知为空白行；PlatformTable 示例列宽过宽时状态列会被固定操作列遮挡。
解决方式：收紧业务表格列宽，取消表头/表体强制横向滚动；仅 reset `.vp-doc .el-table` 内部 table 样式；给 PlatformTable 文档示例设置更适合文档容器的列宽和 actions-width。
验证方式：浏览器验证 `/component/material-requirement-editor` 和 `/component/platform-table`；corepack pnpm build:packages；corepack pnpm build；corepack pnpm publish:dry-run；敏感信息扫描。
后续优化：可增加文档站视觉回归截图测试，重点覆盖表格、表单、弹窗、Playground 等容易受容器宽度影响的组件。
```

```text
日期：2026-06-12
复盘类型：V01 组件文档站展示一致性与 TypeScript 示例规范修复
完成内容：修复 LoginForm 基础用法外层方框宽度不统一问题；修复 AI Workbench 基础用法内容超出外部方框问题；将组件详情页和 Playground 示例代码统一为 Vue + TypeScript SFC 写法。
架构经验：企业组件库文档站的示例容器应保持统一，不因单个组件的天然尺寸而改变外层规范；复杂 AI/BI 组件需要同时处理组件内部样式和文档站主题样式；示例代码应直接体现企业前端的 TypeScript 契约。
遇到问题：LoginForm 原先通过窄外层 Demo 容器实现表单宽度，破坏统一视觉；AI Workbench 中 SQL、Agent、MCP 等长内容被 VitePress pre/code 样式影响后仍可能撑破容器；Playground 预设字符串里的闭合 script 标签如果不转义会影响外层 SFC 编译。
解决方式：外层保留标准 `.sw-doc-preview`，内部新增 `.sw-doc-preview__center` 控制窄组件；为 AI 工作台相关容器增加 `min-width: 0`、`max-width: 100%`、`overflow-wrap`、`pre-wrap`；示例标题统一为 `示例代码（Vue + TypeScript）`，代码块统一使用 `<script setup lang="ts">`，字符串预设中的闭合 script 写成 `<\/script>`。
验证方式：corepack pnpm build；corepack pnpm publish:dry-run；浏览器验证 `/component/login-form` 与 `/component/ai-workbench`；Node 脚本检查示例代码 TypeScript 标记；敏感信息扫描。
后续优化：增加文档站视觉回归脚本，至少覆盖 LoginForm、AI Workbench、PlatformTable、MaterialRequirementEditor 和 Playground。
```

```text
日期：2026-06-12
复盘类型：V01 企业组件库文档站三入口重构
完成内容：将组件文档站公开入口调整为“组件 / 场景模板 / Playground”；组件页改为业务无关的组件级目录，覆盖基础、布局、数据录入、数据展示、反馈与流程、高级组件；原大块功能组合展示改名为场景模板并迁移到 /scenario/overview；组件页和场景模板页复用 CatalogOverview.vue，目录数据集中在 componentCatalog.ts 中维护。
架构经验：企业组件库既需要“按组件查 API”的纯组件目录，也需要“按页面组合复用”的场景模板目录。二者信息架构要分开，展示实现要复用，才能同时满足乙方查组件和甲方沉淀最佳实践的诉求。
遇到问题：旧组件入口承担了多组件组合展示，导致用户希望查单组件时信息粒度偏大。
解决方式：拆分 componentCatalog 与 scenarioTemplateCatalog，VitePress nav/sidebar 增加 /scenario 路由，ComponentOverview 与 ScenarioTemplateOverview 共同复用 CatalogOverview。
验证方式：corepack pnpm --filter @smartwarehouse/component-docs build；完整构建、路由和浏览器验证继续写入 PROGRESS 与 milestone。
后续优化：为 overview 状态的单组件逐步补齐独立详情页，完善场景模板的可复制代码片段；如未来恢复 Playground，必须按真实在线编辑实时预览方案单独设计。
```

```text
日期：2026-06-12
复盘类型：V01 组件入口单组件详情边界重构
完成内容：将 /component/* 补强为严格单组件详情页，为 45 个组件补齐独立样式预览、Vue + TypeScript 示例、Props、Events、Slots、Types 和注意事项；将 business-selects、dashboard、ai-workbench 等多组件组合正文迁移到 /scenario/*；新增 ComponentDetail/componentDocs 与 ScenarioTemplateDetail/scenarioTemplateDocs 详情层复用结构。
架构经验：企业组件库的“组件”入口必须服务单组件检索和 API 查询；“场景模板”入口才服务页面级组合复用。两者可以共享总览风格，但详情数据模型要分开维护，否则组件 API 与组合最佳实践会互相污染。
遇到问题：旧 componentCatalog 中多个组件共用一个 docsPath，导致单组件目录点击后进入组合页面；同时 config 与 catalog 中已有中文乱码，需要恢复 UTF-8 元数据。
解决方式：重写 catalog，强制 componentCatalog 使用 /component/<slug>，scenarioTemplateCatalog 使用 /scenario/<slug>；旧组合组件路由保留迁移提示；所有单组件 Markdown 只做 slug 包装，详情内容由 ComponentDetail 统一渲染。
验证方式：corepack pnpm --filter @smartwarehouse/component-docs build；corepack pnpm build；corepack pnpm publish:dry-run；VitePress preview HTTP 检查核心组件、场景模板和 Playground 路由。
后续优化：增加 Playwright 或浏览器截图测试，覆盖组件详情页 API 表、复杂表格、AI/BI 长内容和移动端菜单。
```

```text
日期：2026-06-12
复盘类型：V01 删除预设式静态 Playground
完成内容：删除 /playground 公开路由、PlaygroundWorkbench.vue、ComponentPlayground.vue、playgroundPreset 元数据和 Playground 专属样式；文档站公开入口收敛为“组件 / 场景模板”。
架构经验：企业级组件库可以有 Playground，但必须是真正能在线编辑代码并实时预览样式的调试工具。固定预设演示与场景模板重复，独立成模块会降低文档站信息架构质量。
遇到问题：历史文档和 skill 中仍保留三入口结构与 Playground 预设要求，容易导致后续自动开发重新引入静态 Playground。
解决方式：新增决策 0008，将 0006 标记为 SUPERSEDED；同步更新 ROADMAP、DEVELOPMENT_RULE、PROGRESS、milestone、study、handle、skill 和根 README。
验证方式：corepack pnpm --filter @smartwarehouse/component-docs build；corepack pnpm build；corepack pnpm publish:dry-run；preview HTTP 检查组件与场景模板核心路由；确认 /playground 不再作为有效路由。
后续优化：如确有需要，单独规划真实 Playground 技术方案，并评估 @vue/repl、import map、平台包 ESM 产物、iframe 沙箱、依赖加载和安全隔离。
```

## 7. 源码中文注释补强学习记录

### 7.1 关键技术点

- 源码中文注释不是把 TypeScript 语法翻译成中文，而是解释组件职责、业务边界、设计原因、后续替换点和安全注意事项。
- 对组件库而言，最值得注释的位置是 props、emit、computed、数据加载、状态映射、复制/上传/导出、权限判断、WebSocket、AI/SQL/MCP 展示等关键位置。
- 通用 UI 组件要说明自己“不负责什么”：不直接请求业务接口、不做后端权限兜底、不执行 SQL、不调用 MCP 工具、不在前端裁剪最终数据权限。
- 选择器、字典、上传导入导出这类组件需要说明 mock 数据和真实接口的替换位置，避免后续乙方把 HTTP 细节散落在组件内部。
- AI/BI 相关组件尤其需要说明安全边界：前端可以展示 SQL、Agent 步骤和工具调用轨迹，但 SQL 白名单、数据权限、工具授权和审计必须由后端完成。

### 7.2 开发经验

- 轻量组件也需要注释。代码越短，越容易被误认为“看一眼就懂”，但后续接真实业务时最容易被塞入接口请求、权限判断和业务规则。
- 补注释前先用 `rg --files-without-match` 找缺口，再按组件类别分组处理，比凭感觉逐个打开文件更稳定。
- 好注释应该帮助后续开发者知道“这个逻辑为什么在这里，而不是在业务页或后端”。例如 `ExcelImport` 只抛出 File，WMS 上传任务创建和异步校验应由业务页面处理。
- 注释也要控制密度。模板结构、简单变量名和显而易见的赋值不需要逐行解释，否则会变成噪音。

### 7.3 面试问题

Q：为什么组件库源码需要写中文注释？

答：这个项目是个人实践和简历项目，注释不仅服务维护，也服务学习复盘。中文注释可以讲清组件职责、业务边界和架构取舍，例如为什么权限按钮只做前端展示控制但后端仍要校验，为什么 ChatBI 的 SQL 只能展示不能执行，为什么上传组件不直接调用 WMS 接口。这些内容比单纯说“封装了组件”更能体现工程思考。

Q：什么样的注释是低质量注释？

答：只重复语法的注释质量很低，例如“定义变量”“调用函数”“返回结果”。高质量注释应该解释业务含义、设计原因、风险点和后续扩展方式，例如“这里不直接请求接口，是为了让组件库与 WMS/MES/AI 服务解耦”。

Q：为什么前端组件不能负责最终权限和数据权限？

答：前端权限只能改善用户体验，例如隐藏按钮或过滤菜单，但不能作为安全边界。用户可以绕过前端直接请求接口，所以最终权限、数据权限和敏感操作校验必须由后端完成。组件注释中明确这一点，可以避免后续把安全责任错误地放到 UI 层。

### 7.4 复盘记录

```text
日期：2026-06-12
复盘类型：V01 frontend-platform 源码中文注释补强
完成内容：检查 frontend-platform 下 SDK、types、UI 组件、hooks 和 docs 源码注释覆盖情况，为关键组件、轻量组件、AI/BI 展示组件、选择器、上传导入导出、状态流程、文档站渲染器等补充中文注释。
架构经验：组件库注释应围绕“职责边界”写，而不是围绕语法写。通用 UI 组件应说明自己不处理业务接口、不做后端权限兜底、不执行 SQL、不直接调用 MCP 工具，只负责展示、交互和事件传递。
遇到问题：部分轻量组件逻辑很短，容易误以为不需要注释；但这些组件往往是后续业务页面大量复用的入口，如果不说明边界，后续接真实接口时容易把业务规则塞进组件库。
解决方式：先用 rg 找出缺少中文注释的 ts/vue 文件，再按布局、看板、流程、表单、选择器、上传、AI/BI、文档站入口分组补充注释，保证每类组件都有职责和边界说明。
验证方式：rg 注释覆盖检查；corepack pnpm build 完整构建。
后续优化：在 V02 之后的业务模块开发中，把“新增源码必须带中文职责说明和关键代码说明”纳入自动复盘检查。
```
