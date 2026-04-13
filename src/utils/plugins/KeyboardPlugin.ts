import { Keyboard } from '@antv/x6'
import type { Graph } from '@antv/x6'
import { ElMessage, ElMessageBox } from 'element-plus'
import { createNewNode } from '@/utils/factory/NodeFactory'
import { type WorkflowData } from '@/types/workflow'
import type { GroupManager } from '@/utils/manager/GroupManager'
import { unref, Ref, nextTick} from 'vue'
import nodeIdFactory from '@/utils/factory/NodeIdFactory'
import { EmitFn } from '@vue/runtime-core'
import {Node, type NodeMetadata} from "@antv/x6/src/model";
import * as dagre from 'dagre'

type  KeyboardPlugin = {
  graphData: {
    graph: Graph,
    groupManager: GroupManager,
  },
  workflowData: {
    workflowData: Ref<WorkflowData>,
    selectedNodeData: Ref<any>,
    showMiniMap: Ref<boolean>,
  },
  workflowFn: {
    handleTest: Function,
  },
  emit: EmitFn
}

// 全局变量保存复制的原始数据
let copiedNodeData: any[] = []
let collapse = false

/** 画布键盘操作标识（batch、日志、配置等） */
export const KEYBOARD = {
  UNDO: 'undo',
  REDO: 'redo',
  DELETE: 'delete',
  COPY: 'copy',
  PASTE: 'paste',
  GROUP: 'group',
  UNGROUP: 'ungroup',
  CLEAR: 'clear',
  IMPORT: 'import',
  EXPORT: 'export',
  TEST: 'test',
  COLLAPSE: 'collapse',
  FIT: 'fit',
  LAYOUT: 'layout',
  BROWSING: 'browsing',
} as const

export type KeyboardAction = (typeof KEYBOARD)[keyof typeof KEYBOARD]

/** 单键或多键（Win ctrl / Mac cmd） */
export type KeyboardBinding = string | readonly string[]

/** 以操作 id（KEYBOARD 的值）为键，供 bindKey / triggerKey 使用：KeyboardKey[KEYBOARD.UNDO] */
export const KeyboardKey = {
  [KEYBOARD.UNDO]: 'ctrl+z',
  [KEYBOARD.REDO]: 'ctrl+y',
  [KEYBOARD.DELETE]: 'delete',
  [KEYBOARD.COPY]: ['ctrl+c', 'cmd+c'] as const,
  [KEYBOARD.PASTE]: ['ctrl+v', 'cmd+v'] as const,
  [KEYBOARD.GROUP]: 'g',
  [KEYBOARD.UNGROUP]: 'ctrl+g',
  [KEYBOARD.CLEAR]: 'ctrl+delete',
  [KEYBOARD.IMPORT]: 'i',
  [KEYBOARD.EXPORT]: 'o',
  [KEYBOARD.TEST]: 't' ,
  [KEYBOARD.COLLAPSE]: '1' ,
  [KEYBOARD.FIT]: '2' ,
  [KEYBOARD.LAYOUT]: '3' ,
  [KEYBOARD.BROWSING]: '4' ,
} as const satisfies Record<KeyboardAction, KeyboardBinding>

export type KeyboardKeyId = keyof typeof KeyboardKey

function toBindKey(binding: KeyboardBinding): string | string[] {
  return typeof binding === 'string' ? binding : [...binding]
}

export function registerKeyboardPlugins({
  graphData: {
    graph,
    groupManager,
  },
  workflowData: {
    workflowData,
    selectedNodeData,
    showMiniMap
  },
  workflowFn: {
    handleTest
  },
  emit
} : KeyboardPlugin) {
  const keyboard = new Keyboard({
    enabled: true,
    global: false
  })
  graph.use(keyboard)

  // 1 — 一键折叠/展开
  graph.bindKey(toBindKey(KeyboardKey[KEYBOARD.COLLAPSE]), () => {
    let nodeList = workflowData.value.nodeList
    graph.startBatch('collapse-nodes-and-edges')
    // 获取节点的cell信息，同时过滤掉迭代的子项 以及 折叠状态相同的cell
    const cellList = nodeList
      .map(node => {
        return graph.getCellById(node.id)
      })
      .filter(cell => !cell.parent)
      .filter(cell => cell.isCollapsed === !collapse)
    cellList.forEach(cell => {
      cell.toggleCollapse()
    })
    graph.stopBatch('collapse-nodes-and-edges')
    collapse = !collapse
  })
  // 2 — 适应视图
  graph.bindKey(toBindKey(KeyboardKey[KEYBOARD.FIT]), () => {
    graph.zoomToFit({ maxScale: 1 })
  })
  // 3 — 一键排列
  graph.bindKey(toBindKey(KeyboardKey[KEYBOARD.LAYOUT]), () => {
    layout(graph)
    // 布局后同步所有节点位置到全局数据
    setTimeout(() => {
      graph.getNodes().forEach((node: any) => {
        const nodeId = node.id
        const position = node.position()
        const nodeData = workflowData.value.nodeList.find(n => n.id === nodeId)
        if (nodeData) {
          nodeData.pos = { x: position.x, y: position.y }
        }
      })
    }, 100)
  })
  // 4 — 视图浏览（小地图开关）
  graph.bindKey(toBindKey(KeyboardKey[KEYBOARD.BROWSING]), () => {
    showMiniMap.value = !showMiniMap.value
  })

  // ctrl+z — 撤销
  graph.bindKey(toBindKey(KeyboardKey[KEYBOARD.UNDO]), () => {
    graph.canUndo() && graph.undo()
  })
  // ctrl+y — 重做
  graph.bindKey(toBindKey(KeyboardKey[KEYBOARD.REDO]), () => {
    graph.canRedo() &&   graph.redo()
  })
  // delete — 删除选中
  graph.bindKey(toBindKey(KeyboardKey[KEYBOARD.DELETE]), () => {
    const selectedCells = graph.getSelectedCells()
    if (selectedCells.length > 0) {
      graph.removeCells(selectedCells)
      ElMessage.success(`已删除 ${selectedCells.length} 个元素`)
    }
  })
  // ctrl+c / cmd+c — 复制节点
  graph.bindKey(toBindKey(KeyboardKey[KEYBOARD.COPY]), () => {
    const selectedCells = graph.getSelectedCells()
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
      // 保存原始节点数据
      copiedNodeData = selectedNodes.map((node: any) => {
        let nodeData = node.data || {}
        return {
          ...nodeData,
          pos: {
            x: node.getPosition().x,
            y: node.getPosition().y
          }
        }
      })

      ElMessage.success(`成功复制 ${selectedNodes.length} 个节点`)
    } catch (error) {
      ElMessage.error('复制失败')
    }
  })
  // ctrl+v / cmd+v — 粘贴节点
  graph.bindKey(toBindKey(KeyboardKey[KEYBOARD.PASTE]), () => {
    try {
      if (copiedNodeData.length === 0) {
        ElMessage.warning('剪贴板为空')
        return
      }
      graph.startBatch('keyboard-paste')
      // 根据原始数据重新生成节点
      copiedNodeData.forEach((nodeData: any) => {
        try {
          const x6Node = createNewNode(nodeData)
          // 添加到画布
          graph.addNode(x6Node as Node)
        } catch (error) {
          console.warn('重新生成节点失败:', error)
        }
      })

      graph.stopBatch('keyboard-paste')
      ElMessage.success(`粘贴成功`)
    } catch (error) {
      ElMessage.error('粘贴失败')
    }
  })

  // g — 分组
  graph.bindKey(toBindKey(KeyboardKey[KEYBOARD.GROUP]), () => {
    const selectedCells = graph.getSelectedCells()
    const selectedNodes = selectedCells.filter((cell: any) => cell.isNode && cell.isNode()) as any[]
    groupManager.createGroup(selectedNodes)
  })
  // ctrl+g — 取消分组
  graph.bindKey(toBindKey(KeyboardKey[KEYBOARD.UNGROUP]), e => {
    e.preventDefault()
    const selectedCells = graph.getSelectedCells()
    const selectedNodes = selectedCells.find((cell: any) => cell.isNode && cell.isNode()) as any
    const _workflowData = unref(workflowData)
    const has = _workflowData.groupList.find(e => e.id === selectedNodes.id)
    if (has) {
      groupManager.ungroup(selectedNodes)
    } else {
      ElMessage.warning('无法取消非分组对象')
    }
  })

  // ctrl+delete — 清空画布
  graph.bindKey(toBindKey(KeyboardKey[KEYBOARD.CLEAR]), () => {
    ElMessageBox.confirm('画布将清空，是否继续？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      workflowData.value = {
        id: workflowData.value.id,
        ruleName: workflowData.value.ruleName,
        nodeList: [],
        edges: [],
        groupList: [],
        lua: ''
      }
      graph.clearCells()
      graph.cleanHistory()
      selectedNodeData.value = null
      if (typeof nodeIdFactory !== 'undefined' && nodeIdFactory.reset) {
        nodeIdFactory.reset(1)
      }
      ElMessage.success('画布已清空')
      // 通知父组件数据已更新
      emit('update:workflow', workflowData.value)
    })
  })

  // i — 导入工作流
  graph.bindKey(toBindKey(KeyboardKey[KEYBOARD.IMPORT]), e => {
    e.preventDefault()
    // 创建文件输入元素
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.style.display = 'none'

    input.onchange = async event => {
      const file = (event.target as HTMLInputElement).files?.[0]
      if (!file) return

      try {
        const text = await file.text()
        const importData = JSON.parse(text)

        // 验证导入数据的格式
        if (!importData.nodeList || !importData.edges) {
          ElMessage.error('导入的文件格式不正确，请选择正确的工作流文件')
          return
        }

        // 显示确认对话框
        ElMessageBox.confirm('导入将清空当前画布数据，是否继续？', '导入确认', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => {
            try {
              // 先清空当前画布
              graph.triggerKey(KeyboardKey[KEYBOARD.CLEAR], 'keydown')

              // 更新工作流数据
              workflowData.value = {
                ...workflowData.value,
                nodeList:  [],
                edges: [],
                groupList:  []
              }
              // 通知父组件数据已更新
              console.log('workflowData.value====', importData)
              emit('update:workflow', workflowData.value)

              ElMessage.success('工作流数据导入成功')
            } catch (error) {
              console.error('导入失败:', error)
              ElMessage.error('导入失败，请重试')
            }
          })
          .catch(() => {
            // 用户取消
            ElMessage.info('已取消导入')
          })
      } catch (error) {
        console.error('解析文件失败:', error)
        ElMessage.error('文件解析失败，请检查文件格式')
      }

      // 清理文件输入元素
      document.body.removeChild(input)
    }

    // 触发文件选择
    document.body.appendChild(input)
    input.click()
  })

  // o — 导出工作流
  graph.bindKey(toBindKey(KeyboardKey[KEYBOARD.EXPORT]), e => {
    e.preventDefault()
    try {
      // 准备导出的数据
      if (groupManager) {
        groupManager.syncGroupData()
      }
      // console.log('this.workflowData.value===', )
      workflowData.value.nodeList.forEach(node => {
        const _node = graph.getCellById(node.id) as any
        node.isCollapsed = _node.isCollapsed
      })

      const exportData = {
        ...workflowData.value,
        // 确保不包含敏感信息
        id: undefined,
        lua: undefined
      }

      // 创建Blob对象
      const dataStr = JSON.stringify(exportData, null, 2)
      const blob = new Blob([dataStr], { type: 'application/json' })

      // 创建下载链接
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `workflow_${workflowData.value.ruleName || 'unnamed'}_${new Date()
        .toISOString()
        .slice(0, 10)}.json`

      // 触发下载
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // 清理URL对象
      URL.revokeObjectURL(url)

      ElMessage.success('工作流数据导出成功')
    } catch (error) {
      console.error('导出失败:', error)
      ElMessage.error('导出失败，请重试')
    }
  })

  // t — 测试
  graph.bindKey(toBindKey(KeyboardKey[KEYBOARD.TEST]), e => {
    e.preventDefault()
    handleTest()
  })

  return keyboard
}

export const layout = (graph: Graph) => {
  const layoutG = new dagre.graphlib.Graph()
  layoutG.setGraph({
    rankdir: 'LR', // 从左到右布局
    nodesep: 120, // 节点间距
    ranksep: 80 // 层级间距
  })
  layoutG.setDefaultEdgeLabel(() => ({}))

  let nodes = graph.getNodes()
  const edges = graph.getEdges()

  nodes = nodes.filter((node: any) => !node.parent)

  // 添加节点到dagre图
  nodes.forEach((node: any) => {
    layoutG.setNode(node.id, {
      width: node.getSize().width,
      height: node.getSize().height
    })
  })

  // 添加边到dagre图
  edges.forEach((edge: any) => {
    layoutG.setEdge(edge.getSourceCellId(), edge.getTargetCellId())
  })

  // 计算布局
  dagre.layout(layoutG)

  graph.startBatch('layout')

  // 应用布局结果
  nodes.forEach((node: any) => {
    const layoutNode = layoutG.node(node.id)
    if (node && layoutNode) {
      const tempPosition = node.getPosition()
      node.setPosition(layoutNode.x - layoutNode.width / 2, layoutNode.y - layoutNode.height / 2)
    }
  })
  // 布局后自动居中画布内容
  graph.centerContent()
  graph.stopBatch('layout')
}
