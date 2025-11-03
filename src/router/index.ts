import { Router, createRouter, createWebHistory, createWebHashHistory } from 'vue-router'

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

/** 创建路由实例 */
export const router: Router = createRouter({
  history: createWebHashHistory(),
  routes: routes,
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
  next()
})

router.afterEach(() => {
})

export default router
