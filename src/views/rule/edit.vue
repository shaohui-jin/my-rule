<template>
  <div class="rule-edit-layout">
    <DndPanel
      @node-mouse-down="(e, node) => onNodeMouseDown('logic', node, e)"
      @node-mouse-enter="(e, node) => onNodeMouseEnter('logic', node, e)"
      @node-mouse-leave="(e, node) => onNodeMouseleave('logic', node, e)"
    />

    <!-- 左侧 DnD 面板：用于拖拽创建节点 -->
    <!--    <div-->
    <!--      :class="{-->
    <!--        'side-panel': true,-->
    <!--        'dnd-panel': true-->
    <!--      }"-->
    <!--    ></div>-->

    <!-- 中间画布区域：用于展示和编辑工作流 -->
    <div class="center-panel">
      <div class="canvas-center-wrap">
        <WorkflowDesigner
          ref="editorRef"
          :data="workflowData"
          :functionNodes="allFuncData"
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

    <CommonDialog
      ref="saveDialogRef"
      :closeBtnVisible="isSaveFromTag"
      @saveDialog="saveDialog"
      @closeDialog="closeDialog"
      @cancelDialog="cancelDialog"
    >
      <template #content>
        <div>
          <el-space direction="vertical"><p>修改记录(非必填)</p></el-space>
          <el-input
            v-model="saveText"
            placeholder="请输入修改记录"
            :autosize="{ minRows: 4, maxRows: 4 }"
            type="textarea"
          />
        </div>
      </template>
    </CommonDialog>
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
import DndPanel from '@/components/BaseDndPanel/index.vue'
import AttrPanelDrawer from '@/components/workflow/panels/AttrPanelDrawer.vue'
import { LogicType, type WorkflowData } from '@/type/workflow'
import {
  getFunctionList,
  transformFunctionData,
  getFunctionListByIds,
  FunctionNode,
  updateRule
} from '@/api/workflow/WorkFlowApi'
import { useRuleStore, useCanvasStore } from '@/store/modules/ruleCache'
import { ElMessage, ElMessageBox } from 'element-plus'
import { nodeIdFactory } from '@/utils/workflow/NodeIdFactory'
import { compressParamData, expandParamData } from '@/utils/workflow/DataOptimizer'
import Detail from '@/views/rule/detail.vue'
import { http } from '@/axios'
import TestDrawer from '@/components/TestDrawer/index.vue'
import NodeTypeIcon from '@/components/BaseNodeIcon/index.vue'
import { emitter } from '@/utils/mitt'
import { bus } from 'wujie'
import { useParamStore } from '@/store/modules/params'
import Basic from '@/assets/rsvg/basic.svg'
import StarOutlined from '@/assets/rsvg/StarOutlined.svg'
import PartitionOutlined from '@/assets/rsvg/PartitionOutlined.svg'
import LeftOutlined from '@/assets/rsvg/LeftOutlined.svg'
import RightOutlined from '@/assets/rsvg/RightOutlined.svg'
import InfoCircleOutlined from '@/assets/rsvg/InfoCircleOutlined.svg'
import Fold from '@/assets/rsvg/Fold.svg'
import UnFold from '@/assets/rsvg/UnFold.svg'
import CommonDialog from '@/components/Dialog/CommonDialog.vue'

import { useDialogDrag } from '@/hooks/useDialogDrag'

const paramStore = useParamStore()
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

/**
 * 检查画布是否有未保存的修改
 * 这个方法将被页签关闭逻辑调用
 */
function hasUnsavedChanges(): boolean {
  return hasCanvasContent()
}

/**
 * 微前端通用退出提示
 * 当页面以iframe形式嵌入主界面时，显示浏览器默认的离开确认提示
 */
function showMicroFrontendExitMessage(): void {
  const userWantsToLeave = confirm('离开此网站？\n系统可能不会保存您所做的更改。')
  if (userWantsToLeave) {
    console.log('用户确认离开页面')
  } else {
    console.log('用户取消离开页面')
  }
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
let saveDialogResolve = null
const saveDialogFlowData = ref<{ luaCode: string; allFuncId: string[]; expressionParamArr: any[] }>(
  {
    luaCode: '',
    allFuncId: [],
    expressionParamArr: []
  }
)
const isSaveFromTag = ref(false)

const handleShowSaveModel = flowData => {
  saveDialogFlowData.value = flowData
  saveText.value = ''
  saveDialogRef.value.open()
}

const closeDialog = () => {
  saveDialogRef.value.close()
  saveDialogResolve && saveDialogResolve(false)
  isSaveFromTag.value = false
}

const saveDialog = async () => {
  const { luaCode, allFuncId, expressionParamArr } = saveDialogFlowData.value

  await saveRuleData(luaCode, allFuncId, expressionParamArr, saveText.value)
  saveDialogRef.value.close()
  saveDialogResolve && saveDialogResolve(false)
  isSaveFromTag.value = false
}

const cancelDialog = () => {
  saveDialogRef.value.close()
  saveDialogResolve && saveDialogResolve(true)
  isSaveFromTag.value = false
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

    await updateRule(
      compressedWorkflowData.id,
      compressedWorkflowData,
      luaCode,
      funcIds,
      expressionParamArr,
      modifyReason
    )
    ElMessage.success('规则保存成功')

    // 移除自动保存定时器启动
    // startAutoSaveTimer()

    return true
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('规则保存失败')
    return false
  }
}

const activeTab = ref('abstract')
const tabList = [
  { label: '基础组件', name: 'logic', compenent: Basic },
  // { label: '收藏', name: 'collection', compenent: StarOutlined },
  { label: '画布管理', name: 'canvasManage', compenent: PartitionOutlined }
]
const logicList = ref()
const allFuncData = ref(new Map<string, FunctionNode>())
const dndPageFuncData = ref<FunctionNode[]>([])
const pageNo = ref(1)
const pageSize = ref(1000)
const total = ref(0)
const searchKeyword = ref('')

/**
 * 设置所有函数节点数据
 * @param data 函数节点数据
 */
function setFuncNodeData(data: FunctionNode[]) {
  if (!allFuncData.value) {
    allFuncData.value = new Map<string, FunctionNode>()
  }
  data.forEach(item => {
    allFuncData.value.set(item.funcId, item)
  })
}

/**
 * 分页获取函数列表
 */
let resList = []
async function fetchFunctionList(page = 1, keyword = '') {
  // pageNo.value = page
  try {
    // const response = await getFunctionList({
    //   pageNo: pageNo.value,
    //   pageSize: pageSize.value,
    //   keyword: keyword,
    //   funcCategory: '',
    //   isMyFunction: false
    // })
    const response = await getFunctionList()
    resList = JSON.parse(JSON.stringify(response))
    let tempArr: any[] = []
    tempArr = repeatLoop(response, tempArr)
    // dnd面板用
    // console.log('response===222==999',response)
    dndPageFuncData.value = response as any
    // dndPageFuncData.value = tempList
    // 全量数据缓存
    setFuncNodeData(tempArr)
    // setFuncNodeData(tempList)
  } catch (error) {
    console.error('获取函数列表失败:', error)
    total.value = 0
  }
}
const repeatLoop = (Object, tempArr) => {
  Object.forEach(o => {
    let tempItem = []
    if (o.functions) {
      tempItem = o.functions.map(item => transformFunctionData(item))
      tempArr.push(...tempItem)
    }
    if (o.children.length) {
      repeatLoop(o.children, tempArr)
    } else {
      o.children = tempItem
    }
  })
  return tempArr
}
// function handlePageChange(newPage: number) {
//   fetchFunctionList(newPage, searchKeyword.value)
// }

// 处理搜索
function handleSearch(keyword: string) {
  searchKeyword.value = keyword
  if (keyword) {
    let data = repeatSearch(JSON.parse(JSON.stringify(resList)), keyword)
    let tempArr = []
    repeatLoop(data, tempArr)
    dndPageFuncData.value = data
  } else {
    fetchFunctionList()
  }
}
// 前端检索循环
const repeatSearch = (data, keyword) => {
  let tempArr = []
  data.forEach(d => {
    if (d.functions) {
      let tempFunctions = []
      d.functions.forEach(i => {
        // return
        if (i.funcName.includes(keyword) || i.funcCode.includes(keyword)) {
          tempFunctions.push(i)
        }
      })
      d.functions = tempFunctions
      tempArr.push(...tempFunctions)
    }
    if (d.children.length) {
      repeatSearch(d.children, keyword)
    }
  })
  return data
}
/**
 * 根据 funcId 列表获取函数配置
 */
async function getFunctionNodesByIds(ids: string[]) {
  const keys = Array.from(allFuncData.value.keys())
  const diffIds = ids.filter(id => !keys.includes(id))
  if (diffIds.length > 0) {
    const response = await getFunctionListByIds(diffIds)
    const tempList = (response as any).map(item => transformFunctionData(item))
    setFuncNodeData(tempList)
  }
  return true
}

// 工作流设计器组件引用
const editorRef = ref()

/**
 * 处理节点拖拽到画布
 * @param type 节点类型 'logic' | 'func'
 * @param item 节点基础数据
 * @param e 鼠标事件
 */
function onNodeMouseDown(type: 'logic' | 'func', item: any, e: MouseEvent) {
  editorRef.value?.startDragPreview(type, item, e)
}
function onNodeMouseEnter(type: 'logic' | 'func', item: any, e: MouseEvent) {
  logicList.value[item].show = true
}
function onNodeMouseleave(type: 'logic' | 'func', item: any, e: MouseEvent) {
  logicList.value[item].show = false
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
// 工具函数：展开整个工作流数据
function expandWorkflowData(workflowData) {
  return {
    ...workflowData,
    nodeList: (workflowData.nodeList || []).map(node => ({
      ...node,
      inputData: (node.inputData || []).map(param => expandParamData(param)),
      outputData: (node.outputData || []).map(param => expandParamData(param))
    }))
  }
}

const helpDialogVisible = ref(false)

// 另存对话框相关状态
const saveAsDialogVisible = ref(false)
const loadingSaveAs = ref(false)
const saveAsDetail = ref<any>({})
const refSaveAsDetail = ref<any>(null)
const saveAsData = ref<any>(null) // 存储从WorkflowDesigner传递的数据
const testDrawerRef = ref<any>(null) // 测试抽屉引用

// 搜索页面相关状态
const showSearchModal = ref(false)
const searchModalData = ref<
  { x: number; y: number; nodeId: string; portId: string; fromEdgeAdd: boolean } | undefined
>(undefined)

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

onMounted(async () => {
  const ruleId = route.query?.ruleId as string

  fetchFunctionList(1, '')

  // 数据恢复优先级：ruleStore.currentRule > canvasStore.cachedCanvas > 默认空数据
  const ruleData = ruleStore.getCurrentRule(ruleId)
  const cachedCanvas = canvasStore.getCurrentCanvas(ruleId)

  // 如果加载过，切换的时候会设置为false 那一定会有key
  let baseData = workflowData.value

  paramStore.setCanvasList(ruleId, ruleData?.variableSet || '[]')

  if (ruleData) {
    // 优先级1：使用从其他页面跳转过来的规则数据
    baseData = {
      ...workflowData.value,
      id: ruleData.id,
      ruleName: ruleData.ruleName,
      lua: ruleData.luaScript
    }
    const ids = ruleData.funcIds || []
    if (ids) {
      // 获取画布可能需要的函数节点
      await getFunctionNodesByIds(ids)
      try {
        const wfd = JSON.parse(ruleData.configData)
        // 关键：第一时间做参数展开，兼容历史数据
        const expandedWfd = expandWorkflowData(wfd)
        baseData.nodeList = expandedWfd.nodeList
        baseData.edges = expandedWfd.edges
        baseData.groupList = expandedWfd?.groupList || []
      } catch (error) {
        console.error('解析工作流数据失败:', error)
      }
    }
    // 清空跳转数据
    // ruleStore.clearCurrentRule(ruleId)
  } else if (cachedCanvas) {
    // 优先级2：使用缓存的画布数据
    baseData = {
      ...workflowData.value,
      id: cachedCanvas.id,
      ruleName: cachedCanvas.ruleName,
      lua: cachedCanvas.lua,
      nodeList: cachedCanvas.nodeList,
      edges: cachedCanvas.edges,
      groupList: cachedCanvas.groupList
    }

    // 如果有缓存的函数ID，获取函数节点
    if (cachedCanvas.funcIds && cachedCanvas.funcIds.length > 0) {
      await getFunctionNodesByIds(cachedCanvas.funcIds)
    }
  }

  // workflowData.value = baseData
  updateWorkflowData(baseData)

  // 添加浏览器事件监听
  window.addEventListener('beforeunload', handleBeforeUnload)

  // 微前端环境检测和监听
  if (window.__POWERED_BY_WUJIE__) {
    // 监听微前端卸载事件
    window.__WUJIE_UNMOUNT = () => {
      showMicroFrontendExitMessage()
    }

    window.addEventListener('beforeunload', showMicroFrontendExitMessage)
    // 监听主界面发送的消息
    // if (window.$wujie) {
    //   window.$wujie?.$on('beforeUnmount', () => {
    //     showMicroFrontendExitMessage()
    //   })
    // }
    window.__bus = bus
    // 监听微前端卸载事件
    bus.$on('beforeUnmount', async () => {
      try {
        await ElMessageBox.confirm('确定要关闭此应用吗?', '确认关闭', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
      } catch {
        throw new Error('用户取消关闭')
      }
    })
  }

  // 将调试函数挂载到window对象
  ;(window as any).debugLuaScript = debugLuaScript
  ;(window as any).showDebug = false

  // 监听页签关闭检查事件
  emitter.on('tabCloseCheck', async ({ name, resolve }) => {
    if (name === 'ruleEdit') {
      // 检查是否有未保存的修改
      const hasUnsaved = hasUnsavedChanges()
      if (hasUnsaved) {
        saveDialogResolve = resolve
        // 获取当前工作流数据并保存
        await editorRef.value?.handleSave()
        isSaveFromTag.value = true
      } else {
        resolve(false)
      }
    } else {
      resolve(false)
    }
  })
})

onUnmounted(() => {
  // 清理浏览器事件监听
  window.removeEventListener('beforeunload', handleBeforeUnload)

  // 清理微前端监听
  if (window.__POWERED_BY_WUJIE__ && window.$wujie) {
    try {
      window.$wujie.$off('beforeUnmount')
    } catch (error) {
      console.log('清理微前端监听器失败:', error)
    }
  }

  // 清理window对象上的调试函数
  delete (window as any).debugLuaScript
  delete (window as any).showDebug

  // 清理事件监听器
  emitter.off('tabCloseCheck')

  // 移除自动保存定时器清理
  // clearAutoSaveTimer()
})

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

// 收缩菜单
const foldStatus = ref(true)

// 展开折叠基础函数
const dndPanelRef = ref(null)
function foldBtnMenu(type: number) {
  dndPanelRef.value[0].setFold(type)
}
// 定位位置
let nodeId = ref(null)
let currentIndex = ref(-1)
function toNode(item, index) {
  currentIndex.value = index
  nodeId.value = item.id
}
// 左侧面板显示提示
let contentTip = ref([])
function showWorkFlowInfo(item: any, index: number) {
  contentTip.value = []
  // console.log('item===', item, index)
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
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 4px 32px rgba(0, 0, 0, 0.1);
  position: relative;
}

/* 拖拽面板特定样式 */
.dnd-panel {
  position: relative;
  width: 370px;
  height: 100%;
  align-self: center;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 4px 32px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  z-index: 100;
  overflow: hidden;
  &.collapsed {
    display: none;
  }

  :deep(.el-tabs__header) {
    background: #fff;
    box-sizing: border-box;
  }
  :deep(.el-tabs__item) {
    padding-top: 10px;
    width: 74px;
    height: 74px;
    margin: 7px;
    border-radius: 5px;
    text-align: center;
    font-size: 12px;
    font-weight: Semibold;
    .custom-tabs-label {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex: 1;
    }
    &:hover {
      color: #0055ff;
      path {
        fill: #0055ff !important;
      }
    }
    &.is-active {
      background: #f4f5f9;
      color: #0055ff;
      path {
        fill: #0055ff !important;
      }
    }
  }

  /* 拖拽标签页样式 */
  .dnd-tabs {
    flex: 1;
    min-height: 0;
    height: 100%;
  }

  /* 拖拽列表样式 */
  //.dnd-list {
  //  display: flex;
  //  flex-wrap: wrap;
  //  gap: 12px;
  //  padding: 16px 12px 0 12px;
  //  overflow-y: auto;
  //  max-height: 95%;
  //}

  /* 拖拽项样式 */
  //.dnd-item {
  //  width: 120px;
  //  height: 80px;
  //  background: #f7f9fa;
  //  border: 1.5px solid var(--workflow-border);
  //  border-radius: 12px;
  //  display: flex;
  //  flex-direction: column;
  //  align-items: center;
  //  justify-content: center;
  //  cursor: grab;
  //  transition: box-shadow 0.2s, border 0.2s;
  //  user-select: none;
  //  -webkit-user-select: none;
  //  -moz-user-select: none;
  //  -ms-user-select: none;
  //  pointer-events: auto;
  //}

  /* 拖拽项内部元素样式 */
  //.dnd-item * {
  //  pointer-events: none;
  //  user-select: none;
  //}

  /* 拖拽项悬停效果 */
  //.dnd-item:hover {
  //  border: 1.5px solid var(--workflow-primary);
  //  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.08);
  //}

  /* 拖拽图标样式 */
  .dnd-icon {
    margin-bottom: 6px;
  }

  /* 拖拽标题样式 */
  //.dnd-title {
  //  font-size: 15px;
  //  color: #333;
  //  font-weight: 500;
  //  text-align: center;
  //}

  .help-btn-fixed {
    position: absolute;
    right: 8px;
    bottom: 18px;
    font-size: 10px;
    color: #4d94ff;
    cursor: pointer;
    z-index: 99;
    background: #fff;
    padding: 1px 8px 0 8px;
    transition: color 0.2s, border-color 0.2s;
    box-shadow: 0 2px 8px rgba(255, 77, 79, 0.04);
    user-select: none;
  }

  .help-btn-fixed:hover {
    color: #3661d9;
  }

  /* 画布管理 */
  .dnd-canvas {
    padding-top: 10px;
    margin-right: 10px;
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
    padding: 0 20px 0 20px;
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
  .dnd-canvas li:hover:before {
    content: '';
    width: 0;
    height: 0;
    border-width: 4px;
    border-color: transparent transparent transparent #9d9da0;
    border-style: solid;
    position: absolute;
    z-index: 10;
    left: 8px;
    top: 50%;
    transform: translate(0, -50%);
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
