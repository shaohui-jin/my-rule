import { useParamStore } from '@/store/modules/params'
import { WorkflowNode } from '@/type/workflow'
import { Json2LuaUtil } from './Json2LuaUtil'

/**
 * 外部数据表代码生成器
 */
export class ExternalDataTable {
  public paramNameResolver: (nodeId: string, branchContext?: any) => string
  
  constructor() {}

  /**
   * 生成外部数据表节点代码
   */
  public generateExternalDataTableCode(node: WorkflowNode, indent: number, expressionLuaCodeMap: any): string {
    const paramStore = useParamStore()
    let code = ''

    // 获取输入参数
    const mainObjParam = node.inputData?.find(input => input.paramName === 'mainObj')
    const sourceParam = node.inputData?.find(input => input.paramName === 'source')
    const expressionParam = node.inputData?.find(input => input.paramName === 'expression')
    const outputContentParam = node.inputData?.find(input => input.paramName === 'outputContent')

    if (!mainObjParam || !sourceParam || !expressionParam || !outputContentParam) {
      code += `${Json2LuaUtil.indent(indent)}-- 错误：缺少必要的输入参数\n`
      return code
    }

    // 获取参数值
    const mainObjSource = mainObjParam.source
    const dataSource = sourceParam.source
    const outputContent = outputContentParam.source as any as string[]

    // 生成自身变量名
    const resultVar = Json2LuaUtil.getNodeVarName(node.id)
    // 处理目标变量名
    const mainObjVar = this.paramNameResolver(mainObjSource)
    // 表达式变量名
    const expressionVar = `exp_external_${node.id}_in_3`
    const expFunc = `local ${expressionVar} = function(row, rst) return ${expressionLuaCodeMap[`${node.id}_in_3`]} end`

    // 1. 获取表名 获取配置表的数据
    const item = paramStore.tableList.find((item: any) => item.databaseId + item.tableName === dataSource)
    code += `${Json2LuaUtil.indent(indent)}local data_source = {databaseId = "${item.databaseId}", tableName = "${item.tableName}", description = "${item.name}"}\n`

    // 2. 定义返回列 读取参数四的数据列表
    const outputContentStr = outputContent.map((item: any) => {
      return `"${item}"`
    })
    code += `${Json2LuaUtil.indent(indent)}local columns = {${outputContentStr.join(",")}}\n`

    // 3. 生成表达式函数
    code += `${Json2LuaUtil.indent(indent)}${expFunc}\n`

    // 4. 调用外部数据查询函数并直接返回结果
    code += `${Json2LuaUtil.indent(indent)}${resultVar} = external_data_query.get_external_data(${mainObjVar}, data_source, ${expressionVar}, columns)\n`

    return code
  }
}
