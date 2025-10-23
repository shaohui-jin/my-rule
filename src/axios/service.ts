import axios, { type AxiosError } from 'axios'
import { defaultRequestInterceptors, defaultResponseInterceptors } from './config'

import type {
  AxiosInstance,
  InternalAxiosRequestConfig,
  RequestConfig,
  Response,
  AxiosResponse
} from './types'
import { ElMessage } from 'element-plus'
import { CODE_KEY, REQUEST_TIMEOUT, SUCCESS_CODE, TRANSFORM_REQUEST_DATA } from '@/constants'
import { useUserStoreHook } from '@/store/modules/user'
import qs from 'qs'
import { objToFormData } from '@/utils'

export const PATH_URL = import.meta.env.VITE_API_BASE_PATH

const abortControllerMap: Map<string, AbortController> = new Map()

const axiosInstance: AxiosInstance = axios.create({
  timeout: REQUEST_TIMEOUT,
  baseURL: PATH_URL
})

axiosInstance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const controller = new AbortController()
  const url = config.url || ''
  config.signal = controller.signal
  abortControllerMap.set(url, controller)

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
})

axiosInstance.interceptors.response.use(
  (res: AxiosResponse) => {
    const url = res.config.url || ''
    abortControllerMap.delete(url)
    if (res?.config?.fetchOptions?.skipResponseInterceptors) {
      return res
    }
    if (res?.config?.responseType === 'blob') {
      // 如果是文件流，直接过
      return res
    } else if (res.data[CODE_KEY] === SUCCESS_CODE || res.data.access_token) {
      return res.data
    } else {
      ElMessage.error(response?.data?.error?.message)
    }
  },
  (error: AxiosError) => {
    console.log('err： ' + error) // for debug
    // 登陆超时
    const message = (error.response?.data as any)?.error?.message || error.message
    ElMessage.error(message)
    return Promise.reject(error)
  }
)

const service = {
  request: (config: RequestConfig) => {
    return new Promise((resolve, reject) => {
      if (config.interceptors?.requestInterceptors) {
        config = config.interceptors.requestInterceptors(config as any)
      }

      axiosInstance
        .request(config)
        .then(res => {
          resolve(res)
        })
        .catch((err: any) => {
          reject(err)
        })
    })
  },
  cancelRequest: (url: string | string[]) => {
    const urlList = Array.isArray(url) ? url : [url]
    for (const _url of urlList) {
      abortControllerMap.get(_url)?.abort()
      abortControllerMap.delete(_url)
    }
  },
  cancelAllRequest() {
    for (const [_, controller] of abortControllerMap) {
      controller.abort()
    }
    abortControllerMap.clear()
  }
}

export default service
interface ApiSchemaItem extends RequestConfig {
  loading?: boolean // 是否显示loading (todo)
  params?: undefined | object // 查询参数
  data?: undefined | object // 请求体数据
  dataTransform?: Function // 请求体数据转换函数
  response?: any // 返回的数据类型
  responseTransform?: Function // 返回数据转换函数
}

export type ApiSchema = Record<string, ApiSchemaItem>

type GetParams<T extends ApiSchema, K extends keyof T> =
  T[K]['params'] extends undefined | object ? T[K]['params'] : void

type PostParams<T extends ApiSchema, K extends keyof T> =
  T[K]['data'] extends undefined | object ? T[K]['data'] : void


type ApiMethods<T extends ApiSchema> = {
  [K in keyof T]: T[K]['method'] extends 'get'
    ? GetParams<T, K>
    : PostParams<T, K>
}

export const generateApiMethods = <T extends ApiSchema>(
  config: T,
  transformResConfig?: Record<string, (res: any) => any>
): {
  [K in keyof T]: (dataOrParams: ApiMethods<T>) => Promise<T[K]['response']>
} => {
  const apiMethods = {} as {
    [K in keyof T]: (dataOrParams: any) => Promise<T[K]['response']>
  }
  Object.keys(config).forEach(key => {
    const {
      url = '',
      method = 'post',
      // loading = false,
      data,
      params,
      responseTransform = transformResConfig?.[key],
      dataTransform,
      ...others
    } = config[key]

    apiMethods[key as keyof T] = (dataOrParams: any): Promise<T[keyof T]['response']> => {
      const dataKey = method === 'post' ? 'data' : 'params'
      const options: RequestConfig = {
        [dataKey]: { ...data, ...params, ...dataOrParams },
        ...others
      }
      const _data = dataTransform ? dataTransform(options.data) : options.data
      // 匹配 url 的 params 参数
      let _url = url
      if (/:(\w+)/.test(url) && options.params) {
        for (const p in options.params) {
          _url = url.replace(new RegExp(`:${p}`), options.params[p])
        }
        options.params = undefined
      }
      return service
        .request({
          ...options,
          url: _url,
          data: _data,
          method,
          fetchOptions: { skipResponseInterceptors: true }
        })
        .then((res: Response) => {
          // 处理下载 blob
          if (options.responseType === 'blob') {
            return downloadBlob(res)
          }
          // 如果有对应的 transform，则对 data 进行过滤
          if (responseTransform) {
            res.data = responseTransform(res.data) // 前端可以通过 responseTransform 返回自己想要的格式数据
          }
          delete res?.config?.fetchOptions?.skipResponseInterceptors
          return res as T[keyof T]['response']
        })
    }
  })

  return apiMethods
}

export function downloadBlob<T extends BlobPart>(res: Response<T>, blobType?: string): void {
  const contentDisposition = res.headers['content-disposition']
  const fileName = contentDisposition?.split('filename=')?.pop()?.replace(/"/g, '') || 'unknown'
  const fileExtension = fileName.split('.').pop() || 'octet-stream'
  const type = blobType || `application/${fileExtension}`
  const blob = new Blob([res.data], { type })
  // 处理文件下载
  if ('msSaveOrOpenBlob' in navigator) {
    // 兼容 IE 浏览器
    ;(navigator as any).msSaveOrOpenBlob(blob, fileName)
  } else {
    // 现代浏览器
    const link = document.createElement('a')
    link.download = fileName
    link.style.display = 'none'
    link.href = URL.createObjectURL(blob)

    document.body.appendChild(link)
    link.click()

    // 释放 URL 对象
    URL.revokeObjectURL(link.href)
    document.body.removeChild(link)
  }
}
