import type {
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosRequestConfig,
  AxiosInstance,
  AxiosRequestHeaders,
  AxiosError
} from 'axios'

export {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse
}

export interface RequestInterceptors<T> {
  // 请求拦截
  requestInterceptors?: (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig
  requestInterceptorsCatch?: (err: any) => any
  // 响应拦截
  responseInterceptors?: (config: T) => T
  responseInterceptorsCatch?: (err: any) => any
}

export interface RequestConfig<T = AxiosResponse> extends AxiosRequestConfig {
  interceptors?: RequestInterceptors<T>
  fetchOptions?: {
    skipResponseInterceptors?: boolean
  }
}

export interface Response<T = any, D = any> extends AxiosResponse<T, D> {
  config: InternalAxiosRequestConfig<D> & {
    fetchOptions?: {
      skipResponseInterceptors?: boolean
    }
  }
}

export interface ApiSchemaItem extends RequestConfig {
  loading?: boolean // 是否显示loading (todo)
  params?: undefined | object // 查询参数
  data?: undefined | object // 请求体数据
  dataTransform?: Function // 请求体数据转换函数
  response?: any // 返回的数据类型
  responseTransform?: Function // 返回数据转换函数
}

export type ApiSchema = Record<string, ApiSchemaItem>

export type GetParams<T extends ApiSchema, K extends keyof T> =
  T[K]['params'] extends undefined | object ? T[K]['params'] : void

export type PostParams<T extends ApiSchema, K extends keyof T> =
  T[K]['data'] extends undefined | object ? T[K]['data'] : void

// type ApiMethods<T extends ApiSchema> = {
//   [K in keyof T]: T[K]['method'] extends 'get'
//     ? GetParams<T, K>
//     : PostParams<T, K>
// }
