import { WorkflowNode } from '@/type/workflow'
import { Json2LuaUtil } from './Json2LuaUtil'

export class GlobalParam {

  constructor() {}

  // 生成全局参数节点代码
  public generateGlobalParamCode(node: WorkflowNode, indent: number): string {
    let code = ''

    // 获取全局参数类型
    const globalParamType = this.getGlobalParamType(node)
    if (!globalParamType) {
      return code
    }

    // 生成直接赋值代码
    const resultVar = Json2LuaUtil.getNodeVarName(node.id)
    code += `${Json2LuaUtil.indent(indent)}${resultVar} = ${globalParamType}\n`

    return code
  }

  // 获取全局参数类型
  private getGlobalParamType(node: WorkflowNode): string | null {
    // 从inputData中获取
    const inputParam = node.inputData?.find(input => input.paramName === 'paramType')
    if (inputParam?.source && ['root', 'target', 'context'].includes(inputParam.source)) {
      return inputParam.source
    } else if (inputParam?.source == 'target[]') {
      return '{target}'
    }
    return 'root'
  }
}
