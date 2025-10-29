import {
  RouteRecordRaw,
  RouteComponent,
} from 'vue-router'
import {
  isString,
  cloneDeep,
  isAllEmpty,
  intersection,
  storageLocal,
} from '@pureadmin/utils'
import { buildHierarchyTree } from '@/utils/tree'

function handRank(routeInfo: any) {
  const { name, path, parentId, meta } = routeInfo
  return isAllEmpty(parentId)
    ? isAllEmpty(meta?.rank) || (meta?.rank === 0 && name !== 'Home' && path !== '/')
      ? true
      : false
    : false
}

/** 按照路由中meta下的rank等级升序来排序路由 */
function ascending(arr: any[]) {
  arr.forEach((v, index) => {
    // 当rank不存在时，根据顺序自动创建，首页路由永远在第一位
    if (handRank(v)) v.meta.rank = index + 2
  })
  return arr.sort((a: { meta: { rank: number } }, b: { meta: { rank: number } }) => {
    return a?.meta.rank - b?.meta.rank
  })
}

/** 过滤meta中showLink为false的菜单 */
function filterTree(data: RouteComponent[]) {
  const newTree = cloneDeep(data).filter(
    (v: { meta: { showLink: boolean } }) => v.meta?.showLink !== false
  )
  newTree.forEach((v: { children }) => v.children && (v.children = filterTree(v.children)))
  return newTree
}

/** 过滤children长度为0的的目录，当目录下没有菜单时，会过滤此目录，目录没有赋予roles权限，当目录下只要有一个菜单有显示权限，那么此目录就会显示 */
function filterChildrenTree(data: RouteComponent[]) {
  const newTree = cloneDeep(data).filter((v: any) => v?.children?.length !== 0)
  newTree.forEach((v: { children }) => v.children && (v.children = filterTree(v.children)))
  return newTree
}

/** 判断两个数组彼此是否存在相同值 */
function isOneOfArray(a: Array<string>, b: Array<string>) {
  return Array.isArray(a) && Array.isArray(b)
    ? intersection(a, b).length > 0
      ? true
      : false
    : true
}

/** 从sessionStorage里取出当前登陆用户的角色roles，过滤无权限的菜单 */
function filterNoPermissionTree(data: RouteComponent[]) {
  const currentRoles = storageLocal().getItem<DataInfo<number>>(sessionKey)?.roles ?? []
  const newTree = cloneDeep(data).filter((v: any) => isOneOfArray(v.meta?.roles, currentRoles))
  newTree.forEach((v: any) => v.children && (v.children = filterNoPermissionTree(v.children)))
  return filterChildrenTree(newTree)
}


/**
 * 将多级嵌套路由处理成一维数组
 * @param routesList 传入路由
 * @returns 返回处理后的一维路由
 */
function formatFlatteningRoutes(routesList: RouteRecordRaw[]) {
  if (routesList.length === 0) return routesList
  let hierarchyList = buildHierarchyTree(routesList)
  for (let i = 0; i < hierarchyList.length; i++) {
    if (hierarchyList[i].children) {
      hierarchyList = hierarchyList
        .slice(0, i + 1)
        .concat(hierarchyList[i].children, hierarchyList.slice(i + 1))
    }
  }
  return hierarchyList
}

/**
 * 一维数组处理成多级嵌套数组（三级及以上的路由全部拍成二级，keep-alive 只支持到二级缓存）
 * https://github.com/pure-admin/vue-pure-admin/issues/67
 * @param routesList 处理后的一维路由菜单数组
 * @returns 返回将一维数组重新处理成规定路由的格式
 */
function formatTwoStageRoutes(routesList: RouteRecordRaw[]) {
  if (routesList.length === 0) return routesList
  const newRoutesList: RouteRecordRaw[] = []
  routesList.forEach((v: RouteRecordRaw) => {
    if (v.path === '/') {
      newRoutesList.push({
        component: v.component,
        name: v.name,
        path: v.path,
        redirect: v.redirect,
        meta: v.meta,
        children: []
      })
    } else {
      newRoutesList[0]?.children.push({ ...v })
    }
  })
  return newRoutesList
}




export {
  ascending,
  filterTree,
  isOneOfArray,
  formatTwoStageRoutes,
  formatFlatteningRoutes,
  filterNoPermissionTree,
}
