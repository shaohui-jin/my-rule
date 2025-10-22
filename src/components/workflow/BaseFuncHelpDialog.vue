<template>
  <el-dialog
    :model-value="props.visible"
    width="70vw"
    :close-on-click-modal="true"
    :close-on-press-escape="true"
    :show-close="true"
    @close="props.onClose"
    class="base-func-help-dialog"
    append-to-body
    :destroy-on-close="true"
    top="6vh"
    :style="{ minHeight: '80vh' }"
  >
    <template #header>
      <div class="dialog-title-bar">
        <div class="dialog-title-bar__stripe" />
        <div class="dialog-title">基础函数帮助文档</div>
      </div>
    </template>
    <div class="dialog-content">
      <div class="example-text">
        <span class="example-label">举例:</span>
        <span class="example-content">规则Id 20432</span>
      </div>
      <el-collapse accordion class="func-collapse">
        <el-collapse-item
          v-for="(item, idx) in baseFuncHelpList"
          :key="idx"
          :title="item.title"
          class="func-collapse-item flat"
        >
          <div class="func-help-content" v-html="item.html" />
        </el-collapse-item>
      </el-collapse>
      <div v-if="!baseFuncHelpList || baseFuncHelpList.length === 0" class="empty-tip" />
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { defineProps, nextTick, watch } from 'vue'
import baseFuncHelpList from '@/data/baseFuncHelp/baseFuncHelp.js'

import { useDialogDrag } from '@/hooks/useDialogDrag'

const { initDialog } = useDialogDrag()

const props = defineProps<{
  visible: boolean
  onClose: () => void
}>()
watch(
  () => props.visible,
  newVal => {
    if (newVal) {
      nextTick(() => {
        initDialog()
      })
    }
  }
)
</script>

<style scoped>
.base-func-help-dialog >>> .el-dialog {
  border-radius: 18px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.13);
  min-height: 80vh;
  display: flex;
  flex-direction: column;
}
.base-func-help-dialog >>> .el-dialog__body {
  padding: 0 32px 32px 32px;
  background: #f8fafc;
  border-radius: 0 0 18px 18px;
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.dialog-title-bar {
  display: flex;
  align-items: center;
  padding: 0 0 12px 0;
  border-bottom: 1px solid #e5e6eb;
  margin-bottom: 2px;
}
.dialog-title-bar__stripe {
  width: 4px;
  height: 28px;
  background: linear-gradient(180deg, #409eff 0%, #66b1ff 100%);
  border-radius: 2px;
  margin-right: 12px;
}
.dialog-title {
  font-size: 22px;
  font-weight: 700;
  color: #222;
  letter-spacing: 1px;
}
.dialog-content {
  max-height: 62vh;
  min-height: 0;
  flex: 1 1 auto;
  overflow-y: auto;
  padding: 0;
  background: #f8fafc;
}
.func-collapse {
  background: #f8fafc;
  border: none;
}
.func-collapse-item.flat {
  border: none;
  border-bottom: 1px solid #f0f0f0;
  border-radius: 0;
  box-shadow: none;
  background: #f8fafc;
  margin-bottom: 0;
  transition: none;
}
.func-collapse-item.flat:last-child {
  border-bottom: none;
}
.func-collapse-item .el-collapse-item__header {
  font-size: 14px;
  color: #222;
  font-weight: 600;
  background: #f8fafc;
  border: none;
  padding: 12px 0 12px 8px;
  transition: color 0.2s;
}
.func-collapse-item .el-collapse-item__header:hover {
  color: #409eff;
}
.func-help-content {
  font-size: 14px;
  color: #333;
  line-height: 1.7;
  padding: 8px 0 8px 16px;
  background: #f8fafc;
}
.example-text {
  display: flex;
  align-items: center;
  padding: 8px 0 4px 0;
  margin-bottom: 2px;
}
.example-label {
  font-size: 14px;
  color: #f56c6c;
  font-weight: 600;
  margin-right: 8px;
}
.example-content {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}
.empty-tip {
  color: #aaa;
  text-align: center;
  margin: 32px 0;
  font-size: 14px;
}
</style>
