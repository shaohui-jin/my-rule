import { LogicType } from '@/type/workflow'

export default [
  {
    funcId: '1',
    type: LogicType.IFELSE,
    // type: 'condition',
    title: '条件函数',
    icon: 'if',
    iconColor: '#1890ff'
  },
  {
    funcId: '2',
    type: LogicType.AGGREGATE,
    title: '聚合函数',
    icon: 'Σ',
    iconColor: '#52c41a'
  },
  {
    funcId: '3',
    type: LogicType.GLOBAL_PARAM,
    title: '全局参数',
    icon: 'G',
    iconColor: '#722ed1'
  },
  {
    funcId: '4',
    type: LogicType.SUB_PROPERTY_EXTRACTOR,
    title: '属性获取',
    icon: 'P',
    iconColor: '#13c2c2'
  },
  {
    funcId: '5',
    type: LogicType.GLOBAL_VARIABLE,
    title: '全局变量',
    icon: 'V',
    iconColor: '#eb2f96'
  },
  {
    funcId: '6',
    type: LogicType.TYPE_CONVERTER,
    title: '类型转换',
    icon: 'T',
    iconColor: '#f5222d'
  },
  {
    funcId: '13',
    type: LogicType.DIMENSION_CONVERTER,
    title: '数据转换',
    icon: 'D',
    iconColor: '#2f54eb'
  },
  {
    funcId: '7',
    type: 'custom_function',
    title: '自定义函数',
    icon: 'CF',
    iconColor: '#faad14'
  },
  {
    funcId: '8',
    type: 'iterator',
    title: '迭代',
    icon: 'I',
    iconColor: '#faad14'
  },
  {
    funcId: '10',
    type: 'decision_tables_function',
    title: '决策表',
    icon: 'DT',
    iconColor: '#faad14'
  },
  {
    funcId: '11',
    type: LogicType.EXTERNAL_DATA_TABLE,
    title: '外部数据表',
    icon: 'E',
    iconColor: '#fa8c16'
  },
  {
    funcId: '12',
    type: 'calculator',
    title: '计算器',
    icon: 'C',
    iconColor: '#faad14'
  }
]
