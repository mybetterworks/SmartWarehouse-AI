# Java Spring Cloud 微服务开发 Skill

## 1. 适用场景

用于开发 `gateway`、`sys`、`task`、`wms`、`mes` 等 Java 微服务，特别是涉及 Spring Cloud Alibaba、Redis、RabbitMQ、MySQL、Seata、Dubbo、JWT 和 K8s 多实例约束的功能。

## 2. 输入

- 当前 milestone 文件。
- `docs/design/high-level-design.md`
- `docs/design/detailed-design.md`
- `docs/design/database-design.md`
- 目标服务目录。
- 相关 API 模块和数据库表。

## 3. 执行步骤

1. 确认目标服务归属甲方或乙方。
2. 确认是否需要新增 `*-api`，不得新增 `task-client`、`mes-client`、`wms-client`。
3. 创建或更新数据库迁移脚本。
4. 按业务模块实现 Controller、Service、Repository/Mapper、DTO、事件对象；禁止把一个服务内的多个业务域全部堆到单个 Controller 或单个 Service 中。
5. 接入统一响应、异常、分页、审计字段和安全上下文。
6. 涉及写操作时设计幂等键。
7. 涉及 MQ 时设计 eventId、重试、死信和消费日志。
8. 涉及 Redis 时确认 Key 命名、过期时间和 Cluster 兼容。
9. 涉及事务时优先本地事务 + MQ，必要时才使用 Seata。
10. 为核心类、方法和关键代码行补充中文注释，说明业务职责、参数含义、幂等/事务/缓存/MQ 设计原因和异常处理意图。
11. 增加单元测试、集成测试或接口测试。
12. 更新 milestone、study、handle 和 PROGRESS。
13. 对涉及数据库、Redis、MQ、网关鉴权或真实页面联调的版本，必须补充与人工启动一致的真实 Docker 中间件验收测试；不能只用 H2、Mock、内存 fallback 或临时 Shell 环境变量作为完成依据。
14. 除非 milestone 明确说明不需要服务发现，否则 Java 微服务必须接入 Nacos Discovery，并同时验证本地直启配置和 Docker Compose 容器内配置。
15. gateway 访问后端服务优先使用 `lb://service-name`，不把固定实例地址作为最终路由；固定地址只能作为临时排障或单测覆盖场景。
16. 菜单、按钮、前端模块和数据范围等权限结果必须在后端按当前登录用户过滤；前端隐藏不能替代服务端授权边界。
17. 认证中心职责和业务模块访问权必须分开。以 sys-service 为例，业务账号可以通过 `/api/sys/auth/login` 登录总门户，但没有 `sys:*` 权限时必须禁止访问 `/api/sys/users` 等系统管理接口。

## 4. 检查清单

- [ ] 服务是否无状态。
- [ ] 配置是否外置。
- [ ] 是否提供健康检查。
- [ ] 是否支持优雅停机。
- [ ] 核心写操作是否幂等。
- [ ] MQ 消费是否成功后 ack。
- [ ] 数据库索引是否覆盖高频查询。
- [ ] 是否避免跨库物理外键。
- [ ] 是否避免跨项目源码引用。
- [ ] Controller、Service、Repository/Mapper 是否按业务模块拆分，而不是一个管理类承载所有功能。
- [ ] 服务是否已接入 Nacos Discovery，并验证本地 `127.0.0.1:18848` 和容器内 `nacos:8848` 两种配置。
- [ ] Gateway 路由是否优先使用 `lb://service-name`，并通过 Nacos 注册发现验证。
- [ ] 菜单树、前端模块列表、按钮权限和数据权限是否以后端过滤为准，低权限账号是否无法从接口拿到无权限模块。
- [ ] 低权限账号拿到 Token 后，直接请求无权限管理接口是否返回 `FORBIDDEN`，而不是只依赖前端菜单隐藏。
- [ ] 核心类、方法、DTO、事件对象、关键业务判断、事务边界、幂等键、缓存 Key 和 MQ 处理是否已有详细中文注释。
- [ ] 自动测试是否使用本地明确默认配置连接 Docker MySQL/Redis/RabbitMQ 等真实中间件，且通过后用户可以不改配置直接启动项目。

## 5. 推荐提示词

```text
请使用 docs/plan/skill/java-spring-cloud-service-skill.md，开发当前 milestone 中的 Java 微服务功能。先检查设计文档和已有实现，再进行最小范围修改，完成后运行自动测试并更新 docs/plan 相关文件。
```

## 6. 常见坑

1. 把业务状态放在本地内存，导致 K8s 多实例不可用。
2. 忘记 MQ 消费幂等，重复投递导致重复扣库存。
3. 在服务启动时执行 DDL，多个 Pod 同时启动可能冲突。
4. 乙方服务直接依赖甲方实现源码，破坏项目边界。
5. 只写成功流程，没有验证失败和重试。
6. 注释只写“查询数据”“保存数据”，没有解释业务规则、幂等原因、事务边界或异常处理意图，后续学习和排查仍要反读代码。
7. 为了快速开发把用户、角色、菜单、字典、日志等全部写进一个 Controller，后续任何小改动都会影响整个系统管理模块。
8. 接入 Nacos 后只验证本地固定地址，没有验证 `lb://service-name` 路由和服务注册，导致容器或多实例环境不可用。
9. 只在前端过滤菜单，后端仍返回所有启用模块，导致低权限账号可以通过接口看到无权限入口。
10. 把“能登录认证中心”误认为“能访问认证中心所在模块”，导致 WMS/MES/AI 账号可以直接调用 sys 管理接口。


## 7. 2026-06-14 流程修正记录

- 后续开发 Java 微服务时，优先读取当前 milestone、ROADMAP、DEVELOPMENT_RULE 和 PROGRESS。docs/design 仅在 milestone 明确缺失信息、用户要求复核设计原文或出现重大设计争议时再读取，避免每个版本重复消耗上下文并造成开发边界漂移。
- 对登录态、风控、验证码、Token 黑名单、库存预扣、导入任务进度、分布式任务状态等多实例共享状态，不允许作为最终方案只放本地内存。可以在单测中保留 fallback，但运行环境必须优先使用 Redis、MySQL、MQ 或对象存储。
- H2 单测通过后，涉及 SQL 方言、字符集、排序、分页、唯一约束和初始化脚本的功能必须用目标数据库做一次真实联调。
- 2026-06-14 再次修正：真实联调不能依赖 AI 临时设置的环境变量。服务默认配置、Docker Compose 默认端口、Jenkins 流程、README 和 handle 必须保持一致；如果测试通过后用户直接启动仍失败，则该 skill 流程视为失效，必须优先修正配置和文档。

## 8. 2026-06-15 流程修正记录

- Java 微服务默认需要纳入 Nacos 服务发现治理。本地 SmartWarehouse-AI Nacos 宿主机端口为 `18848`，容器内地址为 `nacos:8848`；如果端口冲突导致变更，必须同步 application.yml、docker-compose、Jenkins、README、milestone 和 handle。
- Gateway 路由后端服务时优先使用 `lb://service-name`，并通过 Nacos 注册发现验证；不能只验证固定 URL 直连。
- 后端代码必须按业务模块拆分。以 sys-service 为例，认证、用户、角色、菜单、组织岗位、字典、前端模块、审计日志和风控记录应拆成独立 Controller；后续复杂度增加时继续拆 Service 与 Repository/Mapper。
- 代码结构优化必须保持接口 URL 契约稳定。拆分 Controller 或 Service 时，前端已使用的 `/api/sys/**` 路径不应无故变化。
- 菜单树和前端模块列表必须结合当前登录用户的角色菜单授权过滤。以 V02 为例，`admin` 可以看到 `sys,wms,mes,task,ai`，`wms_manager` 只能看到 `wms`；验收测试必须覆盖这种低权限账号。
- 2026-06-15 再次修正：低权限账号即使能通过 sys-service 登录门户，也不能访问系统管理接口。验收测试必须覆盖 `wms_manager` 可访问 `/api/sys/auth/me`，但访问 `/api/sys/users` 返回 `FORBIDDEN`。
