<template>
  <!-- 全屏编辑器 - 移到 body 层级 -->
  <Teleport to="body">
    <!-- XML编辑器全屏 -->
    <div v-if="isFullscreen.xml" class="fullscreen-editor-overlay">
      <div class="fullscreen-editor-container">
        <div class="editor-toolbar">
          <el-button type="primary" size="small" circle @click.stop="handleDownloadXml">
            <el-icon><Download /></el-icon>
          </el-button>
          <el-button type="primary" size="small" circle @click.stop="copyXmlContent">
            <el-icon><DocumentCopy /></el-icon>
          </el-button>
          <el-button type="primary" size="small" circle @click.stop="toggleFullscreen('xml')">
            <el-icon><Close /></el-icon>
          </el-button>
        </div>
        <div ref="xmlEditorFullscreenContainer" class="monaco-editor-container"></div>
      </div>
    </div>

    <!-- 脚本编辑器全屏 -->
    <div v-if="isFullscreen.script" class="fullscreen-editor-overlay">
      <div class="fullscreen-editor-container">
        <div class="editor-toolbar">
          <el-button type="primary" size="small" circle @click.stop="handleDownloadScript">
            <el-icon><Download /></el-icon>
          </el-button>
          <el-button type="primary" size="small" circle @click.stop="copyScriptContent">
            <el-icon><DocumentCopy /></el-icon>
          </el-button>
          <el-button type="primary" size="small" circle @click.stop="toggleFullscreen('script')">
            <el-icon><Close /></el-icon>
          </el-button>
        </div>
        <div ref="scriptEditorFullscreenContainer" class="monaco-editor-container"></div>
      </div>
    </div>

    <!-- 节点编辑器全屏 -->
    <div v-if="nodeFullscreen" class="fullscreen-editor-overlay">
      <div class="fullscreen-editor-container">
        <div class="editor-toolbar">
          <el-button
            type="primary"
            size="small"
            circle
            @click.stop="handleDownloadJSON(nodeFullscreen.nodeId, nodeFullscreen.type as 'input' | 'output')"
          >
            <el-icon><Download /></el-icon>
          </el-button>
          <el-button
            type="primary"
            size="small"
            circle
            @click.stop="copyNodeContent(nodeFullscreen.nodeId, nodeFullscreen.type as 'input' | 'output')"
          >
            <el-icon><DocumentCopy /></el-icon>
          </el-button>
          <el-button
            type="primary"
            size="small"
            circle
            @click.stop="toggleNodeFullscreen(nodeFullscreen.nodeId, nodeFullscreen.type as 'input' | 'output')"
          >
            <el-icon><Close /></el-icon>
          </el-button>
        </div>
        <div ref="nodeEditorFullscreenContainer" class="monaco-editor-container"></div>
      </div>
    </div>
  </Teleport>

  <!-- 遮罩层 -->
  <div v-if="drawerVisible && showMask" class="drawer-mask" @click="handleMaskClick"></div>

  <!-- 自定义测试抽屉 -->
  <div class="test-drawer" :class="{ 'drawer-open': drawerVisible }">
    <!-- 抽屉头部 -->
    <div class="drawer-header">
      <div class="drawer-title-container">
        <div class="drawer-title">{{ isPreviewMode ? '测试详情' : '测试' }}</div>
      </div>
      <div class="drawer-actions">
        <el-button size="small" circle @click="closeDrawer" class="close-btn">
          <el-icon><Close /></el-icon>
        </el-button>
      </div>
    </div>

    <!-- 标签页内容 -->
    <div class="drawer-content">
      <el-tabs v-model="activeTab" class="test-tabs" :stretch="true">
        <el-tab-pane label="XML检测" name="xml">
          <div class="tab-content">
            <div class="xml-header">
              <el-input
                v-model="partId"
                placeholder="part节点ID"
                class="part-id-input"
                :disabled="isPreviewMode"
                style="width: 150px"
                clearable
              />
              <div class="upload-section">
                <el-upload
                  v-if="!isPreviewMode"
                  :auto-upload="false"
                  :show-file-list="false"
                  accept=".xml"
                  @change="handleXmlImport"
                >
                  <el-button type="primary" :loading="isUploading">
                    {{ isUploading ? '上传中...' : '导入XML' }}
                  </el-button>
                </el-upload>
              </div>
            </div>

            <!-- 用例展示区域 -->
            <div class="test-case-section">
              <div class="test-case-list" ref="testCaseListRef">
                <div
                  v-for="testCase in testCases"
                  :key="testCase.id"
                  class="test-case-item"
                  :class="{ active: selectedTestCase?.id === testCase.id }"
                  @click="selectTestCase(testCase)"
                >
                  <div class="test-case-info">
                    <div
                      v-if="testCase.partName && testCase.partName.length > 0"
                      class="test-case-name-with-part"
                    >
                      <div class="test-case-name" :title="testCase.fileCName">
                        {{ testCase.fileCName }}
                      </div>
                      <div class="test-case-part-name" :title="testCase.partName">
                        {{ testCase.partName }}
                      </div>
                    </div>
                    <div v-else class="test-case-name-full" :title="testCase.fileCName">
                      {{ testCase.fileCName }}
                    </div>
                  </div>
                  <div class="test-case-actions">
                    <span
                      v-if="!isPreviewMode"
                      class="delete-text-btn"
                      @click.stop="deleteTestCase(testCase)"
                      :class="{ loading: deletingTestCaseId === testCase.id }"
                    >
                      {{ deletingTestCaseId === testCase.id ? '删除中...' : '删除' }}
                    </span>
                  </div>
                </div>
                <div v-if="testCases.length === 0" class="no-test-cases">
                  <el-empty description="暂无用例数据" :image-size="10" />
                </div>
              </div>
            </div>
            <div class="editor-container">
              <div class="editor-toolbar">
                <el-button type="primary" size="small" circle @click.stop="handleDownloadXml">
                  <el-icon><Download /></el-icon>
                </el-button>
                <el-button type="primary" size="small" circle @click.stop="copyXmlContent">
                  <el-icon><DocumentCopy /></el-icon>
                </el-button>
                <el-button type="primary" size="small" circle @click.stop="toggleFullscreen('xml')">
                  <el-icon><component :is="isFullscreen.xml ? Close : FullScreen" /></el-icon>
                </el-button>
              </div>
              <div ref="xmlEditorContainer" class="monaco-editor-container"></div>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="脚本展示" name="script">
          <div class="tab-content">
            <div class="script-header">
              <el-select
                v-model="selectedRule"
                placeholder="请选择工作流规则"
                class="rule-select"
                :disabled="isPreviewMode || isFromRuleEdit"
                clearable
                filterable
              >
                <el-option
                  v-for="option in ruleOptions"
                  :key="option.id"
                  :label="`${option.id}: ${option.ruleName}`"
                  :value="option.id"
                />
              </el-select>
              <el-button
                v-if="!isPreviewMode"
                type="primary"
                :loading="isExecuting"
                @click.stop="executeTest"
              >
                {{ isExecuting ? '执行中...' : '执行测试' }}
              </el-button>
            </div>
            <div class="editor-container">
              <div class="editor-toolbar">
                <el-button type="primary" size="small" circle @click.stop="handleDownloadScript">
                  <el-icon><Download /></el-icon>
                </el-button>
                <el-button type="primary" size="small" circle @click.stop="copyScriptContent">
                  <el-icon><DocumentCopy /></el-icon>
                </el-button>
                <el-button
                  type="primary"
                  size="small"
                  circle
                  @click.stop="toggleFullscreen('script')"
                >
                  <el-icon><component :is="isFullscreen.script ? Close : FullScreen" /></el-icon>
                </el-button>
              </div>
              <div ref="scriptEditorContainer" class="monaco-editor-container"></div>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="执行结果" name="result" lazy>
          <div class="tab-content">
            <div v-if="testResult.message" class="result-container">
              <div class="result-header">
                <div class="result-baseInfo">
                  <div class="result-status" :class="{ success: testResult.success }">
                    <span class="result-status-icon" :class="{ success: testResult.success }">
                      <el-icon><component :is="testResult.success ? Check : Close" /></el-icon>
                    </span>
                    <span class="result-status-text">
                      {{ testResult.success ? '成功' : '失败' }}
                    </span>
                  </div>
                  <div class="result-time" v-if="testResult.duration">
                    规则执行时长：{{ formatMilliseconds(testResult.duration) }}
                  </div>
                </div>
                <div class="result-message" v-if="!testResult.success">
                  <div class="result-message-title">执行失败原因</div>
                  <div class="result-message-content">
                    {{ testResult.message || '暂无执行结果' }}
                  </div>
                </div>

                <!-- 成功时显示最后一个节点的output -->
                <div v-if="testResult.success && lastNodeOutput" class="result-success-output">
                  <div class="output-header" @click="toggleOutputExpanded">
                    <div class="output-title">
                      <span>输出结果</span>
                    </div>
                    <div class="output-actions">
                      <el-button type="primary" size="small" @click.stop="saveAsExpectedResult">
                        保存为预期结果
                      </el-button>
                      <el-icon class="output-icon">
                        <component :is="outputExpanded ? ArrowDown : ArrowRight" />
                      </el-icon>
                    </div>
                  </div>
                  <div class="output-content" :class="{ expanded: outputExpanded }">
                    <div ref="lastNodeOutputEditorContainer" class="monaco-editor-container"></div>
                  </div>
                </div>

                <!-- 预期结果区域 -->
                <div v-if="testResult.success" class="result-expected-output">
                  <div class="output-header" @click="toggleExpectedResultExpanded">
                    <div class="output-title">
                      <span>预期结果</span>
                    </div>
                    <div class="output-actions">
                      <el-icon class="output-icon">
                        <component :is="expectedResultExpanded ? ArrowDown : ArrowRight" />
                      </el-icon>
                    </div>
                  </div>
                  <div class="output-content" :class="{ expanded: expectedResultExpanded }">
                    <div ref="expectedResultEditorContainer" class="monaco-editor-container"></div>
                  </div>
                </div>
              </div>

              <div
                ref="resultDetailsContainer"
                class="result-details"
                v-if="testResult.funcStepLogs && testResult.funcStepLogs.length > 0"
              >
                <el-collapse
                  v-model="activeNodePanels"
                  accordion
                  @change="handleNodeCollapseChange"
                >
                  <el-collapse-item
                    v-for="(node, index) in testResult.funcStepLogs"
                    :key="index"
                    :name="index"
                    :disabled="node.funcType === 'logic' && node.logicData?.logicType === 'ifelse'"
                  >
                    <template #title>
                      <div class="node-item">
                        <div class="node-icon">
                          <BaseNodeIcon
                            :type="node.funcType"
                            :logic-type="node.logicData?.logicType"
                            :size="24"
                          />
                        </div>
                        <div class="node-content">
                          <div class="node-header">
                            <div class="node-main-info">
                              <el-tooltip
                                :content="`${node.remark || node.title}`"
                                placement="top"
                                :show-after="500"
                              >
                                <span class="node-name">{{ node.nodeId }} | {{ node.title }}</span>
                              </el-tooltip>
                              <el-space>
                                <span class="node-duration">
                                  {{ formatMilliseconds(node.duration) }}
                                </span>
                                <span
                                  class="node-status"
                                  :class="node.success ? 'success' : 'failure'"
                                >
                                  <el-icon>
                                    <component :is="node.success ? Check : Close" />
                                  </el-icon>
                                </span>
                              </el-space>
                            </div>
                          </div>
                        </div>
                      </div>
                    </template>

                    <div class="node-detail-content">
                      <!-- 请求参数 -->
                      <div class="editor-section">
                        <h4>请求参数</h4>
                        <div class="editor-container fixed-height">
                          <div class="editor-toolbar">
                            <el-button
                              type="primary"
                              size="small"
                              circle
                              @click.stop="handleDownloadJSON(index.toString(), 'input')"
                            >
                              <el-icon><Download /></el-icon>
                            </el-button>
                            <el-button
                              type="primary"
                              size="small"
                              circle
                              @click.stop="copyNodeContent(index.toString(), 'input')"
                            >
                              <el-icon><DocumentCopy /></el-icon>
                            </el-button>
                            <el-button
                              type="primary"
                              size="small"
                              circle
                              @click.stop="toggleNodeFullscreen(index.toString(), 'input')"
                            >
                              <el-icon>
                                <component
                                  :is="
                                    nodeFullscreen &&
                                    nodeFullscreen.nodeId === index.toString() &&
                                    nodeFullscreen.type === 'input'
                                      ? Close
                                      : FullScreen
                                  "
                                />
                              </el-icon>
                            </el-button>
                          </div>
                          <div
                            :ref="el => setEditorRef(el, index.toString(), 'input')"
                            class="monaco-editor-container"
                          ></div>
                        </div>
                      </div>
                      <!-- 响应结果 -->
                      <div class="editor-section">
                        <h4>响应结果</h4>
                        <div class="editor-container fixed-height">
                          <div class="editor-toolbar">
                            <el-button
                              type="primary"
                              size="small"
                              circle
                              @click.stop="handleDownloadJSON(index.toString(), 'output')"
                            >
                              <el-icon><Download /></el-icon>
                            </el-button>
                            <el-button
                              type="primary"
                              size="small"
                              circle
                              @click.stop="copyNodeContent(index.toString(), 'output')"
                            >
                              <el-icon><DocumentCopy /></el-icon>
                            </el-button>
                            <el-button
                              type="primary"
                              size="small"
                              circle
                              @click.stop="toggleNodeFullscreen(index.toString(), 'output')"
                            >
                              <el-icon>
                                <component
                                  :is="
                                    nodeFullscreen &&
                                    nodeFullscreen.nodeId === index.toString() &&
                                    nodeFullscreen.type === 'output'
                                      ? Close
                                      : FullScreen
                                  "
                                />
                              </el-icon>
                            </el-button>
                          </div>
                          <div
                            :ref="el => setEditorRef(el, index.toString(), 'output')"
                            class="monaco-editor-container"
                          ></div>
                        </div>
                      </div>
                    </div>
                  </el-collapse-item>
                </el-collapse>
              </div>
            </div>
            <div v-else class="no-content-tip">
              <el-empty description="暂无执行结果"></el-empty>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineEmits, defineExpose, watch, onUnmounted, computed, onMounted } from 'vue'
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
  saveAsExpectedResult as saveAsExpectedResultApi,
  SaveAsExpectedResultRequestParams,
  getSimpleRuleList
} from '@/api/test'
import { LuaGenerator } from '@/utils/json2lua/LuaGenerator'
import { getFunctionListByIds, transformFunctionData } from '@/api/workflow/WorkFlowApi'
import { formatMilliseconds } from '@/utils'
import BaseNodeIcon from '@/components/base/BaseNodeIcon.vue'
import { getLuaCodeMapByExpression } from '@/utils/expression'

// 定义主题常量
const DARK_THEME = 'vs'
const LIGHT_THEME = 'vs'

// 定义事件
const emit = defineEmits(['close', 'node-click'])

// 状态变量
const drawerVisible = ref(false)
const activeTab = ref('xml')
const selectedRule = ref<number | null>(null)
const partId = ref('')
const xmlContent = ref('')
const scriptContent = ref('')
const uploadedOssPath = ref('') // 存储上传后的OSS路径
const uploadedFileName = ref('') // 存储上传的文件名
const isUploading = ref(false) // 上传状态
const isExecuting = ref(false) // 执行测试状态
const isSaving = ref(false) // 保存状态
const testResult = ref<RuleDebugResponseResult>({
  duration: 0,
  funcStepLogs: [],
  message: '',
  success: false
})
const activeNodePanels = ref<string | null>(null)
const isPreviewMode = ref(false)
const isFromRuleEdit = ref(false) // 是否从规则编辑页面打开
const outputExpanded = ref(false) // 最后一个节点输出是否展开
const expectedResultExpanded = ref(false) // 预期结果是否展开
const luaGenerator = new LuaGenerator()
const nodeMap = ref<Map<string, any>>(new Map())

// 用例管理相关状态
const testCases = ref<ExecutionRecordData[]>([])
const selectedTestCase = ref<ExecutionRecordData | null>(null)
const isLoadingTestCases = ref(false)
const deletingTestCaseId = ref<number | null>(null)
const testCaseListRef = ref<HTMLElement | null>(null)

// 原始用例数据缓存，用于重复性校验
const originalTestCases = ref<ExecutionRecordData[]>([])

// 计算最后一个节点的输出
const lastNodeOutput = computed(() => {
  if (!testResult.value.funcStepLogs || testResult.value.funcStepLogs.length === 0) {
    return null
  }
  const lastNode = testResult.value.funcStepLogs[testResult.value.funcStepLogs.length - 1]
  return Object.prototype.hasOwnProperty.call(lastNode, 'result')
    ? JSON.stringify(lastNode.result, null, 2)
    : null
})

// 计算当前选中用例的预期结果
const expectedResult = computed(() => {
  return selectedTestCase.value?.expectedResult || ''
})

// 遮罩层配置
const showMask = ref(false) // 是否显示遮罩层，默认关闭

// 是否全屏状态
const isFullscreen = ref({
  xml: false,
  script: false
})

// 节点编辑器全屏状态
const nodeFullscreen = ref<{ nodeId: string; type: string } | null>(null)

// 编辑器容器引用
const xmlEditorContainer = ref<HTMLElement | null>(null)
const scriptEditorContainer = ref<HTMLElement | null>(null)
const resultDetailsContainer = ref<HTMLElement | null>(null)
const lastNodeOutputEditorContainer = ref<HTMLElement | null>(null)
const expectedResultEditorContainer = ref<HTMLElement | null>(null)

// 全屏编辑器容器引用
const xmlEditorFullscreenContainer = ref<HTMLElement | null>(null)
const scriptEditorFullscreenContainer = ref<HTMLElement | null>(null)
const nodeEditorFullscreenContainer = ref<HTMLElement | null>(null)

// 编辑器实例
let xmlEditor = null
let scriptEditor = null
let lastNodeOutputEditor = null
let expectedResultEditor = null

// 全屏编辑器实例
let xmlEditorFullscreen = null
let scriptEditorFullscreen = null
let nodeEditorFullscreen = null

// 从API获取的规则选项
const ruleOptions = ref<SimpleRuleItem[]>([])
// 使用 configData 生成 Lua 脚本
const generateLuaFromConfig = async (configData: string): Promise<string> => {
  if (!configData) return ''
  const workFlowJson = JSON.parse(configData)
  const allFuncId = workFlowJson.nodeList
    .filter((n: any) => n.funcType === 'func')
    .map((n: any) => n.funcId)
  if (allFuncId.length === 0) {
    const luaCode = luaGenerator.generate(workFlowJson, [], true, {})
    return luaCode
  }
  const functionItems = await getFunctionListByIds(allFuncId)
  const functionNodes = functionItems.map(item => transformFunctionData(item))

  const { expressionLuaCodeMap } = await getLuaCodeMapByExpression(workFlowJson.nodeList)
  if (!expressionLuaCodeMap) return

  const luaCode = luaGenerator.generate(workFlowJson, functionNodes, true, expressionLuaCodeMap)
  return luaCode
}

// 获取规则数据
const fetchRules = async () => {
  try {
    const response = await getSimpleRuleList()
    if (response.success) {
      // 只显示 id 和 ruleName，不再过滤 luaScript
      ruleOptions.value = response.data
        .filter(rule => rule.hasLuaScript)
        .map(rule => ({
          id: rule.id,
          ruleName: rule.ruleName,
          hasLuaScript: rule.hasLuaScript
        }))
    }
  } catch (error) {
    console.error('获取规则数据失败:', error)
  }
}

// 获取用例列表
const fetchTestCases = async (ruleId: number) => {
  if (!ruleId) return

  try {
    isLoadingTestCases.value = true
    console.log('开始获取用例列表，ruleId:', ruleId)
    const response = await getTestCaseList({ ruleId })
    console.log('获取用例列表响应:', response)
    if (response && response.data && response.data.length > 0) {
      // 缓存原始用例数据
      originalTestCases.value = response.data
      testCases.value = response.data
      console.log('用例列表设置成功，数量:', testCases.value.length)
    } else {
      console.log('没有用例数据或响应为空')
      // 清空现有数据
      testCases.value = []
      originalTestCases.value = []
    }
  } catch (error) {
    console.error('获取用例列表失败:', error)
    // 出错时也清空数据
    testCases.value = []
    originalTestCases.value = []
  } finally {
    isLoadingTestCases.value = false
  }
}

// 选择用例
const selectTestCase = async (testCase: ExecutionRecordData) => {
  selectedTestCase.value = testCase
  partId.value = testCase.partId
  uploadedOssPath.value = testCase.ossPath
  uploadedFileName.value = testCase.fileCName
  // 加载XML内容
  await fetchXmlContent()
}

// 删除用例
const deleteTestCase = async (testCase: ExecutionRecordData) => {
  try {
    await ElMessageBox.confirm(`确定要删除用例 "${testCase.fileCName}" 吗？`, '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    deletingTestCaseId.value = testCase.id

    // 从列表中移除
    const index = testCases.value.findIndex(item => item.id === testCase.id)
    if (index > -1) {
      testCases.value.splice(index, 1)
    }

    // 如果删除的是当前选中的用例，清空选择
    if (selectedTestCase.value?.id === testCase.id) {
      selectedTestCase.value = null
      partId.value = ''
      xmlContent.value = ''
      uploadedOssPath.value = ''
      uploadedFileName.value = ''

      if (xmlEditor) {
        xmlEditor.setValue('')
      }
    }

    const deleteParam = {
      id: testCase.id
    }

    deleteTestCaseApi(deleteParam)
      .then(() => {
        ElMessage.success('用例删除成功')
      })
      .catch(() => {
        ElMessage.error('删除用例失败')
      })
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除用例失败:', error)
      ElMessage.error('删除用例失败')
    }
  } finally {
    deletingTestCaseId.value = null
  }
}

// 监听规则选择变化，自动加载对应的Lua脚本和用例列表
watch(selectedRule, async (newRuleId: number) => {
  if (newRuleId && ruleOptions.value.length > 0) {
    try {
      // 通过新接口获取详细的规则数据
      const response = await getSimpleRuleById(newRuleId)
      if (response.success && response.data) {
        const selectedRuleData = response.data
        if (selectedRuleData.configData) {
          const configData = JSON.parse(selectedRuleData.configData)
          nodeMap.value = new Map<string, any>()
          configData.nodeList.forEach((node: any) => {
            nodeMap.value.set(node.id, node)
          })
          // 使用 configData 生成 Lua 脚本
          const generatedLuaScript = await generateLuaFromConfig(selectedRuleData.configData)
          scriptContent.value = generatedLuaScript
          if (scriptEditor) {
            scriptEditor.setValue(generatedLuaScript)
          }
        }
      }
    } catch (error) {
      console.error('获取规则详情失败:', error)
    }

    // 加载用例列表
    await fetchTestCases(newRuleId)
  }
})

// 复制XML内容
const copyXmlContent = () => {
  if (xmlEditor) {
    const content = xmlEditor.getValue()
    navigator.clipboard
      .writeText(content)
      .then(() => {
        ElMessage.success('XML内容已复制到剪贴板')
      })
      .catch(() => {
        ElMessage.error('复制失败，请手动选择复制')
      })
  }
}

// 复制脚本内容
const copyScriptContent = () => {
  if (scriptEditor) {
    const content = scriptEditor.getValue()
    navigator.clipboard
      .writeText(content)
      .then(() => {
        ElMessage.success('脚本内容已复制到剪贴板')
      })
      .catch(() => {
        ElMessage.error('复制失败，请手动选择复制')
      })
  }
}

// 复制节点内容
const copyNodeContent = (nodeId: string, type: 'input' | 'output') => {
  let content = ''

  // 处理最后一个节点输出
  if (nodeId === 'last') {
    if (!lastNodeOutput.value) {
      ElMessage.warning('没有可复制的内容')
      return
    }
    content = lastNodeOutput.value
  } else {
    // 处理普通节点
    const nodeIndex = parseInt(nodeId)
    const node = testResult.value.funcStepLogs[nodeIndex]
    if (!node) return

    content =
      type === 'input'
        ? JSON.stringify(node.inputParams || {}, null, 2)
        : JSON.stringify(node.result || {}, null, 2)
  }

  navigator.clipboard
    .writeText(content)
    .then(() => {
      if (nodeId === 'last') {
        ElMessage.success('最后一个节点输出已复制到剪贴板')
      } else {
        ElMessage.success(`${type === 'input' ? '请求参数' : '响应结果'}已复制到剪贴板`)
      }
    })
    .catch(() => {
      ElMessage.error('复制失败，请手动选择复制')
    })
}

// 保存为预期结果
const saveAsExpectedResult = async () => {
  if (!lastNodeOutput.value) {
    ElMessage.warning('没有可保存的输出结果')
    return
  }

  if (!selectedRule.value) {
    ElMessage.warning('请先选择工作流规则')
    return
  }

  if (!selectedTestCase.value) {
    ElMessage.warning('请先选择测试用例')
    return
  }

  if (!uploadedOssPath.value) {
    ElMessage.warning('没有XML文件信息')
    return
  }

  try {
    const params: SaveAsExpectedResultRequestParams = {
      id: selectedTestCase.value?.id || 0,
      expectedResult: lastNodeOutput.value
    }

    const response = await saveAsExpectedResultApi(params)

    if (response.success) {
      ElMessage.success('预期结果保存成功')

      // 更新当前用例的预期结果
      if (selectedTestCase.value) {
        selectedTestCase.value.expectedResult = lastNodeOutput.value
      }

      // 刷新预期结果显示
      if (expectedResultEditor) {
        expectedResultEditor.setValue(lastNodeOutput.value)
      }
    } else {
      ElMessage.error(response.error || '保存预期结果失败')
    }
  } catch (error) {
    console.error('保存预期结果失败:', error)
    ElMessage.error('保存预期结果失败')
  }
}

// 下载XML文件
const handleDownloadXml = async () => {
  // 优先使用当前编辑器中的XML内容
  let content = ''
  let fileName = ''

  if (xmlEditor) {
    content = xmlEditor.getValue()
  } else if (xmlContent.value) {
    content = xmlContent.value
  }

  if (!content.trim()) {
    ElMessage.warning('没有可下载的XML内容')
    return
  }

  try {
    // 如果有上传的文件名，使用它；否则生成默认文件名
    if (uploadedFileName.value) {
      fileName = uploadedFileName.value
    } else {
      // 生成默认文件名，包含时间戳
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
      fileName = `xml_content_${timestamp}.xml`
    }

    // 创建 Blob 对象，设置正确的MIME类型
    const blob = new Blob([content], { type: 'application/xml;charset=utf-8' })

    // 创建下载链接
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName

    // 触发下载
    document.body.appendChild(link)
    link.click()

    // 清理
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    ElMessage.success(`XML文件下载成功: ${fileName}`)
  } catch (error) {
    console.error('下载XML文件失败:', error)
    ElMessage.error('下载XML文件失败')
  }
}

// 下载脚本
const handleDownloadScript = () => {
  if (scriptEditor) {
    const content = scriptEditor.getValue()
    if (!content.trim()) {
      ElMessage.warning('脚本内容为空')
      return
    }

    // 获取当前选中的规则名称
    let ruleName = 'unknown'
    if (selectedRule.value && ruleOptions.value.length > 0) {
      const selectedRuleData = ruleOptions.value.find(
        (rule: SimpleRuleItem) => rule.id === selectedRule.value
      )
      if (selectedRuleData && selectedRuleData.ruleName) {
        // 清理规则名称中的特殊字符，避免文件名问题
        ruleName = selectedRuleData.ruleName.replace(/[<>:"/\\|?*]/g, '_').trim()
      }
    }

    // 创建 Blob 对象
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })

    // 创建下载链接
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url

    // 设置文件名，包含规则名称和时间戳
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
    link.download = `${ruleName}_${timestamp}.lua`

    // 触发下载
    document.body.appendChild(link)
    link.click()

    // 清理
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    ElMessage.success('脚本文件下载成功')
  } else {
    ElMessage.warning('没有可下载的脚本内容')
  }
}

// 下载JSON
const handleDownloadJSON = (nodeId?: string, type?: 'input' | 'output') => {
  // 确定要下载的内容
  let content = ''
  let fileName = ''

  if (nodeId && type) {
    // 处理最后一个节点输出
    if (nodeId === 'last') {
      if (!lastNodeOutput.value) {
        ElMessage.warning('没有可下载的输出内容')
        return
      }
      content = lastNodeOutput.value
      fileName = 'last_node_output'
    } else {
      // 从节点编辑器下载
      const nodeIndex = parseInt(nodeId)

      if (nodeIndex < 0 || nodeIndex >= testResult.value.funcStepLogs.length) {
        ElMessage.warning(`节点索引超出范围: ${nodeIndex}`)
        return
      }

      const node = testResult.value.funcStepLogs[nodeIndex]

      if (!node) {
        ElMessage.warning('节点数据不存在')
        return
      }

      content =
        type === 'input'
          ? JSON.stringify(node.inputParams || {}, null, 2)
          : JSON.stringify(node.result || {}, null, 2)

      // 获取节点信息用于文件名
      const nodeTitle = String(node.title || node.nodeId || 'node')
      const cleanNodeTitle = nodeTitle.replace(/[<>:"/\\|?*]/g, '_').trim()
      fileName = `${cleanNodeTitle}_${type}_${nodeIndex}`
    }
  } else if (nodeFullscreen.value) {
    // 从全屏节点编辑器下载
    if (nodeFullscreen.value.nodeId === 'last') {
      if (!lastNodeOutput.value) {
        ElMessage.warning('没有可下载的输出内容')
        return
      }
      content = lastNodeOutput.value
      fileName = 'last_node_output'
    } else {
      const nodeIndex = parseInt(nodeFullscreen.value.nodeId)

      if (nodeIndex < 0 || nodeIndex >= testResult.value.funcStepLogs.length) {
        ElMessage.warning(`节点索引超出范围: ${nodeIndex}`)
        return
      }

      const node = testResult.value.funcStepLogs[nodeIndex]

      if (!node) {
        ElMessage.warning('节点数据不存在')
        return
      }

      content =
        nodeFullscreen.value.type === 'input'
          ? JSON.stringify(node.inputParams || {}, null, 2)
          : JSON.stringify(node.result || {}, null, 2)

      // 获取节点信息用于文件名
      const nodeTitle = String(node.title || node.nodeId || 'node')
      const cleanNodeTitle = nodeTitle.replace(/[<>:"/\\|?*]/g, '_').trim()
      fileName = `${cleanNodeTitle}_${nodeFullscreen.value.type}_${nodeIndex}`
    }
  } else {
    ElMessage.warning('没有可下载的JSON内容')
    return
  }

  console.log('content:', content)
  console.log('fileName:', fileName)

  if (!content.trim()) {
    ElMessage.warning('JSON内容为空')
    return
  }

  try {
    // 创建 Blob 对象
    const blob = new Blob([content], { type: 'application/json;charset=utf-8' })

    // 创建下载链接
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url

    // 设置文件名，包含时间戳
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
    link.download = `${fileName}_${timestamp}.json`

    console.log('Downloading file:', link.download)

    // 触发下载
    document.body.appendChild(link)
    link.click()

    // 清理
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    ElMessage.success('JSON文件下载成功')
  } catch (error) {
    console.error('下载JSON文件时出错:', error)
    ElMessage.error('下载JSON文件失败')
  }
}

// XML格式化辅助函数
const formatXmlContent = (xmlString: string): string => {
  if (!xmlString.trim()) return xmlString

  try {
    // 使用DOMParser解析XML
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(xmlString, 'application/xml')

    // 检查解析是否有错误
    const parseError = xmlDoc.querySelector('parsererror')
    if (parseError) {
      console.warn('XML解析失败，返回原始内容:', parseError.textContent)
      return xmlString
    }

    // 使用XMLSerializer重新序列化，自动添加格式化
    const serializer = new XMLSerializer()
    const formattedXml = serializer.serializeToString(xmlDoc)

    // 手动添加换行和缩进以改善可读性
    return formatXmlString(formattedXml)
  } catch (error) {
    console.warn('XML格式化失败，返回原始内容:', error)
    return xmlString
  }
}

// XML字符串美化函数
const formatXmlString = (xml: string): string => {
  // 添加换行和缩进
  let formatted = xml
    .replace(/></g, '>\n<') // 在标签之间添加换行
    .replace(/^\s+|\s+$/g, '') // 去除首尾空白

  // 添加缩进
  const lines = formatted.split('\n')
  let indentLevel = 0
  const indent = '  ' // 使用2个空格作为缩进

  return lines
    .map(line => {
      const trimmedLine = line.trim()
      if (!trimmedLine) return ''

      // 减少缩进级别（对于结束标签）
      if (trimmedLine.startsWith('</')) {
        indentLevel = Math.max(0, indentLevel - 1)
      }

      const indentedLine = indent.repeat(indentLevel) + trimmedLine

      // 增加缩进级别（对于开始标签，但不是自闭合标签）
      if (
        trimmedLine.startsWith('<') &&
        !trimmedLine.startsWith('</') &&
        !trimmedLine.endsWith('/>')
      ) {
        indentLevel++
      }

      return indentedLine
    })
    .join('\n')
}

// 根据partID在XML中查找节点name的函数
const findPartNameById = (xmlString: string, partId: string): string => {
  if (!partId || !xmlString) return ''

  try {
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(xmlString, 'application/xml')

    // 检查解析是否有错误
    const parseError = xmlDoc.querySelector('parsererror')
    if (parseError) {
      console.warn('XML解析失败:', parseError.textContent)
      return ''
    }

    // 查找id等于partId的任意节点
    const node = xmlDoc.querySelector(`[id="${partId}"]`)
    if (node) {
      return node.getAttribute('name') || ''
    }

    return ''
  } catch (error) {
    console.warn('根据partID查找节点name失败:', error)
    return ''
  }
}

// 通过OSS路径获取XML内容
const fetchXmlContent = async () => {
  if (!uploadedOssPath.value) return
  try {
    // 获取签名URL
    const signData = await http.post({
      url: '/cloudstorage/sign',
      data: { signType: 1, key: uploadedOssPath.value }
    })

    if (!signData.success) {
      throw new Error('获取文件链接失败')
    }

    const fullUrl = signData.data
    const response = await fetch(fullUrl)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const rawContent = await response.text()
    // 格式化XML内容
    const formattedContent = formatXmlContent(rawContent)

    // 更新XML内容（使用格式化后的内容）
    xmlContent.value = formattedContent
    // 如果编辑器已存在，直接设置内容
    if (xmlEditor) {
      xmlEditor.setValue(formattedContent)
      xmlEditor.updateOptions({ readOnly: isPreviewMode.value })
    } else {
      // 如果编辑器还未初始化，延迟设置内容
      setTimeout(() => {
        if (xmlEditor) {
          xmlEditor.setValue(formattedContent)
          xmlEditor.updateOptions({ readOnly: isPreviewMode.value })
        }
      }, 800)
    }
  } catch (error) {
    console.error('获取XML内容失败:', error)
    ElMessage.error('获取XML文件内容失败')
  }
}

// xml和script的切换全屏显示
const toggleFullscreen = (type: 'xml' | 'script') => {
  isFullscreen.value[type] = !isFullscreen.value[type]

  if (isFullscreen.value[type]) {
    // 进入全屏
    document.body.style.overflow = 'hidden'

    // 设置其他全屏状态为false（一次只能有一个编辑器全屏）
    Object.keys(isFullscreen.value).forEach(key => {
      if (key !== type) {
        isFullscreen.value[key as 'xml' | 'script'] = false
      }
    })

    // 确保使用深色主题
    monaco.editor.setTheme(DARK_THEME)

    // 延迟创建全屏编辑器
    setTimeout(() => {
      if (type === 'xml') {
        createFullscreenXmlEditor()
      } else if (type === 'script') {
        createFullscreenScriptEditor()
      }
    }, 100)
  } else {
    // 退出全屏
    document.body.style.overflow = ''

    // 销毁全屏编辑器
    if (type === 'xml' && xmlEditorFullscreen) {
      xmlEditorFullscreen.dispose()
      xmlEditorFullscreen = null
    } else if (type === 'script' && scriptEditorFullscreen) {
      scriptEditorFullscreen.dispose()
      scriptEditorFullscreen = null
    }
  }
}

// 创建全屏XML编辑器
const createFullscreenXmlEditor = () => {
  if (xmlEditorFullscreen || !xmlEditorFullscreenContainer.value) return

  xmlEditorFullscreen = monaco.editor.create(xmlEditorFullscreenContainer.value as HTMLElement, {
    value: xmlContent.value,
    language: 'xml',
    theme: DARK_THEME,
    readOnly: isPreviewMode.value,
    minimap: { enabled: true },
    scrollBeyondLastLine: false,
    automaticLayout: true,
    fontSize: 12,
    lineNumbers: 'on',
    folding: true,
    wordWrap: 'on'
  })

  // 监听编辑器内容变更
  xmlEditorFullscreen.onDidChangeModelContent(() => {
    xmlContent.value = xmlEditorFullscreen?.getValue() || ''
  })

  // 布局编辑器
  setTimeout(() => {
    xmlEditorFullscreen?.layout()
    xmlEditorFullscreen?.focus()
  }, 100)
}

// 创建全屏脚本编辑器
const createFullscreenScriptEditor = () => {
  if (scriptEditorFullscreen || !scriptEditorFullscreenContainer.value) return

  scriptEditorFullscreen = monaco.editor.create(
    scriptEditorFullscreenContainer.value as HTMLElement,
    {
      value: scriptContent.value,
      language: 'lua',
      theme: DARK_THEME,
      readOnly: isPreviewMode.value,
      minimap: { enabled: true },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      fontSize: 12,
      lineNumbers: 'on',
      folding: true
    }
  )

  // 监听编辑器内容变更
  scriptEditorFullscreen.onDidChangeModelContent(() => {
    scriptContent.value = scriptEditorFullscreen?.getValue() || ''
  })

  // 布局编辑器
  setTimeout(() => {
    scriptEditorFullscreen?.layout()
    scriptEditorFullscreen?.focus()
  }, 100)
}

// 切换结果节点编辑器全屏
const toggleNodeFullscreen = (nodeId: string, type: 'input' | 'output') => {
  // 检查是否是最后一个节点输出
  if (nodeId === 'last') {
    if (!lastNodeOutput.value) return
  } else {
    if (!editorsMap.has(nodeId)) return
  }

  // 如果当前有节点编辑器处于全屏状态，先退出
  if (nodeFullscreen.value) {
    const prevNodeId = nodeFullscreen.value.nodeId
    const prevType = nodeFullscreen.value.type

    // 重置全屏状态
    nodeFullscreen.value = null
    document.body.style.overflow = ''

    // 销毁全屏编辑器
    if (nodeEditorFullscreen) {
      nodeEditorFullscreen.dispose()
      nodeEditorFullscreen = null
    }

    // 如果点击的是同一个编辑器，则仅退出全屏
    if (nodeId === prevNodeId && type === prevType) {
      return
    }
  }

  // 设置新的全屏状态
  nodeFullscreen.value = { nodeId, type }
  document.body.style.overflow = 'hidden'

  // 延迟创建全屏编辑器
  setTimeout(() => {
    createFullscreenNodeEditor(nodeId, type)
  }, 100)
}

// 创建全屏节点编辑器
const createFullscreenNodeEditor = (nodeId: string, type: 'input' | 'output') => {
  if (nodeEditorFullscreen || !nodeEditorFullscreenContainer.value) return

  let content = ''

  // 处理最后一个节点输出
  if (nodeId === 'last') {
    content = lastNodeOutput.value || ''
  } else {
    // 处理普通节点
    const nodeIndex = parseInt(nodeId)
    const node = testResult.value.funcStepLogs[nodeIndex]
    if (!node) return

    content =
      type === 'input'
        ? JSON.stringify(node.inputParams ?? null, null, 2)
        : JSON.stringify(node.result ?? null, null, 2)
  }

  nodeEditorFullscreen = monaco.editor.create(nodeEditorFullscreenContainer.value as HTMLElement, {
    value: content,
    language: 'json',
    theme: LIGHT_THEME,
    readOnly: true,
    minimap: { enabled: true },
    scrollBeyondLastLine: false,
    automaticLayout: true,
    fontSize: 12,
    lineNumbers: 'on',
    folding: true,
    wordWrap: 'on'
  })

  // 布局编辑器
  setTimeout(() => {
    nodeEditorFullscreen?.layout()
    nodeEditorFullscreen?.focus()
  }, 100)
}

// 监听ESC键退出全屏
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    // 检查是否有编辑器处于全屏状态
    const fullscreenType = Object.keys(isFullscreen.value).find(
      key => isFullscreen.value[key as 'xml' | 'script']
    ) as 'xml' | 'script' | undefined

    if (fullscreenType) {
      toggleFullscreen(fullscreenType)
      e.preventDefault()
      e.stopPropagation()
    } else if (nodeFullscreen.value) {
      // 退出节点编辑器全屏
      toggleNodeFullscreen(
        nodeFullscreen.value.nodeId,
        nodeFullscreen.value.type as 'input' | 'output'
      )
      e.preventDefault()
      e.stopPropagation()
    }
  }
}

const initTestCaseList = async () => {
  // 第一次打开XML标签页时加载用例列表
  console.log(
    'initTestCaseList 被调用，selectedRule.value:',
    selectedRule.value,
    'testCases.value.length:',
    testCases.value.length
  )
  if (selectedRule.value) {
    await fetchTestCases(selectedRule.value)
  }
}

// 初始化 XML 编辑器
const initXmlEditor = () => {
  if (xmlEditor || !xmlEditorContainer.value) return
  // 确保使用深色主题
  monaco.editor.setTheme(DARK_THEME)
  xmlEditor = monaco.editor.create(xmlEditorContainer.value as HTMLElement, {
    value: xmlContent.value,
    language: 'xml',
    theme: DARK_THEME,
    readOnly: isPreviewMode.value,
    minimap: { enabled: true },
    scrollBeyondLastLine: false,
    automaticLayout: true,
    fontSize: 12,
    lineNumbers: 'on',
    folding: true
  })
  //
  xmlEditor.onDidChangeModelContent(() => {
    xmlContent.value = xmlEditor?.getValue() || ''
  })
}

// 初始化脚本编辑器
const initScriptEditor = () => {
  if (scriptEditor || !scriptEditorContainer.value) return
  // 确保使用深色主题
  monaco.editor.setTheme(DARK_THEME)
  scriptEditor = monaco.editor.create(scriptEditorContainer.value as HTMLElement, {
    value: scriptContent.value,
    language: 'lua',
    theme: DARK_THEME,
    readOnly: isPreviewMode.value,
    minimap: { enabled: true },
    scrollBeyondLastLine: false,
    automaticLayout: true,
    fontSize: 12,
    lineNumbers: 'on',
    folding: true
  })
  // 监听编辑器内容变更
  scriptEditor.onDidChangeModelContent(() => {
    scriptContent.value = scriptEditor?.getValue() || ''
  })
}

// 处理XML文件导入
const handleXmlImport = async (file: any) => {
  // 读取文件为文本
  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e: any) => resolve(e.target.result)
      reader.onerror = () => reject(new Error('读取文件失败'))
      reader.readAsText(file)
    })
  }

  if (!file || !file.raw) {
    ElMessage.error('文件上传失败')
    return
  }

  // 设置上传状态
  isUploading.value = true

  try {
    // 1. 读取文件内容并验证XML格式
    const rawContent = await readFileAsText(file.raw)
    // 2. 格式化XML内容
    const formattedContent = formatXmlContent(rawContent)
    // 4. 获取文件签名
    const signParams = await getFileSign(file.raw)
    // 5. 上传文件到云存储
    const uploadResult = await uploadFileToCloud(file.raw, signParams)

    // 6. 保存OSS路径和文件名
    uploadedOssPath.value = uploadResult.ossPath
    uploadedFileName.value = file.raw.name

    // 7. 更新编辑器内容（使用格式化后的内容）
    xmlContent.value = formattedContent
    if (xmlEditor) {
      xmlEditor.setValue(formattedContent)
      xmlEditor.updateOptions({ readOnly: isPreviewMode.value })
    } else {
      setTimeout(() => {
        // 如果编辑器仍然不存在，尝试初始化
        if (xmlEditorContainer.value) {
          initXmlEditor()
          xmlEditor.setValue(formattedContent)
          xmlEditor.updateOptions({ readOnly: isPreviewMode.value })
        }
      }, 800)
    }

    // 8. 创建临时用例并添加到用例展示区
    if (selectedRule.value) {
      const tempTestCase: ExecutionRecordData = {
        id: Date.now(), // 使用时间戳作为临时ID
        ruleId: selectedRule.value,
        partId: '', // 默认为空字符串
        executionResult: '', // 默认为空字符串
        executionTime: 0, // 默认为0
        remark: '', // 默认为空字符串
        ossPath: uploadResult.ossPath,
        fileCName: file.raw.name, // 使用文件名作为中文名
        status: 1, // 默认为启用状态
        createTime: 1,
        modifyTime: 1,
        creator: '', // 默认为空字符串
        creatorName: '', // 默认为空字符串
        modifier: '', // 默认为空字符串
        modifierName: '', // 默认为空字符串
        ruleName: '', // 默认为空字符串
        ruleDesc: '', // 默认为空字符串
        ruleStatus: '', // 默认为空字符串
        sceneCategory: '', // 默认为空字符串
        ruleType: '', // 默认为空字符串
        luaScript: '', // 默认为空字符串
        configData: '', // 默认为空字符串
        expectedResult: '', // 默认为空字符串
        partName: '' // 默认为空字符串
      }

      // 添加到用例列表的开头
      testCases.value.unshift(tempTestCase)

      // 自动选中新创建的用例
      selectedTestCase.value = tempTestCase
      partId.value = tempTestCase.partId

      ElMessage.success('XML文件上传成功')
    } else {
      ElMessage.success('XML文件上传成功')
    }

    console.log('文件上传成功，OSS路径:', uploadResult.ossPath)
  } catch (error) {
    console.error('文件上传失败:', error)
  } finally {
    // 重置上传状态
    isUploading.value = false
  }
}

// 获取文件签名
const getFileSign = async (file: File): Promise<FormSignResponse['data']> => {
  // 生成唯一的文件路径
  const timestamp = Date.now()
  const fileName = `data/rule/test/${timestamp}/xml/${file.name}`
  const params: FormSignRequestParams = {
    signType: 1, // 根据实际需求设置签名类型
    protocolType: 0, // 根据实际需求设置协议类型
    key: fileName
  }
  const response: FormSignResponse = await getFormSign(params)
  if (!response.success) {
    throw new Error(response.error || '获取文件签名失败')
  }
  return response.data
}

// 上传文件到云存储
const uploadFileToCloud = async (
  file: File,
  signData: FormSignResponse['data']
): Promise<{ ossPath: string }> => {
  return new Promise((resolve, reject) => {
    const formData = new FormData()
    // 添加签名参数
    formData.append('OSSAccessKeyId', signData.signParams.OSSAccessKeyId)
    formData.append('policy', signData.signParams.policy)
    formData.append('signature', signData.signParams.signature)
    formData.append('success_action_status', signData.signParams.success_action_status)
    formData.append('x-oss-meta-auth', signData.signParams['x-oss-meta-auth'])
    formData.append('key', signData.key)
    // 添加文件
    formData.append(signData.formFile, file)
    // 创建XMLHttpRequest进行上传
    const xhr = new XMLHttpRequest()
    xhr.upload.onprogress = event => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100)
        console.log(`上传进度: ${percentComplete}%`)
      }
    }
    xhr.onload = () => {
      if (xhr.status === 200) {
        resolve({ ossPath: `${signData.key}` })
      } else {
        reject(new Error(`上传失败，状态码: ${xhr.status}`))
      }
    }
    xhr.onerror = () => {
      reject(new Error('网络错误，上传失败'))
    }
    xhr.open('POST', signData.url)
    xhr.send(formData)
  })
}

// 执行测试
const executeTest = async () => {
  if (!uploadedOssPath.value) {
    ElMessage.warning('请先上传XML文件')
    return
  }

  if (!scriptContent.value) {
    ElMessage.warning('请输入脚本内容')
    return
  }

  // 设置执行状态
  isExecuting.value = true

  try {
    // 1. 校验重复性
    const currentKey = {
      ruleId: selectedRule.value,
      ossPath: uploadedOssPath.value,
      partId: partId.value?.trim() || ''
    }

    // 检查是否与现有用例重复
    const isDuplicate = originalTestCases.value.some(
      testCase =>
        testCase.ruleId === currentKey.ruleId &&
        testCase.ossPath === currentKey.ossPath &&
        (testCase.partId || '') === currentKey.partId
    )

    // 2. 执行测试
    const params: RuleDebugRequestParams = {
      ossPath: uploadedOssPath.value,
      productId: partId.value?.trim(),
      returnPartAttributes: ['id', 'name'],
      luaScript: scriptContent.value
    }
    const response: RuleDebugResponse = await debugRule(params)
    if (response.success) {
      const result: RuleDebugResponseResult = JSON.parse(response.data.result)
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

      // 3. 直接触发保存测试结果的逻辑
      await saveTestResult()

      // 切换到执行结果标签页
      activeTab.value = 'result'

      // 如果执行有错误，滚动到底部
      if (!result.success) {
        setTimeout(() => {
          scrollToBottom()
        }, 100)
      }
    }
  } catch (error) {
    console.error('测试执行失败:', error)
  } finally {
    // 重置执行状态
    isExecuting.value = false
  }
}

const openDrawer = (
  data: ExecutionRecordData,
  isPreview: boolean = false,
  ismRuleEdit: boolean = false,
  targetTab?: string,
  mask: boolean = false
) => {
  drawerVisible.value = true
  showMask.value = mask // 设置是否显示遮罩层
  isPreviewMode.value = isPreview
  isFromRuleEdit.value = ismRuleEdit

  // 如果没有传入数据（测试模式），清理所有之前的状态
  if (!data) {
    partId.value = ''
    xmlContent.value = ''
    scriptContent.value = ''
    uploadedOssPath.value = ''
    uploadedFileName.value = ''
    testResult.value = {
      duration: 0,
      funcStepLogs: [],
      message: '',
      success: false
    }
    nodeMap.value.clear()
    activeNodePanels.value = null
    outputExpanded.value = false
    expectedResultExpanded.value = false
    selectedRule.value = null

    // 清空用例相关状态
    testCases.value = []
    selectedTestCase.value = null

    // 清理编辑器实例
    disposeEditors()

    // 重置全屏状态
    Object.keys(isFullscreen.value).forEach(key => {
      isFullscreen.value[key as 'xml' | 'script'] = false
    })
    nodeFullscreen.value = null
  }

  if (isFromRuleEdit.value && data.ruleId) {
    selectedRule.value = data.ruleId
  }

  if (data?.partId) {
    partId.value = data?.partId?.trim()
  }

  if (data?.ossPath) {
    uploadedOssPath.value = data.ossPath
    fetchXmlContent()
  }

  if (data?.fileCName) {
    uploadedFileName.value = data?.fileCName
  }

  if (data?.luaScript) {
    scriptContent.value = data.luaScript
    if (scriptEditor) {
      scriptEditor.setValue(data.luaScript)
      scriptEditor.updateOptions({ readOnly: isPreviewMode.value })
    }
    selectedRule.value = data.ruleId
  }

  if (data?.configData) {
    const configData = JSON.parse(data.configData)
    nodeMap.value = new Map<string, any>()
    configData.nodeList.forEach((node: any) => {
      nodeMap.value.set(node.id, node)
    })
  }

  if (data?.executionResult) {
    const result =
      typeof data.executionResult === 'string'
        ? JSON.parse(data.executionResult)
        : data.executionResult
    result.funcStepLogs = result.funcStepLogs.map((log: any) => {
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
  }

  if (targetTab) {
    activeTab.value = targetTab
  } else if (isPreviewMode.value) {
    activeTab.value = 'xml'
  }

  // 获取规则数据
  fetchRules()

  // 根据当前活动的标签页设置正确的主题
  setTimeout(() => {
    if (activeTab.value === 'xml' || activeTab.value === 'script') {
      monaco.editor.setTheme(DARK_THEME)
    } else if (activeTab.value === 'result') {
      monaco.editor.setTheme(LIGHT_THEME)
    }
  }, 300)
}

// 滚动到底部
const scrollToBottom = () => {
  if (resultDetailsContainer.value) {
    resultDetailsContainer.value.scrollTop = resultDetailsContainer.value.scrollHeight
  }
}

// 处理遮罩层点击
const handleMaskClick = () => {
  closeDrawer()
}

// 关闭抽屉
const closeDrawer = () => {
  // 退出所有全屏状态
  Object.keys(isFullscreen.value).forEach(key => {
    isFullscreen.value[key as 'xml' | 'script'] = false
  })

  // 清理节点编辑器全屏状态
  if (nodeFullscreen.value) {
    nodeFullscreen.value = null
  }

  // 销毁全屏编辑器实例
  if (xmlEditorFullscreen) {
    xmlEditorFullscreen.dispose()
    xmlEditorFullscreen = null
  }
  if (scriptEditorFullscreen) {
    scriptEditorFullscreen.dispose()
    scriptEditorFullscreen = null
  }
  if (nodeEditorFullscreen) {
    nodeEditorFullscreen.dispose()
    nodeEditorFullscreen = null
  }
  disposeLastNodeOutputEditor()

  // 只清理执行结果相关的数据
  testResult.value = {
    duration: 0,
    funcStepLogs: [],
    message: '',
    success: false
  }
  activeNodePanels.value = null
  outputExpanded.value = false
  expectedResultExpanded.value = false

  document.body.style.overflow = ''
  drawerVisible.value = false
  emit('close')
}

// 保存测试结果（内部函数，不检查备注）
const saveTestResult = async () => {
  if (!uploadedOssPath.value) {
    ElMessage.warning('请先上传XML文件')
    return
  }

  if (!selectedRule.value) {
    ElMessage.warning('请先选择工作流规则')
    return
  }

  if (!testResult.value.message) {
    ElMessage.warning('请先执行脚本')
    return
  }

  // 设置保存状态
  isSaving.value = true

  try {
    const partIdstr = partId.value?.trim()
    let partName = ''
    if (partIdstr) {
      partName = findPartNameById(xmlContent.value, partIdstr)
    }
    // 构建保存参数
    const params: AddExecutionRecordRequestParams = {
      ruleId: Number(selectedRule.value),
      partId: partIdstr,
      partName: partName,
      luaScript: scriptContent.value,
      executionResult: JSON.stringify(testResult.value),
      executionTime: testResult.value.duration || 0,
      remark: '自动保存', // 不再需要备注
      ossPath: uploadedOssPath.value,
      fileCName: uploadedFileName.value || ''
    }

    // 调用API保存执行记录
    const response = await addExecutionRecord(params)

    if (response.success) {
      ElMessage.success('测试结果保存成功')

      // 检查当前选中的用例是否为临时创建的用例
      if (selectedTestCase.value && selectedTestCase.value.id > 1000000000000) {
        // 更新临时用例的ID为返回的执行记录ID
        const tempTestCase = selectedTestCase.value
        tempTestCase.id = response.data

        // 重新刷新用例列表，确保数据一致性
        await fetchTestCases(selectedRule.value)
        const updatedTestCase = testCases.value.find(tc => tc.id === response.data)
        if (updatedTestCase) {
          selectedTestCase.value = updatedTestCase
        }
      }
    }
  } catch (error) {
    console.error('保存测试结果失败:', error)
  } finally {
    // 重置保存状态
    isSaving.value = false
  }
}

// 监听抽屉显示状态，添加和移除键盘事件监听
watch(drawerVisible, visible => {
  if (visible) {
    // 抽屉打开时添加键盘事件监听
    document.addEventListener('keydown', handleKeyDown)
    // 根据当前标签页立即设置正确的主题
    if (activeTab.value === 'xml' || activeTab.value === 'script') {
      monaco.editor.setTheme(DARK_THEME)
    } else if (activeTab.value === 'result') {
      monaco.editor.setTheme(LIGHT_THEME)
    }
    // 延迟初始化当前标签页的编辑器
    setTimeout(() => {
      if (activeTab.value === 'xml' && xmlEditorContainer.value) {
        initXmlEditor()
        initTestCaseList()
      } else if (activeTab.value === 'script' && scriptEditorContainer.value) {
        initScriptEditor()
      }
    }, 300)
  } else {
    // 抽屉关闭时移除键盘事件监听
    document.removeEventListener('keydown', handleKeyDown)
    // 确保退出全屏状态
    Object.keys(isFullscreen.value).forEach(key => {
      isFullscreen.value[key as 'xml' | 'script'] = false
    })
    // 清理节点编辑器全屏状态
    if (nodeFullscreen.value) {
      nodeFullscreen.value = null
    }
    // 销毁全屏编辑器实例
    if (xmlEditorFullscreen) {
      xmlEditorFullscreen.dispose()
      xmlEditorFullscreen = null
    }
    if (scriptEditorFullscreen) {
      scriptEditorFullscreen.dispose()
      scriptEditorFullscreen = null
    }
    if (nodeEditorFullscreen) {
      nodeEditorFullscreen.dispose()
      nodeEditorFullscreen = null
    }
    disposeLastNodeOutputEditor()
    disposeExpectedResultEditor()
    document.body.style.overflow = ''
    // 销毁编辑器实例
    disposeEditors()
  }
})

// 组件卸载时销毁编辑器实例
const disposeEditors = () => {
  if (xmlEditor) {
    xmlEditor.dispose()
    xmlEditor = null
  }
  if (scriptEditor) {
    scriptEditor.dispose()
    scriptEditor = null
  }
  disposeLastNodeOutputEditor()
  disposeExpectedResultEditor()

  // 销毁全屏编辑器
  if (xmlEditorFullscreen) {
    xmlEditorFullscreen.dispose()
    xmlEditorFullscreen = null
  }
  if (scriptEditorFullscreen) {
    scriptEditorFullscreen.dispose()
    scriptEditorFullscreen = null
  }
  if (nodeEditorFullscreen) {
    nodeEditorFullscreen.dispose()
    nodeEditorFullscreen = null
  }

  editorsMap.forEach(editor => {
    editor.input?.dispose()
    editor.output?.dispose()
  })
  editorsMap.clear()
}

// 处理节点名称点击事件
const handleNodeCollapseChange = (name: string) => {
  const node = testResult.value.funcStepLogs[parseInt(name)]
  if (node) {
    emit('node-click', node)
  }
}

// 切换最后一个节点输出展开状态
const toggleOutputExpanded = () => {
  outputExpanded.value = !outputExpanded.value

  if (outputExpanded.value) {
    // 展开时延迟初始化编辑器
    setTimeout(() => {
      if (lastNodeOutput.value) {
        initLastNodeOutputEditor()
      }
    }, 100)
  } else {
    // 关闭时销毁编辑器
    disposeLastNodeOutputEditor()
  }
}

// 切换预期结果展开状态
const toggleExpectedResultExpanded = () => {
  expectedResultExpanded.value = !expectedResultExpanded.value

  if (expectedResultExpanded.value) {
    // 展开时延迟初始化编辑器
    setTimeout(() => {
      if (expectedResult.value) {
        initExpectedResultEditor()
      }
    }, 100)
  } else {
    // 关闭时销毁编辑器
    disposeExpectedResultEditor()
  }
}

// 初始化最后一个节点输出编辑器
const initLastNodeOutputEditor = () => {
  if (!lastNodeOutputEditorContainer.value || !lastNodeOutput.value) {
    return
  }

  // 如果编辑器已存在，先销毁
  if (lastNodeOutputEditor) {
    disposeLastNodeOutputEditor()
  }

  // 确保使用浅色主题
  monaco.editor.setTheme(LIGHT_THEME)

  lastNodeOutputEditor = monaco.editor.create(lastNodeOutputEditorContainer.value as HTMLElement, {
    value: lastNodeOutput.value,
    language: 'json',
    theme: LIGHT_THEME,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    automaticLayout: true,
    fontSize: 12,
    folding: true,
    scrollbar: {
      vertical: 'visible',
      horizontal: 'visible',
      verticalScrollbarSize: 12,
      horizontalScrollbarSize: 12
    },
    overviewRulerBorder: false,
    hideCursorInOverviewRuler: true,
    overviewRulerLanes: 0
  })

  // 确保编辑器正确布局
  setTimeout(() => {
    lastNodeOutputEditor?.layout()
    lastNodeOutputEditor?.setScrollPosition({ scrollTop: 0, scrollLeft: 0 })
    outputExpanded.value = true
  }, 100)
}

// 销毁最后一个节点输出编辑器
const disposeLastNodeOutputEditor = () => {
  if (lastNodeOutputEditor) {
    lastNodeOutputEditor.dispose()
    lastNodeOutputEditor = null
  }
}

// 初始化预期结果编辑器
const initExpectedResultEditor = () => {
  if (!expectedResultEditorContainer.value) {
    return
  }

  // 如果编辑器已存在，先销毁
  if (expectedResultEditor) {
    disposeExpectedResultEditor()
  }

  // 确保使用浅色主题
  monaco.editor.setTheme(LIGHT_THEME)

  expectedResultEditor = monaco.editor.create(expectedResultEditorContainer.value as HTMLElement, {
    value: expectedResult.value || '',
    language: 'json',
    theme: LIGHT_THEME,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    automaticLayout: true,
    fontSize: 12,
    folding: true,
    scrollbar: {
      vertical: 'visible',
      horizontal: 'visible',
      verticalScrollbarSize: 12,
      horizontalScrollbarSize: 12
    },
    overviewRulerBorder: false,
    hideCursorInOverviewRuler: true,
    overviewRulerLanes: 0
  })

  // 确保编辑器正确布局
  setTimeout(() => {
    expectedResultEditor?.layout()
    expectedResultEditor?.setScrollPosition({ scrollTop: 0, scrollLeft: 0 })
    expectedResultExpanded.value = true
  }, 100)
}

// 销毁预期结果编辑器
const disposeExpectedResultEditor = () => {
  if (expectedResultEditor) {
    expectedResultEditor.dispose()
    expectedResultEditor = null
  }
}

// 编辑器引用Map
const editorsMap = new Map<
  string,
  {
    input
    output
  }
>()

// 设置编辑器引用
const setEditorRef = (el: any | null, nodeId: string, type: 'input' | 'output') => {
  if (!el) return
  // 确保节点在Map中有记录
  if (!editorsMap.has(nodeId)) {
    editorsMap.set(nodeId, {
      input: null,
      output: null
    })
  }
  const nodeEditors = editorsMap.get(nodeId)!
  // 如果编辑器已经存在，不重复创建
  if (nodeEditors[type]) return
  // 创建编辑器前设置浅色主题
  monaco.editor.setTheme(LIGHT_THEME)

  // 创建编辑器
  const editor = monaco.editor.create(el as HTMLElement, {
    value:
      type === 'input'
        ? JSON.stringify(
            testResult.value.funcStepLogs[parseInt(nodeId)]?.inputParams ?? null,
            null,
            2
          )
        : JSON.stringify(testResult.value.funcStepLogs[parseInt(nodeId)]?.result ?? null, null, 2),
    language: 'json',
    theme: LIGHT_THEME,
    readOnly: true,
    minimap: { enabled: false },
    scrollBeyondLastLine: false, // 不允许滚动到最后一行之后，避免空白
    automaticLayout: true,
    fontSize: 12,
    folding: true,
    scrollbar: {
      vertical: 'visible',
      horizontal: 'visible',
      verticalScrollbarSize: 12,
      horizontalScrollbarSize: 12
    },
    overviewRulerBorder: false, // 隐藏概览标尺边框
    hideCursorInOverviewRuler: true, // 在概览标尺中隐藏光标
    overviewRulerLanes: 0 // 禁用概览标尺
  })
  // 保存编辑器实例
  nodeEditors[type] = editor

  // 确保编辑器正确布局并滚动到顶部
  setTimeout(() => {
    editor.layout()
    editor.setScrollPosition({ scrollTop: 0, scrollLeft: 0 })
  }, 100)

  // 如果当前节点处于全屏状态，需要触发布局更新
  if (
    nodeFullscreen.value &&
    nodeFullscreen.value.nodeId === nodeId &&
    nodeFullscreen.value.type === type
  ) {
    setTimeout(() => {
      editor.layout()
    }, 200)
  }
}

// 监听标签页切换，延迟初始化编辑器
watch(activeTab, async newTab => {
  setTimeout(async () => {
    if (newTab === 'xml') {
      // 切换到XML标签页时，确保使用深色主题
      monaco.editor.setTheme(DARK_THEME)
      if (!xmlEditor && xmlEditorContainer.value) {
        initXmlEditor()
      } else if (xmlEditor) {
        // 如果编辑器已存在，重新布局
        xmlEditor.layout()
      }
    } else if (newTab === 'script') {
      // 切换到脚本标签页时，确保使用深色主题
      monaco.editor.setTheme(DARK_THEME)
      if (!scriptEditor && scriptEditorContainer.value) {
        initScriptEditor()
      } else if (scriptEditor) {
        // 如果编辑器已存在，重新布局
        scriptEditor.layout()
      }
    } else if (newTab === 'result') {
      // 切换到结果标签页时，确保使用浅色主题
      monaco.editor.setTheme(LIGHT_THEME)
      if (testResult.value.message) {
        setTimeout(() => {
          outputExpanded.value = true
          initLastNodeOutputEditor()
          // 总是初始化预期结果编辑器
          expectedResultExpanded.value = true
          initExpectedResultEditor()
        }, 500)
      }
    }
  }, 100)
})

// 监听折叠面板变化，更新编辑器布局
watch(activeNodePanels, () => {
  // 延迟执行以确保DOM已更新
  setTimeout(() => {
    // 切换到浅色主题
    monaco.editor.setTheme(LIGHT_THEME)
    editorsMap.forEach((editor, nodeId) => {
      const nodeIndex = parseInt(nodeId)
      const node = testResult.value.funcStepLogs[nodeIndex]
      if (node) {
        if (editor.input) {
          editor.input.setValue(JSON.stringify(node.inputParams ?? null, null, 2))
        }
        if (editor.output) {
          editor.output.setValue(JSON.stringify(node.result ?? null, null, 2))
        }
      }
      editor.input?.layout()
      editor.output?.layout()
    })
  }, 300)
})

// 监听测试结果变化，当成功时自动展开最后一个节点输出
watch(
  () => testResult.value.success,
  newSuccess => {
    if (newSuccess && lastNodeOutput.value) {
      setTimeout(() => {
        initLastNodeOutputEditor()
        // 总是初始化预期结果编辑器
        expectedResultExpanded.value = true
        initExpectedResultEditor()
        scrollToLastNodeOutput()
      }, 100)
    }
  }
)

// 监听testResult变化，确保编辑器内容同步更新
watch(
  () => testResult.value,
  newTestResult => {
    // 如果当前在执行结果标签页且编辑器已存在，更新内容
    if (activeTab.value === 'result' && testResult.value.success) {
      setTimeout(() => {
        // 更新最后一个节点输出编辑器
        if (lastNodeOutputEditor && lastNodeOutput.value) {
          lastNodeOutputEditor.setValue(lastNodeOutput.value)
        } else if (lastNodeOutput.value) {
          initLastNodeOutputEditor()
        }

        // 更新预期结果编辑器
        if (expectedResultEditor) {
          expectedResultEditor.setValue(expectedResult.value || '')
        } else if (expectedResult.value) {
          initExpectedResultEditor()
        }
      }, 50)
    }
  },
  { deep: true }
)

// 滚动到最后一个节点输出的位置
const scrollToLastNodeOutput = () => {
  setTimeout(() => {
    const outputElement = document.querySelector('.result-success-output')
    if (outputElement) {
      outputElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      })
    }
  }, 600)
}

onMounted(() => {
  // 添加键盘事件监听器
  document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  // 移除事件监听器
  document.removeEventListener('keydown', handleKeyDown)

  disposeEditors()
})

defineExpose({
  openDrawer,
  closeDrawer,
  showMask
})
</script>

<style src="./styles.scss" lang="scss" scoped></style>
