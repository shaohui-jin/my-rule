import { defineStore } from 'pinia'
import { type WorkflowNode, type InputData, LogicType } from '@/types/workflow'

export type BaseFunctionNodeType = {
  funcId: string // 唯一标识（用于 Map 存取与事件传递）
  type: LogicType // 逻辑类型（决定渲染与模板分支）
  title: string // 面板展示名称（DndPanel 标题）
  show?: boolean // DndPanel 悬停时会写入，外部可用于控制气泡/提示显隐
  text?: string //  预留的辅助描述字段（未实际使用）【暂未使用】
  template: Partial<WorkflowNode> // 拖拽到画布时克隆的节点模板（由 Designer/DnD 使用）
}

const BaseFunctionNode: BaseFunctionNodeType[] = [
  {
    funcId: '1',
    type: LogicType.GLOBAL_PARAM,
    title: '全局参数',
    template: {
      id: '',
      funcId: '', // 由创建时注入或运行期赋值
      funcType: 'logic',
      logicData: { logicType: LogicType.GLOBAL_PARAM },
      title: '全局参数',
      remark: '引用全局参数(root/context)，将对应的值直接返回给当前节点', // 属性面板中展示
      inputData: [
        {
          paramName: 'paramType',
          type: 'any',
          subType: 'any',
          source: 'root',
          sourceType: 'node',
          portId: 'in_1',
          defaultValue: 'root',
          widgetType: 'select',
          attributes: {
            paramType: 'string',
            inputType: 'text',
            label: '参数类型',
            desc: '这是参数类型的描述'
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
          portId: 'out_1',
          attributes: {
            paramType: 'any',
            inputType: 'text',
            label: '返回结果'
          }
        }
      ]
    }
  },
  {
    funcId: '2',
    type: LogicType.GLOBAL_VARIABLE,
    title: '全局变量',
    template: {
      id: '',
      funcId: '', // 由创建时注入或运行期赋值
      funcType: 'logic',
      logicData: { logicType: LogicType.GLOBAL_VARIABLE },
      title: '全局变量',
      remark: '获取任意节点的结果',
      inputData: [
        {
          paramName: 'nodeId',
          type: 'string',
          source: '',
          sourceType: 'global',
          widgetType: 'select',
          portId: 'in_1',
          defaultValue: '',
          attributes: {
            paramType: 'string',
            inputType: 'text',
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
          portId: 'out_1',
          attributes: {
            paramType: 'any',
            inputType: 'text',
            label: '返回结果'
          }
        }
      ]
    }
  },
  {
    funcId: '3',
    type: LogicType.CALCULATOR,
    title: '计算器',
    template: {
      id: '',
      funcId: '', // 由创建时注入或运行期赋值
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
          sourceType: 'input',
          portId: 'in_1',
          defaultValue: '',
          attributes: {
            paramType: 'any',
            inputType: 'text',
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
          portId: 'out_1',
          attributes: {
            paramType: 'any',
            inputType: 'text',
            label: '返回结果'
          }
        }
      ]
    }
  },
  {
    funcId: '4',
    type: LogicType.IFELSE,
    title: '条件函数',
    template: {
      id: '',
      funcId: '', // 由创建时注入或运行期赋值
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
          sourceType: 'input',
          portId: 'in_1',
          defaultValue: '',
          attributes: {
            paramType: 'any',
            inputType: 'text',
            label: '上游数据'
          }
        }
      ],
      outputData: [
        {
          paramName: 'result',
          type: 'any',
          subType: 'any',
          functionCode: '',
          portId: 'out_1',
          attributes: {
            paramType: 'any',
            inputType: 'text',
            label: 'if'
          }
        },
        {
          paramName: 'result',
          type: 'any',
          subType: 'any',
          functionCode: '',
          portId: 'out_2',
          attributes: {
            paramType: 'any',
            inputType: 'text',
            label: 'else'
          }
        }
      ]
    }
  }
]

export const useFunctionStore = defineStore({
  id: 'base-function',
  state: () => ({
    // 左侧面板可拖拽的基础节点列表（懒加载一次）
    baseFunctionNode: [],
    // 便于 O(1) 按 funcId 查询节点配置
    baseFunctionNodeMap: new Map()
  }),
  getters: {},
  actions: {
    getFuncNode() {
      if (this.baseFunctionNode.length === 0) {
        this.baseFunctionNode = BaseFunctionNode
        this.baseFunctionNode.forEach(item => {
          this.baseFunctionNodeMap.set(item.funcId, item)
        })
      }
      return this.baseFunctionNode
    },
    serBaseFuncNodeShow(funcId: string, show: boolean) {
      const item = this.baseFunctionNodeMap.get(funcId)
      // 悬浮状态标记，仅用于 UI 展示（如有外部组件订阅该状态可进行气泡提示等）
      this.baseFunctionNodeMap.set(funcId, { ...item, show })
    },
    getFuncNodeMap() {
      return this.baseFunctionNodeMap
    }
  }
})
