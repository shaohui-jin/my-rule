import { defineStore } from 'pinia'
import { store } from '@/store'
import { userType } from './types'
import { routerArrays } from '@/layout/types'
import { router, resetRouter } from '@/router'
import { storageLocal } from '@pureadmin/utils'
import { refreshTokenApi } from '@/api/user'
import type { UserLoginType } from '@/api/login/types'
import apis from '@/api/login/schema'
import { UserResult } from '@/api/user'
import { useMultiTagsStoreHook } from '@/store/modules/multiTags'
import { type DataInfo, setToken, removeToken, sessionKey, setUserinfo } from '@/utils/auth'

export const useUserStore = defineStore({
  id: 'pure-user',
  state: (): userType => ({
    // 用户名
    username: storageLocal().getItem<DataInfo<number>>(sessionKey)?.username ?? '',
    // 页面级别权限
    roles: storageLocal().getItem<DataInfo<number>>(sessionKey)?.roles ?? []
  }),
  actions: {
    /** 存储用户名 */
    SET_USERNAME(username: string) {
      this.username = username
    },
    /** 存储角色 */
    SET_ROLES(roles: Array<string>) {
      this.roles = roles
    },
    /** 登入 */
    async loginByUsername(formData: UserLoginType) {
      return new Promise<UserResult>((resolve, reject) => {
        apis
          .login({
            ...formData
          })
          .then(res => {
            const data = res.data
            if (data?.access_token) {
              setToken({
                expires: data.expires_in,
                accessToken: data.access_token,
                refreshToken: data.refresh_token,
                username: data.u.username
              })
            } else if (res?.data.u) {
              setUserinfo(res.data.u.username)
            }
            resolve(res.data)
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    /** 前端登出（不调用接口） */
    logOut() {
      this.username = ''
      this.roles = []
      apis.loginOut()
      removeToken()
      useMultiTagsStoreHook().handleTags('equal', [...routerArrays])
      resetRouter()
      if (window.__POWERED_BY_WUJIE__) {
        window.$wujie.bus.$emit('toLogin')
      } else {
        router.push('/login')
      }
    },
    /** 刷新`token` */
    async handRefreshToken(refreshToken: string) {
      return new Promise<UserResult>((resolve, reject) => {
        refreshTokenApi(refreshToken)
          .then(data => {
            if (data) {
              setToken({
                expires: data.expires_in,
                accessToken: data.access_token,
                refreshToken: data.refresh_token
              })
              resolve(data)
            }
          })
          .catch(error => {
            reject(error)
          })
      })
    }
  }
})

export function useUserStoreHook() {
  return useUserStore(store)
}
