<template>
  <div class="rule-edit-layout">
    <!-- 收缩按钮 -->
    <div class="fold" @click="foldMenu">
      <el-tooltip :content="foldStatus ? '展开左侧功能面板' : '隐藏左侧功能面板'" placement="top">
        <LeftOutlined v-if="!foldStatus"></LeftOutlined>
        <RightOutlined v-else></RightOutlined>
        <InfoCircleOutlined />
      </el-tooltip>
    </div>

    <!-- 左侧 DnD 面板：用于拖拽创建节点 -->
    <div
      :class="{
        'side-panel': true,
        'dnd-panel': true,
        collapsed: foldStatus
      }"
    >
      <!-- 使用Element Plus的Tabs组件实现分类展示 -->
      <el-tabs v-model="activeTab" class="dnd-tabs" tab-position="left" stretch>
        <el-tab-pane v-for="tab in tabList" :key="tab.name" :label="tab.label" :name="tab.name">
          <template #label>
            <span class="custom-tabs-label">
              <component :is="tab.compenent" />
              <span>{{ tab.label }}</span>
            </span>
          </template>
          <!-- 抽象函数面板--业务节点 -->
          <DndPanel
            ref="dndPanelRef"
            v-if="tab.name === 'abstract'"
            :nodeTypes="dndPageFuncData"
            :tabName="tab.name"
            :pageNo="pageNo"
            :pageSize="pageSize"
            :total="total"
            :searchKeyword="searchKeyword"
            :onSearch="handleSearch"
            :showSearch="true"
            @node-mouse-down="(e, node) => onNodeMouseDown('func', node, e)"
          >
            <!-- 自定义节点渲染模板 -->
            <template #default="">
              <div class="dnd-icon abstract">
                <NodeTypeIcon type="func" :size="32" />
              </div>
            </template>
          </DndPanel>
          <!-- 逻辑函数面板 --基础组件-->
          <DndPanel
            v-if="tab.name === 'logic'"
            :nodeTypes="logicList"
            :tabName="tab.name"
            :total="0"
            :pageNo="1"
            :pageSize="16"
            :onPageChange="() => {}"
            :showSearch="false"
            @node-mouse-down="(e, node) => onNodeMouseDown('logic', node, e)"
            @node-mouse-enter="(e, node) => onNodeMouseEnter('logic', node, e)"
            @node-mouse-leave="(e, node) => onNodeMouseleave('logic', node, e)"
          >
            <!-- 复用相同的节点渲染模板 -->
            <template #default="{ item }">
              <div class="dnd-icon logic">
                <NodeTypeIcon :type="item.type" :size="32" />
              </div>
            </template>
          </DndPanel>
          <div v-if="tab.name === 'collection'">我是收藏</div>
          <!-- 我是画布管理 -->
          <div v-if="tab.name === 'canvasManage'" class="dnd-canvas">
            <ul>
              <li
                v-for="(item, index) in workflowData.nodeList"
                :key="item.funcId"
                @click="toNode(item, index)"
                :class="{ active: index == currentIndex }"
              >
                <template v-if="item.title.length > 20">
                  <el-tooltip placement="top" :content="item.title">
                    <p>{{ item.id }}.{{ item.title }}</p>
                  </el-tooltip>
                </template>
                <template v-else>
                  <p>{{ item.id }}.{{ item.title }}</p>
                </template>
                <i @mouseenter="showWorkFlowInfo(item, index)">
                  <el-tooltip placement="right" :show-after="500">
                    <template #content>
                      <ul class="tooltipul">
                        <li v-for="content in contentTip">
                          <span>{{ content.label }}：</span>
                          <span>{{ content.desc }}</span>
                        </li>
                      </ul>
                    </template>
                    <InfoCircleOutlined />
                  </el-tooltip>
                </i>
              </li>
            </ul>
          </div>
        </el-tab-pane>
      </el-tabs>
      <!-- 帮助按钮，仅基础函数tab显示 -->
      <div v-if="activeTab === 'logic'" class="help-btn-fixed" @click="helpDialogVisible = true">
        帮助
      </div>
      <!-- 折叠和展开按钮 -->
      <div class="btn-fold" v-if="activeTab === 'abstract'">
        <el-tooltip placement="top" content="折叠">
          <span @click="foldBtnMenu(0)"><Fold></Fold></span>
        </el-tooltip>
        <em>|</em>
        <el-tooltip placement="top" content="展开">
          <span @click="foldBtnMenu(1)"><UnFold></UnFold></span>
        </el-tooltip>
      </div>
    </div>

    <!-- 中间画布区域：用于展示和编辑工作流 -->
    <div class="center-panel">
      <div class="canvas-center-wrap">
        <WorkflowDesigner
          ref="editorRef"
          :data="workflowData"
          :functionNodes="allFuncData"
          @show-attr-panel="onShowAttrPanel"
          @update:workflow="updateWorkflowData"
          @save-as-data="handleSaveAs"
          @test-lua="handleTestLua"
          @show-save-modal="handleShowSaveModel"
          @show-search-modal="handleShowSearchModal"
          @close-search-modal="handleCloseSearchModal"
          :nodeId="nodeId"
          :isTesting="isTesting"
        />
      </div>
    </div>

    <!-- 属性面板抽屉组件 -->
    <AttrPanelDrawer
      :visible="showAttrPanel"
      :nodeData="selectedNodeData"
      :workflowData="workflowData"
      :getAvailableSourceOptions="getAvailableSourceOptions"
      :getAvailableTargetOptions="getAvailableTargetOptions"
      :getAllAvailableOptions="getAllAvailableOptions"
      @close="onCloseAttrPanel"
      @addPortData="addPortData"
      @removePortData="removePortData"
      @nodeBaseDataUpdate="onNodeBaseDataUpdate"
    />

<!--    <BaseFuncHelpDialog-->
<!--      :visible="helpDialogVisible"-->
<!--      :onClose="() => (helpDialogVisible = false)"-->
<!--      :funcList="dndPageFuncData"-->
<!--    />-->

    <!-- 另存对话框 -->
    <el-dialog
      v-model="saveAsDialogVisible"
      title="另存为"
      width="50%"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      append-to-body
      :destroy-on-close="true"
      @close="closeSaveAsDialog"
    >
      <Detail
        v-loading="loadingSaveAs"
        ref="refSaveAsDetail"
        :detail="saveAsDetail"
        :operation-mode="'ADD'"
      />
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="saveAsDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmSaveAs">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 测试抽屉 -->
    <TestDrawer @node-click="handleNodeClick" ref="testDrawerRef" @close="closeTestDrawer" />

    <!-- 搜索页面弹窗 -->
    <NodeSearchModal
      v-model:visible="showSearchModal"
      :search-function="handleSearchFunction"
      :data="searchModalData"
      @select-node="handleSelectSearchNode"
    />

    <CommonDialog
      ref="saveDialogRef"
      :closeBtnVisible="isSaveFromTag"
      @saveDialog="saveDialog"
      @closeDialog="closeDialog"
      @cancelDialog="cancelDialog"
    >
      <template #content>
        <div>
          <el-space direction="vertical"><p>修改记录(非必填)</p></el-space>
          <el-input
            v-model="saveText"
            placeholder="请输入修改记录"
            :autosize="{ minRows: 4, maxRows: 4 }"
            type="textarea"
          />
        </div>
      </template>
    </CommonDialog>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  onMounted,
  onUnmounted,
  onActivated,
  onDeactivated,
  nextTick,
  computed,
  watch
} from 'vue'
import { onBeforeRouteLeave, useRoute } from 'vue-router'
import WorkflowDesigner from '@/components/workflow/WorkflowDesigner.vue'
import DndPanel from '@/components/workflow/panels/DndPanel.vue'
import AttrPanelDrawer from '@/components/workflow/panels/AttrPanelDrawer.vue'
import { LogicType, type WorkflowData } from '@/type/workflow'
import {
  getFunctionList,
  transformFunctionData,
  getFunctionListByIds,
  FunctionNode,
  updateRule
} from '@/api/workflow/WorkFlowApi'
import { useRuleStore, useCanvasStore } from '@/store/modules/ruleCache'
import { ElMessage, ElMessageBox } from 'element-plus'
import { nodeIdFactory } from '@/utils/workflow/NodeIdFactory'
import { compressParamData, expandParamData } from '@/utils/workflow/DataOptimizer'
// import BaseFuncHelpDialog from '@/components/workflow/BaseFuncHelpDialog.vue'
import Detail from '@/views/rule/detail.vue'
import { http } from '@/axios'
import TestDrawer from '@/components/TestDrawer/index.vue'
import NodeTypeIcon from '@/components/NodeTypeIcon/index.vue'
import NodeSearchModal from '@/components/workflow/NodeSearchModal.vue'
import { emitter } from '@/utils/mitt'
import { bus } from 'wujie'
import { useParamStore } from '@/store/modules/params'
import BusinessPort from '@/assets/rsvg/businessport.svg'
import Basic from '@/assets/rsvg/basic.svg'
import StarOutlined from '@/assets/rsvg/StarOutlined.svg'
import PartitionOutlined from '@/assets/rsvg/PartitionOutlined.svg'
import LeftOutlined from '@/assets/rsvg/LeftOutlined.svg'
import RightOutlined from '@/assets/rsvg/RightOutlined.svg'
import InfoCircleOutlined from '@/assets/rsvg/InfoCircleOutlined.svg'
import Fold from '@/assets/rsvg/Fold.svg'
import UnFold from '@/assets/rsvg/UnFold.svg'
import CommonDialog from '@/components/Dialog/CommonDialog.vue'

import { useDialogDrag } from '@/hooks/useDialogDrag'

const paramStore = useParamStore()
const { initDialog } = useDialogDrag()

// import BusinessPort from "@/assets/rsvg/businessport.svg";
defineOptions({
  name: 'ruleEdit'
})

/**
 * 工作流数据
 * 包含节点列表、边列表和工作流配置
 * 使用ref包装以实现响应式
 */
const workflowData = ref<WorkflowData>({
  id: '', // 工作流ID
  nodeList: [], // 节点列表
  edges: [], // 边列表
  groupList: [], // 组列表
  lua: '', // Lua脚本
  ruleName: '' // 规则名称
})

// 页面退出拦截相关状态

// 检查画布是否有内容
function hasCanvasContent(): boolean {
  return workflowData.value.nodeList.length > 0 || workflowData.value.edges.length > 0
}

/**
 * 检查画布是否有未保存的修改
 * 这个方法将被页签关闭逻辑调用
 */
function hasUnsavedChanges(): boolean {
  return hasCanvasContent()
}

/**
 * 微前端通用退出提示
 * 当页面以iframe形式嵌入主界面时，显示浏览器默认的离开确认提示
 */
function showMicroFrontendExitMessage(): void {
  const userWantsToLeave = confirm('离开此网站？\n系统可能不会保存您所做的更改。')
  if (userWantsToLeave) {
    console.log('用户确认离开页面')
  } else {
    console.log('用户取消离开页面')
  }
}

const ruleStore = useRuleStore()
const canvasStore = useCanvasStore()

/**
 * 缓存当前画布数据
 */
function cacheCurrentCanvas() {
  if (hasCanvasContent()) {
    const canvasData = {
      id: workflowData.value.id,
      ruleName: workflowData.value.ruleName,
      nodeList: workflowData.value.nodeList,
      edges: workflowData.value.edges,
      groupList: workflowData.value.groupList,
      lua: workflowData.value.lua,
      funcIds: workflowData.value.nodeList.map(node => node.funcId),
      timestamp: Date.now()
    }
    canvasStore.setCachedCanvas(canvasData)
  }
}

/**
 * 路由离开守卫：在页面切换时缓存画布数据
 */
onBeforeRouteLeave(async (to, from, next) => {
  if (hasCanvasContent()) {
    cacheCurrentCanvas()
  }
  next()
})

// 浏览器刷新/关闭事件处理
async function handleBeforeUnload(event: BeforeUnloadEvent) {
  // 如果画布为空，不拦截
  if (!hasCanvasContent()) {
    return
  }
  event.preventDefault()
  event.returnValue = '离开此网站？系统可能不会保存您所做的更改。'
  return event.returnValue
}

/**
 * 更新工作流数据
 * @param data 新的工作流数据
 */
function updateWorkflowData(data: WorkflowData) {
  workflowData.value = data
  syncNodeIdFactoryWithWorkflow(data)
}
// 同步节点ID工厂
function syncNodeIdFactoryWithWorkflow(data: WorkflowData) {
  const maxId = Math.max(0, ...data.nodeList.map(n => Number(n.id)).filter(n => !isNaN(n)))
  nodeIdFactory.reset(maxId + 1)
}

/**
 * 保存相关
 */
const saveDialogRef = ref(null)
const saveText = ref('')
let saveDialogResolve = null
const saveDialogFlowData = ref<{ luaCode: string; allFuncId: string[]; expressionParamArr: any[] }>(
  {
    luaCode: '',
    allFuncId: [],
    expressionParamArr: []
  }
)
const isSaveFromTag = ref(false)

const handleShowSaveModel = flowData => {
  saveDialogFlowData.value = flowData
  saveText.value = ''
  saveDialogRef.value.open()
}

const closeDialog = () => {
  saveDialogRef.value.close()
  saveDialogResolve && saveDialogResolve(false)
  isSaveFromTag.value = false
}

const saveDialog = async () => {
  const { luaCode, allFuncId, expressionParamArr } = saveDialogFlowData.value

  await saveRuleData(luaCode, allFuncId, expressionParamArr, saveText.value)
  saveDialogRef.value.close()
  saveDialogResolve && saveDialogResolve(false)
  isSaveFromTag.value = false
}

const cancelDialog = () => {
  saveDialogRef.value.close()
  saveDialogResolve && saveDialogResolve(true)
  isSaveFromTag.value = false
}

async function saveRuleData(
  luaCode: string,
  funcIds: string[],
  expressionParamArr: any[],
  modifyReason?: string
): Promise<boolean> {
  if (!workflowData.value.id) {
    ElMessage.error('规则ID为空, 请先另存规则')
    return false
  }

  try {
    // 保存前压缩，生成新对象
    const compressedWorkflowData = compressWorkflowData(workflowData.value)

    await updateRule(
      compressedWorkflowData.id,
      compressedWorkflowData,
      luaCode,
      funcIds,
      expressionParamArr,
      modifyReason
    )
    ElMessage.success('规则保存成功')

    // 移除自动保存定时器启动
    // startAutoSaveTimer()

    return true
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('规则保存失败')
    return false
  }
}

/**
 * 拖拽相关状态
 * activeTab: 当前激活的标签页
 * tabList: 标签页配置
 * logicList: 逻辑函数列表
 * functionList: 函数列表
 * pageNo: 分页参数
 * pageSize: 分页参数
 * total: 分页参数
 */
const activeTab = ref('abstract')
const tabList = [
  { label: '业务节点', name: 'abstract', compenent: BusinessPort },
  { label: '基础组件', name: 'logic', compenent: Basic },
  // { label: '收藏', name: 'collection', compenent: StarOutlined },
  { label: '画布管理', name: 'canvasManage', compenent: PartitionOutlined }
]
const logicList = ref([
  {
    type: 'condition',
    title: '条件函数',
    icon: 'icon-condition',
    funcId: '9',
    show: false,
    text:
      '（1）条件判断（if如果 else否则），用于根据条件的真假来执行不同的“下一步”，“下一步”可能是输出结果（如产品的id和name、固定数值、空值等),也有可能再接入下一层的逻辑判断，直到返回产品检测所需要的结果。\n' +
      '（2）支持else if多条件判断（if 条件1，else if条件2…），输出不同的分支。\n' +
      '（3）经过条件判断节点的对象，数据类型不会被改变，用条件判断函数连接的两个节点，出入参的数据类型需要一致（如前一个节点的出参是part[]一维数组，后一个节点的入参也需要是part[]）。\n'
  },
  {
    type: 'aggregate',
    title: '聚合函数',
    icon: 'icon-aggregate',
    funcId: '2',
    show: false,
    text:
      '支持任意多个节点接入，将多个节点数据进行合并去重。\n' +
      '用法：可以连接任意多个节点接入，对多种类型的数据结构进行合并去重。\n' +
      '注意事项：合并方式会以第一个节点接入的数据结构为主，在不输入ukey的情况下会默认以id为key。\n'
  },
  {
    type: 'global_param',
    title: '全局参数',
    icon: 'icon-global-param',
    funcId: '3',
    show: false,
    text: '引用全局参数①Root(全场景数据，如参数化产品、软装、硬装素材），②Target(指定素材列表，通常用于生产数据），并将对应的值直接返回给下一个节点。'
  },
  {
    type: 'sub_property_extractor',
    title: '属性获取',
    icon: 'icon-sub-property',
    funcId: '4',
    show: false,
    text:
      '用于提取数据源的子属性值。\n' +
      '用法：根据参数配置，提取数据源的子属性。\n' +
      '注意事项：\n' +
      '1. 条件的写法需要遵从 lua 格式规范；\n' +
      '2. 以item为变量名，表示当前遍历的对象 （若非遍历：则表示上游节点结果； 若遍历：则表示上游节点中的每个元素）；\n' +
      "3. 暂不支持混搭路径 如： 'id, [2]' 这种暂时不支持；\n" +
      '4. 开启遍历的情况下，只有多路径非索引开头的情况下，结果会输出成对象，其余的都是数组。\n'
  },
  {
    type: 'global_variable',
    title: '全局变量',
    icon: 'icon-global-variable',
    funcId: '5',
    show: false,
    text:
      '用于获取工作流中指定节点的结果数据。\n' +
      '用法：通过选择节点Id 参数，获取指定节点的执行结果。\n' +
      '注意事项：\n' +
      '1. 目标节点必须在当前节点之前执行完成；\n' +
      '2. 全局变量不需要接受入参，直接通过参数下拉即可选择；\n' +
      '3. 支持获取任意类型的数据结构（对象、数组、基本类型等）。\n' +
      '参数描述：\n' +
      '1. nodeId：指定要获取结果的节点ID，可以是数字或字符串；\n' +
      '2. 结果变量：当前节点的结果变量名格式为 result_当前节点ID。\n' +
      '逻辑：\n' +
      '1. 根据输入的 nodeId 参数，获取对应节点的执行结果；\n' +
      '2. 将目标节点的结果直接赋值给当前节点的结果变量；\n' +
      '3. 适用于需要在工作流中复用其他节点结果的场景，尤其是在ifelse分支下。\n'
  },
  // { type: 'type_converter', title: '类型转换', icon: 'icon-type-converter', funcId: '6', show: false ,  text: ''},
  {
    type: 'dimension_converter',
    title: '数据转换',
    icon: 'icon-dimension-converter',
    funcId: '12',
    show: false,
    text:
      '将上游节点传递的值强制转换成指定类型\n' +
      '用法：根据转换方式配置，将上游节点的结果强制转换成指定类型\n' +
      '注意事项：\n' +
      '1. 转换方式支持：转成字符串、转成数值、转成table、转成布尔\n' +
      '2. 转成table 会将原值塞进table中\n' +
      '3. 转成布尔值 只会执行判断值是否非nil/undefined 并返回true/false\n' +
      '4. 不能将table的值 转成其他基础类型\n' +
      '新增功能：\n' +
      '1、增加【升维和降维操作】的能力\n' +
      '2、增加自动类型转换的能力\n'
  },
  {
    type: 'custom_function',
    title: '自定义函数',
    icon: 'icon-custom-function',
    funcId: '7',
    show: false,
    text: '支持画布中编辑节点时，输入研发人员编程后的lua程序脚本后直接进行使用。'
  },
  {
    type: 'iterator',
    title: '迭代',
    icon: 'icon-iterator',
    funcId: '8',
    show: false,
    text:
      '对数组数据进行遍历处理，支持复杂的内部逻辑和结果汇总。\n' +
      '用法：选择迭代函数，在函数内部增加函数节点和处理逻辑，对每个元素执行相同的操作\n' +
      '注意事项：\n' +
      '1. 迭代器会自动创建起始节点，用于接收遍历的单个元素，进入迭代后数据类型默认转换为单个对象；\n' +
      '2. 内部节点只能连接到迭代器内部，不能连接到外部，按住CTRL键可以将节点移出到迭代外部；\n' +
      '3. 支持条件节点和普通节点的混合使用；\n' +
      '4. 最终结果会将所有迭代结果汇总成数组（在输出结果的数据类型上进行升维，比如”输出结果“函数为一维数组，那么迭代输出结果是二维数组）。\n'
  },
  {
    type: 'decision_tables_function',
    title: '决策表',
    icon: 'icon-iterator',
    funcId: '10',
    show: false,
    text:
      '采用”表格“条件决策逻辑的方式，简化多条件下的结果生成方式。\n' +
      '用法：配置决策表规则，根据输入数据匹配对应规则并输出结果。\n' +
      '注意事项：\n' +
      '1. 决策表数据必须包含完整的行配置；\n' +
      '2. 表达式类型为BOOLEAN时，会生成自定义计算函数；\n' +
      '3. 支持多种数据类型：string、number、boolean；\n' +
      '4. 测试模式下会生成额外的调试信息。\n' +
      '参数描述：\n' +
      '1. data：输入数据源，通常是数组类型的数据；\n' +
      '2. decisionTableData：决策表配置数据，包含行列表；\n' +
      '3. rowList：规则行列表，每行包含输入、输出和注释配置。\n' +
      '逻辑：\n' +
      '1. 遍历输入数据的每个元素；\n' +
      '2. 根据决策表规则进行条件匹配；\n' +
      '3. 匹配成功后应用输出规则；\n' +
      '4. 支持自定义表达式计算；\n' +
      '5. 返回处理后的数据。\n'
  },
  {
    type: 'external_data_table',
    title: '外部数据表',
    icon: 'icon-external-data',
    funcId: '11',
    show: false,
    text:
      '用于从外部数据源查询数据，支持动态表达式和列选择。\n' +
      '用法：配置外部数据源（如通用配置-线条配置表等）、查询表达式和输出列，动态查询外部数据。\n' +
      '注意事项：\n' +
      '1. 所有入参source字段都必须有值，不能为空；\n' +
      '2. 表达式支持Lua语法，可以引用上游数据；\n' +
      '3. 输出列必须是数据表中实际存在的字段。\n' +
      '参数描述：\n' +
      '1. mainObj：主对象参数，用于表达式计算的数据源；\n' +
      '2. source：外部数据源配置，包含数据库ID和表名；\n' +
      '3. expression：查询表达式，支持Lua代码，用于动态生成查询条件；\n' +
      '4. outputContent：输出列列表，指定要返回的字段。\n' +
      '逻辑：\n' +
      '1. 根据配置的数据源获取表信息；\n' +
      '2. 将表达式转换为Lua函数；\n' +
      '3. 调用外部数据查询函数获取结果；\n' +
      '4. 返回指定列的数据。\n'
  },
  {
    type: 'calculator',
    title: '计算器',
    icon: 'icon-external-data',
    funcId: '12',
    show: false,
    text:
      '支持通过提取画布内的变量，进行运算公式定义，并按运算公式输出运算结果（为数值）。\n' +
      '1.入参（不限数据类型）：引入画布内已有的变量及变量值，进行运算公式定义（表达式）；\n' +
      '2.出参（不限数据类型）：基于运算公式，进行运算结果输出。\n'
  }
])
const allFuncData = ref(new Map<string, FunctionNode>())
const dndPageFuncData = ref<FunctionNode[]>([])
const pageNo = ref(1)
const pageSize = ref(1000)
const total = ref(0)
const searchKeyword = ref('')

/**
 * 设置所有函数节点数据
 * @param data 函数节点数据
 */
function setFuncNodeData(data: FunctionNode[]) {
  if (!allFuncData.value) {
    allFuncData.value = new Map<string, FunctionNode>()
  }
  data.forEach(item => {
    allFuncData.value.set(item.funcId, item)
  })
}

/**
 * 分页获取函数列表
 */
let resList = []
async function fetchFunctionList(page = 1, keyword = '') {
  // pageNo.value = page
  try {
    // const response = await getFunctionList({
    //   pageNo: pageNo.value,
    //   pageSize: pageSize.value,
    //   keyword: keyword,
    //   funcCategory: '',
    //   isMyFunction: false
    // })
    const response = await getFunctionList()
    resList = JSON.parse(JSON.stringify(response))
    let tempArr: any[] = []
    tempArr = repeatLoop(response, tempArr)
    // dnd面板用
    // console.log('response===222==999',response)
    dndPageFuncData.value = response as any
    // dndPageFuncData.value = tempList
    // 全量数据缓存
    setFuncNodeData(tempArr)
    // setFuncNodeData(tempList)
  } catch (error) {
    console.error('获取函数列表失败:', error)
    total.value = 0
  }
}
const repeatLoop = (Object, tempArr) => {
  Object.forEach(o => {
    let tempItem = []
    if (o.functions) {
      tempItem = o.functions.map(item => transformFunctionData(item))
      tempArr.push(...tempItem)
    }
    if (o.children.length) {
      repeatLoop(o.children, tempArr)
    } else {
      o.children = tempItem
    }
  })
  return tempArr
}
// function handlePageChange(newPage: number) {
//   fetchFunctionList(newPage, searchKeyword.value)
// }

// 处理搜索
function handleSearch(keyword: string) {
  searchKeyword.value = keyword
  if (keyword) {
    let data = repeatSearch(JSON.parse(JSON.stringify(resList)), keyword)
    let tempArr = []
    repeatLoop(data, tempArr)
    dndPageFuncData.value = data
  } else {
    fetchFunctionList()
  }
}
// 前端检索循环
const repeatSearch = (data, keyword) => {
  let tempArr = []
  data.forEach(d => {
    if (d.functions) {
      let tempFunctions = []
      d.functions.forEach(i => {
        // return
        if (i.funcName.includes(keyword) || i.funcCode.includes(keyword)) {
          tempFunctions.push(i)
        }
      })
      d.functions = tempFunctions
      tempArr.push(...tempFunctions)
    }
    if (d.children.length) {
      repeatSearch(d.children, keyword)
    }
  })
  return data
}
/**
 * 根据 funcId 列表获取函数配置
 */
async function getFunctionNodesByIds(ids: string[]) {
  const keys = Array.from(allFuncData.value.keys())
  const diffIds = ids.filter(id => !keys.includes(id))
  if (diffIds.length > 0) {
    const response = await getFunctionListByIds(diffIds)
    const tempList = (response as any).map(item => transformFunctionData(item))
    setFuncNodeData(tempList)
  }
  return true
}

// 工作流设计器组件引用
const editorRef = ref()

/**
 * 处理节点拖拽到画布
 * @param type 节点类型 'logic' | 'func'
 * @param item 节点基础数据
 * @param e 鼠标事件
 */
function onNodeMouseDown(type: 'logic' | 'func', item: any, e: MouseEvent) {
  editorRef.value?.startDragPreview(type, item, e)
}
function onNodeMouseEnter(type: 'logic' | 'func', item: any, e: MouseEvent) {
  logicList.value[item].show = true
}
function onNodeMouseleave(type: 'logic' | 'func', item: any, e: MouseEvent) {
  logicList.value[item].show = false
}
// 属性面板相关状态
const showAttrPanel = ref(false)
const selectedNodeData = ref<any>(null)

// 属性面板事件处理
function onShowAttrPanel({ nodeData }: any) {
  selectedNodeData.value = nodeData
  // 如果抽屉已经打开，只是切换节点数据，不关闭抽屉
  if (!showAttrPanel.value && nodeData) {
    showAttrPanel.value = true
  }
  // 如果点击空白区域且抽屉已打开，则关闭抽屉
  if (!nodeData && showAttrPanel.value) {
    showAttrPanel.value = false
  }
}

// 关闭属性面板
function onCloseAttrPanel() {
  showAttrPanel.value = false

  // 延迟清空节点数据，确保关闭动画完成后再清空
  // 这样可以避免在关闭后立即点击同一节点时无法打开抽屉的问题
  setTimeout(() => {
    selectedNodeData.value = null

    // 通知编辑器取消节点选择状态
    if (editorRef.value) {
      editorRef.value.clearSelection?.()
    }
  }, 300)
}

// 添加端口数据
function addPortData(newData: any, nodeId: string) {
  editorRef.value.addPortData(newData, nodeId)
}
// 删除端口数据
function removePortData(index: number, nodeId: string, type?: string) {
  editorRef.value.removePortData(index, nodeId, type)
}

function onNodeBaseDataUpdate(nodeId: string) {
  // 更新单个node的基本信息显示（无port）
  editorRef.value?.onNodeBaseDataUpdate(nodeId)
}

// 获取可用的上游节点列表
function getAvailableSourceOptions(param: any) {
  return editorRef.value?.getAvailableSourceOptions(selectedNodeData.value, param)
}

function getAllAvailableOptions(param: any) {
  console.log('workflowData1111', workflowData)
  const node = selectedNodeData.value
  if (!node || !param) return []
  // 上游是条件的话 会继续往前找 直到找到第一个非条件的节点
  const nodeList = workflowData.value.nodeList
  const options = []
  nodeList.forEach(node => {
    if (
      node.funcType === 'logic' &&
      (node.logicData?.logicType === LogicType.GLOBAL_VARIABLE ||
        node.logicData?.logicType === LogicType.GLOBAL_PARAM ||
        node.logicData?.logicType === LogicType.IFELSE)
    ) {
      return
    }
    options.push({ label: node.id + ':' + node.title, value: node.id })
  })
  return options
}

function getAvailableTargetOptions() {
  // console.log('222',workflowData)
  return workflowData.value.nodeList.map(node => ({ label: node.title, value: node.id }))
}

// 工具函数：压缩整个工作流数据
function compressWorkflowData(workflowData) {
  return {
    ...workflowData,
    nodeList: (workflowData.nodeList || []).map(node => ({
      ...node,
      inputData: (node.inputData || []).map(param => compressParamData(param)),
      outputData: (node.outputData || []).map(param => compressParamData(param))
    }))
  }
}
// 工具函数：展开整个工作流数据
function expandWorkflowData(workflowData) {
  return {
    ...workflowData,
    nodeList: (workflowData.nodeList || []).map(node => ({
      ...node,
      inputData: (node.inputData || []).map(param => expandParamData(param)),
      outputData: (node.outputData || []).map(param => expandParamData(param))
    }))
  }
}

const helpDialogVisible = ref(false)

// 另存对话框相关状态
const saveAsDialogVisible = ref(false)
const loadingSaveAs = ref(false)
const saveAsDetail = ref<any>({})
const refSaveAsDetail = ref<any>(null)
const saveAsData = ref<any>(null) // 存储从WorkflowDesigner传递的数据
const testDrawerRef = ref<any>(null) // 测试抽屉引用

// 搜索页面相关状态
const showSearchModal = ref(false)
const searchModalData = ref<
  { x: number; y: number; nodeId: string; portId: string; fromEdgeAdd: boolean } | undefined
>(undefined)

/**
 * 调试功能：对比当前画布生成的Lua脚本与存储的Lua脚本
 * 通过 window.debugLuaScript 调用
 */
const debugLuaScript = async () => {
  try {
    // 获取当前画布生成的Lua脚本
    if (!editorRef.value) {
      console.error('编辑器引用不存在')
      return
    }

    const currentFlowData = await editorRef.value.getFlowData({ isGenerateTestLuaScript: false })
    if (!currentFlowData) {
      console.error('无法生成当前画布的Lua脚本')
      return
    }

    const currentLuaScript = currentFlowData.luaCode

    // 获取存储的Lua脚本
    const storedLuaScript = workflowData.value.lua

    if (!storedLuaScript) {
      console.error('存储的Lua脚本为空')
      return
    }

    // 进行字符串对比
    if (currentLuaScript === storedLuaScript) {
      console.log('✅ Lua数据一致')
    } else {
      console.log('❌ Lua数据不一致')
      console.log('当前画布生成的Lua脚本:')
      console.warn(currentLuaScript)
      console.log('存储的Lua脚本:')
      console.log(storedLuaScript)
    }
  } catch (error) {
    console.error('调试Lua脚本对比失败:', error)
    ElMessage.error('调试失败')
  }
}

const route = useRoute()

onMounted(async () => {
  // fetchFunctionList(1, '')
  //
  // // 数据恢复优先级：ruleStore.currentRule > canvasStore.cachedCanvas > 默认空数据
  // const ruleData = ruleStore.getCurrentRule(route.query?.ruleId)
  // const cachedCanvas = canvasStore.getCurrentCanvas(route.query?.ruleId)
  //
  // let baseData = workflowData.value
  // if (ruleData) {
  //   // 优先级1：使用从其他页面跳转过来的规则数据
  //   paramStore.setCanvasList(route.query?.ruleId, ruleData?.variableSet || '[]')
  //   baseData = {
  //     ...workflowData.value,
  //     id: ruleData.id,
  //     ruleName: ruleData.ruleName,
  //     lua: ruleData.luaScript
  //   }
  //   const ids = ruleData.funcIds || []
  //   if (ids) {
  //     // 获取画布可能需要的函数节点
  //     await getFunctionNodesByIds(ids)
  //     try {
  //       const wfd = JSON.parse(ruleData.configData)
  //       // 关键：第一时间做参数展开，兼容历史数据
  //       const expandedWfd = expandWorkflowData(wfd)
  //       baseData.nodeList = expandedWfd.nodeList
  //       baseData.edges = expandedWfd.edges
  //       baseData.groupList = expandedWfd?.groupList || []
  //     } catch (error) {
  //       console.error('解析工作流数据失败:', error)
  //     }
  //   }
  //   // 清空跳转数据
  //   ruleStore.clearCurrentRule(route.query?.ruleId)
  // } else if (cachedCanvas) {
  //   // 优先级2：使用缓存的画布数据
  //   baseData = {
  //     ...workflowData.value,
  //     id: cachedCanvas.id,
  //     ruleName: cachedCanvas.ruleName,
  //     lua: cachedCanvas.lua,
  //     nodeList: cachedCanvas.nodeList,
  //     edges: cachedCanvas.edges,
  //     groupList: cachedCanvas.groupList
  //   }
  //
  //   // 如果有缓存的函数ID，获取函数节点
  //   if (cachedCanvas.funcIds && cachedCanvas.funcIds.length > 0) {
  //     await getFunctionNodesByIds(cachedCanvas.funcIds)
  //   }
  //
  //   // 清空缓存数据
  //   canvasStore.clearCachedCanvas(route.query?.ruleId)
  // }
  //
  // updateWorkflowData(baseData)
})

onActivated(async () => {
  const ruleId = route.query?.ruleId as string

  fetchFunctionList(1, '')

  // 数据恢复优先级：ruleStore.currentRule > canvasStore.cachedCanvas > 默认空数据
  const ruleData = ruleStore.getCurrentRule(ruleId)
  const cachedCanvas = canvasStore.getCurrentCanvas(ruleId)

  // 如果加载过，切换的时候会设置为false 那一定会有key
  let baseData = workflowData.value

  paramStore.setCanvasList(ruleId, ruleData?.variableSet || '[]')

  if (ruleData) {
    // 优先级1：使用从其他页面跳转过来的规则数据
    baseData = {
      ...workflowData.value,
      id: ruleData.id,
      ruleName: ruleData.ruleName,
      lua: ruleData.luaScript
    }
    const ids = ruleData.funcIds || []
    if (ids) {
      // 获取画布可能需要的函数节点
      await getFunctionNodesByIds(ids)
      try {
        const wfd = JSON.parse(ruleData.configData)
        // 关键：第一时间做参数展开，兼容历史数据
        const expandedWfd = expandWorkflowData(wfd)
        baseData.nodeList = expandedWfd.nodeList
        baseData.edges = expandedWfd.edges
        baseData.groupList = expandedWfd?.groupList || []
      } catch (error) {
        console.error('解析工作流数据失败:', error)
      }
    }
    // 清空跳转数据
    // ruleStore.clearCurrentRule(ruleId)
  } else if (cachedCanvas) {
    // 优先级2：使用缓存的画布数据
    baseData = {
      ...workflowData.value,
      id: cachedCanvas.id,
      ruleName: cachedCanvas.ruleName,
      lua: cachedCanvas.lua,
      nodeList: cachedCanvas.nodeList,
      edges: cachedCanvas.edges,
      groupList: cachedCanvas.groupList
    }

    // 如果有缓存的函数ID，获取函数节点
    if (cachedCanvas.funcIds && cachedCanvas.funcIds.length > 0) {
      await getFunctionNodesByIds(cachedCanvas.funcIds)
    }
  }

  // workflowData.value = baseData
  updateWorkflowData(baseData)

  // 添加浏览器事件监听
  window.addEventListener('beforeunload', handleBeforeUnload)

  // 微前端环境检测和监听
  if (window.__POWERED_BY_WUJIE__) {
    // 监听微前端卸载事件
    window.__WUJIE_UNMOUNT = () => {
      showMicroFrontendExitMessage()
    }

    window.addEventListener('beforeunload', showMicroFrontendExitMessage)
    // 监听主界面发送的消息
    // if (window.$wujie) {
    //   window.$wujie?.$on('beforeUnmount', () => {
    //     showMicroFrontendExitMessage()
    //   })
    // }
    window.__bus = bus
    // 监听微前端卸载事件
    bus.$on('beforeUnmount', async () => {
      try {
        await ElMessageBox.confirm('确定要关闭此应用吗?', '确认关闭', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
      } catch {
        throw new Error('用户取消关闭')
      }
    })
  }

  // 将调试函数挂载到window对象
  ;(window as any).debugLuaScript = debugLuaScript
  ;(window as any).showDebug = false

  // 监听页签关闭检查事件
  emitter.on('tabCloseCheck', async ({ name, resolve }) => {
    if (name === 'ruleEdit') {

      // 检查是否有未保存的修改
      const hasUnsaved = hasUnsavedChanges()
      if (hasUnsaved) {
        saveDialogResolve = resolve
        // 获取当前工作流数据并保存
        await editorRef.value?.handleSave()
        isSaveFromTag.value = true
      } else {
        resolve(false)
      }

    } else {
      resolve(false)
    }
  })
})

onDeactivated(() => {
  // 清理浏览器事件监听
  window.removeEventListener('beforeunload', handleBeforeUnload)

  // 清理微前端监听
  if (window.__POWERED_BY_WUJIE__ && window.$wujie) {
    try {
      window.$wujie.$off('beforeUnmount')
    } catch (error) {
      console.log('清理微前端监听器失败:', error)
    }
  }

  // 清理window对象上的调试函数
  delete (window as any).debugLuaScript
  delete (window as any).showDebug

  // 清理事件监听器
  emitter.off('tabCloseCheck')

  // 移除自动保存定时器清理
  // clearAutoSaveTimer()
})


// 另存相关方法
const handleSaveAs = (data: any) => {
  // 保存从WorkflowDesigner传递的数据
  saveAsData.value = data

  // 初始化另存对话框数据
  saveAsDetail.value = {
    ruleCode: '',
    ruleName: '',
    ruleType: 'module',
    sceneCategory: '',
    ruleDesc: '',
    ruleStatus: 'ENABLED'
  }
  saveAsDialogVisible.value = true
  nextTick(() => {
    initDialog()
  })
}

const closeSaveAsDialog = () => {
  saveAsDialogVisible.value = false
  saveAsDetail.value = {}
  saveAsData.value = null
  if (refSaveAsDetail.value) {
    refSaveAsDetail.value.resetForm()
  }
}

/**
 * 执行另存操作的通用函数
 * @param formData 表单数据
 * @returns Promise<void>
 */
const performSaveAs = async (formData: any) => {
  loadingSaveAs.value = true
  try {
    const res = await http.post({
      url: '/rule-config/rule/add',
      data: formData
    })

    if (res.data && String(res.data).length > 0) {
      // 获取新规则ID
      const newRuleId = String(res.data)

      // 更新工作流数据中的规则ID
      workflowData.value.id = newRuleId
      workflowData.value.ruleName = formData.ruleName

      // 使用从WorkflowDesigner传递的数据保存规则
      if (saveAsData.value) {
        const saveSuccess = await saveRuleData(
          saveAsData.value.luaCode,
          saveAsData.value.allFuncId,
          saveAsData.value.expressionParamArr
        )
        if (saveSuccess) {
          ElMessage.success('另存成功')
          saveAsDialogVisible.value = false
        } else {
          ElMessage.error('另存失败')
        }
      } else {
        ElMessage.success('另存成功')
        saveAsDialogVisible.value = false
      }
    } else {
      ElMessage.error('另存失败')
    }
  } catch (error) {
    ElMessage.error('另存失败')
  } finally {
    loadingSaveAs.value = false
  }
}

const confirmSaveAs = () => {
  refSaveAsDetail.value?.validate(async (isValid: boolean) => {
    if (!isValid) {
      return
    }

    await performSaveAs({
      ruleCode: saveAsDetail.value.ruleCode,
      ruleName: saveAsDetail.value.ruleName,
      ruleType: saveAsDetail.value.ruleType,
      sceneCategory: saveAsDetail.value.sceneCategory,
      ruleDesc: saveAsDetail.value.ruleDesc,
      ruleStatus: saveAsDetail.value.ruleStatus
    })
  })
}

const isTesting = ref(false)

/**
 * 处理测试事件
 * @param data 测试数据
 */
const handleTestLua = (luaScript: string) => {
  if (!testDrawerRef.value) return
  isTesting.value = true
  const data = {
    ruleId: workflowData.value.id,
    luaScript: luaScript,
    configData: JSON.stringify({
      nodeList: workflowData.value.nodeList
    })
  }
  testDrawerRef.value.openDrawer(data, false, true)
}

const handleNodeClick = node => {
  console.log('节点被点击：', node)
  selectedNodeData.value = null
  showAttrPanel.value = false
  if (node && node.nodeId && editorRef.value) {
    editorRef.value.selectNodeOnly(node.nodeId)
  }
}
const closeTestDrawer = () => {
  isTesting.value = false
}

/**
 * 处理显示搜索页面
 */
const handleShowSearchModal = (data: any) => {
  searchModalData.value = data
  showSearchModal.value = true
}

/**
 * 处理关闭搜索页面
 */
const handleCloseSearchModal = () => {
  showSearchModal.value = false
}

/**
 * 搜索函数接口（供搜索页面调用）
 */
const handleSearchFunction = async (keyword: string): Promise<FunctionNode[]> => {
  try {
    // const response = await getFunctionList({
    //   pageNo: 1,
    //   pageSize: 50, // 搜索时使用较大的页面大小
    //   keyword: keyword,
    //   funcCategory: '',
    //   isMyFunction: false
    // })
    // const tempList = response.rows.map(item => transformFunctionData(item))
    const response = await getFunctionList()
    resList = JSON.parse(JSON.stringify(response))
    let tempArr: any[] = []
    tempArr = repeatLoop(response, tempArr)
    // dnd面板用
    // console.log('response===222==999',response)
    dndPageFuncData.value = response as any
    // dndPageFuncData.value = tempList
    // 全量数据缓存
    setFuncNodeData(tempArr)
    // 更新全量数据缓存
    // setFuncNodeData(tempList)
    return tempArr
  } catch (error) {
    console.error('搜索函数失败:', error)
    return []
  }
}

/**
 * 处理从搜索页面选择的节点
 */
const handleSelectSearchNode = (node: any, data: any) => {
  if (node.funcType === 'logic') {
    editorRef.value.directContectNode(node, data)
  } else {
    if (!('inputData' in node)) {
      // 从历史记录找的 可能没有全量数据 需要重新加载一波
      getFunctionNodesByIds([node.funcId])
        .then(res => {
          const funcNode = allFuncData.value.get(node.funcId)
          if (funcNode) {
            editorRef.value.directContectNode(funcNode, data)
          } else {
            console.error('获取函数节点失败:', node.funcId)
          }
        })
        .catch(err => {
          console.error('获取函数节点失败:', err)
        })
    } else {
      editorRef.value.directContectNode(node, data)
    }
  }
}
// 收缩菜单
const foldStatus = ref(true)

const foldMenu = () => {
  if (foldStatus.value) {
    foldStatus.value = false
  } else {
    foldStatus.value = true
  }
}
// 展开折叠基础函数
const dndPanelRef = ref(null)
function foldBtnMenu(type: number) {
  dndPanelRef.value[0].setFold(type)
}
// 定位位置
let nodeId = ref(null)
let currentIndex = ref(-1)
function toNode(item, index) {
  currentIndex.value = index
  nodeId.value = item.id
}
// 左侧面板显示提示
let contentTip = ref([])
function showWorkFlowInfo(item: any, index: number) {
  contentTip.value = []
  // console.log('item===', item, index)
  item.inputData?.widgetList?.forEach(p => {
    // contentTip+=p.
    if (['table', 'any'].includes(p.attributes.paramType) && !p.attributes.multiple) {
      p.attributes.desc &&
        contentTip.value.push({
          label: p.attributes.label,
          desc: p.attributes.desc
        })
    }
  })
  item.outputData?.widgetList?.forEach(p => {
    // contentTip+=p.
    if (['table', 'any'].includes(p.attributes.paramType) && !p.attributes.multiple) {
      p.attributes.desc &&
        contentTip.value.push({
          label: p.attributes.label,
          desc: p.attributes.desc
        })
    }
  })
  item.remark &&
    contentTip.value.push({
      label: '备注',
      desc: item.remark
    })
}
</script>

<style scoped lang="scss">
.rule-edit-layout {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  padding: 10px !important;
  position: relative;
  gap: 10px;
}

.fold {
  position: absolute;
  left: 44px;
  bottom: 42px;
  width: 30px;
  height: 30px;
  background: #f4f5f5;
  border-radius: 9px 9px 9px 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 103;
  svg {
    scale: 70%;
  }
}
/* .fold.active{
  background:#fff;
} */

.center-panel {
  flex: 1 1 0;
  min-width: 0;
  height: 100%;
  align-self: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.canvas-center-wrap {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 4px 32px rgba(0, 0, 0, 0.1);
  position: relative;
}

/* 拖拽面板特定样式 */
.dnd-panel {
  position: relative;
  width: 370px;
  height: 100%;
  align-self: center;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 4px 32px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  z-index: 100;
  overflow: hidden;
  &.collapsed {
    display: none;
  }

  :deep(.el-tabs__header) {
    background: #fff;
    box-sizing: border-box;
  }
  :deep(.el-tabs__item) {
    padding-top: 10px;
    width: 74px;
    height: 74px;
    margin: 7px;
    border-radius: 5px;
    text-align: center;
    font-size: 12px;
    font-weight: Semibold;
    .custom-tabs-label {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex: 1;
    }
    &:hover {
      color: #0055ff;
      path {
        fill: #0055ff !important;
      }
    }
    &.is-active {
      background: #f4f5f9;
      color: #0055ff;
      path {
        fill: #0055ff !important;
      }
    }
  }

  /* 拖拽标签页样式 */
  .dnd-tabs {
    flex: 1;
    min-height: 0;
    height: 100%;
  }

  /* 拖拽列表样式 */
  //.dnd-list {
  //  display: flex;
  //  flex-wrap: wrap;
  //  gap: 12px;
  //  padding: 16px 12px 0 12px;
  //  overflow-y: auto;
  //  max-height: 95%;
  //}

  /* 拖拽项样式 */
  //.dnd-item {
  //  width: 120px;
  //  height: 80px;
  //  background: #f7f9fa;
  //  border: 1.5px solid var(--workflow-border);
  //  border-radius: 12px;
  //  display: flex;
  //  flex-direction: column;
  //  align-items: center;
  //  justify-content: center;
  //  cursor: grab;
  //  transition: box-shadow 0.2s, border 0.2s;
  //  user-select: none;
  //  -webkit-user-select: none;
  //  -moz-user-select: none;
  //  -ms-user-select: none;
  //  pointer-events: auto;
  //}

  /* 拖拽项内部元素样式 */
  //.dnd-item * {
  //  pointer-events: none;
  //  user-select: none;
  //}

  /* 拖拽项悬停效果 */
  //.dnd-item:hover {
  //  border: 1.5px solid var(--workflow-primary);
  //  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.08);
  //}

  /* 拖拽图标样式 */
  .dnd-icon {
    margin-bottom: 6px;
  }

  /* 拖拽标题样式 */
  //.dnd-title {
  //  font-size: 15px;
  //  color: #333;
  //  font-weight: 500;
  //  text-align: center;
  //}

  .help-btn-fixed {
    position: absolute;
    right: 8px;
    bottom: 18px;
    font-size: 10px;
    color: #4d94ff;
    cursor: pointer;
    z-index: 99;
    background: #fff;
    padding: 1px 8px 0 8px;
    transition: color 0.2s, border-color 0.2s;
    box-shadow: 0 2px 8px rgba(255, 77, 79, 0.04);
    user-select: none;
  }

  .help-btn-fixed:hover {
    color: #3661d9;
  }

  /* 画布管理 */
  .dnd-canvas {
    padding-top: 10px;
    margin-right: 10px;
  }
  .dnd-canvas li {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 30px;
    line-height: 30px;
    font-family: PingFang SC, PingFang SC;
    font-weight: 400;
    font-size: 12px;
    color: #1c1a27;
    line-height: 24px;
    text-align: left;
    font-style: normal;
    text-transform: none;
    cursor: pointer;
    padding: 0 20px 0 20px;
    position: relative;
  }
  .dnd-canvas li.active {
    color: #0055ff;
  }
  .dnd-canvas li.active:hover {
    color: #1c1a27;
  }
  .dnd-canvas li:hover {
    background: #f4f5f9;
    border-radius: 9px 9px 9px 9px;
  }
  .dnd-canvas li p {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    /* width:200px; */
    position: relative;
  }
  .dnd-canvas li:hover:before {
    content: '';
    width: 0;
    height: 0;
    border-width: 4px;
    border-color: transparent transparent transparent #9d9da0;
    border-style: solid;
    position: absolute;
    z-index: 10;
    left: 8px;
    top: 50%;
    transform: translate(0, -50%);
  }
  /* .dnd-canvas li:hover p:before {
    content:"";
    width: 0;
    height: 0;
    border-width: 4px;
    border-color: transparent  transparent  transparent #9D9DA0;
    border-style: solid;
    position:absolute;
    z-index:10;
    left:10px;
    top: 10px
  } */
  .dnd-canvas li i {
    position: absolute;
    right: 10px;
    display: none;
  }
  .dnd-canvas li:hover i {
    display: block;
  }
  .btn-fold {
    display: flex;
    align-items: center;
    position: absolute;
    left: 100px;
    bottom: 32px;
    font-size: 10px;
    cursor: pointer;
    z-index: 99;
    background: #fff;
    padding: 1px 8px 0 8px;
    transition: color 0.2s, border-color 0.2s;
    box-shadow: 0 2px 8px rgba(255, 77, 79, 0.04);
    user-select: none;
    background: #f4f5f5;
    border-radius: 9px 9px 9px 9px;
    width: 62px;
    height: 30px;
  }
  .btn-fold span {
    width: 30px;
    height: 30px;
    background: #f4f5f5;
    align-content: center;
  }
  .btn-fold em {
    color: #dce0e1;
  }
}

/* 抽屉内容动画 */
.drawer-content {
  flex: 1;
  overflow-y: auto;
  padding: 0 20px;
  background: #fff;
  opacity: 0;
  transform: translateX(20px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transition-delay: 0.1s;
}

.drawer-open .drawer-content {
  opacity: 1;
  transform: translateX(0);
}

/* 抽屉头部样式 */
.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  flex-shrink: 0;
}

.drawer-title-container {
  display: flex;
  align-items: center;
  flex: 1;
  overflow: hidden;
}

.drawer-title {
  display: flex;
  align-items: center;
  font-size: 18px;
  font-weight: 500;
  color: #303133;
  width: 100%;
}

.drawer-actions {
  display: flex;
  align-items: center;
  margin-left: 16px;
}

.node-id {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 25px;
  height: 25px;
  border-radius: 50%;
  border: 2px solid #409eff;
  color: #409eff;
  font-weight: 600;
  font-size: 14px;
  margin-right: 6px;
  flex-shrink: 0;
}

.node-title-container {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
  cursor: pointer;
  padding: 0 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
  max-width: calc(100% - 40px);

  &:hover {
    background-color: rgba(64, 158, 255, 0.05);
  }

  .node-title {
    font-size: 18px;
    font-weight: 500;
    color: #303133;
    width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: inline-block;
  }
  .node-title-input {
    width: 100%;
    border: none;
    outline: none;
    font-size: 18px;
    font-weight: 500;
    color: #303133;
  }
}

/* 确保画布区域可以正常接收点击事件 */
.center-panel {
  pointer-events: auto;
  z-index: 1;
}
.snapline {
  border-color: #1890ff;
  border-style: dashed;
}
</style>
