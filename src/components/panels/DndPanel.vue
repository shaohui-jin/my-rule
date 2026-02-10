<template>
  <div class="base-dnd-panel" ref="panelRef">
    <div
      v-for="item in baseFunctionNode"
      :key="item.funcId"
      class="dnd-panel-item"
      @mousedown="e => onNodeMouseDown(item, e)"
      @mouseenter="onNodeMouseEnter(item.funcId)"
      @mouseleave="onNodeMouseLeave(item.funcId)"
    >
      <div class="dnd-panel-item-icon logic">
        <BaseNodeIcon :type="item.type" :size="32" />
      </div>
      <div class="dnd-panel-item-title">{{ item.title }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseNodeIcon from '@/components/base/BaseNodeIcon.vue'
import { BaseFunctionNodeType, useFunctionStore } from '@/store/modules/baseFunction'

const functionStore = useFunctionStore()
const baseFunctionNode = useFunctionStore().getFuncNode()

const emit = defineEmits(['node-mouse-down'])

function onNodeMouseDown(item: BaseFunctionNodeType, e: MouseEvent) {
  emit('node-mouse-down', e, item)
}
let showTipTimer = null
function onNodeMouseEnter(funcId: string) {
  showTipTimer = window.setTimeout(() => {
    functionStore.serBaseFuncNodeShow(funcId, true)
  }, 500)
}
function onNodeMouseLeave(funcId: string) {
  window.clearTimeout(showTipTimer)
  functionStore.serBaseFuncNodeShow(funcId, false)
}
</script>

<style scoped lang="scss">
.base-dnd-panel {
  position: absolute;
  top: 10px;
  left: 10px;
  height: calc(100% - 50px);
  width: 100px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 0;
  padding-right: 10px;
  z-index: 2000;
  .dnd-panel-item {
    width: 80px;
    height: 80px;
    background: #f7f9fa;
    border: 1.5px solid var(--el-color-primary-light-7, #e0e0e0);
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: grab;
    transition: box-shadow 0.2s, border 0.2s;
    user-select: none;
    pointer-events: auto;
    position: relative;
    .dnd-info {
      position: absolute;
      right: 10px;
      top: 10px;
      z-index: 101;
      cursor: pointer !important;
    }
    &:hover {
      border: 1.5px solid var(--el-color-primary, #1890ff);
      background: #f0f7ff;
    }

    .dnd-panel-item-icon {
      margin-bottom: 6px;
    }
    .dnd-panel-item-title {
      font-size: 12px;
      color: #333;
      font-weight: 500;
      text-align: center;
    }
  }
}
</style>
