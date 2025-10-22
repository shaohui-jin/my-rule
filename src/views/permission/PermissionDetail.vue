<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { STATUS, toType, translate,formatDatetime } from '@/views/user/constant'

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
  permissionTypeList: {
    type: Array,
    default: () => []
  },
  platformList: {
    type: Array,
    default: () => []
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
  code: [{ required: true, message: '请输入编码,最大长度为100', trigger: 'blur' }],
  name: [{ required: true, message: '请输入名称,最大长度为20', trigger: 'blur' }],
  permissionType: [{ required: true, message: '请选择类型', trigger: 'change' }],
  platform: [{ required: true, message: '请选择所属平台', trigger: 'change' }],
  categoryId: [{ required: true, message: '请选择所属目录', trigger: 'change' }],
  remark: [{ required: false, message: '备注最大长度为100', trigger: 'blur' }],
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

    <el-form-item label="编码" prop="code">
      <el-input v-model.trim="detail.code" minlength="1" maxlength="100"/>
    </el-form-item>


    <el-form-item label="名称" prop="name">
      <el-input v-model.trim="detail.name" maxlength="20" />
    </el-form-item>

    <el-form-item label="类型" prop="permissionType">
      <el-select v-model="detail.permissionType" placeholder="类型" >
        <el-option
          v-for="item in permissionTypeList"
          :key="item.value"
          :label="item.name"
          :value="Number(item.value)"
        />
      </el-select>
    </el-form-item>
    <el-form-item label="所属平台" prop="platform">
      <el-select v-model="detail.platform" placeholder="所属平台" >
        <el-option
          v-for="item in platformList"
          :key="item.value"
          :label="item.name"
          :value="item.value"
        />
      </el-select>
    </el-form-item>
    <el-form-item label="所属目录" prop="categoryId">
      <el-tree-select v-model="detail.categoryId" :data="cateTreeData" :props="treeProps"
      node-key="id" placeholder="所属目录" :render-after-expand="false"
      @node-click="handleNodeClick" :check-strictly="true" />
    </el-form-item>
    <el-form-item label="备注" prop="remark">
      <el-input v-model.trim="detail.remark" maxlength="100" />
    </el-form-item>

  </el-form>
</template>

<style scoped>
.el-select {
  width: 100%;
}
</style>
