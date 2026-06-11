# Handle 目录

本目录用于记录每个版本的手搓实现步骤，便于开发者不依赖 vibe coding，也能按命令、关键代码和验证步骤手动还原项目。

## 1. 使用规则

1. 每个 milestone 对应一个 handle 文件。
2. 版本开发并验证完成后，必须更新对应 handle。
3. handle 应记录真实执行过的命令、关键代码位置、核心代码片段和验证命令。
4. handle 不替代源码，只帮助理解实现过程。
5. 如果版本后续做了改进，也要追加到对应 handle 的改进记录中。

## 2. 文件列表

| 版本 | 文件 |
|---|---|
| V01 | `V01-owner-component-library-handle.md` |
| V02 | `V02-owner-platform-base-cicd-handle.md` |
| V03 | `V03-wms-fullstack-basic-handle.md` |
| V04 | `V04-mes-fullstack-basic-handle.md` |
| V05 | `V05-ai-fullstack-basic-handle.md` |
| V06 | `V06-task-ops-fullstack-handle.md` |
| V07 | `V07-cross-vendor-mes-wms-task-handle.md` |
| V08 | `V08-ai-business-release-hardening-handle.md` |

## 3. 手搓记录模板

```text
版本：
完成日期：
环境准备：
命令步骤：
关键代码位置：
核心代码片段：
验证命令：
常见错误：
手动还原步骤：
改进记录：
```
