import { WorkflowData } from '@/type/workflow'
import { http } from '@/axios'
import { ElMessage } from 'element-plus'
import { expandFunctionConfig } from '@/utils/workflow/DataOptimizer'

// 函数配置数据类型
export interface FunctionConfigData {
  input: any[]
  output: any[]
  logicData?: any
  path: string
  className: string
  funcLuaName: string
}

// 函数项数据类型
export interface FunctionItem {
  id: string
  funcName: string
  funcDesc: string
  configData: string,
  children?: any[]
}

// 转换后的函数节点类型
export interface FunctionNode {
  icon: string
  type: string
  title: string
  funcId: string
  remark: string
  inputData: any[]
  outputData: any[]
  logicData: any
  path: string
  className: string
  funcName: string
}

// 分页请求参数类型
export interface FunctionListParams {
  pageNo: number
  pageSize: number
  keyword?: string
  funcCategory?: string
  isMyFunction?: boolean
}

// 分页响应数据类型
export interface FunctionListResponse {
  rows: FunctionItem[]
  total: number
}

/**
 * 获取函数列表
 * @param params 分页参数
 * @returns Promise<FunctionListResponse>
 */
export async function getFunctionList(): Promise<FunctionItem[]> {
  return {
    "success": true,
    "data": [
      {
        "id": "8000000001",
        "parentId": "0",
        "name": "获取对象",
        "level": 1,
        "sort": 0,
        "modifyTime": 1758106804000,
        "children": [],
        "functions": [
          {
            "id": "8000006006",
            "funcCode": "get_part_children_deep_v2",
            "funcName": "v2 找子级",
            "funcDesc": "v2 找子级",
            "funcCategory": "LUOJI",
            "funcDirectory": "abstract-functions-v2/general",
            "configData": "{\"className\":\"get-part-children-deep-v2\",\"path\":\"abstract-functions-v2/general\",\"funcLuaName\":\"get_part_children_deep_v2\",\"input\":{\"widgetList\":[{\"id\":\"input_part\",\"type\":\"input\",\"attributes\":{\"label\":\"输入的part对象\",\"placeholder\":\"请输入输入的part对象\",\"disabled\":true,\"paramType\":\"table\",\"paramSubType\":\"{}Part\"}},{\"id\":\"deep\",\"type\":\"inputNumber\",\"defaultValue\":1,\"attributes\":{\"label\":\"深度\",\"placeholder\":\"请输入深度\",\"paramType\":\"number\",\"inputType\":\"number\"}},{\"id\":\"expression\",\"type\":\"function\",\"attributes\":{\"label\":\"表达式\",\"placeholder\":\"请输入表达式\",\"paramType\":\"function\"}}]},\"output\":{\"widgetList\":[{\"type\":\"input\",\"attributes\":{\"label\":\"结果列表\",\"placeholder\":\"请输入结果列表\",\"disabled\":true,\"paramType\":\"table\",\"paramSubType\":\"Part[]\"}}]}}",
            "luaScript": "local _M = {}\r\n\r\nlocal table = require(\"core.table\")\r\nlocal Part = require(\"scene.part\")\r\n\r\nlocal function get_part_children_deep(input_part, deep)\r\n\r\n\r\n    local cur_children = input_part:children()\r\n    for i = 1, deep do\r\n        if i ~= 1 then\r\n            if #cur_children == 0 then\r\n                return {}\r\n            end\r\n            local new_children = {}\r\n            for _, child in ipairs(cur_children) do\r\n                local child_children = child:children()\r\n                for _, child_child in ipairs(child_children) do\r\n                    if child_child then\r\n                        table.insert(new_children, child_child)\r\n                    end\r\n                end\r\n            end\r\n            cur_children = new_children\r\n        end\r\n    end\r\n    return cur_children\r\nend\r\n\r\n-- v2-找目标素材的子级\r\n-- @param input_part table 输入的part对象\r\n-- @field input_part $Part Part对象\r\n-- @param deep number 深度 # default:1\r\n-- @param expression function 表达式\r\n-- @return table 结果列表\r\n-- @field return[] $Part 结果列表\r\nfunction _M.get_part_children_deep_v2(input_part, deep, expression)\r\n    -- 入参判空校验\r\n\r\n    if input_part == nil then\r\n        return nil, \"输入的对象列表(input_part参数)不能为空\"\r\n    end\r\n    if type(input_part) ~= \"table\" then\r\n        return nil, \"输入的对象列表(input_part参数)类型错误\"\r\n    end\r\n    local success = pcall(function()\r\n        return input_part:is_part()\r\n    end)\r\n    if not success then\r\n        return nil, \"输入的对象列表(input_part参数)类型错误\"\r\n    end\r\n    if expression == nil then\r\n        expression = function(part)\r\n            return true\r\n        end\r\n    end\r\n    if type(expression) ~= \"function\" then\r\n        return nil, \"表达式类型错误\"\r\n    end\r\n    if deep == nil then\r\n        return nil, \"深度(deep参数)不能为空\"\r\n    end\r\n    if type(deep) ~= \"number\" then\r\n        return nil, \"深度(deep参数)类型错误\"\r\n    end\r\n    local deep_children_parts = get_part_children_deep(input_part, deep)\r\n    local result_parts = {}\r\n    for _, part in ipairs(deep_children_parts) do\r\n        if part then\r\n            local ok, result = pcall(expression, part)\r\n            if ok and result then\r\n                table.insert(result_parts, part)\r\n            end\r\n        end\r\n    end\r\n\r\n    return result_parts\r\nend\r\n\r\nreturn _M",
            "remark": "保留字段",
            "functionStatus": "ENABLED",
            "isGeometry": 0,
            "funcClassifyFullPath": null,
            "enableTime": 1759115804000,
            "pos": 59,
            "categoryId": "8000000001",
            "isDelete": 0,
            "createTime": 1759115804000,
            "modifyTime": 1759116981000,
            "creator": 131,
            "creatorName": "11051352",
            "modifier": 246,
            "modifierName": "11051352",
            "usageCount": null
          },
          {
            "id": "8000002017",
            "funcCode": "get_targets_v2",
            "funcName": "v2 找对象",
            "funcDesc": "v2 找对象：\n（1）入参数据结构（单个part）：{}、出参数据结构（一维数组）：[ {} ]\n（2）函数作用说明：用与接收程序传入的产品数据，或从全场景中找目标产品素材",
            "funcCategory": "LUOJI",
            "funcDirectory": "abstract-functions-v2/general",
            "configData": "{\"className\":\"get-targets-v2\",\"path\":\"abstract-functions-v2/general\",\"funcLuaName\":\"get_targets_v2\",\"input\":{\"widgetList\":[{\"id\":\"objects\",\"type\":\"select\",\"defaultValue\":\"'root'\",\"options\":[{\"label\":\"全场景\",\"value\":\"'root'\",\"type\":\"any\"},{\"label\":\"程序传入\",\"value\":\"target\",\"type\":\"any\"}],\"attributes\":{\"label\":\"产品列表\",\"placeholder\":\"请输入产品列表\",\"paramType\":\"any\"}},{\"id\":\"product_type\",\"type\":\"select\",\"defaultValue\":\"part\",\"options\":[{\"label\":\"参数化产品\",\"value\":\"part\",\"type\":\"string\"},{\"label\":\"非参数化产品\",\"value\":\"soft\",\"type\":\"string\"}],\"attributes\":{\"label\":\"产品类型\",\"placeholder\":\"请输入产品类型\",\"paramType\":\"string\"}},{\"id\":\"expression\",\"type\":\"function\",\"attributes\":{\"label\":\"条件表达式\",\"placeholder\":\"请输入条件表达式\",\"paramType\":\"function\"}}]},\"output\":{\"widgetList\":[{\"type\":\"input\",\"attributes\":{\"label\":\"产品列表\",\"placeholder\":\"请输入产品列表\",\"disabled\":true,\"paramType\":\"table\",\"paramSubType\":\"Part[]\"}}]}}",
            "luaScript": "local geom_engine = require('lib.engine.geom-engine')\r\nlocal Scene = require(\"scene.scene\")\r\n\r\nlocal _M = {}\r\n\r\n-- 00? 找对象\r\n-- @param objects any 产品列表 # options:[{\"全场景\": \"$root\"}, {\"程序传入\": \"$target\"}] default: \"$root\"\r\n-- @param product_type string 产品类型 # options:[{\"参数化产品\": \"part\"}, {\"非参数化产品\": \"soft\"}] default:\"part\"\r\n-- @param expression function 条件表达式\r\n-- @return table 产品列表\r\n-- @field return[] $Part Part列表\r\n\r\nfunction _M.get_targets_v2 (objects, product_type, filter_fun)\r\n    -- 入参判空校验\r\n    if objects == nil then\r\n        return nil, \"对象列表(objects参数)不能为空\"\r\n    end\r\n    if product_type == nil then\r\n        return nil, \"产品类型(product_type参数)不能为空\"\r\n    end\r\n    if type(product_type) ~= \"string\" then\r\n        return nil, \"产品类型(product_type参数)类型错误\"\r\n    end\r\n\r\n    if filter_fun == nil then\r\n        filter_fun = function(product)\r\n            return true\r\n        end\r\n    end\r\n    if type(filter_fun) ~= \"function\" then\r\n        return nil, \"回调过滤函数(filter_fun参数)类型错误\"\r\n    end\r\n\r\n    local objects_list = {}\r\n    local scene = Scene.current()\r\n    if type(objects) == \"string\" then\r\n        if objects == \"root\" then --拿全场景\r\n            objects_list = scene:get_all_parts()\r\n        end\r\n    else\r\n        if type(objects) ~= \"table\" then\r\n            return nil, \"对象列表(objects参数)类型错误\"\r\n        end\r\n\r\n        -- 判断objects是否为Part类型 --直接传target进来时命中\r\n        local success = pcall(function()\r\n            return objects:is_part()\r\n        end)\r\n        if success then\r\n            table.insert(objects_list, objects)\r\n        else\r\n            for _, object in ipairs(objects) do\r\n                -- 判断object是否为Part类型\r\n                local success = pcall(function()\r\n                    return object:is_part()\r\n                end)\r\n                if not success then\r\n                    return nil, \"对象列表(objects参数)类型错误\"\r\n                end\r\n                table.insert(objects_list, object)\r\n            end\r\n        end\r\n    end\r\n    local filter_objects = {}\r\n    for _, object in ipairs(objects_list) do\r\n        local ok, result = pcall(filter_fun, object)  --表达式执行失败则跳过，不返回错误\r\n        if ok and result then\r\n            table.insert(filter_objects, object)\r\n        end\r\n    end\r\n    return filter_objects\r\nend\r\nreturn _M",
            "remark": "保留字段",
            "functionStatus": "ENABLED",
            "isGeometry": 0,
            "funcClassifyFullPath": null,
            "enableTime": 1755759031000,
            "pos": 50,
            "categoryId": "8000000001",
            "isDelete": 0,
            "createTime": 1755759031000,
            "modifyTime": 1759054088000,
            "creator": 131,
            "creatorName": "11051352",
            "modifier": 476,
            "modifierName": "11051352",
            "usageCount": null
          }
        ]
      },
      {
        "id": "8000000002",
        "parentId": "0",
        "name": "业务逻辑判断",
        "level": 1,
        "sort": 0,
        "modifyTime": 1758106817000,
        "children": [],
        "functions": [
          {
            "id": "8000002014",
            "funcCode": "check_attributes_equal_v2",
            "funcName": "判断产品的某个属性值是否一致",
            "funcDesc": "v2 判断产品列表中的某个属性的值是否一致：\n（1）入参数据结构（一维数组）：[ { } ]、出参数据结构（二维数组）：[ [ {},{} ],[ {},{}]]\n（2）函数作用：同时适应分组/无分组情况下判断同类产品的指定属性值是否一致，且可定义输出：一致/不一致的产品清单\n（3）使用说明：如此函数的下一节点是结果输出，则需要选择：结果输出（二维数组）",
            "funcCategory": "LUOJI",
            "funcDirectory": "abstract-functions-v2/general",
            "configData": "{\"className\":\"check-attributes-equal-v2\",\"path\":\"abstract-functions-v2/general\",\"funcLuaName\":\"check_attributes_equal_v2\",\"input\":{\"widgetList\":[{\"id\":\"parts\",\"type\":\"input\",\"defaultValue\":[],\"attributes\":{\"label\":\"输入的对象列表\",\"placeholder\":\"请输入输入的对象列表\",\"disabled\":true,\"paramType\":\"table\",\"paramSubType\":\"Part[]\"}},{\"id\":\"group_type\",\"type\":\"select\",\"defaultValue\":\"scene\",\"options\":[{\"label\":\"场景\",\"value\":\"scene\",\"type\":\"string\"},{\"label\":\"空间\",\"value\":\"roomId\",\"type\":\"string\"},{\"label\":\"顶级参数\",\"value\":\"top\",\"type\":\"string\"},{\"label\":\"父级参数\",\"value\":\"parent\",\"type\":\"string\"},{\"label\":\"自身参数\",\"value\":\"oneself\",\"type\":\"string\"}],\"attributes\":{\"label\":\"分组类型\",\"placeholder\":\"请输入分组类型\",\"paramType\":\"string\"}},{\"id\":\"group_param\",\"type\":\"input\",\"defaultValue\":\"nil\",\"attributes\":{\"label\":\"分组参数\",\"placeholder\":\"请输入分组参数\",\"paramType\":\"string\"}},{\"id\":\"param_name\",\"type\":\"input\",\"attributes\":{\"label\":\"属性名称\",\"placeholder\":\"请输入属性名称\",\"paramType\":\"string\"}},{\"id\":\"is_same\",\"type\":\"switch\",\"defaultValue\":false,\"options\":[{\"label\":\"输出参数一致的产品列表\",\"value\":true,\"type\":\"boolean\"},{\"label\":\"输出参数不一致的产品列表\",\"value\":false,\"type\":\"boolean\"}],\"attributes\":{\"label\":\"是否一致\",\"placeholder\":\"请输入是否一致\",\"paramType\":\"boolean\",\"activeText\":\"输出参数一致的产品列表\",\"inactiveText\":\"输出参数不一致的产品列表\"}}]},\"output\":{\"widgetList\":[{\"type\":\"input\",\"attributes\":{\"label\":\"返回参数一致的产品列表\",\"placeholder\":\"请输入返回参数一致的产品列表\",\"disabled\":true,\"paramType\":\"table\",\"paramSubType\":\"Part[][]\"}}]}}",
            "luaScript": "local _M = {}\r\n\r\n-- 00? 判断产品列表中的某个属性的值是否一致\r\n-- @param parts table 输入的对象列表 # default:[]\r\n-- @field parts[] $Part Part列表\r\n-- @param group_type string 分组类型 # options:[{\"场景\": \"scene\"}, {\"空间\": \"roomId\"}, {\"顶级参数\": \"top\"}, {\"父级参数\": \"parent\"}, {\"自身参数\": \"oneself\"}] default:\"scene\"\r\n-- @param group_param string 分组参数 # default:nil\r\n-- @param param_name string 属性名称 # default:\"\"\r\n-- @param is_same boolean 是否一致 # options:[{\"输出参数一致的产品列表\": true},{\"输出参数不一致的产品列表\": false}] default:false\r\n-- @return table 返回参数一致的产品列表\r\n-- @field return[] $Part[] Part列表\r\n\r\n\r\nfunction _M.check_attributes_equal_v2(parts, group_type, group_param, param_name, is_same)\r\n    -- 参数验证\r\n    if parts == nil then\r\n        return nil, \"输入的对象列表(parts参数)不能为空\"\r\n    end\r\n    if type(parts) ~= \"table\" then\r\n        return nil, \"输入的对象列表(parts参数)类型错误\"\r\n    end\r\n    if group_type == nil then\r\n        return nil, \"分组类型(group_type参数)不能为空\"\r\n    end\r\n    if type(group_type) ~= \"string\" then\r\n        return nil, \"分组类型(group_type参数)类型错误\"\r\n    end\r\n    -- if group_param == nil then\r\n    --     return nil, \"分组参数(group_param参数)不能为空\"\r\n    -- end\r\n    -- if type(group_param) ~= \"string\" then\r\n    --     return nil, \"分组参数(group_param参数)类型错误\"\r\n    -- end\r\n    if param_name == nil then\r\n        return nil, \"属性名称(param_name参数)不能为空\"\r\n    end\r\n    if type(param_name) ~= \"string\" then\r\n        return nil, \"属性名称(param_name参数)类型错误\"\r\n    end\r\n    if is_same == nil then\r\n        return nil, \"是否一致(is_same参数)不能为空\"\r\n    end\r\n    if type(is_same) ~= \"boolean\" then\r\n        return nil, \"是否一致(is_same参数)类型错误\"\r\n    end\r\n\r\n    if #parts == 0 then\r\n        return {}\r\n    end\r\n\r\n    -- 验证所有对象都是Part类型\r\n    for _, part in ipairs(parts) do\r\n        local success = pcall(function()\r\n            return part:is_part()\r\n        end)\r\n        if not success then\r\n            return nil, \"对象列表(parts参数)类型错误\"\r\n        end\r\n    end\r\n\r\n    -- 分组\r\n    local group_parts = {}\r\n    if group_type == \"scene\" then\r\n        table.insert(group_parts, parts)\r\n    elseif group_type == \"roomId\" then\r\n        -- 根据roomId分组\r\n        local roomGroup = {}\r\n        for _, part in ipairs(parts) do\r\n            local top = part:top()\r\n            local room_id = top:get_attribute(\"roomId\") or \"\"\r\n            if not roomGroup[room_id] then\r\n                roomGroup[room_id] = {}\r\n            end\r\n            table.insert(roomGroup[room_id], part)\r\n        end\r\n        for _, room in pairs(roomGroup) do\r\n            table.insert(group_parts, room)\r\n        end\r\n    elseif group_type == \"oneself\" or group_type == \"top\" or group_type == \"parent\"then\r\n        if group_param == nil or (type(group_param) == \"string\" and group_param == \"\") then\r\n            table.insert(group_parts, parts)\r\n        elseif type(group_param) == \"string\" and group_param ~= \"\" then\r\n            local paramGroup = {}\r\n            for _, part in ipairs(parts) do\r\n                -- 分组参数按\",\"分割\r\n                local param_group_names = {}\r\n                for name in string.gmatch(group_param, \"([^,]+)\") do\r\n                    table.insert(param_group_names, name)\r\n                end\r\n                -- 取所有属性值做组合键\r\n                local param_value = \"\"\r\n                for _, param_group_name in ipairs(param_group_names) do\r\n                    local attr_value = nil\r\n                    if group_type == \"oneself\" then\r\n                        attr_value = part:get_attribute(param_group_name) or (\"oneselfNoneAttr:\" .. param_group_name)\r\n                    elseif group_type == \"top\" then\r\n                        attr_value = part:top():get_attribute(param_group_name) or (\"topNoneAttr:\" .. param_group_name)\r\n                    elseif group_type == \"parent\" then\r\n                        attr_value = part:parent():get_attribute(param_group_name) or (\"topNoneAttr:\" .. param_group_name)\r\n                    end\r\n                    if attr_value == nil then\r\n                        return nil, \"传入的参数编码不存在,请确认:\" .. param_group_name\r\n                    end\r\n                    param_value = param_value .. \"_\" .. attr_value\r\n                end\r\n                if not paramGroup[param_value] then\r\n                    paramGroup[param_value] = {}\r\n                end\r\n                table.insert(paramGroup[param_value], part)\r\n            end\r\n            for _, param in pairs(paramGroup) do\r\n                table.insert(group_parts, param)\r\n            end\r\n        end\r\n    else\r\n        return nil, \"分组类型(group_type参数)类型错误\"\r\n    end\r\n\r\n    -- 判断参数是否一致\r\n    local result = {}\r\n    for _, group_part in ipairs(group_parts) do\r\n        local cur_result = {}\r\n        local param_value = nil\r\n        local all_same = true\r\n\r\n        -- 先检查所有值是否一致\r\n        for _, part in ipairs(group_part) do\r\n            local attr_value = part:get_attribute(param_name)\r\n            if attr_value == nil then\r\n                return nil, \"传入的参数编码不存在,请确认:\" .. param_name\r\n            end\r\n            if not param_value then\r\n                param_value = attr_value\r\n            elseif attr_value ~= param_value then\r\n                all_same = false\r\n            end\r\n        end\r\n\r\n        -- 根据 is_same 参数决定返回哪些对象\r\n        if (all_same and is_same) or (not all_same and not is_same) then\r\n            for _, part in ipairs(group_part) do\r\n                table.insert(cur_result, part)\r\n            end\r\n        end\r\n\r\n        if #cur_result > 0 then\r\n            table.insert(result, cur_result)\r\n        end\r\n    end\r\n\r\n    return result\r\nend\r\n\r\nreturn _M\r\n",
            "remark": "保留字段",
            "functionStatus": "ENABLED",
            "isGeometry": 0,
            "funcClassifyFullPath": null,
            "enableTime": 1755758532000,
            "pos": 47,
            "categoryId": "8000000002",
            "isDelete": 0,
            "createTime": 1755758532000,
            "modifyTime": 1758610211000,
            "creator": 131,
            "creatorName": "11051352",
            "modifier": 476,
            "modifierName": "11051352",
            "usageCount": null
          },
          {
            "id": "8000002015",
            "funcCode": "get_overLap_objects_v2",
            "funcName": "获取产品指定方向平移指定距离相交对象",
            "funcDesc": "v2 获取产品指定方向平移指定距离相交对象：\n（1）入参数据结构（单个part）：{}、出参数据结构（一维数组）：[ {} ]\n（2）函数作用：获取【目标物体+指定方向+距离】存在【指定产品范围】的重叠/相交物体",
            "funcCategory": "JIHE",
            "funcDirectory": "abstract-functions-v2/general",
            "configData": "{\"className\":\"get-overLap-objects-v2\",\"path\":\"abstract-functions-v2/general\",\"funcLuaName\":\"get_overLap_objects_v2\",\"input\":{\"widgetList\":[{\"id\":\"part\",\"type\":\"input\",\"defaultValue\":[],\"attributes\":{\"label\":\"主对象\",\"placeholder\":\"请输入主对象\",\"disabled\":true,\"paramType\":\"table\",\"paramSubType\":\"{}Part\"}},{\"id\":\"direction\",\"type\":\"select\",\"defaultValue\":\"left\",\"options\":[{\"label\":\"左\",\"value\":\"left\",\"type\":\"string\"},{\"label\":\"右\",\"value\":\"right\",\"type\":\"string\"},{\"label\":\"前\",\"value\":\"front\",\"type\":\"string\"},{\"label\":\"后\",\"value\":\"back\",\"type\":\"string\"},{\"label\":\"上\",\"value\":\"up\",\"type\":\"string\"},{\"label\":\"下\",\"value\":\"down\",\"type\":\"string\"}],\"attributes\":{\"label\":\"方向\",\"placeholder\":\"请输入方向\",\"paramType\":\"string\"}},{\"id\":\"distance\",\"type\":\"inputNumber\",\"defaultValue\":1,\"attributes\":{\"label\":\"距离\",\"placeholder\":\"请输入距离\",\"paramType\":\"number\",\"min\":1,\"max\":10000,\"inputType\":\"number\"}},{\"id\":\"expression\",\"type\":\"function\",\"attributes\":{\"label\":\"过滤表达式\",\"placeholder\":\"请输入过滤表达式\",\"paramType\":\"function\"}}]},\"output\":{\"widgetList\":[{\"type\":\"input\",\"attributes\":{\"label\":\"相交对象列表\",\"placeholder\":\"请输入相交对象列表\",\"disabled\":true,\"paramType\":\"table\",\"paramSubType\":\"Part[]\"}}]}}",
            "luaScript": "local geom_engine = require('lib.engine.geom-engine')\r\nlocal Part = require(\"scene.part\")\r\nlocal Scene = require(\"scene.scene\")\r\n\r\nlocal _M = {}\r\n\r\n-- v2 获取产品指定方向平移指定距离相交对象列表\r\n-- @param part table 主对象 # default:[]\r\n-- @field part $Part 主对象列表\r\n-- @param direction string 方向  # options:[{\"左\": \"left\"}, {\"右\": \"right\"}, {\"前\": \"front\"}, {\"后\": \"back\"}, {\"上\": \"up\"}, {\"下\": \"down\"}] default:\"left\"\r\n-- @param distance number 距离 # default:1 min:1 max:10000\r\n-- @param expression function 过滤表达式\r\n-- @return table 相交对象列表\r\n-- @field return[] $Part Part列表\r\n\r\nfunction _M.get_overLap_objects_v2(part, direction, distance, expression)\r\n    -- 入参判空校验\r\n    if part == nil then\r\n        return nil, \"产品(part参数)不能为空\"\r\n    end\r\n\r\n    -- 验证 part 是否为 Part 对象\r\n    local success = pcall(function()\r\n        return part:is_part()\r\n    end)\r\n    if not success then\r\n        return nil, \"产品(part参数)类型错误，必须是Part对象\"\r\n    end\r\n\r\n    if direction == nil then\r\n        return nil, \"方向(direction参数)不能为空\"\r\n    end\r\n    if type(direction) ~= \"string\" then\r\n        return nil, \"方向(direction参数)类型错误\"\r\n    end\r\n\r\n    -- 验证方向值\r\n    local valid_directions = {\"left\", \"right\", \"front\", \"back\", \"up\", \"down\"}\r\n    local is_valid_direction = false\r\n    for _, valid_dir in ipairs(valid_directions) do\r\n        if direction == valid_dir then\r\n            is_valid_direction = true\r\n            break\r\n        end\r\n    end\r\n    if not is_valid_direction then\r\n        return nil, \"方向(direction参数)值错误，必须是: left, right, front, back, up, down\"\r\n    end\r\n    \r\n    if distance == nil then\r\n        return nil, \"距离(distance参数)不能为空\"\r\n    end\r\n    if type(distance) ~= \"number\" then\r\n        return nil, \"距离(distance参数)类型错误\"\r\n    end\r\n    \r\n    if expression == nil then\r\n        expression = function(product) \r\n            return true\r\n        end\r\n    end\r\n    if type(expression) ~= \"function\" then\r\n        return nil, \"过滤表达式(expression参数)类型错误\"\r\n    end\r\n\r\n    local scene = Scene.current()\r\n    local scene_ptr = scene:get_ptr()\r\n    local part_ptr = part:get_ptr()\r\n    local overlap_objects = geom_engine.get_overLap_objects(scene_ptr, part_ptr, direction, distance)\r\n\r\n    -- 过滤对象\r\n    local filtered_objects = {}\r\n    if overlap_objects then\r\n        for _, obj_ptr in ipairs(overlap_objects) do\r\n            local obj = Part.new(obj_ptr)\r\n            local ok, result, err = pcall(expression, obj)\r\n            if ok then\r\n                if err ~= nil then\r\n                    return nil, \"过滤函数(filter_function参数)返回错误: \" .. err\r\n                end\r\n                if type(result) ~= \"boolean\" then\r\n                    return nil, \"过滤函数(filter_function参数)返回类型错误,必须为boolean\"\r\n                end\r\n                if result then\r\n                    table.insert(filtered_objects, obj)\r\n                end\r\n            else\r\n                return nil, \"过滤函数(filter_function参数)执行错误: \" .. tostring(result)\r\n            end\r\n        end\r\n    end\r\n\r\n    return filtered_objects\r\nend\r\nreturn _M",
            "remark": "保留字段",
            "functionStatus": "ENABLED",
            "isGeometry": 1,
            "funcClassifyFullPath": null,
            "enableTime": 1755758846000,
            "pos": 48,
            "categoryId": "8000000002",
            "isDelete": 0,
            "createTime": 1755758846000,
            "modifyTime": 1758534300000,
            "creator": 131,
            "creatorName": "11051352",
            "modifier": 476,
            "modifierName": "11051352",
            "usageCount": null
          },
          {
            "id": "8000005006",
            "funcCode": "get_overLap_objects_by_sweep_v2",
            "funcName": "获取产品指定方向平移指定距离重叠对象(扫掠方式)",
            "funcDesc": "v2 获取产品指定方向平移指定距离重叠对象(扫掠方式)",
            "funcCategory": "JIHE",
            "funcDirectory": "abstract-functions-v2/general",
            "configData": "{\"className\":\"get-overLap-objects-by-sweep-v2\",\"path\":\"abstract-functions-v2/general\",\"funcLuaName\":\"get_overLap_objects_by_sweep_v2\",\"input\":{\"widgetList\":[{\"id\":\"part\",\"type\":\"input\",\"defaultValue\":[],\"attributes\":{\"label\":\"主对象\",\"placeholder\":\"请输入主对象\",\"disabled\":true,\"paramType\":\"table\",\"paramSubType\":\"Part[]\"}},{\"id\":\"direction\",\"type\":\"select\",\"defaultValue\":\"left\",\"options\":[{\"label\":\"左\",\"value\":\"left\",\"type\":\"string\"},{\"label\":\"右\",\"value\":\"right\",\"type\":\"string\"},{\"label\":\"前\",\"value\":\"front\",\"type\":\"string\"},{\"label\":\"后\",\"value\":\"back\",\"type\":\"string\"},{\"label\":\"上\",\"value\":\"up\",\"type\":\"string\"},{\"label\":\"下\",\"value\":\"down\",\"type\":\"string\"}],\"attributes\":{\"label\":\"方向\",\"placeholder\":\"请输入方向\",\"paramType\":\"string\"}},{\"id\":\"distance\",\"type\":\"inputNumber\",\"defaultValue\":0,\"attributes\":{\"label\":\"距离\",\"placeholder\":\"请输入距离\",\"paramType\":\"number\",\"inputType\":\"number\"}},{\"id\":\"expression\",\"type\":\"function\",\"attributes\":{\"label\":\"过滤表达式\",\"placeholder\":\"请输入过滤表达式\",\"paramType\":\"function\"}}]},\"output\":{\"widgetList\":[{\"type\":\"input\",\"attributes\":{\"label\":\"重叠对象列表\",\"placeholder\":\"请输入重叠对象列表\",\"disabled\":true,\"paramType\":\"table\",\"paramSubType\":\"Part[]\"}}]}}",
            "luaScript": "local geom_engine = require('lib.engine.geom-engine')\r\nlocal Part = require(\"scene.part\")\r\nlocal Scene = require(\"scene.scene\")\r\n\r\nlocal _M = {}\r\n\r\n-- 00? 获取产品指定方向平移指定距离重叠对象(扫掠方式)\r\n-- @param part table 主对象 # default:[]\r\n-- @field part[] $Part 主对象列表\r\n-- @param direction string 方向  # options:[{\"左\": \"left\"}, {\"右\": \"right\"}, {\"前\": \"front\"}, {\"后\": \"back\"}, {\"上\": \"up\"}, {\"下\": \"down\"}] default:\"left\"\r\n-- @param distance number 距离 # default:0\r\n-- @param expression function 过滤表达式\r\n-- @return table 重叠对象列表\r\n-- @field return[] $Part Part列表\r\n\r\nfunction _M.get_overLap_objects_by_sweep_v2(part, direction, distance, expression)\r\n    -- 入参判空校验\r\n    if part == nil then\r\n        return nil, \"产品(part参数)不能为空\"\r\n    end\r\n\r\n    -- 验证 part 是否为 Part 对象\r\n    local success = pcall(function()\r\n        return part:is_part()\r\n    end)\r\n    if not success then\r\n        return nil, \"产品(part参数)类型错误，必须是Part对象\"\r\n    end\r\n\r\n    if direction == nil then\r\n        return nil, \"方向(direction参数)不能为空\"\r\n    end\r\n    if type(direction) ~= \"string\" then\r\n        return nil, \"方向(direction参数)类型错误\"\r\n    end\r\n\r\n    -- 验证方向值\r\n    local valid_directions = {\"left\", \"right\", \"front\", \"back\", \"up\", \"down\"}\r\n    local is_valid_direction = false\r\n    for _, valid_dir in ipairs(valid_directions) do\r\n        if direction == valid_dir then\r\n            is_valid_direction = true\r\n            break\r\n        end\r\n    end\r\n    if not is_valid_direction then\r\n        return nil, \"方向(direction参数)值错误，必须是: left, right, front, back, up, down\"\r\n    end\r\n    \r\n    if distance == nil then\r\n        return nil, \"距离(distance参数)不能为空\"\r\n    end\r\n    if type(distance) ~= \"number\" then\r\n        return nil, \"距离(distance参数)类型错误\"\r\n    end\r\n    \r\n    if expression == nil then\r\n        expression = function(product) \r\n            return true\r\n        end\r\n    end\r\n    if type(expression) ~= \"function\" then\r\n        return nil, \"过滤表达式(expression参数)类型错误\"\r\n    end\r\n\r\n    local scene = Scene.current()\r\n    local scene_ptr = scene:get_ptr()\r\n    local part_ptr = part:get_ptr()\r\n    local overlap_objects = geom_engine.get_overLap_objects_by_sweep(scene_ptr, part_ptr, direction, distance)\r\n\r\n    -- 过滤对象\r\n    local filtered_objects = {}\r\n    if overlap_objects then\r\n        for _, obj_ptr in ipairs(overlap_objects) do\r\n            local obj = Part.new(obj_ptr)\r\n            local ok, result = pcall(expression, obj)  --表达式执行失败则跳过，不返回错误\r\n            if ok and result then\r\n                table.insert(filtered_objects, obj)\r\n            end\r\n        end\r\n    end\r\n\r\n    return filtered_objects\r\nend\r\nreturn _M",
            "remark": "保留字段",
            "functionStatus": "ENABLED",
            "isGeometry": 1,
            "funcClassifyFullPath": null,
            "enableTime": 1758076773000,
            "pos": 57,
            "categoryId": "8000000002",
            "isDelete": 0,
            "createTime": 1758076773000,
            "modifyTime": 1758534287000,
            "creator": 131,
            "creatorName": "11051352",
            "modifier": 476,
            "modifierName": "11051352",
            "usageCount": null
          },
          {
            "id": "8000002016",
            "funcCode": "get_product_wall_distance_v2",
            "funcName": "获取产品离墙（硬装）距离",
            "funcDesc": "v2 获取产品离墙（硬装）距离",
            "funcCategory": "JIHE",
            "funcDirectory": "abstract-functions-v2/general",
            "configData": "{\"className\":\"get-product-wall-distance-v2\",\"path\":\"abstract-functions-v2/general\",\"funcLuaName\":\"get_product_wall_distance_v2\",\"input\":{\"widgetList\":[{\"id\":\"part\",\"type\":\"input\",\"defaultValue\":{},\"attributes\":{\"label\":\"主对象\",\"placeholder\":\"请输入主对象\",\"disabled\":true,\"paramType\":\"table\",\"paramSubType\":\"{}Part\"}},{\"id\":\"direction\",\"type\":\"select\",\"defaultValue\":\"left\",\"options\":[{\"label\":\"左墙（HS_LZQJL）\",\"value\":\"left\"},{\"label\":\"右墙（HS_LYQJL）\",\"value\":\"right\"},{\"label\":\"前墙（HS_LQQJL）\",\"value\":\"front\"},{\"label\":\"后墙（HS_LHQJL）\",\"value\":\"back\"},{\"label\":\"天花（HS_LTHJL）\",\"value\":\"up\"},{\"label\":\"地板（HS_LDBJL）\",\"value\":\"down\"}],\"attributes\":{\"label\":\"方向\",\"placeholder\":\"请输入方向\",\"paramType\":\"string\"}}]},\"output\":{\"widgetList\":[{\"type\":\"input\",\"attributes\":{\"label\":\"主对象\",\"placeholder\":\"请输入主对象\",\"disabled\":true,\"paramType\":\"table\",\"paramSubType\":\"{}Part\"}}]}}",
            "luaScript": "local geom_engine = require('lib.engine.geom-engine')\r\nlocal Part = require(\"scene.part\")\r\nlocal Scene = require(\"scene.scene\")\r\n\r\nlocal _M = {}\r\n\r\n-- 00? 获取产品离墙（硬装）距离\r\n-- @param part table 主对象 # default:{}\r\n-- @field part $Part table 对象Part\r\n-- @param direction string 方向  # options:[{\"左墙（HS_LZQJL）\": \"left\"}, {\"右墙（HS_LYQJL）\": \"right\"}, {\"前墙（HS_LQQJL）\": \"front\"}, {\"后墙（HS_LHQJL）\": \"back\"}, {\"天花（HS_LTHJL）\": \"up\"}, {\"地板（HS_LDBJL）\": \"down\"} ] default:\"left\"\r\n-- @return table 主对象\r\n-- @field return $Part 主对象\r\n\r\nfunction _M.get_product_wall_distance_v2(part, direction)\r\n    -- 入参判空校验\r\n    if part == nil then\r\n        return nil, \"产品(part参数)不能为空\"\r\n    end\r\n    -- 验证 part 是否为 Part 对象\r\n    local success = pcall(function()\r\n        return part:is_part()\r\n    end)\r\n    if not success then\r\n        return nil, \"产品(part参数)类型错误，必须是Part对象\"\r\n    end\r\n    if direction == nil then\r\n        return nil, \"方向(direction参数)不能为空\"\r\n    end\r\n    if type(direction) ~= \"string\" then\r\n        return nil, \"方向(direction参数)类型错误\"\r\n    end\r\n    local scene = Scene.current()\r\n    local scene_ptr = scene:get_ptr()\r\n    local part_ptr = part:get_ptr()\r\n    local main_obj = geom_engine.get_product_wall_distance(scene_ptr, part_ptr, direction)\r\n    if main_obj then\r\n        main_obj = Part.new(main_obj)\r\n    end\r\n    return main_obj\r\nend\r\nreturn _M",
            "remark": "保留字段",
            "functionStatus": "ENABLED",
            "isGeometry": 0,
            "funcClassifyFullPath": null,
            "enableTime": 1755758934000,
            "pos": 49,
            "categoryId": "8000000002",
            "isDelete": 0,
            "createTime": 1755758934000,
            "modifyTime": 1758534318000,
            "creator": 131,
            "creatorName": "11051352",
            "modifier": 476,
            "modifierName": "11051352",
            "usageCount": null
          }
        ]
      },
      {
        "id": "8000000003",
        "parentId": "0",
        "name": "返回结果",
        "level": 1,
        "sort": 0,
        "modifyTime": 1758106829000,
        "children": [],
        "functions": [
          {
            "id": 206,
            "funcCode": "print_result",
            "funcName": "V1值传递（指定返回内容）",
            "funcDesc": "值传递（指定返回内容）\n入参类型为“sring\"字符串，支持直接在条件函数后面进行添加。",
            "funcCategory": "LUOJI",
            "funcDirectory": "",
            "configData": "{\"className\":\"print-result\",\"funcLuaName\":\"print_result\",\"input\":{\"widgetList\":[{\"id\":\"value\",\"type\":\"input\",\"attributes\":{\"label\":\"输入值\",\"placeholder\":\"请输入输入值\",\"paramType\":\"string\"}}]},\"output\":{\"widgetList\":[{\"type\":\"input\",\"attributes\":{\"label\":\"输出值\",\"placeholder\":\"请输入输出值\",\"paramType\":\"string\"}}]}}",
            "luaScript": "local _M = {}\r\n\r\n-- @param value string 输入值 # default:\"\"\r\n-- @return string 输出值\r\n\r\nfunction _M.print_result(value)\r\n    return value\r\nend\r\n\r\nreturn _M",
            "remark": "保留字段",
            "functionStatus": "ENABLED",
            "isGeometry": 0,
            "funcClassifyFullPath": null,
            "enableTime": 1751422192000,
            "pos": 26,
            "categoryId": "8000000003",
            "isDelete": 0,
            "createTime": 1751422192000,
            "modifyTime": 1758534441000,
            "creator": 131,
            "creatorName": "11051352",
            "modifier": 476,
            "modifierName": "11051352",
            "usageCount": null
          },
          {
            "id": "8000002019",
            "funcCode": "get_string_result_v2",
            "funcName": "v2 值传递：指定输出内容（数值/字符串）",
            "funcDesc": "v2 值传递：指定输出内容（数值/字符串）：\n（1）入参数据结构（单个part）：{}、出参数据结构（单个part）：{}\n（2）函数作用：根据不同不同条件分支结果，自定义不同输出内容；注：自定义参数内容不能填写中文",
            "funcCategory": "LUOJI",
            "funcDirectory": "abstract-functions-v2/general",
            "configData": "{\"className\":\"get-string-result-v2\",\"path\":\"abstract-functions-v2/general\",\"funcLuaName\":\"get_string_result_v2\",\"input\":{\"widgetList\":[{\"id\":\"mainObj\",\"type\":\"input\",\"attributes\":{\"label\":\"指定素材\",\"placeholder\":\"请输入指定素材\",\"disabled\":true,\"paramType\":\"table\",\"paramSubType\":\"{}Part\"}},{\"id\":\"expression\",\"type\":\"function\",\"attributes\":{\"label\":\"自定义输出内容\",\"placeholder\":\"请输入自定义输出内容\",\"paramType\":\"function\"}}]},\"output\":{\"widgetList\":[{\"type\":\"input\",\"attributes\":{\"label\":\"输出内容\",\"placeholder\":\"请输入输出内容\",\"paramType\":\"string\"}}]}}",
            "luaScript": "local Scene = require(\"scene.scene\")\r\n\r\nlocal _M = {}\r\n\r\n-- v2-dev-值传递：指定输出内容（数值/字符串）\r\n-- @param mainObj table 指定素材 \r\n-- @field mainObj $Part 指定素材\r\n-- @param expression function 自定义输出内容\r\n-- @return string 输出内容\r\n\r\nfunction _M.get_string_result_v2 (mainObj, expression)\r\n    -- if mainObj == nil then -- 产品强烈要求放开类型校验\r\n    --     return nil, \"指定素材不能为空\"\r\n    -- end\r\n    -- local isPart = pcall(function()\r\n    --     return mainObj:is_part()\r\n    -- end)\r\n    -- if not isPart then\r\n    --     return nil, \"指定素材类型错误\"\r\n    -- end\r\n\r\n    local filter_fun\r\n    if expression == nil then\r\n        filter_fun = function(part)\r\n            return  \"\"\r\n        end\r\n    elseif type(expression) == \"function\" then\r\n        filter_fun = expression\r\n    else\r\n        return nil, \"表达式类型错误\"\r\n    end\r\n    local result = filter_fun(mainObj)\r\n    return result\r\nend\r\n\r\nreturn _M",
            "remark": "保留字段",
            "functionStatus": "ENABLED",
            "isGeometry": 0,
            "funcClassifyFullPath": null,
            "enableTime": 1756108041000,
            "pos": 52,
            "categoryId": "8000000003",
            "isDelete": 0,
            "createTime": 1756108041000,
            "modifyTime": 1758534341000,
            "creator": 131,
            "creatorName": "11051352",
            "modifier": 476,
            "modifierName": "11051352",
            "usageCount": null
          },
          {
            "id": "8000003006",
            "funcCode": "get_result_one_dimension_array_v2",
            "funcName": "结果输出（一维数组）",
            "funcDesc": "结果输出（一维数组）：\n（1）输入数据结构（一维数组）：[ {},{} ]、 输出数据结构（一维数组）：[ {},{} ]\n（2）函数作用：若上一节点的输出结果是一维数组，则需要接入结果输出一维数组",
            "funcCategory": "LUOJI",
            "funcDirectory": "abstract-functions-v2/general",
            "configData": "{\"className\":\"get-result-one-dimension-array-v2\",\"path\":\"abstract-functions-v2/general\",\"funcLuaName\":\"get_result_one_dimension_array_v2\",\"input\":{\"widgetList\":[{\"id\":\"mainObjs\",\"type\":\"input\",\"attributes\":{\"label\":\"指定素材\",\"placeholder\":\"请输入指定素材\",\"disabled\":true,\"paramType\":\"table\",\"paramSubType\":\"Part[]\"}},{\"id\":\"hierarchical_value\",\"type\":\"select\",\"defaultValue\":\"oneself\",\"options\":[{\"label\":\"顶级\",\"value\":\"top\",\"type\":\"string\"},{\"label\":\"父级\",\"value\":\"parent\",\"type\":\"string\"},{\"label\":\"自身\",\"value\":\"oneself\",\"type\":\"string\"}],\"attributes\":{\"label\":\"层级取值\",\"desc\":\"选择输出内容的参数取值层级。顶级：取当前对象顶级的参数，如果是相同的顶级只取一次；父级：取当前对象父级的参数，如果是相同的父级只取一次，如果没有父级则结果输出为空；自身：取当前对象自身的参数\",\"placeholder\":\"请输入层级取值\",\"paramType\":\"string\"}},{\"id\":\"output_attr\",\"type\":\"select\",\"defaultValue\":[\"id\"],\"options\":[{\"label\":\"id\",\"value\":\"id\",\"type\":\"string\"},{\"label\":\"name\",\"value\":\"name\",\"type\":\"string\"},{\"label\":\"type\",\"value\":\"type\",\"type\":\"string\"},{\"label\":\"modelTypeId\",\"value\":\"modelTypeId\",\"type\":\"string\"},{\"label\":\"productId\",\"value\":\"productId\",\"type\":\"string\"},{\"label\":\"prodCatId\",\"value\":\"prodCatId\",\"type\":\"string\"},{\"label\":\"textureId\",\"value\":\"textureId\",\"type\":\"string\"},{\"label\":\"textureName\",\"value\":\"textureName\",\"type\":\"string\"},{\"label\":\"roomId\",\"value\":\"roomId\",\"type\":\"string\"},{\"label\":\"jdProductId\",\"value\":\"jdProductId\",\"type\":\"string\"},{\"label\":\"W\",\"value\":\"W\",\"type\":\"string\"},{\"label\":\"D\",\"value\":\"D\",\"type\":\"string\"},{\"label\":\"H\",\"value\":\"H\",\"type\":\"string\"},{\"label\":\"sizeX\",\"value\":\"sizeX\",\"type\":\"string\"},{\"label\":\"sizeY\",\"value\":\"sizeY\",\"type\":\"string\"},{\"label\":\"sizeZ\",\"value\":\"sizeZ\",\"type\":\"string\"},{\"label\":\"boxSizeX\",\"value\":\"boxSizeX\",\"type\":\"string\"},{\"label\":\"boxSizeY\",\"value\":\"boxSizeY\",\"type\":\"string\"},{\"label\":\"boxSizeZ\",\"value\":\"boxSizeZ\",\"type\":\"string\"},{\"label\":\"absX\",\"value\":\"absX\",\"type\":\"string\"},{\"label\":\"absY\",\"value\":\"absY\",\"type\":\"string\"},{\"label\":\"absZ\",\"value\":\"absZ\",\"type\":\"string\"},{\"label\":\"X\",\"value\":\"X\",\"type\":\"string\"},{\"label\":\"Y\",\"value\":\"Y\",\"type\":\"string\"},{\"label\":\"Z\",\"value\":\"Z\",\"type\":\"string\"},{\"label\":\"CX\",\"value\":\"CX\",\"type\":\"string\"},{\"label\":\"CY\",\"value\":\"CY\",\"type\":\"string\"},{\"label\":\"CZ\",\"value\":\"CZ\",\"type\":\"string\"},{\"label\":\"RX\",\"value\":\"RX\",\"type\":\"string\"},{\"label\":\"RY\",\"value\":\"RY\",\"type\":\"string\"},{\"label\":\"RZ\",\"value\":\"RZ\",\"type\":\"string\"},{\"label\":\"YHQJ\",\"value\":\"YHQJ\",\"type\":\"string\"},{\"label\":\"SGCJXK\",\"value\":\"SGCJXK\",\"type\":\"string\"},{\"label\":\"ZCBSP\",\"value\":\"ZCBSP\",\"type\":\"string\"},{\"label\":\"SHQJ\",\"value\":\"SHQJ\",\"type\":\"string\"},{\"label\":\"MKBQ\",\"value\":\"MKBQ\",\"type\":\"string\"},{\"label\":\"JXGD\",\"value\":\"JXGD\",\"type\":\"string\"},{\"label\":\"XGCHD\",\"value\":\"XGCHD\",\"type\":\"string\"},{\"label\":\"ZCBQP\",\"value\":\"ZCBQP\",\"type\":\"string\"},{\"label\":\"YCBSP\",\"value\":\"YCBSP\",\"type\":\"string\"},{\"label\":\"YCBQP\",\"value\":\"YCBQP\",\"type\":\"string\"},{\"label\":\"offGround\",\"value\":\"offGround\",\"type\":\"string\"},{\"label\":\"SGCHD\",\"value\":\"SGCHD\",\"type\":\"string\"},{\"label\":\"YCBSDY\",\"value\":\"YCBSDY\",\"type\":\"string\"},{\"label\":\"SGCQS\",\"value\":\"SGCQS\",\"type\":\"string\"},{\"label\":\"BBHD\",\"value\":\"BBHD\",\"type\":\"string\"},{\"label\":\"offset\",\"value\":\"offset\",\"type\":\"string\"},{\"label\":\"ZCBFD\",\"value\":\"ZCBFD\",\"type\":\"string\"},{\"label\":\"materialBrandGoodId\",\"value\":\"materialBrandGoodId\",\"type\":\"string\"},{\"label\":\"ZCBJG\",\"value\":\"ZCBJG\",\"type\":\"string\"},{\"label\":\"ZCBHD\",\"value\":\"ZCBHD\",\"type\":\"string\"},{\"label\":\"JXHQS\",\"value\":\"JXHQS\",\"type\":\"string\"},{\"label\":\"ZCBSDY\",\"value\":\"ZCBSDY\",\"type\":\"string\"},{\"label\":\"ZHQJ\",\"value\":\"ZHQJ\",\"type\":\"string\"},{\"label\":\"XGCQS\",\"value\":\"XGCQS\",\"type\":\"string\"},{\"label\":\"YCBJG\",\"value\":\"YCBJG\",\"type\":\"string\"},{\"label\":\"YCBHD\",\"value\":\"YCBHD\",\"type\":\"string\"},{\"label\":\"YCBFD\",\"value\":\"YCBFD\",\"type\":\"string\"},{\"label\":\"HJXHS\",\"value\":\"HJXHS\",\"type\":\"string\"},{\"label\":\"location\",\"value\":\"location\",\"type\":\"string\"},{\"label\":\"JXHLX\",\"value\":\"JXHLX\",\"type\":\"string\"},{\"label\":\"JXHHS\",\"value\":\"JXHHS\",\"type\":\"string\"}],\"attributes\":{\"label\":\"输出内容配置\",\"desc\":\"输出内容定义，支持用户引用对象的基本属性，例如id，name都是拿参数1：mainObj所定义的对象身上的的id和name。\",\"placeholder\":\"请输入输出内容配置\",\"paramType\":\"string\",\"defaultOptions\":true,\"multiple\":true}},{\"id\":\"expression\",\"type\":\"function\",\"attributes\":{\"label\":\"自定义输出内容\",\"placeholder\":\"请输入自定义输出内容\",\"paramType\":\"function\"}}]},\"output\":{\"widgetList\":[{\"type\":\"input\",\"attributes\":{\"label\":\"输出内容\",\"placeholder\":\"请输入输出内容\",\"disabled\":true,\"paramType\":\"table\",\"paramSubType\":\"{:table}[]\"}}]}}",
            "luaScript": "local Scene = require(\"scene.scene\")\r\n\r\nlocal _M = {}\r\n\r\n\r\n-- 局部辅助函数：解析属性字符串\r\nlocal function parse_attributes_string(attributes_string)\r\n    local attributes = {}\r\n    if not attributes_string or attributes_string == \"\" then\r\n        return attributes\r\n    end\r\n    for attribute in string.gmatch(attributes_string, \"([^,]+)\") do\r\n        local trimmed = string.match(attribute, \"^%s*(.-)%s*$\")\r\n        if trimmed and trimmed ~= \"\" then\r\n            table.insert(attributes, trimmed)\r\n        end\r\n    end\r\n    return attributes\r\nend\r\n\r\n-- v2-结果输出（一维数组）\r\n-- @param mainObjs table 指定素材\r\n-- @field mainObjs[] $Part 指定素材\r\n-- @param hierarchical_value string 层级取值 # options:[{\"顶级\":\"top\"},{\"父级\":\"parent\"},{\"自身\":\"oneself\"}] default:\"oneself\" componentType:select desc:选择输出内容的参数取值层级。顶级：取当前对象顶级的参数，如果是相同的顶级只取一次；父级：取当前对象父级的参数，如果是相同的父级只取一次，如果没有父级则结果输出为空；自身：取当前对象自身的参数\r\n-- @param output_attr string 输出内容配置 # defaultOptions:true options:[\"id\",\"name\",\"type\",\"modelTypeId\",\"productId\",\"prodCatId\",\"textureId\",\"textureName\",\"roomId\",\"jdProductId\",\"W\",\"D\",\"H\",\"sizeX\",\"sizeY\",\"sizeZ\",\"boxSizeX\",\"boxSizeY\",\"boxSizeZ\",\"absX\",\"absY\",\"absZ\",\"X\",\"Y\",\"Z\",\"CX\",\"CY\",\"CZ\",\"RX\",\"RY\",\"RZ\",\"YHQJ\",\"SGCJXK\",\"ZCBSP\",\"SHQJ\",\"MKBQ\",\"JXGD\",\"XGCHD\",\"ZCBQP\",\"YCBSP\",\"YCBQP\",\"offGround\",\"SGCHD\",\"YCBSDY\",\"SGCQS\",\"BBHD\",\"offset\",\"ZCBFD\",\"materialBrandGoodId\",\"ZCBJG\",\"ZCBHD\",\"JXHQS\",\"ZCBSDY\",\"ZHQJ\",\"XGCQS\",\"YCBJG\",\"YCBHD\",\"YCBFD\",\"HJXHS\",\"location\",\"JXHLX\",\"JXHHS\"] default:[\"id\"] componentType:select-multi desc:输出内容定义，支持用户引用对象的基本属性，例如id，name都是拿参数1：mainObj所定义的对象身上的的id和name。\r\n-- @param expression function 自定义输出内容\r\n-- @return table 输出内容\r\n-- @field return[] table 输出内容\r\n\r\nfunction _M.get_result_one_dimension_array_v2(mainObjs, hierarchical_value, output_attr, expression)\r\n    if mainObjs == nil then\r\n        return nil, \"指定素材不能为空\"\r\n    end\r\n    if type(mainObjs) ~= \"table\" then\r\n        return nil, \"指定素材类型错误\"\r\n    end\r\n\r\n    -- 设置层级取值的默认值\r\n    hierarchical_value = hierarchical_value or \"oneself\"\r\n\r\n    -- 验证层级取值参数\r\n    if hierarchical_value ~= \"top\" and hierarchical_value ~= \"parent\" and hierarchical_value ~= \"oneself\" then\r\n        return nil, \"层级取值参数错误，必须是top、parent或oneself\"\r\n    end\r\n\r\n    for _, mainObj in ipairs(mainObjs) do\r\n        local isPart = pcall(function()\r\n            return mainObj:is_part()\r\n        end)\r\n        if not isPart then\r\n            return nil, \"指定素材类型错误\"\r\n        end\r\n    end\r\n\r\n    local content_fun\r\n    if expression == nil then\r\n        content_fun = function(curObj_result)\r\n            return curObj_result\r\n        end\r\n    elseif type(expression) == \"function\" then\r\n        content_fun = expression\r\n    else\r\n        return nil, \"表达式类型错误\"\r\n    end\r\n\r\n    local result = {}            -- 输出结果\r\n    local processed_targets = {} -- 用于记录已处理的目标对象，避免重复\r\n\r\n    for _, mainObj in ipairs(mainObjs) do\r\n        -- 根据层级取值选择目标对象\r\n        local target_obj = mainObj\r\n        local target_key = nil\r\n\r\n        if hierarchical_value == \"top\" then\r\n            -- 获取顶级对象\r\n            target_obj = mainObj:top()\r\n            target_key = target_obj:get_attribute(\"id\") or \"unknown_top\"\r\n        elseif hierarchical_value == \"parent\" then\r\n            -- 获取父级对象\r\n            local parent = mainObj:parent()\r\n            if not parent then\r\n                -- 如果没有父级，跳过此对象\r\n                goto continue\r\n            end\r\n            target_obj = parent\r\n            target_key = target_obj:get_attribute(\"id\") or \"unknown_parent\"\r\n        else\r\n            -- hierarchical_value == \"oneself\" 时，target_obj 保持为 mainObj\r\n            target_key = target_obj:get_attribute(\"id\") or \"unknown_self\"\r\n        end\r\n\r\n        -- 检查是否已经处理过相同的目标对象\r\n        if processed_targets[target_key] then\r\n            goto continue\r\n        end\r\n\r\n        -- 标记此目标对象已处理\r\n        processed_targets[target_key] = true\r\n\r\n        local curObj_result = {}\r\n        local attr_list = parse_attributes_string(output_attr)\r\n        -- 输出内容配置\r\n        for _, attr_name in ipairs(attr_list) do\r\n            local attr_value = target_obj:get_attribute(attr_name)\r\n            if attr_value ~= nil then\r\n                curObj_result[attr_name] = attr_value\r\n            end\r\n        end\r\n        -- 自定义输出内容\r\n        local content = content_fun(target_obj)\r\n        curObj_result[\"content\"] = content\r\n        table.insert(result, curObj_result)\r\n\r\n        ::continue::\r\n    end\r\n\r\n    return result\r\nend\r\n\r\nreturn _M\r\n",
            "remark": "保留字段",
            "functionStatus": "ENABLED",
            "isGeometry": 0,
            "funcClassifyFullPath": null,
            "enableTime": 1756173304000,
            "pos": 55,
            "categoryId": "8000000003",
            "isDelete": 0,
            "createTime": 1756173304000,
            "modifyTime": 1758107319000,
            "creator": 131,
            "creatorName": "11051352",
            "modifier": 476,
            "modifierName": "11051352",
            "usageCount": null
          },
          {
            "id": "8000002021",
            "funcCode": "get_result_two_dimension_array_v2",
            "funcName": "结果输出（二维数组）",
            "funcDesc": "结果输出（二维数组）：\n（1）入参数据结构（二维数组）：[ [ {},{} ],[ {},{} ]]、输出数据结构（二维数组）：[ [ {},{} ],[ {},{} ]]\n（2）函数作用：若上一节点的输出内容是二维数组，则需要接入结果输出（二维数组）",
            "funcCategory": "LUOJI",
            "funcDirectory": "abstract-functions-v2/general",
            "configData": "{\"className\":\"get-result-two-dimension-array-v2\",\"path\":\"abstract-functions-v2/general\",\"funcLuaName\":\"get_result_two_dimension_array_v2\",\"input\":{\"widgetList\":[{\"id\":\"mainObjs\",\"type\":\"input\",\"defaultValue\":[],\"attributes\":{\"label\":\"指定素材二维数组\",\"placeholder\":\"请输入指定素材二维数组\",\"disabled\":true,\"paramType\":\"table\",\"paramSubType\":\"Part[][]\"}},{\"id\":\"hierarchical_value\",\"type\":\"select\",\"defaultValue\":\"oneself\",\"options\":[{\"label\":\"顶级\",\"value\":\"top\",\"type\":\"string\"},{\"label\":\"父级\",\"value\":\"parent\",\"type\":\"string\"},{\"label\":\"自身\",\"value\":\"oneself\",\"type\":\"string\"}],\"attributes\":{\"label\":\"层级取值\",\"desc\":\"选择输出内容的参数取值层级。顶级：取当前对象顶级的参数，如果是相同的顶级只取一次；父级：取当前对象父级的参数，如果是相同的父级只取一次，如果没有父级则结果输出为空；自身：取当前对象自身的参数\",\"placeholder\":\"请输入层级取值\",\"paramType\":\"string\"}},{\"id\":\"output_attr\",\"type\":\"select\",\"defaultValue\":[\"id\"],\"options\":[{\"label\":\"id\",\"value\":\"id\",\"type\":\"string\"},{\"label\":\"name\",\"value\":\"name\",\"type\":\"string\"},{\"label\":\"type\",\"value\":\"type\",\"type\":\"string\"},{\"label\":\"modelTypeId\",\"value\":\"modelTypeId\",\"type\":\"string\"},{\"label\":\"productId\",\"value\":\"productId\",\"type\":\"string\"},{\"label\":\"prodCatId\",\"value\":\"prodCatId\",\"type\":\"string\"},{\"label\":\"textureId\",\"value\":\"textureId\",\"type\":\"string\"},{\"label\":\"textureName\",\"value\":\"textureName\",\"type\":\"string\"},{\"label\":\"roomId\",\"value\":\"roomId\",\"type\":\"string\"},{\"label\":\"jdProductId\",\"value\":\"jdProductId\",\"type\":\"string\"},{\"label\":\"W\",\"value\":\"W\",\"type\":\"string\"},{\"label\":\"D\",\"value\":\"D\",\"type\":\"string\"},{\"label\":\"H\",\"value\":\"H\",\"type\":\"string\"},{\"label\":\"sizeX\",\"value\":\"sizeX\",\"type\":\"string\"},{\"label\":\"sizeY\",\"value\":\"sizeY\",\"type\":\"string\"},{\"label\":\"sizeZ\",\"value\":\"sizeZ\",\"type\":\"string\"},{\"label\":\"boxSizeX\",\"value\":\"boxSizeX\",\"type\":\"string\"},{\"label\":\"boxSizeY\",\"value\":\"boxSizeY\",\"type\":\"string\"},{\"label\":\"boxSizeZ\",\"value\":\"boxSizeZ\",\"type\":\"string\"},{\"label\":\"absX\",\"value\":\"absX\",\"type\":\"string\"},{\"label\":\"absY\",\"value\":\"absY\",\"type\":\"string\"},{\"label\":\"absZ\",\"value\":\"absZ\",\"type\":\"string\"},{\"label\":\"X\",\"value\":\"X\",\"type\":\"string\"},{\"label\":\"Y\",\"value\":\"Y\",\"type\":\"string\"},{\"label\":\"Z\",\"value\":\"Z\",\"type\":\"string\"},{\"label\":\"CX\",\"value\":\"CX\",\"type\":\"string\"},{\"label\":\"CY\",\"value\":\"CY\",\"type\":\"string\"},{\"label\":\"CZ\",\"value\":\"CZ\",\"type\":\"string\"},{\"label\":\"RX\",\"value\":\"RX\",\"type\":\"string\"},{\"label\":\"RY\",\"value\":\"RY\",\"type\":\"string\"},{\"label\":\"RZ\",\"value\":\"RZ\",\"type\":\"string\"},{\"label\":\"YHQJ\",\"value\":\"YHQJ\",\"type\":\"string\"},{\"label\":\"SGCJXK\",\"value\":\"SGCJXK\",\"type\":\"string\"},{\"label\":\"ZCBSP\",\"value\":\"ZCBSP\",\"type\":\"string\"},{\"label\":\"SHQJ\",\"value\":\"SHQJ\",\"type\":\"string\"},{\"label\":\"MKBQ\",\"value\":\"MKBQ\",\"type\":\"string\"},{\"label\":\"JXGD\",\"value\":\"JXGD\",\"type\":\"string\"},{\"label\":\"XGCHD\",\"value\":\"XGCHD\",\"type\":\"string\"},{\"label\":\"ZCBQP\",\"value\":\"ZCBQP\",\"type\":\"string\"},{\"label\":\"YCBSP\",\"value\":\"YCBSP\",\"type\":\"string\"},{\"label\":\"YCBQP\",\"value\":\"YCBQP\",\"type\":\"string\"},{\"label\":\"offGround\",\"value\":\"offGround\",\"type\":\"string\"},{\"label\":\"SGCHD\",\"value\":\"SGCHD\",\"type\":\"string\"},{\"label\":\"YCBSDY\",\"value\":\"YCBSDY\",\"type\":\"string\"},{\"label\":\"SGCQS\",\"value\":\"SGCQS\",\"type\":\"string\"},{\"label\":\"BBHD\",\"value\":\"BBHD\",\"type\":\"string\"},{\"label\":\"offset\",\"value\":\"offset\",\"type\":\"string\"},{\"label\":\"ZCBFD\",\"value\":\"ZCBFD\",\"type\":\"string\"},{\"label\":\"materialBrandGoodId\",\"value\":\"materialBrandGoodId\",\"type\":\"string\"},{\"label\":\"ZCBJG\",\"value\":\"ZCBJG\",\"type\":\"string\"},{\"label\":\"ZCBHD\",\"value\":\"ZCBHD\",\"type\":\"string\"},{\"label\":\"JXHQS\",\"value\":\"JXHQS\",\"type\":\"string\"},{\"label\":\"ZCBSDY\",\"value\":\"ZCBSDY\",\"type\":\"string\"},{\"label\":\"ZHQJ\",\"value\":\"ZHQJ\",\"type\":\"string\"},{\"label\":\"XGCQS\",\"value\":\"XGCQS\",\"type\":\"string\"},{\"label\":\"YCBJG\",\"value\":\"YCBJG\",\"type\":\"string\"},{\"label\":\"YCBHD\",\"value\":\"YCBHD\",\"type\":\"string\"},{\"label\":\"YCBFD\",\"value\":\"YCBFD\",\"type\":\"string\"},{\"label\":\"HJXHS\",\"value\":\"HJXHS\",\"type\":\"string\"},{\"label\":\"location\",\"value\":\"location\",\"type\":\"string\"},{\"label\":\"JXHLX\",\"value\":\"JXHLX\",\"type\":\"string\"},{\"label\":\"JXHHS\",\"value\":\"JXHHS\",\"type\":\"string\"}],\"attributes\":{\"label\":\"输出内容配置\",\"desc\":\"输出内容定义，支持用户引用对象的基本属性，例如id，name都是拿参数1：mainObj所定义的对象身上的的id和name。\",\"placeholder\":\"请输入输出内容配置\",\"paramType\":\"string\",\"defaultOptions\":true,\"multiple\":true}},{\"id\":\"expression\",\"type\":\"function\",\"attributes\":{\"label\":\"自定义输出内容\",\"placeholder\":\"请输入自定义输出内容\",\"paramType\":\"function\"}}]},\"output\":{\"widgetList\":[{\"type\":\"input\",\"attributes\":{\"label\":\"输出内容\",\"placeholder\":\"请输入输出内容\",\"disabled\":true,\"paramType\":\"table\",\"paramSubType\":\"{:table}[]\"}}]}}",
            "luaScript": "local Scene = require(\"scene.scene\")\r\n\r\nlocal _M = {}\r\n\r\n\r\n-- 局部辅助函数：解析属性字符串\r\nlocal function parse_attributes_string(attributes_string)\r\n    local attributes = {}\r\n    if not attributes_string or attributes_string == \"\" then\r\n        return attributes\r\n    end\r\n    for attribute in string.gmatch(attributes_string, \"([^,]+)\") do\r\n        local trimmed = string.match(attribute, \"^%s*(.-)%s*$\")\r\n        if trimmed and trimmed ~= \"\" then\r\n            table.insert(attributes, trimmed)\r\n        end\r\n    end\r\n    return attributes\r\nend\r\n\r\n-- v2-结果输出（二维数组）\r\n-- @param mainObjs table 指定素材二维数组 # default:[]\r\n-- @field mainObjs[] $Part[] 指定素材一维数组\r\n-- @param hierarchical_value string 层级取值 # options:[{\"顶级\":\"top\"},{\"父级\":\"parent\"},{\"自身\":\"oneself\"}] default:\"oneself\" componentType:select desc:选择输出内容的参数取值层级。顶级：取当前对象顶级的参数，如果是相同的顶级只取一次；父级：取当前对象父级的参数，如果是相同的父级只取一次，如果没有父级则结果输出为空；自身：取当前对象自身的参数\r\n-- @param output_attr string 输出内容配置 # defaultOptions:true options:[\"id\",\"name\",\"type\",\"modelTypeId\",\"productId\",\"prodCatId\",\"textureId\",\"textureName\",\"roomId\",\"jdProductId\",\"W\",\"D\",\"H\",\"sizeX\",\"sizeY\",\"sizeZ\",\"boxSizeX\",\"boxSizeY\",\"boxSizeZ\",\"absX\",\"absY\",\"absZ\",\"X\",\"Y\",\"Z\",\"CX\",\"CY\",\"CZ\",\"RX\",\"RY\",\"RZ\",\"YHQJ\",\"SGCJXK\",\"ZCBSP\",\"SHQJ\",\"MKBQ\",\"JXGD\",\"XGCHD\",\"ZCBQP\",\"YCBSP\",\"YCBQP\",\"offGround\",\"SGCHD\",\"YCBSDY\",\"SGCQS\",\"BBHD\",\"offset\",\"ZCBFD\",\"materialBrandGoodId\",\"ZCBJG\",\"ZCBHD\",\"JXHQS\",\"ZCBSDY\",\"ZHQJ\",\"XGCQS\",\"YCBJG\",\"YCBHD\",\"YCBFD\",\"HJXHS\",\"location\",\"JXHLX\",\"JXHHS\"] default:[\"id\"] componentType:select-multi desc:输出内容定义，支持用户引用对象的基本属性，例如id，name都是拿参数1：mainObj所定义的对象身上的的id和name。\r\n-- @param expression function 自定义输出内容\r\n-- @return table 输出内容\r\n-- @field return[] table 输出内容\r\n\r\nfunction _M.get_result_two_dimension_array_v2(mainObjs, hierarchical_value, output_attr, expression)\r\n    if mainObjs == nil then\r\n        return nil, \"指定素材不能为空\"\r\n    end\r\n    if type(mainObjs) ~= \"table\" then\r\n        return nil, \"指定素材类型错误\"\r\n    end\r\n\r\n    -- 设置层级取值的默认值\r\n    hierarchical_value = hierarchical_value or \"oneself\"\r\n\r\n    -- 验证层级取值参数\r\n    if hierarchical_value ~= \"top\" and hierarchical_value ~= \"parent\" and hierarchical_value ~= \"oneself\" then\r\n        return nil, \"层级取值参数错误，必须是top、parent或oneself\"\r\n    end\r\n\r\n    local content_fun\r\n    if expression == nil then\r\n        content_fun = function(curObj_result)\r\n            return curObj_result\r\n        end\r\n    elseif type(expression) == \"function\" then\r\n        content_fun = expression\r\n    else\r\n        return nil, \"表达式类型错误\"\r\n    end\r\n\r\n    local result = {}            -- 输出结果\r\n    local all_objs = {}\r\n    local processed_targets = {} -- 用于记录已处理的目标对象，避免重复\r\n\r\n    for _, group in ipairs(mainObjs) do\r\n        if type(group) == \"table\" then\r\n            for _, mainObj in ipairs(group) do\r\n                if mainObj:is_part() then\r\n                    table.insert(all_objs, mainObj)\r\n                else\r\n                    return nil, \"指定素材类型错误\"\r\n                end\r\n            end\r\n        else\r\n            return nil, \"指定素材类型错误\"\r\n        end\r\n    end\r\n\r\n    for _, mainObj in ipairs(all_objs) do\r\n        -- 根据层级取值选择目标对象\r\n        local target_obj = mainObj\r\n        local target_key = nil\r\n\r\n        if hierarchical_value == \"top\" then\r\n            -- 获取顶级对象\r\n            target_obj = mainObj:top()\r\n            target_key = target_obj:get_attribute(\"id\") or \"unknown_top\"\r\n        elseif hierarchical_value == \"parent\" then\r\n            -- 获取父级对象\r\n            local parent = mainObj:parent()\r\n            if not parent then\r\n                -- 如果没有父级，跳过此对象\r\n                goto continue\r\n            end\r\n            target_obj = parent\r\n            target_key = target_obj:get_attribute(\"id\") or \"unknown_parent\"\r\n        else\r\n            -- hierarchical_value == \"oneself\" 时，target_obj 保持为 mainObj\r\n            target_key = target_obj:get_attribute(\"id\") or \"unknown_self\"\r\n        end\r\n\r\n        -- 检查是否已经处理过相同的目标对象\r\n        if processed_targets[target_key] then\r\n            goto continue\r\n        end\r\n\r\n        -- 标记此目标对象已处理\r\n        processed_targets[target_key] = true\r\n\r\n        local curObj_result = {}\r\n        local attr_list = parse_attributes_string(output_attr)\r\n        -- 输出内容配置\r\n        for _, attr_name in ipairs(attr_list) do\r\n            local attr_value = target_obj:get_attribute(attr_name)\r\n            if attr_value ~= nil then\r\n                curObj_result[attr_name] = attr_value\r\n            end\r\n        end\r\n        -- 自定义输出内容\r\n        local content = content_fun(target_obj)\r\n        curObj_result[\"content\"] = content\r\n        table.insert(result, curObj_result)\r\n\r\n        ::continue::\r\n    end\r\n\r\n    return result\r\nend\r\n\r\nreturn _M\r\n",
            "remark": "保留字段",
            "functionStatus": "ENABLED",
            "isGeometry": 0,
            "funcClassifyFullPath": null,
            "enableTime": 1756111845000,
            "pos": 54,
            "categoryId": "8000000003",
            "isDelete": 0,
            "createTime": 1756111845000,
            "modifyTime": 1758106937000,
            "creator": 131,
            "creatorName": "11051352",
            "modifier": 476,
            "modifierName": "11051352",
            "usageCount": null
          },
          {
            "id": "8000004006",
            "funcCode": "get_part_result_v2",
            "funcName": "结果输出（单个对象）",
            "funcDesc": "结果输出（单个Part）：\n（1）输入数据结构（单个part）： {}、输出数据结构（单个part）： {} \n（2）若上一节点的输出结果是单个对象，则需要使用此函数进行自定义输出结果",
            "funcCategory": "LUOJI",
            "funcDirectory": "abstract-functions-v2/general",
            "configData": "{\"className\":\"get-part-result-v2\",\"path\":\"abstract-functions-v2/general\",\"funcLuaName\":\"get_part_result_v2\",\"input\":{\"widgetList\":[{\"id\":\"mainObjs\",\"type\":\"input\",\"attributes\":{\"label\":\"指定素材\",\"placeholder\":\"请输入指定素材\",\"disabled\":true,\"paramType\":\"table\",\"paramSubType\":\"{}Part\"}},{\"id\":\"hierarchical_value\",\"type\":\"select\",\"defaultValue\":\"oneself\",\"options\":[{\"label\":\"顶级\",\"value\":\"top\",\"type\":\"string\"},{\"label\":\"父级\",\"value\":\"parent\",\"type\":\"string\"},{\"label\":\"自身\",\"value\":\"oneself\",\"type\":\"string\"}],\"attributes\":{\"label\":\"层级取值\",\"desc\":\"选择输出内容的参数取值层级，top代表取当前对象顶级的参数，parent代表取当前对象父级的参数，oneself代表取当前对象自身的参数\",\"placeholder\":\"请输入层级取值\",\"paramType\":\"string\"}},{\"id\":\"output_attr\",\"type\":\"select\",\"defaultValue\":[\"id\"],\"options\":[{\"label\":\"id\",\"value\":\"id\",\"type\":\"string\"},{\"label\":\"name\",\"value\":\"name\",\"type\":\"string\"},{\"label\":\"type\",\"value\":\"type\",\"type\":\"string\"},{\"label\":\"modelTypeId\",\"value\":\"modelTypeId\",\"type\":\"string\"},{\"label\":\"productId\",\"value\":\"productId\",\"type\":\"string\"},{\"label\":\"prodCatId\",\"value\":\"prodCatId\",\"type\":\"string\"},{\"label\":\"textureId\",\"value\":\"textureId\",\"type\":\"string\"},{\"label\":\"textureName\",\"value\":\"textureName\",\"type\":\"string\"},{\"label\":\"roomId\",\"value\":\"roomId\",\"type\":\"string\"},{\"label\":\"jdProductId\",\"value\":\"jdProductId\",\"type\":\"string\"},{\"label\":\"W\",\"value\":\"W\",\"type\":\"string\"},{\"label\":\"D\",\"value\":\"D\",\"type\":\"string\"},{\"label\":\"H\",\"value\":\"H\",\"type\":\"string\"},{\"label\":\"sizeX\",\"value\":\"sizeX\",\"type\":\"string\"},{\"label\":\"sizeY\",\"value\":\"sizeY\",\"type\":\"string\"},{\"label\":\"sizeZ\",\"value\":\"sizeZ\",\"type\":\"string\"},{\"label\":\"boxSizeX\",\"value\":\"boxSizeX\",\"type\":\"string\"},{\"label\":\"boxSizeY\",\"value\":\"boxSizeY\",\"type\":\"string\"},{\"label\":\"boxSizeZ\",\"value\":\"boxSizeZ\",\"type\":\"string\"},{\"label\":\"absX\",\"value\":\"absX\",\"type\":\"string\"},{\"label\":\"absY\",\"value\":\"absY\",\"type\":\"string\"},{\"label\":\"absZ\",\"value\":\"absZ\",\"type\":\"string\"},{\"label\":\"X\",\"value\":\"X\",\"type\":\"string\"},{\"label\":\"Y\",\"value\":\"Y\",\"type\":\"string\"},{\"label\":\"Z\",\"value\":\"Z\",\"type\":\"string\"},{\"label\":\"CX\",\"value\":\"CX\",\"type\":\"string\"},{\"label\":\"CY\",\"value\":\"CY\",\"type\":\"string\"},{\"label\":\"CZ\",\"value\":\"CZ\",\"type\":\"string\"},{\"label\":\"RX\",\"value\":\"RX\",\"type\":\"string\"},{\"label\":\"RY\",\"value\":\"RY\",\"type\":\"string\"},{\"label\":\"RZ\",\"value\":\"RZ\",\"type\":\"string\"},{\"label\":\"YHQJ\",\"value\":\"YHQJ\",\"type\":\"string\"},{\"label\":\"SGCJXK\",\"value\":\"SGCJXK\",\"type\":\"string\"},{\"label\":\"ZCBSP\",\"value\":\"ZCBSP\",\"type\":\"string\"},{\"label\":\"SHQJ\",\"value\":\"SHQJ\",\"type\":\"string\"},{\"label\":\"MKBQ\",\"value\":\"MKBQ\",\"type\":\"string\"},{\"label\":\"JXGD\",\"value\":\"JXGD\",\"type\":\"string\"},{\"label\":\"XGCHD\",\"value\":\"XGCHD\",\"type\":\"string\"},{\"label\":\"ZCBQP\",\"value\":\"ZCBQP\",\"type\":\"string\"},{\"label\":\"YCBSP\",\"value\":\"YCBSP\",\"type\":\"string\"},{\"label\":\"YCBQP\",\"value\":\"YCBQP\",\"type\":\"string\"},{\"label\":\"offGround\",\"value\":\"offGround\",\"type\":\"string\"},{\"label\":\"SGCHD\",\"value\":\"SGCHD\",\"type\":\"string\"},{\"label\":\"YCBSDY\",\"value\":\"YCBSDY\",\"type\":\"string\"},{\"label\":\"SGCQS\",\"value\":\"SGCQS\",\"type\":\"string\"},{\"label\":\"BBHD\",\"value\":\"BBHD\",\"type\":\"string\"},{\"label\":\"offset\",\"value\":\"offset\",\"type\":\"string\"},{\"label\":\"ZCBFD\",\"value\":\"ZCBFD\",\"type\":\"string\"},{\"label\":\"materialBrandGoodId\",\"value\":\"materialBrandGoodId\",\"type\":\"string\"},{\"label\":\"ZCBJG\",\"value\":\"ZCBJG\",\"type\":\"string\"},{\"label\":\"ZCBHD\",\"value\":\"ZCBHD\",\"type\":\"string\"},{\"label\":\"JXHQS\",\"value\":\"JXHQS\",\"type\":\"string\"},{\"label\":\"ZCBSDY\",\"value\":\"ZCBSDY\",\"type\":\"string\"},{\"label\":\"ZHQJ\",\"value\":\"ZHQJ\",\"type\":\"string\"},{\"label\":\"XGCQS\",\"value\":\"XGCQS\",\"type\":\"string\"},{\"label\":\"YCBJG\",\"value\":\"YCBJG\",\"type\":\"string\"},{\"label\":\"YCBHD\",\"value\":\"YCBHD\",\"type\":\"string\"},{\"label\":\"YCBFD\",\"value\":\"YCBFD\",\"type\":\"string\"},{\"label\":\"HJXHS\",\"value\":\"HJXHS\",\"type\":\"string\"},{\"label\":\"location\",\"value\":\"location\",\"type\":\"string\"},{\"label\":\"JXHLX\",\"value\":\"JXHLX\",\"type\":\"string\"},{\"label\":\"JXHHS\",\"value\":\"JXHHS\",\"type\":\"string\"}],\"attributes\":{\"label\":\"输出内容配置\",\"desc\":\"输出内容定义，支持用户引用对象的基本属性，例如id，name都是拿参数1：mainObj所定义的对象身上的的id和name。\",\"placeholder\":\"请输入输出内容配置\",\"paramType\":\"string\",\"defaultOptions\":true,\"multiple\":true}},{\"id\":\"expression\",\"type\":\"function\",\"attributes\":{\"label\":\"自定义输出内容\",\"placeholder\":\"请输入自定义输出内容\",\"paramType\":\"function\"}}]},\"output\":{\"widgetList\":[{\"type\":\"input\",\"attributes\":{\"label\":\"输出内容\",\"placeholder\":\"请输入输出内容\",\"disabled\":true,\"paramType\":\"table\",\"paramSubType\":\"{:table}\"}}]}}",
            "luaScript": "local Scene = require(\"scene.scene\")\r\n\r\nlocal _M = {}\r\n\r\n\r\n-- 局部辅助函数：解析属性字符串\r\nlocal function parse_attributes_string(attributes_string)\r\n    local attributes = {}\r\n    if not attributes_string or attributes_string == \"\" then\r\n        return attributes\r\n    end\r\n    for attribute in string.gmatch(attributes_string, \"([^,]+)\") do\r\n        local trimmed = string.match(attribute, \"^%s*(.-)%s*$\")\r\n        if trimmed and trimmed ~= \"\" then\r\n            table.insert(attributes, trimmed)\r\n        end\r\n    end\r\n    return attributes\r\nend\r\n\r\n-- v2-结果输出（单个Part）\r\n-- @param mainObjs table 指定素材\r\n-- @field mainObjs $Part 指定素材\r\n-- @param hierarchical_value string 层级取值 # options:[{\"顶级\":\"top\"},{\"父级\":\"parent\"},{\"自身\":\"oneself\"}] default:\"oneself\" componentType:select desc:选择输出内容的参数取值层级，top代表取当前对象顶级的参数，parent代表取当前对象父级的参数，oneself代表取当前对象自身的参数\r\n-- @param output_attr string 输出内容配置 # defaultOptions:true options:[\"id\",\"name\",\"type\",\"modelTypeId\",\"productId\",\"prodCatId\",\"textureId\",\"textureName\",\"roomId\",\"jdProductId\",\"W\",\"D\",\"H\",\"sizeX\",\"sizeY\",\"sizeZ\",\"boxSizeX\",\"boxSizeY\",\"boxSizeZ\",\"absX\",\"absY\",\"absZ\",\"X\",\"Y\",\"Z\",\"CX\",\"CY\",\"CZ\",\"RX\",\"RY\",\"RZ\",\"YHQJ\",\"SGCJXK\",\"ZCBSP\",\"SHQJ\",\"MKBQ\",\"JXGD\",\"XGCHD\",\"ZCBQP\",\"YCBSP\",\"YCBQP\",\"offGround\",\"SGCHD\",\"YCBSDY\",\"SGCQS\",\"BBHD\",\"offset\",\"ZCBFD\",\"materialBrandGoodId\",\"ZCBJG\",\"ZCBHD\",\"JXHQS\",\"ZCBSDY\",\"ZHQJ\",\"XGCQS\",\"YCBJG\",\"YCBHD\",\"YCBFD\",\"HJXHS\",\"location\",\"JXHLX\",\"JXHHS\"] default:[\"id\"] componentType:select-multi desc:输出内容定义，支持用户引用对象的基本属性，例如id，name都是拿参数1：mainObj所定义的对象身上的的id和name。\r\n-- @param expression function 自定义输出内容\r\n-- @return table 输出内容\r\n-- @field return table 输出内容\r\nfunction _M.get_part_result_v2(mainObj, hierarchical_value, output_attr, expression)\r\n    if mainObj == nil then\r\n        return nil, \"指定素材不能为空\"\r\n    end\r\n    if type(mainObj) ~= \"table\" then\r\n        return nil, \"指定素材类型错误\"\r\n    end\r\n    local isPart = pcall(function()\r\n        return mainObj:is_part()\r\n    end)\r\n    if not isPart then\r\n        return nil, \"指定素材类型错误\"\r\n    end\r\n\r\n    -- 设置层级取值的默认值\r\n    hierarchical_value = hierarchical_value or \"oneself\"\r\n\r\n    -- 验证层级取值参数\r\n    if hierarchical_value ~= \"top\" and hierarchical_value ~= \"parent\" and hierarchical_value ~= \"oneself\" then\r\n        return nil, \"层级取值参数错误，必须是top、parent或oneself\"\r\n    end\r\n\r\n    local content_fun\r\n    if expression == nil then\r\n        content_fun = function(curObj_result)\r\n            return curObj_result\r\n        end\r\n    elseif type(expression) == \"function\" then\r\n        content_fun = expression\r\n    else\r\n        return nil, \"表达式类型错误\"\r\n    end\r\n\r\n    local curObj_result = {}\r\n    local attr_list = parse_attributes_string(output_attr)\r\n\r\n    -- 根据层级取值选择目标对象\r\n    local target_obj = mainObj\r\n    if hierarchical_value == \"top\" then\r\n        -- 获取顶级对象\r\n        target_obj = mainObj:top()\r\n    elseif hierarchical_value == \"parent\" then\r\n        -- 获取父级对象\r\n        local parent = mainObj:parent()\r\n        if not parent then\r\n            -- 如果没有父级，返回空结果\r\n            return {}\r\n        end\r\n        target_obj = parent\r\n    end\r\n    -- hierarchical_value == \"oneself\" 时，target_obj 保持为 mainObj\r\n\r\n    -- 输出内容配置\r\n    for _, attr_name in ipairs(attr_list) do\r\n        local attr_value = target_obj:get_attribute(attr_name)\r\n        if attr_value ~= nil then\r\n            curObj_result[attr_name] = attr_value\r\n        end\r\n    end\r\n    -- 自定义输出内容\r\n    local content = content_fun(target_obj)\r\n    curObj_result[\"content\"] = content\r\n\r\n    return curObj_result\r\nend\r\n\r\nreturn _M\r\n",
            "remark": "保留字段",
            "functionStatus": "ENABLED",
            "isGeometry": 0,
            "funcClassifyFullPath": null,
            "enableTime": 1756205845000,
            "pos": 56,
            "categoryId": "8000000003",
            "isDelete": 0,
            "createTime": 1756205845000,
            "modifyTime": 1758156171000,
            "creator": 131,
            "creatorName": "11051352",
            "modifier": 476,
            "modifierName": "11051352",
            "usageCount": null
          },
          {
            "id": "8000001006",
            "funcCode": "get_attribute_single",
            "funcName": "获取产品属性值",
            "funcDesc": "获取产品属性值 若无该属性 则返回nil",
            "funcCategory": "LUOJI",
            "funcDirectory": "",
            "configData": "{\"className\":\"get-attribute-single\",\"funcLuaName\":\"get_attribute_single\",\"input\":{\"widgetList\":[{\"id\":\"input_product\",\"type\":\"input\",\"defaultValue\":[],\"attributes\":{\"label\":\"单个产品\",\"placeholder\":\"请输入单个产品\",\"paramType\":\"any\"}},{\"id\":\"param_name\",\"type\":\"input\",\"attributes\":{\"label\":\"属性名称\",\"placeholder\":\"请输入属性名称\",\"paramType\":\"string\"}}]},\"output\":{\"widgetList\":[{\"type\":\"input\",\"attributes\":{\"label\":\"属性值(stirng|nil)\",\"placeholder\":\"请输入属性值(stirng|nil)\",\"paramType\":\"any\"}}]}}",
            "luaScript": "local _M = {}\r\n\r\nlocal table = require(\"core.table\")\r\n\r\n\r\n-- 002 获取素材的参数值\r\n-- @param input_product any 单个产品 #default:[]\r\n-- @param param_name string 属性名称 #default:\"\"\r\n-- @return any 属性值(stirng|nil)\r\n\r\nfunction _M.get_attribute_single(input_product, param_name)\r\n-- 入参判空校验\r\n    if input_product == nil then\r\n        return nil, \"输入的单个产品(input_product参数)不能为空\"\r\n    end\r\n    if type(input_product) ~= \"table\" then\r\n        return nil, \"输入的单个产品(input_product参数)类型错误\"\r\n    end\r\n    if param_name == nil then\r\n        return nil, \"属性名称(param_name参数)不能为空\"\r\n    end\r\n    if type(param_name) ~= \"string\" then\r\n        return nil, \"属性名称(param_name参数)类型错误\"\r\n    end\r\n    local result = nil\r\n\r\n    local attr_value = input_product:get_attribute(param_name)\r\n    if attr_value and #attr_value > 0 then\r\n        result = attr_value\r\n    end\r\n\r\n    return result\r\nend\r\n\r\nreturn _M\r\n",
            "remark": "保留字段",
            "functionStatus": "ENABLED",
            "isGeometry": 0,
            "funcClassifyFullPath": null,
            "enableTime": 1754371954000,
            "pos": 41,
            "categoryId": "8000000003",
            "isDelete": 0,
            "createTime": 1754371954000,
            "modifyTime": 1759041561000,
            "creator": 131,
            "creatorName": "11051352",
            "modifier": 476,
            "modifierName": "11051352",
            "usageCount": null
          }
        ]
      },
      {
        "id": "-1",
        "parentId": "0",
        "name": "未分类",
        "level": 1,
        "sort": 9999999,
        "modifyTime": 1757488193000,
        "children": [],
        "functions": [
          {
            "id": 20001,
            "funcCode": "cesAny",
            "funcName": "cesAny",
            "funcDesc": "cesAny",
            "funcCategory": "LUOJI",
            "funcDirectory": "",
            "configData": "{\"className\":\"get-parent\",\"funcLuaName\":\"get_parent\",\"input\":{\"widgetList\":[{\"id\":\"op\",\"type\":\"input\",\"attributes\":{\"label\":\"复杂对象数组\",\"placeholder\":\"请输入复杂对象数组\",\"disabled\":true,\"paramType\":\"table\",\"paramSubType\":\"Part[]\"}},{\"id\":\"deep\",\"type\":\"input\",\"attributes\":{\"label\":\"复杂对象\",\"placeholder\":\"请输入复杂对象\",\"disabled\":true,\"paramType\":\"table\",\"paramSubType\":\"{}Part\"}}]},\"output\":{\"widgetList\":[{\"type\":\"input\",\"attributes\":{\"label\":\"返回用户信息对象\",\"placeholder\":\"请输入返回用户信息对象\",\"disabled\":true,\"paramType\":\"table\",\"paramSubType\":\"Part[]\"}}]}}",
            "luaScript": "\nlocal _M = {}\n\nlocal table = require(\"core.table\")\nlocal part = require(\"scene.part\")\n\n-- 参数示例\n-- @param op table 复杂对象数组\n-- @field op[] $Part part数组\n-- @param deep table 复杂对象\n-- @field deep $Part part数组\n-- @return table 返回用户信息对象\n-- @field return[] $Part part数组\nfunction _M.get_parent(op, number)\n    \nend\n\nreturn _M\n",
            "remark": "保留字段",
            "functionStatus": "ENABLED",
            "isGeometry": 0,
            "funcClassifyFullPath": null,
            "enableTime": 1752042146000,
            "pos": 37,
            "categoryId": -1,
            "isDelete": 0,
            "createTime": 1752042146000,
            "modifyTime": 1758531634000,
            "creator": 471,
            "creatorName": "3000895",
            "modifier": 476,
            "modifierName": "3000895",
            "usageCount": null
          },
          {
            "id": "8000006008",
            "funcCode": "get_part_texture_attribute_v2",
            "funcName": "v2 材质属性获取",
            "funcDesc": "v2 材质属性获取\n根据Part的Texture属性(part_attr)获取材质值 根据材质值对应的材质对象 获取返回材质对象对应属性(texture_attr)的值",
            "funcCategory": "LUOJI",
            "funcDirectory": "abstract-functions-v2/general",
            "configData": "{\"className\":\"get-part-texture-attribute-v2\",\"path\":\"abstract-functions-v2/general\",\"funcLuaName\":\"get_part_texture_attribute_v2\",\"input\":{\"widgetList\":[{\"id\":\"part\",\"type\":\"input\",\"attributes\":{\"label\":\"输入的Part\",\"placeholder\":\"请输入输入的Part\",\"disabled\":true,\"paramType\":\"table\",\"paramSubType\":\"{}Part\"}},{\"id\":\"part_attr\",\"type\":\"input\",\"attributes\":{\"label\":\"模型属性\",\"placeholder\":\"请输入模型属性\",\"paramType\":\"string\"}},{\"id\":\"texture_attr\",\"type\":\"input\",\"attributes\":{\"label\":\"材质属性\",\"placeholder\":\"请输入材质属性\",\"paramType\":\"string\"}}]},\"output\":{\"widgetList\":[{\"type\":\"input\",\"attributes\":{\"label\":\"输出值\",\"placeholder\":\"请输入输出值\",\"paramType\":\"string\"}}]}}",
            "luaScript": "local _M = {}\r\nlocal Scene = require(\"scene.scene\")\r\n\r\n-- v2-材质属性获取\r\n-- @param part table 输入的Part\r\n-- @field part $Part 输入的Part\r\n-- @param part_attr string 模型属性\r\n-- @param texture_attr string 材质属性\r\n-- @return string 输出值\r\n\r\n-- 根据Part的Texture属性(part_attr)获取材质值 根据材质值对应的材质对象 获取返回材质对象对应属性(texture_attr)的值\r\nfunction _M.get_part_texture_attribute_v2(part, part_attr, texture_attr)\r\n    if part == nil then\r\n        return nil, \"Part对象不能为空\"\r\n    end\r\n    if type(part) ~= \"table\" then\r\n        return nil, \"Part对象类型错误\"\r\n    end\r\n    local isPart = pcall(function()\r\n        return part:is_part()\r\n    end)\r\n    if not isPart then\r\n        return nil, \"Part对象类型错误\"\r\n    end\r\n    if part_attr == nil then\r\n        return nil, \"模型属性不能为空\"\r\n    end\r\n    if type(part_attr) ~= \"string\" then\r\n        return nil, \"模型属性类型错误\"\r\n    end\r\n\r\n    if texture_attr == nil then\r\n        return \"\" --材质属性不能为空 返回空字符串\r\n    end\r\n    if type(texture_attr) ~= \"string\" then\r\n        return nil, \"材质属性类型错误\"\r\n    end\r\n\r\n    local texture_id = part:get_attribute(part_attr) or \"\"\r\n    if texture_id == \"\" then\r\n        return \"\"\r\n    end\r\n    -- local is_ignore = part:get_attribute(attribute_name .. \"__ignored\") or \"false\"\r\n    -- if is_ignore == \"true\" then\r\n    --     return \"\" --属性被忽略 返回空字符串\r\n    -- end\r\n    local scene = Scene.current()\r\n    if not scene then\r\n        return nil, \"获取当前场景失败\"\r\n    end\r\n    local texture = scene:get_texture_by_id(texture_id)\r\n    if not texture then\r\n        return \"\" --resources 中找不到该材质 返回空字符串\r\n    end\r\n    local attribute_value = texture:get_attribute(texture_attr) or \"\"\r\n    return attribute_value\r\nend\r\n\r\nreturn _M",
            "remark": "保留字段",
            "functionStatus": "ENABLED",
            "isGeometry": 0,
            "funcClassifyFullPath": null,
            "enableTime": 1760342276000,
            "pos": 61,
            "categoryId": -1,
            "isDelete": 0,
            "createTime": 1760342276000,
            "modifyTime": 1760342517000,
            "creator": 131,
            "creatorName": "11051352",
            "modifier": 131,
            "modifierName": "11051352",
            "usageCount": null
          },
          {
            "id": "8000006007",
            "funcCode": "merge_strings_v2",
            "funcName": "v2 汇总拼接字符串（去重、汇总数量）",
            "funcDesc": "v2 汇总拼接字符串（去重、汇总数量）",
            "funcCategory": "LUOJI",
            "funcDirectory": "abstract-functions-v2/general",
            "configData": "{\"className\":\"merge-strings-v2\",\"path\":\"abstract-functions-v2/general\",\"funcLuaName\":\"merge_strings_v2\",\"input\":{\"widgetList\":[{\"id\":\"strings\",\"type\":\"input\",\"defaultValue\":[],\"attributes\":{\"label\":\"输入值\",\"placeholder\":\"请输入输入值\",\"disabled\":true,\"paramType\":\"table\",\"paramSubType\":\"string[]\"}},{\"id\":\"separator\",\"type\":\"input\",\"attributes\":{\"label\":\"分隔符号\",\"placeholder\":\"请输入分隔符号\",\"paramType\":\"string\"}},{\"id\":\"merge_type\",\"type\":\"select\",\"defaultValue\":0,\"options\":[{\"label\":\"去重\",\"value\":0,\"type\":\"number\"},{\"label\":\"去重并汇总\",\"value\":1,\"type\":\"number\"},{\"label\":\"不去重\",\"value\":2,\"type\":\"number\"}],\"attributes\":{\"label\":\"转换类型\",\"placeholder\":\"请输入转换类型\",\"paramType\":\"number\"}},{\"id\":\"count_prefix\",\"type\":\"input\",\"attributes\":{\"label\":\"数量前缀\",\"placeholder\":\"请输入数量前缀\",\"paramType\":\"string\"}}]},\"output\":{\"widgetList\":[{\"type\":\"input\",\"attributes\":{\"label\":\"拼接后的字符串\",\"placeholder\":\"请输入拼接后的字符串\",\"paramType\":\"string\"}}]}}",
            "luaScript": "\r\nlocal _M = {}\r\n\r\nlocal MERGE_TYPE = {\r\n    UNIQUE = 0,\r\n    UNIQUE_AND_SUMMARY = 1,\r\n    NOT_UNIQUE = 2,\r\n}\r\n\r\n-- v2-汇总拼接字符串（去重、汇总数量）\r\n-- @param strings table 输入值 # default:[]\r\n-- @field strings[] string 字符串列表\r\n-- @param separator string 分隔符号 # default:\"\"\r\n-- @param merge_type number 转换类型 #  options:[{\"去重\": 0},{\"去重并汇总\": 1},{\"不去重\": 2}] default:0\r\n-- @param count_prefix string 数量前缀 # default:\"\"\r\n-- @return string 拼接后的字符串\r\nfunction _M.merge_strings_v2(strings, separator, merge_type, count_prefix)\r\n    if type(strings) ~= \"table\" then\r\n        return nil, \"输入的字符串列表(strings参数)类型错误\"\r\n    end\r\n    for _, string in ipairs(strings) do\r\n        if type(string) ~= \"string\" then\r\n            return nil, \"输入的字符串列表(strings参数)类型错误\"\r\n        end\r\n    end\r\n    if #strings == 0 then\r\n        return \"\"\r\n    end\r\n    if separator == nil then\r\n        return nil, \"分隔符(separator参数)不能为空\"\r\n    end\r\n    if type(separator) ~= \"string\" then\r\n        return nil, \"分隔符(separator参数)类型错误\"\r\n    end\r\n    if merge_type == nil then\r\n        merge_type = 0\r\n    end\r\n    if type(merge_type) ~= \"number\" then\r\n        return nil, \"是否统计数量(is_count参数)类型错误\"\r\n    end\r\n    if count_prefix == nil then\r\n        count_prefix = \"\"\r\n    end\r\n    if type(count_prefix) ~= \"string\" then\r\n        return nil, \"统计数量前缀(count_prefix参数)类型错误\"\r\n    end\r\n    if strings == nil then\r\n        return nil, \"输入的字符串列表(strings参数)不能为空\"\r\n    end\r\n    local result = \"\"\r\n    local count_map = {}\r\n    for _, string in ipairs(strings) do\r\n        if string == nil or string == \"\" then\r\n            goto continue\r\n        end\r\n        if count_map[string] == nil then\r\n            count_map[string] = 1\r\n        else\r\n            count_map[string] = count_map[string] + 1\r\n        end\r\n        ::continue::\r\n    end\r\n    for string, count in pairs(count_map) do\r\n        if merge_type == MERGE_TYPE.UNIQUE_AND_SUMMARY then\r\n            result = result .. string .. \"(\" .. count_prefix .. count .. \")\" .. separator\r\n        elseif merge_type == MERGE_TYPE.UNIQUE then\r\n            result = result .. string .. separator\r\n        elseif merge_type == MERGE_TYPE.NOT_UNIQUE then\r\n            for i = 1, count do\r\n                result = result .. string .. separator\r\n            end\r\n        end\r\n    end\r\n    result = string.sub(result, 1, -#separator - 1)\r\n    return result\r\nend\r\n\r\nreturn _M",
            "remark": "保留字段",
            "functionStatus": "ENABLED",
            "isGeometry": 0,
            "funcClassifyFullPath": null,
            "enableTime": 1760334571000,
            "pos": 60,
            "categoryId": -1,
            "isDelete": 0,
            "createTime": 1760334571000,
            "modifyTime": 1760931597000,
            "creator": 131,
            "creatorName": "11051352",
            "modifier": 131,
            "modifierName": "11051352",
            "usageCount": null
          },
          {
            "id": "8000007007",
            "funcCode": "get_part_face_distance_v2",
            "funcName": "v2 计算产品A到产品B 指定方向面的距离",
            "funcDesc": "获取AB两Part 某方向上面的距离(eg：A的前面对应B的前面的距离)； \n在该方向上A突出B， 则返回正数， 代表A突出距离；\n 反之,返回负数，代表A凹陷距离；\n 若两物品的该方向不重合 ，返回无效数字（NaN）",
            "funcCategory": "JIHE",
            "funcDirectory": "abstract-function-v2/general",
            "configData": "{\"className\":\"get-part-face-distance-v2\",\"path\":\"abstract-function-v2/general\",\"funcLuaName\":\"get_part_face_distance_v2\",\"input\":{\"widgetList\":[{\"id\":\"partA\",\"type\":\"input\",\"attributes\":{\"label\":\"产品A\",\"placeholder\":\"请输入产品A\",\"disabled\":true,\"paramType\":\"table\",\"paramSubType\":\"{}Part\"}},{\"id\":\"partB\",\"type\":\"input\",\"attributes\":{\"label\":\"产品B\",\"placeholder\":\"请输入产品B\",\"disabled\":true,\"paramType\":\"table\",\"paramSubType\":\"{}Part\"}},{\"id\":\"direction\",\"type\":\"select\",\"defaultValue\":\"left\",\"options\":[{\"label\":\"左\",\"value\":\"left\",\"type\":\"string\"},{\"label\":\"右\",\"value\":\"right\",\"type\":\"string\"},{\"label\":\"前\",\"value\":\"front\",\"type\":\"string\"},{\"label\":\"后\",\"value\":\"back\",\"type\":\"string\"},{\"label\":\"上\",\"value\":\"up\",\"type\":\"string\"},{\"label\":\"下\",\"value\":\"down\",\"type\":\"string\"}],\"attributes\":{\"label\":\"方向\",\"placeholder\":\"请输入方向\",\"paramType\":\"string\"}}]},\"output\":{\"widgetList\":[{\"type\":\"inputNumber\",\"attributes\":{\"label\":\"距离\",\"placeholder\":\"请输入距离\",\"paramType\":\"number\",\"inputType\":\"number\"}}]}}",
            "luaScript": "local _M = {}\r\n\r\nlocal geom_engine = require('lib.engine.geom-engine')\r\n\r\n-- v2-计算产品A到产品B 指定方向面的距离 (eg：A的前面对应B的前面的距离)\r\n-- @param partA table 产品A\r\n-- @field partA $Part 产品A\r\n-- @param partB table 产品B\r\n-- @field partB $Part 产品B\r\n-- @param direction string 方向 # options:[{\"左\": \"left\"}, {\"右\": \"right\"}, {\"前\": \"front\"}, {\"后\": \"back\"}, {\"上\": \"up\"}, {\"下\": \"down\"}] default:\"left\"\r\n-- @return number 距离\r\n-- @note 计算产品A到产品B 指定方向面的距离 (eg：A的前面对应B的前面的距离)\r\nfunction _M.get_part_face_distance_v2(partA, partB, direction)\r\n    if partA == nil or partB == nil then\r\n        return nil, \"产品A或产品B对象不能为空\"\r\n    end\r\n    if type(partA) ~= \"table\" then\r\n        return nil, \"产品A对象类型错误\"\r\n    end\r\n    local is_partA = pcall(function()\r\n        return partA:is_part()\r\n    end)\r\n    if not is_partA then\r\n        return nil, \"产品A对象类型错误\"\r\n    end\r\n    local is_partB = pcall(function()\r\n        return partB:is_part()\r\n    end)\r\n    if not is_partB then\r\n        return nil, \"产品B对象类型错误\"\r\n    end\r\n    if direction == nil then\r\n        return nil, \"方向不能为空\"\r\n    end\r\n    if type(direction) ~= \"string\" then\r\n        return nil, \"方向类型错误\"\r\n    end\r\n    local partA_ptr = partA:get_ptr()\r\n    local partB_ptr = partB:get_ptr()\r\n    local distance = geom_engine.get_part_distance(partA_ptr, partB_ptr, direction)\r\n    return distance\r\nend\r\nreturn _M\r\n",
            "remark": "保留字段",
            "functionStatus": "ENABLED",
            "isGeometry": 1,
            "funcClassifyFullPath": null,
            "enableTime": 1760585031000,
            "pos": 63,
            "categoryId": -1,
            "isDelete": 0,
            "createTime": 1760585031000,
            "modifyTime": 1760585164000,
            "creator": 131,
            "creatorName": "11051352",
            "modifier": 131,
            "modifierName": "11051352",
            "usageCount": null
          },
          {
            "id": "8000007006",
            "funcCode": "get_part_distance_by_reference_part_v2",
            "funcName": "v2 计算产品A到产品B在参考Part的指定方向的距离",
            "funcDesc": "v2 计算产品A到产品B在参考Part的指定方向的距离:\n计算partA 到 partB 在参考物品的指定方向上投影的距离 （projectB - projectA） 含负数 正数表示间距",
            "funcCategory": "JIHE",
            "funcDirectory": "abstract-functions-v2/general",
            "configData": "{\"className\":\"get-part-distance-by-reference-part-v2\",\"path\":\"abstract-functions-v2/general\",\"funcLuaName\":\"get_part_distance_by_reference_part_v2\",\"input\":{\"widgetList\":[{\"id\":\"reference_part\",\"type\":\"input\",\"attributes\":{\"label\":\"参考Part\",\"placeholder\":\"请输入参考Part\",\"disabled\":true,\"paramType\":\"table\",\"paramSubType\":\"{}Part\"}},{\"id\":\"partA\",\"type\":\"input\",\"attributes\":{\"label\":\"产品A\",\"placeholder\":\"请输入产品A\",\"disabled\":true,\"paramType\":\"table\",\"paramSubType\":\"{}Part\"}},{\"id\":\"partB\",\"type\":\"input\",\"attributes\":{\"label\":\"产品B\",\"placeholder\":\"请输入产品B\",\"disabled\":true,\"paramType\":\"table\",\"paramSubType\":\"{}Part\"}},{\"id\":\"direction\",\"type\":\"select\",\"defaultValue\":\"left\",\"options\":[{\"label\":\"左\",\"value\":\"left\",\"type\":\"string\"},{\"label\":\"右\",\"value\":\"right\",\"type\":\"string\"},{\"label\":\"前\",\"value\":\"front\",\"type\":\"string\"},{\"label\":\"后\",\"value\":\"back\",\"type\":\"string\"},{\"label\":\"上\",\"value\":\"up\",\"type\":\"string\"},{\"label\":\"下\",\"value\":\"down\",\"type\":\"string\"}],\"attributes\":{\"label\":\"方向\",\"placeholder\":\"请输入方向\",\"paramType\":\"string\"}}]},\"output\":{\"widgetList\":[{\"type\":\"inputNumber\",\"attributes\":{\"label\":\"距离\",\"placeholder\":\"请输入距离\",\"paramType\":\"number\",\"inputType\":\"number\"}}]}}",
            "luaScript": "local _M = {}\r\nlocal geom_engine = require('lib.engine.geom-engine')\r\n\r\n-- v2-计算产品A到产品B在参考Part的指定方向的距离\r\n-- @param reference_part table 参考Part\r\n-- @field reference_part $Part 参考Part\r\n-- @param partA table 产品A\r\n-- @field partA $Part 产品A\r\n-- @param partB table 产品B\r\n-- @field partB $Part 产品B\r\n-- @param direction string 方向 # options:[{\"左\": \"left\"}, {\"右\": \"right\"}, {\"前\": \"front\"}, {\"后\": \"back\"}, {\"上\": \"up\"}, {\"下\": \"down\"}] default:\"left\"\r\n-- @return number 距离\r\n\r\nfunction _M.get_part_distance_by_reference_part_v2(reference_part, partA, partB, direction)\r\n    if reference_part == nil then\r\n        return nil, \"参考Part对象不能为空\"\r\n    end\r\n    if type(reference_part) ~= \"table\" then\r\n        return nil, \"参考Part对象类型错误\"\r\n    end\r\n    local is_reference_part = pcall(function()\r\n        return reference_part:is_part()\r\n    end)\r\n    if not is_reference_part then\r\n        return nil, \"参考Part对象类型错误\"\r\n    end\r\n    if partA == nil or partB == nil then\r\n        return nil, \"产品A或产品B对象不能为空\"\r\n    end\r\n    local is_partA = pcall(function()\r\n        return partA:is_part()\r\n    end)\r\n    if not is_partA then\r\n        return nil, \"产品A对象类型错误\"\r\n    end\r\n    local is_partB = pcall(function()\r\n        return partB:is_part()\r\n    end)\r\n    if not is_partB then\r\n        return nil, \"产品B对象类型错误\"\r\n    end\r\n    if direction == nil then\r\n        return nil, \"方向不能为空\"\r\n    end\r\n    if type(direction) ~= \"string\" then\r\n        return nil, \"方向类型错误\"\r\n    end\r\n    local partA_ptr = partA:get_ptr()\r\n    local partB_ptr = partB:get_ptr()\r\n    local reference_part_ptr = reference_part:get_ptr()\r\n    local distance = geom_engine.get_part_distance_by_reference_part(partA_ptr, partB_ptr, reference_part_ptr, direction)\r\n    return distance\r\nend\r\nreturn _M",
            "remark": "保留字段",
            "functionStatus": "ENABLED",
            "isGeometry": 1,
            "funcClassifyFullPath": null,
            "enableTime": 1760581651000,
            "pos": 62,
            "categoryId": -1,
            "isDelete": 0,
            "createTime": 1760581651000,
            "modifyTime": 1760581767000,
            "creator": 131,
            "creatorName": "11051352",
            "modifier": 131,
            "modifierName": "11051352",
            "usageCount": null
          },
          {
            "id": 23006,
            "funcCode": "ljftest001",
            "funcName": "台面未盖住全部柜体",
            "funcDesc": "当台面未盖住全部柜体时（包括柜体突出导角），需错误提示:台面未完全盖住柜体",
            "funcCategory": "LUOJI",
            "funcDirectory": "",
            "configData": "",
            "luaScript": "",
            "remark": "保留字段",
            "functionStatus": "ENABLED",
            "isGeometry": 0,
            "funcClassifyFullPath": null,
            "enableTime": 1757639967000,
            "pos": 74,
            "categoryId": -1,
            "isDelete": 0,
            "createTime": 1757639967000,
            "modifyTime": 1757639967000,
            "creator": 501,
            "creatorName": "ljf001",
            "modifier": 501,
            "modifierName": "ljf001",
            "usageCount": null
          },
          {
            "id": "8000005007",
            "funcCode": "get_targets_new_v2",
            "funcName": "找对象",
            "funcDesc": "v2 找对象（新），修改了默认输入类型为“string”，支持默认显示为“全场景”数据。",
            "funcCategory": "LUOJI",
            "funcDirectory": "abstract-functions-v2/general",
            "configData": "{\"className\":\"get-targets-new-v2\",\"path\":\"abstract-functions-v2/general\",\"funcLuaName\":\"get_targets_new_v2\",\"input\":{\"widgetList\":[{\"id\":\"objects\",\"type\":\"select\",\"defaultValue\":\"root\",\"options\":[{\"label\":\"全场景\",\"value\":\"root\",\"type\":\"string\"},{\"label\":\"程序传入\",\"value\":\"$target\",\"type\":\"string\"}],\"attributes\":{\"label\":\"产品列表\",\"placeholder\":\"请输入产品列表\",\"paramType\":\"string\"}},{\"id\":\"product_type\",\"type\":\"select\",\"defaultValue\":\"part\",\"options\":[{\"label\":\"参数化产品\",\"value\":\"part\",\"type\":\"string\"},{\"label\":\"非参数化产品\",\"value\":\"soft\",\"type\":\"string\"}],\"attributes\":{\"label\":\"产品类型\",\"placeholder\":\"请输入产品类型\",\"paramType\":\"string\"}},{\"id\":\"expression\",\"type\":\"function\",\"attributes\":{\"label\":\"条件表达式\",\"placeholder\":\"请输入条件表达式\",\"paramType\":\"function\"}}]},\"output\":{\"widgetList\":[{\"type\":\"input\",\"attributes\":{\"label\":\"产品列表\",\"placeholder\":\"请输入产品列表\",\"disabled\":true,\"paramType\":\"table\",\"paramSubType\":\"Part[]\"}}]}}",
            "luaScript": "local geom_engine = require('lib.engine.geom-engine')\r\nlocal Scene = require(\"scene.scene\")\r\n\r\nlocal _M = {}\r\n\r\n-- 00? 找对象\r\n-- @param objects string 产品列表 # options:[{\"全场景\": \"root\"}, {\"程序传入\": \"$target\"}] default: \"root\"\r\n-- @param product_type string 产品类型 # options:[{\"参数化产品\": \"part\"}, {\"非参数化产品\": \"soft\"}] default:\"part\"\r\n-- @param expression function 条件表达式\r\n-- @return table 产品列表\r\n-- @field return[] $Part Part列表\r\n\r\nfunction _M.get_targets_new_v2 (objects, product_type, filter_fun)\r\n    -- 入参判空校验\r\n    if objects == nil then\r\n        return nil, \"对象列表(objects参数)不能为空\"\r\n    end\r\n    if product_type == nil then\r\n        return nil, \"产品类型(product_type参数)不能为空\"\r\n    end\r\n    if type(product_type) ~= \"string\" then\r\n        return nil, \"产品类型(product_type参数)类型错误\"\r\n    end\r\n\r\n    if filter_fun == nil then\r\n        filter_fun = function(product)\r\n            return true\r\n        end\r\n    end\r\n    if type(filter_fun) ~= \"function\" then\r\n        return nil, \"回调过滤函数(filter_fun参数)类型错误\"\r\n    end\r\n\r\n    local objects_list = {}\r\n    local scene = Scene.current()\r\n    if type(objects) == \"string\" then\r\n        if objects == \"root\" then --拿全场景\r\n            objects_list = scene:get_all_parts()\r\n        end\r\n    else\r\n        if type(objects) ~= \"table\" then\r\n            return nil, \"对象列表(objects参数)类型错误\"\r\n        end\r\n\r\n        -- 判断objects是否为Part类型 --直接传target进来时命中\r\n        local success = pcall(function()\r\n            return objects:is_part()\r\n        end)\r\n        if success then\r\n            table.insert(objects_list, objects)\r\n        else\r\n            for _, object in ipairs(objects) do\r\n                -- 判断object是否为Part类型\r\n                local success = pcall(function()\r\n                    return object:is_part()\r\n                end)\r\n                if not success then\r\n                    return nil, \"对象列表(objects参数)类型错误\"\r\n                end\r\n                table.insert(objects_list, object)\r\n            end\r\n        end\r\n    end\r\n    local filter_objects = {}\r\n    for _, object in ipairs(objects_list) do\r\n        local ok, result = pcall(filter_fun, object)  --表达式执行失败则跳过，不返回错误\r\n        if ok and result then\r\n            table.insert(filter_objects, object)\r\n        end\r\n    end\r\n    return filter_objects\r\nend\r\nreturn _M",
            "remark": "保留字段",
            "functionStatus": "ENABLED",
            "isGeometry": 0,
            "funcClassifyFullPath": null,
            "enableTime": 1758533528000,
            "pos": 58,
            "categoryId": -1,
            "isDelete": 0,
            "createTime": 1758533528000,
            "modifyTime": 1759125085000,
            "creator": 131,
            "creatorName": "11051352",
            "modifier": 131,
            "modifierName": "11051352",
            "usageCount": null
          },
          {
            "id": "8000002018",
            "funcCode": "split_order_bed_product",
            "funcName": "拆单函数: 定制床-榻榻米产品分单",
            "funcDesc": "拆单函数: 定制床-榻榻米产品分单",
            "funcCategory": "LUOJI",
            "funcDirectory": "split-order",
            "configData": "{\"className\":\"split-order-bed-product\",\"path\":\"split-order\",\"funcLuaName\":\"split_order_bed_product\",\"input\":{\"widgetList\":[{\"id\":\"context\",\"type\":\"input\",\"attributes\":{\"label\":\"输入上下文\",\"placeholder\":\"请输入输入上下文\",\"paramType\":\"any\"}},{\"id\":\"distance\",\"type\":\"inputNumber\",\"attributes\":{\"label\":\"判断是否挨着的距离阈值\",\"placeholder\":\"请输入判断是否挨着的距离阈值\",\"paramType\":\"number\",\"inputType\":\"number\"}}]},\"output\":{\"widgetList\":[{\"type\":\"input\",\"attributes\":{\"label\":\"输出上下文\",\"placeholder\":\"请输入输出上下文\",\"paramType\":\"any\"}}]}}",
            "luaScript": "local Scene = require(\"scene.scene\")\r\nlocal generator_algorithm = require('utils.generator-algorithm')\r\nlocal geom_engine = require('lib.engine.geom-engine')\r\nlocal Part = require(\"scene.part\")\r\nlocal _M = {}\r\n\r\n-- ============================================================================\r\n-- 辅助函数\r\n-- ============================================================================\r\n\r\n-- 按房间ID分组\r\nlocal function group_parts_by_roomId(parts)\r\n    local roomId_groups = {}\r\n    for _, part in ipairs(parts) do\r\n        local roomId = part:get_attribute(\"roomId\") or \"\"\r\n        if not roomId_groups[roomId] then\r\n            roomId_groups[roomId] = {}\r\n        end\r\n        table.insert(roomId_groups[roomId], part)\r\n    end\r\n\r\n    return roomId_groups\r\nend\r\n\r\n-- 创建分组结果项\r\nlocal function create_group_item(group, original_item)\r\n    local group_item = {\r\n        productIds = {}\r\n    }\r\n    -- 提取分组中所有parts的ID\r\n    for _, part in ipairs(group) do\r\n        table.insert(group_item.productIds, part:get_attribute(\"id\"))\r\n    end\r\n    -- 复制原item的其他属性\r\n    for key, value in pairs(original_item) do\r\n        if key ~= \"productIds\" then\r\n            group_item[key] = value\r\n        end\r\n    end\r\n    \r\n    return group_item\r\nend\r\n\r\n-- ============================================================================\r\n-- 主函数\r\n-- ============================================================================\r\n\r\n-- 定制床-榻榻米产品分单函数\r\n-- @param context any 输入上下文\r\n-- @param distance number 判断是否挨着的距离阈值\r\n-- @return any 输出上下文   \r\nfunction _M.split_order_bed_product(context, distance)\r\n    -- 入参校验\r\n    if context == nil then\r\n        return nil, \"入参不能为空\"\r\n    end\r\n    if type(context) ~= \"table\" then\r\n        return nil, \"入参类型错误\"\r\n    end\r\n    if distance == nil then\r\n        return nil, \"距离不能为空\"\r\n    end\r\n    if type(distance) ~= \"number\" then\r\n        return nil, \"距离类型错误\"\r\n    end\r\n    if #context == 0 then\r\n        return context\r\n    end\r\n    \r\n    local scene = Scene.current()\r\n    local current_items = context\r\n    local result_items = {}\r\n    -- 处理每个item\r\n    for _, item in ipairs(current_items) do\r\n        if item.productIds and #item.productIds > 0 then\r\n            -- 获取所有parts\r\n            local parts = {}\r\n            for _, partId in ipairs(item.productIds) do\r\n                local part = scene:get_part_by_id(partId)\r\n                if part then\r\n                    table.insert(parts, part)\r\n                end\r\n            end\r\n\r\n            local line_proCatIds_map = {\r\n                [\"503\"] = true,\r\n                [\"504\"] = true,\r\n                [\"562\"] = true,\r\n                [\"576\"] = true,\r\n                [\"728\"] = true\r\n            }\r\n            local line_parts = {}\r\n            local other_parts = {}\r\n            for _, part in ipairs(parts) do\r\n                local jdProCatId = part:get_attribute(\"prodCatId\") or \"\"\r\n                if line_proCatIds_map[jdProCatId] then\r\n                    table.insert(line_parts, part)\r\n                else\r\n                    table.insert(other_parts, part)\r\n                end\r\n            end\r\n            local bed_parts = {} -- 床\r\n            local bed_screen_parts = {} -- 床屏\r\n            local doors = {} -- 趟门门\r\n            local tatami_parts = {} -- 榻榻米\r\n            local cabinet_parts = {} -- 常规柜体\r\n            local material_parts = {} -- 辅料\r\n\r\n            for _, part in ipairs(other_parts) do\r\n                local jdFullCatCode = part:get_attribute(\"jdFullCatCode\")\r\n                if string.find(jdFullCatCode, \"^GL_GTSJK_BSDZC_C01\") then\r\n                    table.insert(bed_parts, part)\r\n                elseif string.find(jdFullCatCode, \"^GL_GTSJK_BSDZC_CP\") then\r\n                    table.insert(bed_screen_parts, part)\r\n                elseif jdFullCatCode == \"UNKNOWN\" then\r\n                    table.insert(doors, part)\r\n                elseif string.find(jdFullCatCode, \"^GL_GTSJK_GTL_TTM\") then\r\n                    table.insert(tatami_parts, part)\r\n                elseif string.find(jdFullCatCode, \"^GL_GTSJK_FL\") then\r\n                    table.insert(material_parts, part)\r\n                else --非以上物品，则认为是常规柜体\r\n                    table.insert(cabinet_parts, part) \r\n                end\r\n            end\r\n\r\n            -- case_1:\r\n            --[[ 床和床屏\r\n            1、默认紧靠（上下左右前后留个方向-间距小于10mm)就拆在一起一个单，非紧靠时，床/床屏独立成单。\r\n            2、床屏若单独无其他床/床屏紧靠（上下左右前后-间距小于10mm)时，检测是否与【榻榻米】紧靠一起，是则加入“榻榻米”类型产品内一起判断。\r\n            ]]\r\n            local all_groups = {}\r\n            local bed_and_bed_screen_parts = bed_parts\r\n            if #bed_screen_parts > 0 then\r\n                for _, bed_screen_part in ipairs(bed_screen_parts) do\r\n                    table.insert(bed_and_bed_screen_parts, bed_screen_part)\r\n                end\r\n            end\r\n            local bed_and_bed_screen_touch_groups = generator_algorithm.group_parts_by_touch(bed_and_bed_screen_parts, distance)\r\n            for _, bed_and_bed_screen_touch_group in ipairs(bed_and_bed_screen_touch_groups) do\r\n                if #bed_and_bed_screen_touch_group == 1 then\r\n                    local cur_product = bed_and_bed_screen_touch_group[1]\r\n                    if cur_product:get_attribute(\"jdFullCatCode\") == \"GL_GTSJK_BSDZC_CP\" then\r\n                        table.insert(tatami_parts, cur_product)\r\n                    else\r\n                        table.insert(all_groups, bed_and_bed_screen_touch_group)\r\n                    end\r\n                else\r\n                    table.insert(all_groups, bed_and_bed_screen_touch_group)\r\n                end\r\n            end\r\n           \r\n            -- case_2:\r\n            --[[ 趟门\r\n            1、顶级父级趟门没有覆盖柜体时，趟门单独拆一个单；有覆盖柜体时，跟随“其他柜体”拆单规则。\r\n            覆盖定义：计算趟门前后距离小于3mm内有柜体是跟随柜体拆分单\r\n            ]]\r\n            for _, door in ipairs(doors) do\r\n                local is_touch_cabinet = false\r\n                for _, cabinet in ipairs(cabinet_parts) do\r\n                    local is_touch = geom_engine.check_parts_touch(\r\n                        door:get_ptr(),\r\n                        cabinet:get_ptr(),\r\n                        3\r\n                    )\r\n                    if is_touch then\r\n                        is_touch_cabinet = true\r\n                        break\r\n                    end\r\n                end\r\n                if is_touch_cabinet then\r\n                    table.insert(cabinet_parts, door)\r\n                else\r\n                    table.insert(all_groups, {door})\r\n                end\r\n            end\r\n\r\n            -- case_3:\r\n            --[[ 榻榻米\r\n            1、收集方案中所有榻榻米产品，紧靠（上下左右前后留个方向-间距小于10mm)的榻榻米产品（包含落单紧靠的床屏产品）分到一个组；\r\n            3、若存在前后左右紧靠的其他柜子，柜子高度小于等于当前榻榻米组高度，则加入到同分组。\r\n            4、\"GL_GTSJK_FL_TTM\" / \"GL_GTSJK_FL_TTM_%\" 辅料，也加入到榻榻米组紧靠逻辑；\r\n            ]]\r\n            local tatami_and_material_parts = tatami_parts\r\n            for _, material_part in ipairs(material_parts) do\r\n                local jdFullCatCode = material_part:get_attribute(\"jdFullCatCode\")\r\n                if jdFullCatCode == \"GL_GTSJK_FL_TTM\" or string.find(jdFullCatCode, \"^GL_GTSJK_FL_TTM_\") then\r\n                    table.insert(tatami_and_material_parts, material_part)\r\n                end\r\n            end\r\n            local tatami_touch_groups = generator_algorithm.group_parts_by_touch(tatami_and_material_parts, distance)\r\n                        -- 若组中产品只有辅料物品 删除该组\r\n            local new_tatami_touch_groups = {}\r\n            for tatami_touch_group_index, tatami_touch_group in ipairs(tatami_touch_groups) do\r\n                local is_only_material = true\r\n                for _, tatami_part in ipairs(tatami_touch_group) do\r\n                    local jdFullCatCode = tatami_part:get_attribute(\"jdFullCatCode\")\r\n                    if jdFullCatCode ~= \"GL_GTSJK_FL\" and not string.find(jdFullCatCode, \"^GL_GTSJK_FL_\") then\r\n                        is_only_material = false\r\n                        break\r\n                    end\r\n                end\r\n                if not is_only_material then\r\n                    table.insert(new_tatami_touch_groups, tatami_touch_group)\r\n                end\r\n            end\r\n            tatami_touch_groups = new_tatami_touch_groups\r\n\r\n            -- 将紧靠的榻榻米辅料 移除辅料列表\r\n            local to_remove_material = {}\r\n            local new_material_parts = {}\r\n            for material_index, material_part in ipairs(material_parts) do\r\n                local material_id = material_part:get_attribute(\"id\")\r\n                for tatami_touch_group_index, tatami_touch_group in ipairs(tatami_touch_groups) do\r\n                    for _, tatami_part in ipairs(tatami_touch_group) do\r\n                        local tatami_id = tatami_part:get_attribute(\"id\")\r\n                        if tatami_id == material_id then\r\n                            to_remove_material[material_index] = true\r\n                            break\r\n                        end\r\n                    end\r\n                end\r\n            end\r\n            for i, material_part in ipairs(material_parts) do\r\n                if not to_remove_material[i] then\r\n                    table.insert(new_material_parts, material_part)\r\n                end\r\n            end\r\n            material_parts = new_material_parts\r\n            for _, tatami_touch_group in ipairs(tatami_touch_groups) do\r\n                local tatami_group_max_z = 0\r\n                for _, tatami_part in ipairs(tatami_touch_group) do\r\n                    local tatami_part_max_z = geom_engine.get_part_vertex_maxz(tatami_part:get_ptr())\r\n                    if tatami_part_max_z > tatami_group_max_z then\r\n                        tatami_group_max_z = tatami_part_max_z\r\n                    end\r\n                end\r\n\r\n                local to_remove = {}\r\n                for cabinet_index, cabinet_part in ipairs(cabinet_parts) do\r\n                    local is_in_tatami_group = false\r\n                    for _, tatami_part in ipairs(tatami_touch_group) do\r\n                        local is_touch = geom_engine.check_parts_touch(\r\n                            tatami_part:get_ptr(),\r\n                            cabinet_part:get_ptr(),\r\n                            distance\r\n                        )\r\n                        if is_touch then\r\n                            local cabinet_part_max_z = geom_engine.get_part_vertex_maxz(cabinet_part:get_ptr())\r\n                            if cabinet_part_max_z <= tatami_group_max_z then\r\n                                is_in_tatami_group = true\r\n                                break\r\n                            end\r\n                        end\r\n                    end\r\n                    if is_in_tatami_group then\r\n                        table.insert(tatami_touch_group, cabinet_part)\r\n                        to_remove[cabinet_index] = true\r\n                    end\r\n                end\r\n\r\n                -- 移除已加入的柜子\r\n                local new_cabinet_parts = {}\r\n                for i, cabinet_part in ipairs(cabinet_parts) do\r\n                    if not to_remove[i] then\r\n                        table.insert(new_cabinet_parts, cabinet_part)\r\n                    end\r\n                end\r\n                cabinet_parts = new_cabinet_parts\r\n\r\n            end\r\n\r\n            -- case_4:\r\n            --[[ 常规柜体\r\n            1、剩余柜体按紧靠关系分单\r\n            2、将分好组的常规柜体，空间id相同的组，取成组后的柜体最大AABB，垂直上下进行投影映射，最大投影面垂直投影有相交的进一步都合并到一组；\r\n            3、2025-10-22新增规则：将辅料除榻榻米辅料外的其它辅料 也加入到柜体组紧靠逻辑；\r\n            ]]\r\n            local cabinet_and_material_parts = cabinet_parts\r\n            for _, material_part in ipairs(material_parts) do\r\n                local jdFullCatCode = material_part:get_attribute(\"jdFullCatCode\")\r\n                if jdFullCatCode ~= \"GL_GTSJK_FL_TTM\" and not string.find(jdFullCatCode, \"^GL_GTSJK_FL_TTM_\") then\r\n                    table.insert(cabinet_and_material_parts, material_part)\r\n                end\r\n            end\r\n            local cabinet_touch_groups = generator_algorithm.group_parts_by_touch(cabinet_and_material_parts, distance)\r\n            -- 若组中产品只有辅料物品 删除该组\r\n            local new_cabinet_touch_groups = {}\r\n            for cabinet_touch_group_index, cabinet_touch_group in ipairs(cabinet_touch_groups) do\r\n                local is_only_material = true\r\n                for _, cabinet_part in ipairs(cabinet_touch_group) do\r\n                    local jdFullCatCode = cabinet_part:get_attribute(\"jdFullCatCode\")\r\n                    if jdFullCatCode ~= \"GL_GTSJK_FL\" and not string.find(jdFullCatCode, \"^GL_GTSJK_FL_\") then\r\n                        is_only_material = false\r\n                        break\r\n                    end\r\n                end\r\n                if not is_only_material then\r\n                    table.insert(new_cabinet_touch_groups, cabinet_touch_group)\r\n                end\r\n            end\r\n            cabinet_touch_groups = new_cabinet_touch_groups\r\n            -- 将紧靠的其它辅料 移除辅料列表\r\n            to_remove_material = {}\r\n            new_material_parts = {}\r\n            for material_index, material_part in ipairs(material_parts) do\r\n                local material_id = material_part:get_attribute(\"id\")\r\n                for cabinet_touch_group_index, cabinet_touch_group in ipairs(cabinet_touch_groups) do\r\n                    for _, cabinet_part in ipairs(cabinet_touch_group) do\r\n                        local cabinet_id = cabinet_part:get_attribute(\"id\")\r\n                        if cabinet_id == material_id then\r\n                            to_remove_material[material_index] = true\r\n                            break\r\n                        end\r\n                    end\r\n                end\r\n            end\r\n            for i, material_part in ipairs(material_parts) do\r\n                if not to_remove_material[i] then\r\n                    table.insert(new_material_parts, material_part)\r\n                end\r\n            end\r\n            material_parts = new_material_parts\r\n            -- 按空间Id分组\r\n            local cabinet_touch_and_roomId_groups = {}\r\n            for _, cabinet_group in ipairs(cabinet_touch_groups) do\r\n                local group_roomId = \"\"\r\n                for _, cabinet_part in ipairs(cabinet_group) do\r\n                    local cur_roomId = cabinet_part:get_attribute(\"roomId\") or \"\"\r\n                    if cur_roomId  and cur_roomId ~= \"\" then\r\n                        group_roomId = cur_roomId\r\n                        break\r\n                    end\r\n                end\r\n                if group_roomId ~= \"\" then\r\n                    if not cabinet_touch_and_roomId_groups[group_roomId] then\r\n                        cabinet_touch_and_roomId_groups[group_roomId] = {}\r\n                    end\r\n                    table.insert(cabinet_touch_and_roomId_groups[group_roomId], cabinet_group)\r\n                end\r\n            end\r\n            -- 同空间id 进行2D投影合并\r\n            local merge_cabinet_touch_groups = {}\r\n            for group_roomId, cur_cabinet_touch_groups in pairs(cabinet_touch_and_roomId_groups) do\r\n                local groups_groups = generator_algorithm.group_groups_by_2d_overlap(cur_cabinet_touch_groups)\r\n                for _, groups_group in ipairs(groups_groups) do\r\n                    local cur_group = {}  -- 将2D投影重合的组 合并成一个组\r\n                    for _, group in ipairs(groups_group) do\r\n                        for _, cabinet_part in ipairs(group) do\r\n                            table.insert(cur_group, cabinet_part)\r\n                        end\r\n                    end\r\n                    table.insert(merge_cabinet_touch_groups, cur_group)\r\n                end\r\n            end\r\n            -- 直接替换cabinet_touch_groups\r\n            cabinet_touch_groups = merge_cabinet_touch_groups\r\n\r\n            -- case_5:\r\n            --[[ 辅料需求描述：\r\n                （按照新的规则处理，原判断条件5内容不执行）\r\n                1.相关辅料、装饰线灯产品，默认按照距离最近且在1000mm以内的柜体一个组，以辅料自身的BOX尺寸在左右前后4个方向查找已划分组的组合级，距离最近的合并一组，若这类物品同时紧靠了柜体组和榻榻米组，则优先跟随柜体组。；\r\n                2.不符合前面规则的辅料等产品，按照模型中心点找到距离最近的墙，同一面墙的辅料合并一个单；\r\n                沟通后实现逻辑：\r\n                1、辅料中心点 是否在柜体组AABB内，是则加入柜体组; ps：加入但不扩展柜体组AABB\r\n                2、辅料中心点 离柜体组AABB边缘距离小于1000mm，则加入柜体组; ps：加入但不扩展柜体组AABB\r\n                3、辅料中心点 是否在榻榻米组AABB内，是则加入榻榻米组; ps：加入但不扩展柜体组AABB\r\n                4、辅料中心点 离榻榻米组AABB边缘距离小于1000mm，则加入榻榻米组; ps：加入但不扩展柜体组AABB\r\n                5、辅料中心点 找到距离最近的墙，同一面墙的辅料合并一个单;\r\n                6、\"GL_GTSJK_GTL_FL_TTM\" / \"GL_GTSJK_GTL_FL_TTM_%\" 辅料，优先加入榻榻米组；\r\n            ]]\r\n            local to_remove_material = {}\r\n            local insert_map = {}\r\n            -- 优先加入榻榻米组的辅料\r\n            for material_index, material_part in ipairs(material_parts) do\r\n                local jdFullCatCode = material_part:get_attribute(\"jdFullCatCode\")\r\n                if jdFullCatCode == \"GL_GTSJK_FL_TTM\" or string.find(jdFullCatCode, \"^GL_GTSJK_FL_TTM_\") then\r\n                    local material_center_point = material_part:get_center_point()\r\n                    local min_distance = math.huge\r\n                    local min_distance_tatami_group_index = nil\r\n                    for tatami_group_index, tatami_group in ipairs(tatami_touch_groups) do\r\n                        -- 同空间才进行合并\r\n                        local tatami_group_roomId = tatami_group[1]:get_attribute(\"roomId\")\r\n                        if tatami_group_roomId ~= material_part:get_attribute(\"roomId\") then\r\n                            goto continue\r\n                        end\r\n                        local tatami_group_aabb = generator_algorithm.get_parts_aabb(tatami_group)\r\n                        local aabb_distance = generator_algorithm.get_point_distance_to_aabb_2d_border(material_center_point, tatami_group_aabb)\r\n                        if aabb_distance < min_distance then\r\n                            min_distance = aabb_distance\r\n                            min_distance_tatami_group_index = tatami_group_index\r\n                        end\r\n                        ::continue::\r\n                    end\r\n                    if min_distance < 1000 then\r\n                        -- table.insert(tatami_touch_groups[min_distance_tatami_group_index], material_part)\r\n                        if not insert_map[min_distance_tatami_group_index] then\r\n                            insert_map[min_distance_tatami_group_index] = {}\r\n                        end\r\n                        table.insert(insert_map[min_distance_tatami_group_index], material_index)\r\n                        to_remove_material[material_index] = true\r\n                    end\r\n                end\r\n            end           \r\n            -- 移除已加入榻榻米组的辅料\r\n            local new_material_parts = {}\r\n            for i, material_part in ipairs(material_parts) do\r\n                if not to_remove_material[i] then\r\n                    table.insert(new_material_parts, material_part)\r\n                end\r\n            end\r\n            for min_distance_tatami_group_index, material_index_list in pairs(insert_map) do\r\n                for _, material_index in ipairs(material_index_list) do\r\n                    table.insert(tatami_touch_groups[min_distance_tatami_group_index], material_parts[material_index])\r\n                end\r\n            end\r\n            material_parts = new_material_parts\r\n            \r\n            -- 辅料加入柜体组\r\n            to_remove_material = {}\r\n            insert_map = {}\r\n            for material_index, material_part in ipairs(material_parts) do\r\n                local material_center_point = material_part:get_center_point()\r\n                local min_distance = math.huge\r\n                local min_distance_cabinet_group_index = nil\r\n                for cabinet_group_index, cabinet_group in ipairs(cabinet_touch_groups) do\r\n                    -- 同空间才进行合并\r\n                    local cabinet_group_roomId = cabinet_group[1]:get_attribute(\"roomId\")\r\n                    if cabinet_group_roomId ~= material_part:get_attribute(\"roomId\") then\r\n                        goto continue\r\n                    end\r\n                    local cabinet_group_aabb = generator_algorithm.get_parts_aabb(cabinet_group)\r\n                    local aabb_distance = generator_algorithm.get_point_distance_to_aabb_2d_border(material_center_point, cabinet_group_aabb)\r\n                    if aabb_distance < min_distance then\r\n                        min_distance = aabb_distance\r\n                        min_distance_cabinet_group_index = cabinet_group_index\r\n                    end\r\n                    ::continue::\r\n                end\r\n                if min_distance < 1000 then\r\n                    -- table.insert(cabinet_touch_groups[min_distance_cabinet_group_index], material_part)\r\n                    if not insert_map[min_distance_cabinet_group_index] then\r\n                        insert_map[min_distance_cabinet_group_index] = {}\r\n                    end\r\n                    table.insert(insert_map[min_distance_cabinet_group_index], material_index)\r\n                    to_remove_material[material_index] = true\r\n                end\r\n            end\r\n            -- 移除已加入柜体组的辅料\r\n            local new_material_parts = {}\r\n            for i, material_part in ipairs(material_parts) do\r\n                if not to_remove_material[i] then\r\n                    table.insert(new_material_parts, material_part)\r\n                end\r\n            end\r\n            for min_distance_cabinet_group_index, material_index_list in pairs(insert_map) do\r\n                for _, material_index in ipairs(material_index_list) do\r\n                    table.insert(cabinet_touch_groups[min_distance_cabinet_group_index], material_parts[material_index])\r\n                end\r\n            end\r\n            material_parts = new_material_parts\r\n\r\n            --辅料加入榻榻米组\r\n            to_remove_material = {}\r\n            insert_map = {}\r\n            for material_index, material_part in ipairs(material_parts) do\r\n                local material_center_point = material_part:get_center_point()\r\n                local min_distance = math.huge\r\n                local min_distance_tatami_group_index = nil \r\n                for tatami_group_index, tatami_group in ipairs(tatami_touch_groups) do\r\n                    -- 同空间才进行合并\r\n                    local tatami_group_roomId = tatami_group[1]:get_attribute(\"roomId\")\r\n                    if tatami_group_roomId ~= material_part:get_attribute(\"roomId\") then\r\n                        goto continue\r\n                    end\r\n                    local tatami_group_aabb = generator_algorithm.get_parts_aabb(tatami_group)\r\n                    local aabb_distance = generator_algorithm.get_point_distance_to_aabb_2d_border(material_center_point, tatami_group_aabb)\r\n                    if aabb_distance < min_distance then\r\n                        min_distance = aabb_distance\r\n                        min_distance_tatami_group_index = tatami_group_index\r\n                    end\r\n                    ::continue::\r\n                end\r\n                if min_distance < 1000 then\r\n                    -- table.insert(tatami_touch_groups[min_distance_tatami_group_index], material_part) -- 加入但不扩展榻榻米组AABB\r\n                    if not insert_map[min_distance_tatami_group_index] then\r\n                        insert_map[min_distance_tatami_group_index] = {}\r\n                    end\r\n                    table.insert(insert_map[min_distance_tatami_group_index], material_index)\r\n                    to_remove_material[material_index] = true\r\n                end\r\n            end\r\n\r\n            -- 移除已加入榻榻米组的辅料\r\n             new_material_parts = {}\r\n            for i, material_part in ipairs(material_parts) do\r\n                if not to_remove_material[i] then\r\n                    table.insert(new_material_parts, material_part)\r\n                end\r\n            end\r\n            for min_distance_tatami_group_index, material_index_list in pairs(insert_map) do\r\n                for _, material_index in ipairs(material_index_list) do\r\n                    table.insert(tatami_touch_groups[min_distance_tatami_group_index], material_parts[material_index])\r\n                end\r\n            end\r\n            material_parts = new_material_parts\r\n\r\n\r\n            -- 剩余辅料先按空间分组，再按距离最近的墙分组\r\n            local material_roomId_groups = group_parts_by_roomId(material_parts)\r\n            for roomId, material_group in pairs(material_roomId_groups) do\r\n                local material_group_ptr = {}\r\n                for _, material_part in ipairs(material_group) do\r\n                    table.insert(material_group_ptr, material_part:get_ptr())\r\n                end\r\n                local material_touch_ptr_groups = geom_engine.group_parts_by_room_outline(material_group_ptr, scene:get_ptr(), roomId)\r\n                for _, material_touch_ptr_group in ipairs(material_touch_ptr_groups) do\r\n                    local material_touch_group = {}\r\n                    for _, material_part_ptr in ipairs(material_touch_ptr_group) do\r\n                        local material_part = Part.new(material_part_ptr)\r\n                        if material_part then\r\n                            table.insert(material_touch_group, material_part)\r\n                        end\r\n                    end\r\n                    table.insert(all_groups, material_touch_group)\r\n                end\r\n            end\r\n\r\n            -- 将榻榻米组和柜体组放入所以组中\r\n            for _, tatami_group in ipairs(tatami_touch_groups) do\r\n                table.insert(all_groups, tatami_group)\r\n            end\r\n\r\n            -- 将线条产品按空间Id加入到柜体组中，无相同空间Id时，则剩余线条产品按空间Id独立成组\r\n            local have_merge_line_parts = {}\r\n            for _, cabinet_group in ipairs(cabinet_touch_groups) do\r\n                --获取当前组空间Id 顺序取\r\n                local group_roomId = \"group_roomId_default\"\r\n                for _, cabinet_part in ipairs(cabinet_group) do\r\n                    local cur_roomId = cabinet_part:get_attribute(\"roomId\")\r\n                    if cur_roomId then\r\n                        group_roomId = cur_roomId\r\n                        break\r\n                    end\r\n                end\r\n                for line_part_index, line_part in ipairs(line_parts) do\r\n                    local line_roomId = line_part:get_attribute(\"roomId\") or \"line_roomId_default\"\r\n                    if line_roomId == group_roomId then\r\n                        table.insert(cabinet_group, line_part)\r\n                        table.insert(have_merge_line_parts, line_part_index)\r\n                    end\r\n                end\r\n                table.insert(all_groups, cabinet_group)\r\n            end\r\n            local no_merge_line_parts = {}\r\n            for line_part_index, line_part in ipairs(line_parts) do\r\n                if not have_merge_line_parts[line_part_index] then\r\n                    table.insert(no_merge_line_parts, line_part)\r\n                end\r\n            end\r\n            -- 按空间Id分组\r\n            local line_roomId_groups = {}   -- 线条产品空间Id分组\r\n            for _, line_part in ipairs(no_merge_line_parts) do\r\n                local line_roomId = line_part:get_attribute(\"roomId\") or \"line_roomId_default\"\r\n                if not line_roomId_groups[line_roomId] then\r\n                    line_roomId_groups[line_roomId] = {}\r\n                end\r\n                table.insert(line_roomId_groups[line_roomId], line_part)\r\n            end\r\n            for line_roomId, group in pairs(line_roomId_groups) do\r\n                table.insert(all_groups, group)\r\n            end\r\n\r\n            -- 生成最终结果\r\n            for _, group in ipairs(all_groups) do\r\n                local group_item = create_group_item(group, item)\r\n                table.insert(result_items, group_item)\r\n            end\r\n        end\r\n    end\r\n    return result_items\r\nend\r\n\r\nreturn _M\r\n        ",
            "remark": "保留字段",
            "functionStatus": "ENABLED",
            "isGeometry": 0,
            "funcClassifyFullPath": null,
            "enableTime": 1755844697000,
            "pos": 51,
            "categoryId": -1,
            "isDelete": 0,
            "createTime": 1755844697000,
            "modifyTime": 1761554822000,
            "creator": 131,
            "creatorName": "11051352",
            "modifier": 131,
            "modifierName": "11051352",
            "usageCount": null
          },
          {
            "id": "8000002012",
            "funcCode": "split_order_set_order_type",
            "funcName": "拆单函数: 拆单设置订单类型",
            "funcDesc": "拆单设置订单类型",
            "funcCategory": "LUOJI",
            "funcDirectory": "split-order",
            "configData": "{\"className\":\"split-order-set-order-type\",\"path\":\"split-order\",\"funcLuaName\":\"split_order_set_order_type\",\"input\":{\"widgetList\":[{\"id\":\"context\",\"type\":\"input\",\"attributes\":{\"label\":\"输入上下文\",\"placeholder\":\"请输入输入上下文\",\"paramType\":\"any\"}},{\"id\":\"draftOrderType\",\"type\":\"input\",\"attributes\":{\"label\":\"草稿单方案对应订单类型\",\"placeholder\":\"请输入草稿单方案对应订单类型\",\"paramType\":\"string\"}},{\"id\":\"businessOrderType\",\"type\":\"input\",\"attributes\":{\"label\":\"商机单方案对应订单类型\",\"placeholder\":\"请输入商机单方案对应订单类型\",\"paramType\":\"string\"}},{\"id\":\"overseasOrderType\",\"type\":\"input\",\"attributes\":{\"label\":\"海外单方案对应订单类型\",\"placeholder\":\"请输入海外单方案对应订单类型\",\"paramType\":\"string\"}},{\"id\":\"sampleOrderType\",\"type\":\"input\",\"attributes\":{\"label\":\"样板单方案对应订单类型\",\"placeholder\":\"请输入样板单方案对应订单类型\",\"paramType\":\"string\"}},{\"id\":\"projectOrderType\",\"type\":\"input\",\"attributes\":{\"label\":\"工程单方案对应订单类型\",\"placeholder\":\"请输入工程单方案对应订单类型\",\"paramType\":\"string\"}},{\"id\":\"internalOrderType\",\"type\":\"input\",\"attributes\":{\"label\":\"内部单方案对应订单类型\",\"placeholder\":\"请输入内部单方案对应订单类型\",\"paramType\":\"string\"}}]},\"output\":{\"widgetList\":[{\"type\":\"input\",\"attributes\":{\"label\":\"输出上下文\",\"placeholder\":\"请输入输出上下文\",\"paramType\":\"any\"}}]}}",
            "luaScript": "local Scene = require(\"scene.scene\")\r\nlocal _M = {}\r\n\r\n-- 设置订单类型\r\n\r\n-- @param context any 输入上下文\r\n-- @param draftOrderType string 草稿单方案对应订单类型\r\n-- @param businessOrderType string 商机单方案对应订单类型\r\n-- @param overseasOrderType string 海外单方案对应订单类型\r\n-- @param sampleOrderType string 样板单方案对应订单类型\r\n-- @param projectOrderType string 工程单方案对应订单类型\r\n-- @param internalOrderType string 内部单方案对应订单类型\r\n\r\n\r\n-- @return any 输出上下文\r\n\r\nfunction _M.split_order_set_order_type(context, draftOrderType, businessOrderType, overseasOrderType, sampleOrderType, projectOrderType, internalOrderType)\r\n    --入参校验\r\n    if context == nil then\r\n        return nil, \"入参不能为空\"\r\n    end\r\n    if type(context) ~= \"table\" then\r\n        return nil, \"入参类型错误\"\r\n    end\r\n    if #context == 0 then\r\n        return context\r\n    end\r\n\r\n    if draftOrderType == nil then\r\n        return nil, \"草稿单方案对应订单类型不能为空\"\r\n    end\r\n    if type(draftOrderType) ~= \"string\" then\r\n        return nil, \"草稿单方案对应订单类型类型错误\"\r\n    end\r\n    if businessOrderType == nil then\r\n        return nil, \"商机单方案对应订单类型不能为空\"\r\n    end\r\n    if type(businessOrderType) ~= \"string\" then\r\n        return nil, \"商机单方案对应订单类型类型错误\"\r\n    end\r\n    if overseasOrderType == nil then\r\n        return nil, \"海外单方案对应订单类型不能为空\"\r\n    end\r\n    if type(overseasOrderType) ~= \"string\" then\r\n        return nil, \"海外单方案对应订单类型类型错误\"\r\n    end\r\n    if sampleOrderType == nil then\r\n        return nil, \"样板单方案对应订单类型不能为空\"\r\n    end\r\n    if type(sampleOrderType) ~= \"string\" then\r\n        return nil, \"样板单方案对应订单类型类型错误\"\r\n    end\r\n    if projectOrderType == nil then\r\n        return nil, \"工程单方案对应订单类型不能为空\"\r\n    end\r\n    if type(projectOrderType) ~= \"string\" then\r\n        return nil, \"工程单方案对应订单类型类型错误\"\r\n    end\r\n    if internalOrderType == nil then\r\n        return nil, \"内部单方案对应订单类型不能为空\"\r\n    end\r\n    if type(internalOrderType) ~= \"string\" then\r\n        return nil, \"内部单方案对应订单类型类型错误\"\r\n    end\r\n\r\n    local orderTypeMap = {\r\n        [\"0\"] = draftOrderType,\r\n        [\"1\"] = businessOrderType,\r\n        [\"2\"] = overseasOrderType,\r\n        [\"3\"] = sampleOrderType,\r\n        [\"4\"] = projectOrderType,\r\n        [\"5\"] = internalOrderType\r\n    }\r\n\r\n    local scene = Scene.current()\r\n    local current_items = context --拆单规则上下文\r\n    local result_items = {} -- 最终的子方案集合\r\n    for _, item in ipairs(current_items) do\r\n        local orderTypeVal = tostring(item.orderType)\r\n        local orderTypeName = orderTypeMap[orderTypeVal] or \"\"\r\n        local specialOrder = item.specialOrder or false\r\n        for _, partId in ipairs(item.productIds) do\r\n            local part = scene:get_part_by_id(partId)\r\n            if part then\r\n                local specialOrderVal = part:get_attribute(\"TSDD\") or \"0\"\r\n                if specialOrderVal == \"1\" then\r\n                    specialOrder = true\r\n                    break\r\n                end\r\n            end\r\n        end\r\n        local group_item = {\r\n            brand = item.brand or \"\",\r\n            channel = item.channel or \"\",\r\n            catChoice = item.catChoice or \"\",\r\n            orderType = orderTypeName or \"\",\r\n            specialOrder = specialOrder,\r\n            splitOrderDataType = item.splitOrderDataType,\r\n            splitEngine = item.splitEngine or \"1\",\r\n            productIds = item.productIds or {},\r\n            success = item.success or false,\r\n            errorMsg = item.errorMsg or \"\"\r\n        }\r\n        table.insert(result_items, group_item)\r\n\r\n    end\r\n    return result_items\r\nend\r\n\r\nreturn _M",
            "remark": "保留字段",
            "functionStatus": "ENABLED",
            "isGeometry": 0,
            "funcClassifyFullPath": null,
            "enableTime": 1755506890000,
            "pos": 45,
            "categoryId": -1,
            "isDelete": 0,
            "createTime": 1755506890000,
            "modifyTime": 1757903667000,
            "creator": 131,
            "creatorName": "11051352",
            "modifier": 131,
            "modifierName": "11051352",
            "usageCount": null
          },
          {
            "id": "8000000008",
            "funcCode": "split_order_single",
            "funcName": "拆单函数: 按个拆单",
            "funcDesc": "按个拆单：一个产品一个单",
            "funcCategory": "LUOJI",
            "funcDirectory": "split-order",
            "configData": "{\"className\":\"split-order-single\",\"path\":\"split-order\",\"funcLuaName\":\"split_order_single\",\"input\":{\"widgetList\":[{\"id\":\"context\",\"type\":\"input\",\"attributes\":{\"label\":\"输入上下文\",\"placeholder\":\"请输入输入上下文\",\"paramType\":\"any\"}}]},\"output\":{\"widgetList\":[{\"type\":\"input\",\"attributes\":{\"label\":\"输出上下文\",\"placeholder\":\"请输入输出上下文\",\"paramType\":\"any\"}}]}}",
            "luaScript": "local Scene = require(\"scene.scene\")\r\nlocal _M = {}\r\n\r\n-- 一个产品一个子方案\r\n\r\n-- @param context any 输入上下文\r\n-- @return any 输出上下文\r\nfunction _M.split_order_single(context)\r\n    --入参校验\r\n    if context == nil then\r\n        return nil, \"入参不能为空\"\r\n    end\r\n    if type(context) ~= \"table\" then\r\n        return nil, \"入参类型错误\"\r\n    end\r\n    if #context == 0 then\r\n        return context\r\n    end\r\n    local scene = Scene.current()\r\n    local current_items = context --拆单规则上下文\r\n    local result_items = {} -- 最终的子方案集合\r\n    for _, item in ipairs(current_items) do\r\n        if item.productIds and #item.productIds > 0 then\r\n            -- 一个产品一个子方案\r\n            for _, partId in ipairs(item.productIds) do\r\n                local part = scene:get_part_by_id(partId)\r\n                if part then\r\n                    local group_item = {\r\n                        brand = item.brand or \"\",\r\n                        channel = item.channel or \"\",\r\n                        catChoice = item.catChoice or \"\",\r\n                        orderType = item.orderType or \"\",\r\n                        specialOrder = item.specialOrder or false,\r\n                        splitOrderDataType = item.splitOrderDataType,\r\n                        splitEngine = item.splitEngine or \"1\",\r\n                        productIds = { partId },\r\n                        success = item.success or false,\r\n                        errorMsg = item.errorMsg or \"\"\r\n                    }\r\n                    table.insert(result_items, group_item)\r\n                end\r\n            end\r\n        end\r\n    end\r\n    return result_items\r\nend\r\n\r\nreturn _M",
            "remark": "保留字段",
            "functionStatus": "ENABLED",
            "isGeometry": 0,
            "funcClassifyFullPath": null,
            "enableTime": 1753703462000,
            "pos": 38,
            "categoryId": -1,
            "isDelete": 0,
            "createTime": 1753703462000,
            "modifyTime": 1757490248000,
            "creator": 131,
            "creatorName": "11051352",
            "modifier": 131,
            "modifierName": "11051352",
            "usageCount": null
          },
          {
            "id": "8000002010",
            "funcCode": "split_order_by_roomId_and_touch",
            "funcName": "拆单函数: 按房间ID与是否挨着拆单",
            "funcDesc": "按房间ID与是否挨着拆单",
            "funcCategory": "JIHE",
            "funcDirectory": "split-order",
            "configData": "{\"className\":\"split-order-by-roomId-and-touch\",\"path\":\"split-order\",\"funcLuaName\":\"split_order_by_roomId_and_touch\",\"input\":{\"widgetList\":[{\"id\":\"context\",\"type\":\"input\",\"attributes\":{\"label\":\"输入上下文\",\"placeholder\":\"请输入输入上下文\",\"paramType\":\"any\"}},{\"id\":\"distance\",\"type\":\"inputNumber\",\"attributes\":{\"label\":\"判断是否挨着的距离阈值\",\"placeholder\":\"请输入判断是否挨着的距离阈值\",\"paramType\":\"number\",\"inputType\":\"number\"}}]},\"output\":{\"widgetList\":[{\"type\":\"input\",\"attributes\":{\"label\":\"输出上下文\",\"placeholder\":\"请输入输出上下文\",\"paramType\":\"any\"}}]}}",
            "luaScript": "local Scene = require(\"scene.scene\")\r\nlocal geom_engine = require('lib.engine.geom-engine')\r\nlocal _M = {}\r\n\r\n-- ============================================================================\r\n-- 辅助函数\r\n-- ============================================================================\r\n\r\n-- 合并两个分组\r\nlocal function merge_groups(groups, group1_index, group2_index)\r\n    if group1_index == group2_index then\r\n        return\r\n    end\r\n    -- 将group2的所有parts添加到group1中\r\n    for _, part in ipairs(groups[group2_index]) do\r\n        table.insert(groups[group1_index], part)\r\n    end\r\n    -- 删除group2\r\n    table.remove(groups, group2_index)\r\nend\r\n\r\n-- 按是否挨着进行分组\r\nlocal function group_parts_by_touch(parts, distance)\r\n    local groups = {}\r\n    for _, part in ipairs(parts) do\r\n        local connected_groups = {}\r\n        -- 检查当前part与已有分组的连接关系\r\n        for group_index, group in ipairs(groups) do\r\n            for _, group_part in ipairs(group) do\r\n                local is_touch = geom_engine.check_parts_touch(\r\n                    part:get_ptr(),\r\n                    group_part:get_ptr(),\r\n                    distance\r\n                )\r\n                if is_touch then\r\n                    table.insert(connected_groups, group_index)\r\n                    break\r\n                end\r\n            end\r\n        end\r\n\r\n        -- 处理连接的分组\r\n        if #connected_groups > 0 then\r\n            -- 将当前part添加到第一个连接的分组\r\n            table.insert(groups[connected_groups[1]], part)\r\n\r\n            -- 合并所有连接的分组\r\n            for i = #connected_groups, 2, -1 do\r\n                merge_groups(groups, connected_groups[1], connected_groups[i])\r\n            end\r\n        else\r\n            -- 创建新的分组\r\n            table.insert(groups, {part})\r\n        end\r\n    end\r\n    \r\n    return groups\r\nend\r\n\r\n-- 获取分组中数量最多的roomId\r\nlocal function get_dominant_room_id(group)\r\n    local roomId_count = {}\r\n    -- 统计每个roomId的数量\r\n    for _, part in ipairs(group) do\r\n        local roomId = part:get_attribute(\"roomId\")\r\n        if roomId == nil or roomId == \"\" then\r\n            roomId = \"其他\"\r\n        end\r\n        if not roomId_count[roomId] then\r\n            roomId_count[roomId] = 0\r\n        end\r\n        roomId_count[roomId] = roomId_count[roomId] + 1\r\n    end\r\n    -- 找到数量最多的roomId\r\n    local max_roomId = nil\r\n    local max_count = 0\r\n    for roomId, count in pairs(roomId_count) do\r\n        if count > max_count then\r\n            max_count = count\r\n            max_roomId = roomId\r\n        end\r\n    end\r\n    \r\n    return max_roomId\r\nend\r\n\r\n-- 按roomId对touch分组进行进一步分组\r\nlocal function group_by_room_id(touch_groups)\r\n    local roomId_groups = {}\r\n\r\n    for _, group in ipairs(touch_groups) do\r\n        local dominant_room_id = get_dominant_room_id(group)\r\n\r\n        if dominant_room_id then\r\n            if not roomId_groups[dominant_room_id] then\r\n                roomId_groups[dominant_room_id] = {}\r\n            end\r\n\r\n            -- 将group中的所有parts添加到对应的roomId分组\r\n            for _, part in ipairs(group) do\r\n                table.insert(roomId_groups[dominant_room_id], part)\r\n            end\r\n        end\r\n    end\r\n    \r\n    return roomId_groups\r\nend\r\n\r\n-- 创建分组结果项\r\nlocal function create_group_item(group, original_item)\r\n    local group_item = {\r\n        productIds = {}\r\n    }\r\n    -- 提取分组中所有parts的ID\r\n    for _, part in ipairs(group) do\r\n        table.insert(group_item.productIds, part:get_attribute(\"id\"))\r\n    end\r\n    -- 复制原item的其他属性\r\n    for key, value in pairs(original_item) do\r\n        if key ~= \"productIds\" then\r\n            group_item[key] = value\r\n        end\r\n    end\r\n    \r\n    return group_item\r\nend\r\n\r\n-- ============================================================================\r\n-- 主函数\r\n-- ============================================================================\r\n\r\n-- 按房间ID与是否挨着拆单\r\n-- @param context any 输入上下文\r\n-- @param distance number 判断是否挨着的距离阈值\r\n-- @return any 输出上下文   \r\nfunction _M.split_order_by_roomId_and_touch(context, distance)\r\n    -- 入参校验\r\n    if context == nil then\r\n        return nil, \"入参不能为空\"\r\n    end\r\n    if type(context) ~= \"table\" then\r\n        return nil, \"入参类型错误\"\r\n    end\r\n    if distance == nil then\r\n        return nil, \"距离不能为空\"\r\n    end\r\n    if type(distance) ~= \"number\" then\r\n        return nil, \"距离类型错误\"\r\n    end\r\n    if #context == 0 then\r\n        return context\r\n    end\r\n    \r\n    local scene = Scene.current()\r\n    local current_items = context\r\n    local result_items = {}\r\n    -- 处理每个item\r\n    for _, item in ipairs(current_items) do\r\n        if item.productIds and #item.productIds > 0 then\r\n            -- 获取所有parts\r\n            local parts = {}\r\n            for _, partId in ipairs(item.productIds) do\r\n                local part = scene:get_part_by_id(partId)\r\n                if part then\r\n                    table.insert(parts, part)\r\n                end\r\n            end\r\n            local line_proCatIds_map = {\r\n                [\"503\"] = true,\r\n                [\"504\"] = true,\r\n                [\"562\"] = true,\r\n                [\"576\"] = true,\r\n                [\"728\"] = true\r\n            }\r\n            local line_parts = {}\r\n            local other_parts = {}\r\n            for _, part in ipairs(parts) do\r\n                local jdProCatId = part:get_attribute(\"prodCatId\") or \"\"\r\n                if line_proCatIds_map[jdProCatId] then\r\n                    table.insert(line_parts, part)\r\n                else\r\n                    table.insert(other_parts, part)\r\n                end\r\n            end\r\n            -- 按是否挨着进行分组\r\n            local touch_groups = group_parts_by_touch(other_parts, distance)\r\n\r\n            -- 按roomId进一步分组\r\n            local roomId_groups = group_by_room_id(touch_groups)\r\n\r\n            -- 生成最终结果\r\n            local have_merge_line_parts = {}\r\n            for roomId, group in pairs(roomId_groups) do\r\n                -- 插入空间Id相同的线条产品到当前分组\r\n                for line_part_index, line_part in ipairs(line_parts) do\r\n                    local line_roomId = line_part:get_attribute(\"roomId\") or \"\"\r\n                    if line_roomId == roomId then\r\n                        table.insert(group, line_part)\r\n                        table.insert(have_merge_line_parts, line_part_index)\r\n                    end\r\n                end\r\n                local group_item = create_group_item(group, item)\r\n                table.insert(result_items, group_item)\r\n            end\r\n            local no_merge_line_parts = {}\r\n            for line_part_index, line_part in ipairs(line_parts) do\r\n                if not have_merge_line_parts[line_part_index] then\r\n                    table.insert(no_merge_line_parts, line_part)\r\n                end\r\n            end\r\n            -- 按空间Id分组\r\n            local line_roomId_groups = {}\r\n            for _, line_part in ipairs(no_merge_line_parts) do\r\n                local line_roomId = line_part:get_attribute(\"roomId\") or \"\"\r\n                if not line_roomId_groups[line_roomId] then\r\n                    line_roomId_groups[line_roomId] = {}\r\n                end\r\n                table.insert(line_roomId_groups[line_roomId], line_part)\r\n            end\r\n            for line_roomId, group in pairs(line_roomId_groups) do\r\n                local group_item = create_group_item(group, item)\r\n                table.insert(result_items, group_item)\r\n            end\r\n        end\r\n    end\r\n    \r\n    return result_items\r\nend\r\n\r\nreturn _M",
            "remark": "保留字段",
            "functionStatus": "ENABLED",
            "isGeometry": 1,
            "funcClassifyFullPath": null,
            "enableTime": 1755330843000,
            "pos": 43,
            "categoryId": -1,
            "isDelete": 0,
            "createTime": 1755330843000,
            "modifyTime": 1757490224000,
            "creator": 131,
            "creatorName": "11051352",
            "modifier": 131,
            "modifierName": "11051352",
            "usageCount": null
          },
          {
            "id": "8000000009",
            "funcCode": "split_order_by_roomId",
            "funcName": "拆单函数: 按空间Id拆单",
            "funcDesc": "按空间Id拆单",
            "funcCategory": "LUOJI",
            "funcDirectory": "split-order",
            "configData": "{\"className\":\"split-order-by-roomId\",\"path\":\"split-order\",\"funcLuaName\":\"split_order_by_roomId\",\"input\":{\"widgetList\":[{\"id\":\"context\",\"type\":\"input\",\"attributes\":{\"label\":\"输入上下文\",\"placeholder\":\"请输入输入上下文\",\"paramType\":\"any\"}}]},\"output\":{\"widgetList\":[{\"type\":\"input\",\"attributes\":{\"label\":\"输出上下文\",\"placeholder\":\"请输入输出上下文\",\"paramType\":\"any\"}}]}}",
            "luaScript": "local Scene = require(\"scene.scene\")\r\nlocal _M = {}\r\n\r\n-- 按房间ID拆分子方案\r\n\r\n-- @param context any 输入上下文\r\n-- @return any 输出上下文\r\n\r\n\r\n\r\nfunction _M.split_order_by_roomId(context)\r\n    --入参校验\r\n    if context == nil then\r\n        return nil, \"入参不能为空\"\r\n    end\r\n    if type(context) ~= \"table\" then\r\n        return nil, \"入参类型错误\"\r\n    end\r\n    if #context == 0 then\r\n        return context\r\n    end\r\n    local scene = Scene.current()\r\n    local current_items = context --拆单规则上下文\r\n    local result_items = {} -- 最终的子方案集合\r\n    for _, item in ipairs(current_items) do\r\n        if item.productIds and #item.productIds > 0 then\r\n            -- 按房间ID分组\r\n            local groups = {}\r\n            for _, partId in ipairs(item.productIds) do\r\n                local part = scene:get_part_by_id(partId)\r\n                if part then\r\n                    -- 获取产品属性\r\n                    local roomId = part:get_attribute(\"roomId\") or \"\"\r\n                    -- 创建分组键（房间ID）\r\n                    local group_key = roomId\r\n                    -- 如果该分组还没有创建，创建新分组\r\n                    if not groups[group_key] then\r\n                        groups[group_key] = {\r\n                            brand = item.brand or \"\",\r\n                            channel = item.channel or \"\",\r\n                            catChoice = item.catChoice or \"\",\r\n                            orderType = item.orderType or \"\",\r\n                            splitEngine = item.splitEngine or \"1\",\r\n                            specialOrder = item.specialOrder or false,\r\n                            splitOrderDataType = item.splitOrderDataType,\r\n                            productIds = {},\r\n                            success = item.success or false,\r\n                            errorMsg = item.errorMsg or \"\"\r\n                        }\r\n                    end\r\n                    -- 将产品ID添加到对应分组\r\n                    table.insert(groups[group_key].productIds, partId)\r\n                end\r\n            end\r\n            -- 将分组后的子方案添加到结果集合\r\n            for _, group_item in pairs(groups) do\r\n                if #group_item.productIds > 0 then\r\n                    table.insert(result_items, group_item)\r\n                end\r\n            end\r\n        end\r\n    end\r\n    return result_items\r\nend\r\n\r\nreturn _M",
            "remark": "保留字段",
            "functionStatus": "ENABLED",
            "isGeometry": 0,
            "funcClassifyFullPath": null,
            "enableTime": 1753703544000,
            "pos": 39,
            "categoryId": -1,
            "isDelete": 0,
            "createTime": 1753703544000,
            "modifyTime": 1757490218000,
            "creator": 131,
            "creatorName": "11051352",
            "modifier": 131,
            "modifierName": "11051352",
            "usageCount": null
          },
          {
            "id": "8000002011",
            "funcCode": "split_order_by_texture",
            "funcName": "拆单函数: 按花色分组拆单",
            "funcDesc": "按花色分组拆单",
            "funcCategory": "LUOJI",
            "funcDirectory": "split-order",
            "configData": "{\"className\":\"split-order-by-texture\",\"path\":\"split-order\",\"funcLuaName\":\"split_order_by_texture\",\"input\":{\"widgetList\":[{\"id\":\"context\",\"type\":\"input\",\"attributes\":{\"label\":\"输入上下文\",\"placeholder\":\"请输入输入上下文\",\"paramType\":\"any\"}}]},\"output\":{\"widgetList\":[{\"type\":\"input\",\"attributes\":{\"label\":\"输出上下文\",\"placeholder\":\"请输入输出上下文\",\"paramType\":\"any\"}}]}}",
            "luaScript": "local Scene = require(\"scene.scene\")\r\nlocal _M = {}\r\n\r\n-- 按花色分组拆单\r\n\r\nlocal texture_group_map = {\r\n    paint = \"油漆\",\r\n    noPaint = \"免漆\",\r\n    other = \"其他\",\r\n}\r\n\r\n-- @param context any 输入上下文\r\n-- @return any 输出上下文\r\n\r\nfunction _M.split_order_by_texture(context)\r\n    --入参校验\r\n    if context == nil then\r\n        return nil, \"入参不能为空\"\r\n    end\r\n    if type(context) ~= \"table\" then\r\n        return nil, \"入参类型错误\"\r\n    end\r\n    if #context == 0 then\r\n        return context\r\n    end\r\n    local scene = Scene.current()\r\n    local current_items = context --拆单规则上下文\r\n    local result_items = {} -- 最终的子方案集合\r\n    -- 使用哈希表优化查找性能\r\n    local Paint_Set = {\r\n        mattePaint = true, UV1 = true, UV = true, enamel1 = true,\r\n        veneer = true, enamel = true, EB = true, veneer1 = true\r\n    }\r\n    local NoPaint_Set = {\r\n        nonPainting = true, nonPainting1 = true, nonPainting2 = true,\r\n        nonPainting3 = true, nonPainting4 = true, Highlight = true,\r\n        Highlight1 = true, powder = true\r\n    }\r\n    for _, item in ipairs(current_items) do\r\n        if item.productIds and #item.productIds > 0 then\r\n            -- 按花色分组\r\n            local groups = {}\r\n            for _, partId in ipairs(item.productIds) do\r\n                local part = scene:get_part_by_id(partId)\r\n                if part then\r\n                    local texture_group = texture_group_map.other\r\n                    local textureId = part:get_attribute(\"doormap1_MS\") or \"\"\r\n                    local texture = scene:get_texture_by_id(textureId)\r\n                    if texture then\r\n                        local HSLB_value = texture:get_attribute(\"HSLB\") or \"\"\r\n                        if Paint_Set[HSLB_value] then\r\n                            texture_group = texture_group_map.paint\r\n                        elseif NoPaint_Set[HSLB_value] then\r\n                            texture_group = texture_group_map.noPaint\r\n                        else\r\n                            texture_group = texture_group_map.other\r\n                        end\r\n                    end\r\n                    local group_key = texture_group\r\n                    -- 如果该分组还没有创建，创建新分组\r\n                    if not groups[group_key] then\r\n                        groups[group_key] = {\r\n                            brand = item.brand or \"\",\r\n                            channel = item.channel or \"\",\r\n                            catChoice = item.catChoice or \"\",\r\n                            orderType = item.orderType or \"\",\r\n                            splitEngine = item.splitEngine or \"1\",\r\n                            specialOrder = item.specialOrder or false,\r\n                            splitOrderDataType = item.splitOrderDataType,\r\n                            productIds = {},\r\n                            success = item.success or false,\r\n                            errorMsg = item.errorMsg or \"\"\r\n                        }\r\n                    end\r\n                    -- 将产品ID添加到对应分组\r\n                    table.insert(groups[group_key].productIds, partId)\r\n                end\r\n            end\r\n            -- 将分组后的子方案添加到结果集合\r\n            for _, group_item in pairs(groups) do\r\n                if #group_item.productIds > 0 then\r\n                    table.insert(result_items, group_item)\r\n                end\r\n            end\r\n        end\r\n    end\r\n    return result_items\r\nend\r\n\r\nreturn _M",
            "remark": "保留字段",
            "functionStatus": "ENABLED",
            "isGeometry": 0,
            "funcClassifyFullPath": null,
            "enableTime": 1755331006000,
            "pos": 44,
            "categoryId": -1,
            "isDelete": 0,
            "createTime": 1755331006000,
            "modifyTime": 1757490231000,
            "creator": 131,
            "creatorName": "11051352",
            "modifier": 131,
            "modifierName": "11051352",
            "usageCount": null
          },
          {
            "id": "8000000007",
            "funcCode": "split_order_default",
            "funcName": "拆单函数: 默认规则拆单",
            "funcDesc": "默认规则拆单：不同品类、品牌、渠道拆分成不同子方案",
            "funcCategory": "LUOJI",
            "funcDirectory": "",
            "configData": "{\"className\":\"split-order-default\",\"funcLuaName\":\"split_order_default\",\"input\":{\"widgetList\":[{\"id\":\"context\",\"type\":\"input\",\"attributes\":{\"label\":\"输入上下文\",\"placeholder\":\"请输入输入上下文\",\"paramType\":\"any\"}}]},\"output\":{\"widgetList\":[{\"type\":\"input\",\"attributes\":{\"label\":\"输出上下文\",\"placeholder\":\"请输入输出上下文\",\"paramType\":\"any\"}}]}}",
            "luaScript": "local Scene = require(\"scene.scene\")\r\nlocal _M = {}\r\n\r\n-- 按产品品类、品牌、渠道、是否特殊订单拆分子方案\r\n\r\n-- @param context any 输入上下文\r\n-- @return any 输出上下文\r\n\r\nfunction _M.split_order_default(context)\r\n    --入参校验\r\n    if context == nil then\r\n        return nil, \"入参不能为空\"\r\n    end\r\n    if type(context) ~= \"table\" then\r\n        return nil, \"入参类型错误\"\r\n    end\r\n    if #context == 0 then\r\n        return context\r\n    end\r\n    local scene = Scene.current()\r\n    local current_items = context --拆单规则上下文\r\n    local result_items = {} -- 最终的子方案集合\r\n    for _, item in ipairs(current_items) do\r\n        if item.productIds and #item.productIds > 0 then\r\n            -- 按品类、品牌、渠道分组\r\n            local groups = {}\r\n            for _, partId in ipairs(item.productIds) do\r\n                local part = scene:get_part_by_id(partId)\r\n                if part then\r\n                    -- 获取产品属性\r\n                    local catChoice = part:get_attribute(\"jdCatChoice\") or \"\"\r\n                    local brand = part:get_attribute(\"jdBrand\") or item.brand or \"\"\r\n                    local channel = part:get_attribute(\"jdChannel\") or item.channel or \"\"\r\n                    -- local specialOrderAttrValue = part:get_attribute(\"TSDD\") or \"0\"\r\n                    -- local specialOrder = false\r\n                    -- if specialOrderAttrValue == \"1\" then\r\n                    --     specialOrder = true\r\n                    -- end\r\n                    -- 创建分组键（品类+品牌+渠道的组合）\r\n                    local group_key = catChoice .. \"_\" .. brand .. \"_\" .. channel\r\n                    -- 如果该分组还没有创建，创建新分组\r\n                    if not groups[group_key] then\r\n                        groups[group_key] = {\r\n                            brand = brand,\r\n                            channel = channel,\r\n                            catChoice = catChoice,\r\n                            orderType = item.orderType or \"\",\r\n                            splitEngine = item.splitEngine or \"1\",\r\n                            specialOrder = item.specialOrder or false,\r\n                            splitOrderDataType = item.splitOrderDataType,\r\n                            productIds = {},\r\n                            success = item.success or false,\r\n                            errorMsg = item.errorMsg or \"\"\r\n                        }\r\n                    end\r\n                    -- 将产品ID添加到对应分组\r\n                    table.insert(groups[group_key].productIds, partId)\r\n                end\r\n            end\r\n            -- 将分组后的子方案添加到结果集合\r\n            for _, group_item in pairs(groups) do\r\n                if #group_item.productIds > 0 then\r\n                    table.insert(result_items, group_item)\r\n                end\r\n            end\r\n        end\r\n    end\r\n    return result_items\r\nend\r\n\r\nreturn _M",
            "remark": "保留字段",
            "functionStatus": "ENABLED",
            "isGeometry": 0,
            "funcClassifyFullPath": null,
            "enableTime": 1753687535000,
            "pos": 37,
            "categoryId": -1,
            "isDelete": 0,
            "createTime": 1753687535000,
            "modifyTime": 1757902845000,
            "creator": 131,
            "creatorName": "11051352",
            "modifier": 131,
            "modifierName": "11051352",
            "usageCount": null
          },
          {
            "id": 187,
            "funcCode": "get_nearly_obj_distance",
            "funcName": "计算物体与物体间的间距值",
            "funcDesc": "004计算物体与物体间的间距值",
            "funcCategory": "JIHE",
            "funcDirectory": "",
            "configData": "{\"className\":\"get-nearly-obj-distance\",\"funcLuaName\":\"get_nearly_obj_distance\",\"input\":{\"widgetList\":[{\"id\":\"partsA\",\"type\":\"input\",\"defaultValue\":[],\"attributes\":{\"label\":\"输入的对象列表\",\"placeholder\":\"请输入输入的对象列表\",\"disabled\":true,\"paramType\":\"table\",\"paramSubType\":\"{:table}[]\"}},{\"id\":\"direction\",\"type\":\"select\",\"defaultValue\":\"up\",\"options\":[{\"label\":\"up\",\"value\":\"up\"},{\"label\":\"down\",\"value\":\"down\"},{\"label\":\"left\",\"value\":\"left\"},{\"label\":\"right\",\"value\":\"right\"},{\"label\":\"front\",\"value\":\"front\"},{\"label\":\"back\",\"value\":\"back\"}],\"attributes\":{\"label\":\"方向\",\"placeholder\":\"请输入方向\",\"paramType\":\"string\"}},{\"id\":\"partsB\",\"type\":\"input\",\"defaultValue\":[],\"attributes\":{\"label\":\"目标对象列表\",\"placeholder\":\"请输入目标对象列表\",\"disabled\":true,\"paramType\":\"table\",\"paramSubType\":\"{:table}[]\"}},{\"id\":\"is_same_root\",\"type\":\"switch\",\"defaultValue\":false,\"options\":[{\"label\":\"同根级\",\"value\":true},{\"label\":\"不同根级\",\"value\":false}],\"attributes\":{\"label\":\"是否查找同根级\",\"placeholder\":\"请输入是否查找同根级\",\"paramType\":\"boolean\",\"activeText\":\"同根级\",\"inactiveText\":\"不同根级\"}}]},\"output\":{\"widgetList\":[{\"type\":\"input\",\"attributes\":{\"label\":\"主对象节点列表 # alias:main_obj_list\",\"placeholder\":\"请输入主对象节点列表 # alias:main_obj_list\",\"disabled\":true,\"paramType\":\"table\",\"paramSubType\":\"{:table,mainObj:table,distance:number,direction:string,targetObj:table}[]\"}}]}}",
            "luaScript": "local geom_engine = require('lib.engine.geom-engine')\r\nlocal Part = require(\"scene.part\")\r\n\r\nlocal _M = {}\r\n\r\n-- 004 计算物体与物体间的间距值\r\n-- @param partsA table 输入的对象列表 # default:[]\r\n-- @field partsA[] table Part对象指针\r\n-- @param direction string 方向  # options:[\"up\",\"down\",\"left\",\"right\",\"front\",\"back\"] default:\"up\"\r\n-- @param partsB table 目标对象列表 # default:[]\r\n-- @field partsB[] table Part对象指针\r\n-- @param is_same_root boolean 是否查找同根级 # options:[{\"同根级\":true},{\"不同根级\":false}] default:false\r\n-- @return table 主对象节点列表 # alias:main_obj_list\r\n-- @field return[] table 距离信息对象\r\n-- @field return[].mainObj table 主对象Part\r\n-- @field return[].distance number 距离值\r\n-- @field return[].direction string 方向\r\n-- @field return[].targetObj table 目标对象Part\r\nfunction _M.get_nearly_obj_distance(partsA, direction, is_same_root, partsB)\r\n    -- 入参判空校验\r\n    if partsA == nil then\r\n        return nil, \"输入的对象列表(partsA参数)不能为空\"\r\n    end\r\n    if type(partsA) ~= \"table\" then\r\n        return nil, \"输入的对象列表(partsA参数)类型错误\"\r\n    end\r\n    if direction == nil then\r\n        return nil, \"方向(direction参数)不能为空\"\r\n    end\r\n    if type(direction) ~= \"string\" then\r\n        return nil, \"方向(direction参数)类型错误\"\r\n    end\r\n    if is_same_root == nil then\r\n        return nil, \"是否查找同根级(is_same_root参数)不能为空\"\r\n    end\r\n    if type(is_same_root) ~= \"boolean\" then\r\n        return nil, \"是否查找同根级(is_same_root参数)类型错误\"\r\n    end\r\n    if partsB == nil then\r\n        return nil, \"目标对象列表(partsB参数)不能为空\"\r\n    end\r\n    if type(partsB) ~= \"table\" then\r\n        return nil, \"目标对象列表(partsB参数)类型错误\"\r\n    end\r\n\r\n    local partsA_ptr = {}\r\n    local partsB_ptr = {}\r\n    for _, part in ipairs(partsA) do\r\n        table.insert(partsA_ptr, part:get_ptr())\r\n    end\r\n    for _, part in ipairs(partsB) do\r\n        table.insert(partsB_ptr, part:get_ptr())\r\n    end\r\n\r\n    local list = geom_engine.get_nearly_obj_distance(partsA_ptr, direction, is_same_root, partsB_ptr)\r\n    if list then\r\n        for _, item in ipairs(list) do\r\n            item.mainObj = Part.new(item.mainObj)\r\n            item.targetObj = Part.new(item.targetObj)\r\n        end\r\n    end\r\n    return list\r\nend\r\n\r\nreturn _M",
            "remark": "保留字段",
            "functionStatus": "ENABLED",
            "isGeometry": 0,
            "funcClassifyFullPath": null,
            "enableTime": 1751420135000,
            "pos": 7,
            "categoryId": -1,
            "isDelete": 0,
            "createTime": 1751420135000,
            "modifyTime": 1758107208000,
            "creator": 131,
            "creatorName": "11051352",
            "modifier": 476,
            "modifierName": "11051352",
            "usageCount": null
          }
        ]
      }
    ],
    "error": null
  }
}

/**
 * 获取函数列表
 * @param params 分页参数
 * @returns Promise<FunctionListResponse>
 */
export async function getFunctionListByIds(ids: string[]): Promise<FunctionItem[]> {
  const requestParams = {

  }
  const res = await http.post({
    url: '/rule-config/func/batchDetail',
    data: {
      funcIds: ids
    }
  })
  if (res.success) {
    return res.data
  } else {
    ElMessage.error(res.message)
    return []
  }
}

export async function updateRule(
  id: string,
  workflowData: WorkflowData,
  luaCode: string,
  funcIds: string[],
  expressionParamArr: any[],
  modifyReason: string
) {
  const configData = JSON.stringify(workflowData)
  const nodeList = workflowData.nodeList;
  for (let node of nodeList) {
    if (node.title === '决策表' && node.decisionTableData?.expressionConfig?.children?.length) {
      expressionParamArr.push(node.decisionTableData.expressionConfig);
    }
  }
  const expressionParamData = JSON.stringify(expressionParamArr)
  const res = await http.post({
    url:'/rule-config/rule/update/config',
    data: {
      id: id,
      configData: configData,
      luaScript: luaCode,
      funcIds: funcIds,
      variableSet: expressionParamData,
      modifyReason: modifyReason
    }
  })
  if (res.success) {
    ElMessage.success('规则更新成功')
    return res.data
  } else {
    ElMessage.error(res.message)
    return false
  }
}

/**
 * 转换函数数据为节点格式
 * @param item 原始函数数据
 * @returns FunctionNode
 */
export function transformFunctionData(item: FunctionItem): FunctionNode {
  const temp: FunctionNode = {
    icon: 'icon-func',
    type: 'func',
    title: item.funcName,
    funcId: item.id,
    remark: item.funcDesc,
    inputData: [],
    outputData: [],
    logicData: {},
    path: '',
    className: '',
    funcName: ''
  }

  let jsonData: FunctionConfigData
  try {
    // 先解析JSON
    const parsedData = JSON.parse(item.configData)
    // 展开函数配置数据以恢复完整结构
    jsonData = expandFunctionConfig(parsedData)
    temp.inputData = jsonData?.input || []
    temp.outputData = jsonData?.output || []
    temp.logicData = jsonData?.logicData || {}
    temp.path = jsonData?.path || ''
    temp.className = jsonData?.className || ''
    temp.funcName = jsonData?.funcLuaName || ''
  } catch (error) {
    console.error('解析函数配置数据失败: ' + item.funcName + '  配置数据不满足要求')
  }

  return temp
}
