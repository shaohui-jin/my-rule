<template>
  <div class="condition-node-panel">
    <el-form label-width="70px" :model="nodeData">
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
          @keydown.enter.exact.prevent="finishEditRemark"
          @keydown.esc.prevent="cancelEditRemark"
        ></textarea>
      </div>

      <div class="param-group-title">输入参数</div>
      <div class="param-list">
        <div v-for="(item, idx) in allInputOptions" :key="idx" class="param-row">
          <div class="param-label-col">
            <span class="param-label">{{ item.rstLabel }}</span>
          </div>
          <div class="param-input-group">
            <el-input
              :model-value="item.label"
              disabled
              style="pointer-events: none; user-select: none"
              placeholder=""
            />
          </div>
        </div>
      </div>
      <div class="divider" />
      <div class="param-group-title-row">
        <div class="param-group-title">出参配置：</div>
        <div class="button-group">
          <el-tooltip placement="top" raw-content>
            <template #content>
              <div
                style="
                  font-family: 'Courier New', Courier, monospace;
                  line-height: 1.5;
                  font-size: 13px;
                "
              >
                <p style="margin: 0 0 5px 0">
                  <strong>Lua 条件表达式指南</strong>
                </p>
                <p style="margin: 0 0 5px 0">1. 请使用 Lua 规范编写条件表达式。</p>
                <p style="margin: 0 0 5px 0; font-size: 1.1em; color: #e6a23c; font-weight: bold">
                  2. 表达式中的
                  <code>rst</code>
                  代表上游节点的返回值。
                </p>
                <div>3. Lua 基本语法:</div>
                <div style="padding-left: 10px">
                  <p style="margin: 2px 0">
                    <strong>关系运算符:</strong>
                    <code>=</code>
                    ,
                    <code>&lt;&gt;</code>
                    ,
                    <code>&gt;</code>
                    ,
                    <code>&lt;</code>
                    ,
                    <code>&gt;=</code>
                    ,
                    <code>&lt;=</code>
                  </p>
                  <p style="margin: 2px 0">
                    <strong>逻辑运算符:</strong>
                    <code>and</code>
                    ,
                    <code>or</code>
                    ,
                    <code>not</code>
                  </p>
                </div>
                <p style="margin: 8px 0 5px 0">
                  <strong>示例:</strong>
                </p>
                <div style="background: #f5f5f5; padding: 5px; border-radius: 4px">
                  <p style="margin: 0 0 5px 0">
                    <code style="color: #666"> rows(rst) &gt; 0 or rst[1].w == 10</code>
                    <br />
                    <span style="color: #666">
                      含义: 返回值列表长度大于0, 或其
                      <strong>第1个</strong>
                      元素的 'w' 属性等于10。
                    </span>
                  </p>
                  <p style="margin: 0">
                    <code style="color: #666">rst &gt;= 0 and rst &lt;&gt; 10</code>
                    <br />
                    <span style="color: #666">
                      含义: 返回值大于等于
                      <strong>0</strong>
                      , 且不等于10。
                    </span>
                  </p>
                </div>
              </div>
            </template>
            <el-icon class="help-icon"><QuestionFilled /></el-icon>
          </el-tooltip>
          <el-button type="primary" @click="addElseIf" class="add-else-btn narrow-add-btn">
            + 分支
          </el-button>
        </div>
      </div>
      <div class="branch-list scrollable-branch-list">
        <div v-for="(param, idx) in nodeData.outputData" :key="idx" class="branch-card">
          <div class="branch-row">
            <span class="branch-label">
              {{ idx === 0 ? 'if' : idx === nodeData.outputData.length - 1 ? 'else' : 'elseif' }}
            </span>
            <template v-if="idx !== nodeData.outputData.length - 1">
              <BaseFunctionExpression
                v-if="nodeData.version > '1.0.0'"
                v-model="param.conditionCheck"
                :nodeData="nodeData"
                :workflowData="workflowData"
                placeholder="rst = 5 (lua规范)"
                type="textarea"
                :disabled="props.disabled"
                class="branch-cond-input"
              />
              <el-input
                v-else
                :disabled="props.disabled"
                v-model="param.conditionCheck"
                placeholder="#rst == 5 (lua规范)"
                class="branch-cond-input"
                style="flex: 1"
              />
            </template>
          </div>
          <div class="branch-row">
            <span class="branch-label">目标</span>
            <el-input
              :model-value="getOutputTargetInfo(nodeData, param, props.workflowData)"
              disabled
              placeholder="目标"
              class="branch-target-input"
              style="flex: 1"
            />
          </div>
          <el-button
            v-if="
              idx !== 0 && idx !== nodeData.outputData.length - 1 && nodeData.outputData.length > 2
            "
            type="danger"
            @click="removeBranch(idx)"
            circle
            class="branch-del"
            style="position: absolute; top: 16px; right: 16px; z-index: 2"
          >
            <span class="branch-del-inner">-</span>
          </el-button>
        </div>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { toRefs, defineEmits, computed, ref } from 'vue'
import { QuestionFilled } from '@element-plus/icons-vue'
import { getOutputTargetInfo } from './panelUtils'
import BaseFunctionExpression from '@/components/BaseFunctionExpression/index.vue'

const props = defineProps<{
  nodeData: any
  workflowData: any
  disabled: boolean
  getAvailableSourceOptions: (param: any) => any[]
  onParamSourceChange: (param: any, value: any) => void
  onParamInputChange: (param: any, value: any) => void
  getAvailableTargetOptions: () => any[]
}>()
const emit = defineEmits(['update:nodeBaseData', 'update:addPortData', 'update:removePortData'])
const { nodeData } = toRefs(props)

// 备注编辑状态
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

// 新增：将所有param的options展开为一维数组，并生成rst序号
const allInputOptions = computed(() => {
  const arr: { label: string; value: any; rstLabel: string }[] = []
  let idx = 0
  for (const param of nodeData.value.inputData || []) {
    const options = props.getAvailableSourceOptions(param) || []
    for (const option of options) {
      arr.push({
        label: option.label,
        value: option.value,
        rstLabel: idx === 0 ? 'rst' : `rst${idx}`
      })
      idx++
    }
  }
  return arr
})

function calcPortId(): string {
  //遍历 nodeData.value.outputData 找出所有 portId 中最大的数字
  const portId = nodeData.value.outputData.map((item: any) => Number(item.portId.split('_')[1]))
  const maxPortId = Math.max(...portId)
  return String(maxPortId + 1)
}

function onNodeTitleChange(val: string) {
  nodeData.value.title = val
  emit('update:nodeBaseData', nodeData.value.id)
}

function addElseIf(): void {
  if (props.disabled) {
    return
  }
  const newBranch = {
    conditionCheck: '',
    target: '',
    type: 'table',
    subType: 'any',
    portId: 'out_' + calcPortId()
  }
  emit('update:addPortData', newBranch, nodeData.value.id)
}

function removeBranch(idx: number) {
  if (props.disabled) {
    return
  }
  if (nodeData.value.outputData.length > 2) {
    emit('update:removePortData', idx, nodeData.value.id)
  }
}
</script>

<style scoped>
.condition-node-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
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

.el-form {
  display: flex;
  flex-direction: column;
  flex: 1 1 0;
  min-height: 0;
  padding-left: 0 !important;
  padding-right: 0 !important;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  margin-top: 0;
}
.divider {
  height: 1px;
  background: #ececec;
  margin: 10px 0 6px 0;
}

.param-group-title {
  font-weight: 600;
  font-size: 15px;
  margin: 8px 0 4px 0;
  color: #222;
  letter-spacing: 1px;
  user-select: none;
}

.param-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 8px;
}

.param-row {
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 24px;
  margin-bottom: 0;
}

.param-label-col {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  width: 60px;
  min-width: 60px;
  margin-right: 2px;
  user-select: none;
}

.param-label {
  color: #333;
  font-size: 13px;
  font-weight: 500;
  text-align: right;
  max-width: 80px;
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
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
  width: 100%;
}
.param-input-group .el-input,
.param-input-group .el-select {
  width: 100% !important;
  min-width: 120px !important;
  max-width: 170px !important;
  height: 28px !important;
  max-height: 28px !important;
  font-size: 13px;
}

.param-toggle {
  background: transparent;
  border: none;
  padding: 0;
  margin-left: 2px;
  width: 14px;
  height: 14px;
  min-width: 14px;
  min-height: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.branch-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 8px;
}

.branch-card {
  background: #f8fafd;
  border-radius: 8px;
  padding: 6px 8px 4px 8px;
  position: relative;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.03);
}

.branch-row {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}

.branch-label {
  width: 40px;
  font-size: 13px;
  color: #333;
  font-weight: 500;
  margin-right: 4px;
  text-align: right;
  user-select: none;
}

.branch-target-input {
  width: 100px;
}

.scrollable-branch-list {
  flex: 1 1 0;
  min-height: 0;
  max-height: none;
  overflow-y: auto;
  padding-right: 2px;
}

.branch-del {
  position: absolute;
  top: -10px !important;
  right: 0px !important;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1.2px solid #ff4d4f !important;
  background: transparent !important;
  color: #ff4d4f !important;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: bold;
  line-height: 1;
  padding: 0;
  box-shadow: none !important;
  z-index: 2;
}

.branch-del-inner {
  color: #ff4d4f;
  font-size: 13px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  line-height: 1;
}

.add-else-btn {
  margin-top: 2px;
  margin-left: 6px;
  min-width: 50px;
  height: 20px;
  font-weight: 500;
  letter-spacing: 1px;
  border-radius: 5px;
  background: #409eff;
  color: #fff;
  border: none;
  transition: background 0.2s;
  box-shadow: 0 1px 4px rgba(64, 158, 255, 0.08);
  padding: 0 8px;
  font-size: 12px;
}

.add-else-btn:hover {
  background: #66b1ff;
  color: #fff;
  border: none;
  transition: background 0.2s;
  box-shadow: 0 1px 4px rgba(64, 158, 255, 0.08);
  padding: 0 8px;
  font-size: 12px;
}

.help-icon {
  margin-right: 8px;
  color: #909399;
  cursor: pointer;
  font-size: 16px;
}

.button-group {
  display: flex;
  align-items: center;
}

.param-group-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.narrow-add-btn {
  min-width: 32px;
  width: 50px;
  padding: 0 4px;
  height: 18px;
  font-size: 12px;
  border-radius: 5px;
  margin-left: 4px;
}

.panel-section-title {
  font-size: 15px;
  font-weight: 600;
  color: #222;
  margin: 0 0 4px 0;
  letter-spacing: 1px;
  user-select: none;
}

.el-form-item {
  margin-bottom: 8px !important;
}
</style>
