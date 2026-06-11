# V08 手搓步骤：AI 与业务服务交互及发布加固

## 1. 环境准备

```text
V07 完整业务链路可用
AI 服务和 ai-web 可用
Jenkins 全链路流水线可用
阿里弹性容器正式环境可用
```

## 2. 命令步骤

```powershell
python -m pytest
mvn test
pnpm build
```

全链路发布检查：

```powershell
docker images
kubectl --help
```

## 3. 关键代码位置

```text
ai/ai_service/mcp
ai/ai_service/chatbi
ai/ai_service/agents
ai-web
sys
wms
mes
task
jenkins
deploy/eci
```

## 4. 核心代码片段

版本完成后补充：

```python
# MCP 查询业务服务工具
```

```python
# ChatBI 业务查询白名单
```

```yaml
# 阿里弹性容器正式发布配置
```

## 5. 验证命令

```powershell
python -m pytest
mvn test
pnpm build
```

## 6. 常见错误

1. AI 查询业务数据没有只读限制。
2. MCP 工具没有调用日志。
3. 正式环境无健康检查和回滚说明。
4. 日志没有 traceId，跨服务问题难定位。

## 7. 手动还原步骤

1. 封装 AI 查询业务服务 MCP 工具。
2. 扩展 ChatBI 业务数据查询。
3. 实现 Agent 风险分析。
4. 联调 ai-web 和业务服务。
5. 完善 Jenkins 全链路测试发布。
6. 完善阿里弹性容器正式部署、健康检查、回滚和可观测性。

## 8. 改进记录

```text
日期：
改进内容：
原因：
验证结果：
```
