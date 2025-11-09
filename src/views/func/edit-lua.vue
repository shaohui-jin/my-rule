<script setup lang="ts">
import LuaParser from 'luaparse'
import { parseLuaToFormConfig } from '@/components/funcForm/util.js'
import { reactive, ref, onMounted, onActivated } from 'vue'
// @ts-ignore
import BaseEditor from '@/components/BaseEditor/index.vue'
import SimpleFormRenderer from '@/components/funcForm/SimpleFormRenderer.vue'
import { Bottom, Right, QuestionFilled } from '@element-plus/icons-vue'
import { ElMessage, ElNotification } from 'element-plus'
import { ElMessageBox } from 'element-plus'
import { useFunctionStore } from '@/store/modules/ruleCache'
import { http } from '@/axios'
import { compressFunctionConfig, expandFunctionConfig } from '@/utils/workflow/DataOptimizer'

defineOptions({
  name: 'functionEdit'
})

// 使用 Lua 模板 hook备注
const getTemplate = () => {
  return `local _M = {}

local table = require("core.table")
local part = require("scene.part")

-- 参数示例
-- @param expression function 表达式
-- @param input_parts table 复杂对象 # default:{}
-- @field input_parts.id string Part对象ID
-- @field input_parts.name string Part对象名称
-- @param ids table 简单数组 # default:[]
-- @field ids[] number id值
-- @param op string 单选列表 # options:["IN","NOTIN",">","<",">=","<=","=","<>"] default:"IN"
-- @param value string 简单字符串 # default:""
-- @param deep number 简单数值 # default:1
-- @param dir table 多选列表 # options:["up","down","left","right"] default:["up"] componentType:select-multi
-- @field dir[] string 方向值
-- @param mode boolean 强制选择框 # options:[{"使用实体模型":true},{"使用obb包围盒":false}] default:true componentType:select
-- @return table 返回符合条件的对象列表
-- @field return[].part table Part对象
-- @field return[].parent table 符合条件的父级Part对象列表
function _M.get_parent(expression, input_parts, ids, op, value, deep, dir, mode)

end

return _M
`
}

const functionStore = useFunctionStore()

// 表单是否禁用
const formDisabled = ref(false)

const inputFormRendererRef = ref()
const outputFormRendererRef = ref()
const JsEditorRef = ref()
// 识别到的函数的参数数量
const curFuncParamLen = ref(0)

// 共享的示例注释字符串
const EXAMPLE_COMMENTS = `-- 基础类型:
-- @param type number 类型 # default:5
-- 有列表项的字符串类型:
-- @param find_type string 查找类型 # options:[{"找自身":"0"},{"找父级":"1"}] default:"0"

-- 简单数组类型的table 支持多选 (paramSubType: string[])
-- @param dir table 方向 # options:["up","down","left","right"] default:["up"] componentType:select-multi
-- @field dir[] string 方向列表

-- 对象类型的table (paramSubType: {name:string,age:number})
-- @param user table 用户信息 # default:{}
-- @field user.name string 用户名
-- @field user.age number 年龄

-- 对象数组类型的table (paramSubType: {name:string,age:number}[])
-- @param users table 用户列表 # default:[]
-- @field users[].name string 用户名
-- @field users[].age number 年龄

-- 自定义类型 (paramSubType: {name:string,age:number}Part[])
-- @param users table 用户列表 # default:[]
-- @field users[] $Part 自定义类型用于说明是数组的每个item的类型
-- @field users[].name string 用户名&说明Part有的属性
-- @field users[].age number 年龄&说明Part有的属性&后续扩展可选给下游
`

const state = reactive({
  id: '',
  funcCode: '', //更新接口必须字段 本类不关心
  functionStatus: '', // 函数状态 更新接口必须字段 本类不关心
  luaScript: '', // 脚本代码
  funcDesc: '', // 函数描述
  funcName: '', // 函数名 允许中文  方便看懂
  className: '', // 函数的类名 代码中使用
  path: '', // 类路径 代码中使用
  funcLuaName: '', // 使用到的 函数的方法名 代码中使用
  formJson: {
    input: {
      formConfig: {},
      widgetList: []
    },
    output: {
      formConfig: {},
      widgetList: []
    },
    codeJson: {},
    version: '1.0.0'
  }
})

const validateData = () => {
  let errorMsg = ''
  if (!state.id || !state.funcName || !state.className || !state.funcLuaName) {
    errorMsg = '信息不全，请检查函数名、方法名、文件名'
  }

  // 校验参数信息完整性
  const inputLength = state.formJson.input.widgetList?.length || 0
  const outputLength = state.formJson.output.widgetList?.length || 0

  if (inputLength === 0 && outputLength === 0) {
    errorMsg = '参数信息不全，请至少配置入参或出参'
  }

  if (inputLength !== curFuncParamLen.value) {
    errorMsg = `函数入参数量与注释参数数量不一致，请检查注释是否正确`
  }

  // 校验入参和出参的类型
  const mainType = ['string', 'number', 'boolean', 'table', 'any', 'function']
  state.formJson.input.widgetList.forEach(item => {
    const type = item.attributes.paramType
    const subType = item.attributes.paramSubType
    if (type === 'table' && subType === 'unkonwn') {
      errorMsg = `入参 ${item.name}: 的子项类型描述有误 请检查注释是否正确`
    }
    if (!mainType.includes(type)) {
      errorMsg = `入参 ${item.name}: 的类型描述有误 请检查注释是否正确`
    }
  })
  state.formJson.output.widgetList.forEach(item => {
    const type = item.attributes.paramType
    const subType = item.attributes.paramSubType
    if (type === 'table' && subType === 'unkonwn') {
      errorMsg = `出参 ${item.name}: 的子项类型描述有误 请检查注释是否正确`
    }
    if (!mainType.includes(type)) {
      errorMsg = `出参 ${item.name}: 的类型描述有误 请检查注释是否正确`
    }
  })

  if (errorMsg) {
    ElNotification({
      message: errorMsg,
      type: 'error',
      duration: 3000
    })
    return false
  }
  return true
}

const saveFuncData = () => {
  // 校验基本信息完整性
  if (!validateData()) {
    return
  }
  // 函数配置数据
  const configData = {
    ...state.formJson,
    className: state.className,
    path: state.path,
    funcLuaName: state.funcLuaName
  }
  // 压缩函数配置数据以减少存储空间
  const compressedConfigData = compressFunctionConfig(configData)
  // 函数列表数据

  http
    .post({
      url: '/rule-config/func/update',
      data: {
        id: state.id,
        funcName: state.funcName,
        funcCode: state.funcCode,
        functionStatus: state.functionStatus,
        funcDesc: state.funcDesc,
        luaScript: state.luaScript,
        configData: JSON.stringify(compressedConfigData)
      }
    })
    .then(res => {
      if (res.data === true) {
        ElMessage.success({
          message: '保存成功'
        })
      } else {
        ElMessage.error({
          message: '保存失败'
        })
      }
    })
    .catch(error => {
      ElMessage.error({
        message: error.message || '保存失败'
      })
    })
}

const insertExample = () => {
  // 方案1：直接修改 state.luaScript，利用 v-model 双向绑定自动更新编辑器
  const currentContent = state.luaScript
  const newContent = EXAMPLE_COMMENTS + (currentContent ? '\n\n' + currentContent : '')
  state.luaScript = newContent

  ElNotification({
    type: 'success',
    message: '已插入示例注释到代码开头',
    duration: 1000
  })
}

const loadTemplate = (templateName: string) => {
  const templateCode = getTemplate(templateName)
  if (templateCode) {
    if (state.luaScript !== '') {
      const description = `将覆盖当前函数，是否继续？`
      ElMessageBox.confirm(description, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          state.luaScript = templateCode
          ElNotification({
            type: 'success',
            message: '加载模版成功',
            duration: 1000
          })
          setTimeout(() => {
            Lua2FormJson()
          }, 1000)
        })
        .catch(() => {
          ElNotification({
            type: 'info',
            message: '取消加载模版'
          })
        })
    } else {
      state.luaScript = templateCode
      ElNotification({
        message: '加载模版成功',
        type: 'success',
        duration: 1000
      })
      setTimeout(() => {
        Lua2FormJson()
      }, 1000)
    }
  }
}

const Lua2FormJson = () => {
  if (state.luaScript === '') {
    ElNotification({
      message: '请先输入函数！',
      type: 'error',
      duration: 1000
    })
    return
  }
  try {
    const ast = LuaParser.parse(state.luaScript, { luaVersion: '5.2' })
    const functionComments = ast.comments
      ?.filter((comment: any) => comment.type === 'Comment' && comment.value.trim().startsWith('@'))
      .map((comment: any) => {
        comment.value = comment.value.trim()
        return comment
      })
    console.log(ast)
    console.log(functionComments)
    // 提取函数定义信息
    extractFunctionInfo(ast)
    // 入参和出参配置生成
    state.formJson.input = parseLuaToFormConfig(functionComments, 'input')
    state.formJson.output = parseLuaToFormConfig(functionComments, 'output')
    // 设置入参默认值
    setInputFormData(functionComments)
    ElNotification({
      message: '函数解析表单成功！',
      type: 'success',
      duration: 1000
    })
  } catch (error) {
    ElNotification({
      title: '解析失败',
      message: error.message,
      type: 'error',
      duration: 1000
    })
  }
}

// 提取函数定义信息
const extractFunctionInfo = (ast: any) => {
  if (!ast.body || !Array.isArray(ast.body)) {
    return
  }
  // 查找所有非局部函数定义
  const globalFunctions = ast.body
    .filter(node => node.type === 'FunctionDeclaration' && !node.isLocal)
    .map(node => ({
      name: node.identifier?.identifier?.name,
      parameters: node.parameters?.map(p => p.name) || []
    }))
    .filter(func => func.name)
  // 如果找到非局部函数，使用第一个作为默认值
  if (globalFunctions.length > 0) {
    const firstFunction = globalFunctions[0]
    // 只有当当前值为空时才自动填充
    if (state.className === '') {
      state.className = firstFunction.name.replace(/_/g, '-')
    }
    if (state.funcLuaName === '') {
      state.funcLuaName = firstFunction.name
    }
    // 入参数量
    curFuncParamLen.value = firstFunction.parameters.length
    console.log('检测到的非局部函数:', globalFunctions)
  } else {
    // 如果没有找到非局部函数，给出提示
    ElNotification({
      type: 'warning',
      message: '未检测到非局部函数定义，请确保函数没有使用local关键字',
      duration: 3000
    })
  }
}

const setInputFormData = (comments: any) => {
  const formData = {}
  // 从注释中提取入参默认值
  comments?.forEach((comment: any) => {
    if (comment.value.startsWith('@param')) {
      const paramMatch = comment.value.match(/@param\s+(\S+)\s+(\S+)\s+([^#]*?)(?:\s*#\s*(.*))?$/)
      if (paramMatch) {
        const [, name, type, , optionsAndDefault] = paramMatch
        if (['string', 'number', 'boolean'].includes(type) && optionsAndDefault) {
          const defaultMatch = optionsAndDefault.match(/default:\s*([^,\s]+)/)
          if (defaultMatch) {
            formData[name] = defaultMatch[1]
          }
        }
      }
    }
  })
  inputFormRendererRef.value?.setFormData(formData)
}

onActivated(() => {
  // 接受跳转数据
  const functionData = functionStore.currentFunction
  if (functionData) {
    // 设置基本信息
    state.id = functionData.id || ''
    state.funcName = functionData.funcName || ''
    state.funcCode = functionData.funcCode || ''
    state.luaScript = functionData.luaScript || ''
    state.funcDesc = functionData.funcDesc || ''
    state.functionStatus = functionData.functionStatus || ''
    // 设置编辑器的值 - 现在通过 v-model 自动同步，无需手动设置

    try {
      const configData = JSON.parse(functionData.configData)
      const expandedConfigData = expandFunctionConfig(configData)
      state.formJson.input = expandedConfigData.input || {}
      state.formJson.output = expandedConfigData.output || {}
      state.className = expandedConfigData.className || ''
      state.path = expandedConfigData.path || ''
      state.funcLuaName = expandedConfigData.funcLuaName || ''
    } catch {
      console.log('configData parse error')
    }

    // 清除跳转数据
    functionStore.clearCurrentFunction()
    // 解析函数配置
    setTimeout(() => {
      Lua2FormJson()
    }, 1000)
  }
  // else {
  //   functionStore.clearCurrentFunction()
  //   state.id = ''
  //   state.funcName = ''
  //   state.funcCode = ''
  //   state.luaScript = ''
  //   state.funcDesc = ''
  //   state.functionStatus = ''
  //   state.className = ''
  //   state.path = ''
  //   state.funcLuaName = ''
  // }
})
</script>

<template>
  <div class="func-edit-root">
    <div class="left">
      <h3 class="title">
        <span>
          <el-button :icon="Bottom" @click="loadTemplate('01')">导入模版01</el-button>
          <el-button :icon="Bottom" @click="insertExample">插入示例</el-button>
          <el-popover
            placement="bottom-start"
            title="Lua 注释提取规则"
            :width="800"
            trigger="hover"
            popper-class="func-edit-help-popper"
          >
            <template #reference>
              <el-button
                :icon="QuestionFilled"
              >Lua 注释提取规则</el-button>
            </template>
            <template #default>
              <div class="help-content">
                <p>系统会识别以 <code>-- @</code> 开头的特殊注释行，用于生成表单配置。</p>

                <strong>核心规则:</strong>
                <ul>
                  <li><code>@param &lt;name&gt; &lt;type&gt; &lt;desc&gt; # [options]</code> - 定义输入参数。</li>
                  <li><code>@field &lt;parent&gt;.&lt;field&gt; &lt;type&gt; &lt;desc&gt;</code> - 定义 <code>table</code> 对象的字段。</li>
                  <li><code>@return &lt;type&gt; &lt;desc&gt;</code> - 定义函数返回值。</li>
                </ul>

                <strong>高级选项 (# 后):</strong>
                <ul>
                  <li><code>default:&lt;value&gt;</code>: 设置默认值</li>
                  <li><code>options:[{...}]</code>: 定义下拉选项</li>
                  <li><code>desc:&lt;desc&gt;</code>: 设置字段描述</li>
                  <li><code>componentType:&lt;componentType&gt;</code>: 设置组件类型</li>
                  <li><code>multiple:&lt;multiple&gt;</code>: 设置是否多选</li>
                </ul>

                <strong>示例:</strong>
                <pre><code>{{ EXAMPLE_COMMENTS }}</code></pre>
              </div>
            </template>
          </el-popover>
        </span>
        <div style="margin-left: auto; display: flex;">
          <el-button type="primary" @click="saveFuncData">保存</el-button>
          <el-button :icon="Right" type="primary" @click="Lua2FormJson">更新表单配置</el-button>
        </div>
      </h3>
      <div class="js-editor-container">
        <BaseEditor ref="JsEditorRef" language="lua" v-model="state.luaScript" />
      </div>
    </div>
    <div class="right">
      <h4 style="margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid #e4e7ed; color: #0431fa; font-size: 18px;" >
        表单预览
      </h4>
      <div class="function-basic-info">
        <h4 style="margin: 0 0 16px 0">当前编辑：{{ state.funcName }}</h4>
        <el-form-item label="文件名" required>
          <el-input v-model="state.className" placeholder="请输入函数的类名" />
        </el-form-item>
        <el-form-item label="方法名" required>
          <el-input v-model="state.funcLuaName" placeholder="请输入实际调用的方法名" />
        </el-form-item>
        <el-form-item label="类路径">
          <el-input v-model="state.path" placeholder="请输入类路径 默认会放在dynamic目录下" />
        </el-form-item>
      </div>
      <h4 style="margin: 16px 0 16px 0">
        <span>入参配置：</span>
      </h4>
      <SimpleFormRenderer
        ref="inputFormRendererRef"
        :formJson="state.formJson.input"
        :disabled="formDisabled"
      />
      <h4 style="margin: 16px 0 16px 0">
        <span>出参配置</span>
      </h4>
      <SimpleFormRenderer
        ref="outputFormRendererRef"
        :formJson="state.formJson.output"
        :disabled="formDisabled"
      />
      <h4>备注：</h4>
      <el-input
        type="textarea"
        rows="5"
        maxlength="200"
        show-word-limit
        v-model="state.funcDesc"
        placeholder="请输入备注....."
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.func-edit-root {
  display: flex;
  width: 100%;
  min-height: 100%;
  box-sizing: border-box;
}
.left {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  padding: 16px 16px 0;
  height: calc(100vh - 120px);
  .title {
    display: flex;
    align-items: center;
    font-weight: bold;
    margin-bottom: 16px;
    font-size: 14px;
  }
  .js-editor-container {
    flex: 1;
    display: flex;
    min-height: 0;
  }
}
.right {
  width: 400px;
  height: calc(100vh - 120px);
  overflow-y: auto;
  border-radius: 8px;
  flex-shrink: 0;
  padding: 16px;
  background-color: #fafcff;
  border: 1px solid #e4e7ed;
  :deep(.el-form-item__label) {
    font-weight: 500;
    font-size: 14px;
  }
  .title {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    font-size: 16px;
    color: #303133;
    border-bottom: 1px solid #e4e7ed;
    padding-bottom: 16px;
  }

  h4 {
    display: flex;
    align-items: center;
    color: #303133;
    font-weight: 600;
    margin: 0 0 16px 0;
  }
}
</style>

<style lang="scss">
.func-edit-help-popper {
  .help-content {
    max-height: 400px;
    overflow-y: auto;
    p {
      margin-bottom: 12px;
    }
    strong {
      display: block;
      margin-top: 12px;
      margin-bottom: 8px;
      font-size: 14px;
      font-weight: 600;
    }
    ul {
      padding-left: 20px;
      margin: 0 0 12px 0;
    }
    li {
      margin-bottom: 5px;
    }
    code {
      background-color: #eef0f4;
      padding: 2px 5px;
      border-radius: 4px;
      font-family: 'Courier New', Courier, monospace;
    }
    pre {
      background-color: #f5f7fa;
      padding: 10px;
      border-radius: 4px;
      white-space: pre-wrap;
      line-height: 1.5;
      code {
        background-color: transparent;
        padding: 0;
        border-radius: 0;
      }
    }
  }
}
</style>
