// panelUtils.ts
// 参数面板相关通用工具方法

/**
 * 获取输出参数指向的目标节点信息
 * @param node 当前节点对象
 * @param outputParam 当前outputData项
 * @param workflowData 全量工作流数据（含edges、nodeList）
 * @returns 目标节点名或"未连接"
 */
export function getOutputTargetInfo(node: any, outputParam: any, workflowData: any): string {
  if (!node || !workflowData) return '未连接'
  const portId = outputParam.portId
  const nodeId = node.id
  const edges = workflowData.edges || []
  const nodeList = workflowData.nodeList || []

  // 只精确匹配 source 和 sourcePort
  const edge = edges.find((e: any) => e.source === nodeId && e.sourcePort === portId)
  if (!edge) return '未连接'
  const targetNode = nodeList.find((n: any) => n.id === edge.target)
  if (!targetNode) return `节点${edge.target}`
  return targetNode.title || targetNode.id
}
