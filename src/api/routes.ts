import { http } from '@/utils/http'

type Result = {
  success: boolean
  data: Array<any>
}

export const getAsyncRoutes = () => {
  return http.request<Result>('get', '/api/getAsyncRoutes', { baseURL: '/' })
  // return http.request<Result>('get', '/umas/authorize/routes/back?code=BACKEND_Perms')
}
