import { InputData, LogicType, WorkflowNode } from '@/type/workflow'
import { ElMessage } from 'element-plus'
import { batchGetLuaByExpressions } from '@/api/Lua'

type FuncType = {
  source: string
  portId: string
  nodeId: string
  nodeTitle: string
}

type ExpressionParam = {
  id?: string
  name?: string
  level?: number
  code: string
  children?: Array<ExpressionParam>
}
function isIfElseNode(node: WorkflowNode): boolean {
  return node && node.funcType === 'logic' && node.logicData?.logicType === LogicType.IFELSE
}

function isCalculatorNode(node: WorkflowNode): boolean {
  return node && node.funcType === 'logic' && node.logicData?.logicType === LogicType.CALCULATOR
}

const hasChild = node => Object.prototype.hasOwnProperty.call(node, 'children')
/**
 * 递归过滤树结构，移除空的 children 数组节点及其父级空节点
 * @param {Array} tree - 树结构数组
 * @returns {Array} 过滤后的树结构
 */
function filterEmptyTree(tree) {
  if (!Array.isArray(tree)) return tree

  // 递归处理每个节点
  const filterTree = node => {
    if (!hasChild(node)) {
      return true
    } else {
      node.children.forEach((child, index) => {
        child['checked'] = filterTree(child)
      })
      node.children = node.children
        .filter(child => child.checked)
        .map(child => {
          delete child.checked
          return child
        })
      return node.children.length > 0
    }
  }

  tree.forEach(node => {
    node.checked = filterTree(node)
  })

  tree = tree
    .filter(node => node.checked)
    .map(node => {
      delete node.checked
      return node
    })
  return tree
}

export const getLuaCodeMapByExpression = async (nodeList: WorkflowNode[]) => {
  const expressionLuaCodeMap = {}
  let expressionParamArr: ExpressionParam[] = []

  // 提前解析表达式
  const funcArr: FuncType[] = []
  nodeList.forEach((node: WorkflowNode) => {
    // if else 节点要有版本 且大于 1.0.0
    if (isIfElseNode(node) && node.version && node.version > '1.0.0') {
      const expressionParam = {
        id: node.id,
        name: node.title,
        level: 1,
        code: '',
        children: []
      }
      node.outputData.forEach((e, i, arr) => {
        if (i !== arr.length - 1) {
          funcArr.push({
            source: e.functionCode,
            portId: e.portId,
            nodeId: node.id,
            nodeTitle: node.title
          })
        }
        expressionParam.children.push({
          id: e.portId,
          level: 2,
          code: '',
          name: i === 0 ? 'if' : i < arr.length - 1 ? 'elseif' : 'else',
          children: []
        })
      })
      expressionParamArr.push(expressionParam)
    } else if (isCalculatorNode(node)) {
      const expressionParam = {
        id: node.id,
        name: node.title,
        level: 1,
        code: '',
        children: []
      }
      node.outputData.forEach((e, i, arr) => {
        funcArr.push({
          source: e.functionCode,
          portId: e.portId,
          nodeId: node.id,
          nodeTitle: node.title
        })
        expressionParam.children.push({
          id: e.portId,
          level: 2,
          code: '',
          name: '出参表达式',
          children: []
        })
      })
      expressionParamArr.push(expressionParam)
    } else {
      // 表达式的输入， 暂时先移除 e.paramName === 'expression'
      node.inputData
        .filter(e => e.type === 'function' || e.widgetType === 'function')
        .forEach((e: InputData) => {
          const expressionParam = {
            id: node.id,
            name: node.title,
            level: 1,
            code: '',
            children: []
          }
          funcArr.push({
            source: e.source,
            portId: e.portId,
            nodeId: node.id,
            nodeTitle: node.title
          })
          expressionParam.children.push({
            id: e.portId,
            name: e.attributes?.label,
            level: 2,
            code: '',
            children: []
          })
          expressionParamArr.push(expressionParam)
        })
    }
    return funcArr
  })

  const funcIdArr = []

  // 获取表达式的Lua代码
  // const res = await Promise.all(funcArr.map(e => {
  //   funcIdArr.push(e.nodeId + '_' + e.portId)
  //   return e.source ? getLuaByExpression(e.source.replaceAll('\n', ' ')) : { originalExpression: '', luaCode: '""', success: true }
  // }))

  let res = await batchGetLuaByExpressions(
    funcArr.map(e => {
      if (e.source) {
        funcIdArr.push(e.nodeId + '_' + e.portId)
      }
      return e.source.replaceAll('\n', ' ')
    })
  )
  res = res.filter(e => e.originalExpression)

  // 错误处理
  const errors = res.filter(e => !e.success)
  if (errors.length > 0) {
    const errString = errors
      .map(e => {
        const item = funcArr.find(f => f.source.replaceAll('\n', ' ') === e.originalExpression)
        return `${item.nodeId} ${item.nodeTitle} <br/> ${e.errorMessage.replaceAll('\n', '<br/>')} `
      })
      .join('<br/><br/>')
    ElMessage.error({
      message: `${errString}`,
      dangerouslyUseHTMLString: true
    })
    return
  }

  // 保存表达式Lua代码
  res.forEach((_res, _index) => {
    const id = funcIdArr[_index].split('_')[0]
    expressionParamArr
      .find(e => e.id === id)
      .children.forEach(e => {
        if (id + '_' + e.id === funcIdArr[_index]) {
          e.children.push(
            ...(_res.variables
              ?.map(_e => {
                if (_e.includes('.')) {
                  return {
                    code: _e.split('.').splice(1).join('.'),
                    level: 3
                  }
                } else if (!/^rst\d*$/.test(_e)) {
                  return {
                    code: _e,
                    level: 3
                  }
                }
              })
              .filter(Boolean) ?? [])
          )
        }
      })
    expressionLuaCodeMap[funcIdArr[_index]] = res[_index].luaCode
  })

  // 过滤掉 expressionParamArr children 为空的值
  expressionParamArr = filterEmptyTree(expressionParamArr)
  // console.log(_expressionParamArr, '_expressionParamArr')
  console.log(expressionParamArr, 'expressionParamArr')
  console.log(expressionLuaCodeMap, 'expressionLuaCodeMap')
  return { expressionParamArr, expressionLuaCodeMap }
}
