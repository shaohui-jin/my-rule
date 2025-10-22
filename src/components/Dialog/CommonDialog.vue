<template>
  <el-dialog
    :append-to-body="true"
    :close-on-click-modal="false"
    :destroy-on-close="true"
    v-model="dialogVisible"
    :title="title"
    width="30%"
  >
    <slot name="content">默认内容（当父组件未传递时显示）</slot>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeDialog" v-if="closeBtnVisible">直接关闭</el-button>
        <el-button @click="cancelDialog" v-else>取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script setup lang="ts">
import { ref, defineExpose,nextTick } from 'vue'

import { useDialogDrag } from '@/hooks/useDialogDrag'

const { initDialog } = useDialogDrag()

defineOptions({
  name: 'CommonDialog'
})

const props = defineProps({
  title: {
    type: String,
    default: '规则保存'
  },
  closeBtnVisible: {
    type: Boolean,
    default: false
  }
})

const dialogVisible = ref(false)
const emit = defineEmits(['saveDialog', 'closeDialog', 'cancelDialog'])

const open = () => {
  dialogVisible.value = true
  nextTick(() => {
    initDialog()
  })
}

const close = () => {
  dialogVisible.value = false
}

const save = () => {
  emit('saveDialog')
}

const closeDialog = () => {
  emit('closeDialog')
}

const cancelDialog = () => {
  emit('cancelDialog')
}

defineExpose({
  open,
  close
})
</script>
