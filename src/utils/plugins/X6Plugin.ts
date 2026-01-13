import type { Graph } from '@antv/x6'
import { MiniMap, History, Snapline, Clipboard, Selection } from '@antv/x6'
import * as dagre from 'dagre'

// 内部管理selectionPlugin实例
let selectionPluginInstance: any = null

/**
 * 清除选中状态
 */
export function clearSelectionPlugin() {
  if (selectionPluginInstance) {
    selectionPluginInstance.clean()
  }
}

/**
 * 注册X6插件
 * 初始化画布所需的各种功能插件
 * @param graph X6画布实例
 * @param container 画布容器元素
 * @param minimapContainer 迷你图容器元素
 */
export function registerPlugins(
  graph: Graph,
  container: HTMLElement | undefined,
  minimapContainer: HTMLElement | undefined
) {
  // 注册对齐线插件
  graph.use(
    new Snapline({
      enabled: true,
      tolerance: 10,
      sharp: true,
      resizing: true,
      clean: 3000,
      className: 'snapline'
    })
  )

  // 注册撤销恢复插件
  graph.use(
    new History({
      enabled: true,
      stackSize: 100,
      ignoreAdd: false,
      ignoreRemove: false,
      ignoreChange: false,
      beforeAddCommand: (event: any, args: any) => {
        // console.log('beforeAddCommand', args)
        // 忽略工具的撤销恢复
        if (args?.key === 'tools') {
          return false
        }
        // 忽略虚拟边
        if (args?.cell?.id?.startsWith('virtual_')) {
          return false
        }
        // 忽略指定节点
        if (args?.options?.ignoreHistory === true) {
          return false
        }
        // 备注信息的显示隐藏
        // if (args?.cell.shape === 'infoPanelNode') {
        //   // 忽略信息面板节点的撤销恢复
        //   return false
        // }
        // if (args.options.propertyPath === 'attrs/foldButton/xlink:href') {
        //   return false
        // }
        // 修复bug244611
        // if (args.options.propertyPath === 'attrs/line/strokeWidth') {
        //   return false
        // }
        // if (args?.options && Object.keys(args.options).length === 0) {
        //   return false
        // }
        // 忽略桩点的收缩和展开
        // if (args?.key === 'ports' && args?.options?.ignoreHistory === true) {
        //   return false
        // }
      }
    })
  )

  // 注册复制粘贴插件
  graph.use(new Clipboard({ enabled: true }))

  // 注册选中插件
  selectionPluginInstance = new Selection({
    enabled: true,
    multiple: true,
    rubberband: true,
    modifiers: 'ctrl',
    movable: true,
    showNodeSelectionBox: true,
    showEdgeSelectionBox: false
  })
  graph.use(selectionPluginInstance)

  // 初始化画布缩放
  container?.addEventListener('wheel', e => {
    e.preventDefault()
    const delta = e.deltaY
    const currentScale = graph.zoom()
    const newScale = delta > 0 ? currentScale - 0.1 : currentScale + 0.1
    const finalScale = Math.min(Math.max(newScale, 0.2), 3)
    graph.zoom(finalScale, { absolute: true })
  })

  // 初始化迷你图
  if (minimapContainer) {
    const minimap = new MiniMap({
      container: minimapContainer,
      width: 200,
      height: 120,
      padding: 8,
      minScale: 0.1,
      maxScale: 0.2,
      scalable: true,
      graphOptions: {
        async: true,
        connecting: {
          snap: true,
          allowBlank: false,
          allowLoop: false,
          highlight: true,
          connector: 'smooth',
          connectionPoint: 'boundary'
        }
      }
    })
    graph.use(minimap)
  }
}

/**
 * 初始化布局功能
 * @param graph X6画布实例
 */
export function initLayout(graph: Graph) {
  // 一键布局功能
  function layout() {
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

        if (node.shape === 'iteratorNode') {
          // 移动后 迭代器的子项 需要同步修改父级移动的距离
          const curPosition = node.getPosition()
          const deltaX = tempPosition.x - curPosition.x
          const deltaY = tempPosition.y - curPosition.y
          const children = node.children
          if (children) {
            children.forEach((child: any) => {
              if (child.isNode && child.isNode()) {
                const childPos = child.getPosition()
                child.setPosition(childPos.x - deltaX, childPos.y - deltaY)
              }
            })
          }
        }
      }
    })
    // 布局后自动居中画布内容
    graph.centerContent()
    graph.stopBatch('layout')
  }

  // 将布局方法挂载到graph实例上
  ;(graph as any).layout = layout

  return { layout }
}
