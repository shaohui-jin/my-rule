import { http } from '@/axios'

// 云存储表单签名相关类型定义
export interface FormSignRequestParams {
  signType: number // 签名类型
  protocolType: number // 协议类型
  key: string // 文件存储路径
}

export interface FormSignResponse {
  success: boolean // 请求是否成功
  data: {
    url: string // OSS服务地址
    key: string // 文件存储路径
    expireTime: string // 过期时间
    signParams: {
      OSSAccessKeyId: string // OSS访问密钥ID
      policy: string // 策略字符串
      signature: string // 签名
      success_action_status: string // 成功操作状态码
      'x-oss-meta-auth': string // 认证元数据
    }
    formKey: string // 表单键名
    formFile: string // 表单文件字段名
  }
  error: string | null // 错误信息
}

// 获取云存储表单签名
export function getFormSign(params: FormSignRequestParams): Promise<FormSignResponse> {
  return http.post({ url: '/cloudstorage/form-sign', data: params }) as any as Promise<FormSignResponse>
}

// 规则执行记录数据类型定义
export interface ExecutionRecordData {
  id: number // 记录ID
  ruleId: number // 规则ID
  partId: string // 部件ID
  executionResult: string // 执行结果
  executionTime: number // 执行时间
  remark: string // 备注
  ossPath: string // OSS路径
  fileCName: string // 文件中文名
  status: number // 状态
  createTime: number // 创建时间
  modifyTime: number // 修改时间
  creator: string // 创建者
  creatorName: string // 创建者姓名
  modifier: string // 修改者
  modifierName: string // 修改者姓名
  ruleName: string // 规则名称
  ruleDesc: string // 规则描述
  ruleStatus: string // 规则状态
  sceneCategory: string // 场景分类
  ruleType: string // 规则类型
  luaScript: string // 测试Lua脚本
  configData: string // 配置数据
  expectedResult: string // 预期结果
  partName: string // 部件名称
}

// 规则执行记录分页查询相关类型定义
export interface ExecutionRecordRequestParams {
  pageNo: number // 页码
  pageSize: number // 每页大小
  keyword: string // 关键词
  sceneCategory: string // 场景分类
  ruleStatus: string // 规则状态
  ruleType: string // 规则类型
}

export interface ExecutionRecordResponse {
  success: boolean // 请求是否成功
  data: {
    total: number // 总记录数
    pageNo: number // 当前页码
    pageSize: number // 每页大小
    rows: ExecutionRecordData[] // 使用统一的执行记录数据类型
  }
  error: string | null // 错误信息
}

// 获取规则执行记录分页数据
export function getExecutionRecordPage(params: ExecutionRecordRequestParams): Promise<ExecutionRecordResponse> {
  return http.post({ url: '/rule-config/execution-record/page', data: params }) as any as Promise<ExecutionRecordResponse>
}

// 新增规则执行记录相关类型定义
export interface AddExecutionRecordRequestParams {
  ruleId: number // 规则ID
  partId: string // 部件ID
  partName?: string // 部件名称
  executionResult: string // 执行结果
  executionTime: number // 执行时间
  remark: string // 备注
  ossPath: string // OSS路径
  fileCName: string // 文件中文名
  luaScript: string // Lua脚本
  expectedResult?: string
}

export interface AddExecutionRecordResponse {
  success: boolean // 请求是否成功
  data: number // 新增记录ID
  error: string | null // 错误信息
}

// 新增规则执行记录
export function addExecutionRecord(params: AddExecutionRecordRequestParams): Promise<AddExecutionRecordResponse> {
  return http.post({ url: '/rule-config/execution-record/add', data: params }) as any as Promise<AddExecutionRecordResponse>
}

// 规则调试相关类型定义
export interface RuleDebugRequestParams {
  ossPath: string // OSS路径
  productId: string // 产品ID
  returnPartAttributes: string[] // 返回部件属性列表
  luaScript: string // Lua脚本
}

export interface RuleDebugItem {
  id: number // 记录ID
  ruleId: number // 规则ID
  partId: string // 部件ID
  executionResult: string // 执行结果
  executionTime: number // 执行时间
  remark: string // 备注
  ossPath: string // OSS路径
  fileCName: string // 文件中文名
  status: number // 状态
  createTime: number // 创建时间
  modifyTime: number // 修改时间
  creator: string // 创建者
  creatorName: string // 创建者姓名
  modifier: string // 修改者
  modifierName: string // 修改者姓名
  ruleName: string // 规则名称
  ruleDesc: string // 规则描述
  ruleStatus: string // 规则状态
  sceneCategory: string // 场景分类
  order: number // 排序
}

export interface FuncStepLog {
  duration: number // 节点执行时间
  nodeId: number // 节点ID
  order: number // 节点顺序
  success: boolean // 是否成功
  inputParams: any // 输入参数
  result: any // 执行结果
  title: string // 节点名称
  funcType: string // 节点类型
  funcId: number // 节点ID
  logicData: any // 逻辑数据
  remark: string // 备注
}


export interface RuleDebugResponseResult {
  duration: number // 执行时间
  funcStepLogs: FuncStepLog[] // 执行日志
  message: string // 执行结果
  success: boolean // 是否成功
  error?: any // 错误信息
}

export interface RuleDebugResponse {
  success: boolean // 请求是否成功
  data: {
    result: string // 执行结果
    executionTime: number // 执行时间
  }
  error: string | null // 错误信息
}

// 规则调试
export function debugRule(params: RuleDebugRequestParams): Promise<RuleDebugResponse> {
  return http.post({ url: '/rule-config/rule/debug', data: params }) as any as Promise<RuleDebugResponse>
}

// 字典数据类型定义
export interface DictItem {
  id: number // 字典项ID
  code: string // 字典代码
  name: string // 字典名称
  value: string // 字典值
  defValue: string | null // 默认值
  parentId: number // 父级ID
  sort: number // 排序
  sub: boolean // 是否有子项
  children: DictItem[] | null // 子项
}

export interface DictRequestParams {
  codes: string[] // 字典代码列表
}

export interface DictResponse {
  success: boolean // 请求是否成功
  data: DictItem[][] // 字典数据数组，每个元素对应一个字典代码的数据
  error: string | null // 错误信息
}

// 获取字典数据
export function getDictData(params: DictRequestParams): Promise<DictResponse> {
  return http.post({ url: '/umas/common/dict/get', data: params }) as any as Promise<DictResponse>
}

// 规则数据类型定义
export interface RuleItem {
  id: number // 规则ID
  luaScript: string // Lua脚本
  ruleName: string // 规则名称
  configData: string // 配置数据
}

// 简化的规则列表项（用于下拉选择）
export interface SimpleRuleItem {
  id: number | string // 规则ID
  ruleName: string // 规则名称
  hasLuaScript: boolean // 是否包含Lua脚本
}

export interface RuleResponse {
  success: boolean // 请求是否成功
  data: RuleItem[] // 规则数据数组
  error: string | null // 错误信息
}

// 简化的规则列表响应
export interface SimpleRuleResponse {
  success: boolean // 请求是否成功
  data: SimpleRuleItem[] // 简化规则数据数组
  error: string | null // 错误信息
}

// 获取全部逻辑运算的规则
export function getAllRule(): Promise<RuleResponse> {
  return http.post({ url: '/rule-config/rule/getAllRule' }) as any as Promise<RuleResponse>
}

// 获取简化的规则列表（用于下拉选择）
export function getSimpleRuleList(): Promise<SimpleRuleResponse> {
  return http.post({ url: '/rule-config/rule/getAllRule' }) as any as Promise<SimpleRuleResponse>
}

// 根据ID获取单个规则的详细信息
export interface RuleDetailResponse {
  success: boolean // 请求是否成功
  data: {
    id: number | string // 规则ID
    luaScript: string // Lua脚本
    ruleName: string // 规则名称
    configData: string // 配置数据
  }
  error: string | null // 错误信息
}

export function getSimpleRuleById(id: number | string): Promise<RuleDetailResponse> {
  return http.post({ url: '/rule-config/rule/getSimpleRuleById', data: { id } }) as any as Promise<RuleDetailResponse>
}

export interface DeleteExecutionRecordRequestParams {
  id: number // 记录ID
}

export interface DeleteExecutionRecordResponse {
  success: boolean // 请求是否成功
  error: string | null // 错误信息
}

// 删除规则执行记录
export function deleteExecutionRecord(params: DeleteExecutionRecordRequestParams): Promise<DeleteExecutionRecordResponse> {
  return http.post({ url: '/rule-config/execution-record/delete', data: params }) as any as Promise<DeleteExecutionRecordResponse>
}


export interface TestCaseListRequestParams {
  ruleId: number // 规则ID
}

export interface TestCaseResponse {
  success: boolean // 请求是否成功
  data: ExecutionRecordData[]
  error: string | null // 错误信息
}
export interface DeleteTestCaseResponse {
  success: boolean // 请求是否成功
  error: string | null // 错误信息
}

// 获取用例列表
export function getTestCaseList(params: TestCaseListRequestParams): Promise<TestCaseResponse> {
  return http.post({ url: '/rule-config/execution-record/get-test-case', data: params }) as any as Promise<TestCaseResponse>
}

// 删除用例
export function deleteTestCaseApi(params: DeleteExecutionRecordRequestParams): Promise<DeleteTestCaseResponse> {
  return http.post({ url: '/rule-config/execution-record/delete', data: params }) as any as Promise<DeleteTestCaseResponse>
}

// 保存为预期结果相关类型定义
export interface SaveAsExpectedResultRequestParams {
  id: number
  expectedResult: string
}

export interface SaveAsExpectedResultResponse {
  success: boolean // 请求是否成功
  data: number // 更新记录ID
  error: string | null // 错误信息
}

// 保存为预期结果
export function saveAsExpectedResult(params: SaveAsExpectedResultRequestParams): Promise<SaveAsExpectedResultResponse> {
  return http.post({ url: '/rule-config/execution-record/save-expected-result', data: params }) as any as Promise<SaveAsExpectedResultResponse>
}
