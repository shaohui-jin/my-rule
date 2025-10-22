<template>
  <div class="base-table">
    <div class="action-bar" v-if="actions.length > 0">
      <template v-for="(a, i) in actions" :key="i">
        <!--  这里是按钮类型的    -->
        <el-button
          v-if="['primaryButton', 'button'].includes(a.type)"
          :type="a.type === 'primaryButton' ? 'primary' : ''"
          v-bind="getBinds(a, 'search')"
          @click="a.onclick"
        >
          {{ a.label }}
        </el-button>
        <!--  这里是多操作类型的， batch 为批量操作、会判断是否有选中词条， multiple则为多操作、不做判断   -->
        <el-dropdown v-else style="margin-left: 10px">
          <el-button
            v-bind="getBinds(a, 'search')"
            :disabled="a.type === 'batch' && selectData.length === 0"
          >
            {{ a.label }}
          </el-button>
          <template #dropdown>
            <el-dropdown-menu v-if="a.type !== 'batch' || selectData.length > 0">
              <el-dropdown-item
                v-for="(_a, _i) in a.children"
                :key="_i"
                v-bind="getBinds(_a, 'search')"
                @click="
                  () => {
                    if (a.type === 'batch') {
                      _a.onclick(selectData)
                    } else {
                      _a.onclick()
                    }
                  }
                "
              >
                {{ _a.label }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </template>
    </div>
    <div class="table-bar">
      <el-table
        v-loading="loading"
        :data="tableData"
        height="100%"
        :preserve-expanded-content="false"
        :row-key="rowKey"
        :allow-drag-last-column="true"
        @selection-change="selectionChange"
        @expand-change="expandChange"
      >
        <template v-for="tableItem in _column.filter(e => e.show !== false)" :key="tableItem.key">
          <!--  这是展开插槽   -->
          <el-table-column
            v-if="tableItem.type === 'expand'"
            type="expand"
            width="40"
            #default="scope"
            style="width: 1423px"
          >
            <slot v-if="tableItem.slotName" :name="tableItem.slotName" v-bind="scope" />
          </el-table-column>

          <!-- 这是索引列 -->
          <el-table-column
            v-if="tableItem.type === 'index'"
            width="55"
            align="center"
            #default="scope"
          >
            {{ (currentPage - 1) * pageSize + scope.$index + 1 }}
          </el-table-column>

          <!--  这是多选列，固定宽度渲染，如需调整宽度，增加 bind 绑定上来就好      -->
          <el-table-column v-else-if="tableItem.type === 'selection'" type="selection" width="40" />

          <!--  这是序号列，固定宽度渲染，如需调整宽度，增加 bind 绑定上来就好       -->
          <el-table-column
            v-else-if="tableItem.type === 'index'"
            type="index"
            width="52"
            v-bind="getBinds(tableItem, 'table')"
          />

          <!--  这是表头排序列  -->
          <el-table-column
            v-else-if="tableItem.type === 'editColumn'"
            v-bind="getBinds(tableItem, 'table')"
            class-name="editColumn"
            width="26"
          >
            <template #header>
              <el-icon @click="openDialog" style="cursor: pointer">
                <Setting />
              </el-icon>
            </template>
          </el-table-column>

          <!--  这是通用的 radio 处理 -->
          <el-table-column
            v-else-if="tableItem.type === 'radioGroup'"
            v-bind="getBinds(tableItem, 'table')"
            #default="scope"
          >
            <el-radio-group size="small" v-model="scope.row[tableItem.key]">
              <el-radio-button
                v-for="(item, index) in tableItem.groupItems"
                :key="index"
                :label="item.value"
              >
                {{ item.label }}
              </el-radio-button>
            </el-radio-group>
          </el-table-column>

          <!--  这是通用的 switch 处理 -->
          <el-table-column
            v-else-if="tableItem.type === 'switch'"
            v-bind="getBinds(tableItem, 'table')"
            #default="scope"
          >
            <el-switch
              :value="scope.row[tableItem.key]"
              :active-value="tableItem.activeValue"
              :inactive-value="tableItem.inactiveValue"
              @click="
                tableColumnChange(
                  tableItem.key,
                  scope.row,
                  scope.column,
                  scope.cellIndex,
                  scope.$index
                )
              "
            />
          </el-table-column>

          <!--  这是通用的 状态status 处理 -->
          <el-table-column
            v-else-if="tableItem.type === 'status'"
            v-bind="getBinds(tableItem, 'table')"
            #default="scope"
          >
            <div class="status-box">
              <div :class="{ 'status-box__lamp': true, isSuccess: tableItem.isSuccess(scope.row) }" />
              <div class="status-box__content">
                <div class="status-box__text">{{ tableItem.isSuccess(scope.row) ? tableItem.successText : tableItem.failText }}</div>
                <template v-if="tableItem.desc">
                  <div class="status-box__desc" v-if="tableItem.isSuccess(scope.row)">
                    {{ tableItem.desc(scope.row) }}
                  </div>
                  <el-tooltip
                    v-else
                    class="box-item"
                    effect="dark"
                    :content="tableItem.desc(scope.row)"
                    placement="top"
                    show-after="100"
                  >
                    <div class="status-box__desc">
                      {{ tableItem.desc(scope.row) }}
                    </div>
                  </el-tooltip>
                </template>

              </div>
            </div>
          </el-table-column>

          <!-- 这是通用的 状态 status-tag 处理 -->
          <el-table-column
            v-else-if="tableItem.type === 'status-tag'"
            v-bind="getBinds(tableItem, 'table')"
            #default="scope"
          >
            <el-tag
              :type="tableItem.isSuccess(scope.row) ? 'success' : 'danger'"
              :style="tableItem?.click ? 'cursor: pointer' : ''"
              @click="() => tableItem?.click && tableItem.click(scope.row)"
            >
              {{ tableItem.isSuccess(scope.row) ? tableItem.successText : tableItem.failText }}
            </el-tag>
          </el-table-column>

          <!--  这是特殊的 formatter 处理 -->
          <el-table-column
            v-else-if="tableItem.formatter && tableItem.click"
            v-bind="getBinds(tableItem, 'table')"
            :show-overflow-tooltip="tableItem.showOverflowTooltip !== false"
          >
            <template #default="scope">
              <span
                @click="() => tableItem?.click(scope.row)"
                style="width: 100%;"
                :style="Object.prototype.hasOwnProperty.call(tableItem, 'click')
                  ? 'cursor: pointer; color: rgb(0, 85, 255)'
                  : ''
                "
              >
                {{ tableItem.formatter(scope.row) }}
              </span>
            </template>
          </el-table-column>

          <el-table-column
            v-else-if="tableItem.formatter"
            v-bind="getBinds(tableItem, 'table')"
            :show-overflow-tooltip="tableItem.showOverflowTooltip !== false"
          />

          <el-table-column
            v-else
            v-bind="getBinds(tableItem, 'table')"
            :show-overflow-tooltip="tableItem.showOverflowTooltip !== false"
            #default="scope"
          >
            <el-button v-if="tableItem.prependEditButton" type="primary" link @click="tableItem.editButtonClick(scope.row)" style="color: var(--el-color-primary) !important">
              <el-icon><Edit /></el-icon>
            </el-button>
            <span>{{ scope.row[tableItem.key] }}</span>
          </el-table-column>
        </template>
      </el-table>
    </div>
    <div class="pagination-bar" v-if="showPagination">
      <el-pagination
        v-if="paginationSize === 'default'"
        v-model:current-page="_currentPage"
        v-model:page-size="_pageSize"
        :page-sizes="[10, 20, 30, 40, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
      <el-pagination v-else-if="paginationSize === 'mini'" v-bind="$attrs" />
    </div>
    <BaseColumnSetting
      v-if="props.showColumnSetting"
      ref="baseColumnSetting"
      v-model:columns="_column"
    />
  </div>
</template>

<script lang="ts" setup>
import { omit } from "lodash-es";
import { TableColumn } from "./types";
import { useVModel } from "@vueuse/core";
import {ArrowLeft, ArrowRight, DCaret, Edit, Setting} from '@element-plus/icons-vue'
import { onMounted, ref } from 'vue'
import BaseColumnSetting from './BaseColumnSetting.vue'
import {ElRadioButton, ElRadioGroup} from "element-plus";

defineOptions({
  name: 'BaseTable'
})

const props = defineProps({
  loading: {
    type: Boolean,
    default: false
  },
  showColumnSetting: {
    type: Boolean,
    default: true,
  },
  showPagination: {
    type: Boolean,
    default: true,
  },
  rowKey: {
    type: String,
    default: 'id'
  },
  emptyText: {
    type: String,
    default: '暂无数据'
  },
  maxHeight: {
    type: String,
    default: '600px'
  },
  actions: {
    type: Array<any>,
    default: () => ([])
  },
  tableData: {
    type: Array,
    required: true
  },
  tableColumn: {
    type: Array<TableColumn>,
    required: true
  },
  // 分页相关
  paginationSize: {
    type: String,
    default: 'default',
    remark: '支持默认default以及mini'
  },
  currentPage: {
    type: Number,
    default: 1
  },
  pageSize: {
    type: Number,
    default: 100
  },
  total: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits([
  'expandChange',
  'getList',
  'update:pageSize',
  'update:currentPage',
  'update:tableData',
  'tableColumnChange',
  'selectionChange',
])
const expandChange = (...args) => {
  emit('expandChange', ...args)
}

const selectData = ref([])
const selectionChange = (val) => {
  selectData.value = val
  emit('selectionChange', val)
}

const searchCommonParams = ['label', 'children', 'type', 'onclick']
const tableColumnCommonParams = ['key']
// 获取绑定
const getBinds = (item, type) => {
  const filterVal = type === 'search' ? searchCommonParams : tableColumnCommonParams
  return omit(item, filterVal)
}

const _pageSize = useVModel(props, 'pageSize', emit)
const _currentPage = useVModel(props, 'currentPage', emit)
// 分页相关
const handleSizeChange = (size) => {
  _pageSize.value = size
  handleCurrentChange(1)
}
const handleCurrentChange = (current) => {
  _currentPage.value = current
  emit('getList')
}

// 修改column相关
const _column = ref<Array<TableColumn>>([])
const baseColumnSetting = ref()
const openDialog = () => {
  baseColumnSetting.value.open()
}

const tableColumnChange = (key, row, column , cellIndex, index) => {
  emit('tableColumnChange', key, row, column , cellIndex, index)
}

onMounted(() => {
  const columns = [...props.tableColumn]
  if (props.showColumnSetting) {
    columns.push({ key: 'editColumn', type: 'editColumn', fixed: 'right' })
  }
  _column.value = columns
})
</script>

<style scoped lang="scss">
.base-table {
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  .action-bar {
    padding: 12px 16px;
    display: flex;
    justify-content: flex-end;
  }

  .table-bar {
    flex: 1 1 0;
    padding: 16px 16px 0 16px;
    overflow: overlay;

    :deep(.el-table th.el-table__cell) {
      background-color: rgba(242, 246, 252, 1);
    }
    :deep(.el-table__header) {
      height: 40px;
      //background-color: rgba(119,49,25,0.8);
      .editColumn {
        .cell {
          margin-right: 12px;
          padding: 0;
        }
      }
    }
    :deep(.el-table__cell) {
      //line-height: 40px;
      height: 40px;
      padding: 0;
      //background-color: rgba(119,49,25,0.8);
    }
    :deep(.cell) {
      display: flex;
      align-items: center;
      height: 40px;
      span {
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        height: 40px;
        display: flex;
        align-items: center;
      }
      .el-tag {
        height: 24px;
      }
    }
    .status-box {
      height: 40px;
      display: flex;
      align-items: center;
      flex-direction: row;
      .status-box__lamp {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        flex-shrink: 0;
        background-color: rgba(203, 206, 212, 1);
        &.isSuccess {
          background-color: rgba(103, 194, 58, 1);
        }
      }
      .status-box__content {
        display: flex;
        flex-direction: column;
        //align-items: center;
        margin-left: 8px;
        flex: 1 1 0;

        .status-box__text {
          font-size: 14px;
          color: #606266;
          font-weight: 500;
          margin-bottom: 2px;
        }

        .status-box__desc {
          font-size: 12px;
          color: #909399;
          line-height: 1.3;
          word-break: break-all;
          max-width: 100px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }
  }

  &:has(.action-bar) {
    .table-bar {
      padding-top: 0!important;
    }
  }

  .pagination-bar {
    padding: 12px 24px;
    display: flex;
    justify-content: flex-end;
  }

}
</style>
