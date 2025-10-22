import type { InternalAxiosRequestConfig, Response } from './types'
import { ElMessage } from 'element-plus'
import qs from 'qs'
import { SUCCESS_CODE, CODE_KEY, TRANSFORM_REQUEST_DATA } from '@/constants'
import { useUserStoreHook } from '@/store/modules/user'
import { objToFormData } from '@/utils'

const defaultRequestInterceptors = (config: InternalAxiosRequestConfig) => {
  //暂时注释，服务端要求启用再启用
  // config.headers['api-proxy-url']=config.url?.replace(/^\/api\//, '');

  // 开发base环境下，默认加上/api前缀代理
  // if (import.meta.env.MODE === 'development') {
  if (!config.url?.startsWith('/mock/')) {
    config.url = `/api${config.url}`
  }
  // }

  if (
    config.method === 'post' &&
    config.headers['Content-Type'] === 'application/x-www-form-urlencoded'
  ) {
    config.data = qs.stringify(config.data)
  } else if (
    TRANSFORM_REQUEST_DATA &&
    config.method === 'post' &&
    config.headers['Content-Type'] === 'multipart/form-data'
  ) {
    config.data = objToFormData(config.data)
  }

  if (config.method === 'get' && config.params) {
    let url = config.url as string
    url += '?'
    const keys = Object.keys(config.params)
    for (const key of keys) {
      if (config.params[key] !== void 0 && config.params[key] !== null) {
        url += `${key}=${encodeURIComponent(config.params[key])}&`
      }
    }
    url = url.substring(0, url.length - 1)
    config.params = {}
    config.url = url
  }
  return config
}

const defaultResponseInterceptors = (response: Response) => {
  if (response?.config?.fetchOptions?.skipResponseInterceptors) {
    return response
  }
  if (response?.config?.responseType === 'blob') {
    // 如果是文件流，直接过
    return response
  } else if (response.data[CODE_KEY] === SUCCESS_CODE || response.data.access_token) {
    return response.data
  } else {
    ElMessage.error(response?.data?.error?.message)
    // 会话过期或者令牌无效时，需要用户重新登录
    if (/401$/.test(response?.data?.error?.code)) {
      const userStore = useUserStoreHook()
      userStore.logOut()
    }
  }
}

export { defaultResponseInterceptors, defaultRequestInterceptors }
