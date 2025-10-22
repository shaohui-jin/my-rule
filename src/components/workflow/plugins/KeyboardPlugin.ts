import { Keyboard } from '@antv/x6-plugin-keyboard'
import type { Graph } from '@antv/x6'
import { ElMessage } from 'element-plus'
import { nodeIdFactory } from '@/utils/workflow/NodeIdFactory'
import { createX6Node } from '@/utils/workflow/NodeFactory'
import { LogicType, type WorkflowData, WorkflowNode } from '@/type/workflow'
import type { GroupManager } from '@/utils/workflow/GroupManager'
import { IteratorManager } from '@/utils/workflow/IteratorManager'
import { unref } from 'vue'

// 全局变量保存复制的原始数据
let copiedNodeData: any[] = []

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

export function initKeyboard(
  graph: Graph,
  groupManager?: GroupManager,
  iteratorManager?: IteratorManager,
  workflowData?: WorkflowData
) {
  const keyboard = new Keyboard({
    enabled: true,
    global: false
  })
  graph.use(keyboard)
  // 撤销操作
  graph.bindKey('ctrl+z', () => {
    if (graph.canUndo()) {
      graph.undo()
    }
  })
  // 重做操作
  graph.bindKey('ctrl+y', () => {
    if (graph.canRedo()) {
      graph.redo()
    }
  })
  // 删除操作
  graph.bindKey('delete', () => {
    const selectedCells = graph.getSelectedCells()
    if (selectedCells.length > 0) {
      // 检查是否包含迭代器开始节点
      const hasIteratorStartNode = selectedCells.some(
        (cell: any) => cell.isNode && cell.data?.logicData?.logicType === 'iterator_start'
      )

      if (hasIteratorStartNode) {
        ElMessage.warning('迭代器的开始节点不允许删除')
        return
      }

      graph.removeCells(selectedCells)
      ElMessage.success(`已删除 ${selectedCells.length} 个元素`)
    }
  })
  // 复制操作
  graph.bindKey(['ctrl+c', 'cmd+c'], () => {
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

      ElMessage.success(`成功复制 ${selectedNodes.length} 个节点`)
    } catch (error) {
      ElMessage.error('复制失败')
    }
  })
  // 粘贴操作
  graph.bindKey(['ctrl+v', 'cmd+v'], () => {
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
      ElMessage.success(`粘贴成功`)
    } catch (error) {
      ElMessage.error('粘贴失败')
    }
  })

  // 分组操作
  if (groupManager) {
    graph.bindKey('g', () => {
      const selectedCells = graph.getSelectedCells()
      const selectedNodes = selectedCells.filter(
        (cell: any) => cell.isNode && cell.isNode()
      ) as any[]
      groupManager.createGroup(selectedNodes)
    })
    graph.bindKey('ctrl+g', (e) => {
      e.preventDefault()
      const selectedCells = graph.getSelectedCells()
      const selectedNodes = selectedCells.find(
        (cell: any) => cell.isNode && cell.isNode()
      ) as any
      const _workflowData = unref(workflowData)
      const has = _workflowData.groupList.find(e => e.id === selectedNodes.id)
      if (has) {
        groupManager.ungroup(selectedNodes)
      } else {
        ElMessage.warning('无法取消非分组对象')
      }
    })
  }

  return keyboard
}
