import { InputAndOutput, JsDocData } from "@/utils/parser/JSDocParser";

export type SupportedType = 'input' | 'select' | 'switch' | 'inputNumber' | 'textarea' | 'function'

export type FromConfig = {
  formConfig: {
    labelWidth: string // 文案宽度
    labelPosition: string // 文案排布
    size: 'default' // 组件大小
    events: { onMounted: '' } // 事件
  },
  compList: Array<any>
}

export type FormAttribute = {
  defaultValue: any,
  label: string // 文案
  placeholder:  string
  labelWidth: '' // 单独文案宽度
  disabled: false // 禁用状态
  cssClass: string[]
  paramType: string // 参数类型
  compType: SupportedType // 组件类型
  min: number
  max: number
}

// 支持的组件类型列表
const SUPPORTED_COMPONENT_TYPES: SupportedType[] = [
  'input',
  'select',
  'switch',
  'inputNumber',
  'textarea',
  'function'
]

// 默认表单配置
export const DEFAULT_FORM_CONFIG: FromConfig = {
  formConfig: {
    labelWidth: '70px',
    labelPosition: 'right',
    size: 'default',
    events: { onMounted: '' },
  },
  compList: []
}

// 默认组价配置
const DEFAULT_COMP_ATTRIBUTE: FormAttribute = {
  defaultValue: '',
  label: '这是组件文案',
  placeholder: '这是组件未填充提示文案',
  labelWidth: '',
  disabled: false,
  cssClass: [],
  paramType: undefined,
  compType: undefined,
  min: undefined,
  max: undefined,
}

export default class FormParser {

  constructor() {}

  /**
   * 根据输入或输出rst解析生成对应的组件配置
   */
  parseJsToFormConfig(common: InputAndOutput[]): FromConfig {
    // 创建基础表单配置
    const formConfig = JSON.parse(JSON.stringify(DEFAULT_FORM_CONFIG))

    common.forEach((item) => {
      const comp = this.createComponent(item, SUPPORTED_COMPONENT_TYPES)
      if (comp) {
        formConfig.compList.push(comp)
      }
    })
    console.log('common', common)
    console.log('formConfig', formConfig)
    return formConfig
  }

  createComponent(param: InputAndOutput, supportedTypes: string[]) {
    const componentType = this.getCompType(param)
    if (!supportedTypes.includes(componentType)) {
      return null
    }

    let baseAttributes = {
      id: param.key,
      attributes: {
        ...JSON.parse(JSON.stringify(DEFAULT_COMP_ATTRIBUTE)),
        label: param.name,
        paramType:
          ['object', 'object[]'].includes(param.type)
            ? `${JSON.stringify(param.typeRecord)}${param.type.includes('[]') ? '[]' : ''}`
            : param.type,
        compType: componentType,
        placeholder: param.type.endsWith('[]')
          ? `请输入${param.name || param.name}（$${
            ['string', 'number'].includes(param.type.replace('[]', ''))
              ? '多个值用逗号分隔'
              : 'JSON格式'
          }）`
          : ''
      }
    }

    return baseAttributes
  }

  /**
   * 根据配置获取组件类型
   * @param param
   */
  getCompType(param: InputAndOutput): SupportedType {
    // // 如果有选项，优先使用select或switch
    // if (param.options && Array.isArray(param.options)) {
    //   if (param.type === 'boolean' && param.componentType !== 'select') {
    //     return 'switch'
    //   }
    //   return 'select'
    // }
    // 根据类型确定组件
    switch (param.type) {
      case 'string':
        return 'input'
      case 'number':
        return 'inputNumber'
      case 'boolean':
        return 'switch'
      case 'any':
      case 'object':
        return 'input'
      case 'function':
        return 'function'
      default:
        // 处理数组类型
        if (param.type.endsWith('[]')) {
          const elementType = param.type.replace('[]', '')
          // 简单类型使用input，复杂类型使用textarea
          return ['string', 'number'].includes(elementType) ? 'input' : 'textarea'
        }
        return 'input'
    }
  }

}
