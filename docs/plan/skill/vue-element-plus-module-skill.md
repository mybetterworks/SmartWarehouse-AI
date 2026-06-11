# Vue Element Plus 前端模块开发 Skill

## 1. 适用场景

用于开发 `frontend-platform`、`wms-web`、`mes-web`、`ai-web` 中的 Vue + Element Plus 页面、平台组件、SDK、主题和类型定义。

## 2. 输入

- 当前 milestone 文件。
- `docs/design/element-plus-wrapper-guide.md`
- `docs/design/detailed-design.md` 前端章节。
- 目标前端项目目录。
- 后端接口前缀和权限编码。

## 3. 执行步骤

1. 确认当前项目是甲方 `frontend-platform` 还是乙方业务前端。
2. 确认路由前缀：`/sys`、`/wms`、`/mes`、`/ai`。
3. 确认静态资源入口：`/apps/sys/`、`/apps/wms/`、`/apps/mes/`、`/apps/ai/`。
4. 所有请求通过 `platform-sdk` 访问 `/api/**`。
5. 不写死后端 IP、端口或完整域名。
6. 不跨项目相对路径引用源码。
7. 通用组件优先沉淀到 `platform-ui`。
8. 通用类型优先沉淀到 `platform-types`。
9. 页面使用菜单权限和按钮权限控制。
10. 完成构建、路由刷新、权限和接口联调验证。

## 4. 检查清单

- [ ] 项目可以独立安装依赖。
- [ ] 项目可以独立构建。
- [ ] Vite base 与 entry_url 一致。
- [ ] 请求统一走 `/api/**`。
- [ ] 不包含 `.npmrc` 和 npm token 到最终镜像。
- [ ] 页面刷新不 404。
- [ ] 菜单和按钮权限生效。
- [ ] 文本、表格、按钮在移动和桌面尺寸下不明显溢出。

## 5. 推荐提示词

```text
请使用 docs/plan/skill/vue-element-plus-module-skill.md，开发当前 milestone 中的前端模块。优先复用 @smartwarehouse/platform-ui 和 platform-sdk，保持甲方平台和乙方业务前端边界清晰。
```

## 6. 常见坑

1. 业务前端直接引用 `frontend-platform` 源码。
2. Vite base 仍为 `/`，部署到 `/apps/wms/` 后资源 404。
3. 路由刷新没有 Nginx history fallback。
4. 业务页面写死后端地址，部署后跨环境失败。
5. 把 npm token 打进最终镜像。
