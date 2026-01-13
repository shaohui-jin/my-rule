<template>
  <div class="workflow-editor-outer" id="workflowEditorOuter">
    <div class="workflow-editor">
      <!-- 规则名展示区：左下角，始终显示 -->
      <div class="rule-name-indicator">
        当前编辑规则：{{
          props.data.ruleName &&
          (props.data.ruleName.trim() !== '' ? props.data.ruleName : '空') +
            '( id:' +
            props.data.id +
            ' )'
        }}
      </div>
      <div class="x6-tooltip common-tip" v-show="visible">{{ content }}</div>
      <!-- 画布容器 -->
      <div ref="container" class="graph-container" tabindex="0" />

      <!-- 工作流验证错误面板 -->
      <WorkflowValidationModal
        :visible="showValidationModal"
        :errors="validationErrors"
        @close="closeValidationModal"
        @node-select="handleValidationNodeSelect"
      />

      <!-- 小地图容器 -->
      <div v-show="showMiniMap" class="minimap-container" ref="minimapContainer" />

      <!-- 工具栏 -->
      <div class="canvas-actions">
        <el-tooltip
          v-for="action in canvasAction"
          :content="action.content"
          :key="action.content"
          placement="top"
        >
          <template v-if="action?.group">
            <component :is="action.group().comp" @click="action.group().fn" />
          </template>
          <component v-else :is="action.comp" @click="action.fn" />
        </el-tooltip>
      </div>
      <div class="workflow-actions">
        <div v-for="w in workflowAction" :key="w.txt" @click="w.fn">
          <component :is="w.comp" :disabled="w?.disabled ? w.disabled() : false" />
          {{ w.txt }}
        </div>
        <el-button type="primary" :disabled="!props.data.id">保存</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  reactive,
  onMounted,
  onUnmounted,
  watch,
  defineExpose,
  h,
  nextTick,
  computed,
  Ref
} from 'vue'
import { Graph, Shape } from '@antv/x6'
import { Dnd } from '@antv/x6'
import { InputData, LogicType, type WorkflowData, WorkflowNode } from '@/type/workflow'
import { CustomNode, getCustomNodeConfig } from '@/utils/workflow/CustomNode'
import { IteratorNode } from '@/utils/workflow/IteratorNode'
import { createInfoPanelNode } from '@/utils/workflow/InfoPanelNode'
import { ElMessage, ElMessageBox } from 'element-plus'
import nodeIdFactory from '@/utils/factory/NodeIdFactory'
import { createX6Node } from '@/utils/factory/NodeFactory'
import { initKeyboard } from '@/utils/plugins/KeyboardPlugin'
import WorkflowValidationModal from './panels/WorkflowValidationModal.vue'
import { initLayout, registerPlugins, clearSelectionPlugin } from '@/utils/plugins/X6Plugin'
import { WorkflowValidator, type ValidationError } from '@/utils/workflow/WorkflowValidator'
import { LuaGenerator } from '@/utils/json2lua/LuaGenerator'
import { FunctionNode } from '@/api/workflow/WorkFlowApi'
import { EdgeCorrectionManager } from '@/utils/workflow/EdgeCorrectionManager'
import { GroupManager } from '@/utils/workflow/GroupManager'
import { IteratorManager } from '@/utils/workflow/IteratorManager'
import { getLuaCodeMapByExpression } from '@/utils/expression'
import { useRouter } from 'vue-router'
// 引入工具栏图片
import Reset from '@/assets/ruleEditToolSvg/reset.svg'
import Add from '@/assets/ruleEditToolSvg/add.svg'
import Clear from '@/assets/ruleEditToolSvg/clear.svg'
import Check from '@/assets/ruleEditToolSvg/check.svg'
import Setting from '@/assets/ruleEditToolSvg/setting.svg'
import SaveAs from '@/assets/ruleEditToolSvg/saveAs.svg'
import Test from '@/assets/ruleEditToolSvg/test.svg'
import Import from '@/assets/ruleEditToolSvg/import.svg'
import Export from '@/assets/ruleEditToolSvg/export.svg'
import Recover from '@/assets/ruleEditToolSvg/recover.svg'
import AdaptView from '@/assets/ruleEditToolSvg/adaptView.svg'
import Browsing from '@/assets/ruleEditToolSvg/browsing.svg'
import Collapse from '@/assets/ruleEditToolSvg/collapse.svg'
import Decrease from '@/assets/ruleEditToolSvg/decrease.svg'
import Expand from '@/assets/ruleEditToolSvg/expand.svg'
import Increase from '@/assets/ruleEditToolSvg/increase.svg'
import Layout from '@/assets/ruleEditToolSvg/layout.svg'
import { useRuleStore } from '@/store/modules/ruleCache'
import { BaseFunctionNodeType } from '@/store/modules/baseFunction'
import {
  defaultWorkflowFunction,
  WorkflowActionPlugin,
  WorkflowFunction
} from '@/utils/plugins/WorkflowPlugin'
import { MAX_DEVICE_PIXEL_RATIO, MIN_DEVICE_PIXEL_RATIO } from '@/config/workflow'
import { Reactive } from '@vue/reactivity'

/**
 * 组件属性定义
 * @property {WorkflowData} data - 工作流数据
 * @property {any[]} functionNodes - 函数节点列表
 */
const props = defineProps<{
  data: WorkflowData
  functionNodes: Map<string, FunctionNode>
  nodeId: number
}>()
const emit = defineEmits([
  'update:data',
  'show-attr-panel',
  'update:workflow',
  'save-as-data',
  'test-lua',
  'show-save-modal',
  'show-search-modal',
  'close-search-modal'
])

/**
 * 组件状态变量
 */
const container = ref<HTMLElement>()
const minimapContainer = ref<HTMLElement>()
const luaGenerator = new LuaGenerator()
let graph: any
const canUndo = ref(false)
const canRedo = ref(false)
const selectedNodeData = ref<any>(null)
const workflowData = ref(props.data)
const router = useRouter()
const isDecode = ref(false)

const showMiniMap = ref(false)

// 信息展示面板相关状态
const infoPanelNode = ref<any>(null) // 信息面板节点引用
// 拖拽相关状态
let dnd: any = null
// 错误边管理器
let edgeCorrectionManager: EdgeCorrectionManager
// 分组管理器
let groupManager: GroupManager
// 迭代器管理器
let iteratorManager: IteratorManager
// 折叠状态
const collapse = ref(false)

// 工具栏
const canvasAction = ref([
  {
    content: '折叠/展开',
    group: () => {
      return {
        content: collapse.value ? '一键展开' : '一键折叠',
        fn: () => actionPlugin.handleCollapse(!collapse.value),
        comp: collapse.value ? Expand : Collapse
      }
    }
  },
  { content: '适应视图', comp: AdaptView, fn: () => actionPlugin.handleFit() },
  { content: '一键排列', comp: Layout, fn: () => actionPlugin.handleLayout() },
  { content: '视图浏览', comp: Browsing, fn: () => actionPlugin.handleShowMiniMap() }
])

// 流程工具栏
const workflowAction = ref([
  { txt: '撤销', comp: Reset, fn: () => actionPlugin.handleUndo() },
  { txt: '恢复', comp: Recover, fn: () => actionPlugin.handleRedo() },
  { txt: '清空', comp: Clear, fn: () => actionPlugin.handleNew(resetWorkflowData) },
  { txt: '另存为', comp: SaveAs, fn: () => handleSaveAs() },
  { txt: '导入', comp: Import, fn: () => actionPlugin.handleImport(executeImport) },
  { txt: '导出', comp: Export, fn: () => actionPlugin.handleExport(syncData) },
  { txt: '测试', comp: Test, fn: () => handleTest(), disabled: () => !props.data.id }
])

// 工作流方法管理器
let actionPlugin: Reactive<WorkflowFunction> = reactive(defaultWorkflowFunction)

let resizeHandler: (() => void) | null = null

/**
 * 组件挂载时初始化
 */
onMounted(() => {
  initGraph()
  resizeHandler = () => {
    console.log('resizeHandler')
    if (container.value && graph) {
      const width = container.value.offsetWidth
      const height = container.value.offsetHeight
      graph.resize(width, height)
    }
  }
  window.addEventListener('resize', resizeHandler)
  resizeHandler()
})

/**
 * 组件卸载时清理
 */
onUnmounted(() => {
  iteratorManager?.destroy()
  graph?.dispose()
  dnd?.dispose()
  if (resizeHandler) window.removeEventListener('resize', resizeHandler)
})

// 初始化X6画布
const initGraph = () => {
  if (!(window as any).__custom_node_registered) {
    // 注册迭代器节点
    Graph.registerNode('iteratorNode', IteratorNode, true)
    Graph.registerNode('customNode', CustomNode, true)
    ;(window as any).__custom_node_registered = true
  }
  if (!container.value) return

  graph = new Graph({
    container: container.value,
    panning: true,
    grid: false,
    autoResize: true,
    scaling: { min: MIN_DEVICE_PIXEL_RATIO, max: MAX_DEVICE_PIXEL_RATIO },
    connecting: {
      snap: true,
      allowBlank: false,
      allowLoop: false,
      highlight: true,
      router: {
        name: 'manhattan',
        args: {
          padding: 30
        }
      },
      connector: {
        name: 'rounded',
        args: { radius: 30 }
      },
      // attrs: {
      //   line: {
      //     stroke: '#faad14',
      //     targetMarker: 'classic'
      //   }
      // },
      connectionPoint: 'boundary',
      createEdge: () => new Shape.Edge(),
      allowMulti: true,
      validateConnection(args) {
        if (edgeCorrectionManager) {
          edgeCorrectionManager.edgePreviewColor(args)
        }
        const sourceMagnet = args.sourceMagnet as Element | null | undefined
        const targetMagnet = args.targetMagnet as Element | null | undefined
        if (sourceMagnet && sourceMagnet.getAttribute('port-group') === 'in') {
          return false
        }
        if (targetMagnet && targetMagnet.getAttribute('port-group') === 'out') {
          return false
        }
        const sourcePortId = sourceMagnet?.getAttribute('port')
        const targetPortId = targetMagnet?.getAttribute('port')
        const sourceNodeId = args.sourceCell?.id
        const targetNodeId = args.targetCell?.id
        if (!sourcePortId || !targetPortId || !sourceNodeId || !targetNodeId) {
          return false
        }
        // 组合节点 不允许连接
        const sourceNode = graph.getCellById(sourceNodeId)
        const targetNode = graph.getCellById(targetNodeId)
        if (sourceNode.shape === 'groupNode' || targetNode.shape === 'groupNode') {
          return false
        }
        // 迭代器的子节点 不允许连接到外面
        const sourceParent = sourceNode.getParent()
        const targetParent = targetNode.getParent()
        if (
          sourceParent &&
          sourceParent.shape === 'iteratorNode' &&
          (!targetParent || sourceParent.id !== targetParent.id)
        ) {
          return false
        }
        if (
          targetParent &&
          targetParent.shape === 'iteratorNode' &&
          (!sourceParent || targetParent.id !== sourceParent.id)
        ) {
          return false
        }
        return true
      }
    },
    interacting: {
      nodeMovable: true,
      edgeMovable: true,
      vertexMovable: true,
      vertexAddable: true,
      vertexDeletable: true,
      arrowheadMovable: true
    },
    embedding: {
      enabled: true,
      findParent({ node }) {
        const bbox = node.getBBox()
        return this.getNodes().filter(n => {
          // 如果当前节点是迭代器节点，则不允许嵌套到其他迭代器中
          if (node.shape === 'iteratorNode' && n.shape === 'iteratorNode') {
            return false
          }

          // 只有分组节点和迭代器节点可以作为父节点
          if ((n.shape !== 'groupNode' && n.shape !== 'iteratorNode') || n === node) {
            return false
          }

          const targetBBox = n.getBBox()
          return targetBBox.containsRect(bbox)
        })
      }
    },
    highlighting: {
      embedding: {
        name: 'stroke',
        args: {
          padding: -1,
          attrs: {
            stroke: '#73d13d'
          }
        }
      }
    },
    // 桩点渲染的回调
    onPortRendered(args) {}
  })
  // 注册插件
  registerPlugins(graph, container.value, minimapContainer.value)

  // 注册画布事件(预览模式下的基础功能)
  registerGraphBaseEvents()

  // 初始化左侧拖拽插件
  dnd = new Dnd({
    target: graph,
    getDragNode: node => node.clone({ keepId: true }),
    getDropNode: node => node.clone({ keepId: true })
  })
  // 初始化错误边管理器
  edgeCorrectionManager = new EdgeCorrectionManager(graph, workflowData, directContectNode)
  initNodesAndEdges(graph, workflowData.value)
  // 初始化分组管理器
  groupManager = new GroupManager(graph, workflowData)
  // 初始化迭代器管理器
  iteratorManager = new IteratorManager(graph, workflowData)
  // new CustomNode(graph, workflowData)
  actionPlugin = new WorkflowActionPlugin(graph, workflowData, {
    collapse,
    showMiniMap
  })
  // 初始化布局插件
  initLayout(graph)

  console.log('初始化完毕')
  setTimeout(() => {
    actionPlugin.handleFit()
    handleRegister()
  }, 100)
}

/**
 * 监听工作流数据变化
 * 当props.data更新时同步到本地状态
 */
watch(
  () => props.data,
  val => {
    workflowData.value = val
    initNodesAndEdges(graph, val)
    // graph.centerContent()
  }
)
// 监听点击的节点
watch(
  () => props.nodeId,
  val => {
    if (val) {
      selectNodeOnly(val + '')
    }
    // graph.centerContent()
  }
)
/**
 * 刷新属性面板
 */
function refreshPanel(nodeIds: string[] = []) {
  let nodeId = ''
  const selectNodeId = selectedNodeData.value?.id || ''
  if (nodeIds.length == 0 && selectNodeId) {
    nodeId = selectNodeId
  } else if (nodeIds.length == 1) {
    nodeId = nodeIds[0]
  } else {
    return
  }

  if (nodeId) {
    const found = workflowData.value.nodeList.find(n => n.id === nodeId)
    if (found) {
      clearSelection()
      graph.select(nodeId)
      selectedNodeData.value = found
    }
  }
}
// 撤销恢复的时候 同步处理 port的数据
// 这是一个比较蛋疼的处理方式 port的节点数据无法和node的节点数据同步
// 需要通过 portMap 来同步数据
// port的变更 影响颇大 需要谨慎处理
function handlePortChange(nodeId: string, portList: any) {
  const node = workflowData.value.nodeList.find(n => n.id === nodeId)
  // console.log('node===', node)
  if (node) {
    // 目前只有 if-else 会动态增减 outputData  后续如果要处理inputData 缓存里的数据也是有的
    const outportList = portList.filter((p: any) => p.group === 'out')
    const nodeDataOutput = node.outputData
    const portIdList = outportList.map((p: any) => p.id)
    const nodeDataIdList = nodeDataOutput.map((p: any) => p.portId)
    // 删除 portIdList 中 不在 nodeDataOutput 中的 port
    nodeDataOutput.forEach((p: any) => {
      if (!portIdList.includes(p.portId)) {
        node.outputData.splice(node.outputData.indexOf(p), 1)
      }
    })
    // 添加 portIdList 中 不在 nodeDataOutput 中的 port 且按照 portList 的顺序添加
    for (let i = 0; i < outportList.length; i++) {
      const port = outportList[i]
      if (!nodeDataIdList.includes(port.id)) {
        const portData = portMap.get(port.uniqueId)
        if (portData) {
          node.outputData.splice(i, 0, portData)
        }
      }
    }
    // 这个是撤销入桩点的处理
    const inportList = portList.filter((p: any) => p.group === 'in')
    const portInIdList = inportList.map((p: any) => p.id)
    // console.log('inportList==', portList, node.inputData, portInIdList)
    node.inputData.forEach(item => {
      if (portInIdList.includes(item.portId)) {
        item.sourceType = 'node'
      } else {
        item.sourceType = 'input'
      }
    })
    // 重新更新节点高度
    onNodeDataUpdate(node)
  }
}

let removeNodeListener = null

/**
 * 注册画布事件
 * @param graph X6画布实例
 */
function registerGraphBaseEvents() {
  // 监听历史记录变化
  graph.on('history:change', () => {
    canUndo.value = graph.canUndo()
    canRedo.value = graph.canRedo()
  })

  // 撤销恢复的 数据同步处理
  // 节点和边的更新 在 节点和边的 changed add remove 中 已经同步了
  // 这里只需要同步节点和边的标题 (todo: remark)
  graph.on('history:undo', ({ cmds }: { cmds: any[] }) => {
    cmds.forEach(cmd => {
      // 检查是否是节点名称(label/text)的变更
      if (cmd.options?.propertyPath === 'attrs/title/html') {
        const node = workflowData.value.nodeList.find(n => n.id === cmd.data.id)
        // 从 cmd.prev 中获取旧值
        const oldTitle = cmd.data?.prev?.attrs?.title?.text
        if (node && oldTitle) {
          node.title = oldTitle
        }
      } else if (cmd.event === 'cell:change:ports') {
        const portList = cmd.data?.prev?.ports?.items
        if (portList) {
          handlePortChange(cmd.data.id, portList)
        }
      } else if (cmd.event === 'cell:change:visible') {
        if (!cmd.data?.prev?.visible && cmd.data?.next?.visible == false) {
          const cell = graph.getCellById(cmd.data.id)
          if (cell) {
            cell.hide({ ignoreHistory: true })
            cell.show({ ignoreHistory: true })
          }
        }
      }
    })
  })

  graph.on('history:redo', ({ cmds }: { cmds: any[] }) => {
    cmds.forEach(cmd => {
      // 检查是否是节点名称(label/text)的变更
      if (cmd.options?.propertyPath === 'attrs/title/html') {
        const node = workflowData.value.nodeList.find(n => n.id === cmd.data.id)
        // 从 cmd.next 中获取新值
        const newTitle = cmd.data?.next?.attrs?.title?.text
        if (node && newTitle) {
          node.title = newTitle
        }
      } else if (cmd.event === 'cell:change:ports') {
        const portList = cmd.data?.next?.ports?.items
        if (portList) {
          handlePortChange(cmd.data.id, portList)
        }
      }
    })
  })

  // 画布空白点击事件
  graph.on('blank:click', () => {
    onNodeSelected(null)
    closeInfoPanel()
    emit('close-search-modal')
  })

  // 监听节点选中事件
  graph.on('node:click', ({ node }) => {
    const nodeId = node.id
    const found = workflowData.value.nodeList.find(n => n.id === nodeId)
    // console.log('20250817节点选中', nodeId, found)
    if (found) {
      onNodeSelected(found)
    }
    closeInfoPanel()
  })

  // 普通节点鼠标悬停事件
  graph.on('node:mouseenter', ({ node, view }) => {
    // 查询节点的连线情况以及输出桩点情况, 如果出桩多个，或者连线多个都不显示新增
    const outPortCount = node.getPorts().filter(e => e.id.includes('out')).length
    const outPortEdgeCount = graph.getEdges().filter(e => e.source.cell === node.id).length

    if (node.shape === 'customNode' || node.shape === 'iteratorNode') {
      if (node.attr('border/strokeOpacity') !== 1) {
        node.attr('border/strokeOpacity', 1, { ignoreHistory: true })
      }

      if (node.attr('copyButton/width') !== 28) {
        node.attr('copyButton/width', 28, { ignoreHistory: true })
        node.attr('delButton/width', 28, { ignoreHistory: true })
        if (outPortCount <= 1 && outPortEdgeCount <= 1) {
          node.attr('addButton/width', 28, { ignoreHistory: true })
        }
      }
    }

    // 注册 节点图标的鼠标悬停事件
    removeNodeListener = handlerEventListener(node, view)
  })

  // 普通节点鼠标离开事件
  graph.on('node:mouseleave', ({ node, view }) => {
    if (node.shape === 'customNode' || node.shape === 'iteratorNode') {
      if (node.attr('border/strokeOpacity') !== 0) {
        node.attr('border/strokeOpacity', 0, { ignoreHistory: true })
      }
      if (node.attr('copyButton/width') !== 1) {
        // window.setTimeout(() => {
        node.attr('copyButton/width', 1, { ignoreHistory: true })
        node.attr('delButton/width', 1, { ignoreHistory: true })
        node.attr('addButton/width', 1, { ignoreHistory: true })
        // }, 1000) // 延时隐藏按钮
      }
    }

    setTimeout(() => {
      removeNodeListener()
    }, 10)

    closeInfoPanel()
  })

  graph.on('node:customer_collapse', ({ node }: { node: any }) => {
    // console.log('node', node)
    node.toggleCollapse(workflowData.value)
  })

  // 监听节点变化
  graph.on('node:change:ports', ({ node }: { node: any }) => {
    if (node.shape === 'customNode') {
      // console.log('我是监听桩点变化')
      // 如果节点是矩形节点 则添加到节点列表中
      if (!workflowData.value.nodeList.find((n: any) => n.id === node.data.id)) {
        node.data.pos = { x: node.getPosition().x, y: node.getPosition().y }
        workflowData.value.nodeList.push(node.data)
      }
      // printLog(`=====================同步添加node数据 ${node.id}`)
    }
  })

  graph.on('node:added', ({ node }: { node: any }) => {
    if (node.shape === 'customNode') {
      // 如果节点是矩形节点 则添加到节点列表中
      if (!workflowData.value.nodeList.find((n: any) => n.id === node.data.id)) {
        node.data.pos = { x: node.getPosition().x, y: node.getPosition().y }
        workflowData.value.nodeList.push(node.data)
      }
      printLog(`=====================同步添加node数据 ${node.id}`)
    }
  })

  graph.on('node:change:position', ({ node }: { node: any }) => {
    // console.log('节点改变', node.id)
    if (node.shape === 'customNode') {
      const nodeId = node.id
      const position = node.position()
      const nodeData = workflowData.value.nodeList.find(n => n.id === nodeId)
      if (nodeData) {
        nodeData.pos = { x: position.x, y: position.y }
      }

      // 更新与该节点相连的所有边的样式
      const connectedEdges = graph.getConnectedEdges(node)
      connectedEdges.forEach((edge: any) => {
        updateEdgeConnectorBasedOnDistance(edge)
      })
    }
  })

  graph.on('node:removed', ({ node }: { node: any }) => {
    if (node.shape === 'customNode') {
      const nodeId = node.id
      const nodeData = workflowData.value.nodeList.find(n => n.id === nodeId)
      if (nodeData) {
        workflowData.value.nodeList.splice(workflowData.value.nodeList.indexOf(nodeData), 1)
      }
      printLog(`=====================同步删除node数据 ${node.id}`)
    }
    // 不是气泡框的节点被删除时，取消选中
    if (node.shape !== 'infoPanelNode') {
      onNodeSelected(null)
    }
  })

  graph.on('edge:added', ({ edge }: { edge: any }) => {
    // 虚拟边 不处理
    if (edge.id.startsWith('virtual_')) return

    const newEdge = {
      id: edge.id,
      type: 'data_flow',
      source: edge.getSourceCellId(),
      target: edge.getTargetCellId(),
      sourcePort: edge.getSourcePortId(),
      targetPort: edge.getTargetPortId()
    }
    if (!workflowData.value.edges.find(e => e.id === newEdge.id)) {
      workflowData.value.edges.push(newEdge)
      printLog(`=====================同步添加edge数据 ${newEdge.id}`)
    }

    // 如果连出边了 则清理源节点的 plus 显示
    const sourceNode = graph.getCellById(edge.getSourceCellId())
    if (sourceNode && sourceNode.shape === 'customNode') {
      sourceNode.clearPortCount()
    }

    // 添加这一行来根据距离更新连接线样式
    updateEdgeConnectorBasedOnDistance(edge)

    validateEdgeTypeAndSetColor(edge)
    refreshPanel()
  })

  graph.on('edge:removed', ({ edge }: { edge: any }) => {
    // 虚拟边 不处理
    if (edge.id.startsWith('virtual_')) return

    const sourceNodeId = edge.getSourceCellId()
    const sourcePortId = edge.getSourcePortId()
    const targetNodeId = edge.getTargetCellId()
    const idx = workflowData.value.edges.findIndex(e => e.id === edge.id)
    if (idx !== -1) {
      workflowData.value.edges.splice(idx, 1)
      printLog(`=====================同步删除edge数据 ${edge.id}`)
    }
    // 同步清理节点的数据
    let node = workflowData.value.nodeList.find(n => n.id === sourceNodeId)
    if (node) {
      const outputData = node.outputData.find(p => p.portId === sourcePortId)
      if (outputData && outputData?.value) {
        outputData.value = ''
      }
    }
    node = workflowData.value.nodeList.find(n => n.id === targetNodeId)
    if (node) {
      // 获取上游节点ID列表（包括条件节点的上游非条件节点）
      const upstreamNodeIds = findUpstreamNonConditionNodes(sourceNodeId, workflowData)

      // 清理 source是当前节点或其上游非条件节点的数据
      if (node.id == delPortNodeId) {
        node.inputData.forEach((inp: any) => {
          if (inp.source === sourceNodeId || upstreamNodeIds.includes(inp.source)) {
            inp.source = ''
          }
        })
      }
      // 如果下游节点是条件节点 则清理条件节点的后续节点
      if (node?.logicData?.logicType === LogicType.IFELSE) {
        workflowData.value.edges
          .filter(e => e.source === targetNodeId)
          ?.forEach(edge => {
            const tempNode = workflowData.value.nodeList.find(n => n.id === edge.target)
            if (tempNode) {
              tempNode.inputData.forEach((inp: any) => {
                if (inp.source === sourceNodeId || upstreamNodeIds.includes(inp.source)) {
                  inp.source = ''
                }
              })
            }
          })
      }
    }

    // 清理边相关状态
    edgeCorrectionManager.cleanupEdge(edge)
    refreshPanel()
  })

  graph.on('edge:mouseenter', ({ edge }: { edge: any }) => {
    // 虚拟边 不处理
    if (edge.id.startsWith('virtual_')) return

    edge.attr('line/strokeWidth', 3)
    // 添加箭头

    edge.addTools([
      {
        name: 'target-arrowhead',
        args: { attrs: { fill: edge.hasCorrectionText ? '#ff6b6b' : '#1890ff' } }
      },
      {
        name: 'button-remove',
        args: {
          distance: 0.5,
          size: 10
        }
      }
      // {
      //   name: 'button',
      //   args: {
      //     markup: [
      //       {
      //         tagName: 'circle',
      //         selector: 'button',
      //         attrs: {
      //           r: 10,
      //           fill: '#147FFA',
      //           cursor: 'pointer',
      //         },
      //       },
      //       {
      //         tagName: 'text',
      //         textContent: '+',
      //         selector: 'icon',
      //         attrs: {
      //           fill: 'white',
      //           fontSize: 20,
      //           textAnchor: 'middle',
      //           pointerEvents: 'none',
      //           y: '6px',
      //         },
      //       },
      //     ],
      //     distance: 0.5,
      //     onClick({cell, e}: any) {
      //       if(cell && cell.isEdge && cell.isEdge()){
      //         const edge = cell
      //         const sourceNodeId = edge.getSourceCellId()
      //         const sourcePortId = edge.getSourcePortId()
      //         const targetNodeId = edge.getTargetCellId()
      //         const targetPortId = edge.getTargetPortId()
      //         edgeCorrectionManager.searchTarget = {
      //           targetNodeId: targetNodeId,
      //           targetPortId: targetPortId,
      //           edgeId: edge.id
      //         }
      //         emit('show-search-modal', { x: e.clientX + 10, y: e.clientY, nodeId: sourceNodeId, portId: sourcePortId, fromEdgeAdd: true, fromBlankAdd: false })
      //       }
      //     },
      //   },
      // }
    ])
  })

  graph.on('edge:mouseleave', ({ edge }: { edge: any }) => {
    // 虚拟边 不处理
    if (edge.id.startsWith('virtual_')) return

    edge.attr('line/strokeWidth', 2)
    // 移除箭头
    edge.removeTools()
  })

  // 连接桩鼠标悬停事件
  graph.on('node:port:mouseenter', ({ node, port }: { node: any; port: any }) => {
    // console.log('连接桩鼠标悬停事件  mouseenter', node, port)
    // if (node && node.shape === 'customNode' && port && port.indexOf('out') != -1) {
    //   node.showHidePortPlus(port, true)
    // }
  })

  // 连接桩鼠标离开事件
  graph.on('node:port:mouseleave', ({ node, port }: { node: any; port: any }) => {
    // console.log('连接桩鼠标离开事件  mouseleave', node, port)
    // if (node && node.shape === 'customNode' && port && port.indexOf('out') != -1) {
    //   node.showHidePortPlus(port)
    // }
  })

  // 连接桩点击事件
  graph.on(
    'node:port:click',
    ({ node, port, x, y }: { node: any; port: any; x: number; y: number }) => {
      // if (node && node.shape === 'customNode' && port && port.indexOf('out') != -1) {
      //   const isSelect = node.showSearchCheck(port)
      //   if (isSelect) {
      //     // 显示搜索页面
      //     const clientCoords = graph.localToClient(x, y)
      //     emit('show-search-modal', { x: clientCoords.x + 10, y: clientCoords.y, nodeId: node.id, portId: port, fromEdgeAdd: false, fromBlankAdd: false })
      //     setTimeout(() => {
      //       clearSelection()
      //       onNodeSelected(null)
      //     }, 10);
      //   }
      // }
    }
  )
}

function registerGraphFullEvents() {
  // 监听空白区域双击事件
  graph.on('blank:dblclick', ({ e, x, y }) => {
    emit('show-search-modal', {
      x: e.clientX,
      y: e.clientY,
      nodeId: null,
      portId: null,
      fromEdgeAdd: false,
      fromBlankAdd: true,
      fromBlankX: x,
      fromBlankY: y
    })
  })

  function createNewNode(nodeData: WorkflowNode): Node {
    const newId = nodeIdFactory.next()
    // 创建新的节点数据
    const newNodeData: WorkflowNode = {
      ...nodeData,
      id: newId,
      pos: {
        x: nodeData.pos?.x || 0,
        y: (nodeData.pos?.y || 0) + 120
      },
      inputData: nodeData.inputData.map(input => ({
        ...input,
        source: input.sourceType === 'node' ? '' : input.source
      }))
    }

    // 使用NodeFactory创建X6节点
    const x6Node = createX6Node(newNodeData)
    return x6Node
  }
  // 复制节点事件
  graph.on('node:copy_mouseenter', ({ node, e }) => {
    let copiedNodeData: any[] = []
    e.stopPropagation()
    const selectedCells = [node]
    if (selectedCells.length === 0) {
      ElMessage.warning('请先选择要复制的节点')
      return
    }

    // 只复制节点，过滤掉边
    const selectedNodes = selectedCells.filter((cell: any) => cell.isNode && cell.isNode())

    if (selectedNodes.length === 0) {
      ElMessage.warning('请选择节点进行复制')
      return
    }

    try {
      let hasIterator = false
      selectedNodes.map((node: any) => {
        if (node.shape === 'iteratorNode') {
          hasIterator = true
        }
      })
      if (hasIterator) {
        iteratorManager.syncIteratorData()
      }

      // 保存原始节点数据
      copiedNodeData = selectedNodes.map((node: any) => {
        let nodeData
        if (node.shape === 'iteratorNode') {
          nodeData = iteratorManager.getIteratorData(node.id)
        } else {
          nodeData = node.data || {}
        }
        return {
          ...nodeData,
          pos: {
            x: node.getPosition().x,
            y: node.getPosition().y
          }
        }
      })

      // ElMessage.success(`成功复制 ${selectedNodes.length} 个节点`)
    } catch (error) {
      ElMessage.error('复制失败')
    }
    // 粘贴
    try {
      if (copiedNodeData.length === 0) {
        ElMessage.warning('剪贴板为空')
        return
      }
      graph.startBatch('keyboard-paste')
      // 根据原始数据重新生成节点
      copiedNodeData.forEach((nodeData: any) => {
        try {
          if (nodeData.logicData?.logicType === LogicType.ITERATOR) {
            // 迭代器 特殊处理
            // 1 先生成迭代器的子项
            const newChildList = []
            const oldChildList = []
            nodeData.children.forEach((childId: string) => {
              const childNode = graph.getCellById(childId)
              if (
                childNode &&
                childNode.data &&
                childNode.data.logicData?.logicType !== LogicType.ITERATOR_START
              ) {
                const x6Node = createNewNode(childNode.data)
                graph.addNode(x6Node)
                newChildList.push((x6Node as any)?.id || '')
                oldChildList.push(childId)
              }
            })
            // 2 再生成迭代器
            iteratorManager.copyIteratorData(nodeData, newChildList, oldChildList)
          } else {
            const x6Node = createNewNode(nodeData)
            // 添加到画布
            graph.addNode(x6Node)
          }
        } catch (error) {
          console.warn('重新生成节点失败:', error)
        }
      })

      graph.stopBatch('keyboard-paste')
      ElMessage.success(`复制成功`)
    } catch (error) {
      ElMessage.error('复制失败')
    }
  })

  // 删除节点事件
  graph.on('node:del_mouseenter', ({ node }) => {
    graph.removeCells([node])
    ElMessage.success(`已删除 1 个元素`)
  })

  // 添加节点事件 只存在一个源桩点，同时线也最多只有一条
  graph.on('node:add_mouseenter', event => {
    const { node, e } = event
    e.stopPropagation()

    const portId = node.getPorts().filter(e => e.id.includes('out'))[0].id
    const fromEdgeAdd = graph.getEdges().find(e => e.source.cell === node.id)

    if (fromEdgeAdd) {
      edgeCorrectionManager.searchTarget = {
        targetNodeId: fromEdgeAdd.target.cell,
        targetPortId: fromEdgeAdd.target.port,
        edgeId: fromEdgeAdd.id
      }
    }
    emit('show-search-modal', {
      x: e.clientX + 10,
      y: e.clientY,
      nodeId: node.id,
      portId: portId,
      fromEdgeAdd: !!fromEdgeAdd,
      fromBlankAdd: false
    })
  })

  graph.on('edge:connected', ({ edge }: { edge: any }) => {
    const edgeId = edge.id
    const newSource = edge.getSourceCellId()
    const newSourcePort = edge.getSourcePortId()
    const newTarget = edge.getTargetCellId()
    const newTargetPort = edge.getTargetPortId()
    const wfEdge = workflowData.value.edges.find((e: any) => e.id === edgeId)
    const oldTarget = wfEdge?.target
    const oldTargetNode = workflowData.value.nodeList.find((n: any) => n.id === oldTarget)
    const newTargetNode = workflowData.value.nodeList.find((n: any) => n.id === newTarget)
    // console.log('oldTargetNode', oldTargetNode, newTargetNode)
    // 获取上游节点ID列表（包括条件节点的上游非条件节点）
    const upstreamNodeIds = findUpstreamNonConditionNodes(newSource, workflowData)

    if (oldTargetNode && oldTargetNode.inputData) {
      oldTargetNode.inputData.forEach((inp: any) => {
        if (inp.source === newSource || upstreamNodeIds.includes(inp.source)) {
          inp.source = ''
        }
      })
    }

    if (
      newTargetNode &&
      newTargetNode.inputData &&
      !(newTargetNode.funcType === 'logic' && newTargetNode.logicData?.logicType === 'aggregate')
    ) {
      // 获取节点配置，确定连接的端口类型
      let targetParams: InputData[] = []
      targetParams = newTargetNode.inputData.filter((inp: any) => inp.sourceType === 'node')
      const index = Number(newTargetPort.split('_')[1])

      if (targetParams.length >= index) {
        targetParams[index - 1].source = upstreamNodeIds.length > 0 ? upstreamNodeIds[0] : newSource
      }
    }

    if (wfEdge) {
      wfEdge.source = newSource
      wfEdge.target = newTarget
      wfEdge.sourcePort = newSourcePort
      wfEdge.targetPort = newTargetPort
    }

    // 添加这一行来根据距离更新连接线样式
    updateEdgeConnectorBasedOnDistance(edge)

    // // 连接后进行类型验证并设置颜色
    validateEdgeTypeAndSetColor(edge)
    onNodeSelected(null)
  })
}

/**
 * 点击编辑后的注册剩余事件
 */
const handleRegister = () => {
  // 注册完整功能
  registerGraphFullEvents()
  // 初始化键盘插件
  initKeyboard(graph, groupManager, iteratorManager)
}

// 在文件中添加以下函数，用于根据节点距离设置连接线样式
function updateEdgeConnectorBasedOnDistance(edge: any) {
  const sourceCell = edge.getSourceCell()
  const targetCell = edge.getTargetCell()

  if (sourceCell && targetCell) {
    // 获取源节点和目标节点的位置及尺寸
    const sourceBBox = sourceCell.getBBox()
    const targetBBox = targetCell.getBBox()
    // console.log(sourceCell.size(), 'size')
    // console.log(targetCell.size(), 'size')
    // 计算两个节点中心点之间的距离
    const sourceCenterX = sourceBBox.center.x
    const sourceCenterY = sourceBBox.center.y
    const targetCenterX = targetBBox.center.x
    const targetCenterY = targetBBox.center.y

    const distance = Math.sqrt(
      Math.pow(targetCenterX - sourceCenterX, 2) + Math.pow(targetCenterY - sourceCenterY, 2)
    )
    // if (distance < 400) {
    //   edge.setRouter('normal')
    //   edge.setConnector('normal');
    // } else {
    //   edge.setRouter('manhattan')
    //   edge.setConnector('rounded', { radius: 30 });
    // }
    const sourceHeight = sourceCell.size().height
    const targetHeight = targetCell.size().height
    // 如果距离小于阈值（例如150像素），使用直线连接；否则使用曲线连接
    // 当前是水平有重叠
    if (targetCenterX - sourceCenterX < 400) {
      // 同时垂直有重叠
      // console.log('水平重叠距离小于300，使用直线连接', targetCenterY - sourceCenterY, (targetHeight / 2 + sourceHeight / 2))
      // console.log('===', targetBBox.height / 2 + sourceBBox.height / 2)
      if (Math.abs(targetCenterY - sourceCenterY) < targetHeight / 2 + sourceHeight / 2) {
        // console.log('垂直重叠距离小于300，使用直线连接')
        edge.setRouter('normal')
        edge.setConnector('normal')
      } else {
        edge.setRouter('manhattan')
        edge.setConnector('rounded', { radius: 30 })
      }
    } else {
      edge.setRouter('manhattan')
      edge.setConnector('rounded', { radius: 30 })
    }
  }
}

function printLog(msg: string) {
  if ((window as any).showDebug) {
    console.log(msg)
  }
}

/**
 * 验证边的类型兼容性并设置颜色
 * @param edge 边对象
 */
function validateEdgeTypeAndSetColor(edge: any) {
  if (edgeCorrectionManager) {
    edgeCorrectionManager.validateEdgeTypeAndSetColor(edge, isDecode.value)
  }
}

/**
 * 初始化节点和边
 * @param graph X6画布实例
 * @param data 工作流数据
 */
function initNodesAndEdges(graph: any, data: WorkflowData) {
  // console.log('data====', data)
  // 1. 解析生成节点
  graph.startBatch('init-nodes-and-edges')
  isDecode.value = true
  data.nodeList.forEach((node: any, _idx: number) => {
    if (node.logicData?.logicType === LogicType.ITERATOR) {
      return
    }
    const rectNode = createX6Node(node)
    graph.addNode(rectNode)
  })
  // 2. 需要先生成所有节点  再生成迭代器 确保子集节点可用
  if (iteratorManager) {
    iteratorManager.decodeIteratorData()
  }
  // 3. 解析生成边
  data.edges.forEach((edge: any, _idx: number) => {
    const targetPort = edge.targetPort || 'in_1'
    const sourcePort = edge.sourcePort || 'out_1'

    if (edge.source.length > 10 || edge.target.length > 10) {
      return
    }

    const x6Edge = graph.addEdge({
      id: edge.id,
      source: { cell: edge.source, port: sourcePort },
      target: { cell: edge.target, port: targetPort }
    })

    // 添加这一行来根据距离更新连接线样式
    updateEdgeConnectorBasedOnDistance(x6Edge)

    // 验证边的类型兼容性并设置颜色
    validateEdgeTypeAndSetColor(x6Edge)
  })
  // 4. 解析组合节点
  if (data.groupList.length > 0 && groupManager) {
    groupManager.decodeGroupData()
  }
  isDecode.value = false
  graph.stopBatch('init-nodes-and-edges')
}

/**
 * 添加提示
 */
const visible = ref(false)

const content = ref('')

const resetWorkflowData = (showMessage = true) => {
  workflowData.value = {
    id: workflowData.value.id,
    ruleName: workflowData.value.ruleName,
    nodeList: [],
    edges: [],
    groupList: [],
    lua: ''
  }
  selectedNodeData.value = null
  graph.clearCells()
  graph.cleanHistory()
  if (typeof nodeIdFactory !== 'undefined' && nodeIdFactory.reset) {
    nodeIdFactory.reset(1)
  }
  // 清理错误跟踪（已迁移到 EdgeCorrectionManager）
  showMessage && ElMessage.success('画布已清空')

  // 通知父组件数据已更新
  emit('update:workflow', workflowData.value)
}

/**
 * 获取函数ID列表
 * @param workflowData 工作流数据
 * @returns 函数ID列表
 */
function getFuncIdList(workflowData: WorkflowData) {
  const funcIdList = workflowData.nodeList
    .filter((n: any) => n.funcType === 'func')
    .map((n: any) => n.funcId)
  // 去重
  return [...new Set(funcIdList)]
}

/**
 * 获取函数节点
 * @param functionNodes 函数节点列表
 * @param allFuncId 函数ID列表
 * @returns 函数节点列表
 */
function getFunctionNodes(functionNodes: Map<string, FunctionNode>, allFuncId: string[]) {
  const funcNodes: FunctionNode[] = []
  allFuncId.forEach(id => {
    const funcNode = functionNodes.get(id)
    if (funcNode) {
      funcNodes.push(funcNode)
    }
  })
  return funcNodes
}

function checkValidate() {
  // 检查是否有未修复的边
  if (edgeCorrectionManager) {
    const unfixedEdges = edgeCorrectionManager.checkUnfixedEdges()
    if (unfixedEdges.length > 0) {
      ElMessage.error({
        message: h('div', h('div', '存在未修复的边，请先修复后再保存')),
        duration: 3000
      })
      return false
    }
  }

  return true
}

async function doSave() {
  if (!checkValidate()) return null
  // 验证工作流是否合法
  const validRst = validateWorkflow()
  if (!validRst) return null
  // 获取工作流数据
  const flowData = await getFlowData({ isGenerateTestLuaScript: false })
  if (!flowData) return null
  return flowData
}

async function getFlowData(options?: { isGenerateTestLuaScript?: boolean }) {
  const { isGenerateTestLuaScript = false } = options || {}
  const workFlowJson = workflowData.value
  const allFuncId = getFuncIdList(workFlowJson)
  const functionNodes = getFunctionNodes(props.functionNodes, allFuncId)
  if (functionNodes.length === 0) {
    console.log('函数配置数据未加载')
  }

  const { expressionLuaCodeMap, expressionParamArr } = await getLuaCodeMapByExpression(
    workflowData.value.nodeList
  )
  if (!expressionLuaCodeMap) return
  // 生成lua代码
  const luaCode = luaGenerator.generate(
    workflowData.value,
    functionNodes,
    isGenerateTestLuaScript,
    expressionLuaCodeMap
  )
  console.log(luaCode)
  return { luaCode, allFuncId, expressionParamArr }
}

/**
 * 保存工作流
 */
const handleSave = async () => {
  const flowData = await doSave()
  if (!flowData) return
  emit('show-save-modal', flowData)
}

const handleTest = async () => {
  // 验证节点数据完整性
  if (!checkValidate()) return
  // 验证工作流是否合法
  const validRst = validateWorkflow()
  if (!validRst) return
  // 获取工作流数据
  const flowData = await getFlowData({ isGenerateTestLuaScript: true })
  if (!flowData) return
  emit('test-lua', flowData.luaCode)
}

/**
 * 另存工作流
 */
const handleSaveAs = async () => {
  // 验证节点数据完整性
  const flowData = await doSave()
  if (!flowData) return
  // 将数据传递给父组件
  emit('save-as-data', flowData)
}

/**
 * 执行导入操作
 * @param importData 导入的数据
 */
const executeImport = (importData: any) => {
  try {
    // 先清空当前画布
    resetWorkflowData()

    // 更新工作流数据
    workflowData.value = {
      ...workflowData.value,
      nodeList: importData.nodeList || [],
      edges: importData.edges || [],
      groupList: importData.groupList || []
    }

    // 通知父组件数据已更新
    console.log('workflowData.value====', importData)
    emit('update:workflow', workflowData.value)

    ElMessage.success('工作流数据导入成功')
  } catch (error) {
    console.error('导入失败:', error)
    ElMessage.error('导入失败，请重试')
  }
}

/**
 * 开始拖拽预览
 * @param type 节点类型
 * @param item 节点数据
 * @param e 鼠标事件
 */
const startDragPreview = (item: BaseFunctionNodeType, e: MouseEvent) => {
  if (!graph || !dnd) return
  let nodeData = {
    ...JSON.parse(JSON.stringify(item.template)),
    id: nodeIdFactory.next()
  } as WorkflowNode
  // if (type === 'logic') {
  //   nodeData = createLogicNode(item.type, item.funcId)
  // } else {
  //   nodeData = createFuncNode(item)
  // }
  const rectNode = createX6Node(nodeData, true)
  dnd.start(rectNode, e)
}

/**
 * 同步节点端口和尺寸
 * 这里只处理新增out的情况，动态添加out port 重绘节点
 * @param node 节点对象
 * @param config 节点配置
 */
function syncNodePortsAndSize(node: any, config: any, type?: string) {
  graph.startBatch()
  node.setSize(config.width, config.height)
  // 记录现有的edges 这个部分数据 会在下面强制删除 port的时候  清空
  // console.log('config====', config)
  // console.log('cacheEdges====', node, JSON.parse(JSON.stringify(workflowData.value)))
  let cacheEdges = null
  if (type === 'in') {
    cacheEdges = workflowData.value.edges.filter((e: any) => e.target === node.id)
  } else {
    cacheEdges = workflowData.value.edges.filter((e: any) => e.source === node.id)
  }
  // 删除画布的边
  cacheEdges.forEach((edge: any) => {
    graph.removeEdge(edge.id)
  })
  // 筛选出所有的 out_N
  if (type === 'in') {
    // const cacheEdges = workflowData.value.edges.filter((e: any) => e.target === node.id)
    const existOutIds = node
      .getPorts()
      .filter((p: any) => p.group === 'in')
      .map((p: any) => p.id)
    // 删除现有的out port
    // console.log('existOutIds ======', existOutIds, node)
    existOutIds.forEach((id: string) => node.removePort(id))
    // 添加新的out port
    const newOutIds = []
    const tempIdMap = new Map<string, any>()
    config.ports.items
      .filter((p: any) => p.group === 'in')
      .forEach((p: any) => {
        // console.log('p=======', p)
        node.addPort(p)
        newOutIds.push(p.id)
        tempIdMap.set(p.id, p.uniqueId)
      })
    const nodeData = workflowData.value.nodeList.find(n => n.id === node.id)
    if (nodeData) {
      // 记录历史上边的数据
      // console.log('nodeData===记录历史边', nodeData, tempIdMap)
      nodeData.inputData.forEach((p: any) => {
        // console.log('map======', p.portId)
        const uniqueId = tempIdMap.get(p.portId)
        // console.log('uniqueId===', uniqueId)
        if (uniqueId && !portMap.has(uniqueId)) {
          portMap.set(uniqueId, p)
        }
      })
      // console.log('portMap====记录历史边', portMap)
    }
    // 重新绘制边 需要延帧确保节点更新完成
    setTimeout(() => {
      // console.log('cacheEdges====', cacheEdges)
      cacheEdges.forEach((edge: any) => {
        //只添加 port还存在的边
        // console.log(edge, 'edge.sourcePort', newOutIds, '===', !graph.getCellById(edge.id), newOutIds.includes(edge.sourcePort))
        if (!graph.getCellById(edge.id) && newOutIds.includes(edge.targetPort)) {
          graph.addEdge({
            id: edge.id,
            source: { cell: edge.source, port: edge.sourcePort },
            target: { cell: edge.target, port: edge.targetPort }
          })
        }
      })
      graph.stopBatch()
    }, 50)
  } else {
    const existOutIds = node
      .getPorts()
      .filter((p: any) => p.group === 'out')
      .map((p: any) => p.id)
    // 删除现有的out port
    existOutIds.forEach((id: string) => node.removePort(id))
    // 添加新的out port
    const newOutIds = []
    const tempIdMap = new Map<string, any>()
    config.ports.items
      .filter((p: any) => p.group === 'out')
      .forEach((p: any) => {
        node.addPort(p)
        newOutIds.push(p.id)
        tempIdMap.set(p.id, p.uniqueId)
      })
    const nodeData = workflowData.value.nodeList.find(n => n.id === node.id)
    if (nodeData) {
      // 记录历史上边的数据
      nodeData.outputData.forEach((p: any) => {
        const uniqueId = tempIdMap.get(p.portId)
        if (uniqueId && !portMap.has(uniqueId)) {
          portMap.set(uniqueId, p)
        }
      })
    }
    // 重新绘制边 需要延帧确保节点更新完成
    setTimeout(() => {
      cacheEdges.forEach((edge: any) => {
        //只添加 port还存在的边
        if (!graph.getCellById(edge.id) && newOutIds.includes(edge.sourcePort)) {
          graph.addEdge({
            id: edge.id,
            source: { cell: edge.source, port: edge.sourcePort },
            target: { cell: edge.target, port: edge.targetPort }
          })
        }
      })
      graph.stopBatch()
    }, 50)
  }
}

const portMap = new Map<string, any>()

// 添加端口数据
function addPortData(newData: any, nodeId: string) {
  const currentNode = workflowData.value.nodeList.find(n => n.id === nodeId)
  if (currentNode) {
    const len = currentNode.outputData.length
    currentNode.outputData.splice(len - 1, 0, newData)
    onNodeDataUpdate(currentNode)
  }
}
let delPortNodeId = null
// 删除端口数据
function removePortData(index: number, nodeId: string, type?: string) {
  const currentNode = workflowData.value.nodeList.find(n => n.id === nodeId)
  if (currentNode) {
    let removedData = null
    // 入参桩点不删除
    if (type === 'in') {
      removedData = currentNode.inputData
      // console.log('removedData===', removedData)
      // const node = graph.getCellById(currentNode.id)
      // if (node) {
      //   const port = node.getPort(removedData[0].portId)
      //   if (port) {
      //     portMap.set(port.uniqueId, removedData[0])
      //   }
      // }
    } else {
      removedData = currentNode.outputData.splice(index, 1)
      // console.log('removedData====', removedData, JSON.parse(JSON.stringify(workflowData.value.edges)))
      //
      workflowData.value.edges.forEach(i => {
        // console.log('===',i.sourcePort === removedData.portId, i.sourcePort, removedData.portId)
        if (i.sourcePort === removedData[0].portId) {
          delPortNodeId = i.target
        }
      })
      // console.log('delPortNodeId===', delPortNodeId)
      const node = graph.getCellById(currentNode.id)
      if (node) {
        const port = node.getPort(removedData[0].portId)
        if (port) {
          portMap.set(port.uniqueId, removedData[0])
        }
        // console.log('portMap====', portMap)
      }
    }
    onNodeDataUpdate(currentNode, type)
  }
}

/**
 * 处理节点数据更新 port
 * @param newData 新的节点数据
 */
function onNodeDataUpdate(newData: any, type?: string) {
  const node = graph.getCellById(newData.id)
  if (node) {
    node.setData(newData)
    const config = getCustomNodeConfig(newData) //重新计算节点配置
    syncNodePortsAndSize(node, config, type)
  } else {
    console.warn('[onNodeDataUpdate] 未找到节点', newData.id)
  }
}

/**
 * 处理节点数据更新 基础信息
 * @param nodeId 更新的id
 */
function onNodeBaseDataUpdate(nodeId: string) {
  const node = graph.getCellById(nodeId)
  const nodeInfo = workflowData.value.nodeList.find(n => n.id === nodeId)

  if (node && nodeInfo) {
    node.setData(nodeInfo)
    node.attr('title/text', nodeInfo.title)
  } else {
    console.error('Node or nodeInfo not found', nodeId)
  }
}

function directContectNode(node: BaseFunctionNodeType, data: any) {
  if (!graph) return
  graph.startBatch('directContectNode')

  const sourceNodeId = data.nodeId
  const sourcePortId = data.portId
  const fromEdgeAdd = data.fromEdgeAdd
  let nodeData = {
    ...JSON.parse(JSON.stringify(node.template)),
    id: nodeIdFactory.next()
  } as WorkflowNode
  // if (node.funcType === 'logic') {
  //   nodeData = createLogicNode(node.type, node.funcId)
  // } else {
  //   nodeData = createFuncNode(node)
  // }
  const x6Node = createX6Node(nodeData, true)

  if (x6Node) {
    if (nodeData?.logicData?.logicType === LogicType.ITERATOR) {
      // 需要模拟一下拖拽的流程 确保生成开始节点
      graph.addNode(x6Node, { stencil: 'v5' })
    } else {
      graph.addNode(x6Node)
    }
    if (data.fromBlankAdd) {
      x6Node.position(data.fromBlankX, data.fromBlankY)
      graph.stopBatch('directContectNode')
    } else {
      const sourceNode = graph.getCellById(sourceNodeId)
      const sourcePos = sourceNode.getPosition()
      const sourceSize = sourceNode.getSize()
      const targetPos = {
        x: sourcePos.x + sourceSize.width + 100,
        y: sourcePos.y
      }
      x6Node.position(targetPos.x, targetPos.y)
      setTimeout(() => {
        const edge = graph.addEdge({
          source: { cell: sourceNodeId, port: sourcePortId },
          target: { cell: x6Node.id, port: 'in_1' }
        })
        // 修复聚合函数在入桩是input的情况下无法自动连接问题
        if (nodeData.inputData[0].sourceType === 'input') {
          nodeData.inputData[0].sourceType = 'node'
          onNodeDataUpdate(nodeData, 'in')
        }
        if (fromEdgeAdd) {
          edgeCorrectionManager.addNodeBySearch(x6Node, edge)
        } else {
          edgeCorrectionManager.fixEdgeTargetNode(edge)
        }
        validateEdgeTypeAndSetColor(edge)
        const ndf = workflowData.value.nodeList.find(n => n.id === x6Node.id)
        if (ndf) {
          graph.select(x6Node)
          onNodeSelected(ndf)
        }
        graph.stopBatch('directContectNode')
      }, 100)
    }
  }
}

/**
 * 替换节点选中逻辑，选中节点时 emit('show-attr-panel', { nodeData })
 */
function onNodeSelected(nodeData: any) {
  emit('show-attr-panel', { nodeData })
}

/**
 * 清除节点选择状态
 * 用于在关闭属性面板后，重置选择状态，以便再次点击同一节点时能触发选择事件
 */
function clearSelection() {
  if (graph) {
    clearSelectionPlugin()
    graph.unselect()
  }
}

/**
 * 选中指定节点（仅选中，不触发属性面板）
 * @param nodeId 节点ID
 */
function selectNodeOnly(nodeId: string) {
  if (!graph) return
  forceNode(nodeId)
  onNodeSelected(null)
}

/**
 * 选中指定节点
 * @param nodeId 节点ID
 */
function forceNode(nodeId: string) {
  if (!graph) return
  clearSelection()
  // 查找并选中指定节点
  const node = graph.getCellById(nodeId)
  graph.select(node)
  if (node) {
    // 将画布视图移动到节点位置，让节点显示在画布中间偏左200px
    const containerRect = container.value?.getBoundingClientRect()
    if (containerRect) {
      // // 先居中节点
      graph.centerCell(node)
    }
  }
}

function syncData() {
  if (groupManager) {
    groupManager.syncGroupData()
  }
  if (iteratorManager) {
    iteratorManager.syncIteratorData()
  }
  // console.log('this.workflowData.value===', )
  workflowData.value.nodeList.forEach(iteratorData => {
    const iteratorNode = graph.getCellById(iteratorData.id) as any
    iteratorData.isCollapsed = iteratorNode.isCollapsed
  })
}

function getAvailableSourceOptions(node: any, param: any) {
  // console.log('getAvailableSourceOptions=====', node, param)
  if (!node || !param) return []

  const edges = workflowData.value.edges.filter(e => e.target === node.id)
  // console.log('edges===', edges, param)
  const options = []
  edges.map(e => {
    const curEdgeSourceId = e.source
    const sourceNode = workflowData.value.nodeList.find(n => n.id === curEdgeSourceId)
    // console.log('sourceNode===', sourceNode)
    if (!sourceNode) {
      const iteratorNodeId = iteratorManager.getStartNodeParentId(curEdgeSourceId)
      // 如果上游是迭代器的开始节点 则按迭代器的上游算
      if (iteratorNodeId !== -1) {
        // 获取迭代器的主迭代对象
        const mainNodeSource = iteratorManager.getIteratorMainSource(iteratorNodeId)
        // 获取迭代器的入边
        const IteratorEdges = workflowData.value.edges.filter(e => e.target === iteratorNodeId)
        for (const edge of IteratorEdges) {
          let itSourceNode = workflowData.value.nodeList.find(n => n.id === edge.source)
          if (!itSourceNode) return
          // 常规节点
          let edgeSource = itSourceNode.id
          // 条件节点 需要往上找
          if (
            itSourceNode.funcType === 'logic' &&
            itSourceNode.logicData.logicType === LogicType.IFELSE
          ) {
            const upstreamNodes = findUpstreamNodes(edge.source, true, workflowData, new Set())
            itSourceNode = upstreamNodes[0].node
            edgeSource = upstreamNodes[0].node.id
          }
          // 匹配的到主迭代器对象的source 那么就是当前迭代项的源数据
          if (mainNodeSource === edgeSource) {
            // 迭代子项 这里配合lua转换器的逻辑 如果选择的节点是父节点指定的迭代主体
            // 那么这里就将source 指向开始节点的id
            // lua代码生成器 会将开始节点默认接一下遍历的item 这样子节点 就能套用原有的通过source获取实际参数名的逻辑
            options.push({
              label: `${itSourceNode?.title || curEdgeSourceId} [迭代项]`,
              value: curEdgeSourceId,
              currentLabel: e.targetPort === param.portId ? param.attributes?.label : '',
              currentPort: e.targetPort,
              currentId: node.id,
              currentSource: e.source
            })
          } else {
            // 迭代的多个入参 也允许选择
            options.push({
              label: itSourceNode?.title || edgeSource,
              value: edgeSource,
              currentLabel: e.targetPort === param.portId ? param.attributes?.label : '',
              currentPort: e.targetPort,
              currentId: node.id,
              currentSource: e.source
            })
          }
        }
        return options
      }
      // 默认找不到就直接返回
      return
    }
    // 如果source 或 target 任意一个是logic节点  则继续往前找
    if (
      (sourceNode.funcType === 'logic' && sourceNode.logicData.logicType == LogicType.IFELSE) ||
      (node.funcType === 'logic' && node.logicData.logicType == LogicType.IFELSE)
    ) {
      // 递归查找所有上游节点
      const visited = new Set()
      const upstreamNodes = findUpstreamNodes(e.source, true, workflowData, visited)
      for (const { node: upNode, isFromCondition } of upstreamNodes) {
        options.push({
          label: isFromCondition
            ? `[条件]${upNode?.title || upNode.id}`
            : upNode?.title || upNode.id,
          value: upNode.id,
          currentLabel: e.targetPort === param.portId ? param.attributes?.label : '',
          currentPort: e.targetPort,
          currentId: node.id,
          currentSource: e.source
        })
      }
      return
    }
    // 强制校验 类型
    const outPort = sourceNode.outputData[0]
    // console.log('outPort====', e, param)
    if (outPort) {
      //table 类型 需要校验subType
      const sourceType = [param.type, param.subType]
      const targetType = [[outPort.type, outPort.subType]]
      if (WorkflowValidator.validateTypeCompatibility(sourceType, targetType)) {
        options.push({
          label: sourceNode?.title || e.source,
          value: e.source,
          // currentPort: e.targetPort,currentId:node.id,
          // currentSource: e.source === param.portId ? param.paramName : '',
          // currentSource: e.targetPort === param.portId ? e.source : '',
          currentId: e.targetPort === param.portId ? e.id : '',
          currentLabel: e.targetPort === param.portId ? param.attributes?.label : '',
          currentPort: e.targetPort,
          currentSource: e.source
        })
        // paramName可能是为空值的
      }
    }
  })
  return options
}

// 在方法体外部声明递归函数
function findUpstreamNodes(nodeId, isFromCondition, workflowData, visited) {
  if (visited.has(nodeId)) return []
  visited.add(nodeId)
  const nodeList = workflowData.value.nodeList || []
  const edges = workflowData.value.edges || []
  const node = nodeList.find(n => n.id === nodeId)
  if (!node) {
    const iteratorNodeId = iteratorManager.getStartNodeParentId(nodeId)
    if (iteratorNodeId !== -1) {
      const mainNodeSource = iteratorManager.getIteratorMainSource(iteratorNodeId)
      const mianIteratorNode = workflowData.value.nodeList.find(n => n.id === mainNodeSource)
      if (mianIteratorNode) {
        return [
          {
            node: { title: `${mianIteratorNode?.title || mainNodeSource} [迭代项]`, id: nodeId },
            isFromCondition: true
          }
        ]
      }
    }
    console.error('findUpstreamNodes 未找到节点', nodeId)
    return []
  }
  if (node.funcType === 'logic' && node.logicData?.logicType === 'ifelse') {
    // 递归查找所有连到该条件节点的上游节点
    const upstreamEdges = edges.filter(edge => edge.target === nodeId)
    let result = []
    for (const edge of upstreamEdges) {
      result = result.concat(findUpstreamNodes(edge.source, true, workflowData, visited))
    }
    return result
  } else {
    // 普通节点，终止递归
    return [{ node, isFromCondition }]
  }
}

const handlerEventListener = (node, view) => {
  const addIcon = view.container.querySelector('.x6-graph-pannable [event="node:add_mouseenter"]')
  const copyIcon = view.container.querySelector('.x6-graph-pannable [event="node:copy_mouseenter"]')
  const delIcon = view.container.querySelector('.x6-graph-pannable [event="node:del_mouseenter"]')
  const collapseIcon = view.container.querySelector(
    '.x6-graph-pannable [event="node:customer_collapse"]'
  )
  const titleIcon = view.container.querySelector(
    '.x6-graph-pannable [event="node:custom_titletip"]'
  )
  const infoIcon = view.container.querySelector('.x6-graph-pannable [event="node:info_mouseenter"]')

  const addFn = () => showInfoPanel(node, 'addButton', '新增节点')
  const copyFn = () => showInfoPanel(node, 'copyButton', '复制节点')
  const delFn = () => showInfoPanel(node, 'delButton', '删除节点')
  const collapseFn = () =>
    showInfoPanel(
      node,
      'foldButton',
      collapseIcon.getAttribute('xlink:href').includes('UnFold') ? '展开' : '折叠'
    )
  const titleFn = () => showInfoPanel(node, 'title', titleIcon.getAttribute('text'))
  const infoFn = () => showInfoPanel(node, 'infoButton', node.data.remark)

  addIcon?.addEventListener('mouseenter', addFn)
  addIcon?.addEventListener('mouseleave', closeInfoPanel)
  copyIcon?.addEventListener('mouseenter', copyFn)
  copyIcon?.addEventListener('mouseleave', closeInfoPanel)
  delIcon?.addEventListener('mouseenter', delFn)
  delIcon?.addEventListener('mouseleave', closeInfoPanel)
  collapseIcon?.addEventListener('mouseenter', collapseFn)
  collapseIcon?.addEventListener('mouseleave', closeInfoPanel)
  titleIcon?.addEventListener('mouseenter', titleFn)
  titleIcon?.addEventListener('mouseleave', closeInfoPanel)
  infoIcon?.addEventListener('mouseenter', infoFn)
  infoIcon?.addEventListener('mouseleave', closeInfoPanel)

  return () => {
    addIcon?.removeEventListener('mouseenter', addFn)
    addIcon?.removeEventListener('mouseleave', closeInfoPanel)
    copyIcon?.removeEventListener('mouseenter', copyFn)
    copyIcon?.removeEventListener('mouseleave', closeInfoPanel)
    delIcon?.removeEventListener('mouseenter', delFn)
    delIcon?.removeEventListener('mouseleave', closeInfoPanel)
    collapseIcon?.removeEventListener('mouseenter', collapseFn)
    collapseIcon?.removeEventListener('mouseleave', closeInfoPanel)
    titleIcon?.removeEventListener('mouseenter', titleFn)
    titleIcon?.removeEventListener('mouseleave', closeInfoPanel)
    infoIcon?.removeEventListener('mouseenter', infoFn)
    infoIcon?.removeEventListener('mouseleave', closeInfoPanel)
  }
}

/**
 * 信息展示面板相关函数
 */
function closeInfoPanel() {
  if (infoPanelNode.value) {
    graph.removeCell(infoPanelNode.value, { ignoreHistory: true })
    infoPanelNode.value = null
  }
}

/**
 * 显示信息面板
 */
function showInfoPanel(
  node: any,
  type: 'title' | 'remark' | 'addButton' | 'copyButton' | 'delButton' | 'foldButton' | 'infoButton',
  desc: string
) {
  // 如果已有信息面板，先移除
  if (infoPanelNode.value) {
    graph.removeCell(infoPanelNode.value)
    infoPanelNode.value = null
  }
  // 创建信息面板节点
  const infoPanel = createInfoPanelNode({})
  // 标题行的所有 默认都在线上
  let bool = infoPanel.setInfoContent({
    node,
    desc,
    refX: node.attrs[type].refX,
    refX2: node.attrs[type].refX2,
    refY: node.attrs[type].refY > 0 ? 0 : node.attrs[type].refY
  })
  if (bool) {
    // 添加到画布
    graph.addNode(infoPanel, { ignoreHistory: true })
    infoPanelNode.value = infoPanel
  }
}

const showValidationModal = ref(false)
const validationErrors = ref([])
/**
 * 关闭工作流验证错误弹窗
 */
function closeValidationModal() {
  showValidationModal.value = false
  validationErrors.value = []
}

/**
 * 处理验证错误弹窗中的节点选择
 */
function handleValidationNodeSelect(nodeId: string) {
  // 选中指定节点
  selectNodeOnly(nodeId)
}

defineExpose({
  handleFit: actionPlugin.handleFit,
  handleLayout: actionPlugin.handleLayout,
  resetWorkflowData,
  startDragPreview,
  addPortData,
  removePortData,
  onNodeBaseDataUpdate,
  directContectNode,
  clearSelection,
  forceNode,
  selectNodeOnly,
  syncData,
  getFlowData,
  handleSave,
  getAvailableSourceOptions
})

function validateWorkflow() {
  // 同步一次组合 迭代的数据 确保数据完整性
  syncData()

  const validator = new WorkflowValidator(workflowData.value)
  const result = validator.validate()
  if (!result.isValid) {
    onNodeSelected(null)
    validationErrors.value = result.errors
    // 显示验证错误弹窗
    showValidationModal.value = true
  } else {
    if (result.warnings.length > 0) {
      ElMessage.warning({
        message: h('div', [
          h('div', '工作流校验通过，但有警告信息'),
          h('div', { style: 'white-space: pre-line; margin-top: 8px;' }, result.warnings.join('\n'))
        ]),
        duration: 3000
      })
    } else {
      ElMessage.success('工作流校验通过')
    }
  }

  if (result.isValid) {
    // 如果校验通过，则关闭验证错误弹窗
    closeValidationModal()
  }
  return result.isValid
}

/**
 * 递归查找上游非条件节点
 * @param nodeId 起始节点ID
 * @param workflowData 工作流数据
 * @param visited 已访问节点集合
 * @returns 上游非条件节点ID列表
 */
function findUpstreamNonConditionNodes(nodeId: string, workflowData: any): string[] {
  const nodeList = workflowData.value.nodeList || []
  const edges = workflowData.value.edges || []
  const node = nodeList.find(n => n.id === nodeId)

  if (!node) return []

  if (node.funcType === 'logic' && node.logicData?.logicType === 'ifelse') {
    // 递归查找所有连到该条件节点的上游节点
    const upstreamEdges = edges.filter(edge => edge.target === nodeId)
    let result: string[] = []
    for (const edge of upstreamEdges) {
      result = result.concat(findUpstreamNonConditionNodes(edge.source, workflowData))
    }
    return result
  } else {
    // 普通节点，返回当前节点ID
    return [nodeId]
  }
}
</script>

<style scoped lang="scss">
/* 工作流编辑器外层容器 */
.workflow-editor-outer {
  width: 100%;
  height: 100%;
  position: relative;
}

/* 工作流编辑器主体 */
.workflow-editor {
  width: 100%;
  height: 100%;
  position: relative;
  background: #fff;
  overflow: hidden;
}

/* 画布容器 */
.graph-container {
  width: 100%;
  height: 100%;
  position: relative;
  :deep(.snapline) {
    border-color: #1890ff;
    border-style: dashed;
    .x6-widget-snapline-vertical,
    .x6-widget-snapline-horizontal {
      stroke: #1890ff;
      stroke-width: 1px;
      stroke-dasharray: 3, 3;
    }
  }
  :deep(.x6-port-in) {
    .v-line:last-child {
      font-size: 13px;
      fill: #e8c38e;
    }
  }
  :deep(.x6-port-out) {
    .v-line:last-child {
      font-size: 13px;
      fill: #e8c38e;
    }
  }
}

/* 小地图容器 */
.minimap-container {
  position: absolute;
  right: 20px;
  bottom: 20px;
  width: 200px;
  height: 150px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

/* 工具栏 */
.canvas-actions {
  position: absolute;
  left: 50%;
  bottom: 10px;
  transform: translateX(-50%);
  z-index: 100;
  background: none;
  border: none;
  box-shadow: none;
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 4px;
  border-radius: 4px;
  background: #fff;
  svg {
    cursor: pointer;
  }
}

.workflow-actions {
  position: absolute;
  right: 10px;
  top: 10px;
  display: flex;
  gap: 10px;
  z-index: 100;
  //height: 64px;
  //line-height: 64px;
  padding: 4px;
  border-radius: 4px;
  background: #fff;
  div {
    cursor: pointer;
    display: flex;
    align-items: center;
  }
}

/* 属性面板抽屉 */
.custom-drawer-panel {
  position: absolute;
  right: 0;
  top: 0;
  width: 300px;
  height: 100%;
  background: #fff;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  padding: 20px;
  box-sizing: border-box;
}

/* 属性面板标题 */
.drawer-title {
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 20px;
  color: #333;
}

.toolbar {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 100;
  display: flex;
  gap: 10px;
  background: white;
  padding: 10px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

/* 规则名展示区：左下角绝对定位，风格与工具栏协调 */
.rule-name-indicator {
  position: absolute;
  left: 20px;
  bottom: 8px;
  z-index: 110;
  background: none;
  border-radius: 0;
  box-shadow: none;
  padding: 0;
  font-size: 12px;
  color: #999;
  font-weight: 500;
  pointer-events: none;
  user-select: none;
}

.rule-status {
  position: absolute;
  left: 20px;
  bottom: 28px;
  z-index: 110;
  background: none;
  border-radius: 0;
  box-shadow: none;
  padding: 0;
  font-size: 24px;
  color: #999;
  font-weight: 500;
  pointer-events: none;
  user-select: none;
}

.ungroup-btn {
  width: 20px !important;
  height: 20px !important;
  padding: 0 !important;
  border: 1px solid #d9d9d9 !important;
  background: rgba(255, 255, 255, 0.9) !important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  transition: all 0.3s ease !important;
}

.ungroup-btn:hover {
  border-color: #ff4d4f !important;
  color: #ff4d4f !important;
  transform: scale(1.1) !important;
}

.ungroup-btn-inner {
  font-size: 14px;
  line-height: 1;
  color: inherit;
}

/* 滚动条样式  */
.table-container::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
.table-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}
.table-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}
.table-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 确认框样式 */
:global(.decision-table-confirm-dialog) {
  z-index: 10000 !important;
}
:global(.decision-table-confirm-dialog .el-message-box) {
  z-index: 10000 !important;
}

/* 创建节点样式 */
.common-tip {
  max-width: 300px;
  color: #fff;
  border: 1px solid #303133;
  background: #303133;
  border-radius: 4px;
  padding: 5px 11px;
  z-index: 100;
  position: absolute;
  left: -1000px;
  top: -1000px;
  font-size: 13px;
  &:before {
    content: '';
    position: absolute;
    bottom: -5px;
    width: 10px;
    height: 10px;
    background: #303133;
    transform: rotate(45deg);
  }
}

.x6-tiptip {
  &:before {
    content: '';
    position: absolute;
    left: -5px;
    top: 10px;
    width: 10px;
    height: 10px;
    background: #303133;
    transform: rotate(45deg);
  }
}
</style>
