import { Graph, Node } from '@antv/x6'

const MAX_WIDTH = 300 // 气泡最大宽度
const TOOLTIP_DOUBLE_PADDING = 16 // 提示框内文字左右内边距(双倍的)，原因见X6文档
const BASE_OFFSET = 8 // 基础偏移量，防止换行不成功
const BASE_FONT_SIZE = 14

export class InfoPanelNode extends Node {
  constructor(options: any) {
    super(options)
  }

  // 更新属性
  public setInfoContent(content: any) {
    if (!content || !content.desc) return false

    const { node, refX, refX2, refY: offsetY,  } = content

    // 根据canvas算宽度截取文案换行
    let desc = this.setLineBreaks(content.desc, MAX_WIDTH - TOOLTIP_DOUBLE_PADDING)

    // 计算行数, 防止部分行存在过多的符号
    const lineCount = desc.split('\n').filter(Boolean).reduce((acc, cur) => {
      if (cur.length > 0 && cur.length < Math.ceil(MAX_WIDTH / BASE_FONT_SIZE) + 2) {
        acc += 1
      } else if (cur.length >= Math.ceil(MAX_WIDTH / BASE_FONT_SIZE) + 2) {
        acc += 2
      }
      return acc
    }, 0);

    // 设置位置（相对于触发节点）
    const sourcePosition = node.getPosition()
    const sourceSize = node.getSize()

    const height = lineCount * BASE_FONT_SIZE + 16
    const width = lineCount > 1 ? MAX_WIDTH : desc.length * BASE_FONT_SIZE

    const offsetX = refX === '100%' ? sourceSize.width + refX2 : refX
    // 计算信息面板位置（默认显示在节点右侧）
    const x = sourcePosition.x + offsetX - 5
    const y = sourcePosition.y - height - 4 + offsetY
    this.setPosition(x, y, { ignoreHistory: true })

    // 更新描述文本
    this.attr('description/textWrap/width', width, { ignoreHistory: true })
    this.attr('description/textWrap/height', height, { ignoreHistory: true })
    this.attr('description/text', desc || '', { ignoreHistory: true })
    // 修改尺寸
    this.setSize(width, height, { ignoreHistory: true })

    // 更新尖角位置，使其指向源节点
    this.attr('arrow/refX', 20, { ignoreHistory: true })
    this.attr('arrow/refY', height, { ignoreHistory: true })

    return true
  }

  // 处理字符串，增加换行
  public setLineBreaks(str: string, maxWidth: number, font: string = `${BASE_FONT_SIZE}px "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", Arial, sans-serif`) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return str;
    ctx.font = font;
    let result = ''
    const _breakText = (str: string, maxWidth: number) => {
      let _result = '';
      let _currentLine = '';
      for (let i = 0; i < str.length; i++) {
        const char = str[i];
        const testLine = _currentLine + char;
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && _currentLine !== '') {
          _result += _currentLine + '\n';
          _currentLine = char;
        } else {
          _currentLine = testLine;
        }
      }
      _result += _currentLine;
      return _result;
    }
    const arr = str.split('\n')
    arr.forEach(e => {
      result += _breakText(e, maxWidth) + '\n'
    })
    return result;
  }
}

// 注册信息面板节点
Graph.registerNode('infoPanelNode', InfoPanelNode, true)

// 创建信息面板节点的工厂函数
export function createInfoPanelNode(options: any = {}) {
  return new InfoPanelNode({
    shape: 'infoPanelNode',
    width: MAX_WIDTH,
    height: MAX_WIDTH,
    data: options.data || {},
    markup: [
      {
        tagName: 'rect',
        selector: 'body'
      },
      {
        tagName: 'polygon',
        selector: 'arrow'
      },
      {
        tagName: 'text',
        selector: 'description'
      }
    ],
    attrs: {
      body: {
        refWidth: '100%',
        refHeight: '100%',
        fill: '#303133',
        stroke: '#303133',
        strokeWidth: 1,
        rx: 8,
        ry: 8,
        filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))',
        zIndex: 1000
      },
      arrow: {
        points: '-4,0 4,0 0,8',
        fill: '#303133',
        strokeWidth: 1,
        refX: -8,  // 相对于body的x偏移
        refY: 20,  // 相对于body的y偏移
        zIndex: 999
      },
      description: {
        text: '',
        fontSize: BASE_FONT_SIZE,
        lineHeight: 16,
        fill: '#ffffff',
        refX: 8,
        refY: 8,
        textAnchor: 'start',
        textVerticalAnchor: 'top',
        textWrap: {
          width: '100%',
          height:  '100%',
          breakWord: 'break-all'
        },
        zIndex: 1002
      }
    },
    ports: {
      groups: {
        // 信息面板不需要端口
      },
      items: []
    }
  })
}
