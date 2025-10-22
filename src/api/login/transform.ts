import { CODE_KEY, SUCCESS_CODE } from '@/constants'
import type { UserResult } from './types'

export default {
  login: (data: UserResult) => {
    console.log('login', data)
    return {
      [CODE_KEY]: SUCCESS_CODE, // 转换成标准的返回数据格式
      data
    }
  },
  loginOut: () => {
    console.log('loginOut')
    return {
      [CODE_KEY]: SUCCESS_CODE,
      data: {}
    }
  }
}
