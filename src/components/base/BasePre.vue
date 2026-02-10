<template>
  <div ref="editorContainer" class="editorContainer" />
</template>

<script setup lang="ts">
import { onMounted, ref, defineExpose, watch, onBeforeUnmount } from 'vue'
import { ElMessage } from 'element-plus'
import { Download, DocumentCopy, FullScreen, Close } from '@element-plus/icons-vue'
import { getDefaultMonacoEditorConfig } from '@/utils/MonacoEditor'
import * as monaco from 'monaco-editor'
import { MonacoInstance, MonacoManager } from '@/utils/manager/MonacoManager'
import { GetPromise } from '@/utils/ts'

const manager = MonacoManager.getInstance()

// 容器对象
const editorContainer = ref()
let monacoId: GetPromise<ReturnType<typeof manager['createInstance']>>['id'] | null = null
let codeEditor: monaco.editor.IStandaloneCodeEditor = null

// 声明一个input事件
const emit = defineEmits(['update:modelValue'])

defineOptions({
  name: 'BasePre'
})

// 从父组件中接收
const props = defineProps({
  language: {
    type: String,
    default: 'json'
  },
  preData: {
    type: Object,
    default: () => ({}),
    required: true
  }
})

onMounted(() => {
  manager
    .createInstance(editorContainer.value, {
      ...getDefaultMonacoEditorConfig(),
      value: JSON.stringify(props.preData, '', 1),
      language: props.language
    })
    .then(({ id, editor }: MonacoInstance) => {
      monacoId = id
      codeEditor = editor
      // 设置监听事件
      // codeEditor.onDidChangeModelContent(() => {
      //   emit('update:modelValue', codeEditor?.getValue())
      // })
    })
})

// 监听 props.modelValue 的变化，实现真正的双向绑定
watch(
  () => props.preData,
  newValue => {
    codeEditor.setValue(JSON.stringify(newValue, '', 1))
  },
  { immediate: false, deep: true }
)

onBeforeUnmount(() => {
  manager.disposeInstance(monacoId)
})

const setValue = (value: string) => {
  codeEditor?.setValue(value)
}

const getValue = (): string => {
  return codeEditor?.getValue() || ''
}

defineExpose({
  setValue,
  getValue
})
</script>

<style lang="scss" scoped>
.editorContainer {
  overflow: hidden;
  position: relative;
  height: 100%;
  width: 100%;
  flex: 1 1 0;
}
</style>
