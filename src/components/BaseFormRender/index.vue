<template>
  <el-form
    :model="formData"
    :disabled="disabled"
    :label-width="labelWidth"
    class="simple-form-renderer"
    ref="formRef"
    @submit.prevent
  >
    <el-form-item v-for="(field, index) in fields" :key="field.id" :prop="field.id" :rules="field.rules">
      <!-- 自定义标签插槽 -->
      <template #label>
        <el-tooltip
          v-if="field.attributes?.paramSubType"
          :content="field.attributes.paramSubType"
          placement="top"
        >
          <div class="param-label-col">
            <span class="param-label">{{ field.label }}</span>
            <span class="param-type-under">({{ field.attributes?.paramType }})</span>
          </div>
        </el-tooltip>
        <template v-else>
          <div class="param-label-col">
            <span class="param-label">{{ field.label }}</span>
            <span class="param-type-under">({{ field.attributes?.paramType }})</span>
          </div>
        </template>
      </template>

      <div class="form-field-container">
        <div class="main-control">
          <!-- 手动输入模式 -->
          <template v-if="inputMode === 'manual'">
            <!-- select 类型特殊处理，自动渲染下拉选项 -->
            <el-select
              v-if="field.type === 'select'"
              v-model="formData[field.id]"
              :placeholder="field.placeholder"
              :disabled="field.disabled || disabled"
              filterable
              clearable
              allow-create
              default-first-option
              :multiple="field.attributes.multiple"
              @change="handleFieldChange(field.id, $event)"
            >
              <el-option
                v-for="opt in (
                  field.attributes.defaultOptions
                  ? [
                    ...paramList.filter(item => item.type === field.attributes.paramType),
                    ...field.options
                  ]
                  : field.options || []
                )"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              >
                <el-tooltip
                  v-if="opt.desc"
                  :content="opt.desc"
                  :disabled="!opt.desc"
                  placement="top"
                  :show-after="500"
                  popper-class="field-desc-tooltip"
                  :popper-style="{ maxWidth: '300px', wordWrap: 'break-word', wordBreak: 'break-all' }"
                >
                  <div>
                    <span style="float: left">
                      {{ opt.name }}
                      <span>{{ opt.label }}</span>
                    </span>
                    <span style="float: right;">
                      {{ opt.type }}
                    </span>
                  </div>
                </el-tooltip>
              </el-option>
            </el-select>
            <!-- 其他类型 -->
            <component
              v-else
              :is="getComponent(field.type)"
              v-model="formData[field.id]"
              v-bind="field.attributes"
              :placeholder="field.placeholder"
              :disabled="field.disabled || disabled"
              :type="['textarea', 'function'].includes(field.type) ? 'textarea' : field.attributes?.inputType || 'text'"
              :nodeData="nodeData"
              :workflowData="workflowData"
              @change="handleFieldChange(field.id, $event)"
            />
          </template>
          <!-- 节点选择模式 -->
          <template v-else-if="inputMode === 'node'">
            <el-select
              v-model="formData[field.id]"
              placeholder="请选择节点"
              :disabled="disabled"
              filterable
              clearable
              @change="handleFieldChange(field.id, $event)"
            >
              <el-option
                v-for="opt in nodeOptions || []"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>
          </template>
          <el-tooltip
            v-if="field.attributes?.desc"
            :content="field.attributes.desc"
            placement="top"
            :show-after="500"
            popper-class="field-desc-tooltip"
            :popper-style="{ maxWidth: '300px', wordWrap: 'break-word', wordBreak: 'break-all' }"
          >
            <div class="field-attributes-desc">
              {{ field.attributes.desc }}
            </div>
          </el-tooltip>
        </div>
        <!-- 模式切换按钮 -->
         <!--showModeToggle为true是入参-->
           <template v-if="showModeToggle">
            <div v-if="field.attributes?.paramType === 'table'">
              <el-button  class="mode-toggle-btn" :disabled="true" @click="$emit('mode-change')">
                <el-icon><SwitchIcon /></el-icon>
              </el-button>
            </div>
            <div v-else>
              <el-tooltip
                content="数据类型切换"
                placement="top"
                :show-after="500"
                popper-class="field-desc-tooltip"
                :popper-style="{ maxWidth: '300px', wordWrap: 'break-word', wordBreak: 'break-all' }"
              >
                <el-button  class="mode-toggle-btn" @click="$emit('mode-change')">
                  <el-icon><SwitchIcon /></el-icon>
                </el-button>
              </el-tooltip>
            </div>
           </template>
           <template v-else>
            <el-button  class="mode-toggle-btn" :disabled="inputMode === 'node'" @click="$emit('mode-change')">
              <el-icon><SwitchIcon /></el-icon>
            </el-button>
           </template>

      </div>
    </el-form-item>
    <div v-if="fields.length === 0" class="form-desc">-</div>
  </el-form>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import {
  ElForm,
  ElFormItem,
  ElInput,
  ElSelect,
  ElSwitch,
  ElInputNumber,
  ElOption,
  ElButton,
  ElIcon,
  ElTooltip
} from 'element-plus'
import { Switch as SwitchIcon } from '@element-plus/icons-vue'
import BaseFunctionExpression from '@/components/BaseFunctionExpression/index.vue'
import { useParamStore } from '@/store/modules/params'

const paramStore = useParamStore()
const props = defineProps({
  formJson: {
    type: Object,
    default: () => ({
      formConfig: {},
      widgetList: []
    })
  },
  disabled: {
    type: Boolean,
    default: false
  },
  labelWidth: {
    type: String,
    default: '70px'
  },
  showModeToggle: {
    type: Boolean,
    default: false
  },
  inputMode: {
    type: String,
    default: 'manual'
  },
  nodeOptions: {
    type: Array,
    default: () => []
  },
  nodeData: {
    type: Object
  },
  workflowData: {
    type: Object
  },
})

const emit = defineEmits(['update:modelValue', 'change', 'mode-change'])

// 表单引用
const formRef = ref()

// 表单数据
const formData = ref({})


// 组件映射表
const componentMap = {
  input: ElInput,
  select: ElSelect,
  switch: ElSwitch,
  inputNumber: ElInputNumber,
  textarea: ElInput, // textarea 也用 ElInput
  function: BaseFunctionExpression // function 用自定义组件，支持不同的类型
}

// 获取组件
const getComponent = type => {
  return componentMap[type] || ElInput
}

const paramList = ref([])

// 处理字段配置
const fields = computed(() => {
  // console.log('props.formJson', props.formJson)
  // eslint-disable-next-line vue/no-side-effects-in-computed-properties
  // console.log('props.formJson.widgetList',props.nodeOptions,props.formJson.widgetList)
  // console.log('fields====', fields.value)
  props.formJson.widgetList.forEach((item, index) => {
    item.options = item.options?.map(e => ({ ...e, type: item.attributes.paramType }))
  })
  // console.log('portSelects.value====', portSelects)
  return (
    props.formJson.widgetList?.map((widget, index) => ({
      id: widget.id || `field_${index}`, // 为没有id的字段生成唯一id
      type: widget.type,
      label: widget.attributes?.label || widget.label,
      placeholder: widget.attributes?.placeholder,
      disabled: widget.attributes?.disabled,
      rules: widget.rules || [],
      attributes: widget.attributes || {},
      defaultValue: props.inputMode === 'node' && !widget.defaultValue ? '' : widget.defaultValue,
      options: widget.options || []
    })) || []
  )
})

// 自动填充默认值
watch(
  fields,
  newFields => {
    // console.log('field==watch==', newFields, portSelects)
    newFields.forEach((field,index) => {
      // console.log('field====', field)
      if (
        formData.value[field.id] === undefined &&
        field.defaultValue !== undefined &&
        field.defaultValue !== null &&
        field.defaultValue !== ''
      ) {
        formData.value[field.id] = field.defaultValue
        // console.log('field.defaultValue', field.defaultValue)
      }
      // 在ifelse的情况下需要判断是否有下拉列表如果没有则不能赋值

      // console.log("====11=====")
      // console.log('formData.value[field.id]===', formData.value[field.id])
      // 20250826修复在迭代器连接的两个节点删除一个后，抽屉面板的下拉框无法自动选中的问题
      // if(!formData.value[field.id] && props.inputMode === 'node') {
      //   formData.value[field.id] = field.defaultValue = (portSelects[index][0] && portSelects[index][0].value)
      // }
    })
  },
  { immediate: true }
)

// 处理字段变化
const handleFieldChange = (fieldId, value) => {
  emit('change', { fieldId, value, formData: formData.value })
}

// 监听数据变化
watch(
  formData,
  newData => {
    for (const key in newData) {
      // console.log('newData[key]==',JSON.parse(JSON.stringify(newData[key])), JSON.parse(JSON.stringify(formData.value)))
      if(!newData[key])return // 20250827修改输入框无法清除值问题bug245362
      // console.log("=====formDaga====")
      emit('change', { fieldId: key, value: newData[key], formData: formData.value })
    }
  },
  { deep: true }
)

// 监听外部数据变化
watch(
  () => props.formJson,
  () => {
    // 重置表单数据
    formData.value = {}
  },
  { deep: true }
)

// 暴露方法 - 兼容原有 FormRenderer 的 API
defineExpose({
  // 获取表单数据
  getFormData: async () => {
    // eslint-disable-next-line no-useless-catch
    try {
      await formRef.value?.validate()
      return formData.value
    } catch (error) {
      throw error
    }
  },
  // 设置表单数据
  setFormData: data => {
    formData.value = { ...data }
  },
  // 重置表单
  resetForm: () => {
    formData.value = {}
    formRef.value?.resetFields()
  },
  // 设置表单配置 - 兼容原有 API
  setFormJson: json => {
    // 这里可以处理表单配置的更新
    console.log('setFormJson called with:', json)
  }
})
</script>

<style lang="scss" scoped>
.simple-form-renderer {
  padding: 0;

  :deep(.el-form-item) {
    margin-bottom: 18px;
    display: flex;
    align-items: flex-start;
  }

  /* 调整表单项布局 */
  :deep(.el-form-item__label) {
    padding: 0;
    height: auto;
    line-height: 1.2;
    text-align: right;
    flex-shrink: 0;
    position: relative; /* 添加相对定位 */
  }

  /* 移除 element-plus 的默认 margin */
  :deep(.el-form-item__content) {
    margin-left: 0 !important;
    padding-left: 12px; /* 固定的左边距 */
    flex: 1;
    min-width: 0;
    display: flex;
    justify-content: flex-start;
    position: relative; /* 添加相对定位 */
  }

  /* 确保所有输入控件宽度一致 */
  :deep(.el-input),
  :deep(.el-select),
  :deep(.el-input-number) {
    width: 100%;
  }

  /* 修复 element-plus 的一些默认样式 */
  :deep(.el-form-item__label-wrap) {
    width: 100%;
  }

  :deep(.el-form-item__label::before),
  :deep(.el-form-item__label::after) {
    display: none !important;
  }

  :deep(.el-select) {
    width: 100% !important;
    min-width: 100px;
    max-width: 100%;
    flex-shrink: 0;
  }

  :deep(.el-select__tags) {
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
    flex-wrap: wrap;
    overflow: hidden;
  }

  :deep(.el-select__input) {
    width: 100% !important;
    min-width: 0 !important;
  }
}


.form-field-container {
  flex: 1;
  min-width: 0;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 8px;
}

.main-control {
  flex: 1;
  min-width: 0;
}

.mode-toggle-btn {
  margin-top: 2px;
  flex-shrink: 0;
  height: 30px;
  padding: 6px;
  width: 30px;
}

/* 默认标签样式 */
.default-label {
  font-size: 14px;
  font-weight: 500;
  line-height: 32px;
  display: block;
  text-align: right;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  user-select: none;
}

/* 带类型信息的标签样式 */
.param-label-col {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  user-select: none;
  gap: 1px;
  padding: 4px 0;
  width: 100%; /* 确保宽度撑满 */
  min-width: 0; /* 允许内容收缩 */
}

.param-label {
  color: #333;
  font-size: 13px;
  font-weight: 500;
  text-align: right;
  width: 100%; /* 确保宽度撑满 */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  user-select: none;
  line-height: 1.2;
}

.param-type-under {
  color: #aaa;
  font-size: 11px;
  text-align: right;
  width: 100%; /* 确保宽度撑满 */
  user-select: none;
  line-height: 1;
}

/* 字段描述文案样式 */
.field-attributes-desc {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
  line-height: 1.4;
  word-break: break-all;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
}



/* 全局tooltip样式覆盖 */
:global(.field-desc-tooltip) {
  max-width: 300px !important;
}

:global(.field-desc-tooltip .el-tooltip__content) {
  max-width: 300px !important;
  word-wrap: break-word !important;
  word-break: break-all !important;
  white-space: pre-wrap !important;
  line-height: 1.4 !important;
}
</style>
