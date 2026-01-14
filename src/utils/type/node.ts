import { Node } from '@antv/x6'

// 判断是否自定义
export const isCustom = (node: Node) => {
  return node.shape === 'customNode'
}
