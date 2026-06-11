# V05 手搓步骤：AI 乙方前后端基础模块

## 1. 环境准备

```text
Python
Vector DB
MySQL
对象存储或 MinIO
Node v22.22.3
Jenkins
阿里弹性容器
```

## 2. 命令步骤

```powershell
cd ai
pip install -r requirements.txt
python -m pytest
uvicorn ai_service.main:app --host 0.0.0.0 --port 8000

cd ../ai-web
pnpm install
pnpm build
```

## 3. 关键代码位置

```text
ai/ai_service/api
ai/ai_service/rag
ai/ai_service/chatbi
ai/ai_service/agents
ai/ai_service/mcp
ai-web
Jenkinsfile 或 jenkins/ai
deploy/eci/ai
```

## 4. 核心代码片段

版本完成后补充：

```python
# RAG 检索和生成
```

```python
# ChatBI SQL Guard
```

```ts
// ai-web 问答页面
```

## 5. 验证命令

```powershell
python -m pytest
curl http://localhost:8000/health
pnpm build
```

## 6. 常见错误

1. ChatBI 允许写 SQL。
2. RAG 不返回引用片段。
3. 只做 AI 后端，没有 ai-web 页面。
4. LLM API Key 写入代码。

## 7. 手动还原步骤

1. 初始化 ai-service。
2. 实现 RAG、ChatBI、Agent、MCP。
3. 实现 ai-web 页面。
4. 联调 /api/ai/**。
5. 配置 Jenkins AI 测试发布。
6. 检查阿里弹性容器 AI 正式发布配置。

## 8. 改进记录

```text
日期：
改进内容：
原因：
验证结果：
```
