import { WorkflowData, WorkflowNode } from '@/type/workflow'
import { Json2LuaUtil } from './Json2LuaUtil'

/**
 * 字段路径解析器
 * 用于解析和验证字段路径，生成Lua访问代码
 */
class FieldPathResolver {
  /**
   * 解析字段路径为路径数组
   * @param fieldPath 字段路径，如 "part.id"
   * @returns 路径数组
   */
  static parse(fieldPath: string): string[] {
    return fieldPath.split('.').filter(Boolean)
  }
  /**
   * 生成Lua字段访问代码
   * @param fieldPath 字段路径
   * @returns Lua访问代码，如 "item.part.id"
   */
  static generateLuaAccess(fieldPath: string): string {
    const parts = this.parse(fieldPath)
    return parts.join('.')
  }
  /**
   * 验证字段路径格式
   * @param fieldPath 字段路径
   * @returns 是否有效
   */
  static validatePath(fieldPath: string): boolean {
    if (!fieldPath || typeof fieldPath !== 'string') return false
    // 验证字段路径格式：只允许字母、数字、下划线和点号
    return /^[a-zA-Z_][a-zA-Z0-9_.]*$/.test(fieldPath)
  }
  /**
   * 生成Lua字段存在性检查代码
   * @param fieldPath 字段路径
   * @param indent 缩进级别
   * @returns Lua检查代码
   */
  static generateExistenceCheck(fieldPath: string, indent: number): string {
    const parts = this.parse(fieldPath)
    let checkCode = ''
    let currentPath = 'item'
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      checkCode += `${Json2LuaUtil.indent(indent)}if ${currentPath} and ${currentPath}.${part} then\n`
      currentPath += `.${part}`
    }
    return checkCode
  }
}

/**
 * 类型兼容性检查器
 * 用于检查节点类型兼容性，过滤不兼容的输入节点
 */
class TypeCompatibilityChecker {
  /**
   * 检查两个节点是否类型兼容
   * @param node1 第一个节点
   * @param node2 第二个节点
   * @returns 是否兼容
   */
  static isCompatible(node1: WorkflowNode, node2: WorkflowNode): boolean {
    const output1 = node1.outputData?.[0]
    const output2 = node2.outputData?.[0]
    if (!output1 || !output2) return false
    // 检查基础类型
    if (output1.type !== output2.type) return false
    // 检查子类型（对于复杂对象数组）
    if (output1.type === 'table' && output1.subType && output2.subType) {
      return this.isSubTypeCompatible(output1.subType, output2.subType)
    }
    return true
  }
  /**
   * 检查子类型是否兼容
   * @param subType1 第一个子类型
   * @param subType2 第二个子类型
   * @returns 是否兼容
   */
  private static isSubTypeCompatible(subType1: string, subType2: string): boolean {
    // 如果子类型完全相同，则兼容
    if (subType1 === subType2) return true
    // 解析子类型结构并比较
    // 例如：{part:table,left:boolean}[] 和 {part:table,left:boolean,right:string}[]
    // 应该被认为是兼容的（前者是后者的子集）
    // 移除数组标记
    const cleanSubType1 = subType1.replace(/\[\]$/, '')
    const cleanSubType2 = subType2.replace(/\[\]$/, '')
    // 如果都是对象类型，检查字段兼容性
    if (
      cleanSubType1.startsWith('{') &&
      cleanSubType1.endsWith('}') &&
      cleanSubType2.startsWith('{') &&
      cleanSubType2.endsWith('}')
    ) {
      return this.isObjectStructureCompatible(cleanSubType1, cleanSubType2)
    }
    return false
  }
  /**
   * 检查对象结构是否兼容
   * @param struct1 第一个对象结构
   * @param struct2 第二个对象结构
   * @returns 是否兼容
   */
  private static isObjectStructureCompatible(struct1: string, struct2: string): boolean {
    try {
      // 解析对象结构
      const fields1 = this.parseObjectStructure(struct1)
      const fields2 = this.parseObjectStructure(struct2)
      // 检查第一个结构的所有字段是否在第二个结构中存在且类型兼容
      for (const [fieldName, fieldType] of Object.entries(fields1)) {
        if (!fields2[fieldName] || fields2[fieldName] !== fieldType) {
          return false
        }
      }
      return true
    } catch {
      return false
    }
  }
  /**
   * 解析对象结构字符串
   * @param struct 对象结构字符串，如 "{part:table,left:boolean}"
   * @returns 字段映射
   */
  private static parseObjectStructure(struct: string): Record<string, string> {
    const fields: Record<string, string> = {}
    // 移除首尾的大括号
    const content = struct.slice(1, -1)
    // 分割字段
    const fieldParts = content.split(',').map(part => part.trim())
    for (const part of fieldParts) {
      const colonIndex = part.indexOf(':')
      if (colonIndex > 0) {
        const fieldName = part.substring(0, colonIndex).trim()
        const fieldType = part.substring(colonIndex + 1).trim()
        fields[fieldName] = fieldType
      }
    }
    return fields
  }
}

export class Aggregate {
  private workflow: WorkflowData
  constructor() {}

  public setWorkflow(workflow: WorkflowData) {
    this.workflow = workflow
  }
  public clearWorkflow() {
    this.workflow = null
  }

  // 生成聚合节点代码
  public generateAggregateCode(node: WorkflowNode, indent: number): string {
    let code = ''

    // 获取所有输入节点
    const inputNodes = this.getInputNodes(node)
    if (inputNodes.length === 0) {
      return code
    }

    // 获取ukey参数值
    const ukeyParam = node.inputData?.find(input => input.paramName === 'ukey')
    const ukey = ukeyParam?.source || ''

    // 如果指定了ukey，进行类型兼容性检查和过滤
    let compatibleNodes = inputNodes
    if (ukey && ukey.trim()) {
      if (!FieldPathResolver.validatePath(ukey)) {
        // ukey格式无效，记录警告并跳过
        code += `${Json2LuaUtil.indent(indent)}-- 警告：ukey格式无效 "${ukey}"，使用默认id去重\n`
      } else {
        // 过滤类型兼容的节点
        const firstNode = inputNodes[0]
        compatibleNodes = inputNodes.filter(node =>
          TypeCompatibilityChecker.isCompatible(firstNode, node)
        )
        if (compatibleNodes.length !== inputNodes.length) {
          const skippedCount = inputNodes.length - compatibleNodes.length
          code += `${Json2LuaUtil.indent(indent)}-- 跳过${skippedCount}个类型不兼容的输入节点\n`
        }
      }
    }

    if (compatibleNodes.length === 0) {
      return code
    }

    // 获取第一个输入节点的类型信息作为标准类型
    const firstinputNode = compatibleNodes[0]
    const firstOutputNode = firstinputNode.outputData?.[0]
    if (!firstOutputNode) {
      return code
    }
    const baseType = firstOutputNode.type
    const subType = firstOutputNode.subType

    // 生成聚合代码
    if (baseType === 'table') {
      code += this.generateTableAggregateCode(node, compatibleNodes, subType, ukey, indent)
    } else {
      code += this.generateSimpleAggregateCode(node, compatibleNodes, baseType, indent)
    }

    return code
  }

  // 生成简单类型聚合代码 (number, string, boolean)
  private generateSimpleAggregateCode(
    node: WorkflowNode,
    inputNodes: WorkflowNode[],
    baseType: string,
    indent: number
  ): string {
    let code = ''
    const resultVar = Json2LuaUtil.getNodeVarName(node.id)

    code += `${Json2LuaUtil.indent(indent)}${resultVar} = {}\n`
    code += `${Json2LuaUtil.indent(indent)}local tempSet = {}\n`
    inputNodes.forEach((inputNode, _index) => {
      const inputVar = Json2LuaUtil.getNodeVarName(inputNode.id)
      code += `${Json2LuaUtil.indent(indent)}if ${inputVar} then\n`
      code += `${Json2LuaUtil.indent(indent + 1)}tempSet[${inputVar}] = true\n`
      code += `${Json2LuaUtil.indent(indent)}end\n`
    })

    code += `${Json2LuaUtil.indent(indent)}for item, _ in pairs(tempSet) do\n`
    code += `${Json2LuaUtil.indent(indent + 1)}table.insert(${resultVar}, item)\n`
    code += `${Json2LuaUtil.indent(indent)}end\n`

    return code
  }

  // 生成表格类型聚合代码
  private generateTableAggregateCode(
    node: WorkflowNode,
    inputNodes: WorkflowNode[],
    subType: string,
    ukey: string,
    indent: number
  ): string {
    let code = ''
    const resultVar = Json2LuaUtil.getNodeVarName(node.id)

    code += `${Json2LuaUtil.indent(indent)}${resultVar} = {}\n`
    if (subType === 'string[]' || subType === 'number[]') {
      // 数组类型：合并所有数组元素
      code += this.generateArrayAggregateCode(node, inputNodes, indent)
    } else if (subType && subType.endsWith('[]')) {
      // 对象数组类型：合并对象数组并支持ukey去重
      code += this.generateObjectArrayAggregateCode(node, inputNodes, ukey, indent)
    } else {
      // 其他表格类型：直接合并
      code += this.generateSimpleTableAggregateCode(node, inputNodes, ukey, indent)
    }

    return code
  }

  // 生成数组类型聚合代码 (string[], number[])
  private generateArrayAggregateCode(
    node: WorkflowNode,
    inputNodes: WorkflowNode[],
    indent: number
  ): string {
    let code = ''
    const resultVar = Json2LuaUtil.getNodeVarName(node.id)

    code += `${Json2LuaUtil.indent(indent)}-- 合并数组元素 使用set去重\n`
    code += `${Json2LuaUtil.indent(indent)}local tempSet = {}\n`

    inputNodes.forEach((inputNode, _index) => {
      const inputVar = Json2LuaUtil.getNodeVarName(inputNode.id)
      code += `${Json2LuaUtil.indent(indent)}if ${inputVar} and type(${inputVar}) == "table" then\n`
      code += `${Json2LuaUtil.indent(indent + 1)}for _, item in ipairs(${inputVar}) do\n`
      code += `${Json2LuaUtil.indent(indent + 2)}tempSet[item] = true\n`
      code += `${Json2LuaUtil.indent(indent + 1)}end\n`
      code += `${Json2LuaUtil.indent(indent)}end\n`
    })

    code += `${Json2LuaUtil.indent(indent)}for item, _ in pairs(tempSet) do\n`
    code += `${Json2LuaUtil.indent(indent + 1)}table.insert(${resultVar}, item)\n`
    code += `${Json2LuaUtil.indent(indent)}end\n`

    return code
  }

  // 生成对象数组聚合代码 ({a:string, b:string}[])
  private generateObjectArrayAggregateCode(
    node: WorkflowNode,
    inputNodes: WorkflowNode[],
    ukey: string,
    indent: number
  ): string {
    let code = ''
    const resultVar = Json2LuaUtil.getNodeVarName(node.id)

    // 根据ukey选择去重策略
    if (ukey && ukey.trim() && FieldPathResolver.validatePath(ukey)) {
      // 使用ukey指定的字段进行去重
      const fieldAccess = FieldPathResolver.generateLuaAccess(ukey)
      code += `${Json2LuaUtil.indent(indent)}-- 合并对象数组 使用${ukey}字段去重\n`
      code += `${Json2LuaUtil.indent(indent)}local tempMap = {}\n`

      inputNodes.forEach((inputNode, _index) => {
        const inputVar = Json2LuaUtil.getNodeVarName(inputNode.id)
        code += `${Json2LuaUtil.indent(indent)}if ${inputVar} and type(${inputVar}) == "table" then\n`
        code += `${Json2LuaUtil.indent(indent + 1)}for _, item in ipairs(${inputVar}) do\n`
        code += `${Json2LuaUtil.indent(indent + 2)}if item and item.${fieldAccess} then\n`
        code += `${Json2LuaUtil.indent(indent + 3)}tempMap[item.${fieldAccess}] = item\n`
        code += `${Json2LuaUtil.indent(indent + 2)}end\n`
        code += `${Json2LuaUtil.indent(indent + 1)}end\n`
        code += `${Json2LuaUtil.indent(indent)}end\n`
      })
    } else {
      // 使用默认的id字段去重
      code += `${Json2LuaUtil.indent(indent)}-- 合并对象数组 依赖id去重(id为空则不合并/id重复则覆盖)\n`
      code += `${Json2LuaUtil.indent(indent)}local tempMap = {}\n`

      inputNodes.forEach((inputNode, _index) => {
        const inputVar = Json2LuaUtil.getNodeVarName(inputNode.id)
        code += `${Json2LuaUtil.indent(indent)}if ${inputVar} and type(${inputVar}) == "table" then\n`
        code += `${Json2LuaUtil.indent(indent + 1)}for _, item in ipairs(${inputVar}) do\n`
        code += `${Json2LuaUtil.indent(indent + 2)}if item and item.id then\n`
        code += `${Json2LuaUtil.indent(indent + 3)}tempMap[item.id] = item\n`
        code += `${Json2LuaUtil.indent(indent + 2)}end\n`
        code += `${Json2LuaUtil.indent(indent + 1)}end\n`
        code += `${Json2LuaUtil.indent(indent)}end\n`
      })
    }

    code += `${Json2LuaUtil.indent(indent)}for _, item in pairs(tempMap) do\n`
    code += `${Json2LuaUtil.indent(indent + 1)}table.insert(${resultVar}, item)\n`
    code += `${Json2LuaUtil.indent(indent)}end\n`

    return code
  }

  // 生成简单表格聚合代码
  private generateSimpleTableAggregateCode(
    node: WorkflowNode,
    inputNodes: WorkflowNode[],
    ukey: string,
    indent: number
  ): string {
    let code = ''
    const resultVar = Json2LuaUtil.getNodeVarName(node.id)

    code += `${Json2LuaUtil.indent(indent)}-- 合并表格数据\n`

    code += `${Json2LuaUtil.indent(indent)}-- 收集所有输入节点\n`
    code += `${Json2LuaUtil.indent(indent)}local tempMap1 = {}\n`
    inputNodes.forEach((inputNode, _index) => {
      const inputVar = Json2LuaUtil.getNodeVarName(inputNode.id)
      code += `${Json2LuaUtil.indent(indent)}if ${inputVar} then\n`
      code += `${Json2LuaUtil.indent(indent + 1)}table.insert(tempMap1, ${inputVar})\n`
      code += `${Json2LuaUtil.indent(indent)}end\n`
    })

    code += `${Json2LuaUtil.indent(indent)}-- 通过ukey去重\n`
    code += `${Json2LuaUtil.indent(indent)}local tempMap = {}\n`
    code += `${Json2LuaUtil.indent(indent)}for _, item in ipairs(tempMap1) do\n`
    code += `${Json2LuaUtil.indent(indent + 1)}if item and item.${ukey} then\n`
    code += `${Json2LuaUtil.indent(indent + 2)}tempMap[item.${ukey}] = item\n`
    code += `${Json2LuaUtil.indent(indent + 1)}end\n`
    code += `${Json2LuaUtil.indent(indent)}end\n`
    code += `${Json2LuaUtil.indent(indent)}for _, item in pairs(tempMap) do\n`
    code += `${Json2LuaUtil.indent(indent + 1)}table.insert(${resultVar}, item)\n`
    code += `${Json2LuaUtil.indent(indent)}end\n`

    return code
  }

  // 获取节点的所有输入节点
  private getInputNodes(node: WorkflowNode): WorkflowNode[] {
    const inputNodes: WorkflowNode[] = []

    // 查找所有指向该节点的边
    const incomingEdges = this.workflow.edges.filter(edge => edge.target === node.id)

    incomingEdges.forEach(edge => {
      const sourceNode = this.workflow.nodeList.find(n => n.id === edge.source)
      if (sourceNode) {
        inputNodes.push(sourceNode)
      }
    })

    return inputNodes
  }
}
