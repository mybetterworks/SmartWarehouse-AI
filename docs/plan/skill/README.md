# Skill 目录

本目录用于沉淀 SmartWarehouse-AI 开发过程中的复杂、通用、可复用问题。

## 1. 什么时候需要沉淀 skill

符合以下任意条件时，可以新增 skill：

1. 同类问题会在多个服务或多个版本中重复出现。
2. 操作步骤复杂，容易遗漏关键检查项。
3. 涉及跨技术栈协作，例如 Java + MQ + Redis + DB，或 Vue + 平台包 + 权限。
4. 涉及高风险能力，例如 K8s 多实例、数据库迁移、登录风控、库存并发、AI ChatBI 安全。
5. 开发完成后有明确复用价值，能够减少后续提示词长度。

## 2. 当前内置 skill

| 文件 | 场景 |
|---|---|
| `SKILL_TEMPLATE.md` | 新建 skill 的模板 |
| `java-spring-cloud-service-skill.md` | Java Spring Cloud 微服务开发 |
| `vue-element-plus-module-skill.md` | Vue + Element Plus 前端模块开发 |
| `python-langchain-ai-service-skill.md` | Python + LangChain AI 服务开发 |
| `k8s-deployment-check-skill.md` | K8s 部署与多实例检查 |
| `cicd-jenkins-eci-skill.md` | Jenkins 测试环境与阿里弹性容器正式环境发布检查 |
| `gitignore-secret-scan-skill.md` | `.gitignore` 自动维护与敏感信息检查 |

## 3. 使用方式

开发提示词中可以引用：

```text
请使用 docs/plan/skill/java-spring-cloud-service-skill.md 中的检查清单开发当前 Java 微服务。
```

## 4. 更新规则

1. skill 不是正式设计文档，而是开发经验和操作流程。
2. skill 发生重大变化时，建议同步记录到 `docs/plan/decisions`。
3. 每个版本复盘时，评估是否需要新增或更新 skill。
4. 使用已有 skill 时，如果发现流程失效、步骤遗漏、命令不可用、检查清单不再符合当前项目规则，必须先解决当前问题，再自动更新对应 skill。
5. 如果本次问题解决改变了原 skill 的正确做法，必须把新的正确流程、触发场景、验证方式和常见坑同步写回 skill。
6. skill 更新完成后，应在当前 milestone、study 或 handle 的实现记录中说明“已更新 skill”。
