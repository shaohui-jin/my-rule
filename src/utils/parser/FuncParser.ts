import { InputData, WorkflowNode } from '@/type/workflow'
import { isCalculatorNode, isIfElseNode } from '@/utils/type/node'

export const getFunctionCode = async (nodeList: WorkflowNode[]) => {
  const codeMap: Record<string, string> = {}
  const expressionLuaCodeMap = {}

  nodeList.forEach((node: WorkflowNode) => {
    if (isIfElseNode(node)) {
      node.outputData.forEach((e, i, arr) => {
        if (i !== arr.length - 1) {
          codeMap[`${node.id}_${e.portId}`] = e.functionCode
        }
      })
    } else if (isCalculatorNode(node)) {
      node.outputData.forEach((e, i, arr) => {
        codeMap[`${node.id}_${e.portId}`] = e.functionCode
      })
    } else {
      node.inputData
        .filter(e => e.type === 'function' || e.widgetType === 'function')
        .forEach((e: InputData) => {
          codeMap[`${node.id}_${e.portId}`] = e.source
        })
    }
  })
  console.log('codeMap', codeMap)

  return { codeMap }
}
