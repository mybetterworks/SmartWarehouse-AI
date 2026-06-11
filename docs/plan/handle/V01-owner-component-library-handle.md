# V01 手搓步骤：甲方组件库二次开发

## 1. 环境准备

```text
Windows 11
Node v22.22.3
pnpm
阿里云效 npm snapshot 仓库
```

## 2. 命令步骤

```powershell
node -v
pnpm -v
cd frontend-platform
pnpm install
pnpm build
pnpm --filter @smartwarehouse/platform-ui build
pnpm --filter @smartwarehouse/platform-sdk build
pnpm --filter @smartwarehouse/platform-theme build
pnpm --filter @smartwarehouse/platform-types build
```

## 3. 关键代码位置

```text
frontend-platform/packages/platform-ui
frontend-platform/packages/platform-sdk
frontend-platform/packages/platform-theme
frontend-platform/packages/platform-types
frontend-platform/apps/docs
```

## 4. 核心代码片段

版本完成后补充：

```ts
// 权限按钮组件
```

```ts
// 字典下拉组件
```

```ts
// platform-sdk request 封装
```

## 5. 验证命令

```powershell
pnpm build
rg -n "_authToken|npmrc" dist
```

## 6. 常见错误

1. 组件库混入业务逻辑。
2. 组件没有演示页面。
3. npm token 写入仓库或构建产物。

## 7. 手动还原步骤

1. 初始化 frontend-platform workspace。
2. 创建四个平台包。
3. 封装权限按钮、字典下拉、标准表格。
4. 编写组件演示页面。
5. 配置 npm snapshot 发布。

## 8. 改进记录

```text
日期：
改进内容：
原因：
验证结果：
```
