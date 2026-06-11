# V07 手搓步骤：MES、WMS、task 多方交互业务

## 1. 环境准备

```text
MES / WMS / task 各自基础模块可用
RabbitMQ 可用
Jenkins 跨模块流水线可用
阿里弹性容器正式发布基线可用
```

## 2. 命令步骤

```powershell
mvn -pl mes/mes-service,wms/wms-service,task/task-service -am test
cd mes-web
pnpm build
cd ../wms-web
pnpm build
cd ../frontend-platform
pnpm build
```

## 3. 关键代码位置

```text
mes/mes-service
wms/wms-service
task/task-service
mes-web
wms-web
frontend-platform
platform/platform-common-mq
```

## 4. 核心代码片段

版本完成后补充：

```java
// MaterialApplyCreatedEvent
```

```java
// WMS 库存分配事件消费
```

```java
// task 统计排行事件消费
```

## 5. 验证命令

```powershell
mvn -pl mes/mes-service,wms/wms-service,task/task-service -am test
pnpm build
```

## 6. 常见错误

1. MQ 消费没有 eventId 幂等。
2. 重复事件导致重复扣库存。
3. 前端不能展示跨模块状态变化。
4. 跨模块发布只测单服务，没有测完整链路。

## 7. 手动还原步骤

1. MES 发布物料申请事件。
2. WMS 消费事件并分配库存。
3. WMS 回传分配结果。
4. MES 更新申请和配送状态。
5. task 消费事件更新统计排行。
6. 前端联调 MES、WMS、运营看板。
7. 执行 Jenkins 跨模块测试发布。
8. 检查阿里弹性容器正式联动发布配置。

## 8. 改进记录

```text
日期：
改进内容：
原因：
验证结果：
```
