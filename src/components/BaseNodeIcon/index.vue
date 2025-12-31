<template>
  <svg :width="size" :height="size" viewBox="0 0 32 32">
    <rect x="6" y="6" width="20" height="20" rx="6" :fill="iconColor" />
    <text x="16" y="21" text-anchor="middle" font-size="14" fill="#fff">{{ iconText }}</text>
  </svg>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { useFunctionStore } from '@/store/modules/baseFunction'

interface Props {
  type?: string
  logicType?: string
  size?: number
}

const props = withDefaults(defineProps<Props>(), {
  size: 24
})

const iconColor = ref()
const iconText = ref()
watchEffect(() => {
  iconColor.value =
    useFunctionStore()
      .getFuncNode()
      .find(e => e.type === props.type)?.iconColor || '#faad14'
  iconText.value =
    useFunctionStore()
      .getFuncNode()
      .find(e => e.type === props.type)?.icon || 'Fn'
})
</script>

<style scoped>
svg {
  display: inline-block;
  vertical-align: middle;
}
</style>
