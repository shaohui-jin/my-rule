<template>
  <el-form
    ref="formRef"
    :model="form"
    :rules="rules"
    label-width="100px"
    class="function-detail-form"
  >
    <el-form-item label="函数编码" prop="funcCode">
      <el-input
        v-model="form.funcCode"
        placeholder="请输入函数编码"
        :disabled="props.operationMode === 'EDIT'"
        @blur="handleTrim('funcCode')"
      />
    </el-form-item>
    <el-form-item label="函数名称" prop="funcName">
      <el-input
        v-model="form.funcName"
        placeholder="请输入函数名称"
        @blur="handleTrim('funcName')"
      />
    </el-form-item>
    <el-form-item label="函数类型" prop="funcCategory">
      <el-select
        v-model="form.funcCategory"
        placeholder="请选择函数类型"
        style="width: 100%"
        :disabled="props.operationMode === 'EDIT'"
      >
        <el-option
          v-for="item in functionTypeOptions"
          :key="item.value"
          :label="item.name"
          :value="item.value"
        />
      </el-select>
    </el-form-item>
    <el-form-item label="函数描述" prop="funcDesc">
      <el-input
        v-model="form.funcDesc"
        type="textarea"
        :rows="4"
        placeholder="请输入函数描述"
        @blur="handleTrim('funcDesc')"
      />
    </el-form-item>
    <el-form-item label="函数状态" prop="functionStatus">
      <el-select
        v-model="form.functionStatus"
        placeholder="请选择函数状态"
        style="width: 100%"
        :disabled="props.operationMode !== 'EDIT'"
      >
        <el-option label="启用(画布可显)" value="ENABLED" />
        <el-option label="下架(画布不显示)" value="OFF_SHELVES" />
        <!-- <el-option label="待发布" value="ENABLED" /> -->
      </el-select>
    </el-form-item>
    <el-form-item label="函数分类:" prop="categoryId">
      <el-tree-select
        v-model="form.categoryId"
        :data="functionCateData"
        value-key="id"
        :render-after-expand="false"
        style="width: 240px"
        :props="{ label: 'name', value: 'id' }"
      ></el-tree-select>
    </el-form-item>
    <el-form-item label="是否几何函数" prop="isGeometry">
      <el-radio-group v-model="form.isGeometry" style="display: flex; flex-direction: row">
        <el-radio :label="0">否</el-radio>
        <el-radio :label="1">是</el-radio>
      </el-radio-group>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { http } from '@/axios'

const props = defineProps({
  detail: {
    type: Object,
    default: () => ({})
  },
  operationMode: {
    type: String,
    default: 'ADD'
  },
  functionCateData: {
    type: Array,
    default: []
  }
})

const formRef = ref<FormInstance>()
const form = reactive({
  funcCode: '',
  funcName: '',
  funcCategory: '',
  funcDesc: '',
  functionStatus: 'ENABLED',
  isGeometry: 0,
  categoryId: ''
})

const functionTypeOptions = ref([])

const rules = {
  funcCode: [
    { required: true, message: '请输入函数编码', trigger: 'blur' },
    { max: 50, message: '长度不能超过 50 个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '只能输入英文、下划线和数字', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: any) => {
        if (value && value.trim() !== value) {
          form.funcCode = value.trim()
        }
        callback()
      },
      trigger: 'blur'
    }
  ],
  funcName: [
    { required: true, message: '请输入函数名称', trigger: 'blur' },
    { max: 50, message: '长度不能超过 50 个字符', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: any) => {
        if (value && value.trim() !== value) {
          form.funcName = value.trim()
        }
        callback()
      },
      trigger: 'blur'
    }
  ],
  funcCategory: [{ required: true, message: '请选择函数类型', trigger: 'change' }],
  funcDesc: [
    { required: true, message: '请输入函数描述', trigger: 'blur' },
    { max: 250, message: '长度不能超过 250 个字符', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: any) => {
        if (value && value.trim() !== value) {
          form.funcDesc = value.trim()
        }
        callback()
      },
      trigger: 'blur'
    }
  ],
  functionStatus: [{ required: true, message: '请选择函数状态', trigger: 'change' }],
  categoryId: [{ required: true, message: '请选择函数分类', trigger: 'change' }],
  isGeometry: [{ required: true, message: '请选择是否几何函数', trigger: 'change' }]
}

async function fetchDict(): Promise<void> {
  const { data } = await http.post({
    url: '/umas/common/dict/get',
    data: {
      codes: ['FUNCTION_TYPE']
    }
  })
  if (data.length > 0) {
    functionTypeOptions.value = data[0]
  }
}

onMounted(() => {
  fetchDict()
})

watch(
  () => props.detail,
  val => {
    if (val) {
      form.funcCode = val.funcCode || ''
      form.funcName = val.funcName || ''
      form.funcCategory = val.funcCategory || ''
      form.funcDesc = val.funcDesc || ''
      form.functionStatus = val.functionStatus || 'ENABLED'
      form.categoryId = val.categoryId || ''
      form.isGeometry = val.isGeometry ?? 0
    }
  },
  { immediate: true }
)

const validate = (callback: (isValid: boolean) => void) => {
  formRef.value?.validate(valid => {
    if (valid) {
      // 将表单数据复制到detail对象中，并自动去除首尾空格
      Object.assign(props.detail, {
        funcCode: form.funcCode.trim(),
        funcName: form.funcName.trim(),
        funcCategory: form.funcCategory,
        funcDesc: form.funcDesc.trim(),
        functionStatus: form.functionStatus,
        categoryId: form.categoryId,
        isGeometry: form.isGeometry
      })
    }
    callback(valid)
  })
}

const resetForm = () => {
  formRef.value?.resetFields()
  Object.assign(form, {
    funcCode: '',
    funcName: '',
    funcCategory: '',
    funcDesc: '',
    functionStatus: 'ENABLED',
    isGeometry: 0,
    categoryId: ''
  })
}

const handleTrim = (field: string) => {
  if (form[field] && typeof form[field] === 'string' && form[field].trim() !== form[field]) {
    form[field] = form[field].trim()
  }
}

defineExpose({
  validate,
  resetForm
})
</script>

<style lang="scss">
.function-detail-form {
  padding: 20px;
}

// 确保下拉选项在最上层，高于弹窗
:deep(.el-select-dropdown) {
  z-index: 999999 !important;
  position: fixed !important;
}

// 确保下拉选项的容器也在最上层
:deep(.el-select) {
  .el-select__popper {
    z-index: 999999 !important;
  }
}
</style>
