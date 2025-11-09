<template>
  <div class="page">
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
      v-model="variableDialogVisible"
      title="引用参数"
      width="400px"
      class="variable-dialog"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :append-to-body="true"
      :destroy-on-close="true"
      @close="closeVariableDialog"
    >
      <el-input
        :prefix-icon="Search"
        v-model="variableKey"
        placeholder="搜索参数"
        @keyup.enter.native="searchData"
      ></el-input>
      <el-tree
        ref="treeRef"
        :filter-node-method="filterNode"
        style="max-height: 300px; overflow: overlay; margin-top: 8px"
        :data="variableTreeData"
        :props="{ children: 'children' }"
      >
        <template #default="{ node, data }">
          <span class="name">
            {{ data.name ? `${data.name}${data.level === 1 ? ` ID:${data.id}` : ''}` : data.code }}
          </span>
        </template>
      </el-tree>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeVariableDialog">取消</el-button>
          <el-button type="primary" @click="closeVariableDialog">确定</el-button>
        </span>
      </template>
    </el-dialog>

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
        @submit="handleSubmit"
      />
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" v-if="operationMode == 'ADD'" @click="add">确定</el-button>
          <el-button v-else type="primary" @click="update">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 历史版本抽屉 -->
    <el-drawer
      v-model="historyDrawerVisible"
      title="历史版本"
      direction="rtl"
      size="60%"
      :close-on-click-modal="false"
    >
      <div v-loading="historyLoading" class="history-container">
        <div class="history-list">
          <div v-for="(version, index) in historyData" :key="index" class="history-item">
            <div class="version-table">
              <div class="table-header">
                <div class="header-cell">{{ version.isCurrent ? '当前版本号' : '版本号' }}</div>
                <div class="header-cell">发布时间</div>
                <div class="header-cell">发布人</div>
                <div class="header-cell">修改记录</div>
                <div class="header-cell">操作</div>
              </div>
              <div class="table-row">
                <div class="table-cell">{{ formatVersion(version.publishTime) }}</div>
                <div class="table-cell">{{ formatVersion(version.publishTime) }}</div>
                <div class="table-cell">{{ version.modifierName || '/' }}</div>
                <div class="table-cell">{{ version.modifyReason }}</div>
                <div class="table-cell">
                  <el-button
                    v-if="!version.isCurrent"
                    type="primary"
                    link
                    @click="openHistoryVersion(version)"
                    style="color: var(--el-color-primary) !important"
                  >
                    打开
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="tsx">
import { ref, onMounted, reactive, computed,nextTick  } from 'vue'
import { http } from '@/axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Edit, ArrowDown, ArrowUp, Rank, Clock, Refresh, Search } from '@element-plus/icons-vue'
import Detail from './detail.vue'
import { useRouter, useRoute } from 'vue-router'
import { useRuleStore } from '@/store/modules/ruleCache'
import BaseSearch from '@/components/BaseTable/BaseSearch.vue'
import BaseTable from '@/components/BaseTable/BaseTable.vue'

import { useDialogDrag } from '@/hooks/useDialogDrag'

const { initDialog } = useDialogDrag()

// 定义detail的类型
interface DetailType {
  ruleCode?: string
  ruleName?: string
  ruleType?: string
  sceneCategory?: string
  ruleDesc?: string
  ruleStatus?: string
  [key: string]: any
}

defineOptions({
  name: 'rule'
})

const search = ref<any>({ ruleType: 'module' })
const searchParams = [
  {
    key: 'keyword',
    label: '规则id/编码/名称/描述',
    fixed: true,
    placeholder: '按id/编码/名称/描述搜索',
    keydownSearch: true,
    labelWidth: '150px'
  },
  {
    key: 'ruleType',
    label: '规则类型',
    type: 'select',
    options: [],
    fixed: true,
    clearable: true,
    placeholder: '请选择规则类型'
  },
  {
    key: 'sceneCategory',
    label: '业务场景',
    type: 'select',
    options: [],
    fixed: true,
    clearable: true,
    placeholder: '请选择'
  },
  // {
  //   key: 'ruleStatus',
  //   label: '状态',
  //   type: 'select',
  //   clearable: false,
  //   options: [
  //     { name: '全部', value: '' },
  //     { name: '启用', value: 'ENABLED' },
  //     { name: '禁用', value: 'DISABLED' }
  //   ],
  //   fixed: true,
  //   placeholder: '请选择'
  // },
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
  { key: 'creatorName', label: '创建人', placeholder: '请输入创建人', fixed: true },
  { key: 'publisher', label: '发布人', placeholder: '请输入发布人' },
  {
    key: 'publishTime',
    label: '发布时间',
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
  },
  {
    key: 'variableSet',
    label: '参数代码',
    placeholder: '请输入参数代码code',
    clearable: true
  },
  {
    key: 'createTime',
    label: '创建时间',
    type: 'daterange',
    startPlaceholder: '开始日期',
    endPlaceholder: '结束日期',
    valueFormat: 'YYYY-MM-DD HH:mm:ss',
    placeholder: '请选择'
  }
]
const dictData = ref({
  ruleType: [],
  sceneCategory: []
})

const pageNo = ref(1)
const pageSize = ref(10)
const total = ref(0)
const tableData = ref()
const actionList = ref([
  { type: 'primaryButton', label: '新增规则', onClick: addRule },
  { type: 'primaryButton', label: '刷新规则缓存', onClick: refreshCache }
])
const tableColumn = [
  { type: 'index', key: 'index' },
  { key: 'id', label: '规则id', width: '120' },
  { key: 'ruleCode', label: '规则编码', width: '120' },
  { key: 'ruleName', label: '规则名称', width: '160' },
  {
    key: 'ruleType',
    label: '规则类型',
    width: '88',
    formatter: row => getDictLabel('ruleType', row.ruleType)
  },
  {
    key: 'sceneCategory',
    label: '业务场景',
    width: '88',
    formatter: row => getDictLabel('sceneCategory', row.sceneCategory)
  },
  {
    key: 'ruleDesc',
    label: '规则描述',
    width: '120',
    prependEditButton: true,
    editButtonClick: row => editRule(row)
  },
  {
    key: 'variableSet',
    label: '引用参数',
    width: '80',
    click: row => showVariableDialog(row.variableSet),
    formatter: row => '查看'
  },
  {
    key: 'ruleStatus',
    label: '状态',
    width: '100',
    type: 'status',
    isSuccess: row => row.ruleStatus === 'ENABLED',
    successText: '启用',
    failText: '禁用'
  },
  // { key: 'status', label: '发布状态', width: '100', type: 'status', isSuccess: row => row.ruleStatus === 'ENABLED', successText: '启用', failText: '禁用' },
  // { key: 'version', label: '版本号', width: '140', formatter: row => formatVersion(row.version) || '/' },
  {
    key: 'publishCode',
    label: '当前运行版本号',
    width: '140',
    formatter: row => formatVersion(row.publishTime) || '/'
  },
  { key: 'publishTime', label: '发布时间', width: '160', formatter: row => row.publishTime || '/' },
  { key: 'publisher', label: '发布人', width: '100', formatter: row => row.publisher || '/' },
  {
    key: 'modifierCode',
    label: '最新版本号',
    width: '140',
    formatter: row => formatVersion(row.modifyTime) || '/'
  },
  { key: 'modifyTime', label: '修改时间', width: '160', formatter: row => row.modifyTime || '/' },
  { key: 'modifierName', label: '修改人', width: '100', formatter: row => row.modifierName || '/' },
  { key: 'creatorName', label: '创建人', width: '100', formatter: row => row.creatorName || '/' },
  { key: 'enableTime', label: '启用时间', width: '160', formatter: row => row.enableTime || '/' },
  {
    key: 'action',
    type: 'action',
    label: '操作',
    fixed: 'right',
    width: '180',
    formatter: row => {
      if (row.ruleType === 'module') {
        return (
          <>
            <el-button link type='primary' style='padding: 0' onclick={() => handleEdit(row)}>
              编辑
            </el-button>
            <el-button link type='primary' style='padding: 0' onclick={() => showHistory(row)}>
              历史版本
            </el-button>
            <el-button link type='danger' style='padding: 0' onclick={() => handleDelete(row)}>
              删除
            </el-button>
          </>
        )
      }
    }
  }
]

const loadingList = ref(false)
async function getList() {
  loadingList.value = true
  const params = { ...search.value, pageNo: pageNo.value, pageSize: pageSize.value }
  if (search.value.createTime) {
    params.createTimeStart = search.value.createTime?.[0] || undefined
    params.createTimeEnd = search.value.createTime?.[1] || undefined
  }
  if (search.value.publishTime) {
    params.publishTimeStart = search.value.publishTime?.[0] || undefined
    params.publishTimeEnd = search.value.publishTime?.[1] || undefined
  }
  if (search.value.modifyTime) {
    params.modifyTimeStart = search.value.modifyTime?.[0] || undefined
    params.modifyTimeEnd = search.value.modifyTime?.[1] || undefined
  }

  const data = await http.post({ url: 'rule-config/rule/page', data: params })
  tableData.value = data.data?.rows || []
  total.value = data.data?.total || 0
  loadingList.value = false
}

const dialogVisible = ref(false)
const dialogTitle = ref('')
const dialogType = ref('')
const detail = ref<DetailType>({})
const operationMode = ref('Edit')
const router = useRouter()
const route = useRoute()
const ruleStore = useRuleStore()

const loadingDetail = ref(false)

const form = reactive({
  keyword: '',
  ruleType: 'module',
  sceneCategory: '',
  ruleStatus: '',
  creatorName: '',
  createTimeRange: null as [string, string] | null,
  publisher: '',
  publishTimeRange: null as [string, string] | null,
  modifierName: '',
  modifyTimeRange: null as [string, string] | null,
  variableSet: ''
})

const ruleTypeOptions = ref([])
const sceneCategoryOptions = ref([])

// 历史版本相关
const historyDrawerVisible = ref(false)
const historyLoading = ref(false)
const historyData = ref<any[]>([])
const currentRule = ref<any>(null)

onMounted(() => {
  getList()
  fetchDict()
  // 如果页面参数传递带了 searchkey 则主动触发搜索
  if (route.query?.searchkey) {
    setTimeout(() => {
      form.keyword = route.query.searchkey as string
      getList()
    }, 200)
  }
})

async function fetchDict(): Promise<void> {
  const { data } = await http.post({
    url: '/umas/common/dict/get',
    data: {
      codes: ['RULE_TYPE', 'RULE_BUSINESS']
    }
  })
  if (data.length > 0) {
    dictData.value.ruleType = [{ value: '', name: '全部' }, ...data[0]]
    dictData.value.sceneCategory = [{ value: '', name: '全部' }, ...data[1]]

    ruleTypeOptions.value = [{ value: '', name: '全部' }, ...data[0]]
    sceneCategoryOptions.value = [{ value: '', name: '全部' }, ...data[1]]
  }
}

const refDetail = ref()
function closeDialog(): void {
  refDetail.value.resetForm()
  detail.value = {}
}

function addRule() {
  operationMode.value = 'ADD'
  dialogTitle.value = '新增规则'
  dialogVisible.value = true
  detail.value = {
    ruleCode: '',
    ruleName: '',
    ruleType: 'module',
    sceneCategory: '',
    ruleDesc: '',
    ruleStatus: 'ENABLED'
  }
  nextTick(() => {
    initDialog()
  })
}

/**
 * 编辑规则工作流 跳转到规则编辑页面
 * @param row 规则数据
 */
function handleEdit(row: any) {
  // 将当前函数数据存储到 store 中
  ruleStore.setCurrentRule(row)
  router.push({
    name: 'ruleEdit',
    query: {
      ruleId: row.id
    }
  })
}

function publish(row: any) {
  ElMessageBox.confirm('确定要发布该规则吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      await http
        .post({
          url: '/rule-config/rule/publish',
          data: { id: row.id }
        })
        .then(res => {
          if (res.code == 200) {
            ElMessage.success({
              message: '发布成功'
            })
            getList()
          }
        })
    })
    .catch(() => {})
}

async function updateStatus(row: any) {
  const newStatus = row.ruleStatus === 'ENABLED' ? 'DISABLED' : 'ENABLED'
  await http
    .post({
      url: '/rule-config/rule/update/enable',
      data: {
        id: row.id,
        ruleStatus: newStatus
      }
    })
    .then(res => {
      if (res.code == 200) {
        ElMessage.success({
          message: newStatus === 'ENABLED' ? '启用成功' : '禁用成功'
        })
        getList()
      }
    })
}

function add() {
  refDetail.value.validate(async (isvalid: boolean) => {
    if (!isvalid) {
      return
    }
    await http
      .post({
        url: '/rule-config/rule/add',
        data: {
          ruleCode: detail.value.ruleCode,
          ruleName: detail.value.ruleName,
          ruleType: detail.value.ruleType,
          sceneCategory: detail.value.sceneCategory,
          ruleDesc: detail.value.ruleDesc,
          ruleStatus: detail.value.ruleStatus
        }
      })
      .then((res: any) => {
        if (res.data > 0) {
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

// 监听子组件提交事件
const handleSubmit = async (formData: any) => {
  await http
    .post({
      url: '/rule-config/rule/add',
      data: formData
    })
    .then((res: any) => {
      if (res.code === 200) {
        ElMessage.success({
          message: '保存成功'
        })
        dialogVisible.value = false
        pageNo.value = 1
        getList()
      }
    })
}

function update() {
  refDetail.value.validate(async (isvalid: boolean) => {
    if (!isvalid) {
      return
    }
    await http
      .post({
        url: '/rule-config/rule/update/basic',
        data: detail.value
      })
      .then(() => {
        dialogVisible.value = false
        ElMessage.success({
          message: '保存成功'
        })
        pageNo.value = 1
        getList()
      })
  })
}

function getDictLabel(key, value: string): string {
  const option = dictData.value[key].find(item => item.value === value)
  return option ? option.name : value
}

// 切换规则状态
const toggleRuleStatus = (row: any) => {
  const newStatus = row.ruleStatus === 'ENABLED' ? 'DISABLED' : 'ENABLED'
  const actionText = newStatus === 'ENABLED' ? '启用' : '禁用'

  ElMessageBox.confirm(`确定要${actionText}该规则吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      const params = {
        data: {
          id: row.id,
          ruleStatus: newStatus
        }
      }
      http.post({ url: '/rule-config/rule/update/enable', data: params }).then(res => {
        if (res.data === true) {
          ElMessage.success(`${actionText}成功`)
          getList()
        }
      })
    })
    .catch(() => {})
}

// 格式化版本号
const formatVersion = (time: string) => {
  if (!time) return ''
  const date = new Date(time)
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  const seconds = date.getSeconds().toString().padStart(2, '0')
  return `${year}${month}${day}${hours}${minutes}${seconds}`
}

// 编辑规则
const editRule = (row: any) => {
  dialogType.value = 'edit'
  detail.value = { ...row }
  operationMode.value = 'EDIT'
  dialogVisible.value = true
  nextTick(() => {
    initDialog()
  })
}

function refreshCache() {
  ElMessageBox.confirm('确定要刷新规则缓存吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      http
        .post({ url: '/rule-config/rule/cache/refresh' })
        .then((res: any) => {
          if (res.data === true) {
            ElMessage.success('缓存刷新成功')
          } else {
            ElMessage.error('缓存刷新失败')
          }
        })
        .catch(() => {
          ElMessage.error('缓存刷新失败')
        })
    })
    .catch(() => {})
}

// 显示历史版本
async function showHistory(row: any) {
  currentRule.value = row
  historyDrawerVisible.value = true
  historyLoading.value = true

  try {
    const { data } = await http.post({
      url: '/rule-config/rule/history',
      data: { id: row.id }
    })

    // 处理历史数据，标记当前版本
    historyData.value = data.map((version: any, index: number) => ({
      ...version,
      isCurrent: index === 0 // 假设第一个是最新版本
    }))
  } catch (error) {
    console.error('Failed to fetch history:', error)
    ElMessage.error('获取历史版本失败')
  } finally {
    historyLoading.value = false
  }
}

// 打开历史版本
function openHistoryVersion(version: any) {
  // 将历史版本数据存储到 store 中
  ruleStore.setCurrentRule(version)
  router.push({
    name: 'ruleEdit',
    query: {
      ruleId: currentRule.value.id
    }
  })
}

// 删除规则
async function handleDelete(row: any) {
  try {
    // 确认删除
    await ElMessageBox.confirm('确定要删除该规则吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    // 执行删除
    const deleteResult = await http.post({
      url: '/rule-config/rule/delete',
      data: { id: row.id }
    })

    if (deleteResult.success && (!deleteResult.data || deleteResult.data.length === 0)) {
      // success为true且data为空，说明删除成功
      ElMessage.success('删除成功')
      getList() // 刷新列表
    } else if (deleteResult.data && deleteResult.data.length > 0) {
      // 如果返回的data有值，说明不能删除，显示引用信息
      ElMessage.error(
        '删除失败：该规则被引用，无法删除。引用信息：' + JSON.stringify(deleteResult.data)
      )
    } else {
      ElMessage.error('删除失败')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('Delete rule error:', error)
      ElMessage.error('删除失败：' + (error.message || '未知错误'))
    }
  }
}

// 打开引用参数弹窗
const variableDialogVisible = ref(false)
const variableTreeData = ref([])
const showVariableDialog = treeData => {
  variableTreeData.value = JSON.parse(treeData) || []
  variableDialogVisible.value = true
  nextTick(() => {
    initDialog()
  })
}

const treeRef = ref()
const variableKey = ref('')
const searchData = () => {
  treeRef.value.filter(variableKey.value)
}
const filterNode = (value: string, data: any) => {
  if (!value) return true
  return data.code.includes(value)
}
const closeVariableDialog = () => {
  variableKey.value = ''
  variableDialogVisible.value = false
}
</script>

<style lang="scss" scoped>
.page {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #fff;
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

// 历史版本样式
.history-container {
  padding: 20px;

  .history-list {
    .history-item {
      margin-bottom: 20px;
      border: 1px solid #e4e7ed;
      border-radius: 6px;
      overflow: hidden;

      .version-table {
        border: 1px solid #e4e7ed;
        border-radius: 4px;
        overflow: hidden;

        .table-header {
          display: flex;
          background-color: #f5f7fa;
          border-bottom: 1px solid #e4e7ed;

          .header-cell {
            flex: 1;
            padding: 12px 16px;
            font-weight: 500;
            font-size: 13px;
            color: #606266;
            border-right: 1px solid #e4e7ed;

            &:last-child {
              border-right: none;
            }
          }
        }

        .table-row {
          display: flex;

          .table-cell {
            flex: 1;
            padding: 12px 16px;
            font-size: 13px;
            color: #303133;
            border-right: 1px solid #e4e7ed;

            &:last-child {
              border-right: none;
            }
          }
        }
      }
    }
  }
}
</style>
<style lang="scss">
.variable-dialog {
  .el-dialog__body {
    padding: 12px;
  }
}
</style>
