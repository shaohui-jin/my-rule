<template>
  <div class="rule-edit-layout">
    <BaseDndPanel @node-mouse-down="(e, node) => onNodeMouseDown(node, e)" />

    <!-- 中间画布区域：用于展示和编辑工作流 -->
    <div class="center-panel">
      <div class="canvas-center-wrap">
        <WorkflowDesigner
          ref="editorRef"
          :data="workflowData"
          @show-attr-panel="onShowAttrPanel"
          @update:workflow="updateWorkflowData"
          @save-as-data="handleSaveAs"
          @test-lua="handleTestLua"
          @show-save-modal="handleShowSaveModel"
          :nodeId="nodeId"
          :isTesting="isTesting"
        />
      </div>
    </div>

    <!-- 属性面板抽屉组件 -->
    <AttrPanelDrawer
      :visible="showAttrPanel"
      :nodeData="selectedNodeData"
      :workflowData="workflowData"
      :getAvailableSourceOptions="getAvailableSourceOptions"
      :getAvailableTargetOptions="getAvailableTargetOptions"
      :getAllAvailableOptions="getAllAvailableOptions"
      @close="onCloseAttrPanel"
      @addPortData="addPortData"
      @removePortData="removePortData"
      @nodeBaseDataUpdate="onNodeBaseDataUpdate"
    />

    <!-- 另存对话框 -->
    <el-dialog
      v-model="saveAsDialogVisible"
      title="另存为"
      width="50%"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      append-to-body
      :destroy-on-close="true"
      @close="closeSaveAsDialog"
    >
      <Detail
        v-loading="loadingSaveAs"
        ref="refSaveAsDetail"
        :detail="saveAsDetail"
        :operation-mode="'ADD'"
      />
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="saveAsDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmSaveAs">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 测试抽屉 -->
    <TestDrawer @node-click="handleNodeClick" ref="testDrawerRef" @close="closeTestDrawer" />
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  onMounted,
  onUnmounted,
  onActivated,
  onDeactivated,
  nextTick,
  computed,
  watch
} from 'vue'
import { onBeforeRouteLeave, useRoute } from 'vue-router'
import WorkflowDesigner from '@/components/workflow/WorkflowDesigner.vue'
import BaseDndPanel from '@/components/BaseDndPanel/index.vue'
import AttrPanelDrawer from '@/components/workflow/panels/AttrPanelDrawer.vue'
import { LogicType, type WorkflowData } from '@/type/workflow'
import { useRuleStore, useCanvasStore } from '@/store/modules/ruleCache'
import { ElMessage, ElMessageBox } from 'element-plus'
import nodeIdFactory from '@/utils/factory/NodeIdFactory'
import { compressParamData, expandParamData } from '@/utils/workflow/DataOptimizer'
import Detail from '@/views/rule/detail.vue'
import { http } from '@/axios'
import TestDrawer from '@/components/TestDrawer/index.vue'
import NodeTypeIcon from '@/components/BaseNodeIcon/index.vue'
import { emitter } from '@/utils/mitt'
import { useParamStore } from '@/store/modules/params'

import { useDialogDrag } from '@/hooks/useDialogDrag'

import { BaseFunctionNodeType, useFunctionStore } from '@/store/modules/baseFunction'

const { initDialog } = useDialogDrag()

defineOptions({
  name: 'ruleEdit'
})

/**
 * 工作流数据
 * 包含节点列表、边列表和工作流配置
 * 使用ref包装以实现响应式
 */
const workflowData = ref<WorkflowData>({
  id: '', // 工作流ID
  nodeList: [], // 节点列表
  edges: [], // 边列表
  groupList: [], // 组列表
  lua: '', // Lua脚本
  ruleName: '' // 规则名称
})

// 页面退出拦截相关状态

// 检查画布是否有内容
function hasCanvasContent(): boolean {
  return workflowData.value.nodeList.length > 0 || workflowData.value.edges.length > 0
}

const ruleStore = useRuleStore()
const canvasStore = useCanvasStore()

/**
 * 缓存当前画布数据
 */
function cacheCurrentCanvas() {
  if (hasCanvasContent()) {
    const canvasData = {
      id: workflowData.value.id,
      ruleName: workflowData.value.ruleName,
      nodeList: workflowData.value.nodeList,
      edges: workflowData.value.edges,
      groupList: workflowData.value.groupList,
      lua: workflowData.value.lua,
      funcIds: workflowData.value.nodeList.map(node => node.funcId),
      timestamp: Date.now()
    }
    canvasStore.setCachedCanvas(canvasData)
  }
}

/**
 * 路由离开守卫：在页面切换时缓存画布数据
 */
onBeforeRouteLeave(async (to, from, next) => {
  if (hasCanvasContent()) {
    cacheCurrentCanvas()
  }
  next()
})

// 浏览器刷新/关闭事件处理
async function handleBeforeUnload(event: BeforeUnloadEvent) {
  // 如果画布为空，不拦截
  if (!hasCanvasContent()) {
    return
  }
  event.preventDefault()
  event.returnValue = '离开此网站？系统可能不会保存您所做的更改。'
  return event.returnValue
}

/**
 * 更新工作流数据
 * @param data 新的工作流数据
 */
function updateWorkflowData(data: WorkflowData) {
  workflowData.value = data
  syncNodeIdFactoryWithWorkflow(data)
}
// 同步节点ID工厂
function syncNodeIdFactoryWithWorkflow(data: WorkflowData) {
  const maxId = Math.max(0, ...data.nodeList.map(n => Number(n.id)).filter(n => !isNaN(n)))
  nodeIdFactory.reset(maxId + 1)
}

/**
 * 保存相关
 */
const saveDialogRef = ref(null)
const saveText = ref('')
const saveDialogFlowData = ref<{ luaCode: string; allFuncId: string[]; expressionParamArr: any[] }>(
  {
    luaCode: '',
    allFuncId: [],
    expressionParamArr: []
  }
)

const handleShowSaveModel = flowData => {
  saveDialogFlowData.value = flowData
  saveText.value = ''
  saveDialogRef.value.open()
}

async function saveRuleData(
  luaCode: string,
  funcIds: string[],
  expressionParamArr: any[],
  modifyReason?: string
): Promise<boolean> {
  if (!workflowData.value.id) {
    ElMessage.error('规则ID为空, 请先另存规则')
    return false
  }

  try {
    // 保存前压缩，生成新对象
    const compressedWorkflowData = compressWorkflowData(workflowData.value)

    // 移除自动保存定时器启动
    // startAutoSaveTimer()

    return true
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('规则保存失败')
    return false
  }
}

// 属性面板相关状态
const showAttrPanel = ref(false)
const selectedNodeData = ref<any>(null)

// 属性面板事件处理
function onShowAttrPanel({ nodeData }: any) {
  selectedNodeData.value = nodeData
  // 如果抽屉已经打开，只是切换节点数据，不关闭抽屉
  if (!showAttrPanel.value && nodeData) {
    showAttrPanel.value = true
  }
  // 如果点击空白区域且抽屉已打开，则关闭抽屉
  if (!nodeData && showAttrPanel.value) {
    showAttrPanel.value = false
  }
}

// 关闭属性面板
function onCloseAttrPanel() {
  showAttrPanel.value = false

  // 延迟清空节点数据，确保关闭动画完成后再清空
  // 这样可以避免在关闭后立即点击同一节点时无法打开抽屉的问题
  setTimeout(() => {
    selectedNodeData.value = null

    // 通知编辑器取消节点选择状态
    if (editorRef.value) {
      editorRef.value.clearSelection?.()
    }
  }, 300)
}

// 添加端口数据
function addPortData(newData: any, nodeId: string) {
  editorRef.value.addPortData(newData, nodeId)
}
// 删除端口数据
function removePortData(index: number, nodeId: string, type?: string) {
  editorRef.value.removePortData(index, nodeId, type)
}

function onNodeBaseDataUpdate(nodeId: string) {
  // 更新单个node的基本信息显示（无port）
  editorRef.value?.onNodeBaseDataUpdate(nodeId)
}

// 获取可用的上游节点列表
function getAvailableSourceOptions(param: any) {
  return editorRef.value?.getAvailableSourceOptions(selectedNodeData.value, param)
}

function getAllAvailableOptions(param: any) {
  console.log('workflowData1111', workflowData)
  const node = selectedNodeData.value
  if (!node || !param) return []
  // 上游是条件的话 会继续往前找 直到找到第一个非条件的节点
  const nodeList = workflowData.value.nodeList
  const options = []
  nodeList.forEach(node => {
    if (
      node.funcType === 'logic' &&
      (node.logicData?.logicType === LogicType.GLOBAL_VARIABLE ||
        node.logicData?.logicType === LogicType.GLOBAL_PARAM ||
        node.logicData?.logicType === LogicType.IFELSE)
    ) {
      return
    }
    options.push({ label: node.id + ':' + node.title, value: node.id })
  })
  return options
}

function getAvailableTargetOptions() {
  // console.log('222',workflowData)
  return workflowData.value.nodeList.map(node => ({ label: node.title, value: node.id }))
}

// 工具函数：压缩整个工作流数据
function compressWorkflowData(workflowData) {
  return {
    ...workflowData,
    nodeList: (workflowData.nodeList || []).map(node => ({
      ...node,
      inputData: (node.inputData || []).map(param => compressParamData(param)),
      outputData: (node.outputData || []).map(param => compressParamData(param))
    }))
  }
}

// 另存对话框相关状态
const saveAsDialogVisible = ref(false)
const loadingSaveAs = ref(false)
const saveAsDetail = ref<any>({})
const refSaveAsDetail = ref<any>(null)
const saveAsData = ref<any>(null) // 存储从WorkflowDesigner传递的数据
const testDrawerRef = ref<any>(null) // 测试抽屉引用

/**
 * 调试功能：对比当前画布生成的Lua脚本与存储的Lua脚本
 * 通过 window.debugLuaScript 调用
 */
const debugLuaScript = async () => {
  try {
    // 获取当前画布生成的Lua脚本
    if (!editorRef.value) {
      console.error('编辑器引用不存在')
      return
    }

    const currentFlowData = await editorRef.value.getFlowData({ isGenerateTestLuaScript: false })
    if (!currentFlowData) {
      console.error('无法生成当前画布的Lua脚本')
      return
    }

    const currentLuaScript = currentFlowData.luaCode

    // 获取存储的Lua脚本
    const storedLuaScript = workflowData.value.lua

    if (!storedLuaScript) {
      console.error('存储的Lua脚本为空')
      return
    }

    // 进行字符串对比
    if (currentLuaScript === storedLuaScript) {
      console.log('✅ Lua数据一致')
    } else {
      console.log('❌ Lua数据不一致')
      console.log('当前画布生成的Lua脚本:')
      console.warn(currentLuaScript)
      console.log('存储的Lua脚本:')
      console.log(storedLuaScript)
    }
  } catch (error) {
    console.error('调试Lua脚本对比失败:', error)
    ElMessage.error('调试失败')
  }
}

const route = useRoute()
const paramStore = useParamStore()
const functionStore = useFunctionStore()

onMounted(async () => {
  const ruleId = route.query?.ruleId as string
  const ruleData = ruleStore.getCurrentRule(ruleId)
  const cachedCanvas = canvasStore.getCurrentCanvas(ruleId)

  // 如果加载过，切换的时候会设置为false 那一定会有key
  // let baseData = workflowData.value
  //
  // if (ruleData) {
  //   // 优先级1：使用从其他页面跳转过来的规则数据
  //   baseData = {
  //     ...workflowData.value,
  //     id: ruleData.id,
  //     ruleName: ruleData.ruleName,
  //     lua: ruleData.luaScript
  //   }
  //   const ids = ruleData.funcIds || []
  //   if (ids) {
  //     // 获取画布可能需要的函数节点
  //     try {
  //       const wfd = JSON.parse(ruleData.configData)
  //       // 关键：第一时间做参数展开，兼容历史数据
  //       const expandedWfd = expandWorkflowData(wfd)
  //       baseData.nodeList = expandedWfd.nodeList
  //       baseData.edges = expandedWfd.edges
  //       baseData.groupList = expandedWfd?.groupList || []
  //     } catch (error) {
  //       console.error('解析工作流数据失败:', error)
  //     }
  //   }
  //   // 清空跳转数据
  //   // ruleStore.clearCurrentRule(ruleId)
  // } else if (cachedCanvas) {
  //   // 优先级2：使用缓存的画布数据
  //   baseData = {
  //     ...workflowData.value,
  //     id: cachedCanvas.id,
  //     ruleName: cachedCanvas.ruleName,
  //     lua: cachedCanvas.lua,
  //     nodeList: cachedCanvas.nodeList,
  //     edges: cachedCanvas.edges,
  //     groupList: cachedCanvas.groupList
  //   }
  // }

  // workflowData.value = baseData
  // updateWorkflowData(baseData)

  // 添加浏览器事件监听
  window.addEventListener('beforeunload', handleBeforeUnload)

  // 将调试函数挂载到window对象
  ;(window as any).debugLuaScript = debugLuaScript
  ;(window as any).showDebug = false
})

onUnmounted(() => {
  // 清理浏览器事件监听
  window.removeEventListener('beforeunload', handleBeforeUnload)
  // 清理window对象上的调试函数
  delete (window as any).debugLuaScript
  delete (window as any).showDebug
})

// 工作流设计器组件引用
const editorRef = ref()

/**
 * 处理节点拖拽到画布
 * @param type 节点类型 'logic' | 'func'
 * @param item 节点基础数据
 * @param e 鼠标事件
 */
function onNodeMouseDown(item: BaseFunctionNodeType, e: MouseEvent) {
  editorRef.value?.startDragPreview(item, e)
}

// 另存相关方法
const handleSaveAs = (data: any) => {
  // 保存从WorkflowDesigner传递的数据
  saveAsData.value = data

  // 初始化另存对话框数据
  saveAsDetail.value = {
    ruleCode: '',
    ruleName: '',
    ruleType: 'module',
    sceneCategory: '',
    ruleDesc: '',
    ruleStatus: 'ENABLED'
  }
  saveAsDialogVisible.value = true
  nextTick(() => {
    initDialog()
  })
}

const closeSaveAsDialog = () => {
  saveAsDialogVisible.value = false
  saveAsDetail.value = {}
  saveAsData.value = null
  if (refSaveAsDetail.value) {
    refSaveAsDetail.value.resetForm()
  }
}

/**
 * 执行另存操作的通用函数
 * @param formData 表单数据
 * @returns Promise<void>
 */
const performSaveAs = async (formData: any) => {
  loadingSaveAs.value = true
  try {
    const res = await http.post({
      url: '/rule-config/rule/add',
      data: formData
    })

    if (res.data && String(res.data).length > 0) {
      // 获取新规则ID
      const newRuleId = String(res.data)

      // 更新工作流数据中的规则ID
      workflowData.value.id = newRuleId
      workflowData.value.ruleName = formData.ruleName

      // 使用从WorkflowDesigner传递的数据保存规则
      if (saveAsData.value) {
        const saveSuccess = await saveRuleData(
          saveAsData.value.luaCode,
          saveAsData.value.allFuncId,
          saveAsData.value.expressionParamArr
        )
        if (saveSuccess) {
          ElMessage.success('另存成功')
          saveAsDialogVisible.value = false
        } else {
          ElMessage.error('另存失败')
        }
      } else {
        ElMessage.success('另存成功')
        saveAsDialogVisible.value = false
      }
    } else {
      ElMessage.error('另存失败')
    }
  } catch (error) {
    ElMessage.error('另存失败')
  } finally {
    loadingSaveAs.value = false
  }
}

const confirmSaveAs = () => {
  refSaveAsDetail.value?.validate(async (isValid: boolean) => {
    if (!isValid) {
      return
    }

    await performSaveAs({
      ruleCode: saveAsDetail.value.ruleCode,
      ruleName: saveAsDetail.value.ruleName,
      ruleType: saveAsDetail.value.ruleType,
      sceneCategory: saveAsDetail.value.sceneCategory,
      ruleDesc: saveAsDetail.value.ruleDesc,
      ruleStatus: saveAsDetail.value.ruleStatus
    })
  })
}

const isTesting = ref(false)

/**
 * 处理测试事件
 * @param data 测试数据
 */
const handleTestLua = (luaScript: string) => {
  if (!testDrawerRef.value) return
  isTesting.value = true
  const data = {
    ruleId: workflowData.value.id,
    luaScript: luaScript,
    configData: JSON.stringify({
      nodeList: workflowData.value.nodeList
    })
  }
  testDrawerRef.value.openDrawer(data, false, true)
}

const handleNodeClick = node => {
  console.log('节点被点击：', node)
  selectedNodeData.value = null
  showAttrPanel.value = false
  if (node && node.nodeId && editorRef.value) {
    editorRef.value.selectNodeOnly(node.nodeId)
  }
}
const closeTestDrawer = () => {
  isTesting.value = false
}

// 定位位置
let nodeId = ref(null)
</script>

<style scoped lang="scss">
.rule-edit-layout {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;

  position: relative;
}

.fold {
  position: absolute;
  left: 44px;
  bottom: 42px;
  width: 30px;
  height: 30px;
  background: #f4f5f5;
  border-radius: 9px 9px 9px 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 103;
  svg {
    scale: 70%;
  }
}
/* .fold.active{
  background:#fff;
} */

.center-panel {
  flex: 1 1 0;
  min-width: 0;
  height: 100%;
  align-self: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.canvas-center-wrap {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  box-shadow: 0 4px 32px rgba(0, 0, 0, 0.1);
  position: relative;
}

/* 抽屉内容动画 */
.drawer-content {
  flex: 1;
  overflow-y: auto;
  padding: 0 20px;
  background: #fff;
  opacity: 0;
  transform: translateX(20px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transition-delay: 0.1s;
}

.drawer-open .drawer-content {
  opacity: 1;
  transform: translateX(0);
}

/* 抽屉头部样式 */
.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  flex-shrink: 0;
}

.drawer-title-container {
  display: flex;
  align-items: center;
  flex: 1;
  overflow: hidden;
}

.drawer-title {
  display: flex;
  align-items: center;
  font-size: 18px;
  font-weight: 500;
  color: #303133;
  width: 100%;
}

.drawer-actions {
  display: flex;
  align-items: center;
  margin-left: 16px;
}

.node-id {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 25px;
  height: 25px;
  border-radius: 50%;
  border: 2px solid #409eff;
  color: #409eff;
  font-weight: 600;
  font-size: 14px;
  margin-right: 6px;
  flex-shrink: 0;
}

.node-title-container {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
  cursor: pointer;
  padding: 0 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
  max-width: calc(100% - 40px);

  &:hover {
    background-color: rgba(64, 158, 255, 0.05);
  }

  .node-title {
    font-size: 18px;
    font-weight: 500;
    color: #303133;
    width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: inline-block;
  }
  .node-title-input {
    width: 100%;
    border: none;
    outline: none;
    font-size: 18px;
    font-weight: 500;
    color: #303133;
  }
}

/* 确保画布区域可以正常接收点击事件 */
.center-panel {
  pointer-events: auto;
  z-index: 1;
}
.snapline {
  border-color: #1890ff;
  border-style: dashed;
}
</style>
