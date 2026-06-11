# V03 手搓步骤：WMS 乙方前后端基础模块

## 1. 环境准备

```text
Gateway / sys 可用
MySQL / Redis / RabbitMQ / Nacos Docker 容器
Jenkins 测试发布可用
阿里弹性容器正式发布基线可用
```

## 2. 命令步骤

```powershell
mvn -pl wms/wms-service -am test
cd wms-web
pnpm install
pnpm build
```

## 3. 关键代码位置

```text
wms/wms-api
wms/wms-service
wms-web
deploy/mysql/init-wms-db.sql
Jenkinsfile 或 jenkins/wms
deploy/eci/wms
```

## 4. 核心代码片段

版本完成后补充：

```java
// 入库审核和库存流水
```

```ts
// wms-web 入库单页面
```

```groovy
// WMS Jenkins 测试发布阶段
```

## 5. 验证命令

```powershell
mvn -pl wms/wms-service -am test
pnpm build
```

## 6. 常见错误

1. 只写 WMS 后端接口，没有 wms-web 页面。
2. 入库出库没有库存流水。
3. 离线上传文件保存到 Pod 本地路径。
4. WMS 正式发布配置遗漏环境变量。

## 7. 手动还原步骤

1. 创建 WMS 表结构。
2. 实现 WMS 后端接口。
3. 实现 wms-web 页面。
4. 联调 /api/wms/**。
5. 配置 Jenkins WMS 测试发布。
6. 检查阿里弹性容器 WMS 正式发布配置。

## 8. 改进记录

```text
日期：
改进内容：
原因：
验证结果：
```
