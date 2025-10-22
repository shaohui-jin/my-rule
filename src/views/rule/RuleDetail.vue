<template>
  <div class="rule-detail">
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
      class="rule-form"
    >
      <el-form-item label="规则编码" prop="ruleCode">
        <el-input
          v-model="form.ruleCode"
          placeholder="请输入规则编码"
          :disabled="props.operationMode === 'EDIT'"
        />
      </el-form-item>
      <el-form-item label="规则名称" prop="ruleName">
        <el-input v-model="form.ruleName" placeholder="请输入规则名称" />
      </el-form-item>
      <el-form-item label="规则类型" prop="ruleType">
        <el-select v-model="form.ruleType" placeholder="请选择规则类型" style="width: 100%" disabled>
          <el-option
            v-for="item in ruleTypeOptions"
            :key="item.value"
            :label="item.name"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="业务场景" prop="sceneCategory">
        <el-select v-model="form.sceneCategory" placeholder="请选择业务场景" style="width: 100%" :disabled="props.operationMode === 'EDIT'">
          <el-option
            v-for="item in sceneCategoryOptions"
            :key="item.value"
            :label="item.name"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="规则描述" prop="ruleDesc">
        <el-input
          v-model="form.ruleDesc"
          type="textarea"
          :rows="3"
          placeholder="请输入规则描述"
        />
      </el-form-item>
      <el-form-item label="规则状态" prop="ruleStatus">
        <el-select v-model="form.ruleStatus" placeholder="请选择规则状态" style="width: 100%" disabled>
          <el-option label="启用" value="ENABLED" />
        </el-select>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { http } from '@/utils/http'
import { RestResult } from '@/utils/http/types'

const props = defineProps({
  detail: {
    type: Object,
    default: () => ({})
  },
  operationMode: {
    type: String,
    default: 'Edit'
  }
})

const formRef = ref<FormInstance>()
const form = reactive({
  ruleCode: '',
  ruleName: '',
  ruleType: 'module',
  sceneCategory: '',
  ruleDesc: '',
  ruleStatus: 'ENABLED'
})

const ruleTypeOptions = ref([])
const sceneCategoryOptions = ref([])

const rules = {
  ruleCode: [
    { required: true, message: '请输入规则编码', trigger: 'blur' },
    { max: 50, message: '长度不能超过 50 个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '只能输入英文、下划线和数字', trigger: 'blur' }
  ],
  ruleName: [
    { required: true, message: '请输入规则名称', trigger: 'blur' },
    { max: 100, message: '长度不能超过 100 个字符', trigger: 'blur' }
  ],
  ruleType: [
    { required: true, message: '请选择规则类型', trigger: 'change' }
  ],
  sceneCategory: [
    { required: true, message: '请选择业务场景', trigger: 'change' }
  ],
  ruleDesc: [
    { required: true, message: '请输入规则描述', trigger: 'blur' },
    { max: 5000, message: '长度不能超过 5000 个字符', trigger: 'blur' }
  ]
}

async function fetchDict(): Promise<void> {
  const { data } = await http.post<any, RestResult>('/umas/common/dict/get', {
    data: {
      codes: ['RULE_TYPE', 'RULE_BUSINESS']
    }
  })
  if (data.length > 0) {
    ruleTypeOptions.value = data[0]
    sceneCategoryOptions.value = data[1]
  }
}

onMounted(() => {
  fetchDict()
})

watch(
  () => props.detail,
  (val) => {
    if (val) {
      form.ruleCode = val.ruleCode || ''
      form.ruleName = val.ruleName || ''
      form.ruleType = val.ruleType || 'module'
      form.sceneCategory = val.sceneCategory || ''
      form.ruleDesc = val.ruleDesc || ''
      form.ruleStatus = val.ruleStatus || 'ENABLED'
    }
  },
  { immediate: true }
)

const validate = (callback: (isValid: boolean) => void) => {
  formRef.value?.validate((valid) => {
    if (valid) {
      // 将表单数据复制到detail对象中
      Object.assign(props.detail, {
        ruleCode: form.ruleCode,
        ruleName: form.ruleName,
        ruleType: form.ruleType,
        sceneCategory: form.sceneCategory,
        ruleDesc: form.ruleDesc,
        ruleStatus: form.ruleStatus
      })
    }
    callback(valid)
  })
}

const resetForm = () => {
  formRef.value.resetFields()
  Object.assign(form, {
    ruleCode: '',
    ruleName: '',
    ruleType: '',
    sceneCategory: '',
    ruleDesc: '',
    ruleStatus: 'ENABLED'
  })
}

defineExpose({
  validate,
  resetForm
})
</script>

<style lang="scss" scoped>
.rule-detail {
  padding: 20px;
  
  .rule-form {
    max-width: 800px;
    margin: 0 auto;
  }
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