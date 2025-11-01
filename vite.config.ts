import dayjs from 'dayjs'
import { resolve } from 'path'
import pkg from './package.json'
import { getPluginsList } from './build/plugins'
import { UserConfigExport, ConfigEnv } from 'vite'

/** 当前执行node命令时文件夹的地址（工作目录） */
const root: string = process.cwd()

/** 路径查找 */
const pathResolve = (dir: string): string => {
  return resolve(__dirname, '.', dir)
}

const { dependencies, devDependencies, name, version } = pkg
const __APP_INFO__ = {
  pkg: { dependencies, devDependencies, name, version },
  lastBuildTime: dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss')
}

export default ({ command, mode }: ConfigEnv): UserConfigExport => {
  return {
    base: './',
    root,
    resolve: {
      alias: {
        '@': pathResolve('src'),
        '@build': pathResolve('build'),
        // 配置别名，使得在代码中可以通过'monaco-editor'来引用CDN中的monaco-editor
        'monaco-editor': pathResolve('node_modules/monaco-editor/esm/vs/editor/editor.main.js')
      }
    },
    // 服务端渲染
    server: {
      // 是否开启 https
      // 端口号
      port: 8001,
      host: '0.0.0.0',
      proxy: {
        '/api': {
          // target: 'http://10.8.90.16:8080',
          target: 'http://api-dev.neurohome-ai.com',
          changeOrigin: true,
          rewrite: path => path.replace(/^\/api/, '')
        }
      }
    },
    plugins: getPluginsList(command),
    // https://cn.vitejs.dev/config/dep-optimization-options.html#dep-optimization-options
    optimizeDeps: {
      include: [
        'qs',
        'mitt',
        'dayjs',
        'axios',
        'pinia',
        'echarts',
        'vue-i18n',
        'js-cookie',
        '@vueuse/core',
        '@pureadmin/utils',
        'responsive-storage',
        'element-resize-detector',
        'monaco-editor'
      ],
      exclude: [
        '@iconify-icons/ep',
        '@iconify-icons/ri',
        '@pureadmin/theme/dist/browser-utils',
        // '@types/node'
      ]
    },
    build: {
      target: 'es2022',
      sourcemap: false,
      // 消除打包大小超过500kb警告
      chunkSizeWarningLimit: 4000,
      rollupOptions: {
        // 确保在构建时包含外部依赖
        external: ['monaco-editor'],
        input: {
          index: pathResolve('index.html')
        },
        // 静态资源分类打包
        output: {
          chunkFileNames: 'static/js/[name]-[hash].js',
          entryFileNames: 'static/js/[name]-[hash].js',
          assetFileNames: 'static/[ext]/[name]-[hash].[ext]'
        }
      }
    },
    define: {
      __INTLIFY_PROD_DEVTOOLS__: false,
      __APP_INFO__: JSON.stringify(__APP_INFO__)
    }
  }
}
