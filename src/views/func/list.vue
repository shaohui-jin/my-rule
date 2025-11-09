<template>
  <div class="page">
    <el-tabs v-model="activeTab" @tab-click="handleTabClick">
      <el-tab-pane label="所有函数" name="all" />
      <el-tab-pane label="我创建的" name="my" />
    </el-tabs>
    <BaseSearch
      :params="searchParams"
      :param-options="dictData"
      v-model="search"
      @search="getList"
      @reset="getList"
    />

    <BaseTable
      rowKey="id"
      :loading="loadingList"
      emptyText="未搜索到符合条件的数据"
      :actions="actionList"
      :table-data="tableData"
      :table-column="tableColumn"
      v-model:current-page="pageNo"
      v-model:page-size="pageSize"
      :total="total"
      @get-list="getList"
    />

    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="50%"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :append-to-body="true"
      :destroy-on-close="true"
      @close="closeDialog"
    >
      <detail
        v-loading="loadingDetail"
        ref="refDetail"
        :detail="detail"
        :operation-mode="operationMode"
        :functionCateData="dictData.funcClassifyKeyword"
      />
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" v-if="operationMode == 'ADD'" @click="add">确定</el-button>
          <el-button v-else type="primary" @click="update">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 规则调用列表对话框 -->
    <el-dialog
      v-model="ruleUsageVisible"
      width="85%"
      :close-on-click-modal="false"
      append-to-body
      :destroy-on-close="true"
      class="rule-usage-dialog"
    >
      <template #header>
        <div class="dialog-header">
          <div class="header-content">
            <div class="header-title">
              <el-icon class="title-icon"><Document /></el-icon>
              <span>规则调用列表</span>
            </div>
            <div class="header-subtitle" v-if="currentFunction">
              函数：{{ currentFunction.funcName }} ({{ currentFunction.funcCode }})
            </div>
          </div>
        </div>
      </template>

      <div class="rule-usage-content" v-loading="ruleUsageLoading">
        <!-- 统计信息 -->
        <div class="usage-stats" v-if="ruleUsageTotal > 0">
          <el-card shadow="never" class="stats-card">
            <div class="stats-content">
              <div class="stat-item">
                <span class="stat-label">调用规则总数：</span>
                <span class="stat-value">{{ ruleUsageTotal }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">当前页：</span>
                <span class="stat-value">
                  {{ ruleUsagePageNo }} / {{ Math.ceil(ruleUsageTotal / ruleUsagePageSize) }}
                </span>
              </div>
            </div>
          </el-card>
        </div>

        <!-- 表格区域 -->
        <div class="table-container">
          <el-table
            :data="ruleUsageData"
            style="width: 100%"
            :header-cell-style="{
              'background-color': '#fafafa',
              color: '#606266',
              'font-weight': '500'
            }"
            :row-class-name="getRowClassName"
            v-loading="ruleUsageLoading"
            element-loading-text="加载中..."
            element-loading-spinner="el-icon-loading"
          >
            <el-table-column prop="id" label="规则ID" align="center" width="100">
              <template #default="{ row }">
                <el-tag size="small" type="info">{{ row.id }}</el-tag>
              </template>
            </el-table-column>

            <el-table-column prop="ruleCode" label="规则编码" align="center" width="150">
              <template #default="{ row }">
                <span class="rule-code">{{ row.ruleCode }}</span>
              </template>
            </el-table-column>

            <el-table-column prop="ruleName" label="规则名称" align="left" min-width="200">
              <template #default="{ row }">
                <span class="rule-name">{{ row.ruleName }}</span>
              </template>
            </el-table-column>

            <el-table-column
              prop="ruleDesc"
              label="规则描述"
              align="left"
              min-width="300"
              show-overflow-tooltip
            >
              <template #default="{ row }">
                <div class="rule-desc">
                  <span v-if="row.ruleDesc">{{ row.ruleDesc }}</span>
                  <span v-else class="no-desc">暂无描述</span>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="操作" align="center" width="120" fixed="right">
              <template #default="{ row }">
                <el-button
                  type="primary"
                  size="small"
                  @click="showRuleHistory(row)"
                  class="view-btn"
                >
                  <el-icon><View /></el-icon>
                  查看
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 空状态 -->
          <div v-if="!ruleUsageLoading && ruleUsageData.length === 0" class="empty-state">
            <el-empty description="暂无调用该函数的规则" :image-size="120">
              <el-button type="primary" @click="ruleUsageVisible = false">关闭</el-button>
            </el-empty>
          </div>
        </div>

        <!-- 分页 -->
        <div class="pagination-container" v-if="ruleUsageTotal > 0">
          <el-pagination
            :current-page="ruleUsagePageNo"
            @update:current-page="onRuleUsagePageChange"
            :page-size="ruleUsagePageSize"
            @update:page-size="onRuleUsagePageSizeChange"
            :page-sizes="[10, 20, 30, 40, 50]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="ruleUsageTotal"
            background
            class="usage-pagination"
          />
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="ruleUsageVisible = false" size="large">
            <el-icon><Close /></el-icon>
            关闭
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="tsx">
import { ref, onMounted, reactive, computed, nextTick } from 'vue'
import { http } from '@/axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Document,
  View,
  Close
} from '@element-plus/icons-vue'
import Detail from './detail.vue'
import { useRouter } from 'vue-router'
import { useFunctionStore, useRuleStore } from '@/store/modules/ruleCache'
import BaseSearch from '@/components/BaseTable/BaseSearch.vue'
import BaseTable from '@/components/BaseTable/BaseTable.vue'

import { useDialogDrag } from '@/hooks/useDialogDrag'
import { getFunctionList } from '@/api/workflow/WorkFlowApi'

const { initDialog } = useDialogDrag()

defineOptions({
  name: 'function'
})

const dialogVisible = ref(false)
const dialogTitle = ref('')
const pageNo = ref(1)
const pageSize = ref(10)
const total = ref<number>(0)
const rows = ref<any[]>([])
const detail = ref<any>({})
const operationMode = ref('Edit')

const loadingDetail = ref(false)
const loadingList = ref(false)

const search = ref<any>({})
const searchParams = [
  {
    key: 'keyword',
    label: '函数名称/描述/编码/ID',
    fixed: true,
    placeholder: '按编码/名称/描述/ID搜索',
    keydownSearch: true,
    labelWidth: '150px'
  },
  {
    key: 'functionType',
    label: '函数类型',
    type: 'select',
    options: [],
    fixed: true,
    clearable: true,
    placeholder: '请选择函数类型'
  },
  {
    key: 'functionStatus',
    label: '状态',
    type: 'select',
    clearable: false,
    options: [
      { name: '全部', value: '' },
      { name: '启用', value: 'ENABLED' },
      { name: '禁用', value: 'DISABLED' }
    ],
    fixed: true,
    placeholder: '请选择'
  },
  {
    key: 'funcClassifyKeyword',
    label: '函数分类',
    type: 'tree-select',
    options: [],
    fixed: true,
    placeholder: '请选择',
    props: { label: 'name', value: 'id' }
  },
  // {
  //   key: 'ruleStatus',
  //   label: '发布状态',
  //   type: 'select',
  //   clearable: false,
  //   options: [
  // { name: '全部', value: '' },
  // { name: '待测试', value: '0' },
  // { name: '已测试', value: '1' },
  // { name: '待打包', value: '2' },
  // { name: '已打包', value: '3' },
  // { name: '已发布', value: '4' }
  //   ],
  //   placeholder: '请选择'
  // },
  // { key: 'publisher', label: '版本号', placeholder: '请输入版本号' },
  { key: 'creatorName', label: '创建人', placeholder: '请输入创建人' },
  {
    key: 'createTime',
    label: '创建时间',
    type: 'daterange',
    startPlaceholder: '开始日期',
    endPlaceholder: '结束日期',
    valueFormat: 'YYYY-MM-DD HH:mm:ss',
    placeholder: '请选择'
  },
  { key: 'modifierName', label: '修改人', placeholder: '请输入' },
  {
    key: 'modifyTime',
    label: '修改时间',
    type: 'daterange',
    startPlaceholder: '开始日期',
    endPlaceholder: '结束日期',
    valueFormat: 'YYYY-MM-DD HH:mm:ss',
    placeholder: '请选择'
  }
]
const dictData = ref({
  functionType: [],
  funcClassifyKeyword: []
})

const tableData = ref()
const actionList = ref([
  { type: 'primaryButton', label: '新增函数', onClick: addFunction },
  { type: 'primaryButton', label: '刷新函数缓存', onClick: refreshFunctionCache }
])
const tableColumn = [
  { type: 'index', key: 'index' },
  { key: 'id', label: '函数id', width: '120' },
  { key: 'funcCode', label: '函数编码', width: '140' },
  { key: 'funcName', label: '函数名称', width: '160' },
  {
    key: 'funcCategory',
    label: '函数类型',
    width: '88',
    formatter: row => getFunctionTypeLabel(row.funcCategory)
  },
  {
    key: 'funcDesc',
    label: '函数描述',
    width: '120',
    prependEditButton: true,
    editButtonClick: row => editFunction(row)
  },
  {
    key: 'ruleUsage',
    label: '规则调用列表',
    width: '108',
    click: row => showRuleUsage(row),
    formatter: row => '查看',
    align: 'center'
  },
  {
    key: 'usageCount',
    label: '当前应用次数',
    width: '108',
    formatter: row => row.usageCount || 0,
    align: 'center'
  },
  {
    key: 'functionStatus',
    label: '状态',
    width: '140',
    type: 'status-tag',
    isSuccess: row => row.functionStatus === 'ENABLED',
    successText: '启用(画布可显)',
    failText: '下架(画布不显示)',
    click: row => toggleFunctionStatus(row)
  },
  {
    key: 'enableTime',
    label: '启用时间',
    width: '160',
    formatter: row => formatTime(row.enableTime)
  },
  // { key: 'publishstatus', label: '发布状态', width: '160'},
  // { key: 'version', label: '版本号', width: '160'},
  { key: 'creatorName', label: '创建人', width: '100', formatter: row => row.creatorName },
  {
    key: 'createTime',
    label: '创建时间',
    width: '160',
    formatter: row => formatTime(row.createTime)
  },
  { key: 'modifierName', label: '修改人', width: '100', formatter: row => row.modifierName },
  {
    key: 'modifyTime',
    label: '修改时间',
    width: '160',
    formatter: row => formatTime(row.modifyTime)
  },
  {
    key: 'action',
    type: 'action',
    label: '操作',
    fixed: 'right',
    width: '100',
    formatter: row => {
      return (
        <>
          <el-button link type='primary' style='padding: 0' onclick={() => handleEdit(row)}>
            编辑
          </el-button>
          <el-button link type='danger' style='padding: 0' onclick={() => remove(row)}>
            删除
          </el-button>
        </>
      )
    }
  }
]

async function getList() {
  loadingList.value = true
  const params = {
    ...search.value,
    pageNo: pageNo.value,
    pageSize: pageSize.value,
    isMyFunction: activeTab.value === 'my'
  }
  if (search.value.createTime) {
    params.createTimeStart = search.value.createTime?.[0] || undefined
    params.createTimeEnd = search.value.createTime?.[1] || undefined
  }
  if (search.value.modifyTime) {
    params.modifyTimeStart = search.value.modifyTime?.[0] || undefined
    params.modifyTimeEnd = search.value.modifyTime?.[1] || undefined
  }
  if (search.value.funcClassifyKeyword) {
    params.funcClassifyKeyword = dictData.value.funcClassifyKeyword.find(
      e => e.id === search.value.funcClassifyKeyword
    ).name
  }
  const data = await http.post({
    url: 'rule-config/func/page',
    data: params
  })
  tableData.value = Array.isArray(data.data?.rows) ? data.data.rows : []
  total.value = typeof data.data?.total === 'number' ? data.data.total : 0
  loadingList.value = false
}

const activeTab = ref('all')

const router = useRouter()
const functionStore = useFunctionStore()
const ruleStore = useRuleStore()

// 规则调用列表相关
const ruleUsageVisible = ref(false)
const ruleUsageLoading = ref(false)
const ruleUsageData = ref<any[]>([])
const ruleUsagePageNo = ref(1)
const ruleUsagePageSize = ref(10)
const ruleUsageTotal = ref(0)
const currentFunction = ref<any>(null)

onMounted(() => {
  getList()
  fetchDict()
})

// 处理标签页切换
const handleTabClick = (tab: any) => {
  pageNo.value = 1
  if (tab.props.name === 'my') {
    activeTab.value = 'my'
  } else {
    activeTab.value = 'all'
  }
  getList()
}

const refDetail = ref()
function closeDialog(): void {
  refDetail.value.resetForm()
  detail.value = {}
}

function addFunction() {
  operationMode.value = 'ADD'
  dialogTitle.value = '新增函数'
  dialogVisible.value = true
  detail.value = {
    funcCode: '',
    funcName: '',
    funcCategory: '',
    funcDesc: '',
    functionStatus: 'ENABLED',
    isGeometry: 0
  }
  nextTick(() => {
    initDialog()
  })
}

async function editFunction(row: any) {
  operationMode.value = 'EDIT'
  dialogTitle.value = '编辑函数'
  loadingDetail.value = true
  dialogVisible.value = true
  const { data } = await http.post({
    url: '/rule-config/func/detail',
    data: { id: row.id }
  })
  detail.value = data
  if (detail.value.isGeometry === undefined) detail.value.isGeometry = 0
  detail.value.categoryId = detail.value.categoryId + ''
  loadingDetail.value = false
  nextTick(() => {
    initDialog()
  })
}

async function remove(row: any) {
  ElMessageBox.confirm('确定要删除该函数吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      await http
        .post({
          url: '/rule-config/func/delete',
          data: { id: row.id }
        })
        .then(res => {
          if (res.data === true) {
            ElMessage.success({
              message: '删除成功'
            })
            getList()
          }
        })
    })
    .catch(() => {})
}

function add() {
  refDetail.value.validate(async (isvalid: boolean) => {
    if (!isvalid) {
      return
    }
    await http
      .post({
        url: '/rule-config/func/add',
        data: {
          funcCode: detail.value.funcCode,
          funcName: detail.value.funcName,
          funcCategory: detail.value.funcCategory,
          funcDesc: detail.value.funcDesc,
          functionStatus: detail.value.functionStatus,
          isGeometry: detail.value.isGeometry,
          categoryId: detail.value.categoryId
        }
      })
      .then(res => {
        if (res.data === true) {
          ElMessage.success({
            message: '保存成功'
          })
          dialogVisible.value = false
          pageNo.value = 1
          getList()
        } else {
          ElMessage.error({
            message: '保存失败'
          })
        }
      })
    // .catch(error => {
    //   ElMessage.error({
    //     message: error.message || '保存失败'
    //   })
    // })
  })
}

function update() {
  refDetail.value.validate(async (isvalid: boolean) => {
    if (!isvalid) {
      return
    }
    await http
      .post({
        url: '/rule-config/func/update',
        data: {
          id: detail.value.id,
          funcCode: detail.value.funcCode,
          funcName: detail.value.funcName,
          funcCategory: detail.value.funcCategory,
          funcDesc: detail.value.funcDesc,
          functionStatus: detail.value.functionStatus,
          isGeometry: detail.value.isGeometry,
          categoryId: detail.value.categoryId
        }
      })
      .then(res => {
        if (res.data === true) {
          ElMessage.success({
            message: '保存成功'
          })
          dialogVisible.value = false
          pageNo.value = 1
          getList()
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
  })
}

async function fetchDict(): Promise<void> {
  const { data } = await http.post({
    url: '/umas/common/dict/get',
    data: {
      codes: ['FUNCTION_TYPE']
    }
  })
  if (data.length > 0) {
    dictData.value.functionType = [{ value: '', name: '全部' }, ...data[0]]
  }
}

function getFunctionTypeLabel(value: string): string {
  const option = dictData.value.functionType.find(item => item.value === value)
  return option ? option.name : value
}

// 切换函数状态
const toggleFunctionStatus = (row: any) => {
  const newStatus = row.functionStatus === 'ENABLED' ? 'OFF_SHELVES' : 'ENABLED'
  const actionText = newStatus === 'ENABLED' ? '启用（画布可显）' : '下架（画布不可显）'

  ElMessageBox.confirm(`确定要${actionText}该函数吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      const params = {
        data: {
          id: row.id,
          functionStatus: newStatus
        }
      }
      http.post({ url: '/rule-config/func/update/enable', data: params }).then(res => {
        if (res.data === true) {
          ElMessage.success(`${actionText}成功`)
          getList()
        }
      })
    })
    .catch(() => {})
}

// 添加时间格式化函数
function formatTime(timestamp: number): string {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  const seconds = date.getSeconds().toString().padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

function handleEdit(row: any) {
  // 将当前函数数据存储到 store 中
  functionStore.setCurrentFunction(row)
  router.push({
    name: 'functionEdit'
  })
}

function refreshFunctionCache() {
  ElMessageBox.confirm('确定要刷新函数缓存吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      http
        .post({ url: '/rule-config/rule/cache/refreshFunctions' })
        .then((res: any) => {
          if (res.data === true) {
            ElMessage.success('函数缓存刷新成功')
          } else {
            ElMessage.error('函数缓存刷新失败')
          }
        })
        .catch(() => {
          ElMessage.error('函数缓存刷新失败')
        })
    })
    .catch(() => {})
}

// 显示规则调用列表
async function showRuleUsage(row: any) {
  currentFunction.value = row
  ruleUsageVisible.value = true
  ruleUsagePageNo.value = 1
  await fetchRuleUsage()
  nextTick(() => {
    initDialog()
  })
}

// 获取规则调用列表数据
async function fetchRuleUsage() {
  ruleUsageLoading.value = true
  try {
    const data = await http.post({
      url: 'rule-config/func/useBy/rule',
      data: {
        funcId: currentFunction.value.id,
        pageNo: ruleUsagePageNo.value,
        pageSize: ruleUsagePageSize.value
      }
    })
    ruleUsageData.value = Array.isArray(data.data?.rows) ? data.data.rows : []
    ruleUsageTotal.value = typeof data.data?.total === 'number' ? data.data.total : 0
  } catch (error) {
    console.error('Failed to fetch rule usage:', error)
    ElMessage.error('获取规则调用列表失败')
  } finally {
    ruleUsageLoading.value = false
  }
}

// 规则调用列表分页处理
function onRuleUsagePageChange(newVal: number) {
  ruleUsagePageNo.value = newVal
  fetchRuleUsage()
}

function onRuleUsagePageSizeChange(newVal: number) {
  ruleUsagePageSize.value = newVal
  ruleUsagePageNo.value = 1
  fetchRuleUsage()
}

// 显示规则历史版本
async function showRuleHistory(rule: any) {
  // 将当前规则数据存储到 store 中
  ruleStore.setCurrentRule(rule)
  router.push({
    name: 'ruleEdit',
    query: {
      ruleId: rule.id
    }
  })
}

// 获取表格行样式
function getRowClassName({ row, rowIndex }: { row: any; rowIndex: number }) {
  return rowIndex % 2 === 0 ? 'even-row' : 'odd-row'
}

const setFunctionStatus = (row): Promise<boolean> => {
  console.log(1112)
  const status = ElMessageBox.confirm(`是否切换?`, '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      return true
    })
    .catch(() => {
      return false
    })
  return new Promise((resolve, reject) => {
    if (status) {
      // 点击确认按钮时设置tags值
      return resolve(status)
    } else {
      return reject(status)
    }
  })
}

const functionCateData = ref([])
async function fetchFunctionCateList(): Promise<void> {
  const res = await getFunctionList()
  dictData.value.funcClassifyKeyword = res.data
}
onMounted(() => {
  fetchFunctionCateList()
})
</script>

<style lang="scss" scoped>
.page {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #fff;
}

:deep(.el-tabs__header) {
  padding: 16px 16px 0 16px;
  margin: 0;
}
// 对话框头部样式
.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  .el-button {
    padding: 4px 8px;
    font-size: 12px;

    .el-icon {
      margin-right: 4px;
    }
  }
}

// 规则调用列表对话框样式
.rule-usage-dialog {
  .el-dialog__header {
    padding: 20px 20px 0;
    border-bottom: 1px solid #f0f0f0;

    .header-content {
      .header-title {
        display: flex;
        align-items: center;
        font-size: 18px;
        font-weight: 600;
        color: #303133;
        margin-bottom: 8px;

        .title-icon {
          margin-right: 8px;
          color: #409eff;
          font-size: 20px;
        }
      }

      .header-subtitle {
        font-size: 14px;
        color: #606266;
        margin-left: 28px;
      }
    }
  }

  .el-dialog__body {
    padding: 20px;
  }

  .rule-usage-content {
    .usage-stats {
      margin-bottom: 20px;

      .stats-card {
        border: 1px solid #e4e7ed;
        border-radius: 8px;

        .stats-content {
          display: flex;
          gap: 40px;

          .stat-item {
            display: flex;
            align-items: center;

            .stat-label {
              font-size: 14px;
              color: #606266;
              margin-right: 8px;
            }

            .stat-value {
              font-size: 16px;
              font-weight: 600;
              color: #409eff;
            }
          }
        }
      }
    }

    .table-container {
      margin-bottom: 20px;

      .el-table {
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

        .even-row {
          background-color: #fafafa;
        }

        .odd-row {
          background-color: #ffffff;
        }

        .rule-code {
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 13px;
          color: #606266;
          background-color: #f5f5f5;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .rule-name {
          font-weight: 500;
          color: #303133;
        }

        .rule-desc {
          color: #606266;
          line-height: 1.5;

          .no-desc {
            color: #c0c4cc;
            font-style: italic;
          }
        }

        .view-btn {
          padding: 6px 12px;
          border-radius: 6px;

          .el-icon {
            margin-right: 4px;
          }
        }
      }

      .empty-state {
        padding: 40px 0;
        text-align: center;
      }
    }

    .pagination-container {
      display: flex;
      justify-content: center;
      margin-top: 20px;

      .usage-pagination {
        .el-pagination__total {
          margin-right: 16px;
        }
      }
    }
  }

  .el-dialog__footer {
    padding: 15px 20px;
    border-top: 1px solid #f0f0f0;

    .dialog-footer {
      display: flex;
      justify-content: center;

      .el-button {
        padding: 10px 24px;
        font-size: 14px;

        .el-icon {
          margin-right: 6px;
        }
      }
    }
  }
}
</style>
