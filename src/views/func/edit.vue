<template>
  <div class="h-full flex flex-col min-h-screen">
    <!-- 导航栏 -->
    <nav class="bg-gradient-to-r from-theme-dark to-theme-medium text-white shadow-md h-12 flex-shrink-0">
      <div class="container mx-auto px-3 h-full">
        <div class="flex items-center justify-between h-full">
          <div class="flex items-center space-x-2 sm:space-x-3">
            <i class="fas fa-code text-lg sm:text-xl text-theme-lightest"></i>
            <h1 class="text-base sm:text-xl font-bold">函数JSDoc解析器</h1>
          </div>
        </div>
      </div>
    </nav>

    <!-- 主内容区域 -->
    <div class="container mx-auto px-3 py-3 flex-1 flex flex-col min-h-0 lg:overflow-hidden">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:flex-1 lg:overflow-hidden lg:min-h-0">
        <!-- 代码输入区域 -->
        <div class="bg-white rounded-xl shadow-md border border-theme-lighter p-3 flex flex-col lg:overflow-hidden min-h-[400px] lg:min-h-0 mb-2 mt-0">
          <h2 class="text-base sm:text-lg font-semibold text-theme-dark mb-2 mt-0 flex items-center">
            <i class="fas fa-edit mr-2 text-theme-medium"></i>
            代码编辑器
          </h2>
          <div class="w-full code-editor focus:ring-2 focus:ring-theme-medium resize-none h-[400px] max-h-[400px] sm:h-[500px] sm:max-h-[500px] overflow-y-auto overflow-x-hidden scrollbar-zero lg:flex-1 lg:h-auto lg:min-h-0 lg:max-h-none lg:overflow-hidden">
            <BaseEditor ref="JsEditorRef" v-model="state.jsCode" />
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 mt-2 border-t border-theme-lighter">
            <el-button
              :icon="Bottom"
              @click="loadTemplate"
              class="bg-theme-light hover:bg-theme-medium text-white border-theme-light"
            >
              模版
            </el-button>
            <el-button
              :icon="Right"
              @click="Js2FormJson"
              class="bg-theme-medium hover:bg-theme-dark text-white border-theme-medium"
            >
              解析
            </el-button>
            <el-button
              @click="clearCode"
              class="bg-theme-lighter hover:bg-theme-light text-theme-dark border-theme-lighter"
            >
              <i class="fas fa-trash mr-2"></i>
              清空
            </el-button>
            <el-button
              type="primary"
              @click="saveFuncData"
              class="bg-theme-dark hover:bg-theme-medium text-white border-theme-dark"
            >
              <i class="fas fa-save mr-2"></i>
              保存
            </el-button>
          </div>
        </div>

        <!-- 注解解析输出区域 -->
        <div class="bg-white rounded-xl shadow-md border border-theme-lighter p-3 flex flex-col lg:overflow-hidden min-h-[300px] sm:min-h-[400px] lg:min-h-0 mb-2 mt-0">
          <h2 class="text-base sm:text-lg font-semibold text-theme-dark mb-2 mt-0 flex items-center">
            <i class="fas fa-file-code mr-2 text-theme-medium"></i>
            注解解析
          </h2>
          <div class="bg-gray-900 text-theme-light rounded-lg p-2 overflow-y-auto code-editor h-[300px] max-h-[300px] sm:h-[400px] sm:max-h-[400px] scrollbar-overlay lg:flex-1 lg:h-auto lg:min-h-0 lg:max-h-none">
            <pre class="annotation-code whitespace-pre-wrap break-words">{{ state.js2JsonCode }}</pre>
          </div>
        </div>

        <!-- 表单预览区域 -->
        <div class="bg-white rounded-xl shadow-md border border-theme-lighter p-3 flex flex-col lg:overflow-hidden min-h-[300px] sm:min-h-[400px] lg:min-h-0 mb-2 mt-0">
          <h2 class="text-base sm:text-lg font-semibold text-theme-dark mb-2 mt-0 flex items-center">
            <i class="fas fa-eye mr-2 text-theme-medium"></i>
            表单预览
          </h2>
          <div class="w-full code-editor focus:ring-2 focus:ring-theme-medium resize-none lg:flex-1 lg:overflow-y-auto lg:min-h-0">
            <h4 class="text-sm sm:text-base font-medium text-theme-dark mb-2 mt-0">
              <span>入参配置：</span>
            </h4>
            <BaseFormRender ref="inputFormRendererRef" :formJson="state.formJson.input" />
            <h4 class="text-sm sm:text-base font-medium text-theme-dark mb-2 mt-0">
              <span>出参配置</span>
            </h4>
            <BaseFormRender ref="outputFormRendererRef" :formJson="state.formJson.output" />
            <h4 class="text-sm sm:text-base font-medium text-theme-dark mb-2 mt-0">备注：</h4>
            <el-input
              type="textarea"
              :rows="5"
              maxlength="200"
              show-word-limit
              v-model="state.funcDesc"
              placeholder="请输入备注....."
              class="w-full"
            />
          </div>
        </div>
      </div>

      <!-- 工具说明 -->
      <div class="bg-white rounded-xl shadow-md border border-theme-lighter p-3 mt-2">
        <h2 class="text-sm sm:text-base font-semibold text-theme-dark mb-2 mt-0 flex items-center">
          <i class="fas fa-tools mr-1.5 text-theme-medium text-sm"></i>
          工具说明
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          <div class="bg-theme-lightest border border-theme-lighter p-2 rounded-lg hover:shadow-md transition-shadow">
            <h3 class="font-semibold text-theme-dark mb-1 mt-0 text-xs sm:text-sm">JSDoc语法</h3>
            <p class="text-xs text-gray-700 leading-snug mt-0 mb-0">
              语法支持
              <a
                class="text-theme-medium hover:text-theme-dark font-semibold underline decoration-theme-light hover:decoration-theme-medium transition-colors"
                href="https://jsdoc.nodejs.cn/"
                target="_blank"
              >
                JSDoc
              </a>
            </p>
          </div>
          <div class="bg-theme-lightest border border-theme-lighter p-2 rounded-lg hover:shadow-md transition-shadow">
            <h3 class="font-semibold text-theme-dark mb-1 mt-0 text-xs sm:text-sm">自主解析JSDoc</h3>
            <div class="text-xs text-gray-700 leading-snug space-y-1">
              <p class="mt-0 mb-0">已接入<strong class="text-theme-dark">@param</strong>、<strong class="text-theme-dark">@return</strong>、<strong class="text-theme-dark">@example</strong>等...</p>
              <p class="mt-0 mb-0">轻量级解析器，专注于注释解析，注解陆续接入解析中...</p>
            </div>
          </div>
          <div class="bg-theme-lightest border border-theme-lighter p-2 rounded-lg hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
            <h3 class="font-semibold text-theme-dark mb-1 mt-0 text-xs sm:text-sm">自主解析表单</h3>
            <p class="text-xs text-gray-700 leading-snug mt-0 mb-0">轻量级表单生成器</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseEditor from '@/components/BaseEditor/index.vue'
import JSDocParser, {Function, JsDocData} from '@/utils/parser/JSDocParser'
import FormParser, { FromConfig } from '@/utils/parser/FormParser'
import SimpleFormRenderer from '@/components/funcForm/SimpleFormRenderer.vue'
import BaseFormRender from '@/components/BaseFormRender/index.vue'
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
const formParser = new FormParser()

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
* @param {string} name - 名字
* @param {number} price - 工资
* @returns {object} employee - 员工
* @returns {string} employee.name - 员工名字
* @returns {number} employee.price - 员工工资
* @example log({ name: '张三', price: 3000 }, [{ name: '张三', price: 3000 }, { name: '李四', price: 2000 }]); // {name: '张三', price: 3000}
*/
function log(employee, employees, name, price) {
  return employee
}
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

const formJson = reactive<{ [key: string]: FromConfig }>({
  input: {
    formConfig: null,
    compList: []
  },
  output: {
    formConfig: null,
    compList: []
  },
})

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
    const ast: JsDocData = jsDocParser.parseCode(state.jsCode)

    state.js2JsonCode = ast

    console.log('ast', ast)
    // console.log('functionComments', functionComments)

    formJson.input = formParser.parseJsToFormConfig(ast.functions[0]?.input)
    formJson.output = formParser.parseJsToFormConfig(ast.functions[0]?.output)

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
// 确保背景颜色在所有设备上正确显示并铺满高度
.bg-theme-lightest {
  background-color: #ecf5fc !important;
}

.code-editor {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

// 注解解析代码块样式
.annotation-code {
  font-size: 12px;
  line-height: 16px;
  margin: 0;
  padding: 0;
}

// 悬浮滚动条样式（不占用宽度，无背景）
.scrollbar-overlay {
  // 自定义滚动条样式（Webkit浏览器 - Chrome, Safari, Edge）
  &::-webkit-scrollbar {
    width: 6px;
    background: transparent;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 3px;
    border: 1px solid transparent;
    background-clip: padding-box;

    &:hover {
      background: rgba(0, 0, 0, 0.3);
      background-clip: padding-box;
    }
  }

  // Firefox 滚动条样式
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
}

// 宽度为0的滚动条样式（移动端/平板端代码编辑器使用）
.scrollbar-zero {
  // 隐藏横向滚动条
  overflow-x: hidden;

  // 纵向滚动条宽度为0（Webkit浏览器）
  &::-webkit-scrollbar {
    width: 0;
    background: transparent;
  }

  &::-webkit-scrollbar-track {
    display: none;
  }

  &::-webkit-scrollbar-thumb {
    display: none;
  }

  // Firefox 滚动条样式
  scrollbar-width: none;
  scrollbar-color: transparent transparent;
}

// 确保按钮之间没有默认间距
:deep(.el-button + .el-button) {
  margin-left: 0;
}

// 自定义按钮样式
:deep(.el-button) {
  transition: all 0.3s ease;

  &.bg-theme-light {
    background-color: #77a2cc;
    border-color: #77a2cc;
    color: white;

    &:hover {
      background-color: #3c79b4;
      border-color: #3c79b4;
    }
  }

  &.bg-theme-medium {
    background-color: #3c79b4;
    border-color: #3c79b4;
    color: white;

    &:hover {
      background-color: #014f9c;
      border-color: #014f9c;
    }
  }

  &.bg-theme-lighter {
    background-color: #b1cce4;
    border-color: #b1cce4;
    color: #014f9c;

    &:hover {
      background-color: #77a2cc;
      border-color: #77a2cc;
      color: white;
    }
  }

  &.bg-theme-dark {
    background-color: #014f9c;
    border-color: #014f9c;
    color: white;

    &:hover {
      background-color: #3c79b4;
      border-color: #3c79b4;
    }
  }
}
</style>
