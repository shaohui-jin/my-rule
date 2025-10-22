<template>
  <div class="func-node-panel">
    <el-form label-width="70px" :model="nodeData" @submit.prevent>
      <!-- 节点备注编辑区域 -->
      <div class="remark-container" @click="startEditRemark">
        <textarea
          ref="remarkInputRef"
          v-model="nodeData.remark"
          class="remark-input"
          placeholder="请输入备注"
          rows="3"
          :disabled="props.disabled"
          @blur="finishEditRemark"
          @input="finishEditRemark"
          @keydown.enter.exact.prevent="finishEditRemark"
          @keydown.esc.prevent="cancelEditRemark"
        />
      </div>

      <div class="param-group-title">输入参数</div>
      <div class="param-list">
        <div v-for="(param, idx) in nodeData.inputData" :key="idx" class="param-row">
          <div class="param-input-group">
            <!-- 手动输入模式 - 使用 SimpleFormRenderer -->
            <SimpleFormRenderer
              :formJson="{
                formConfig: {},
                widgetList: [
                  {
                    id: `${param.paramName}_${idx}`,
                    type: param.widgetType,
                    label: param.paramName,
                    parentSource: param.source,
                    sourceType: param.sourceType,
                    defaultValue:
                      param.sourceType === 'node' && !param.source
                        ? ''
                        : param.source || param.defaultValue,
                    options:
                      nodeData.funcType === 'logic' &&
                      nodeData.logicData?.logicType === LogicType.GLOBAL_VARIABLE
                        ? getAllAvailableOptions(param)
                        : param.options,
                    rules: param.rules,
                    attributes: {
                      ...param.attributes,
                      placeholder: `请输入值`,
                    }
                  }
                ]
              }"
              :showModeToggle="true"
              :nodeData="nodeData"
              :disabled="props.disabled"
              :workflowData="workflowData"
              :input-mode="param.sourceType === 'node' ? 'node' : 'manual'"
              :node-options="getOptions(param, idx)"
              @change="e => onParamInputChange(param, e.value)"
              @mode-change="toggleInputMode(param)"
            />
          </div>
        </div>
      </div>
      <div class="divider" />
      <div class="param-group-title">输出参数</div>
      <div class="param-list">
        <div v-for="(param, idx) in nodeData.outputData" :key="idx" class="param-row">
          <el-tooltip :content="param.attributes?.paramSubType" placement="top">
            <div class="param-label-col">
              <span class="param-label">{{ param.paramName }}</span>
              <span class="param-type-under">({{ param.type }})</span>
            </div>
          </el-tooltip>
          <div class="param-input-group">
            <el-input
              :model-value="
                getOutputTargetInfo(nodeData, param, props.workflowData) === '未连接'
                  ? '无'
                  : getOutputTargetInfo(nodeData, param, props.workflowData)
              "
              disabled
              placeholder="目标节点"
              style="width: 180px"
            />
          </div>
        </div>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { toRefs, ref } from 'vue'
import SimpleFormRenderer from '@/components/funcForm/SimpleFormRenderer.vue'
import { getOutputTargetInfo } from './panelUtils'
import { ElTooltip } from 'element-plus'
import { LogicType } from '@/type/workflow'
import { ElMessage } from 'element-plus'
const props = defineProps<{
  nodeData: any
  workflowData: any
  disabled: boolean
  getAvailableSourceOptions: (param: any) => any[]
  getAllAvailableOptions: (param: any) => any[]
}>()

const emit = defineEmits(['update:nodeBaseData', 'update:removePortData', 'update:addPortData'])

const { nodeData } = toRefs(props)
const remarkInputRef = ref<HTMLTextAreaElement | null>(null)
const originalRemark = ref('')

// 开始编辑备注
function startEditRemark() {
  originalRemark.value = nodeData.value.remark || ''
  // 在下一个事件循环中聚焦输入框
  setTimeout(() => {
    if (remarkInputRef.value) {
      remarkInputRef.value.focus()
    }
  }, 10)
}

// 完成编辑备注
function finishEditRemark() {
  // 更新节点基本数据
  emit('update:nodeBaseData', nodeData.value.id)
}

// 取消编辑备注
function cancelEditRemark() {
  nodeData.value.remark = originalRemark.value
}

// 切换输入模式
const toggleInputMode = (param: any) => {

  if( nodeData.value.funcType === 'logic' && nodeData.value.logicData?.logicType === LogicType.ITERATOR) {
    ElMessage.warning(`迭代器节点不能切换输入模式`)
    return
  }

  // 切换前清空值
  param.source = ''
  param.defaultValue = ''
  param.sourceType = param.sourceType === 'input' ? 'node' : 'input'
  // 删除节点
  // idx表示是nodeData.inputData的索引值
  // console.log('切换输入模式', param)
  let idx = null
  let nodeCount = 0
  let label = ''
  let portLabel = ''
  nodeData.value.inputData.forEach((item, index) => {
    if (item.portId === param.portId) {
      idx = index
      label = item.attributes.label
      portLabel = item.portId
    }
    if (item.sourceType === 'node') {
      nodeCount++
    }
  })
  console.log('item', label, portLabel)
  if (nodeCount < 1) {
    // param.sourceType = 'node'
    ElMessage.warning(`${portLabel} ${label} 需保留一个入参桩点进行连线，确保画布流程正常。`)
    return
  }
  // if (param.sourceType === 'node') {
  //   emit('update:addPortData', idx, nodeData.value.id, 'in')
  // } else {
  // }
  // if (param.sourceType === 'input') return
  emit('update:removePortData', idx, nodeData.value.id, 'in')
  // console.log('idx', idx, nodeData.value.id, '===', param)
}
// 修改参数 值数据
const onParamInputChange = (param: any, val: any) => {
  param.source = val

  // 通用参数联动处理
  if (val && param.linkedParams && param.linkedParams.length > 0) {
    updateLinkedParams(param, val)
  }
}

// 通用参数联动更新函数
const updateLinkedParams = (sourceParam: any, sourceValue: string) => {
  if (!sourceParam.linkedParams || sourceParam.linkedParams.length === 0) {
    return
  }

  // 遍历所有受影响的参数
  sourceParam.linkedParams.forEach((targetParamName: string) => {
    const targetParam = nodeData.value.inputData.find(
      (param: any) => param.paramName === targetParamName
    )

    if (targetParam && targetParam.dynamicOptions) {
      // 根据联动源的值获取对应的选项
      const newOptions = targetParam.dynamicOptions[sourceValue] || []
      if(JSON.stringify(targetParam.options) == JSON.stringify(newOptions)) return;

      targetParam.options = newOptions
      // 清空之前的选择值，避免无效选择
      if (targetParam.source && !newOptions.find(opt => opt.value === targetParam.source)) {
        targetParam.source = ''
      }

      console.log(`参数 ${sourceParam.paramName} 值 ${sourceValue} 对应的 ${targetParamName} 选项已更新:`, newOptions)
    }
  })
}
// 每个入参桩点的下拉框
const portSelects = []
function getOptions(param, idx) {
  portSelects[idx] = []
  let options = props.getAvailableSourceOptions(param)
  if(param.sourceType === 'node') {
    options.forEach(opt => {
      if(opt.label.includes('[条件]')) {
        if (param.source) {
          if(opt.currentSource === param.source || opt.value === param.source) {
            portSelects[idx].push({
              label: opt.label,
              value: opt.value
            })
          }
        } else {
          portSelects[idx].push({
            label: opt.label,
            value: opt.value
          })
        }
      } else {
        if (param.attributes.label == opt.currentLabel) {
          portSelects[idx].push({
            label: opt.label,
            value: opt.value
          })
        }
      }
    })
    if(portSelects[idx].length) {
      // 同时因为连线的问题需要判断ifelse是否有上游节点
      param.source = portSelects[idx][0]?.value
    }
    // 去重
    // const uniqueById = new Map();
    // portSelects.forEach(item => uniqueById.set(item.value, item));
    // // 转换为数组
    // const result = Array.from(uniqueById.values());
    return portSelects[idx];
  } else {
    return []
  }
}
</script>

<style scoped>
.func-node-panel {
  padding: 2px 0 2px 0;
}

/* 备注编辑区域样式 */
.remark-container {
  position: relative;
  margin-top: 16px;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s;
  overflow: hidden;
}

.remark-content {
  min-height: 60px;
  padding: 8px 12px;
  font-size: 14px;
  line-height: 1.5;
  color: #333;
  background-color: #f5f7fa;
  border-radius: 4px;
  white-space: pre-wrap;
  word-break: break-word;
}

.remark-content.no-remark {
  color: #909399;
  font-style: italic;
}

.remark-input {
  width: 100%;
  min-height: 60px;
  padding: 8px 12px;
  font-size: 14px;
  line-height: 1.5;
  color: #333;
  background-color: #f5f7fa;
  border-radius: 4px;
  outline: none;
  font-family: inherit;
  margin-bottom: 0;
}

.divider {
  height: 1px;
  background: #ececec;
  margin: 12px 0 8px 0;
}

.param-group-title {
  font-weight: 600;
  font-size: 15px;
  margin: 10px 0 6px 0;
  color: #222;
  letter-spacing: 1px;
  user-select: none;
}

.param-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 10px;
}

.param-row {
  display: flex;
  align-items: center;
  padding: 4px 0;
}

.param-label-col {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  width: 60px;
  min-width: 60px;
  margin-right: 2px;
  user-select: none;
  pointer-events: auto;
}

.param-label {
  color: #333;
  font-size: 13px;
  font-weight: 500;
  text-align: right;
  max-width: 70px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  user-select: none;
}

.param-type-under {
  color: #aaa;
  font-size: 11px;
  margin-top: 1px;
  text-align: right;
  user-select: none;
}

.param-input-group {
  flex: 1;
  display: flex;
  align-items: center;
  margin-left: 10px;
  gap: 8px;
}

/* 确保 SimpleFormRenderer 内的表单控件宽度合适 */
:deep(.simple-form-renderer) {
  padding: 0;
  flex: 1;
}

:deep(.simple-form-renderer .el-form-item) {
  margin: 0;
}

:deep(.simple-form-renderer .el-form-item__content) {
  width: auto;
}

/* 输出参数区块样式优化 */
.param-output-target {
  flex: 2;
  min-width: 90px;
  max-width: 180px;
  margin-left: 6px;
  user-select: none;
}

/* 表单项间距优化 */
.el-form-item {
  margin-bottom: 8px !important;
}

.el-form {
  padding-left: 0 !important;
}

.panel-section-title {
  font-size: 15px;
  font-weight: 600;
  color: #222;
  margin: 0 0 8px 0;
  letter-spacing: 1px;
  user-select: none;
}
</style>
