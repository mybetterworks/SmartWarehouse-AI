# V06 手搓步骤：task 运营统计前后端模块

## 1. 环境准备

```text
MES / WMS / sys 基础模块可用
MySQL / Redis / RabbitMQ / Nacos Docker 容器
frontend-platform 可构建
```

## 2. 命令步骤

```powershell
mvn -pl task/task-service -am test
cd frontend-platform
pnpm build
```

## 3. 关键代码位置

```text
task/task-api
task/task-service
frontend-platform/apps/portal-shell
frontend-platform/apps/sys-web 或运营看板目录
deploy/mysql/init-task-db.sql
Jenkinsfile 或 jenkins/task
deploy/eci/task
```

## 4. 核心代码片段

版本完成后补充：

```java
// 定时任务分布式锁
```

```java
// WebSocket 推送
```

```ts
// 运营看板页面
```

## 5. 验证命令

```powershell
mvn -pl task/task-service -am test
pnpm build
```

## 6. 常见错误

1. 多实例定时任务重复执行。
2. WebSocket 连接路由只存在本地内存。
3. 只有 task 后端，没有运营看板。
4. Jenkins 没有发布 task 测试版本。

## 7. 手动还原步骤

1. 创建 task 表结构。
2. 实现统计、排行、预警和 WebSocket。
3. 实现运营看板。
4. 联调 /api/task/**。
5. 配置 Jenkins task 测试发布。
6. 检查阿里弹性容器 task 正式发布配置。

## 8. 改进记录

```text
日期：
改进内容：
原因：
验证结果：
```
