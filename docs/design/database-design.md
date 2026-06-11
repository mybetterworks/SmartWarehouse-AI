# SmartWarehouse-AI 数据库设计说明书

## 1. 文档说明

### 1.1 文档目的

本文档描述 SmartWarehouse-AI 的数据库划分、表结构、字段设计、索引设计、数据约束、关系设计和初始化建议，为数据库建模、开发和测试提供依据。

### 1.2 数据库命名

| 数据库 | 所属服务 | 说明 |
|---|---|---|
| `smart_sys` | sys-service | 系统权限、登录风控、日志。 |
| `smart_wms` | wms-service | 仓储、物料、库存、入库、出库。 |
| `smart_mes` | mes-service | 工单、物料申请、配送状态。 |
| `smart_task` | task-service | 定时任务、统计、排行、补偿。 |
| `smart_ai` | ai-service | 知识库、问答、ChatBI、MCP 日志。 |

### 1.3 通用字段规范

业务表建议包含以下通用字段：

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | bigint | 主键 ID。 |
| `tenant_id` | bigint | 租户 ID，MVP 可默认 1。 |
| `created_by` | bigint | 创建人。 |
| `created_time` | datetime | 创建时间。 |
| `updated_by` | bigint | 更新人。 |
| `updated_time` | datetime | 更新时间。 |
| `deleted` | tinyint | 逻辑删除，0 未删除，1 已删除。 |
| `version` | int | 乐观锁版本号。 |

### 1.4 命名规范

- 表名使用小写下划线。
- 主键统一使用 `id`。
- 编码字段使用 `code` 或业务前缀，例如 `work_order_no`。
- 状态字段使用 `status`。
- 金额、数量使用 decimal。
- 时间字段使用 datetime。
- JSON 扩展字段使用 `extra_json`。

## 2. smart_sys 数据库

### 2.1 sys_user

用户表。

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| `id` | bigint | PK | 用户 ID |
| `username` | varchar(64) | UK | 登录账号 |
| `password` | varchar(128) |  | 密码密文 |
| `nickname` | varchar(64) |  | 用户昵称 |
| `phone` | varchar(32) |  | 手机号 |
| `email` | varchar(128) |  | 邮箱 |
| `dept_id` | bigint | IDX | 部门 ID |
| `post_id` | bigint |  | 岗位 ID |
| `status` | varchar(32) | IDX | ENABLED、DISABLED、LOCKED |
| `last_login_time` | datetime |  | 最后登录时间 |
| `last_login_ip` | varchar(64) |  | 最后登录 IP |
| `tenant_id` | bigint |  | 租户 ID |
| `created_by` | bigint |  | 创建人 |
| `created_time` | datetime |  | 创建时间 |
| `updated_by` | bigint |  | 更新人 |
| `updated_time` | datetime |  | 更新时间 |
| `deleted` | tinyint |  | 逻辑删除 |
| `version` | int |  | 版本号 |

索引：

```text
uk_sys_user_username(username)
idx_sys_user_dept(dept_id)
idx_sys_user_status(status)
```

### 2.2 sys_role

角色表。

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| `id` | bigint | PK | 角色 ID |
| `role_code` | varchar(64) | UK | 角色编码 |
| `role_name` | varchar(64) |  | 角色名称 |
| `data_scope` | varchar(32) |  | 数据权限范围 |
| `status` | varchar(32) |  | 状态 |
| `remark` | varchar(255) |  | 备注 |
| `tenant_id` | bigint |  | 租户 ID |
| `created_by` | bigint |  | 创建人 |
| `created_time` | datetime |  | 创建时间 |
| `updated_by` | bigint |  | 更新人 |
| `updated_time` | datetime |  | 更新时间 |
| `deleted` | tinyint |  | 逻辑删除 |
| `version` | int |  | 版本号 |

索引：

```text
uk_sys_role_code(role_code)
```

### 2.3 sys_menu

菜单表。

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| `id` | bigint | PK | 菜单 ID |
| `parent_id` | bigint | IDX | 父菜单 ID |
| `menu_name` | varchar(64) |  | 菜单名称 |
| `menu_type` | varchar(16) |  | DIR、MENU、BUTTON |
| `module_code` | varchar(64) | IDX | 前端模块编码，例如 sys、wms、mes、ai |
| `path` | varchar(255) |  | 路由路径 |
| `component` | varchar(255) |  | 前端组件 |
| `permission` | varchar(128) | IDX | 权限标识 |
| `icon` | varchar(64) |  | 图标 |
| `sort_no` | int |  | 排序 |
| `visible` | tinyint |  | 是否可见 |
| `status` | varchar(32) |  | 状态 |
| `created_time` | datetime |  | 创建时间 |
| `updated_time` | datetime |  | 更新时间 |
| `deleted` | tinyint |  | 逻辑删除 |

索引：

```text
idx_sys_menu_module(module_code)
idx_sys_menu_permission(permission)
idx_sys_menu_parent(parent_id)
```

说明：

- `module_code=sys` 的菜单由 `frontend-platform/apps/sys-web` 渲染。
- `module_code=wms` 的菜单由 `wms-web` 渲染。
- `module_code=mes` 的菜单由 `mes-web` 渲染。
- `module_code=ai` 的菜单由 `ai-web` 渲染。
- `portal-shell` 登录后根据用户菜单和 `module_code` 组装模块入口。

### 2.3.1 sys_frontend_module

前端模块注册表，用于 `portal-shell` 动态加载各前端项目入口。

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| `id` | bigint | PK | 模块 ID |
| `module_code` | varchar(64) | UK | 模块编码，例如 sys、wms、mes、ai |
| `module_name` | varchar(128) |  | 模块名称 |
| `route_prefix` | varchar(128) |  | 前端路由前缀，例如 /sys、/wms、/mes、/ai |
| `entry_url` | varchar(255) |  | 模块入口地址，例如 /apps/wms/ |
| `api_prefix` | varchar(128) |  | API 前缀，例如 /api/wms |
| `owner_type` | varchar(32) |  | OWNER、VENDOR |
| `owner_name` | varchar(128) |  | 甲方或乙方名称 |
| `status` | varchar(32) | IDX | ENABLED、DISABLED |
| `sort_no` | int |  | 排序 |
| `created_time` | datetime |  | 创建时间 |
| `updated_time` | datetime |  | 更新时间 |

初始化建议：

```text
sys  -> route_prefix=/sys, entry_url=/apps/sys/, api_prefix=/api/sys, owner_type=OWNER
wms  -> route_prefix=/wms, entry_url=/apps/wms/, api_prefix=/api/wms, owner_type=VENDOR
mes  -> route_prefix=/mes, entry_url=/apps/mes/, api_prefix=/api/mes, owner_type=VENDOR
ai   -> route_prefix=/ai, entry_url=/apps/ai/, api_prefix=/api/ai, owner_type=VENDOR
```

### 2.4 sys_user_role

用户角色关系表。

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| `id` | bigint | PK | ID |
| `user_id` | bigint | IDX | 用户 ID |
| `role_id` | bigint | IDX | 角色 ID |

唯一索引：

```text
uk_sys_user_role(user_id, role_id)
```

### 2.5 sys_role_menu

角色菜单关系表。

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| `id` | bigint | PK | ID |
| `role_id` | bigint | IDX | 角色 ID |
| `menu_id` | bigint | IDX | 菜单 ID |

唯一索引：

```text
uk_sys_role_menu(role_id, menu_id)
```

### 2.6 sys_dept

部门表。

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| `id` | bigint | PK | 部门 ID |
| `parent_id` | bigint | IDX | 父部门 ID |
| `dept_code` | varchar(64) | UK | 部门编码 |
| `dept_name` | varchar(64) |  | 部门名称 |
| `sort_no` | int |  | 排序 |
| `status` | varchar(32) |  | 状态 |
| `created_time` | datetime |  | 创建时间 |
| `updated_time` | datetime |  | 更新时间 |
| `deleted` | tinyint |  | 逻辑删除 |

### 2.7 sys_post

岗位表。

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| `id` | bigint | PK | 岗位 ID |
| `post_code` | varchar(64) | UK | 岗位编码 |
| `post_name` | varchar(64) |  | 岗位名称 |
| `sort_no` | int |  | 排序 |
| `status` | varchar(32) |  | 状态 |

### 2.8 sys_dict_type 和 sys_dict_item

字典类型表 `sys_dict_type`：

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| `id` | bigint | PK | ID |
| `dict_code` | varchar(64) | UK | 字典编码 |
| `dict_name` | varchar(64) |  | 字典名称 |
| `status` | varchar(32) |  | 状态 |

字典项表 `sys_dict_item`：

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| `id` | bigint | PK | ID |
| `dict_code` | varchar(64) | IDX | 字典编码 |
| `item_label` | varchar(64) |  | 字典标签 |
| `item_value` | varchar(64) |  | 字典值 |
| `sort_no` | int |  | 排序 |
| `status` | varchar(32) |  | 状态 |

### 2.9 sys_user_warehouse

用户仓库权限表。

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| `id` | bigint | PK | ID |
| `user_id` | bigint | IDX | 用户 ID |
| `warehouse_id` | bigint | IDX | 仓库 ID |

唯一索引：

```text
uk_sys_user_warehouse(user_id, warehouse_id)
```

### 2.10 sys_login_log

登录日志表。

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| `id` | bigint | PK | ID |
| `username` | varchar(64) | IDX | 用户名 |
| `user_id` | bigint | IDX | 用户 ID |
| `login_ip` | varchar(64) | IDX | 登录 IP |
| `user_agent` | varchar(512) |  | 浏览器 UA |
| `login_status` | varchar(32) | IDX | SUCCESS、FAIL |
| `fail_reason` | varchar(255) |  | 失败原因 |
| `login_time` | datetime | IDX | 登录时间 |
| `trace_id` | varchar(64) | IDX | TraceId |

### 2.11 sys_oper_log

操作日志表。

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| `id` | bigint | PK | ID |
| `user_id` | bigint | IDX | 操作用户 |
| `username` | varchar(64) |  | 用户名 |
| `module` | varchar(64) | IDX | 模块 |
| `operation` | varchar(128) |  | 操作 |
| `request_uri` | varchar(255) |  | 请求 URI |
| `request_method` | varchar(16) |  | 请求方法 |
| `request_params` | text |  | 请求参数 |
| `result_status` | varchar(32) |  | SUCCESS、FAIL |
| `error_message` | varchar(512) |  | 错误信息 |
| `cost_ms` | bigint |  | 耗时 |
| `oper_ip` | varchar(64) |  | 操作 IP |
| `trace_id` | varchar(64) | IDX | TraceId |
| `created_time` | datetime | IDX | 创建时间 |

### 2.12 sys_risk_record

风控记录表。

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| `id` | bigint | PK | ID |
| `risk_type` | varchar(64) | IDX | 风控类型 |
| `risk_target` | varchar(128) | IDX | 风控对象，例如账号或 IP |
| `risk_level` | varchar(32) |  | LOW、MEDIUM、HIGH |
| `action` | varchar(64) |  | LOCK_USER、LOCK_IP、JIGSAW_CAPTCHA |
| `reason` | varchar(255) |  | 原因 |
| `expire_time` | datetime |  | 过期时间 |
| `extra_json` | text |  | 扩展信息，例如失败次数、验证码票据摘要 |
| `created_time` | datetime | IDX | 创建时间 |

### 2.13 登录拼图验证码缓存设计

随机拼图验证码属于短期风控挑战数据，不建议落库，使用 Redis 保存挑战状态和验证结果。需要审计时，在 `sys_risk_record` 中记录一条 `JIGSAW_CAPTCHA` 风控记录。

Redis Key：

| Key | Value | TTL | 说明 |
|---|---|---|---|
| `login:captcha:required:user:{username}` | `true` | 10 分钟 | 用户连续失败 3 次后要求拼图验证码。 |
| `login:jigsaw:challenge:{captchaTicket}` | 缺口坐标、允许误差、生成时间 | 2 分钟 | 拼图挑战信息。 |
| `login:jigsaw:passed:{captchaVerifyToken}` | `username` | 2 分钟 | 拼图验证通过后的短期凭证。 |

清理规则：

- 用户登录成功后，删除该用户的失败次数、验证码要求标记、未过期挑战和通过凭证。
- 验证码挑战过期后由 Redis TTL 自动清理。
- 验证失败不单独落库，但可计入登录失败次数和风控记录。

## 3. smart_wms 数据库

### 3.1 wms_material

物料表。

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| `id` | bigint | PK | 物料 ID |
| `material_code` | varchar(64) | UK | 物料编码 |
| `material_name` | varchar(128) | IDX | 物料名称 |
| `specification` | varchar(255) |  | 规格型号 |
| `unit` | varchar(32) |  | 单位 |
| `material_type` | varchar(64) |  | 物料类型 |
| `safe_stock_qty` | decimal(18,4) |  | 安全库存 |
| `status` | varchar(32) | IDX | ENABLED、DISABLED |
| `created_time` | datetime |  | 创建时间 |
| `updated_time` | datetime |  | 更新时间 |
| `deleted` | tinyint |  | 逻辑删除 |

### 3.2 wms_warehouse

仓库表。

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| `id` | bigint | PK | 仓库 ID |
| `warehouse_code` | varchar(64) | UK | 仓库编码 |
| `warehouse_name` | varchar(128) |  | 仓库名称 |
| `address` | varchar(255) |  | 地址 |
| `manager_id` | bigint | IDX | 负责人 |
| `status` | varchar(32) |  | 状态 |
| `created_time` | datetime |  | 创建时间 |
| `updated_time` | datetime |  | 更新时间 |
| `deleted` | tinyint |  | 逻辑删除 |

### 3.3 wms_area

库区表。

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| `id` | bigint | PK | 库区 ID |
| `warehouse_id` | bigint | IDX | 仓库 ID |
| `area_code` | varchar(64) |  | 库区编码 |
| `area_name` | varchar(128) |  | 库区名称 |
| `status` | varchar(32) |  | 状态 |

唯一索引：

```text
uk_wms_area(warehouse_id, area_code)
```

### 3.4 wms_location

库位表。

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| `id` | bigint | PK | 库位 ID |
| `warehouse_id` | bigint | IDX | 仓库 ID |
| `area_id` | bigint | IDX | 库区 ID |
| `location_code` | varchar(64) |  | 库位编码 |
| `location_name` | varchar(128) |  | 库位名称 |
| `status` | varchar(32) |  | 状态 |

唯一索引：

```text
uk_wms_location(warehouse_id, area_id, location_code)
```

### 3.5 wms_inbound_order

入库单主表。

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| `id` | bigint | PK | 入库单 ID |
| `inbound_no` | varchar(64) | UK | 入库单号 |
| `warehouse_id` | bigint | IDX | 仓库 ID |
| `inbound_type` | varchar(64) |  | 入库类型 |
| `status` | varchar(32) | IDX | DRAFT、APPROVED、CANCELLED |
| `source_type` | varchar(64) |  | MANUAL、IMPORT |
| `import_task_id` | bigint | IDX | 导入任务 ID |
| `remark` | varchar(255) |  | 备注 |
| `approved_by` | bigint |  | 审核人 |
| `approved_time` | datetime |  | 审核时间 |
| `created_time` | datetime | IDX | 创建时间 |
| `updated_time` | datetime |  | 更新时间 |

### 3.6 wms_inbound_order_detail

入库单明细表。

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| `id` | bigint | PK | 明细 ID |
| `inbound_order_id` | bigint | IDX | 入库单 ID |
| `material_id` | bigint | IDX | 物料 ID |
| `warehouse_id` | bigint | IDX | 仓库 ID |
| `location_id` | bigint | IDX | 库位 ID |
| `batch_no` | varchar(64) | IDX | 批次号 |
| `inbound_qty` | decimal(18,4) |  | 入库数量 |
| `production_date` | date |  | 生产日期 |
| `expire_date` | date |  | 有效期 |

### 3.7 wms_outbound_order

出库单主表。

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| `id` | bigint | PK | 出库单 ID |
| `outbound_no` | varchar(64) | UK | 出库单号 |
| `warehouse_id` | bigint | IDX | 仓库 ID |
| `work_order_id` | bigint | IDX | 工单 ID |
| `apply_id` | bigint | IDX | 物料申请 ID |
| `status` | varchar(32) | IDX | CREATED、PICKING、OUTBOUND、DELIVERING、DELIVERED |
| `created_time` | datetime | IDX | 创建时间 |
| `updated_time` | datetime |  | 更新时间 |

### 3.8 wms_outbound_order_detail

出库单明细表。

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| `id` | bigint | PK | 明细 ID |
| `outbound_order_id` | bigint | IDX | 出库单 ID |
| `material_id` | bigint | IDX | 物料 ID |
| `batch_id` | bigint | IDX | 库存批次 ID |
| `location_id` | bigint | IDX | 库位 ID |
| `outbound_qty` | decimal(18,4) |  | 出库数量 |

### 3.9 wms_inventory_batch

库存批次表。

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| `id` | bigint | PK | 批次 ID |
| `material_id` | bigint | IDX | 物料 ID |
| `warehouse_id` | bigint | IDX | 仓库 ID |
| `area_id` | bigint | IDX | 库区 ID |
| `location_id` | bigint | IDX | 库位 ID |
| `batch_no` | varchar(64) | IDX | 批次号 |
| `available_qty` | decimal(18,4) |  | 可用库存 |
| `locked_qty` | decimal(18,4) |  | 锁定库存 |
| `total_qty` | decimal(18,4) |  | 总库存 |
| `production_date` | date |  | 生产日期 |
| `expire_date` | date | IDX | 有效期 |
| `status` | varchar(32) | IDX | NORMAL、FROZEN、EXPIRED |
| `created_time` | datetime |  | 创建时间 |
| `updated_time` | datetime |  | 更新时间 |
| `version` | int |  | 乐观锁版本 |

索引：

```text
idx_inv_material_wh(material_id, warehouse_id)
idx_inv_fifo(material_id, warehouse_id, expire_date, production_date)
```

### 3.10 wms_inventory_flow

库存流水表。

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| `id` | bigint | PK | 流水 ID |
| `flow_no` | varchar(64) | UK | 流水号 |
| `material_id` | bigint | IDX | 物料 ID |
| `warehouse_id` | bigint | IDX | 仓库 ID |
| `location_id` | bigint | IDX | 库位 ID |
| `batch_id` | bigint | IDX | 批次 ID |
| `flow_type` | varchar(64) | IDX | INBOUND、LOCK、UNLOCK、OUTBOUND、ADJUST |
| `change_qty` | decimal(18,4) |  | 变动数量 |
| `before_available_qty` | decimal(18,4) |  | 变动前可用 |
| `after_available_qty` | decimal(18,4) |  | 变动后可用 |
| `before_locked_qty` | decimal(18,4) |  | 变动前锁定 |
| `after_locked_qty` | decimal(18,4) |  | 变动后锁定 |
| `biz_type` | varchar(64) | IDX | 业务类型 |
| `biz_id` | bigint | IDX | 业务 ID |
| `trace_id` | varchar(64) | IDX | TraceId |
| `created_time` | datetime | IDX | 创建时间 |

### 3.11 wms_stock_alert

安全库存预警表。

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| `id` | bigint | PK | 预警 ID |
| `material_id` | bigint | IDX | 物料 ID |
| `warehouse_id` | bigint | IDX | 仓库 ID |
| `current_qty` | decimal(18,4) |  | 当前库存 |
| `safe_stock_qty` | decimal(18,4) |  | 安全库存 |
| `alert_level` | varchar(32) |  | LOW、MEDIUM、HIGH |
| `status` | varchar(32) | IDX | OPEN、PROCESSED、IGNORED |
| `created_time` | datetime | IDX | 创建时间 |
| `processed_time` | datetime |  | 处理时间 |

### 3.12 wms_import_task

导入任务表。

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| `id` | bigint | PK | 任务 ID |
| `task_no` | varchar(64) | UK | 任务编号 |
| `file_name` | varchar(255) |  | 文件名 |
| `file_hash` | varchar(128) | IDX | 文件 Hash |
| `import_type` | varchar(64) |  | 导入类型 |
| `status` | varchar(32) | IDX | UPLOADED、PROCESSING、SUCCESS、PARTIAL_FAILED、FAILED |
| `total_count` | int |  | 总行数 |
| `success_count` | int |  | 成功数 |
| `fail_count` | int |  | 失败数 |
| `created_by` | bigint |  | 上传人 |
| `created_time` | datetime | IDX | 创建时间 |
| `finished_time` | datetime |  | 完成时间 |

### 3.13 wms_import_error

导入错误明细表。

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| `id` | bigint | PK | ID |
| `task_id` | bigint | IDX | 导入任务 ID |
| `row_no` | int |  | 行号 |
| `raw_data` | text |  | 原始数据 |
| `error_message` | varchar(512) |  | 错误信息 |
| `created_time` | datetime |  | 创建时间 |

## 4. smart_mes 数据库

### 4.1 mes_work_order

工单表。

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| `id` | bigint | PK | 工单 ID |
| `work_order_no` | varchar(64) | UK | 工单号 |
| `product_code` | varchar(64) |  | 产品编码 |
| `product_name` | varchar(128) |  | 产品名称 |
| `plan_qty` | decimal(18,4) |  | 计划数量 |
| `production_line` | varchar(64) | IDX | 生产线 |
| `plan_start_time` | datetime |  | 计划开始时间 |
| `plan_end_time` | datetime |  | 计划结束时间 |
| `status` | varchar(32) | IDX | 工单状态 |
| `created_time` | datetime | IDX | 创建时间 |
| `updated_time` | datetime |  | 更新时间 |
| `version` | int |  | 版本号 |

### 4.2 mes_work_order_material

工单物料需求表。

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| `id` | bigint | PK | ID |
| `work_order_id` | bigint | IDX | 工单 ID |
| `material_id` | bigint | IDX | 物料 ID |
| `material_code` | varchar(64) |  | 物料编码 |
| `material_name` | varchar(128) |  | 物料名称 |
| `required_qty` | decimal(18,4) |  | 需求数量 |
| `allocated_qty` | decimal(18,4) |  | 已分配数量 |
| `status` | varchar(32) | IDX | PENDING、ALLOCATING、ALLOCATED、FAILED |

唯一索引：

```text
uk_work_order_material(work_order_id, material_id)
```

### 4.3 mes_material_apply

物料申请表。

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| `id` | bigint | PK | 申请 ID |
| `apply_no` | varchar(64) | UK | 申请单号 |
| `request_id` | varchar(128) | UK | 幂等请求号 |
| `work_order_id` | bigint | IDX | 工单 ID |
| `work_order_no` | varchar(64) | IDX | 工单号 |
| `material_id` | bigint | IDX | 物料 ID |
| `material_code` | varchar(64) |  | 物料编码 |
| `warehouse_id` | bigint | IDX | 申请仓库 |
| `apply_qty` | decimal(18,4) |  | 申请数量 |
| `allocated_qty` | decimal(18,4) |  | 分配数量 |
| `status` | varchar(32) | IDX | PROCESSING、SUCCESS、FAILED、CANCELLED |
| `fail_reason` | varchar(255) |  | 失败原因 |
| `created_time` | datetime | IDX | 创建时间 |
| `updated_time` | datetime |  | 更新时间 |

### 4.4 mes_delivery_status

配送状态表。

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| `id` | bigint | PK | ID |
| `apply_id` | bigint | IDX | 申请 ID |
| `outbound_order_id` | bigint | IDX | 出库单 ID |
| `work_order_id` | bigint | IDX | 工单 ID |
| `status` | varchar(32) | IDX | WAIT_PICK、PICKING、OUTBOUND、DELIVERING、DELIVERED |
| `status_time` | datetime |  | 状态时间 |
| `remark` | varchar(255) |  | 备注 |

## 5. smart_task 数据库

### 5.1 task_job_log

任务执行日志表。

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| `id` | bigint | PK | ID |
| `job_name` | varchar(128) | IDX | 任务名称 |
| `job_type` | varchar(64) |  | 任务类型 |
| `status` | varchar(32) | IDX | SUCCESS、FAILED |
| `start_time` | datetime | IDX | 开始时间 |
| `end_time` | datetime |  | 结束时间 |
| `cost_ms` | bigint |  | 耗时 |
| `error_message` | varchar(1024) |  | 错误信息 |
| `trace_id` | varchar(64) | IDX | TraceId |

### 5.2 task_stat_daily

日统计表。

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| `id` | bigint | PK | ID |
| `stat_date` | date | IDX | 统计日期 |
| `warehouse_id` | bigint | IDX | 仓库 ID |
| `inbound_qty` | decimal(18,4) |  | 入库数量 |
| `outbound_qty` | decimal(18,4) |  | 出库数量 |
| `apply_count` | int |  | 申请次数 |
| `apply_success_count` | int |  | 申请成功次数 |
| `apply_fail_count` | int |  | 申请失败次数 |
| `created_time` | datetime |  | 创建时间 |

唯一索引：

```text
uk_task_stat_daily(stat_date, warehouse_id)
```

### 5.3 task_rank_snapshot

排行快照表。

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| `id` | bigint | PK | ID |
| `rank_type` | varchar(64) | IDX | 排行类型 |
| `rank_date` | date | IDX | 排行日期 |
| `rank_key` | varchar(128) | IDX | 排行对象 ID |
| `rank_name` | varchar(128) |  | 排行对象名称 |
| `score` | decimal(18,4) |  | 分值 |
| `rank_no` | int |  | 名次 |
| `created_time` | datetime |  | 创建时间 |

### 5.4 task_compensation_log

补偿日志表。

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| `id` | bigint | PK | ID |
| `biz_type` | varchar(64) | IDX | 业务类型 |
| `biz_id` | varchar(128) | IDX | 业务 ID |
| `event_id` | varchar(128) | IDX | 事件 ID |
| `status` | varchar(32) | IDX | PENDING、SUCCESS、FAILED |
| `retry_count` | int |  | 重试次数 |
| `max_retry_count` | int |  | 最大重试次数 |
| `next_retry_time` | datetime | IDX | 下次重试时间 |
| `error_message` | varchar(1024) |  | 错误信息 |
| `created_time` | datetime |  | 创建时间 |
| `updated_time` | datetime |  | 更新时间 |

### 5.5 task_event_consume_log

事件消费日志表。

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| `id` | bigint | PK | ID |
| `event_id` | varchar(128) | UK | 事件 ID |
| `event_type` | varchar(128) | IDX | 事件类型 |
| `consumer` | varchar(128) | IDX | 消费者 |
| `status` | varchar(32) |  | SUCCESS、FAILED |
| `error_message` | varchar(1024) |  | 错误信息 |
| `created_time` | datetime | IDX | 创建时间 |

## 6. smart_ai 数据库

### 6.1 ai_knowledge_base

知识库表。

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| `id` | bigint | PK | 知识库 ID |
| `kb_code` | varchar(64) | UK | 知识库编码 |
| `kb_name` | varchar(128) |  | 知识库名称 |
| `description` | varchar(255) |  | 描述 |
| `status` | varchar(32) | IDX | ENABLED、DISABLED |
| `created_time` | datetime |  | 创建时间 |
| `updated_time` | datetime |  | 更新时间 |

### 6.2 ai_document

文档表。

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| `id` | bigint | PK | 文档 ID |
| `kb_id` | bigint | IDX | 知识库 ID |
| `doc_name` | varchar(255) |  | 文档名称 |
| `doc_type` | varchar(64) |  | 文档类型 |
| `file_path` | varchar(512) |  | 文件路径 |
| `status` | varchar(32) | IDX | UPLOADED、INDEXED、FAILED |
| `created_time` | datetime |  | 创建时间 |

### 6.3 ai_document_chunk

文档片段表。

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| `id` | bigint | PK | 片段 ID |
| `doc_id` | bigint | IDX | 文档 ID |
| `kb_id` | bigint | IDX | 知识库 ID |
| `chunk_index` | int |  | 片段序号 |
| `chunk_text` | text |  | 片段文本 |
| `vector_id` | varchar(128) | IDX | 向量库 ID |
| `metadata_json` | text |  | 元数据 |
| `created_time` | datetime |  | 创建时间 |

### 6.4 ai_chat_session

会话表。

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| `id` | bigint | PK | 会话 ID |
| `user_id` | bigint | IDX | 用户 ID |
| `session_title` | varchar(255) |  | 会话标题 |
| `session_type` | varchar(64) | IDX | RAG、CHATBI、AGENT |
| `created_time` | datetime | IDX | 创建时间 |
| `updated_time` | datetime |  | 更新时间 |

### 6.5 ai_chat_message

消息表。

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| `id` | bigint | PK | 消息 ID |
| `session_id` | bigint | IDX | 会话 ID |
| `role` | varchar(32) |  | user、assistant、tool |
| `content` | text |  | 内容 |
| `references_json` | text |  | 引用来源 |
| `created_time` | datetime | IDX | 创建时间 |

### 6.6 ai_bi_query_record

ChatBI 查询记录表。

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| `id` | bigint | PK | ID |
| `user_id` | bigint | IDX | 用户 ID |
| `question` | varchar(1024) |  | 用户问题 |
| `generated_sql` | text |  | 生成 SQL |
| `safe_status` | varchar(32) |  | PASS、REJECT |
| `result_summary` | text |  | 结果摘要 |
| `cost_ms` | bigint |  | 耗时 |
| `created_time` | datetime | IDX | 创建时间 |

### 6.7 ai_mcp_tool_call_log

MCP 工具调用日志表。

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| `id` | bigint | PK | ID |
| `tool_call_id` | varchar(128) | UK | 工具调用 ID |
| `tool_name` | varchar(128) | IDX | 工具名称 |
| `user_id` | bigint | IDX | 用户 ID |
| `request_json` | text |  | 请求参数 |
| `response_json` | text |  | 响应 |
| `status` | varchar(32) | IDX | SUCCESS、FAILED |
| `error_message` | varchar(1024) |  | 错误信息 |
| `created_time` | datetime | IDX | 创建时间 |

## 7. 跨库关系说明

微服务数据库不建立物理外键，跨服务关系通过业务 ID 维护。

典型关系：

```text
mes_work_order.id
  -> mes_material_apply.work_order_id
  -> wms_outbound_order.work_order_id

mes_material_apply.id
  -> wms_outbound_order.apply_id
  -> mes_delivery_status.apply_id

wms_material.id
  -> mes_work_order_material.material_id
  -> mes_material_apply.material_id
  -> wms_inventory_batch.material_id

wms_warehouse.id
  -> wms_inventory_batch.warehouse_id
  -> wms_inbound_order.warehouse_id
  -> wms_outbound_order.warehouse_id
```

跨服务数据一致性依靠：

- API 查询。
- MQ 事件。
- 本地事务。
- 幂等消费。
- 补偿任务。

## 8. 状态枚举

### 8.1 工单状态

```text
DRAFT
RELEASED
ALLOCATING
ALLOCATED
PARTIAL
FAILED
CLOSED
```

### 8.2 物料申请状态

```text
PROCESSING
SUCCESS
FAILED
CANCELLED
```

### 8.3 入库单状态

```text
DRAFT
APPROVED
CANCELLED
```

### 8.4 出库单状态

```text
CREATED
PICKING
OUTBOUND
DELIVERING
DELIVERED
```

### 8.5 导入任务状态

```text
UPLOADED
PROCESSING
SUCCESS
PARTIAL_FAILED
FAILED
```

## 9. 索引设计原则

1. 所有业务编码字段建立唯一索引。
2. 所有状态字段结合查询场景建立普通索引。
3. 高频时间范围查询字段建立索引。
4. MQ 幂等字段 `event_id` 建唯一索引。
5. 物料申请幂等字段 `request_id` 建唯一索引。
6. 库存查询按 `material_id + warehouse_id` 建联合索引。
7. 库存批次 FIFO 查询按 `material_id + warehouse_id + expire_date + production_date` 建联合索引。

### 9.1 K8s 数据库与迁移原则

项目部署到 K8s 后，后端服务、数据库代理、消息消费实例和定时任务都可能扩展为多实例，因此数据库设计需要提前满足以下约束。

#### 9.1.1 数据库迁移版本化

1. 每个服务维护自己的数据库迁移脚本，推荐使用 Flyway、Liquibase 或独立 Migration Job 执行。
2. 迁移脚本必须具备版本号，例如 `V1__init_sys.sql`、`V2__add_frontend_module.sql`、`V3__add_login_risk.sql`。
3. 应避免多个业务 Pod 启动时同时执行 DDL。生产和准生产环境推荐由 CI/CD 或 K8s Job 单独执行迁移。
4. 表结构变更必须兼容滚动发布，新增字段优先允许为空或设置默认值，确认新旧版本兼容后再收紧约束。
5. 禁止在服务启动逻辑中直接执行 `create table`、`alter table` 等结构变更 SQL。

#### 9.1.2 多实例幂等与唯一约束

多实例部署时，同一业务请求、MQ 消息或补偿任务可能被重复触发，数据库必须提供最终防线。

| 场景 | 推荐唯一键或幂等字段 | 说明 |
|---|---|---|
| 登录风控事件 | `risk_no` 或 `request_id` | 避免重复记录同一次风控事件 |
| 离线上传任务 | `file_hash`、`upload_batch_no` | 避免同一文件被重复导入 |
| MQ 消息消费 | `event_id` | 消费前先落库或使用唯一索引兜底 |
| 物料申请 | `request_id` | MES 重试提交时不重复占用库存 |
| 库存流水 | `biz_no + biz_type + flow_type` | 避免重复扣减或重复入库 |
| MCP 工具调用 | `tool_call_id` | 避免 AI Agent 重试时重复执行外部动作 |
| 统计补偿任务 | `stat_date + stat_type` | 避免多实例重复生成统计结果 |

#### 9.1.3 连接池与资源限制

1. 每个服务的连接池最大连接数需要结合 K8s 副本数计算，避免 `replicas * maxPoolSize` 超过数据库承载能力。
2. 开发环境也应配置合理的 `minimumIdle`、`maximumPoolSize`、`connectionTimeout`，不要直接沿用单机调试的大连接池。
3. 慢查询、库存扣减、排行榜查询、ChatBI 聚合查询必须配合索引和分页，避免扩容 Pod 后把压力集中打到数据库。
4. AI 服务访问业务库时应通过受控接口或只读账号访问，ChatBI 不应使用高权限业务写账号。

#### 9.1.4 文件字段存储约束

K8s Pod 本地文件系统不可靠，离线上传文件、RAG 文档和导入错误文件不能只保存本地路径。

1. `wms_import_task` 如记录上传文件地址，应保存对象存储 URI、PVC 路径或文件服务地址，不保存单个 Pod 的本地临时目录。
2. `ai_document.file_path` 表示文件存储地址，推荐保存对象存储 URI，例如 `oss://bucket/path/file.pdf`。
3. 数据库只保存文件元数据、哈希、解析状态和访问地址，文件正文不直接落业务表。
4. 文件解析任务应支持重复执行和断点恢复，解析结果以 `document_id + chunk_index` 等唯一约束保证幂等。

#### 9.1.5 跨库与事务边界

1. 继续保持服务自治数据库，不建立跨库物理外键。
2. 跨服务写操作优先使用本地事务 + MQ 事件 + 幂等消费，必要时才使用 Seata 管理强一致事务。
3. Seata 的全局事务不应覆盖长耗时文件解析、AI 推理、WebSocket 推送等流程。
4. 每个服务需要保留可补偿数据，例如 `task_compensation_log`、`task_event_consume_log`，便于 K8s 重启或滚动发布后继续处理。

## 10. 初始化数据建议

### 10.1 默认角色

```text
ADMIN
WAREHOUSE_MANAGER
PRODUCTION_MANAGER
OPERATOR
AI_USER
```

### 10.2 默认菜单

```text
sys: 系统管理、用户管理、角色管理、菜单管理、部门管理、岗位管理、字典管理
sys: 安全审计、登录日志、操作日志、风控记录、数据权限
wms: 仓储管理、物料管理、仓库管理、库区管理、库位管理、库存批次、库存流水
wms: 入库管理、入库单、离线上传、导入进度
wms: 出库管理、出库单、拣货任务、配送状态
mes: 生产执行、工单管理、工单物料、物料申请、配送状态
task: 运营看板、出入库统计、库存预警、实时排行
ai: AI 助手、RAG 问答、ChatBI、多 Agent 分析、MCP 工具调用记录
```

### 10.2.1 默认前端模块

```text
模块  项目路径                         route_prefix  entry_url   api_prefix
sys   frontend-platform/apps/sys-web   /sys          /apps/sys/  /api/sys
wms   wms-web                          /wms          /apps/wms/  /api/wms
mes   mes-web                          /mes          /apps/mes/  /api/mes
ai    ai-web                           /ai           /apps/ai/   /api/ai
```

### 10.3 默认仓库

```text
WH001 原料仓
WH002 半成品仓
WH003 成品仓
```

### 10.4 默认库区

```text
A 原料区
B 暂存区
C 成品区
```

### 10.5 默认物料

```text
MAT-CPU-001 控制板
MAT-SEN-001 传感器
MAT-SHL-001 外壳
MAT-PKG-001 包装盒
```
