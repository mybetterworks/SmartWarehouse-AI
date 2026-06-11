# V02 手搓步骤：甲方前后端基座与 CI/CD 基线

## 1. 环境准备

```text
JDK 17
Maven
Node v22.22.3
Docker Desktop
Jenkins
阿里弹性容器
MySQL / Redis / Nacos Docker 容器
```

## 2. 命令步骤

```powershell
docker compose -f deploy/local/docker-compose.yml up -d mysql redis nacos
mvn -pl platform -am -DskipTests install
mvn -pl sys/sys-service -am test
mvn -pl gateway/gateway-service -am test
cd frontend-platform
pnpm install
pnpm build
```

## 3. 关键代码位置

```text
platform
gateway/gateway-service
sys/sys-api
sys/sys-service
frontend-platform/apps/portal-shell
frontend-platform/apps/sys-web
Jenkinsfile
deploy/eci
```

## 4. 核心代码片段

版本完成后补充：

```java
// Gateway JWT 鉴权过滤器
```

```java
// sys-service 登录风控
```

```ts
// portal-shell 登录和菜单加载
```

```groovy
// Jenkins 测试环境流水线
```

## 5. 验证命令

```powershell
mvn -pl sys/sys-service -am test
mvn -pl gateway/gateway-service -am test
pnpm build
```

## 6. 常见错误

1. 只实现后端登录，没有 portal-shell 和 sys-web 页面。
2. 登录失败次数放本地内存。
3. Jenkins 凭证写入仓库。
4. 阿里弹性容器正式环境配置没有健康检查。

## 7. 手动还原步骤

1. 实现 platform 公共模块。
2. 实现 gateway 路由和鉴权。
3. 实现 sys 登录、权限、日志和风控。
4. 实现 portal-shell 和 sys-web。
5. 配置 Jenkins 测试发布。
6. 配置阿里弹性容器正式发布基线。

## 8. 改进记录

```text
日期：
改进内容：
原因：
验证结果：
```
