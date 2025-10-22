import { WorkflowNode } from "@/type/workflow"
import RoleDrawer from "@/views/RoleDrawer.vue"
import { Json2LuaUtil } from "./Json2LuaUtil"


/**
 * 基础函数-决策表函数lua代码生成
 */
export class DecisionTable {

    public paramNameResolver: Function
    public generateDecisionTableCode(node: WorkflowNode, indent: number, branchContext?: any, isGenerateTestLuaScript = false): string {
        let code = ''

        // 获取输入参数
        const dataParam = node.inputData?.find(input => input.paramName === 'data')

        if (!dataParam) {
            return code
        }

        let resultVar = Json2LuaUtil.getNodeVarName(node.id);

        const tagetNodeId = dataParam.source;
        const targetVar = this.paramNameResolver(tagetNodeId, branchContext);
        const rowList = node.decisionTableData?.rowList;
        code += `${Json2LuaUtil.indent(indent)}\n`;
        code += `${Json2LuaUtil.indent(indent)}\n`;
        // 生成决策表代码
        code += `${Json2LuaUtil.indent(indent)}-- 决策表代码\n`
        code += `${Json2LuaUtil.indent(indent)}\n`;

        if (isGenerateTestLuaScript) {
          code += `${Json2LuaUtil.indent(indent)}-- 测试模式, 加个变量： decisiontable_result_test\n`;
          code += `${Json2LuaUtil.indent(indent)}local decisiontable_result_test = {}\n`;
        }

        code += `${Json2LuaUtil.indent(indent)}-- 决策表数据\n`;
        code += `${Json2LuaUtil.indent(indent)}local rowList = {\n`;
        for (let row of rowList) {
          code += `${Json2LuaUtil.indent(indent + 1)}{\n`;
          code += `${Json2LuaUtil.indent(indent + 2)}id = '${row.id}',\n`;
          code += `${Json2LuaUtil.indent(indent + 2)}index = ${row.index},\n`;
          code += `${Json2LuaUtil.indent(indent + 2)}inputList = {\n`;
          for (let input of row.inputList) {
            let idx = row.inputList.indexOf(input);
            code += `${Json2LuaUtil.indent(indent + 3)}{paramName = '${input.paramName}', paramValue = '${input.paramValue}', paramType = '${input.paramType}', paramCode = '${input.paramCode}', luaExpression = '${input.luaExpression}'}${idx != row.inputList.length - 1 ? ',' : ''}\n`;
          }
          code += `${Json2LuaUtil.indent(indent + 2)}},\n`;
          code += `${Json2LuaUtil.indent(indent + 2)}outputList = {\n`;
          for (let output of row.outputList) {
            let idx = row.outputList.indexOf(output);
            code += `${Json2LuaUtil.indent(indent + 3)}{paramName = '${output.paramName}', paramValue = '${output.paramValue}', paramType = '${output.paramType}', paramCode = '${output.paramCode}', luaExpression = '${output.luaExpression}'}${idx != row.outputList.length - 1 ? ',' : ''}\n`;
          }
          code += `${Json2LuaUtil.indent(indent + 2)}},\n`;

          code += `${Json2LuaUtil.indent(indent + 2)}annotationList = {\n`;
          for (let annotation of row.annotationList) {
            let idx = row.annotationList.indexOf(annotation);
            code += `${Json2LuaUtil.indent(indent + 3)}{paramName = '${annotation.paramName}', paramValue = '${annotation.paramValue}', paramType = '${annotation.paramType}', paramCode = '${annotation.paramCode}', luaExpression = '${annotation.luaExpression}'}${idx != row.annotationList.length - 1 ? ',' : ''}\n`;
          }
          code += `${Json2LuaUtil.indent(indent + 2)}}\n`;
          let rowIdx = rowList.indexOf(row);
          code += `${Json2LuaUtil.indent(indent + 1)}}${rowIdx != rowList.length - 1 ? ',' : ''}\n`;
        }

        code += `${Json2LuaUtil.indent(indent)}}\n`;

        code += `${Json2LuaUtil.indent(indent)}\n`;
        code += `${Json2LuaUtil.indent(indent)}\n`;

        let createFun = (funName, expression) => {
          code += `${Json2LuaUtil.indent(indent)}function ${funName}(target, expression)\n`;
          if (expression == "null" || expression == "undefined" || expression == null || expression == undefined) {
            expression = "nil"
          }
          code += `${Json2LuaUtil.indent(indent + 1)}return ${expression}\n`;
          code += `${Json2LuaUtil.indent(indent)}end\n`;
        }

        //  单元格表达式转成函数
        code += `${Json2LuaUtil.indent(indent)}-- 自定义表达式计算函数\n`;
        let decisionTableInputFunCconfigList = [];
        let decisionTableOutputFunCconfigList = [];
        for (let row of rowList) {
          for (let input of row.inputList) {
            // if (input.paramType == 'string' && input.luaExpressionResultType == 'BOOLEAN') {
            let funName = `decision_table_input_calfun_${input.paramCode}_${row.index}`;
            decisionTableInputFunCconfigList.push({funName: funName, expression: input.luaExpression, paramCode: input.paramCode, index: row.index});
            createFun(funName, input.luaExpression);
            // }
          }
          for (let output of row.outputList) {
            // if (output.paramType == 'string') {
            let funName = `decision_table_output_calfun_${output.paramCode}_${row.index}`;
            decisionTableOutputFunCconfigList.push({funName: funName, expression: output.luaExpression, paramCode: output.paramCode, index: row.index});
            createFun(funName, output.luaExpression);
            // }
          }
        }
        code += `${Json2LuaUtil.indent(indent)}\n`;
        code += `${Json2LuaUtil.indent(indent)}\n`;

        // // 定义普通的参数值计算行数，不包含表达式的计算，表达式用上面的自定义表达式计算函数计算
        // code += `${Json2LuaUtil.indent(indent)}-- 定义 calExpressionResult 函数\n`;
        // code += `${Json2LuaUtil.indent(indent)}local function calExpressionResult(paramType, paramValue,paramCode, target, expression, expressionResultType, isOutput)\n`;
        // code += `${Json2LuaUtil.indent(indent + 1)}if paramType == "boolean" then\n`;
        // code += `${Json2LuaUtil.indent(indent + 2)}if isOutput then\n`;
        // code += `${Json2LuaUtil.indent(indent + 3)}return tostring(paramValue) == "true"\n`;
        // code += `${Json2LuaUtil.indent(indent + 2)}else\n`;
        // code += `${Json2LuaUtil.indent(indent + 3)}return tostring(target[paramCode]) == tostring(paramValue)\n`;
        // code += `${Json2LuaUtil.indent(indent + 2)}end\n`;
        // code += `${Json2LuaUtil.indent(indent + 1)}elseif paramType == "number" then\n`;
        // code += `${Json2LuaUtil.indent(indent + 2)}local expNum = tonumber(paramValue)\n`;
        // code += `${Json2LuaUtil.indent(indent + 2)}local targetNum = tonumber(target[paramCode])\n`;
        // code += `${Json2LuaUtil.indent(indent + 2)}if isOutput then\n`;
        // code += `${Json2LuaUtil.indent(indent + 3)}return expNum\n`;
        // code += `${Json2LuaUtil.indent(indent + 2)}else\n`;
        // code += `${Json2LuaUtil.indent(indent + 3)}return tostring(targetNum) == tostring(expNum)\n`;
        // code += `${Json2LuaUtil.indent(indent + 2)}end\n`;
        // code += `${Json2LuaUtil.indent(indent + 1)}elseif paramType == "string" then\n`;
        // code += `${Json2LuaUtil.indent(indent + 2)}if not isOutput and expressionResultType ~= "BOOLEAN" then\n`;
        // code += `${Json2LuaUtil.indent(indent + 3)}return tostring(target[paramCode]) == tostring(paramValue)\n`;
        // code += `${Json2LuaUtil.indent(indent + 2)}end\n`;
        // code += `${Json2LuaUtil.indent(indent + 1)}end\n`;
        // code += `${Json2LuaUtil.indent(indent)}end\n`;
        // code += `${Json2LuaUtil.indent(indent)}\n`;
        // code += `${Json2LuaUtil.indent(indent)}\n`;

        // 开始对入参进行匹配
        code += `${Json2LuaUtil.indent(indent)}-- 根据传进的参数与决策表数据进行匹配\n`;
        code += `${Json2LuaUtil.indent(indent)}local ${resultVar} = {}\n`;
        code += `${Json2LuaUtil.indent(indent)}for _, item in ipairs(${targetVar}) do\n`;
        code += `${Json2LuaUtil.indent(indent + 1)}local outputList = {}\n`;
        if (isGenerateTestLuaScript) {
          code += `${Json2LuaUtil.indent(indent + 1)}-- 测试模式, 加个变量： decisiontable_result_test_item\n`;
          code += `${Json2LuaUtil.indent(indent + 1)}local decisiontable_result_test_item = {_ptr = item._ptr, name = item.name, id = item.id}\n`;
        }
        code += `${Json2LuaUtil.indent(indent + 1)}local index = -1\n`;
        code += `${Json2LuaUtil.indent(indent + 1)}for _, rowData in ipairs(rowList) do\n`;
        code += `${Json2LuaUtil.indent(indent + 2)}local match = true\n`;
        code += `${Json2LuaUtil.indent(indent + 2)}local inputList = rowData.inputList\n`;
        code += `${Json2LuaUtil.indent(indent + 2)}for _, input in ipairs(inputList) do\n`;
        code += `${Json2LuaUtil.indent(indent + 3)}local paramCode = input.paramCode\n`;
        code += `${Json2LuaUtil.indent(indent + 3)}local paramValue = input.paramValue\n`;
        code += `${Json2LuaUtil.indent(indent + 3)}local paramType = input.paramType\n`;
        // code += `${Json2LuaUtil.indent(indent + 3)}local expressionResultType = input.luaExpressionResultType\n`;
        code += `${Json2LuaUtil.indent(indent + 3)}local luaExpression = input.luaExpression\n`;
        code += `${Json2LuaUtil.indent(indent + 3)}local expressionResult = nil\n`;
        // code += `${Json2LuaUtil.indent(indent + 3)}if expressionResultType ~= "BOOLEAN" then\n`;
        // code += `${Json2LuaUtil.indent(indent + 4)}expressionResult = calExpressionResult(paramType, paramValue, paramCode, item, luaExpression, expressionResultType, false)\n`;
        // code += `${Json2LuaUtil.indent(indent + 4)}if not expressionResult then\n`;
        // code += `${Json2LuaUtil.indent(indent + 5)}match = false\n`;
        // code += `${Json2LuaUtil.indent(indent + 4)}end\n`;
        // code += `${Json2LuaUtil.indent(indent + 3)}else\n`;
        for (let funConfig of decisionTableInputFunCconfigList) {
          code += `${Json2LuaUtil.indent(indent + 3)}if rowData.index == ${funConfig.index} and not ${funConfig.funName}(item, luaExpression) then\n`;
          code += `${Json2LuaUtil.indent(indent + 4)}match = false\n`;
          code += `${Json2LuaUtil.indent(indent + 3)}end\n`;
        }
        // code += `${Json2LuaUtil.indent(indent + 3)}end\n`;
        code += `${Json2LuaUtil.indent(indent + 2)}end\n`;
        code += `${Json2LuaUtil.indent(indent + 2)}if match then\n`;
        code += `${Json2LuaUtil.indent(indent + 3)}outputList = rowData.outputList\n`;
        code += `${Json2LuaUtil.indent(indent + 3)}index = rowData.index\n`;
        if (isGenerateTestLuaScript) {
          code += `${Json2LuaUtil.indent(indent + 3)}-- 测试模式, decisiontable_result_test_item添加match字段\n`;
          code += `${Json2LuaUtil.indent(indent + 3)}decisiontable_result_test_item.match = true\n`;
        }
        code += `${Json2LuaUtil.indent(indent + 3)}break\n`;
        code += `${Json2LuaUtil.indent(indent + 2)}end\n`;
        code += `${Json2LuaUtil.indent(indent + 1)}end\n`;
        code += `${Json2LuaUtil.indent(indent + 1)}for _, output in ipairs(outputList) do\n`;
        code += `${Json2LuaUtil.indent(indent + 2)}local paramCode = output.paramCode\n`;
        code += `${Json2LuaUtil.indent(indent + 2)}local luaExpression = output.luaExpression\n`;
        code += `${Json2LuaUtil.indent(indent + 2)}local paramValue = output.paramValue\n`;
        code += `${Json2LuaUtil.indent(indent + 2)}local paramType = output.paramType\n`;
        // code += `${Json2LuaUtil.indent(indent + 2)}local expressionResultType = output.luaExpressionResultType\n`;
        code += `${Json2LuaUtil.indent(indent + 2)}local expressionResult = nil\n`;
        code += `${Json2LuaUtil.indent(indent + 2)}if index ~= -1 then\n`;
        // code += `${Json2LuaUtil.indent(indent + 3)}if paramType ~= "string" then\n`;
        // code += `${Json2LuaUtil.indent(indent + 4)}expressionResult = calExpressionResult(paramType, paramValue, paramCode, item, luaExpression, expressionResultType, true)\n`;
        // code += `${Json2LuaUtil.indent(indent + 3)}else\n`;
        for (let funConfig of decisionTableOutputFunCconfigList) {
          code += `${Json2LuaUtil.indent(indent + 3)}if index == ${funConfig.index} and paramCode == "${funConfig.paramCode}" then\n`;
          code += `${Json2LuaUtil.indent(indent + 4)}expressionResult = ${funConfig.funName}(item, luaExpression)\n`;
          code += `${Json2LuaUtil.indent(indent + 3)}end\n`;
        }
        // code += `${Json2LuaUtil.indent(indent + 3)}end\n`;
        code += `${Json2LuaUtil.indent(indent + 3)}item[paramCode] = expressionResult or ''\n`;
        if (isGenerateTestLuaScript) {
          code += `${Json2LuaUtil.indent(indent + 3)}-- 测试模式, decisiontable_result_test_item添加Output字段\n`;
          code += `${Json2LuaUtil.indent(indent + 3)}decisiontable_result_test_item[paramCode] = expressionResult or ''\n`;
        }
        code += `${Json2LuaUtil.indent(indent + 2)}else\n`;
        code += `${Json2LuaUtil.indent(indent + 3)}item[paramCode] = nil\n`;
        if (isGenerateTestLuaScript) {
          code += `${Json2LuaUtil.indent(indent + 3)}-- 测试模式, decisiontable_result_test_item添加Output字段\n`;
          code += `${Json2LuaUtil.indent(indent + 3)}decisiontable_result_test_item[paramCode] = nil\n`;
        }
        code += `${Json2LuaUtil.indent(indent + 2)}end\n`;
        code += `${Json2LuaUtil.indent(indent + 1)}end\n`;
        if (isGenerateTestLuaScript) {
          code += `${Json2LuaUtil.indent(indent + 1)}-- 测试模式, decisiontable_result_test添加项decisiontable_result_test_item\n`;
          code += `${Json2LuaUtil.indent(indent + 1)}if decisiontable_result_test_item.match then\n`;
          code += `${Json2LuaUtil.indent(indent + 2)}decisiontable_result_test_item.match = nil\n`;
          code += `${Json2LuaUtil.indent(indent + 2)}table.insert(decisiontable_result_test, decisiontable_result_test_item)\n`;
          code += `${Json2LuaUtil.indent(indent + 1)}end\n`;
        }
        code += `${Json2LuaUtil.indent(indent + 1)}table.insert(${resultVar}, item)\n`;

        code += `${Json2LuaUtil.indent(indent)}end\n`;
        if (isGenerateTestLuaScript) {
          code += `${Json2LuaUtil.indent(indent)}-- 测试模式, decisiontable_result_test作为范围结果\n`;
          code += `${Json2LuaUtil.indent(indent)}${resultVar} = decisiontable_result_test\n`;
        }

        return code;
    }

}
