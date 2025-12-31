import { LogicType } from '@/type/workflow'
import { COLORS, PORT_ATTRS } from './constants/StyleConstants'
const { VITE_PUBLIC_PATH } = import.meta.env

// 端口属性配置 - 使用导入的常量

// 节点基础配置
const NODE_BASE_CONFIG = {
  width: 300,
  titleHeight: 36,
  baseHeight: 164, // 原来是125
  margin: 18
}

/**
 * 创建端口配置
 * @param id 端口ID
 * @param group 端口组（in/out）
 * @param position 端口位置
 * @returns 端口配置对象
 */
function createPortConfig(
  id: string,
  group: 'in' | 'out',
  position: any,
  portTitle = '',
  desc = '',
  typeText = ''
) {
  let portTitleType = portTitle
  // if(group === 'in') {
  //   portTitleType = portTitle === undefined ? '' : portTitle+'\n' + typeText
  // } else {
  //   portTitleType = portTitle === undefined ? '' : typeText + '\n' + portTitle
  // }
  if (portTitleType.length > 13) {
    portTitleType =
      portTitleType.substring(0, 13) +
      '...\n' +
      (typeText.length > 13 ? typeText.substring(0, 13) + '...' : typeText)
  } else {
    portTitleType =
      portTitleType + '\n' + (typeText.length > 13 ? typeText.substring(0, 13) + '...' : typeText)
  }
  return {
    id,
    group,
    args: position,
    zIndex: 10,
    attrs: {
      ...PORT_ATTRS,
      text: {
        text: portTitleType,
        fontSize: 13,
        textWrap: {
          width: 95,
          height: 80,
          overflow: 'hidden',
          ellipsis: true
        }
      },
      // 用于出入桩文字提示
      portTitle: portTitle,
      desc: desc
    },
    uniqueId: 'port_' + Date.now() + Math.random().toString(36).substring(2, 15)
  }
}

/**
 * 自定义port分布函数，让port在边上均匀分布
 */
function getPortPosition(
  side: 'left' | 'right',
  total: number,
  idx: number,
  nodeHeight: number,
  titleHeight: number
) {
  const available = nodeHeight - titleHeight
  let y
  if (total == 1) {
    y = titleHeight + available / 2
  } else {
    const step = available / (total + 1)
    y = titleHeight + step * (idx + 1)
  }
  return {
    x: side === 'left' ? 0 : NODE_BASE_CONFIG.width,
    y
  }
}

/**
 * 生成端口配置
 */
function generatePorts(node: any, nodeHeight: number) {
  const { titleHeight } = NODE_BASE_CONFIG
  let inputPorts = []
  let outputPorts = []

  if (node.funcType === 'logic' && node.logicData?.logicType === LogicType.IFELSE) {
    // 条件节点：左侧1个port，右侧多个port
    const inPos = getPortPosition('left', 1, 0, nodeHeight, titleHeight)
    inputPorts = [createPortConfig('in_1', 'in', inPos, '条件判断对象')]
    outputPorts = (node.outputData || []).map((item: any, idx: number, arr: any[]) => {
      const pos = getPortPosition('right', arr.length, idx, nodeHeight, titleHeight)
      let portTitle = idx === 0 ? 'if' : idx === arr.length - 1 ? 'else' : 'elseif'
      return createPortConfig(item.portId, 'out', pos, portTitle)
    })
  } else if (node.funcType === 'logic' && node.logicData?.logicType === LogicType.CALCULATOR) {
    inputPorts = [
      createPortConfig(
        'in_1',
        'in',
        getPortPosition('left', 1, 0, nodeHeight, titleHeight),
        '计算器对象'
      )
    ]
    outputPorts = [
      createPortConfig(
        'out_1',
        'out',
        getPortPosition('right', 1, 0, nodeHeight, titleHeight),
        'any'
      )
    ]
  } else {
    // 函数节点：根据 paramGroup 数量生成入参端口
    let inputPortCount = 1

    let tempinputPortCount = 0
    // let nodeHeightTotal = 0
    // 分析 paramGroup 数量
    const paramGroups = new Set<string>()
    const paramDescGroups = new Set<string>()
    const paramPortIdGroups = new Set<string>()
    const paramTypeGroups = []
    // console.log('node.inputData====', node)
    if (node.inputData && Array.isArray(node.inputData)) {
      node.inputData.forEach((input: any) => {
        if (input.sourceType == 'node') {
          tempinputPortCount++
          // nodeHeightTotal += 20
          paramGroups.add(input.attributes.label)
          paramDescGroups.add(input.attributes.desc)
          paramPortIdGroups.add(input.portId)
          paramTypeGroups.push(input.subType || input.type)
        }
      })
      // 必须有一个入参桩点
      inputPortCount = tempinputPortCount || 1
    }
    // console.log('node=====111', node)
    const inputTitleList = [...Array.from(paramGroups)]
    const inputDescList = [...Array.from(paramDescGroups)]
    const inputPortIdList = [...Array.from(paramPortIdGroups)]
    const inputTypeTextList = [...Array.from(paramTypeGroups)]
    // console.log('inputPortIdList====', inputTypeTextList, paramTypeGroups)
    // console.log('inputPortIdList====', inputTitleList, node.inputData)
    if (inputPortIdList.length == 0) {
      // 没有入参桩点 则默认生成一个 否则边的连接会找不到绑定的桩点
      inputPortIdList.push('in_1')
    }
    // 生成入参端口
    for (let i = 0; i < inputPortCount; i++) {
      const inPos = getPortPosition('left', inputPortCount, i, nodeHeight, titleHeight)
      // 这个in_1是按顺序生成的，所以生成的数据是按顺序塞入进去的需要修改成原数据的portId,如果没有原数据则使用默认的循环
      // inputPorts.push(createPortConfig(`in_${i + 1}`, 'in', inPos, inputTitleList[i], inputDescList[i]))
      inputPorts.push(
        createPortConfig(
          inputPortIdList[i],
          'in',
          inPos,
          inputTitleList[i],
          inputDescList[i],
          inputTypeTextList[i]
        )
      )
    }
    // console.log('node.outputData===', node.outputData)
    // 出参端口：默认1个
    const outPos = getPortPosition('right', 1, 0, nodeHeight, titleHeight)
    outputPorts = [
      createPortConfig(
        'out_1',
        'out',
        outPos,
        node.outputData?.[0]?.attributes?.label || '',
        node.outputData?.[0]?.attributes?.desc || '',
        node.outputData?.[0]?.subType || node.outputData?.[0]?.type || ''
      )
    ]
  }

  return { inputPorts, outputPorts }
}

/**
 * 自定义工作流节点工厂方法
 * @param node 节点数据
 * @returns X6节点配置
 */
export function getCustomNodeConfig(node: any) {
  const { baseHeight, width, titleHeight } = NODE_BASE_CONFIG

  // 1. 分析入参端口组名
  let inputPortCount = 1

  // if (node.funcType === 'func') {
  //   // 函数节点：根据 paramGroup 分析入参端口组名
  //   if (node.inputData && Array.isArray(node.inputData)) {
  //     node.inputData.forEach((input: any) => {
  //       if (input.sourceType === 'node') {
  //         inputPortCount++
  //       }
  //     })
  //   }
  // }

  // 2. 计算端口需求高度
  let nodeHeight = baseHeight
  const outputPortCount = node.outputData?.length || 1
  const maxPort = Math.max(inputPortCount, outputPortCount)
  // 计算最终高度 (常用函数大多是一个node节点或者没有，保持一致的高度)
  nodeHeight = maxPort > 2 ? (maxPort - 2) * 24 + baseHeight : baseHeight

  // 3. 计算最终高度
  const finalHeight = titleHeight + (nodeHeight - titleHeight)

  const { inputPorts, outputPorts } = generatePorts(node, finalHeight)
  return getNormalConfig(node, width, finalHeight, inputPorts, outputPorts)
}

function getNormalConfig(
  node: any,
  width: number,
  finalHeight: number,
  inputPorts: any[],
  outputPorts: any[]
) {
  return {
    id: node.id,
    x: node.pos?.x || 100,
    y: node.pos?.y || 100,
    width,
    height: finalHeight,
    data: node,
    attrs: {
      body: {
        refWidth: '100%',
        refHeight: '100%',
        fill: '#fff',
        stroke: COLORS.border,
        strokeWidth: 1.5,
        rx: 10,
        ry: 10,
        filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.06))'
      },
      titleAreaBg: {
        refWidth: '100%',
        height: 20,
        refX: 0,
        refY: 16,
        fill: COLORS.background.lighter,
        stroke: 'none'
      },
      titleArea: {
        refWidth: '100%',
        height: 36,
        fill: COLORS.background.lighter,
        stroke: 'none',
        rx: 10,
        ry: 10,
        cursor: 'pointer'
      },
      border: {
        refWidth: '100%',
        refHeight: '100%',
        rx: 10,
        ry: 10,
        fill: 'none',
        stroke: COLORS.primary,
        strokeWidth: 2,
        strokeOpacity: 0
      },
      title: {
        text: node.title,
        fill: COLORS.text.primary,
        fontSize: 13,
        fontWeight: 'bold',
        refX: 16,
        refY: 18,
        textAnchor: 'start',
        yAlign: 'middle',
        // pointerEvents: 'none',
        event: 'node:custom_titletip',
        textWrap: {
          width: -80,
          height: 40,
          ellipsis: true
        }
      },
      nodeId: {
        text: node.id || '',
        fill: COLORS.text.secondary,
        fontSize: 13,
        refX: '100%',
        refX2: -280,
        refY: -20,
        textAnchor: 'end',
        pointerEvents: 'none'
      },
      foldButton: {
        width: 20,
        height: 20,
        refX: '100%',
        refX2: -60,
        refY: 10,
        cursor: 'pointer',
        'xlink:href': VITE_PUBLIC_PATH + '/rsvg/Fold.svg',
        event: 'node:customer_collapse'
      },
      infoButton: {
        width: 20,
        height: 20,
        refX: '100%',
        refX2: -36,
        refY: 10,
        cursor: 'pointer',
        'xlink:href': VITE_PUBLIC_PATH + '/rsvg/InfoCircleOutlined.svg',
        zIndex: 10,
        event: 'node:info_mouseenter'
      },
      addButton: {
        width: 1,
        height: 28,
        refX: '100%',
        refX2: -80,
        refY: -28,
        cursor: 'pointer',
        'xlink:href': VITE_PUBLIC_PATH + '/rsvg/Add.svg',
        zIndex: 10,
        strokeOpacity: 0,
        event: 'node:add_mouseenter'
      },
      copyButton: {
        width: 1,
        height: 28,
        refX: '100%',
        refX2: -60,
        refY: -28,
        cursor: 'pointer',
        'xlink:href': VITE_PUBLIC_PATH + '/rsvg/copy.svg',
        zIndex: 10,
        strokeOpacity: 0,
        event: 'node:copy_mouseenter'
      },
      delButton: {
        width: 1,
        height: 28,
        refX: '100%',
        refX2: -40,
        refY: -28,
        cursor: 'pointer',
        'xlink:href': VITE_PUBLIC_PATH + '/rsvg/DeleteOutlined.svg',
        zIndex: 10,
        strokeOpacity: 0,
        event: 'node:del_mouseenter'
      }
    },
    ports: {
      groups: {
        in: {
          position: 'absolute',
          attrs: PORT_ATTRS,
          label: {
            position: 'inside'
          },
          markup: [
            {
              tagName: 'circle',
              selector: 'circle'
            }
          ]
        },
        out: {
          position: 'absolute',
          attrs: PORT_ATTRS,
          label: {
            position: 'inside'
          },
          markup: [
            {
              tagName: 'circle',
              selector: 'circle'
            },
            {
              tagName: 'circle',
              selector: 'plus'
            },
            {
              tagName: 'text',
              selector: 'plusText'
            }
          ]
        }
      },
      items: [...inputPorts, ...outputPorts]
    },
    markup: [
      {
        tagName: 'rect',
        selector: 'body'
      },
      {
        tagName: 'rect',
        selector: 'titleAreaBg'
      },
      {
        tagName: 'rect',
        selector: 'titleArea',
        attrs: {
          'pointer-events': 'visiblePainted'
        }
      },
      {
        tagName: 'rect',
        selector: 'border'
      },
      {
        tagName: 'text',
        selector: 'title'
      },
      {
        tagName: 'text',
        selector: 'nodeId'
      },
      {
        tagName: 'image',
        selector: 'foldButton'
      },
      {
        tagName: 'image',
        selector: 'infoButton'
      },
      {
        tagName: 'image',
        selector: 'copyButton'
      },
      {
        tagName: 'image',
        selector: 'delButton'
      },
      {
        tagName: 'image',
        selector: 'addButton'
      }
    ]
  }
}

import { Graph, Node } from '@antv/x6'
import { type WorkflowData } from '@/type/workflow'
import type { Ref } from 'vue'

export class CustomNode extends Node {
  public startNode: Node = null
  private _isCollapsed = false
  public expandSize: { width: number; height: number }
  public oldPortXY: Array<any>[] = []
  private graph: Graph
  private workflowData: Ref<WorkflowData>
  // constructor(options: any, graph: Graph, workflowData: Ref<WorkflowData>) {
  constructor(options: any) {
    super(options)
    // this.graph = graph
    // this.workflowData = workflowData
    // console.log('11111')
    // this.initIteratorEvents()
  }

  private timer: TimeoutHandle
  // 设置1.5s 后显示 plusIcon
  showHidePortPlus(portId: string, isShow: boolean) {
    if (isShow) {
      this.timer = setTimeout(() => {
        this.showPortPlus(portId, true)
      }, 1500)
    } else {
      this.showPortPlus(portId, false)
      this.clearPortCount()
    }
  }

  showPortPlus(portId: string, isShow: boolean) {
    // 显示指定端口的 plus 和 plusText 元素
    const port = this.getPort(portId)
    if (port && port.group === 'out') {
      // 使用 X6 的 prop 方法设置属性
      this.setPortProp(portId, 'attrs/plus/display', isShow ? 'block' : 'none', {
        ignoreHistory: true
      })
      this.setPortProp(portId, 'attrs/plusText/display', isShow ? 'block' : 'none', {
        ignoreHistory: true
      })
      this.setPortProp(portId, 'attrs/circle/display', isShow ? 'none' : 'block', {
        ignoreHistory: true
      })
    }
  }
  //判断当前桩点是否有显示plus
  showSearchCheck(portId: string): boolean {
    return this.getPortProp(portId, 'attrs/plus/display') === 'block'
  }

  clearPortCount() {
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }
  }
  public resetStartNodePos() {
    // 获取父节点的位置
    const parentPosition = this.getPosition()
    // 设置起始节点位置，确保在迭代器内部
    const startX = parentPosition.x + 20
    const startY = parentPosition.y + 60
    this.startNode.setPosition(startX, startY, { ignoreHistory: true })
  }

  public getTitle() {
    return this.attr('title/text') as string
  }

  public setTitle(title: string) {
    this.attr('title/text', title, { ignoreHistory: true })
  }

  /**
   * 切换折叠状态
   */
  public toggleCollapse() {
    this._isCollapsed = !this._isCollapsed
    this.updateCollapseState()
  }

  public get isCollapsed() {
    return this._isCollapsed
  }
  /**
   * 更新桩位置
   */
  public updatePositionPorts(_isCollapsed: boolean) {
    const ports = this.getPorts()
    if (_isCollapsed) {
      const _tempXY = []
      ports.forEach((port: any) => {
        const { id, group, args } = port
        _tempXY.push({ id: port.id, group: group, args: JSON.parse(JSON.stringify(args)) })
        if (id.includes('in')) {
          args.y = this.size().height / 2
          args.x = 0
        } else {
          args.y = this.size().height / 2
          args.x = this.size().width
        }
        this.portProp(
          id,
          { group, args, attrs: { text: { visibility: 'hidden' } } },
          { ignoreHistory: true }
        )
      })
      this.oldPortXY = _tempXY
    } else {
      this.oldPortXY.forEach((item: any) => {
        const { id, group, args } = item
        this.portProp(
          id,
          { group, args, attrs: { text: { visibility: 'visible' } } },
          { ignoreHistory: true }
        )
      })
    }
  }
  /**
   * 更新折叠状态显示
   */
  private updateCollapseState() {
    if (this._isCollapsed) {
      // 收缩
      this.attr('foldButton/xlink:href', VITE_PUBLIC_PATH + '/rsvg/UnFold.svg', {
        ignoreHistory: true
      })
      //  node.attr('border/strokeOpacity', 1, { ignoreHistory: true })
      this.expandSize = this.getSize()
      this.resize(this.expandSize.width, 40, { ignoreHistory: true })
    } else {
      // 展开
      this.attr('foldButton/xlink:href', VITE_PUBLIC_PATH + '/rsvg/Fold.svg', {
        ignoreHistory: true
      })
      if (this.expandSize) {
        this.resize(this.expandSize.width, this.expandSize.height, { ignoreHistory: true })
      }
    }
    // 修改连接桩的位置
    this.updatePositionPorts(this._isCollapsed)
    const cells = this.getChildren()
    if (cells) {
      cells.forEach((cell: any) => {
        if (this._isCollapsed) {
          cell.hide()
        } else {
          cell.show()
        }
      })
    }
  }

  /**
   * 初始化迭代器相关事件
   */
  // private initIteratorEvents(): void {
  //     console.log('this.graph', this.graph)
  //     this.graph.on('node:customer_collapse', ({ node }: { node: any }) => {
  //       this.graph.startBatch('iterator-node-collapse')
  //       node.toggleCollapse()
  //       // 根据折叠状态处理尺寸控制器
  //       // if (node.isCollapsed) {
  //       //   this.clearTransformWidgets()
  //       // }
  //       this.graph.stopBatch('iterator-node-collapse')
  //     })
  //   }
}
