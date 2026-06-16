# Jenkins 与阿里弹性容器发布 Skill

## 1. 适用场景

用于每个版本开发完成后，检查测试环境和正式环境发布能力。Jenkins 负责本地构建、自动测试和测试环境发布；阿里弹性容器负责正式环境部署和正式版本演示。

## 2. 输入

- 当前 milestone 文件。
- 当前服务或前端项目目录。
- Maven、npm、Python 构建命令。
- Dockerfile 或镜像构建配置。
- Jenkins 流水线配置。
- 阿里弹性容器正式环境配置。

## 3. 执行步骤

1. 确认当前版本涉及的前端和后端模块。
2. 编写或更新 Jenkins 流水线。
3. Jenkins 在执行后端测试前，先启动或检查当前版本依赖的本地 Docker 中间件，例如 MySQL、Redis、RabbitMQ、Nacos、Vector DB、MinIO。
4. Jenkins 执行依赖安装、单元测试、真实中间件验收测试、前端构建、AI 测试。
5. Jenkins 构建测试镜像或测试构建产物。
6. Jenkins 发布到本地 Docker / Docker Compose 测试环境。
7. AI 可以按需要操作本地 Docker Desktop，自动拉取基础镜像、构建测试镜像、启动或重启测试容器、执行容器内初始化/验证脚本，并读取容器日志排查问题。
8. 检查阿里弹性容器正式环境配置。
9. 正式环境使用 release 制品和正式镜像。
10. 检查环境变量、密钥、健康检查、日志和回滚说明。
11. 将测试发布结果和正式发布检查写入 milestone 实现记录。

## 4. 检查清单

- [ ] Jenkins 凭证未写入仓库。
- [ ] AI 已按需完成本地 Docker Desktop 镜像拉取、镜像构建、容器启动、脚本执行、日志读取和健康检查。
- [ ] Docker 脚本、Compose 配置和镜像构建上下文不包含真实账号、密码、token、私钥、内部地址或云厂商密钥。
- [ ] 删除卷、清空数据库、删除镜像或 prune 类可能丢数据的 Docker 操作已经获得用户明确确认，未确认时不得执行。
- [ ] 测试环境使用 snapshot 制品。
- [ ] 正式环境使用 release 制品。
- [ ] 镜像不包含 `.npmrc`、token、构建缓存和明文密钥。
- [ ] 前端、后端、AI 构建命令都在流水线中体现。
- [ ] 后端自动测试前已经启动真实 Docker 中间件，测试配置与人工启动默认配置一致。
- [ ] 测试环境发布后可访问健康检查或页面。
- [ ] 阿里弹性容器正式环境配置包含环境变量和密钥管理。
- [ ] 正式环境有健康检查和回滚说明。

## 5. 推荐提示词

```text
请使用 docs/plan/skill/cicd-jenkins-eci-skill.md，为当前 milestone 补充 Jenkins 测试环境发布和阿里弹性容器正式环境发布检查。完成后把结果写入 milestone、handle 和 PROGRESS.md。
```

## 6. 常见坑

1. 把部署留到最后一个版本才处理。
2. Jenkins 只构建后端，漏掉当前模块前端。
3. 测试版本误用 release 制品。
4. 正式镜像带入 `.npmrc` 或 token。
5. 正式环境没有健康检查，部署后无法判断是否可用。


## 7. 2026-06-14 流程修正记录

- Docker 镜像构建失败时要区分项目配置错误和外部镜像源/网络错误。若失败发生在拉取基础镜像或 Docker Hub token 请求阶段，应记录网络阻塞，并保留 Maven、前端构建、compose config、服务本地启动和健康检查等替代验证证据。
- Compose 或 Jenkinsfile 中不得写死真实 npm registry、云厂商密钥、数据库密码、JWT Secret 或 Docker Hub 凭证；真实值通过环境变量、Jenkins Credentials、Secret 或本地被忽略的配置文件注入。
- Jenkins 的测试顺序必须和人工验收顺序一致：先启动本地中间件，再运行后端测试和真实中间件验收测试，最后再做镜像构建、测试环境发布和健康检查。不能先跑只依赖 H2/Mock 的测试，再声称 Docker 中间件联调完成。
