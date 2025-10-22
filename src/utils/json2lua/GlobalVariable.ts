import { WorkflowNode } from '@/type/workflow'
import { Json2LuaUtil } from './Json2LuaUtil'

export class GlobalVariable {
  constructor() {}

  // 生成全局变量节点代码
  public generateGlobalVariableCode(node: WorkflowNode, indent: string): string {
    let code = ''

    // 获取输入参数
    const nodeIdParam = node.inputData?.find(input => input.paramName === 'nodeId')

    if (!nodeIdParam) {
      return code
    }

    const resultVar = Json2LuaUtil.getNodeVarName(node.id)
    const targetNodeId = nodeIdParam.source || nodeIdParam.defaultValue

    if (!targetNodeId) {
      return code
    }

    // 生成代码
    code += `${indent}-- 全局变量：获取节点 ${targetNodeId} 的结果\n`
    code += `${indent}${resultVar} = ${Json2LuaUtil.getNodeVarName(targetNodeId)}\n`

    return code
  }
}
