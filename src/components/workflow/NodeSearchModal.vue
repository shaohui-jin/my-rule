<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="visible"
        class="custom-modal-overlay"
        :class="{ 'custom-position': useCustomPosition }"
        :style="useCustomPosition ? modalStyle : {}"
        @click="handleOverlayClick"
      >
        <div class="custom-modal" @click.stop>
          <!-- 搜索栏 -->
          <div class="search-container">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索节点"
              clearable
              class="search-input"
              @clear="handleSearchClear"
              @keyup.enter="handleSearch"
            >
              <template #prefix>
                <el-icon class="search-icon">
                  <Search />
                </el-icon>
              </template>
            </el-input>

            <!-- 搜索结果下拉列表 -->
            <div v-if="searchResults.length > 0" class="search-results">
              <div
                v-for="item in searchResults"
                :key="item.funcId"
                class="search-result-item"
                @click="handleSelectNode(item)"
              >
                <div class="result-item-content">
                  <span class="result-name">{{ item.title }}</span>
                  <span class="result-type">{{ item.type === 'logic' ? '逻辑函数' : '抽象函数' }}</span>
                </div>
              </div>
            </div>

            <!-- 搜索结果为空提示 -->
            <div v-if="hasSearched && searchKeyword && searchResults.length === 0" class="no-results">
              未找到匹配的节点
            </div>
          </div>

          <!-- 历史搜索和推荐节点 -->
          <div class="content-section">
            <!-- 历史搜索 -->
            <div class="history-section">
              <div class="section-header">
                <span class="section-title">历史搜索</span>
                <el-icon class="clear-icon" @click="clearHistory">
                  <Delete />
                </el-icon>
              </div>
              <div class="history-list">
                <div
                  v-for="item in searchHistory"
                  :key="item.funcId"
                  class="history-item"
                  @click="handleSelectNode(item)"
                >
                  {{ item.title }}
                </div>
              </div>
            </div>

            <!-- 推荐节点 -->
            <div class="recommend-section">
              <div class="section-header">
                <span class="section-title">推荐节点</span>
              </div>
              <div class="recommend-list">
                <div
                  v-for="item in recommendNodes"
                  :key="item.funcId"
                  class="recommend-item"
                  @click="handleSelectNode(item)"
                >
                  {{ item.title }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { Search, Delete } from '@element-plus/icons-vue'
import { getSearchHistory, addSearchHistory, clearSearchHistory } from '@/utils/cookie'
import type { FunctionNode } from '@/api/workflow/WorkFlowApi'

interface Props {
  visible: boolean
  searchFunction: (keyword: string) => Promise<FunctionNode[]>
  data?: {
    x: number,
    y: number,
    nodeId: string,
    portId: string,
    fromEdgeAdd: boolean,
    fromBlankAdd: boolean,
    fromBlankX: number,
    fromBlankY: number
  }
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'select-node', node: any, data: any): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 响应式数据
const searchKeyword = ref('')
const searchResults = ref<FunctionNode[]>([])
const searchHistory = ref<any[]>([])
const recommendNodes = ref<any[]>([])
const hasSearched = ref(false) // 新增：标记是否已经执行过搜索
const modalPosition = ref({ x: 0, y: 0 }) // 新增：弹窗位置

// 计算属性
const useCustomPosition = computed(() => !!props.data) // 新增：是否使用自定义位置
const modalStyle = computed(() => { // 新增：弹窗样式
  if (!useCustomPosition.value) return {}
  return {
    left: `${modalPosition.value.x}px`,
    top: `${modalPosition.value.y}px`
  }
})

// 计算属性
const visible = computed({
  get: () => props.visible,
  set: (value: boolean) => emit('update:visible', value)
})

// 位置计算函数
function calculateModalPosition() {
  if (!props.data) return

  const modalWidth = 500 // 弹窗宽度
  const modalHeight = 400 // 预估弹窗高度
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight

  let x = props.data.x
  let y = props.data.y

  // 确保弹窗不超出右边界
  console.log('x:', x + modalWidth , viewportWidth)
  console.log('y:', y + modalHeight, viewportHeight)

  if (x + modalWidth > viewportWidth) {
    x = viewportWidth - modalWidth - 20
  }

  // 确保弹窗不超出下边界
  if (y + modalHeight > viewportHeight) {
    y = viewportHeight - modalHeight - 20
  }

  // 确保弹窗不超出左边界和上边界
  x = Math.max(20, x)
  y = Math.max(20, y)

  modalPosition.value = { x, y }
}

// 推荐节点配置（默认推荐logic类型的属性获取、类型转换、条件判断）
const defaultRecommendNodes = [
  { type: 'sub_property_extractor', title: '属性获取', funcId: '4',  funcType: 'logic'},
  // { type: 'type_converter', title: '类型转换', funcId: '6', funcType: 'logic'},
  { type: 'dimension_converter', title: '类型转换', funcId: '12', funcType: 'logic'},
  { type: 'condition', title: '条件函数', funcId: '9' ,  funcType: 'logic'},
  { type: 'aggregate', title: '聚合函数', funcId: '2' ,  funcType: 'logic'},
  { type: 'iterator', title: '迭代', funcId: '8' ,  funcType: 'logic'},
  { type: 'decision_tables_function', title: '决策表', funcId: '10' ,  funcType: 'logic'},
  { type: 'external_data_table', title: '外部数据表', funcId: '11' ,  funcType: 'logic'},
]

// 监听器
watch(() => props.visible, (newVal) => {
  if (newVal) {
    loadSearchHistory()
    loadRecommendNodes()
    calculateModalPosition() // 新增：计算弹窗位置
  }
})

// 监听位置变化
watch(() => props.data, () => {
  if (props.visible) {
    calculateModalPosition() // 新增：位置变化时重新计算
  }
})

// 方法
function handleSearchClear() {
  searchKeyword.value = ''
  hasSearched.value = false // 重置搜索状态
  searchResults.value = []  //下拉框隐藏
}

async function handleSearch() {
  if (searchKeyword.value.trim()) {
    await performSearch()
  }
}

async function performSearch() {
  try {
    const results = await props.searchFunction(searchKeyword.value)
    searchResults.value = results
    hasSearched.value = true // 标记已经执行过搜索
  } catch (error) {
    console.error('搜索失败:', error)
    searchResults.value = []
    hasSearched.value = true // 即使失败也标记为已搜索
  }
}

function handleSelectNode(node: any) {
  // 添加到搜索历史
  addSearchHistory({
    title: node.title,
    funcId: node.funcId,
    funcType: node.funcType || 'func',
    type: node.type || 'func'
  })
  // 触发选择事件
  emit('select-node', node, props.data)

  handleSearchClear()
  // 关闭弹窗
  visible.value = false
}

function loadSearchHistory() {
  searchHistory.value = getSearchHistory()
}

function loadRecommendNodes() {
  recommendNodes.value = defaultRecommendNodes
}

function clearHistory() {
  clearSearchHistory()
  searchHistory.value = []
}

function handleClose() {
  searchKeyword.value = ''
  searchResults.value = []
  hasSearched.value = false // 重置搜索状态
  emit('update:visible', false)
}

function handleOverlayClick() {
  handleClose()
}

// 生命周期
onMounted(() => {
  loadSearchHistory()
  loadRecommendNodes()
})
</script>

<style scoped>
.custom-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: transparent;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  padding-bottom: 40px;
  z-index: 2000;
}

.custom-modal-overlay.custom-position {
  display: block;
  padding-bottom: 0;
}

.custom-modal {
  width: 500px;
  background: transparent;
  border-radius: 16px;
  box-shadow: none;
  padding: 0;
  position: relative;
}

.search-container {
  position: relative;
  margin-bottom: 0;
  display: flex;
  justify-content: center;
  width: 100%;
  background: #fff;
  border-radius: 25px 25px 25px 25px;
}

.search-input :deep(.el-input__wrapper) {
  background-color: #fff;
  border: none;
  border-radius: 25px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 14px 20px;
}

.search-input :deep(.el-input__wrapper:focus-within) {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.search-input :deep(.el-input__inner) {
  font-size: 14px;
  color: #333;
  line-height: 1.4;
}

.search-input :deep(.el-input__inner::placeholder) {
  color: #999;
  font-weight: 400;
}

.search-icon {
  color: #666;
  font-size: 18px;
  margin-right: 8px;
}

.search-results {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 12px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
  z-index: 1000;
  max-height: 200px;
  overflow-y: auto;
  min-width: 300px;
  width: 95%;
  margin-top: 8px;
}

.search-result-item {
  padding: 14px 20px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s;
}

.search-result-item:hover {
  background-color: #f8f9fa;
}

.search-result-item:last-child {
  border-bottom: none;
}

.result-item-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.result-name {
  font-weight: 500;
  color: #333;
}

.result-type {
  font-size: 12px;
  color: #666;
  background: #f0f2f5;
  padding: 4px 10px;
  border-radius: 12px;
}

.content-section {
  background: #fff;
  border-radius: 16px;
  padding: 28px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  margin: 0 8px 8px;
  margin-top: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-size: 12px;
  font-weight: 600;
  color: #666;
}

.clear-icon {
  color: #666;
  cursor: pointer;
  font-size: 24px;
  transition: color 0.2s;
  padding: 6px;
  border-radius: 4px;
}

.history-section,
.recommend-section {
  margin-bottom: 28px;
}

.history-section:last-child {
  margin-bottom: 0;
}

.history-list,
.recommend-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.history-item,
.recommend-item {
  padding: 10px 18px;
  background: #f8f9fa;
  border: none;
  border-radius: 16px;
  cursor: pointer;
  font-size: 13px;
  color: #333;
  transition: all 0.2s ease;
  user-select: none;
  white-space: nowrap;
  font-weight: 500;
}

.history-item:hover,
.recommend-item:hover {
  background: #f0f0f0;
  color: #333;
}

.no-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 8px;
  text-align: center;
  color: #999;
  font-size: 14px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 0;
  width: 100%;
  height: 20px;
  line-height: 20px;
  box-sizing: border-box;
  z-index: 1000;
}

/* 过渡动画 */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
