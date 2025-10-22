# NodeTypeIcon 组件

一个用于显示节点类型图标的可复用组件。

## 功能特性

- 支持多种节点类型图标显示
- 可自定义图标大小
- 支持逻辑函数类型和基础函数类型
- 统一的视觉风格

## 支持的节点类型

### 逻辑函数类型 (logicType)
- `IFELSE` - 条件判断 (蓝色, "if")
- `AGGREGATE` - 聚合函数 (绿色, "Σ")
- `GLOBAL_PARAM` - 全局参数 (紫色, "G")
- `SUB_PROPERTY_EXTRACTOR` - 子属性提取器 (青色, "P")
- `GLOBAL_VARIABLE` - 全局变量 (粉色, "V")
- `TYPE_CONVERTER` - 类型转换器 (红色, "T")

### 基础函数类型 (type)
- `condition` - 条件判断 (蓝色, "if")
- `aggregate` - 聚合函数 (绿色, "Σ")
- `global_param` - 全局参数 (紫色, "G")
- `sub_property_extractor` - 子属性提取器 (青色, "P")
- `global_variable` - 全局变量 (粉色, "V")
- `type_converter` - 类型转换器 (红色, "T")
- `func` - 抽象函数 (橙色, "Fn")

## 使用方法

### 基础用法

```vue
<template>
  <!-- 显示逻辑函数类型图标 -->
  <NodeTypeIcon 
    type="logic" 
    :logic-type="LogicType.IFELSE"
    :size="24"
  />
  
  <!-- 显示基础函数类型图标 -->
  <NodeTypeIcon 
    type="condition"
    :size="32"
  />
  
  <!-- 显示抽象函数图标 -->
  <NodeTypeIcon 
    type="func"
    :size="24"
  />
</template>

<script setup>
import NodeTypeIcon from '@/components/NodeTypeIcon/index.vue'
import { LogicType } from '@/type/workflow'
</script>
```

### 在节点数据中使用

```vue
<template>
  <NodeTypeIcon 
    :type="node.funcType" 
    :logic-type="node.logicData?.logicType"
    :size="24"
  />
</template>
```

## Props

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| type | string | - | 节点类型 |
| logicType | string | - | 逻辑函数类型 |
| size | number | 24 | 图标大小 |

## 注意事项

1. 当 `type` 为 `'logic'` 时，会优先使用 `logicType` 来确定图标样式
2. 当 `type` 为其他值时，直接根据 `type` 显示对应图标
3. 如果都不匹配，会显示默认的抽象函数图标 (橙色, "Fn") 