import { Node, Shape } from '@antv/x6'
import nodeIdFactory from '../factory/NodeIdFactory'
import { COLORS, PORT_ATTRS } from './constants/StyleConstants'
const { VITE_PUBLIC_PATH } = import.meta.env

export class IteratorNode extends Node {
  public startNode: Node = null
  private _isCollapsed = false
  public expandSize: { width: number; height: number }

  constructor(options: any) {
    super(options)
    this.attr('nodeId/text', options.id)
  }
  /**
   * 创建内置的起始节点
   */
  public createStartNode(id = '') {
    if (this.startNode) return
    if (!id) {
      id = nodeIdFactory.next()
    }

    // 创建起始节点
    const startNodeConfig = {
      id: id,
      width: 60,
      height: 40,
      data: {
        title: '起始',
        funcType: 'logic',
        logicData: { logicType: 'iterator_start' }
      },
      markup: [
        {
          tagName: 'rect',
          selector: 'border'
        },
        {
          tagName: 'text',
          selector: 'label'
        }
      ],
      attrs: {
        border: {
          refWidth: '100%',
          refHeight: '100%',
          fill: COLORS.background.light,
          stroke: COLORS.border,
          strokeWidth: 1,
          rx: 8,
          ry: 8,
          zIndex: 1
        },
        label: {
          text: '起始',
          fill: COLORS.text.primary,
          fontSize: 13,
          fontWeight: 'bold',
          textAnchor: 'middle',
          textVerticalAnchor: 'middle',
          refX: '50%',
          refY: '50%',
          zIndex: 3
        }
      },
      ports: {
        groups: {
          out: {
            position: 'absolute',
            attrs: {
              circle: PORT_ATTRS.circle
            },
            label: {
              position: 'inside'
            }
          }
        },
        items: [
          {
            id: 'out_1',
            group: 'out',
            args: { x: '100%', y: '50%' }
          }
        ]
      }
    }

    this.startNode = new Shape.Rect(startNodeConfig)

    this.setZIndex(-100)
    this.addChild(this.startNode)
    this.resetStartNodePos()
  }

  public resetStartNodePos() {
    if (!this.startNode) return
    // 获取父节点的位置
    this.startNode.prop({
      position: { x: this.getPosition().x + 20, y: this.getPosition().y + 60 }
    })
  }

  public getTitle() {
    return this.attr('title/text') as string
  }

  public setTitle(title: string) {
    this.attr('title/text', title)
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
   * 更新折叠状态显示
   */
  private updateCollapseState() {
    if (this._isCollapsed) {
      this.attr('foldButton/xlink:href', VITE_PUBLIC_PATH + '/rsvg/UnFold.svg')
      this.expandSize = this.getSize()
      this.resize(450, 40)
    } else {
      this.attr('foldButton/xlink:href', VITE_PUBLIC_PATH + '/rsvg/Fold.svg')
      if (this.expandSize) {
        this.resize(this.expandSize.width, this.expandSize.height)
      }
    }

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
   * 处理尺寸变化完成后的逻辑
   */
  public onResizeComplete(): void {
    // 重新设置起始节点位置
    this.resetStartNodePos()
  }
}

// 配置迭代器节点的样式和行为
IteratorNode.config({
  shape: 'iteratorNode',
  width: 450,
  height: 300,
  resizable: true, // 允许调整尺寸
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
    }
  ],
  attrs: {
    body: {
      refWidth: '100%',
      refHeight: '100%',
      strokeWidth: 1,
      fill: COLORS.background.white,
      stroke: COLORS.border,
      rx: 10,
      ry: 10,
      filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.06))',
      zIndex: -1
    },
    titleAreaBg: {
      refWidth: '100%', // 这里用了2个bg来实现 上面圆角 下面直角。虽然用path可以一步到位，但是需要动态维护宽度
      height: 20,
      refX: 0,
      refY: 20,
      fill: COLORS.background.light,
      stroke: 'none'
    },
    titleArea: {
      refWidth: '100%',
      height: 40,
      rx: 10,
      ry: 10,
      fill: COLORS.background.light,
      stroke: 'none',
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
      strokeOpacity: 1
    },
    title: {
      text: '迭代',
      fontSize: 14,
      fontWeight: 'bold',
      fill: COLORS.text.primary,
      refX: 16,
      refY: 16,
      textAnchor: 'start',
      pointerEvents: 'none',
      textWrap: {
        width: -120,
        height: -10,
        ellipsis: true
      }
    },
    nodeId: {
      fontSize: 12,
      fill: COLORS.text.secondary,
      refX: '100%',
      refX2: -16,
      refY: -15,
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
      event: 'node:iterator_collapse'
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
    }
  },
  ports: {
    groups: {
      in: {
        position: 'absolute',
        attrs: {
          circle: PORT_ATTRS.circle
        },
        label: {
          position: 'inside'
        }
      },
      out: {
        position: 'absolute',
        attrs: {
          circle: PORT_ATTRS.circle
        },
        label: {
          position: 'inside'
        }
      }
    },
    items: [
      {
        id: 'in_1',
        group: 'in',
        args: { x: 0, y: 20 }
      },
      {
        id: 'out_1',
        group: 'out',
        args: { x: '100%', y: 20 }
      }
    ]
  }
})
