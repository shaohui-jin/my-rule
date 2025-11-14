import App from './App.vue'
import Axios from 'axios'
import router from './router'
import { createPinia } from "pinia";
import ElementPlus from 'element-plus'
import { createApp, Directive } from 'vue'
import { MotionPlugin } from '@vueuse/motion'


// 引入重置样式
import 'element-plus/dist/index.css'


// 导入公共样式
import '@/styles/index.css'

// 导入字体图标

Axios.defaults.baseURL = import.meta.env.VITE_BASE_API
const app = createApp(App)
const store = createPinia();

// 自定义指令
import * as directives from '@/directives'
Object.keys(directives).forEach(key => {
  app.directive(key, (directives as { [key: string]: Directive })[key])
})
import vClickOutside from "click-outside-vue3"
app.directive('click-outside', vClickOutside.directive);

app.use(router)
app.use(store);
await router.isReady()
app.use(MotionPlugin).use(ElementPlus)

app.mount('#app')
