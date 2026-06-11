# V05 AI 乙方前后端基础模块

## 1. 版本状态

```text
状态：TODO
负责人：乙方 C AI 团队
前置版本：V04
输出结果：ai 后端 + ai-web 前端形成 RAG、ChatBI、多 Agent、MCP 最小闭环
```

## 2. 版本开发输入边界

本文件已经内置 V05 需要的设计信息。开发 V05 时以本文件、`docs/plan/ROADMAP.md`、`docs/plan/DEVELOPMENT_RULE.md`、`docs/plan/PROGRESS.md` 为准，不需要再读取 `docs/design` 下的设计文档。

V05 只开发 AI 乙方自身最小闭环，包括 AI 后端、AI 前端、知识库、文档向量化、RAG 问答、ChatBI 安全框架、多 Agent 路由和 MCP 工具调用日志。AI 深度查询 WMS/MES/task/sys 真实业务数据放到 V08。

## 3. 版本目标

1. 开发 `ai` Python 后端服务，使用 FastAPI + LangChain。
2. 开发根目录平级项目 `ai-web`，不得放入 `frontend-platform` 内。
3. 实现知识库、文档上传、文档切分、向量化、RAG 问答。
4. 实现 Prompt 模板组织和基础问答提示词。
5. 实现 ChatBI 只读 SQL 生成、安全校验、超时和最大返回行数限制。
6. 实现多 Agent 最小流程：Router、WMS QA、MES 分析、BI、Risk。
7. 实现 MCP 工具定义、只读约束和工具调用日志。
8. 实现 `ai-web` 的 RAG 问答、ChatBI、多 Agent、MCP 调用记录页面。
9. 通过 Jenkins 发布 AI 测试版本，通过阿里弹性容器发布 AI 正式版本检查。

## 4. 项目与代码架构

### 4.1 后端目录

```text
ai
├── README.md
├── pyproject.toml
├── requirements.txt
├── ai-service
│   ├── ai_service
│   │   ├── api
│   │   ├── rag
│   │   ├── prompts
│   │   ├── agents
│   │   ├── mcp
│   │   ├── chatbi
│   │   ├── clients
│   │   ├── vector_db
│   │   ├── schemas
│   │   └── core
│   └── tests
└── deploy
    ├── Dockerfile
    ├── docker-compose.ai.yml
    ├── env.example
    └── README.md
```

包职责：

| 包 | 职责 |
|---|---|
| `api` | FastAPI 路由、依赖注入、健康检查。 |
| `rag` | 文档解析、切分、向量检索、重排、答案生成。 |
| `prompts` | Prompt 模板、系统提示词、ChatBI 提示词。 |
| `agents` | RouterAgent、WmsQaAgent、MesAgent、BiAgent、RiskAgent。 |
| `mcp` | MCP Tool 定义、调用调度、只读约束。 |
| `chatbi` | NL2SQL、SQL 安全校验、查询执行、结果解释。 |
| `clients` | Java 服务 REST 客户端，V05 只保留适配接口或 mock。 |
| `vector_db` | Chroma / FAISS / Milvus 适配，MVP 推荐 Chroma 或 FAISS。 |
| `schemas` | Pydantic 请求响应模型。 |
| `core` | 配置、日志、异常、鉴权上下文。 |

### 4.2 前端目录

```text
ai-web
├── package.json
├── vite.config.ts
├── tsconfig.json
├── src
│   ├── api
│   ├── assets
│   ├── components
│   ├── router
│   ├── stores
│   ├── views
│   └── module.ts
└── deploy
```

`module.ts` 必须声明：

```ts
export default {
  name: 'ai',
  title: 'AI 助手',
  routePrefix: '/ai',
  entry: '/apps/ai/',
  apiPrefix: '/api/ai',
  permissions: [
    'ai:rag:chat',
    'ai:knowledge:manage',
    'ai:chatbi:query',
    'ai:agent:analyze',
    'ai:mcp-log:view'
  ]
}
```

### 4.3 乙方边界

1. `ai` 不直接依赖 Java 服务实现源码。
2. V05 可通过 mock client 或只读示例数据完成 AI 自身闭环。
3. V08 再通过 MCP / REST 查询真实 WMS、MES、task、sys 数据。
4. `ai-web` 只能通过 `@smartwarehouse/*` npm 包复用甲方前端能力。
5. AI 接口统一通过 Gateway 暴露为 `/api/ai/**`。
6. AI 前端路由统一以 `/ai` 开头，部署入口为 `/apps/ai/`。

## 5. 业务功能要求

### 5.1 知识库

支持：

```text
创建知识库
启用/禁用知识库
上传文档
查看文档解析状态
删除或禁用文档
查看文档片段
```

文档类型：

```text
系统操作手册
仓储 SOP
异常处理文档
Markdown / TXT / PDF / DOCX 可按实际依赖逐步支持
```

V05 至少支持 Markdown / TXT。PDF / DOCX 可作为扩展。

### 5.2 RAG 问答

流程：

```text
用户提问
  -> 问题改写
  -> 向量检索
  -> 召回文档片段
  -> 可选重排
  -> 组装 Prompt
  -> LLM 生成答案
  -> 返回引用来源
  -> 写入会话和消息记录
```

要求：

1. 返回答案和引用片段。
2. 记录会话和消息。
3. AI 服务不可用或 LLM 未配置时返回友好降级。
4. LLM API Key 必须通过环境变量或 Secret 注入，不得写入仓库。

### 5.3 Prompt 工程

至少提供：

```text
rag_system_prompt
rag_answer_prompt
chatbi_sql_prompt
chatbi_explain_prompt
router_agent_prompt
risk_agent_prompt
```

Prompt 模板要可配置，默认放在 `ai_service/prompts`，敏感配置不写入模板。

### 5.4 ChatBI 最小闭环

V05 实现 ChatBI 安全框架和最小查询闭环。可以使用 AI 自身示例数据源或只读 mock 数据，真实业务库查询在 V08 打通。

流程：

```text
用户输入自然语言问题
  -> 识别指标和维度
  -> 选择数据源
  -> 生成 SQL
  -> SQL 安全校验
  -> 执行只读查询
  -> 生成文字解释
  -> 返回表格和图表建议
  -> 写入 ai_bi_query_record
```

安全规则：

1. 只允许 `SELECT`。
2. 禁止 `delete`、`update`、`insert`、`drop`、`alter`、`truncate`、`create`。
3. 限制超时时间。
4. 限制最大返回行数。
5. 记录生成 SQL、是否通过安全校验、耗时和结果摘要。

### 5.5 多 Agent

Agent：

| Agent | V05 职责 |
|---|---|
| `RouterAgent` | 判断问题类型，路由到 RAG、WMS QA、MES、BI 或 Risk。 |
| `WmsQaAgent` | 基于知识库回答仓储、库存、入库、出库规则问题。 |
| `MesAgent` | 基于知识库回答工单、物料申请、配送状态规则问题。 |
| `BiAgent` | 调用 ChatBI 安全查询框架。 |
| `RiskAgent` | 基于知识库或 mock 数据解释登录风控、库存异常、任务失败。 |

### 5.6 MCP 工具

V05 实现工具定义和调用日志，可对 mock adapter 或 AI 自身只读数据执行。

工具：

```text
query_inventory
query_work_order
query_material_apply
query_stock_alert
query_daily_stat
run_safe_sql
```

约束：

1. 工具只允许只读。
2. 工具调用必须生成 `tool_call_id`。
3. 每次调用写入 `ai_mcp_tool_call_log`。
4. 真实 WMS/MES/task/sys 查询在 V08 替换为业务服务 client。

## 6. 接口设计

### 6.1 健康检查

```text
GET /api/ai/health
GET /api/ai/health/live
GET /api/ai/health/ready
```

### 6.2 知识库接口

```text
GET    /api/ai/knowledge-bases
POST   /api/ai/knowledge-bases
GET    /api/ai/knowledge-bases/{id}
PUT    /api/ai/knowledge-bases/{id}
PUT    /api/ai/knowledge-bases/{id}/status
```

### 6.3 文档接口

```text
POST /api/ai/documents/upload
GET  /api/ai/documents
GET  /api/ai/documents/{id}
POST /api/ai/documents/{id}/index
GET  /api/ai/documents/{id}/chunks
```

### 6.4 RAG 问答接口

```text
POST /api/ai/rag/chat
GET  /api/ai/chat/sessions
GET  /api/ai/chat/sessions/{id}/messages
```

请求：

```json
{
  "kbCode": "warehouse-sop",
  "sessionId": "optional",
  "question": "离线上传入库失败怎么办？"
}
```

响应：

```json
{
  "sessionId": 1,
  "answer": "...",
  "references": [
    {
      "docName": "仓储 SOP.md",
      "chunkIndex": 3,
      "content": "..."
    }
  ]
}
```

### 6.5 ChatBI 接口

```text
POST /api/ai/chatbi/query
GET  /api/ai/chatbi/records
GET  /api/ai/chatbi/records/{id}
```

请求：

```json
{
  "question": "最近 7 天哪个物料申请次数最多？",
  "dataScope": "demo"
}
```

### 6.6 Agent 接口

```text
POST /api/ai/agents/route
POST /api/ai/agents/analyze
```

### 6.7 MCP 日志接口

```text
GET /api/ai/mcp/tool-call-logs
GET /api/ai/mcp/tool-call-logs/{id}
```

## 7. 前端页面设计

`ai-web` 必须实现：

```text
/ai/knowledge-base       知识库管理
/ai/document             文档管理
/ai/rag-chat             RAG 问答
/ai/chatbi               ChatBI
/ai/agent                多 Agent 分析
/ai/mcp-tool-log         MCP 工具调用记录
```

页面要求：

1. 使用 `PlatformPage`、`PlatformSearchForm`、`PlatformTable`、`PlatformModalForm`、`PermissionButton`、`FileUpload`、`StatusTag`。
2. RAG 页面支持会话列表、问题输入、答案展示、引用片段展示。
3. ChatBI 页面展示问题、生成 SQL、安全状态、结果表格、文字总结。
4. Agent 页面展示路由结果、分析过程摘要、最终结论。
5. MCP 日志页面展示工具名、请求、响应、状态、错误信息、耗时。
6. 所有请求使用 `platform-sdk`，不写死 API 地址。

## 8. 数据库设计

数据库：`smart_ai`

### 8.1 ai_knowledge_base

```text
id bigint PK
kb_code varchar(64) UK
kb_name varchar(128)
description varchar(255)
status varchar(32) IDX -- ENABLED/DISABLED
created_time datetime
updated_time datetime
```

### 8.2 ai_document

```text
id bigint PK
kb_id bigint IDX
doc_name varchar(255)
doc_type varchar(64)
file_path varchar(512)
file_hash varchar(128)
status varchar(32) IDX -- UPLOADED/INDEXED/FAILED
created_time datetime
```

建议 `file_path` 保存对象存储 URI，例如 `oss://bucket/path/file.pdf` 或 MinIO URL，不保存单个 Pod 的本地临时目录。

### 8.3 ai_document_chunk

```text
id bigint PK
doc_id bigint IDX
kb_id bigint IDX
chunk_index int
chunk_text text
vector_id varchar(128) IDX
metadata_json text
created_time datetime
```

建议唯一约束：`uk_ai_doc_chunk(doc_id, chunk_index)`

### 8.4 ai_chat_session

```text
id bigint PK
user_id bigint IDX
session_title varchar(255)
session_type varchar(64) IDX -- RAG/CHATBI/AGENT
created_time datetime IDX
updated_time datetime
```

### 8.5 ai_chat_message

```text
id bigint PK
session_id bigint IDX
role varchar(32) -- user/assistant/tool
content text
references_json text
created_time datetime IDX
```

### 8.6 ai_bi_query_record

```text
id bigint PK
user_id bigint IDX
question varchar(1024)
generated_sql text
safe_status varchar(32) -- PASS/REJECT
result_summary text
cost_ms bigint
created_time datetime IDX
```

### 8.7 ai_mcp_tool_call_log

```text
id bigint PK
tool_call_id varchar(128) UK
tool_name varchar(128) IDX
user_id bigint IDX
request_json text
response_json text
status varchar(32) IDX -- SUCCESS/FAILED
error_message varchar(1024)
created_time datetime IDX
```

## 9. 向量库与文件存储设计

向量库 MVP：

```text
本地开发：Chroma 或 FAISS + Docker volume
后续扩展：Milvus / 独立 Vector DB Cluster
```

文件存储：

```text
本地开发：Docker MinIO 或本地挂载目录
正式环境：阿里云 OSS、MinIO、PVC
```

K8s 约束：

1. RAG 原始文档不得只保存在 Pod 本地磁盘。
2. 向量索引必须持久化。
3. AI 会话状态必须落 MySQL，不得只存在进程内存。
4. LLM API Key 使用 Secret 注入。

## 10. K8s / 多实例开发约束

1. `ai-service` 必须无状态。
2. 长耗时 LLM 调用必须设置超时、重试、限流和熔断。
3. ChatBI SQL 必须只读、限制超时和最大返回行数。
4. 健康检查不能调用 LLM 或执行重 SQL。
5. 健康检查提供：

```text
/health/live
/health/ready
```

6. 日志输出 stdout，携带 `traceId`、`serviceName`、`sessionId`、`toolCallId`。
7. 前端镜像不得包含 `.npmrc`、npm token 或私有 registry 凭据。

## 11. Jenkins 与阿里弹性容器

Jenkins 测试流水线：

```text
安装 Python 依赖
运行 ruff/pytest 或等价测试
构建 ai-service Docker 镜像
构建 ai-web
发布测试环境
执行健康检查和 AI 冒烟测试
```

阿里弹性容器正式发布检查：

```text
正式镜像 tag
release 依赖版本
环境变量模板
LLM API Key Secret
Vector DB/对象存储配置
健康检查
资源限制
回滚说明
```

## 12. 开发步骤提示词

```text
请开发 V05 AI 乙方前后端基础模块。

要求：
1. 只根据本 milestone、ROADMAP、DEVELOPMENT_RULE、PROGRESS 开发，不再读取 docs/design。
2. 创建 ai FastAPI 服务和 ai-web 前端项目。
3. 实现知识库、文档上传、切分、向量化和 RAG 问答。
4. 实现 Prompt 模板组织。
5. 实现 ChatBI 只读 SQL 生成、白名单、超时和最大返回行数。
6. 实现 RouterAgent、WmsQaAgent、MesAgent、BiAgent、RiskAgent 最小流程。
7. 实现 MCP 工具定义和工具调用日志。
8. ai-web 实现知识库、文档、RAG 问答、ChatBI、多 Agent、MCP 调用记录页面。
9. 本版本先完成 AI 自身最小闭环，跨 WMS/MES/task/sys 深度联动放到 V08。
10. AI 接口统一走 /api/ai/**，前端路由使用 /ai，部署入口使用 /apps/ai/。
11. 补充 AI Jenkins 测试发布流程。
12. 补充 AI 阿里弹性容器正式发布检查。
13. 自动检查并更新 .gitignore，避免 __pycache__、.venv、dist、node_modules、向量库本地数据、上传文件、日志、.env、本地配置和密钥入库。
14. 检查本次准备纳入 Git 的文件是否存在账号、密码、token、API Key、私钥或内部地址，如存在必须改为环境变量、Secret、Jenkins 凭证或示例模板。
15. 更新本文件实现记录、对应 study、handle、PROGRESS 和根 README。
```

## 13. 自动测试提示词

```text
请验证 V05 AI 乙方前后端基础模块。

测试项：
1. ai-service 健康检查通过。
2. ai-service 单元测试通过。
3. ai-web 构建通过。
4. 可创建知识库并上传文档。
5. 文档可切分并写入 ai_document_chunk。
6. RAG 问答返回答案和引用片段。
7. ChatBI 只允许 SELECT 查询，危险 SQL 被拒绝。
8. MCP 工具调用写入日志。
9. ai-web 页面可以调用 ai-service。
10. Jenkins 测试版本发布成功。
11. 阿里弹性容器正式发布检查通过。
12. 构建产物不包含 LLM API Key、npm token、对象存储密钥。
```

## 14. 验收标准

1. AI 后端和前端在同一版本可演示。
2. RAG、ChatBI、多 Agent、MCP 都有最小可用闭环。
3. ChatBI 有只读安全限制。
4. 文档、会话、消息、BI 查询、MCP 工具调用均可追踪。
5. AI 测试环境和正式环境发布检查都有记录。

## 15. 验收操作过程

```text
1. 登录系统进入 AI 页面。
2. 创建知识库并上传文档。
3. 对文档执行索引。
4. 进行 RAG 问答并查看引用。
5. 执行 ChatBI 查询，验证 SELECT 可用、危险 SQL 被拒绝。
6. 触发 Agent 分析和 MCP 工具调用。
7. 查看 AI 调用记录。
8. 执行 Jenkins AI 测试发布。
9. 检查阿里弹性容器 AI 正式发布配置。
```

## 16. 实现记录

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
