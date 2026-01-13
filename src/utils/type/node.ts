import { LogicType, WorkflowNode } from '@/type/workflow'

// 判断是否迭代器
export const isIterator = (node: WorkflowNode) => {
  return node.funcType === 'logic' && node.logicData.logicType === LogicType.ITERATOR
}
