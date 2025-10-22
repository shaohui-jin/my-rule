import { WorkflowNode } from '@/type/workflow'
import { Json2LuaUtil } from './Json2LuaUtil'

export class SubPropertyExtractor {
  public paramNameResolver: Function

  constructor() {}

  // 生成子属性提取节点代码
  public generateSubPropertyExtractorCode(
    node: WorkflowNode,
    indent: string,
    branchContext?: any
  ): string {
    let code = ''

    // 获取输入参数
    const dataParam = node.inputData?.find(input => input.paramName === 'data')
    const pathParam = node.inputData?.find(input => input.paramName === 'path')
    const traverseParam = node.inputData?.find(input => input.paramName === 'traverse')
    const conditionParam = node.inputData?.find(input => input.paramName === 'condition')

    if (!dataParam || !pathParam || !traverseParam) {
      return code
    }

    const resultVar = Json2LuaUtil.getNodeVarName(node.id)
    const dataSource = dataParam.source
    const targetVar = this.paramNameResolver(dataSource, branchContext)
    const pathValue = pathParam.source ? pathParam.source : pathParam.defaultValue
    const traverseValue = traverseParam.source === 'true'
    let conditionValue = conditionParam.source
      ? conditionParam.source
      : String(conditionParam.defaultValue)

    // 预处理下条件
    const target = traverseValue ? 'item' : targetVar
    if (conditionValue == '') {
      // 默认兜底
      conditionValue = `${target} ~= nil`
    } else if (conditionValue.includes('item') && !traverseValue) {
      // 非遍历模式下，条件中使用 item 需要替换为 resultVar
      conditionValue = conditionValue.replace(/item/g, target)
    }

    // 预处理下路径
    const pathList = pathValue.split(',')
    const isSinglePath = pathList.length === 1

    // 预处理填充方式
    let fillArrayType = false // 填充方式为table
    if (pathValue.startsWith('[')) {
      // 填充方式为数组
      fillArrayType = true
    }

    // 生成提取逻辑
    if (traverseValue) {
      // 遍历模式
      code += `${indent}-- 属性获取 遍历模式：遍历每个子项\n`
      code += `${indent}${resultVar} = {}\n`
      code += `${indent}for i, item in ipairs(${targetVar}) do\n`
      code += `${indent}\tif ${conditionValue} then\n`
      if (isSinglePath) {
        if (fillArrayType) {
          code += `${indent}\t\ttable.insert(${resultVar}, item${pathValue})\n`
        } else {
          code += `${indent}\t\ttable.insert(${resultVar}, item.${pathValue})\n`
        }
      } else {
        // 多路径
        code += `${indent}\t\tlocal temp = {}\n`
        for (const path of pathList) {
          if (fillArrayType) {
            code += `${indent}\t\ttable.insert(temp, item${path})\n`
          } else {
            code += `${indent}\t\ttemp["${path}"] = item.${path}\n`
          }
        }
        code += `${indent}\t\ttable.insert(${resultVar}, temp)\n`
      }
      code += `${indent}\tend\n`
      code += `${indent}end\n`
    } else {
      // 非遍历模式
      code += `${indent}-- 属性获取 非遍历模式：直接提取\n`
      code += `${indent}${resultVar} = nil\n`
      code += `${indent}if ${conditionValue} then\n`
      if (isSinglePath) {
        if (fillArrayType) {
          code += `${indent}\t${resultVar} = ${targetVar}${pathValue} \n`
        } else {
          code += `${indent}\t${resultVar} = ${targetVar}.${pathValue} \n`
        }
      } else {
        code += `${indent}\tlocal temp = {}\n`
        for (const path of pathList) {
          if (fillArrayType) {
            code += `${indent}\ttable.insert(temp, ${targetVar}${path})\n`
          } else {
            code += `${indent}\ttemp["${path}"] = ${targetVar}.${path}\n`
          }
        }
        code += `${indent}\t${resultVar} = temp\n`
      }
      code += `${indent}end\n`
    }
    return code
  }
}
