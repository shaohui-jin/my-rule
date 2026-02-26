import { WorkflowNode } from '@/type/workflow'
import { CodeFactory } from '../factory/CodeFactory'

export class DimensionConverter {
  public paramNameResolver: Function
  constructor() {}

  // 生成类型转换节点代码
  public generateCode(node: WorkflowNode, _indent: number, branchContext?: any): string {
    let code = ''

    // 获取输入参数
    const dataParam = node.inputData?.find(input => input.paramName === 'data')
    const optionParam = node.inputData?.find(input => input.paramName === 'option')
    const expressionParam = node.inputData?.find(input => input.paramName === 'expression')

    if (!dataParam || !optionParam) {
      return code
    }

    const resultVar = CodeFactory.getNodeVarName(node)
    const dataSource = dataParam.source
    const targetVar = this.paramNameResolver(dataSource, branchContext)
    const option = optionParam.source ? optionParam.source : optionParam.defaultValue
    const expression = expressionParam?.source || ''

    let indent = CodeFactory.indent(_indent)
    // 生成升维/降维代码
    code += `${indent}-- 升维/降维操作：${option}\n`
    code += `${indent}${resultVar} = nil\n`
    code += `${indent}if ${targetVar} ~= nil then\n`

    //code += `\tlocal expression_${key} = function(${funcTarget}) return ${this.expressionLuaCodeMap[key]} end\n`

    switch (option) {
      case 'upgrade':
        // 升维：将单个值包装成数组
        code += `${indent}\t${resultVar} = {}\n`
        code += `${indent}\ttable.insert(${resultVar}, ${targetVar})\n`
        break

      case 'downgrade_filter':
        // 降维(筛选)：根据表达式筛选数组元素
        code += `${indent}\t${resultVar} = {}\n`
        code += `${indent}\tif type(${targetVar}) == "table" and #${targetVar} > 0 then\n`
        if (expression) {
          // 如果有表达式 则根据表达式筛选
          code += `${indent}\t\tfor i, item in ipairs(${targetVar}) do\n`
          code += `${indent}\t\t\tif expression_${node.id}_in_3(item) then\n`
          code += `${indent}\t\t\t\ttable.insert(${resultVar}, item)\n`
          code += `${indent}\t\t\tend\n`
          code += `${indent}\t\tend\n`
          code += `${indent}\t\tif #${resultVar} > 0 then\n`
          code += `${indent}\t\t\t${resultVar} = ${resultVar}[1]\n`
          code += `${indent}\t\tend\n`
        } else {
          // 如果没有表达式 则默认都取第一个
          code += `${indent}\t\t${resultVar} = ${targetVar}[1]\n`
        }
        code += `${indent}\tend\n`
        break

      case 'downgrade_extract':
        // 降维(提取)：从数组中提取第一个元素
        code += `${indent}\t${resultVar} = {}\n`
        code += `${indent}\tif type(${targetVar}) == "table" then\n`
        if (expression) {
          // 如果有表达式 则根据表达式提取
          code += `${indent}\t\t${resultVar} = expression_${node.id}_in_3(${targetVar})\n`
        } else {
          // 如果没有表达式 则默认都取第一个
          code += `${indent}\t\t${resultVar} = ${targetVar}[1]\n`
        }
        code += `${indent}\tend\n`
        break

      case 'toString':
        code += `${indent}\tif type(${targetVar}) == "table" then\n`
        code += `${indent}\t\t${resultVar} = '' -- 不能将table的值 转成其他基础类型\n`
        code += `${indent}\telse\n`
        code += `${indent}\t\t${resultVar} = tostring(${targetVar})\n`
        code += `${indent}\tend\n`
        break

      case 'toNumber':
        code += `${indent}\tif type(${targetVar}) == "table" then\n`
        code += `${indent}\t\t${resultVar} = 0 -- 不能将table的值 转成其他基础类型\n`
        code += `${indent}\telse\n`
        code += `${indent}\t\t${resultVar} = tonumber(${targetVar})\n`
        code += `${indent}\tend\n`
        break

      case 'toBoolean':
        code += `${indent}\t${resultVar} = ${targetVar} and true or false\n`
        break
    }

    code += `${indent}end\n`
    return code
  }
}
