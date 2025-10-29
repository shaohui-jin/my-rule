<template>
  <div class="decision-table-edit-panel">
    <!-- 头部 -->
    <div class="panel-header">
      <div class="header-title">决策表</div>
      <el-button
        class="close-btn"
        size="small"
        @click="closePanel"
        text
      >
        X
      </el-button>
    </div>

    <!-- 按钮工具栏 -->
    <div class="button-toolbar">
      <div class="left-buttons">
         <el-button class="toolbar-btn" size="small" @click="downloadTemplate">下载模版</el-button>
         <el-button class="toolbar-btn" size="small" @click="uploadExcel" :disabled="props.disabled">上传 Excel</el-button>
      </div>

      <div class="right-buttons">
         <el-button class="toolbar-btn" size="small" @click="downloadDecisionTable">下载决策表</el-button>
      </div>
    </div>

    <!-- 表格区域 -->
    <div class="table-container">
      <div class="custom-table">
        <!-- 表头 -->
        <div class="table-header">
                     <!-- 第一行：分组标题 -->
           <div class="header-row header-row-1">
             <div class="header-cell index-header" style="width: 100px;">
               <div class="corner-triangle"></div>
             </div>
             <div
               v-for="group in tableGroups"
               :key="group.type"
               class="header-cell group-header"
               :class="{ 'selected': isGroupSelected(group.type) }"
               :style="{ width: group.width + 'px' }"
               @click="(event) => handleGroupHeaderClick(event, group)"
             >
               {{ group.label }}
             </div>
           </div>

          <!-- 第二行：字段名 -->
          <div class="header-row header-row-2">
            <div class="header-cell index-header" style="width: 100px;">序号</div>
            <div
               v-for="field in allFields"
               :key="field.id"
               class="header-cell field-header"
               :class="{ 'selected': selectedColumn === field.id }"
               :style="{ width: field.width + 'px' }"
               :data-field-id="field.id"
               :data-field-type="field.type"
               @click="handleFieldHeaderClick(field)"
               @mousemove="handleFieldHeaderMouseMove($event, field)"
               @mouseleave="handleFieldHeaderMouseLeave(field)"
             >
               <div class="field-header-content">
                 <span class="field-name">{{ field.name }}</span>
                 <div class="field-actions">
                   <el-button
                     size="small"
                     type="text"
                     class="add-col-btn add-col-btn-right"
                     :class="{ 'show': field.showAddRight }"
                     :disabled="props.disabled"
                     @click.stop="addColumnAfter(field)"
                   >
                     +
                   </el-button>

                   <el-button
                     size="small"
                     type="text"
                     class="add-col-btn add-col-btn-left"
                     :class="{ 'show': field.showAddLeft }"
                     :disabled="props.disabled"
                     @click.stop="addColumnBefore(field)"
                   >
                     +
                   </el-button>
                 </div>
                 <!-- 标签容器 -->
                 <div class="labels-container">
                   <!-- 参数代码标签 -->
                   <div class="param-code-label">
                     {{ field.originalName }}
                   </div>
                   <!-- 参数类型标签 -->
                   <div class="param-type-label" :class="`param-type-${field.paramType}`">
                     {{ field.paramType }}
                   </div>
                 </div>
               </div>
             </div>
          </div>
        </div>

        <!-- 表格内容 -->
        <div class="table-body">
          <div
            v-for="(row, rowIndex) in tableData"
            :key="row.index"
            class="table-row"
            :data-row-index="rowIndex"
            :draggable="!isRowEditing(rowIndex)"
            @dragstart="handleDragStart($event, rowIndex)"
            @dragover="handleDragOver($event, rowIndex)"
            @drop="handleDrop($event, rowIndex)"
            @dragend="handleDragEnd"
            @mousemove="handleRowMouseMove($event, row)"
            @mouseleave="handleRowMouseLeave(row)"
      >
            <!-- 序号列 -->
            <div
              class="table-cell index-cell"
              :class="{ 'row-selected': selectedRow === rowIndex }"
              style="width: 100px;"
              @click="handleRowSelect(rowIndex)"
            >
              {{ row.index }}
            </div>

              <!-- 数据列 -->
              <div
                v-for="field in allFields"
                :key="field.id"
                class="table-cell data-cell"
                                  :class="{
                   'selected': selectedColumn === field.id,
                   'row-selected': selectedRow === rowIndex
                 }"
                :style="{ width: field.width + 'px' }"
                :data-field-id="field.id"
                :data-field-type="field.type"
                @dblclick="handleCellClick(rowIndex, field, $event)"
                @mouseenter="handleCellMouseEnter(rowIndex, field)"
                @mouseleave="handleCellMouseLeave(rowIndex, field)"
              >
               <template v-if="editingCell?.rowIndex === rowIndex && editingCell?.fieldId === field.id">
                 <input
                   ref="editInput"
                   v-model="editingValue"
                   class="cell-edit-input"
                   @blur="finishEdit"
                   @keyup.enter="finishEdit"
                   @keyup.esc="cancelEdit"
                   @mousedown.stop
                   @mouseup.stop
                   @mousemove.stop
                 />
               </template>
               <template v-else>
                 {{ getCellValue(row, field) }}
               </template>

               <!-- 单元格右上角按钮 -->
               <div
                 v-if="row.showCellButton && field.showCellButton"
                 class="cell-action-btn"
                 @click.stop="handleCellButtonClick(rowIndex, field)"
               >
                 <div class="btn-numbers">
                   <div class="number-row">
                     <span class="number">1</span>
                     <span class="number">2</span>
                   </div>
                   <div class="number-row">
                     <span class="number">3</span>
                     <span class="number">4</span>
                   </div>
                 </div>
               </div>
             </div>

            <!-- 行操作按钮 -->
            <div class="row-actions">
              <el-button
                size="small"
                type="text"
                class="add-row-btn add-row-btn-top"
                :class="{ 'show': row.showAddTop }"
                :disabled="props.disabled"
                @click="addRowBefore(rowIndex)"
              >
                +
              </el-button>
              <el-button
                size="small"
                type="text"
                class="add-row-btn add-row-btn-bottom"
                :class="{ 'show': row.showAddBottom }"
                :disabled="props.disabled"
                @click="addRowAfter(rowIndex)"
              >
                +
              </el-button>
            </div>
          </div>
        </div>
          </div>
    </div>

    <!-- 底部按钮 -->
    <div class="panel-footer">
      <el-button class="footer-btn confirm-btn" @click="onBtnOkClick">确定</el-button>
      <el-button class="footer-btn cancel-btn" @click="onBtnCancelClick">取消</el-button>
    </div>

    <!-- 隐藏的文件输入框 -->
    <input
      ref="fileInputRef"
      type="file"
      accept=".xlsx,.xls"
      class="file-input"
      @change="handleFileChange"
    />

    <!-- 参数编辑面板 -->
    <DecisionTableParamEditPanel
      v-if="showParamEditPanel"
      :param-data="currentParamData"
      :part-list="partList"
      :table-list="tableList"
      :param-list="paramList"
      :canvas-list="canvasList"
      :tree-data="treeData"
      @close="handleParamPanelClose"
      @confirm="handleParamPanelConfirm"
    />

    <!-- 表达式编辑面板 -->
    <div v-if="showExpressionPanel" class="expression-test-panel">
      <div class="expression-panel-content">
        <BaseFunctionExpression
          :model-value="currentExpressionData?.value || ''"
          :is-show-title="false"
          :node-data="props.nodeData"
          :workflow-data="props.workflowData"
          :default-show-full-screen="true"
          :confirm="handleExpressionPanelConfirm"
          :cancel="handleExpressionPanelClose"
          @update:model-value="(val) => currentExpressionData && (currentExpressionData.value = val)"
          class="expression-editor"
        />
      </div>
      <label/>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import DecisionTableParamEditPanel from './DecisionTableParamEditPanel.vue'
import { DecisionTableExpressionConfig, DecisionTableParamData, DecisionTableRowData } from '@/type/workflow';
import { batchGetLuaByExpressions } from '@/api/Lua';
import { useParamStore } from '@/store/modules/params'
import * as XLSX from 'xlsx'
import { defaultMockDecisionTableData, decisionTableTemplateData } from './DecisiontableConfig'
import { useRoute } from 'vue-router'
import BaseFunctionExpression from '@/components/BaseFunctionExpression/index.vue'
const route = useRoute()

const paramStore = useParamStore()
// 定义参数结构
// interface TableParam {
//   paramName: string
//   paramValue: string
//   paramType: string
//   paramCode: string
//   isCustom: number
// }

// 定义表格数据结构
interface TableRow {
  id: string
  index: number
  Input: DecisionTableParamData[]
  Output: DecisionTableParamData[]
  Annotations: DecisionTableParamData[]
  showAddTop?: boolean
  showAddBottom?: boolean
  showCellButton?: boolean
}

// 定义字段结构
interface TableField {
  id: string
  name: string
  type: 'Input' | 'Output' | 'Annotations'
  width: number
  originalName: string
  paramType: string
  showAddRight?: boolean
  showAddLeft?: boolean
  showCellButton?: boolean
}

// 定义分组结构
interface TableGroup {
  type: 'Input' | 'Output' | 'Annotations'
  label: string
  fields: TableField[]
  width: number
}

// Props
interface Props {
  nodeData?: any
  onClose?: () => void
  decisionTableData?: any // 决策表数据
  workflowData?: any // 工作流数据
  disabled?: boolean,
}

const props = withDefaults(defineProps<Props>(), {
  nodeData: () => ({}),
  onClose: () => {},
  decisionTableData: () => ({}),
  workflowData: () => ({}),
  disabled: false
})

// 定义事件
const emit = defineEmits(['close', 'confirm'])

// 响应式数据
const dragSourceIndex = ref<number | null>(null)
const selectedColumn = ref<string | null>(null) // 当前选中的列ID
const selectedRow = ref<number | null>(null) // 当前选中的行索引

// 参数编辑面板相关
const showParamEditPanel = ref(false)
const currentEditingField = ref<TableField | null>(null)
const currentParamData = ref<any>(null)
const editingParamCode = ref<string>('') // 记录正在编辑的参数代码

// 参数数据相关
const partList = ref<any[]>([])
const tableList = ref<any[]>([])
const paramList = ref<any[]>([])
const canvasList = ref<any[]>([])
const treeData = ref<any[][]>([[], [], [], []])

// BaseFunctionExpression 相关状态
const showExpressionPanel = ref(false)
const currentExpressionData = ref<{ rowIndex: number; field: TableField; value: string } | null>(null)

// 编辑状态管理
const editingCell = ref<{ rowIndex: number; fieldId: string } | null>(null)
const editingValue = ref('')

// 双击检测相关
const clickTimer = ref<NodeJS.Timeout | null>(null)
const clickDelay = 300 // 300ms 延迟，用于区分单击和双击

// 文件输入框引用
const fileInputRef = ref<HTMLInputElement>()

// 表格数据
const tableData = ref<TableRow[]>([])

// 字段配置
const fields = ref<TableField[]>([])



// const BaseFunctionExpression = defineAsyncComponent(() => import('@/components/BaseFunctionExpression/index.vue'))

// 默认的模拟决策表数据（当节点数据为空时使用）
// 已从 DecisiontableConfig 文件导入

/**
 * 数据模板
 */
const dataModel = [
  {
    id: "row1",
    index: 1,
    Input: [
      { paramName: "CXHD名", paramValue: "CXHD=11", paramType: "string", paramCode: "CXHD", isCustom: 0 },
    ],
    Output: [
      { paramName: "name名", paramValue: "国产三节GC3", paramType: "string", paramCode: "name", isCustom: 0 },
      { paramName: "code名", paramValue: "GC3", paramType: "string", paramCode: "code", isCustom: 0 },
      { paramName: "size名", paramValue: "8", paramType: "number", paramCode: "size", isCustom: 0 }
    ],
    Annotations: [
      { paramName: "描述备注名", paramValue: "备注", paramType: "string", paramCode: "desc", isCustom: 0 }
    ]
  },
  {
    id: "row2",
    index: 2,
    Input: [
      { paramName: "CXHD名", paramValue: "CXHD=12", paramType: "string", paramCode: "CXHD", isCustom: 0 },
    ],
    Output: [
      { paramName: "name名", paramValue: "国产三节GC3", paramType: "string", paramCode: "name", isCustom: 0 },
      { paramName: "code名", paramValue: "GC3", paramType: "string", paramCode: "code", isCustom: 0 },
      { paramName: "size名", paramValue: "10", paramType: "number", paramCode: "size", isCustom: 0 }
    ],
    Annotations: [
      { paramName: "描述备注", paramValue: "备注", paramType: "string", paramCode: "desc", isCustom: 0 }
    ]
  },
  {
    id: "row3",
    index: 3,
    Input: [
      { paramName: "CXHD名", paramValue: "CXHD=13", paramType: "string", paramCode: "CXHD", isCustom: 0 },
    ],
    Output: [
      { paramName: "name名", paramValue: "国产三节GC3", paramType: "string", paramCode: "name", isCustom: 0 },
      { paramName: "code名", paramValue: "GC3", paramType: "string", paramCode: "code", isCustom: 0 },
      { paramName: "size名", paramValue: "12", paramType: "number", paramCode: "size", isCustom: 0 }
    ],
    Annotations: [
      { paramName: "描述备注", paramValue: "备注", paramType: "string", paramCode: "desc", isCustom: 0 }
    ]
  },
  {
    id: "row4",
    index: 4,
    Input: [
      { paramName: "CXHD名", paramValue: "CXHD=14", paramType: "string", paramCode: "CXHD", isCustom: 0 },
    ],
    Output: [
      { paramName: "name名", paramValue: "国产三节GC3", paramType: "string", paramCode: "name", isCustom: 0 },
      { paramName: "code名", paramValue: "GC3", paramType: "string", paramCode: "code", isCustom: 0 },
      { paramName: "size名", paramValue: "14", paramType: "number", paramCode: "size", isCustom: 0 }
    ],
    Annotations: [
      { paramName: "描述备注", paramValue: "备注", paramType: "string", paramCode: "desc", isCustom: 0 }
    ]
  }
]



// 计算所有字段
const allFields = computed(() => fields.value)

// 计算表格分组
const tableGroups = computed(() => {
  const groups: TableGroup[] = []

  // Input组
  const inputFields = fields.value.filter(f => f.type === 'Input')
  if (inputFields.length > 0) {
    groups.push({
      type: 'Input',
      label: 'Input',
      fields: inputFields,
      width: inputFields.reduce((sum, f) => sum + f.width, 0)
    })
  }

  // Output组
  const outputFields = fields.value.filter(f => f.type === 'Output')
  if (outputFields.length > 0) {
    groups.push({
      type: 'Output',
      label: 'Output',
      fields: outputFields,
      width: outputFields.reduce((sum, f) => sum + f.width, 0)
    })
  }

  // Annotations组
  const annotationsFields = fields.value.filter(f => f.type === 'Annotations')
  if (annotationsFields.length > 0) {
    groups.push({
      type: 'Annotations',
      label: 'Annotations',
      fields: annotationsFields,
      width: annotationsFields.reduce((sum, f) => sum + f.width, 0)
    })
  }

  return groups
})

// 获取单元格值
const getCellValue = (row: TableRow, field: TableField) => {
  if (field.type === 'Input') {
    const param = row.Input.find(p => p.paramCode === field.originalName)
    return param ? param.paramValue : ''
  } else if (field.type === 'Output') {
    const param = row.Output.find(p => p.paramCode === field.originalName)
    return param ? param.paramValue : ''
  } else if (field.type === 'Annotations') {
    const param = row.Annotations.find(p => p.paramCode === field.originalName)
    return param ? param.paramValue : ''
  }
  return ''
}


// 生成随机参数名
const generateRandomParamName = (type: string) => {
  const randomNum = Math.floor(Math.random() * 90000) + 10000
  const typeMap: Record<string, string> = {
    'Input': '输入',
    'Output': '输出',
    'Annotations': '备注'
  }
  return `${typeMap[type] || type}参数${randomNum}`
}

// 添加列到右边
const addColumnAfter = (field: TableField) => {
  const newField: TableField = {
    id: `${field.type.toLowerCase()}-${Date.now()}`,
    name: generateRandomParamName(field.type),
    type: field.type,
    width: 200,
    originalName: generateRandomParamName(field.type),
    paramType: 'string',
    showAddRight: false,
    showAddLeft: false
  }

  // 在指定字段后插入新字段
  const fieldIndex = fields.value.findIndex(f => f.id === field.id)
  if (fieldIndex !== -1) {
    fields.value.splice(fieldIndex + 1, 0, newField)

    // 为所有行添加新字段的数据
    tableData.value.forEach(row => {
      if (newField.type === 'Input') {
        row.Input.push({
          paramName: newField.originalName,
          paramValue: '',
          paramType: 'string',
          paramCode: newField.originalName,
          isCustom: 1
        })
      } else if (newField.type === 'Output') {
        row.Output.push({
          paramName: newField.originalName,
          paramValue: '',
          paramType: 'string',
          paramCode: newField.originalName,
          isCustom: 1
        })
      } else if (newField.type === 'Annotations') {
        row.Annotations.push({
          paramName: newField.originalName,
          paramValue: '',
          paramType: 'string',
          paramCode: newField.originalName,
          isCustom: 1
        })
      }
    })
  }
}

// 添加列到左边
const addColumnBefore = (field: TableField) => {
  const newField: TableField = {
    id: `${field.type.toLowerCase()}-${Date.now()}`,
    name: generateRandomParamName(field.type),
    type: field.type,
    width: 200,
    originalName: generateRandomParamName(field.type),
    paramType: 'string',
    showAddRight: false,
    showAddLeft: false
  }

  // 在指定字段前插入新字段
  const fieldIndex = fields.value.findIndex(f => f.id === field.id)
  if (fieldIndex !== -1) {
    fields.value.splice(fieldIndex, 0, newField)

    // 为所有行添加新字段的数据
    tableData.value.forEach(row => {
      if (newField.type === 'Input') {
        row.Input.push({
          paramName: newField.originalName,
          paramValue: '',
          paramType: 'string',
          paramCode: newField.originalName,
          isCustom: 1
        })
      } else if (newField.type === 'Output') {
        row.Output.push({
          paramName: newField.originalName,
          paramValue: '',
          paramType: 'string',
          paramCode: newField.originalName,
          isCustom: 1
        })
      } else if (newField.type === 'Annotations') {
        row.Annotations.push({
          paramName: newField.originalName,
          paramValue: '',
          paramType: 'string',
          paramCode: newField.originalName,
          isCustom: 1
        })
      }
    })
  }
}

// 删除列
const removeColumn = async (field: TableField) => {
  // 检查该列所属类型的数据数组是否只剩一个项
  const fieldsOfSameType = fields.value.filter(f => f.type === field.type)
  if (fieldsOfSameType.length <= 1) {
    // 如果该类型只剩一个字段，不允许删除
    ElMessage.warning(`不能删除 "${field.name}" 列，因为 ${field.type} 类型至少需要保留一个字段`)
    return
  }

  // 临时降低当前界面的z-index，让确认框显示在最上层
  const panel = document.querySelector('.decision-table-edit-panel') as HTMLElement
  const originalZIndex = panel?.style.zIndex
  if (panel) {
    panel.style.zIndex = '9998'
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除列 "${field.name}" 吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        customClass: 'decision-table-confirm-dialog'
      }
    )

    // 从字段列表中移除
    const fieldIndex = fields.value.findIndex(f => f.id === field.id)
    if (fieldIndex !== -1) {
      fields.value.splice(fieldIndex, 1)

      // 从所有行中移除对应数据
      tableData.value.forEach(row => {
        if (field.type === 'Input') {
          const index = row.Input.findIndex(p => p.paramCode === field.originalName)
          if (index !== -1) {
            row.Input.splice(index, 1)
          }
        } else if (field.type === 'Output') {
          const index = row.Output.findIndex(p => p.paramCode === field.originalName)
          if (index !== -1) {
            row.Output.splice(index, 1)
          }
        } else if (field.type === 'Annotations') {
          const index = row.Annotations.findIndex(p => p.paramCode === field.originalName)
          if (index !== -1) {
            row.Annotations.splice(index, 1)
          }
        }
      })
    }
  } catch {
    // 用户取消删除
  } finally {
    // 恢复原始z-index
    if (panel && originalZIndex) {
      panel.style.zIndex = originalZIndex
    }
  }
}

// 添加行到指定行之前
const addRowBefore = (rowIndex: number) => {
  const newRow: TableRow = {
    id: `row-${Date.now()}`,
    index: tableData.value.length + 1,
    Input: [],
    Output: [],
    Annotations: [],
    showAddTop: false,
    showAddBottom: false,
    showCellButton: false
  }

  // 复制字段结构
  fields.value.forEach(field => {
    if (field.type === 'Input') {
      newRow.Input.push({
        paramName: field.originalName,
        paramValue: '',
        paramType: 'string',
        paramCode: field.originalName,
        isCustom: 0
      })
    } else if (field.type === 'Output') {
      newRow.Output.push({
        paramName: field.originalName,
        paramValue: '',
        paramType: 'string',
        paramCode: field.originalName,
        isCustom: 0
      })
    } else if (field.type === 'Annotations') {
      newRow.Annotations.push({
        paramName: field.originalName,
        paramValue: '',
        paramType: 'string',
        paramCode: field.originalName,
        isCustom: 0
      })
    }
  })

  // 插入新行到指定行之前
  tableData.value.splice(rowIndex, 0, newRow)

  // 更新所有行的index
  updateRowIndexes()
}

// 添加行到指定行之后
const addRowAfter = (rowIndex: number) => {
  const newRow: TableRow = {
    id: `row-${Date.now()}`,
    index: tableData.value.length + 1,
    Input: [],
    Output: [],
    Annotations: [],
    showAddTop: false,
    showAddBottom: false,
    showCellButton: false
  }

  // 复制字段结构
  fields.value.forEach(field => {
    if (field.type === 'Input') {
      newRow.Input.push({
        paramName: field.originalName,
        paramValue: '',
        paramType: 'string',
        paramCode: field.originalName,
        isCustom: 0
      })
    } else if (field.type === 'Output') {
      newRow.Output.push({
        paramName: field.originalName,
        paramValue: '',
        paramType: 'string',
        paramCode: field.originalName,
        isCustom: 0
      })
    } else if (field.type === 'Annotations') {
      newRow.Annotations.push({
        paramName: field.originalName,
        paramValue: '',
        paramType: 'string',
        paramCode: field.originalName,
        isCustom: 0
      })
    }
  })

  // 插入新行
  tableData.value.splice(rowIndex + 1, 0, newRow)

  // 更新所有行的index
  updateRowIndexes()
}

// 复制行
const duplicateRow = (rowIndex: number) => {
  const sourceRow = tableData.value[rowIndex]
  if (!sourceRow) return

  // 创建新行，复制所有数据
  const newRow: TableRow = {
    id: `row-${Date.now()}`,
    index: tableData.value.length + 1,
    Input: sourceRow.Input.map(param => ({ ...param })),
    Output: sourceRow.Output.map(param => ({ ...param })),
    Annotations: sourceRow.Annotations.map(param => ({ ...param })),
    showAddTop: false,
    showAddBottom: false,
    showCellButton: false
  }

  // 插入新行到原行下方
  tableData.value.splice(rowIndex + 1, 0, newRow)

  // 更新所有行的index
  updateRowIndexes()

  // 选中新复制的行
  selectedRow.value = rowIndex + 1

  console.log(`复制行 ${rowIndex + 1} 到行 ${rowIndex + 2}`)
}

// 删除行
const removeRow = async (rowIndex: number) => {
  // 临时降低当前界面的z-index，让确认框显示在最上层
  const panel = document.querySelector('.decision-table-edit-panel') as HTMLElement
  const originalZIndex = panel?.style.zIndex
  if (panel) {
    panel.style.zIndex = '9998'
  }

  try {
    await ElMessageBox.confirm(
      '确定要删除这一行吗？',
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        customClass: 'decision-table-confirm-dialog'
      }
    )

    // 删除行
    tableData.value.splice(rowIndex, 1)

    // 更新所有行的index
    updateRowIndexes()

    // 清理选中状态
    if (selectedRow.value === rowIndex) {
      selectedRow.value = null
      console.log('取消行选择（删除行后）')
    }
  } catch {
    // 用户取消删除
  } finally {
    // 恢复原始z-index
    if (panel && originalZIndex) {
      panel.style.zIndex = originalZIndex
    }
  }
}

// 更新行索引
const updateRowIndexes = () => {
  tableData.value.forEach((row, index) => {
    row.index = index + 1
  })
}

// 行拖动相关方法
const handleDragStart = (event: DragEvent, rowIndex: number) => {
  // 如果该行正在编辑，阻止拖拽
  if (isRowEditing(rowIndex)) {
    event.preventDefault()
    return
  }

  dragSourceIndex.value = rowIndex
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
  }
}

const handleDragOver = (event: DragEvent, rowIndex: number) => {
  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
}

const handleDrop = (event: DragEvent, targetRowIndex: number) => {
  event.preventDefault()

  if (dragSourceIndex.value !== null && dragSourceIndex.value !== targetRowIndex) {
    // 移动行
    const sourceRow = tableData.value[dragSourceIndex.value]
    tableData.value.splice(dragSourceIndex.value, 1)
    tableData.value.splice(targetRowIndex, 0, sourceRow)

    // 更新索引
    updateRowIndexes()
  }
}

const handleDragEnd = () => {
  dragSourceIndex.value = null
}

// // 单元格编辑
// const handleCellEdit = (row: TableRow, field: TableField) => {
//   // 双击编辑逻辑待实现
//   console.log('双击单元格:', row, field)
//   console.log('行索引:', row.index, '字段:', field.name, '类型:', field.type)

// }

// 字段头部点击事件
const handleFieldHeaderClick = (field: TableField) => {
  console.log('点击第二行参数单元格:', field.name, '类型:', field.type)
  if (props.disabled) {
    return
  }

  // 如果有行被选中，取消行选择
  if (selectedRow.value !== null) {
    selectedRow.value = null
    console.log('取消行选择（点击字段头部）')
  }

  // 打开参数编辑面板
  openParamEditPanel(field)
}

// 获取参数数据
const getParamData = async () => {
  partList.value = await getPartList()
  paramList.value = await paramStore.getParamList()
  tableList.value = await paramStore.getTableList()
  canvasList.value = await paramStore.getCanvasList(route?.query?.ruleId || 'default')

  treeData.value = [partList.value, paramList.value, tableList.value, canvasList.value]
}

const getPartList = async() => {
  console.log('props.nodeData', props.nodeData?.id)
  const nodeId = props.nodeData?.id
  if (!nodeId) {
    return []
  }
  const { edges, nodeList } = props.workflowData
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

const getTypeList = (str) => {
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

// 打开参数编辑面板
const openParamEditPanel = (field: TableField) => {
  // 记录正在编辑的参数代码
  editingParamCode.value = field.originalName

  // 获取当前字段对应的参数数据
  // 从第一行数据中查找对应参数的类型
  let actualParamType = 'string' // 默认类型
  let actualParamValue = ''
  let actualIsCustom = 1

  if (tableData.value.length > 0) {
    const firstRow = tableData.value[0]
    let param: DecisionTableParamData | undefined

    if (field.type === 'Input') {
      param = firstRow.Input.find(p => p.paramCode === field.originalName)
    } else if (field.type === 'Output') {
      param = firstRow.Output.find(p => p.paramCode === field.originalName)
    } else if (field.type === 'Annotations') {
      param = firstRow.Annotations.find(p => p.paramCode === field.originalName)
    }

    if (param) {
      actualParamType = param.paramType
      actualParamValue = param.paramValue
      actualIsCustom = param.isCustom
    }
  }

  // 创建数据的深拷贝，避免引用问题
  const paramData = {
    paramName: field.name,
    paramType: actualParamType,
    paramCode: field.originalName,
    isCustom: actualIsCustom,
    paramValue: actualParamValue
  }

  console.log('打开参数编辑面板，参数数据:', paramData)
  console.log('记录编辑的参数代码:', editingParamCode.value)

  // 先设置参数数据，再显示面板
  currentParamData.value = { ...paramData }
  currentEditingField.value = field
  showParamEditPanel.value = true

  console.log('设置后的 currentParamData:', currentParamData.value)
}

// 处理参数编辑面板关闭
const handleParamPanelClose = () => {
  showParamEditPanel.value = false
  currentEditingField.value = null
  currentParamData.value = null
}

// 处理表达式编辑面板确认
const handleExpressionPanelConfirm = (newValue: string) => {
  if (!currentExpressionData.value) return

  const { rowIndex, field } = currentExpressionData.value

  // 更新表格数据中的参数值
  const row = tableData.value[rowIndex]
  if (field.type === 'Input') {
    const param = row.Input.find(p => p.paramCode === field.originalName)
    if (param) {
      param.paramValue = newValue
      console.log(`更新第${rowIndex + 1}行Input参数值:`, newValue)
    }
  } else if (field.type === 'Output') {
    const param = row.Output.find(p => p.paramCode === field.originalName)
    if (param) {
      param.paramValue = newValue
      console.log(`更新第${rowIndex + 1}行Output参数值:`, newValue)
    }
  } else if (field.type === 'Annotations') {
    const param = row.Annotations.find(p => p.paramCode === field.originalName)
    if (param) {
      param.paramValue = newValue
      console.log(`更新第${rowIndex + 1}行Annotations参数值:`, newValue)
    }
  }

  // 强制触发 Vue 响应式更新
  tableData.value = [...tableData.value]

  // 关闭表达式编辑面板
  showExpressionPanel.value = false
  currentExpressionData.value = null

  ElMessage.success('表达式更新成功')
}

// 处理表达式编辑面板关闭
const handleExpressionPanelClose = () => {
  showExpressionPanel.value = false
  currentExpressionData.value = null
}

// 重新生成表格数据
const regenerateTableData = (updatedData: any) => {
  console.log('开始重新生成表格数据...')
  console.log('更新前的表格数据示例:', tableData.value[0])

  // 1. 更新 fields 数组中的字段名称和类型
  if (currentEditingField.value) {
    const field = currentEditingField.value
    const fieldIndex = fields.value.findIndex(f => f.id === field.id)
    if (fieldIndex !== -1) {
      fields.value[fieldIndex].name = updatedData.paramName
      fields.value[fieldIndex].originalName = updatedData.paramCode
      fields.value[fieldIndex].paramType = updatedData.paramType
      console.log('已更新 fields 数组中的字段名称和类型:', fields.value[fieldIndex])
    }
  }

  // 2. 更新所有行中对应参数的数据
  tableData.value.forEach((row, rowIndex) => {
    if (currentEditingField.value?.type === 'Input') {
      const param = row.Input.find(p => p.paramCode === editingParamCode.value)
      if (param) {
        console.log(`更新第${rowIndex + 1}行Input参数，更新前paramValue:`, param.paramValue)
        param.paramName = updatedData.paramName
        param.paramType = updatedData.paramType
        param.paramCode = updatedData.paramCode
        param.isCustom = updatedData.isCustom
        // 不更新 paramValue，保持原有的参数值
        console.log(`更新第${rowIndex + 1}行Input参数，更新后paramValue:`, param.paramValue)
      }
    } else if (currentEditingField.value?.type === 'Output') {
      const param = row.Output.find(p => p.paramCode === editingParamCode.value)
      if (param) {
        console.log(`更新第${rowIndex + 1}行Output参数，更新前paramValue:`, param.paramValue)
        param.paramName = updatedData.paramName
        param.paramType = updatedData.paramType
        param.paramCode = updatedData.paramCode
        param.isCustom = updatedData.isCustom
        // 不更新 paramValue，保持原有的参数值
        console.log(`更新第${rowIndex + 1}行Output参数，更新后paramValue:`, param.paramValue)
      }
    } else if (currentEditingField.value?.type === 'Annotations') {
      const param = row.Annotations.find(p => p.paramCode === editingParamCode.value)
      if (param) {
        console.log(`更新第${rowIndex + 1}行Annotations参数，更新前paramValue:`, param.paramValue)
        param.paramName = updatedData.paramName
        param.paramType = updatedData.paramType
        param.paramCode = updatedData.paramCode
        param.isCustom = updatedData.isCustom
        // 不更新 paramValue，保持原有的参数值
        console.log(`更新第${rowIndex + 1}行Annotations参数，更新后paramValue:`, param.paramValue)
      }
    }
  })

  console.log('表格数据已更新，影响行数:', tableData.value.length)
  console.log('更新后的表格数据示例:', tableData.value[0])

  // 3. 强制触发 Vue 响应式更新
  tableData.value = [...tableData.value]
  fields.value = [...fields.value]

  // 4. 强制触发计算属性重新计算
  nextTick(() => {
    console.log('表格数据重新生成完成')
  })
}

// 处理参数编辑确认
const handleParamPanelConfirm = (updatedData: any) => {
  console.log('参数编辑完成，更新后的数据:', updatedData)
  console.log('编辑的参数代码:', editingParamCode.value)

  // 重新生成整个表格数据
  regenerateTableData(updatedData)

  ElMessage.success('参数更新成功')
  handleParamPanelClose()
}



// 行选择事件
const handleRowSelect = (rowIndex: number) => {
  if (selectedRow.value === rowIndex) {
    // 如果点击的是已选中的行，则取消选中
    selectedRow.value = null
    console.log('取消行选择:', rowIndex)
  } else {
    // 选中新行，取消之前选中的行和列
    selectedRow.value = rowIndex
    selectedColumn.value = null
    console.log('选中行:', rowIndex, '数据:', tableData.value[rowIndex])
  }
}

// 判断分组是否被选中（如果该分组下的任何字段被选中）
const isGroupSelected = (groupType: string) => {
  return fields.value.some(field => field.type === groupType && selectedColumn.value === field.id)
}

// 获取选中列的名称
const getSelectedColumnName = () => {
  if (!selectedColumn.value) return ''
  const field = fields.value.find(f => f.id === selectedColumn.value)
  return field ? field.name : ''
}

// 类型行点击事件 - 列选择
const handleGroupHeaderClick = (event: MouseEvent, group: TableGroup) => {
  // 获取点击位置相对于分组标题的偏移量
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  const clickX = event.clientX - rect.left

  // 找到该分组下的所有字段
  const groupFields = fields.value.filter(f => f.type === group.type)

  // 根据点击位置计算应该选中哪一列
  let selectedFieldId: string | null = null
  let currentX = 0

  for (const field of groupFields) {
    const fieldWidth = field.width
    if (clickX >= currentX && clickX < currentX + fieldWidth) {
      selectedFieldId = field.id
      break
    }
    currentX += fieldWidth
  }

  // 如果没有找到对应的字段，选择第一个字段
  if (!selectedFieldId && groupFields.length > 0) {
    selectedFieldId = groupFields[0].id
  }

  if (selectedFieldId) {
    if (selectedColumn.value === selectedFieldId) {
      // 如果点击的是已选中的列，则取消选中
      selectedColumn.value = null
      console.log('取消列选择:', selectedFieldId)
    } else {
      // 选中新列，取消之前选中的行和列
      selectedColumn.value = selectedFieldId
      selectedRow.value = null
      console.log('选中列:', selectedFieldId)
    }
  }
}

// 键盘删除事件
const handleKeyDown = (event: KeyboardEvent) => {
  // 删除选中的列
  if (event.key === 'Delete' && selectedColumn.value) {
    event.preventDefault()
    deleteSelectedColumn()
  }
  // 删除选中的行
  if (event.key === 'Delete' && selectedRow.value !== null) {
    event.preventDefault()
    removeRow(selectedRow.value)
  }
  // 支持行选择的键盘操作
  if (event.key === 'Escape' && selectedRow.value !== null) {
    selectedRow.value = null
    console.log('取消行选择（按ESC键）')
  }
  // 方向键选择行
  if (event.key === 'ArrowUp' && selectedRow.value !== null && selectedRow.value > 0) {
    event.preventDefault()
    selectedRow.value = selectedRow.value - 1
  }
  if (event.key === 'ArrowDown' && selectedRow.value !== null && selectedRow.value < tableData.value.length - 1) {
    event.preventDefault()
    selectedRow.value = selectedRow.value + 1
  }
  // Ctrl+D 复制选中行
  if (event.ctrlKey && event.key === 'd' && selectedRow.value !== null) {
    event.preventDefault()
    duplicateRow(selectedRow.value)
  }
}

// 删除选中列
const deleteSelectedColumn = async () => {
  if (!selectedColumn.value) return

  // 找到选中的字段
  const selectedField = fields.value.find(f => f.id === selectedColumn.value)
  if (!selectedField) return

  // 检查该列所属类型的数据数组是否只剩一个项
  const fieldsOfSameType = fields.value.filter(f => f.type === selectedField.type)
  if (fieldsOfSameType.length <= 1) {
    // 如果该类型只剩一个字段，不允许删除
    ElMessage.warning(`不能删除 "${selectedField.name}" 列，${selectedField.type} 类型至少需要保留一个字段`)
    return
  }

  // 临时降低当前界面的z-index，让确认框显示在最上层
  const panel = document.querySelector('.decision-table-edit-panel') as HTMLElement
  const originalZIndex = panel?.style.zIndex
  if (panel) {
    panel.style.zIndex = '9998'
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 "${selectedField.name}" 列吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        customClass: 'decision-table-confirm-dialog'
      }
    )

    // 删除选中的字段
    const fieldIndex = fields.value.findIndex(f => f.id === selectedColumn.value)
    if (fieldIndex !== -1) {
      fields.value.splice(fieldIndex, 1)

      // 从所有行中移除对应数据
      tableData.value.forEach(row => {
        if (selectedField.type === 'Input') {
          const index = row.Input.findIndex(p => p.paramCode === selectedField.originalName)
          if (index !== -1) {
            row.Input.splice(index, 1)
          }
        } else if (selectedField.type === 'Output') {
          const index = row.Output.findIndex(p => p.paramCode === selectedField.originalName)
          if (index !== -1) {
            row.Output.splice(index, 1)
          }
        } else if (selectedField.type === 'Annotations') {
          const index = row.Annotations.findIndex(p => p.paramCode === selectedField.originalName)
          if (index !== -1) {
            row.Annotations.splice(index, 1)
          }
        }
      })
    }

    // 取消选中状态
    selectedColumn.value = null
    selectedRow.value = null
    console.log('取消列选择（删除列后）')
  } catch {
    // 用户取消删除
  } finally {
    // 恢复原始z-index
    if (panel && originalZIndex) {
      panel.style.zIndex = originalZIndex
    }
  }
}

// 字段头部鼠标移动事件
const handleFieldHeaderMouseMove = (event: MouseEvent, field: TableField) => {
  const rect = (event.target as HTMLElement).getBoundingClientRect()
  const mouseX = event.clientX
  const cellCenterX = rect.left + rect.width / 2

  // 添加缓冲区，避免在按钮区域附近频繁切换
  const bufferZone = 20 // 20px 的缓冲区

  // 根据鼠标位置决定显示哪个新增按钮
  if (mouseX > cellCenterX + bufferZone) {
    // 鼠标在单元格右边缓冲区外，显示右边新增按钮
    field.showAddRight = true
    field.showAddLeft = false
  } else if (mouseX < cellCenterX - bufferZone) {
    // 鼠标在单元格左边缓冲区外，显示左边新增按钮
    field.showAddLeft = true
    field.showAddRight = false
  }
  // 在缓冲区内的鼠标位置不改变按钮状态，保持当前状态
}

// 字段头部鼠标离开事件
const handleFieldHeaderMouseLeave = (field: TableField) => {
  // 隐藏所有新增按钮
  field.showAddRight = false
  field.showAddLeft = false
}

// 行鼠标移动事件 - 根据鼠标位置显示新增按钮
const handleRowMouseMove = (event: MouseEvent, row: TableRow) => {
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  const mouseY = event.clientY
  const cellCenterY = rect.top + rect.height / 2

  // 根据鼠标位置决定显示哪个新增按钮
  if (mouseY < cellCenterY) {
    // 鼠标在单元格上方，显示上方新增按钮
    row.showAddTop = true
    row.showAddBottom = false
  } else {
    // 鼠标在单元格下方，显示下方新增按钮
    row.showAddTop = false
    row.showAddBottom = true
  }
}

// 行鼠标离开事件
const handleRowMouseLeave = (row: TableRow) => {
  // 隐藏所有新增按钮
  row.showAddTop = false
  row.showAddBottom = false
}

// 单元格鼠标进入事件 - 显示右上角按钮
const handleCellMouseEnter = (rowIndex: number, field: TableField) => {
  const row = tableData.value[rowIndex]
  if (row) {
    // 如果是Annotations类型的字段，不显示右上角按钮
    if (field.type === 'Annotations') {
      row.showCellButton = false
      field.showCellButton = false
    } else {
      row.showCellButton = true
      field.showCellButton = true
    }
  }
}

// 单元格鼠标离开事件 - 隐藏右上角按钮
const handleCellMouseLeave = (rowIndex: number, field: TableField) => {
  const row = tableData.value[rowIndex]
  if (row) {
    row.showCellButton = false
    field.showCellButton = false
  }
}

// 单元格按钮点击事件
const handleCellButtonClick = (rowIndex: number, field: TableField) => {
  console.log('单元格按钮被点击:', rowIndex, field.name, field.type)
  if(props.disabled) {
    return
  }
  // 获取当前单元格的参数值
  const currentValue = getCellValue(tableData.value[rowIndex], field)

  // 设置表达式编辑面板的数据
  currentExpressionData.value = {
    rowIndex,
    field,
    value: currentValue
  }

  // 显示表达式编辑面板
  showExpressionPanel.value = true

  console.log('打开表达式编辑面板，参数值:', currentValue)
}

// 单元格单击事件 - 进入编辑状态
const handleCellClick = (rowIndex: number, field: TableField, event: MouseEvent) => {
  if (props.disabled) {
    return
  }
  // 如果有行被选中，取消行选择
  if (selectedRow.value !== null) {
    selectedRow.value = null
    console.log('取消行选择（点击单元格）')
  }

  // 清除之前的定时器
  if (clickTimer.value) {
    clearTimeout(clickTimer.value)
    clickTimer.value = null
    return // 如果之前有定时器，说明这是双击，直接返回
  }

  // 设置延迟，判断是否为单击
  clickTimer.value = setTimeout(() => {
    const row = tableData.value[rowIndex]
    const currentValue = getCellValue(row, field)

    editingCell.value = { rowIndex, fieldId: field.id }
    editingValue.value = currentValue

    // 下一个 tick 后聚焦输入框并设置光标位置
    nextTick(() => {
      const input = document.querySelector('.cell-edit-input') as HTMLInputElement
      if (input) {
        input.focus()

        // 计算光标应该插入的位置
        const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
        const clickX = event.clientX - rect.left
        const textWidth = getTextWidth(currentValue, input.style.font)
        const cursorPosition = calculateCursorPosition(currentValue, textWidth, clickX)

        // 将光标放在计算出的位置
        input.setSelectionRange(cursorPosition, cursorPosition)
      }
    })

    clickTimer.value = null
  }, clickDelay)
}

// 完成编辑
const finishEdit = () => {
  if (!editingCell.value) return

  const { rowIndex, fieldId } = editingCell.value
  const field = fields.value.find(f => f.id === fieldId)
  const row = tableData.value[rowIndex]

  if (field && row) {
    // 更新数据源
    if (field.type === 'Input') {
      const param = row.Input.find(p => p.paramCode === field.originalName)
      if (param) {
        param.paramValue = editingValue.value
      }
    } else if (field.type === 'Output') {
      const param = row.Output.find(p => p.paramCode === field.originalName)
      if (param) {
        param.paramValue = editingValue.value
      }
    } else if (field.type === 'Annotations') {
      const param = row.Annotations.find(p => p.paramCode === field.originalName)
      if (param) {
        param.paramValue = editingValue.value
      }
    }
  }

  // 退出编辑状态
  editingCell.value = null
  editingValue.value = ''
}

// 取消编辑
const cancelEdit = () => {
  editingCell.value = null
  editingValue.value = ''
}

// 判断某一行是否正在编辑
const isRowEditing = (rowIndex: number): boolean => {
  return editingCell.value?.rowIndex === rowIndex
}

// 计算文本宽度
const getTextWidth = (text: string, font: string): number => {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  if (context) {
    context.font = font || '14px Arial'
    return context.measureText(text).width
  }
  return 0
}

// 根据点击位置计算光标位置
const calculateCursorPosition = (text: string, totalWidth: number, clickX: number): number => {
  if (!text || totalWidth === 0) return 0

  // 考虑单元格的padding（左右各8px）
  const adjustedClickX = clickX - 8

  // 如果点击位置在文本开始之前，返回0
  if (adjustedClickX <= 0) return 0

  // 如果点击位置在文本结束之后，返回文本长度
  if (adjustedClickX >= totalWidth) return text.length

  // 计算每个字符的平均宽度
  const avgCharWidth = totalWidth / text.length

  // 根据点击位置计算应该插入光标的位置
  const position = Math.round(adjustedClickX / avgCharWidth)

  // 确保位置在有效范围内
  return Math.max(0, Math.min(position, text.length))
}



// 方法
const closePanel = () => {
  console.log('closePanel 被调用')
  // 发出关闭事件
  emit('close')
  console.log('emit close 事件已发出')
  // 同时调用原有的 onClose 回调（保持向后兼容）
  props.onClose?.()
  console.log('onClose 回调已调用')
}

/**
 * 清除按钮选中状态
 */
const clearButtonState = (buttonName: string) => {
  nextTick(() => {
    // 选择所有匹配的按钮
    const buttons = document.querySelectorAll(buttonName) as NodeListOf<HTMLElement>
    buttons.forEach((button) => {
      if (button) {
        button.blur()
        button.classList.remove('is-active', 'is-focus')
        button.classList.remove('is-focus')
        button.classList.remove('is-active')
      }
    })
  })
}

/**
 * 下载模板按钮点击事件
 */
const downloadTemplate = () => {
  try {
    // 生成固定的模板数据
    const templateData = generateTemplateData()

    // 创建工作簿
    const workbook = XLSX.utils.book_new()

    // 创建工作表
    const worksheet = XLSX.utils.aoa_to_sheet(templateData)

    // 将工作表添加到工作簿
    XLSX.utils.book_append_sheet(workbook, worksheet, '决策表模板')

    // 下载文件
    XLSX.writeFile(workbook, '决策表模板.xlsx')

    ElMessage.success('模板文件下载成功')
  } catch (error) {
    console.error('下载模板失败:', error)
    ElMessage.error('下载模板失败，请重试')
  }

  // 清除按钮选中状态
  clearButtonState('.toolbar-btn')
}

/**
 * 生成模板数据
 */
const generateTemplateData = () => {
  // 直接返回配置文件中的模板数据
  return decisionTableTemplateData;
}

/**
 * 上传Excel按钮点击事件
 */
const uploadExcel = () => {
  // 触发文件选择框
  if (fileInputRef.value) {
    fileInputRef.value.click()
  }

  // 清除按钮选中状态
  clearButtonState('.toolbar-btn')
}

/**
 * 下载决策表按钮点击事件
 */
const downloadDecisionTable = () => {
  // 检查是否有数据可以导出
  if (!tableData.value || tableData.value.length === 0) {
    ElMessage.warning('没有数据可以导出，请先添加一些数据')
    return
  }

  if (!fields.value || fields.value.length === 0) {
    ElMessage.warning('没有字段配置，无法导出')
    return
  }

  try {

    // 生成Excel数据
    const excelData = generateExcelData()

    // 创建工作簿
    const workbook = XLSX.utils.book_new()

    // 创建工作表
    const worksheet = XLSX.utils.aoa_to_sheet(excelData)

    // 将工作表添加到工作簿
    XLSX.utils.book_append_sheet(workbook, worksheet, '决策表')

    // 生成文件名（包含时间戳）
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
    const fileName = `决策表_${timestamp}.xlsx`

    // 下载文件
    XLSX.writeFile(workbook, fileName)

    ElMessage.success('Excel文件下载成功')
  } catch (error) {
    console.error('导出Excel失败:', error)
    ElMessage.error('导出Excel失败，请重试')
  }

  // 清除按钮选中状态
  clearButtonState('.toolbar-btn')
}

/**
 * 处理文件选择变化
 */
const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  try {
    // 读取Excel文件
    const data = await readExcelFile(file)

    // 验证数据格式
    const validationResult = validateExcelData(data)

    if (validationResult.isValid) {
      // 转换数据格式
      const convertedData = convertExcelDataToTableData(data)

      // 更新表格
      generateTableFromData(convertedData)

      ElMessage.success('Excel文件上传成功，表格已更新')
    } else {
      // 显示验证错误
      ElMessageBox.alert(
        `Excel文件格式不正确：<br>${validationResult.errors.join('<br>')}`,
        '数据格式错误',
        {
          confirmButtonText: '确定',
          type: 'error',
          dangerouslyUseHTMLString: true
        }
      )
    }
  } catch (error) {
    console.error('解析Excel文件失败:', error)
    ElMessage.error('解析Excel文件失败，请检查文件格式是否正确')
  } finally {
    // 清空文件输入框，允许重复选择同一文件
    if (target) {
      target.value = ''
    }
  }
}

/**
 * 读取Excel文件
 */
const readExcelFile = (file: File): Promise<any[][]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][]

        resolve(jsonData)
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsArrayBuffer(file)
  })
}

/**
 * 验证Excel数据格式
 */
const validateExcelData = (data: any[][]): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []

  // 检查数据行数
  if (!data || data.length < 5) {
    errors.push('Excel文件至少需要包含5行数据（分组标题、字段名称、参数代码、参数类型、数据行）')
    return { isValid: false, errors }
  }

  // 检查第一行：分组标题
  const groupRow = data[0]
  if (!groupRow || groupRow.length === 0) {
    errors.push('第一行应为分组标题（Input、Output、Annotations）')
    return { isValid: false, errors }
  }

  // 验证分组标题：只能是 Input、Output、Annotations 三种
  const validGroupTypes = ['Input', 'Output', 'Annotations']
  for (let i = 0; i < groupRow.length; i++) {
    const groupType = groupRow[i]
    if (!groupType || typeof groupType !== 'string') {
      errors.push(`第1行第${i + 1}列：分组标题不能为空`)
      return { isValid: false, errors }
    }

    if (!validGroupTypes.includes(groupType)) {
      errors.push(`第1行第${i + 1}列：分组标题"${groupType}"不正确，只能是 Input、Output、Annotations 三种类型之一`)
      return { isValid: false, errors }
    }
  }

  // 检查第二行：字段名称
  const fieldRow = data[1]
  if (!fieldRow || fieldRow.length === 0) {
    errors.push('第二行应为字段名称')
    return { isValid: false, errors }
  }

  // 验证字段名称：不能为空
  for (let i = 0; i < fieldRow.length; i++) {
    const fieldName = fieldRow[i]
    if (!fieldName || typeof fieldName !== 'string' || fieldName.trim() === '') {
      errors.push(`第2行第${i + 1}列：字段名称不能为空`)
      return { isValid: false, errors }
    }
  }


  // 检查第三行：参数代码
  const paramCodeRow = data[2]
  if (!paramCodeRow || paramCodeRow.length === 0) {
    errors.push('第三行应为参数代码')
    return { isValid: false, errors }
  }

  // 验证参数代码格式：只能包含字母、数字和下划线，且必须以字母开头
  const paramCodeRegex = /^[a-zA-Z][a-zA-Z0-9_]*$/
  for (let i = 0; i < paramCodeRow.length; i++) {
    const paramCode = paramCodeRow[i]
    if (!paramCode || typeof paramCode !== 'string') {
      errors.push(`第3行第${i + 1}列：参数代码不能为空`)
      return { isValid: false, errors }
    }

    if (!paramCodeRegex.test(paramCode)) {
      errors.push(`第3行第${i + 1}列：参数代码"${paramCode}"格式不正确，只能包含字母、数字和下划线，且必须以字母开头`)
      return { isValid: false, errors }
    }
  }

  // 检查第四行：参数类型
  const paramTypeRow = data[3]
  if (!paramTypeRow || paramTypeRow.length === 0) {
    errors.push('第四行应为参数类型')
    return { isValid: false, errors }
  }

  // 验证参数类型：只能是 number、boolean、string 三种
  const validParamTypes = ['number', 'boolean', 'string']
  for (let i = 0; i < paramTypeRow.length; i++) {
    const paramType = paramTypeRow[i]
    if (!paramType || typeof paramType !== 'string') {
      errors.push(`第4行第${i + 1}列：参数类型不能为空`)
      return { isValid: false, errors }
    }

    if (!validParamTypes.includes(paramType.toLowerCase())) {
      errors.push(`第4行第${i + 1}列：参数类型"${paramType}"不正确，只能是 number、boolean、string 三种类型之一`)
      return { isValid: false, errors }
    }
  }
  // 检查数据行
  for (let i = 4; i < data.length; i++) {
    const dataRow = data[i]

    // 验证每行数据：Input和Output字段不能为空，Annotations字段可以为空
    for (let j = 0; j < dataRow.length; j++) {
      const cellValue = dataRow[j]
      const groupType = groupRow[j]
      const fieldName = fieldRow[j]

      //检查是否为空, Annotations字段可以为空，不需要检查
      if (groupType === 'Annotations') {
        continue
      }
      if (cellValue === null || cellValue === undefined || cellValue === '' || (typeof cellValue === 'string' && cellValue.trim() === '')) {
        errors.push(`第${i + 1}行第${j + 1}列(${groupType}-${fieldName})：数据不能为空`)
        return { isValid: false, errors }
      }
    }
  }

  return { isValid: true, errors }
}

/**
 * 将Excel数据转换为表格数据格式
 */
const convertExcelDataToTableData = (data: any[][]): TableRow[] => {
  const groupRow = data[0] // 分组标题
  const fieldRow = data[1] // 字段名称
  const paramCodeRow = data[2] // 参数代码
  const paramTypeRow = data[3] // 参数类型
  const dataRows = data.slice(4) // 数据行

  const tableRows: TableRow[] = []

  dataRows.forEach((row, rowIndex) => {
    const tableRow: TableRow = {
      id: `row-${Date.now()}-${rowIndex}`,
      index: rowIndex + 1,
      Input: [],
      Output: [],
      Annotations: [],
      showAddTop: false,
      showAddBottom: false,
      showCellButton: false
    }

    // 遍历每一列，根据分组类型构建数据
    groupRow.forEach((groupType, colIndex) => {
      const fieldName = fieldRow[colIndex]
      const paramCode = paramCodeRow[colIndex]
      const paramType = paramTypeRow[colIndex]
      const paramValue = row[colIndex] !== undefined && row[colIndex] !== null ? row[colIndex] : ''

      const paramData = {
        paramName: fieldName,
        paramValue: paramValue,
        paramType: paramType,
        paramCode: paramCode,
        isCustom: 0
      }

      // 根据分组类型添加到对应的数组
      if (groupType === 'Input') {
        tableRow.Input.push(paramData)
      } else if (groupType === 'Output') {
        tableRow.Output.push(paramData)
      } else if (groupType === 'Annotations') {
        tableRow.Annotations.push(paramData)
      }
    })

    tableRows.push(tableRow)
  })

  return tableRows
}

/**
 * 生成Excel数据
 */
const generateExcelData = () => {
  const excelData: any[][] = []

  // 第一行：分组标题
  const groupRow = []
  fields.value.forEach(field => {
    groupRow.push(field.type)
  })
  excelData.push(groupRow)


  // 第二行：参数代码
  const paramCodeRow = []
  fields.value.forEach(field => {
    paramCodeRow.push(field.originalName)
  })
  excelData.push(paramCodeRow)

  // 第三行：字段名称
  const fieldRow = []
  fields.value.forEach(field => {
    fieldRow.push(field.name)
  })
  excelData.push(fieldRow)

  // 第四行：参数类型
  const paramTypeRow = []
  fields.value.forEach(field => {
    paramTypeRow.push(field.paramType)
  })
  excelData.push(paramTypeRow)

  // 数据行
  tableData.value.forEach(row => {
    const dataRow = []

    fields.value.forEach(field => {
      let cellValue = ''

      if (field.type === 'Input') {
        const param = row.Input.find(p => p.paramCode === field.originalName)
        cellValue = param ? param.paramValue : ''
      } else if (field.type === 'Output') {
        const param = row.Output.find(p => p.paramCode === field.originalName)
        cellValue = param ? param.paramValue : ''
      } else if (field.type === 'Annotations') {
        const param = row.Annotations.find(p => p.paramCode === field.originalName)
        cellValue = param ? param.paramValue : ''
      }

      dataRow.push(cellValue)
    })

    excelData.push(dataRow)
  })

  return excelData
}


// 校验参数值
const validateParamValues = () => {
  const inputMap = new Map()
  const errors: string[] = []

  tableData.value.forEach((row, rowIndex) => {
    const rowInput = row.Input.map(e => e.paramValue).join('|')
    const isDuplicate = inputMap.has(rowInput)
    if (isDuplicate) {
      errors.push(`第${rowIndex + 1}行Input参数值重复`)
    } else {
      inputMap.set(rowInput, true)
    }
    // 校验Input参数
    row.Input.forEach((param, paramIndex) => {
      const cellLocation = `第${rowIndex + 1}行Input(${param.paramName})`

      // 空值校验
      if (param.paramValue === undefined || param.paramValue === null ||
          (typeof param.paramValue === 'string' && param.paramValue.trim() === '') ||
          (typeof param.paramValue === 'string' && param.paramValue === '')) {
        errors.push(`${cellLocation}: 参数值为空`)
        return
      }

      // 类型校验
      // if (param.paramType === 'number') {
      //   if (isNaN(Number(param.paramValue))) {
      //     errors.push(`${cellLocation}: 数字类型输入无效`)
      //   }
      // } else if (param.paramType === 'boolean') {
      //   const lowerValue = param.paramValue.toLowerCase()
      //   if (lowerValue !== 'true' && lowerValue !== 'false') {
      //     errors.push(`${cellLocation}: 布尔值应为true/false`)
      //   }
      // }
      // string类型不需要校验，支持任何输入值
    })

    // 校验Output参数
    row.Output.forEach((param, paramIndex) => {
      const cellLocation = `第${rowIndex + 1}行Output(${param.paramName})`

      // 空值校验
      if (param.paramValue === undefined || param.paramValue === null ||
          (typeof param.paramValue === 'string' && param.paramValue.trim() === '') ||
          (typeof param.paramValue === 'string' && param.paramValue === '')) {
        errors.push(`${cellLocation}: 参数值为空`)
        return
      }

      // 类型校验
      // if (param.paramType === 'number') {
      //   if (isNaN(Number(param.paramValue))) {
      //     errors.push(`${cellLocation}: 数字类型输入无效`)
      //   }
      // } else if (param.paramType === 'boolean') {
      //   const lowerValue = param.paramValue.toLowerCase()
      //   if (lowerValue !== 'true' && lowerValue !== 'false') {
      //     errors.push(`${cellLocation}: 布尔值应为true/false`)
      //   }
      // }
      // string类型不需要校验，支持任何输入值
    })

    // 校验Annotations参数
    // row.Annotations.forEach((param, paramIndex) => {
    //   const cellLocation = `第${rowIndex + 1}行Annotations(${param.paramName})`

    //   // 类型校验（只有当参数值不为空时才进行）
    //   if (param.paramValue && param.paramValue.trim() !== '') {
    //     if (param.paramType === 'number') {
    //       if (isNaN(Number(param.paramValue))) {
    //         errors.push(`${cellLocation}: 数字类型输入无效`)
    //       }
    //     } else if (param.paramType === 'boolean') {
    //       const lowerValue = param.paramValue.toLowerCase()
    //       if (lowerValue !== 'true' && lowerValue !== 'false') {
    //         errors.push(`${cellLocation}: 布尔值应为true/false`)
    //       }
    //     }
    //     // string类型不需要校验，支持任何输入值
    //   }
    // })
  })

  inputMap.clear()
  return errors
}

const onBtnOkClick = async () => {
  // 先进行参数值校验
  const validationErrors = validateParamValues()

  if (validationErrors.length > 0) {
    // 显示校验错误
    const errorMessage = "参数值校验失败：<br>" + validationErrors.join("<br>")

    // 使用 ElMessageBox 显示多行错误信息
    ElMessageBox.alert(errorMessage, '参数值校验失败', {
      confirmButtonText: '确定',
      type: 'error',
      dangerouslyUseHTMLString: true
    })

    console.error('参数值校验失败:', validationErrors)
    return
  }

  // 校验通过，生成当前表格的数据
  let currentData: DecisionTableRowData[] = tableData.value.map(row => ({
    id: row.id,
    index: row.index,
    inputList: row.Input,
    outputList: row.Output,
    annotationList: row.Annotations
  }))

  //把表格的参数值中的字符串当做表达式，批量获取lua表达式，并且赋值给表格的参数值中的luaExpression
  await fillExpressions(currentData);

  // 输出到控制台
  console.log('当前表格数据:', JSON.stringify(currentData))

  // 发出确认事件，传递数据给父组件
  emit('confirm', currentData)
}

const fillExpressions = async (data: DecisionTableRowData[]) => {
  let res = await getLuaExpressions(data);
  let setLuaExpression = (target, param) => {
    target.luaExpression = param?.[0] || "";
    target.luaExpressionResultType = param?.[1] || "string";
  }
  for (let item of data) {
    for (let input of item.inputList) {
      setLuaExpression(input, res[input.paramValue]);
    }
    for (let output of item.outputList) {
      setLuaExpression(output, res[output.paramValue]);
    }
    for (let annotation of item.annotationList) {
      setLuaExpression(annotation, res[annotation.paramValue]);
    }
  }
}


const getLuaExpressions = async (data: DecisionTableRowData[]) => {
  let expressions = [];
  for (let item of data) {
    for (let input of item.inputList) {
      expressions.push(input.paramValue);
    }
    for (let output of item.outputList) {
      expressions.push(output.paramValue);
    }
    // for (let annotation of item.annotationList) {
    //   expressions.push(annotation.paramValue);
    // }
  }



  const res = await batchGetLuaByExpressions(expressions);
  let obj = {};
  let expressionConfig = [];
  if (res?.length) {
    for (let i = 0; i < res.length; i++) {
      let value = res[i];
      let key = value.originalExpression;
      obj[key] = [value.luaCode, value.resultType];
      if (value.variables?.length) {
        expressionConfig = expressionConfig.concat(value.variables);
      }
    }
  }
  // 对expressionConfig进行去重
  expressionConfig = [...new Set(expressionConfig)];
  fillExpressionConfig(expressionConfig);
  return obj;
}

/**
 * 填充表达式配置
 */
const fillExpressionConfig = async (data: any[]) => {
  let children = [];
  for (let item of data) {
    children.push({
      code: item,
      level: 2
    });
  }
  let result: DecisionTableExpressionConfig =
  {
    name: props.nodeData.title,
    code: '',
    id: props.nodeData.id,
    level: 1,
    children: children
  };
  props.nodeData.decisionTableData.expressionConfig = result;
}


const onBtnCancelClick = () => {
  ElMessage.info('已取消更改')
  closePanel()
}

// 根据外部数据生成表格
const generateTableFromData = (externalData: TableRow[]) => {
  if (!externalData || externalData.length === 0) {
    // 如果没有数据，使用默认数据
    console.log('使用默认决策表数据')
    generateTableFromData(defaultMockDecisionTableData)
    return
  }

  // 设置表格数据
  tableData.value = externalData.map(row => ({
    ...row,
    showAddTop: false,
    showAddBottom: false,
    showCellButton: false
  }))

  // 根据数据生成字段配置
  const newFields: TableField[] = []

  // 处理Input字段
  if (externalData[0]?.Input && Array.isArray(externalData[0].Input)) {
    externalData[0].Input.forEach((param, index) => {
      newFields.push({
        id: `input-${param.paramCode}-${index}`,
        name: param.paramName,
        type: 'Input',
        width: 200,
        originalName: param.paramCode,
        paramType: param.paramType || 'string',
        showAddRight: false,
        showAddLeft: false,
        showCellButton: false
      })
    })
  }

  // 处理Output字段
  if (externalData[0]?.Output && Array.isArray(externalData[0].Output)) {
    externalData[0].Output.forEach((param, index) => {
      newFields.push({
        id: `output-${param.paramCode}-${index}`,
        name: param.paramName,
        type: 'Output',
        width: 200,
        originalName: param.paramCode,
        paramType: param.paramType || 'string',
        showAddRight: false,
        showAddLeft: false,
        showCellButton: false
      })
    })
  }

  // 处理Annotations字段
  if (externalData[0]?.Annotations && Array.isArray(externalData[0].Annotations)) {
    externalData[0].Annotations.forEach((param, index) => {
      newFields.push({
        id: `annotations-${param.paramCode}-${index}`,
        name: param.paramName,
        type: 'Annotations',
        width: 200,
        originalName: param.paramCode,
        paramType: param.paramType || 'string',
        showAddRight: false,
        showAddLeft: false,
        showCellButton: false
      })
    })
  }

  fields.value = newFields
}

// 监听外部数据变化
watch(() => props.decisionTableData, (newData) => {
  if (newData && Array.isArray(newData)) {
    generateTableFromData(newData)
  }
}, { immediate: true })

// 生命周期
onMounted(() => {
  console.log('决策表编辑面板已挂载', props.decisionTableData)

  // 获取参数数据
  getParamData()

  // 添加键盘事件监听
  document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  // 清理定时器，避免内存泄漏
  if (clickTimer.value) {
    clearTimeout(clickTimer.value)
    clickTimer.value = null
  }

  // 移除键盘事件监听
  document.removeEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  // 清理定时器，避免内存泄漏
  if (clickTimer.value) {
    clearTimeout(clickTimer.value)
    clickTimer.value = null
  }
})

// 暴露组件方法
defineExpose({
  closePanel,
  downloadTemplate,
  uploadExcel,
  downloadDecisionTable,
  onBtnOkClick,
  onBtnCancelClick,
  duplicateRow,
  handleFileChange,
  readExcelFile,
  validateExcelData,
  convertExcelDataToTableData
})
</script>

<style scoped>
.decision-table-edit-panel {
width: 1200px;
height: 700px;
display: flex;
flex-direction: column;
background: #fff;
border-radius: 8px;
overflow: hidden;
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
position: absolute;
right: 100px;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: #f5f5f5;
  border-bottom: 1px solid #e2e2e2;
  flex-shrink: 0;
}

.header-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.close-btn {
  width: 24px;
  height: 24px;
  padding: 0;
  cursor: pointer;
  color: #666 !important;
  border: 1px solid #d9d9d9 !important;
  background: #f5f5f5 !important;
}

.close-btn:hover {
color: #333 !important;
border-color: #666 !important;
background: #e6e6e6 !important;
--el-button-hover-border-color: #d9d9d9 !important;
}

/* 使用更高优先级的选择器来覆盖全局样式 */
.close-btn:hover {
--el-button-hover-border-color: #d9d9d9 !important;
border-color: #d9d9d9 !important;
}

/* 针对Element Plus按钮的特殊处理 */
:deep(.close-btn:hover) {
--el-button-hover-border-color: #d9d9d9 !important;
border-color: #d9d9d9 !important;
}

/* 使用属性选择器提高优先级 */
.close-btn[class*="close-btn"]:hover {
--el-button-hover-border-color: #d9d9d9 !important;
border-color: #d9d9d9 !important;
}


.button-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: #fafafa;
  flex-shrink: 0;
}

.left-buttons {
  display: flex;
  gap: 8px;
}

.center-status {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
}

.status-text {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.row-info {
  color: #999;
  font-size: 12px;
  margin-left: 8px;
}

.right-buttons {
  display: flex;
  gap: 8px;
}

/* 工具栏按钮样式 - 使用更强的选择器 */
.button-toolbar :deep(.el-button) {
  border: 1px solid #d9d9d9 !important;
  border-radius: 6px !important;
  cursor: pointer !important;
}

.button-toolbar :deep(.el-button:hover) {
  border-color: #40a9ff !important;
  cursor: pointer !important;
}

/* 针对工具栏中的具体按钮 */
.left-buttons :deep(.el-button),
.right-buttons :deep(.el-button) {
  border: 1px solid #d9d9d9 !important;
  border-radius: 6px !important;
  cursor: pointer !important;
}

.left-buttons :deep(.el-button:hover),
.right-buttons :deep(.el-button:hover) {
  border-color: #40a9ff !important;
  cursor: pointer !important;
}

/* 全局按钮样式覆盖 */
:deep(.el-button) {
  border: 1px solid #d9d9d9 !important;
  border-radius: 6px !important;
  cursor: pointer !important;
}

:deep(.el-button:hover) {
  border-color: #40a9ff !important;
  cursor: pointer !important;
}

/* 工具栏按钮专用样式 */
:deep(.toolbar-btn) {
  border: 1px solid #d9d9d9 !important;
  border-radius: 6px !important;
  cursor: pointer !important;
  padding: 8px 16px !important;
}

:deep(.toolbar-btn:hover) {
  border-color: #40a9ff !important;
  cursor: pointer !important;
}

/* 底部按钮样式 */
:deep(.footer-btn) {
  border: 1px solid #d9d9d9 !important;
  border-radius: 6px !important;
  cursor: pointer !important;
  padding: 8px 16px !important;
}

:deep(.footer-btn:hover) {
  border-color: #40a9ff !important;
  cursor: pointer !important;
}

/* 确定按钮特殊样式 */
:deep(.confirm-btn) {
  background: #1890ff !important;
  border-color: #1890ff !important;
  color: #fff !important;
}

:deep(.confirm-btn:hover) {
  background: #40a9ff !important;
  border-color: #40a9ff !important;
  color: #fff !important;
}

.table-container {
  flex: 1;
  overflow: auto;
  background: #fff;
  position: relative;
  padding: 0 20px;
}



.custom-table {
  width: max-content;
  min-width: 100%;
  border: 1px solid #e2e2e2;
}

.table-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: #fff;
}

.header-row {
  display: flex;
  border-bottom: 1px solid #e2e2e2;
  min-width: max-content;
}

.header-row-1 {
  background: #f5f5f5;
}

.header-row-2 {
  background: #f5f5f5;
}

.header-cell {
  border-right: 1px solid #e2e2e2;
  padding: 12px 8px;
  text-align: center;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  flex-shrink: 0;
  cursor: pointer;
}

.index-header {
  border-right: 1px solid #e2e2e2;
  color: #333 !important;
}

/* 第一行第一列的背景色与第一行其他列一致 */
.header-row-1 .index-header {
  background: #f5f5f5;
}

/* 第二行第一列的背景色与第二行其他列一致 */
.header-row-2 .index-header {
  background: #fff;
}

/* 第一行第一列右下角三角形 */
.corner-triangle {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 0;
  height: 0;
  border-left: 18px solid transparent;
  border-bottom: 18px solid #aaaaaa;
}

.group-header {
  background: #f5f5f5;
font-size: 14px;
cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path d="M8 2L2 8h4v6h4V8h4L8 2z" fill="black" transform="rotate(180 8 8)"/></svg>') 8 8, auto;
transition: background-color 0.2s ease;
}

.group-header:hover {
  background: #e0e0e0;
}

.group-header.selected {
  background: #d0d0d0;
}

.field-header {
  background: #fff;
  font-size: 14px;
  font-weight: 600;
  position: relative;
}

.field-header:hover {
  background: #e6f7ff;
}

.field-header.selected {
  background: #d0d0d0;
}



.field-header-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.field-name {
  font-weight: 600;
}

/* 标签容器样式 */
.labels-container {
  position: absolute;
  bottom: 2px;
  right: 2px;
  display: flex;
  gap: 5px;
  align-items: center;
  z-index: 5;
}

/* 参数代码标签样式 */
.param-code-label {
  padding: 2px 4px;
  font-size: 9px;
  font-weight: 500;
  border-radius: 3px;
  color: #fff;
  line-height: 1;
  background-color: #ffeccc; /* 使用不同的背景色以区分 */
  color: #f48924;
}

/* 参数类型标签样式 */
.param-type-label {
  padding: 2px 4px;
  font-size: 9px;
  font-weight: 500;
  border-radius: 3px;
  color: #fff;
  line-height: 1;
}

.param-type-string {
  background-color: #ddffcc;
  color: #47ac14;
}

.param-type-number {
  background-color: #d8edff;
  color: #1d92ff;
}

.param-type-boolean {
  background-color: #e6d5ff;
  color: #8833ff;
}

.field-actions {
  display: flex;
  gap: 2px;
  opacity: 0;
  transition: opacity 0.2s ease;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.field-header:hover .field-actions {
  opacity: 1;
}

.add-col-btn {
  position: absolute;
  top: -7px; /* 显示在单元格内部 */
  padding: 2px;
  min-height: auto;
  height: 15px;
  width: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 12px;
  color: #fff;
  pointer-events: auto;
  background: #1890ff;
  border: none;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  opacity: 0;
  transition: all 0.2s ease;
  cursor: pointer;
}

.add-col-btn:hover {
  background: #4ba8ff !important;
  color: #fff !important;
}

.add-col-btn-right {
  right: 0px;
}

.add-col-btn-left {
  left: -12px;
}

.add-col-btn.show {
  opacity: 1;
}



.table-body {
  background: #fff;
}

.table-row {
  display: flex;
  border-bottom: 1px solid #e2e2e2;
  position: relative;
  cursor: pointer;
  min-width: max-content;
  transition: all 0.2s ease;
}

.table-row:hover {
  background: #f5f5f5;
}

/* 行选中状态下的行悬停效果 */
.table-row:has(.row-selected):hover {
  background: #f0f0f0;
}

/* 行选中状态的边框高亮 */
.table-row:has(.row-selected) {
  /* 移除蓝色边框 */
}



.table-cell {
  border-right: 1px solid #e2e2e2;
  padding: 12px 8px;
  text-align: center;
  font-weight: normal;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  flex-shrink: 0;
}

.index-cell {
  background: #fff;
  border-right: 1px solid #e2e2e2;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.index-cell:hover {
  background: #f5f5f5;
  cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path d="M8 2L2 8h4v6h4V8h4L8 2z" fill="black" transform="rotate(90 8 8)"/></svg>') 8 8, auto;
}

.index-cell.row-selected {
  background: #d3d3d3 !important;
}

/* 行选中状态的悬停效果 */
.index-cell.row-selected:hover {
  background: #c0c0c0 !important;
}

/* 表头行的序号列不可点击（第一行和第二行） */
.table-header .index-cell {
  cursor: default;
}

.table-header .index-cell:hover {
  background: #e6f7ff;
  cursor: default;
}

.data-cell {
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.data-cell.selected {
  background: #d0d0d0;
}

.data-cell.row-selected {
  background: #d3d3d3 !important;
}

.data-cell:hover {
  background: #f0f8ff;
  box-shadow: inset 0 0 0 1px #1890ff;
}

/* 行选中状态的悬停效果 */
.data-cell.row-selected:hover {
  background: #c0c0c0 !important;
}

/* 单元格右上角按钮样式 */
.cell-action-btn {
  position: absolute;
  top: 1px;
  right: 1px;
  z-index: 10;
  opacity: 0;
  transition: opacity 0.2s ease;
  background: #1890ff;
  border: none;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  height: 16px;
  width: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.cell-action-btn:hover {
  background: #40a9ff;
  transform: scale(1.1);
}

/* 按钮内数字样式 */
.btn-numbers {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.number-row {
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.number {
  color: #fff;
  font-size: 6px;
  font-weight: bold;
  margin: 0 1px;
}

/* 当行和字段都显示按钮时，显示按钮 */
.data-cell:has(.cell-action-btn) .cell-action-btn {
  opacity: 1;
}

/* 单元格编辑输入框样式 */
.cell-edit-input {
  width: 100%;
  height: 100%;
  border: none;
  outline: none;
  background: transparent;
  text-align: center;
  font-size: inherit;
  font-family: inherit;
  padding: 0;
  margin: 0;
  box-sizing: border-box;
}

.cell-edit-input:focus {
  background: #fff;
  /* 移除蓝色方框，只保留白色背景 */
}





.row-actions {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  pointer-events: none;
  z-index: 5;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.table-row:hover .row-actions {
  opacity: 1;
}



.add-row-btn {
  position: absolute;
  pointer-events: auto;
  background: #1890ff;
  border: none;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 2px;
  min-height: auto;
  height: 15px;
  width: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
  color: #fff;
  opacity: 0;
  transition: all 0.2s ease;
  cursor: pointer;
}

.add-row-btn:hover {
  background: #48a7ff !important;
  color: #fff !important;
}

.add-row-btn-top {
  left: -7px;
  top: 0px;
}

.add-row-btn-bottom {
  left: -19px;
  bottom: 0px;
}

.add-row-btn.show {
  opacity: 1;
}

.panel-footer {
  display: flex;
  justify-content: center;
  gap: 16px;
  padding: 16px 20px;
  border-top: 1px solid #e2e2e2;
  background: #fafafa;
  flex-shrink: 0;
}

/* 滚动条样式 */
.table-container::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.table-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.table-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.table-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 确保确认框显示在最上层 */
:deep(.decision-table-confirm-dialog) {
  z-index: 10000 !important;
}

:deep(.decision-table-confirm-dialog .el-message-box) {
  z-index: 10000 !important;
}

/* 样式覆盖 */
.el-message-box__wrapper {
  z-index: 10000 !important;
}

.el-overlay {
  z-index: 9999 !important;
}

/* 表达式编辑器测试面板样式 */
.expression-test-panel {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 1px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 10001;
  display: flex;
  flex-direction: column;
  height: 1;
}

.expression-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e2e2e2;
  background: #f5f5f5;
  border-radius: 8px 8px 0 0;
  flex-shrink: 0;
}

.expression-panel-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.expression-panel-content {
  padding: 20px;
  flex: 1;
  overflow-y: auto;
  min-height: 300px;
  height: auto;
}

   .expression-panel-actions {
   display: flex;
   justify-content: flex-end;
   gap: 12px;
   padding: 16px 20px;
   border-top: 1px solid #e2e2e2;
   background: #fafafa;
   border-radius: 0 0 8px 8px;
   flex-shrink: 0;
 }

 /* 文件输入框样式 */
 .file-input {
   display: none;
 }

</style>

