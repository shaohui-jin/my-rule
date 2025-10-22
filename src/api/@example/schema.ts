import { generateApiMethods, type ApiSchema } from '@/axios/service'
import type { UserLoginType, UserResult } from './types'
import transformResConfig from './transformResConfig'

/**
 * 接口模板
 * 会自动生成对应的请求方法
 * 例如：api.login()
 * */
const apiSchema = {
  /**
   * 接口配置
   * 字段对应 axios 的配置项（AxiosRequestConfig）
   * 其中配置的
   *  url 地址可设置变量 例如 '/user/:id' 其中`:id`为 params 中的字段`id`的值
   *  method 可省 默认为 post
   *  data / params 定义请求数据 / 查询参数默认值及类型 会自动合并到方法参数中
   *  dataTransform 请求数据处理函数 可选
   *  response 定义服务器返回数据类型 建议必填
   *  做数据结构转换的话，在transformResConfig.ts文件做配置
   * */
  // 登录
  login: {
    url: '/public/oauth2/token',
    method: 'post',
    data: {} as UserLoginType,
    dataTransform: (data: UserLoginType) => {
      return {
        username: data.username,
        password: data.password,
        grant_type: 'password',
        scope: 'read',
        client_id: 'manage-client',
        client_secret: 'manage-client',
        captcha: data?.captcha
      }
    },
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    response: {} as IResponse<UserResult>
  },
  // 退出登录
  loginOut: {
    url: '/public/oauth2/logout',
    response: {} as IResponse
  }
// eslint-disable-next-line prettier/prettier
} as const satisfies ApiSchema

export default generateApiMethods(apiSchema, transformResConfig)
