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

    <TestDrawer
      @close="getList"
      ref="testDrawerRef"
    />
  </div>
</template>

<script setup lang="tsx">
import { ref, onMounted, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import TestDrawer from '@/components/TestDrawer/index.vue'
import { http } from '@/utils/http'
import { getExecutionRecordPage, ExecutionRecordRequestParams, ExecutionRecordResponse, ExecutionRecordData, getDictData, DictItem, deleteExecutionRecord, DeleteExecutionRecordResponse } from '@/api/test'
import { formatMilliseconds } from '@/utils'
import BaseSearch from '@/components/BaseTable/BaseSearch.vue'
import BaseTable from "@/components/BaseTable/BaseTable.vue";


// 添加formRef引用

onMounted(() => {
  getList()
  fetchDict()
})

const search = ref<any>({})
const searchParams =  [
  {
    key: 'keyword',
    label: '关键词',
    fixed: true,
    placeholder: '按id/编码/名称/描述搜索',
    keydownSearch: true,
    // labelWidth: '150px'
  },
  {
    key: 'ruleType',
    label: '规则类型',
    type: 'select',
    fixed: true,
    options: [],
    clearable: true,
    placeholder: '请选择规则类型'
  },
  {
    key: 'sceneCategory',
    label: '业务场景',
    type: 'select',
    fixed: true,
    options: [],
    clearable: true,
    placeholder: '请选择'
  },
  {
    key: 'ruleStatus',
    label: '状态',
    type: 'select',
    clearable: false,
    fixed: true,
    options: [
      { value: '', name: '全部' },
      { name: '启用', value: 'ENABLED' },
      { name: '禁用', value: 'DISABLED' }
    ],
    placeholder: '请选择'
  },
  // {
  //   key: 'ruleStatus',
  //   label: '发布状态',
  //   type: 'select',
  //   clearable: false,
  //   options: [
  //       { name: '全部', value: '' },
  //       { name: '待测试', value: '0' },
  //       { name: '已测试', value: '1' },
  //       { name: '待打包', value: '2' },
  //       { name: '已打包', value: '3' },
  //       { name: '已发布', value: '4' }
  //   ],
  //   placeholder: '请选择'
  // },
  // { key: 'publisher', label: '版本号', placeholder: '请输入版本号' },
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
  { type: 'primaryButton', label: '测试', onClick: handleTest }
])
const tableColumn = [
  { type: 'index', key: 'index' },
  { key: 'ruleId', label: '规则ID', width: '120' },
  { key: 'ruleName', label: '规则名称', width: '160' },
  { key: 'expectedResult', label: '预期结果', width: '120' },
  { key: 'ruleType', label: '规则类型', width: '88', formatter: row => getDictLabelByName(dictData.value.ruleType, row.ruleType) },
  { key: 'sceneCategory', label: '业务场景', width: '88', formatter: row => getDictLabelByName(dictData.value.sceneCategory, row.sceneCategory) },
  { key: 'ruleStatus', label: '状态', width: '100', type: 'status', isSuccess: row => row.ruleStatus === 'ENABLED', successText: '启用', failText: '禁用' },
  // { key: 'ruleStatus', label: '发布状态', width: '100', formatter: row => getDictLabelByName(dictData.value.sceneCategory, row.sceneCategory) },
  // { key: 'version', label: '版本号', width: '100' },
  { key: 'partId', label: 'part节点ID', width: '160', formatter: row => formatPartIdDisplay(row) },
  { key: 'executionResult', label: '执行结果', width: '140', type: 'status',
    isSuccess: row => getExecutionSuccess(row.executionResult), successText: '成功', failText: '失败', desc: row => getExecutionMessage(row.executionResult)
  },
  { key: 'variableSet', label: 'xml文件', width: '200', click: row => handleView(row, 'xml'), formatter: row => row.fileCName },
  { key: 'creatorName', label: '测试人员', width: '100', formatter: row => row.creatorName || '/' },
  { key: 'executionTime', label: '执行时长', width: '100', formatter: row => formatMilliseconds(row.executionTime)  },
  { key: 'modifyTime', label: '执行日期', width: '160', formatter: row => formatDateTime(row.modifyTime)  },
  { key: 'remark', label: '备注', width: '100', click: row => handleView(row, 'notes'), formatter: row => '查看备注'  },
  {
    key: 'action',
    type: 'action',
    label: '操作',
    fixed: 'right',
    width: '200',
    formatter: row => {
      return (
        <>
          <el-button
            link
            type='primary'
            style='padding: 0'
            onclick={() => handleView(row)}
          >
            查看
          </el-button>
          <el-button
            link
            type='primary'
            style='padding: 0'
            onclick={() => handleDownload(row)}
          >
            下载xml文件
          </el-button>
          <el-popconfirm
            title="请确定要删除吗？"
            confirm-button-text="好的"
            cancel-button-text="不用了"
            width="200"
            hide-after="0"
            onConfirm={() => handleDelete(row)}
            v-slots={{
              reference: () => (
                <el-link type="primary" style="color: red;margin-left: 12px">
                  删除
                </el-link>
              )
            }}
          />
        </>
      )
    }
  }
]

const loadingList = ref(false)

/**
 * 获取规则类型和业务场景的字典数据
 */
async function fetchDict(): Promise<void> {
  try {
    const res = await getDictData({
      codes: ['RULE_TYPE', 'RULE_BUSINESS']
    })
    if (res.success && res.data.length >= 2) {
      dictData.value.ruleType = [{ value: '', name: '全部' }, ...res.data[0]]
      dictData.value.sceneCategory =  [{ value: '', name: '全部' }, ...res.data[1]]
    }
  } catch (error: any) {
    console.error('获取字典数据失败:', error)
  }
}

/**
 * 查询执行记录数据
 */
async function getList() {
  loadingList.value = true
  const params: ExecutionRecordRequestParams = {
    ...search.value, pageNo: pageNo.value, pageSize: pageSize.value
  }
  getExecutionRecordPage(params)
    .then(res => {
      if (res.success) {
        // 直接使用原始数据，只处理需要格式化的字段
        tableData.value = res.data.rows
        total.value = res.data.total || 0
      } else {
        ElMessage.error(res.error || '查询失败')
        tableData.value = []
        total.value = 0
        loadingList.value = false
      }
    })
    .catch(error => {
      ElMessage.error(error?.message || '查询失败')
      tableData.value = []
      total.value = 0
      loadingList.value = false
    })
    .finally(() => {
      loadingList.value = false
    })
}

/**
 * 根据字典值获取字典名称
 * @param dictList 字典列表
 * @param value 字典值
 * @returns 字典名称
 */
function getDictLabelByName(dictList: DictItem[], value: string): string {
  if (!value || !dictList || dictList.length === 0) return '-'
  const item = dictList.find(dict => dict.value === value)
  return item ? item.name : '-'
}

/**
 * 格式化日期时间，显示为年月日时分秒格式
 * @param timestamp 时间戳
 * @returns 格式化后的日期时间字符串
 */
function formatDateTime(timestamp: number): string {
  if (!timestamp) return '-'
  try {
    const date = new Date(timestamp)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')

    return `${year}-${month}-${day}\n${hours}:${minutes}:${seconds}`
  } catch (error) {
    console.error('格式化日期时间失败:', error)
    return '-'
  }
}

/**
 * 解析执行结果JSON，获取success状态
 * @param executionResult 执行结果JSON字符串
 * @returns 是否成功
 */
function getExecutionSuccess(executionResult: string): boolean {
  if (!executionResult) return false
  try {
    const result = JSON.parse(executionResult)
    return result.success === true
  } catch (error) {
    console.error('解析执行结果失败:', error)
    return false
  }
}

/**
 * 解析执行结果JSON，获取message字段
 * @param executionResult 执行结果JSON字符串
 * @returns message内容
 */
function getExecutionMessage(executionResult: string): string {
  if (!executionResult) return ''
  try {
    const result = JSON.parse(executionResult)
    return result.message || ''
  } catch (error) {
    console.error('解析执行结果失败:', error)
    return ''
  }
}

/**
 * 格式化partId显示，组合显示partName和partId
 * @param row 表格行数据
 * @returns 格式化后的显示文本
 */
function formatPartIdDisplay(row: ExecutionRecordData): string {
  const partName = row.partName || ''
  const partId = row.partId || ''
  
  if (partName && partId) {
    return `${partName} / ${partId}`
  } else if (partId) {
    return partId
  } else if (partName) {
    return partName
  } else {
    return ''
  }
}

/**
 * 预览测试用例数据
 * @param row 测试用例数据
 * @param activeTab 要激活的标签页
 */
function handleView(row: ExecutionRecordData, activeTab?: string) {
  testDrawerRef.value.openDrawer(row, true, false, activeTab, true)
}


// 在方法中打开抽屉
const testDrawerRef = ref()
/**
 * 测试
 */
function handleTest() {
  testDrawerRef.value.openDrawer(null, false, false, 'xml', true)
}

/**
 * 下载xml文件
 * @param row 测试用例数据
 */
async function handleDownload(row: ExecutionRecordData) {
  if (row.ossPath) {
    try {
      // 获取签名URL
      const signData = await http.post<any, any>('/cloudstorage/sign', {
        data: { signType: 1, key: row.ossPath }
      })

      if (!signData.success) {
        throw new Error('获取下载链接失败')
      }

      const fullUrl = signData.data
      const fileName = row.fileCName || '未命名文件.xml'

      fetch(fullUrl)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }
          return response.blob()
        })
        .then(blob => {
          const url = window.URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = fileName
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          window.URL.revokeObjectURL(url)
          ElMessage.success(`文件下载成功: ${fileName}`)
        })
        .catch(error => {
          console.error('下载文件失败:', error)
          ElMessage.error('下载文件失败')
        })
    } catch (error) {
      console.error('获取下载链接失败:', error)
      ElMessage.error('获取下载链接失败')
    }
  } else {
    ElMessage.warning('该记录没有关联的文件')
  }
}

/**
 * 删除
 * @param row 测试用例数据
 */
async function handleDelete(row: ExecutionRecordData) {
  const res: DeleteExecutionRecordResponse = await deleteExecutionRecord({ id: row.id })
  if (res.success) {
    ElMessage.success('删除成功')
    getList()
  }
}
</script>

<style lang="scss" scoped>
.page {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #fff;
}

</style>
