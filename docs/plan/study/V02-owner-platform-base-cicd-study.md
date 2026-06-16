# V02 学习总结：甲方前后端基座与 CI/CD 基线

## 1. 版本状态

```text
状态：DONE
完成日期：2026-06-13
```

## 2. 关键技术点

- Maven 根 POM 只聚合，`platform-parent` 才负责 Java 17、Spring Boot、测试插件和 deploy 仓库配置。
- `platform-bom` 负责统一平台公共包版本，业务服务继承 `platform-parent` 并导入 BOM，避免每个服务重复管理版本。
- gateway-service 使用 Spring Cloud Gateway 提供 `/api/sys/**` 真实路由，并预留 `/api/wms/**`、`/api/mes/**`、`/api/task/**`、`/api/ai/**`。
- JWT 使用 HMAC-SHA256 轻量实现，Claims 包含 jti、userId、username、roles、permissions、warehouseIds、iat、exp。
- 登录风控包括失败计数、验证码票据、验证码通过 token、账号锁定、IP 锁定和风控记录。
- `portal-shell` 与 `sys-web` 通过 `@smartwarehouse/*` workspace 包名使用平台组件、SDK、主题和类型，不使用源码相对路径。
- LoginForm/JigsawCaptcha 从纯本地模拟增强为支持后端 verifier 的通用组件。
- Jenkinsfile 覆盖 Java 测试、前端构建、Docker 镜像构建、本地 Docker Compose 发布和健康检查。
- 阿里弹性容器发布基线重点是镜像来源、Secret 注入、健康检查、资源规格和回滚。

## 3. 开发经验

- 平台基座必须前后端一起交付，只写登录接口但没有 portal-shell/sys-web，无法验证 Token、菜单、模块入口和按钮权限。
- V02 商业基座必须用 Docker MySQL/Redis 跑通真实数据闭环。H2、Mock 或内存 fallback 只能作为快速单测辅助，不能作为版本验收结论。
- 平台组件如果在业务开发中暴露通用缺口，应先判断是否跨项目复用；LoginForm/JigsawCaptcha 的后端 verifier 属于通用登录风控能力，因此应改平台组件并同步文档。
- 私库发布要和开发验证分开：AI 可以构建和 dry-run，但真实 npm snapshot/release 发布、版本号设置必须由用户手动执行。
- Docker 镜像构建不仅验证 Dockerfile，也依赖基础镜像网络；如果 Docker Hub 不通，需要记录阻塞原因并保留 compose config、Jar、前端构建等替代验证证据。

## 4. 面试点

### Q1：为什么基座版本就接入 Jenkins 和正式环境？

答：这样后续每个模块都能沿用统一发布链路，避免最后集中补部署导致环境问题堆积。

### Q2：登录风控为什么需要 Redis？

答：登录失败次数和验证码状态需要在多实例之间共享，Redis 支持过期和原子计数，适合网关和 sys 多实例部署。

### Q3：为什么 portal-shell 和 sys-web 开发期仍使用 `workspace:*`，而不是相对路径？

答：`workspace:*` 使用的是包名契约，和私库制品的导入方式一致，既能联调本地源码，又能避免业务代码依赖 `../../packages/**` 内部路径，后续切换阿里云效 npm 制品时改 package.json 即可。

### Q4：为什么 V02 不把 Token 黑名单和登录失败次数放在本地内存作为最终方案？

答：内存方案只能验证单实例 MVP。K8s 或阿里弹性容器多实例下，请求可能落到不同实例，必须使用 Redis 等共享存储保存黑名单、失败次数、验证码挑战和锁定状态。

### Q5：Gateway 鉴权和 sys-service 鉴权边界如何划分？

答：Gateway 负责入口级 JWT 校验、公开路径放行、TraceId、限流和路由透传；sys-service 负责登录、刷新、退出、当前用户、风控状态和黑名单写入。正式多实例下黑名单应通过 Redis 共享，让 gateway 和 sys-service 读取同一状态。

### Q6：为什么 Jenkins 从 V02 就接入？

答：V02 是平台基座，后续 WMS/MES/AI/task 都会复用同一构建、测试、镜像和健康检查链路。越早接入，越早发现目录结构、凭证注入、镜像构建和部署路径问题。

## 5. 可继续深入方向

- 为 sys-service 引入 Flyway/Liquibase，避免后续手工维护初始化 SQL 和存量库升级脚本。
- 将 gateway 基础内存限流升级为 Sentinel Gateway 或 Redis 限流。
- Jenkins Pipeline 参数化，按变更目录选择构建 platform/gateway/sys/frontend-platform。
- 接入 Sentinel Gateway 或 Redis 限流，替换 V02 内存限流。
- 阿里弹性容器正式发布联调，包括镜像仓库、Secret、环境变量、健康检查和回滚演练。

## 6. 版本复盘记录

```text
完成内容：
- 完成 platform/gateway/sys 后端基座。
- 完成 portal-shell 和 sys-web 前端基座。
- 完成 Jenkins、本地 compose、Dockerfile、Nacos 模板和阿里弹性容器正式发布检查清单。
- 完成登录、刷新、退出、菜单、模块入口、系统管理页面和登录风控闭环。

遇到问题：
- V01 的 JigsawCaptcha 只支持本地模拟 token，无法和 sys-service 后端验证码票据对齐。
- Docker 镜像构建时 Docker Hub 基础镜像拉取超时。
- 本地演示密码默认值不符合敏感配置管理要求。

解决方式：
- 将 LoginForm/JigsawCaptcha 增强为支持 `captchaVerifier` 和 `target` 的通用组件，并同步更新组件文档。
- 记录 Docker Hub 网络阻塞原因，并补充 `docker compose config`、Maven、前端构建和服务启动联调作为当前验证证据。
- 移除 sys-service 演示密码默认值，改为 `SMARTWAREHOUSE_DEMO_PASSWORD` 环境变量或测试属性注入。

后续优化：
- V03 前评估是否先引入 MySQL/Flyway 和 Redis，减少后续 WMS 数据权限切换成本。
- 将 gateway 黑名单校验改为 Redis 共享状态。
- 为 portal-shell/sys-web 增加 E2E 或 Playwright 页面验收。
```

## 8. 2026-06-14 默认配置与自动测试对齐复盘

关键技术点：
- 本地 `application.yml` 默认值必须和 `deploy/local/docker-compose.yml` 暴露端口一致，否则 AI 测试时手动注入环境变量能通过，用户在 IDEA 直接启动却会失败。
- `sys-service` 当前默认连接 Docker MySQL `127.0.0.1:13306` 和 Docker Redis `127.0.0.1:16381`；`gateway` 当前默认连接 Docker Redis `127.0.0.1:16381`。
- Jenkins 的 Java Test 阶段前必须先启动 MySQL、Redis、RabbitMQ 等本地中间件，否则真实中间件验收测试会在 CI 中失败。
- 自动测试要覆盖“用户能直接启动并测试”的路径，因此新增 `LocalDockerMiddlewareAcceptanceTest`，使用默认配置访问真实 Docker MySQL/Redis，并验证登录、模块查询、岗位增改删。

开发经验：
- 不要把“我在 Shell 里设置了一堆环境变量后测试通过”写成“项目默认启动可用”。如果需要环境变量，就必须写进 README、handle、Jenkinsfile 或 `.env.example`。
- 历史 Redis 风控状态会影响登录测试，真实中间件验收前应只清理测试账号相关 Key，不要清空 Redis 全库或删除数据卷。
- 可执行 jar 验证前必须重新打包；`mvn test` 不会自动刷新旧 jar 中的 `application.yml`。

面试问题：

Q：为什么自动测试要连接真实 Docker MySQL/Redis，而不是只跑 H2？

A：H2 能快速验证 Java 逻辑，但无法证明本地启动配置、MySQL 字符集、SQL 方言、Redis Key、网关转发和用户页面联调都可用。真实中间件验收能把“开发者能跑”和“用户能测”统一起来。

Q：为什么本地默认端口没有使用 MySQL 3306 和 Redis 6379？

A：开发机上经常已有其他项目占用默认端口。当前项目使用 `13306/16381/5673` 作为 SmartWarehouse-AI 专属端口，避免误连其他项目容器，并让配置来源更清晰。


## 7. 2026-06-14 商业化补齐复盘

关键技术点：
- 真实商业基座不能只靠内存仓库证明功能，至少要用 Docker MySQL 跑通表结构、种子数据、查询、写操作和日志落库。
- MySQL 初始化脚本要显式 SET NAMES utf8mb4，否则 Docker entrypoint 或命令行客户端可能以 latin1 写入中文，浏览器会出现模块名乱码。
- H2 测试通过不代表 MySQL 一定通过。本次 MySQL 8 暴露了 distinct 查询字段与 order by 字段不一致的问题，需要真实数据库联调兜底。
- Token 黑名单、登录失败次数、验证码挑战、验证码通过 token 和账号/IP 锁定属于多实例共享状态，必须优先放 Redis。
- gateway 鉴权只能保证入口层安全，sys-service 仍要有服务级鉴权过滤器，防止绕过网关访问管理接口。
- 操作日志适合用 AOP 统一处理，Controller 只声明 @OperationLog，日志切面从 request attribute 中读取登录用户和 traceId。

开发经验：
- 实现记录必须和真实页面、真实接口、真实中间件结果一致，不能把“计划实现”或“MVP 占位”写成“已完成”。
- 页面验收要至少覆盖一次浏览器登录和关键菜单点击，否则后端接口完成也可能无法证明用户能用。
- 敏感信息扫描不能只看 token，具体私库地址、内部仓库 ID、云厂商地址也应尽量模板化。

面试问题：

Q：为什么 sys-service 已经在 gateway 后面，还要自己做鉴权？

A：网关是入口控制，但在内网、测试环境或服务误暴露时可能绕过网关。服务级鉴权能保证 /api/sys/** 的最终安全边界，尤其是用户、角色、菜单这类管理接口。

Q：为什么 H2 测试通过后还要用 MySQL 验证？

A：H2 适合快速单测，但 SQL 方言、排序规则、字符集、索引行为和 MySQL 8 并不完全一致。真实数据库联调能发现 distinct + order by、字符集写入等问题。

Q：登录风控为什么不适合放本地内存？

A：K8s 或弹性容器多实例下，请求可能落到不同实例。本地内存会导致失败次数、验证码状态、黑名单不一致，应使用 Redis 这类共享存储并设置过期时间。

Q：为什么要把具体 npm registry 地址从仓库中移除？

A：即使没有 token，具体私库地址也可能暴露组织内部制品库信息。仓库中保留占位符，真实地址通过本地 .npmrc、Jenkins Credentials 或环境变量注入，更符合商业项目安全边界。

## 9. 2026-06-15 商业化架构优化复盘

关键技术点：
- Nacos Discovery 让 gateway 通过服务名 `lb://sys-service` 访问后端，后续 sys-service 多实例时不需要在网关配置里写死实例地址。
- 本地开发要考虑端口冲突。SmartWarehouse-AI 使用 Nacos 宿主机 `18848/19848`，容器内部仍使用 `nacos:8848/9848`，兼顾隔离和容器网络约定。
- 门户单点集成不能把 Token 放进 URL，也不能把子项目 dev server 当成总门户集成入口。V02 最新方案为 `portal-shell` 在 `http://localhost:5174/` 内按 `/sys/**`、`/wms/**`、`/mes/**`、`/ai/**` 维护统一路由，并通过 Module Federation remoteEntry 运行时加载各子应用；`5175/5176/5177/5178` 只用于本地独立调试或 preview 验证。
- 菜单权限不能只靠前端隐藏。`/api/sys/menus/tree` 和 `/api/sys/frontend-modules/enabled` 必须按当前登录用户过滤，前端只展示后端授权结果。
- 修改密码属于认证闭环的一部分，后端必须校验旧密码、Token 状态、账号状态和确认密码，不能只做前端表单。
- 后端拆分 Controller 时保持 URL 契约不变，可以在不影响前端调用的前提下改善代码可维护性。
- 前端拆分 views 后，`App.vue` 只负责应用壳层和状态编排，业务页面由独立文件维护，更符合多开发者协作。

开发经验：
- “能打开模块”不等于“集成完成”。商业门户要验证当前页打开、登录态同步、刷新模块、返回门户、个人菜单和二次登录消除。
- Nacos 接入必须同时验证本地直启和 Docker Compose 两种场景。本地直启用 `127.0.0.1:18848`，容器内用 `nacos:8848`。
- 浏览器验收不能只看登录成功，还要看模块权限、页面跳转 URL、目标应用是否直接恢复登录态、子页面是否显示真实业务表格、控制台是否有关键错误。
- 模块化拆分要保护接口契约，拆 Controller 或拆 View 时不能让已有 URL、按钮权限和菜单编码漂移。

面试问题：

Q：为什么 gateway 要通过 Nacos 的 `lb://sys-service` 路由，而不是固定写 `http://127.0.0.1:9201`？

A：固定地址只能适配单实例本地开发，多实例、容器部署或滚动发布时会失效。`lb://sys-service` 通过服务发现获得实例列表，后续扩容 sys-service 时网关无需修改路由配置。

Q：门户和子应用同步 Token 为什么不用 URL 参数？

A：URL 会进入浏览器历史、网关日志、Nginx 日志和错误上报，容易泄露 Token。V02 最新门户集成不再跨端口跳转，`portal-shell` 在 `5174` 内直接承载系统管理路由；独立调试才使用 `sys-web` 自身 dev server。

Q：为什么 sys-web 还保留独立 dev server，却不作为门户入口？

A：独立 dev server 方便乙方或模块团队单独开发调试；门户入口面向最终用户，应保持一个域名、一个端口和一套路由。两者通过 Module Federation remoteEntry 契约解耦，既保留独立开发和独立发布，又避免用户在总控制台内跨端口跳转和重复登录。

Q：为什么菜单和前端模块权限必须在后端过滤？

A：前端隐藏只能改善界面体验，不能构成安全边界。如果接口仍返回全部模块，低权限账号可以通过调试工具或缓存看到无权限入口。后端按用户角色菜单授权过滤后，`wms_manager` 这类账号只能拿到 `wms` 模块，前端自然只展示授权模块。

Q：为什么 `wms_manager` 可以通过 sys-service 登录门户，但不能访问 sys 管理接口？

A：sys-service 在 V02 中承担统一认证中心职责，登录成功只代表身份有效。是否能访问系统管理后台还要看模块权限。`wms_manager` 没有 `sys:*` 权限，因此可以登录门户、获取自己的菜单和模块，但访问 `/api/sys/users` 等管理接口必须返回 `FORBIDDEN`。

Q：为什么不把 sys 的用户、角色、菜单、字典都写在一个 Controller 里？

A：MVP 早期可以快速验证，但商业项目中不同模块的权限、日志、参数校验、事务和维护人员都不同。按模块拆分 Controller/Service/Repository 能降低改动影响范围，也方便后续多人协作和测试定位。

Q：为什么 sys-web 不建议把所有页面写在 App.vue？

A：`App.vue` 应该承担应用壳层职责。如果把所有表格、弹窗、接口逻辑都放进去，后续新增字段、权限、页面状态时会互相影响，难以复用、测试和排查。拆到 views 和 api 后，页面边界更清楚。

可继续深入方向：
- 引入 Spring Cloud Gateway + Sentinel Gateway 的真实限流规则，并把规则配置外置到 Nacos。
- 为 portal-shell 和 sys-web 增加 Playwright E2E，自动验证模块权限、正常页面跳转、登录态恢复、个人信息和修改密码弹窗。
- 将 sys-service 继续按模块拆分 Service/Repository 层，避免后续业务复杂后仓储类过大。
- 当前已经引入 Module Federation，用于解决多乙方独立发布问题；后续不再按 embedded 导出扩展乙方模块，也不保留 `@smartwarehouse/*-web/embedded` 作为门户集成契约，但仍保留“门户统一路由、统一登录、模块级降级”的体验边界。

## 8. 微前端架构补充：vite-plugin-federation

### 8.1 关键技术点

- `portal-shell` 是 host，负责统一登录、菜单、模块注册读取、运行时加载和降级页。
- `sys-web`、`wms-web`、`mes-web`、`ai-web` 是 remote，独立构建并暴露 `./RemoteApp`。
- `sys_frontend_module` 是前端模块注册中心，核心字段为 `remote_name`、`remote_entry`、`exposed_module`。
- host 通过 `virtual:__federation__` 的 `setRemote/getRemote/unwrapDefault` 在运行时加载 remote，不再构建期导入乙方应用。
- Vite Federation 共享模块会生成 top-level await，host 和 remote 的 build target 需要使用 `esnext`。
- remote 的本地集成验证要以构建产物为准。因为 Vite `base` 为 `/apps/wms/` 时，preview 下 remoteEntry 是 `/apps/wms/assets/remoteEntry.js`。
- remote 加载失败不能让门户白屏，应提供模块级降级页、错误信息、重试按钮和超时保护。

### 8.2 开发经验

- 微前端不是为了“看起来更高级”，而是解决多乙方独立发布的问题。只有当乙方发版不需要重建门户时，架构收益才成立。
- 统一门户路由和 Module Federation 可以同时存在：URL 仍是 `/wms`、`/mes`、`/ai`，内容由 remoteEntry 运行时加载。
- 共享包要显式导出 `./package.json`，否则构建工具读取包版本时可能被 `exports` 限制拦住。
- 模块注册字段要落库，并且历史本地数据库要考虑兼容迁移，否则自动测试通过后用户手动启动仍可能失败。
- 不能只测成功路径。停止某个 remote 后验证降级页，是微前端门户稳定性的核心验收项。

### 8.3 面试问题

Q：为什么从 embedded 方案改为 Module Federation？

A：embedded 方案会让 `portal-shell` 在构建期依赖子应用。多乙方协作时，乙方每次发版都要甲方重建门户，发布边界不清。Module Federation 可以让门户运行时加载 remoteEntry，乙方只更新自己的制品和模块注册信息。

Q：Module Federation 下如何保证统一登录体验？

A：登录仍由 `portal-shell` 和 gateway/sys-service 统一处理。用户访问路径保持在门户域名下，例如 `/wms`、`/mes`、`/ai`。remote 只负责渲染业务页面，请求继续走 `/api/**` 和平台 SDK，不在 URL 中传 Token。

Q：remote 加载失败怎么办？

A：host 不能白屏，也不能影响其他模块。`portal-shell` 对每个模块单独加载，失败或超时后显示模块级降级页，提供重试和返回门户能力。其他 remote 已加载或可访问的模块继续正常工作。

Q：为什么本地 remoteEntry 是 `/apps/wms/assets/remoteEntry.js` 而不是 `/assets/remoteEntry.js`？

A：remote 的 Vite `base` 是 `/apps/wms/`，构建产物通过 preview 或静态服务发布时会带上 base 前缀。模块注册必须写真实发布后的访问路径，否则开发和正式部署会出现路径不一致。

### 8.4 可继续深入方向

- 为 remoteEntry 增加版本号、灰度标识、启停状态和健康检查。
- 将 `sys_frontend_module` 的模块注册变更纳入审计日志和发布审批。
- 在 Jenkins 中增加 remoteEntry HTTP 检查、门户 E2E 和 remote 失败降级自动化测试。
- 正式环境使用 Nginx 或对象存储发布 remote 静态资源，阿里弹性容器只承载需要运行时服务的应用。

## 10. 2026-06-15 门户工作台与 hosted sys 布局改造复盘

关键技术点：
- `portal-shell` 必须收口为唯一登录后后台壳层。只要用户已经在门户登录成功，后续进入 `sys-web`、`wms-web`、`mes-web`、`ai-web` 都不应该再切回 remote 自己的登录壳层。
- `sys-web` 需要同时支持两种模式：`standalone` 负责独立开发与独立调试，`hosted` 负责被 `portal-shell` 托管时只渲染内容区。两种模式共享同一套系统管理页面映射，但不能共享同一套壳层职责。
- “host 负责壳层，remote 负责内容区”必须落实到代码结构，而不是只靠运行时判断隐藏几个按钮。只要 hosted 模式还渲染自己的登录页或 `PlatformLayout`，登录页闪现和导航冲突就一定会反复出现。
- 工作台数据天然属于平台基座，不属于任何单个 remote。`profile`、`notices`、`commonModules`、`recentModules`、`loginRecords` 由 `sys-service` 聚合返回，host 只负责展示和跳转。
- 常用模块与最近访问不需要额外建收藏表，本轮通过 `sys_portal_access_log` 自动推导即可；同时要注意统计维度只记录“模块切换”，不能被 sys 内部菜单切换污染。
- `PlatformLayout` 必须从“普通后台布局”升级为“可承载门户工作台与统一壳层”的通用容器，因此 `showAside`、`showWorkbenchButton`、`showModuleDrawerTrigger`、`moduleEntries`、`activeModuleCode` 这类能力应沉淀到组件库，而不是散落在 portal-shell 页面内部。

开发经验：
- 统一后台布局问题，如果只在应用层打补丁，通常会越修越碎。真正稳定的做法是先把壳层能力下沉到组件库，再让 host 和 standalone 子应用按场景选择启用哪些入口。
- “独立调试可用”不等于“门户托管可用”。`sys-web` 过去的实现能独立登录，但放进 host 后仍会闪登录页，说明模式边界没有拆干净。
- host 专属能力必须 fail-safe。standalone 的 `sys-web`、`wms-web`、`mes-web`、`ai-web` 如果没有接入门户，就应该默认隐藏工作台按钮和模块抽屉，而不是展示后点击报错。
- 工作台接口开放给所有已登录用户，并不等于放松系统管理权限。要同时验证 `wms_manager` 能访问 `/api/sys/portal/workbench`，又不能访问 `/api/sys/users`，这两条边界缺一不可。
- 文档和组件模板必须跟着真实实现一起升级，否则后续 V03/V04/V05 接手的人很容易按照旧的 `standard-layout` 或旧的 sys embedded 心智继续扩散错误模式。

面试问题：

Q：为什么门户工作台数据不放在 portal-shell 自己的前端 mock 或本地缓存里？

A：工作台里的个人信息、最近登录、消息、常用模块和最近访问都依赖后端认证、访问日志和授权模块结果，属于平台服务端视角的数据。放前端只能做展示缓存，不能成为事实来源。

Q：为什么 hosted sys 模式要彻底移除登录页、自带布局和 tabs，而不是渲染后再隐藏？

A：因为“先渲染再隐藏”会导致闪屏、生命周期副作用、重复鉴权和状态竞争。真正可靠的 hosted 模式应该从组件边界上只输出内容区，让 host 完整掌握布局与导航。

Q：为什么工作台访问记录只按模块切换记录，不记录模块内部页面？

A：本轮目标是生成常用模块和最近访问模块，而不是做页面级行为分析。如果把 sys 内部菜单切换都写入日志，会让“常用模块”退化成“sys 模块内哪个页面点得多”，失去门户工作台聚合入口的意义。

Q：为什么 `PlatformLayout` 这种组件要承担工作台按钮和模块抽屉，不把它们写死在 portal-shell？

A：因为统一壳层是平台层能力，不只是 portal-shell 当前一个页面的临时需求。把这些能力沉淀进组件库后，standalone `sys-web`、未来需要统一后台壳层的模块，以及组件文档模板都能复用同一套交互边界。

Q：为什么这轮只完整改造 `sys-web`，不顺手把 `wms-web`、`mes-web`、`ai-web` 都改成新的 standalone 壳层？

A：因为本轮核心目标是解决 portal -> sys 的登录页闪现、导航返回和统一工作台问题。`wms/mes/ai` 当前作为内容区 remote 已经满足门户托管，需要控制改造范围，避免把 V02 收尾扩成 V03/V04/V05 的新增需求。
