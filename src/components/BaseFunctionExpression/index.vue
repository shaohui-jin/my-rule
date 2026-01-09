<template>
  <div class="express-container">
    <label :for="`express-input-${uuid}`" v-if="isShowTitle">
      <div class="express-input-title absolute">表达式</div>
      <div class="express-input-body">
        <el-input
          :id="`express-input-${uuid}`"
          v-model="inputValue"
          v-bind="$attrs"
          :disabled="props.disabled"
          style="z-index: 9"
          :autosize="true"
        />
        <div class="express-highlight" v-html="inputValueLua"></div>
      </div>

      <div class="express-input-utils absolute">
        <el-icon @click="showSearchParam"><Search /></el-icon>
        <el-icon
          class="copy-button"
          :data-clipboard-target="`#express-input-${uuid}`"
          @click="copy"
        >
          <CopyDocument />
        </el-icon>
        <el-icon @click="showFullScreen"><FullScreen /></el-icon>
      </div>
      <div class="express-input-search">
        <div
          class="express-input-autocomplete position-absolute"
          v-if="autoCompleteShow && !searchParamShow"
          v-click-outside="() => (autoCompleteShow = false)"
        >
          <div
            class="autocomplete-item"
            v-for="(item, index) in autoCompleteData"
            :key="index"
            :class="{ active: index === autoCompleteActiveIndex }"
            @click="selectAutoCompleteItem(item.code)"
          >
            <span>
              <span>{{ item.name }}</span>
              <span style="color: rgb(152, 158, 170); margin-left: 4px">{{ item.code }}</span>
            </span>
            <span>{{ item.type }}</span>
          </div>
        </div>

        <div
          class="search-container position-absolute"
          v-if="searchParamShow"
          v-click-outside="clickOutside"
        >
          <el-input
            class="search-input"
            placeholder="搜索参数"
            v-model="searchParamKey"
            :prefix-icon="Search"
            @input="searchAll"
          />
          <div class="search-result-container">
            <div
              v-if="_searchData.length > 0"
              class="search-result-item"
              v-for="(l, i) in _searchData"
              :key="i"
            >
              <p class="search-result-item__title" v-if="l.children.length > 0">{{ l.name }}</p>
              <p
                class="search-result-item__value"
                v-for="(_l, _i) in l.children"
                :key="_i"
                @click="handleClickItem(_l.code, `express-input-${uuid}`)"
              >
                <span>
                  <span>{{ _l.name }}</span>
                  <span style="color: rgb(152, 158, 170); margin-left: 4px">{{ _l.code }}</span>
                </span>
                <span>{{ _l.type }}</span>
              </p>
            </div>
            <el-empty v-else description="暂无数据" style="padding: 0" />
          </div>
        </div>
      </div>
    </label>
  </div>
  <el-dialog
    v-model="fullScreenShow"
    title="表达式编辑器"
    :show-close="false"
    :width="800"
    class="express-dialog"
    append-to-body
    :close-on-click-modal="false"
    :destroy-on-close="true"
  >
    <template #default>
      <label :for="`express-dialog-input-${uuid}`">
        <div class="express-input-body dialog">
          <el-input
            :id="`express-dialog-input-${uuid}`"
            type="textarea"
            v-model="dialogInputValue"
            :autosize="{ minRows: 2, maxRows: 999 }"
          />
          <div class="express-highlight" v-html="dialogInputValueLua"></div>
        </div>
        <p style="padding: 8px 0; font-weight: 400">
          请从左侧面板选择字段名和函数，或输入函数
          <span style="color: rgb(4, 49, 250)">查看帮助</span>
        </p>
        <div class="express-dialog-container">
          <div class="express-dialog-container-item">
            <p class="body-item__title">
              参数列表
              <el-input
                class="search-input"
                placeholder="搜索参数"
                v-model="searchParamKey"
                :prefix-icon="Search"
                style="width: 150px"
                @keyup.enter.native="searchData"
              />
            </p>
            <div class="body-item__container">
              <div class="container-title">
                <el-radio-group size="small" v-model="paramsRadio">
                  <el-radio-button :label="0">上游节点</el-radio-button>
                  <el-radio-button :label="1">参数管理</el-radio-button>
                  <el-radio-button :label="2" v-show="showCommonParam">通用参数</el-radio-button>
                  <el-radio-button :label="3">画布参数</el-radio-button>
                </el-radio-group>
              </div>
              <div class="container-body">
                <el-tree
                  ref="treeRef"
                  :filter-node-method="filterNode"
                  style="max-width: 600px"
                  :data="treeData[paramsRadio]"
                  :props="{ children: 'children', label: 'name' }"
                  @node-click="e => handleClickItem(e.code, `express-dialog-input-${uuid}`)"
                >
                  <template #default="{ node, data }">
                    <span class="name">
                      <template v-if="!data.desc">
                        {{ data.name }}
                      </template>
                      <template v-else>
                        <el-tooltip effect="dark" :content="data.desc" placement="top">
                          {{ data.name }}
                        </el-tooltip>
                      </template>
                      <span style="color: #989eaa; margin-left: 4px">{{ data.code }}</span>
                    </span>
                    <span class="type">
                      {{ data?.children ? '' : data.type }}
                    </span>
                  </template>
                </el-tree>
              </div>
            </div>
          </div>
          <div class="express-dialog-container-item" style="flex: unset; width: 30%">
            <p class="body-item__title">函数列表</p>
            <div class="body-item__container">
              <div class="container-title">
                <el-select v-model="operaRadio" size="small">
                  <el-option
                    v-for="(item, index) in operator"
                    :key="index"
                    :label="item.operaDict"
                    :value="item.operaDict"
                  />
                </el-select>
              </div>
              <div class="container-body">
                <template v-for="item in operatorList" :key="item.operaValue">
                  <el-tooltip placement="top" :show-after="300">
                    <p
                      class="bar-list__item"
                      @click="
                        handleClickItem(item.operaValue, `express-dialog-input-${uuid}`, true)
                      "
                    >
                      {{ item.operaValue }}
                    </p>
                    <template #content>
                      <p class="tooltip-item__title">{{ item.operaDesc }}</p>
                      <p class="tooltip-item__value">例如{{ item.operaTemplate }}</p>
                    </template>
                  </el-tooltip>
                </template>
              </div>
            </div>
          </div>
        </div>
      </label>
    </template>
    <template #footer>
      <el-button type="primary" @click="commitExpress">确定</el-button>
      <el-button @click="cancelExpress">取消</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { CopyDocument, FullScreen, Search } from '@element-plus/icons-vue'
import { WorkflowData } from '@/type/workflow'
import { useVModel } from '@vueuse/core'
import { ElMessage } from 'element-plus'
import { operator } from './operator'
import hljs from 'highlight.js'
import 'highlight.js/styles/atom-one-dark.css'
import Clipboard from 'clipboard'
import { useRoute } from 'vue-router'

import { useDialogDrag } from '@/hooks/useDialogDrag'

const { initDialog } = useDialogDrag()

const route = useRoute()
const props = defineProps({
  modelValue: {
    type: String,
    required: true,
    default: ''
  },
  defaultShowFullScreen: {
    type: Boolean,
    default: false
  },
  showCommonParam: {
    type: Boolean,
    default: false
  },
  isShowTitle: {
    type: Boolean,
    default: true
  },
  nodeData: {
    type: Object
  },
  workflowData: {
    type: Object as PropType<WorkflowData>,
    default: false
  },
  confirm: {
    type: Function,
    default: () => {}
  },
  cancel: {
    type: Function,
    default: () => {}
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const inputValue = useVModel(props, 'modelValue', emit)
const dialogInputValue = ref('')

const inputValueLua = ref('')
const dialogInputValueLua = ref('')

// 自动联想相关
const autoCompleteShow = ref(false)
const autoCompleteActiveIndex = ref(-1)
const autoCompleteData = ref<any[]>([])

const fullScreenShow = ref(false)

// 添加键盘事件处理函数
const handleKeyDown = (e: KeyboardEvent) => {
  if (!autoCompleteShow.value) return
  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault()
      autoCompleteActiveIndex.value =
        (autoCompleteActiveIndex.value + 1) % autoCompleteData.value.length
      break
    case 'ArrowUp':
      e.preventDefault()
      autoCompleteActiveIndex.value =
        (autoCompleteActiveIndex.value - 1 + autoCompleteData.value.length) %
        autoCompleteData.value.length
      break
    case 'Enter':
      e.preventDefault()
      if (autoCompleteActiveIndex.value >= 0 && autoCompleteData.value.length > 0) {
        selectAutoCompleteItem(autoCompleteData.value[autoCompleteActiveIndex.value].code)
        autoCompleteActiveIndex.value = -1
      }
      break
    case 'Escape':
      autoCompleteShow.value = false
      autoCompleteActiveIndex.value = -1
      break
  }
}

watch(
  () => inputValue.value,
  val => {
    // const input = document.getElementById('express-input')
    // input.style.color = 'rgb(96, 98, 102)'
    inputValueLua.value = hljs.highlight(val, { language: 'lua' }).value
    // input.style.color = 'transparent'
  },
  { deep: true, immediate: true }
)

watch(
  () => inputValue.value,
  val => {
    // 自动联想逻辑
    const lastSegment = val
      .split(/[^a-zA-Z0-9_\u4e00-\u9fa5]/)
      .pop()
      .toLowerCase() // 获取最后一个片段
    if (lastSegment.length > 0) {
      autoCompleteData.value = filterData()
        .flatMap(group => group.children || [])
        .filter(
          item =>
            item.code.toLowerCase().startsWith(lastSegment) &&
            item.code.toLowerCase() !== lastSegment
        )
        .slice(0, 10) // 限制显示数量
      autoCompleteShow.value = autoCompleteData.value.length > 0
    } else {
      autoCompleteShow.value = false
    }
  },
  { deep: true }
)

watch(
  () => dialogInputValue.value,
  val => {
    // const input = document.getElementById('express-input')
    // input.style.color = 'rgb(96, 98, 102)'
    dialogInputValueLua.value = hljs.highlight(val, { language: 'lua' }).value
    // input.style.color = 'transparent'
  },
  { deep: true, immediate: true }
)

// 参数搜索
const searchParamShow = ref(false)
const searchParamKey = ref('')
const showSearchParam = () => {
  if (props.disabled) {
    return
  }
  searchParamKey.value = ''
  searchAll()
  // _searchData.value = []
  searchParamShow.value = true
}
const clickOutside = () => {
  searchParamShow.value = false
}

// 点击参数 添加至光标
const handleClickItem = (item, id, shouldSpace = false) => {
  if (!item) {
    return
  }
  const dom = document.getElementById(id) as HTMLInputElement
  const start = dom.selectionStart
  const end = dom.selectionEnd
  switch (id) {
    case `express-input-${uuid.value}`:
      inputValue.value =
        inputValue.value.substring(0, start) +
        (shouldSpace ? ' ' : '') +
        item +
        inputValue.value.substring(end)
      break
    case `express-dialog-input-${uuid.value}`:
      dialogInputValue.value =
        dialogInputValue.value.substring(0, start) +
        (shouldSpace ? ' ' : '') +
        item +
        dialogInputValue.value.substring(end)
      break
  }
  nextTick(() => {
    dom.setSelectionRange(
      start + item.length + (shouldSpace ? 1 : 0),
      start + item.length + (shouldSpace ? 1 : 0)
    )
  })
}

const selectAutoCompleteItem = code => {
  const val = inputValue.value
  const lastSegment = val.split(/[^a-zA-Z0-9_\u4e00-\u9fa5]/).pop()
  const startIndex = val.lastIndexOf(lastSegment)

  inputValue.value =
    val.substring(0, startIndex) + code + val.substring(startIndex + lastSegment.length)
  autoCompleteShow.value = false

  // 设置光标位置
  nextTick(() => {
    const dom = document.getElementById(`express-input-${uuid.value}`) as HTMLInputElement
    const newPos = startIndex + code.length
    dom.setSelectionRange(newPos, newPos)
  })
}

// 复制
const copy = () => {
  if (props.disabled) {
    return
  }
  // navigator.clipboard.writeText(inputValue.value).then(res => {
  //   ElMessage.success('复制成功')
  // })
  let clipboard = new Clipboard('.copy-button')
  clipboard.on('success', function (e) {
    e.clearSelection()
    clipboard.destroy()
    ElMessage.success('复制成功')
  })
}

// 打开详细功能
const showFullScreen = () => {
  if (props.disabled) {
    return
  }
  dialogInputValue.value = inputValue.value
  searchParamKey.value = ''
  fullScreenShow.value = true
  nextTick(() => {
    initDialog()
  })
}

const commitExpress = () => {
  inputValue.value = dialogInputValue.value
  fullScreenShow.value = false
  // 调用confirm函数
  props.confirm(dialogInputValue.value)
}

const cancelExpress = () => {
  dialogInputValue.value = ''
  fullScreenShow.value = false
  // 调用cancel函数
  props.cancel()
}

//参数列表相关
const paramsRadio = ref(0)

// 函数列表相关
const operaRadio = ref('计算运算符')
const operatorList = computed(() => {
  return operator.find(item => item.operaDict === operaRadio.value)?.operaList || []
})

const treeData = ref<{ name: string; code: string; children: any[] }[][]>([])

const partList = ref<{ name: string; code: string; children: any[] }[]>([])

const flatTreeData = ref<{ name: string; code: string; children: any[] }[]>([])

// 生成随机字符串 ID
function generateRandomId(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

const uuid = ref('')
onMounted(async () => {
  uuid.value = generateRandomId()
  partList.value = await getPartList()

  treeData.value = [partList.value]
  flatTreeData.value = [{ name: '上游节点', code: '', children: partList.value }]
  fullScreenShow.value = props.defaultShowFullScreen
  if (props.defaultShowFullScreen) {
    nextTick(() => {
      initDialog()
    })
  }

  nextTick(() => {
    document
      .getElementById(`express-input-${uuid.value}`)
      ?.addEventListener('keydown', handleKeyDown)
    if (props.defaultShowFullScreen && !props.isShowTitle) {
      dialogInputValue.value = inputValue.value
    }
  })
})

onUnmounted(() => {
  // document.getElementById('express-input').removeEventListener('keydown', handleKeyDown);
})

const getPartList = async () => {
  console.log('props.nodeData', props.nodeData?.id)
  const nodeId = props.nodeData?.id
  if (!nodeId) {
    return []
  }
  const { edges, nodeList } = props.workflowData
  // 获取连接源
  // const source = edges.filter(e => e.target === props.nodeId).map(e => ({
  //   sourceId: e.source,
  //   sourcePort: e.sourcePort
  // }))
  const sourceIds = edges.filter(e => e.target === nodeId).map(e => e.source)

  // 获取连接源节点，且上游节点的outputData的
  const sourceNodes = nodeList.filter(n => sourceIds.includes(n.id))

  const result = []
  sourceNodes.forEach(n => {
    const outputDataItem = n.outputData.find(e => e.type === 'table')
    const typeList = getTypeList(outputDataItem?.subType)
    result.push({
      name: n.title,
      code: '',
      children: typeList
    })
  })

  return result
}

const getTypeList = str => {
  const result = []
  if (!str) {
    return result
  }
  if (str.substr(str.length - 2) === '[]') {
    str = str.substr(0, str.length - 2)
  }
  if (!(str.substr(0, 1) === '{' && str.substr(str.length - 1) === '}')) {
    return result
  }
  // 去掉最外层花括号
  str = str.substr(1, str.length - 2)
  str = str.split(',')
  str.map(item => {
    const arr = item.split(':')
    result.push({
      name: arr[0] || 'undefined',
      code: arr[0] || 'undefined',
      type: arr[1] || 'undefined'
    })
  })
  return result
}

const filterData = () => {
  const arr = flatTreeData.value
  if (!searchParamKey.value) {
    return arr
  }
  return arr
    .map(e => {
      const _arr = e.children.filter(item =>
        item.code.toLowerCase().includes(searchParamKey.value.toLowerCase())
      )
      if (_arr.length > 0) {
        return {
          ...e,
          children: _arr
        }
      }
    })
    .filter(Boolean)
}

const _searchData = ref([])
const searchAll = () => {
  _searchData.value = filterData()
}

const treeRef = ref()
const searchData = () => {
  treeRef.value.filter(searchParamKey.value)
}

const filterNode = (value: string, data: any) => {
  if (!value) return true
  value = value.toLowerCase()
  return data.code.toLowerCase().includes(value) || data.name.toLowerCase().includes(value)
}
</script>

<style lang="scss">
.express-dialog .el-dialog__body {
  padding: 12px 20px;
}
</style>
<style scoped lang="scss">
.express-container {
  width: 100%;
  :deep(.el-textarea__inner) {
    padding: 30px 8px 8px 8px;
  }
  position: relative;
  .absolute {
    position: absolute;
    top: 8px;
    font-size: 14px;
    z-index: 99;
    height: 14px;
    line-height: 14px;
  }
  .express-input-title {
    left: 8px;
  }
  .express-input-utils {
    right: 8px;
    cursor: pointer;
    :deep(.el-icon) {
      margin-left: 4px;
    }
  }
  .express-input-search {
    position: relative;
    .position-absolute {
      z-index: 999;
      position: absolute;
      display: flex;
      flex-direction: column;
      top: 8px;
      width: 100%;
      border: 1px solid #dcdfe6;
      border-radius: 4px;
      background: #fff;
      max-height: 300px;
      overflow: overlay;
    }
    .express-input-autocomplete {
      .autocomplete-item {
        padding: 0px 8px;
        font-weight: 400;
        font-size: 14px;
        height: 32px;
        line-height: 32px;
        display: flex;
        justify-content: space-between;
        &.active {
          background: #f5f7fa;
          cursor: pointer;
        }
        &:hover {
          background: #f5f7fa;
          cursor: pointer;
        }
      }
    }
    .search-container {
      padding: 8px;
      height: 300px;
      .search-input {
        height: 30px;
      }
      .search-result-container {
        flex: 1 1 0;
        overflow-y: overlay;
        .search-result-item {
          .search-result-item__title {
            height: 32px;
            line-height: 32px;
            font-weight: 400;
            font-size: 14px;
          }
          .search-result-item__value {
            height: 32px;
            line-height: 32px;
            font-weight: 400;
            font-size: 14px;
            display: flex;
            justify-content: space-between;
            span {
              &:nth-child(2) {
                color: #c6cacf;
              }
            }
            &:hover {
              background: #f5f7fa;
              cursor: pointer;
            }
          }
        }
        .search-result-none {
          display: flex;
          justify-content: center;
          align-items: center;
          text-align: center;
        }
      }
    }
  }
}
.express-dialog-container {
  display: flex;
  flex-direction: row;
  gap: 8px;

  .express-dialog-container-item {
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    flex: 1 1 0;
    .body-item__title {
      padding: 8px;
      border-bottom: 1px solid #dcdfe6;
      font-weight: 400;
      line-height: 32px;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
    }
    .body-item__container {
      .container-title {
        padding: 8px;
      }
      .container-body {
        margin-top: 8px;
        height: 300px;
        overflow-y: overlay;
        .bar-list__item {
          padding: 2px 8px;
          font-weight: 400;
          &:hover {
            background: #f5f7fa;
            cursor: pointer;
          }
        }
      }
    }
  }
}

.express-input-body {
  position: relative;
  :deep(.el-textarea__inner) {
    font-size: 14px;
    padding: 30px 8px 11px 8px;
    background-color: transparent;
    color: transparent;
    caret-color: #333;
    z-index: 99;
    white-space: pre-wrap;
    word-wrap: break-word;
    //word-wrap: break-word;
    //word-break: break-all; // 允许在任意字符间换行
    /* 完全移除滚动条 */
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* Internet Explorer 10+ */
    ::-webkit-scrollbar {
      /* Chrome, Safari, Opera*/
      display: none;
    }
    &.dialog {
      padding: 8px;
    }
  }
  .express-highlight {
    font-size: 14px;
    position: absolute;
    width: 100%;
    inset: 0;
    padding: 30px 8px 8px 8px;
    line-height: 1.5;
    //z-index: 999;
    font-weight: 400;
    white-space: pre-wrap;
    word-wrap: break-word;
    //word-wrap: break-word;
    //word-break: break-all; // 允许在任意字符间换行
    //background-color: transparent;
  }

  &.dialog {
    :deep(.el-textarea__inner) {
      padding: 8px;
    }
    .express-highlight {
      padding: 8px;
    }
  }
}

:deep(.el-tree-node__content) {
  display: flex;
  justify-content: space-between;
  .el-tree-node__expand-icon {
    width: 12px;
  }
  .name {
    flex: 1 1 0;
    font-weight: 400;
  }
  .type {
    margin: 0 4px;
    background: #fcf6eb;
    color: #e6a23c;
    padding: 0 4px;
    border-radius: 2px;
    font-weight: 400;
  }
}
</style>
