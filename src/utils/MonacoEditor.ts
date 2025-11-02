// import { editor } from 'monaco-editor'
// import IStandaloneEditorConstructionOptions = editor.IStandaloneEditorConstructionOptions

/**
 * 获取默认的Monaco编辑器配置
 * @param isFull
 */
export const getDefaultMonacoEditorConfig = (isFull: boolean = false) => {
  return {
    language: 'javascript',
    // language: 'lua',
    automaticLayout: true, // 自动调整布局
    theme: 'vs-dark',
    lineNumbers: 'off',
    roundedSelection: false,
    minimap: { enabled: true },
    scrollBeyondLastLine: false,
    readOnly: false,
    readOnlyMessage: { value: '不可以修改哦', supportThemeIcons: true, supportHtml: true }, // 为只读时编辑内日提示词
    codeLens: false, // 代码透镜
    folding: true, // 代码折叠
    snippetSuggestions: 'inline', // 代码提示
    tabCompletion: 'on', // 代码提示按tab完成
    foldingStrategy: 'auto', // 折叠策略
    smoothScrolling: false, // 滚动动画
    fontSize: isFull ? 14 : 12,
    wordWrap: 'on',
    wordBasedSuggestions: true, // 禁用基于单词的智能提示（例如，自动完成）
    quickSuggestions: true // 启用快速建议（例如，输入时自动显示建议）
  }
}
