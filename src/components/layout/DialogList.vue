<script setup lang="ts">
import { computed, useSlots } from 'vue'

defineProps({
  title: String
})

const showToolbar = computed(() => {
  const slots = useSlots()
  return slots.toolbar || slots['toolbar-body']
})
</script>

<template>
  <div class="dialog-list">
    <div v-if="$slots.filter" class="dialog-list-filter">
      <slot name="filter" />
    </div>
    <div v-if="showToolbar" class="dialog-list-toolbar">
      <slot name="toolbar">
        <slot name="toolbar-body" />
      </slot>
    </div>
    <div class="dialog-list-body">
      <slot name="body" />
    </div>
    <div v-if="$slots.pagination" class="dialog-list-pagination">
      <slot name="pagination" />
    </div>
    <slot />
  </div>
</template>

<style lang="scss">
.dialog-list {
  margin: 0px;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #fff;

  .dialog-list-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0px;
    border-bottom: 1px solid #e7e7e7;
  }

  .dialog-list-body {
    flex: 1;
    overflow-y: auto;
    padding: 0px 0px;

    .el-table {
      height: 100%;
    }
  }

  .dialog-list-pagination {
    padding: 12px 8px;

    .el-pagination {
      justify-content: flex-end;
    }
  }
}
</style>
