<script setup lang="ts">
import { ref, reactive, computed } from 'vue'

import type {
  FormRules,
  FormInstance,
  FormValidationResult,
  FormValidateCallback
} from 'element-plus'

const props = defineProps({
  detail: {
    type: Object,
    required: true
  },
  operationMode: {
    type: String,
    default: 'Edit'
  },
  platformList: {
    type: Array,
    default: () => []
  },
  showRootCateNode: {
    type: Boolean,
    default: 'false'
  },
  cateTreeData: {
    type: Array,
    default: () => []
  },
  treeProps: {
    type: Object
  }
})

const rules = reactive<FormRules>({
  parentId: [{ required: true, message: '请选择所属目录', trigger: 'change' }],
  platform: [{ required: true, message: '请选择所属平台', trigger: 'change' }],
  name: [{ required: true, message: '请输入名称,最大长度为20', trigger: 'blur' }]
})

const refForm = ref<FormInstance>()
function resetForm(): void {
  refForm.value.resetFields()
}

function validate(callback?: FormValidateCallback | undefined): FormValidationResult {
  return refForm.value.validate(callback)
}

const isFormDisabled = computed(
  () =>
    props.operationMode === 'View'
)

defineExpose({
  resetForm,
  validate
})

function handleNodeClick (data: Tree){
  props.detail.platform=data.platform;
}

</script>

<template>
  <el-form
    ref="refForm"
    :model="detail"
    :rules="rules"
    :disabled="isFormDisabled"
    label-width="80px"
  >

    <el-form-item label="目录名称" prop="name">
      <el-input v-model.trim="detail.name" maxlength="20" />
    </el-form-item>

    <el-form-item label="所属目录" prop="parentId" v-if="showRootCateNode">
      <el-tree-select v-model="detail.parentId" :data="cateTreeData" :props="treeProps" node-key="id"
        placeholder="所属目录" :render-after-expand="false" :check-strictly="true" @node-click="handleNodeClick">
      </el-tree-select>
    </el-form-item>
    <el-form-item label="所属平台" prop="platform" v-if="!showRootCateNode">
      <el-select v-model="detail.platform" placeholder="所属平台" >
        <el-option
          v-for="item in platformList"
          :key="item.value"
          :label="item.name"
          :value="item.value"
        />
      </el-select>
    </el-form-item>

  </el-form>
</template>

<style scoped>
.el-select {
  width: 100%;
}
</style>
