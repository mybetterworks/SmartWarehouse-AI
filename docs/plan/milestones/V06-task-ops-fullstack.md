# V06 甲方 task 运营统计前后端模块

## 1. 版本状态

```text
状态：TODO
负责人：甲方平台团队
前置版本：V05
输出结果：task 后端 + 门户运营看板形成统计、排行、预警、WebSocket 闭环
```

## 2. 版本目标

1. 开发 `task` 后端服务。
2. 在 `frontend-platform` 中开发运营看板或 task 页面。
3. 实现定时统计、任务日志、事件消费记录。
4. 实现实时排行、安全库存预警、WebSocket 推送。
5. 通过 Jenkins 发布 task 测试版本，通过阿里弹性容器发布 task 正式版本检查。

## 3. 版本实现的技术栈

| 类型 | 技术 |
|---|---|
| 后端 | Spring Boot、MySQL、Redis、RabbitMQ |
| 调度 | 分布式锁、K8s CronJob / Leader Election 兼容设计 |
| 实时 | WebSocket、Redis Pub/Sub 或 RabbitMQ 广播 |
| 前端 | portal-shell 运营看板、platform-ui、platform-sdk |
| CI/CD | Jenkins、阿里弹性容器 |

## 4. 相关表结构

```text
task_job_log
task_stat_daily
task_rank_snapshot
task_compensation_log
task_event_consume_log
```

## 5. 开发步骤提示词

```text
请开发 V06 甲方 task 运营统计前后端模块。

要求：
1. 创建 task-api 和 task-service，不创建 task-client。
2. 实现任务日志、每日统计、实时排行、安全库存预警和补偿记录。
3. 在 frontend-platform 中实现运营看板、排行和预警页面。
4. 实现 WebSocket 连接、鉴权、订阅和消息推送。
5. 定时任务必须支持多实例，不能依赖单实例 @Scheduled。
6. task 接口统一走 /api/task/**。
7. 补充 task Jenkins 测试发布流程。
8. 补充 task 阿里弹性容器正式发布检查。
9. 更新本文件实现记录、study、handle 和 PROGRESS.md。
```

## 6. 自动测试提示词

```text
请验证 V06 甲方 task 运营统计前后端模块。

测试项：
1. task-service 后端测试通过。
2. 运营看板前端构建通过。
3. 定时任务执行后写入 task_job_log。
4. 统计和排行接口可查询。
5. 安全库存预警可展示。
6. WebSocket 可推送预警或排行变化。
7. 多实例任务不会重复执行。
8. Jenkins 测试版本发布成功。
9. 阿里弹性容器正式发布检查通过。
```

## 7. 验收标准

1. task 后端和运营前端在同一版本可演示。
2. 统计、排行、预警和 WebSocket 形成闭环。
3. 多实例任务有防重复设计。
4. task 测试环境和正式环境发布检查都有记录。

## 8. 验收操作过程

```text
1. 登录运营账号。
2. 进入运营看板。
3. 触发统计任务或等待定时任务执行。
4. 查看每日统计、实时排行和安全库存预警。
5. 打开 WebSocket 客户端或页面，验证推送。
6. 执行 Jenkins task 测试发布。
7. 检查阿里弹性容器 task 正式发布配置。
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
