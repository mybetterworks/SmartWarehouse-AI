# V05 AI 乙方前后端基础模块

## 1. 版本状态

```text
状态：TODO
负责人：乙方 C AI 团队
前置版本：V04
输出结果：ai 后端 + ai-web 前端形成 RAG、ChatBI、多 Agent、MCP 最小闭环
```

## 2. 版本目标

1. 开发 `ai` Python 后端服务和 `ai-web` 前端项目。
2. 实现知识库、文档上传、切分、向量化和 RAG 问答。
3. 实现 ChatBI 只读查询基础能力。
4. 实现多 Agent 和 MCP 工具调用记录。
5. 实现 ai-web 问答、ChatBI、Agent、MCP 调用记录页面。
6. 通过 Jenkins 发布 AI 测试版本，通过阿里弹性容器发布 AI 正式版本检查。

## 3. 版本实现的技术栈

| 类型 | 技术 |
|---|---|
| AI 后端 | Python、FastAPI、LangChain |
| RAG | 文档切分、Embedding、Vector DB |
| ChatBI | NL2SQL、只读 SQL、结果解释 |
| Agent | PlannerAgent、InventoryAgent、RiskAgent |
| MCP | MCP Tool、调用日志 |
| 前端 | Vue、Element Plus、platform-ui、platform-sdk |
| CI/CD | Jenkins、阿里弹性容器 |

## 4. 相关表结构

```text
ai_knowledge_base
ai_document
ai_document_chunk
ai_chat_session
ai_chat_message
ai_bi_query_record
ai_mcp_tool_call_log
```

## 5. 开发步骤提示词

```text
请开发 V05 AI 乙方前后端基础模块。

要求：
1. 创建 ai FastAPI 服务和 ai-web 前端项目。
2. 实现知识库、文档上传、切分、向量化和 RAG 问答。
3. 实现 ChatBI 只读 SQL 生成、白名单、超时和最大返回行数。
4. 实现多 Agent 最小流程和 MCP 工具调用日志。
5. ai-web 实现 RAG 问答、ChatBI、多 Agent、MCP 调用记录页面。
6. 本版本先完成 AI 自身最小闭环，跨 WMS/MES/task 深度联动放到 V08。
7. AI 接口统一走 /api/ai/**，前端路由使用 /ai，部署入口使用 /apps/ai/。
8. 补充 AI Jenkins 测试发布流程。
9. 补充 AI 阿里弹性容器正式发布检查。
10. 更新本文件实现记录、study、handle 和 PROGRESS.md。
```

## 6. 自动测试提示词

```text
请验证 V05 AI 乙方前后端基础模块。

测试项：
1. ai-service 健康检查通过。
2. ai-web 构建通过。
3. 可创建知识库并上传文档。
4. RAG 问答返回答案和引用片段。
5. ChatBI 只允许 SELECT 查询。
6. MCP 工具调用写入日志。
7. ai-web 页面可以调用 ai-service。
8. Jenkins 测试版本发布成功。
9. 阿里弹性容器正式发布检查通过。
```

## 7. 验收标准

1. AI 后端和前端在同一版本可演示。
2. RAG、ChatBI、多 Agent、MCP 都有最小可用闭环。
3. ChatBI 有只读安全限制。
4. AI 测试环境和正式环境发布检查都有记录。

## 8. 验收操作过程

```text
1. 登录系统进入 AI 页面。
2. 创建知识库并上传文档。
3. 进行 RAG 问答并查看引用。
4. 执行 ChatBI 查询。
5. 触发 Agent 分析和 MCP 工具调用。
6. 查看 AI 调用记录。
7. 执行 Jenkins AI 测试发布。
8. 检查阿里弹性容器 AI 正式发布配置。
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
