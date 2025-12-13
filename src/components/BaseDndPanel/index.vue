<template>
  <div class="dnd-panel-outer" ref="panelRef">
    <div class="dnd-list" ref="listRef">
      <div
        v-for="(item, index) in BaseFunctionNode"
        :key="item.funcId"
        class="dnd-item"
        @mousedown="e => onNodeMouseDown(item, e)"
        @mouseenter="e => onNodeMouseEnter(index, e)"
        @mouseleave="e => onNodeMouseLeave(index, e)"
      >
        <div class="dnd-icon logic">
          <NodeTypeIcon :type="item.type" :size="32" />
        </div>
        <!--        <slot :item="item">-->
        <!--          <div class="dnd-icon">-->
        <!--            <i :class="item.icon" />-->
        <!--          </div>-->
        <!--        </slot>-->
        <div class="dnd-title">
          {{ item.title }}
        </div>
        <div
          v-show="item.show"
          class="dnd-info"
          @mouseenter="e => onTipMouseEnter(index, e)"
          @mouseleave="e => onTipMouseLeave(index, e)"
        >
          <el-tooltip
            class="box-item"
            effect="dark"
            :placement="index === 0 ? 'bottom' : 'right'"
            :show-after="500"
          >
            <template #content>
              <p class="logictooltip" v-html="item.text.replaceAll('\n', '<br/>')"></p>
            </template>
            <InfoCircleOutlined />
          </el-tooltip>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NodeType } from '@/type/workflow'
import { ref, watch, defineExpose } from 'vue'
import InfoCircleOutlined from '@/assets/rsvg/InfoCircleOutlined.svg'
import BaseFunctionNode from '@/constant/BaseFunctionNode'
import NodeTypeIcon from '@/components/BaseNodeIcon/index.vue'

const emit = defineEmits(['node-mouse-down', 'node-mouse-enter', 'node-mouse-leave', 'search'])

function onNodeMouseDown(item: NodeType, e: MouseEvent) {
  emit('node-mouse-down', e, item)
}
let showTipTimer = null
function onNodeMouseEnter(index: number, e: MouseEvent) {
  // console.log('111====index===', e)
  showTipTimer = window.setTimeout(() => {
    emit('node-mouse-enter', e, index)
  }, 500)
}
function onNodeMouseLeave(index: number, e: MouseEvent) {
  window.clearTimeout(showTipTimer)
  emit('node-mouse-leave', e, index)
}

let tipTimer = null
function onTipMouseEnter(index: number, e: MouseEvent) {
  tipTimer = window.setTimeout(() => {}, 500)
}
function onTipMouseLeave(index: number, e: MouseEvent) {
  window.clearTimeout(tipTimer)
}
let contentTip = ref([])

function showWorkFlowInfo(item: any) {
  contentTip.value = []
  // console.log('item===', item)
  item.inputData?.widgetList?.forEach(p => {
    // contentTip+=p.
    if (['table', 'any'].includes(p.attributes.paramType) && !p.attributes.multiple) {
      p.attributes.desc &&
        contentTip.value.push({
          label: p.attributes.label,
          desc: p.attributes.desc
        })
    }
  })
  item.outputData?.widgetList?.forEach(p => {
    // contentTip+=p.
    if (['table', 'any'].includes(p.attributes.paramType) && !p.attributes.multiple) {
      p.attributes.desc &&
        contentTip.value.push({
          label: p.attributes.label,
          desc: p.attributes.desc
        })
    }
  })
  item.remark &&
    contentTip.value.push({
      label: '备注',
      desc: item.remark
    })
}

const treeRef = ref()
const setFold = newVal => {
  if (newVal) {
    Object.values(treeRef.value.store.nodesMap).forEach((v: any) => v.expand())
  } else {
    Object.values(treeRef.value.store.nodesMap).forEach((v: any) => v.collapse())
  }
}
defineExpose({
  setFold
})
</script>

<style scoped lang="scss">
.dnd-panel-outer {
  position: absolute;
  top: 10px;
  left: 10px;
  height: calc(100% - 20px);
  width: 100px;
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding-right: 10px;
  z-index: 9999;
}

.dnd-search-container {
  padding: 12px 0 8px;
  flex-shrink: 0;
}

.dnd-search-input {
  width: 100%;
}

.dnd-search-input :deep(.el-input__wrapper) {
  border-radius: 8px;
  border: 1px solid #dcdfe6;
}

.dnd-search-input :deep(.el-input__wrapper:hover) {
  border-color: var(--workflow-primary, #1890ff);
}

.search-icon {
  color: #909399;
  font-size: 16px;
}

.dnd-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 8px 2px 0 2px;
  // height: calc(100vh - 320px); /* 调整高度以适应搜索栏 */
  height: calc(100vh - 250px); /* 调整高度以适应搜索栏 */
  overflow-y: auto;
  min-height: 0;
  justify-content: center;
  align-content: flex-start;
}

.dnd-item {
  width: 116px;
  height: 80px;
  background: #f7f9fa;
  border: 1.5px solid var(--workflow-border, #e0e0e0);
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
}

/* .dnd-item * {
  pointer-events: none;
  user-select: none;
} */
.dnd-item .dnd-info {
  position: absolute;
  right: 10px;
  top: 10px;
  z-index: 101;
  cursor: pointer !important;
}
/* .dnd-item .dnd-info:hover {
  background:#000;
} */
.dnd-item:hover {
  border: 1.5px solid var(--workflow-primary, #1890ff);
  background: #f0f7ff;
}

.dnd-icon {
  margin-bottom: 6px;
}

.dnd-title {
  font-size: 12px;
  color: #333;
  font-weight: 500;
  text-align: center;
}

.dnd-pagination {
  align-self: center;
  flex-shrink: 0;
  margin-top: 12px;
  max-width: 270px;
  display: flex;
  justify-content: center;
  overflow: hidden;
}

/* 空状态提示样式 */
.dnd-empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 320px;
  color: #909399;
}

.empty-text {
  font-size: 14px;
  color: #909399;
  text-align: center;
}
/* 画布管理
 */
.dnd-canvas {
  width: 260px;
  overflow: hidden;
  padding-top: 10px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}
.dnd-canvas li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 30px;
  line-height: 30px;
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 12px;
  color: #1c1a27;
  line-height: 24px;
  text-align: left;
  font-style: normal;
  text-transform: none;
  cursor: pointer;
  padding: 0 20px 0 10px;
  position: relative;
}
.dnd-canvas li.active {
  color: #0055ff;
}
.dnd-canvas li.active:hover {
  color: #1c1a27;
}
.dnd-canvas li:hover {
  background: #f4f5f9;
  border-radius: 9px 9px 9px 9px;
}
.dnd-canvas li p {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  /* width:200px; */
  position: relative;
}
/* .dnd-canvas li:hover p:before {
  content:"";
  width: 0;
  height: 0;
  border-width: 4px;
  border-color: transparent  transparent  transparent #9D9DA0;
  border-style: solid;
  position:absolute;
  z-index:10;
  left:10px;
  top: 10px
} */
.dnd-canvas li i {
  position: absolute;
  right: 10px;
  display: none;
}
.dnd-canvas li:hover i {
  display: block;
}

.tooltipul li {
  display: grid;
  grid-template-columns: auto 200px;
  margin: 5px 0;
}
// :deep(.logictooltip) {width:200px;}
.logictooltip {
  max-width: 300px;
}
// :deep .logictooltip {width:200px;}
:deep(.el-collapse-item__arrow) {
  display: none;
}
:deep(.el-collapse-item__header) {
  .active {
    transform: rotate(90deg);
    transition: transform var(--el-transition-duration);
  }
}
// tree自定义内容样式
.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
  position: relative;
  width: 80%;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  i {
    display: none;
    position: absolute;
    right: 0;
  }
  p {
    width: 190px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
}
:deep(.el-tree-node__children) {
  .el-tree-node__content {
    padding-left: 10px !important;
  }
}
:deep(.el-tree-node__children) {
  .el-tree-node__children {
    p {
      cursor: move;
    }
  }
  .custom-tree-node {
    &:hover {
      i {
        display: block;
      }
    }
  }
}
</style>
