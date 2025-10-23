// import "@/utils/sso";
import { getConfig } from '@/config'
import NProgress from '@/utils/progress'
import { transformI18n } from '@/plugins/i18n'
import { useMultiTagsStoreHook } from '@/store/modules/multiTags'
import { usePermissionStoreHook } from '@/store/modules/permission'
import { Router, createRouter, RouteRecordRaw, RouteComponent, createWebHistory } from 'vue-router'
import {
  ascending,
  initRouter,
  isOneOfArray,
  getHistoryMode,
  findRouteByPath,
  handleAliveRoute,
  formatTwoStageRoutes,
  formatFlatteningRoutes,
  getPathToList,
  getFirstPath
} from './utils'
import { buildHierarchyTree } from '@/utils/tree'
import { isUrl, openLink, storageLocal } from '@pureadmin/utils'

/** 自动导入全部静态路由，无需再手动引入！匹配 src/router/modules 目录（任何嵌套级别）中具有 .ts 扩展名的所有文件，除了 remaining.ts 文件
 * 如何匹配所有文件请看：https://github.com/mrmlnc/fast-glob#basic-syntax
 * 如何排除文件请看：https://cn.vitejs.dev/guide/features.html#negative-patterns
 */
const modules: Record<string, any> = import.meta.glob(
  ['./modules/**/*.ts'],
  {
    eager: true
  }
)

/** 原始静态路由（未做任何处理） */
const routes = []

Object.keys(modules).forEach(key => {
  routes.push(modules[key].default)
})

/** 导出处理后的静态路由（三级及以上的路由全部拍成二级） */
export const constantRoutes: Array<RouteRecordRaw> = formatTwoStageRoutes(
  formatFlatteningRoutes(buildHierarchyTree(ascending(routes)))
)

/** 用于渲染菜单，保持原始层级 */
export const constantMenus: Array<RouteComponent> = ascending(routes).concat(...remainingRouter)

/** 创建路由实例 */
export const router: Router = createRouter({
  history: createWebHistory(),
  routes: constantRoutes,
  strict: true,
  scrollBehavior(to, from, savedPosition) {
    return new Promise(resolve => {
      if (savedPosition) {
        return savedPosition
      } else {
        if (from.meta.saveSrollTop) {
          const top: number = document.documentElement.scrollTop || document.body.scrollTop
          resolve({ left: 0, top })
        }
      }
    })
  }
})

router.beforeEach((to: toRouteType, _from, next) => {
  NProgress.start()
  next()
})

router.afterEach(() => {
  NProgress.done()
})

export default router
