<template>
  <svg :width="size" :height="size" viewBox="0 0 32 32">
    <rect x="6" y="6" width="20" height="20" rx="6" :fill="iconColor" />
    <text x="16" y="21" text-anchor="middle" font-size="14" fill="#fff">{{ iconText }}</text>
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BaseFunctionNode from '@/constant/BaseFunctionNode'

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
  return BaseFunctionNode.find(e => e.type === props.type)?.iconColor || '#faad14'
  // BaseFunctionNode.find(e => e.type === props.type)?.iconColor || '#faad14'
})

const iconText = computed(() => {
  return BaseFunctionNode.find(e => e.type === props.type)?.icon || 'Fn'
})
</script>

<style scoped>
svg {
  display: inline-block;
  vertical-align: middle;
}
</style>
