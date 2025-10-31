<template>
  <div class="bg-gray-50 h-full flex flex-col">
    <nav class="gradient-bg text-white shadow-lg h-10">
      <div class="container mx-auto px-4 py-4 h-full">
        <div class="flex items-center justify-between h-full">
          <div class="flex items-center space-x-2">
            <i class="fas fa-code text-xl"></i>
            <h1 class="text-xl font-bold">函数JSDoc解析器</h1>
          </div>
        </div>
      </div>
    </nav>

    <div class="container mx-auto px-4 py-4 lg:h-full flex flex-col flex-1 lg:overflow-hidden">
      <div class="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 overflow-hidden">
        <!-- 代码输入区域 -->
        <div class="bg-white rounded-xl shadow-lg p-4 fade-in flex flex-col overflow-overlay min-h-full max-h-full">
          <h2 class="text-lg font-semibold text-gray-800 mb-4">
            <i class="fas fa-edit mr-2 text-blue-500"></i>
            代码编辑器
          </h2>
          <div class="w-full code-editor focus:ring-2 focus:ring-blue-500 resize-none flex-1 min-h-64">
            <BaseEditor ref="JsEditorRef" v-model="state.jsCode" />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4">
            <el-button :icon="Bottom" @click="loadTemplate">模版</el-button>
            <el-button :icon="Right" @click="Js2FormJson">解析</el-button>
            <el-button @click="clearCode">
              <i class="fas fa-trash mr-2"></i>
              清空
            </el-button>
            <el-button type="primary" @click="saveFuncData">
              <i class="fas fa-trash mr-2"></i>
              保存
            </el-button>
          </div>
        </div>

        <!-- 注解解析输出区域 -->
        <div class="bg-white rounded-xl shadow-lg p-4 fade-in flex flex-col overflow-overlay max-h-96 md:max-h-full">
          <h2 class="text-lg font-semibold text-gray-800 mb-4">
            <i class="fas fa-file-code mr-2 text-green-500"></i>
            注解解析
          </h2>
          <div class="bg-gray-900 text-green-400 rounded-lg p-4 overflow-auto code-editor flex-1">
            <pre style="font-size: 12px; line-height: 16px">{{ state.js2JsonCode }}</pre>
          </div>
        </div>

        <!-- 表单预览区域 -->
        <div class="bg-white rounded-xl shadow-lg p-4 fade-in flex flex-col overflow-overlay max-h-96 sm:max-h-full ">
          <h2 class="text-lg font-semibold text-gray-800 mb-4">
            <i class="fas fa-file-code mr-2 text-green-500"></i>
            表单预览
          </h2>
          <div class="w-full code-editor focus:ring-2 focus:ring-blue-500 resize-none flex-1">
            <h4 style="margin: 16px 0 16px 0">
              <span>入参配置：</span>
            </h4>
            <BaseFormRender ref="inputFormRendererRef" :formJson="state.formJson.input" />
            <h4 style="margin: 16px 0 16px 0">
              <span>出参配置</span>
            </h4>
            <BaseFormRender ref="outputFormRendererRef" :formJson="state.formJson.output" />
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
      </div>

      <!-- 工具说明 -->
      <div class="bg-white rounded-xl shadow-lg p-4 mt-4 fade-in">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">
          <i class="fas fa-tools mr-2 text-orange-500"></i>
          工具说明
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-blue-50 p-4 rounded-lg">
            <h3 class="font-semibold text-blue-800">JSDoc语法</h3>
            <p class="text-sm text-gray-600">语法支持 <a class="text-blue-800 font-semibold" href="https://jsdoc.nodejs.cn/" target="_blank">JSDoc</a></p>
          </div>
          <div class="bg-green-50 p-4 rounded-lg">
            <h3 class="font-semibold text-green-800">自主解析JSDoc</h3>
            <p>
              <p class="text-sm text-gray-600">已接入<strong>@param</strong>、<strong>@return</strong>、<strong>@example</strong>等...</p>
              <p class="text-sm text-gray-600">轻量级解析器，专注于注释解析，注解陆续接入解析中...</p>
            </p>
          </div>
          <div class="bg-purple-50 p-4 rounded-lg">
            <h3 class="font-semibold text-purple-800">自主解析表单</h3>
            <p class="text-sm text-gray-600">轻量级表单生成器</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseEditor from '@/components/BaseEditor/index.vue'
import JSDocParser from '@/utils/parser/JSDocParser'
import SimpleFormRenderer from '@/components/funcForm/SimpleFormRenderer.vue'
import BaseFormRender from '@/components/BaseFormRender/index.vue'
import { parseLuaToFormConfig } from '@/components/BaseFormRender/util'
import { reactive, ref, onMounted, onActivated } from 'vue'
import { Bottom, Right, QuestionFilled } from '@element-plus/icons-vue'
import { ElMessage, ElNotification } from 'element-plus'
import { ElMessageBox } from 'element-plus'
import { useFunctionStore } from '@/store/modules/ruleCache'
import { http } from '@/axios'
import { compressFunctionConfig, expandFunctionConfig } from '@/utils/workflow/DataOptimizer'

defineOptions({
  name: 'functionEdit'
})

const jsDocParser = new JSDocParser()

// 使用 Lua 模板 hook备注
const getTemplate = () => {
  return `
/**
* 透传员工
* @param {object} employee - 员工
* @param {string} employee.name - 员工名字
* @param {number} employee.price - 员工工资
* @param {object[]} employees[] - 多员工
* @param {string} employees[].name - 员工名字
* @param {number} employees[].price - 员工工资
* @returns {object} employee - 员工
* @returns {string} employee.name - 员工名字
* @returns {number} employee.price - 员工工资
* @example log({ name: '张三', price: 3000 }, [{ name: '张三', price: 3000 }, { name: '李四', price: 2000 }]); // {name: '张三', price: 3000}
*/
function log(employee, employees) {
  return employee
}
`
//   return `local _M = {}
//
// local table = require("core.table")
// local part = require("scene.part")
//
// -- 参数示例
// -- @param expression function 表达式
// -- @param input_parts table 复杂对象 # default:{}
// -- @field input_parts.id string Part对象ID
// -- @field input_parts.name string Part对象名称
// -- @param ids table 简单数组 # default:[]
// -- @field ids[] number id值
// -- @param op string 单选列表 # options:["IN","NOTIN",">","<",">=","<=","=","<>"] default:"IN"
// -- @param value string 简单字符串 # default:""
// -- @param deep number 简单数值 # default:1
// -- @param dir table 多选列表 # options:["up","down","left","right"] default:["up"] componentType:select-multi
// -- @field dir[] string 方向值
// -- @param mode boolean 强制选择框 # options:[{"使用实体模型":true},{"使用obb包围盒":false}] default:true componentType:select
// -- @return table 返回符合条件的对象列表
// -- @field return[].part table Part对象
// -- @field return[].parent table 符合条件的父级Part对象列表
// function _M.get_parent(expression, input_parts, ids, op, value, deep, dir, mode)
//
// end
//
// return _M
// `
}

const functionStore = useFunctionStore()

// 表单是否禁用
const formDisabled = ref(false)

const inputFormRendererRef = ref()
const outputFormRendererRef = ref()
const JsEditorRef = ref()
// 识别到的函数的参数数量
const curFuncParamLen = ref(0)

const state = reactive({
  id: '',
  funcCode: '', //更新接口必须字段 本类不关心
  functionStatus: '', // 函数状态 更新接口必须字段 本类不关心
  jsCode: '', // 脚本代码
  js2JsonCode: {}, // 脚本代码转换json
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
    codeJson: {}
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
        jsCode: state.jsCode,
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

const clearCode = () => {
  state.jsCode = ''
  state.js2JsonCode = {}
}

const loadTemplate = () => {
  const templateCode = getTemplate()
  if (templateCode) {
    if (state.jsCode !== '') {
      const description = `将覆盖当前函数，是否继续？`
      ElMessageBox.confirm(description, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          state.jsCode = templateCode
          ElNotification({
            type: 'success',
            message: '加载模版成功',
            duration: 1000
          })
          setTimeout(() => {
            Js2FormJson()
          }, 1000)
        })
        .catch(() => {
          ElNotification({
            type: 'info',
            message: '取消加载模版'
          })
        })
    } else {
      state.jsCode = templateCode
      ElNotification({
        message: '加载模版成功',
        type: 'success',
        duration: 1000
      })
      setTimeout(() => {
        Js2FormJson()
      }, 1000)
    }
  }
}

const Js2FormJson = () => {
  if (state.jsCode === '') {
    state.js2JsonCode = {}
    return
  }
  try {
    const ast = jsDocParser.parseCode(state.jsCode)

    state.js2JsonCode = ast

    // const functionComments = ast.comments
    //   ?.filter((comment: any) => comment.type === 'Comment' && comment.value.trim().startsWith('@'))
    //   .map((comment: any) => {
    //     comment.value = comment.value.trim()
    //     return comment
    //   })
    // console.log('ast', ast)
    // console.log('functionComments', functionComments)
    // // 提取函数定义信息
    // // extractFunctionInfo(ast)
    // // 入参和出参配置生成
    // parseLuaToFormConfig(ast)
    // state.formJson.input = parseLuaToFormConfig(functionComments, 'input')
    // state.formJson.output = parseLuaToFormConfig(functionComments, 'output')
    // console.log('state.formJson', state.formJson)
    // // 设置入参默认值
    // setInputFormData(functionComments)
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
    state.jsCode = functionData.jsCode || ''
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
      Js2FormJson()
    }, 1000)
  }
  // else {
  //   functionStore.clearCurrentFunction()
  //   state.id = ''
  //   state.funcName = ''
  //   state.funcCode = ''
  //   state.jsCode = ''
  //   state.funcDesc = ''
  //   state.functionStatus = ''
  //   state.className = ''
  //   state.path = ''
  //   state.funcLuaName = ''
  // }
})
</script>

<style lang="scss" scoped>
.overflow-overlay {
  overflow: overlay;
}

.gradient-bg {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
.code-editor {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}
.fade-in {
  animation: fadeIn 0.5s ease-in;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.el-button + .el-button {
  margin-left: 0;
}
</style>
