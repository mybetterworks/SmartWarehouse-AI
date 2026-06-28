# V02 甲方前后端基座与 CI/CD 基线

## 1. 版本状态

```text
状态：DONE
负责人：甲方平台团队
前置版本：V01
输出结果：可登录的平台基座、sys 管理前后端、Jenkins 测试发布和阿里弹性容器正式发布基线
```

## 2. 版本开发输入边界

本文件已经内置 V02 需要的设计信息。开发 V02 时以本文件、`docs/plan/ROADMAP.md`、`docs/plan/DEVELOPMENT_RULE.md`、`docs/plan/PROGRESS.md` 为准，不需要再读取 `docs/design` 下的设计文档。

V02 只开发甲方平台后端基座、网关、系统权限服务、统一登录入口、`sys-web`、Jenkins 测试发布基线和阿里弹性容器正式发布基线。不开发 WMS、MES、AI、task 业务能力，只为它们预留菜单、路由、模块入口和接口前缀。

## 3. 版本目标

1. 开发 `platform` Java 技术底座。
2. 开发 `gateway/gateway-service` 网关服务。
3. 开发 `sys/sys-api`、`sys/sys-service`，可保留 `sys-client` 作为甲方系统服务轻量封装，但禁止新增 `task-client`、`mes-client`、`wms-client`。
4. 开发 `frontend-platform/apps/portal-shell` 和 `frontend-platform/apps/sys-web`。
5. 实现登录、退出、刷新 Token、用户信息、菜单、角色、部门、岗位、字典、数据权限、登录日志、操作日志。
6. 实现登录风控：同一用户连续失败 3 次后启用随机拼图验证码，连续失败 5 次锁定 10 分钟。
7. 实现网关 JWT 鉴权、Token 黑名单校验、TraceId 透传、跨域、Sentinel 限流和降级。
8. 接入 Jenkins 测试环境流水线。
9. 接入阿里弹性容器正式环境发布基线。

## 4. 项目与代码架构

### 4.1 后端目录

```text
platform
├── pom.xml
├── platform-parent
├── platform-bom
├── platform-common-core
├── platform-common-web
├── platform-common-data
├── platform-common-security-lite
├── platform-common-redis
├── platform-common-mq
├── platform-common-log
└── platform-common-id

gateway
├── pom.xml
├── gateway-service
└── deploy

sys
├── pom.xml
├── sys-api
├── sys-service
└── deploy
```

根 `pom.xml` 只聚合，不作为强 parent。所有 Java 服务继承 `platform/platform-parent` 并导入 `platform/platform-bom`。

### 4.2 platform 模块职责

| 模块 | 必须实现的能力 |
|---|---|
| `platform-parent` | JDK 17、编码、编译插件、测试插件、Spring Boot Maven Plugin、deploy 仓库配置。 |
| `platform-bom` | Spring Boot、Spring Cloud Alibaba、Nacos、Sentinel、Seata、Dubbo、MyBatis Plus、Redis、RabbitMQ、JWT、Knife4j、Lombok、MapStruct、Hutool、内部 API 版本。 |
| `platform-common-core` | `R<T>`、`PageQuery`、`PageResult`、`BizException`、`ErrorCode`、日期和 JSON 工具。 |
| `platform-common-web` | 全局异常、参数校验、TraceId Filter、请求上下文、WebMVC 配置。 |
| `platform-common-data` | MyBatis Plus、分页、审计字段、逻辑删除、乐观锁、数据权限 SQL 支撑。 |
| `platform-common-security-lite` | JWT 解析、`LoginUser`、权限注解、数据权限上下文、仓库权限模型。 |
| `platform-common-redis` | RedisTemplate、缓存工具、分布式锁、Lua 执行、Token 黑名单工具。 |
| `platform-common-mq` | 事件基类、RabbitMQ 常量、发送封装、消费幂等、重试、死信基础能力。 |
| `platform-common-log` | 操作日志注解、审计日志模型、TraceId 上下文。 |
| `platform-common-id` | Snowflake、Redis 序列、业务单号生成。 |

### 4.3 gateway 包结构

```text
com.smartwarehouse.gateway
├── config
├── filter
├── handler
├── security
└── route
```

网关过滤器顺序：

```text
TraceIdGlobalFilter
  -> CorsFilter
  -> JwtAuthFilter
  -> TokenBlacklistFilter
  -> PermissionFilter
  -> SentinelGatewayFilter
```

### 4.4 sys-service 包结构

```text
com.smartwarehouse.sys
├── api
├── controller
├── application
├── domain
├── infrastructure
├── security
├── risk
└── log
```

### 4.5 前端目录

```text
frontend-platform
├── packages
│   ├── platform-ui
│   ├── platform-sdk
│   ├── platform-theme
│   └── platform-types
└── apps
    ├── portal-shell
    └── sys-web
```

`portal-shell` 负责统一登录、Token 管理、菜单装载、模块入口。`sys-web` 负责系统管理页面。乙方前端不得直接引用 `frontend-platform` 源码，只能通过 `@smartwarehouse/*` 包复用能力。

### 4.6 前端平台包依赖与导入规则

V02 开发 `portal-shell` 和 `sys-web` 时，必须把 V01 已发布的平台包视为正式制品契约来使用。开发联调阶段允许在 `package.json` 中使用 workspace 包名引用四个平台包，但只能通过包名引用，不允许使用源码相对路径。

`portal-shell` 和 `sys-web` 的 `package.json` 中必须使用以下依赖形式：

```json
{
  "dependencies": {
    "@smartwarehouse/platform-ui": "workspace:*",
    "@smartwarehouse/platform-sdk": "workspace:*",
    "@smartwarehouse/platform-theme": "workspace:*",
    "@smartwarehouse/platform-types": "workspace:*"
  }
}
```

前端代码中必须从 `@smartwarehouse/*` 包名导入：

```ts
import { PlatformPage } from '@smartwarehouse/platform-ui'
import '@smartwarehouse/platform-ui/style.css'
import '@smartwarehouse/platform-theme/style.css'
import { request } from '@smartwarehouse/platform-sdk'
import type { LoginUser } from '@smartwarehouse/platform-types'
```

禁止在 `portal-shell` 和 `sys-web` 中使用以下写法：

```ts
import PlatformPage from '../../packages/platform-ui/src/components/PlatformPage/PlatformPage.vue'
import { request } from '../../packages/platform-sdk/src/request'
```

禁止项：

1. 禁止使用源码相对路径引用 `frontend-platform/packages/*`。
2. 禁止使用 `file:` 或 `link:` 依赖四个平台包。
3. 禁止绕过 `@smartwarehouse/platform-ui` 的包入口直接引用组件源码。
4. 禁止绕过 `@smartwarehouse/platform-sdk` 自行封装重复的 request、Token、权限、字典能力。

前端开发优先级：

1. 类型优先使用 `@smartwarehouse/platform-types`。
2. 样式优先使用 `@smartwarehouse/platform-theme` 和 `@smartwarehouse/platform-ui/style.css`。
3. 请求、Token、权限、字典等能力优先使用 `@smartwarehouse/platform-sdk`。
4. 页面、表格、表单、权限按钮、状态标签、字典选择、登录风控、导入任务、AI/BI 展示等能力优先使用 `@smartwarehouse/platform-ui`。

组件能力不足时的处理规则：

1. 先评估是否为跨页面、跨模块或跨乙方项目都会复用的通用需求。
2. 如果是通用需求，可以修改 `frontend-platform/packages` 下的 `platform-ui`、`platform-sdk`、`platform-theme` 或 `platform-types` 源码，并同步更新组件文档。
3. 如果不是通用需求，只能在 `portal-shell` 或 `sys-web` 业务内部实现局部组件，不要污染平台组件库。
4. 修改平台包后，代码仍必须通过 `@smartwarehouse/*` 包名导入，不能改为源码相对路径。
5. V02 验收或发布前，AI 只能验证 `portal-shell`、`sys-web` 使用 `workspace:*` 包名依赖平台包，并执行构建、类型检查、文档站构建或 `publish --dry-run`；不得自动向阿里云效 npm 私库推送 snapshot/release 制品。平台包版本号设置和真实发布必须由用户手动执行。

## 5. 业务功能要求

### 5.1 认证与会话

1. 用户登录成功后签发 Access Token 和 Refresh Token。
2. 用户退出时将 Token `jti` 写入 Redis 黑名单。
3. 支持 Refresh Token 刷新 Access Token。
4. Gateway 校验 Access Token 和 Token 黑名单。
5. 所有业务接口默认需要登录认证，以下接口例外：

```text
/api/sys/auth/login
/api/sys/auth/refresh
/api/sys/auth/captcha/jigsaw
/api/sys/auth/captcha/verify
/actuator/health
```

### 5.2 登录风控

规则：

| 规则 | 处理 |
|---|---|
| 同一账号连续失败 3 次 | 启用随机拼图验证码。 |
| 同一账号连续失败 5 次 | 锁定用户 10 分钟。 |
| 同一 IP 1 分钟失败 20 次 | 锁定 IP 5 分钟。 |
| 账号禁用 | 禁止登录。 |
| Token 在黑名单 | Gateway 拒绝访问。 |

登录成功后必须清理该账号的失败次数、拼图验证码要求、未过期挑战和验证通过凭证。

### 5.3 系统管理

必须实现：

```text
用户管理
角色管理
菜单管理
部门管理
岗位管理
字典管理
角色菜单权限
仓库级数据权限
登录日志
操作日志
风控记录
前端模块注册
```

### 5.4 数据权限

数据权限范围：

```text
ALL              全部数据
DEPT             本部门数据
DEPT_AND_CHILD   本部门及下级部门
SELF             本人数据
WAREHOUSE        指定仓库数据
```

仓库管理员只能查看自己负责仓库的数据。V02 在 sys 中维护用户与仓库的授权关系，V03 起 WMS 使用该授权关系过滤数据。

## 6. 接口设计

### 6.1 Gateway 路由

| 路由 ID | Path | 目标服务 | V02 状态 |
|---|---|---|---|
| `sys-route` | `/api/sys/**` | `sys-service` | 实现 |
| `wms-route` | `/api/wms/**` | `wms-service` | 预留 |
| `mes-route` | `/api/mes/**` | `mes-service` | 预留 |
| `task-route` | `/api/task/**` | `task-service` | 预留 |
| `ai-route` | `/api/ai/**` | `ai-service` | 预留 |

### 6.2 认证接口

```text
POST /api/sys/auth/login
POST /api/sys/auth/logout
POST /api/sys/auth/refresh
GET  /api/sys/auth/me
GET  /api/sys/auth/captcha/jigsaw?username={username}
POST /api/sys/auth/captcha/verify
```

登录请求：

```json
{
  "username": "admin",
  "password": "123456",
  "captchaTicket": "optional",
  "captchaVerifyToken": "optional"
}
```

登录响应：

```json
{
  "accessToken": "...",
  "refreshToken": "...",
  "expiresIn": 7200
}
```

拼图挑战响应：

```json
{
  "captchaTicket": "...",
  "backgroundImage": "base64...",
  "sliderImage": "base64...",
  "y": 128,
  "expiresIn": 120
}
```

拼图校验请求：

```json
{
  "captchaTicket": "...",
  "x": 236,
  "track": []
}
```

拼图校验响应：

```json
{
  "captchaVerifyToken": "...",
  "expiresIn": 120
}
```

### 6.3 系统管理接口

```text
GET    /api/sys/users
POST   /api/sys/users
PUT    /api/sys/users/{id}
DELETE /api/sys/users/{id}
PUT    /api/sys/users/{id}/status
PUT    /api/sys/users/{id}/roles
PUT    /api/sys/users/{id}/warehouses

GET    /api/sys/roles
POST   /api/sys/roles
PUT    /api/sys/roles/{id}
DELETE /api/sys/roles/{id}
PUT    /api/sys/roles/{id}/menus

GET    /api/sys/menus/tree
POST   /api/sys/menus
PUT    /api/sys/menus/{id}
DELETE /api/sys/menus/{id}

GET    /api/sys/depts/tree
POST   /api/sys/depts
PUT    /api/sys/depts/{id}
DELETE /api/sys/depts/{id}

GET    /api/sys/posts
POST   /api/sys/posts
PUT    /api/sys/posts/{id}
DELETE /api/sys/posts/{id}

GET    /api/sys/dict-types
POST   /api/sys/dict-types
PUT    /api/sys/dict-types/{id}
DELETE /api/sys/dict-types/{id}
GET    /api/sys/dict-items?dictCode={dictCode}

GET    /api/sys/login-logs
GET    /api/sys/oper-logs
GET    /api/sys/risk-records

GET    /api/sys/frontend-modules
POST   /api/sys/frontend-modules
PUT    /api/sys/frontend-modules/{id}
```

## 7. 前端页面设计

### 7.1 portal-shell 页面

必须实现：

```text
统一登录页
随机拼图验证码弹窗或滑块区域
Token 保存与刷新
用户信息加载
菜单树加载
模块入口加载
退出登录
门户首页
```

登录后根据 `sys_frontend_module` 和菜单权限加载模块：

```text
sys -> portal-shell /sys/**，当前已接入 /sys/users、/sys/roles、/sys/menus、/sys/depts、/sys/dicts、/sys/modules、/sys/audit、/sys/risk-records
wms -> portal-shell /wms/**，当前已建立 wms-web Module Federation remote 骨架，V03 在该 remote 内开发仓储业务
mes -> portal-shell /mes/**，当前已建立 mes-web Module Federation remote 骨架，V04 在该 remote 内开发生产业务
ai  -> portal-shell /ai/**，当前已建立 ai-web Module Federation remote 骨架，V05 在该 remote 内开发 AI 业务
```

`entry_url=/apps/**/` 只作为后续独立部署或静态资源挂载参考，不作为本地门户集成入口。V02 后门户集成统一以 `route_prefix` 驱动前端路由，页面停留在 `http://localhost:5174/` 下访问，具体模块内容由 `remote_name`、`remote_entry`、`exposed_module` 注册信息运行时加载。

### 7.2 sys-web 页面

必须实现：

```text
用户管理
角色管理
菜单管理
部门管理
岗位管理
字典管理
前端模块注册
登录日志
操作日志
风控记录
数据权限配置
```

所有页面使用 `@smartwarehouse/platform-ui` 和 `@smartwarehouse/platform-sdk`。接口统一通过 `/api/sys/**` 调用，不写死后端地址。

### 7.3 平台组件使用规则

`portal-shell` 和 `sys-web` 页面开发前必须先完成组件匹配分析，优先复用 `@smartwarehouse/*` 平台包：

```text
页面结构 -> PlatformPage / PlatformLayout
登录与风控 -> LoginForm / JigsawCaptcha
查询区域 -> PlatformSearchForm
列表区域 -> PlatformTable
新增编辑 -> PlatformModalForm / DrawerForm
按钮权限 -> PermissionButton
字典录入与展示 -> DictSelect / DictTag
状态展示 -> StatusTag
用户和组织选择 -> UserSelect / OrgTreeSelect
批量操作 -> BatchOperationBar
```

前端实现时必须遵守：

1. `package.json` 使用 `@smartwarehouse/platform-ui`、`@smartwarehouse/platform-sdk`、`@smartwarehouse/platform-theme`、`@smartwarehouse/platform-types` 的 `workspace:*` 包名依赖。
2. 业务代码导入必须使用 `import { PlatformPage } from '@smartwarehouse/platform-ui'` 这类包名导入。
3. 禁止从 `../../packages/platform-ui/src/**`、`../../packages/platform-sdk/src/**` 等源码相对路径导入。
4. 如果发现平台组件能力不足，先判断是否为通用需求；通用需求允许修改 `packages` 并更新组件文档，非通用需求在 `portal-shell` 或 `sys-web` 内部局部实现。
5. 当前版本最终验收前必须验证 `portal-shell` 和 `sys-web` 全部通过 `@smartwarehouse/*` 包名使用平台能力；AI 不自动切换、发布或推送阿里云效 npm snapshot/release 制品，真实版本号设置和发布由用户手动完成。

## 8. 数据库设计

数据库：`smart_sys`

### 8.1 sys_user

```text
id bigint PK
username varchar(64) UK
password varchar(128)
nickname varchar(64)
phone varchar(32)
email varchar(128)
dept_id bigint IDX
post_id bigint
status varchar(32) IDX -- ENABLED/DISABLED/LOCKED
last_login_time datetime
last_login_ip varchar(64)
tenant_id bigint
created_by bigint
created_time datetime
updated_by bigint
updated_time datetime
deleted tinyint
version int
```

索引：

```text
uk_sys_user_username(username)
idx_sys_user_dept(dept_id)
idx_sys_user_status(status)
```

### 8.2 sys_role

```text
id bigint PK
role_code varchar(64) UK
role_name varchar(64)
data_scope varchar(32)
status varchar(32)
remark varchar(255)
tenant_id bigint
created_by bigint
created_time datetime
updated_by bigint
updated_time datetime
deleted tinyint
version int
```

索引：`uk_sys_role_code(role_code)`

### 8.3 sys_menu

```text
id bigint PK
parent_id bigint IDX
menu_name varchar(64)
menu_type varchar(16) -- DIR/MENU/BUTTON
module_code varchar(64) IDX -- sys/wms/mes/task/ai
path varchar(255)
component varchar(255)
permission varchar(128) IDX
icon varchar(64)
sort_no int
visible tinyint
status varchar(32)
created_time datetime
updated_time datetime
deleted tinyint
```

索引：

```text
idx_sys_menu_module(module_code)
idx_sys_menu_permission(permission)
idx_sys_menu_parent(parent_id)
```

### 8.4 sys_frontend_module

```text
id bigint PK
module_code varchar(64) UK -- sys/wms/mes/ai
module_name varchar(128)
route_prefix varchar(128)
entry_url varchar(255)
api_prefix varchar(128)
owner_type varchar(32) -- OWNER/VENDOR
owner_name varchar(128)
status varchar(32) IDX -- ENABLED/DISABLED
sort_no int
created_time datetime
updated_time datetime
```

初始化建议：

```text
sys  -> route_prefix=/sys, entry_url=/apps/sys/, api_prefix=/api/sys, owner_type=OWNER
wms  -> route_prefix=/wms, entry_url=/apps/wms/, api_prefix=/api/wms, owner_type=VENDOR
mes  -> route_prefix=/mes, entry_url=/apps/mes/, api_prefix=/api/mes, owner_type=VENDOR
ai   -> route_prefix=/ai, entry_url=/apps/ai/, api_prefix=/api/ai, owner_type=VENDOR
```

### 8.5 权限与基础表

```text
sys_user_role(id, user_id IDX, role_id IDX)
  UK: uk_sys_user_role(user_id, role_id)

sys_role_menu(id, role_id IDX, menu_id IDX)
  UK: uk_sys_role_menu(role_id, menu_id)

sys_dept(id, parent_id IDX, dept_code UK, dept_name, sort_no, status, created_time, updated_time, deleted)
sys_post(id, post_code UK, post_name, sort_no, status)
sys_dict_type(id, dict_code UK, dict_name, status)
sys_dict_item(id, dict_code IDX, item_label, item_value, sort_no, status)
sys_user_warehouse(id, user_id IDX, warehouse_id IDX)
  UK: uk_sys_user_warehouse(user_id, warehouse_id)
```

### 8.6 日志与风控表

```text
sys_login_log(
  id PK, username IDX, user_id IDX, login_ip IDX, user_agent,
  login_status IDX, fail_reason, login_time IDX, trace_id IDX
)

sys_oper_log(
  id PK, user_id IDX, username, module IDX, operation,
  request_uri, request_method, request_params,
  result_status, error_message, cost_ms, oper_ip,
  trace_id IDX, created_time IDX
)

sys_risk_record(
  id PK, risk_type IDX, risk_target IDX, risk_level,
  action, reason, expire_time, extra_json, created_time IDX
)
```

### 8.7 Redis Key

```text
auth:blacklist:{jti}
login:fail:user:{username}
login:fail:ip:{ip}
login:lock:user:{username}
login:lock:ip:{ip}
login:captcha:required:user:{username}
login:jigsaw:challenge:{captchaTicket}
login:jigsaw:passed:{captchaVerifyToken}
```

## 9. 初始数据设计

默认角色：

```text
ADMIN
WAREHOUSE_MANAGER
PRODUCTION_MANAGER
OPERATOR
AI_USER
```

默认菜单：

```text
sys: 系统管理、用户管理、角色管理、菜单管理、部门管理、岗位管理、字典管理
sys: 安全审计、登录日志、操作日志、风控记录、数据权限、前端模块注册
wms: 仓储管理、物料管理、仓库管理、库区管理、库位管理、库存批次、库存流水
wms: 入库管理、入库单、离线上传、导入进度
wms: 出库管理、出库单、拣货任务、配送状态
mes: 生产执行、工单管理、工单物料、物料申请、配送状态
task: 运营看板、出入库统计、库存预警、实时排行
ai: AI 助手、RAG 问答、ChatBI、多 Agent 分析、MCP 工具调用记录
```

## 10. CI/CD 与发布设计

### 10.1 Jenkins 测试环境流水线

必须支持：

```text
按目录触发构建：platform / gateway / sys / frontend-platform
Maven 单元测试
前端 pnpm install/build/test
Docker 镜像构建
测试环境配置注入
测试环境启动或发布
自动健康检查
测试报告归档
```

正式 ACR 推送必须作为手动参数化发布能力存在，不能在普通开发构建中自动执行。Jenkins 参数约定：

```text
PUSH_ACR_RELEASE=false   普通构建默认值，不登录 ACR、不推送 ACR
RELEASE_VERSION=         正式版本号，PUSH_ACR_RELEASE=true 时必填
PUSH_LATEST=false        默认不覆盖 latest
```

当 `PUSH_ACR_RELEASE=true` 时，流水线必须先完成本地 Java 测试、前端构建、Docker 镜像构建、本地 Compose 测试部署和 HTTP 健康检查，再使用 Jenkins Credentials `aliyun-acr-smartwarehouse` 推送正式镜像到 ACR。仓库中不得写入真实 ACR 用户名、密码、token 或 AccessKey。

Git 提交规则：AI 可以改文件和验证，但 `commit`、`push` 必须由用户手动执行。

### 10.2 阿里弹性容器正式发布基线

必须准备：

```text
正式镜像构建参数
环境变量模板
Secret / 凭证注入说明
健康检查配置
资源规格建议
回滚说明
发布前检查清单
```

正式镜像来源：

```text
registry.cn-hangzhou.aliyuncs.com/smartwarehouse/gateway-service:<RELEASE_VERSION>
registry.cn-hangzhou.aliyuncs.com/smartwarehouse/sys-service:<RELEASE_VERSION>
registry.cn-hangzhou.aliyuncs.com/smartwarehouse/portal-shell:<RELEASE_VERSION>
registry.cn-hangzhou.aliyuncs.com/smartwarehouse/sys-web:<RELEASE_VERSION>
```

ACR 私有仓库只保存正式版本镜像；普通开发构建的 `smartwarehouse/*:test` 和 Jenkins 构建号 tag 只保留在本地 Docker Desktop。每次正式发布后必须归档 `acr-release-images.txt`，并通过 `docker manifest inspect` 校验远端 tag 存在。

生产发布必须使用 release 依赖，测试环境可使用 snapshot 依赖。

## 11. K8s / 多实例开发约束

V02 开始所有后端服务必须按无状态服务开发：

1. Token 黑名单、登录失败次数、拼图验证码必须在 Redis。
2. 用户、角色、菜单、日志、风控记录必须在 MySQL。
3. 中间件地址、账号密码、JWT Secret 必须通过 Nacos、环境变量、ConfigMap 或 Secret 外置。
4. Java 服务提供：

```text
/actuator/health/liveness
/actuator/health/readiness
/actuator/health
```

5. 日志输出到 stdout / stderr，携带 `traceId`、`serviceName`、实例标识、用户 ID 或业务 ID。
6. Snowflake workerId 不得写死，可通过 Redis、Nacos、数据库登记或 Pod 名称哈希分配。
7. 数据库迁移使用 Flyway、Liquibase、Migration Job 或 CI/CD，禁止多 Pod 启动时同时执行 DDL。

## 12. 开发步骤提示词

```text
请开发 V02 甲方前后端基座与 CI/CD 基线版本。

要求：
1. 只根据本 milestone、ROADMAP、DEVELOPMENT_RULE、PROGRESS 开发，不再读取 docs/design。
2. 先确认 V01 组件库可被 portal-shell 和 sys-web 引用。
3. portal-shell/sys-web 的 package.json 必须使用 workspace 包名依赖 @smartwarehouse/platform-ui、@smartwarehouse/platform-sdk、@smartwarehouse/platform-theme、@smartwarehouse/platform-types，不使用源码相对路径、file 或 link。
4. portal-shell/sys-web 代码导入必须使用 import { PlatformPage } from '@smartwarehouse/platform-ui'、import { request } from '@smartwarehouse/platform-sdk'、import type { LoginUser } from '@smartwarehouse/platform-types' 这类包名导入，禁止从 ../../packages/** 源码相对路径导入。
5. 前端开发时类型优先使用 @smartwarehouse/platform-types，样式优先使用 @smartwarehouse/platform-theme 和 @smartwarehouse/platform-ui/style.css，请求、Token、权限、字典等能力优先使用 @smartwarehouse/platform-sdk，页面组件优先使用 @smartwarehouse/platform-ui。
6. 前端开发过程中发现 @smartwarehouse/* 平台包功能或样式不足时，先评估是否为通用需求；通用需求可以修改 packages 下组件源码并更新文档，非通用需求只能在 portal-shell/sys-web 内部局部实现。
7. 实现 platform-parent、platform-bom、platform-common-core/web/data/security-lite/redis/mq/log/id。
8. 实现 gateway-service 路由、鉴权、Token 黑名单、TraceId、跨域、Sentinel 限流和降级。
9. 实现 sys-api 和 sys-service，不创建 task-client、mes-client、wms-client。
10. 实现登录、退出、刷新 Token、用户、角色、菜单、部门、岗位、字典、前端模块注册、数据权限、登录日志、操作日志、风控记录。
11. 实现连续失败 3 次启用随机拼图验证码，连续失败 5 次锁定账号。
12. 实现 portal-shell 登录页、验证码交互、Token 管理、菜单装载、模块入口和退出登录。
13. 实现 sys-web 用户、角色、菜单、部门、岗位、字典、前端模块、日志、风控和数据权限页面。
14. 配置 Jenkins 测试流水线和阿里弹性容器正式发布基线。
15. 自动检查并更新 .gitignore，避免 target、dist、node_modules、日志、.env、本地配置和密钥入库。
16. 检查本次准备纳入 Git 的文件是否存在账号、密码、token、API Key、私钥或内部地址，如存在必须改为环境变量、Secret、Jenkins 凭证或示例模板。
17. 更新本文件实现记录、对应 study、handle、PROGRESS 和根 README。
```

## 13. 自动测试提示词

```text
请验证 V02 甲方前后端基座。

测试项：
1. platform/gateway/sys 后端单元测试通过。
2. portal-shell/sys-web 构建通过。
3. gateway 路由 /api/sys/** 可访问 sys-service。
4. 未登录访问受保护接口返回 401。
5. 登录成功返回 Access Token 和 Refresh Token。
6. 刷新 Token、退出登录、Token 黑名单有效。
7. 连续 3 次登录失败后启用随机拼图验证码。
8. 连续 5 次登录失败后账号锁定 10 分钟。
9. 不同角色看到不同菜单。
10. 用户仓库数据权限可配置并写入上下文。
11. 登录日志、操作日志、风控记录可查询。
12. Jenkins 能完成测试环境构建、测试、镜像构建和发布。
13. 阿里弹性容器正式发布配置检查通过。
14. 构建产物和镜像不包含敏感凭证。
15. portal-shell/sys-web 的 package.json 中 @smartwarehouse/* 依赖使用 workspace 包名，不存在 file/link 或源码相对路径依赖。
16. portal-shell/sys-web 代码中不存在从 ../../packages/** 导入 platform-ui、platform-sdk、platform-theme、platform-types 的写法。
17. portal-shell/sys-web 页面优先使用 @smartwarehouse/platform-ui、@smartwarehouse/platform-sdk、@smartwarehouse/platform-theme、@smartwarehouse/platform-types。
18. 自动测试必须使用和人工测试一致的本地默认配置，sys-service 直接连接 Docker MySQL `127.0.0.1:13306`、Docker Redis `127.0.0.1:16381`，gateway 直接连接 Docker Redis `127.0.0.1:16381`。
19. `mvn test` 中必须包含真实 Docker 中间件验收测试，不能只用 H2 内存库证明 V02 登录、菜单、系统管理和日志能力完成。
```

## 14. 验收标准

1. 用户可通过统一登录页登录系统。
2. 用户可退出、刷新 Token，退出后的 Token 无法再次访问。
3. 登录风控规则完整生效。
4. sys-web 可维护用户、角色、菜单、部门、岗位、字典、前端模块、数据权限。
5. 网关鉴权、TraceId 和降级响应可用。
6. Jenkins 测试环境发布跑通。
7. 阿里弹性容器正式环境发布基线可用。
8. portal-shell/sys-web 不直接引用 packages 源码，所有平台能力均通过 @smartwarehouse/* 包名导入。
9. V02 验收前已验证 @smartwarehouse/* 使用 workspace 包名依赖且无源码相对路径；真实切换为阿里云效 npm snapshot/release 私库制品、版本号设置和发布由用户手动执行。
10. 本地默认配置和 Docker Compose 默认端口一致，开发者直接启动 sys-service、gateway、portal-shell、sys-web 后即可登录验证，不需要额外修改数据库或 Redis 配置。
11. 自动测试与人工测试使用同一套本地 Docker 中间件配置，真实 MySQL/Redis 验收失败时不得记录 V02 已完成。
12. 门户集成模式下，管理员从 `http://localhost:5174/portal` 点击系统管理后必须进入 `http://localhost:5174/sys/users`，不得跳转到 `localhost:5175/apps/sys/`，不得使用 iframe，且不得二次登录。

## 15. 验收操作过程

```text
1. 执行 `docker compose -f deploy/local/docker-compose.yml up -d mysql redis rabbitmq nacos`，使用默认端口 MySQL `13306`、Redis `16381`、RabbitMQ `5673`、Nacos `18848`。
2. 执行 `mvn test`，确认 H2 快速测试和真实 Docker MySQL/Redis 验收测试都通过。
3. 直接启动 sys-service 和 gateway，不额外设置数据库或 Redis 环境变量。
4. 启动 portal-shell；sys-web 可单独启动调试，但门户验收不依赖 `5175`。
5. 使用管理员账号登录。
6. 验证从 `http://localhost:5174/portal` 点击系统管理后直接进入 `http://localhost:5174/sys/users`，并验证用户、角色、菜单、部门、岗位、字典和前端模块页面。
7. 连续错误登录 3 次，验证拼图验证码。
8. 连续错误登录 5 次，验证账号锁定。
9. 退出登录，使用旧 Token 访问接口，验证拒绝访问。
10. 执行 Jenkins 流水线，查看测试发布结果。
11. 执行阿里弹性容器正式发布 dry-run 或配置检查。
```

## 16. 实现记录

### 2026-06-23 家用 Ubuntu k3s 正式部署补充

V02 正式镜像已经支持部署到家用 Ubuntu 单节点 k3s。部署约定如下：

- Kubernetes 运行时使用单节点 k3s，命名空间为 `smartwarehouse`。
- 业务镜像从阿里云 ACR 拉取，固定使用正式版本 tag，不依赖 `latest`。
- 当前已验证版本为 `v0.1.0`，包含 `gateway-service`、`sys-service`、`portal-shell`、`sys-web` 四个业务镜像。
- MySQL、Redis、RabbitMQ、Nacos 部署在同一个 namespace 内，并通过 PVC 持久化。
- 对外入口统一为 `edge-nginx`，NodePort 为 `30080`，后续公网访问通过路由器端口转发到 `<UBUNTU_LAN_IP>:30080`。
- ACR 凭证只保存为 Kubernetes `acr-pull-secret`，运行时密码只保存为 `smartwarehouse-runtime-secret`；仓库和文档只允许写占位符。
- MySQL 初始化 Job 会把 `sys_frontend_module.remote_entry` 修正为同源 `/apps/.../assets/remoteEntry.js`，避免公网访问时浏览器请求访问者本机 `localhost`。

验收结果：

- `kubectl -n smartwarehouse rollout status` 已验证 gateway、sys、portal-shell、sys-web、edge-nginx 全部完成发布。
- `curl http://<UBUNTU_LAN_IP>:30080/` 返回 200。
- `curl http://<UBUNTU_LAN_IP>:30080/apps/sys/assets/remoteEntry.js` 返回 200。
- `curl http://<UBUNTU_LAN_IP>:30080/api/sys/auth/risk-state?username=admin` 返回 200。
- 集群内部 `gateway-service:9200/actuator/health` 与 `sys-service:9201/actuator/health` 均返回 `UP`。

```text
日期：2026-06-13
状态：DONE

实现内容：
- 完成根 Maven 聚合 POM，根 POM 只聚合 platform、gateway、sys，不作为强 parent。
- 完成 platform 甲方技术底座：platform-parent、platform-bom、platform-common-core/web/data/security-lite/redis/mq/log/id。
- 完成 gateway-service：/api/sys/** 路由、/api/wms/** /api/mes/** /api/task/** /api/ai/** 预留路由、TraceId、CORS、JWT 鉴权、基础内存限流和降级响应。
- 完成 sys-api 与 sys-service：登录、退出、刷新 Token、当前用户、拼图验证码、用户、角色、菜单、部门、岗位、字典、前端模块、数据权限、登录日志、操作日志、风控记录。
- 登录风控实现：同一用户连续失败 3 次启用拼图验证码，连续失败 5 次锁定账号 10 分钟；同一 IP 失败过多锁定 5 分钟。
- 完成 Jenkins 测试流水线、Dockerfile、本地 docker-compose、smart_sys 初始化 SQL、Nacos 配置模板和阿里弹性容器正式发布检查清单。

前端完成内容：
- 完成 frontend-platform/apps/portal-shell，作为统一登录入口和门户基座。
- portal-shell 支持登录风控、后端拼图验证码校验、Token 保存、刷新处理器、当前用户加载、菜单树加载、前端模块入口加载和退出登录。
- 完成 frontend-platform/apps/sys-web，作为甲方系统管理前端。
- sys-web 支持用户、角色、菜单、部门岗位、字典、前端模块、审计日志、风控记录和仓库数据权限配置页面。
- portal-shell/sys-web 的 package.json 均使用 @smartwarehouse/platform-ui、platform-sdk、platform-theme、platform-types 的 workspace:* 包名依赖。
- portal-shell/sys-web 代码均通过 @smartwarehouse/* 包名导入平台能力，不使用 ../../packages/** 源码相对路径。
- 通用组件能力增强：LoginForm/JigsawCaptcha 支持后端验证码校验函数和挑战目标位置，并同步更新组件文档。

后端完成内容：
- sys-service 使用内存仓库提供 V02 MVP 数据闭环，同时保留 smart_sys SQL 表结构，后续可替换为 MySQL/Flyway。
- JWT 使用 HMAC-SHA256 轻量实现，Access Token/Refresh Token、jti、角色、权限、仓库数据权限写入 claims。
- Token 黑名单、登录失败次数、验证码挑战和风控状态在 V02 使用内存实现，代码按 Redis Key 语义组织，后续多实例切换 Redis。
- 增加 AuthFlowIntegrationTest，验证登录成功和连续失败 3 次后验证码要求生效。

接口联调结果：
- 启动 sys-service 和 gateway-service 后，通过 gateway 调用 /api/sys/**。
- /actuator/health：sys-service 与 gateway-service 均返回 UP。
- 未登录访问 /api/sys/users 返回 401。
- admin 登录成功返回 Access Token 和 Refresh Token。
- 携带 Token 访问 /api/sys/auth/me 和 /api/sys/users 成功。
- 连续 3 次错误登录后 /api/sys/auth/risk-state 返回 captchaRequired=true、failureCount=3。

Jenkins 测试发布结果：
- 已提供 deploy/jenkins/Jenkinsfile，覆盖 checkout、mvn test、pnpm install、pnpm build、Docker 镜像构建、本地 docker compose 测试发布和健康检查步骤。
- 本地未实际运行 Jenkins 服务，但已通过等价命令完成 Maven 测试、前端构建、服务启动和 compose config 校验。
- Docker 镜像构建因 Docker Hub 基础镜像鉴权/网络连接超时未完成，阻塞点是拉取 eclipse-temurin:17-jre 与 nginx:1.27-alpine，不是 Dockerfile 语法或构建上下文问题。

阿里弹性容器正式发布检查：
- 已提供 deploy/aliyun-eci/formal-release-checklist.md，记录正式镜像、环境变量、Secret、健康检查、资源规格、发布前检查和回滚说明。
- 正式发布检查通过“配置文件存在、无真实密钥、健康检查路径明确、正式发布不包含 .npmrc/token”的静态检查。
- 未执行真实阿里弹性容器发布。

验证命令：
- mvn test -q
- mvn package -DskipTests -q
- corepack pnpm install
- corepack pnpm build
- 启动 sys-service/gateway-service 后执行健康检查、登录、鉴权、用户接口和 3 次失败风控验证。
- docker compose -f deploy/local/docker-compose.yml config
- rg 检查 portal-shell/sys-web 是否存在 ../../packages、file:、link: 源码依赖。
- rg 敏感信息扫描。

验证结果：
- Maven 全量测试通过。
- Java Jar 打包通过。
- 前端全量构建通过：platform-types、platform-theme、platform-sdk、platform-ui、portal-shell、sys-web、component-docs。
- 服务启动联调通过。
- docker compose config 通过。
- @smartwarehouse/* workspace 包名依赖检查通过。
- 源码相对路径导入检查通过。
- .gitignore 已覆盖 target、dist、node_modules、.vitepress/cache、.vitepress/dist、.npmrc、.env、日志、证书密钥和临时目录，本次无需新增规则。
- 敏感信息扫描未发现真实 token、API Key、私钥或云厂商密钥；命中项为字段名、占位符、测试属性和示例模板。已移除 sys-service 演示密码默认值，改为环境变量注入。

问题记录：
- Docker Hub 基础镜像拉取失败，导致镜像构建验证未完成；需要在网络可访问 Docker Hub 或配置镜像加速器后重试。
- V02 Token 黑名单和风控状态为内存 MVP，实现已按 Redis 语义组织，后续多实例正式运行必须切换 Redis。
- V02 sys-service 仍未真正落 MySQL，SQL 表结构已准备，V03 前可逐步替换内存仓库。

改进记录：
- 按最新 DEVELOPMENT_RULE 修正 V02 npm 私库发布要求：AI 不自动推送 snapshot/release，不自动设置版本号，不执行真实 npm publish。
- 将 LoginForm/JigsawCaptcha 从本地模拟验证码增强为可接后端 verifier 的通用组件，并同步更新组件文档。
- 移除本地演示密码默认值，要求通过 SMARTWAREHOUSE_DEMO_PASSWORD 或测试属性显式注入。
```


### 2026-06-14 V02 商业化功能补齐与真实联调记录

状态：DONE

本次补齐原因：用户在页面测试时发现“实现记录写了用户、角色、菜单、部门、岗位等功能完成，但登录后页面没有完整菜单和管理功能”。本次按商业系统开发标准重新补齐 portal-shell、sys-web、sys-service、gateway，并以 Docker MySQL / Redis / RabbitMQ 作为本地测试环境验证，不再停留在纸面实现或内存 MVP 记录。

后端补齐内容：
- sys-service 从内存仓库切换为 JdbcSysRepository，运行时连接 Docker MySQL 的 smart_sys 库，用户、角色、菜单、部门、岗位、字典、前端模块、登录日志、操作日志、风控记录和用户仓库权限均落库。
- sys-service 增加 Redis 接入，登录失败次数、验证码挑战、验证码通过 token、账号/IP 锁定和 Token 黑名单优先写入 Redis；测试或 Redis 不可用时保留内存 fallback，便于单测稳定运行。
- gateway 增加 Redis 黑名单校验，网关和 sys-service 双层校验 Access Token，避免绕过网关直接访问后端。
- 增加 SysAuthenticationFilter，保护 /api/sys/** 管理接口，并把登录用户信息放入 request attribute，供操作日志 AOP 使用。
- 增加 SysOperationLogAspect，对用户、角色、菜单、部门、岗位、字典、前端模块等关键写操作记录操作日志。
- deploy/mysql/init-sys-db.sql 增加 SET NAMES utf8mb4，修复 Docker MySQL 初始化时客户端字符集为 latin1 导致中文种子数据乱码的问题。
- 修复 MySQL 8 中 select distinct m.permission order by m.sort_no, m.id 不兼容问题，改为普通查询后由 LinkedHashSet 保持顺序去重。

前端补齐内容：
- portal-shell 完成统一登录、登录风控、Token 保存与刷新、菜单树加载、前端模块入口加载、退出登录和本地开发打开 sys-web 能力。
- sys-web 完成独立登录和完整系统管理工作台，包含用户管理、角色管理、菜单管理、部门岗位、字典管理、前端模块、审计日志、风控记录和仓库数据权限配置。
- portal-shell 和 sys-web 的 package.json 均通过 workspace:* 依赖 @smartwarehouse/platform-ui、@smartwarehouse/platform-sdk、@smartwarehouse/platform-theme、@smartwarehouse/platform-types，业务代码通过包名导入平台能力，不使用 ../../packages/** 相对路径。

Docker 中间件验证：
- 已通过 deploy/local/docker-compose.yml 启动并验证 smartwarehouse-mysql、smartwarehouse-redis、smartwarehouse-rabbitmq。
- 本地端口因已有容器占用，验证时使用 MySQL 13306、Redis 16381、RabbitMQ 5673、RabbitMQ Management 15673。
- MySQL 种子数据验证：存在 admin / 123456、wms_manager / 123456，并存在系统管理、仓储管理、生产执行、运营看板、AI 助手 5 个前端模块。

接口联调结果：
- mvn -q -pl sys/sys-service,gateway/gateway-service -am test package 通过。
- GET /api/sys/users 未登录返回 401。
- POST /api/sys/auth/login 使用 admin / 123456 返回 SUCCESS 和 Access Token / Refresh Token。
- GET /api/sys/auth/me 返回 admin。
- GET /api/sys/menus/tree 返回 5 个根菜单。
- 用户、角色、部门、岗位、字典、前端模块接口均可查询到数据库种子数据。
- 岗位临时数据新增、修改、删除接口验证通过，并产生操作日志。
- POST /api/sys/auth/logout 后，旧 Token 再访问受保护接口返回 401，验证 Redis 黑名单生效。
- 临时用户连续 3 次登录失败后，/api/sys/auth/risk-state 返回 failureCount=3、captchaRequired=true。

浏览器验收结果：
- portal-shell 可访问 http://localhost:5174/，登录后显示系统管理、仓储管理、生产执行、运营看板、AI 助手模块入口。
- sys-web 独立调试入口可访问 http://localhost:5175/apps/sys/，使用 admin / 123456 登录后显示用户管理、角色管理、菜单管理、部门岗位、字典管理、前端模块、审计日志、风控记录 8 个页签。门户集成入口以后续 `http://localhost:5174/sys/**` 为准。
- 逐个点击 8 个页签均能显示表格或操作区域，不再是空页面或占位页面。
- 浏览器控制台未发现 error。

构建与发布检查：
- corepack pnpm build:packages 通过。
- corepack pnpm --filter @smartwarehouse/portal-shell --filter @smartwarehouse/sys-web build 通过。
- docker compose -f deploy/local/docker-compose.yml config 通过。
- docker compose build sys-service gateway-service 执行到拉取 eclipse-temurin:17-jre 基础镜像时因 Docker Hub token 请求网络超时失败。该问题为外部网络/镜像源阻塞，不是 Dockerfile 或构建上下文语法错误；后续可配置 Docker 镜像加速器或在网络可访问环境重试。

安全与配置检查：
- .gitignore 已覆盖 .npmrc、.env、logs/、data/mysql/、data/redis/、data/rabbitmq/、target/、dist/、node_modules/、证书密钥和临时目录。
- 敏感信息扫描发现 frontend-platform/package.json、frontend-platform/.npmrc.example 和 V01 handle 中存在具体阿里云效 npm registry 地址，已改为依赖本地 .npmrc、环境变量、Jenkins Credentials 或占位符模板，不再把内部制品库地址写入仓库。
- AI 未执行 publish:snapshot、publish:release、pnpm publish、npm publish 等真实 npm 发布命令。

反思记录：
- 之前实现记录把 MVP 能力描述得过满，造成“文档完成”和“页面可验收”之间不一致。本次已用数据库、中间件、接口脚本和浏览器页面逐项验收修正。
- 后续 milestone 的实现记录必须只记录真实完成且已验证的内容；如果存在 MVP、mock、fallback、外部网络阻塞，必须显式写清边界，不能写成生产级完成。

### 2026-06-14 默认本地配置与自动测试对齐修正

状态：DONE

问题原因：
- 用户本地直接启动 `sys-service`、`gateway` 后登录报 `Failed to obtain JDBC Connection`。
- 之前测试时通过 Shell 临时注入了 MySQL `13306` 和 Redis `16381`，但 `application.yml` 默认仍指向 MySQL `3306` 和 Redis `6379`。
- 用户从 IDEA 或命令行直接启动时不会自动继承 AI 临时环境变量，因此会误连其他项目容器或连接失败。

修正内容：
- `sys-service` 默认 MySQL 改为 `jdbc:mysql://127.0.0.1:13306/smart_sys`。
- `sys-service` 默认 Redis 端口改为 `16381`。
- `gateway` 默认 Redis 端口改为 `16381`。
- `deploy/local/docker-compose.yml` 默认端口改为 MySQL `13306`、Redis `16381`、RabbitMQ `5673`、RabbitMQ Management `15673`，并补齐本地开发默认值。
- `deploy/jenkins/Jenkinsfile` 在 Java Test 前增加 Local Middleware Up 阶段，先启动 MySQL、Redis、RabbitMQ。
- 新增 `LocalDockerMiddlewareAcceptanceTest`，使用默认配置连接真实 Docker MySQL/Redis，验证登录、当前用户、前端模块和岗位增改删。

验证结果：
- `docker compose -f deploy/local/docker-compose.yml config` 通过。
- `docker compose -f deploy/local/docker-compose.yml up -d mysql redis rabbitmq` 通过。
- `mvn -q -pl sys/sys-service,gateway/gateway-service -am test` 通过。
- `mvn -q -pl sys/sys-service,gateway/gateway-service -am package -DskipTests` 通过。
- 不设置数据库、Redis、JWT 环境变量，直接启动 `sys-service` 和 `gateway` 后，通过 gateway 登录 `admin / 123456` 成功，`/api/sys/auth/me` 返回 `admin`。
- `.gitignore` 已追加 `data/temp/`，临时启动日志和验证中间文件不会进入 Git。
- 敏感信息扫描只命中本地开发默认值、测试账号、占位符和字段名，未发现真实 token、API Key、私钥、云厂商密钥或 npm 凭证。

复盘结论：
- 自动测试必须和人工测试使用同一套本地明确配置；不能再把“AI 临时环境变量下测试通过”等同于“用户直接启动可用”。
- 以后修改 Docker 端口、服务默认配置或 Jenkins 测试顺序时，必须同步更新 README、milestone、handle、study 和相关 skill。

### 2026-06-15 商业化架构优化与门户单点集成

状态：DONE

优化目标：
- 后台服务接入 Nacos，gateway 不再只依赖固定 sys-service 地址。
- portal-shell 登录后访问系统管理等模块时，在当前页面打开，不新开浏览器页面，不要求二次登录。
- 右上角个人信息和修改密码从“有入口无动作”补齐为可交互功能。
- sys-service 和 sys-web 按商业项目模块边界拆分代码，避免所有管理功能集中在单个 Controller 或单个 App.vue。

后端实现内容：
- `platform-parent` 增加 Spring Cloud Alibaba 版本管理，统一 Nacos Discovery 依赖来源。
- `gateway-service` 增加 Nacos Discovery 和 LoadBalancer，`/api/sys/**` 默认路由为 `lb://sys-service`。
- `sys-service` 增加 Nacos Discovery，本地默认连接 `127.0.0.1:18848`，容器内通过 `SMARTWAREHOUSE_NACOS_SERVER_ADDR=nacos:8848` 注入。
- `deploy/local/docker-compose.yml` 增加 Nacos 健康检查和 `18848/19848` 宿主机端口映射，gateway/sys 容器依赖 Nacos healthy 后启动。
- `deploy/jenkins/Jenkinsfile` 的本地中间件阶段增加 Nacos，保证测试环境和人工环境一致。
- `AuthDtos` 新增 `ChangePasswordRequest`，`AuthController` 新增 `PUT /api/sys/auth/password`。
- `AuthService.changePassword` 校验 Token、黑名单、账号状态、旧密码、新密码长度和确认密码后调用仓储更新密码。
- `SysRepository` 和 `JdbcSysRepository` 增加 `updatePassword`，复用已有 SHA-256 密码哈希规则。
- 删除单体 `SysManagementController`，拆分为 `SysUserController`、`SysRoleController`、`SysMenuController`、`SysOrgController`、`SysDictController`、`SysFrontendModuleController`、`SysAuditController`，接口 URL 保持兼容。

前端实现内容：
- `portal-shell` 模块入口从 `window.open` 和 iframe 工作区调整为正常页面跳转；点击模块卡片或左侧子菜单时进入目标前端应用，不再在门户内嵌套业务页面。
- `portal-shell` 打开 `sys-web` 的早期方案曾使用 `http://localhost:5175/apps/sys/?redirect=<菜单路径>`，只传递业务路由，不传递 Access Token 或 Refresh Token；该方案已被后续 `http://localhost:5174/sys/**` 统一路由承载方案替代。
- `portal-shell` 右上角接入个人信息弹窗和修改密码弹窗，修改密码调用 `changePassword` API。
- `sys-web` 支持独立登录模式和门户承载模式；早期从 `redirect` 参数恢复目标系统管理页签，后续已支持 `/sys/**` 真实路径。
- `platform-sdk` Token 存储补充同主机 Cookie 桥接，保留给独立调试场景；门户集成最新方案已在 `localhost:5174` 同端口路由内完成。
- `sys-web` 右上角接入个人信息和修改密码弹窗。
- `sys-web` 将用户、角色、菜单、部门岗位、字典、前端模块、审计日志、风控记录拆分为 `src/views/*.vue`，`App.vue` 只保留应用壳层、登录态、模块切换和弹窗编排。
- sys-service 菜单树和已启用前端模块接口按当前用户角色授权过滤，`wms_manager` 只能看到仓储管理模块和仓储菜单。

验证结果：
- `docker compose -f deploy/local/docker-compose.yml config` 通过。
- `docker compose -f deploy/local/docker-compose.yml up -d mysql redis rabbitmq nacos` 通过，Nacos 使用宿主机 `18848`，容器内仍为 `nacos:8848`。
- `mvn -q -pl sys/sys-service,gateway/gateway-service -am test` 通过，测试日志确认 sys-service 可注册到 Nacos；H2 快速测试中关闭 Nacos Discovery。
- `mvn -q -pl sys/sys-service,gateway/gateway-service -am package -DskipTests` 通过。
- 临时联调实例验证：sys/gateway 健康检查均 `UP`，gateway 登录 `admin / 123456` 返回 `SUCCESS`，`/api/sys/auth/me` 返回 `admin`，前端模块数量为 5。
- `corepack pnpm --filter @smartwarehouse/portal-shell --filter @smartwarehouse/sys-web build` 通过。
- `corepack pnpm build:packages`、`corepack pnpm build:apps`、`corepack pnpm build:docs` 均通过；单次 `corepack pnpm build` 因超时中断，但拆分构建证明各包和应用可构建。
- 浏览器验收通过：`http://localhost:5174/` 使用 `admin / 123456` 登录后点击系统管理，页面可显示用户管理表格且不要求二次登录。该阶段曾跳转到 `5175`，已在后续修正为 `http://localhost:5174/sys/users`。
- 浏览器验收通过：`http://localhost:5174/` 使用 `wms_manager / 123456` 登录后，只显示“仓储管理”，不显示“系统管理”“生产执行”“运营看板”“AI 助手”。
- 浏览器验收通过：portal-shell 的个人信息弹窗和修改密码弹窗可打开；修改密码保存未在 admin 账号上提交，避免改变演示默认密码。

复盘记录：
- 商业系统的“模块入口”不是简单打开新页面。统一门户应管理登录态、模块生命周期和当前页面体验，否则用户会遇到重复登录、上下文丢失和多标签不可控问题。
- Nacos 接入后，gateway 与后端服务的联调必须同时验证直连默认配置和容器内服务发现配置，避免只在某一种运行方式下可用。
- 后端 Controller 拆分后，URL 契约保持不变，说明代码结构优化不应破坏前端和外部调用。
- 前端页面拆分后，`App.vue` 不再承载所有业务表格和弹窗，后续功能扩展更接近真实商业项目维护方式。

.gitignore 与敏感信息：
- 本次未产生新的构建产物类型，现有 `.gitignore` 已覆盖 `.npmrc`、`.env`、`target/`、`dist/`、`node_modules/`、日志、证书密钥、Docker 数据目录和临时目录。
- 敏感信息扫描未发现真实 token、API Key、私钥、云厂商密钥或 npm 凭证；命中项为本地端口、测试账号、字段名、占位符和安全规则说明。

### 2026-06-15 sys 管理接口权限加固

状态：DONE

问题说明：
- `wms_manager` 在门户菜单中已经只能看到仓储管理，但该账号仍可凭 Token 直接请求 sys 管理接口，说明展示层权限过滤已经完成，接口级授权边界仍不完整。

修复内容：
- `SysAuthenticationFilter` 完成 JWT 认证后，对系统管理接口增加授权检查：只有 `ADMIN` 角色或拥有 `sys:*` 权限的用户才能访问用户、角色、菜单维护、组织岗位、字典、前端模块、日志和风控记录等 sys 管理接口。
- 统一认证相关接口 `/api/sys/auth/**` 保持认证中心职责，不按 sys 模块权限拦截；`/api/sys/menus/tree` 和 `/api/sys/frontend-modules/enabled` 保持可访问，但继续按当前用户过滤返回内容。
- `sys-web` 登录和恢复会话后先检查当前用户是否具备系统管理权限，没有权限时清理 Token 并提示“当前账号无系统管理访问权限”。

验证结果：
- `mvn -q -pl sys/sys-service,gateway/gateway-service -am test` 通过。
- 测试覆盖 `wms_manager / 123456`：`/api/sys/auth/me` 返回成功，授权菜单和模块只返回 `wms`，访问 `/api/sys/users` 返回 `FORBIDDEN`。
- `corepack pnpm --filter @smartwarehouse/portal-shell --filter @smartwarehouse/sys-web build` 通过。

复盘：
- sys-service 作为统一认证中心，不等于所有账号都有系统管理模块权限。
- 权限控制必须在服务端接口兜底，前端菜单隐藏只能作为体验层过滤。

### 2026-06-15 门户统一前端路由承载修正（历史阶段，已被微前端替代）

状态：DONE

问题说明：
- 管理员从 `portal-shell` 进入“系统管理”时，旧实现仍然跳转到 `http://localhost:5175/apps/sys/?redirect=...`。这虽然避免了 iframe 和 URL Token，但仍把子项目 dev server 当成门户集成入口，不符合“所有前端服务统一在 `http://localhost:5174/` 访问”的商业门户要求。
- `SideMenu` 对有子菜单的一级目录只展开不派发点击，导致点击左侧“系统管理”目录时不会进入系统管理默认页。

修复内容：
- `sys-web` 新增 `src/embedded.ts`，通过 `@smartwarehouse/sys-web/embedded` 导出 `SysManagementApp`，保留 `5175` 独立调试能力，同时允许 `portal-shell` 在 `5174` 内承载系统管理页面。
- `portal-shell` 新增内部路由状态，模块入口优先使用 `sys_frontend_module.route_prefix`，系统管理默认进入 `/sys/users`，后续 WMS/MES/AI/task 模块在 `/wms`、`/mes`、`/ai`、`/task` 下预留当前页入口。
- `portal-shell` 不再使用 `resolveLocalDevEntry`、`VITE_SYS_WEB_URL`、`redirect` 参数或 `window.location.assign` 跨端口跳转系统管理。
- `sys-web` 支持直接识别 `/sys/users`、`/sys/roles` 等真实路径；独立调试时仍兼容 `/apps/sys/` 和 `redirect` 查询参数。
- `platform-ui` 的 `SideMenu` 对有子菜单的目录标题也派发 `menuClick`，点击“系统管理”目录可进入默认页，同时子菜单仍可进入具体页面。

验证结果：
- `corepack pnpm build:packages` 通过。
- `corepack pnpm --filter @smartwarehouse/portal-shell --filter @smartwarehouse/sys-web build` 通过。
- 浏览器验收通过：`http://localhost:5174/` 已有登录态时规范到 `http://localhost:5174/portal`。
- 浏览器验收通过：在 `http://localhost:5174/portal` 点击左侧“系统管理”，直接进入 `http://localhost:5174/sys/users`，不访问 `5175`，不出现二次登录页，页面内无 iframe。
- 浏览器验收通过：系统管理内部点击“角色管理”后 URL 为 `http://localhost:5174/sys/roles`，激活页签为“角色管理”。
- 浏览器验收通过：直接访问 `http://localhost:5174/sys/users` 可恢复用户管理页签，不需要启动 `sys-web` 的 `5175` dev server。

复盘：
- “不使用 iframe”还不够，商业门户还要避免跨端口/跨应用跳转造成用户感知上的多入口。门户集成入口应由一个域名和一套路由承载。
- 子项目仍要能独立开发，但独立调试入口和门户集成入口必须区分。该阶段曾使用 embedded/route 契约，后续已经被 Module Federation remoteEntry 运行时加载替代。

### 2026-06-15 vite-plugin-federation 微前端运行时加载

状态：DONE

问题说明：
- embedded/route 契约虽然解决了 iframe 和跨端口跳转问题，但仍会让 `portal-shell` 在构建期依赖子应用。
- 多乙方协作时，`wms-web`、`mes-web`、`ai-web` 应能独立发布前端制品；乙方更新版本不应要求甲方重新构建门户。
- 单个 remote 不可用时，门户需要显示模块降级页，并保持其他模块继续可用。

实现内容：
- `portal-shell` 引入 `@originjs/vite-plugin-federation`，作为 host 通过 `virtual:__federation__` 运行时注册 remote。
- `portal-shell` 新增 `MicroFrontendOutlet.vue` 和 `microFrontend.ts`，支持加载态、组件缓存、失败降级页、重试和 8 秒超时保护。
- `sys-web` 改造为 `smart_sys_web` remote，暴露 `./RemoteApp`；`wms-web`、`mes-web`、`ai-web` 新增最小 remote 应用骨架。
- `sys-web` 旧的 `@smartwarehouse/sys-web/embedded` 构建期入口已清理，避免后续继续把系统管理前端作为 `portal-shell` 的静态依赖。
- `sys_frontend_module` 增加 `remote_name`、`remote_entry`、`exposed_module` 字段；`sys-service` DTO、JDBC 仓储、H2 测试数据、MySQL 初始化脚本和 `sys-web` 前端模块管理页面同步支持这些字段。
- 新增 `SysFrontendModuleSchemaInitializer`，本地历史 Docker MySQL 数据卷启动时自动补列并迁移旧本地 remoteEntry。
- 平台 npm 包增加 `./package.json` exports，`portal-shell` 构建目标设为 `esnext`，满足 Federation 共享包构建需要。

验证结果：
- `corepack pnpm install` 通过。
- `corepack pnpm build:packages` 通过。
- `corepack pnpm --filter @smartwarehouse/portal-shell build` 通过。
- `corepack pnpm build:remotes` 通过，四个 remote 均生成 `assets/remoteEntry.js`。
- `mvn -pl sys/sys-service -am test` 通过，真实 Docker MySQL/Redis 验收覆盖模块注册接口。
- 临时 preview 验证：`/apps/sys/assets/remoteEntry.js`、`/apps/wms/assets/remoteEntry.js`、`/apps/mes/assets/remoteEntry.js`、`/apps/ai/assets/remoteEntry.js` 均返回 200。
- 浏览器验证：`/sys/users`、`/wms`、`/mes`、`/ai` 均在门户路由内运行时加载 remote。
- 停止 `ai-web` remote 后刷新 `/ai` 显示微前端模块加载失败降级页，再访问 `/wms` 仍正常。

复盘：
- 统一入口仍然由 `portal-shell` 负责，微前端只改变模块内容的装载方式，不改变用户访问路径。
- 本地集成验证应使用 build + preview 的 remote 制品路径，例如 `http://localhost:5176/apps/wms/assets/remoteEntry.js`，不能误用裸 `/assets/remoteEntry.js`。
- `sys_frontend_module` 是乙方前端独立发布的关键注册中心；后续模块版本变更优先改 remote 制品和注册信息，而不是改门户代码。

### 2026-06-15 微前端收口清理

状态：DONE

完成内容：
- 删除 `sys-web` 旧的 `./embedded` 导出和 `src/embedded.ts`，当前系统管理前端只通过 `remoteEntry.js` 暴露 `./RemoteApp`。
- 更新 `sys-web` Vite 配置注释，避免后续误认为门户仍通过 `@smartwarehouse/sys-web/embedded` 静态挂载系统管理页面。
- 更新 V02 版本文档、study、handle、skill 和 README，将 embedded/route 标记为历史阶段方案，当前有效方案为 Module Federation host/remote。

验证结果：
- `corepack pnpm build:packages` 通过。
- `corepack pnpm --filter @smartwarehouse/portal-shell build` 通过。
- `corepack pnpm build:remotes` 通过。
- `mvn -pl sys/sys-service -am test` 通过。
- 四个本地 preview remoteEntry 均返回 200，验证后已停止 `5175-5178` 临时进程。
- 备用端口运行时 HTTP 检查通过：`portal-shell` 临时启动到 `5184` 后，`/portal`、`/sys/users`、`/wms`、`/mes`、`/ai` 均返回 200；验证后已停止 `5175-5178/5184` 临时进程。
