# V02 甲方前后端基座与 CI/CD 基线

## 1. 版本状态

```text
状态：TODO
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
sys -> /apps/sys/ -> /sys
wms -> /apps/wms/ -> /wms
mes -> /apps/mes/ -> /mes
ai  -> /apps/ai/  -> /ai
```

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
3. 实现 platform-parent、platform-bom、platform-common-core/web/data/security-lite/redis/mq/log/id。
4. 实现 gateway-service 路由、鉴权、Token 黑名单、TraceId、跨域、Sentinel 限流和降级。
5. 实现 sys-api 和 sys-service，不创建 task-client、mes-client、wms-client。
6. 实现登录、退出、刷新 Token、用户、角色、菜单、部门、岗位、字典、前端模块注册、数据权限、登录日志、操作日志、风控记录。
7. 实现连续失败 3 次启用随机拼图验证码，连续失败 5 次锁定账号。
8. 实现 portal-shell 登录页、验证码交互、Token 管理、菜单装载、模块入口和退出登录。
9. 实现 sys-web 用户、角色、菜单、部门、岗位、字典、前端模块、日志、风控和数据权限页面。
10. 配置 Jenkins 测试流水线和阿里弹性容器正式发布基线。
11. 自动检查并更新 .gitignore，避免 target、dist、node_modules、日志、.env、本地配置和密钥入库。
12. 检查本次准备纳入 Git 的文件是否存在账号、密码、token、API Key、私钥或内部地址，如存在必须改为环境变量、Secret、Jenkins 凭证或示例模板。
13. 更新本文件实现记录、对应 study、handle、PROGRESS 和根 README。
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
```

## 14. 验收标准

1. 用户可通过统一登录页登录系统。
2. 用户可退出、刷新 Token，退出后的 Token 无法再次访问。
3. 登录风控规则完整生效。
4. sys-web 可维护用户、角色、菜单、部门、岗位、字典、前端模块、数据权限。
5. 网关鉴权、TraceId 和降级响应可用。
6. Jenkins 测试环境发布跑通。
7. 阿里弹性容器正式环境发布基线可用。

## 15. 验收操作过程

```text
1. 启动 MySQL、Redis、Nacos、Sentinel、gateway-service、sys-service。
2. 启动 portal-shell 和 sys-web。
3. 使用管理员账号登录。
4. 验证用户、角色、菜单、部门、岗位、字典和前端模块页面。
5. 连续错误登录 3 次，验证拼图验证码。
6. 连续错误登录 5 次，验证账号锁定。
7. 退出登录，使用旧 Token 访问接口，验证拒绝访问。
8. 执行 Jenkins 流水线，查看测试发布结果。
9. 执行阿里弹性容器正式发布 dry-run 或配置检查。
```

## 16. 实现记录

```text
日期：
实现内容：
前端完成内容：
后端完成内容：
接口联调结果：
Jenkins 测试发布结果：
阿里弹性容器正式发布检查：
验证命令：
验证结果：
问题记录：
改进记录：
```
