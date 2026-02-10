import { WorkflowNode } from '@/type/workflow'
import { Json2LuaUtil } from './Json2LuaUtil'

/**
 * 计算器代码生成器
 */
export class Calculator {
  constructor() {}

  /**
   * 生成计算器节点代码
   */
  public generateCalculatorCode(
    node: WorkflowNode,
    indent: number,
    rstArray: Array<{ key: string; value: string }>
  ): string {
    let code = ''

    // 获取输入参数
    const resultParam = node.outputData?.find(output => output.paramName === 'result').functionCode

    if (!resultParam) {
      code += `\n${Json2LuaUtil.indent(indent)}-- 错误：缺少必要的输出参数\n\n`
      return code
    }
    // 生成自身变量名
    const resultVar = Json2LuaUtil.getNodeVarName(node.id)
    // 表达式变量名
    const expressionVar = `expression_${node.id}_out_1`

    let resStr = rstArray.map(e => e.value).join(', ')

    code += `\n${Json2LuaUtil.indent(indent)}${resultVar} = ${expressionVar}(${resStr}) \n\n`

    return code
  }
}
