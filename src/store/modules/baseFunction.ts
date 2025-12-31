import { defineStore } from 'pinia'
import { type WorkflowNode, type InputData, LogicType } from '@/type/workflow'

export type BaseFunctionNodeType = {
  funcId: string
  type: LogicType
  title: string
  icon: string
  iconColor: string
  show?: boolean
  text?: string
  template: Partial<WorkflowNode>
}

// 基础节点配置
const BASE_NODE_CONFIG = {
  funcId: '',
  inputData: [
    {
      paramName: 'data',
      type: 'table',
      subType: 'any',
      source: '',
      sourceType: 'node',
      portId: 'in_1'
    }
  ] as InputData[],
  outputData: [
    {
      paramName: 'result',
      type: 'table',
      subType: 'any',
      portId: 'out_1'
    }
  ]
}

const BaseFunctionNode: BaseFunctionNodeType[] = [
  {
    funcId: '1',
    type: LogicType.IFELSE,
    title: '条件函数',
    icon: 'if',
    iconColor: '#1890ff',
    template: {
      id: '',
      funcType: 'logic',
      logicData: { logicType: LogicType.IFELSE, source: '', condition: '' },
      title: '条件判断',
      funcId: '',
      inputData: [
        {
          paramName: 'data',
          type: 'any',
          subType: 'any',
          source: '',
          sourceType: 'node',
          portId: 'in_1',
          defaultValue: ''
        }
      ],
      outputData: [
        { paramName: 'result', type: 'table', subType: 'any', conditionCheck: '', portId: 'out_1' },
        { paramName: 'result', type: 'table', subType: 'any', conditionCheck: '', portId: 'out_2' }
      ],
      version: '1.0.0'
    }
  },
  {
    funcId: '2',
    type: LogicType.AGGREGATE,
    title: '聚合函数',
    icon: 'Σ',
    iconColor: '#52c41a',
    template: {
      id: '',
      funcType: 'logic',
      logicData: { logicType: LogicType.AGGREGATE, source: '', condition: '' },
      title: '聚合函数',
      remark:
        '将任意多个值合并成一个table并去重,复杂对象以Id为key, 如果存在多个返回值存在相同Id的对象, 则以最后一个为准',
      ...BASE_NODE_CONFIG,
      inputData: [
        {
          paramName: 'ukey',
          type: 'any',
          subType: 'any',
          source: '',
          sourceType: 'input',
          portId: 'in_1',
          widgetType: 'input',
          attributes: {
            paramType: 'string',
            inputType: 'text',
            showLabel: true,
            label: '去重标识'
          },
          defaultValue: 'id'
        }
      ]
    }
  },
  {
    funcId: '3',
    type: LogicType.GLOBAL_PARAM,
    title: '全局参数',
    icon: 'G',
    iconColor: '#722ed1',
    template: {
      id: '',
      funcType: 'logic',
      logicData: { logicType: LogicType.GLOBAL_PARAM },
      title: '全局参数',
      remark: '引用全局参数(root/target/context)，将对应的值直接返回给当前节点',
      ...BASE_NODE_CONFIG,
      inputData: [
        {
          paramName: 'paramType',
          type: 'any',
          subType: 'any',
          source: 'target[]',
          sourceType: 'input',
          portId: 'in_1',
          defaultValue: 'target[]',
          widgetType: 'select',
          attributes: {
            paramType: 'string',
            inputType: 'text',
            showLabel: true,
            label: '参数类型'
          },
          options: [
            {
              label: 'root(全场景数据)',
              value: 'root',
              desc: '全场景数据，包含软装、硬装、成品等'
            },
            { label: 'target(指定素材对象)', value: 'target', desc: '指定素材对象' },
            {
              label: 'target[](指定素材列表)',
              value: 'target[]',
              desc: '指定素材列表，进行规则执行的素材对象组'
            },
            { label: 'context(指定上下文)', value: 'context', desc: '指定上下文' }
          ]
        }
      ]
    }
  },
  {
    funcId: '4',
    type: LogicType.SUB_PROPERTY_EXTRACTOR,
    title: '属性获取',
    icon: 'P',
    iconColor: '#13c2c2',
    template: {
      id: '',
      funcType: 'logic',
      logicData: { logicType: LogicType.SUB_PROPERTY_EXTRACTOR },
      title: '属性获取',
      remark: '提取数据源的子属性\n 路径支持：[N].xxx[N1].xx\n 根据是否遍历 返回一或N个值',
      ...BASE_NODE_CONFIG,
      inputData: [
        {
          paramName: 'data',
          type: 'any',
          subType: 'any',
          source: '',
          sourceType: 'node',
          portId: 'in_1',
          attributes: {
            paramType: 'any',
            inputType: 'text',
            showLabel: true,
            label: '数据源'
          },
          defaultValue: ''
        },
        {
          paramName: 'path',
          type: 'string',
          source: '',
          sourceType: 'input',
          widgetType: 'input',
          attributes: {
            paramType: 'string',
            inputType: 'text',
            showLabel: true,
            label: '提取路径'
          },
          portId: 'in_2',
          defaultValue: 'id'
        },
        {
          paramName: 'traverse',
          type: 'input',
          widgetType: 'select',
          source: 'false',
          sourceType: 'input',
          portId: 'in_3',
          defaultValue: false,
          attributes: {
            paramType: 'boolean',
            showLabel: true,
            inputType: 'text',
            label: '是否遍历'
          },
          options: [
            { label: '是', value: 'true' },
            { label: '否', value: 'false' }
          ]
        },
        {
          paramName: 'condition',
          type: 'string',
          source: '',
          sourceType: 'input',
          widgetType: 'input',
          attributes: {
            paramType: 'string',
            inputType: 'text',
            showLabel: true,
            label: '提取条件'
          },
          portId: 'in_4',
          defaultValue: 'item ~= nil'
        }
      ],
      outputData: [
        {
          paramName: 'data',
          type: 'any',
          subType: 'any',
          portId: 'out_1'
        }
      ]
    }
  },
  {
    funcId: '5',
    type: LogicType.GLOBAL_VARIABLE,
    title: '全局变量',
    icon: 'V',
    iconColor: '#eb2f96',
    template: {
      id: '',
      funcType: 'logic',
      logicData: { logicType: LogicType.GLOBAL_VARIABLE },
      title: '全局变量',
      remark: '获取任意节点的结果',
      ...BASE_NODE_CONFIG,
      inputData: [
        {
          paramName: 'nodeId',
          type: 'string',
          source: '',
          sourceType: 'input',
          widgetType: 'select',
          portId: 'in_1',
          defaultValue: '',
          attributes: {
            paramType: 'string',
            inputType: 'text',
            showLabel: true,
            label: '节点Id'
          },
          options: []
        }
      ],
      outputData: [
        {
          paramName: 'result',
          type: 'any',
          subType: 'any',
          portId: 'out_1'
        }
      ]
    }
  },
  {
    funcId: '6',
    type: LogicType.TYPE_CONVERTER,
    title: '类型转换',
    icon: 'T',
    iconColor: '#f5222d',
    template: {
      id: '',
      funcType: 'logic',
      logicData: { logicType: LogicType.TYPE_CONVERTER },
      title: '类型转换',
      remark: '将上游传递的值强制转换成指定类型',
      ...BASE_NODE_CONFIG,
      inputData: [
        {
          paramName: 'data',
          type: 'any',
          subType: 'any',
          source: '',
          sourceType: 'node',
          portId: 'in_1',
          attributes: {
            paramType: 'any',
            inputType: 'text',
            showLabel: true,
            label: '数据源'
          },
          defaultValue: ''
        },
        {
          paramName: 'convertType',
          type: 'string',
          source: 'toTable',
          sourceType: 'input',
          widgetType: 'select',
          portId: 'in_2',
          defaultValue: 'toTable',
          attributes: {
            paramType: 'string',
            inputType: 'text',
            showLabel: true,
            label: '转换方式'
          },
          options: [
            { label: '转成字符串', value: 'toString' },
            { label: '转成数值', value: 'toNumber' },
            { label: '转成table', value: 'toTable' },
            { label: '转成布尔', value: 'toBoolean' }
          ]
        }
      ],
      outputData: [
        {
          paramName: 'result',
          type: 'any',
          subType: 'any',
          portId: 'out_1'
        }
      ]
    }
  },
  {
    funcId: '7',
    type: LogicType.CALCULATOR,
    title: '计算器',
    icon: 'C',
    iconColor: '#faad14',
    template: {
      id: '',
      funcType: 'logic',
      logicData: { logicType: LogicType.CALCULATOR, source: '', condition: '' },
      title: '计算器',
      funcId: '',
      inputData: [
        {
          paramName: 'data',
          type: 'any',
          subType: 'any',
          source: '',
          sourceType: 'node',
          portId: 'in_1',
          defaultValue: ''
        }
      ],
      outputData: [
        { paramName: 'result', type: 'any', subType: 'any', conditionCheck: '', portId: 'out_1' }
      ],
      version: '1.0.0'
    }
  },
  {
    funcId: '8',
    type: LogicType.ITERATOR,
    title: '迭代',
    icon: 'I',
    iconColor: '#faad14',
    template: {
      id: '',
      funcType: 'logic',
      logicData: { logicType: LogicType.ITERATOR, source: '', condition: '' },
      title: '迭代',
      remark: '对数组数据遍历',
      ...BASE_NODE_CONFIG
    }
  },
  {
    funcId: '9',
    type: LogicType.DIMENSION_CONVERTER,
    title: '数据转换',
    icon: 'D',
    iconColor: '#2f54eb',
    template: {
      id: '',
      funcType: 'logic',
      logicData: { logicType: LogicType.DIMENSION_CONVERTER },
      title: '数据转换',
      remark:
        '对数据进行数据转换操作，支持筛选、提取、转成字符串、转成数值、转成table、转成布尔等操作',
      ...BASE_NODE_CONFIG,
      inputData: [
        {
          paramName: 'data',
          type: 'any',
          subType: 'any',
          source: '',
          sourceType: 'node',
          portId: 'in_1',
          attributes: {
            paramType: 'any',
            inputType: 'text',
            showLabel: true,
            label: '数据源'
          },
          defaultValue: ''
        },
        {
          paramName: 'option',
          type: 'string',
          source: 'upgrade',
          sourceType: 'input',
          widgetType: 'select',
          portId: 'in_2',
          defaultValue: 'upgrade',
          attributes: {
            paramType: 'string',
            inputType: 'text',
            showLabel: true,
            label: '转换方式'
          },
          options: [
            { label: '升维', value: 'upgrade' },
            { label: '降维(并使用筛选逻辑)', value: 'downgrade_filter' },
            { label: '降维(并使用提取逻辑)', value: 'downgrade_extract' },
            { label: '转成字符串', value: 'toString' },
            { label: '转成数值', value: 'toNumber' },
            { label: '转成布尔', value: 'toBoolean' }
          ]
        },
        {
          paramName: 'expression',
          type: 'function',
          subType: 'any',
          source: '',
          sourceType: 'input',
          widgetType: 'function',
          portId: 'in_3',
          attributes: {
            paramType: 'function',
            inputType: 'text',
            showLabel: true,
            label: '表达式'
          },
          defaultValue: ''
        }
      ]
    }
  }
]

export const useFunctionStore = defineStore({
  id: 'base-function',
  state: () => ({
    baseFunctionNode: [],
    baseFunctionNodeMap: new Map()
  }),
  getters: {},
  actions: {
    getFuncNode() {
      if (this.baseFunctionNode.length === 0) {
        this.baseFunctionNode = BaseFunctionNode
        console.log('baseFunctionNodeMap', this.baseFunctionNodeMap)
        this.baseFunctionNode.forEach(item => {
          console.log('baseFunctionNodeMap', this.baseFunctionNodeMap)
          this.baseFunctionNodeMap.set(item.funcId, item)
        })
      }
      return this.baseFunctionNode
    },
    serBaseFuncNodeShow(funcId: string, show: boolean) {
      const item = this.baseFunctionNodeMap.get(funcId)
      this.baseFunctionNodeMap.set(funcId, { ...item, show })
    },
    getFuncNodeMap() {
      return this.baseFunctionNodeMap
    }
  }
})
