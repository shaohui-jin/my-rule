import { Node } from '@antv/x6'

export class GroupNode extends Node {
  private _isCollapsed = false
  private expandSize: { width: number; height: number }

  protected postprocess() {
    this.toggleCollapse(false)
    // 设置父节点层级
    this.setZIndex(-1)
  }

  get isCollapsed() {
    return this._isCollapsed
  }

  set isCollapsed(_isCollapsed: boolean) {
    this._isCollapsed = _isCollapsed
  }

  getExpandedSize() {
    return this.expandSize ? this.expandSize : this.getSize()
  }

  toggleCollapse(_isCollapsed?: boolean) {
    const target = _isCollapsed == null ? !this._isCollapsed : _isCollapsed
    if (target) {
      this.attr('buttonSign', { d: 'M 1 5 9 5 M 5 1 5 9' })
      this.expandSize = this.getSize()
      // 计算折叠后的宽度：左边距 + 折叠按钮宽度 + 按钮间距 + 标题宽度 + 取消按钮宽度 + 右边距
      const labelText = (this.attr('label/text') || '') as string
      const labelWidth = labelText.length * 12 // 假设每个字符宽度为12px
      const collapsedWidth = 60 + labelWidth
      this.resize(Math.max(collapsedWidth, 180), 80)
    } else {
      this.attr('buttonSign', { d: 'M 2 5 8 5' })
      if (this.expandSize) {
        this.resize(this.expandSize.width, this.expandSize.height)
      }
    }
    this._isCollapsed = target
  }
}

// 配置分组节点的样式和行为
GroupNode.config({
  shape: 'groupNode',
  markup: [
    {
      tagName: 'rect',
      selector: 'body'
    },
    {
      tagName: 'rect',
      selector: 'titleArea',
      attrs: {
        'pointer-events': 'visiblePainted'
      }
    },
    {
      tagName: 'text',
      selector: 'label'
    },
    {
      tagName: 'g',
      selector: 'buttonGroup',
      children: [
        {
          tagName: 'rect',
          selector: 'button',
          attrs: {
            'pointer-events': 'visiblePainted'
          }
        },
        {
          tagName: 'path',
          selector: 'buttonSign',
          attrs: {
            fill: 'none',
            'pointer-events': 'none'
          }
        }
      ]
    },
    {
      tagName: 'g',
      selector: 'ungroupButton',
      children: [
        {
          tagName: 'rect',
          selector: 'ungroupButtonBg',
          attrs: {
            'pointer-events': 'visiblePainted'
          }
        },
        {
          tagName: 'text',
          selector: 'ungroupButtonText',
          attrs: {
            'pointer-events': 'none'
          }
        }
      ]
    }
  ],
  attrs: {
    body: {
      refWidth: '100%',
      refHeight: '100%',
      strokeWidth: 1,
      fill: '#ffffff',
      stroke: '#ccc',
      rx: 8,
      ry: 8,
      zIndex: -1 // 确保在最底层
    },
    titleArea: {
      refX: 28,
      refY: 4,
      refWidth: -56,
      height: 24,
      fill: 'transparent',
      stroke: 'none',
      cursor: 'pointer',
      'data-title-area': 'true', // 添加标识属性
      class: 'group-title-area' // 添加类名以便于识别
    },
    label: {
      fontSize: 12,
      fill: '#333',
      refX: 32,
      refY: 11,
      textAnchor: 'start',
      pointerEvents: 'none', // 确保文本不会阻止事件传递到下面的titleArea
      textWrap: {
        width: -64, // 总宽度减去左右按钮的宽度（24px + 24px = 48px）再留些边距
        height: -10, // 留出上下边距
        ellipsis: true // 文本过长时显示省略号
      }
    },
    buttonGroup: {
      refX: 8,
      refY: 8
    },
    button: {
      height: 14,
      width: 16,
      rx: 2,
      ry: 2,
      fill: '#f5f5f5',
      stroke: '#ccc',
      cursor: 'pointer',
      event: 'node:collapse'
    },
    buttonSign: {
      refX: 3,
      refY: 2,
      stroke: '#808080'
    },
    ungroupButton: {
      refX: '100%',
      refX2: -24,
      refY: 8
    },
    ungroupButtonBg: {
      height: 16,
      width: 16,
      rx: 2,
      ry: 0,
      fill: '#ffffff',
      cursor: 'pointer',
      event: 'node:ungroup'
    },
    ungroupButtonText: {
      text: '×',
      fill: '#ff4d4f',
      fontSize: 18,
      fontWeight: 'bold',
      refX: 8,
      refY: 0,
      textAnchor: 'middle'
    }
  },
  ports: {
    groups: {
      in: {
        position: 'left',
        attrs: {
          circle: {
            r: 5,
            magnet: true,
            stroke: 'transparent',
            strokeWidth: 2.5,
            fill: 'transparent'
          }
        }
      },
      out: {
        position: 'right',
        attrs: {
          circle: {
            r: 5,
            magnet: true,
            stroke: 'transparent',
            strokeWidth: 2.5,
            fill: 'transparent'
          }
        }
      }
    },
    items: [
      {
        id: 'in_1',
        group: 'in',
        args: { x: 0, y: '50%' }
      },
      {
        id: 'out_1',
        group: 'out',
        args: { x: '100%', y: '50%' }
      }
    ]
  }
})
