import { http } from '@/axios'
import { ElMessage } from 'element-plus'


/**
 * 获取函数列表
 * @param params 分页参数
 * @returns Promise<FunctionListResponse>
 */
export async function getLuaByExpression(expression: string) {
  const res = await http.post({
    url: '/rule-config/rule/expr/toLua',
    data: {
      expression,
      addVariablePrefix: !expression.includes('rst') && !expression.includes('row')
    }
  })
  if (res.success) {
    return res.data
  } else {
    ElMessage.error(res.message)
    return []
  }
}

/**
 * 批量获取表达式lua代码
 * @param expressions 表达式列表
 * @returns Promise<FunctionListResponse>
 */
export async function batchGetLuaByExpressions(expressions: string[]) {
  let expressionParams: any = [];
  for (const expression of expressions) {
    expressionParams.push({
      expression,
      addVariablePrefix: !String(expression).includes('rst')
    })
  }
  const res = await http.post({
    url: '/rule-config/rule/expr/toLua/batch',
    data: expressionParams
  })
  if (res.success) {
    return res.data
  } else {
    ElMessage.error(res.message)
    return []
  }
}
