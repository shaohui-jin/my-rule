<template>
  <div class="decision-table-edit-panel">
    <!-- 头部 -->
    <div class="panel-header">
      <div class="header-left">
        <el-button size="small" @click="downloadTemplate">下载模版</el-button>
        <el-button size="small" @click="uploadExcel">上传 Excel</el-button>
      </div>
      <div class="header-title">决策表</div>
      <div class="header-right">
        <el-button size="small" @click="downloadDecisionTable">下载决策表</el-button>
        <el-button 
          class="close-btn" 
          size="small" 
          @click="closePanel"
          :icon="Close"
          circle
        />
      </div>
    </div>

    <!-- 表格区域 -->
    <div class="table-container">
      <!-- 使用 PureAdmin Table -->
      <PureTable
        :data="tableData"
        :columns="columns"
        :pagination="pagination"
        :loading="loading"
        :row-key="rowKey"
        :border="true"
        :stripe="true"
        :size="'default'"
        :align="'center'"
        :header-align="'center'"
        :show-overflow-tooltip="true"
        :highlight-current-row="true"
        @selection-change="handleSelectionChange"
        @row-click="handleRowClick"
        @cell-dblclick="handleCellDblClick"
      >
        <!-- 序号列 -->
        <template #serial="{ $index }">
          <span>{{ $index + 1 }}</span>
        </template>

        <!-- 操作列 -->
        <template #operation="{ row, $index }">
          <el-button 
            size="small" 
            type="primary" 
            circle 
            :icon="Plus"
            @click="addRow($index)"
            class="add-row-btn"
          />
        </template>
      </PureTable>
    </div>

    <!-- 底部按钮 -->
    <div class="panel-footer">
      <el-button type="primary" @click="confirmChanges">确定</el-button>
      <el-button @click="cancelChanges">取消</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { Close, Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { PureTable } from '@pureadmin/table'

// 定义表格数据结构
interface TableRow {
  id: string
  cxhd: string
  name: string
  code: string
  size: number
  description: string
  [key: string]: any
}

// Props
interface Props {
  nodeData?: any
  onClose?: () => void
}

const props = withDefaults(defineProps<Props>(), {
  nodeData: () => ({}),
  onClose: () => {}
})

// 响应式数据
const loading = ref(false)
const selectedRows = ref<TableRow[]>([])
const currentRow = ref<TableRow | null>(null)

// 分页配置
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
  background: true,
  layout: 'total, sizes, prev, pager, next, jumper'
})

// 表格数据
const tableData = ref<TableRow[]>([
  {
    id: '1',
    cxhd: 'CXHD=11',
    name: '国产三节GC3',
    code: 'GC3',
    size: 8,
    description: ''
  },
  {
    id: '2',
    cxhd: 'CXHD=12',
    name: '国产三节GC3',
    code: 'GC3',
    size: 10,
    description: ''
  },
  {
    id: '3',
    cxhd: 'CXHD=13',
    name: '国产三节GC3',
    code: 'GC3',
    size: 12,
    description: ''
  },
  {
    id: '4',
    cxhd: 'CXHD=14',
    name: '国产三节GC3',
    code: 'GC3',
    size: 14,
    description: ''
  }
])

// 表格列定义
const columns = reactive([
  {
    label: '序号',
    prop: 'serial',
    width: 60,
    fixed: 'left',
    slot: 'serial'
  },
  {
    label: 'CXHD func',
    prop: 'cxhd',
    width: 150,
    minWidth: 150,
    sortable: true,
    editable: true
  },
  {
    label: 'name string',
    prop: 'name',
    width: 200,
    minWidth: 200,
    editable: true
  },
  {
    label: 'Code string',
    prop: 'code',
    width: 120,
    minWidth: 120,
    editable: true
  },
  {
    label: 'Size number',
    prop: 'size',
    width: 120,
    minWidth: 120,
    sortable: true,
    editable: true
  },
  {
    label: '描述备注',
    prop: 'description',
    width: 200,
    minWidth: 200,
    editable: true
  },
  {
    label: '操作',
    prop: 'operation',
    width: 80,
    fixed: 'right',
    slot: 'operation'
  }
])

// 行键
const rowKey = (row: TableRow) => row.id

// 方法
const closePanel = () => {
  props.onClose?.()
}

const downloadTemplate = () => {
  ElMessage.success('下载模版功能待实现')
}

const uploadExcel = () => {
  ElMessage.success('上传Excel功能待实现')
}

const downloadDecisionTable = () => {
  ElMessage.success('下载决策表功能待实现')
}

const confirmChanges = () => {
  ElMessage.success('决策表保存成功')
  closePanel()
}

const cancelChanges = () => {
  ElMessage.info('已取消更改')
  closePanel()
}

// 表格事件处理
const handleSelectionChange = (selection: TableRow[]) => {
  selectedRows.value = selection
}

const handleRowClick = (row: TableRow) => {
  currentRow.value = row
}

const handleCellDblClick = (row: TableRow, column: any, cell: any, event: Event) => {
  // 双击编辑单元格
  if (column.editable) {
    // 这里可以实现单元格编辑功能
    console.log('双击编辑:', row, column)
  }
}

// 添加行
const addRow = (index: number) => {
  const newRow: TableRow = {
    id: Date.now().toString(),
    cxhd: '',
    name: '',
    code: '',
    size: 0,
    description: ''
  }
  
  // 在指定行后面插入新行
  tableData.value.splice(index + 1, 0, newRow)
  
  // 更新分页总数
  pagination.total = tableData.value.length
  
  ElMessage.success('新行添加成功')
}

// 生命周期
onMounted(() => {
  console.log('决策表编辑面板已挂载', props.nodeData)
  
  // 设置分页总数
  pagination.total = tableData.value.length
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
  position: relative;
  z-index: 9999;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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

.header-left {
  display: flex;
  gap: 8px;
}

.header-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.close-btn {
  width: 24px;
  height: 24px;
  padding: 0;
}

.table-container {
  flex: 1;
  padding: 20px;
  overflow: auto;
  background: #fff;
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

.add-row-btn {
  width: 24px;
  height: 24px;
  padding: 0;
}

/* PureAdmin Table 样式覆盖 */
:deep(.pure-table) {
  border: 1px solid #e2e2e2;
}

:deep(.pure-table th) {
  background: #fafafa;
  font-weight: 600;
  color: #333;
}

:deep(.pure-table td) {
  border: 1px solid #e2e2e2;
}

:deep(.pure-table .el-table__row:hover) {
  background: #f5f5f5;
}

:deep(.pure-table .current-row) {
  background: #e6f7ff !important;
}

:deep(.pure-table .current-row td) {
  border-color: #1890ff !important;
}
</style> 