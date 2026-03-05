import { defineStore } from 'pinia'
import { type WorkflowNode, type InputData, LogicType } from '@/types/workflow'

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
    type: LogicType.GLOBAL_PARAM,
    title: '全局参数',
    icon: 'G',
    iconColor: '#722ed1',
    template: {
      id: '',
      funcType: 'logic',
      logicData: { logicType: LogicType.GLOBAL_PARAM },
      title: '全局参数',
      remark: '引用全局参数(root/context)，将对应的值直接返回给当前节点',
      ...BASE_NODE_CONFIG,
      inputData: [
        {
          paramName: 'paramType',
          type: 'any',
          subType: 'any',
          source: 'root',
          sourceType: 'input',
          portId: 'in_1',
          defaultValue: 'root',
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
              desc: '全场景数据'
            },
            { label: 'context(指定上下文)', value: 'context', desc: '指定上下文' }
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
    funcId: '2',
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
    funcId: '3',
    type: LogicType.CALCULATOR,
    title: '计算器',
    icon: 'C',
    iconColor: '#faad14',
    template: {
      id: '',
      funcType: 'logic',
      logicData: { logicType: LogicType.CALCULATOR, source: '', condition: '' },
      title: '计算器',
      remark:
        '函数名称不受影响，data、data1等为连接当前节点的上游参数\n' +
        'function demo(data, data1, data2) {\n' +
        '    return { data, data1, data2 }\n' +
        '}',
      inputData: [
        {
          paramName: 'data',
          type: 'any',
          subType: 'any',
          source: '',
          sourceType: 'node',
          portId: 'in_1',
          defaultValue: '',
          attributes: {
            paramType: 'any',
            inputType: 'text',
            showLabel: true,
            label: '上游数据'
          }
        }
      ],
      outputData: [
        {
          paramName: 'result',
          type: 'any',
          subType: 'any',
          functionCode:
            'function demo(data, data1, data2) {\n' + '    return { data, data1, data2 }\n' + '}',
          portId: 'out_1'
        }
      ]
    }
  },
  {
    funcId: '4',
    type: LogicType.IFELSE,
    title: '条件函数',
    icon: 'if',
    iconColor: '#1890ff',
    template: {
      id: '',
      funcType: 'logic',
      logicData: { logicType: LogicType.IFELSE, source: '', condition: '' },
      title: '条件判断',
      remark: '填写函数表达式，如 `data === true`，data、data1等为连接当前节点的上游参数',
      inputData: [
        {
          paramName: 'data',
          type: 'any',
          subType: 'any',
          source: '',
          sourceType: 'node',
          portId: 'in_1',
          defaultValue: '',
          attributes: {
            paramType: 'any',
            inputType: 'text',
            showLabel: true,
            label: '上游数据'
          }
        }
      ],
      outputData: [
        { paramName: 'result', type: 'any', subType: 'any', functionCode: '', portId: 'out_1' },
        { paramName: 'result', type: 'any', subType: 'any', functionCode: '', portId: 'out_2' }
      ],
      version: '1.0.0'
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
