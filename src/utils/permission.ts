import { http } from '@/utils/http'
import { RestResult } from '@/utils/http/types'
import { usePermissionStore } from '@/store/modules/permission'
import { constantRoutes } from '@/router'

export const getMenuConfig = async () => {
  const res = await http.post<any, RestResult>('/umas/common/auth/menu', {
    data: {
      platform: 'BACK'
    }
  })
  if (res.success) {
    const currentAppRoutes = res.data.filter(item => item.url === '/rule')?.[0].children || []
    currentAppRoutes.forEach(item => {
      item.level = 2
    })
    const routerList = routersToList(constantRoutes)
    console.log('routerList===>', routerList)
    const asyncRoutes = transformrRoute(routerList, currentAppRoutes)
    return asyncRoutes
    // permissionStore.setConfigMenus(asyncRoutes)
  }
}
export const transformrRoute = (localRoutes: any[], asyncRoutes: any[]) => {
  if (!asyncRoutes.length) return []
  function setRoute(routes: any[]) {
    routes.forEach(route => {
      const asRoute = localRoutes.find(localRoute => localRoute.path === route.url) || {}
      route.meta = {
        ...asRoute.meta
      }

      route.component = asRoute.component
      //   route.name = asRoute.name
      route.path = asRoute.path || route.url
      route.redirect = asRoute.redirect
      route.hidden = asRoute.hidden
      route.alwaysShow = asRoute.alwaysShow
      route.children = route.children || []
      //   route.meta.title = asRoute.meta.title
      //   route.meta.icon = asRoute.meta.icon
      //   route.meta.noCache = asRoute.meta.noCache
      //   route.meta.breadcrumb = asRoute.meta.breadcrumb
      //   route.meta.activeMenu = asRoute.meta.activeMenu
      //   route.meta.hidden = asRoute.meta.hidden
      //   route.meta.alwaysShow = asRoute.meta.alwaysShow
      if (route.children && route.children.length) {
        setRoute(route.children)
      }
    })
  }
  setRoute(asyncRoutes)
  return asyncRoutes
}
const routersToList = (routes: any[]) => {
  const list = []
  function findRoute(routes: any[]) {
    routes.forEach(route => {
      list.push(route)
      if (route.children && route.children.length) {
        findRoute(route.children)
      }
    })
  }
  findRoute(routes)
  return list
}

export const getButtonPermission = async () => {
  const res = await http.post<any, RestResult>('/umas/common/auth/function', {
    data: {
      platform: 'BACK'
    }
  })

  if (res.success) {
    const codeList = res.data.map((item: any) => item.code)

    usePermissionStore().setFunctionCode(codeList)
  }
}
export const hasPermission = (code: string | string[]) => {
  const codeList = usePermissionStore().functionCode

  if (Array.isArray(code)) {
    return codeList.some(item => code.includes(item))
  } else {
    return codeList.includes(code)
  }
}
