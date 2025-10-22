<script setup lang="ts">
import { ref, onMounted, reactive, nextTick  } from 'vue'
import editViewDetail from '@/views/permission/PermissionDetail.vue'
import cateEditDetail from '@/views/permission/PermissionCateDetail.vue'

import { http } from '@/utils/http'
import { ElMessage, ElMessageBox } from 'element-plus'
import { PageResult, RestResult } from '@/utils/http/types'
import {
  STATUS,
  DATA_SOURCE,
  toType,
  translate,
  translateDict,
  format
} from '@/views/user/constant'
import dayjs from 'dayjs'
import queryList from '@/components/layout/QueryList.vue'

import { useRenderIcon } from '@/components/ReIcon/src/hooks'
import IconDelete from '@iconify-icons/ep/delete'
import IconEditPen from '@iconify-icons/ep/edit-pen'
import IconSearch from '@iconify-icons/ep/search'
import IconAdd from '@iconify-icons/ri/add-circle-line'
import IconGoBack from '@iconify-icons/ri/arrow-go-back-line'
import IconInactive from '@iconify-icons/ri/stop-circle-line'
import IconActive from '@iconify-icons/ri/play-circle-line'
import IconBinding from '@iconify-icons/ri/link'
import ArrowLeft from '@iconify-icons/ep/arrow-left'
import UserIcon from '@iconify-icons/ri/user-3-line'
import RoleDrawer from '@/views/RoleDrawer.vue'

import { useDialogDrag } from '@/hooks/useDialogDrag'

const { initDialog } = useDialogDrag()

const dialogVisible = ref(false)
const cateDialogVisible = ref(false)

const dialogTitle = ref('')
const pageNo = ref(1)
const pageSize = ref(10)
const total = ref(0)
const searchText = ref('')
const gridData = ref([])
const detail = ref({})
const operationMode = ref('Edit')

const showRootCateNode = ref(false)

onMounted(() => {
  search()
  loadTree()
  fetchDict()
})

const loadingList = ref(false)
const sortOption = ref({})
async function search(pNo = 1) {
  loadingList.value = true
  pageNo.value = pNo
  const data = await http.get<any, PageResult>('/umas/rbac/permission/page', {
    data: {
      keyword: searchText.value,
      categoryId: categoryId.value,
      page: pageNo.value,
      pageSize: pageSize.value
    }
  })
  gridData.value = data.data.records
  total.value = data.data.total
  loadingList.value = false
}
function reset(): void {
  searchText.value = ''
  pageNo.value = 1
  pageSize.value = 10
  search()
}

async function newMethod() {
  operationMode.value = 'Add'
  dialogTitle.value = '新增数据权限'
  loadingDetail.value = true
  dialogVisible.value = true
  loadingDetail.value = false
  nextTick(() => {
    initDialog()
  })
}
async function edit(row: any) {
  operationMode.value = 'Edit'
  dialogTitle.value = '编辑数据权限'
  loadingDetail.value = true
  dialogVisible.value = true
  const { data } = await http.post<any, RestResult>('/umas/rbac/permission/get', {
    data: {
      id: row.id
    }
  })
  detail.value = data
  loadingDetail.value = false
  nextTick(() => {
    initDialog()
  })
}

const permissionTypeList = ref([])
const platformList = ref([])
async function fetchDict(): Promise<void> {
  const { data } = await http.post<any, RestResult>('/umas/common/dict/get', {
    data: {
      codes: ['PERMISSION_TYPE', 'PLATFORM']
    }
  })
  if (data.length > 0) {
    permissionTypeList.value = data[0]
    platformList.value = data[1]
  }
}

function save() {
  refDetail.value.validate(async (isvalid: boolean) => {
    if (!isvalid) {
      return
    }
    let method = 'update'
    let message = '修改成功'
    if (operationMode.value === 'Add') {
      method = 'save'
      message = '保存成功'
    }
    const result = await http.post('/umas/rbac/permission/' + method, {
      data: detail.value
    })
    if (result.code != 200) {
      return
    }
    dialogVisible.value = false
    ElMessage.success({
      message: message
    })
    pageNo.value = 1
    search()
  })
}
function onPageSizeChange(newVal: number): void {
  pageSize.value = newVal
  search()
}
function onPageNoChange(newVal: number): void {
  pageNo.value = newVal
  search(newVal)
}

const refDetail = ref()
function closeDialog(): void {
  refDetail.value.resetForm()
  detail.value = {}
}

async function deleteMethod(row: any) {
  await http.post('/umas/rbac/permission/delete', {
    data: [row.id]
  })
  ElMessage.success({
    message: '删除成功'
  })
  search()
}
async function inactive(row: any) {
  const result = await http.post('/umas/rbac/permission/inactive/' + row.id)
  if (result.code == 200) {
    ElMessage.success({
      message: '停用成功'
    })
  }
  search()
}

async function active(row: any) {
  const result = await http.post('/umas/rbac/permission/active/' + row.id)
  if (result.code == 200) {
    ElMessage.success({
      message: '启用成功'
    })
  }
  search()
}

async function switchStatus(row: any) {
  if (row.status == 1) {
    inactive(row)
  } else {
    active(row)
  }
}

function isBtnVisible(row: any, operation: string): boolean {
  const { status } = row

  switch (operation) {
    case 'edit':
      if (status != 0) {
        return true
      }
      break
    case 'delete':
      if (status != 0) {
        return true
      }
      break
  }
  return false
}

const loadingDetail = ref(false)

const treeProps = reactive({
  label: 'name',
  children: 'children',
  id: 'id'
})

const treeData = ref([])

async function loadTree() {
  const cateResult = await http.post<any, RestResult>('/umas/rbac/permission/category/tree', {
    data: {}
  })
  treeData.value = cateResult.data
}

const categoryId = ref('')
const handleNodeClick = (data: Tree) => {
  categoryId.value = data.id
  search()
}

function mouseover(data: any) {
  // 移入
  Reflect.set(data, 'dropdownShow', true)
}
function mouseout(data: any) {
  // 移除\
  Reflect.set(data, 'dropdownShow', false)
}

async function addNode(row: any) {
  loadingDetail.value = true
  operationMode.value = 'Add'
  dialogTitle.value = '新增'
  if (row) {
    detail.value.parentId = row.id
    detail.value.platform = row.platform
  } else {
    detail.value.parentId = 0
  }
  showRootCateNode.value = true
  cateDialogVisible.value = true
  loadingDetail.value = false
  nextTick(() => {
    initDialog()
  })
}
async function rootNode() {
  loadingDetail.value = true
  operationMode.value = 'Root'
  dialogTitle.value = '新增'
  detail.value.parentId = 0
  showRootCateNode.value = false
  cateDialogVisible.value = true
  loadingDetail.value = false
  nextTick(() => {
    initDialog()
  })
}

async function editNode(row: any) {
  operationMode.value = 'Edit'
  dialogTitle.value = '编辑'
  loadingDetail.value = true
  cateDialogVisible.value = true
  const { data } = await http.get<any, RestResult>('/umas/rbac/permission/category/' + row.id)
  detail.value = data
  if (data.parentId != 0) {
    showRootCateNode.value = true
  } else {
    showRootCateNode.value = false
  }
  loadingDetail.value = false
  nextTick(() => {
    initDialog()
  })
}

async function deleteNode(row: any) {
  ElMessageBox.confirm(
    '确定则目录下的子目录、数据权限、关联角色级联删除',
    '请确定要删除该目录吗?',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    loadingDetail.value = true
    executeDelete(row)
  })
}

async function executeDelete(row: any) {
  const result = await http.post('/umas/rbac/permission/category/delete', {
    data: [row.id]
  })
  if (result.code == 200) {
    loadingDetail.value = false
    ElMessage.success({
      message: '删除成功'
    })
    loadTree()
  }
}

async function saveNode(row: any) {
  refDetail.value.validate(async (isvalid: boolean) => {
    if (!isvalid) {
      return
    }
    let method = 'save'
    let message = '保存成功'
    if (operationMode.value === 'Edit') {
      method = 'update'
      message = '修改成功'
    }
    const result = await http.post('/umas/rbac/permission/category/' + method, {
      data: detail.value
    })
    if (result.code == 200) {
      cateDialogVisible.value = false
      ElMessage.success({
        message: message
      })
      pageNo.value = 1
      loadTree()
      search()
    }
  })
}

// 角色弹窗
const roleShow = ref(false)

const relationId = ref(0)
const roleRef = ref('')
const roleType = ref('permission')
const showView = ref(false)

async function relatedRole(row, readable) {
  relationId.value = row.id
  showView.value = readable
  roleShow.value = true
  roleRef.value.search()
}
</script>

<template>
  <query-list title="数据权限管理">
    <RoleDrawer
      v-model="roleShow"
      ref="roleRef"
      :role-type="roleType"
      :show-view="showView"
      :relation-id="relationId"
    />
    <template #toolbar-body>
      <div>
        <el-input
          v-model.trim="searchText"
          placeholder="按编码或名称搜索"
          clearable
          @keyup.enter="search()"
          :suffix-icon="useRenderIcon(IconSearch)"
          style="width: 200px"
        />
        &nbsp;
        <el-button type="primary" :icon="useRenderIcon(IconAdd)" @click="newMethod">新增</el-button>
      </div>
    </template>
    <template #body>
      <div class="content flex">
        <div>
          <div style="padding: 5px 0px">
            <el-button
              size="small"
              type="primary"
              @click="rootNode()"
              :icon="useRenderIcon(IconAdd)"
            >
              添加一级目录
            </el-button>
          </div>
          <el-tree
            class="tree"
            :data="treeData"
            :props="treeProps"
            :highlight-current="true"
            node-key="id"
            @node-click="handleNodeClick"
          >
            <template #default="{ node, data }">
              <div
                class="custom-tree-node"
                @mouseover="mouseover(data)"
                @mouseleave="mouseout(data)"
              >
                <span>{{ node.label }}</span>
                <span v-show="data.dropdownShow && data.id">
                  <el-link
                    type="primary"
                    style="margin-right: 5px"
                    @click.stop="addNode(node.data)"
                    :icon="useRenderIcon(IconAdd)"
                  />
                  <el-link
                    type="primary"
                    style="margin-right: 5px"
                    @click.stop="editNode(node.data)"
                    :icon="useRenderIcon(IconEditPen)"
                  />
                  <el-link
                    type="primary"
                    style="margin-right: 5px"
                    @click.stop="deleteNode(node.data)"
                    :icon="useRenderIcon(IconDelete)"
                  />
                </span>
              </div>
            </template>
          </el-tree>
        </div>
        <div class="right">
          <el-table v-loading="loadingList" :data="gridData">
            <el-table-column label="编码" prop="code" align="left" />
            <el-table-column label="名称" prop="name" align="left" />
            <el-table-column label="类型" prop="permissionType" width="150" align="center">
              <template #default="{ row }">
                {{ translateDict(row.permissionType, permissionTypeList) }}
              </template>
            </el-table-column>
            <el-table-column label="所属平台" prop="platform" width="150" align="center">
              <template #default="{ row }">
                {{ translateDict(row.platform, platformList) }}
              </template>
            </el-table-column>
            <el-table-column label="所属目录" prop="categoryName" width="150" align="center" />
            <el-table-column label="修改人" prop="modifierName" width="150" align="center" />
            <el-table-column label="修改时间" prop="modifyTime" width="150" align="center">
              <template #default="{ row }">
                {{ format(row.modifyTime) }}
              </template>
            </el-table-column>
            <el-table-column label="备注" prop="remark" width="150" align="center" />
            <el-table-column label="操作" align="center">
              <template #default="{ row }">
                <div class="operation-column">
                  <el-link
                    v-if="isBtnVisible(row, 'edit')"
                    type="primary"
                    :icon="useRenderIcon(IconEditPen)"
                    @click="edit(row)"
                  >
                    编辑
                  </el-link>

                  <el-popover placement="bottom" width="150" trigger="hover">
                    <div style="padding-bottom: 5px">
                      <el-link @click="relatedRole(row, false)" type="primary">关联角色</el-link>
                    </div>
                    <div style="padding-bottom: 5px">
                      <el-link @click="relatedRole(row, true)" type="primary">查看角色</el-link>
                    </div>
                    <el-popconfirm
                      v-if="isBtnVisible(row, 'delete')"
                      title="请确定要删除该数据权限吗？"
                      confirm-button-text="好的"
                      cancel-button-text="不用了"
                      width="200"
                      :hide-after="0"
                      @confirm="deleteMethod(row)"
                    >
                      <template #reference>
                        <el-link type="primary" :icon="useRenderIcon(IconDelete)">删除</el-link>
                      </template>
                    </el-popconfirm>
                    <template #reference>
                      <el-link type="primary">更多</el-link>
                    </template>
                  </el-popover>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </template>
    <template #pagination>
      <div class="pagination">
        <el-pagination
          :current-page="pageNo"
          @update:current-page="onPageNoChange"
          :page-size="pageSize"
          @update:page-size="onPageSizeChange"
          :page-sizes="[10, 20, 30, 40, 50]"
          layout="total, prev, pager, next, jumper, sizes"
          :total="total"
          background
        />
      </div>
    </template>
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="30%"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      append-to-body
      :destroy-on-close="true"
      @close="closeDialog"
    >
      <edit-view-detail
        v-loading="loadingDetail"
        ref="refDetail"
        :detail="detail"
        :cate-tree-data="treeData"
        :tree-props="treeProps"
        :permission-type-list="permissionTypeList"
        :platform-list="platformList"
        :operation-mode="operationMode"
      />
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="save">确定</el-button>
        </span>
      </template>
    </el-dialog>
    <el-dialog
      v-model="cateDialogVisible"
      :title="dialogTitle"
      width="30%"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      append-to-body
      :destroy-on-close="true"
      @close="closeDialog"
    >
      <cate-edit-detail
        v-loading="loadingDetail"
        ref="refDetail"
        :detail="detail"
        :cate-tree-data="treeData"
        :tree-props="treeProps"
        :platform-list="platformList"
        :operation-mode="operationMode"
        :show-root-cate-node="showRootCateNode"
      />
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="cateDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveNode">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </query-list>
</template>

<style lang="scss">
.operation-column .el-link {
  margin-right: 20px;
}

.tree {
  height: 100%;
  border-right: 1px solid #eee;
  width: 200px;
  flex-shrink: 0;
}
.content {
  height: calc(100% - 60px);
}
.right {
  flex: 1;
  overflow-y: scroll;
}

.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}
</style>
