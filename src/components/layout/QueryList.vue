<script setup lang="ts">
import { computed, useSlots } from 'vue'

defineProps({
  title: String
})

const showToolbar = computed(() => {
  const slots = useSlots()
  return slots.toolbar || slots['toolbar-title'] || slots['toolbar-body']
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
    <div class="query-list-body">
      <slot name="body" />
    </div>
    <div v-if="$slots.pagination" class="query-list-pagination">
      <slot name="pagination" />
    </div>
    <slot />
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

  .query-list-body {
    flex: 1;
    overflow-y: auto;
    padding: 0px 12px;

    .el-table {
      height: 100%;
    }
  }

  .query-list-pagination {
    padding: 12px 8px;

    .el-pagination {
      justify-content: flex-end;
    }
  }
}
</style>
