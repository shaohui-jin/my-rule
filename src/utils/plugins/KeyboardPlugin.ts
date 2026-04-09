import { Keyboard } from '@antv/x6'
import type { Graph } from '@antv/x6'
import { ElMessage, ElMessageBox } from 'element-plus'
import { createNewNode } from '@/utils/factory/NodeFactory'
import { type WorkflowData } from '@/types/workflow'
import type { GroupManager } from '@/utils/manager/GroupManager'
import { unref, Ref } from 'vue'
import nodeIdFactory from '@/utils/factory/NodeIdFactory'
import { EmitFn } from '@vue/runtime-core'

// 全局变量保存复制的原始数据
let copiedNodeData: any[] = []

/** 画布键盘操作标识（batch、日志、配置等） */
export const KEYBOARD = {
  UNDO: 'undo',
  REDO: 'redo',
  DELETE: 'delete',
  COPY: 'copy',
  PASTE: 'paste',
  GROUP: 'group',
  UNGROUP: 'ungroup',
  CLEAR: 'clear'
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
  [KEYBOARD.CLEAR]: 'ctrl+delete'
} as const satisfies Record<KeyboardAction, KeyboardBinding>

export type KeyboardKeyId = keyof typeof KeyboardKey

function toBindKey(binding: KeyboardBinding): string | string[] {
  return typeof binding === 'string' ? binding : [...binding]
}

export function registerKeyboardPlugins(
  graph: Graph,
  groupManager: GroupManager,
  workflowData: Ref<WorkflowData>,
  selectedNodeData: Ref<any>,
  emit: EmitFn
) {
  const keyboard = new Keyboard({
    enabled: true,
    global: false
  })
  graph.use(keyboard)
  // 撤销操作
  graph.bindKey(toBindKey(KeyboardKey[KEYBOARD.UNDO]), () => {
    graph.canUndo() && graph.undo()
  })
  // 重做操作
  graph.bindKey(toBindKey(KeyboardKey[KEYBOARD.REDO]), () => {
    graph.canRedo() &&   graph.redo()
  })
  // 删除操作
  graph.bindKey(toBindKey(KeyboardKey[KEYBOARD.DELETE]), () => {
    const selectedCells = graph.getSelectedCells()
    if (selectedCells.length > 0) {
      graph.removeCells(selectedCells)
      ElMessage.success(`已删除 ${selectedCells.length} 个元素`)
    }
  })
  // 复制操作
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
  // 粘贴操作
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
          graph.addNode(x6Node)
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
  graph.bindKey(toBindKey(KeyboardKey[KEYBOARD.GROUP]), () => {
    const selectedCells = graph.getSelectedCells()
    const selectedNodes = selectedCells.filter((cell: any) => cell.isNode && cell.isNode()) as any[]
    groupManager.createGroup(selectedNodes)
  })
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

  // 清空画布
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
  return keyboard
}
