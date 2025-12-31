import pkg from './package.json'
import { UserConfigExport, ConfigEnv, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import DefineOptions from 'unplugin-vue-define-options/vite'
import removeConsole from 'vite-plugin-remove-console'
import dayjs, { Dayjs } from 'dayjs'
import duration from 'dayjs/plugin/duration'
import { green, bold } from 'picocolors'
import { getPackageSize } from '@pureadmin/utils'
import svgLoader from 'vite-svg-loader'
dayjs.extend(duration)
import monacoEditorPlugin from 'vite-plugin-monaco-editor'
import path, { resolve } from 'path'

/** 当前执行node命令时文件夹的地址（工作目录） */
const root: string = process.cwd()

/** 路径查找 */
const pathResolve = (dir: string): string => {
  return resolve(__dirname, '.', dir)
}

const { dependencies, devDependencies, name, version } = pkg

export default ({ command, mode }: ConfigEnv): UserConfigExport => {
  const env = loadEnv(mode, process.cwd())
  let config: { command: string }
  let startTime: Dayjs
  let endTime: Dayjs
  let outDir: string
  return {
    base: env.VITE_PUBLIC_PATH,
    root,
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        'monaco-editor': pathResolve('node_modules/monaco-editor/esm/vs/editor/editor.main.js')
      }
    },
    server: {
      port: 8001,
      host: '0.0.0.0'
    },
    plugins: [
      vue(),
      // jsx、tsx语法支持
      vueJsx(),
      DefineOptions(),
      // 线上环境删除console
      removeConsole({ external: [] }),
      {
        name: 'vite:buildInfo',
        configResolved(resolvedConfig) {
          config = resolvedConfig
          outDir = resolvedConfig.build?.outDir ?? 'dist'
        },
        buildStart() {
          if (config.command === 'build') {
            startTime = dayjs(new Date())
          }
        },
        closeBundle() {
          if (config.command === 'build') {
            endTime = dayjs(new Date())
            getPackageSize({
              folder: outDir,
              callback: (size: string) => {
                console.log(
                  bold(
                    green(
                      `🎉恭喜打包完成（总用时${dayjs
                        .duration(endTime.diff(startTime))
                        .format('mm分ss秒')}，打包后的大小为${size}）`
                    )
                  )
                )
              }
            })
          }
        }
      },
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
        // languages: ['javascript', 'typescript'],
        languageWorkers: ['editorWorkerService', 'json', 'typescript', 'html', 'css']
        // publicPath: 'http://localhost:4173/my-rule/',
        // publicPath: 'https://cdn.jsdelivr.net/npm/monaco-editor@latest/min/vs/loader.min.js'
      })
      // 打包分析
    ],
    // https://cn.vitejs.dev/config/dep-optimization-options.html#dep-optimization-options
    // optimizeDeps: {
    //   include: [
    //     'qs',
    //     'mitt',
    //     'dayjs',
    //     'axios',
    //     'pinia',
    //     'echarts',
    //     'vue-i18n',
    //     'js-cookie',
    //     '@vueuse/core',
    //     '@pureadmin/utils',
    //     'responsive-storage',
    //     'element-resize-detector',
    //     // 'monaco-editor',
    //     // 'monaco-editor/esm/vs/language/json/json.worker',
    //     // 'monaco-editor/esm/vs/language/css/css.worker',
    //     // 'monaco-editor/esm/vs/language/html/html.worker',
    //     // 'monaco-editor/esm/vs/language/typescript/ts.worker',
    //     // 'monaco-editor/esm/vs/editor/editor.worker'
    //   ],
    //   exclude: [
    //     '@iconify-icons/ep',
    //     '@iconify-icons/ri',
    //     '@pureadmin/theme/dist/browser-utils'
    //     // '@types/node'
    //   ]
    // },
    build: {
      // target: 'es2022',
      sourcemap: false,
      // 消除打包大小超过500kb警告
      chunkSizeWarningLimit: 4000,
      rollupOptions: {
        // 确保在构建时包含外部依赖
        // external: ['monaco-editor'],
        external: [],
        input: {
          index: path.resolve(__dirname, 'index.html')
        },
        // 静态资源分类打包
        output: {
          chunkFileNames: 'my-rule/static/js/[name]-[hash].js',
          entryFileNames: 'my-rule/static/js/[name]-[hash].js',
          assetFileNames: 'my-rule/static/[ext]/[name]-[hash].[ext]'
        }
      }
    }
  }
}
