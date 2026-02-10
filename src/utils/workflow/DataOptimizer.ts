// ==================== 参数默认值常量 ====================

/**
 * 参数基础属性默认值
 */
export const PARAM_DEFAULT_ATTRIBUTES = {
  hidden: false,
  width: '',
  labelWidth: '',
  labelPosition: '',
  showLabel: true,
  disabled: false,
  size: '',
  cssClass: [],
  inputType: 'text',
  showPassword: false,
  multiple: false,
  filterable: true,
  clearable: true,
  paramGroup: null,
  defaultOptions: null,
  min: undefined,
  max: undefined
}

/**
 * 参数基础配置默认值
 */
const FORM_CONFIG_DEFAULTS = {
  labelWidth: 'auto',
  labelPosition: 'right',
  size: 'default',
  disabled: false,
  scrollToError: true,
  showMessage: true,
  events: { onMounted: '' },
  globalStyle: ''
}

/**
 * 函数配置默认值
 */
export const FUNCTION_CONFIG_DEFAULTS = {
  input: {
    formConfig: {
      ...FORM_CONFIG_DEFAULTS
    },
    widgetList: []
  },
  output: {
    formConfig: {
      ...FORM_CONFIG_DEFAULTS
    },
    widgetList: []
  },
  codeJson: {},
  version: '1.0.0'
}

// ==================== 性能优化缓存 ====================

/**
 * 默认值对象缓存
 */
const DEFAULT_OBJECTS_CACHE = {
  emptyArray: Object.freeze([]),
  emptyObject: Object.freeze({}),
  defaultEvents: Object.freeze({ onChange: '', onMounted: '' }),
  defaultAttributes: Object.freeze({ ...PARAM_DEFAULT_ATTRIBUTES })
}

/**
 * 字符串模板缓存
 */
const STRING_TEMPLATES_CACHE = new Map<string, string>()

/**
 * 获取缓存的字符串模板
 */
function getCachedString(template: string, paramName: string): string {
  const key = `${template}:${paramName}`
  if (!STRING_TEMPLATES_CACHE.has(key)) {
    const result = template.replace('${paramName}', paramName)
    STRING_TEMPLATES_CACHE.set(key, result)
  }
  return STRING_TEMPLATES_CACHE.get(key)!
}

/**
 * 深度比较两个值是否相等（替代JSON.stringify比较）
 */
function deepEqual(a: any, b: any): boolean {
  if (a === b) return true
  if (a == null || b == null) return a === b
  if (typeof a !== typeof b) return false

  if (typeof a === 'object') {
    if (Array.isArray(a) !== Array.isArray(b)) return false

    if (Array.isArray(a)) {
      if (a.length !== b.length) return false
      for (let i = 0; i < a.length; i++) {
        if (!deepEqual(a[i], b[i])) return false
      }
      return true
    }

    const keysA = Object.keys(a)
    const keysB = Object.keys(b)
    if (keysA.length !== keysB.length) return false

    for (const key of keysA) {
      if (!keysB.includes(key) || !deepEqual(a[key], b[key])) return false
    }
    return true
  }

  return false
}

/**
 * 检查值是否为空（统一空值检查）
 */
function isEmpty(value: any): boolean {
  return value === undefined || value === null || value === ''
}

// ==================== 数据压缩功能 ====================

/**
 * 压缩参数数据，只保存非默认值
 * @param param 原始参数数据
 * @returns 压缩后的参数数据
 */
export function compressParamData(param: any): any {
  if (!param) return param

  const compressed: any = {}

  // 基础字段
  if (param.paramName) compressed.paramName = param.paramName
  if (param.id) compressed.id = param.id
  if (param.type) compressed.type = param.type
  if (param.subType) compressed.subType = param.subType
  if (param.source !== undefined) compressed.source = param.source
  if (param.sourceType) compressed.sourceType = param.sourceType
  if (param.portId) compressed.portId = param.portId
  if (param.widgetType) compressed.widgetType = param.widgetType

  // functionCode 字段处理（用于if/else条件表达式存储）
  if (param.functionCode) {
    compressed.functionCode = param.functionCode
  }

  // 默认值处理
  if (!isEmpty(param.defaultValue)) {
    compressed.defaultValue = param.defaultValue
  }

  // 选项处理
  const options = param.options
  if (options && Array.isArray(options) && options.length > 0) {
    compressed.options = options
  }

  // 规则处理
  const rules = param.rules
  if (rules && Array.isArray(rules) && rules.length > 0) {
    compressed.rules = rules
  }

  // 属性处理
  if (param.attributes) {
    const compressedAttrs: any = {}
    const attrs = param.attributes
    const attrKeys = Object.keys(attrs)
    let hasNonDefaultAttrs = false

    // 只保存非默认的属性
    for (const key of attrKeys) {
      const value = attrs[key]
      const defaultValue = PARAM_DEFAULT_ATTRIBUTES[key]

      if (!deepEqual(value, defaultValue) && !isEmpty(value)) {
        compressedAttrs[key] = value
        hasNonDefaultAttrs = true
      }
    }

    // 特殊处理label和placeholder
    if (attrs.label) {
      compressedAttrs.label = attrs.label
      hasNonDefaultAttrs = true
    }
    if (attrs.paramType) {
      compressedAttrs.paramType = attrs.paramType
      hasNonDefaultAttrs = true
    }
    if (attrs.paramSubType) {
      compressedAttrs.paramSubType = attrs.paramSubType
      hasNonDefaultAttrs = true
    }
    if (attrs.paramGroup) {
      compressedAttrs.paramGroup = attrs.paramGroup
      hasNonDefaultAttrs = true
    }

    if (hasNonDefaultAttrs) {
      compressed.attributes = compressedAttrs
    }
  }

  return compressed
}

/**
 * 展开参数数据，恢复完整结构
 * @param compressed 压缩后的参数数据
 * @returns 完整的参数数据
 */
function safeDefault(val: any, def: any) {
  return val !== undefined && val !== null ? val : def
}

export function expandParamData(compressed: any): any {
  if (!compressed) return compressed

  const expanded: any = {}

  // 基础字段
  expanded.paramName = safeDefault(compressed.paramName, '')
  expanded.type = safeDefault(compressed.type, 'string')
  expanded.subType = safeDefault(compressed.subType, null)
  expanded.source = safeDefault(compressed.source, '')
  expanded.sourceType = safeDefault(compressed.sourceType, 'input')
  expanded.portId = safeDefault(compressed.portId, '')
  expanded.widgetType = safeDefault(compressed.widgetType, 'input')

  // functionCode 字段还原（用于if/else条件表达式存储）
  if (compressed.functionCode) {
    expanded.functionCode = compressed.functionCode
  }

  // 生成唯一id
  expanded.id = safeDefault(compressed.id, generateUniqueId())

  // 默认值
  expanded.defaultValue =
    compressed.defaultValue !== undefined ? compressed.defaultValue : undefined

  // 选项
  expanded.options = safeDefault(compressed.options, DEFAULT_OBJECTS_CACHE.emptyArray)

  // 规则
  expanded.rules = safeDefault(compressed.rules, DEFAULT_OBJECTS_CACHE.emptyArray)

  // 属性展开
  const attrs = safeDefault(compressed.attributes, DEFAULT_OBJECTS_CACHE.emptyObject)
  expanded.attributes = {
    ...DEFAULT_OBJECTS_CACHE.defaultAttributes,
    ...attrs,
    // 确保关键字段存在
    label: safeDefault(attrs.label, expanded.paramName),
    placeholder: safeDefault(
      attrs.placeholder,
      getCachedString('请输入${paramName}', expanded.paramName)
    ),
    paramType: safeDefault(attrs.paramType, expanded.type),
    paramSubType: safeDefault(attrs.paramSubType, expanded.subType),
    paramGroup: safeDefault(attrs.paramGroup, null)
  }

  return expanded
}

/**
 * 压缩函数配置数据
 * @param config 原始函数配置
 * @returns 压缩后的函数配置
 */
export function compressFunctionConfig(config: any): any {
  if (!config) return config

  const compressed: any = {}

  // 基础字段
  if (config.className) compressed.className = config.className
  if (config.path) compressed.path = config.path
  if (config.funcLuaName) compressed.funcLuaName = config.funcLuaName

  // 输入配置
  if (config.input) {
    const inputCompressed: any = {}

    // 只保存非默认的formConfig
    const inputFormConfig = config.input.formConfig || DEFAULT_OBJECTS_CACHE.emptyObject
    const defaultFormConfig = FUNCTION_CONFIG_DEFAULTS.input.formConfig
    const formConfigDiff: any = {}
    const formConfigKeys = Object.keys(inputFormConfig)
    let hasFormConfigDiff = false

    for (const key of formConfigKeys) {
      if (!deepEqual(inputFormConfig[key], defaultFormConfig[key])) {
        formConfigDiff[key] = inputFormConfig[key]
        hasFormConfigDiff = true
      }
    }

    if (hasFormConfigDiff) {
      inputCompressed.formConfig = formConfigDiff
    }

    // 压缩widgetList
    const widgetList = config.input.widgetList
    if (widgetList && Array.isArray(widgetList)) {
      inputCompressed.widgetList = widgetList.map(compressParamData)
    }

    const inputKeys = Object.keys(inputCompressed)
    if (inputKeys.length > 0) {
      compressed.input = inputCompressed
    }
  }

  // 输出配置
  if (config.output) {
    const outputCompressed: any = {}

    // 只保存非默认的formConfig
    const outputFormConfig = config.output.formConfig || DEFAULT_OBJECTS_CACHE.emptyObject
    const defaultFormConfig = FUNCTION_CONFIG_DEFAULTS.output.formConfig
    const formConfigDiff: any = {}
    const formConfigKeys = Object.keys(outputFormConfig)
    let hasFormConfigDiff = false

    for (const key of formConfigKeys) {
      if (!deepEqual(outputFormConfig[key], defaultFormConfig[key])) {
        formConfigDiff[key] = outputFormConfig[key]
        hasFormConfigDiff = true
      }
    }

    if (hasFormConfigDiff) {
      outputCompressed.formConfig = formConfigDiff
    }

    // 压缩widgetList
    const widgetList = config.output.widgetList
    if (widgetList && Array.isArray(widgetList)) {
      outputCompressed.widgetList = widgetList.map(compressParamData)
    }

    const outputKeys = Object.keys(outputCompressed)
    if (outputKeys.length > 0) {
      compressed.output = outputCompressed
    }
  }

  // 其他字段
  if (config.codeJson && Object.keys(config.codeJson).length > 0) {
    compressed.codeJson = config.codeJson
  }

  if (config.version && config.version !== FUNCTION_CONFIG_DEFAULTS.version) {
    compressed.version = config.version
  }

  return compressed
}

/**
 * 展开函数配置数据
 * @param compressed 压缩后的函数配置
 * @returns 完整的函数配置
 */
export function expandFunctionConfig(compressed: any): any {
  if (!compressed) return compressed

  const expanded: any = {
    ...FUNCTION_CONFIG_DEFAULTS
  }

  // 基础字段
  if (compressed.className) expanded.className = compressed.className
  if (compressed.path) expanded.path = compressed.path
  if (compressed.funcLuaName) expanded.funcLuaName = compressed.funcLuaName

  // 输入配置展开
  if (compressed.input) {
    expanded.input = {
      formConfig: {
        ...FUNCTION_CONFIG_DEFAULTS.input.formConfig,
        ...compressed.input.formConfig
      },
      widgetList: (compressed.input.widgetList || DEFAULT_OBJECTS_CACHE.emptyArray).map(
        expandParamData
      )
    }
  }

  // 输出配置展开
  if (compressed.output) {
    expanded.output = {
      formConfig: {
        ...FUNCTION_CONFIG_DEFAULTS.output.formConfig,
        ...compressed.output.formConfig
      },
      widgetList: (compressed.output.widgetList || DEFAULT_OBJECTS_CACHE.emptyArray).map(
        expandParamData
      )
    }
  }

  // 其他字段
  if (compressed.codeJson) expanded.codeJson = compressed.codeJson
  if (compressed.version) expanded.version = compressed.version

  return expanded
}

function generateUniqueId() {
  return `widget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}
