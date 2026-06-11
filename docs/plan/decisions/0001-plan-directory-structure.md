# 0001 docs 目录结构与提示词系统存放方式

## 状态

ACCEPTED

## 背景

项目设计文档已经从多个子目录调整为 `docs/design` 扁平存储，便于阅读和查找。后续开发需要一套独立的提示词系统，用于记录总目标、开发规则、进度、版本计划、复盘、手搓步骤和可复用技能。

## 决策

1. `docs/design` 作为正式设计文档目录。
2. `docs/design` 下统一扁平存放以下文件：
   - `software-requirements-specification.md`
   - `high-level-design.md`
   - `detailed-design.md`
   - `database-design.md`
   - `element-plus-wrapper-guide.md`
3. `docs/plan` 作为提示词开发系统目录。
4. `docs/plan` 下包含：
   - `ROADMAP.md`
   - `DEVELOPMENT_RULE.md`
   - `PROGRESS.md`
   - `milestones`
   - `decisions`
   - `skill`
   - `study`
   - `handle`

## 影响

1. 后续开发先读 `docs/plan`，正式设计查 `docs/design`。
2. 不再引用调整前的设计文档旧目录。
3. 所有提示词、复盘、手搓步骤和 skill 都放在 `docs/plan`。

## 后续动作

1. 初始化 `docs/plan` 文件体系。
2. 每完成一个版本，同步更新 `PROGRESS.md`、对应 milestone、study 和 handle。
3. 发生设计变化时，先记录 decision，再同步正式设计文档。
