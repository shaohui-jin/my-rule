import { WorkflowData } from '@/type/workflow'
import { http } from '@/utils/http'
import { ElMessage } from 'element-plus'
import { expandFunctionConfig } from '@/utils/workflow/DataOptimizer'

// 函数配置数据类型
export interface FunctionConfigData {
  input: any[]
  output: any[]
  logicData?: any
  path: string
  className: string
  funcLuaName: string
}

// 函数项数据类型
export interface FunctionItem {
  id: string
  funcName: string
  funcDesc: string
  configData: string,
  children?: any[]
}

// 转换后的函数节点类型
export interface FunctionNode {
  icon: string
  type: string
  title: string
  funcId: string
  remark: string
  inputData: any[]
  outputData: any[]
  logicData: any
  path: string
  className: string
  funcName: string
}

// 分页请求参数类型
export interface FunctionListParams {
  pageNo: number
  pageSize: number
  keyword?: string
  funcCategory?: string
  isMyFunction?: boolean
}

// 分页响应数据类型
export interface FunctionListResponse {
  rows: FunctionItem[]
  total: number
}

/**
 * 获取函数列表
 * @param params 分页参数
 * @returns Promise<FunctionListResponse>
 */
// export async function getFunctionList(params: FunctionListParams): Promise<FunctionItem[]> {
export async function getFunctionList(): Promise<FunctionItem[]> {
  // const requestParams = {
  //   data: {
  //     pageNo: params.pageNo,
  //     pageSize: params.pageSize,
  //     keyword: params.keyword || '',
  //     funcCategory: params.funcCategory || '',
  //     isMyFunction: params.isMyFunction || false,
  //     sortOrder: 'asc', // 排序方式
  //     sortField: "func_name",
  //     searchId: 0 // 搜索方式
  //   }
  // }
  const res = await http.post<any, any>('rule-config/func/find-func-with-classify')
  // const res = await http.post<any, any>('rule-config/func/page', requestParams)
  if (res.success) {
    return res.data
  } else {
    ElMessage.error(res.message)
    return []
  }
}

/**
 * 获取函数列表
 * @param params 分页参数
 * @returns Promise<FunctionListResponse>
 */
export async function getFunctionListByIds(ids: string[]): Promise<FunctionItem[]> {
  const requestParams = {
    data: {
      funcIds: ids
    }
  }
  const res = await http.post<any, any>('/rule-config/func/batchDetail', requestParams)
  if (res.success) {
    return res.data
  } else {
    ElMessage.error(res.message)
    return []
  }
}

export async function updateRule(
  id: string,
  workflowData: WorkflowData,
  luaCode: string,
  funcIds: string[],
  expressionParamArr: any[],
  modifyReason: string
) {
  const configData = JSON.stringify(workflowData)
  const nodeList = workflowData.nodeList;
  for (let node of nodeList) {
    if (node.title === '决策表' && node.decisionTableData?.expressionConfig?.children?.length) {
      expressionParamArr.push(node.decisionTableData.expressionConfig);
    }
  }
  const expressionParamData = JSON.stringify(expressionParamArr)
  const requestParams = {
    data: {
      id: id,
      configData: configData,
      luaScript: luaCode,
      funcIds: funcIds,
      variableSet: expressionParamData,
      modifyReason: modifyReason
    }
  }
  const res = await http.post<any, any>('/rule-config/rule/update/config', requestParams)
  if (res.success) {
    ElMessage.success('规则更新成功')
    return res.data
  } else {
    ElMessage.error(res.message)
    return false
  }
}

/**
 * 转换函数数据为节点格式
 * @param item 原始函数数据
 * @returns FunctionNode
 */
export function transformFunctionData(item: FunctionItem): FunctionNode {
  const temp: FunctionNode = {
    icon: 'icon-func',
    type: 'func',
    title: item.funcName,
    funcId: item.id,
    remark: item.funcDesc,
    inputData: [],
    outputData: [],
    logicData: {},
    path: '',
    className: '',
    funcName: ''
  }

  let jsonData: FunctionConfigData
  try {
    // 先解析JSON
    const parsedData = JSON.parse(item.configData)
    // 展开函数配置数据以恢复完整结构
    jsonData = expandFunctionConfig(parsedData)
    temp.inputData = jsonData?.input || []
    temp.outputData = jsonData?.output || []
    temp.logicData = jsonData?.logicData || {}
    temp.path = jsonData?.path || ''
    temp.className = jsonData?.className || ''
    temp.funcName = jsonData?.funcLuaName || ''
  } catch (error) {
    console.error('解析函数配置数据失败: ' + item.funcName + '  配置数据不满足要求')
  }

  return temp
}
