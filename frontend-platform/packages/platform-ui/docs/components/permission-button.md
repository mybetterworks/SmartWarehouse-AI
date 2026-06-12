# PermissionButton

## 用途

根据权限码控制按钮显示或禁用，用于菜单按钮权限、数据操作权限和乙方模块页面操作入口。

## 基础用法

```vue
<PermissionButton permission="sys:user:create">新建用户</PermissionButton>
<PermissionButton permission="wms:material:add" mode="disable">新增物料</PermissionButton>
```

## Props

| 名称 | 类型 | 说明 |
|---|---|---|
| `permission` | `string | string[]` | 权限编码。 |
| `mode` | `hide | disable` | 无权限时隐藏或禁用。 |
| `type` | `primary | success | warning | danger | info | default` | Element Plus 按钮类型。 |
| `disabled` | `boolean` | 业务禁用状态。 |

## 注意事项

权限来源由 `platform-sdk` 管理，V01 使用本地权限集合，V02 起接入登录用户权限。
