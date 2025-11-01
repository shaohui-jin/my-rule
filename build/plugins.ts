import { resolve } from 'path'
import vue from '@vitejs/plugin-vue'
import { viteBuildInfo } from './info'
import svgLoader from 'vite-svg-loader'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { viteMockServe } from 'vite-plugin-mock'
// import ElementPlus from "unplugin-element-plus/vite";
import { visualizer } from 'rollup-plugin-visualizer'
import removeConsole from 'vite-plugin-remove-console'
import themePreprocessorPlugin from '@pureadmin/theme'
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'
import DefineOptions from 'unplugin-vue-define-options/vite'
import monacoEditorPlugin from 'vite-plugin-monaco-editor';

export function getPluginsList(
  command: string
) {
  const prodMock = true
  const lifecycle = process.env.npm_lifecycle_event
  return [
    vue(),
    // https://github.com/intlify/bundle-tools/tree/main/packages/vite-plugin-vue-i18n
    VueI18nPlugin({
      runtimeOnly: true,
      compositionOnly: true,
      include: [resolve('locales/**')]
    }),
    // jsx、tsx语法支持
    vueJsx(),
    DefineOptions(),
    // 线上环境删除console
    removeConsole({ external: ['src/assets/iconfont/iconfont.js'] }),
    viteBuildInfo(),
    // 自定义主题
    // themePreprocessorPlugin({
    //   scss: {
    //     multipleScopeVars: genScssMultipleScopeVars(),
    //     extract: true
    //   }
    // }),
    // svg组件化支持
    svgLoader(),
    // ElementPlus({}),
    monacoEditorPlugin({
      languages: ['javascript', 'typescript'],
      // languageWorkers: [ 'editorWorkerService', 'json', 'typescript', 'html', 'css'],
      // publicPath: 'https://unpkg.com/vite-plugin-monaco-editor@1.0.5/cdn'
    }),
    // 打包分析
    lifecycle === 'report'
      ? visualizer({ open: true, brotliSize: true, filename: 'report.html' })
      : null
  ]
}
