<template>
  <!-- 全屏编辑器覆盖层 -->
  <Teleport to="body">
    <div v-if="isFullscreen" class="fullscreen-editor-overlay">
      <div class="fullscreen-editor-container">
        <div class="editor-toolbar">
          <el-button type="primary" size="small" circle @click.stop="handleDownload">
            <el-icon><Download /></el-icon>
          </el-button>
          <el-button type="primary" size="small" circle @click.stop="copyContent">
            <el-icon><DocumentCopy /></el-icon>
          </el-button>
          <el-button type="primary" size="small" circle @click.stop="toggleFullscreen">
            <el-icon><Close /></el-icon>
          </el-button>
        </div>
        <div ref="fullscreenContainer" class="monaco-editor-container"></div>
      </div>
    </div>
  </Teleport>

  <!-- 主编辑器容器 -->
  <div class="editor-wrapper">
    <div class="editor-toolbar">
      <el-button type="primary" size="small" circle @click.stop="handleDownload">
        <el-icon><Download /></el-icon>
      </el-button>
      <el-button type="primary" size="small" circle @click.stop="copyContent">
        <el-icon><DocumentCopy /></el-icon>
      </el-button>
      <el-button type="primary" size="small" circle @click.stop="toggleFullscreen">
        <el-icon><FullScreen /></el-icon>
      </el-button>
    </div>
    <div ref="editorContainer" class="editorContainer"/>
  </div>
</template>

<script setup lang="ts">
import * as monaco from 'monaco-editor'
import { onMounted, ref, defineExpose, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Download, DocumentCopy, FullScreen, Close } from '@element-plus/icons-vue'

// 容器对象
const editorContainer = ref()

// 编辑器对象
let codeEditor: monaco.editor.IStandaloneCodeEditor | null = null

// 全屏编辑器对象
let fullscreenEditor: monaco.editor.IStandaloneCodeEditor | null = null

// 全屏状态
const isFullscreen = ref(false)

// 全屏容器引用
const fullscreenContainer = ref()

// 声明一个input事件
const emit = defineEmits(['update:modelValue'])

// 从父组件中接收
const props = defineProps({
  language: {
    type: String,
    default: 'javascript'
  },
  modelValue: {
    type: String,
    default: '',
    required: true
  },
  fileName: {
    type: String,
    default: 'code'
  }
})

onMounted(() => {
  codeEditor = monaco.editor.create(editorContainer.value, {
    value: props.modelValue,
    language: props.language,
    theme: 'vs',
    lineNumbers: 'on',
    roundedSelection: false,
    scrollBeyondLastLine: false,
    readOnly: false,
    readOnlyMessage: { value: '不可以修改哦', supportThemeIcons: true, supportHtml: true }, // 为只读时编辑内日提示词
    codeLens: false, // 代码透镜
    folding: true, // 代码折叠
    snippetSuggestions: 'inline', // 代码提示
    tabCompletion: 'on', // 代码提示按tab完成
    foldingStrategy: 'auto', // 折叠策略
    smoothScrolling: false, // 滚动动画
    fontSize: 12,
    automaticLayout: true // 启用自动布局
  })

  // 设置监听事件
  codeEditor.onDidChangeModelContent(() => {
    emit('update:modelValue', codeEditor?.getValue())
  })
})

// 监听 props.modelValue 的变化，实现真正的双向绑定
watch(
  () => props.modelValue,
  newValue => {
    if (codeEditor && newValue !== codeEditor.getValue()) {
      codeEditor.setValue(newValue)
    }
  },
  { immediate: false }
)

// 下载代码文件
const handleDownload = () => {
  if (codeEditor) {
    const content = codeEditor.getValue()
    if (!content.trim()) {
      ElMessage.warning('代码内容为空')
      return
    }

    // 创建 Blob 对象
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })

    // 创建下载链接
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url

    // 设置文件名，包含时间戳
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
    const extension = props.language === 'javascript' ? '.js' : '.txt'
    link.download = `${props.fileName}_${timestamp}${extension}`

    // 触发下载
    document.body.appendChild(link)
    link.click()

    // 清理
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    ElMessage.success('代码文件下载成功')
  } else {
    ElMessage.warning('没有可下载的代码内容')
  }
}

// 复制代码内容
const copyContent = () => {
  if (codeEditor) {
    const content = codeEditor.getValue()
    navigator.clipboard.writeText(content)
      .then(() => {
        ElMessage.success('代码内容已复制到剪贴板')
      })
      .catch(() => {
        ElMessage.error('复制失败，请手动选择复制')
      })
  }
}

// 切换全屏
const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value

  if (isFullscreen.value) {
    // 进入全屏
    document.body.style.overflow = 'hidden'

    // 延迟创建全屏编辑器
    setTimeout(() => {
      createFullscreenEditor()
    }, 100)
  } else {
    // 退出全屏
    document.body.style.overflow = ''

    // 销毁全屏编辑器
    if (fullscreenEditor) {
      fullscreenEditor.dispose()
      fullscreenEditor = null
    }
  }
}

// 创建全屏编辑器
const createFullscreenEditor = () => {
  if (fullscreenEditor || !fullscreenContainer.value) return

  fullscreenEditor = monaco.editor.create(fullscreenContainer.value, {
    value: codeEditor?.getValue() || '',
    language: props.language,
    theme: 'vs', // 全屏时使用深色主题
    readOnly: false,
    minimap: { enabled: true },
    scrollBeyondLastLine: false,
    automaticLayout: true,
    fontSize: 14,
    lineNumbers: 'on',
    folding: true,
    wordWrap: 'on'
  })

  // 监听编辑器内容变更
  fullscreenEditor.onDidChangeModelContent(() => {
    const content = fullscreenEditor?.getValue() || ''
    emit('update:modelValue', content)
    // 同步到原编辑器
    if (codeEditor) {
      codeEditor.setValue(content)
    }
  })

  // 布局编辑器
  setTimeout(() => {
    fullscreenEditor?.layout()
    fullscreenEditor?.focus()
  }, 100)
}

const setValue = (value: string) => {
  codeEditor?.setValue(value)
}

const getValue = (): string => {
  return codeEditor?.getValue() || ''
}


defineExpose({
  setValue,
  getValue,
  handleDownload,
  copyContent,
  toggleFullscreen
})
</script>



<style lang="scss" scoped>
.editor-wrapper {
  position: relative;
  height: 100%;
  width: 100%;
  flex: 1;
}

.editorContainer {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
  height: 100%;
  width: 100%;
  flex: 1;
}

.editor-toolbar {
  position: absolute;
  top: 5px;
  right: 5px;
  z-index: 100;
  display: flex;
  gap: 0px;
  border-radius: 4px;
  padding: 2px;
}

/* 全屏编辑器样式 */
.fullscreen-editor-overlay {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 100vw;
  background-color: #1e1e1e;
  z-index: 99999;
  display: flex;
  flex-direction: column;
}

.fullscreen-editor-container {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;

  .editor-toolbar {
    position: absolute;
    top: 20px;
    right: 20px;
    z-index: 100000;
    display: flex;
    gap: 0px;
  }

  .monaco-editor-container {
    width: 100%;
    height: 100%;
    flex: 1;
  }
}
</style>
