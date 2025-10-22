// 登录表单
export type UserLoginType = {
  username: string
  password: string
  captcha?: any
}

export type DataInfo<T> = {
  accessToken: string
  refreshToken: string
  expires: T
  username: string
  roles: Array<string>
}

//保存的用户信息
export type UserInfoType = {
  username: string
  password: string
  id?: number
  roles?: string[]
  expires: number
  xid?: number
  init?: number
  access_token?: string
  refresh_token?: string
  scope: string
  token_type: string
  // grant_type: 'password'
  // scope: 'read'
  // client_id: 'manage-client'
  // client_secret: 'manage-client'
  // role: string
  // roleId: string
  // permissions: string | string[]
}

//登录接口返回的结果
export type UserResult = {
  u: {
    username: string
    id: number
    xid?: number
    init?: number
  }
  roles?: string[]
  scope: string
  token_type: string
  access_token?: string
  refresh_token: string
  expires_in: number
}
export type UserResponseData = {
  username: string
  role: string
  roleId: string
  menu: string[]
}
