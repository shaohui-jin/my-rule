import{h as a}from"./_plugin-vue_export-helper-68e29187.js";import{e as i}from"./DataOptimizer-aded8d7d.js";import{s as l}from"./index-1b7a9618.js";async function s(){return{success:!0,data:[{id:"8000000001",parentId:"0",name:"获取对象",level:1,sort:0,modifyTime:1758106804e3,children:[],functions:[{id:"8000006006",funcCode:"get_part_children_deep_v2",funcName:"v2 找子级",funcDesc:"v2 找子级",funcCategory:"LUOJI",funcDirectory:"abstract-functions-v2/general",configData:'{"className":"get-part-children-deep-v2","path":"abstract-functions-v2/general","funcLuaName":"get_part_children_deep_v2","input":{"widgetList":[{"id":"input_part","type":"input","attributes":{"label":"输入的part对象","placeholder":"请输入输入的part对象","disabled":true,"paramType":"table","paramSubType":"{}Part"}},{"id":"deep","type":"inputNumber","defaultValue":1,"attributes":{"label":"深度","placeholder":"请输入深度","paramType":"number","inputType":"number"}},{"id":"expression","type":"function","attributes":{"label":"表达式","placeholder":"请输入表达式","paramType":"function"}}]},"output":{"widgetList":[{"type":"input","attributes":{"label":"结果列表","placeholder":"请输入结果列表","disabled":true,"paramType":"table","paramSubType":"Part[]"}}]}}',luaScript:`local _M = {}\r
\r
local table = require("core.table")\r
local Part = require("scene.part")\r
\r
local function get_part_children_deep(input_part, deep)\r
\r
\r
    local cur_children = input_part:children()\r
    for i = 1, deep do\r
        if i ~= 1 then\r
            if #cur_children == 0 then\r
                return {}\r
            end\r
            local new_children = {}\r
            for _, child in ipairs(cur_children) do\r
                local child_children = child:children()\r
                for _, child_child in ipairs(child_children) do\r
                    if child_child then\r
                        table.insert(new_children, child_child)\r
                    end\r
                end\r
            end\r
            cur_children = new_children\r
        end\r
    end\r
    return cur_children\r
end\r
\r
-- v2-找目标素材的子级\r
-- @param input_part table 输入的part对象\r
-- @field input_part $Part Part对象\r
-- @param deep number 深度 # default:1\r
-- @param expression function 表达式\r
-- @return table 结果列表\r
-- @field return[] $Part 结果列表\r
function _M.get_part_children_deep_v2(input_part, deep, expression)\r
    -- 入参判空校验\r
\r
    if input_part == nil then\r
        return nil, "输入的对象列表(input_part参数)不能为空"\r
    end\r
    if type(input_part) ~= "table" then\r
        return nil, "输入的对象列表(input_part参数)类型错误"\r
    end\r
    local success = pcall(function()\r
        return input_part:is_part()\r
    end)\r
    if not success then\r
        return nil, "输入的对象列表(input_part参数)类型错误"\r
    end\r
    if expression == nil then\r
        expression = function(part)\r
            return true\r
        end\r
    end\r
    if type(expression) ~= "function" then\r
        return nil, "表达式类型错误"\r
    end\r
    if deep == nil then\r
        return nil, "深度(deep参数)不能为空"\r
    end\r
    if type(deep) ~= "number" then\r
        return nil, "深度(deep参数)类型错误"\r
    end\r
    local deep_children_parts = get_part_children_deep(input_part, deep)\r
    local result_parts = {}\r
    for _, part in ipairs(deep_children_parts) do\r
        if part then\r
            local ok, result = pcall(expression, part)\r
            if ok and result then\r
                table.insert(result_parts, part)\r
            end\r
        end\r
    end\r
\r
    return result_parts\r
end\r
\r
return _M`,remark:"保留字段",functionStatus:"ENABLED",isGeometry:0,funcClassifyFullPath:null,enableTime:1759115804e3,pos:59,categoryId:"8000000001",isDelete:0,createTime:1759115804e3,modifyTime:1759116981e3,creator:131,creatorName:"11051352",modifier:246,modifierName:"11051352",usageCount:null},{id:"8000002017",funcCode:"get_targets_v2",funcName:"v2 找对象",funcDesc:`v2 找对象：
（1）入参数据结构（单个part）：{}、出参数据结构（一维数组）：[ {} ]
（2）函数作用说明：用与接收程序传入的产品数据，或从全场景中找目标产品素材`,funcCategory:"LUOJI",funcDirectory:"abstract-functions-v2/general",configData:`{"className":"get-targets-v2","path":"abstract-functions-v2/general","funcLuaName":"get_targets_v2","input":{"widgetList":[{"id":"objects","type":"select","defaultValue":"'root'","options":[{"label":"全场景","value":"'root'","type":"any"},{"label":"程序传入","value":"target","type":"any"}],"attributes":{"label":"产品列表","placeholder":"请输入产品列表","paramType":"any"}},{"id":"product_type","type":"select","defaultValue":"part","options":[{"label":"参数化产品","value":"part","type":"string"},{"label":"非参数化产品","value":"soft","type":"string"}],"attributes":{"label":"产品类型","placeholder":"请输入产品类型","paramType":"string"}},{"id":"expression","type":"function","attributes":{"label":"条件表达式","placeholder":"请输入条件表达式","paramType":"function"}}]},"output":{"widgetList":[{"type":"input","attributes":{"label":"产品列表","placeholder":"请输入产品列表","disabled":true,"paramType":"table","paramSubType":"Part[]"}}]}}`,luaScript:`local geom_engine = require('lib.engine.geom-engine')\r
local Scene = require("scene.scene")\r
\r
local _M = {}\r
\r
-- 00? 找对象\r
-- @param objects any 产品列表 # options:[{"全场景": "$root"}, {"程序传入": "$target"}] default: "$root"\r
-- @param product_type string 产品类型 # options:[{"参数化产品": "part"}, {"非参数化产品": "soft"}] default:"part"\r
-- @param expression function 条件表达式\r
-- @return table 产品列表\r
-- @field return[] $Part Part列表\r
\r
function _M.get_targets_v2 (objects, product_type, filter_fun)\r
    -- 入参判空校验\r
    if objects == nil then\r
        return nil, "对象列表(objects参数)不能为空"\r
    end\r
    if product_type == nil then\r
        return nil, "产品类型(product_type参数)不能为空"\r
    end\r
    if type(product_type) ~= "string" then\r
        return nil, "产品类型(product_type参数)类型错误"\r
    end\r
\r
    if filter_fun == nil then\r
        filter_fun = function(product)\r
            return true\r
        end\r
    end\r
    if type(filter_fun) ~= "function" then\r
        return nil, "回调过滤函数(filter_fun参数)类型错误"\r
    end\r
\r
    local objects_list = {}\r
    local scene = Scene.current()\r
    if type(objects) == "string" then\r
        if objects == "root" then --拿全场景\r
            objects_list = scene:get_all_parts()\r
        end\r
    else\r
        if type(objects) ~= "table" then\r
            return nil, "对象列表(objects参数)类型错误"\r
        end\r
\r
        -- 判断objects是否为Part类型 --直接传target进来时命中\r
        local success = pcall(function()\r
            return objects:is_part()\r
        end)\r
        if success then\r
            table.insert(objects_list, objects)\r
        else\r
            for _, object in ipairs(objects) do\r
                -- 判断object是否为Part类型\r
                local success = pcall(function()\r
                    return object:is_part()\r
                end)\r
                if not success then\r
                    return nil, "对象列表(objects参数)类型错误"\r
                end\r
                table.insert(objects_list, object)\r
            end\r
        end\r
    end\r
    local filter_objects = {}\r
    for _, object in ipairs(objects_list) do\r
        local ok, result = pcall(filter_fun, object)  --表达式执行失败则跳过，不返回错误\r
        if ok and result then\r
            table.insert(filter_objects, object)\r
        end\r
    end\r
    return filter_objects\r
end\r
return _M`,remark:"保留字段",functionStatus:"ENABLED",isGeometry:0,funcClassifyFullPath:null,enableTime:1755759031e3,pos:50,categoryId:"8000000001",isDelete:0,createTime:1755759031e3,modifyTime:1759054088e3,creator:131,creatorName:"11051352",modifier:476,modifierName:"11051352",usageCount:null}]},{id:"8000000002",parentId:"0",name:"业务逻辑判断",level:1,sort:0,modifyTime:1758106817e3,children:[],functions:[{id:"8000002014",funcCode:"check_attributes_equal_v2",funcName:"判断产品的某个属性值是否一致",funcDesc:`v2 判断产品列表中的某个属性的值是否一致：
（1）入参数据结构（一维数组）：[ { } ]、出参数据结构（二维数组）：[ [ {},{} ],[ {},{}]]
（2）函数作用：同时适应分组/无分组情况下判断同类产品的指定属性值是否一致，且可定义输出：一致/不一致的产品清单
（3）使用说明：如此函数的下一节点是结果输出，则需要选择：结果输出（二维数组）`,funcCategory:"LUOJI",funcDirectory:"abstract-functions-v2/general",configData:'{"className":"check-attributes-equal-v2","path":"abstract-functions-v2/general","funcLuaName":"check_attributes_equal_v2","input":{"widgetList":[{"id":"parts","type":"input","defaultValue":[],"attributes":{"label":"输入的对象列表","placeholder":"请输入输入的对象列表","disabled":true,"paramType":"table","paramSubType":"Part[]"}},{"id":"group_type","type":"select","defaultValue":"scene","options":[{"label":"场景","value":"scene","type":"string"},{"label":"空间","value":"roomId","type":"string"},{"label":"顶级参数","value":"top","type":"string"},{"label":"父级参数","value":"parent","type":"string"},{"label":"自身参数","value":"oneself","type":"string"}],"attributes":{"label":"分组类型","placeholder":"请输入分组类型","paramType":"string"}},{"id":"group_param","type":"input","defaultValue":"nil","attributes":{"label":"分组参数","placeholder":"请输入分组参数","paramType":"string"}},{"id":"param_name","type":"input","attributes":{"label":"属性名称","placeholder":"请输入属性名称","paramType":"string"}},{"id":"is_same","type":"switch","defaultValue":false,"options":[{"label":"输出参数一致的产品列表","value":true,"type":"boolean"},{"label":"输出参数不一致的产品列表","value":false,"type":"boolean"}],"attributes":{"label":"是否一致","placeholder":"请输入是否一致","paramType":"boolean","activeText":"输出参数一致的产品列表","inactiveText":"输出参数不一致的产品列表"}}]},"output":{"widgetList":[{"type":"input","attributes":{"label":"返回参数一致的产品列表","placeholder":"请输入返回参数一致的产品列表","disabled":true,"paramType":"table","paramSubType":"Part[][]"}}]}}',luaScript:`local _M = {}\r
\r
-- 00? 判断产品列表中的某个属性的值是否一致\r
-- @param parts table 输入的对象列表 # default:[]\r
-- @field parts[] $Part Part列表\r
-- @param group_type string 分组类型 # options:[{"场景": "scene"}, {"空间": "roomId"}, {"顶级参数": "top"}, {"父级参数": "parent"}, {"自身参数": "oneself"}] default:"scene"\r
-- @param group_param string 分组参数 # default:nil\r
-- @param param_name string 属性名称 # default:""\r
-- @param is_same boolean 是否一致 # options:[{"输出参数一致的产品列表": true},{"输出参数不一致的产品列表": false}] default:false\r
-- @return table 返回参数一致的产品列表\r
-- @field return[] $Part[] Part列表\r
\r
\r
function _M.check_attributes_equal_v2(parts, group_type, group_param, param_name, is_same)\r
    -- 参数验证\r
    if parts == nil then\r
        return nil, "输入的对象列表(parts参数)不能为空"\r
    end\r
    if type(parts) ~= "table" then\r
        return nil, "输入的对象列表(parts参数)类型错误"\r
    end\r
    if group_type == nil then\r
        return nil, "分组类型(group_type参数)不能为空"\r
    end\r
    if type(group_type) ~= "string" then\r
        return nil, "分组类型(group_type参数)类型错误"\r
    end\r
    -- if group_param == nil then\r
    --     return nil, "分组参数(group_param参数)不能为空"\r
    -- end\r
    -- if type(group_param) ~= "string" then\r
    --     return nil, "分组参数(group_param参数)类型错误"\r
    -- end\r
    if param_name == nil then\r
        return nil, "属性名称(param_name参数)不能为空"\r
    end\r
    if type(param_name) ~= "string" then\r
        return nil, "属性名称(param_name参数)类型错误"\r
    end\r
    if is_same == nil then\r
        return nil, "是否一致(is_same参数)不能为空"\r
    end\r
    if type(is_same) ~= "boolean" then\r
        return nil, "是否一致(is_same参数)类型错误"\r
    end\r
\r
    if #parts == 0 then\r
        return {}\r
    end\r
\r
    -- 验证所有对象都是Part类型\r
    for _, part in ipairs(parts) do\r
        local success = pcall(function()\r
            return part:is_part()\r
        end)\r
        if not success then\r
            return nil, "对象列表(parts参数)类型错误"\r
        end\r
    end\r
\r
    -- 分组\r
    local group_parts = {}\r
    if group_type == "scene" then\r
        table.insert(group_parts, parts)\r
    elseif group_type == "roomId" then\r
        -- 根据roomId分组\r
        local roomGroup = {}\r
        for _, part in ipairs(parts) do\r
            local top = part:top()\r
            local room_id = top:get_attribute("roomId") or ""\r
            if not roomGroup[room_id] then\r
                roomGroup[room_id] = {}\r
            end\r
            table.insert(roomGroup[room_id], part)\r
        end\r
        for _, room in pairs(roomGroup) do\r
            table.insert(group_parts, room)\r
        end\r
    elseif group_type == "oneself" or group_type == "top" or group_type == "parent"then\r
        if group_param == nil or (type(group_param) == "string" and group_param == "") then\r
            table.insert(group_parts, parts)\r
        elseif type(group_param) == "string" and group_param ~= "" then\r
            local paramGroup = {}\r
            for _, part in ipairs(parts) do\r
                -- 分组参数按","分割\r
                local param_group_names = {}\r
                for name in string.gmatch(group_param, "([^,]+)") do\r
                    table.insert(param_group_names, name)\r
                end\r
                -- 取所有属性值做组合键\r
                local param_value = ""\r
                for _, param_group_name in ipairs(param_group_names) do\r
                    local attr_value = nil\r
                    if group_type == "oneself" then\r
                        attr_value = part:get_attribute(param_group_name) or ("oneselfNoneAttr:" .. param_group_name)\r
                    elseif group_type == "top" then\r
                        attr_value = part:top():get_attribute(param_group_name) or ("topNoneAttr:" .. param_group_name)\r
                    elseif group_type == "parent" then\r
                        attr_value = part:parent():get_attribute(param_group_name) or ("topNoneAttr:" .. param_group_name)\r
                    end\r
                    if attr_value == nil then\r
                        return nil, "传入的参数编码不存在,请确认:" .. param_group_name\r
                    end\r
                    param_value = param_value .. "_" .. attr_value\r
                end\r
                if not paramGroup[param_value] then\r
                    paramGroup[param_value] = {}\r
                end\r
                table.insert(paramGroup[param_value], part)\r
            end\r
            for _, param in pairs(paramGroup) do\r
                table.insert(group_parts, param)\r
            end\r
        end\r
    else\r
        return nil, "分组类型(group_type参数)类型错误"\r
    end\r
\r
    -- 判断参数是否一致\r
    local result = {}\r
    for _, group_part in ipairs(group_parts) do\r
        local cur_result = {}\r
        local param_value = nil\r
        local all_same = true\r
\r
        -- 先检查所有值是否一致\r
        for _, part in ipairs(group_part) do\r
            local attr_value = part:get_attribute(param_name)\r
            if attr_value == nil then\r
                return nil, "传入的参数编码不存在,请确认:" .. param_name\r
            end\r
            if not param_value then\r
                param_value = attr_value\r
            elseif attr_value ~= param_value then\r
                all_same = false\r
            end\r
        end\r
\r
        -- 根据 is_same 参数决定返回哪些对象\r
        if (all_same and is_same) or (not all_same and not is_same) then\r
            for _, part in ipairs(group_part) do\r
                table.insert(cur_result, part)\r
            end\r
        end\r
\r
        if #cur_result > 0 then\r
            table.insert(result, cur_result)\r
        end\r
    end\r
\r
    return result\r
end\r
\r
return _M\r
`,remark:"保留字段",functionStatus:"ENABLED",isGeometry:0,funcClassifyFullPath:null,enableTime:1755758532e3,pos:47,categoryId:"8000000002",isDelete:0,createTime:1755758532e3,modifyTime:1758610211e3,creator:131,creatorName:"11051352",modifier:476,modifierName:"11051352",usageCount:null},{id:"8000002015",funcCode:"get_overLap_objects_v2",funcName:"获取产品指定方向平移指定距离相交对象",funcDesc:`v2 获取产品指定方向平移指定距离相交对象：
（1）入参数据结构（单个part）：{}、出参数据结构（一维数组）：[ {} ]
（2）函数作用：获取【目标物体+指定方向+距离】存在【指定产品范围】的重叠/相交物体`,funcCategory:"JIHE",funcDirectory:"abstract-functions-v2/general",configData:'{"className":"get-overLap-objects-v2","path":"abstract-functions-v2/general","funcLuaName":"get_overLap_objects_v2","input":{"widgetList":[{"id":"part","type":"input","defaultValue":[],"attributes":{"label":"主对象","placeholder":"请输入主对象","disabled":true,"paramType":"table","paramSubType":"{}Part"}},{"id":"direction","type":"select","defaultValue":"left","options":[{"label":"左","value":"left","type":"string"},{"label":"右","value":"right","type":"string"},{"label":"前","value":"front","type":"string"},{"label":"后","value":"back","type":"string"},{"label":"上","value":"up","type":"string"},{"label":"下","value":"down","type":"string"}],"attributes":{"label":"方向","placeholder":"请输入方向","paramType":"string"}},{"id":"distance","type":"inputNumber","defaultValue":1,"attributes":{"label":"距离","placeholder":"请输入距离","paramType":"number","min":1,"max":10000,"inputType":"number"}},{"id":"expression","type":"function","attributes":{"label":"过滤表达式","placeholder":"请输入过滤表达式","paramType":"function"}}]},"output":{"widgetList":[{"type":"input","attributes":{"label":"相交对象列表","placeholder":"请输入相交对象列表","disabled":true,"paramType":"table","paramSubType":"Part[]"}}]}}',luaScript:`local geom_engine = require('lib.engine.geom-engine')\r
local Part = require("scene.part")\r
local Scene = require("scene.scene")\r
\r
local _M = {}\r
\r
-- v2 获取产品指定方向平移指定距离相交对象列表\r
-- @param part table 主对象 # default:[]\r
-- @field part $Part 主对象列表\r
-- @param direction string 方向  # options:[{"左": "left"}, {"右": "right"}, {"前": "front"}, {"后": "back"}, {"上": "up"}, {"下": "down"}] default:"left"\r
-- @param distance number 距离 # default:1 min:1 max:10000\r
-- @param expression function 过滤表达式\r
-- @return table 相交对象列表\r
-- @field return[] $Part Part列表\r
\r
function _M.get_overLap_objects_v2(part, direction, distance, expression)\r
    -- 入参判空校验\r
    if part == nil then\r
        return nil, "产品(part参数)不能为空"\r
    end\r
\r
    -- 验证 part 是否为 Part 对象\r
    local success = pcall(function()\r
        return part:is_part()\r
    end)\r
    if not success then\r
        return nil, "产品(part参数)类型错误，必须是Part对象"\r
    end\r
\r
    if direction == nil then\r
        return nil, "方向(direction参数)不能为空"\r
    end\r
    if type(direction) ~= "string" then\r
        return nil, "方向(direction参数)类型错误"\r
    end\r
\r
    -- 验证方向值\r
    local valid_directions = {"left", "right", "front", "back", "up", "down"}\r
    local is_valid_direction = false\r
    for _, valid_dir in ipairs(valid_directions) do\r
        if direction == valid_dir then\r
            is_valid_direction = true\r
            break\r
        end\r
    end\r
    if not is_valid_direction then\r
        return nil, "方向(direction参数)值错误，必须是: left, right, front, back, up, down"\r
    end\r
    \r
    if distance == nil then\r
        return nil, "距离(distance参数)不能为空"\r
    end\r
    if type(distance) ~= "number" then\r
        return nil, "距离(distance参数)类型错误"\r
    end\r
    \r
    if expression == nil then\r
        expression = function(product) \r
            return true\r
        end\r
    end\r
    if type(expression) ~= "function" then\r
        return nil, "过滤表达式(expression参数)类型错误"\r
    end\r
\r
    local scene = Scene.current()\r
    local scene_ptr = scene:get_ptr()\r
    local part_ptr = part:get_ptr()\r
    local overlap_objects = geom_engine.get_overLap_objects(scene_ptr, part_ptr, direction, distance)\r
\r
    -- 过滤对象\r
    local filtered_objects = {}\r
    if overlap_objects then\r
        for _, obj_ptr in ipairs(overlap_objects) do\r
            local obj = Part.new(obj_ptr)\r
            local ok, result, err = pcall(expression, obj)\r
            if ok then\r
                if err ~= nil then\r
                    return nil, "过滤函数(filter_function参数)返回错误: " .. err\r
                end\r
                if type(result) ~= "boolean" then\r
                    return nil, "过滤函数(filter_function参数)返回类型错误,必须为boolean"\r
                end\r
                if result then\r
                    table.insert(filtered_objects, obj)\r
                end\r
            else\r
                return nil, "过滤函数(filter_function参数)执行错误: " .. tostring(result)\r
            end\r
        end\r
    end\r
\r
    return filtered_objects\r
end\r
return _M`,remark:"保留字段",functionStatus:"ENABLED",isGeometry:1,funcClassifyFullPath:null,enableTime:1755758846e3,pos:48,categoryId:"8000000002",isDelete:0,createTime:1755758846e3,modifyTime:17585343e5,creator:131,creatorName:"11051352",modifier:476,modifierName:"11051352",usageCount:null},{id:"8000005006",funcCode:"get_overLap_objects_by_sweep_v2",funcName:"获取产品指定方向平移指定距离重叠对象(扫掠方式)",funcDesc:"v2 获取产品指定方向平移指定距离重叠对象(扫掠方式)",funcCategory:"JIHE",funcDirectory:"abstract-functions-v2/general",configData:'{"className":"get-overLap-objects-by-sweep-v2","path":"abstract-functions-v2/general","funcLuaName":"get_overLap_objects_by_sweep_v2","input":{"widgetList":[{"id":"part","type":"input","defaultValue":[],"attributes":{"label":"主对象","placeholder":"请输入主对象","disabled":true,"paramType":"table","paramSubType":"Part[]"}},{"id":"direction","type":"select","defaultValue":"left","options":[{"label":"左","value":"left","type":"string"},{"label":"右","value":"right","type":"string"},{"label":"前","value":"front","type":"string"},{"label":"后","value":"back","type":"string"},{"label":"上","value":"up","type":"string"},{"label":"下","value":"down","type":"string"}],"attributes":{"label":"方向","placeholder":"请输入方向","paramType":"string"}},{"id":"distance","type":"inputNumber","defaultValue":0,"attributes":{"label":"距离","placeholder":"请输入距离","paramType":"number","inputType":"number"}},{"id":"expression","type":"function","attributes":{"label":"过滤表达式","placeholder":"请输入过滤表达式","paramType":"function"}}]},"output":{"widgetList":[{"type":"input","attributes":{"label":"重叠对象列表","placeholder":"请输入重叠对象列表","disabled":true,"paramType":"table","paramSubType":"Part[]"}}]}}',luaScript:`local geom_engine = require('lib.engine.geom-engine')\r
local Part = require("scene.part")\r
local Scene = require("scene.scene")\r
\r
local _M = {}\r
\r
-- 00? 获取产品指定方向平移指定距离重叠对象(扫掠方式)\r
-- @param part table 主对象 # default:[]\r
-- @field part[] $Part 主对象列表\r
-- @param direction string 方向  # options:[{"左": "left"}, {"右": "right"}, {"前": "front"}, {"后": "back"}, {"上": "up"}, {"下": "down"}] default:"left"\r
-- @param distance number 距离 # default:0\r
-- @param expression function 过滤表达式\r
-- @return table 重叠对象列表\r
-- @field return[] $Part Part列表\r
\r
function _M.get_overLap_objects_by_sweep_v2(part, direction, distance, expression)\r
    -- 入参判空校验\r
    if part == nil then\r
        return nil, "产品(part参数)不能为空"\r
    end\r
\r
    -- 验证 part 是否为 Part 对象\r
    local success = pcall(function()\r
        return part:is_part()\r
    end)\r
    if not success then\r
        return nil, "产品(part参数)类型错误，必须是Part对象"\r
    end\r
\r
    if direction == nil then\r
        return nil, "方向(direction参数)不能为空"\r
    end\r
    if type(direction) ~= "string" then\r
        return nil, "方向(direction参数)类型错误"\r
    end\r
\r
    -- 验证方向值\r
    local valid_directions = {"left", "right", "front", "back", "up", "down"}\r
    local is_valid_direction = false\r
    for _, valid_dir in ipairs(valid_directions) do\r
        if direction == valid_dir then\r
            is_valid_direction = true\r
            break\r
        end\r
    end\r
    if not is_valid_direction then\r
        return nil, "方向(direction参数)值错误，必须是: left, right, front, back, up, down"\r
    end\r
    \r
    if distance == nil then\r
        return nil, "距离(distance参数)不能为空"\r
    end\r
    if type(distance) ~= "number" then\r
        return nil, "距离(distance参数)类型错误"\r
    end\r
    \r
    if expression == nil then\r
        expression = function(product) \r
            return true\r
        end\r
    end\r
    if type(expression) ~= "function" then\r
        return nil, "过滤表达式(expression参数)类型错误"\r
    end\r
\r
    local scene = Scene.current()\r
    local scene_ptr = scene:get_ptr()\r
    local part_ptr = part:get_ptr()\r
    local overlap_objects = geom_engine.get_overLap_objects_by_sweep(scene_ptr, part_ptr, direction, distance)\r
\r
    -- 过滤对象\r
    local filtered_objects = {}\r
    if overlap_objects then\r
        for _, obj_ptr in ipairs(overlap_objects) do\r
            local obj = Part.new(obj_ptr)\r
            local ok, result = pcall(expression, obj)  --表达式执行失败则跳过，不返回错误\r
            if ok and result then\r
                table.insert(filtered_objects, obj)\r
            end\r
        end\r
    end\r
\r
    return filtered_objects\r
end\r
return _M`,remark:"保留字段",functionStatus:"ENABLED",isGeometry:1,funcClassifyFullPath:null,enableTime:1758076773e3,pos:57,categoryId:"8000000002",isDelete:0,createTime:1758076773e3,modifyTime:1758534287e3,creator:131,creatorName:"11051352",modifier:476,modifierName:"11051352",usageCount:null},{id:"8000002016",funcCode:"get_product_wall_distance_v2",funcName:"获取产品离墙（硬装）距离",funcDesc:"v2 获取产品离墙（硬装）距离",funcCategory:"JIHE",funcDirectory:"abstract-functions-v2/general",configData:'{"className":"get-product-wall-distance-v2","path":"abstract-functions-v2/general","funcLuaName":"get_product_wall_distance_v2","input":{"widgetList":[{"id":"part","type":"input","defaultValue":{},"attributes":{"label":"主对象","placeholder":"请输入主对象","disabled":true,"paramType":"table","paramSubType":"{}Part"}},{"id":"direction","type":"select","defaultValue":"left","options":[{"label":"左墙（HS_LZQJL）","value":"left"},{"label":"右墙（HS_LYQJL）","value":"right"},{"label":"前墙（HS_LQQJL）","value":"front"},{"label":"后墙（HS_LHQJL）","value":"back"},{"label":"天花（HS_LTHJL）","value":"up"},{"label":"地板（HS_LDBJL）","value":"down"}],"attributes":{"label":"方向","placeholder":"请输入方向","paramType":"string"}}]},"output":{"widgetList":[{"type":"input","attributes":{"label":"主对象","placeholder":"请输入主对象","disabled":true,"paramType":"table","paramSubType":"{}Part"}}]}}',luaScript:`local geom_engine = require('lib.engine.geom-engine')\r
local Part = require("scene.part")\r
local Scene = require("scene.scene")\r
\r
local _M = {}\r
\r
-- 00? 获取产品离墙（硬装）距离\r
-- @param part table 主对象 # default:{}\r
-- @field part $Part table 对象Part\r
-- @param direction string 方向  # options:[{"左墙（HS_LZQJL）": "left"}, {"右墙（HS_LYQJL）": "right"}, {"前墙（HS_LQQJL）": "front"}, {"后墙（HS_LHQJL）": "back"}, {"天花（HS_LTHJL）": "up"}, {"地板（HS_LDBJL）": "down"} ] default:"left"\r
-- @return table 主对象\r
-- @field return $Part 主对象\r
\r
function _M.get_product_wall_distance_v2(part, direction)\r
    -- 入参判空校验\r
    if part == nil then\r
        return nil, "产品(part参数)不能为空"\r
    end\r
    -- 验证 part 是否为 Part 对象\r
    local success = pcall(function()\r
        return part:is_part()\r
    end)\r
    if not success then\r
        return nil, "产品(part参数)类型错误，必须是Part对象"\r
    end\r
    if direction == nil then\r
        return nil, "方向(direction参数)不能为空"\r
    end\r
    if type(direction) ~= "string" then\r
        return nil, "方向(direction参数)类型错误"\r
    end\r
    local scene = Scene.current()\r
    local scene_ptr = scene:get_ptr()\r
    local part_ptr = part:get_ptr()\r
    local main_obj = geom_engine.get_product_wall_distance(scene_ptr, part_ptr, direction)\r
    if main_obj then\r
        main_obj = Part.new(main_obj)\r
    end\r
    return main_obj\r
end\r
return _M`,remark:"保留字段",functionStatus:"ENABLED",isGeometry:0,funcClassifyFullPath:null,enableTime:1755758934e3,pos:49,categoryId:"8000000002",isDelete:0,createTime:1755758934e3,modifyTime:1758534318e3,creator:131,creatorName:"11051352",modifier:476,modifierName:"11051352",usageCount:null}]},{id:"8000000003",parentId:"0",name:"返回结果",level:1,sort:0,modifyTime:1758106829e3,children:[],functions:[{id:206,funcCode:"print_result",funcName:"V1值传递（指定返回内容）",funcDesc:`值传递（指定返回内容）
入参类型为“sring"字符串，支持直接在条件函数后面进行添加。`,funcCategory:"LUOJI",funcDirectory:"",configData:'{"className":"print-result","funcLuaName":"print_result","input":{"widgetList":[{"id":"value","type":"input","attributes":{"label":"输入值","placeholder":"请输入输入值","paramType":"string"}}]},"output":{"widgetList":[{"type":"input","attributes":{"label":"输出值","placeholder":"请输入输出值","paramType":"string"}}]}}',luaScript:`local _M = {}\r
\r
-- @param value string 输入值 # default:""\r
-- @return string 输出值\r
\r
function _M.print_result(value)\r
    return value\r
end\r
\r
return _M`,remark:"保留字段",functionStatus:"ENABLED",isGeometry:0,funcClassifyFullPath:null,enableTime:1751422192e3,pos:26,categoryId:"8000000003",isDelete:0,createTime:1751422192e3,modifyTime:1758534441e3,creator:131,creatorName:"11051352",modifier:476,modifierName:"11051352",usageCount:null},{id:"8000002019",funcCode:"get_string_result_v2",funcName:"v2 值传递：指定输出内容（数值/字符串）",funcDesc:`v2 值传递：指定输出内容（数值/字符串）：
（1）入参数据结构（单个part）：{}、出参数据结构（单个part）：{}
（2）函数作用：根据不同不同条件分支结果，自定义不同输出内容；注：自定义参数内容不能填写中文`,funcCategory:"LUOJI",funcDirectory:"abstract-functions-v2/general",configData:'{"className":"get-string-result-v2","path":"abstract-functions-v2/general","funcLuaName":"get_string_result_v2","input":{"widgetList":[{"id":"mainObj","type":"input","attributes":{"label":"指定素材","placeholder":"请输入指定素材","disabled":true,"paramType":"table","paramSubType":"{}Part"}},{"id":"expression","type":"function","attributes":{"label":"自定义输出内容","placeholder":"请输入自定义输出内容","paramType":"function"}}]},"output":{"widgetList":[{"type":"input","attributes":{"label":"输出内容","placeholder":"请输入输出内容","paramType":"string"}}]}}',luaScript:`local Scene = require("scene.scene")\r
\r
local _M = {}\r
\r
-- v2-dev-值传递：指定输出内容（数值/字符串）\r
-- @param mainObj table 指定素材 \r
-- @field mainObj $Part 指定素材\r
-- @param expression function 自定义输出内容\r
-- @return string 输出内容\r
\r
function _M.get_string_result_v2 (mainObj, expression)\r
    -- if mainObj == nil then -- 产品强烈要求放开类型校验\r
    --     return nil, "指定素材不能为空"\r
    -- end\r
    -- local isPart = pcall(function()\r
    --     return mainObj:is_part()\r
    -- end)\r
    -- if not isPart then\r
    --     return nil, "指定素材类型错误"\r
    -- end\r
\r
    local filter_fun\r
    if expression == nil then\r
        filter_fun = function(part)\r
            return  ""\r
        end\r
    elseif type(expression) == "function" then\r
        filter_fun = expression\r
    else\r
        return nil, "表达式类型错误"\r
    end\r
    local result = filter_fun(mainObj)\r
    return result\r
end\r
\r
return _M`,remark:"保留字段",functionStatus:"ENABLED",isGeometry:0,funcClassifyFullPath:null,enableTime:1756108041e3,pos:52,categoryId:"8000000003",isDelete:0,createTime:1756108041e3,modifyTime:1758534341e3,creator:131,creatorName:"11051352",modifier:476,modifierName:"11051352",usageCount:null},{id:"8000003006",funcCode:"get_result_one_dimension_array_v2",funcName:"结果输出（一维数组）",funcDesc:`结果输出（一维数组）：
（1）输入数据结构（一维数组）：[ {},{} ]、 输出数据结构（一维数组）：[ {},{} ]
（2）函数作用：若上一节点的输出结果是一维数组，则需要接入结果输出一维数组`,funcCategory:"LUOJI",funcDirectory:"abstract-functions-v2/general",configData:'{"className":"get-result-one-dimension-array-v2","path":"abstract-functions-v2/general","funcLuaName":"get_result_one_dimension_array_v2","input":{"widgetList":[{"id":"mainObjs","type":"input","attributes":{"label":"指定素材","placeholder":"请输入指定素材","disabled":true,"paramType":"table","paramSubType":"Part[]"}},{"id":"hierarchical_value","type":"select","defaultValue":"oneself","options":[{"label":"顶级","value":"top","type":"string"},{"label":"父级","value":"parent","type":"string"},{"label":"自身","value":"oneself","type":"string"}],"attributes":{"label":"层级取值","desc":"选择输出内容的参数取值层级。顶级：取当前对象顶级的参数，如果是相同的顶级只取一次；父级：取当前对象父级的参数，如果是相同的父级只取一次，如果没有父级则结果输出为空；自身：取当前对象自身的参数","placeholder":"请输入层级取值","paramType":"string"}},{"id":"output_attr","type":"select","defaultValue":["id"],"options":[{"label":"id","value":"id","type":"string"},{"label":"name","value":"name","type":"string"},{"label":"type","value":"type","type":"string"},{"label":"modelTypeId","value":"modelTypeId","type":"string"},{"label":"productId","value":"productId","type":"string"},{"label":"prodCatId","value":"prodCatId","type":"string"},{"label":"textureId","value":"textureId","type":"string"},{"label":"textureName","value":"textureName","type":"string"},{"label":"roomId","value":"roomId","type":"string"},{"label":"jdProductId","value":"jdProductId","type":"string"},{"label":"W","value":"W","type":"string"},{"label":"D","value":"D","type":"string"},{"label":"H","value":"H","type":"string"},{"label":"sizeX","value":"sizeX","type":"string"},{"label":"sizeY","value":"sizeY","type":"string"},{"label":"sizeZ","value":"sizeZ","type":"string"},{"label":"boxSizeX","value":"boxSizeX","type":"string"},{"label":"boxSizeY","value":"boxSizeY","type":"string"},{"label":"boxSizeZ","value":"boxSizeZ","type":"string"},{"label":"absX","value":"absX","type":"string"},{"label":"absY","value":"absY","type":"string"},{"label":"absZ","value":"absZ","type":"string"},{"label":"X","value":"X","type":"string"},{"label":"Y","value":"Y","type":"string"},{"label":"Z","value":"Z","type":"string"},{"label":"CX","value":"CX","type":"string"},{"label":"CY","value":"CY","type":"string"},{"label":"CZ","value":"CZ","type":"string"},{"label":"RX","value":"RX","type":"string"},{"label":"RY","value":"RY","type":"string"},{"label":"RZ","value":"RZ","type":"string"},{"label":"YHQJ","value":"YHQJ","type":"string"},{"label":"SGCJXK","value":"SGCJXK","type":"string"},{"label":"ZCBSP","value":"ZCBSP","type":"string"},{"label":"SHQJ","value":"SHQJ","type":"string"},{"label":"MKBQ","value":"MKBQ","type":"string"},{"label":"JXGD","value":"JXGD","type":"string"},{"label":"XGCHD","value":"XGCHD","type":"string"},{"label":"ZCBQP","value":"ZCBQP","type":"string"},{"label":"YCBSP","value":"YCBSP","type":"string"},{"label":"YCBQP","value":"YCBQP","type":"string"},{"label":"offGround","value":"offGround","type":"string"},{"label":"SGCHD","value":"SGCHD","type":"string"},{"label":"YCBSDY","value":"YCBSDY","type":"string"},{"label":"SGCQS","value":"SGCQS","type":"string"},{"label":"BBHD","value":"BBHD","type":"string"},{"label":"offset","value":"offset","type":"string"},{"label":"ZCBFD","value":"ZCBFD","type":"string"},{"label":"materialBrandGoodId","value":"materialBrandGoodId","type":"string"},{"label":"ZCBJG","value":"ZCBJG","type":"string"},{"label":"ZCBHD","value":"ZCBHD","type":"string"},{"label":"JXHQS","value":"JXHQS","type":"string"},{"label":"ZCBSDY","value":"ZCBSDY","type":"string"},{"label":"ZHQJ","value":"ZHQJ","type":"string"},{"label":"XGCQS","value":"XGCQS","type":"string"},{"label":"YCBJG","value":"YCBJG","type":"string"},{"label":"YCBHD","value":"YCBHD","type":"string"},{"label":"YCBFD","value":"YCBFD","type":"string"},{"label":"HJXHS","value":"HJXHS","type":"string"},{"label":"location","value":"location","type":"string"},{"label":"JXHLX","value":"JXHLX","type":"string"},{"label":"JXHHS","value":"JXHHS","type":"string"}],"attributes":{"label":"输出内容配置","desc":"输出内容定义，支持用户引用对象的基本属性，例如id，name都是拿参数1：mainObj所定义的对象身上的的id和name。","placeholder":"请输入输出内容配置","paramType":"string","defaultOptions":true,"multiple":true}},{"id":"expression","type":"function","attributes":{"label":"自定义输出内容","placeholder":"请输入自定义输出内容","paramType":"function"}}]},"output":{"widgetList":[{"type":"input","attributes":{"label":"输出内容","placeholder":"请输入输出内容","disabled":true,"paramType":"table","paramSubType":"{:table}[]"}}]}}',luaScript:`local Scene = require("scene.scene")\r
\r
local _M = {}\r
\r
\r
-- 局部辅助函数：解析属性字符串\r
local function parse_attributes_string(attributes_string)\r
    local attributes = {}\r
    if not attributes_string or attributes_string == "" then\r
        return attributes\r
    end\r
    for attribute in string.gmatch(attributes_string, "([^,]+)") do\r
        local trimmed = string.match(attribute, "^%s*(.-)%s*$")\r
        if trimmed and trimmed ~= "" then\r
            table.insert(attributes, trimmed)\r
        end\r
    end\r
    return attributes\r
end\r
\r
-- v2-结果输出（一维数组）\r
-- @param mainObjs table 指定素材\r
-- @field mainObjs[] $Part 指定素材\r
-- @param hierarchical_value string 层级取值 # options:[{"顶级":"top"},{"父级":"parent"},{"自身":"oneself"}] default:"oneself" componentType:select desc:选择输出内容的参数取值层级。顶级：取当前对象顶级的参数，如果是相同的顶级只取一次；父级：取当前对象父级的参数，如果是相同的父级只取一次，如果没有父级则结果输出为空；自身：取当前对象自身的参数\r
-- @param output_attr string 输出内容配置 # defaultOptions:true options:["id","name","type","modelTypeId","productId","prodCatId","textureId","textureName","roomId","jdProductId","W","D","H","sizeX","sizeY","sizeZ","boxSizeX","boxSizeY","boxSizeZ","absX","absY","absZ","X","Y","Z","CX","CY","CZ","RX","RY","RZ","YHQJ","SGCJXK","ZCBSP","SHQJ","MKBQ","JXGD","XGCHD","ZCBQP","YCBSP","YCBQP","offGround","SGCHD","YCBSDY","SGCQS","BBHD","offset","ZCBFD","materialBrandGoodId","ZCBJG","ZCBHD","JXHQS","ZCBSDY","ZHQJ","XGCQS","YCBJG","YCBHD","YCBFD","HJXHS","location","JXHLX","JXHHS"] default:["id"] componentType:select-multi desc:输出内容定义，支持用户引用对象的基本属性，例如id，name都是拿参数1：mainObj所定义的对象身上的的id和name。\r
-- @param expression function 自定义输出内容\r
-- @return table 输出内容\r
-- @field return[] table 输出内容\r
\r
function _M.get_result_one_dimension_array_v2(mainObjs, hierarchical_value, output_attr, expression)\r
    if mainObjs == nil then\r
        return nil, "指定素材不能为空"\r
    end\r
    if type(mainObjs) ~= "table" then\r
        return nil, "指定素材类型错误"\r
    end\r
\r
    -- 设置层级取值的默认值\r
    hierarchical_value = hierarchical_value or "oneself"\r
\r
    -- 验证层级取值参数\r
    if hierarchical_value ~= "top" and hierarchical_value ~= "parent" and hierarchical_value ~= "oneself" then\r
        return nil, "层级取值参数错误，必须是top、parent或oneself"\r
    end\r
\r
    for _, mainObj in ipairs(mainObjs) do\r
        local isPart = pcall(function()\r
            return mainObj:is_part()\r
        end)\r
        if not isPart then\r
            return nil, "指定素材类型错误"\r
        end\r
    end\r
\r
    local content_fun\r
    if expression == nil then\r
        content_fun = function(curObj_result)\r
            return curObj_result\r
        end\r
    elseif type(expression) == "function" then\r
        content_fun = expression\r
    else\r
        return nil, "表达式类型错误"\r
    end\r
\r
    local result = {}            -- 输出结果\r
    local processed_targets = {} -- 用于记录已处理的目标对象，避免重复\r
\r
    for _, mainObj in ipairs(mainObjs) do\r
        -- 根据层级取值选择目标对象\r
        local target_obj = mainObj\r
        local target_key = nil\r
\r
        if hierarchical_value == "top" then\r
            -- 获取顶级对象\r
            target_obj = mainObj:top()\r
            target_key = target_obj:get_attribute("id") or "unknown_top"\r
        elseif hierarchical_value == "parent" then\r
            -- 获取父级对象\r
            local parent = mainObj:parent()\r
            if not parent then\r
                -- 如果没有父级，跳过此对象\r
                goto continue\r
            end\r
            target_obj = parent\r
            target_key = target_obj:get_attribute("id") or "unknown_parent"\r
        else\r
            -- hierarchical_value == "oneself" 时，target_obj 保持为 mainObj\r
            target_key = target_obj:get_attribute("id") or "unknown_self"\r
        end\r
\r
        -- 检查是否已经处理过相同的目标对象\r
        if processed_targets[target_key] then\r
            goto continue\r
        end\r
\r
        -- 标记此目标对象已处理\r
        processed_targets[target_key] = true\r
\r
        local curObj_result = {}\r
        local attr_list = parse_attributes_string(output_attr)\r
        -- 输出内容配置\r
        for _, attr_name in ipairs(attr_list) do\r
            local attr_value = target_obj:get_attribute(attr_name)\r
            if attr_value ~= nil then\r
                curObj_result[attr_name] = attr_value\r
            end\r
        end\r
        -- 自定义输出内容\r
        local content = content_fun(target_obj)\r
        curObj_result["content"] = content\r
        table.insert(result, curObj_result)\r
\r
        ::continue::\r
    end\r
\r
    return result\r
end\r
\r
return _M\r
`,remark:"保留字段",functionStatus:"ENABLED",isGeometry:0,funcClassifyFullPath:null,enableTime:1756173304e3,pos:55,categoryId:"8000000003",isDelete:0,createTime:1756173304e3,modifyTime:1758107319e3,creator:131,creatorName:"11051352",modifier:476,modifierName:"11051352",usageCount:null},{id:"8000002021",funcCode:"get_result_two_dimension_array_v2",funcName:"结果输出（二维数组）",funcDesc:`结果输出（二维数组）：
（1）入参数据结构（二维数组）：[ [ {},{} ],[ {},{} ]]、输出数据结构（二维数组）：[ [ {},{} ],[ {},{} ]]
（2）函数作用：若上一节点的输出内容是二维数组，则需要接入结果输出（二维数组）`,funcCategory:"LUOJI",funcDirectory:"abstract-functions-v2/general",configData:'{"className":"get-result-two-dimension-array-v2","path":"abstract-functions-v2/general","funcLuaName":"get_result_two_dimension_array_v2","input":{"widgetList":[{"id":"mainObjs","type":"input","defaultValue":[],"attributes":{"label":"指定素材二维数组","placeholder":"请输入指定素材二维数组","disabled":true,"paramType":"table","paramSubType":"Part[][]"}},{"id":"hierarchical_value","type":"select","defaultValue":"oneself","options":[{"label":"顶级","value":"top","type":"string"},{"label":"父级","value":"parent","type":"string"},{"label":"自身","value":"oneself","type":"string"}],"attributes":{"label":"层级取值","desc":"选择输出内容的参数取值层级。顶级：取当前对象顶级的参数，如果是相同的顶级只取一次；父级：取当前对象父级的参数，如果是相同的父级只取一次，如果没有父级则结果输出为空；自身：取当前对象自身的参数","placeholder":"请输入层级取值","paramType":"string"}},{"id":"output_attr","type":"select","defaultValue":["id"],"options":[{"label":"id","value":"id","type":"string"},{"label":"name","value":"name","type":"string"},{"label":"type","value":"type","type":"string"},{"label":"modelTypeId","value":"modelTypeId","type":"string"},{"label":"productId","value":"productId","type":"string"},{"label":"prodCatId","value":"prodCatId","type":"string"},{"label":"textureId","value":"textureId","type":"string"},{"label":"textureName","value":"textureName","type":"string"},{"label":"roomId","value":"roomId","type":"string"},{"label":"jdProductId","value":"jdProductId","type":"string"},{"label":"W","value":"W","type":"string"},{"label":"D","value":"D","type":"string"},{"label":"H","value":"H","type":"string"},{"label":"sizeX","value":"sizeX","type":"string"},{"label":"sizeY","value":"sizeY","type":"string"},{"label":"sizeZ","value":"sizeZ","type":"string"},{"label":"boxSizeX","value":"boxSizeX","type":"string"},{"label":"boxSizeY","value":"boxSizeY","type":"string"},{"label":"boxSizeZ","value":"boxSizeZ","type":"string"},{"label":"absX","value":"absX","type":"string"},{"label":"absY","value":"absY","type":"string"},{"label":"absZ","value":"absZ","type":"string"},{"label":"X","value":"X","type":"string"},{"label":"Y","value":"Y","type":"string"},{"label":"Z","value":"Z","type":"string"},{"label":"CX","value":"CX","type":"string"},{"label":"CY","value":"CY","type":"string"},{"label":"CZ","value":"CZ","type":"string"},{"label":"RX","value":"RX","type":"string"},{"label":"RY","value":"RY","type":"string"},{"label":"RZ","value":"RZ","type":"string"},{"label":"YHQJ","value":"YHQJ","type":"string"},{"label":"SGCJXK","value":"SGCJXK","type":"string"},{"label":"ZCBSP","value":"ZCBSP","type":"string"},{"label":"SHQJ","value":"SHQJ","type":"string"},{"label":"MKBQ","value":"MKBQ","type":"string"},{"label":"JXGD","value":"JXGD","type":"string"},{"label":"XGCHD","value":"XGCHD","type":"string"},{"label":"ZCBQP","value":"ZCBQP","type":"string"},{"label":"YCBSP","value":"YCBSP","type":"string"},{"label":"YCBQP","value":"YCBQP","type":"string"},{"label":"offGround","value":"offGround","type":"string"},{"label":"SGCHD","value":"SGCHD","type":"string"},{"label":"YCBSDY","value":"YCBSDY","type":"string"},{"label":"SGCQS","value":"SGCQS","type":"string"},{"label":"BBHD","value":"BBHD","type":"string"},{"label":"offset","value":"offset","type":"string"},{"label":"ZCBFD","value":"ZCBFD","type":"string"},{"label":"materialBrandGoodId","value":"materialBrandGoodId","type":"string"},{"label":"ZCBJG","value":"ZCBJG","type":"string"},{"label":"ZCBHD","value":"ZCBHD","type":"string"},{"label":"JXHQS","value":"JXHQS","type":"string"},{"label":"ZCBSDY","value":"ZCBSDY","type":"string"},{"label":"ZHQJ","value":"ZHQJ","type":"string"},{"label":"XGCQS","value":"XGCQS","type":"string"},{"label":"YCBJG","value":"YCBJG","type":"string"},{"label":"YCBHD","value":"YCBHD","type":"string"},{"label":"YCBFD","value":"YCBFD","type":"string"},{"label":"HJXHS","value":"HJXHS","type":"string"},{"label":"location","value":"location","type":"string"},{"label":"JXHLX","value":"JXHLX","type":"string"},{"label":"JXHHS","value":"JXHHS","type":"string"}],"attributes":{"label":"输出内容配置","desc":"输出内容定义，支持用户引用对象的基本属性，例如id，name都是拿参数1：mainObj所定义的对象身上的的id和name。","placeholder":"请输入输出内容配置","paramType":"string","defaultOptions":true,"multiple":true}},{"id":"expression","type":"function","attributes":{"label":"自定义输出内容","placeholder":"请输入自定义输出内容","paramType":"function"}}]},"output":{"widgetList":[{"type":"input","attributes":{"label":"输出内容","placeholder":"请输入输出内容","disabled":true,"paramType":"table","paramSubType":"{:table}[]"}}]}}',luaScript:`local Scene = require("scene.scene")\r
\r
local _M = {}\r
\r
\r
-- 局部辅助函数：解析属性字符串\r
local function parse_attributes_string(attributes_string)\r
    local attributes = {}\r
    if not attributes_string or attributes_string == "" then\r
        return attributes\r
    end\r
    for attribute in string.gmatch(attributes_string, "([^,]+)") do\r
        local trimmed = string.match(attribute, "^%s*(.-)%s*$")\r
        if trimmed and trimmed ~= "" then\r
            table.insert(attributes, trimmed)\r
        end\r
    end\r
    return attributes\r
end\r
\r
-- v2-结果输出（二维数组）\r
-- @param mainObjs table 指定素材二维数组 # default:[]\r
-- @field mainObjs[] $Part[] 指定素材一维数组\r
-- @param hierarchical_value string 层级取值 # options:[{"顶级":"top"},{"父级":"parent"},{"自身":"oneself"}] default:"oneself" componentType:select desc:选择输出内容的参数取值层级。顶级：取当前对象顶级的参数，如果是相同的顶级只取一次；父级：取当前对象父级的参数，如果是相同的父级只取一次，如果没有父级则结果输出为空；自身：取当前对象自身的参数\r
-- @param output_attr string 输出内容配置 # defaultOptions:true options:["id","name","type","modelTypeId","productId","prodCatId","textureId","textureName","roomId","jdProductId","W","D","H","sizeX","sizeY","sizeZ","boxSizeX","boxSizeY","boxSizeZ","absX","absY","absZ","X","Y","Z","CX","CY","CZ","RX","RY","RZ","YHQJ","SGCJXK","ZCBSP","SHQJ","MKBQ","JXGD","XGCHD","ZCBQP","YCBSP","YCBQP","offGround","SGCHD","YCBSDY","SGCQS","BBHD","offset","ZCBFD","materialBrandGoodId","ZCBJG","ZCBHD","JXHQS","ZCBSDY","ZHQJ","XGCQS","YCBJG","YCBHD","YCBFD","HJXHS","location","JXHLX","JXHHS"] default:["id"] componentType:select-multi desc:输出内容定义，支持用户引用对象的基本属性，例如id，name都是拿参数1：mainObj所定义的对象身上的的id和name。\r
-- @param expression function 自定义输出内容\r
-- @return table 输出内容\r
-- @field return[] table 输出内容\r
\r
function _M.get_result_two_dimension_array_v2(mainObjs, hierarchical_value, output_attr, expression)\r
    if mainObjs == nil then\r
        return nil, "指定素材不能为空"\r
    end\r
    if type(mainObjs) ~= "table" then\r
        return nil, "指定素材类型错误"\r
    end\r
\r
    -- 设置层级取值的默认值\r
    hierarchical_value = hierarchical_value or "oneself"\r
\r
    -- 验证层级取值参数\r
    if hierarchical_value ~= "top" and hierarchical_value ~= "parent" and hierarchical_value ~= "oneself" then\r
        return nil, "层级取值参数错误，必须是top、parent或oneself"\r
    end\r
\r
    local content_fun\r
    if expression == nil then\r
        content_fun = function(curObj_result)\r
            return curObj_result\r
        end\r
    elseif type(expression) == "function" then\r
        content_fun = expression\r
    else\r
        return nil, "表达式类型错误"\r
    end\r
\r
    local result = {}            -- 输出结果\r
    local all_objs = {}\r
    local processed_targets = {} -- 用于记录已处理的目标对象，避免重复\r
\r
    for _, group in ipairs(mainObjs) do\r
        if type(group) == "table" then\r
            for _, mainObj in ipairs(group) do\r
                if mainObj:is_part() then\r
                    table.insert(all_objs, mainObj)\r
                else\r
                    return nil, "指定素材类型错误"\r
                end\r
            end\r
        else\r
            return nil, "指定素材类型错误"\r
        end\r
    end\r
\r
    for _, mainObj in ipairs(all_objs) do\r
        -- 根据层级取值选择目标对象\r
        local target_obj = mainObj\r
        local target_key = nil\r
\r
        if hierarchical_value == "top" then\r
            -- 获取顶级对象\r
            target_obj = mainObj:top()\r
            target_key = target_obj:get_attribute("id") or "unknown_top"\r
        elseif hierarchical_value == "parent" then\r
            -- 获取父级对象\r
            local parent = mainObj:parent()\r
            if not parent then\r
                -- 如果没有父级，跳过此对象\r
                goto continue\r
            end\r
            target_obj = parent\r
            target_key = target_obj:get_attribute("id") or "unknown_parent"\r
        else\r
            -- hierarchical_value == "oneself" 时，target_obj 保持为 mainObj\r
            target_key = target_obj:get_attribute("id") or "unknown_self"\r
        end\r
\r
        -- 检查是否已经处理过相同的目标对象\r
        if processed_targets[target_key] then\r
            goto continue\r
        end\r
\r
        -- 标记此目标对象已处理\r
        processed_targets[target_key] = true\r
\r
        local curObj_result = {}\r
        local attr_list = parse_attributes_string(output_attr)\r
        -- 输出内容配置\r
        for _, attr_name in ipairs(attr_list) do\r
            local attr_value = target_obj:get_attribute(attr_name)\r
            if attr_value ~= nil then\r
                curObj_result[attr_name] = attr_value\r
            end\r
        end\r
        -- 自定义输出内容\r
        local content = content_fun(target_obj)\r
        curObj_result["content"] = content\r
        table.insert(result, curObj_result)\r
\r
        ::continue::\r
    end\r
\r
    return result\r
end\r
\r
return _M\r
`,remark:"保留字段",functionStatus:"ENABLED",isGeometry:0,funcClassifyFullPath:null,enableTime:1756111845e3,pos:54,categoryId:"8000000003",isDelete:0,createTime:1756111845e3,modifyTime:1758106937e3,creator:131,creatorName:"11051352",modifier:476,modifierName:"11051352",usageCount:null},{id:"8000004006",funcCode:"get_part_result_v2",funcName:"结果输出（单个对象）",funcDesc:`结果输出（单个Part）：
（1）输入数据结构（单个part）： {}、输出数据结构（单个part）： {} 
（2）若上一节点的输出结果是单个对象，则需要使用此函数进行自定义输出结果`,funcCategory:"LUOJI",funcDirectory:"abstract-functions-v2/general",configData:'{"className":"get-part-result-v2","path":"abstract-functions-v2/general","funcLuaName":"get_part_result_v2","input":{"widgetList":[{"id":"mainObjs","type":"input","attributes":{"label":"指定素材","placeholder":"请输入指定素材","disabled":true,"paramType":"table","paramSubType":"{}Part"}},{"id":"hierarchical_value","type":"select","defaultValue":"oneself","options":[{"label":"顶级","value":"top","type":"string"},{"label":"父级","value":"parent","type":"string"},{"label":"自身","value":"oneself","type":"string"}],"attributes":{"label":"层级取值","desc":"选择输出内容的参数取值层级，top代表取当前对象顶级的参数，parent代表取当前对象父级的参数，oneself代表取当前对象自身的参数","placeholder":"请输入层级取值","paramType":"string"}},{"id":"output_attr","type":"select","defaultValue":["id"],"options":[{"label":"id","value":"id","type":"string"},{"label":"name","value":"name","type":"string"},{"label":"type","value":"type","type":"string"},{"label":"modelTypeId","value":"modelTypeId","type":"string"},{"label":"productId","value":"productId","type":"string"},{"label":"prodCatId","value":"prodCatId","type":"string"},{"label":"textureId","value":"textureId","type":"string"},{"label":"textureName","value":"textureName","type":"string"},{"label":"roomId","value":"roomId","type":"string"},{"label":"jdProductId","value":"jdProductId","type":"string"},{"label":"W","value":"W","type":"string"},{"label":"D","value":"D","type":"string"},{"label":"H","value":"H","type":"string"},{"label":"sizeX","value":"sizeX","type":"string"},{"label":"sizeY","value":"sizeY","type":"string"},{"label":"sizeZ","value":"sizeZ","type":"string"},{"label":"boxSizeX","value":"boxSizeX","type":"string"},{"label":"boxSizeY","value":"boxSizeY","type":"string"},{"label":"boxSizeZ","value":"boxSizeZ","type":"string"},{"label":"absX","value":"absX","type":"string"},{"label":"absY","value":"absY","type":"string"},{"label":"absZ","value":"absZ","type":"string"},{"label":"X","value":"X","type":"string"},{"label":"Y","value":"Y","type":"string"},{"label":"Z","value":"Z","type":"string"},{"label":"CX","value":"CX","type":"string"},{"label":"CY","value":"CY","type":"string"},{"label":"CZ","value":"CZ","type":"string"},{"label":"RX","value":"RX","type":"string"},{"label":"RY","value":"RY","type":"string"},{"label":"RZ","value":"RZ","type":"string"},{"label":"YHQJ","value":"YHQJ","type":"string"},{"label":"SGCJXK","value":"SGCJXK","type":"string"},{"label":"ZCBSP","value":"ZCBSP","type":"string"},{"label":"SHQJ","value":"SHQJ","type":"string"},{"label":"MKBQ","value":"MKBQ","type":"string"},{"label":"JXGD","value":"JXGD","type":"string"},{"label":"XGCHD","value":"XGCHD","type":"string"},{"label":"ZCBQP","value":"ZCBQP","type":"string"},{"label":"YCBSP","value":"YCBSP","type":"string"},{"label":"YCBQP","value":"YCBQP","type":"string"},{"label":"offGround","value":"offGround","type":"string"},{"label":"SGCHD","value":"SGCHD","type":"string"},{"label":"YCBSDY","value":"YCBSDY","type":"string"},{"label":"SGCQS","value":"SGCQS","type":"string"},{"label":"BBHD","value":"BBHD","type":"string"},{"label":"offset","value":"offset","type":"string"},{"label":"ZCBFD","value":"ZCBFD","type":"string"},{"label":"materialBrandGoodId","value":"materialBrandGoodId","type":"string"},{"label":"ZCBJG","value":"ZCBJG","type":"string"},{"label":"ZCBHD","value":"ZCBHD","type":"string"},{"label":"JXHQS","value":"JXHQS","type":"string"},{"label":"ZCBSDY","value":"ZCBSDY","type":"string"},{"label":"ZHQJ","value":"ZHQJ","type":"string"},{"label":"XGCQS","value":"XGCQS","type":"string"},{"label":"YCBJG","value":"YCBJG","type":"string"},{"label":"YCBHD","value":"YCBHD","type":"string"},{"label":"YCBFD","value":"YCBFD","type":"string"},{"label":"HJXHS","value":"HJXHS","type":"string"},{"label":"location","value":"location","type":"string"},{"label":"JXHLX","value":"JXHLX","type":"string"},{"label":"JXHHS","value":"JXHHS","type":"string"}],"attributes":{"label":"输出内容配置","desc":"输出内容定义，支持用户引用对象的基本属性，例如id，name都是拿参数1：mainObj所定义的对象身上的的id和name。","placeholder":"请输入输出内容配置","paramType":"string","defaultOptions":true,"multiple":true}},{"id":"expression","type":"function","attributes":{"label":"自定义输出内容","placeholder":"请输入自定义输出内容","paramType":"function"}}]},"output":{"widgetList":[{"type":"input","attributes":{"label":"输出内容","placeholder":"请输入输出内容","disabled":true,"paramType":"table","paramSubType":"{:table}"}}]}}',luaScript:`local Scene = require("scene.scene")\r
\r
local _M = {}\r
\r
\r
-- 局部辅助函数：解析属性字符串\r
local function parse_attributes_string(attributes_string)\r
    local attributes = {}\r
    if not attributes_string or attributes_string == "" then\r
        return attributes\r
    end\r
    for attribute in string.gmatch(attributes_string, "([^,]+)") do\r
        local trimmed = string.match(attribute, "^%s*(.-)%s*$")\r
        if trimmed and trimmed ~= "" then\r
            table.insert(attributes, trimmed)\r
        end\r
    end\r
    return attributes\r
end\r
\r
-- v2-结果输出（单个Part）\r
-- @param mainObjs table 指定素材\r
-- @field mainObjs $Part 指定素材\r
-- @param hierarchical_value string 层级取值 # options:[{"顶级":"top"},{"父级":"parent"},{"自身":"oneself"}] default:"oneself" componentType:select desc:选择输出内容的参数取值层级，top代表取当前对象顶级的参数，parent代表取当前对象父级的参数，oneself代表取当前对象自身的参数\r
-- @param output_attr string 输出内容配置 # defaultOptions:true options:["id","name","type","modelTypeId","productId","prodCatId","textureId","textureName","roomId","jdProductId","W","D","H","sizeX","sizeY","sizeZ","boxSizeX","boxSizeY","boxSizeZ","absX","absY","absZ","X","Y","Z","CX","CY","CZ","RX","RY","RZ","YHQJ","SGCJXK","ZCBSP","SHQJ","MKBQ","JXGD","XGCHD","ZCBQP","YCBSP","YCBQP","offGround","SGCHD","YCBSDY","SGCQS","BBHD","offset","ZCBFD","materialBrandGoodId","ZCBJG","ZCBHD","JXHQS","ZCBSDY","ZHQJ","XGCQS","YCBJG","YCBHD","YCBFD","HJXHS","location","JXHLX","JXHHS"] default:["id"] componentType:select-multi desc:输出内容定义，支持用户引用对象的基本属性，例如id，name都是拿参数1：mainObj所定义的对象身上的的id和name。\r
-- @param expression function 自定义输出内容\r
-- @return table 输出内容\r
-- @field return table 输出内容\r
function _M.get_part_result_v2(mainObj, hierarchical_value, output_attr, expression)\r
    if mainObj == nil then\r
        return nil, "指定素材不能为空"\r
    end\r
    if type(mainObj) ~= "table" then\r
        return nil, "指定素材类型错误"\r
    end\r
    local isPart = pcall(function()\r
        return mainObj:is_part()\r
    end)\r
    if not isPart then\r
        return nil, "指定素材类型错误"\r
    end\r
\r
    -- 设置层级取值的默认值\r
    hierarchical_value = hierarchical_value or "oneself"\r
\r
    -- 验证层级取值参数\r
    if hierarchical_value ~= "top" and hierarchical_value ~= "parent" and hierarchical_value ~= "oneself" then\r
        return nil, "层级取值参数错误，必须是top、parent或oneself"\r
    end\r
\r
    local content_fun\r
    if expression == nil then\r
        content_fun = function(curObj_result)\r
            return curObj_result\r
        end\r
    elseif type(expression) == "function" then\r
        content_fun = expression\r
    else\r
        return nil, "表达式类型错误"\r
    end\r
\r
    local curObj_result = {}\r
    local attr_list = parse_attributes_string(output_attr)\r
\r
    -- 根据层级取值选择目标对象\r
    local target_obj = mainObj\r
    if hierarchical_value == "top" then\r
        -- 获取顶级对象\r
        target_obj = mainObj:top()\r
    elseif hierarchical_value == "parent" then\r
        -- 获取父级对象\r
        local parent = mainObj:parent()\r
        if not parent then\r
            -- 如果没有父级，返回空结果\r
            return {}\r
        end\r
        target_obj = parent\r
    end\r
    -- hierarchical_value == "oneself" 时，target_obj 保持为 mainObj\r
\r
    -- 输出内容配置\r
    for _, attr_name in ipairs(attr_list) do\r
        local attr_value = target_obj:get_attribute(attr_name)\r
        if attr_value ~= nil then\r
            curObj_result[attr_name] = attr_value\r
        end\r
    end\r
    -- 自定义输出内容\r
    local content = content_fun(target_obj)\r
    curObj_result["content"] = content\r
\r
    return curObj_result\r
end\r
\r
return _M\r
`,remark:"保留字段",functionStatus:"ENABLED",isGeometry:0,funcClassifyFullPath:null,enableTime:1756205845e3,pos:56,categoryId:"8000000003",isDelete:0,createTime:1756205845e3,modifyTime:1758156171e3,creator:131,creatorName:"11051352",modifier:476,modifierName:"11051352",usageCount:null},{id:"8000001006",funcCode:"get_attribute_single",funcName:"获取产品属性值",funcDesc:"获取产品属性值 若无该属性 则返回nil",funcCategory:"LUOJI",funcDirectory:"",configData:'{"className":"get-attribute-single","funcLuaName":"get_attribute_single","input":{"widgetList":[{"id":"input_product","type":"input","defaultValue":[],"attributes":{"label":"单个产品","placeholder":"请输入单个产品","paramType":"any"}},{"id":"param_name","type":"input","attributes":{"label":"属性名称","placeholder":"请输入属性名称","paramType":"string"}}]},"output":{"widgetList":[{"type":"input","attributes":{"label":"属性值(stirng|nil)","placeholder":"请输入属性值(stirng|nil)","paramType":"any"}}]}}',luaScript:`local _M = {}\r
\r
local table = require("core.table")\r
\r
\r
-- 002 获取素材的参数值\r
-- @param input_product any 单个产品 #default:[]\r
-- @param param_name string 属性名称 #default:""\r
-- @return any 属性值(stirng|nil)\r
\r
function _M.get_attribute_single(input_product, param_name)\r
-- 入参判空校验\r
    if input_product == nil then\r
        return nil, "输入的单个产品(input_product参数)不能为空"\r
    end\r
    if type(input_product) ~= "table" then\r
        return nil, "输入的单个产品(input_product参数)类型错误"\r
    end\r
    if param_name == nil then\r
        return nil, "属性名称(param_name参数)不能为空"\r
    end\r
    if type(param_name) ~= "string" then\r
        return nil, "属性名称(param_name参数)类型错误"\r
    end\r
    local result = nil\r
\r
    local attr_value = input_product:get_attribute(param_name)\r
    if attr_value and #attr_value > 0 then\r
        result = attr_value\r
    end\r
\r
    return result\r
end\r
\r
return _M\r
`,remark:"保留字段",functionStatus:"ENABLED",isGeometry:0,funcClassifyFullPath:null,enableTime:1754371954e3,pos:41,categoryId:"8000000003",isDelete:0,createTime:1754371954e3,modifyTime:1759041561e3,creator:131,creatorName:"11051352",modifier:476,modifierName:"11051352",usageCount:null}]},{id:"-1",parentId:"0",name:"未分类",level:1,sort:9999999,modifyTime:1757488193e3,children:[],functions:[{id:20001,funcCode:"cesAny",funcName:"cesAny",funcDesc:"cesAny",funcCategory:"LUOJI",funcDirectory:"",configData:'{"className":"get-parent","funcLuaName":"get_parent","input":{"widgetList":[{"id":"op","type":"input","attributes":{"label":"复杂对象数组","placeholder":"请输入复杂对象数组","disabled":true,"paramType":"table","paramSubType":"Part[]"}},{"id":"deep","type":"input","attributes":{"label":"复杂对象","placeholder":"请输入复杂对象","disabled":true,"paramType":"table","paramSubType":"{}Part"}}]},"output":{"widgetList":[{"type":"input","attributes":{"label":"返回用户信息对象","placeholder":"请输入返回用户信息对象","disabled":true,"paramType":"table","paramSubType":"Part[]"}}]}}',luaScript:`
local _M = {}

local table = require("core.table")
local part = require("scene.part")

-- 参数示例
-- @param op table 复杂对象数组
-- @field op[] $Part part数组
-- @param deep table 复杂对象
-- @field deep $Part part数组
-- @return table 返回用户信息对象
-- @field return[] $Part part数组
function _M.get_parent(op, number)
    
end

return _M
`,remark:"保留字段",functionStatus:"ENABLED",isGeometry:0,funcClassifyFullPath:null,enableTime:1752042146e3,pos:37,categoryId:-1,isDelete:0,createTime:1752042146e3,modifyTime:1758531634e3,creator:471,creatorName:"3000895",modifier:476,modifierName:"3000895",usageCount:null},{id:"8000006008",funcCode:"get_part_texture_attribute_v2",funcName:"v2 材质属性获取",funcDesc:`v2 材质属性获取
根据Part的Texture属性(part_attr)获取材质值 根据材质值对应的材质对象 获取返回材质对象对应属性(texture_attr)的值`,funcCategory:"LUOJI",funcDirectory:"abstract-functions-v2/general",configData:'{"className":"get-part-texture-attribute-v2","path":"abstract-functions-v2/general","funcLuaName":"get_part_texture_attribute_v2","input":{"widgetList":[{"id":"part","type":"input","attributes":{"label":"输入的Part","placeholder":"请输入输入的Part","disabled":true,"paramType":"table","paramSubType":"{}Part"}},{"id":"part_attr","type":"input","attributes":{"label":"模型属性","placeholder":"请输入模型属性","paramType":"string"}},{"id":"texture_attr","type":"input","attributes":{"label":"材质属性","placeholder":"请输入材质属性","paramType":"string"}}]},"output":{"widgetList":[{"type":"input","attributes":{"label":"输出值","placeholder":"请输入输出值","paramType":"string"}}]}}',luaScript:`local _M = {}\r
local Scene = require("scene.scene")\r
\r
-- v2-材质属性获取\r
-- @param part table 输入的Part\r
-- @field part $Part 输入的Part\r
-- @param part_attr string 模型属性\r
-- @param texture_attr string 材质属性\r
-- @return string 输出值\r
\r
-- 根据Part的Texture属性(part_attr)获取材质值 根据材质值对应的材质对象 获取返回材质对象对应属性(texture_attr)的值\r
function _M.get_part_texture_attribute_v2(part, part_attr, texture_attr)\r
    if part == nil then\r
        return nil, "Part对象不能为空"\r
    end\r
    if type(part) ~= "table" then\r
        return nil, "Part对象类型错误"\r
    end\r
    local isPart = pcall(function()\r
        return part:is_part()\r
    end)\r
    if not isPart then\r
        return nil, "Part对象类型错误"\r
    end\r
    if part_attr == nil then\r
        return nil, "模型属性不能为空"\r
    end\r
    if type(part_attr) ~= "string" then\r
        return nil, "模型属性类型错误"\r
    end\r
\r
    if texture_attr == nil then\r
        return "" --材质属性不能为空 返回空字符串\r
    end\r
    if type(texture_attr) ~= "string" then\r
        return nil, "材质属性类型错误"\r
    end\r
\r
    local texture_id = part:get_attribute(part_attr) or ""\r
    if texture_id == "" then\r
        return ""\r
    end\r
    -- local is_ignore = part:get_attribute(attribute_name .. "__ignored") or "false"\r
    -- if is_ignore == "true" then\r
    --     return "" --属性被忽略 返回空字符串\r
    -- end\r
    local scene = Scene.current()\r
    if not scene then\r
        return nil, "获取当前场景失败"\r
    end\r
    local texture = scene:get_texture_by_id(texture_id)\r
    if not texture then\r
        return "" --resources 中找不到该材质 返回空字符串\r
    end\r
    local attribute_value = texture:get_attribute(texture_attr) or ""\r
    return attribute_value\r
end\r
\r
return _M`,remark:"保留字段",functionStatus:"ENABLED",isGeometry:0,funcClassifyFullPath:null,enableTime:1760342276e3,pos:61,categoryId:-1,isDelete:0,createTime:1760342276e3,modifyTime:1760342517e3,creator:131,creatorName:"11051352",modifier:131,modifierName:"11051352",usageCount:null},{id:"8000006007",funcCode:"merge_strings_v2",funcName:"v2 汇总拼接字符串（去重、汇总数量）",funcDesc:"v2 汇总拼接字符串（去重、汇总数量）",funcCategory:"LUOJI",funcDirectory:"abstract-functions-v2/general",configData:'{"className":"merge-strings-v2","path":"abstract-functions-v2/general","funcLuaName":"merge_strings_v2","input":{"widgetList":[{"id":"strings","type":"input","defaultValue":[],"attributes":{"label":"输入值","placeholder":"请输入输入值","disabled":true,"paramType":"table","paramSubType":"string[]"}},{"id":"separator","type":"input","attributes":{"label":"分隔符号","placeholder":"请输入分隔符号","paramType":"string"}},{"id":"merge_type","type":"select","defaultValue":0,"options":[{"label":"去重","value":0,"type":"number"},{"label":"去重并汇总","value":1,"type":"number"},{"label":"不去重","value":2,"type":"number"}],"attributes":{"label":"转换类型","placeholder":"请输入转换类型","paramType":"number"}},{"id":"count_prefix","type":"input","attributes":{"label":"数量前缀","placeholder":"请输入数量前缀","paramType":"string"}}]},"output":{"widgetList":[{"type":"input","attributes":{"label":"拼接后的字符串","placeholder":"请输入拼接后的字符串","paramType":"string"}}]}}',luaScript:`\r
local _M = {}\r
\r
local MERGE_TYPE = {\r
    UNIQUE = 0,\r
    UNIQUE_AND_SUMMARY = 1,\r
    NOT_UNIQUE = 2,\r
}\r
\r
-- v2-汇总拼接字符串（去重、汇总数量）\r
-- @param strings table 输入值 # default:[]\r
-- @field strings[] string 字符串列表\r
-- @param separator string 分隔符号 # default:""\r
-- @param merge_type number 转换类型 #  options:[{"去重": 0},{"去重并汇总": 1},{"不去重": 2}] default:0\r
-- @param count_prefix string 数量前缀 # default:""\r
-- @return string 拼接后的字符串\r
function _M.merge_strings_v2(strings, separator, merge_type, count_prefix)\r
    if type(strings) ~= "table" then\r
        return nil, "输入的字符串列表(strings参数)类型错误"\r
    end\r
    for _, string in ipairs(strings) do\r
        if type(string) ~= "string" then\r
            return nil, "输入的字符串列表(strings参数)类型错误"\r
        end\r
    end\r
    if #strings == 0 then\r
        return ""\r
    end\r
    if separator == nil then\r
        return nil, "分隔符(separator参数)不能为空"\r
    end\r
    if type(separator) ~= "string" then\r
        return nil, "分隔符(separator参数)类型错误"\r
    end\r
    if merge_type == nil then\r
        merge_type = 0\r
    end\r
    if type(merge_type) ~= "number" then\r
        return nil, "是否统计数量(is_count参数)类型错误"\r
    end\r
    if count_prefix == nil then\r
        count_prefix = ""\r
    end\r
    if type(count_prefix) ~= "string" then\r
        return nil, "统计数量前缀(count_prefix参数)类型错误"\r
    end\r
    if strings == nil then\r
        return nil, "输入的字符串列表(strings参数)不能为空"\r
    end\r
    local result = ""\r
    local count_map = {}\r
    for _, string in ipairs(strings) do\r
        if string == nil or string == "" then\r
            goto continue\r
        end\r
        if count_map[string] == nil then\r
            count_map[string] = 1\r
        else\r
            count_map[string] = count_map[string] + 1\r
        end\r
        ::continue::\r
    end\r
    for string, count in pairs(count_map) do\r
        if merge_type == MERGE_TYPE.UNIQUE_AND_SUMMARY then\r
            result = result .. string .. "(" .. count_prefix .. count .. ")" .. separator\r
        elseif merge_type == MERGE_TYPE.UNIQUE then\r
            result = result .. string .. separator\r
        elseif merge_type == MERGE_TYPE.NOT_UNIQUE then\r
            for i = 1, count do\r
                result = result .. string .. separator\r
            end\r
        end\r
    end\r
    result = string.sub(result, 1, -#separator - 1)\r
    return result\r
end\r
\r
return _M`,remark:"保留字段",functionStatus:"ENABLED",isGeometry:0,funcClassifyFullPath:null,enableTime:1760334571e3,pos:60,categoryId:-1,isDelete:0,createTime:1760334571e3,modifyTime:1760931597e3,creator:131,creatorName:"11051352",modifier:131,modifierName:"11051352",usageCount:null},{id:"8000007007",funcCode:"get_part_face_distance_v2",funcName:"v2 计算产品A到产品B 指定方向面的距离",funcDesc:`获取AB两Part 某方向上面的距离(eg：A的前面对应B的前面的距离)； 
在该方向上A突出B， 则返回正数， 代表A突出距离；
 反之,返回负数，代表A凹陷距离；
 若两物品的该方向不重合 ，返回无效数字（NaN）`,funcCategory:"JIHE",funcDirectory:"abstract-function-v2/general",configData:'{"className":"get-part-face-distance-v2","path":"abstract-function-v2/general","funcLuaName":"get_part_face_distance_v2","input":{"widgetList":[{"id":"partA","type":"input","attributes":{"label":"产品A","placeholder":"请输入产品A","disabled":true,"paramType":"table","paramSubType":"{}Part"}},{"id":"partB","type":"input","attributes":{"label":"产品B","placeholder":"请输入产品B","disabled":true,"paramType":"table","paramSubType":"{}Part"}},{"id":"direction","type":"select","defaultValue":"left","options":[{"label":"左","value":"left","type":"string"},{"label":"右","value":"right","type":"string"},{"label":"前","value":"front","type":"string"},{"label":"后","value":"back","type":"string"},{"label":"上","value":"up","type":"string"},{"label":"下","value":"down","type":"string"}],"attributes":{"label":"方向","placeholder":"请输入方向","paramType":"string"}}]},"output":{"widgetList":[{"type":"inputNumber","attributes":{"label":"距离","placeholder":"请输入距离","paramType":"number","inputType":"number"}}]}}',luaScript:`local _M = {}\r
\r
local geom_engine = require('lib.engine.geom-engine')\r
\r
-- v2-计算产品A到产品B 指定方向面的距离 (eg：A的前面对应B的前面的距离)\r
-- @param partA table 产品A\r
-- @field partA $Part 产品A\r
-- @param partB table 产品B\r
-- @field partB $Part 产品B\r
-- @param direction string 方向 # options:[{"左": "left"}, {"右": "right"}, {"前": "front"}, {"后": "back"}, {"上": "up"}, {"下": "down"}] default:"left"\r
-- @return number 距离\r
-- @note 计算产品A到产品B 指定方向面的距离 (eg：A的前面对应B的前面的距离)\r
function _M.get_part_face_distance_v2(partA, partB, direction)\r
    if partA == nil or partB == nil then\r
        return nil, "产品A或产品B对象不能为空"\r
    end\r
    if type(partA) ~= "table" then\r
        return nil, "产品A对象类型错误"\r
    end\r
    local is_partA = pcall(function()\r
        return partA:is_part()\r
    end)\r
    if not is_partA then\r
        return nil, "产品A对象类型错误"\r
    end\r
    local is_partB = pcall(function()\r
        return partB:is_part()\r
    end)\r
    if not is_partB then\r
        return nil, "产品B对象类型错误"\r
    end\r
    if direction == nil then\r
        return nil, "方向不能为空"\r
    end\r
    if type(direction) ~= "string" then\r
        return nil, "方向类型错误"\r
    end\r
    local partA_ptr = partA:get_ptr()\r
    local partB_ptr = partB:get_ptr()\r
    local distance = geom_engine.get_part_distance(partA_ptr, partB_ptr, direction)\r
    return distance\r
end\r
return _M\r
`,remark:"保留字段",functionStatus:"ENABLED",isGeometry:1,funcClassifyFullPath:null,enableTime:1760585031e3,pos:63,categoryId:-1,isDelete:0,createTime:1760585031e3,modifyTime:1760585164e3,creator:131,creatorName:"11051352",modifier:131,modifierName:"11051352",usageCount:null},{id:"8000007006",funcCode:"get_part_distance_by_reference_part_v2",funcName:"v2 计算产品A到产品B在参考Part的指定方向的距离",funcDesc:`v2 计算产品A到产品B在参考Part的指定方向的距离:
计算partA 到 partB 在参考物品的指定方向上投影的距离 （projectB - projectA） 含负数 正数表示间距`,funcCategory:"JIHE",funcDirectory:"abstract-functions-v2/general",configData:'{"className":"get-part-distance-by-reference-part-v2","path":"abstract-functions-v2/general","funcLuaName":"get_part_distance_by_reference_part_v2","input":{"widgetList":[{"id":"reference_part","type":"input","attributes":{"label":"参考Part","placeholder":"请输入参考Part","disabled":true,"paramType":"table","paramSubType":"{}Part"}},{"id":"partA","type":"input","attributes":{"label":"产品A","placeholder":"请输入产品A","disabled":true,"paramType":"table","paramSubType":"{}Part"}},{"id":"partB","type":"input","attributes":{"label":"产品B","placeholder":"请输入产品B","disabled":true,"paramType":"table","paramSubType":"{}Part"}},{"id":"direction","type":"select","defaultValue":"left","options":[{"label":"左","value":"left","type":"string"},{"label":"右","value":"right","type":"string"},{"label":"前","value":"front","type":"string"},{"label":"后","value":"back","type":"string"},{"label":"上","value":"up","type":"string"},{"label":"下","value":"down","type":"string"}],"attributes":{"label":"方向","placeholder":"请输入方向","paramType":"string"}}]},"output":{"widgetList":[{"type":"inputNumber","attributes":{"label":"距离","placeholder":"请输入距离","paramType":"number","inputType":"number"}}]}}',luaScript:`local _M = {}\r
local geom_engine = require('lib.engine.geom-engine')\r
\r
-- v2-计算产品A到产品B在参考Part的指定方向的距离\r
-- @param reference_part table 参考Part\r
-- @field reference_part $Part 参考Part\r
-- @param partA table 产品A\r
-- @field partA $Part 产品A\r
-- @param partB table 产品B\r
-- @field partB $Part 产品B\r
-- @param direction string 方向 # options:[{"左": "left"}, {"右": "right"}, {"前": "front"}, {"后": "back"}, {"上": "up"}, {"下": "down"}] default:"left"\r
-- @return number 距离\r
\r
function _M.get_part_distance_by_reference_part_v2(reference_part, partA, partB, direction)\r
    if reference_part == nil then\r
        return nil, "参考Part对象不能为空"\r
    end\r
    if type(reference_part) ~= "table" then\r
        return nil, "参考Part对象类型错误"\r
    end\r
    local is_reference_part = pcall(function()\r
        return reference_part:is_part()\r
    end)\r
    if not is_reference_part then\r
        return nil, "参考Part对象类型错误"\r
    end\r
    if partA == nil or partB == nil then\r
        return nil, "产品A或产品B对象不能为空"\r
    end\r
    local is_partA = pcall(function()\r
        return partA:is_part()\r
    end)\r
    if not is_partA then\r
        return nil, "产品A对象类型错误"\r
    end\r
    local is_partB = pcall(function()\r
        return partB:is_part()\r
    end)\r
    if not is_partB then\r
        return nil, "产品B对象类型错误"\r
    end\r
    if direction == nil then\r
        return nil, "方向不能为空"\r
    end\r
    if type(direction) ~= "string" then\r
        return nil, "方向类型错误"\r
    end\r
    local partA_ptr = partA:get_ptr()\r
    local partB_ptr = partB:get_ptr()\r
    local reference_part_ptr = reference_part:get_ptr()\r
    local distance = geom_engine.get_part_distance_by_reference_part(partA_ptr, partB_ptr, reference_part_ptr, direction)\r
    return distance\r
end\r
return _M`,remark:"保留字段",functionStatus:"ENABLED",isGeometry:1,funcClassifyFullPath:null,enableTime:1760581651e3,pos:62,categoryId:-1,isDelete:0,createTime:1760581651e3,modifyTime:1760581767e3,creator:131,creatorName:"11051352",modifier:131,modifierName:"11051352",usageCount:null},{id:23006,funcCode:"ljftest001",funcName:"台面未盖住全部柜体",funcDesc:"当台面未盖住全部柜体时（包括柜体突出导角），需错误提示:台面未完全盖住柜体",funcCategory:"LUOJI",funcDirectory:"",configData:"",luaScript:"",remark:"保留字段",functionStatus:"ENABLED",isGeometry:0,funcClassifyFullPath:null,enableTime:1757639967e3,pos:74,categoryId:-1,isDelete:0,createTime:1757639967e3,modifyTime:1757639967e3,creator:501,creatorName:"ljf001",modifier:501,modifierName:"ljf001",usageCount:null},{id:"8000005007",funcCode:"get_targets_new_v2",funcName:"找对象",funcDesc:"v2 找对象（新），修改了默认输入类型为“string”，支持默认显示为“全场景”数据。",funcCategory:"LUOJI",funcDirectory:"abstract-functions-v2/general",configData:'{"className":"get-targets-new-v2","path":"abstract-functions-v2/general","funcLuaName":"get_targets_new_v2","input":{"widgetList":[{"id":"objects","type":"select","defaultValue":"root","options":[{"label":"全场景","value":"root","type":"string"},{"label":"程序传入","value":"$target","type":"string"}],"attributes":{"label":"产品列表","placeholder":"请输入产品列表","paramType":"string"}},{"id":"product_type","type":"select","defaultValue":"part","options":[{"label":"参数化产品","value":"part","type":"string"},{"label":"非参数化产品","value":"soft","type":"string"}],"attributes":{"label":"产品类型","placeholder":"请输入产品类型","paramType":"string"}},{"id":"expression","type":"function","attributes":{"label":"条件表达式","placeholder":"请输入条件表达式","paramType":"function"}}]},"output":{"widgetList":[{"type":"input","attributes":{"label":"产品列表","placeholder":"请输入产品列表","disabled":true,"paramType":"table","paramSubType":"Part[]"}}]}}',luaScript:`local geom_engine = require('lib.engine.geom-engine')\r
local Scene = require("scene.scene")\r
\r
local _M = {}\r
\r
-- 00? 找对象\r
-- @param objects string 产品列表 # options:[{"全场景": "root"}, {"程序传入": "$target"}] default: "root"\r
-- @param product_type string 产品类型 # options:[{"参数化产品": "part"}, {"非参数化产品": "soft"}] default:"part"\r
-- @param expression function 条件表达式\r
-- @return table 产品列表\r
-- @field return[] $Part Part列表\r
\r
function _M.get_targets_new_v2 (objects, product_type, filter_fun)\r
    -- 入参判空校验\r
    if objects == nil then\r
        return nil, "对象列表(objects参数)不能为空"\r
    end\r
    if product_type == nil then\r
        return nil, "产品类型(product_type参数)不能为空"\r
    end\r
    if type(product_type) ~= "string" then\r
        return nil, "产品类型(product_type参数)类型错误"\r
    end\r
\r
    if filter_fun == nil then\r
        filter_fun = function(product)\r
            return true\r
        end\r
    end\r
    if type(filter_fun) ~= "function" then\r
        return nil, "回调过滤函数(filter_fun参数)类型错误"\r
    end\r
\r
    local objects_list = {}\r
    local scene = Scene.current()\r
    if type(objects) == "string" then\r
        if objects == "root" then --拿全场景\r
            objects_list = scene:get_all_parts()\r
        end\r
    else\r
        if type(objects) ~= "table" then\r
            return nil, "对象列表(objects参数)类型错误"\r
        end\r
\r
        -- 判断objects是否为Part类型 --直接传target进来时命中\r
        local success = pcall(function()\r
            return objects:is_part()\r
        end)\r
        if success then\r
            table.insert(objects_list, objects)\r
        else\r
            for _, object in ipairs(objects) do\r
                -- 判断object是否为Part类型\r
                local success = pcall(function()\r
                    return object:is_part()\r
                end)\r
                if not success then\r
                    return nil, "对象列表(objects参数)类型错误"\r
                end\r
                table.insert(objects_list, object)\r
            end\r
        end\r
    end\r
    local filter_objects = {}\r
    for _, object in ipairs(objects_list) do\r
        local ok, result = pcall(filter_fun, object)  --表达式执行失败则跳过，不返回错误\r
        if ok and result then\r
            table.insert(filter_objects, object)\r
        end\r
    end\r
    return filter_objects\r
end\r
return _M`,remark:"保留字段",functionStatus:"ENABLED",isGeometry:0,funcClassifyFullPath:null,enableTime:1758533528e3,pos:58,categoryId:-1,isDelete:0,createTime:1758533528e3,modifyTime:1759125085e3,creator:131,creatorName:"11051352",modifier:131,modifierName:"11051352",usageCount:null},{id:"8000002018",funcCode:"split_order_bed_product",funcName:"拆单函数: 定制床-榻榻米产品分单",funcDesc:"拆单函数: 定制床-榻榻米产品分单",funcCategory:"LUOJI",funcDirectory:"split-order",configData:'{"className":"split-order-bed-product","path":"split-order","funcLuaName":"split_order_bed_product","input":{"widgetList":[{"id":"context","type":"input","attributes":{"label":"输入上下文","placeholder":"请输入输入上下文","paramType":"any"}},{"id":"distance","type":"inputNumber","attributes":{"label":"判断是否挨着的距离阈值","placeholder":"请输入判断是否挨着的距离阈值","paramType":"number","inputType":"number"}}]},"output":{"widgetList":[{"type":"input","attributes":{"label":"输出上下文","placeholder":"请输入输出上下文","paramType":"any"}}]}}',luaScript:`local Scene = require("scene.scene")\r
local generator_algorithm = require('utils.generator-algorithm')\r
local geom_engine = require('lib.engine.geom-engine')\r
local Part = require("scene.part")\r
local _M = {}\r
\r
-- ============================================================================\r
-- 辅助函数\r
-- ============================================================================\r
\r
-- 按房间ID分组\r
local function group_parts_by_roomId(parts)\r
    local roomId_groups = {}\r
    for _, part in ipairs(parts) do\r
        local roomId = part:get_attribute("roomId") or ""\r
        if not roomId_groups[roomId] then\r
            roomId_groups[roomId] = {}\r
        end\r
        table.insert(roomId_groups[roomId], part)\r
    end\r
\r
    return roomId_groups\r
end\r
\r
-- 创建分组结果项\r
local function create_group_item(group, original_item)\r
    local group_item = {\r
        productIds = {}\r
    }\r
    -- 提取分组中所有parts的ID\r
    for _, part in ipairs(group) do\r
        table.insert(group_item.productIds, part:get_attribute("id"))\r
    end\r
    -- 复制原item的其他属性\r
    for key, value in pairs(original_item) do\r
        if key ~= "productIds" then\r
            group_item[key] = value\r
        end\r
    end\r
    \r
    return group_item\r
end\r
\r
-- ============================================================================\r
-- 主函数\r
-- ============================================================================\r
\r
-- 定制床-榻榻米产品分单函数\r
-- @param context any 输入上下文\r
-- @param distance number 判断是否挨着的距离阈值\r
-- @return any 输出上下文   \r
function _M.split_order_bed_product(context, distance)\r
    -- 入参校验\r
    if context == nil then\r
        return nil, "入参不能为空"\r
    end\r
    if type(context) ~= "table" then\r
        return nil, "入参类型错误"\r
    end\r
    if distance == nil then\r
        return nil, "距离不能为空"\r
    end\r
    if type(distance) ~= "number" then\r
        return nil, "距离类型错误"\r
    end\r
    if #context == 0 then\r
        return context\r
    end\r
    \r
    local scene = Scene.current()\r
    local current_items = context\r
    local result_items = {}\r
    -- 处理每个item\r
    for _, item in ipairs(current_items) do\r
        if item.productIds and #item.productIds > 0 then\r
            -- 获取所有parts\r
            local parts = {}\r
            for _, partId in ipairs(item.productIds) do\r
                local part = scene:get_part_by_id(partId)\r
                if part then\r
                    table.insert(parts, part)\r
                end\r
            end\r
\r
            local line_proCatIds_map = {\r
                ["503"] = true,\r
                ["504"] = true,\r
                ["562"] = true,\r
                ["576"] = true,\r
                ["728"] = true\r
            }\r
            local line_parts = {}\r
            local other_parts = {}\r
            for _, part in ipairs(parts) do\r
                local jdProCatId = part:get_attribute("prodCatId") or ""\r
                if line_proCatIds_map[jdProCatId] then\r
                    table.insert(line_parts, part)\r
                else\r
                    table.insert(other_parts, part)\r
                end\r
            end\r
            local bed_parts = {} -- 床\r
            local bed_screen_parts = {} -- 床屏\r
            local doors = {} -- 趟门门\r
            local tatami_parts = {} -- 榻榻米\r
            local cabinet_parts = {} -- 常规柜体\r
            local material_parts = {} -- 辅料\r
\r
            for _, part in ipairs(other_parts) do\r
                local jdFullCatCode = part:get_attribute("jdFullCatCode")\r
                if string.find(jdFullCatCode, "^GL_GTSJK_BSDZC_C01") then\r
                    table.insert(bed_parts, part)\r
                elseif string.find(jdFullCatCode, "^GL_GTSJK_BSDZC_CP") then\r
                    table.insert(bed_screen_parts, part)\r
                elseif jdFullCatCode == "UNKNOWN" then\r
                    table.insert(doors, part)\r
                elseif string.find(jdFullCatCode, "^GL_GTSJK_GTL_TTM") then\r
                    table.insert(tatami_parts, part)\r
                elseif string.find(jdFullCatCode, "^GL_GTSJK_FL") then\r
                    table.insert(material_parts, part)\r
                else --非以上物品，则认为是常规柜体\r
                    table.insert(cabinet_parts, part) \r
                end\r
            end\r
\r
            -- case_1:\r
            --[[ 床和床屏\r
            1、默认紧靠（上下左右前后留个方向-间距小于10mm)就拆在一起一个单，非紧靠时，床/床屏独立成单。\r
            2、床屏若单独无其他床/床屏紧靠（上下左右前后-间距小于10mm)时，检测是否与【榻榻米】紧靠一起，是则加入“榻榻米”类型产品内一起判断。\r
            ]]\r
            local all_groups = {}\r
            local bed_and_bed_screen_parts = bed_parts\r
            if #bed_screen_parts > 0 then\r
                for _, bed_screen_part in ipairs(bed_screen_parts) do\r
                    table.insert(bed_and_bed_screen_parts, bed_screen_part)\r
                end\r
            end\r
            local bed_and_bed_screen_touch_groups = generator_algorithm.group_parts_by_touch(bed_and_bed_screen_parts, distance)\r
            for _, bed_and_bed_screen_touch_group in ipairs(bed_and_bed_screen_touch_groups) do\r
                if #bed_and_bed_screen_touch_group == 1 then\r
                    local cur_product = bed_and_bed_screen_touch_group[1]\r
                    if cur_product:get_attribute("jdFullCatCode") == "GL_GTSJK_BSDZC_CP" then\r
                        table.insert(tatami_parts, cur_product)\r
                    else\r
                        table.insert(all_groups, bed_and_bed_screen_touch_group)\r
                    end\r
                else\r
                    table.insert(all_groups, bed_and_bed_screen_touch_group)\r
                end\r
            end\r
           \r
            -- case_2:\r
            --[[ 趟门\r
            1、顶级父级趟门没有覆盖柜体时，趟门单独拆一个单；有覆盖柜体时，跟随“其他柜体”拆单规则。\r
            覆盖定义：计算趟门前后距离小于3mm内有柜体是跟随柜体拆分单\r
            ]]\r
            for _, door in ipairs(doors) do\r
                local is_touch_cabinet = false\r
                for _, cabinet in ipairs(cabinet_parts) do\r
                    local is_touch = geom_engine.check_parts_touch(\r
                        door:get_ptr(),\r
                        cabinet:get_ptr(),\r
                        3\r
                    )\r
                    if is_touch then\r
                        is_touch_cabinet = true\r
                        break\r
                    end\r
                end\r
                if is_touch_cabinet then\r
                    table.insert(cabinet_parts, door)\r
                else\r
                    table.insert(all_groups, {door})\r
                end\r
            end\r
\r
            -- case_3:\r
            --[[ 榻榻米\r
            1、收集方案中所有榻榻米产品，紧靠（上下左右前后留个方向-间距小于10mm)的榻榻米产品（包含落单紧靠的床屏产品）分到一个组；\r
            3、若存在前后左右紧靠的其他柜子，柜子高度小于等于当前榻榻米组高度，则加入到同分组。\r
            4、"GL_GTSJK_FL_TTM" / "GL_GTSJK_FL_TTM_%" 辅料，也加入到榻榻米组紧靠逻辑；\r
            ]]\r
            local tatami_and_material_parts = tatami_parts\r
            for _, material_part in ipairs(material_parts) do\r
                local jdFullCatCode = material_part:get_attribute("jdFullCatCode")\r
                if jdFullCatCode == "GL_GTSJK_FL_TTM" or string.find(jdFullCatCode, "^GL_GTSJK_FL_TTM_") then\r
                    table.insert(tatami_and_material_parts, material_part)\r
                end\r
            end\r
            local tatami_touch_groups = generator_algorithm.group_parts_by_touch(tatami_and_material_parts, distance)\r
                        -- 若组中产品只有辅料物品 删除该组\r
            local new_tatami_touch_groups = {}\r
            for tatami_touch_group_index, tatami_touch_group in ipairs(tatami_touch_groups) do\r
                local is_only_material = true\r
                for _, tatami_part in ipairs(tatami_touch_group) do\r
                    local jdFullCatCode = tatami_part:get_attribute("jdFullCatCode")\r
                    if jdFullCatCode ~= "GL_GTSJK_FL" and not string.find(jdFullCatCode, "^GL_GTSJK_FL_") then\r
                        is_only_material = false\r
                        break\r
                    end\r
                end\r
                if not is_only_material then\r
                    table.insert(new_tatami_touch_groups, tatami_touch_group)\r
                end\r
            end\r
            tatami_touch_groups = new_tatami_touch_groups\r
\r
            -- 将紧靠的榻榻米辅料 移除辅料列表\r
            local to_remove_material = {}\r
            local new_material_parts = {}\r
            for material_index, material_part in ipairs(material_parts) do\r
                local material_id = material_part:get_attribute("id")\r
                for tatami_touch_group_index, tatami_touch_group in ipairs(tatami_touch_groups) do\r
                    for _, tatami_part in ipairs(tatami_touch_group) do\r
                        local tatami_id = tatami_part:get_attribute("id")\r
                        if tatami_id == material_id then\r
                            to_remove_material[material_index] = true\r
                            break\r
                        end\r
                    end\r
                end\r
            end\r
            for i, material_part in ipairs(material_parts) do\r
                if not to_remove_material[i] then\r
                    table.insert(new_material_parts, material_part)\r
                end\r
            end\r
            material_parts = new_material_parts\r
            for _, tatami_touch_group in ipairs(tatami_touch_groups) do\r
                local tatami_group_max_z = 0\r
                for _, tatami_part in ipairs(tatami_touch_group) do\r
                    local tatami_part_max_z = geom_engine.get_part_vertex_maxz(tatami_part:get_ptr())\r
                    if tatami_part_max_z > tatami_group_max_z then\r
                        tatami_group_max_z = tatami_part_max_z\r
                    end\r
                end\r
\r
                local to_remove = {}\r
                for cabinet_index, cabinet_part in ipairs(cabinet_parts) do\r
                    local is_in_tatami_group = false\r
                    for _, tatami_part in ipairs(tatami_touch_group) do\r
                        local is_touch = geom_engine.check_parts_touch(\r
                            tatami_part:get_ptr(),\r
                            cabinet_part:get_ptr(),\r
                            distance\r
                        )\r
                        if is_touch then\r
                            local cabinet_part_max_z = geom_engine.get_part_vertex_maxz(cabinet_part:get_ptr())\r
                            if cabinet_part_max_z <= tatami_group_max_z then\r
                                is_in_tatami_group = true\r
                                break\r
                            end\r
                        end\r
                    end\r
                    if is_in_tatami_group then\r
                        table.insert(tatami_touch_group, cabinet_part)\r
                        to_remove[cabinet_index] = true\r
                    end\r
                end\r
\r
                -- 移除已加入的柜子\r
                local new_cabinet_parts = {}\r
                for i, cabinet_part in ipairs(cabinet_parts) do\r
                    if not to_remove[i] then\r
                        table.insert(new_cabinet_parts, cabinet_part)\r
                    end\r
                end\r
                cabinet_parts = new_cabinet_parts\r
\r
            end\r
\r
            -- case_4:\r
            --[[ 常规柜体\r
            1、剩余柜体按紧靠关系分单\r
            2、将分好组的常规柜体，空间id相同的组，取成组后的柜体最大AABB，垂直上下进行投影映射，最大投影面垂直投影有相交的进一步都合并到一组；\r
            3、2025-10-22新增规则：将辅料除榻榻米辅料外的其它辅料 也加入到柜体组紧靠逻辑；\r
            ]]\r
            local cabinet_and_material_parts = cabinet_parts\r
            for _, material_part in ipairs(material_parts) do\r
                local jdFullCatCode = material_part:get_attribute("jdFullCatCode")\r
                if jdFullCatCode ~= "GL_GTSJK_FL_TTM" and not string.find(jdFullCatCode, "^GL_GTSJK_FL_TTM_") then\r
                    table.insert(cabinet_and_material_parts, material_part)\r
                end\r
            end\r
            local cabinet_touch_groups = generator_algorithm.group_parts_by_touch(cabinet_and_material_parts, distance)\r
            -- 若组中产品只有辅料物品 删除该组\r
            local new_cabinet_touch_groups = {}\r
            for cabinet_touch_group_index, cabinet_touch_group in ipairs(cabinet_touch_groups) do\r
                local is_only_material = true\r
                for _, cabinet_part in ipairs(cabinet_touch_group) do\r
                    local jdFullCatCode = cabinet_part:get_attribute("jdFullCatCode")\r
                    if jdFullCatCode ~= "GL_GTSJK_FL" and not string.find(jdFullCatCode, "^GL_GTSJK_FL_") then\r
                        is_only_material = false\r
                        break\r
                    end\r
                end\r
                if not is_only_material then\r
                    table.insert(new_cabinet_touch_groups, cabinet_touch_group)\r
                end\r
            end\r
            cabinet_touch_groups = new_cabinet_touch_groups\r
            -- 将紧靠的其它辅料 移除辅料列表\r
            to_remove_material = {}\r
            new_material_parts = {}\r
            for material_index, material_part in ipairs(material_parts) do\r
                local material_id = material_part:get_attribute("id")\r
                for cabinet_touch_group_index, cabinet_touch_group in ipairs(cabinet_touch_groups) do\r
                    for _, cabinet_part in ipairs(cabinet_touch_group) do\r
                        local cabinet_id = cabinet_part:get_attribute("id")\r
                        if cabinet_id == material_id then\r
                            to_remove_material[material_index] = true\r
                            break\r
                        end\r
                    end\r
                end\r
            end\r
            for i, material_part in ipairs(material_parts) do\r
                if not to_remove_material[i] then\r
                    table.insert(new_material_parts, material_part)\r
                end\r
            end\r
            material_parts = new_material_parts\r
            -- 按空间Id分组\r
            local cabinet_touch_and_roomId_groups = {}\r
            for _, cabinet_group in ipairs(cabinet_touch_groups) do\r
                local group_roomId = ""\r
                for _, cabinet_part in ipairs(cabinet_group) do\r
                    local cur_roomId = cabinet_part:get_attribute("roomId") or ""\r
                    if cur_roomId  and cur_roomId ~= "" then\r
                        group_roomId = cur_roomId\r
                        break\r
                    end\r
                end\r
                if group_roomId ~= "" then\r
                    if not cabinet_touch_and_roomId_groups[group_roomId] then\r
                        cabinet_touch_and_roomId_groups[group_roomId] = {}\r
                    end\r
                    table.insert(cabinet_touch_and_roomId_groups[group_roomId], cabinet_group)\r
                end\r
            end\r
            -- 同空间id 进行2D投影合并\r
            local merge_cabinet_touch_groups = {}\r
            for group_roomId, cur_cabinet_touch_groups in pairs(cabinet_touch_and_roomId_groups) do\r
                local groups_groups = generator_algorithm.group_groups_by_2d_overlap(cur_cabinet_touch_groups)\r
                for _, groups_group in ipairs(groups_groups) do\r
                    local cur_group = {}  -- 将2D投影重合的组 合并成一个组\r
                    for _, group in ipairs(groups_group) do\r
                        for _, cabinet_part in ipairs(group) do\r
                            table.insert(cur_group, cabinet_part)\r
                        end\r
                    end\r
                    table.insert(merge_cabinet_touch_groups, cur_group)\r
                end\r
            end\r
            -- 直接替换cabinet_touch_groups\r
            cabinet_touch_groups = merge_cabinet_touch_groups\r
\r
            -- case_5:\r
            --[[ 辅料需求描述：\r
                （按照新的规则处理，原判断条件5内容不执行）\r
                1.相关辅料、装饰线灯产品，默认按照距离最近且在1000mm以内的柜体一个组，以辅料自身的BOX尺寸在左右前后4个方向查找已划分组的组合级，距离最近的合并一组，若这类物品同时紧靠了柜体组和榻榻米组，则优先跟随柜体组。；\r
                2.不符合前面规则的辅料等产品，按照模型中心点找到距离最近的墙，同一面墙的辅料合并一个单；\r
                沟通后实现逻辑：\r
                1、辅料中心点 是否在柜体组AABB内，是则加入柜体组; ps：加入但不扩展柜体组AABB\r
                2、辅料中心点 离柜体组AABB边缘距离小于1000mm，则加入柜体组; ps：加入但不扩展柜体组AABB\r
                3、辅料中心点 是否在榻榻米组AABB内，是则加入榻榻米组; ps：加入但不扩展柜体组AABB\r
                4、辅料中心点 离榻榻米组AABB边缘距离小于1000mm，则加入榻榻米组; ps：加入但不扩展柜体组AABB\r
                5、辅料中心点 找到距离最近的墙，同一面墙的辅料合并一个单;\r
                6、"GL_GTSJK_GTL_FL_TTM" / "GL_GTSJK_GTL_FL_TTM_%" 辅料，优先加入榻榻米组；\r
            ]]\r
            local to_remove_material = {}\r
            local insert_map = {}\r
            -- 优先加入榻榻米组的辅料\r
            for material_index, material_part in ipairs(material_parts) do\r
                local jdFullCatCode = material_part:get_attribute("jdFullCatCode")\r
                if jdFullCatCode == "GL_GTSJK_FL_TTM" or string.find(jdFullCatCode, "^GL_GTSJK_FL_TTM_") then\r
                    local material_center_point = material_part:get_center_point()\r
                    local min_distance = math.huge\r
                    local min_distance_tatami_group_index = nil\r
                    for tatami_group_index, tatami_group in ipairs(tatami_touch_groups) do\r
                        -- 同空间才进行合并\r
                        local tatami_group_roomId = tatami_group[1]:get_attribute("roomId")\r
                        if tatami_group_roomId ~= material_part:get_attribute("roomId") then\r
                            goto continue\r
                        end\r
                        local tatami_group_aabb = generator_algorithm.get_parts_aabb(tatami_group)\r
                        local aabb_distance = generator_algorithm.get_point_distance_to_aabb_2d_border(material_center_point, tatami_group_aabb)\r
                        if aabb_distance < min_distance then\r
                            min_distance = aabb_distance\r
                            min_distance_tatami_group_index = tatami_group_index\r
                        end\r
                        ::continue::\r
                    end\r
                    if min_distance < 1000 then\r
                        -- table.insert(tatami_touch_groups[min_distance_tatami_group_index], material_part)\r
                        if not insert_map[min_distance_tatami_group_index] then\r
                            insert_map[min_distance_tatami_group_index] = {}\r
                        end\r
                        table.insert(insert_map[min_distance_tatami_group_index], material_index)\r
                        to_remove_material[material_index] = true\r
                    end\r
                end\r
            end           \r
            -- 移除已加入榻榻米组的辅料\r
            local new_material_parts = {}\r
            for i, material_part in ipairs(material_parts) do\r
                if not to_remove_material[i] then\r
                    table.insert(new_material_parts, material_part)\r
                end\r
            end\r
            for min_distance_tatami_group_index, material_index_list in pairs(insert_map) do\r
                for _, material_index in ipairs(material_index_list) do\r
                    table.insert(tatami_touch_groups[min_distance_tatami_group_index], material_parts[material_index])\r
                end\r
            end\r
            material_parts = new_material_parts\r
            \r
            -- 辅料加入柜体组\r
            to_remove_material = {}\r
            insert_map = {}\r
            for material_index, material_part in ipairs(material_parts) do\r
                local material_center_point = material_part:get_center_point()\r
                local min_distance = math.huge\r
                local min_distance_cabinet_group_index = nil\r
                for cabinet_group_index, cabinet_group in ipairs(cabinet_touch_groups) do\r
                    -- 同空间才进行合并\r
                    local cabinet_group_roomId = cabinet_group[1]:get_attribute("roomId")\r
                    if cabinet_group_roomId ~= material_part:get_attribute("roomId") then\r
                        goto continue\r
                    end\r
                    local cabinet_group_aabb = generator_algorithm.get_parts_aabb(cabinet_group)\r
                    local aabb_distance = generator_algorithm.get_point_distance_to_aabb_2d_border(material_center_point, cabinet_group_aabb)\r
                    if aabb_distance < min_distance then\r
                        min_distance = aabb_distance\r
                        min_distance_cabinet_group_index = cabinet_group_index\r
                    end\r
                    ::continue::\r
                end\r
                if min_distance < 1000 then\r
                    -- table.insert(cabinet_touch_groups[min_distance_cabinet_group_index], material_part)\r
                    if not insert_map[min_distance_cabinet_group_index] then\r
                        insert_map[min_distance_cabinet_group_index] = {}\r
                    end\r
                    table.insert(insert_map[min_distance_cabinet_group_index], material_index)\r
                    to_remove_material[material_index] = true\r
                end\r
            end\r
            -- 移除已加入柜体组的辅料\r
            local new_material_parts = {}\r
            for i, material_part in ipairs(material_parts) do\r
                if not to_remove_material[i] then\r
                    table.insert(new_material_parts, material_part)\r
                end\r
            end\r
            for min_distance_cabinet_group_index, material_index_list in pairs(insert_map) do\r
                for _, material_index in ipairs(material_index_list) do\r
                    table.insert(cabinet_touch_groups[min_distance_cabinet_group_index], material_parts[material_index])\r
                end\r
            end\r
            material_parts = new_material_parts\r
\r
            --辅料加入榻榻米组\r
            to_remove_material = {}\r
            insert_map = {}\r
            for material_index, material_part in ipairs(material_parts) do\r
                local material_center_point = material_part:get_center_point()\r
                local min_distance = math.huge\r
                local min_distance_tatami_group_index = nil \r
                for tatami_group_index, tatami_group in ipairs(tatami_touch_groups) do\r
                    -- 同空间才进行合并\r
                    local tatami_group_roomId = tatami_group[1]:get_attribute("roomId")\r
                    if tatami_group_roomId ~= material_part:get_attribute("roomId") then\r
                        goto continue\r
                    end\r
                    local tatami_group_aabb = generator_algorithm.get_parts_aabb(tatami_group)\r
                    local aabb_distance = generator_algorithm.get_point_distance_to_aabb_2d_border(material_center_point, tatami_group_aabb)\r
                    if aabb_distance < min_distance then\r
                        min_distance = aabb_distance\r
                        min_distance_tatami_group_index = tatami_group_index\r
                    end\r
                    ::continue::\r
                end\r
                if min_distance < 1000 then\r
                    -- table.insert(tatami_touch_groups[min_distance_tatami_group_index], material_part) -- 加入但不扩展榻榻米组AABB\r
                    if not insert_map[min_distance_tatami_group_index] then\r
                        insert_map[min_distance_tatami_group_index] = {}\r
                    end\r
                    table.insert(insert_map[min_distance_tatami_group_index], material_index)\r
                    to_remove_material[material_index] = true\r
                end\r
            end\r
\r
            -- 移除已加入榻榻米组的辅料\r
             new_material_parts = {}\r
            for i, material_part in ipairs(material_parts) do\r
                if not to_remove_material[i] then\r
                    table.insert(new_material_parts, material_part)\r
                end\r
            end\r
            for min_distance_tatami_group_index, material_index_list in pairs(insert_map) do\r
                for _, material_index in ipairs(material_index_list) do\r
                    table.insert(tatami_touch_groups[min_distance_tatami_group_index], material_parts[material_index])\r
                end\r
            end\r
            material_parts = new_material_parts\r
\r
\r
            -- 剩余辅料先按空间分组，再按距离最近的墙分组\r
            local material_roomId_groups = group_parts_by_roomId(material_parts)\r
            for roomId, material_group in pairs(material_roomId_groups) do\r
                local material_group_ptr = {}\r
                for _, material_part in ipairs(material_group) do\r
                    table.insert(material_group_ptr, material_part:get_ptr())\r
                end\r
                local material_touch_ptr_groups = geom_engine.group_parts_by_room_outline(material_group_ptr, scene:get_ptr(), roomId)\r
                for _, material_touch_ptr_group in ipairs(material_touch_ptr_groups) do\r
                    local material_touch_group = {}\r
                    for _, material_part_ptr in ipairs(material_touch_ptr_group) do\r
                        local material_part = Part.new(material_part_ptr)\r
                        if material_part then\r
                            table.insert(material_touch_group, material_part)\r
                        end\r
                    end\r
                    table.insert(all_groups, material_touch_group)\r
                end\r
            end\r
\r
            -- 将榻榻米组和柜体组放入所以组中\r
            for _, tatami_group in ipairs(tatami_touch_groups) do\r
                table.insert(all_groups, tatami_group)\r
            end\r
\r
            -- 将线条产品按空间Id加入到柜体组中，无相同空间Id时，则剩余线条产品按空间Id独立成组\r
            local have_merge_line_parts = {}\r
            for _, cabinet_group in ipairs(cabinet_touch_groups) do\r
                --获取当前组空间Id 顺序取\r
                local group_roomId = "group_roomId_default"\r
                for _, cabinet_part in ipairs(cabinet_group) do\r
                    local cur_roomId = cabinet_part:get_attribute("roomId")\r
                    if cur_roomId then\r
                        group_roomId = cur_roomId\r
                        break\r
                    end\r
                end\r
                for line_part_index, line_part in ipairs(line_parts) do\r
                    local line_roomId = line_part:get_attribute("roomId") or "line_roomId_default"\r
                    if line_roomId == group_roomId then\r
                        table.insert(cabinet_group, line_part)\r
                        table.insert(have_merge_line_parts, line_part_index)\r
                    end\r
                end\r
                table.insert(all_groups, cabinet_group)\r
            end\r
            local no_merge_line_parts = {}\r
            for line_part_index, line_part in ipairs(line_parts) do\r
                if not have_merge_line_parts[line_part_index] then\r
                    table.insert(no_merge_line_parts, line_part)\r
                end\r
            end\r
            -- 按空间Id分组\r
            local line_roomId_groups = {}   -- 线条产品空间Id分组\r
            for _, line_part in ipairs(no_merge_line_parts) do\r
                local line_roomId = line_part:get_attribute("roomId") or "line_roomId_default"\r
                if not line_roomId_groups[line_roomId] then\r
                    line_roomId_groups[line_roomId] = {}\r
                end\r
                table.insert(line_roomId_groups[line_roomId], line_part)\r
            end\r
            for line_roomId, group in pairs(line_roomId_groups) do\r
                table.insert(all_groups, group)\r
            end\r
\r
            -- 生成最终结果\r
            for _, group in ipairs(all_groups) do\r
                local group_item = create_group_item(group, item)\r
                table.insert(result_items, group_item)\r
            end\r
        end\r
    end\r
    return result_items\r
end\r
\r
return _M\r
        `,remark:"保留字段",functionStatus:"ENABLED",isGeometry:0,funcClassifyFullPath:null,enableTime:1755844697e3,pos:51,categoryId:-1,isDelete:0,createTime:1755844697e3,modifyTime:1761554822e3,creator:131,creatorName:"11051352",modifier:131,modifierName:"11051352",usageCount:null},{id:"8000002012",funcCode:"split_order_set_order_type",funcName:"拆单函数: 拆单设置订单类型",funcDesc:"拆单设置订单类型",funcCategory:"LUOJI",funcDirectory:"split-order",configData:'{"className":"split-order-set-order-type","path":"split-order","funcLuaName":"split_order_set_order_type","input":{"widgetList":[{"id":"context","type":"input","attributes":{"label":"输入上下文","placeholder":"请输入输入上下文","paramType":"any"}},{"id":"draftOrderType","type":"input","attributes":{"label":"草稿单方案对应订单类型","placeholder":"请输入草稿单方案对应订单类型","paramType":"string"}},{"id":"businessOrderType","type":"input","attributes":{"label":"商机单方案对应订单类型","placeholder":"请输入商机单方案对应订单类型","paramType":"string"}},{"id":"overseasOrderType","type":"input","attributes":{"label":"海外单方案对应订单类型","placeholder":"请输入海外单方案对应订单类型","paramType":"string"}},{"id":"sampleOrderType","type":"input","attributes":{"label":"样板单方案对应订单类型","placeholder":"请输入样板单方案对应订单类型","paramType":"string"}},{"id":"projectOrderType","type":"input","attributes":{"label":"工程单方案对应订单类型","placeholder":"请输入工程单方案对应订单类型","paramType":"string"}},{"id":"internalOrderType","type":"input","attributes":{"label":"内部单方案对应订单类型","placeholder":"请输入内部单方案对应订单类型","paramType":"string"}}]},"output":{"widgetList":[{"type":"input","attributes":{"label":"输出上下文","placeholder":"请输入输出上下文","paramType":"any"}}]}}',luaScript:`local Scene = require("scene.scene")\r
local _M = {}\r
\r
-- 设置订单类型\r
\r
-- @param context any 输入上下文\r
-- @param draftOrderType string 草稿单方案对应订单类型\r
-- @param businessOrderType string 商机单方案对应订单类型\r
-- @param overseasOrderType string 海外单方案对应订单类型\r
-- @param sampleOrderType string 样板单方案对应订单类型\r
-- @param projectOrderType string 工程单方案对应订单类型\r
-- @param internalOrderType string 内部单方案对应订单类型\r
\r
\r
-- @return any 输出上下文\r
\r
function _M.split_order_set_order_type(context, draftOrderType, businessOrderType, overseasOrderType, sampleOrderType, projectOrderType, internalOrderType)\r
    --入参校验\r
    if context == nil then\r
        return nil, "入参不能为空"\r
    end\r
    if type(context) ~= "table" then\r
        return nil, "入参类型错误"\r
    end\r
    if #context == 0 then\r
        return context\r
    end\r
\r
    if draftOrderType == nil then\r
        return nil, "草稿单方案对应订单类型不能为空"\r
    end\r
    if type(draftOrderType) ~= "string" then\r
        return nil, "草稿单方案对应订单类型类型错误"\r
    end\r
    if businessOrderType == nil then\r
        return nil, "商机单方案对应订单类型不能为空"\r
    end\r
    if type(businessOrderType) ~= "string" then\r
        return nil, "商机单方案对应订单类型类型错误"\r
    end\r
    if overseasOrderType == nil then\r
        return nil, "海外单方案对应订单类型不能为空"\r
    end\r
    if type(overseasOrderType) ~= "string" then\r
        return nil, "海外单方案对应订单类型类型错误"\r
    end\r
    if sampleOrderType == nil then\r
        return nil, "样板单方案对应订单类型不能为空"\r
    end\r
    if type(sampleOrderType) ~= "string" then\r
        return nil, "样板单方案对应订单类型类型错误"\r
    end\r
    if projectOrderType == nil then\r
        return nil, "工程单方案对应订单类型不能为空"\r
    end\r
    if type(projectOrderType) ~= "string" then\r
        return nil, "工程单方案对应订单类型类型错误"\r
    end\r
    if internalOrderType == nil then\r
        return nil, "内部单方案对应订单类型不能为空"\r
    end\r
    if type(internalOrderType) ~= "string" then\r
        return nil, "内部单方案对应订单类型类型错误"\r
    end\r
\r
    local orderTypeMap = {\r
        ["0"] = draftOrderType,\r
        ["1"] = businessOrderType,\r
        ["2"] = overseasOrderType,\r
        ["3"] = sampleOrderType,\r
        ["4"] = projectOrderType,\r
        ["5"] = internalOrderType\r
    }\r
\r
    local scene = Scene.current()\r
    local current_items = context --拆单规则上下文\r
    local result_items = {} -- 最终的子方案集合\r
    for _, item in ipairs(current_items) do\r
        local orderTypeVal = tostring(item.orderType)\r
        local orderTypeName = orderTypeMap[orderTypeVal] or ""\r
        local specialOrder = item.specialOrder or false\r
        for _, partId in ipairs(item.productIds) do\r
            local part = scene:get_part_by_id(partId)\r
            if part then\r
                local specialOrderVal = part:get_attribute("TSDD") or "0"\r
                if specialOrderVal == "1" then\r
                    specialOrder = true\r
                    break\r
                end\r
            end\r
        end\r
        local group_item = {\r
            brand = item.brand or "",\r
            channel = item.channel or "",\r
            catChoice = item.catChoice or "",\r
            orderType = orderTypeName or "",\r
            specialOrder = specialOrder,\r
            splitOrderDataType = item.splitOrderDataType,\r
            splitEngine = item.splitEngine or "1",\r
            productIds = item.productIds or {},\r
            success = item.success or false,\r
            errorMsg = item.errorMsg or ""\r
        }\r
        table.insert(result_items, group_item)\r
\r
    end\r
    return result_items\r
end\r
\r
return _M`,remark:"保留字段",functionStatus:"ENABLED",isGeometry:0,funcClassifyFullPath:null,enableTime:175550689e4,pos:45,categoryId:-1,isDelete:0,createTime:175550689e4,modifyTime:1757903667e3,creator:131,creatorName:"11051352",modifier:131,modifierName:"11051352",usageCount:null},{id:"8000000008",funcCode:"split_order_single",funcName:"拆单函数: 按个拆单",funcDesc:"按个拆单：一个产品一个单",funcCategory:"LUOJI",funcDirectory:"split-order",configData:'{"className":"split-order-single","path":"split-order","funcLuaName":"split_order_single","input":{"widgetList":[{"id":"context","type":"input","attributes":{"label":"输入上下文","placeholder":"请输入输入上下文","paramType":"any"}}]},"output":{"widgetList":[{"type":"input","attributes":{"label":"输出上下文","placeholder":"请输入输出上下文","paramType":"any"}}]}}',luaScript:`local Scene = require("scene.scene")\r
local _M = {}\r
\r
-- 一个产品一个子方案\r
\r
-- @param context any 输入上下文\r
-- @return any 输出上下文\r
function _M.split_order_single(context)\r
    --入参校验\r
    if context == nil then\r
        return nil, "入参不能为空"\r
    end\r
    if type(context) ~= "table" then\r
        return nil, "入参类型错误"\r
    end\r
    if #context == 0 then\r
        return context\r
    end\r
    local scene = Scene.current()\r
    local current_items = context --拆单规则上下文\r
    local result_items = {} -- 最终的子方案集合\r
    for _, item in ipairs(current_items) do\r
        if item.productIds and #item.productIds > 0 then\r
            -- 一个产品一个子方案\r
            for _, partId in ipairs(item.productIds) do\r
                local part = scene:get_part_by_id(partId)\r
                if part then\r
                    local group_item = {\r
                        brand = item.brand or "",\r
                        channel = item.channel or "",\r
                        catChoice = item.catChoice or "",\r
                        orderType = item.orderType or "",\r
                        specialOrder = item.specialOrder or false,\r
                        splitOrderDataType = item.splitOrderDataType,\r
                        splitEngine = item.splitEngine or "1",\r
                        productIds = { partId },\r
                        success = item.success or false,\r
                        errorMsg = item.errorMsg or ""\r
                    }\r
                    table.insert(result_items, group_item)\r
                end\r
            end\r
        end\r
    end\r
    return result_items\r
end\r
\r
return _M`,remark:"保留字段",functionStatus:"ENABLED",isGeometry:0,funcClassifyFullPath:null,enableTime:1753703462e3,pos:38,categoryId:-1,isDelete:0,createTime:1753703462e3,modifyTime:1757490248e3,creator:131,creatorName:"11051352",modifier:131,modifierName:"11051352",usageCount:null},{id:"8000002010",funcCode:"split_order_by_roomId_and_touch",funcName:"拆单函数: 按房间ID与是否挨着拆单",funcDesc:"按房间ID与是否挨着拆单",funcCategory:"JIHE",funcDirectory:"split-order",configData:'{"className":"split-order-by-roomId-and-touch","path":"split-order","funcLuaName":"split_order_by_roomId_and_touch","input":{"widgetList":[{"id":"context","type":"input","attributes":{"label":"输入上下文","placeholder":"请输入输入上下文","paramType":"any"}},{"id":"distance","type":"inputNumber","attributes":{"label":"判断是否挨着的距离阈值","placeholder":"请输入判断是否挨着的距离阈值","paramType":"number","inputType":"number"}}]},"output":{"widgetList":[{"type":"input","attributes":{"label":"输出上下文","placeholder":"请输入输出上下文","paramType":"any"}}]}}',luaScript:`local Scene = require("scene.scene")\r
local geom_engine = require('lib.engine.geom-engine')\r
local _M = {}\r
\r
-- ============================================================================\r
-- 辅助函数\r
-- ============================================================================\r
\r
-- 合并两个分组\r
local function merge_groups(groups, group1_index, group2_index)\r
    if group1_index == group2_index then\r
        return\r
    end\r
    -- 将group2的所有parts添加到group1中\r
    for _, part in ipairs(groups[group2_index]) do\r
        table.insert(groups[group1_index], part)\r
    end\r
    -- 删除group2\r
    table.remove(groups, group2_index)\r
end\r
\r
-- 按是否挨着进行分组\r
local function group_parts_by_touch(parts, distance)\r
    local groups = {}\r
    for _, part in ipairs(parts) do\r
        local connected_groups = {}\r
        -- 检查当前part与已有分组的连接关系\r
        for group_index, group in ipairs(groups) do\r
            for _, group_part in ipairs(group) do\r
                local is_touch = geom_engine.check_parts_touch(\r
                    part:get_ptr(),\r
                    group_part:get_ptr(),\r
                    distance\r
                )\r
                if is_touch then\r
                    table.insert(connected_groups, group_index)\r
                    break\r
                end\r
            end\r
        end\r
\r
        -- 处理连接的分组\r
        if #connected_groups > 0 then\r
            -- 将当前part添加到第一个连接的分组\r
            table.insert(groups[connected_groups[1]], part)\r
\r
            -- 合并所有连接的分组\r
            for i = #connected_groups, 2, -1 do\r
                merge_groups(groups, connected_groups[1], connected_groups[i])\r
            end\r
        else\r
            -- 创建新的分组\r
            table.insert(groups, {part})\r
        end\r
    end\r
    \r
    return groups\r
end\r
\r
-- 获取分组中数量最多的roomId\r
local function get_dominant_room_id(group)\r
    local roomId_count = {}\r
    -- 统计每个roomId的数量\r
    for _, part in ipairs(group) do\r
        local roomId = part:get_attribute("roomId")\r
        if roomId == nil or roomId == "" then\r
            roomId = "其他"\r
        end\r
        if not roomId_count[roomId] then\r
            roomId_count[roomId] = 0\r
        end\r
        roomId_count[roomId] = roomId_count[roomId] + 1\r
    end\r
    -- 找到数量最多的roomId\r
    local max_roomId = nil\r
    local max_count = 0\r
    for roomId, count in pairs(roomId_count) do\r
        if count > max_count then\r
            max_count = count\r
            max_roomId = roomId\r
        end\r
    end\r
    \r
    return max_roomId\r
end\r
\r
-- 按roomId对touch分组进行进一步分组\r
local function group_by_room_id(touch_groups)\r
    local roomId_groups = {}\r
\r
    for _, group in ipairs(touch_groups) do\r
        local dominant_room_id = get_dominant_room_id(group)\r
\r
        if dominant_room_id then\r
            if not roomId_groups[dominant_room_id] then\r
                roomId_groups[dominant_room_id] = {}\r
            end\r
\r
            -- 将group中的所有parts添加到对应的roomId分组\r
            for _, part in ipairs(group) do\r
                table.insert(roomId_groups[dominant_room_id], part)\r
            end\r
        end\r
    end\r
    \r
    return roomId_groups\r
end\r
\r
-- 创建分组结果项\r
local function create_group_item(group, original_item)\r
    local group_item = {\r
        productIds = {}\r
    }\r
    -- 提取分组中所有parts的ID\r
    for _, part in ipairs(group) do\r
        table.insert(group_item.productIds, part:get_attribute("id"))\r
    end\r
    -- 复制原item的其他属性\r
    for key, value in pairs(original_item) do\r
        if key ~= "productIds" then\r
            group_item[key] = value\r
        end\r
    end\r
    \r
    return group_item\r
end\r
\r
-- ============================================================================\r
-- 主函数\r
-- ============================================================================\r
\r
-- 按房间ID与是否挨着拆单\r
-- @param context any 输入上下文\r
-- @param distance number 判断是否挨着的距离阈值\r
-- @return any 输出上下文   \r
function _M.split_order_by_roomId_and_touch(context, distance)\r
    -- 入参校验\r
    if context == nil then\r
        return nil, "入参不能为空"\r
    end\r
    if type(context) ~= "table" then\r
        return nil, "入参类型错误"\r
    end\r
    if distance == nil then\r
        return nil, "距离不能为空"\r
    end\r
    if type(distance) ~= "number" then\r
        return nil, "距离类型错误"\r
    end\r
    if #context == 0 then\r
        return context\r
    end\r
    \r
    local scene = Scene.current()\r
    local current_items = context\r
    local result_items = {}\r
    -- 处理每个item\r
    for _, item in ipairs(current_items) do\r
        if item.productIds and #item.productIds > 0 then\r
            -- 获取所有parts\r
            local parts = {}\r
            for _, partId in ipairs(item.productIds) do\r
                local part = scene:get_part_by_id(partId)\r
                if part then\r
                    table.insert(parts, part)\r
                end\r
            end\r
            local line_proCatIds_map = {\r
                ["503"] = true,\r
                ["504"] = true,\r
                ["562"] = true,\r
                ["576"] = true,\r
                ["728"] = true\r
            }\r
            local line_parts = {}\r
            local other_parts = {}\r
            for _, part in ipairs(parts) do\r
                local jdProCatId = part:get_attribute("prodCatId") or ""\r
                if line_proCatIds_map[jdProCatId] then\r
                    table.insert(line_parts, part)\r
                else\r
                    table.insert(other_parts, part)\r
                end\r
            end\r
            -- 按是否挨着进行分组\r
            local touch_groups = group_parts_by_touch(other_parts, distance)\r
\r
            -- 按roomId进一步分组\r
            local roomId_groups = group_by_room_id(touch_groups)\r
\r
            -- 生成最终结果\r
            local have_merge_line_parts = {}\r
            for roomId, group in pairs(roomId_groups) do\r
                -- 插入空间Id相同的线条产品到当前分组\r
                for line_part_index, line_part in ipairs(line_parts) do\r
                    local line_roomId = line_part:get_attribute("roomId") or ""\r
                    if line_roomId == roomId then\r
                        table.insert(group, line_part)\r
                        table.insert(have_merge_line_parts, line_part_index)\r
                    end\r
                end\r
                local group_item = create_group_item(group, item)\r
                table.insert(result_items, group_item)\r
            end\r
            local no_merge_line_parts = {}\r
            for line_part_index, line_part in ipairs(line_parts) do\r
                if not have_merge_line_parts[line_part_index] then\r
                    table.insert(no_merge_line_parts, line_part)\r
                end\r
            end\r
            -- 按空间Id分组\r
            local line_roomId_groups = {}\r
            for _, line_part in ipairs(no_merge_line_parts) do\r
                local line_roomId = line_part:get_attribute("roomId") or ""\r
                if not line_roomId_groups[line_roomId] then\r
                    line_roomId_groups[line_roomId] = {}\r
                end\r
                table.insert(line_roomId_groups[line_roomId], line_part)\r
            end\r
            for line_roomId, group in pairs(line_roomId_groups) do\r
                local group_item = create_group_item(group, item)\r
                table.insert(result_items, group_item)\r
            end\r
        end\r
    end\r
    \r
    return result_items\r
end\r
\r
return _M`,remark:"保留字段",functionStatus:"ENABLED",isGeometry:1,funcClassifyFullPath:null,enableTime:1755330843e3,pos:43,categoryId:-1,isDelete:0,createTime:1755330843e3,modifyTime:1757490224e3,creator:131,creatorName:"11051352",modifier:131,modifierName:"11051352",usageCount:null},{id:"8000000009",funcCode:"split_order_by_roomId",funcName:"拆单函数: 按空间Id拆单",funcDesc:"按空间Id拆单",funcCategory:"LUOJI",funcDirectory:"split-order",configData:'{"className":"split-order-by-roomId","path":"split-order","funcLuaName":"split_order_by_roomId","input":{"widgetList":[{"id":"context","type":"input","attributes":{"label":"输入上下文","placeholder":"请输入输入上下文","paramType":"any"}}]},"output":{"widgetList":[{"type":"input","attributes":{"label":"输出上下文","placeholder":"请输入输出上下文","paramType":"any"}}]}}',luaScript:`local Scene = require("scene.scene")\r
local _M = {}\r
\r
-- 按房间ID拆分子方案\r
\r
-- @param context any 输入上下文\r
-- @return any 输出上下文\r
\r
\r
\r
function _M.split_order_by_roomId(context)\r
    --入参校验\r
    if context == nil then\r
        return nil, "入参不能为空"\r
    end\r
    if type(context) ~= "table" then\r
        return nil, "入参类型错误"\r
    end\r
    if #context == 0 then\r
        return context\r
    end\r
    local scene = Scene.current()\r
    local current_items = context --拆单规则上下文\r
    local result_items = {} -- 最终的子方案集合\r
    for _, item in ipairs(current_items) do\r
        if item.productIds and #item.productIds > 0 then\r
            -- 按房间ID分组\r
            local groups = {}\r
            for _, partId in ipairs(item.productIds) do\r
                local part = scene:get_part_by_id(partId)\r
                if part then\r
                    -- 获取产品属性\r
                    local roomId = part:get_attribute("roomId") or ""\r
                    -- 创建分组键（房间ID）\r
                    local group_key = roomId\r
                    -- 如果该分组还没有创建，创建新分组\r
                    if not groups[group_key] then\r
                        groups[group_key] = {\r
                            brand = item.brand or "",\r
                            channel = item.channel or "",\r
                            catChoice = item.catChoice or "",\r
                            orderType = item.orderType or "",\r
                            splitEngine = item.splitEngine or "1",\r
                            specialOrder = item.specialOrder or false,\r
                            splitOrderDataType = item.splitOrderDataType,\r
                            productIds = {},\r
                            success = item.success or false,\r
                            errorMsg = item.errorMsg or ""\r
                        }\r
                    end\r
                    -- 将产品ID添加到对应分组\r
                    table.insert(groups[group_key].productIds, partId)\r
                end\r
            end\r
            -- 将分组后的子方案添加到结果集合\r
            for _, group_item in pairs(groups) do\r
                if #group_item.productIds > 0 then\r
                    table.insert(result_items, group_item)\r
                end\r
            end\r
        end\r
    end\r
    return result_items\r
end\r
\r
return _M`,remark:"保留字段",functionStatus:"ENABLED",isGeometry:0,funcClassifyFullPath:null,enableTime:1753703544e3,pos:39,categoryId:-1,isDelete:0,createTime:1753703544e3,modifyTime:1757490218e3,creator:131,creatorName:"11051352",modifier:131,modifierName:"11051352",usageCount:null},{id:"8000002011",funcCode:"split_order_by_texture",funcName:"拆单函数: 按花色分组拆单",funcDesc:"按花色分组拆单",funcCategory:"LUOJI",funcDirectory:"split-order",configData:'{"className":"split-order-by-texture","path":"split-order","funcLuaName":"split_order_by_texture","input":{"widgetList":[{"id":"context","type":"input","attributes":{"label":"输入上下文","placeholder":"请输入输入上下文","paramType":"any"}}]},"output":{"widgetList":[{"type":"input","attributes":{"label":"输出上下文","placeholder":"请输入输出上下文","paramType":"any"}}]}}',luaScript:`local Scene = require("scene.scene")\r
local _M = {}\r
\r
-- 按花色分组拆单\r
\r
local texture_group_map = {\r
    paint = "油漆",\r
    noPaint = "免漆",\r
    other = "其他",\r
}\r
\r
-- @param context any 输入上下文\r
-- @return any 输出上下文\r
\r
function _M.split_order_by_texture(context)\r
    --入参校验\r
    if context == nil then\r
        return nil, "入参不能为空"\r
    end\r
    if type(context) ~= "table" then\r
        return nil, "入参类型错误"\r
    end\r
    if #context == 0 then\r
        return context\r
    end\r
    local scene = Scene.current()\r
    local current_items = context --拆单规则上下文\r
    local result_items = {} -- 最终的子方案集合\r
    -- 使用哈希表优化查找性能\r
    local Paint_Set = {\r
        mattePaint = true, UV1 = true, UV = true, enamel1 = true,\r
        veneer = true, enamel = true, EB = true, veneer1 = true\r
    }\r
    local NoPaint_Set = {\r
        nonPainting = true, nonPainting1 = true, nonPainting2 = true,\r
        nonPainting3 = true, nonPainting4 = true, Highlight = true,\r
        Highlight1 = true, powder = true\r
    }\r
    for _, item in ipairs(current_items) do\r
        if item.productIds and #item.productIds > 0 then\r
            -- 按花色分组\r
            local groups = {}\r
            for _, partId in ipairs(item.productIds) do\r
                local part = scene:get_part_by_id(partId)\r
                if part then\r
                    local texture_group = texture_group_map.other\r
                    local textureId = part:get_attribute("doormap1_MS") or ""\r
                    local texture = scene:get_texture_by_id(textureId)\r
                    if texture then\r
                        local HSLB_value = texture:get_attribute("HSLB") or ""\r
                        if Paint_Set[HSLB_value] then\r
                            texture_group = texture_group_map.paint\r
                        elseif NoPaint_Set[HSLB_value] then\r
                            texture_group = texture_group_map.noPaint\r
                        else\r
                            texture_group = texture_group_map.other\r
                        end\r
                    end\r
                    local group_key = texture_group\r
                    -- 如果该分组还没有创建，创建新分组\r
                    if not groups[group_key] then\r
                        groups[group_key] = {\r
                            brand = item.brand or "",\r
                            channel = item.channel or "",\r
                            catChoice = item.catChoice or "",\r
                            orderType = item.orderType or "",\r
                            splitEngine = item.splitEngine or "1",\r
                            specialOrder = item.specialOrder or false,\r
                            splitOrderDataType = item.splitOrderDataType,\r
                            productIds = {},\r
                            success = item.success or false,\r
                            errorMsg = item.errorMsg or ""\r
                        }\r
                    end\r
                    -- 将产品ID添加到对应分组\r
                    table.insert(groups[group_key].productIds, partId)\r
                end\r
            end\r
            -- 将分组后的子方案添加到结果集合\r
            for _, group_item in pairs(groups) do\r
                if #group_item.productIds > 0 then\r
                    table.insert(result_items, group_item)\r
                end\r
            end\r
        end\r
    end\r
    return result_items\r
end\r
\r
return _M`,remark:"保留字段",functionStatus:"ENABLED",isGeometry:0,funcClassifyFullPath:null,enableTime:1755331006e3,pos:44,categoryId:-1,isDelete:0,createTime:1755331006e3,modifyTime:1757490231e3,creator:131,creatorName:"11051352",modifier:131,modifierName:"11051352",usageCount:null},{id:"8000000007",funcCode:"split_order_default",funcName:"拆单函数: 默认规则拆单",funcDesc:"默认规则拆单：不同品类、品牌、渠道拆分成不同子方案",funcCategory:"LUOJI",funcDirectory:"",configData:'{"className":"split-order-default","funcLuaName":"split_order_default","input":{"widgetList":[{"id":"context","type":"input","attributes":{"label":"输入上下文","placeholder":"请输入输入上下文","paramType":"any"}}]},"output":{"widgetList":[{"type":"input","attributes":{"label":"输出上下文","placeholder":"请输入输出上下文","paramType":"any"}}]}}',luaScript:`local Scene = require("scene.scene")\r
local _M = {}\r
\r
-- 按产品品类、品牌、渠道、是否特殊订单拆分子方案\r
\r
-- @param context any 输入上下文\r
-- @return any 输出上下文\r
\r
function _M.split_order_default(context)\r
    --入参校验\r
    if context == nil then\r
        return nil, "入参不能为空"\r
    end\r
    if type(context) ~= "table" then\r
        return nil, "入参类型错误"\r
    end\r
    if #context == 0 then\r
        return context\r
    end\r
    local scene = Scene.current()\r
    local current_items = context --拆单规则上下文\r
    local result_items = {} -- 最终的子方案集合\r
    for _, item in ipairs(current_items) do\r
        if item.productIds and #item.productIds > 0 then\r
            -- 按品类、品牌、渠道分组\r
            local groups = {}\r
            for _, partId in ipairs(item.productIds) do\r
                local part = scene:get_part_by_id(partId)\r
                if part then\r
                    -- 获取产品属性\r
                    local catChoice = part:get_attribute("jdCatChoice") or ""\r
                    local brand = part:get_attribute("jdBrand") or item.brand or ""\r
                    local channel = part:get_attribute("jdChannel") or item.channel or ""\r
                    -- local specialOrderAttrValue = part:get_attribute("TSDD") or "0"\r
                    -- local specialOrder = false\r
                    -- if specialOrderAttrValue == "1" then\r
                    --     specialOrder = true\r
                    -- end\r
                    -- 创建分组键（品类+品牌+渠道的组合）\r
                    local group_key = catChoice .. "_" .. brand .. "_" .. channel\r
                    -- 如果该分组还没有创建，创建新分组\r
                    if not groups[group_key] then\r
                        groups[group_key] = {\r
                            brand = brand,\r
                            channel = channel,\r
                            catChoice = catChoice,\r
                            orderType = item.orderType or "",\r
                            splitEngine = item.splitEngine or "1",\r
                            specialOrder = item.specialOrder or false,\r
                            splitOrderDataType = item.splitOrderDataType,\r
                            productIds = {},\r
                            success = item.success or false,\r
                            errorMsg = item.errorMsg or ""\r
                        }\r
                    end\r
                    -- 将产品ID添加到对应分组\r
                    table.insert(groups[group_key].productIds, partId)\r
                end\r
            end\r
            -- 将分组后的子方案添加到结果集合\r
            for _, group_item in pairs(groups) do\r
                if #group_item.productIds > 0 then\r
                    table.insert(result_items, group_item)\r
                end\r
            end\r
        end\r
    end\r
    return result_items\r
end\r
\r
return _M`,remark:"保留字段",functionStatus:"ENABLED",isGeometry:0,funcClassifyFullPath:null,enableTime:1753687535e3,pos:37,categoryId:-1,isDelete:0,createTime:1753687535e3,modifyTime:1757902845e3,creator:131,creatorName:"11051352",modifier:131,modifierName:"11051352",usageCount:null},{id:187,funcCode:"get_nearly_obj_distance",funcName:"计算物体与物体间的间距值",funcDesc:"004计算物体与物体间的间距值",funcCategory:"JIHE",funcDirectory:"",configData:'{"className":"get-nearly-obj-distance","funcLuaName":"get_nearly_obj_distance","input":{"widgetList":[{"id":"partsA","type":"input","defaultValue":[],"attributes":{"label":"输入的对象列表","placeholder":"请输入输入的对象列表","disabled":true,"paramType":"table","paramSubType":"{:table}[]"}},{"id":"direction","type":"select","defaultValue":"up","options":[{"label":"up","value":"up"},{"label":"down","value":"down"},{"label":"left","value":"left"},{"label":"right","value":"right"},{"label":"front","value":"front"},{"label":"back","value":"back"}],"attributes":{"label":"方向","placeholder":"请输入方向","paramType":"string"}},{"id":"partsB","type":"input","defaultValue":[],"attributes":{"label":"目标对象列表","placeholder":"请输入目标对象列表","disabled":true,"paramType":"table","paramSubType":"{:table}[]"}},{"id":"is_same_root","type":"switch","defaultValue":false,"options":[{"label":"同根级","value":true},{"label":"不同根级","value":false}],"attributes":{"label":"是否查找同根级","placeholder":"请输入是否查找同根级","paramType":"boolean","activeText":"同根级","inactiveText":"不同根级"}}]},"output":{"widgetList":[{"type":"input","attributes":{"label":"主对象节点列表 # alias:main_obj_list","placeholder":"请输入主对象节点列表 # alias:main_obj_list","disabled":true,"paramType":"table","paramSubType":"{:table,mainObj:table,distance:number,direction:string,targetObj:table}[]"}}]}}',luaScript:`local geom_engine = require('lib.engine.geom-engine')\r
local Part = require("scene.part")\r
\r
local _M = {}\r
\r
-- 004 计算物体与物体间的间距值\r
-- @param partsA table 输入的对象列表 # default:[]\r
-- @field partsA[] table Part对象指针\r
-- @param direction string 方向  # options:["up","down","left","right","front","back"] default:"up"\r
-- @param partsB table 目标对象列表 # default:[]\r
-- @field partsB[] table Part对象指针\r
-- @param is_same_root boolean 是否查找同根级 # options:[{"同根级":true},{"不同根级":false}] default:false\r
-- @return table 主对象节点列表 # alias:main_obj_list\r
-- @field return[] table 距离信息对象\r
-- @field return[].mainObj table 主对象Part\r
-- @field return[].distance number 距离值\r
-- @field return[].direction string 方向\r
-- @field return[].targetObj table 目标对象Part\r
function _M.get_nearly_obj_distance(partsA, direction, is_same_root, partsB)\r
    -- 入参判空校验\r
    if partsA == nil then\r
        return nil, "输入的对象列表(partsA参数)不能为空"\r
    end\r
    if type(partsA) ~= "table" then\r
        return nil, "输入的对象列表(partsA参数)类型错误"\r
    end\r
    if direction == nil then\r
        return nil, "方向(direction参数)不能为空"\r
    end\r
    if type(direction) ~= "string" then\r
        return nil, "方向(direction参数)类型错误"\r
    end\r
    if is_same_root == nil then\r
        return nil, "是否查找同根级(is_same_root参数)不能为空"\r
    end\r
    if type(is_same_root) ~= "boolean" then\r
        return nil, "是否查找同根级(is_same_root参数)类型错误"\r
    end\r
    if partsB == nil then\r
        return nil, "目标对象列表(partsB参数)不能为空"\r
    end\r
    if type(partsB) ~= "table" then\r
        return nil, "目标对象列表(partsB参数)类型错误"\r
    end\r
\r
    local partsA_ptr = {}\r
    local partsB_ptr = {}\r
    for _, part in ipairs(partsA) do\r
        table.insert(partsA_ptr, part:get_ptr())\r
    end\r
    for _, part in ipairs(partsB) do\r
        table.insert(partsB_ptr, part:get_ptr())\r
    end\r
\r
    local list = geom_engine.get_nearly_obj_distance(partsA_ptr, direction, is_same_root, partsB_ptr)\r
    if list then\r
        for _, item in ipairs(list) do\r
            item.mainObj = Part.new(item.mainObj)\r
            item.targetObj = Part.new(item.targetObj)\r
        end\r
    end\r
    return list\r
end\r
\r
return _M`,remark:"保留字段",functionStatus:"ENABLED",isGeometry:0,funcClassifyFullPath:null,enableTime:1751420135e3,pos:7,categoryId:-1,isDelete:0,createTime:1751420135e3,modifyTime:1758107208e3,creator:131,creatorName:"11051352",modifier:476,modifierName:"11051352",usageCount:null}]}],error:null}}async function d(t){const e=await a.post({url:"/rule-config/func/batchDetail",data:{funcIds:t}});return e.success?e.data:(l.error(e.message),[])}function c(t){const e={icon:"icon-func",type:"func",title:t.funcName,funcId:t.id,remark:t.funcDesc,inputData:[],outputData:[],logicData:{},path:"",className:"",funcName:""};let r;try{const n=JSON.parse(t.configData);r=i(n),e.inputData=(r==null?void 0:r.input)||[],e.outputData=(r==null?void 0:r.output)||[],e.logicData=(r==null?void 0:r.logicData)||{},e.path=(r==null?void 0:r.path)||"",e.className=(r==null?void 0:r.className)||"",e.funcName=(r==null?void 0:r.funcLuaName)||""}catch{console.error("解析函数配置数据失败: "+t.funcName+"  配置数据不满足要求")}return e}export{d as a,s as g,c as t};
