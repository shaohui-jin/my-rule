<template>
  <div class="class-directory-container">
    <div class="body-top">
      <div class="body-top-left">
        分类名称：
        <el-input
          v-model="keyword"
          placeholder="请输入分类名称"
          style="width: 200px"
          @change="filterTree"
        />
        <el-button type="primary" @click="filterTree" style="margin-left: 8px">搜索</el-button>
      </div>
      <div class="body-top-right">
        <el-button @click="openSortDialog">分类排序</el-button>
        <el-button type="primary" @click="openInsertDialog">添加分类</el-button>
      </div>
    </div>
    <div class="body-bottom">
      <el-table
        max-height="800px"
        style="width: 100%; margin-bottom: 20px"
        row-key="id"
        border
        default-expand-all
        :header-cell-style="{ backgroundColor: 'rgba(242, 246, 252, 1)', color: '#989EAA' }"
        :row-style="{ height: '40px' }"
        :data="_tableData"
        :loading="tableLoading"
      >
        <el-table-column prop="name" label="分类名称" />
        <el-table-column prop="modifyTime" label="更新时间" width="200" />
        <el-table-column label="操作" width="200">
          <template #default="{ $index, row }">
            <el-button
              text
              type="primary"
              :style="`padding: 0; ${row.level !== 1 ? 'visibility: hidden;' : ''}`"
              @click="openInsertChildDialog(row)"
            >
              添加子分类
            </el-button>
            <el-button text type="primary" @click="openUpdateDialog(row)" style="padding: 0">
              编辑
            </el-button>
            <el-button text type="danger" @click="handleDelete(row)" style="padding: 0">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <el-dialog
      v-model="visible"
      width="500px"
      :title="`${form.id ? '编辑' : '新增'}${form.parentId ? '子' : ''}分类`"
      append-to-body
      :close-on-click-modal="false"
      :destroy-on-close="true"
      :beforeClose="closeInsertDialog"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" @submit.prevent>
        <el-form-item v-if="form.parentId" label="上层分类">
          <el-input v-model="form.parentName" disabled />
        </el-form-item>
        <el-form-item prop="name" label="分类名称">
          <el-input v-model="form.name" placeholder="请输入分类名称" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeInsertDialog">取消</el-button>
          <el-button type="primary" @click="handleInsertOrUpdate">确定</el-button>
        </span>
      </template>
    </el-dialog>
    <el-dialog
      class="class-directory-sort-dialog"
      v-model="sortDialogVisible"
      width="500px"
      title="分类排序"
      append-to-body
      :close-on-click-modal="false"
      :destroy-on-close="true"
      :beforeClose="closeSortDialog"
    >
      <el-alert
        title="温馨提示：分类排序只允许同级层排序"
        type="warning"
        show-icon
        :closable="false"
      />
      <el-tree
        style="margin-top: 10px"
        draggable
        node-key="id"
        :data="sortData"
        :props="{
          label: 'name',
          children: 'children'
        }"
        :allowDrop="allowDrop"
      />
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeSortDialog">取消</el-button>
          <el-button type="primary" @click="handleSort">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useClassDirectoryStoreHook } from '@/store/modules/classDirectory'
import { ElMessage, ElMessageBox } from 'element-plus'

import { useDialogDrag } from '@/hooks/useDialogDrag'

const { initDialog } = useDialogDrag()

defineOptions({
  name: 'classDirectory'
})

const classDirectoryStore = useClassDirectoryStoreHook()
const keyword = ref('')
const tableLoading = ref(false)
const tableData = ref()
const _tableData = ref()

onMounted(() => {
  initData()
})

const initData = async () => {
  tableData.value = await classDirectoryStore.getClassTreeData()
  filterTree()
}
const filterTree = () => {
  _tableData.value = []
  const key = keyword.value.trim()
  _tableData.value = tableData.value.map(item => {
    return {
      ...item,
      children: item.children?.filter(child => child.name.includes(key)) || []
    }
  })
}

// 新增 编辑 删除相关
const formRef = ref()
const visible = ref(false)
const initForm = { id: '', name: '', parentId: '', parentName: '' }
const form = ref(initForm)
const rules = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
}

const openInsertDialog = () => {
  form.value = JSON.parse(JSON.stringify(initForm))
  visible.value = true
  nextTick(() => {
    initDialog()
  })
}

const openInsertChildDialog = row => {
  form.value = JSON.parse(JSON.stringify(initForm))
  form.value.parentId = row.id
  form.value.parentName = row.name
  visible.value = true
  nextTick(() => {
    initDialog()
  })
}

const closeInsertDialog = () => {
  formRef.value.resetFields()
  form.value = JSON.parse(JSON.stringify(initForm))
  visible.value = false
}

const handleInsertOrUpdate = () => {
  formRef.value
    .validate(async valid => {
      if (valid) {
        tableLoading.value = true
        const res = await classDirectoryStore.insertOrUpdateClassData(form.value)
        if (res) {
          ElMessage.success('新增成功')
          initData()
          closeInsertDialog()
        } else {
          ElMessage.error('新增失败')
        }
      }
    })
    .catch(() => {})
    .finally(() => {
      tableLoading.value = false
    })
}

const openUpdateDialog = row => {
  form.value = JSON.parse(JSON.stringify(row))
  const _parent = _tableData.value.find(e => e.id === row.parentId)
  if (_parent) {
    form.value.parentId = _parent.id
    form.value.parentName = _parent.name
  }
  visible.value = true
  nextTick(() => {
    initDialog()
  })
}

const handleDelete = async row => {
  const cb = async () => {
    const _res = await classDirectoryStore.deleteClassData(row)
    if (_res) {
      ElMessage.success('删除成功')
      initData()
    } else {
      ElMessage.error('删除失败')
    }
  }
  const res = await classDirectoryStore.checkClassData(row)
  if (res) {
    cb()
  } else {
    ElMessageBox.confirm('分类下包含函数，删除后函数将归属到未分类中，是否继续删除分类？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
      .then(() => {
        cb()
      })
      .catch(() => {})
  }
}

// 排序相关
const sortDialogVisible = ref(false)
const sortData = ref()
const openSortDialog = () => {
  sortData.value = JSON.parse(JSON.stringify(tableData.value))
  sortDialogVisible.value = true
  nextTick(() => {
    initDialog()
  })
}
const closeSortDialog = () => {
  sortDialogVisible.value = false
}
const handleSort = async () => {
  const res = await classDirectoryStore.batchUpdateClassData(sortData.value)
  if (res) {
    ElMessage.success('操作成功')
    sortDialogVisible.value = false
    initData()
  } else {
    ElMessage.error('操作失败')
  }
}
const allowDrop = (draggingNode, dropNode, type) => {
  return draggingNode.level === dropNode.level && (type === 'prev' || type === 'next')
}
</script>

<style scoped lang="scss">
.class-directory-container {
  padding: 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  .body-top {
    height: 32px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }
  .body-bottom {
    flex: 1 1 0;
    padding: 12px 0;
    overflow: overlay;
  }
}
</style>
<style lang="scss">
.class-directory-sort-dialog {
  .el-dialog__body {
    padding: 12px;
    .el-tree {
      max-height: 600px;
      overflow: overlay;
    }
  }
}
</style>
