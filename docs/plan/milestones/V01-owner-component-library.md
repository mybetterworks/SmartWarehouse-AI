# V01 甲方组件库二次开发与最小项目骨架

## 1. 版本状态

```text
状态：TODO
负责人：甲方前端团队
前置版本：无
输出结果：可复用的甲方前端组件库、SDK、主题、类型包和最小项目骨架
```

## 2. 版本目标

1. 初始化 SmartWarehouse-AI 最小根目录骨架。
2. 初始化 `frontend-platform`，重点开发甲方平台组件库二次封装。
3. 创建 `platform-ui`、`platform-sdk`、`platform-theme`、`platform-types`。
4. 封装权限按钮、字典下拉、标准表格、统一请求、Token 工具、主题变量。
5. 建立组件演示和文档站点。
6. 准备 npm snapshot 发布脚本，为乙方前端接入做准备。

## 3. 版本实现的技术栈

| 类型 | 技术 |
|---|---|
| 前端 | Vue、Vite、TypeScript、Element Plus、Pinia |
| 组件库 | `@smartwarehouse/platform-ui` |
| SDK | `@smartwarehouse/platform-sdk` |
| 主题 | `@smartwarehouse/platform-theme` |
| 类型 | `@smartwarehouse/platform-types` |
| 制品 | 阿里云效 npm snapshot |

## 4. 相关表结构

本版本不实现业务表。组件演示可使用 mock 数据。

后续会对接：

```text
sys_dict_type
sys_dict_item
sys_menu
sys_frontend_module
```

## 5. 开发步骤提示词

```text
请开发 V01 甲方组件库二次开发与最小项目骨架版本。

要求：
1. 先阅读 docs/design/element-plus-wrapper-guide.md、ROADMAP.md、DEVELOPMENT_RULE.md、PROGRESS.md。
2. 创建最小项目骨架，但不要开始业务服务开发。
3. 初始化 frontend-platform workspace。
4. 开发 platform-ui、platform-sdk、platform-theme、platform-types。
5. 封装权限按钮、字典下拉、标准表格和统一安装入口。
6. 组件演示项目必须能展示组件效果。
7. 准备阿里云效 npm snapshot 发布配置，不把 token 写入仓库。
8. 更新本文件实现记录、study、handle 和 PROGRESS.md。
```

## 6. 自动测试提示词

```text
请验证 V01 甲方组件库二次开发。

检查项：
1. frontend-platform 可以独立安装依赖和构建。
2. platform-ui 可以打包。
3. platform-sdk、platform-theme、platform-types 可以被演示项目引用。
4. 权限按钮、字典下拉、标准表格有演示页面。
5. 构建产物不包含 .npmrc 和 npm token。
6. npm snapshot 发布配置可 dry-run。
```

## 7. 验收标准

1. 甲方组件库可构建。
2. 组件演示页面可运行。
3. 平台 SDK 提供统一请求和 Token 工具。
4. 主题和类型包可被业务前端引用。
5. 阿里云效 npm snapshot 发布准备完成。

## 8. 验收操作过程

```powershell
cd frontend-platform
pnpm install
pnpm build
pnpm --filter @smartwarehouse/platform-ui build
pnpm --filter @smartwarehouse/platform-sdk build
pnpm --filter @smartwarehouse/platform-theme build
pnpm --filter @smartwarehouse/platform-types build
```

## 9. 实现记录

```text
日期：
实现内容：
前端完成内容：
后端完成内容：无
Jenkins 测试发布结果：V01 仅准备组件构建，Jenkins 从 V02 接入
阿里弹性容器正式发布检查：V01 仅准备组件制品，不部署正式服务
验证命令：
验证结果：
问题记录：
改进记录：
```
