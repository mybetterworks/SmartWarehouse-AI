# V04 手搓步骤：MES 乙方前后端基础模块

## 1. 环境准备

```text
Gateway / sys / WMS 基础资料可用
MySQL / Redis / RabbitMQ / Nacos Docker 容器
```

## 2. 命令步骤

```powershell
mvn -pl mes/mes-service -am test
cd mes-web
pnpm install
pnpm build
```

## 3. 关键代码位置

```text
mes/mes-api
mes/mes-service
mes-web
deploy/mysql/init-mes-db.sql
Jenkinsfile 或 jenkins/mes
deploy/eci/mes
```

## 4. 核心代码片段

版本完成后补充：

```java
// 工单状态流转
```

```java
// 物料申请 requestId 幂等
```

```ts
// mes-web 工单和物料申请页面
```

## 5. 验证命令

```powershell
mvn -pl mes/mes-service -am test
pnpm build
```

## 6. 常见错误

1. 未发布工单也允许申请物料。
2. 重复 requestId 创建多条申请。
3. 只做 MES 后端，没有 mes-web 页面。
4. MES 正式发布配置没有健康检查。

## 7. 手动还原步骤

1. 创建 MES 表结构。
2. 实现工单、物料需求、物料申请接口。
3. 实现 mes-web 页面。
4. 联调 /api/mes/**。
5. 配置 Jenkins MES 测试发布。
6. 检查阿里弹性容器 MES 正式发布配置。

## 8. 改进记录

```text
日期：
改进内容：
原因：
验证结果：
```
