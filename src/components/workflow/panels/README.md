# 决策表参数编辑面板组件

## 组件说明

### DecisionTableParamEditPanel.vue
这是一个参数编辑面板组件，用于编辑决策表中的参数配置。

#### 功能特性
- 参数名编辑（支持字母、数字、下划线，必须以字母开头）
- 参数代码编辑
- 类型选择（字符串、数字、布尔值、table）
- 参数值编辑
- 搜索功能
- 表单验证

#### 界面布局
- 宽度：400px
- 高度：600px
- 位置：垂直居中，水平方向离右边400px
- 标题：左上角显示"参数列表"
- 搜索框：右上角，带放大镜按钮
- 中间容器：预留区域，后续可添加内容
- 参数配置表单：包含4个配置项
- 底部按钮：确定和取消按钮

#### 数据结构
```typescript
interface ParamData {
  paramName: string      // 参数名
  paramType: string      // 参数类型
  paramCode: string      // 参数代码
  isCustom: number       // 是否自定义
  paramValue: string     // 参数值
}
```

#### 使用方法
```vue
<template>
  <DecisionTableParamEditPanel
    :param-data="paramData"
    @close="handleClose"
    @confirm="handleConfirm"
  />
</template>

<script setup>
import DecisionTableParamEditPanel from './DecisionTableParamEditPanel.vue'

const paramData = {
  paramName: 'input',
  paramType: 'string',
  paramCode: 'input',
  isCustom: 1,
  paramValue: ''
}

const handleClose = () => {
  // 处理关闭事件
}

const handleConfirm = (data) => {
  // 处理确认事件，data为修改后的参数数据
  console.log('修改后的数据:', data)
}
</script>
```

### DecisionTableEditPanelNode.vue
这是决策表编辑面板的主组件，集成了参数编辑功能。

#### 新增功能
- 在 `handleFieldHeaderClick` 函数中添加了调用参数编辑面板的逻辑
- 点击字段头部时会打开参数编辑面板
- 支持参数数据的编辑和更新

#### 集成方式
当用户点击字段头部时，系统会：
1. 收集当前字段的参数数据
2. 打开参数编辑面板（目前使用确认对话框模拟）
3. 处理用户编辑后的数据
4. 更新相应的字段信息

## 后续开发计划

1. 完善参数编辑面板的显示逻辑
2. 添加参数列表的展示功能
3. 实现参数的批量编辑
4. 添加参数验证规则配置
5. 支持参数的导入导出功能

## 注意事项

- 参数名必须符合命名规范（字母开头，只能包含字母、数字、下划线）
- 类型选择会影响后续的参数处理逻辑
- 参数代码通常与参数名保持一致，但可以自定义
- 自定义参数（isCustom=1）和系统参数（isCustom=0）有不同的处理逻辑
