import Cookies from 'js-cookie'
import { storageLocal } from '@pureadmin/utils'
import { useUserStoreHook } from '@/store/modules/user'

export interface DataInfo<T> {
  /** token */
  accessToken: string
  /** `accessToken`的过期时间（秒） */
  expires: T
  /** 用于调用刷新accessToken的接口时所需的token */
  refreshToken: string
  /** 用户名 */
  username?: string
  /** 当前登陆用户的角色 */
  roles?: Array<string>
}

export const sessionKey = 'user-info'
export const TokenKey = 'authorized-token'

/** 获取`token` */
export function getToken(): DataInfo<number> {
  // 此处与`TokenKey`相同，此写法解决初始化时`Cookies`中不存在`TokenKey`报错
  return Cookies.get(TokenKey)
    ? JSON.parse(Cookies.get(TokenKey))
    : storageLocal().getItem(sessionKey)
}

export function getUserinfo(): DataInfo<number> {
  // 此处与`TokenKey`相同，此写法解决初始化时`Cookies`中不存在`TokenKey`报错
  return storageLocal().getItem(sessionKey)
}

/**
 * @description 设置`token`以及一些必要信息并采用无感刷新`token`方案
 * 无感刷新：后端返回`accessToken`（访问接口使用的`token`）、`refreshToken`（用于调用刷新`accessToken`的接口时所需的`token`，`refreshToken`的过期时间（比如30天）应大于`accessToken`的过期时间（比如2小时））、`expires`（`accessToken`的过期时间）
 * 将`accessToken`、`expires`这两条信息放在key值为authorized-token的cookie里（过期自动销毁）
 * 将`username`、`roles`、`refreshToken`、`expires`这四条信息放在key值为`user-info`的sessionStorage里（浏览器关闭自动销毁）
 */
export function setToken(data: DataInfo<number>) {
  const { accessToken, refreshToken } = data
  //转换成毫秒
  const expires = data.expires * 1000
  const cookieString = JSON.stringify({ accessToken, expires })

  const expiresTime = new Date()
  expiresTime.setTime(expiresTime.getTime() + expires)

  expires > 0
    ? Cookies.set(TokenKey, cookieString, {
        expires: expiresTime
      })
    : Cookies.set(TokenKey, cookieString)

  function setSessionKey(username: string, roles: Array<string>) {
    useUserStoreHook().SET_USERNAME(username)
    useUserStoreHook().SET_ROLES(roles)
    storageLocal().setItem(sessionKey, {
      refreshToken: refreshToken,
      username,
      roles
    })
  }

  if (data.username && data.roles) {
    const { username, roles } = data
    setSessionKey(username, roles)
  } else {
    const username = storageLocal().getItem<DataInfo<number>>(sessionKey)?.username ?? ''
    const roles = storageLocal().getItem<DataInfo<number>>(sessionKey)?.roles ?? []
    setSessionKey(username, roles)
  }
}

/** 删除`token`以及key值为`user-info`的session信息 */
export function removeToken() {
  Cookies.remove(TokenKey)
  sessionStorage.clear()
}

/** 格式化token（jwt格式） */
export const formatToken = (token: string): string => {
  return 'Bearer ' + token
}

export function setUserinfo(username: string) {
  if (username) {
    useUserStoreHook().SET_USERNAME(username)
    storageLocal().setItem(sessionKey, {
      username
    })
  }
}

export function appendRoles(roles) {
  let userinfo=storageLocal().getItem(sessionKey);
  userinfo.roles=roles;
  storageLocal().setItem(sessionKey,userinfo);
}
