import { WorkflowNode } from '@/type/workflow'
import { Json2LuaUtil } from './Json2LuaUtil'

export class TypeConverter {
  public paramNameResolver: Function
  constructor() {}

  // 生成类型转换节点代码
  public generateTypeConverterCode(
    node: WorkflowNode,
    indent: string,
    branchContext?: any
  ): string {
    let code = ''

    // 获取输入参数
    const dataParam = node.inputData?.find(input => input.paramName === 'data')
    const convertTypeParam = node.inputData?.find(input => input.paramName === 'convertType')

    if (!dataParam || !convertTypeParam) {
      return code
    }

    const resultVar = Json2LuaUtil.getNodeVarName(node.id)
    const dataSource = dataParam.source
    const targetVar = this.paramNameResolver(dataSource, branchContext)
    const convertType = convertTypeParam.source
      ? convertTypeParam.source
      : convertTypeParam.defaultValue

    // 生成类型转换代码
    code += `${indent}-- 类型转换：${convertType}\n`
    code += `${indent}${resultVar} = nil\n`
    code += `${indent}if ${targetVar} ~= nil then\n`

    switch (convertType) {
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
      default:
        // 默认转成table
        code += `${indent}\t${resultVar} = {}\n`
        code += `${indent}\ttable.insert(${resultVar}, ${targetVar})\n`
        break
    }

    code += `${indent}end\n`
    return code
  }
}
