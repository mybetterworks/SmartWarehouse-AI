# .gitignore 自动维护与敏感信息检查 Skill

## 1. 适用场景

用于每次开发、问题修复、模块新增、依赖安装、构建脚本调整、部署配置调整后，自动检查 `.gitignore` 是否需要更新，并检查准备纳入 Git 的文件是否包含隐私、敏感数据、账号、密码、token、API Key、私钥或内部配置。

## 2. 输入

- 当前 milestone 文件。
- 本次新增、修改、删除的文件清单。
- 当前 `.gitignore` 内容。
- `git status --short` 输出。
- 相关配置文件、构建文件、部署文件和文档。

## 3. 执行步骤

1. 查看 `git status --short`，识别新增文件和待提交文件。
2. 检查是否出现构建产物、依赖目录、日志、IDE 配置、本地配置、证书、密钥、缓存目录。
3. 如果出现不应进入 Git 的文件类型，自动更新 `.gitignore`。
4. 对准备纳入 Git 的文本文件执行敏感关键词检查。
5. 对配置文件检查是否存在真实账号、密码、token、API Key、私钥、数据库连接串、云厂商密钥、LLM Key。
6. 发现敏感信息时，迁移到统一配置或设置管理。
7. 提交示例模板时，只保留占位符，例如 `<DB_PASSWORD>`、`<JWT_SECRET>`、`<ALIYUN_ACCESS_KEY>`、`<LLM_API_KEY>`。
8. 在当前 milestone、PROGRESS 或 handle 中记录 `.gitignore` 更新结果和敏感信息检查结果。

## 4. .gitignore 检查清单

- [ ] Java 构建产物：`target/`
- [ ] 前端依赖与构建产物：`node_modules/`、`dist/`、`.vite/`
- [ ] Python 缓存和虚拟环境：`__pycache__/`、`.venv/`、`.pytest_cache/`
- [ ] IDE 配置：`.idea/`、`.vscode/`
- [ ] 日志与临时文件：`logs/`、`*.log`、`tmp/`
- [ ] 本地环境文件：`.env`、`.env.*`，但允许 `.env.example`
- [ ] 本地配置：`*-local.yml`、`*-local.yaml`、`*.local`
- [ ] npm 凭证：`.npmrc`
- [ ] 密钥证书：`*.pem`、`*.key`、`*.p12`、`*.jks`

## 5. 敏感信息检查清单

- [ ] `password`、`pwd`、`secret`、`token`、`api_key`
- [ ] `access_key`、`secret_key`、`_authToken`
- [ ] `Authorization`、`Bearer`
- [ ] `BEGIN PRIVATE KEY`、`BEGIN RSA PRIVATE KEY`
- [ ] `jdbc:mysql://`、`redis://`、`amqp://`
- [ ] 阿里云 AccessKey、LLM API Key、数据库账号密码、Jenkins 凭证
- [ ] 个人隐私数据、真实手机号、真实邮箱、真实身份证号

## 6. 敏感信息处理方式

| 场景 | 推荐处理 |
|---|---|
| Java 数据库密码 | Nacos、环境变量、Secret |
| JWT Secret | 环境变量、Secret、启动参数 |
| npm token | Jenkins Credentials、构建阶段注入 |
| 阿里云密钥 | 阿里弹性容器环境变量或平台密钥管理 |
| LLM API Key | AI 服务环境变量或 Secret |
| 本地配置 | `.gitignore` 忽略真实文件，提交 `.example` 模板 |
| 文档示例 | 使用 `<PLACEHOLDER>` 占位符 |

## 7. 推荐提示词

```text
请使用 docs/plan/skill/gitignore-secret-scan-skill.md，检查本次开发新增和修改的文件。自动更新 .gitignore，扫描准备纳入 Git 的文件是否包含敏感信息，并把检查结果写入当前 milestone、handle 和 PROGRESS.md。
```

## 8. 常见坑

1. 初始化项目后把 `.idea/`、`node_modules/`、`target/` 加入 Git。
2. `.npmrc` 中带 `_authToken` 被提交。
3. `application-local.yml` 中包含真实数据库密码。
4. Jenkinsfile 中硬编码账号密码。
5. 文档示例中写入真实 AccessKey 或 LLM API Key。
6. 前端代码中出现后端密钥或云厂商密钥。
