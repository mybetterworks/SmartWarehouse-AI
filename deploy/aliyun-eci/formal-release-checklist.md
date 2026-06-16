# 阿里弹性容器正式发布检查清单

## 1. 制品来源

- Java 正式镜像必须由 Jenkins 已验证的源码构建。
- 正式环境使用 Maven release 制品和 npm release 制品。
- AI 不自动执行 npm snapshot/release 发布，平台包版本号和真实发布由开发者手动完成。

## 2. 环境变量

正式环境通过阿里弹性容器环境变量或 Secret 注入以下配置：

```text
SMARTWAREHOUSE_JWT_SECRET=<JWT_SECRET>
SYS_SERVICE_URI=http://sys-service:9201
MYSQL_URL=<MYSQL_URL>
MYSQL_USERNAME=<MYSQL_USERNAME>
MYSQL_PASSWORD=<MYSQL_PASSWORD>
REDIS_HOST=<REDIS_HOST>
REDIS_PASSWORD=<REDIS_PASSWORD>
```

## 3. 健康检查

```text
gateway-service: /actuator/health
sys-service: /actuator/health
```

## 4. 资源建议

| 服务 | CPU | 内存 | 副本 |
|---|---|---|---|
| gateway-service | 0.5C | 512Mi | 2 |
| sys-service | 1C | 1Gi | 2 |
| portal-shell Nginx | 0.25C | 256Mi | 2 |
| sys-web Nginx | 0.25C | 256Mi | 2 |

## 5. 发布前检查

- 镜像中不包含 `.npmrc`、`.env`、Jenkins 凭证、阿里云密钥或私钥。
- `SMARTWAREHOUSE_JWT_SECRET` 已由 Secret 注入，不能使用本地默认值。
- `/api/sys/auth/login` 可访问。
- 未登录访问 `/api/sys/users` 返回 401。
- 登录后访问 `/api/sys/users` 成功。
- 退出登录后旧 Token 不能通过 sys-service `/auth/me` 校验。

## 6. 回滚

- 保留上一版 gateway-service、sys-service、portal-shell、sys-web 镜像 tag。
- 如健康检查失败，回滚到上一版镜像并保留失败版本日志。
