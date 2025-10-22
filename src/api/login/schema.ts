import { generateApiMethods, type ApiSchema } from '@/axios/service'
import transform from './transform'
import type { UserLoginType, UserResult } from './types'

const apiSchema = {
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
        // scope: 'read',
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

export default generateApiMethods(apiSchema, transform)
