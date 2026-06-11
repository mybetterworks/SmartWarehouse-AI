# V04 MES 乙方前后端基础模块

## 1. 版本状态

```text
状态：TODO
负责人：乙方 B MES 团队
前置版本：V03
输出结果：mes 后端 + mes-web 前端形成生产工单与物料申请基础闭环
```

## 2. 版本开发输入边界

本文件已经内置 V04 需要的设计信息。开发 V04 时以本文件、`docs/plan/ROADMAP.md`、`docs/plan/DEVELOPMENT_RULE.md`、`docs/plan/PROGRESS.md` 为准，不需要再读取 `docs/design` 下的设计文档。

V04 只开发 MES 乙方基础生产模块，包括 MES 后端、MES 前端、工单、工单物料、物料申请和配送状态基础闭环。MES 物料申请触发 WMS 库存预扣、WMS 分配结果回写 MES、task 统计排行联动统一放到 V07。

## 3. 版本目标

1. 开发 `mes/mes-api` 和 `mes/mes-service`，禁止创建 `mes-client`。
2. 开发根目录平级项目 `mes-web`，不得放入 `frontend-platform` 内。
3. 实现工单创建、编辑、发布、关闭。
4. 实现工单所需物料绑定。
5. 实现物料申请提交、幂等控制和状态查询。
6. 实现配送状态基础页面和手动状态维护能力。
7. 接入 V02 的统一登录、菜单、权限和平台组件。
8. 接入 V03 的物料、仓库基础查询能力，用于 MES 页面选择物料和仓库。
9. 通过 Jenkins 发布 MES 测试版本，通过阿里弹性容器发布 MES 正式版本检查。

## 4. 项目与代码架构

### 4.1 后端目录

```text
mes
├── pom.xml
├── mes-api
├── mes-service
└── deploy
    ├── Dockerfile
    ├── docker-compose.mes.yml
    ├── nacos-template.yml
    └── README.md
```

`mes-api` 只放对外契约：

```text
WorkOrderApi
MaterialApplyApi
DeliveryStatusApi
WorkOrderDTO
MaterialRequirementDTO
MaterialApplyDTO
DeliveryStatusDTO
```

`mes-service` 包结构：

```text
com.smartwarehouse.mes
├── controller
├── application
├── domain
├── infrastructure
├── mq
└── listener
```

### 4.2 前端目录

```text
mes-web
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
  name: 'mes',
  title: '生产执行',
  routePrefix: '/mes',
  entry: '/apps/mes/',
  apiPrefix: '/api/mes',
  permissions: [
    'mes:workorder:list',
    'mes:workorder:create',
    'mes:workorder:release',
    'mes:material-apply:create',
    'mes:delivery:view'
  ]
}
```

### 4.3 乙方边界

1. `mes` 不得直接依赖 `wms-service`、`task-service`、`sys-service` 实现源码。
2. `mes` 可以依赖 `platform-common-*`、`mes-api`，如需查询 WMS 基础资料，只能依赖 `wms-api` 制品或通过 REST API。
3. `mes-web` 只能通过 `@smartwarehouse/*` npm 包复用甲方前端能力。
4. MES 接口统一通过 Gateway 暴露为 `/api/mes/**`。
5. MES 前端路由统一以 `/mes` 开头，部署入口为 `/apps/mes/`。

## 5. 业务功能要求

### 5.1 工单管理

支持：

```text
创建工单
编辑草稿工单
查看工单详情
分页查询工单
发布工单
关闭工单
```

工单状态：

```text
DRAFT       草稿
RELEASED    已发布
ALLOCATING  物料分配中
ALLOCATED   物料已分配
PARTIAL     部分分配
FAILED      分配失败
CLOSED      已关闭
```

V04 状态流转：

```text
DRAFT -> RELEASED -> CLOSED
DRAFT/RELEASED -> 允许编辑部分字段
```

`ALLOCATING`、`ALLOCATED`、`PARTIAL`、`FAILED` 在 V07 由库存分配结果驱动。

### 5.2 工单物料绑定

支持：

```text
给工单绑定多个物料
维护需求数量 required_qty
查询工单物料需求
删除草稿工单中的物料
```

规则：

1. 同一工单下同一物料只能绑定一次。
2. 需求数量必须大于 0。
3. 已发布工单不允许删除物料需求，可在后续版本扩展变更流程。
4. 物料基础信息优先从 V03 WMS 读取，MES 本地保存快照字段 `material_code`、`material_name`。

### 5.3 物料申请

支持：

```text
对已发布工单提交物料申请
查询物料申请列表
查询申请详情
取消未完成申请
按 request_id 幂等
```

物料申请状态：

```text
PROCESSING 处理中
SUCCESS    申请成功
FAILED     申请失败
CANCELLED  已取消
```

V04 中物料申请可写入 `PROCESSING`，允许提供“模拟成功/失败”调试接口或后台按钮用于本模块自测；真实 WMS 分配结果在 V07 回写。

### 5.4 配送状态

支持：

```text
查看配送状态
按工单、申请、出库单筛选
手动维护基础配送状态用于 V04 演示
```

配送状态：

```text
WAIT_PICK
PICKING
OUTBOUND
DELIVERING
DELIVERED
```

V07 起配送状态由 WMS 出库与配送事件驱动。

### 5.5 批量释放生产任务

V04 只预留批量释放能力入口和接口结构，不做高并发库存抢占。V07 实现批量提交物料申请并通过 RabbitMQ 触发 WMS 库存预扣。

## 6. 接口设计

### 6.1 工单接口

```text
GET    /api/mes/work-orders
POST   /api/mes/work-orders
GET    /api/mes/work-orders/{id}
PUT    /api/mes/work-orders/{id}
POST   /api/mes/work-orders/{id}/release
POST   /api/mes/work-orders/{id}/close
```

创建工单请求：

```json
{
  "productCode": "P-001",
  "productName": "智能控制器",
  "planQty": 100,
  "productionLine": "LINE-A",
  "planStartTime": "2026-06-11 08:00:00",
  "planEndTime": "2026-06-12 18:00:00",
  "materials": [
    {
      "materialId": 1,
      "materialCode": "MAT-CPU-001",
      "materialName": "控制板",
      "requiredQty": 100
    }
  ]
}
```

### 6.2 工单物料接口

```text
GET    /api/mes/work-orders/{id}/materials
POST   /api/mes/work-orders/{id}/materials
PUT    /api/mes/work-orders/{id}/materials/{materialLineId}
DELETE /api/mes/work-orders/{id}/materials/{materialLineId}
```

### 6.3 物料申请接口

```text
GET  /api/mes/material-applies
POST /api/mes/work-orders/{id}/material-apply
GET  /api/mes/material-applies/{id}
POST /api/mes/material-applies/{id}/cancel
POST /api/mes/material-applies/{id}/mock-result
```

提交申请请求：

```json
{
  "requestId": "client-generated-id",
  "warehouseId": 1,
  "items": [
    {
      "materialId": 1,
      "materialCode": "MAT-CPU-001",
      "applyQty": 100
    }
  ]
}
```

幂等规则：

1. `request_id` 全局唯一。
2. 同一 `request_id` 重复提交返回首次处理结果。
3. 不允许重复占用库存，真实库存占用在 V07 实现。

### 6.4 配送状态接口

```text
GET  /api/mes/delivery-status
GET  /api/mes/work-orders/{id}/delivery-status
POST /api/mes/delivery-status/{id}/mock-change
```

### 6.5 外部查询接口

V04 可通过 Gateway 查询 WMS 基础资料：

```text
GET /api/wms/materials
GET /api/wms/warehouses
```

不得直接读取 `smart_wms` 数据库。

## 7. 前端页面设计

`mes-web` 必须实现：

```text
/mes/work-order          工单管理
/mes/work-order/:id      工单详情
/mes/work-order-material 工单物料需求
/mes/material-apply      物料申请
/mes/delivery-status     配送状态
```

页面要求：

1. 使用 `PlatformPage`、`PlatformSearchForm`、`PlatformTable`、`PlatformModalForm`、`PermissionButton`、`DictSelect`、`StatusTag`。
2. 物料选择使用 WMS 物料接口或平台封装的远程选择组件。
3. 仓库选择使用 WMS 仓库接口，并受用户仓库数据权限影响。
4. 所有请求使用 `platform-sdk`。
5. 不实现自己的登录逻辑，不维护自己的 Token。
6. 前端路由 `/mes/**` 支持 history fallback。

## 8. 数据库设计

数据库：`smart_mes`

### 8.1 mes_work_order

```text
id bigint PK
work_order_no varchar(64) UK
product_code varchar(64)
product_name varchar(128)
plan_qty decimal(18,4)
production_line varchar(64) IDX
plan_start_time datetime
plan_end_time datetime
status varchar(32) IDX
created_time datetime IDX
updated_time datetime
version int
```

### 8.2 mes_work_order_material

```text
id bigint PK
work_order_id bigint IDX
material_id bigint IDX
material_code varchar(64)
material_name varchar(128)
required_qty decimal(18,4)
allocated_qty decimal(18,4)
status varchar(32) IDX -- PENDING/ALLOCATING/ALLOCATED/FAILED
```

唯一索引：`uk_work_order_material(work_order_id, material_id)`

### 8.3 mes_material_apply

```text
id bigint PK
apply_no varchar(64) UK
request_id varchar(128) UK
work_order_id bigint IDX
work_order_no varchar(64) IDX
material_id bigint IDX
material_code varchar(64)
warehouse_id bigint IDX
apply_qty decimal(18,4)
allocated_qty decimal(18,4)
status varchar(32) IDX -- PROCESSING/SUCCESS/FAILED/CANCELLED
fail_reason varchar(255)
created_time datetime IDX
updated_time datetime
```

### 8.4 mes_delivery_status

```text
id bigint PK
apply_id bigint IDX
outbound_order_id bigint IDX
work_order_id bigint IDX
status varchar(32) IDX -- WAIT_PICK/PICKING/OUTBOUND/DELIVERING/DELIVERED
status_time datetime
remark varchar(255)
```

## 9. 缓存、单号与幂等设计

业务单号：

```text
WO + yyyyMMdd + 6位序列
MA + yyyyMMdd + 6位序列
```

Redis Key：

```text
id:seq:WO:{date}
id:seq:MA:{date}
```

幂等规则：

| 场景 | 幂等方式 |
|---|---|
| 创建物料申请 | `request_id` 唯一索引。 |
| 重复发布工单 | 工单状态校验。 |
| 关闭工单 | 工单状态校验。 |
| V07 库存结果事件 | `event_id` 消费记录或 Redis 幂等，本版本预留。 |

## 10. K8s / 多实例开发约束

1. `mes-service` 必须无状态。
2. 工单、申请、配送状态必须落 MySQL，不得只在内存中维护。
3. `request_id` 必须由数据库唯一约束兜底，防止多 Pod 重复提交。
4. 所有配置通过 Nacos、环境变量、ConfigMap 或 Secret 注入。
5. 健康检查提供：

```text
/actuator/health/liveness
/actuator/health/readiness
/actuator/health
```

6. 日志输出 stdout，携带 `traceId`、`serviceName`、`workOrderId`、`applyId`。
7. 数据库迁移必须版本化，不得在服务启动时直接执行 DDL。

## 11. Jenkins 与阿里弹性容器

Jenkins 测试流水线：

```text
构建 mes-api
构建 mes-service
运行单元测试和接口测试
构建 mes-service Docker 镜像
构建 mes-web
发布测试环境
执行健康检查和冒烟测试
```

阿里弹性容器正式发布检查：

```text
正式镜像 tag
release 依赖版本
Nacos 配置
MySQL/Redis/RabbitMQ Secret
健康检查
资源限制
回滚说明
```

## 12. 开发步骤提示词

```text
请开发 V04 MES 乙方前后端基础模块。

要求：
1. 只根据本 milestone、ROADMAP、DEVELOPMENT_RULE、PROGRESS 开发，不再读取 docs/design。
2. 先确认 V03 WMS 基础资料和库存查询可用。
3. 创建 mes-api 和 mes-service，不创建 mes-client。
4. 创建 mes-web，使用 @smartwarehouse/* 平台包，不直接引用 frontend-platform 源码。
5. 实现 MES 后端工单、工单物料、物料申请、配送状态接口。
6. 实现 mes-web 工单、物料需求、物料申请、配送状态页面。
7. 本版本先完成 MES 自身闭环，跨 WMS 库存分配的完整联动放到 V07。
8. MES 接口统一走 /api/mes/**，前端路由使用 /mes，部署入口使用 /apps/mes/。
9. 物料和仓库选择通过 WMS 公开接口，不直接访问 smart_wms 数据库。
10. 补充 MES Jenkins 测试发布流程。
11. 补充 MES 阿里弹性容器正式发布检查。
12. 自动检查并更新 .gitignore，避免 target、dist、node_modules、日志、.env、本地配置和密钥入库。
13. 检查本次准备纳入 Git 的文件是否存在账号、密码、token、API Key、私钥或内部地址，如存在必须改为环境变量、Secret、Jenkins 凭证或示例模板。
14. 更新本文件实现记录、对应 study、handle、PROGRESS 和根 README。
```

## 13. 自动测试提示词

```text
请验证 V04 MES 乙方前后端基础模块。

测试项：
1. mes-service 后端测试通过。
2. mes-web 构建通过。
3. 工单创建、编辑、发布页面和接口可用。
4. 工单物料绑定可用。
5. 物料申请提交支持 requestId 幂等。
6. 重复提交同一 requestId 不重复创建申请。
7. 配送状态可查询和模拟维护。
8. MES 页面可调用 WMS 物料/仓库查询接口。
9. /api/mes/** 通过 gateway 鉴权访问。
10. Jenkins 测试版本发布成功。
11. 阿里弹性容器正式发布检查通过。
12. 构建产物不包含 npm token、数据库密码、内部地址。
```

## 14. 验收标准

1. MES 后端和前端在同一版本可演示。
2. 生产主管可以完成工单到物料申请的基础流程。
3. MES 状态流转清晰，重复申请幂等。
4. MES 可通过公开接口选择 WMS 物料和仓库。
5. MES 测试环境和正式环境发布检查都有记录。

## 15. 验收操作过程

```text
1. 登录生产主管账号。
2. 进入 MES 工单页面。
3. 创建工单并绑定物料。
4. 发布工单并提交物料申请。
5. 查看物料申请和配送状态。
6. 重复提交同一 requestId，验证幂等。
7. 执行 Jenkins MES 测试发布。
8. 检查阿里弹性容器 MES 正式发布配置。
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
