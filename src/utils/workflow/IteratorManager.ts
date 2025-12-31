import { Graph, Node, Transform } from '@antv/x6'
import { createIteratorNodeInstance } from '../factory/NodeFactory'
import { type WorkflowData, LogicType, WorkflowNode } from '@/type/workflow'
import type { Ref } from 'vue'
import { IteratorNode } from './IteratorNode'
import nodeIdFactory from '../factory/NodeIdFactory'

export class IteratorManager {
  private graph: Graph
  private workflowData: Ref<WorkflowData>
  private embedPadding = 20
  private topPadding = 40 // 为标题区域添加额外的顶部内边距
  private ctrlPressed = false
  // 是否停止同步子节点位置
  public stopSyncChildPos = false
  private transformPlugin: Transform | null = null

  constructor(graph: Graph, workflowData: Ref<WorkflowData>) {
    this.graph = graph
    this.workflowData = workflowData
    this.initTransformPlugin()
    this.initIteratorEvents()
  }

  /**
   * 初始化Transform插件
   */
  private initTransformPlugin(): void {
    this.transformPlugin = new Transform({
      resizing: {
        enabled: (node: any) => {
          // 只有迭代器节点且非折叠状态才能调整尺寸
          return node.shape === 'iteratorNode' && !node.isCollapsed
        },
        minWidth: 450, // 最小宽度
        minHeight: 300, // 最小高度
        maxWidth: 20000, // 最大宽度
        maxHeight: 15000, // 最大高度
        orthogonal: true, // 显示中间调整点
        restrict: false, // 允许超出画布边界
        autoScroll: true, // 自动滚动画布
        preserveAspectRatio: false, // 不保持宽高比
        allowReverse: false // 禁止反向调整
      },
      rotating: {
        enabled: false // 禁用旋转功能
      }
    })

    this.graph.use(this.transformPlugin)
  }

  /**
   * 计算迭代器节点的动态最小尺寸
   * 基于所有子节点的包围盒加上标题区域和边距
   */
  private calculateIteratorMinSize(iteratorNode: IteratorNode): { width: number; height: number } {
    const children = iteratorNode.getChildren()

    if (!children || children.length === 0) {
      // 如果没有子节点，返回默认最小尺寸
      return { width: 450, height: 300 }
    }

    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity

    // 遍历所有子节点，计算包围盒
    children.forEach(child => {
      if (!child.isNode()) return

      const bbox = child.getBBox().inflate(this.embedPadding)
      minX = Math.min(minX, bbox.x)
      minY = Math.min(minY, bbox.y)
      maxX = Math.max(maxX, bbox.x + bbox.width)
      maxY = Math.max(maxY, bbox.y + bbox.height)
    })

    // 计算基于子节点的尺寸
    const contentWidth = maxX - minX
    const contentHeight = maxY - minY

    // 标题区域高度（40px）+ 顶部额外内边距（40px）+ 内容高度 + 底部内边距（20px）
    const totalHeight = this.topPadding + contentHeight + this.embedPadding

    // 左右内边距（20px）+ 内容宽度 + 右侧内边距（20px）
    const totalWidth = this.embedPadding + contentWidth

    // 确保最小尺寸不小于默认值
    return {
      width: Math.max(450, totalWidth),
      height: Math.max(300, totalHeight)
    }
  }

  /**
   * 更新迭代器节点的Transform插件最小尺寸配置
   */
  private updateIteratorMinSize(iteratorNode: IteratorNode): void {
    if (!this.transformPlugin || iteratorNode.isCollapsed) return

    const minSize = this.calculateIteratorMinSize(iteratorNode)

    // 由于X6 Transform插件不支持动态更新配置，我们需要重新创建插件实例
    // 先移除旧的插件
    this.graph.disposePlugins(['transform'])

    // 重新创建Transform插件，使用新的最小尺寸配置
    this.transformPlugin = new Transform({
      resizing: {
        enabled: (node: any) => {
          // 只有迭代器节点且非折叠状态才能调整尺寸
          return node.shape === 'iteratorNode' && !node.isCollapsed
        },
        minWidth: minSize.width, // 动态计算的最小宽度
        minHeight: minSize.height, // 动态计算的最小高度
        maxWidth: 20000, // 最大宽度
        maxHeight: 15000, // 最大高度
        orthogonal: true, // 显示中间调整点
        restrict: false, // 允许超出画布边界
        autoScroll: true, // 自动滚动画布
        preserveAspectRatio: false, // 不保持宽高比
        allowReverse: false // 禁止反向调整
      },
      rotating: {
        enabled: false // 禁用旋转功能
      }
    })

    // 重新注册插件
    this.graph.use(this.transformPlugin)

    this.printLog(`迭代器 ${iteratorNode.id} 最小尺寸已更新: ${minSize.width}x${minSize.height}`)
  }

  /**
   * 为迭代器节点创建尺寸控制器
   */
  public createTransformWidget(iteratorNode: IteratorNode): void {
    if (this.transformPlugin && !iteratorNode.isCollapsed) {
      // 在创建尺寸控制器前，先更新最小尺寸配置
      this.updateIteratorMinSize(iteratorNode)
      this.graph.createTransformWidget(iteratorNode)
    }
  }

  /**
   * 清除所有尺寸控制器
   */
  public clearTransformWidgets(): void {
    if (this.transformPlugin) {
      this.graph.clearTransformWidgets()
    }
  }

  /**
   * 处理迭代器节点尺寸调整完成后的逻辑
   */
  private handleIteratorResized(iteratorNode: IteratorNode): void {
    // 调用节点的尺寸变化完成处理方法
    iteratorNode.onResizeComplete()

    // 同步数据到workflowData
    this.syncIteratorData()
  }

  public isStartNode(node: Node): boolean {
    if (!node || !node.data || !node.data.funcType || !node.data.logicData) return false
    return node.data.funcType === 'logic' && node.data.logicData?.logicType === 'iterator_start'
  }

  /**
   * 保存迭代器数据
   */
  public syncIteratorData(): void {
    const iteratorList = this.workflowData.value.nodeList.filter(
      node => node.logicData?.logicType === LogicType.ITERATOR
    )
    iteratorList.forEach(iteratorData => {
      const iteratorNode = this.graph.getCellById(iteratorData.id) as any
      if (iteratorNode) {
        const children = iteratorNode.getChildren()
        const pos = iteratorNode.getPosition()
        const size = iteratorNode.isCollapsed ? iteratorNode.expandSize : iteratorNode.getSize()
        iteratorData.children = children
          .filter(n => this.graph.isNode(n) && !this.isStartNode(n))
          .map(n => n.id)
        iteratorData.pos = { x: pos.x, y: pos.y }
        iteratorData.width = size.width
        iteratorData.height = size.height
        iteratorData.title = iteratorNode.getTitle()
        iteratorData.isCollapsed = iteratorNode.isCollapsed
      }
    })
  }

  public getIteratorData(id: string): WorkflowNode {
    const iteratorData = this.workflowData.value.nodeList.find(item => item.id === id)
    return iteratorData
  }

  /**
   * 解析迭代器数据
   */
  decodeIteratorData(): void {
    if (!this.workflowData.value.nodeList) return

    this.workflowData.value.nodeList.forEach((iteratorData: WorkflowNode) => {
      if (iteratorData.logicData?.logicType !== LogicType.ITERATOR) return
      try {
        this.createNewIteratorNode(iteratorData, iteratorData.id, iteratorData.children)
      } catch (error) {
        console.error('恢复迭代器节点失败:', error)
      }
    })
  }
  // 复制迭代器节点
  copyIteratorData(
    copiedNodeData: WorkflowNode,
    newChildList: string[],
    oldChildList: string[]
  ): void {
    copiedNodeData.pos.y = copiedNodeData.pos.y + copiedNodeData.height + 20

    const iteratorNode = this.createNewIteratorNode(
      copiedNodeData,
      nodeIdFactory.next(),
      newChildList,
      true
    ) as IteratorNode

    if (iteratorNode.children.length > 0) {
      // 恢复子节点的位置
      // 这里的魔法数字主要是因为子节点 是在复制粘贴的那部分 先创建的 那边的默认创建 右了默认位移  也就是说那边改了 这边也得改
      // 因此 这边需要把复制出来的字节点 重新调整下位置 以便和复制出来的迭代器节点对齐
      // 设置子节点位置
      iteratorNode.children.forEach((child: any) => {
        const childPos = child.getPosition()
        child.setPosition(childPos.x, childPos.y + copiedNodeData.height - 100)
      })
      // 恢复边关系
      for (let i = 0; i < oldChildList.length; i++) {
        const newchildId = newChildList[i]
        const oldChildId = oldChildList[i]
        const edges = this.workflowData.value.edges.filter(edge => edge.target === oldChildId)
        edges.forEach(edge => {
          const index = oldChildList.indexOf(edge.source)
          // 找不到入边 就当是开始节点 迭代器不允许和外部连接
          const newSource = index != -1 ? newChildList[index] : getStartNodeId(iteratorNode.id)
          const newEdge = {
            source: { cell: newSource, port: edge.sourcePort },
            target: { cell: newchildId, port: edge.targetPort }
          }
          this.graph.addEdge(newEdge)
        })
      }
    }

    // 重置迭代器尺寸
    // iteratorNode.resetStartNodePos()
  }

  // 创建新的迭代器节点 复制和解析都用这个方法
  createNewIteratorNode(
    copiedNodeData: WorkflowNode,
    id: string,
    newChildList: string[],
    addId: boolean = false
  ): Node {
    const iteratorNode = createIteratorNodeInstance({
      id: id,
      x: copiedNodeData.pos.x,
      y: copiedNodeData.pos.y
    })
    iteratorNode.setPosition(copiedNodeData.pos.x, copiedNodeData.pos.y)
    iteratorNode.setSize(copiedNodeData.width, copiedNodeData.height)
    iteratorNode.setTitle(copiedNodeData.title)
    this.graph.addNode(iteratorNode)
    const startNodeId = addId ? nodeIdFactory.next() : getStartNodeId(iteratorNode.id)
    iteratorNode.createStartNode(startNodeId)

    // 恢复子节点关系
    if (newChildList.length > 0) {
      newChildList.forEach(childId => {
        const childNode = this.graph.getCellById(childId) as Node
        if (childNode) {
          iteratorNode.addChild(childNode)
        }
      })
    }

    // 恢复折叠状态
    if (copiedNodeData.isCollapsed) {
      iteratorNode.toggleCollapse()
      iteratorNode.expandSize = { width: copiedNodeData.width, height: copiedNodeData.height }
      iteratorNode.setPosition(copiedNodeData.pos.x, copiedNodeData.pos.y)
      iteratorNode.resetStartNodePos()
    }
    return iteratorNode
  }

  /**
   * 初始化迭代器相关事件
   */
  private initIteratorEvents(): void {
    // 监听嵌入开始事件，检测Ctrl键状态
    this.graph.on('node:embedding', ({ e }: { e: any }) => {
      this.ctrlPressed = e.metaKey || e.ctrlKey
    })

    // 监听嵌入完成事件，重置Ctrl键状态
    this.graph.on('node:embedded', () => {
      this.ctrlPressed = false
    })

    // 监听迭代器节点鼠标悬停事件，显示尺寸控制器
    this.graph.on('node:mouseenter', ({ node }: { node: any }) => {
      // 只有迭代器节点且非折叠状态才显示尺寸控制器
      if (node.shape === 'iteratorNode' && !node.isCollapsed) {
        this.createTransformWidget(node)
      }
    })

    this.graph.on('node:selected', ({ node }: { node: any }) => {
      // 选中事件不再直接控制尺寸控制器，由鼠标悬停事件控制
      if (node.shape === 'iteratorNode' && !node.isCollapsed) {
        setTimeout(() => {
          this.clearTransformWidgets()
        }, 100)
      }
    })

    // 监听节点尺寸变化完成事件
    this.graph.on('node:resized', ({ node }: { node: any }) => {
      if (node.shape === 'iteratorNode') {
        // 尺寸调整完成后，重新计算子节点位置
        this.handleIteratorResized(node)
      }
    })

    // 监听节点位置变化
    this.graph.on('node:mousemove', ({ node }) => {
      if (this.ctrlPressed || this.stopSyncChildPos) {
        return
      }

      const parent = node.getParent() as IteratorNode
      const parentIsIterator = parent && parent.isNode() && parent.shape === 'iteratorNode'
      if (this.isStartNode(node as Node) && parentIsIterator) {
        // 开始节点位置不允许变更
        parent.resetStartNodePos()
        return
      }
      if (node.shape === 'iteratorNode') {
        // 开始节点位置不允许变更
        ;(node as IteratorNode).resetStartNodePos()
      }

      this.graph.startBatch('iterator-manager-node-change-position')
      const children = node.getChildren()
      if (children && children.length) {
        node.prop('originPosition', node.getPosition())
      }

      if (parentIsIterator && !parent.isCollapsed) {
        const originSize = { width: 450, height: 300 }

        let originPosition = parent.prop('originPosition')
        if (originPosition == null) {
          originPosition = parent.getPosition()
          parent.prop('originPosition', originPosition)
        }

        let x = originPosition.x
        let y = originPosition.y
        let cornerX = originPosition.x + originSize.width
        let cornerY = originPosition.y + originSize.height
        let hasChange = false

        const children = parent.getChildren()
        if (children) {
          children.forEach(child => {
            if (!child.isNode()) {
              return
            }
            // 为顶部添加额外的内边距
            const topPadding = this.topPadding
            const bbox = child.getBBox().inflate(this.embedPadding)
            const corner = bbox.getCorner()

            if (bbox.x < x) {
              x = bbox.x
              hasChange = true
            }

            // 为顶部边界添加额外的内边距
            if (bbox.y < y + topPadding) {
              y = bbox.y - topPadding
              hasChange = true
            }

            if (corner.x > cornerX) {
              cornerX = corner.x
              hasChange = true
            }

            if (corner.y > cornerY) {
              cornerY = corner.y
              hasChange = true
            }
          })
        }

        if (hasChange) {
          parent.prop({
            position: { x, y },
            size: { width: cornerX - x, height: cornerY - y }
          })
          parent.resetStartNodePos()
        }
      }
      this.graph.stopBatch('iterator-manager-node-change-position')
    })

    // 监听子节点添加事件
    this.graph.on('node:added', ({ node: _node, options }) => {
      if (_node && _node.shape === 'iteratorNode') {
        // 如果添加了迭代器节点  则需要同步数据
        const curNode = _node as IteratorNode
        // 同步数据 拖拽/解析创建/撤销回退 都会进来
        if (!this.getIteratorData(curNode.id)) {
          const iteratorData = getIteratorData({ id: curNode.id, x: 0, y: 0 })
          iteratorData.children = curNode.getChildren()?.map((child: any) => child.id) || []
          iteratorData.title = curNode.getTitle()

          this.workflowData.value.nodeList.push(iteratorData)
          curNode.data = iteratorData
          this.printLog(`=====================同步增加迭代器数据 ${iteratorData.id}`)
        }
        // 手动添加迭代的起始节点到画布
        if (options?.stencil) {
          curNode.createStartNode()
        }
      }
    })

    // 监听子节点移除事件
    this.graph.on('node:removed', ({ node: _node }) => {
      if (_node.shape === 'iteratorNode') {
        // 如果删除了迭代器节点  则需要删除迭代器数据
        const iteratorData = this.getIteratorData(_node.id)
        if (iteratorData) {
          this.workflowData.value.nodeList.splice(
            this.workflowData.value.nodeList.indexOf(iteratorData),
            1
          )
          this.printLog(`=====================同步删除迭代器数据 ${iteratorData.id}`)
        }
      }
    })

    this.graph.on('node:iterator_collapse', ({ node }: { node: any }) => {
      this.graph.startBatch('iterator-node-collapse')
      node.toggleCollapse()

      // 根据折叠状态处理尺寸控制器
      if (node.isCollapsed) {
        this.clearTransformWidgets()
      }
      this.graph.stopBatch('iterator-node-collapse')
    })
  }

  /**
   * 销毁IteratorManager，清理相关资源
   */
  public destroy(): void {
    // 清除所有尺寸控制器
    this.clearTransformWidgets()

    // 清理Transform插件引用
    this.transformPlugin = null
  }

  // 检查是否是迭代器的开始节点 是的话返回迭代器的id 否则返回-1
  public getStartNodeParentId(startCellId: string) {
    const startCell = this.graph.getCellById(startCellId)
    // 如果上游是迭代器的开始节点 则按迭代器的上游算
    if (startCell && this.isStartNode(startCell as Node)) {
      const iteratorCell = startCell.getParent()
      if (iteratorCell) {
        return iteratorCell.id
      }
    }
    return -1
  }

  // 获取迭代器的主迭代对象的source
  public getIteratorMainSource(iteratorId: string) {
    const iteratorData = this.getIteratorData(iteratorId)
    let mainNodeSource = ''
    if (iteratorData) {
      mainNodeSource =
        iteratorData.inputData.find(input => input.paramName === 'mainNode')?.source || ''
    }
    return mainNodeSource
  }

  private printLog(msg: string) {
    if ((window as any).showDebug) {
      console.log(msg)
    }
  }
}

export function getIteratorData(options: { id: string; x: number; y: number }): WorkflowNode {
  return {
    id: options.id,
    funcId: '',
    title: '迭代',
    pos: { x: options.x, y: options.y },
    width: 450,
    height: 300,
    children: [],
    funcType: 'logic',
    logicData: { logicType: LogicType.ITERATOR },
    remark: '选定指定节点，对其结果的每一项执行"开始"节点后的逻辑 循环',
    inputData: [
      {
        paramName: 'mainNode',
        type: 'table',
        subType: 'any[]',
        source: '',
        sourceType: 'node',
        portId: 'in_1',
        attributes: {
          paramType: 'table',
          showLabel: true,
          label: '迭代对象'
        },
        defaultValue: ''
      }
    ],
    outputData: [
      {
        paramName: 'result',
        type: 'table',
        subType: 'any[]',
        portId: 'out_1'
      }
    ]
  }
}

export function getStartNodeId(node: Node | string): string {
  const iteratorId = String(Number(typeof node === 'string' ? node : node.id) + 1)
  return iteratorId
}
