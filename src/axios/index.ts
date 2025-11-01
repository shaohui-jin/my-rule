import axios, { type AxiosError } from 'axios'
import type {
  AxiosInstance,
  InternalAxiosRequestConfig,
  RequestConfig,
  Response,
  AxiosResponse
} from './types'
import { ElMessage } from 'element-plus'
import qs from 'qs'
import { objToFormData } from '@/utils'

const SUCCESS_CODE = true
const CODE_KEY = 'success'
const CONTENT_TYPE: AxiosContentType = 'application/json'

const abortControllerMap: Map<string, AbortController> = new Map()

const axiosInstance: AxiosInstance = axios.create({
  timeout: 60000,
  baseURL: '/my-rule'
})

axiosInstance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const controller = new AbortController()
  const url = config.url || ''
  config.signal = controller.signal
  abortControllerMap.set(url, controller)

  if (config.method === 'post') {
    config.data =  config.headers['Content-Type'] === 'application/x-www-form-urlencoded'
      ? qs.stringify(config.data)
      : config.headers['Content-Type'] === 'multipart/form-data'
        ? objToFormData(config.data)
        : config.data
  }

  return config
})

axiosInstance.interceptors.response.use(
  (res: AxiosResponse) => {
    const url = res.config.url || ''
    abortControllerMap.delete(url)

    if (res?.config?.responseType === 'blob') {
      // 如果是文件流，直接过
      return res
    } else if (res.data[CODE_KEY] === SUCCESS_CODE || res.data.access_token) {
      return res.data
    } else {
      ElMessage.error(res?.data?.error?.message)
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


const request = (option: AxiosConfig) => {
  const { url, method, params, data, headers, responseType } = option
  return new Promise((resolve, reject) => {
    axiosInstance
      .request({
        url,
        method,
        params,
        data,
        responseType,
        headers: {
          'Content-Type': CONTENT_TYPE,
          Authorization: '',
          ...headers
        }
      })
      .then(res => {
        if (option.responseType === 'blob') {
          return downloadBlob(res)
          resolve({})
        } else {
          resolve(res)
        }
      })
      .catch(reject)
  })
}
function downloadBlob<T extends BlobPart>(res: Response<T>, blobType?: string): void {
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

export const http = {
  get: <T = any>(option: AxiosConfig) => {
    return request({ method: 'get', ...option }) as Promise<IResponse<T>>
  },
  post: <T = any>(option: AxiosConfig) => {
    return request({ method: 'post', ...option }) as Promise<IResponse<T>>
  },
  delete: <T = any>(option: AxiosConfig) => {
    return request({ method: 'delete', ...option }) as Promise<IResponse<T>>
  },
  put: <T = any>(option: AxiosConfig) => {
    return request({ method: 'put', ...option }) as Promise<IResponse<T>>
  },
  cancelRequest: (url: string | string[]) => {
    const urlList = Array.isArray(url) ? url : [url]
    for (const _url of urlList) {
      abortControllerMap.get(_url)?.abort()
      abortControllerMap.delete(_url)
    }
    return
  },
  cancelAllRequest: () => {
    for (const [_, controller] of abortControllerMap) {
      controller.abort()
    }
    abortControllerMap.clear()
    return
  }
}

