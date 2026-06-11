# V03 WMS 乙方前后端基础模块

## 1. 版本状态

```text
状态：TODO
负责人：乙方 A WMS 团队
前置版本：V02
输出结果：wms 后端 + wms-web 前端形成仓储基础业务闭环
```

## 2. 版本开发输入边界

本文件已经内置 V03 需要的设计信息。开发 V03 时以本文件、`docs/plan/ROADMAP.md`、`docs/plan/DEVELOPMENT_RULE.md`、`docs/plan/PROGRESS.md` 为准，不需要再读取 `docs/design` 下的设计文档。

V03 只开发 WMS 乙方基础仓储模块，包括 WMS 后端、WMS 前端、基础库存闭环、离线上传和 WMS 独立发布流程。MES 物料申请驱动 WMS 库存分配的跨乙方联动放到 V07。

## 3. 版本目标

1. 开发 `wms/wms-api` 和 `wms/wms-service`，禁止创建 `wms-client`。
2. 开发根目录平级项目 `wms-web`，不得放入 `frontend-platform` 内。
3. 实现物料、仓库、库区、库位管理。
4. 实现入库单创建、审核、库存批次生成、库存流水生成。
5. 实现出库单创建、确认、库存扣减、库存流水生成。
6. 实现库存批次查询、库存流水查询、安全库存预警查询。
7. 实现离线上传入库数据、导入任务进度、导入错误明细。
8. 接入 V02 的统一登录、菜单、数据权限、平台组件和 SDK。
9. 通过 Jenkins 发布 WMS 测试版本，通过阿里弹性容器发布 WMS 正式版本检查。

## 4. 项目与代码架构

### 4.1 后端目录

```text
wms
├── pom.xml
├── wms-api
├── wms-service
└── deploy
    ├── Dockerfile
    ├── docker-compose.wms.yml
    ├── nacos-template.yml
    └── README.md
```

`wms-api` 只放对外契约，不放业务实现：

```text
MaterialApi
WarehouseApi
InventoryApi
InboundApi
OutboundApi
ImportApi
MaterialDTO
WarehouseDTO
InventoryBatchDTO
InventoryFlowDTO
InboundOrderDTO
OutboundOrderDTO
InventoryLockRequest
InventoryLockResponse
```

`wms-service` 包结构：

```text
com.smartwarehouse.wms
├── controller
├── application
├── domain
├── infrastructure
├── inventory
├── inbound
├── outbound
├── importdata
├── mq
└── listener
```

### 4.2 前端目录

```text
wms-web
├── package.json
├── vite.config.ts
├── tsconfig.json
├── src
│   ├── api
│   ├── assets
│   ├── components
│   ├── router
│   ├── stores
│   ├── views
│   └── module.ts
└── deploy
```

`module.ts` 必须声明：

```ts
export default {
  name: 'wms',
  title: '仓储管理',
  routePrefix: '/wms',
  entry: '/apps/wms/',
  apiPrefix: '/api/wms',
  permissions: [
    'wms:material:list',
    'wms:material:add',
    'wms:warehouse:list',
    'wms:inbound:approve',
    'wms:outbound:confirm',
    'wms:import:upload'
  ]
}
```

### 4.3 乙方边界

1. `wms` 不得直接依赖 `mes-service`、`task-service`、`sys-service` 实现源码。
2. `wms` 可以依赖 `platform-common-*`、`sys-api`、`wms-api`。
3. `wms-web` 只能通过 `@smartwarehouse/*` npm 包复用甲方前端能力，不得相对路径引用 `frontend-platform` 源码。
4. WMS 接口统一通过 Gateway 暴露为 `/api/wms/**`。
5. WMS 前端路由统一以 `/wms` 开头，部署入口为 `/apps/wms/`。

## 5. 业务功能要求

### 5.1 物料管理

支持：

```text
新增物料
修改物料
禁用/启用物料
分页查询物料
按物料编码、名称、类型、状态筛选
维护安全库存
```

约束：

1. `material_code` 唯一。
2. 禁用物料不能用于新建入库或出库。
3. 安全库存用于 V06/V07 的预警扫描。

### 5.2 仓库、库区、库位管理

支持：

```text
仓库新增/修改/禁用/查询
库区新增/修改/禁用/查询
库位新增/修改/禁用/查询
仓库 -> 库区 -> 库位层级展示
```

约束：

1. `warehouse_code` 唯一。
2. 同一仓库下 `area_code` 唯一。
3. 同一仓库、库区下 `location_code` 唯一。
4. 仓库数据查询必须应用 V02 的用户仓库数据权限。

### 5.3 入库管理

流程：

```text
创建入库单
  -> 添加入库明细
  -> 审核入库单
  -> 生成库存批次
  -> 增加可用库存
  -> 写入库存流水
  -> 更新入库单状态为 APPROVED
```

规则：

1. 入库单状态：`DRAFT`、`APPROVED`、`CANCELLED`。
2. 已审核入库单不能重复审核。
3. 入库数量必须大于 0。
4. 本版本入库审核使用 WMS 本地事务即可。
5. 生成库存流水 `flow_type=INBOUND`。

### 5.4 出库管理

流程：

```text
创建出库单
  -> 添加出库明细
  -> 确认出库
  -> 扣减库存批次可用库存
  -> 写入库存流水
  -> 更新出库单状态
```

规则：

1. 出库单状态：`CREATED`、`PICKING`、`OUTBOUND`、`DELIVERING`、`DELIVERED`。
2. 出库数量必须大于 0。
3. 可用库存不能小于 0。
4. 本版本支持手动出库，MES 申请触发的出库在 V07 打通。
5. 生成库存流水 `flow_type=OUTBOUND`。

### 5.5 库存批次与流水

库存规则：

```text
total_qty = available_qty + locked_qty
available_qty >= 0
locked_qty >= 0
```

库存批次查询支持：

```text
物料
仓库
库区
库位
批次号
状态
有效期
```

库存流水查询支持：

```text
物料
仓库
库位
批次
流水类型
业务类型
业务 ID
时间范围
traceId
```

### 5.6 安全库存预警

本版本只实现 WMS 预警数据查询和手动生成能力，自动扫描和推送在 V06/V07 完成。

预警规则：

```text
当前库存 < 安全库存 -> OPEN 预警
当前库存越低 alert_level 越高
```

### 5.7 离线上传入库

流程：

```text
仓库管理员上传 Excel / CSV
  -> WMS 保存文件到对象存储或本地开发模拟存储
  -> 创建 wms_import_task
  -> 异步解析文件
  -> 校验物料、仓库、库位、批次、数量
  -> 合法数据生成入库单
  -> 错误数据写入 wms_import_error
  -> 更新任务进度
```

规则：

1. 支持 1 万行以内文件。
2. 同一文件通过 `file_hash` 做幂等，避免重复导入。
3. K8s 目标环境不得只保存到 Pod 本地磁盘，应使用 MinIO、OSS 或 PVC。
4. 错误明细支持分页查询和导出。

## 6. 接口设计

### 6.1 物料接口

```text
GET    /api/wms/materials
POST   /api/wms/materials
GET    /api/wms/materials/{id}
PUT    /api/wms/materials/{id}
PUT    /api/wms/materials/{id}/status
```

权限码：

```text
wms:material:list
wms:material:create
wms:material:update
wms:material:disable
```

### 6.2 仓库接口

```text
GET    /api/wms/warehouses
POST   /api/wms/warehouses
GET    /api/wms/warehouses/{id}
PUT    /api/wms/warehouses/{id}
PUT    /api/wms/warehouses/{id}/status

GET    /api/wms/areas
POST   /api/wms/areas
PUT    /api/wms/areas/{id}
PUT    /api/wms/areas/{id}/status

GET    /api/wms/locations
POST   /api/wms/locations
PUT    /api/wms/locations/{id}
PUT    /api/wms/locations/{id}/status
```

### 6.3 入库接口

```text
GET    /api/wms/inbound-orders
POST   /api/wms/inbound-orders
GET    /api/wms/inbound-orders/{id}
PUT    /api/wms/inbound-orders/{id}
POST   /api/wms/inbound-orders/{id}/approve
POST   /api/wms/inbound-orders/{id}/cancel
```

### 6.4 出库接口

```text
GET    /api/wms/outbound-orders
POST   /api/wms/outbound-orders
GET    /api/wms/outbound-orders/{id}
PUT    /api/wms/outbound-orders/{id}
POST   /api/wms/outbound-orders/{id}/confirm
POST   /api/wms/outbound-orders/{id}/delivery-status
```

### 6.5 库存接口

```text
GET /api/wms/inventory-batches
GET /api/wms/inventory-flows
GET /api/wms/stock-alerts
POST /api/wms/stock-alerts/scan-once
```

### 6.6 离线上传接口

```text
POST /api/wms/import/inbound
GET  /api/wms/import/tasks
GET  /api/wms/import/tasks/{taskId}
GET  /api/wms/import/tasks/{taskId}/errors
GET  /api/wms/import/tasks/{taskId}/errors/export
```

## 7. 前端页面设计

`wms-web` 必须实现以下页面：

```text
/wms/material              物料管理
/wms/warehouse             仓库管理
/wms/area                  库区管理
/wms/location              库位管理
/wms/inbound               入库单
/wms/outbound              出库单
/wms/inventory-batch       库存批次
/wms/inventory-flow        库存流水
/wms/import-inbound        离线上传
/wms/import-task           导入进度
/wms/stock-alert           安全库存预警
```

页面要求：

1. 使用 `PlatformPage`、`PlatformSearchForm`、`PlatformTable`、`PlatformModalForm`、`PermissionButton`、`DictSelect`、`FileUpload`、`ExcelImport`、`StatusTag`。
2. 所有请求使用 `platform-sdk` 的 request。
3. 不实现自己的登录逻辑，不维护自己的 Token。
4. 按权限码控制按钮显示。
5. 上传页面展示导入进度、成功数、失败数、错误明细。
6. 页面刷新时支持 `/wms/**` history fallback。

## 8. 数据库设计

数据库：`smart_wms`

### 8.1 wms_material

```text
id bigint PK
material_code varchar(64) UK
material_name varchar(128) IDX
specification varchar(255)
unit varchar(32)
material_type varchar(64)
safe_stock_qty decimal(18,4)
status varchar(32) IDX -- ENABLED/DISABLED
created_time datetime
updated_time datetime
deleted tinyint
```

### 8.2 wms_warehouse

```text
id bigint PK
warehouse_code varchar(64) UK
warehouse_name varchar(128)
address varchar(255)
manager_id bigint IDX
status varchar(32)
created_time datetime
updated_time datetime
deleted tinyint
```

### 8.3 wms_area

```text
id bigint PK
warehouse_id bigint IDX
area_code varchar(64)
area_name varchar(128)
status varchar(32)
```

唯一索引：`uk_wms_area(warehouse_id, area_code)`

### 8.4 wms_location

```text
id bigint PK
warehouse_id bigint IDX
area_id bigint IDX
location_code varchar(64)
location_name varchar(128)
status varchar(32)
```

唯一索引：`uk_wms_location(warehouse_id, area_id, location_code)`

### 8.5 wms_inbound_order

```text
id bigint PK
inbound_no varchar(64) UK
warehouse_id bigint IDX
inbound_type varchar(64)
status varchar(32) IDX -- DRAFT/APPROVED/CANCELLED
source_type varchar(64) -- MANUAL/IMPORT
import_task_id bigint IDX
remark varchar(255)
approved_by bigint
approved_time datetime
created_time datetime IDX
updated_time datetime
```

### 8.6 wms_inbound_order_detail

```text
id bigint PK
inbound_order_id bigint IDX
material_id bigint IDX
warehouse_id bigint IDX
location_id bigint IDX
batch_no varchar(64) IDX
inbound_qty decimal(18,4)
production_date date
expire_date date
```

### 8.7 wms_outbound_order

```text
id bigint PK
outbound_no varchar(64) UK
warehouse_id bigint IDX
work_order_id bigint IDX
apply_id bigint IDX
status varchar(32) IDX -- CREATED/PICKING/OUTBOUND/DELIVERING/DELIVERED
created_time datetime IDX
updated_time datetime
```

### 8.8 wms_outbound_order_detail

```text
id bigint PK
outbound_order_id bigint IDX
material_id bigint IDX
batch_id bigint IDX
location_id bigint IDX
outbound_qty decimal(18,4)
```

### 8.9 wms_inventory_batch

```text
id bigint PK
material_id bigint IDX
warehouse_id bigint IDX
area_id bigint IDX
location_id bigint IDX
batch_no varchar(64) IDX
available_qty decimal(18,4)
locked_qty decimal(18,4)
total_qty decimal(18,4)
production_date date
expire_date date IDX
status varchar(32) IDX -- NORMAL/FROZEN/EXPIRED
created_time datetime
updated_time datetime
version int
```

索引：

```text
idx_inv_material_wh(material_id, warehouse_id)
idx_inv_fifo(material_id, warehouse_id, expire_date, production_date)
```

### 8.10 wms_inventory_flow

```text
id bigint PK
flow_no varchar(64) UK
material_id bigint IDX
warehouse_id bigint IDX
location_id bigint IDX
batch_id bigint IDX
flow_type varchar(64) IDX -- INBOUND/LOCK/UNLOCK/OUTBOUND/ADJUST
change_qty decimal(18,4)
before_available_qty decimal(18,4)
after_available_qty decimal(18,4)
before_locked_qty decimal(18,4)
after_locked_qty decimal(18,4)
biz_type varchar(64) IDX
biz_id bigint IDX
trace_id varchar(64) IDX
created_time datetime IDX
```

### 8.11 wms_stock_alert

```text
id bigint PK
material_id bigint IDX
warehouse_id bigint IDX
current_qty decimal(18,4)
safe_stock_qty decimal(18,4)
alert_level varchar(32) -- LOW/MEDIUM/HIGH
status varchar(32) IDX -- OPEN/PROCESSED/IGNORED
created_time datetime IDX
processed_time datetime
```

### 8.12 wms_import_task

```text
id bigint PK
task_no varchar(64) UK
file_name varchar(255)
file_hash varchar(128) IDX
file_uri varchar(512)
import_type varchar(64)
status varchar(32) IDX -- UPLOADED/PROCESSING/SUCCESS/PARTIAL_FAILED/FAILED
total_count int
success_count int
fail_count int
created_by bigint
created_time datetime IDX
finished_time datetime
```

建议增加唯一约束：`uk_wms_import_file(file_hash, import_type)`

### 8.13 wms_import_error

```text
id bigint PK
task_id bigint IDX
row_no int
raw_data text
error_message varchar(512)
created_time datetime
```

## 9. 缓存、幂等与对象存储设计

Redis Key：

```text
stock:available:{materialId}:{warehouseId}
lock:stock:{materialId}:{warehouseId}
id:seq:IN:{date}
id:seq:OUT:{date}
id:seq:STK:{date}
```

幂等场景：

| 场景 | 幂等方式 |
|---|---|
| 入库单审核 | 入库单状态 + 本地事务。 |
| 出库确认 | 出库单状态 + 库存流水业务唯一键。 |
| 离线上传 | `file_hash + import_type` 唯一约束。 |
| 库存流水 | 建议 `biz_type + biz_id + flow_type` 唯一约束。 |

文件存储：

```text
本地开发：可用 Docker MinIO
正式环境：阿里云 OSS、MinIO、PVC
数据库只保存 file_uri、file_hash、文件名和解析状态
```

## 10. K8s / 多实例开发约束

1. `wms-service` 必须无状态。
2. 导入任务进度必须落库，不得只保存在内存。
3. 上传文件不得只保存在 Pod 本地。
4. 库存扣减必须使用数据库事务、乐观锁或行级锁保证一致性。
5. 出入库确认接口必须支持重复提交保护。
6. 所有配置通过 Nacos、环境变量、ConfigMap、Secret 注入。
7. 健康检查提供：

```text
/actuator/health/liveness
/actuator/health/readiness
/actuator/health
```

8. 日志输出 stdout，携带 `traceId`、`serviceName`、`warehouseId`、`bizId`。

## 11. Jenkins 与阿里弹性容器

Jenkins 测试流水线：

```text
构建 wms-api
构建 wms-service
运行单元测试和接口测试
构建 wms-service Docker 镜像
构建 wms-web
发布测试环境
执行健康检查和冒烟测试
```

阿里弹性容器正式发布检查：

```text
正式镜像 tag
release 依赖版本
Nacos 配置
MySQL/Redis/RabbitMQ/对象存储 Secret
健康检查
资源限制
回滚说明
```

## 12. 开发步骤提示词

```text
请开发 V03 WMS 乙方前后端基础模块。

要求：
1. 只根据本 milestone、ROADMAP、DEVELOPMENT_RULE、PROGRESS 开发，不再读取 docs/design。
2. 先确认 V02 平台基座、登录、菜单、platform-ui 和 platform-sdk 可用。
3. 创建 wms-api 和 wms-service，不创建 wms-client。
4. 创建 wms-web，使用 @smartwarehouse/* 平台包，不直接引用 frontend-platform 源码。
5. 实现 WMS 后端物料、仓库、库区、库位、入库、出库、库存批次、库存流水、安全库存预警、离线上传接口。
6. 实现 wms-web 对应页面、表格、表单、上传、导入进度和错误明细。
7. WMS 接口统一走 /api/wms/**，前端路由使用 /wms，部署入口使用 /apps/wms/。
8. 实现用户仓库数据权限过滤。
9. 补充 WMS Jenkins 测试发布流程。
10. 补充 WMS 阿里弹性容器正式发布检查。
11. 自动检查并更新 .gitignore，避免 target、dist、node_modules、上传临时文件、日志、.env、本地配置和密钥入库。
12. 检查本次准备纳入 Git 的文件是否存在账号、密码、token、API Key、私钥或内部地址，如存在必须改为环境变量、Secret、Jenkins 凭证或示例模板。
13. 更新本文件实现记录、对应 study、handle、PROGRESS 和根 README。
```

## 13. 自动测试提示词

```text
请验证 V03 WMS 乙方前后端基础模块。

测试项：
1. wms-service 后端测试通过。
2. wms-web 构建通过。
3. 物料、仓库、库区、库位页面和接口可用。
4. 入库审核后生成库存批次和库存流水。
5. 出库确认后扣减库存并生成流水。
6. 离线上传生成导入任务和错误明细。
7. 重复上传同一文件不会重复导入。
8. 仓库管理员只能访问授权仓库数据。
9. /api/wms/** 通过 gateway 鉴权访问。
10. Jenkins 测试版本发布成功。
11. 阿里弹性容器正式发布检查通过。
12. 构建产物不包含对象存储密钥、npm token、数据库密码。
```

## 14. 验收标准

1. WMS 后端和前端在同一版本可演示。
2. WMS 页面能完成基础仓储操作。
3. 入库、出库、库存批次、库存流水形成最小闭环。
4. 离线上传可记录任务和错误明细。
5. WMS 数据权限生效。
6. WMS 测试环境和正式环境发布检查都有记录。

## 15. 验收操作过程

```text
1. 登录系统进入 WMS 菜单。
2. 创建物料、仓库、库区、库位。
3. 创建并审核入库单，查看库存批次和流水。
4. 创建并确认出库单，查看库存减少和流水。
5. 上传入库文件，查看导入任务和错误明细。
6. 使用未授权仓库账号验证数据隔离。
7. 执行 Jenkins WMS 测试发布。
8. 检查阿里弹性容器 WMS 正式发布配置。
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
