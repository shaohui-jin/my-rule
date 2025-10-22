<template>
  <div class="dnd-panel-outer" ref="panelRef">
    <!-- 搜索栏 -->
    <div v-if="showSearch" class="dnd-search-container">
      <el-input
        v-model="searchKeyword"
        placeholder="按编码/名称搜索"
        class="dnd-search-input"
        clearable
        @input="handleSearchInput"
        @clear="handleSearchClear"
      >
        <template #suffix>
          <el-icon class="search-icon">
            <Search />
          </el-icon>
        </template>
      </el-input>
    </div>

    <div class="dnd-list" ref="listRef">
      <!-- 当有搜索关键词但没有数据时显示提示 -->
      <div v-if="searchKeyword && nodeTypes.length === 0" class="dnd-empty-state">
        <div class="empty-text">暂无数据</div>
      </div>
      <!-- 业务节点 -->
      <div v-if="showSearch" class="dnd-canvas">
        <!-- <ul>
          <li v-for="(item, index) in nodeTypes" :key="item.funcId" @mousedown="e => onNodeMouseDown(item, e)">
            <p>{{ item.title }}</p>
            <i @mouseenter="showWorkFlowInfo(item, index)">
               <el-tooltip placement="right" :show-after="500">
                <template #content>
                  <ul class="tooltipul">
                    <li v-for="content in contentTip">
                      <span>{{ content.label }}：</span>
                      <span>{{ content.desc }}</span>
                    </li>
                  </ul>
                </template>
                <InfoCircleOutlined />
              </el-tooltip>

            </i>
          </li>
          </ul> -->
           <!-- <el-collapse v-model="activeNames" @change="handleChange">
              <el-collapse-item v-for="itemlist in nodeTypes" :title="itemlist.id" :name="itemlist.id">
                <template #title>
                  <i :class="{active: activeNames.includes(itemlist.id)}"><caretRight></caretRight></i>
               {{  itemlist.name }}
              </template>
                <ul>
                  <li v-for="(item, index) in itemlist.children" :key="item.id" @mousedown="e => onNodeMouseDown(item, e)">
                    <p>{{ item.name }}</p>
                    <i @mouseenter="showWorkFlowInfo(item, index)">
                      <el-tooltip placement="right" :show-after="500">
                        <template #content>
                          <ul class="tooltipul">
                            <li v-for="content in contentTip">
                              <span>{{ content.label }}：</span>
                              <span>{{ content.desc }}</span>
                            </li>
                          </ul>
                        </template>
                        <InfoCircleOutlined />
                      </el-tooltip>
                    </i>
                  </li>
                </ul>
              </el-collapse-item>
            </el-collapse> -->
            <el-tree
              :data="nodeTypes"
              node-key="id"
              ref="treeRef"
              :default-expand-all="true"
            >
              <template #default="{ node, data }">
                <div class="custom-tree-node" v-if="data.name">
                  <p>{{ data.name }}</p>
                </div>
                <div class="custom-tree-node" v-if="data.title" @mousedown="e => onNodeMouseDown(data, e)">
                  <el-tooltip
                    :content="data.title"
                    :visible ="data.isShowTooltip"
                    effect="dark"
                    placement="top"
                  >
                    <div
                      @mouseenter="onMouseOver(data.title,data)"
                      @mouseleave="onMouseLeave(data.title,data)"
                      style="overflow: hidden;  text-overflow: ellipsis; white-space: nowrap;"
                    >
                    <!-- <span :ref="str">{{`${str}`}}</span> -->
                     <p style="cursor:move">{{ data.title }}</p>
                  </div>
                </el-tooltip>
                  <i @mouseenter="showWorkFlowInfo(data)">
                    <el-tooltip placement="right" :show-after="500">
                      <template #content>
                        <ul class="tooltipul">
                          <li v-for="content in contentTip">
                            <span>{{ content.label }}：</span>
                            <span>{{ content.desc }}</span>
                          </li>
                        </ul>
                      </template>
                      <InfoCircleOutlined />
                    </el-tooltip>
                </i>
                </div>
              </template>
            </el-tree>

      </div>
      <!-- 正常显示节点列表 -->
      <div
        v-else
        v-for="(item,index) in nodeTypes"
        :key="item.funcId"
        class="dnd-item"
        @mousedown="e => onNodeMouseDown(item, e)"
        @mouseenter="e => onNodeMouseEnter(index, e)"
        @mouseleave="e => onNodeMouseLeave(index, e)"
      >
        <slot :item="item">
          <div class="dnd-icon">
            <i :class="item.icon" />
          </div>
        </slot>
        <div class="dnd-title">
          {{ item.title }}
        </div>
        <template v-if="!showSearch">
          <div v-show="item.show" class="dnd-info"
          @mouseenter="e => onTipMouseEnter(index, e)"
          @mouseleave="e => onTipMouseLeave(index, e)">
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
        </template>
      </div>
    </div>
    <!-- <el-pagination
      v-if="total > pageSize"
      class="dnd-pagination"
      background
      layout="prev, pager, next"
      :page-size="pageSize"
      :total="total"
      :current-page="pageNo"
      @update:current-page="onPageChange"
      ref="paginationRef"
      :small="true"
      :pager-count="5"
    /> -->
  </div>
</template>

<script setup lang="ts">
import type { NodeType } from '@/type/workflow'
import { ElPagination, ElInput, ElIcon } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { ref, watch, defineExpose } from 'vue'
import InfoCircleOutlined from "@/assets/rsvg/InfoCircleOutlined.svg";

const props = defineProps<{
  nodeTypes: NodeType[]
  tabName: string
  pageNo: number
  pageSize: number
  total: number
  // onPageChange: (page: number) => void
  searchKeyword?: string
  onSearch?: (keyword: string) => void
  showSearch?: boolean,
}>()
const emit = defineEmits(['node-mouse-down', 'node-mouse-enter', 'node-mouse-leave', 'search'])

// 搜索相关状态
const searchKeyword = ref(props.searchKeyword || '')
let searchTimer: NodeJS.Timeout | null = null

// 防抖处理搜索输入
function handleSearchInput() {
  if (searchTimer) {
    clearTimeout(searchTimer)
  }

  searchTimer = setTimeout(() => {
    emit('search', convertToLowercase(searchKeyword.value))
  }, 300)
}
function convertToLowercase(str) {
  return str.toUpperCase().toLowerCase();
}
// 处理搜索清空
function handleSearchClear() {
  searchKeyword.value = ''
  emit('search', '')
}

// 监听外部searchKeyword变化
watch(
  () => props.searchKeyword,
  newVal => {
    if (newVal !== undefined) {
      searchKeyword.value = newVal
    }
  }
)

function onNodeMouseDown(item: NodeType, e: MouseEvent) {
  // console.log("item====", item)
  emit('node-mouse-down', e, item)
}
let showTipTimer = null
function onNodeMouseEnter(index: number, e: MouseEvent) {
  // console.log('111====index===', e)
  showTipTimer = window.setTimeout(()=>{
    emit('node-mouse-enter', e, index)
  }, 500)
}
function onNodeMouseLeave(index: number, e: MouseEvent) {
  window.clearTimeout(showTipTimer)
  emit('node-mouse-leave', e, index)
}
// function onPageChange(val: number) {
//   props.onPageChange(val)
// }
let tipTimer = null
function onTipMouseEnter(index: number, e: MouseEvent) {
  tipTimer = window.setTimeout(()=>{

  }, 500)
}
function onTipMouseLeave(index: number, e: MouseEvent) {
  window.clearTimeout(tipTimer)
}
let contentTip = ref([])
function showWorkFlowInfo(item: any) {
  contentTip.value = []
  // console.log('item===', item)
  item.inputData?.widgetList?.forEach(p=>{
    // contentTip+=p.
    if(['table', 'any'].includes(p.attributes.paramType) && !p.attributes.multiple) {
      p.attributes.desc && contentTip.value.push({
        label: p.attributes.label,
        desc: p.attributes.desc
      })
    }
  })
  item.outputData?.widgetList?.forEach(p=>{
    // contentTip+=p.
    if(['table', 'any'].includes(p.attributes.paramType) && !p.attributes.multiple) {
      p.attributes.desc && contentTip.value.push({
        label: p.attributes.label,
        desc: p.attributes.desc
      })
    }
  })
  item.remark && contentTip.value.push({
    label: '备注',
    desc: item.remark
  })

}
// const activeNames = ref(['1'])
// const handleChange = (val: string[]) => {
//   console.log(val)
// }
const treeRef = ref()
const setFold = (newVal) =>{
  if(newVal) {
     Object.values(treeRef.value.store.nodesMap).forEach((v:any) => v.expand())
    } else {
      Object.values(treeRef.value.store.nodesMap).forEach((v:any) => v.collapse())
    }
}
defineExpose({
  setFold
})
// const strRef = ref(null)
const onMouseOver = (str,data) => { // 内容超出，显示文字提示内容
  // console.log('str',str, str.length)
  if(str.length > 15) {
    data.isShowTooltip = true
  } else {
    data.isShowTooltip = false
  }
}
const onMouseLeave = (str,data) =>{
  data.isShowTooltip = false
}
</script>

<style scoped lang="scss">
.dnd-panel-outer {
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
  padding-right: 10px;
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
  position:relative;
}

/* .dnd-item * {
  pointer-events: none;
  user-select: none;
} */
.dnd-item .dnd-info {
  position:absolute;
  right:10px;
  top:10px;
  z-index:101;
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
    width:260px;
    overflow: hidden;
    padding-top:10px;
    border-top: 1px solid rgba(0,0,0,0.08);
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
  color: #1C1A27;
  line-height: 24px;
  text-align: left;
  font-style: normal;
  text-transform: none;
  cursor: pointer;
  padding:0 20px 0 10px;
  position: relative;
}
.dnd-canvas li.active{
  color:#0055FF;
}
.dnd-canvas li.active:hover{
  color:#1C1A27
}
.dnd-canvas li:hover {
  background: #F4F5F9;
  border-radius: 9px 9px 9px 9px;
}
.dnd-canvas li p{
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  /* width:200px; */
  position:relative;
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
  position:absolute;
  right:10px;
  display: none;
}
.dnd-canvas li:hover i {
  display: block;
}

.tooltipul li {
  display:grid;
  grid-template-columns: auto 200px;
  margin:5px 0;
}
// :deep(.logictooltip) {width:200px;}
.logictooltip {max-width:300px;}
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
  position:relative;
  width:80%;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  i {
    display:none;
    position:absolute;
    right:0;
  }
  p {
    width:190px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;

  }
}
:deep(.el-tree-node__children) {
  .el-tree-node__content {
    padding-left:10px !important;
  }
}
:deep(.el-tree-node__children) {
  .el-tree-node__children{
    p {
      cursor:move;
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
