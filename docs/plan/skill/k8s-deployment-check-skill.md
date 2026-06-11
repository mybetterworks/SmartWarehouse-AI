# K8s 部署检查 Skill

## 1. 适用场景

用于检查 SmartWarehouse-AI 各服务是否满足 K8s 多实例、滚动发布、配置外置、健康检查和可观测性要求。

## 2. 输入

- 当前 milestone 文件。
- `docs/design/high-level-design.md` K8s 章节。
- `docs/design/detailed-design.md` K8s 多实例开发章节。
- `docs/design/database-design.md` K8s 数据库与迁移原则。
- 目标服务 Dockerfile 和 K8s YAML。

## 3. 执行步骤

1. 检查服务是否无状态。
2. 检查配置是否通过 Nacos、ConfigMap、Secret 或环境变量注入。
3. 检查是否提供 Liveness、Readiness、Startup Probe。
4. 检查是否支持 SIGTERM 优雅停机。
5. 检查数据库迁移是否独立执行。
6. 检查 MQ 消费和定时任务是否支持多实例。
7. 检查 WebSocket 是否支持多实例路由或广播。
8. 检查文件是否存储到对象存储、PVC、MinIO 或 OSS。
9. 检查前端 Nginx base path 和 history fallback。
10. 检查日志是否输出到 stdout/stderr。
11. 检查镜像中是否包含密钥、`.npmrc` 或构建缓存。

## 4. 检查清单

- [ ] Deployment 设置 replicas。
- [ ] Service 暴露稳定访问入口。
- [ ] Ingress 路由 `/`、`/apps/*/`、`/api/**`。
- [ ] ConfigMap 管理非敏感配置。
- [ ] Secret 管理敏感配置。
- [ ] HPA 有资源 requests/limits。
- [ ] 数据库迁移不在多个业务 Pod 启动时同时执行。
- [ ] 前端镜像不包含 npm token。
- [ ] 日志包含 traceId、serviceName、podName、bizId。

## 5. 推荐提示词

```text
请使用 docs/plan/skill/k8s-deployment-check-skill.md，检查当前服务和部署清单是否满足 K8s 部署要求。发现问题后只做当前 milestone 范围内的最小修正，并更新验收记录。
```

## 6. 常见坑

1. 使用本地磁盘保存上传文件，Pod 重启后丢失。
2. 多副本定时任务重复执行。
3. Readiness 还没就绪就接收流量。
4. 前端容器带着 `.npmrc` 和 token。
5. 数据库连接池没有按副本数计算。
