import { nextTick, Ref, ref } from 'vue'
import { LogicType } from '@/type/workflow'
import {
  DEVICE_PIXEL_RATIO_STEP,
  MAX_DEVICE_PIXEL_RATIO,
  MIN_DEVICE_PIXEL_RATIO
} from '@/config/workflow'

export type WorkflowFunction = {
  handleDecrease: () => void
  handleDpr: (str: string) => void
  handleIncrease: () => void
  handleCollapse: (bool: boolean) => void
  handleFit: () => void
  handleLayout: () => void
}

export const useWorkflowFunctions = ({
  graph,
  workflowData,
  devicePixelRatio
}): ((graph: any, workflowData: any, devicePixelRatio: Ref<string>) => WorkflowFunction) => {
  // 减少缩放倍率
  const handleDecrease = () => {
    let dpr = Number(devicePixelRatio.value.split('%')[0])
    const _newDpr = (dpr - DEVICE_PIXEL_RATIO_STEP) / 100
    graph.zoomTo(Math.max(MIN_DEVICE_PIXEL_RATIO, _newDpr))
  }

  // 设置缩放倍率
  const handleDpr = val => {
    graph.zoomTo(Number(val.split('%')[0]) / 100)
  }

  // 放大缩放倍率
  const handleIncrease = () => {
    let dpr = Number(devicePixelRatio.value.split('%')[0])
    const _newDpr = (dpr + DEVICE_PIXEL_RATIO_STEP) / 100
    graph.zoomTo(_newDpr >= MAX_DEVICE_PIXEL_RATIO ? MAX_DEVICE_PIXEL_RATIO : _newDpr)
  }

  // 折叠展开
  const handleCollapse = bool => {
    let nodeList = workflowData.value.nodeList

    // 获取迭代列表
    const iteratorIdArr = nodeList
      .filter(node => node.funcType === 'logic' && node.logicData.logicType === LogicType.ITERATOR)
      .map(node => node.id)
    nodeList = nodeList.filter(node => !iteratorIdArr.includes(node.id))

    // 获取节点的cell信息，同时过滤掉迭代的子项 以及 折叠状态相同的cell
    const cellList = nodeList
      .map(node => {
        return graph.getCellById(node.id)
      })
      .filter(cell => !cell.parent || !iteratorIdArr.includes(cell.parent.id))
      .filter(cell => cell.isCollapsed === !bool)

    cellList.forEach(cell => {
      cell.toggleCollapse()
    })
  }

  // 适应视图
  const handleFit = () => {
    graph.zoomToFit({ maxScale: 1 })
  }

  // 一键布局功能
  const handleLayout = () => {
    graph.layout()
    // 布局后同步所有节点位置到全局数据
    setTimeout(() => {
      graph.getNodes().forEach((node: any) => {
        const nodeId = node.id
        const position = node.position()
        const nodeData = workflowData.nodeList.find(n => n.id === nodeId)
        if (nodeData) {
          nodeData.pos = { x: position.x, y: position.y }
        }
      })
    }, 100)
  }

  return {
    handleDecrease,
    handleDpr,
    handleIncrease,
    handleCollapse,
    handleFit,
    handleLayout
  }
}
