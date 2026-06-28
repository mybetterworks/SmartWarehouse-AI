# V02 手搓步骤：甲方前后端基座与 CI/CD 基线

## 1. 环境准备

```text
JDK 17
Maven
Node v22.22.3
Docker Desktop
Jenkins
阿里弹性容器
MySQL / Redis / Nacos Docker 容器
```

## 2. 命令步骤

```powershell
set MYSQL_ROOT_PASSWORD=<DB_PASSWORD>
set SMARTWAREHOUSE_JWT_SECRET=<JWT_SECRET>
set SMARTWAREHOUSE_DEMO_PASSWORD=<DEMO_PASSWORD>
docker compose -f deploy/local/docker-compose.yml config
mvn test
mvn package -DskipTests
cd frontend-platform
corepack pnpm install
corepack pnpm build
```

## 3. 关键代码位置

```text
pom.xml
platform/pom.xml
platform/platform-parent/pom.xml
platform/platform-bom/pom.xml
platform/platform-common-core
platform/platform-common-web
platform/platform-common-data
platform/platform-common-security-lite
platform/platform-common-redis
platform/platform-common-mq
platform/platform-common-log
platform/platform-common-id
gateway/gateway-service
sys/sys-api
sys/sys-service
frontend-platform/apps/portal-shell
frontend-platform/apps/sys-web
deploy/jenkins/Jenkinsfile
deploy/local/docker-compose.yml
deploy/mysql/init-sys-db.sql
deploy/aliyun-eci/formal-release-checklist.md
```

## 4. 核心代码片段

```java
// Gateway JWT 鉴权过滤器
// 文件：gateway/gateway-service/src/main/java/com/smartwarehouse/gateway/filter/JwtAuthGlobalFilter.java
// 核心逻辑：
// 1. 放行 /api/sys/auth/login、refresh、captcha、risk-state 和 /actuator/health。
// 2. 其他请求必须从 Authorization 或 X-Access-Token 读取 Access Token。
// 3. 解析 JWT 后把 X-User-Id、X-Username、X-Roles、X-Warehouse-Ids 透传给下游服务。
```

```java
// sys-service 登录风控
// 文件：sys/sys-service/src/main/java/com/smartwarehouse/sys/risk/LoginRiskService.java
// 核心逻辑：
// 1. 同一账号失败 3 次后 captchaRequired=true。
// 2. 同一账号失败 5 次后 lockedUntil=now+10分钟。
// 3. 拼图验证码挑战和通过 token 先用内存 Map 模拟 Redis Key，后续替换 Redis。
```

```ts
// portal-shell 登录和菜单加载
// 文件：frontend-platform/apps/portal-shell/src/App.vue
// 核心逻辑：
// 1. LoginForm 提交账号密码。
// 2. 如果后端返回 CAPTCHA_REQUIRED，则加载 /api/sys/auth/captcha/jigsaw。
// 3. JigsawCaptcha 调用 captchaVerifier，把 x 传给 /api/sys/auth/captcha/verify。
// 4. 登录成功后加载 /auth/me、/menus/tree、/frontend-modules/enabled。
```

```groovy
// Jenkins 测试环境流水线
// 文件：deploy/jenkins/Jenkinsfile
// 核心阶段：
// Java Test -> Frontend Install -> Frontend Build -> Docker Build -> Local Test Deploy -> Health Check
```

## 5. 验证命令

```powershell
mvn test -q
mvn package -DskipTests -q
cd frontend-platform
corepack pnpm install
corepack pnpm build
cd ..

# 启动验证时必须显式注入本地演示密码和 JWT Secret
$env:SMARTWAREHOUSE_JWT_SECRET='local-dev-secret-for-v02-validation-32chars'
$env:SMARTWAREHOUSE_DEMO_PASSWORD='<DEMO_PASSWORD>'
java -jar sys/sys-service/target/sys-service-*.jar
java -jar gateway/gateway-service/target/gateway-service-*.jar

# 配置检查
$env:MYSQL_ROOT_PASSWORD='<DB_PASSWORD>'
docker compose -f deploy/local/docker-compose.yml config
```

## 6. 常见错误

1. 只实现后端登录，没有 portal-shell 和 sys-web 页面。
2. 登录失败次数放本地内存。
3. Jenkins 凭证写入仓库。
4. 阿里弹性容器正式环境配置没有健康检查。
5. portal-shell/sys-web 为了联调方便从 `../../packages/**` 导入组件源码，导致后续无法切换 npm 私库制品。
6. AI 自动执行 `pnpm publish` 或 `npm publish` 推送 snapshot/release，这是禁止的；真实发布必须用户手动设置版本号并发布。
7. 将本地演示密码、JWT Secret、Docker Hub 凭证、阿里云密钥写进 application.yml、Jenkinsfile 或 Dockerfile。
8. Docker Hub 无法拉取基础镜像时误判为 Dockerfile 错误；应先检查网络、镜像加速器或基础镜像缓存。

## 7. 手动还原步骤

1. 创建根 `pom.xml`，只聚合 `platform`、`gateway`、`sys`。
2. 创建 `platform/platform-parent` 和 `platform/platform-bom`。
3. 创建 `platform-common-*` 公共包，先实现统一响应、分页、异常、TraceId、JWT、数据权限模型、Redis Key、MQ 事件、操作日志注解和 ID 生成器。
4. 创建 `sys/sys-api`，沉淀认证和系统管理 DTO。
5. 创建 `sys/sys-service`，实现 JDBC 仓储、认证服务、风控服务、Token 黑名单、AuthController，并按用户、角色、菜单、组织岗位、字典、前端模块、审计日志和风控记录拆分 Controller。
6. 创建 `gateway/gateway-service`，实现固定路由、TraceId、CORS、JWT 鉴权和基础限流。
7. 创建 `frontend-platform/apps/portal-shell`，使用 LoginForm、PlatformLayout、PlatformPage 和 platform-sdk 完成登录门户。
8. 创建 `frontend-platform/apps/sys-web`，使用 PlatformLayout、PlatformPage、PlatformTable、StatusTag 完成系统管理页。
9. 增强 LoginForm/JigsawCaptcha，使其支持后端验证码 verifier，并更新组件文档。
10. 更新 `frontend-platform/package.json`，让 `corepack pnpm build` 同时构建平台包、portal-shell、sys-web 和 docs。
11. 创建 `deploy/jenkins/Jenkinsfile`、Dockerfile、docker-compose、SQL 初始化脚本、Nacos 模板和阿里弹性容器发布检查清单。
12. 执行 Maven 测试、前端构建、服务启动联调、compose config、依赖规则扫描和敏感信息扫描。

## 8. 改进记录

```text
日期：2026-06-13
改进内容：
- 补充 V02 甲方前后端基座完整手搓步骤。
- 明确 npm 私库真实发布禁止由 AI 自动执行。
- 增加 LoginForm/JigsawCaptcha 后端验证码联调说明。
- 增加 Docker Hub 基础镜像拉取失败的排查说明。
原因：
- V02 已完成真实代码落地，需要 handle 能支撑手动还原。
验证结果：
- `mvn test -q` 通过。
- `mvn package -DskipTests -q` 通过。
- `corepack pnpm build` 通过。
- gateway/sys 启动联调通过。
- `docker compose -f deploy/local/docker-compose.yml config` 通过。
```


## 9. 2026-06-14 商业化补齐手搓步骤

### 9.1 启动 Docker 中间件

~~~powershell
docker compose -f deploy/local/docker-compose.yml up -d mysql redis rabbitmq nacos
~~~

当前 `deploy/local/docker-compose.yml` 已内置本地开发默认值：MySQL `13306`、Redis `16381`、RabbitMQ `5673`、RabbitMQ Management `15673`、Nacos `18848`。手动复现时不需要再先设置端口环境变量。

### 9.2 修复并验证 MySQL 初始化数据

~~~powershell
# 初始化脚本顶部必须包含 SET NAMES utf8mb4，避免中文种子数据乱码。
cmd.exe /c "docker exec -i smartwarehouse-mysql mysql --default-character-set=utf8mb4 -uroot -p<DB_PASSWORD> < deploy\mysql\init-sys-db.sql"

docker exec smartwarehouse-mysql mysql --default-character-set=utf8mb4 -usmart_sys -p<DB_PASSWORD> smart_sys -e "select username,nickname,status from sys_user; select module_code,module_name,status from sys_frontend_module;"
~~~

### 9.3 后端测试与打包

~~~powershell
docker compose -f deploy/local/docker-compose.yml up -d mysql redis rabbitmq nacos
mvn -q -pl sys/sys-service,gateway/gateway-service -am test package
~~~

`mvn test` 会同时执行 H2 快速测试和 `LocalDockerMiddlewareAcceptanceTest`。后者使用默认配置连接真实 Docker MySQL/Redis，验证登录、模块查询和岗位增改删，确保自动测试与人工启动配置一致。

### 9.4 本地启动 sys-service 与 gateway

~~~powershell
java -jar sys/sys-service/target/sys-service-*.jar

java -jar gateway/gateway-service/target/gateway-service-*.jar
~~~

`sys-service` 默认连接 `127.0.0.1:13306/smart_sys`、`127.0.0.1:16381` 和 Nacos `127.0.0.1:18848`；`gateway` 默认连接 `127.0.0.1:16381` 和 Nacos `127.0.0.1:18848`，并通过 `lb://sys-service` 路由到 sys-service。除非你主动修改了 Docker 端口，否则不要再额外设置这些环境变量。

### 9.5 接口验收要点

必须验收：
- 未登录访问 /api/sys/users 返回 401。
- 使用 admin / 123456 登录成功返回 Access Token / Refresh Token。
- /api/sys/auth/me 返回当前用户。
- /api/sys/menus/tree 返回菜单树。
- 用户、角色、部门、岗位、字典、前端模块接口均可查询。
- 任意临时岗位可新增、修改、删除，并产生操作日志。
- 退出登录后旧 Token 访问受保护接口返回 401。
- 临时用户名连续失败 3 次后，risk-state 返回 captchaRequired=true。

### 9.6 前端构建与页面验收

~~~powershell
cd frontend-platform
corepack pnpm build:packages
corepack pnpm --filter @smartwarehouse/portal-shell --filter @smartwarehouse/sys-web build
corepack pnpm --filter @smartwarehouse/portal-shell dev
corepack pnpm --filter @smartwarehouse/sys-web dev
~~~

浏览器验收：
- 打开 http://localhost:5174/，使用 admin / 123456 登录。
- 门户应显示系统管理、仓储管理、生产执行、运营看板、AI 助手。
- sys-web 独立调试时可打开 http://localhost:5175/apps/sys/，使用 admin / 123456 登录。
- 门户集成验收以后续 `http://localhost:5174/sys/**` 为准，5175 只作为独立调试入口。

### 9.7 Docker 构建检查

~~~powershell
$env:MYSQL_ROOT_PASSWORD='<DB_PASSWORD>'
$env:MYSQL_APP_USER='smart_sys'
$env:MYSQL_APP_PASSWORD='<DB_PASSWORD>'
$env:SMARTWAREHOUSE_JWT_SECRET='<JWT_SECRET>'
$env:SMARTWAREHOUSE_DEMO_PASSWORD='123456'
docker compose -f deploy/local/docker-compose.yml config
docker compose -f deploy/local/docker-compose.yml build sys-service gateway-service
~~~

本次 config 通过，build 因 Docker Hub 基础镜像 token 请求网络超时失败。遇到该问题时先配置镜像加速器或切换可访问网络，再重试构建，不要误判为 Dockerfile 错误。

### 9.8 敏感信息处理

- .npmrc 必须被 .gitignore 忽略。
- .npmrc.example 只能保留占位符和环境变量，不写真实 registry 地址或 token。
- frontend-platform/package.json 的发布脚本不写死具体 registry，真实 registry 由本地 .npmrc 或 Jenkins Credentials 注入。
- 本次默认配置修正后，`.gitignore` 已追加 `data/temp/`，避免后端默认启动验证产生的临时日志进入 Git。

## 10. 2026-06-15 Nacos 与门户单点集成手搓步骤

### 10.1 接入 Nacos 服务发现

~~~powershell
docker compose -f deploy/local/docker-compose.yml up -d mysql redis rabbitmq nacos
mvn -q -pl sys/sys-service,gateway/gateway-service -am test
mvn -q -pl sys/sys-service,gateway/gateway-service -am package -DskipTests
~~~

关键修改点：
- `platform/platform-parent/pom.xml`：引入 Spring Cloud Alibaba 依赖管理。
- `gateway/gateway-service/pom.xml`：增加 Nacos Discovery 和 LoadBalancer。
- `sys/sys-service/pom.xml`：增加 Nacos Discovery。
- `gateway/gateway-service/src/main/resources/application.yml`：Nacos 默认 `127.0.0.1:18848`，sys 路由默认 `lb://sys-service`。
- `sys/sys-service/src/main/resources/application.yml`：Nacos 默认 `127.0.0.1:18848`。
- `deploy/local/docker-compose.yml`：Nacos 宿主机端口 `18848/19848`，容器内服务地址 `nacos:8848`。

### 10.2 增加修改密码接口

关键代码位置：
- `sys/sys-api/src/main/java/com/smartwarehouse/sys/api/AuthDtos.java`：新增 `ChangePasswordRequest`。
- `sys/sys-service/src/main/java/com/smartwarehouse/sys/controller/AuthController.java`：新增 `PUT /api/sys/auth/password`。
- `sys/sys-service/src/main/java/com/smartwarehouse/sys/security/AuthService.java`：新增 `changePassword`，校验旧密码、新密码、确认密码、Token 状态和账号状态。
- `sys/sys-service/src/main/java/com/smartwarehouse/sys/infrastructure/JdbcSysRepository.java`：新增 `updatePassword`。

验收要点：
- 后端测试覆盖改密成功路径。
- 浏览器只验证弹窗和表单可用时，不要随意提交 admin 改密，避免破坏默认演示账号 `admin / 123456`。

### 10.3 拆分 sys-service 控制器

将单体 `SysManagementController` 拆分为：

```text
SysUserController
SysRoleController
SysMenuController
SysOrgController
SysDictController
SysFrontendModuleController
SysAuditController
```

拆分时保持原 URL 不变，例如 `/api/sys/users`、`/api/sys/roles`、`/api/sys/menus`、`/api/sys/depts`、`/api/sys/dict-types`、`/api/sys/login-logs` 等，避免前端和外部调用一起改。

### 10.4 门户统一路由承载 sys-web（历史阶段，已被微前端替代）

关键代码位置：
- `frontend-platform/apps/portal-shell/src/App.vue`：维护当前前端路由状态，点击系统管理目录或模块卡片时进入 `/sys/users`，点击后续模块时进入 `/wms`、`/mes`、`/task`、`/ai` 预留页；保留总控制台、个人信息和修改密码弹窗。
- `frontend-platform/apps/portal-shell/src/api.ts`：新增 `changePassword` API。
- `frontend-platform/apps/portal-shell/src/microFrontend.ts`：当前微前端运行时加载入口，根据模块注册信息加载 `sys-web`、`wms-web`、`mes-web`、`ai-web` remote。
- `frontend-platform/apps/portal-shell/src/MicroFrontendOutlet.vue`：当前微前端承载组件，负责加载态、降级页、重试和超时保护。
- `frontend-platform/apps/sys-web/src/remote.ts`：当前 `sys-web` remote 导出入口，暴露给 `portal-shell` 运行时加载。
- `frontend-platform/apps/sys-web/src/App.vue`：支持独立登录模式，也支持根据 `/sys/users`、`/sys/roles` 等真实路径切换系统管理页签；独立调试时兼容 `/apps/sys/` 和 `redirect`。
- `frontend-platform/apps/sys-web/src/api.ts`：新增 `changePassword`。
- `frontend-platform/packages/platform-ui/src/components/SideMenu/SideMenu.vue`：有子菜单的一级目录标题也派发 `menuClick`，点击“系统管理”目录可进入默认页面。

安全要点：
- 不允许把 Access Token 或 Refresh Token 拼到 URL 查询参数。
- 门户集成模式不使用 `redirect` 跨端口跳转，不把 `localhost:5175` 作为总控制台入口。
- 生产环境优先通过同源 Nginx 路径、网关会话或 httpOnly Cookie 方案实现单点登录；本地统一入口使用 `http://localhost:5174/`。
- 菜单和模块权限必须以后端过滤结果为准，前端只展示接口返回的授权模块。

### 10.5 拆分 sys-web 页面

将原本集中在 `App.vue` 的系统管理页面拆分到：

```text
frontend-platform/apps/sys-web/src/views/UserManagementView.vue
frontend-platform/apps/sys-web/src/views/RoleManagementView.vue
frontend-platform/apps/sys-web/src/views/MenuManagementView.vue
frontend-platform/apps/sys-web/src/views/OrgPostManagementView.vue
frontend-platform/apps/sys-web/src/views/DictManagementView.vue
frontend-platform/apps/sys-web/src/views/FrontendModuleManagementView.vue
frontend-platform/apps/sys-web/src/views/AuditLogView.vue
frontend-platform/apps/sys-web/src/views/RiskRecordView.vue
```

`App.vue` 只保留登录态、菜单切换、用户菜单弹窗和页面组合。

### 10.6 浏览器验收

~~~powershell
cd frontend-platform
corepack pnpm --filter @smartwarehouse/portal-shell dev
~~~

验收步骤：
- 打开 `http://localhost:5174/`。
- 使用 `admin / 123456` 登录。
- 页面应规范到 `http://localhost:5174/portal`。
- 点击左侧“系统管理”或系统管理卡片“进入”，浏览器应进入 `http://localhost:5174/sys/users`。
- sys-web remote 页面应直接显示用户管理页签，不再展示登录页，不进行跨端口页面跳转，也不通过 iframe 嵌入门户。
- 当前 Module Federation 集成需要 `sys-web` remoteEntry 可访问；本地可通过 `corepack pnpm --filter @smartwarehouse/sys-web preview` 提供 `http://localhost:5175/apps/sys/assets/remoteEntry.js`。
- 在系统管理内点击“角色管理”，浏览器应进入 `http://localhost:5174/sys/roles`，激活页签为“角色管理”。
- 重新打开 `http://localhost:5174/`，使用 `wms_manager / 123456` 登录。
- 页面只应显示“仓储管理”，不应显示“系统管理”“生产执行”“运营看板”“AI 助手”。
- 点击右上角“个人信息”，应打开当前用户信息弹窗。
- 点击右上角“修改密码”，应打开旧密码、新密码、确认密码表单。

### 10.7 构建与安全检查

~~~powershell
corepack pnpm --filter @smartwarehouse/portal-shell --filter @smartwarehouse/sys-web build
corepack pnpm build:packages
corepack pnpm build:apps
corepack pnpm build:docs
git status --short
rg -n "token|api_key|secret_key|BEGIN PRIVATE KEY|_authToken|npmrc|Authorization|Bearer" README.md docs/plan frontend-platform/apps/portal-shell frontend-platform/apps/sys-web gateway sys deploy
~~~

记录结论：

### 10.8 sys 管理接口权限加固

后端关键点：

- `sys-service` 是统一认证中心，`/api/sys/auth/login` 不按 sys 模块权限拦截，否则 WMS、MES、AI 等业务账号无法登录总门户。
- 系统管理接口必须在 `SysAuthenticationFilter` 中做服务端授权兜底；除 `/api/sys/auth/**`、`/api/sys/menus/tree`、`/api/sys/frontend-modules/enabled` 外，其余 sys 管理接口必须要求 `ADMIN` 角色或 `sys:*` 权限。
- `wms_manager` 的正确行为是：可登录门户，可获取自己的 WMS 菜单和模块，但直接访问 `/api/sys/users` 返回 `FORBIDDEN`。

前端关键点：

- `sys-web` 独立登录成功后，必须检查当前用户是否拥有 `ADMIN` 角色或 `sys:*` 权限。
- 没有 sys 管理权限时，清理 Token、回到登录页，并提示“当前账号无系统管理访问权限”。

验证命令：

~~~powershell
mvn -q -pl sys/sys-service,gateway/gateway-service -am test

cd frontend-platform
corepack pnpm --filter @smartwarehouse/portal-shell --filter @smartwarehouse/sys-web build
~~~

接口验收：

- `admin / 123456`：可访问 `/api/sys/users`。
- `wms_manager / 123456`：可访问 `/api/sys/auth/me`。
- `wms_manager / 123456`：`/api/sys/menus/tree` 和 `/api/sys/frontend-modules/enabled` 只返回 WMS。

## 12. 手搓补充：vite-plugin-federation 微前端改造

### 12.1 安装依赖

```powershell
cd E:\Code\codex\SmartWarehouse-AI\frontend-platform
corepack pnpm add -D @originjs/vite-plugin-federation -w
corepack pnpm install
```

注意：`wms-web`、`mes-web`、`ai-web` 位于项目根目录，因此 `frontend-platform/pnpm-workspace.yaml` 需要包含：

```yaml
packages:
  - "packages/*"
  - "apps/*"
  - "../wms-web"
  - "../mes-web"
  - "../ai-web"
```

### 12.2 portal-shell host 改造要点

1. `frontend-platform/apps/portal-shell/vite.config.ts` 引入 federation 插件。
2. host 使用运行时 remote 注册，因此保留一个占位 remote 让插件生成 `virtual:__federation__`。
3. `build.target` 设置为 `esnext`，支持 Federation 共享模块中的 top-level await。
4. 新增 `src/microFrontend.ts`：

```ts
__federation_method_setRemote(module.remoteName, {
  url: module.remoteEntry,
  format: 'esm',
  from: 'vite'
})
const remoteModule = await __federation_method_getRemote(module.remoteName, module.exposedModule)
```

5. 新增 `src/MicroFrontendOutlet.vue`，负责加载远程组件、显示 loading、失败降级和重试。
6. 降级页必须包含模块编码、远程容器、remoteEntry、暴露模块和当前路由，方便排查。

### 12.3 remote 应用改造要点

每个 remote 的 `vite.config.ts` 保持相同模式：

```ts
federation({
  name: 'smart_wms_web',
  filename: 'remoteEntry.js',
  exposes: {
    './RemoteApp': './src/remote.ts'
  },
  shared: [
    'vue',
    'element-plus',
    '@element-plus/icons-vue',
    '@smartwarehouse/platform-ui',
    '@smartwarehouse/platform-sdk',
    '@smartwarehouse/platform-theme',
    '@smartwarehouse/platform-types'
  ]
})
```

`src/remote.ts` 示例：

```ts
import './style.css'

export { default } from './RemoteApp.vue'
```

### 12.4 模块注册表改造

`sys_frontend_module` 增加字段：

```sql
remote_name VARCHAR(128),
remote_entry VARCHAR(255),
exposed_module VARCHAR(128)
```

本地 preview 默认值：

```text
sys -> http://localhost:5175/apps/sys/assets/remoteEntry.js
wms -> http://localhost:5176/apps/wms/assets/remoteEntry.js
mes -> http://localhost:5177/apps/mes/assets/remoteEntry.js
ai  -> http://localhost:5178/apps/ai/assets/remoteEntry.js
```

历史 Docker MySQL 数据卷可能没有新字段，因此 sys-service 增加 `SysFrontendModuleSchemaInitializer`，启动时自动补列并回填空值或旧默认值。

### 12.5 构建验证命令

```powershell
cd E:\Code\codex\SmartWarehouse-AI\frontend-platform
corepack pnpm build:packages
corepack pnpm --filter @smartwarehouse/portal-shell build
corepack pnpm build:remotes

cd E:\Code\codex\SmartWarehouse-AI
mvn -pl sys/sys-service -am test
```

### 12.6 本地运行验证命令

先构建 remotes，再用 preview 模拟乙方发布后的静态制品：

```powershell
cd E:\Code\codex\SmartWarehouse-AI\frontend-platform
corepack pnpm --filter @smartwarehouse/sys-web preview
corepack pnpm --filter @smartwarehouse/wms-web preview
corepack pnpm --filter @smartwarehouse/mes-web preview
corepack pnpm --filter @smartwarehouse/ai-web preview
```

另开终端启动门户：

```powershell
cd E:\Code\codex\SmartWarehouse-AI\frontend-platform
corepack pnpm --filter @smartwarehouse/portal-shell dev
```

访问并验证：

```text
http://localhost:5174/portal
http://localhost:5174/sys/users
http://localhost:5174/wms
http://localhost:5174/mes
http://localhost:5174/ai
```

### 12.7 降级页验证

1. 正常启动 `portal-shell` 和四个 remote。
2. 访问 `/wms`、`/mes`、`/ai`，确认页面显示 remote 内容。
3. 停止其中一个 remote，例如 `ai-web`。
4. 刷新 `/ai`。
5. 页面应显示“微前端模块加载失败”，并展示 remoteEntry 等排查信息。
6. 再访问 `/wms`，WMS remote 应继续正常展示。

### 12.8 常见错误

1. `Missing "./package.json" specifier`：平台包 `exports` 没开放 `./package.json`，需要在 `platform-ui/sdk/theme/types` 的 package.json 中补充。
2. `Top-level await is not available`：host 或 remote 的 Vite build target 不是 `esnext`。
3. `remoteEntry.js 404`：检查 Vite `base`，preview 下路径通常是 `/apps/<module>/assets/remoteEntry.js`。
4. 远程模块长时间 loading：需要给 remote 加载增加超时保护，并显示降级页。
5. 乙方发版要改 portal-shell：说明仍然是构建期静态依赖，未真正完成运行时微前端。
6. 继续新增 `@smartwarehouse/*-web/embedded`：说明仍在沿用历史方案，应改为 remote 暴露 `./RemoteApp`，并由 `sys_frontend_module` 注册 remoteEntry。
- `wms_manager / 123456`：访问 `/api/sys/users` 返回 `FORBIDDEN`。
- 拆分构建均通过。
- 单次 `corepack pnpm build` 如因执行超时中断，应记录拆分构建结果，而不是误判为代码失败。
- `.gitignore` 已覆盖本次新增构建产物、日志、本地配置和真实 `.npmrc`，无需新增规则。

### 12.9 门户路由承载修正历史说明（已被替代）

本节记录 V02 中间阶段的演进历史：当时曾通过 `@smartwarehouse/sys-web/embedded` 把系统管理页面承载到 `portal-shell` 的 `/sys/**` 路由下，目的是先去掉 iframe、跨端口跳转和二次登录。

该方案已经被后续 `vite-plugin-federation` 运行时微前端方案替代。当前不要再新增 `./embedded` 导出，不要在 `portal-shell` 中静态导入 `@smartwarehouse/*-web/embedded`，也不要把任一乙方前端作为门户构建期依赖。

当前手搓实现请以本文档“12. 手搓补充：vite-plugin-federation 微前端改造”为准，核心步骤是：

1. 子应用在 `vite.config.ts` 中配置 `federation({ name, filename: 'remoteEntry.js', exposes: { './RemoteApp': './src/remote.ts' } })`。
2. 子应用 `src/remote.ts` 默认导出可被门户挂载的 Vue 根组件。
3. `portal-shell` 只根据 `sys_frontend_module.remote_name`、`remote_entry`、`exposed_module` 运行时加载 remote。
4. 本地集成必须先构建 remote，再用 preview 验证真实制品路径，例如 `/apps/sys/assets/remoteEntry.js`。

验收结论：

- `http://localhost:5174/` -> `/portal`。
- 点击系统管理 -> `http://localhost:5174/sys/users`。
- 点击角色管理 -> `http://localhost:5174/sys/roles`。
- 当前 Module Federation 集成需要对应 remoteEntry 可访问；本地可通过 `sys-web` 的 preview 服务提供 `5175/apps/sys/assets/remoteEntry.js`。

### 12.10 微前端收口清理手搓步骤

```powershell
cd E:\Code\codex\SmartWarehouse-AI\frontend-platform
corepack pnpm build:packages
corepack pnpm --filter @smartwarehouse/portal-shell build
corepack pnpm build:remotes

cd E:\Code\codex\SmartWarehouse-AI
mvn -pl sys/sys-service -am test
```

手动检查：

1. `frontend-platform/apps/sys-web/package.json` 不再暴露 `./embedded`。
2. `frontend-platform/apps/sys-web/src/embedded.ts` 不再存在。
3. `portal-shell` 代码中不存在 `@smartwarehouse/sys-web/embedded` 静态导入。
4. `sys-web`、`wms-web`、`mes-web`、`ai-web` 构建后均生成 `dist/assets/remoteEntry.js`。
5. 本地 preview 验证 remoteEntry：

```text
http://localhost:5175/apps/sys/assets/remoteEntry.js
http://localhost:5176/apps/wms/assets/remoteEntry.js
http://localhost:5177/apps/mes/assets/remoteEntry.js
http://localhost:5178/apps/ai/assets/remoteEntry.js
```

## 13. 门户工作台与 hosted sys 布局改造手搓步骤

### 13.1 后端工作台接口与数据表

关键改动位置：

```text
sys/sys-api/src/main/java/com/smartwarehouse/sys/api/SysDtos.java
sys/sys-service/src/main/java/com/smartwarehouse/sys/controller/SysPortalController.java
sys/sys-service/src/main/java/com/smartwarehouse/sys/application/SysManagementService.java
sys/sys-service/src/main/java/com/smartwarehouse/sys/infrastructure/SysRepository.java
sys/sys-service/src/main/java/com/smartwarehouse/sys/infrastructure/JdbcSysRepository.java
sys/sys-service/src/main/java/com/smartwarehouse/sys/security/SysAuthenticationFilter.java
deploy/mysql/init-sys-db.sql
sys/sys-service/src/test/resources/schema-h2.sql
sys/sys-service/src/test/resources/data-h2.sql
sys/sys-service/src/test/java/com/smartwarehouse/sys/AuthFlowIntegrationTest.java
```

本轮约定：

1. 新增 `sys_portal_notice` 与 `sys_portal_access_log` 两张表。
2. `GET /api/sys/portal/workbench` 对任意已登录用户开放，返回 `profile`、`notices`、`commonModules`、`recentModules`、`loginRecords`。
3. `POST /api/sys/portal/access-log` 只接收 `moduleCode`、`routePath`，只记录模块级进入。
4. `commonModules` 与 `recentModules` 都必须与当前用户已授权模块求交集。
5. `/api/sys/users` 等系统管理接口仍保持 `ADMIN` / `sys:*` 授权兜底。

### 13.2 组件库统一布局升级

关键改动位置：

```text
frontend-platform/packages/platform-types/src/index.ts
frontend-platform/packages/platform-ui/src/components/PlatformLayout/PlatformLayout.vue
frontend-platform/packages/platform-ui/src/index.ts
frontend-platform/packages/platform-ui/src/types.ts
frontend-platform/apps/docs/src/componentDocs.ts
frontend-platform/apps/docs/src/componentCatalog.ts
frontend-platform/apps/docs/src/scenarioTemplateDocs.ts
```

新增布局能力：

1. `showAside`：控制是否显示左侧菜单。
2. `showWorkbenchButton`：顶部固定显示“工作台”按钮。
3. `showModuleDrawerTrigger`：左上角显示模块抽屉按钮。
4. `moduleEntries`：模块抽屉的数据源，直接使用 `FrontendModule[]`。
5. `activeModuleCode`：高亮当前模块卡片。
6. `workbenchClick`、`moduleSelect`：统一事件出口。

手动检查点：

1. 顶栏必须是 sticky。
2. `showAside=false` 时不显示折叠按钮，也不保留侧栏占位。
3. 模块抽屉宽度桌面约 `760px`，移动端全宽，带搜索和两列模块卡片。
4. 组件文档中必须同步出现 `portal-workbench` 与新版 `standard-layout` 模板。

### 13.3 portal-shell 统一壳层改造

关键改动位置：

```text
frontend-platform/apps/portal-shell/src/App.vue
frontend-platform/apps/portal-shell/src/api.ts
frontend-platform/apps/portal-shell/src/MicroFrontendOutlet.vue
frontend-platform/apps/portal-shell/src/microFrontend.ts
```

实施步骤：

1. 登录后始终渲染统一 `PlatformLayout`，不要再让 remote 覆盖整页。
2. `/portal` 显示工作台内容区，`showAside=false`。
3. `/sys/**`、`/wms/**`、`/mes/**`、`/ai/**` 进入模块时，`showAside=true`，并且左侧菜单只保留当前模块菜单。
4. 顶部固定“工作台”按钮返回 `/portal`。
5. 左上角模块抽屉读取 `/sys/frontend-modules/enabled`。
6. 模块切换时调用 `/sys/portal/access-log`，sys 内部子菜单切换不要重复上报。

### 13.4 sys-web 独立壳层与 hosted 内容区拆分

关键改动位置：

```text
frontend-platform/apps/sys-web/src/App.vue
frontend-platform/apps/sys-web/src/StandaloneShell.vue
frontend-platform/apps/sys-web/src/HostedRemote.vue
frontend-platform/apps/sys-web/src/remote.ts
frontend-platform/apps/sys-web/src/useSysManagement.ts
```

实施步骤：

1. `App.vue` 只负责 standalone 登录恢复与壳层切换。
2. `remote.ts` 默认暴露 hosted 版内容组件。
3. hosted 模式下不得渲染登录页、`PlatformLayout` 或 tabs。
4. standalone 模式继续保留独立登录能力，但隐藏工作台按钮与模块抽屉。
5. 页面内容映射 hosted 与 standalone 走同一套系统管理内容组件。

### 13.5 构建与验收命令

```powershell
cd E:\Code\codex\SmartWarehouse-AI
mvn -q -pl sys/sys-service -am test

cd E:\Code\codex\SmartWarehouse-AI\frontend-platform
corepack pnpm build:packages
corepack pnpm --filter @smartwarehouse/portal-shell build
corepack pnpm --filter @smartwarehouse/sys-web build
corepack pnpm build:remotes
corepack pnpm --filter @smartwarehouse/component-docs build
```

### 13.6 页面验收清单

1. 已登录从 `/portal` 进入 `/sys/users`，不出现 `sys-web` 登录页闪现。
2. `portal-shell` 顶部固定显示“工作台”按钮和模块抽屉按钮。
3. `/portal` 不显示左侧菜单；进入 `/sys/**` 后只显示 sys 菜单。
4. standalone `sys-web` 可独立登录，并使用新的左侧菜单布局。
5. standalone `wms/mes/ai` 不出现 host 专属入口报错。
6. 模块抽屉可搜索、可切换模块，在当前少模块场景下不显空荡。

## 14. 2026-06-20 Jenkins LTS JDK17 + DooD 本地构建发布

本节记录本地 Docker Desktop 中使用 `jenkins/jenkins:lts-jdk17` 构建 SmartWarehouse-AI 的手动实现过程。该方案不使用 `jenkinsci/blueocean`，Jenkins 容器通过 Docker Outside of Docker 方式挂载 Docker socket，调用本地 Docker Desktop 完成镜像构建和本地测试环境启动。

### 14.1 构建 Jenkins 镜像

仓库提供 `deploy/jenkins/Dockerfile`，基于 `jenkins/jenkins:lts-jdk17`，安装 Docker CLI、Docker Compose 插件、curl、git、基础 shell 工具和 Jenkins 常用流水线插件，不写入任何真实凭证。Maven 和 Node 不内置在 Jenkins 控制器镜像中，流水线通过 DooD 启动 `maven:3.9-eclipse-temurin-17` 与 `node:22` 临时工具容器执行构建。

```powershell
cd E:\Code\codex\SmartWarehouse-AI
docker build -f deploy/jenkins/Dockerfile -t smartwarehouse/jenkins:lts-jdk17 .
```

### 14.2 启动 Jenkins

Jenkins 仅用于本地或局域网构建测试，不要映射到公网。`--user root` 只用于本地演示场景，目的是让 Jenkins 容器可以访问 Docker Desktop 的 Docker socket。

```powershell
docker volume create smartwarehouse_jenkins_home

docker rm -f smartwarehouse-jenkins 2>$null

docker run -d `
  --name smartwarehouse-jenkins `
  --restart unless-stopped `
  --user root `
  -e HOME=/var/jenkins_home `
  -p 8080:8080 `
  -p 50000:50000 `
  -v smartwarehouse_jenkins_home:/var/jenkins_home `
  -v /var/run/docker.sock:/var/run/docker.sock `
  -v "${PWD}:/workspace/SmartWarehouse-AI:ro" `
  smartwarehouse/jenkins:lts-jdk17
```

说明：

1. `smartwarehouse_jenkins_home` 是 Jenkins 持久化目录，保存 Jenkins 初始化状态、任务配置和构建记录。
2. `/var/run/docker.sock` 让 Jenkins 通过 DooD 调用本机 Docker Desktop。
3. `HOME=/var/jenkins_home` 让 root 用户运行 Jenkins 时的 Git 全局配置写入持久化卷。
4. `/workspace/SmartWarehouse-AI:ro` 是当前项目的只读挂载，便于 Jenkins Pipeline 使用本机 Git 仓库做 SCM checkout；该方式只会读取已提交内容，未提交修改不会进入构建。
5. 如果后续改用 GitHub 仓库地址作为 SCM，可以保留该只读挂载，也可以在重建容器时移除它。

获取初始化密码：

```powershell
docker exec smartwarehouse-jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

浏览器打开：

```text
http://127.0.0.1:8080
```

初始化 Jenkins 后，新建 Pipeline 任务，指向代码仓库，脚本路径使用：

```text
deploy/jenkins/Jenkinsfile
```

推荐任务配置：

1. 浏览器打开 `http://127.0.0.1:8080`，使用初始化密码完成 Jenkins 首次初始化。
2. 创建管理员账号，密码只保存在 Jenkins 本地，不写入文档、仓库或 Jenkinsfile。
3. 新建任务，名称建议 `smartwarehouse-local-cicd`，类型选择 `Pipeline`。
4. `Definition` 选择 `Pipeline script from SCM`。
5. `SCM` 选择 `Git`。
6. 如果使用本机只读挂载仓库，`Repository URL` 填 `/workspace/SmartWarehouse-AI`。
7. 如果使用 GitHub，`Repository URL` 填 GitHub 仓库地址；私有仓库凭证放入 Jenkins Credentials。
8. `Branches to build` 按当前分支填写，例如 `*/main`、`*/master` 或实际开发分支。
9. `Script Path` 填 `deploy/jenkins/Jenkinsfile`。
10. 保存后点击 `Build Now` 手动触发构建。

本地当前环境已在 `smartwarehouse_jenkins_home` 中预创建 `smartwarehouse-local-cicd` 任务配置；完成 Jenkins 首次初始化后，若首页能看到该任务，可以直接进入任务页点击 `Build Now`。如果任务未出现，就按上面的推荐任务配置手动创建一次。

本机仓库 Git 安全目录配置：

```powershell
docker exec smartwarehouse-jenkins git config --global --add safe.directory /workspace/SmartWarehouse-AI
```

容器级验证命令：

```powershell
docker ps --filter name=smartwarehouse-jenkins
docker exec smartwarehouse-jenkins docker version
docker exec smartwarehouse-jenkins docker compose version
docker exec smartwarehouse-jenkins test -f /workspace/SmartWarehouse-AI/deploy/jenkins/Jenkinsfile
```

首次构建前建议预拉取工具镜像，避免第一次点击 `Build Now` 时把时间耗在 Docker Hub 下载上：

```powershell
docker pull maven:3.9-eclipse-temurin-17
docker pull node:22
```

工具容器挂载验证：

```powershell
docker run --rm --volumes-from smartwarehouse-jenkins `
  -v smartwarehouse_maven_cache:/root/.m2 `
  -w /workspace/SmartWarehouse-AI `
  maven:3.9-eclipse-temurin-17 mvn -version

docker run --rm --volumes-from smartwarehouse-jenkins `
  -v smartwarehouse_pnpm_store:/pnpm-store `
  -w /workspace/SmartWarehouse-AI/frontend-platform `
  node:22 bash -lc "node -v && corepack --version && test -f package.json"
```

Jenkins 通过挂载 `/var/run/docker.sock` 调用本地 Docker Desktop；Docker CLI 在 Jenkins 容器内执行，Maven 与 pnpm 构建在 sibling 工具容器中执行。工具容器通过 `--volumes-from` 共享 Jenkins 容器的 `/var/jenkins_home` 卷，从而访问 SCM checkout 后的 workspace，并使用命名卷缓存 Maven 与 pnpm 依赖。

当前 Jenkinsfile 为了和已存在的本地开发栈共存，默认让 Jenkins 专用中间件使用另一组宿主机端口：MySQL `23306`、Redis `26381`、RabbitMQ `25673/35673`、Nacos `28848/29848`。应用访问入口仍固定为 Gateway `9200`、Sys `9201`、Portal `5174`、Sys Web `5175`。如果停止了 `deploy/local/docker-compose.yml` 的本地中间件，也可以把 Jenkinsfile 中的端口改回 Compose 文件默认值 `13306/16381/5673/15673/18848/19848`。

### 14.3 Jenkins 流水线职责

当前 `deploy/jenkins/Jenkinsfile` 已改为 Linux `sh` 流水线，阶段如下：

```text
Checkout
Docker Info
Local Middleware Up
Init MySQL
Java Test
Java Package
Frontend Install
Frontend Build
Docker Build
Local Test Deploy
Health Check
Archive
```

关键约定：

1. Maven 测试和打包使用 `maven:3.9-eclipse-temurin-17` 工具容器，并用 `smartwarehouse_maven_cache` 命名卷缓存 `.m2`。
2. 前端安装和构建使用 `node:22` 工具容器，启用 Corepack 与 `pnpm@10.12.1`，并用 `smartwarehouse_pnpm_store` 命名卷缓存 pnpm store。
3. Jenkins 专用本地测试环境使用 `deploy/jenkins/docker-compose.local-test.yml`。
4. Compose 使用命名卷保存测试数据，避免依赖 Jenkins workspace 里的宿主机路径。
5. MySQL 初始化由 `Init MySQL` 阶段执行 `deploy/mysql/init-sys-db.sql`，不通过 bind mount 注入。
6. 后端和前端镜像同时打构建号 tag 和 `test` tag，例如 `smartwarehouse/gateway-service:test`。
7. 当前 Jenkinsfile 默认使用 Jenkins 专用中间件端口 `23306/26381/25673/35673/28848/29848`，避免与 `deploy/local/docker-compose.yml` 的默认端口冲突。

### 14.4 本地测试服务访问地址

Jenkins 健康检查在容器内使用 `http://host.docker.internal` 访问宿主机映射端口；开发者浏览器使用 `127.0.0.1` 访问：

```text
http://127.0.0.1:5174/
http://127.0.0.1:5175/apps/sys/
http://127.0.0.1:5175/apps/sys/assets/remoteEntry.js
http://127.0.0.1:9200/actuator/health
http://127.0.0.1:9201/actuator/health
http://127.0.0.1:9200/api/sys/auth/risk-state?username=admin
```

`portal-shell` 与 `sys-web` 分别运行在不同端口，浏览器加载 `remoteEntry.js` 属于跨端口动态 import；`frontend-platform/apps/sys-web/deploy/nginx.conf` 已为 `/apps/sys/` 增加 CORS 响应头。若调整该 Nginx 配置，需要重新构建 `smartwarehouse/sys-web:test` 并重启 sys-web 容器，否则可能出现 curl 可访问但浏览器微前端加载失败的情况。

浏览器验收：

1. 打开 `http://127.0.0.1:5174/`。
2. 使用本地演示账号 `admin / 123456` 登录。
3. 点击系统管理，确认进入门户内 `/sys/users` 页面。
4. 打开 `http://127.0.0.1:5175/apps/sys/`，确认 sys-web 独立入口可访问。
5. 使用 `wms_manager / 123456` 登录门户，确认只显示 WMS 授权模块，系统管理不可见或不可访问。

### 14.5 后续更新发布步骤

本地测试发布流程：

```text
1. 开发者提交代码到 Git。
2. Jenkins Pipeline 执行 Checkout。
3. Jenkins 启动 MySQL、Redis、RabbitMQ、Nacos。
4. Jenkins 初始化 MySQL 测试数据。
5. Jenkins 执行 Maven 测试和打包。
6. Jenkins 执行 pnpm install 与 portal-shell/sys-web 构建。
7. Jenkins 构建 gateway-service、sys-service、portal-shell、sys-web 镜像。
8. Jenkins 启动本地测试服务。
9. Jenkins 执行 HTTP 健康检查。
10. 开发者用浏览器完成页面验收。
```

后续发布到家用 Ubuntu 服务器时，可以在当前流水线后追加 SSH 发布阶段：

```text
1. Jenkins 将通过测试的镜像保存为 tar，或推送到私有镜像仓库。
2. Jenkins 通过 SSH 连接家用 Ubuntu 部署机。
3. Ubuntu 部署机执行 docker load 或 docker compose pull。
4. Ubuntu 部署机执行 docker compose up -d。
5. Jenkins 检查公网域名首页、remoteEntry、gateway health 和 sys health。
```

### 14.6 敏感信息边界

禁止写入仓库或 Jenkinsfile 的内容：

```text
真实公网 IP
真实 DDNS Token
真实 Jenkins 管理员密码
真实数据库生产密码
真实 JWT Secret
真实阿里云 AccessKey
真实 npm token
真实 Docker Registry 凭证
私钥内容
```

文档、Compose 和 Jenkinsfile 只允许使用本地演示默认值或占位符，例如：

```text
<JWT_SECRET>
<DB_PASSWORD>
<JENKINS_ADMIN_PASSWORD>
<REGISTRY_USERNAME>
<REGISTRY_PASSWORD>
```

真实值必须通过 Jenkins Credentials、服务器本地 `.env`、Docker Secret、Kubernetes Secret 或被 Git 忽略的本地配置文件注入。

## 15. 2026-06-22 Jenkins 正式 ACR 推送手搓步骤

本节记录在现有本地 Jenkins LTS JDK17 + DooD 流水线基础上，增加正式镜像推送到阿里云 ACR 的手动实现过程。该能力只服务正式版本发布；普通开发构建仍然只生成本地 `smartwarehouse/*:test` 镜像并启动本地测试服务。

### 15.1 Jenkins 参数约定

`deploy/jenkins/Jenkinsfile` 增加 3 个参数：

```text
PUSH_ACR_RELEASE=false
RELEASE_VERSION=
PUSH_LATEST=false
```

普通开发构建保持默认值：

```text
PUSH_ACR_RELEASE=false
RELEASE_VERSION=
PUSH_LATEST=false
```

正式 ACR 发布构建示例：

```text
PUSH_ACR_RELEASE=true
RELEASE_VERSION=v0.2.0
PUSH_LATEST=false
```

约束：

1. `PUSH_ACR_RELEASE=false` 时，流水线不登录 ACR、不推送 ACR。
2. `PUSH_ACR_RELEASE=true` 时，`RELEASE_VERSION` 必填。
3. `RELEASE_VERSION` 不允许使用 `test`、`dev`、`latest`。
4. `PUSH_LATEST` 默认保持 `false`，只有明确需要维护 latest 指针时才开启。
5. 正式推送必须排在 `Health Check` 之后，确保本地测试服务已通过 HTTP 验收。

### 15.2 Jenkins 凭证配置

在 Jenkins 页面创建 ACR 凭证：

```text
类型：Username with password
ID：aliyun-acr-smartwarehouse
Username：<ACR_USERNAME>
Password：<ACR_PASSWORD>
```

安全边界：

1. `<ACR_USERNAME>` 和 `<ACR_PASSWORD>` 只保存在 Jenkins Credentials。
2. 不要把 ACR 真实账号、密码、AccessKey、token 写入 Jenkinsfile、README、docs、Compose 或 `.env.example`。
3. Jenkins 日志中只允许出现 registry 地址和镜像 tag，不允许打印密码。

### 15.3 正式镜像仓库

正式版本推送到以下 4 个 ACR 私有仓库：

```text
registry.cn-hangzhou.aliyuncs.com/smartwarehouse/gateway-service:<RELEASE_VERSION>
registry.cn-hangzhou.aliyuncs.com/smartwarehouse/sys-service:<RELEASE_VERSION>
registry.cn-hangzhou.aliyuncs.com/smartwarehouse/portal-shell:<RELEASE_VERSION>
registry.cn-hangzhou.aliyuncs.com/smartwarehouse/sys-web:<RELEASE_VERSION>
```

普通本地测试镜像仍然只保留在 Docker Desktop：

```text
smartwarehouse/gateway-service:<BUILD_NUMBER>
smartwarehouse/gateway-service:test
smartwarehouse/sys-service:<BUILD_NUMBER>
smartwarehouse/sys-service:test
smartwarehouse/portal-shell:<BUILD_NUMBER>
smartwarehouse/portal-shell:test
smartwarehouse/sys-web:<BUILD_NUMBER>
smartwarehouse/sys-web:test
```

### 15.4 手动触发步骤

1. 确认 `smartwarehouse-jenkins` 是持久化 Jenkins 容器，不要创建临时 Jenkins。
2. 浏览器打开 `http://127.0.0.1:8080`。
3. 进入 Jenkins 任务，例如 `smartwarehouse-local-cicd`。
4. 如果页面没有 `Build with Parameters`，先点击一次普通 `Build Now`，Declarative Pipeline 会把参数写入任务配置。
5. 正式发布时点击 `Build with Parameters`。
6. 勾选 `PUSH_ACR_RELEASE=true`。
7. 填写 `RELEASE_VERSION=<RELEASE_VERSION>`，例如 `v0.2.0`。
8. 默认保持 `PUSH_LATEST=false`。
9. 启动构建，等待本地测试和 HTTP 健康检查全部通过。
10. 查看 `ACR Release Push` 阶段是否完成。
11. 下载或查看归档文件 `acr-release-images.txt`。

### 15.5 验证命令

本地 Jenkins 容器能力检查：

```powershell
docker ps --filter name=smartwarehouse-jenkins
docker exec smartwarehouse-jenkins docker version
docker exec smartwarehouse-jenkins docker compose version
```

本地测试服务 HTTP 验收：

```powershell
curl -f http://127.0.0.1:9200/actuator/health
curl -f http://127.0.0.1:9201/actuator/health
curl -f http://127.0.0.1:5174/
curl -f http://127.0.0.1:5175/apps/sys/assets/remoteEntry.js
curl -f "http://127.0.0.1:9200/api/sys/auth/risk-state?username=admin"
```

远端镜像校验由 Jenkins 在 `ACR Release Push` 阶段自动执行：

```text
docker manifest inspect registry.cn-hangzhou.aliyuncs.com/smartwarehouse/gateway-service:<RELEASE_VERSION>
docker manifest inspect registry.cn-hangzhou.aliyuncs.com/smartwarehouse/sys-service:<RELEASE_VERSION>
docker manifest inspect registry.cn-hangzhou.aliyuncs.com/smartwarehouse/portal-shell:<RELEASE_VERSION>
docker manifest inspect registry.cn-hangzhou.aliyuncs.com/smartwarehouse/sys-web:<RELEASE_VERSION>
```

### 15.6 后续更新发布步骤

日常开发更新：

```text
1. 本地开发并提交代码。
2. Jenkins 普通构建，PUSH_ACR_RELEASE=false。
3. Jenkins 构建本地 test 镜像并启动本地测试服务。
4. 浏览器验证通过后继续开发或准备正式发布。
```

正式版本发布：

```text
1. 确认 Git 分支、代码和版本号。
2. Jenkins 参数化构建，PUSH_ACR_RELEASE=true。
3. 填写 RELEASE_VERSION=<RELEASE_VERSION>。
4. Jenkins 完成本地自动测试和 HTTP 健康检查。
5. Jenkins 推送 4 个正式镜像到 ACR。
6. Jenkins 归档 acr-release-images.txt。
7. 后续由阿里弹性容器、ACK 或家用 Ubuntu 服务器按该正式镜像 tag 部署。
```

回滚原则：

1. ACR 中保留每次正式发布的版本 tag。
2. 回滚时不要重新打 `test` 镜像覆盖正式版本。
3. 在部署平台中把镜像 tag 切回上一个已验证的 `<RELEASE_VERSION>`。
4. 回滚后重新检查 gateway health、sys health、portal 首页和 sys-web remoteEntry。

### 15.7 构建成功后的本地镜像清理

Jenkins 构建成功后会自动清理本次构建产生的临时本地 tag：

```text
smartwarehouse/gateway-service:<BUILD_NUMBER>
smartwarehouse/sys-service:<BUILD_NUMBER>
smartwarehouse/portal-shell:<BUILD_NUMBER>
smartwarehouse/sys-web:<BUILD_NUMBER>
```

如果本次开启 `PUSH_ACR_RELEASE=true` 且 ACR 推送成功，还会删除本地 ACR tag 副本：

```text
registry.cn-hangzhou.aliyuncs.com/smartwarehouse/gateway-service:<RELEASE_VERSION>
registry.cn-hangzhou.aliyuncs.com/smartwarehouse/sys-service:<RELEASE_VERSION>
registry.cn-hangzhou.aliyuncs.com/smartwarehouse/portal-shell:<RELEASE_VERSION>
registry.cn-hangzhou.aliyuncs.com/smartwarehouse/sys-web:<RELEASE_VERSION>
```

如果同时开启 `PUSH_LATEST=true`，本地 ACR `latest` tag 副本也会删除。以上清理只删除本地 Docker Desktop 上的 tag，不影响 ACR 远端仓库中的正式镜像。

保留内容：

```text
smartwarehouse/gateway-service:test
smartwarehouse/sys-service:test
smartwarehouse/portal-shell:test
smartwarehouse/sys-web:test
```

这些 `test` 镜像是本地 Compose 测试服务的运行入口，不自动删除。Jenkins 只额外执行 `docker image prune -f` 清理 dangling images，不执行 `docker image prune -a`，也不执行 `docker system prune -a --volumes`，避免误删基础镜像、工具镜像、Jenkins home 或 MySQL/Redis/RabbitMQ/Nacos 数据卷。

## 16. 2026-06-23 Ubuntu k3s + ACR 正式镜像部署手搓步骤

本节记录家用 Ubuntu 服务器部署 V02 正式镜像的实际过程。服务器通过 `ssh ubuntu-service` 访问，使用单节点 k3s，业务镜像来自阿里云 ACR，公共中间件镜像使用固定版本。本文档只记录占位符和操作流程，不记录真实 ACR 凭证、JWT Secret、数据库密码、私钥或 DDNS token。

### 16.1 k3s 初始化

服务器基础状态：

```text
OS: Ubuntu 24.04 LTS
CPU: 4 vCPU
Memory: 约 11GiB
Kubernetes: k3s v1.35.5+k3s1
Namespace: smartwarehouse
Public entry: edge-nginx NodePort 30080
```

安装 k3s 时禁用默认 Traefik 和 servicelb，统一使用本项目的 `edge-nginx` 暴露一个端口。国内环境拉取 Docker Hub 镜像可能超时，因此在服务器上写入 k3s registry mirror 配置：

```yaml
disable:
  - traefik
  - servicelb
pause-image: docker.m.daocloud.io/rancher/mirrored-pause:3.6
```

```yaml
mirrors:
  docker.io:
    endpoint:
      - https://docker.m.daocloud.io
      - https://docker.1ms.run
      - https://docker.1panel.live
      - https://registry-1.docker.io
```

验证命令：

```bash
export KUBECONFIG="$HOME/.kube/config"
kubectl get nodes -o wide
kubectl -n kube-system get pods -o wide
```

### 16.2 Secret 创建约定

ACR 拉取凭证由开发者手动在 Ubuntu 服务器输入，不进入仓库和文档：

```bash
export KUBECONFIG="$HOME/.kube/config"

read -r -p "ACR username: " ACR_USERNAME
read -r -s -p "ACR password: " ACR_PASSWORD
echo

kubectl -n smartwarehouse create secret docker-registry acr-pull-secret \
  --docker-server=registry.cn-hangzhou.aliyuncs.com \
  --docker-username="$ACR_USERNAME" \
  --docker-password="$ACR_PASSWORD" \
  --docker-email="placeholder@example.com"

unset ACR_USERNAME ACR_PASSWORD
kubectl -n smartwarehouse get secret acr-pull-secret
```

运行时 Secret 由服务器随机生成，写入 `smartwarehouse-runtime-secret`：

```text
mysql-root-password=<DB_PASSWORD>
mysql-app-user=smart_sys
mysql-app-password=<DB_PASSWORD>
rabbitmq-user=smartwarehouse
rabbitmq-password=<RABBITMQ_PASSWORD>
smartwarehouse-jwt-secret=<JWT_SECRET>
```

### 16.3 K8s 清单

新增清单目录：

```text
deploy/k8s/home-server/
```

核心资源：

```text
00-namespace.yaml
10-storage.yaml
20-middleware.yaml
30-apps.yaml
40-edge-nginx.yaml
50-mysql-init-job.yaml
```

部署镜像：

```text
mysql:8.4
redis:7.4
rabbitmq:3.13-management
nacos/nacos-server:v2.4.3
nginx:1.27-alpine
registry.cn-hangzhou.aliyuncs.com/smartwarehouse/gateway-service:v0.1.0
registry.cn-hangzhou.aliyuncs.com/smartwarehouse/sys-service:v0.1.0
registry.cn-hangzhou.aliyuncs.com/smartwarehouse/portal-shell:v0.1.0
registry.cn-hangzhou.aliyuncs.com/smartwarehouse/sys-web:v0.1.0
```

`edge-nginx` 统一入口：

```text
/                         -> portal-shell:80
/apps/sys/                -> sys-web:80
/api/                     -> gateway-service:9200
```

### 16.4 部署顺序

```bash
export KUBECONFIG="$HOME/.kube/config"

kubectl apply -f deploy/k8s/home-server/00-namespace.yaml
kubectl apply -f deploy/k8s/home-server/10-storage.yaml
kubectl apply -f deploy/k8s/home-server/20-middleware.yaml

kubectl -n smartwarehouse create configmap mysql-init-sql \
  --from-file=init-sys-db.sql=deploy/mysql/init-sys-db.sql \
  --dry-run=client -o yaml | kubectl apply -f -

kubectl -n smartwarehouse wait --for=condition=Ready pod -l app.kubernetes.io/part-of=smartwarehouse-ai --timeout=900s

kubectl -n smartwarehouse delete job mysql-init-smart-sys --ignore-not-found=true
kubectl apply -f deploy/k8s/home-server/50-mysql-init-job.yaml
kubectl -n smartwarehouse wait --for=condition=complete job/mysql-init-smart-sys --timeout=600s

kubectl apply -f deploy/k8s/home-server/30-apps.yaml
kubectl apply -f deploy/k8s/home-server/40-edge-nginx.yaml
```

MySQL 初始化 Job 会导入 `deploy/mysql/init-sys-db.sql`，并把正式环境的 `remote_entry` 修正为同源路径：

```text
sys -> /apps/sys/assets/remoteEntry.js
wms -> /apps/wms/assets/remoteEntry.js
mes -> /apps/mes/assets/remoteEntry.js
ai  -> /apps/ai/assets/remoteEntry.js
```

这样公网访问时浏览器不会再请求访问者本机的 `localhost:5175`。

### 16.5 验收结果

集群资源已验证：

```bash
kubectl -n smartwarehouse get pods -o wide
kubectl -n smartwarehouse get pvc
kubectl -n smartwarehouse get svc edge-nginx
```

HTTP 验收已通过：

```bash
curl -f http://<UBUNTU_LAN_IP>:30080/
curl -f http://<UBUNTU_LAN_IP>:30080/apps/sys/assets/remoteEntry.js
curl -f "http://<UBUNTU_LAN_IP>:30080/api/sys/auth/risk-state?username=admin"
```

集群内部健康检查已通过：

```bash
kubectl -n smartwarehouse run curl-gateway --rm -i --restart=Never --image=curlimages/curl:8.8.0 -- \
  curl -f http://gateway-service:9200/actuator/health

kubectl -n smartwarehouse run curl-sys --rm -i --restart=Never --image=curlimages/curl:8.8.0 -- \
  curl -f http://sys-service:9201/actuator/health
```

返回结果：

```text
portal=200
remoteEntry=200
risk=200
gateway health=UP
sys health=UP
```

### 16.6 正式服务更新与回滚

新版本发布流程：

```bash
RELEASE_VERSION=<RELEASE_VERSION>

kubectl -n smartwarehouse set image deploy/gateway-service \
  gateway-service=registry.cn-hangzhou.aliyuncs.com/smartwarehouse/gateway-service:${RELEASE_VERSION}
kubectl -n smartwarehouse set image deploy/sys-service \
  sys-service=registry.cn-hangzhou.aliyuncs.com/smartwarehouse/sys-service:${RELEASE_VERSION}
kubectl -n smartwarehouse set image deploy/portal-shell \
  portal-shell=registry.cn-hangzhou.aliyuncs.com/smartwarehouse/portal-shell:${RELEASE_VERSION}
kubectl -n smartwarehouse set image deploy/sys-web \
  sys-web=registry.cn-hangzhou.aliyuncs.com/smartwarehouse/sys-web:${RELEASE_VERSION}

kubectl -n smartwarehouse rollout status deploy/gateway-service
kubectl -n smartwarehouse rollout status deploy/sys-service
kubectl -n smartwarehouse rollout status deploy/portal-shell
kubectl -n smartwarehouse rollout status deploy/sys-web
```

回滚时把 4 个业务 Deployment 的镜像 tag 切回上一个已验证版本即可。不要删除 PVC，不要执行会清空 MySQL、Redis、RabbitMQ、Nacos 数据的命令。

### 16.7 安全检查

禁止写入仓库的内容：

```text
真实 ACR 用户名和密码
真实 JWT Secret
真实数据库密码
真实 RabbitMQ 密码
Jenkins 管理员密码
AccessKey 或私钥
DDNS token
```

允许写入文档的内容：

```text
<ACR_USERNAME>
<ACR_PASSWORD>
<JWT_SECRET>
<DB_PASSWORD>
<RABBITMQ_PASSWORD>
<RELEASE_VERSION>
<UBUNTU_LAN_IP>
```

部署完成且不再需要自动化维护系统组件后，可以撤销 `swadmin` 的临时免密 sudo 权限：

```bash
sudo rm -f /etc/sudoers.d/90-swadmin-codex
sudo visudo -c
```

撤销 sudo 免密不会停止已经运行的 k3s、Pod、Service 或 PVC。

### 15.8 敏感信息检查

提交前必须检查：

```powershell
rg -n "AccessKey|Secret|BEGIN PRIVATE KEY|_authToken|ACR_PASSWORD|JENKINS_ADMIN_PASSWORD|DDNS|Bearer" README.md docs/plan deploy/jenkins
```

允许出现的内容仅限：

```text
<ACR_USERNAME>
<ACR_PASSWORD>
<RELEASE_VERSION>
<JENKINS_ADMIN_PASSWORD>
aliyun-acr-smartwarehouse
registry.cn-hangzhou.aliyuncs.com/smartwarehouse
```
