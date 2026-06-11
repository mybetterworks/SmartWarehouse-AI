# V08 AI 与业务服务交互及发布加固

## 1. 版本状态

```text
状态：TODO
负责人：甲方平台团队统筹，AI/WMS/MES 乙方配合
前置版本：V07
输出结果：AI 与业务服务深度联动，正式环境发布、可观测性和弹性容器演示完善
```

## 2. 版本目标

1. AI 通过 MCP / REST 查询 WMS、MES、task 业务数据。
2. ChatBI 支持库存、工单、入库、出库、排行和预警查询。
3. 多 Agent 支持库存风险、登录风控、任务失败分析。
4. 完善 Jenkins 全链路测试流水线。
5. 完善阿里弹性容器正式环境部署、回滚、健康检查和可观测性。

## 3. 版本实现的技术栈

| 类型 | 技术 |
|---|---|
| AI 集成 | LangChain、MCP、ChatBI、多 Agent |
| 业务服务 | sys、wms、mes、task |
| 可观测性 | stdout 日志、traceId、指标、健康检查 |
| 发布 | Jenkins、阿里弹性容器、阿里云效 release/snapshot |
| 云原生约束 | 无状态、配置外置、优雅停机、多实例幂等 |

## 4. 相关表结构

```text
ai_bi_query_record
ai_mcp_tool_call_log
ai_chat_session
ai_chat_message
sys_risk_record
wms_inventory_batch
mes_material_apply
task_stat_daily
task_rank_snapshot
```

## 5. 开发步骤提示词

```text
请开发 V08 AI 与业务服务交互及发布加固。

要求：
1. 先确认 V07 多方交互业务已可演示。
2. AI MCP 工具封装 WMS、MES、task、sys 查询能力。
3. ChatBI 使用只读账号和白名单查询业务数据。
4. 多 Agent 可分析库存风险、登录风控和任务失败。
5. ai-web 展示业务问答、ChatBI 结果、Agent 分析和 MCP 调用记录。
6. Jenkins 流水线覆盖全链路构建、测试、镜像构建和测试环境发布。
7. 阿里弹性容器正式环境支持正式镜像、环境变量、密钥、健康检查、回滚说明。
8. 完善日志 traceId、serviceName、podName 或实例标识、bizId。
9. 更新本文件实现记录、study、handle 和 PROGRESS.md。
```

## 6. 自动测试提示词

```text
请验证 V08 AI 与业务服务交互及发布加固。

测试项：
1. AI 可以通过 MCP / REST 查询 WMS、MES、task、sys 数据。
2. ChatBI 只能执行只读 SELECT，并限制超时和返回行数。
3. Agent 可以生成库存风险、登录风控、任务失败分析。
4. ai-web 可以展示 AI 分析结果和调用记录。
5. Jenkins 全链路测试发布成功。
6. 阿里弹性容器正式环境部署检查、健康检查和回滚说明完整。
7. 日志和 traceId 可用于定位跨服务请求。
```

## 7. 验收标准

1. AI 能解释和分析真实业务数据。
2. ChatBI 安全限制有效。
3. 多 Agent 和 MCP 调用可追踪。
4. Jenkins 覆盖完整测试环境发布。
5. 阿里弹性容器正式环境可演示、可回滚、可观测。

## 8. 验收操作过程

```text
1. 执行完整业务流程：登录、工单、物料申请、库存分配、统计预警。
2. 在 ai-web 提问库存、工单、预警相关问题。
3. 执行 ChatBI 查询并查看 SQL 记录。
4. 触发 Agent 分析并查看 MCP 调用日志。
5. 执行 Jenkins 全链路流水线。
6. 检查阿里弹性容器正式环境部署、健康检查、日志和回滚说明。
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
