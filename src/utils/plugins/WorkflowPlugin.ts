import { nextTick, Ref, ref } from 'vue'
import { LogicType, type WorkflowData } from '@/type/workflow'
import {
  DEVICE_PIXEL_RATIO_STEP,
  MAX_DEVICE_PIXEL_RATIO,
  MIN_DEVICE_PIXEL_RATIO
} from '@/config/workflow'
import { Graph } from '@antv/x6'
import { Reactive } from '@vue/reactivity'
import { isIterator } from '@/utils/type/node'
import { ElMessage, ElMessageBox } from 'element-plus'

export type WorkflowFunction = {
  // 折叠展开
  handleCollapse: (bool: boolean) => void
  // 切换视图浏览
  handleShowMiniMap: () => void
  // 适应视图
  handleFit: () => void
  // 一键布局功能
  handleLayout: () => void
  // 撤销操作
  handleUndo: () => void
  // 重做操作
  handleRedo: () => void
  // 清空画布
  handleNew: (after: () => void) => void
  // 导入工作流数据
  handleImport: (after: (any) => void) => void
  // 导出工作流数据
  handleExport: (before: () => void) => void
}

export const defaultWorkflowFunction: WorkflowFunction = {
  handleCollapse: (bool: boolean) => undefined,
  handleShowMiniMap: () => undefined,
  handleFit: () => undefined,
  handleLayout: () => undefined,
  handleUndo: () => undefined,
  handleRedo: () => undefined,
  handleNew: (after: () => void) => undefined,
  handleImport: (after: (any) => void) => undefined,
  handleExport: (before: () => void) => undefined
}

export class WorkflowActionPlugin {
  graph: Graph
  workflowData: Ref<WorkflowData>
  showMiniMap: Ref<Boolean>
  collapse: Ref<Boolean>

  constructor(
    graph: Graph,
    workflowData: Ref<WorkflowData>,
    refProps: {
      showMiniMap: Ref<Boolean>
      collapse: Ref<Boolean>
    }
  ) {
    this.graph = graph
    this.workflowData = workflowData
    this.showMiniMap = refProps.showMiniMap
    this.collapse = refProps.collapse
  }

  // 切换视图浏览
  handleShowMiniMap = () => {
    this.showMiniMap.value = !this.showMiniMap.value
  }

  // 折叠展开
  handleCollapse = (bool: boolean) => {
    let nodeList = this.workflowData.value.nodeList

    // 获取迭代列表
    const iteratorIdArr = nodeList.filter(node => isIterator(node)).map(node => node.id)
    nodeList = nodeList.filter(node => !iteratorIdArr.includes(node.id))

    // 获取节点的cell信息，同时过滤掉迭代的子项 以及 折叠状态相同的cell
    const cellList = nodeList
      .map(node => {
        return this.graph.getCellById(node.id)
      })
      .filter(cell => !cell.parent || !iteratorIdArr.includes(cell.parent.id))
      .filter(cell => cell.isCollapsed === !bool)

    cellList.forEach(cell => {
      cell.toggleCollapse()
    })
    this.collapse.value = !this.collapse.value
  }

  // 适应视图
  handleFit = () => {
    this.graph.zoomToFit({ maxScale: 1 })
  }

  // 一键布局功能
  handleLayout = () => {
    this.graph.layout()
    // 布局后同步所有节点位置到全局数据
    setTimeout(() => {
      this.graph.getNodes().forEach((node: any) => {
        const nodeId = node.id
        const position = node.position()
        const nodeData = this.workflowData.value.nodeList.find(n => n.id === nodeId)
        if (nodeData) {
          nodeData.pos = { x: position.x, y: position.y }
        }
      })
    }, 100)
  }

  // 撤销操作
  handleUndo = () => {
    this.graph.canUndo() && this.graph.undo()
  }

  // 重做操作
  handleRedo = () => {
    this.graph.canRedo() && this.graph.redo()
  }

  // 清空画布
  handleNew = (after: () => void) => {
    ElMessageBox.confirm('新建将清空画布，是否继续？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      typeof after === 'function' ? after() : null
    })
  }

  // 导入工作流数据
  handleImport = (after: (any) => void) => {
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
            typeof after === 'function' ? after(importData) : null
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
  }

  // 导出工作流数据
  handleExport = (before: () => void) => {
    try {
      // 准备导出的数据
      typeof before === 'function' ? before() : null
      const exportData = {
        ...this.workflowData.value,
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
      link.download = `workflow_${this.workflowData.value.ruleName || 'unnamed'}_${new Date()
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
  }
}
