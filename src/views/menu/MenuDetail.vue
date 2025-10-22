<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch,nextTick } from 'vue'
import {FormInstance, FormRules, FormValidateCallback, FormValidationResult} from 'element-plus'
import { http } from '@/utils/http'
import { PageResult } from '@/utils/http/types'
import { ElMessage } from 'element-plus'


const refForm = ref<FormInstance>()
const props = defineProps({
  detail: {
    type: Object,
    required: true
  },
  platformList: {
    type: Array,
    default: () => []
  },
  operationMode: {
    type: String,
    default: 'Edit'
  },
  showRootNode: {
    type: Boolean,
    default: 'false'
  },
  treeProps: {
    type: Object
  },
  menuTree: {
    type: Array,
    default: () => []
  },
})

defineExpose({
  resetForm,
  validate
})

watch(props, (newValue, oldValue) => {

})

function resetForm(): void {
  refForm.value.resetFields()
}

function validate(callback?: FormValidateCallback | undefined): FormValidationResult {
  return refForm.value.validate(callback)
}

const rules = reactive<FormRules>({
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入编码', trigger: 'blur' }],
  platform: [{ required: true, message: '请选择所属平台', trigger: 'change' }],
  parentId: [{ required: true, message: '请选择父级菜单', trigger: 'blur' }]
})

const selectTreeRef=ref<InstanceType<typeof ElTree>>()

function handleNodeClick (data: Tree){
  if(levelLimit(data.id)){
    selectTreeRef.value.setCurrentNode(data.parentId)
    props.detail.parentId=data.parentId
    return ;
  }
  props.detail.platform=data.platform;
  if(props.operationMode !='Edit'){
    props.detail.code=data.code+'_';
  }
  if(props.operationMode =='Edit' && data.id==props.detail.id){
    ElMessage.error({
      message: '父级菜单不允许选择为当前菜单,请重新选择'
    })
    nextTick(()=>{
      props.detail.parentId=null
      selectTreeRef.value!.setCurrentKey(data.parentId);
    })
    return true;
  }
}


function levelLimit(id){

   let level=selectTreeRef.value.getNode(id).level;
   if(level==4){
     ElMessage.error({
       message: '菜单允许最大4级，目前已经4级'
     })
     return true;
   }
   return false;
}
</script>
<template>
  <el-form ref="refForm" :model="detail" :rules="rules" label-width="80px">
    <el-form-item label="所属平台" prop="platform" v-if="!showRootNode">
      <el-select v-model="detail.platform" placeholder="请选择">
        <el-option v-for="item in platformList" :key="item.value" :label="item.name" :value="item.value" />
      </el-select>
    </el-form-item>
    <el-form-item label="父级菜单" prop="parentId" v-if="showRootNode">
      <el-tree-select v-model="detail.parentId" :data="menuTree" :props="treeProps" node-key="id"
        placeholder="父级菜单" :render-after-expand="false" :check-strictly="true"
        ref="selectTreeRef"
        @node-click="handleNodeClick">
      </el-tree-select>
    </el-form-item>
    <el-form-item label="编码" prop="code">
      <el-input v-model.trim="detail.code" maxlength="100" />
    </el-form-item>
    <el-form-item label="名称" prop="name">
      <el-input v-model.trim="detail.name" maxlength="20" />
    </el-form-item>


    <el-form-item label="路径">
      <el-input v-model.trim="detail.url" />
    </el-form-item>
    <el-form-item label="备注">
      <el-input v-model.trim="detail.remark" maxlength="100" />
    </el-form-item>
  </el-form>
</template>

<style scoped>
.el-select {
  width: 100%;
}
</style>
