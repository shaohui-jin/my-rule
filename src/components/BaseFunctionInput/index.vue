<!--<template>-->
<!--  <div class="func-wrapper">-->
<!--    <div class="func-input-body">-->
<!--      <el-popover-->
<!--        placement="bottom"-->
<!--        :show-arrow="false"-->
<!--        :width="popoverWidth"-->
<!--        :visible="autoInputShow"-->
<!--        :offset="0"-->
<!--        popper-class="func-popover"-->
<!--      >-->
<!--        <template #reference>-->
<!--          <el-input-->
<!--            style="width: 100%"-->
<!--            :id="`func-input-${uuid}`"-->
<!--            v-model="inputValue"-->
<!--            :disabled="props.disabled"-->
<!--            :autosize="true"-->
<!--            :placeholder="props.placeholder"-->
<!--            :title="inputValue"-->
<!--            @keydown="handleInputKeyDown"-->
<!--            @input="handleInputChange"-->
<!--            @change="handleChange"-->
<!--            @clear="handleClear"-->
<!--            @focus="handleFocus"-->
<!--            @blur="handleBlur"-->
<!--          >-->
<!--            <template #append>-->
<!--              <el-icon @click.capture.stop="showFullScreen">-->
<!--                <svg-->
<!--                  viewBox="0 0 14 14"-->
<!--                  xmlns="http://www.w3.org/2000/svg"-->
<!--                  xmlns:xlink="http://www.w3.org/1999/xlink"-->
<!--                  width="14.000000"-->
<!--                  height="14.000000"-->
<!--                  fill="none"-->
<!--                >-->
<!--                  <rect-->
<!--                    id="calculator"-->
<!--                    width="14.000000"-->
<!--                    height="14.000000"-->
<!--                    x="0.000000"-->
<!--                    y="0.000000"-->
<!--                  />-->
<!--                  <path-->
<!--                    id="合并"-->
<!--                    d="M2.625 0.875L11.375 0.875C11.8582 0.875 12.25 1.26675 12.25 1.75L12.25 12.25C12.25 12.7332 11.8582 13.125 11.375 13.125L2.625 13.125C2.14175 13.125 1.75 12.7332 1.75 12.25L1.75 1.75C1.75 1.26675 2.14175 0.875 2.625 0.875ZM11.375 1.75L2.625 1.75L2.625 12.25L11.375 12.25L11.375 1.75ZM9.625 2.625C10.1082 2.625 10.5 3.01675 10.5 3.5L10.5 5.25C10.5 5.73325 10.1082 6.125 9.625 6.125L4.375 6.125C3.89175 6.125 3.5 5.73325 3.5 5.25L3.5 3.5C3.5 3.01675 3.89175 2.625 4.375 2.625L9.625 2.625ZM9.625 3.5L4.375 3.5L4.375 5.25L9.625 5.25L9.625 3.5ZM4.375 7C4.85825 7 5.25 7.39175 5.25 7.875C5.25 8.35825 4.85825 8.75 4.375 8.75C3.89175 8.75 3.5 8.35825 3.5 7.875C3.5 7.39175 3.89175 7 4.375 7ZM7 7C7.48325 7 7.875 7.39175 7.875 7.875C7.875 8.35825 7.48325 8.75 7 8.75C6.51675 8.75 6.125 8.35825 6.125 7.875C6.125 7.39175 6.51675 7 7 7ZM10.5 7.875C10.5 7.39175 10.1082 7 9.625 7C9.14175 7 8.75 7.39175 8.75 7.875C8.75 8.35825 9.14175 8.75 9.625 8.75C10.1082 8.75 10.5 8.35825 10.5 7.875ZM4.375 9.625C4.85825 9.625 5.25 10.0168 5.25 10.5C5.25 10.9832 4.85825 11.375 4.375 11.375C3.89175 11.375 3.5 10.9832 3.5 10.5C3.5 10.0168 3.89175 9.625 4.375 9.625ZM7 9.625C7.48325 9.625 7.875 10.0168 7.875 10.5C7.875 10.9832 7.48325 11.375 7 11.375C6.51675 11.375 6.125 10.9832 6.125 10.5C6.125 10.0168 6.51675 9.625 7 9.625ZM10.5 10.5C10.5 10.0168 10.1082 9.625 9.625 9.625C9.14175 9.625 8.75 10.0168 8.75 10.5C8.75 10.9832 9.14175 11.375 9.625 11.375C10.1082 11.375 10.5 10.9832 10.5 10.5Z"-->
<!--                    fill="rgb(174,180,191)"-->
<!--                    fill-rule="evenodd"-->
<!--                  />-->
<!--                </svg>-->
<!--              </el-icon>-->
<!--            </template>-->
<!--          </el-input>-->
<!--        </template>-->
<!--        <div class="func-input-search" v-click-outside="() => (autoInputShow = false)">-->
<!--          <div-->
<!--            class="autocomplete-item"-->
<!--            v-for="(item, index) in autoInputData || []"-->
<!--            :key="index"-->
<!--            :class="{ active: index === autoInputActiveIndex }"-->
<!--            @click="selectAutoCompleteItem(item.code)"-->
<!--          >-->
<!--            <span :title="item.name">{{ item.name }}</span>-->
<!--            <span :title="item.code" style="color: rgb(152, 158, 170); margin-left: 4px">-->
<!--              {{ item.code }}-->
<!--            </span>-->
<!--          </div>-->
<!--        </div>-->
<!--      </el-popover>-->
<!--    </div>-->
<!--  </div>-->
<!--  <el-dialog-->
<!--    v-model="fullScreenShow"-->
<!--    title="表达式编辑器"-->
<!--    :show-close="false"-->
<!--    :width="840"-->
<!--    class="func-dialog"-->
<!--    append-to-body-->
<!--    :close-on-click-modal="false"-->
<!--    :destroy-on-close="true"-->
<!--    :close-on-press-escape="false"-->
<!--  >-->
<!--    <template #default>-->
<!--      <div class="func-dialog-container">-->
<!--        <div-->
<!--          ref="editorContainer"-->
<!--          class="func-dialog-container-editor"-->
<!--          :class="{ error: !!error }"-->
<!--        />-->
<!--        <div class="func-dialog-container-error" v-show="error" v-html="error" />-->
<!--      </div>-->
<!--      <div class="func-dialog-container-item" style="flex: unset; width: 30%">-->
<!--        <div class="body-item__title">函数列表</div>-->
<!--        <div class="body-item__container">-->
<!--          <div class="container-title">-->
<!--            <el-select v-model="operaRadio" style="width: 100%">-->
<!--              <el-option-->
<!--                v-for="(item, index) in operator"-->
<!--                :key="index"-->
<!--                :label="item.operaDict"-->
<!--                :value="item.operaDict"-->
<!--              />-->
<!--            </el-select>-->
<!--          </div>-->
<!--          <div class="container-body">-->
<!--            <template v-for="item in operatorList" :key="item.operaValue">-->
<!--              <el-tooltip placement="top" :show-after="300">-->
<!--                <div class="bar-list__item" @click="handleClickItem(item)">-->
<!--                  {{ item.operaValue }}-->
<!--                </div>-->
<!--                <template #content>-->
<!--                  <p class="tooltip-item__title">{{ item.operaDesc }}</p>-->
<!--                  <p class="tooltip-item__value">例如{{ item.operaTemplate }}</p>-->
<!--                </template>-->
<!--              </el-tooltip>-->
<!--            </template>-->
<!--          </div>-->
<!--        </div>-->
<!--      </div>-->
<!--    </template>-->
<!--    <template #footer>-->
<!--      <el-button type="primary" @click="commitExpress">确定</el-button>-->
<!--      <el-button @click="cancelExpress">取消</el-button>-->
<!--    </template>-->
<!--  </el-dialog>-->
<!--</template>-->

<!--<script setup lang="ts">-->
<!--import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'-->

<!--import { useVModel } from '@vueuse/core'-->
<!--import { operator } from './option'-->
<!--import * as monaco from 'monaco-editor'-->

<!--import { useDialogDrag } from '@/hooks/useDialogDrag'-->
<!--import axios from 'axios'-->

<!--defineOptions({-->
<!--  name: 'BaseFunctionInput'-->
<!--})-->

<!--const { initDialog } = useDialogDrag()-->

<!--const props = defineProps({-->
<!--  modelValue: {-->
<!--    type: String,-->
<!--    required: true,-->
<!--    default: ''-->
<!--  },-->
<!--  disabled: {-->
<!--    type: Boolean,-->
<!--    default: false-->
<!--  },-->
<!--  requireMessage: {-->
<!--    type: String,-->
<!--    default: '表达式必填',-->
<!--    remark: '必填时报错内容'-->
<!--  },-->
<!--  placeholder: {-->
<!--    type: String,-->
<!--    default: '请输入表达式'-->
<!--  },-->
<!--  isRequiredField: {-->
<!--    type: Boolean,-->
<!--    default: true,-->
<!--    remark: '是否是必填项'-->
<!--  }-->
<!--})-->

<!--const emit = defineEmits(['update:modelValue', 'change', 'clear', 'input', 'blur', 'focus'])-->

<!--const inputValue = useVModel(props, 'modelValue', emit)-->
<!--const paramList = ref<{ name: string; code: string; children: any[] }[]>([])-->

<!--const error = ref(``)-->

<!--const uuid = ref('')-->
<!--// 编辑器对象-->
<!--let codeEditor = null-->

<!--// 生成随机字符串 ID-->
<!--function generateRandomId(length = 8) {-->
<!--  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'-->
<!--  let result = ''-->
<!--  for (let i = 0; i < length; i++) {-->
<!--    result += chars.charAt(Math.floor(Math.random() * chars.length))-->
<!--  }-->
<!--  return result-->
<!--}-->

<!--onMounted(async () => {-->
<!--  uuid.value = generateRandomId()-->
<!--})-->

<!--onUnmounted(() => {})-->

<!--// 自动联想相关-->
<!--const autoInputShow = ref(false)-->
<!--const autoInputActiveIndex = ref(-1)-->
<!--const autoInputData = ref<any[]>([])-->
<!--const popoverWidth = ref(300)-->

<!--// 添加键盘事件处理函数-->
<!--const handleInputKeyDown = (e: KeyboardEvent) => {-->
<!--  /**-->
<!--   * 键盘函数-->
<!--   * */-->
<!--  const keyFnMap = {-->
<!--    ArrowDown: e => {-->
<!--      e.preventDefault()-->
<!--      autoInputActiveIndex.value = (autoInputActiveIndex.value + 1) % autoInputData.value.length-->
<!--    },-->
<!--    ArrowUp: e => {-->
<!--      e.preventDefault()-->
<!--      autoInputActiveIndex.value =-->
<!--        (autoInputActiveIndex.value - 1 + autoInputData.value.length) % autoInputData.value.length-->
<!--    },-->
<!--    Enter: e => {-->
<!--      e.preventDefault()-->
<!--      if (autoInputActiveIndex.value >= 0 && autoInputData.value.length > 0) {-->
<!--        selectAutoCompleteItem(autoInputData.value[autoInputActiveIndex.value].code)-->
<!--        autoInputActiveIndex.value = -1-->
<!--        autoInputShow.value = false-->
<!--      }-->
<!--    },-->
<!--    Escape: e => {-->
<!--      // e.preventDefault()-->
<!--      autoInputShow.value = false-->
<!--      autoInputActiveIndex.value = -1-->
<!--    }-->
<!--  }-->
<!--  keyFnMap[e.key] && keyFnMap[e.key](e)-->
<!--}-->

<!--const handleBlur = () => {-->
<!--  console.log('handleBlur')-->
<!--  autoInputShow.value = false-->
<!--  emit('blur')-->
<!--}-->

<!--const handleFocus = () => {-->
<!--  console.log('handleFocus')-->
<!--  emit('focus')-->
<!--}-->

<!--const handleClear = val => {-->
<!--  console.log('handleClear', val)-->
<!--  emit('clear', val)-->
<!--}-->

<!--const handleChange = val => {-->
<!--  console.log('handleChange', val)-->
<!--  emit('change', val)-->
<!--}-->

<!--// 添加input事件处理函数-->
<!--const handleInputChange = val => {-->
<!--  emit('input', val)-->
<!--  const input = document.getElementById(`func-input-${uuid.value}`) as HTMLInputElement-->

<!--  // 自动联想逻辑-->
<!--  const lastSegment = getLastSegment(val.substring(0, input.selectionStart))-->

<!--  if (lastSegment.length > 0) {-->
<!--    autoInputData.value = paramList.value.filter(-->
<!--      item =>-->
<!--        item.code.toLowerCase().startsWith(lastSegment) && item.code.toLowerCase() !== lastSegment-->
<!--    )-->

<!--    popoverWidth.value = document.querySelector(`.func-input-body`).getBoundingClientRect().width-->

<!--    // .slice(0, 10) // 限制显示数量-->
<!--    autoInputShow.value = autoInputData.value.length > 0-->
<!--  } else {-->
<!--    autoInputShow.value = false-->
<!--  }-->
<!--}-->

<!--/**-->
<!-- * 点击或回车选中-->
<!-- */-->
<!--const selectAutoCompleteItem = code => {-->
<!--  // 后面加空格-->
<!--  code = code + ' '-->
<!--  const input = document.getElementById(`func-input-${uuid.value}`) as HTMLInputElement-->
<!--  const val = inputValue.value-->

<!--  // 这里基于光标位置，截取文本长度，而不是全文本-->
<!--  const textBeforeCursor = input.value.substring(0, input.selectionStart)-->
<!--  const lastSegment = getLastSegment(textBeforeCursor)-->
<!--  const startIndex = textBeforeCursor.lastIndexOf(lastSegment)-->

<!--  inputValue.value =-->
<!--    val.substring(0, startIndex) + code + val.substring(startIndex + lastSegment.length)-->
<!--  autoInputShow.value = false-->

<!--  // 设置光标位置-->
<!--  nextTick(() => {-->
<!--    const newPos = startIndex + code.length-->
<!--    input.focus()-->
<!--    input.setSelectionRange(newPos, newPos)-->
<!--  })-->
<!--}-->

<!--/**-->
<!-- * 获取最后一个文档-->
<!-- * */-->
<!--const getLastSegment = str => {-->
<!--  return str-->
<!--    .split(/[^a-zA-Z0-9_\u4e00-\u9fa5]/)-->
<!--    .pop()-->
<!--    .toLowerCase() // 获取最后一个片段-->
<!--}-->

<!--const dialogInputValue = ref('')-->
<!--const fullScreenShow = ref(false)-->

<!--// 容器对象-->
<!--const editorContainer = ref()-->

<!--// 打开详细功能-->
<!--const showFullScreen = () => {-->
<!--  if (props.disabled) return-->
<!--  dialogInputValue.value = inputValue.value-->
<!--  fullScreenShow.value = true-->
<!--  codeEditor = null-->
<!--  nextTick(() => {-->
<!--    initDialog()-->
<!--    codeEditor = monaco.editor.create(editorContainer.value, {-->
<!--      value: inputValue.value,-->
<!--      language: 'lua',-->
<!--      automaticLayout: true, // 自动调整布局-->
<!--      theme: 'vs',-->
<!--      lineNumbers: 'off',-->
<!--      roundedSelection: false,-->
<!--      minimap: { enabled: false },-->
<!--      scrollBeyondLastLine: false,-->
<!--      readOnly: false,-->
<!--      readOnlyMessage: { value: '不可以修改哦', supportThemeIcons: true, supportHtml: true }, // 为只读时编辑内日提示词-->
<!--      codeLens: false, // 代码透镜-->
<!--      folding: true, // 代码折叠-->
<!--      foldingStrategy: 'auto', // 折叠策略-->
<!--      tabCompletion: 'on', // 代码提示按tab完成-->
<!--      smoothScrolling: false, // 滚动动画-->
<!--      fontSize: 14,-->
<!--      padding: { top: 5, bottom: 5 },-->
<!--      wordWrap: 'on',-->
<!--      wordBasedSuggestions: true, // 禁用基于单词的智能提示（例如，自动完成）-->
<!--      scrollbar: {-->
<!--        vertical: 'hidden', // 自动显示滚动条-->
<!--        horizontal: 'hidden'-->
<!--        // handleMouseWheel: false,-->
<!--        // alwaysConsumeMouseWheel: false,-->
<!--        // verticalScrollbarSize: 8-->
<!--      },-->
<!--      quickSuggestions: true, // 启用快速建议（例如，输入时自动显示建议）-->
<!--      suggest: {-->
<!--        showIcons: false,-->
<!--        // showInlineDetails: true,-->
<!--        localityBonus: false,-->
<!--        matchOnWordStartOnly: true-->
<!--      },-->
<!--      snippetSuggestions: 'inline', // 代码提示-->
<!--      suggestSelection: 'first',-->
<!--      // suggestSelection: 'recentlyUsedByPrefix',-->
<!--      suggestFontSize: 14,-->
<!--      suggestLineHeight: 32,-->
<!--      smartSelect: {-->
<!--        selectLeadingAndTrailingWhitespace: false-->
<!--      }-->
<!--    })-->
<!--    // 编辑器内容变更时回调-->
<!--    codeEditor.onDidChangeModelContent(() => {-->
<!--      dialogInputValue.value = codeEditor.getValue()-->
<!--    })-->
<!--  })-->
<!--}-->

<!--// 点击参数 添加至光标-->
<!--const handleClickItem = item => {-->
<!--  if (!item) {-->
<!--    return-->
<!--  }-->
<!--  const { lineNumber, column } = codeEditor.getPosition()-->
<!--  codeEditor.executeEdits('insertText', [-->
<!--    {-->
<!--      range: {-->
<!--        startLineNumber: lineNumber,-->
<!--        endLineNumber: lineNumber,-->
<!--        startColumn: column,-->
<!--        endColumn: column-->
<!--      },-->
<!--      text: item.operaValue-->
<!--    }-->
<!--  ])-->

<!--  codeEditor.focus()-->
<!--  codeEditor.setPosition({-->
<!--    lineNumber,-->
<!--    column: column + item.operaValue.length + (item.operaOffset || 0)-->
<!--  })-->
<!--}-->

<!--// 校验lua-->
<!--const checkExpress = expression => {-->
<!--  const requestParams = {-->
<!--    data: {-->
<!--      expression: expression,-->
<!--      addVariablePrefix: !expression.includes('rst') && !expression.includes('row')-->
<!--    }-->
<!--  }-->
<!--  return axios.post<any, any>('/rule-config/rule/expr/toLua', requestParams)-->
<!--}-->

<!--const commitExpress = () => {-->
<!--  if (!props.isRequiredField && !dialogInputValue.value) {-->
<!--    handleSuccess(dialogInputValue.value)-->
<!--    return-->
<!--  }-->
<!--  // 格式化 移除换行-->
<!--  const expression = (dialogInputValue.value || '')-->
<!--    .replaceAll('\r\n', ' ')-->
<!--    .replaceAll('\n', ' ')-->
<!--    .replaceAll('\r', ' ')-->
<!--  codeEditor.setValue(expression)-->
<!--  checkExpress(expression).then(res => {-->
<!--    if (res.success) {-->
<!--      if (res.data.success) {-->
<!--        handleSuccess(dialogInputValue.value)-->
<!--      } else {-->
<!--        handleExpressionError(res.data.errorMessage)-->
<!--      }-->
<!--    }-->
<!--  })-->
<!--  // .catch(() => {-->
<!--  //   ElMessage.error('解析函数表达式失败')-->
<!--  // })-->
<!--}-->
<!--// 提取成功处理逻辑-->
<!--const handleSuccess = value => {-->
<!--  error.value = ''-->
<!--  inputValue.value = value-->
<!--  emit('input', inputValue.value)-->
<!--  emit('change', inputValue.value)-->
<!--  fullScreenShow.value = false-->
<!--}-->
<!--// 提取表达式错误处理逻辑-->
<!--const handleExpressionError = errorMsg => {-->
<!--  const test = errorMsg.match(/\d+/gi)-->
<!--  if (test) {-->
<!--    const column = Number(test[0])-->
<!--    // const { lineNumber, column } = getPosition(col)-->
<!--    codeEditor.focus()-->
<!--    codeEditor.setPosition({ lineNumber: 1, column })-->
<!--  }-->
<!--  error.value = errorMsg.replaceAll('\n', '<br/>')-->
<!--}-->

<!--/**-->
<!-- * 获取大窗口错误位置-->
<!-- * @param {number} num 报错下标(替换位空格后的)-->
<!-- * @returns {{ column: number, lineNumber: number }} 坐标信息-->
<!-- */-->
<!--const getPosition = num => {-->
<!--  let column = 0 // 第几列-->
<!--  let lineNumber = 1 // 第几行-->
<!--  dialogInputValue.value.split('\r\n').forEach(e => {-->
<!--    if (num + 1 >= e.length) {-->
<!--      num = num - e.length - 1-->
<!--      lineNumber = lineNumber + 1-->
<!--    } else {-->
<!--      column = num-->
<!--    }-->
<!--  })-->
<!--  return { column, lineNumber }-->
<!--}-->

<!--// 外部使用组件内部统一的校验-->
<!--const validateLua = (rule, value, callback) => {-->
<!--  if (rule.required && !inputValue.value) {-->
<!--    callback(new Error(props.requireMessage))-->
<!--    return-->
<!--  }-->
<!--  inputValue.value = inputValue.value.replaceAll('\n', ' ')-->
<!--  checkExpress(inputValue.value)-->
<!--    .then(res => {-->
<!--      if (res.success) {-->
<!--        if (res.data.success) {-->
<!--          callback()-->
<!--        } else {-->
<!--          callback(new Error(res.data.errorMessage.split('\n')[0]))-->
<!--        }-->
<!--      }-->
<!--    })-->
<!--    .catch(() => {-->
<!--      callback(new Error('解析函数表达式失败'))-->
<!--    })-->
<!--}-->

<!--const cancelExpress = () => {-->
<!--  dialogInputValue.value = ''-->
<!--  error.value = ''-->
<!--  fullScreenShow.value = false-->
<!--}-->

<!--// 函数列表相关-->
<!--const operaRadio = ref('计算运算符')-->
<!--const operatorList = computed(() => {-->
<!--  return operator.find(item => item.operaDict === operaRadio.value)?.operaList || []-->
<!--})-->

<!--watch(-->
<!--  () => error.value,-->
<!--  val => {-->
<!--    const editor = document.querySelector('.func-dialog-container-editor') as HTMLDivElement-->
<!--    if (editor) {-->
<!--      if (!val) {-->
<!--        nextTick(() => {-->
<!--          editor.style.height = '572px'-->
<!--        })-->
<!--      } else {-->
<!--        nextTick(() => {-->
<!--          const clientHeight = document-->
<!--            .querySelector('.func-dialog-container-error')-->
<!--            .getBoundingClientRect().height-->
<!--          console.log('clientHeight', clientHeight)-->
<!--          editor.style.height = `calc(572px - ${clientHeight + 8}px)`-->
<!--        })-->
<!--      }-->
<!--    }-->
<!--  },-->
<!--  { immediate: true, deep: true }-->
<!--)-->

<!--defineExpose({-->
<!--  validateLua-->
<!--})-->
<!--</script>-->

<!--<style lang="scss">-->
<!--.func-dialog .el-dialog__body {-->
<!--  padding: 14px;-->
<!--  height: 600px;-->
<!--  display: flex;-->
<!--  flex-direction: row;-->
<!--  gap: 8px;-->
<!--  border-top: 1px solid rgba(220, 223, 230, 1);-->
<!--  border-bottom: 1px solid rgba(220, 223, 230, 1);-->
<!--}-->
<!--.func-popover {-->
<!--  padding: 0 !important;-->
<!--  border: 1px solid #dcdfe6 !important;-->
<!--  border-radius: 4px !important;-->
<!--  .func-input-search {-->
<!--    display: flex;-->
<!--    flex-direction: column;-->
<!--    border: 1px solid #dcdfe6;-->
<!--    border-radius: 4px;-->
<!--    background: #fff;-->
<!--    width: 100%;-->
<!--    max-height: 256px;-->
<!--    overflow: overlay;-->
<!--    scrollbar-width: thin; /* 滚动条宽度 */-->
<!--    scrollbar-color: rgba(228, 231, 237, 1) #ffffff; /* 滑块颜色 轨道颜色 */-->
<!--    /* 自定义滚动条样式 */-->
<!--    &::-webkit-scrollbar {-->
<!--      width: 4px;-->
<!--    }-->
<!--    &::-webkit-scrollbar-track {-->
<!--      background: #ffffff;-->
<!--      border-radius: 3px;-->
<!--    }-->
<!--    &::-webkit-scrollbar-thumb {-->
<!--      background: rgba(228, 231, 237, 1);-->
<!--      border-radius: 3px;-->

<!--      &:hover {-->
<!--        background: #a8a8a8;-->
<!--      }-->
<!--    }-->
<!--    .autocomplete-item {-->
<!--      padding: 0px 16px;-->
<!--      font-weight: 400;-->
<!--      font-size: 14px;-->
<!--      height: 32px;-->
<!--      line-height: 32px;-->
<!--      display: flex;-->
<!--      justify-content: space-between;-->
<!--      &.active {-->
<!--        background: rgba(245, 247, 250, 1);-->
<!--        cursor: pointer;-->
<!--      }-->
<!--      &:hover {-->
<!--        background: rgba(245, 247, 250, 1);-->
<!--        cursor: pointer;-->
<!--      }-->
<!--      span {-->
<!--        color: rgba(91, 91, 94, 1);-->
<!--        max-width: 70%;-->
<!--        white-space: nowrap; /* 强制文本在一行显示 */-->
<!--        overflow: hidden; /* 隐藏超出容器的内容 */-->
<!--        text-overflow: ellipsis; /* 超出部分用省略号表示 */-->
<!--      }-->
<!--    }-->
<!--  }-->
<!--}-->
<!--</style>-->
<!--<style scoped lang="scss">-->
<!--:deep(.el-input__wrapper) {-->
<!--  border-radius: var(&#45;&#45;el-input-border-radius, var(&#45;&#45;el-border-radius-base));-->
<!--  padding: 1px 43px 1px 11px;-->
<!--}-->
<!--:deep(.el-input-group__append) {-->
<!--  position: absolute;-->
<!--  right: 0;-->
<!--  cursor: pointer;-->
<!--  padding: 0 12px;-->
<!--  background-color: unset !important;-->
<!--  border: 0;-->
<!--  box-shadow: unset;-->
<!--}-->

<!--.func-wrapper {-->
<!--  width: 100%;-->
<!--  position: relative;-->
<!--  .func-input-body {-->
<!--    position: relative;-->
<!--  }-->
<!--}-->

<!--.func-dialog-container {-->
<!--  flex: 1 1 0;-->
<!--  display: table;-->
<!--  max-height: 572px;-->
<!--  .func-dialog-container-editor {-->
<!--    height: 572px;-->
<!--    :deep(.overflow-guard) {-->
<!--      border: 1px solid #dcdfe6;-->
<!--      border-radius: 8px;-->
<!--    }-->
<!--    &.error {-->
<!--      :deep(.overflow-guard) {-->
<!--        border: 1px solid rgba(245, 108, 108, 1);-->
<!--      }-->
<!--    }-->
<!--    :deep(.current-line) {-->
<!--      //width: 0px!important;-->
<!--    }-->
<!--    :deep(.editor-scrollable) {-->
<!--      //left: 12px!important;-->
<!--      //width: 546px!important;-->
<!--    }-->
<!--    :deep(.monaco-mouse-cursor-text) {-->
<!--      //left: 12px!important;-->
<!--      //width: 546px!important;-->
<!--    }-->
<!--    :deep(.margin) {-->
<!--      //width: 24px!important;-->
<!--      //display: none;-->
<!--    }-->
<!--    :deep(.margin-view-overlays) {-->
<!--      //width: 24px!important;-->
<!--      .line-numbers {-->
<!--        //width: 12px!important;-->
<!--      }-->
<!--      //display: none;-->
<!--    }-->
<!--  }-->
<!--  .func-dialog-container-error {-->
<!--    margin-top: 8px;-->
<!--    border-radius: 4px;-->
<!--    font-size: 12px;-->
<!--    padding: 12px;-->
<!--    background: rgba(254, 240, 240, 1);-->
<!--    color: rgba(245, 108, 108, 1);-->
<!--  }-->
<!--}-->

<!--.func-dialog-container-item {-->
<!--  width: 240px;-->
<!--  border: 1px solid #dcdfe6;-->
<!--  border-radius: 8px;-->
<!--  height: 100%;-->
<!--  display: flex;-->
<!--  flex-direction: column;-->
<!--  //flex: 1 1 0;-->
<!--  .body-item__title {-->
<!--    height: 48px;-->
<!--    padding-left: 8px;-->
<!--    border-bottom: 1px solid #dcdfe6;-->
<!--    font-weight: 500;-->
<!--    line-height: 48px;-->
<!--    display: flex;-->
<!--    color: rgba(28, 26, 39, 1);-->
<!--    font-size: 16px;-->
<!--  }-->
<!--  .body-item__container {-->
<!--    flex: 1 1 0;-->
<!--    display: flex;-->
<!--    flex-direction: column;-->
<!--    height: 100%;-->
<!--    .container-title {-->
<!--      padding: 8px;-->
<!--      height: 48px;-->
<!--    }-->
<!--    .container-body {-->
<!--      margin-top: 8px;-->
<!--      //height: 300px;-->
<!--      flex: 1 1 0;-->

<!--      overflow-y: overlay;-->
<!--      .bar-list__item {-->
<!--        height: 32px;-->
<!--        line-height: 32px;-->
<!--        padding-left: 16px;-->
<!--        font-weight: 400;-->
<!--        color: rgba(91, 91, 94, 1);-->
<!--        &:hover {-->
<!--          background: rgba(245, 247, 250, 1);-->
<!--          cursor: pointer;-->
<!--        }-->
<!--      }-->
<!--    }-->
<!--  }-->
<!--}-->

<!--:deep(.monaco-editor) {-->
<!--  &#45;&#45;max-height: 256px;-->
<!--  .suggest-widget {-->
<!--    //max-height: var(&#45;&#45;max-height) !important;  /* 窗口最大高度 */-->
<!--    //overflow-y: auto !important;   /* 超出时显示滚动条 */-->
<!--    //border-radius: 6px !important; /* 圆角 */-->
<!--    //box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important; /* 阴影 */-->
<!--    //border: 1px solid #e0e0e0 !important; /* 边框 */-->
<!--    background: #ffffff !important; /* 背景色 */-->
<!--    //visibility: unset!important;-->
<!--    //display: unset!important;-->

<!--    .monaco-list {-->
<!--      .details-label {-->
<!--        display: flex !important;-->
<!--        visibility: visible !important;-->
<!--        overflow: visible !important;-->
<!--        font-family: Source Han Sans CN;-->
<!--        color: #5b5b5e !important;-->
<!--        font-size: 13px !important;-->
<!--      }-->
<!--      .highlight {-->
<!--        color: #0055ff !important;-->
<!--      }-->
<!--      .codicon-suggest-more-info {-->
<!--        display: none !important;-->
<!--      }-->

<!--      .monaco-list-row.focused,-->
<!--      .monaco-list-row:hover {-->
<!--        background-color: #f0f0f0 !important;-->
<!--        * {-->
<!--          //color: rgba(0, 85, 255, 1)!important;-->
<!--          color: #0055ff !important;-->
<!--          //font-weight: 600;-->
<!--        }-->

<!--        .details-label {-->
<!--          color: #5b5b5e !important;-->
<!--        }-->
<!--      }-->
<!--    }-->
<!--  }-->
<!--}-->
<!--</style>-->
