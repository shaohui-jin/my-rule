<script setup lang="ts">
import { computed, useSlots } from 'vue'

const props = defineProps({
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
  <div class="query-list">
    <div v-if="$slots.filter" class="query-list-filter">
      <slot name="filter" />
    </div>
    <div v-if="showToolbar" class="query-list-toolbar">
      <slot name="toolbar">
        <slot name="toolbar-title">
          <span class="query-list-toolbar__title">{{ title }}</span>
        </slot>
        <slot name="toolbar-body" />
      </slot>
    </div>
    <div class="query-list-main">
      <div v-if="$slots.sidebar" v-show="sidebarWidth > 0" :style="sidebarStyle" id="abcd">
        <slot name="sidebar" />
      </div>
      <div class="query-list-body">
        <div class="query-list-body__inner">
          <slot name="body" />
          <div v-if="$slots.pagination" class="query-list-pagination">
            <slot name="pagination" />
          </div>
        </div>
      </div>

      <slot />
    </div>
  </div>
</template>

<style lang="scss">
.query-list {
  margin: 15px;
  height: calc(100% - 30px);
  display: flex;
  flex-direction: column;
  background-color: #fff;

  .query-list-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px;
    border-bottom: 1px solid #e7e7e7;

    .query-list-toolbar__title {
      font-size: 16px;
      font-weight: 700;
    }
  }

  .query-list-main {
    height: 100%;
    display: flex;
    flex-direction: row;
    flex: 1;

    .query-list-body {
      flex: 1;
      position: relative;
      overflow-x: hidden;

      .query-list-body__inner {
        display: flex;
        flex-direction: column;
        padding-left: 12px;
        width: 100%;
        height: 100%;
        position: absolute;
        overflow-y: auto;

        .el-table {
          height: 100%;
        }
      }

      .query-list-pagination {
        padding: 12px 8px;
        display: flex;
        justify-content: space-between;

        .el-pagination {
          justify-content: flex-end;
          flex: 1;
        }
      }
    }
  }
}
</style>
