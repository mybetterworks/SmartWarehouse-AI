# V03 WMS 乙方前后端基础模块

## 1. 版本状态

```text
状态：TODO
负责人：乙方 A WMS 团队
前置版本：V02
输出结果：wms 后端 + wms-web 前端形成仓储基础业务闭环
```

## 2. 版本目标

1. 开发 `wms` 后端服务和 `wms-web` 前端项目。
2. 实现物料、仓库、库区、库位管理。
3. 实现入库单、出库单、库存批次、库存流水。
4. 实现离线上传入库数据和导入错误明细。
5. 通过 Jenkins 发布 WMS 测试版本，通过阿里弹性容器发布 WMS 正式版本检查。

## 3. 版本实现的技术栈

| 类型 | 技术 |
|---|---|
| 后端 | Spring Boot、MySQL、Redis、RabbitMQ |
| 前端 | Vue、Element Plus、platform-ui、platform-sdk |
| 文件 | MinIO / OSS / PVC 地址 |
| 幂等 | requestId、fileHash、bizNo |
| CI/CD | Jenkins、阿里弹性容器 |

## 4. 相关表结构

```text
wms_material
wms_warehouse
wms_area
wms_location
wms_inbound_order
wms_inbound_order_detail
wms_outbound_order
wms_outbound_order_detail
wms_inventory_batch
wms_inventory_flow
wms_stock_alert
wms_import_task
wms_import_error
```

## 5. 开发步骤提示词

```text
请开发 V03 WMS 乙方前后端基础模块。

要求：
1. 先确认 V02 平台基座、登录、菜单、platform-ui 和 platform-sdk 可用。
2. 创建 wms-api 和 wms-service，不创建 wms-client。
3. 创建 wms-web，使用 @smartwarehouse/* 平台包，不直接引用 frontend-platform 源码。
4. 实现 WMS 后端基础资料、入库、出库、库存批次、库存流水、离线上传接口。
5. 实现 wms-web 对应页面、表格、表单、上传、导入进度和错误明细。
6. WMS 接口统一走 /api/wms/**，前端路由使用 /wms，部署入口使用 /apps/wms/。
7. 补充 WMS Jenkins 测试发布流程。
8. 补充 WMS 阿里弹性容器正式发布检查。
9. 更新本文件实现记录、study、handle 和 PROGRESS.md。
```

## 6. 自动测试提示词

```text
请验证 V03 WMS 乙方前后端基础模块。

测试项：
1. wms-service 后端测试通过。
2. wms-web 构建通过。
3. 物料、仓库、库区、库位页面和接口可用。
4. 入库审核后生成库存批次和库存流水。
5. 出库确认后扣减库存并生成流水。
6. 离线上传生成导入任务和错误明细。
7. 仓库管理员只能访问授权仓库数据。
8. Jenkins 测试版本发布成功。
9. 阿里弹性容器正式发布检查通过。
```

## 7. 验收标准

1. WMS 后端和前端在同一版本可演示。
2. WMS 页面能完成基础仓储操作。
3. WMS 数据权限生效。
4. WMS 测试环境和正式环境发布检查都有记录。

## 8. 验收操作过程

```text
1. 登录系统进入 WMS 菜单。
2. 创建物料、仓库、库区、库位。
3. 创建并审核入库单，查看库存批次和流水。
4. 创建并确认出库单，查看库存减少和流水。
5. 上传入库文件，查看导入任务和错误明细。
6. 执行 Jenkins WMS 测试发布。
7. 检查阿里弹性容器 WMS 正式发布配置。
```

## 9. 实现记录

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
