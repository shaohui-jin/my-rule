<script setup lang="ts">
import { computed, useSlots } from 'vue'

const props = defineProps({
  /**标题 */
  title: String,
  /**侧边栏宽度 */
  sidebarWidth: {
    type: Number,
    default: 200
  }
})

const showToolbar = computed(() => {
  const slots = useSlots()
  return slots.toolbar || slots['toolbar-title'] || slots['toolbar-body']
})
const sidebarStyle = computed(() => {
  return {
    width: props.sidebarWidth + 'px',
    height: '100%',
    'border-right': '1px solid #e7e7e7'
  }
})
</script>

<template>
  <div class="tree-list">
    <div v-if="$slots.sidebar" v-show="sidebarWidth > 0" :style="sidebarStyle">
      <slot name="sidebar" />
    </div>
    <div class="tree-list-main">
      <div v-if="$slots.filter" class="tree-list-filter">
        <slot name="filter" />
      </div>
      <div v-if="showToolbar" class="tree-list-toolbar">
        <slot name="toolbar">
          <slot name="toolbar-title">
            <span class="tree-list-toolbar__title">{{ title }}</span>
          </slot>
          <slot name="toolbar-body" />
        </slot>
      </div>
      <div class="tree-list-body">
        <div class="tree-list-body__inner">
          <slot name="body" />
        </div>
      </div>
      <div v-if="$slots.pagination" class="tree-list-pagination">
        <slot name="pagination" />
      </div>
      <slot />
    </div>
  </div>
</template>

<style lang="scss">
.tree-list {
  display: flex;
  background-color: #fff;

  .tree-list-main {
    height: 100%;
    display: flex;
    flex-direction: column;
    flex: 1;

    .tree-list-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px;
      border-bottom: 1px solid #e7e7e7;

      .tree-list-toolbar__title {
        font-size: 14px;
        font-weight: 700;
      }
    }

    .tree-list-body {
      flex: 1;
      position: relative;

      .tree-list-body__inner {
        padding-left: 12px;
        width: 100%;
        height: 100%;
        position: absolute;
        overflow-y: auto;

        .el-table {
          height: 100%;
        }
      }
    }

    .tree-list-pagination {
      padding: 12px 8px;
      display: flex;
      justify-content: space-between;

      .el-pagination {
        justify-content: flex-end;
      }
    }
  }
}
</style>
