import nodeIdFactory from './NodeIdFactory'
import { type WorkflowNode, LogicType, GroupNodeData } from '@/type/workflow'
import { CustomNode, getCustomNodeConfig } from '@/utils/manager/CustomNodeManager'
import { GroupNode } from '../workflow/GroupNode'

export const createNewNode = (nodeData: WorkflowNode): Node => {
  const newId = nodeIdFactory.next()
  // 创建新的节点数据
  const newNodeData: WorkflowNode = {
    ...nodeData,
    id: newId,
    pos: {
      x: nodeData.pos?.x || 0,
      y: (nodeData.pos?.y || 0) + 120
    },
    inputData: nodeData.inputData.map(input => ({
      ...input,
      source: input.sourceType === 'node' ? '' : input.source
    }))
  }

  // 使用NodeFactory创建X6节点
  const x6Node = createX6Node(newNodeData)
  return x6Node
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

/**
 * 创建X6节点
 * @param nodeData 节点数据
 * @param isPreview 是否为预览节点
 * @returns X6节点实例
 */
export function createX6Node(nodeData: WorkflowNode, isPreview = false) {
  const config = getCustomNodeConfig(nodeData)
  console.log('createX6Node', nodeData)
  console.log('config', config)
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

export {}
