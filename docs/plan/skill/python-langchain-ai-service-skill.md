# Python LangChain AI 服务开发 Skill

## 1. 适用场景

用于开发 `ai` 项目中的 FastAPI、LangChain、RAG、Prompt、多 Agent、MCP、ChatBI 和向量数据库相关能力。

## 2. 输入

- 当前 milestone 文件。
- `docs/design/software-requirements-specification.md`
- `docs/design/detailed-design.md` AI 章节。
- `docs/design/database-design.md` 中 `smart_ai` 表结构。
- AI 服务目录和依赖文件。

## 3. 执行步骤

1. 确认 AI 服务接口边界和 Java 服务调用方式。
2. 实现 FastAPI 应用、健康检查和统一响应。
3. 设计知识库、文档、chunk、会话和消息数据流。
4. 文档上传后保存对象存储地址，不依赖 Pod 本地目录。
5. 文档解析、切分、Embedding、向量入库要可重复执行。
6. RAG 返回答案、引用片段和会话记录。
7. ChatBI 必须只读、限制表范围、限制 SQL 类型、限制超时和返回行数。
8. 多 Agent 明确 Planner、Tool、Result、Summary 的职责。
9. MCP Tool 调用记录 tool_call_id、参数、结果、耗时和状态。
10. LLM API Key、向量库地址、数据库账号通过环境变量或 Secret 注入。
11. 为核心类、函数和关键代码行补充中文注释，说明 RAG 数据流、Prompt 设计、Agent 分工、MCP 调用、ChatBI 安全限制和异常兜底原因。
12. 增加最小样例和自动测试。

## 4. 检查清单

- [ ] 健康检查可用。
- [ ] RAG 可在样例文档上稳定回答。
- [ ] ChatBI 不允许写 SQL。
- [ ] MCP 调用幂等。
- [ ] AI 文件不依赖 Pod 本地路径。
- [ ] 敏感配置未写入代码。
- [ ] 响应时间和超时可控。
- [ ] 错误信息可追踪但不泄漏密钥。
- [ ] RAG、Prompt、Agent、MCP、ChatBI、向量库写入/检索等核心函数和关键代码行已有详细中文注释。

## 5. 推荐提示词

```text
请使用 docs/plan/skill/python-langchain-ai-service-skill.md，开发当前 milestone 中的 AI 服务能力。重点保证 RAG、ChatBI、Agent 和 MCP 的最小可演示闭环，并补充安全限制和调用日志。
```

## 6. 常见坑

1. ChatBI 直接执行模型生成的任意 SQL。
2. 文档和向量索引只放在本地磁盘。
3. RAG 不返回引用，难以解释答案来源。
4. MCP 工具重试导致重复执行。
5. API Key 写死在代码或配置文件中。
6. AI 链路只堆代码不写中文注释，导致后续无法快速理解 chunk 切分、召回、重排、Prompt 约束、Agent 工具调用和 SQL 安全限制。
