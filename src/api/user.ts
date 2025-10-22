import { http } from '@/utils/http'

export type UserResult = {
  /** 用户名 */
  u: {
    username: string
    id: number
  }
  /** 当前登陆用户的角色 */
  roles?: Array<string>
  /** `token` */
  access_token?: string
  /** 用于调用刷新`accessToken`的接口时所需的`token` */
  refresh_token?: string
  /** `accessToken`的过期时间（格式'xxxx/xx/xx xx:xx:xx'） */
  expires_in?: number
}

/** 登录 */
export const getLogin = (data?: object) => {
  return http.request<UserResult>('post', '/public/oauth2/token',
    {
      headers:
      {
        'Content-Type':'application/x-www-form-urlencoded'
      }
    },
    {
      data: {
        username: data.username,
        password: data.password,
        grant_type: 'password',
        scope: 'read',
        client_id: 'manage-client',
        client_secret: 'manage-client',
        captcha: data?.captcha
      }
    })
}

/** 刷新token */
export const refreshTokenApi = (refreshToken: string) => {
  return http.request<UserResult>('post', '/public/oauth2/token',
    {
      headers:
      {
        'Content-Type':'application/x-www-form-urlencoded'
      }
    },
    {
      data: {
        grant_type: 'refresh_token',
        client_id: 'manage-client',
        client_secret: 'manage-client',
        refresh_token: refreshToken
      }
    }
  )
}

/** 退出 */
export const logoutApi = () => {
  return http.request<UserResult>('post', '/public/oauth2/logout')
}
