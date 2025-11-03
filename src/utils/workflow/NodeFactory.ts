import { nodeIdFactory } from './NodeIdFactory'
import { type WorkflowNode, LogicType, GroupNodeData } from '@/type/workflow'
import { CustomNode, getCustomNodeConfig } from '@/utils/workflow/CustomNode'
import { GroupNode } from './GroupNode'
import { IteratorNode } from './IteratorNode'
import { LOGIC_NODE_TEMPLATES } from './BaseLogicConfig'
import { getIteratorData } from './IteratorManager'
import { useParamStore } from '@/store/modules/params'

const paramStore = useParamStore()
// 创建逻辑节点
export function createLogicNode(type: keyof typeof LOGIC_NODE_TEMPLATES, funcId?:  string): WorkflowNode {
  const base = LOGIC_NODE_TEMPLATES[type]

  // 特殊处理 funcId = 9 的
  if (funcId === '9') {
    base.version = '2.0.0'
  }

  return {
    ...JSON.parse(JSON.stringify(base)),
    id: nodeIdFactory.next()
  } as WorkflowNode
}

// 创建函数节点
export function createFuncNode(funcMeta: any): WorkflowNode {
  return {
    id: nodeIdFactory.next(),
    funcType: 'func',
    funcId: funcMeta.funcId,
    title: funcMeta.title || funcMeta.label,
    inputData: (funcMeta.inputData?.widgetList || []).map((widget: any, idx: number) => ({
      paramName: widget.id,
      type: widget.attributes.paramType, //参数类型
      subType: widget.attributes.paramSubType, //参数子类型
      widgetType: widget.type, //控件类型
      source: ['table', 'any'].includes(widget.attributes.paramType) ? '' : widget.defaultValue,
      sourceType:
        ['table', 'any'].includes(widget.attributes.paramType) && !widget.attributes.multiple
          ? 'node'
          : 'input',
      portId: `in_${idx + 1}`,
      defaultValue: widget.defaultValue,
      options: widget.options,
      rules: widget.rules, // 规则 是否必须
      attributes: widget.attributes // 属性
    })),
    outputData: (funcMeta.outputData?.widgetList || []).map((widget: any, idx: number) => ({
      paramName: widget.id,
      type: widget.attributes.paramType,
      subType: widget.attributes.paramSubType,
      widgetType: widget.type,
      portId: `out_${idx + 1}`,
      defaultValue: widget.defaultValue,
      options: widget.options,
      rules: widget.rules,
      attributes: widget.attributes
    })),
    pos: { x: 100, y: 100 },
    remark: funcMeta.remark || ''
  } as WorkflowNode
}

function setExteranlData(nodeData: WorkflowNode){

  const tableList = paramStore.tableList
  console.log('nodeData====', tableList)
  const sourceData = nodeData.inputData?.find((item: any) => item.paramName === 'source')
  const outputContent = nodeData.inputData?.find((item: any) => item.paramName === 'outputContent')

  sourceData.options = []
  outputContent.dynamicOptions = {}
  tableList.forEach((item: any) => {
    const onlyKey = item.databaseId + item.tableName
    sourceData.options.push({ label: item.name, value: onlyKey })
    outputContent.dynamicOptions[onlyKey] = item.children.map((child: any) => ({ label: child.name, value: child.code }))
  })
}

/**
 * 创建X6节点
 * @param nodeData 节点数据
 * @param isPreview 是否为预览节点
 * @returns X6节点实例
 */
export function createX6Node(nodeData: WorkflowNode, isPreview = false) {
  // 如果是迭代器节点，使用特殊的IteratorNode
  if (nodeData.logicData?.logicType === LogicType.ITERATOR) {
    return createIteratorNodeInstance({
      id: nodeData.id,
      x: isPreview ? 0 : nodeData.pos?.x || 0,
      y: isPreview ? 0 : nodeData.pos?.y || 0
    })
  }

  if (nodeData.logicData?.logicType === LogicType.EXTERNAL_DATA_TABLE) {
    setExteranlData(nodeData)
  }

  const config = getCustomNodeConfig(nodeData)
  const rectNode = new CustomNode({
    id: config.id,
    x: isPreview ? 0 : nodeData.pos?.x || 0,
    y: isPreview ? 0 : nodeData.pos?.y || 0,
    width: config.width,
    height: config.height,
    data: config.data,
    attrs: config.attrs,
    label: nodeData.title,
    markup: config.markup,
    ports: config.ports
  })
  // console.log('rectNode====', config, nodeData)
  if (nodeData.isCollapsed) {
    // console.log('nodeData====', rectNode)
    rectNode.toggleCollapse()
  }
  return rectNode
}

export function createGroupNode(groupData: GroupNodeData) {
  return new GroupNode({
    id: groupData.id || nodeIdFactory.next(),
    x: groupData.pos.x,
    y: groupData.pos.y,
    width: groupData.width,
    height: groupData.height,
    zIndex: -1, // 确保在最底层
    attrs: {
      label: { text: groupData.title }
    },
    isCollapsed: groupData.isCollapsed || false
  })
}

/**
 * 统一的迭代器节点创建方法
 * @param options 迭代器节点配置选项
 * @returns 迭代器节点实例
 */
export function createIteratorNodeInstance(options: { id: string; x: number; y: number }): any {
  const config = getIteratorData(options)
  return new IteratorNode(config)
}

export {}
