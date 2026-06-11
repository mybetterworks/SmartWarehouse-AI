# V04 MES 乙方前后端基础模块

## 1. 版本状态

```text
状态：TODO
负责人：乙方 B MES 团队
前置版本：V03
输出结果：mes 后端 + mes-web 前端形成生产工单与物料申请基础闭环
```

## 2. 版本目标

1. 开发 `mes` 后端服务和 `mes-web` 前端项目。
2. 实现工单创建、编辑、发布。
3. 实现工单所需物料绑定。
4. 实现物料申请提交和状态查询。
5. 实现配送状态页面。
6. 通过 Jenkins 发布 MES 测试版本，通过阿里弹性容器发布 MES 正式版本检查。

## 3. 版本实现的技术栈

| 类型 | 技术 |
|---|---|
| 后端 | Spring Boot、MySQL、Redis、RabbitMQ |
| 前端 | Vue、Element Plus、platform-ui、platform-sdk |
| 幂等 | requestId、eventId |
| 接口 | mes-api、wms-api、task-api |
| CI/CD | Jenkins、阿里弹性容器 |

## 4. 相关表结构

```text
mes_work_order
mes_work_order_material
mes_material_apply
mes_delivery_status
```

## 5. 开发步骤提示词

```text
请开发 V04 MES 乙方前后端基础模块。

要求：
1. 先确认 V03 WMS 基础资料和库存查询可用。
2. 创建 mes-api 和 mes-service，不创建 mes-client。
3. 创建 mes-web，使用 @smartwarehouse/* 平台包。
4. 实现 MES 后端工单、工单物料、物料申请、配送状态接口。
5. 实现 mes-web 工单、物料需求、物料申请、配送状态页面。
6. 本版本先完成 MES 自身闭环，跨 WMS 库存分配的完整联动放到 V07。
7. MES 接口统一走 /api/mes/**，前端路由使用 /mes，部署入口使用 /apps/mes/。
8. 补充 MES Jenkins 测试发布流程。
9. 补充 MES 阿里弹性容器正式发布检查。
10. 更新本文件实现记录、study、handle 和 PROGRESS.md。
```

## 6. 自动测试提示词

```text
请验证 V04 MES 乙方前后端基础模块。

测试项：
1. mes-service 后端测试通过。
2. mes-web 构建通过。
3. 工单创建、编辑、发布页面和接口可用。
4. 工单物料绑定可用。
5. 物料申请提交支持 requestId 幂等。
6. 配送状态可查询。
7. Jenkins 测试版本发布成功。
8. 阿里弹性容器正式发布检查通过。
```

## 7. 验收标准

1. MES 后端和前端在同一版本可演示。
2. 生产主管可以完成工单到物料申请的基础流程。
3. MES 状态流转清晰，重复申请幂等。
4. MES 测试环境和正式环境发布检查都有记录。

## 8. 验收操作过程

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
