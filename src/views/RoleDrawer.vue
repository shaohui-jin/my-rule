<template>
  <el-drawer
    size="45%" @close="closeDrawer" :title="showView? '角色信息': '关联角色'">
    <query-list title="角色列表" :sidebarWidth="200">
        <template #toolbar-body>
          <div>
            <el-input
              v-model="searchVal"
              :suffix-icon="Search"
              placeholder="请输入编码/名称"
              @keydown.enter.stop="toSearch"
              style="width: 300px"
            />
          </div>
        </template>
        <template #sidebar>
           <div class="category-tree">
             <div class="category-tree-body">
               <el-scrollbar>
               <el-tree
                 :data="treeData"
                 :props="treeProps"
                 node-key="id"
                 @node-click="handleNodeClick"
                 default-expand-all
               />
              </el-scrollbar>
              </div>
           </div>
        </template>
        <template #body>
          <el-table
            :data="tableData"
            style="width: 100%"
            ref="tableRef"
            @select="selectCurrent"
            @select-all="selAll"
            @selection-change="selChange"
          >
            <el-table-column type="selection" :selectable="onSelection" width="55" />
            <el-table-column prop="code" label="角色编码" />
            <el-table-column prop="name" label="角色名称">
              <template #default="{ row }">
                {{ formatRole(row) }}
              </template>
            </el-table-column>
            <el-table-column prop="address" label="所属组织" v-if="showDepart" />
          </el-table>
        </template>
        <template #pagination>
            <el-pagination
              :current-page="pageNo"
              @update:current-page="onPageNoChange"
              :page-size="pageSize"
              @update:page-size="onPageSizeChange"
              layout="prev, pager, next"
              :total="total"
              background
              v-if="!showView"
            />
        </template>
    </query-list>
  </el-drawer>
</template>
<script lang="ts" setup>
import { Search } from '@element-plus/icons-vue'
import { computed, onMounted,ref,nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { http } from '@/utils/http'
import queryList from '@/components/layout/QueryTreeList.vue'
import { PageResult, RestResult } from '@/utils/http/types'
import { useRenderIcon } from '@/components/ReIcon/src/hooks'
const emit = defineEmits(['afterColse'])

const tableRef = ref('')

defineExpose({
  search
})

const props = defineProps({

  showDepart :{
    type: Object
  },
  relationId:{
    type: Number
  },
  relationType:{
    type: String
  },
  roleType:{
    type: String
  },
  showView:{
    type: Boolean,
    default: false
  },
  viewUrl:{
    type: String,
    default: '/view'
  }
 })

  const treeProps={
    label: "name",
    children: "children",
    id: "id"
  }

  const pageNo = ref(1)
  const pageSize = ref(10)
  const total = ref(0)
  const tableData=ref([])

  const tableChecked=ref([])
  const countCancel=ref(0)

  const treeData=ref([])

  const roleCategoryId=ref('')

  onMounted(() => {
    //search()
  })

  async function search() {
    roleCategoryId.value='';
    searchVal.value='';
    const params = {
      data:{
        
      }
    }
    const cateResult= await http.post<any, RestResult>('/umas/rbac/role-category/tree', params)
    treeData.value=cateResult.data
    searchRelation();
  }

 async function searchRelation(pNo = 1) {

    pageNo.value = pNo
    // let url='/umas/relation';

    // if(props.showView){
    //   url=url+props.viewUrl
    // }
    // url=url+'/'+props.roleType;

    let url = "/umas/rbac/relation/view"
    const params = {
      data:{
        relatedType: 'user',
        relationId: props.relationId,
        keyword: searchVal.value,
        page: pageNo.value,
        pageSize: pageSize.value,
        roleCategoryId:roleCategoryId.value=='' ? '': roleCategoryId.value
      }
    }
    const { data }= await http.post<any, PageResult>(url, params)
    tableData.value= data.records
    total.value = data.total;

    tableChecked.value=[];
    for(let i=0;i< tableData.value.length;++i){
      if(tableData.value[i].checked==true){
        tableChecked.value.push(tableData.value[i].id);
      }
    }
    nextTick(()=>{
      toggle(tableChecked.value);
    })
  }

function onPageSizeChange(newVal: number): void {
  pageSize.value = newVal
  searchRelation()
}
function onPageNoChange(newVal: number): void {
  pageNo.value = newVal
  searchRelation(newVal)
}


function toggle(selArr) {
   tableData.value.forEach(row => {
    selArr.forEach(item => {
      if (item==row.id) {
        tableRef.value.toggleRowSelection(row, true)
      }
    })
  })
}

const handleNodeClick = (data: Tree) => {
  roleCategoryId.value=data.id;
  searchRelation()
}

function onSelection(row,index){
  return row.cancelable && !props.showView
}

const handleClose = (done: () => void) => {
  console.log('关闭前')
}

function closeDrawer(){
  emit('afterColse');
}

// =======
const searchVal = ref('')
function toSearch() {
  searchRelation();
}

const multipleSelection = ref([])
const handleSelectionChange = val => {
  let arr = val.map(obj => obj.id)
  selectCurrent(multipleSelection, val)
  multipleSelection.value = val
}

function selectCurrent(selection, row) {
  if(props.showView){
    return ;
  }
  relationCmParam.relationId=props.relationId;
  relationCmParam.unChecked=[]
  relationCmParam.checked=[]
  if(selection.length==0){
    relationCmParam.unChecked.push(row.id);
  }else{
    if (tableChecked.value.indexOf(row.id) == -1) {
      relationCmParam.checked.push(row.id);
    }else{
      relationCmParam.unChecked.push(row.id);
    }
  }
  saveRelation(relationCmParam)
  tableChecked.value= selection.map(val => val.id)
}

let relationCmParam={
  relationId: '',
  unChecked: [],
  checked: []
}

function saveRelation(){
  http.post('/umas/relation/'+props.roleType, {
    data: relationCmParam
  })
  .then(res => {
    if(res.code == 200) {
      ElMessage.success({
        message: '保存成功'
      })
    }
  })
}

// 全选
function selAll(selection) {

  if(props.showView){
    return ;
  }
  relationCmParam.relationId=props.relationId;
  relationCmParam.unChecked=[]
  relationCmParam.checked=[]

  if (selection.length === tableData.value.length) {
    selection.forEach(row => {
      if (tableChecked.value.indexOf(row.id) == -1) {
        relationCmParam.checked.push(row.id);
      }
    })
    saveRelation(relationCmParam)
  } else {
    tableData.value.forEach(row => {
      if (row.cancelable) {
        relationCmParam.unChecked.push(row.id);
      }
    })
    saveRelation(relationCmParam)
  }
  tableChecked.value= selection.map(val => val.id)
}

function selChange(selection) {

  if (selection.length === total.value || selection.length === 0) return
  // 只计算
}

function formatRole(row){

  if(row.group==null || row.group==''){
     return row.name;
  }
  return row.name+'('+row.group+')';
}

</script>

<style lang="scss" scoped>

.query-list {
  margin: 5px;
}

.category-tree {
  height: 100%;
  display: flex;
  flex-direction: column;

  .category-tree-filter {
    padding: 10px;
    .el-input {
      width: 100%;
    }
  }
  .category-tree-body {
    flex: 1;
    overflow: auto;
    .el-scrollbar__view {
      display: flex;
      .el-tree {
        .el-tree__empty-text {
          position: relative;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          color: var(--el-text-color-secondary);
          font-size: var(--el-font-size-base);
        }
      }
    }
  }
}

</style>
