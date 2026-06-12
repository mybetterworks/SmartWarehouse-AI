# DictSelect

## 用途

统一字典下拉，用于物料类型、业务状态、入库类型等场景。

## 基础用法

```vue
<DictSelect v-model="form.materialType" dict-type="material_type" />
```

## Props

| 名称 | 类型 | 说明 |
|---|---|---|
| `modelValue` | `string | number` | 当前值。 |
| `dictType` | `string` | 字典类型编码。 |
| `placeholder` | `string` | 占位文本。 |
| `disabled` | `boolean` | 是否禁用。 |

## 注意事项

V01 通过 `platform-sdk` 提供 mock 字典；V02 起由 `sys-service` 字典接口提供真实数据。
