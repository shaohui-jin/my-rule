<template>
  <div class="decision-table-param-edit-panel">
    <!-- 头部 -->
    <div class="panel-header">
      <div class="header-title">参数列表</div>
      <div class="search-container">
        <el-input
          v-model="searchParamKey"
          class="search-input"
          placeholder="搜索参数"
          :prefix-icon="Search"
          @input="searchAll"
        />
        <div v-if="searchParamShow" class="search-result-container">
          <template v-if="_searchData.length > 0">
            <div
              class="search-result-item"
              v-for="(l, i) in _searchData"
              :key="i"
            >
              <p class="search-result-item__title">{{ l.name }}</p>
              <p
                class="search-result-item__value"
                v-for="(_l, _i) in l.children"
                :key="_i"
                @click="handleClickItem(_l.code, 'search-result')">
                <span>{{ _l.code }}</span>
                <span>{{ _l.type || 'number' }}</span>
              </p>
            </div>
          </template>
          <el-empty v-else description="暂无数据" style="padding: 0"/>
        </div>
      </div>
    </div>

    <!-- 中间容器 -->
    <div class="content-container">
      <div class="express-dialog-container">
        <div class="express-dialog-container-item">
          <p class="body-item__title">参数列表</p>
          <div class="body-item__container">
            <div class="container-title">
              <el-radio-group size="small" v-model="paramsRadio">
                <el-radio-button :label="0">上游节点</el-radio-button>
                <el-radio-button :label="1">参数管理</el-radio-button>
                <el-radio-button :label="2" v-show="showCommonParam">通用参数</el-radio-button>
                <el-radio-button :label="3">画布参数</el-radio-button>
              </el-radio-group>
            </div>
            <div class="container-body">
              <el-tree
                ref="treeRef"
                :filter-node-method="filterNode"
                style="max-width: 600px"
                :data="$props.treeData[paramsRadio]"
                :props="{ children: 'children', label: 'name' }"
                @node-click="e => handleClickItem(e.code, 'express-dialog-input')"
              >
                <template #default="{ data }">
                    <span class="name">
                      <template v-if="!data.desc">
                        {{ data.name }}
                      </template>
                      <template v-else>
                        <el-tooltip
                          effect="dark"
                          :content="data.desc"
                          placement="top"
                        >
                          {{ data.name }}
                        </el-tooltip>
                      </template>
                      <span style="color: #989EAA; margin-left: 4px;">{{ data.code }}</span>
                    </span>
                  <span class="type">
                      {{ data?.children ? '' : data.type }}
                    </span>
                </template>
              </el-tree>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 参数配置表单 -->
    <div class="param-form">
      <div class="form-item">
        <label class="form-label">参数名：</label>
        <el-input
          v-model="internalParamData.paramName"
          class="form-input"
          placeholder="请输入参数名"
        />
        <div v-if="paramNameError" class="error-message">{{ paramNameError }}</div>
      </div>

      <div class="form-item">
        <label class="form-label">参数代码：</label>
        <el-input
          v-model="internalParamData.paramCode"
          class="form-input"
          placeholder="请输入参数代码"
          @input="validateParamCode"
        />
        <div v-if="paramCodeError" class="error-message">{{ paramCodeError }}</div>
      </div>

      <div class="form-item">
        <label class="form-label">类型：</label>
        <el-select
          v-model="internalParamData.paramType"
          class="form-select"
        >
          <el-option value="string" label="字符串" />
          <el-option value="number" label="数字" />
          <el-option value="boolean" label="布尔值" />
        </el-select>
      </div>

      <div class="form-item">
        <label class="form-label">参数值：</label>
        <el-input
          v-model="internalParamData.paramValue"
          class="form-input"
          placeholder="请输入参数值"
          :disabled="true"
          :class="{ 'disabled': true }"
        />
      </div>
    </div>

    <!-- 底部按钮 -->
    <div class="panel-footer">
      <el-button class="footer-btn confirm-btn" @click="handleConfirm">确定</el-button>
      <el-button class="footer-btn cancel-btn" @click="handleCancel">取消</el-button>
    </div>
  </div>
</template>

<script>
import { Search } from '@element-plus/icons-vue'

export default {
  name: 'DecisionTableParamEditPanel',
  emits: ['close', 'confirm'],
  props: {
    paramData: {
      type: Object,
      default: () => ({})
    },
    partList: {
      type: Array,
      default: () => []
    },
    tableList: {
      type: Array,
      default: () => []
    },
    paramList: {
      type: Array,
      default: () => []
    },
    canvasList: {
      type: Array,
      default: () => []
    },
    treeData: {
      type: Array,
      default: () => [[], [], [], []]
    }
  },
  data() {
    return {
      searchText: '',
      paramNameError: '',
      paramCodeError: '',
      // 内部数据，避免与 props 重名
      internalParamData: {
        paramName: '',
        paramType: '',
        paramCode: '',
        isCustom: 1,
        paramValue: ''
      },
      // 参数列表相关数据
      paramsRadio: 0,
      searchParamKey: '', // 搜索参数的key
      searchParamShow: false, // 是否显示搜索结果
      _searchData: [], // 搜索结果数据
      // 新增的数据
      showCommonParam: false
    }
  },
  methods: {
    handleSearch() {
      console.log('搜索:', this.searchText)
      // 这里可以添加搜索逻辑
    },
    validateParamName() {
      // 只能输入字母、数字或下划线，且必须以字母开头
      const pattern = /^[a-zA-Z][a-zA-Z0-9_]*$/
      if (!pattern.test(this.internalParamData.paramName)) {
        this.paramNameError = '字母/数字/下划线，以字母开头'
      } else {
        this.paramNameError = ''
      }
    },
    validateParamCode() {
    
      this.paramCodeError = ''
      // 参数代码只能包含字母、数字或下划线，而且需要字母开头
      const pattern = /^[a-zA-Z][a-zA-Z0-9_]*$/
      if (!pattern.test(this.internalParamData.paramCode)) {
        this.paramCodeError = '字母/数字/下划线，以字母开头'
      } else {
        this.paramCodeError = ''
      }
    },
    handleConfirm() {
      // 验证参数代码
      if (this.paramCodeError) {
        alert('请先修正参数代码格式')
        return
      }
      
      // 根据界面中的输入框和下拉框重新生成数据
      const confirmData = {
        paramName: this.internalParamData.paramName || '',
        paramType: this.internalParamData.paramType || '',
        paramCode: this.internalParamData.paramCode || '',
        isCustom: this.internalParamData.isCustom || 1
        // 不传递 paramValue，因为它只是展示作用
      }
      
      // 输出修改后的数据
      console.log('修改后的参数数据:', confirmData)
      
      // 发出确认事件，传递数据给父组件
      this.$emit('confirm', confirmData)
      
      // 关闭页面
      this.$emit('close')
    },
    handleCancel() {
      // 发出关闭事件
      this.$emit('close')
    },
    resetForm() {
      this.internalParamData = {
        paramName: '',
        paramType: '',
        paramCode: '',
        isCustom: 1,
        paramValue: ''
      }
      this.paramNameError = ''
      this.paramCodeError = ''
      this.searchText = ''
    },
    // 处理参数项点击
    handleClickItem(code, targetId) {
      console.log('点击参数项:', code, targetId)
      
      // 查找选中的参数数据
      let selectedParam = null
      
      // 如果是点击搜索结果，从搜索结果数据中查找
      if (targetId === 'search-result') {
        for (let category of this._searchData) {
          if (category.children) {
            const found = category.children.find(item => item.code === code)
            if (found) {
              selectedParam = found
              break
            }
          }
        }
      } else {
        // 根据当前选中的radio类型查找对应的数据
        let searchData = []
        if (this.paramsRadio === 0) {
          searchData = this.$props.partList
        } else if (this.paramsRadio === 1) {
          searchData = this.$props.paramList
        } else if (this.paramsRadio === 2) {
          searchData = this.$props.tableList
        } else if (this.paramsRadio === 3) {
          searchData = this.$props.canvasList
        }
        
        let allData = [];
        for (let item of searchData) {
          if (item.children?.length) {
            for (let child of item.children) {
              allData.push(child);
            }
          }
          if (!item.hasOwnProperty('children')) {
            allData.push(item);
          }
        }
          
        const found = allData.find(item => item.code === code)
        if (found) {
          selectedParam = found
        }
      }
      
      if (selectedParam) {
        // 将选中的参数信息填充到表单中
        this.internalParamData.paramName = selectedParam.name || ''
        this.internalParamData.paramCode = selectedParam.code || ''
        
        // 类型映射处理
        let mappedType = 'string'
        if (selectedParam.type) {
          const typeLower = selectedParam.type.toLowerCase()
          if (typeLower === 'number' || typeLower === 'int' || typeLower === 'integer' || typeLower === 'float' || typeLower === 'double') {
            mappedType = 'number'
          } else if (typeLower === 'boolean' || typeLower === 'bool') {
            mappedType = 'boolean'
          } else {
            mappedType = 'string'
          }
        }
        this.internalParamData.paramType = mappedType
        
        // 验证参数代码
        this.validateParamCode()
        
        // 点击搜索结果后，隐藏搜索结果
        if (targetId === 'search-result') {
          this.searchParamShow = false
        }
        
        console.log('已填充参数信息:', selectedParam)
        console.log('映射后的类型:', mappedType)
        console.log('当前表单数据:', this.internalParamData)
      }
    },
    // 搜索所有数据
    searchAll() {
      this._searchData = [];
      this.searchParamShow = false;
      if (this.searchParamKey) {
        // 搜索所有类型的数据
        const allData = [
          { name: '上游节点', children: this.$props.partList },
          { name: '参数管理', children: this.$props.paramList },
          // { name: '通用参数', children: this.$props.paramList },
          { name: '画布参数', children: this.$props.canvasList }
        ];
        
        let collectItems = (data) => {
          data.forEach(item => {
            if (item.children && item.children.length > 0) {
              const filteredChildren = item.children.filter(child => 
                child.name.includes(this.searchParamKey) || child.code.includes(this.searchParamKey)
              );
              if (filteredChildren.length > 0) {
                this._searchData.push({
                  name: item.name,
                  children: filteredChildren
                });
              }
              collectItems(item.children);
            }
          });
        }
        collectItems(allData);
        
        if (this._searchData.length > 0) {
          this.searchParamShow = true;
        }
      }
    },
    // 处理点击外部
    handleClickOutside(event) {
      const searchContainer = this.$el.querySelector('.search-container')
      if (searchContainer && !searchContainer.contains(event.target)) {
        this.searchParamShow = false
      }
    },

    filterNode(value, data) {
      if (!value) return true
      return data.code.includes(value)
    }
  },
  mounted() {
    // 组件挂载后的初始化逻辑
    console.log('参数编辑面板已挂载')
    
    // 添加点击外部关闭搜索结果的监听
    document.addEventListener('click', this.handleClickOutside)
  },
  
  watch: {
    paramData: {
      handler(newVal) {
        if (newVal && Object.keys(newVal).length > 0) {
          // 从 props 初始化内部数据
          this.internalParamData = {
            paramName: newVal.paramName || '',
            paramType: newVal.paramType || '',
            paramCode: newVal.paramCode || '',
            isCustom: newVal.isCustom || 1,
            paramValue: newVal.paramValue || ''
          }
          console.log('从 props 初始化内部数据:', this.internalParamData)
        }
      },
      immediate: true,
      deep: false
    }
  },
  beforeUnmount() {
    // 移除事件监听
    document.removeEventListener('click', this.handleClickOutside)
  }
}
</script>

<style scoped>
.decision-table-param-edit-panel {
  width: 400px;
  height: 700px;
  position: fixed;
  top: 50%;
  right: 400px;
  transform: translateY(-50%);
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 10001;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: #f5f5f5;
  border-bottom: 1px solid #e2e2e2;
  flex-shrink: 0;
}

.header-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.search-container {
  display: flex;
  align-items: center;
  position: relative;
}

.search-input {
  width: 200px;
}

.search-result-container {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 999;
  background: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  max-height: 300px;
  overflow-y: auto;
  margin-top: 4px;
}

.search-result-item {
  padding: 8px 12px;
  border-bottom: 1px solid #f0f0f0;
}

.search-result-item:last-child {
  border-bottom: none;
}

.search-result-item__title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
}

.search-result-item__value {
  font-size: 14px;
  display: flex;
  justify-content: space-between;
  padding: 4px 8px;
  margin: 4px 0;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.search-result-item__value:hover {
  background: #f5f7fa;
}

.search-result-item__value span:nth-child(2) {
  color: #c6cacf;
}

.content-container {
  flex: 1;
  margin: 0;
  border: 1px solid #e2e2e2;
  border-radius: 6px;
  background: #fafafa;
  display: flex;
  min-height: 300px;
  padding: 0;
}

.placeholder-text {
  color: #999;
  font-size: 14px;
}

/* 参数列表和函数列表样式 */
.express-dialog-container {
  width: 100%;
  height: 100%;
  display: flex;
}

.express-dialog-container-item {
  flex: 1;
  background: #fff;
  border-radius: 6px;
  border: 1px solid #e2e2e2;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

.body-item__title {
  margin: 0;
  padding: 12px 16px;
  background: #f5f5f5;
  border-bottom: 1px solid #e2e2e2;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  flex-shrink: 0;
}

.body-item__container {
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

.container-title {
  margin-bottom: 12px;
  flex-shrink: 0;
}

.container-title .el-radio-group {
  display: flex;
  gap: 4px;
}

.container-title .el-radio-button {
  min-width: 50px;
  max-width: 70px;
}

.container-title .el-radio-button .el-radio-button__inner {
  padding: 4px 8px;
  font-size: 11px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.container-body {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  width: 99%;
}

/* 树形组件样式 */
.container-body .el-tree {
  background: transparent;
  width: 100%;
  height: 100%;
}

.container-body .el-tree .el-tree-node {
  width: 100%;
}

.container-body .el-tree .el-tree-node__content {
  padding: 4px 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.container-body .el-tree-node__content .name {
  display: flex;
  align-items: center;
  flex: 1;
}

.container-body .el-tree-node__content .type {
  color: #666;
  font-size: 12px;
  margin-left: 8px;
  flex-shrink: 0;
}

/* 树形组件节点样式覆盖 */
:deep(.el-tree-node__content) {
  display: flex;
  justify-content: space-between;
}

:deep(.el-tree-node__content .el-tree-node__expand-icon) {
  width: 12px;
}

:deep(.el-tree-node__content .name) {
  flex: 1 1 0;
  font-weight: 400;
}

:deep(.el-tree-node__content .type) {
  margin: 0 4px;
  background: #FCF6EB;
  color: #E6A23C;
  padding: 0 4px;
  border-radius: 2px;
  font-weight: 400;
}

/* 函数列表样式 */
.bar-list__item {
  margin: 8px 0;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  color: #333;
  transition: background-color 0.2s;
}

.bar-list__item:hover {
  background: #e9ecef;
}

/* 工具提示样式 */
.tooltip-item__title {
  margin: 0 0 8px 0;
  font-weight: 600;
  color: #fff;
}

.tooltip-item__value {
  margin: 0;
  color: #e6e6e6;
  font-size: 12px;
}

.param-form {
  padding: 10px 10px;
  margin: 0 0px 0px 10px;
}

.form-item {
  margin-bottom: 12px;
  position: relative;
  display: flex;
  align-items: center;
}

.form-label {
  display: block;
  width: 80px;
  text-align: right;
  margin-right: 10px;
  font-size: 14px;
  font-weight: normal;
  color: #333;
  line-height: 30px;
  flex-shrink: 0;
}

.form-input,
.form-select {
  width: 250px;
}

.form-input.disabled,
.form-select.disabled {
  background-color: #f5f5f5;
  color: #999;
  cursor: not-allowed;
}

.error-message {
  color: #f56c6c;
  font-size: 12px;
  margin-top: 4px;
  margin-left: 90px;
}

.panel-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid #e2e2e2;
  background: #fafafa;
  flex-shrink: 0;
}

.footer-btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  border: 1px solid;
}

.confirm-btn {
  background: #1890ff;
  border-color: #1890ff;
  color: #fff;
}

.confirm-btn:hover {
  background: #40a9ff;
  border-color: #40a9ff;
}

.cancel-btn {
  background: #fff;
  border-color: #d9d9d9;
  color: #333;
}

.cancel-btn:hover {
  border-color: #40a9ff;
  color: #40a9ff;
}
</style>