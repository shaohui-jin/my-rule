<template>
  <svg :width="size" :height="size" viewBox="0 0 32 32">
    <rect x="6" y="6" width="20" height="20" rx="6" :fill="iconColor" />
    <text x="16" y="21" text-anchor="middle" font-size="14" fill="#fff">{{ iconText }}</text>
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { LogicType } from '@/type/workflow'

interface Props {
  type?: string
  logicType?: string
  size?: number
}

const props = withDefaults(defineProps<Props>(), {
  size: 24
})

// 根据类型和逻辑类型计算图标颜色和文本
const iconColor = computed(() => {
  if (props.type === 'logic') {
    switch (props.logicType) {
      case LogicType.IFELSE:
        return '#1890ff'
      case LogicType.AGGREGATE:
        return '#52c41a'
      case LogicType.GLOBAL_PARAM:
        return '#722ed1'
      case LogicType.SUB_PROPERTY_EXTRACTOR:
        return '#13c2c2'
      case LogicType.GLOBAL_VARIABLE:
        return '#eb2f96'
      case LogicType.TYPE_CONVERTER:
        return '#f5222d'
      case LogicType.DIMENSION_CONVERTER:
        return '#2f54eb'
      case LogicType.EXTERNAL_DATA_TABLE:
        return '#fa8c16'
      default:
        return '#faad14'
    }
  }

  // 根据type字段判断
  switch (props.type) {
    case 'condition':
      return '#1890ff'
    case 'aggregate':
      return '#52c41a'
    case 'global_param':
      return '#722ed1'
    case 'sub_property_extractor':
      return '#13c2c2'
    case 'global_variable':
      return '#eb2f96'
    case 'type_converter':
      return '#f5222d'
    case 'dimension_converter':
      return '#2f54eb'
    case 'external_data_table':
      return '#fa8c16'
    case 'custom_function':
      return '#fa8c16'
    default:
      return '#faad14'
  }
})

const iconText = computed(() => {
  if (props.type === 'logic') {
    switch (props.logicType) {
      case LogicType.IFELSE:
        return 'if'
      case LogicType.AGGREGATE:
        return 'Σ'
      case LogicType.GLOBAL_PARAM:
        return 'G'
      case LogicType.SUB_PROPERTY_EXTRACTOR:
        return 'P'
      case LogicType.GLOBAL_VARIABLE:
        return 'V'
      case LogicType.TYPE_CONVERTER:
        return 'T'
      case LogicType.DIMENSION_CONVERTER:
        return 'D'
      case LogicType.EXTERNAL_DATA_TABLE:
        return 'E'
      default:
        return 'Fn'
    }
  }
  
  // 根据type字段判断
  switch (props.type) {
    case 'condition':
      return 'if'
    case 'aggregate':
      return 'Σ'
    case 'global_param':
      return 'G'
    case 'sub_property_extractor':
      return 'P'
    case 'global_variable':
      return 'V'
    case 'type_converter':
      return 'T'
    case 'dimension_converter':
      return 'D'
    case 'external_data_table':
      return 'E'
    case 'custom_function':
      return 'DIY'
    default:
      return 'Fn'
  }
})
</script>

<style scoped>
svg {
  display: inline-block;
  vertical-align: middle;
}
</style> 