# V02 甲方前后端基座与 CI/CD 基线

## 1. 版本状态

```text
状态：TODO
负责人：甲方平台团队
前置版本：V01
输出结果：可登录的平台基座、sys 管理前后端、Jenkins 测试发布和阿里弹性容器正式发布基线
```

## 2. 版本目标

1. 开发 `platform`、`gateway`、`sys` 后端基座。
2. 开发 `frontend-platform/apps/portal-shell` 和 `frontend-platform/apps/sys-web`。
3. 实现登录、退出、刷新 Token、用户信息、菜单、角色、数据权限。
4. 实现登录风控：连续失败 3 次后启用随机拼图验证码。
5. 接入 Jenkins 测试环境流水线。
6. 接入阿里弹性容器正式环境发布基线。

## 3. 版本实现的技术栈

| 类型 | 技术 |
|---|---|
| 后端 | Spring Boot、Spring Cloud Alibaba、Gateway、Spring Security、JWT |
| 前端 | portal-shell、sys-web、platform-ui、platform-sdk |
| 缓存 | Redis、Token 黑名单、验证码缓存 |
| 数据 | MySQL、Flyway / Liquibase |
| CI/CD | Jenkins、Docker、阿里弹性容器 |
| 制品 | 阿里云效 Maven/npm snapshot 与 release |

## 4. 相关表结构

```text
sys_user
sys_role
sys_menu
sys_frontend_module
sys_user_role
sys_role_menu
sys_dept
sys_post
sys_dict_type
sys_dict_item
sys_user_warehouse
sys_login_log
sys_oper_log
sys_risk_record
```

## 5. 开发步骤提示词

```text
请开发 V02 甲方前后端基座与 CI/CD 基线版本。

要求：
1. 先确认 V01 组件库可被 portal-shell 和 sys-web 引用。
2. 实现 platform-parent、platform-bom、platform-common-* 基础能力。
3. 实现 gateway-service 路由、鉴权、限流、熔断。
4. 实现 sys-service 登录、退出、刷新 Token、用户、角色、菜单、数据权限、日志和登录风控。
5. 实现 portal-shell 登录页、Token 管理、菜单装载、模块入口。
6. 实现 sys-web 用户、角色、菜单、部门、岗位、字典、日志、风控和数据权限页面。
7. 配置 Jenkins 流水线：构建、测试、发布测试环境。
8. 配置阿里弹性容器正式发布基线：正式镜像、环境变量、密钥、健康检查。
9. 更新本文件实现记录、study、handle 和 PROGRESS.md。
```

## 6. 自动测试提示词

```text
请验证 V02 甲方前后端基座。

测试项：
1. gateway/sys/platform 后端测试通过。
2. portal-shell/sys-web 构建通过。
3. 登录、刷新 Token、退出流程可用。
4. 连续 3 次登录失败后启用随机拼图验证码。
5. 不同角色看到不同菜单。
6. 仓库管理员数据权限生效。
7. Jenkins 能完成测试环境构建和发布。
8. 阿里弹性容器正式发布配置检查通过。
```

## 7. 验收标准

1. 用户可通过统一登录页登录系统。
2. sys-web 可维护基础权限数据。
3. 网关鉴权和数据权限生效。
4. Jenkins 测试环境发布跑通。
5. 阿里弹性容器正式环境发布基线可用。

## 8. 验收操作过程

```text
1. 启动 MySQL、Redis、Nacos、gateway-service、sys-service。
2. 启动 portal-shell 和 sys-web。
3. 登录管理员账号，验证用户、角色、菜单和日志页面。
4. 连续错误登录 3 次，验证拼图验证码。
5. 执行 Jenkins 流水线，查看测试发布结果。
6. 执行阿里弹性容器正式发布 dry-run 或配置检查。
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
