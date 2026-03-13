<template>
  <!-- 全屏编辑器 - 移到 body 层级 -->
  <Teleport to="body">
    <!-- 脚本编辑器全屏 -->
    <div v-if="isFullscreen" class="fullscreen-editor-overlay">
      <div class="fullscreen-editor-container">
        <div class="editor-toolbar">
          <el-button type="primary" size="small" circle @click.stop="toggleFullscreen">
            <el-icon><Close /></el-icon>
          </el-button>
        </div>
        <div ref="fullEditorRef" class="monaco-editor-container"></div>
      </div>
    </div>
  </Teleport>

  <el-drawer
    v-model="visible"
    title="测试"
    :before-close="closeDrawer"
    :close-on-press-escape="false"
    :close-on-click-modal="true"
    destroy-on-close
  >
    <el-tabs v-model="activeTab" class="test-tabs" :stretch="true" @tab-change="tabChange">
      <el-tab-pane label="脚本展示" name="script">
        <div class="tab-content">
          <div class="script-header">
            <span>全场景数据</span>
            <div ref="inputParamRootRef" class="input-param-root-editor"></div>
            <span>制定上下文</span>
            <div ref="inputParamContentRef" class="input-param-content-editor"></div>
            <!--                <el-input type="textarea" v-model="inputParam.root" />-->
            <el-button type="primary" :loading="isExecuting" @click.stop="executeTest">
              {{ isExecuting ? '执行中...' : '执行测试' }}
            </el-button>
          </div>
          <div class="editor-container">
            <div class="editor-toolbar">
              <el-button type="primary" size="small" circle @click.stop="toggleFullscreen">
                <el-icon><component :is="isFullscreen ? Close : FullScreen" /></el-icon>
              </el-button>
            </div>
            <div ref="editorRef" class="monaco-editor-container"></div>
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane label="执行结果" name="result" :disabled="true" lazy>
        <div class="tab-content">
          <div class="no-content-tip">
            <el-empty description="暂无执行结果"></el-empty>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </el-drawer>
</template>

<script setup lang="ts">
import {
  ref,
  defineEmits,
  defineExpose,
  watch,
  onUnmounted,
  computed,
  onMounted,
  nextTick
} from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  DocumentCopy,
  FullScreen,
  Close,
  Check,
  Download,
  ArrowDown,
  ArrowRight
} from '@element-plus/icons-vue'
import { http } from '@/axios'
import {
  getFormSign,
  FormSignRequestParams,
  FormSignResponse,
  debugRule,
  RuleDebugRequestParams,
  RuleDebugResponse,
  RuleItem,
  SimpleRuleItem,
  getAllRule,
  getSimpleRuleById,
  addExecutionRecord,
  AddExecutionRecordRequestParams,
  RuleDebugResponseResult,
  ExecutionRecordData,
  getTestCaseList,
  deleteTestCaseApi,
  TestCaseListRequestParams,
  getSimpleRuleList
} from '@/api/test'
import { JsCodeParser } from '@/utils/parser/JsCodeParser'
import { getFunctionListByIds, transformFunctionData } from '@/api/workflow/WorkFlowApi'
import { formatMilliseconds } from '@/utils'
import BaseNodeIcon from '@/components/base/BaseNodeIcon.vue'
import { getDefaultMonacoEditorConfig } from '@/utils/config/MonacoEditor'
import { MonacoInstance, MonacoManager } from '@/utils/manager/MonacoManager'

// 定义主题常量
const DARK_THEME = 'vs'
const LIGHT_THEME = 'vs'

// 定义事件
const emit = defineEmits(['close', 'node-click'])

// 状态变量
const activeTab = ref('script')
const scriptContent = ref('')
const isExecuting = ref(false) // 执行测试状态
const testResult = ref<RuleDebugResponseResult>({
  duration: 0,
  funcStepLogs: [],
  message: '',
  success: false
})
const nodeMap = ref<Map<string, any>>(new Map())

const visible = ref(false)

// 是否全屏状态
const isFullscreen = ref(false)

const manager = MonacoManager.getInstance()
// 编辑器容器引用
const editorRef = ref<HTMLElement | null>(null)
const fullEditorRef = ref<HTMLElement | null>(null)
const inputParamRootRef = ref<HTMLElement | null>(null)
const inputParamContentRef = ref<HTMLElement | null>(null)

// 编辑器实例
let editor: MonacoInstance['editor'] = null
let fullEditor: MonacoInstance['editor'] = null
let inputParamRoot: MonacoInstance['editor'] = null
let inputParamContent: MonacoInstance['editor'] = null

const inputParam = ref({
  root: '{}',
  content: '{}'
})

// 执行测试
const executeTest = async () => {
  if (!scriptContent.value) {
    ElMessage.warning('请输入脚本内容')
    return
  }

  // 设置执行状态
  isExecuting.value = true

  try {
    const _debug = () => {}
    const response = await _debug()
    if (response.success) {
      const result = JSON.parse(response.data.result)
      result.funcStepLogs = (result?.funcStepLogs || []).map((log: any) => {
        const node = nodeMap.value.get(log.nodeId.toString())
        if (node) {
          log = {
            ...log,
            logicData: node.logicData,
            title: node.title,
            funcType: node.funcType,
            funcId: node.funcId,
            remark: node.remark,
            pos: node.pos
          }
        }
        return log
      })
      testResult.value = result

      // 切换到执行结果标签页
      activeTab.value = 'result'
    }
  } catch (error) {
    console.error('测试执行失败:', error)
  } finally {
    // 重置执行状态
    isExecuting.value = false
  }
}

const tabChange = val => {
  // if (val === 'script') {
  //   // 切换到脚本标签页时，确保使用深色主题
  //   if (!editor && editorRef.value) {
  //   } else if (editor) {
  //     // 如果编辑器已存在，重新布局
  //     editor.layout()
  //   }
  // } else if (val === 'result') {
  //   // 切换到结果标签页时，确保使用浅色主题
  //   if (testResult.value.message) {
  //     setTimeout(() => {
  //       initLastNodeOutputEditor()
  //       // 总是初始化预期结果编辑器
  //     }, 500)
  //   }
  // }
}

// 打开抽屉
const openDrawer = (data: ExecutionRecordData) => {
  scriptContent.value = data.code
  const configData = JSON.parse(data.configData)
  nodeMap.value = new Map<string, any>()
  configData.nodeList.forEach((node: any) => {
    nodeMap.value.set(node.id, node)
  })
  visible.value = true
  nextTick(() => {
    manager
      .createInstance(editorRef.value, {
        ...getDefaultMonacoEditorConfig(),
        value: scriptContent.value
      })
      .then(({ id, editor: _editor }: MonacoInstance) => {
        editor = _editor
        // 设置监听事件
        editor.onDidChangeModelContent(() => {
          scriptContent.value = editor?.getValue() || ''
        })
      })
    manager
      .createInstance(inputParamRootRef.value, {
        ...getDefaultMonacoEditorConfig(),
        value: inputParam.value.root,
        language: 'json'
      })
      .then(({ id, editor: _editor }: MonacoInstance) => {
        inputParamRoot = _editor
        // 设置监听事件
        inputParamRoot.onDidChangeModelContent(() => {
          inputParam.value.root = inputParamRoot?.getValue() || ''
        })
      })
    manager
      .createInstance(inputParamContentRef.value, {
        ...getDefaultMonacoEditorConfig(),
        value: inputParam.value.root,
        language: 'json'
      })
      .then(({ id, editor: _editor }: MonacoInstance) => {
        inputParamContent = _editor
        // 设置监听事件
        inputParamContent.onDidChangeModelContent(() => {
          inputParam.value.content = inputParamContent?.getValue() || ''
        })
      })
  })
}

// 关闭抽屉
const closeDrawer = () => {
  editor && editor.dispose()
  fullEditor && fullEditor.dispose()
  testResult.value = {
    duration: 0,
    funcStepLogs: [],
    message: '',
    success: false
  }
  scriptContent.value = ''
  nodeMap.value.clear()
  isFullscreen.value = false
  visible.value = false
  emit('close')
}

// 打开关闭全屏bianjiqq8i
const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value

  if (isFullscreen.value) {
    setTimeout(() => {
      manager
        .createInstance(fullEditorRef.value, {
          ...getDefaultMonacoEditorConfig(),
          value: scriptContent.value
        })
        .then(({ id, editor: _editor }: MonacoInstance) => {
          fullEditor = _editor
          // 设置监听事件
          fullEditor.onDidChangeModelContent(() => {
            scriptContent.value = fullEditor?.getValue() || ''
          })
        })
    }, 100)
  } else {
    // 销毁全屏编辑器
    fullEditor.dispose()
  }
}

onMounted(() => {})

onUnmounted(() => {})

defineExpose({
  openDrawer,
  closeDrawer
})
</script>

<style lang="scss" scoped>
.test-tabs {
  height: 100%;
  display: flex;
  flex-direction: column;

  :deep(.el-tabs__header) {
    flex-shrink: 0;
  }

  :deep(.el-tabs__content) {
    flex: 1 1 0;
    //height: calc(100% - 40px);
    overflow: hidden;
    .el-tab-pane {
      height: 100%;
    }
  }

  :deep(.el-tabs__item) {
    padding: 0;
  }

  :deep(.el-tabs__item.is-active) {
    background: var(--el-color-primary-light-9, #ecf5fc);
    color: var(--el-color-primary, #3c79b4);
  }
}

.tab-content {
  height: 100%;
  padding: 5px 0;
  /* 确保内容可以正确滚动 */
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.script-header {
  display: flex;
  margin-bottom: 16px;
  gap: 10px;
  flex-shrink: 0;
  flex-direction: column;
}

.input-param-root-editor {
  width: 100%;
  height: 100px;
  border: 1px solid var(--el-border-color, #dcdfe6);
  border-radius: var(--el-border-radius-base, 4px);
}

.input-param-content-editor {
  width: 100%;
  height: 100px;
  border: 1px solid var(--el-border-color, #dcdfe6);
  border-radius: var(--el-border-radius-base, 4px);
}

.monaco-editor-container {
  width: 100%;
  flex: 1 1 0;
  //height: 100px;
}

.editor-container {
  height: 100%;
  border: 1px solid var(--el-border-color, #dcdfe6);
  border-radius: var(--el-border-radius-base, 4px);
  overflow: hidden;
  position: relative;
  display: flex;
  flex: 1;
  min-height: 0;
}

.editor-toolbar {
  position: absolute;
  top: 5px;
  right: 5px;
  z-index: 100;
  display: flex;
  gap: 0px;
  border-radius: 4px;
  padding: 2px;
}

.no-content-tip {
  padding: 0;
  background-color: var(--el-bg-color, #ffffff);
}

/* 全屏编辑器样式 */
.fullscreen-editor-overlay {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 100vw;
  background-color: #1e1e1e;
  z-index: 99999;
  display: flex;
  flex-direction: column;
}

.fullscreen-editor-container {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  .editor-toolbar {
    position: absolute;
    top: 20px;
    right: 20px;
    z-index: 100000;
    display: flex;
    gap: 0px;
  }
  .monaco-editor-container {
    width: 100%;
    height: 100%;
    flex: 1;
  }
}
</style>
