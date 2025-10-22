import Axios, { AxiosInstance, AxiosRequestConfig, CustomParamsSerializer } from 'axios'
import { PureHttpError, RequestMethods, PureHttpResponse, PureHttpRequestConfig } from './types.d'
import { stringify } from 'qs'
import NProgress from '../progress'
import { getToken, formatToken, getUserinfo } from '@/utils/auth'
import { useUserStoreHook } from '@/store/modules/user'
import { router } from '@/router'
import { storageLocal } from '@pureadmin/utils'
import { sessionKey } from '@/utils/auth'
import { ElMessage } from 'element-plus'
import Cookies from 'js-cookie'

// 相关配置请参考：www.axios-js.com/zh-cn/docs/#axios-request-config-1
const defaultConfig: AxiosRequestConfig = {
  withCredentials: true,
  // 请求超时时间
  timeout: 13000,
  headers: {
    Accept: 'application/json, text/plain, */*',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  // 数组格式参数序列化（https://github.com/axios/axios/issues/5142）
  paramsSerializer: {
    serialize: stringify as unknown as CustomParamsSerializer
  }
}

class PureHttp {
  constructor() {
    this.httpInterceptorsRequest()
    this.httpInterceptorsResponse()
  }

  /** token过期后，暂存待执行的请求 */
  private static requests = []

  /** 防止重复刷新token */
  private static isRefreshing = false

  /** 初始化配置对象 */
  private static initConfig: PureHttpRequestConfig = {}

  /** 保存当前Axios实例对象 */
  private static axiosInstance: AxiosInstance = Axios.create(defaultConfig)

  private static headerToken = import.meta.env.VITE_TOKEN_TYPE == 'header'

  /** 重连原始请求 */
  private static retryOriginalRequest(config: PureHttpRequestConfig) {
    return new Promise(resolve => {
      PureHttp.requests.push((token: string) => {
        if (PureHttp.headerToken) {
          config.headers['Authorization'] = formatToken(token)
        }
        resolve(config)
      })
    })
  }

  /** 重定向到登录页 */
  private static redirectToLoginPage(): void {
    const isWujieSub = window.__POWERED_BY_WUJIE__
    if (!isWujieSub) {
      storageLocal().removeItem(sessionKey)
      router.push('/login').then(err => console.error(err))
    } else {
      window.$wujie.bus.$emit('toLogin')
    }
  }

  /** 重定向到错误页 */
  private static redirectToError(): void {
    router.push('/error/500').then(err => console.error(err))
  }

  /** 请求拦截 */
  private httpInterceptorsRequest(): void {
    PureHttp.axiosInstance.interceptors.request.use(
      async (config: PureHttpRequestConfig) => {
        // 开启进度条动画
        NProgress.start()
        // 优先判断post/get等方法是否传入回掉，否则执行初始化设置等回掉
        if (typeof config.beforeRequestCallback === 'function') {
          config.beforeRequestCallback(config)
          return config
        }
        if (PureHttp.initConfig.beforeRequestCallback) {
          PureHttp.initConfig.beforeRequestCallback(config)
          return config
        }
        /** 请求白名单，放置一些不需要token的接口（通过设置请求白名单，防止token过期后再请求造成的死循环问题） */
        const whiteList = ['/refreshToken', '/public/oauth2/token']
        return whiteList.some(v => config.url.indexOf(v) > -1)
          ? config
          : new Promise(resolve => {
              if (!PureHttp.headerToken) {
                // const data = getUserinfo()
                // if (!data) {
                //   PureHttp.redirectToLoginPage()
                // }
                resolve(config)
              } else {
                this.processHeaerRequest(resolve, config)
              }
            })
      },
      error => {
        return Promise.reject(error)
      }
    )
  }

  private processHeaerRequest(resolve, config): void {
    const data = getToken()
    // if (!data) {
    //   PureHttp.redirectToLoginPage()
    // }
    if (data.accessToken) {
      config.headers['Authorization'] = formatToken(data.accessToken)
      resolve(config)
    } else {
      if (!PureHttp.isRefreshing) {
        PureHttp.isRefreshing = true
        // token过期刷新
        useUserStoreHook()
          .handRefreshToken(data.refreshToken)
          .then(data => {
            const token = data.access_token
            config.headers['Authorization'] = formatToken(token)
            PureHttp.requests.forEach(cb => cb(token))
            PureHttp.requests = []
          })
          .catch(() => {
            // PureHttp.redirectToLoginPage()
          })
          .finally(() => {
            PureHttp.isRefreshing = false
          })
      }
      resolve(PureHttp.retryOriginalRequest(config))
    }
  }

  /** 响应拦截 */
  private httpInterceptorsResponse(): void {
    const instance = PureHttp.axiosInstance
    instance.interceptors.response.use(
      (response: PureHttpResponse) => {
        if (response.config.url === '/api/getAsyncRoutes') {
          response.data = {
            code: 200,
            msg: '方法调用正常',
            data: {
              routes: [
                {
                  role: 'BACKEND_Prods_C_Reso',
                  auths: [
                    'C_Reso:Model',
                    'C_Reso:Map',
                    'C_Reso:Material',
                    'C_Reso:Vray',
                    'C_Reso:line',
                    'C_Reso:add',
                    'C_Reso:onoff',
                    'C_Reso:addchild',
                    'C_Reso:rename',
                    'C_Reso:perm',
                    'C_Reso:copy',
                    'C_Reso:delete',
                    'C_Reso:sort'
                  ]
                },
                {
                  role: 'BACKEND_Prods_C_Publ',
                  auths: [
                    'C_Publ:Model',
                    'C_Publ:Map',
                    'C_Publ:Dec_Hdws',
                    'C_Publ:add',
                    'C_Publ:onoff',
                    'C_Publ:addchild',
                    'C_Publ:rename',
                    'C_Publ:perm',
                    'C_Publ:copy',
                    'C_Publ:delete',
                    'C_Publ:sort',
                    'C_Publ:DM',
                    'C_Publ:QM',
                    'C_Publ:DB',
                    'C_Publ:Hmap',
                    'C_Publ:FLQK',
                    'C_Publ:FLXY'
                  ]
                },
                {
                  role: 'BACKEND_Prods_C_Prod',
                  auths: [
                    'C_Prod:Cabinet',
                    'C_Prod:Kitchen',
                    'C_Prod:Bath',
                    'C_Prod:Door',
                    'C_Prod:Curtain',
                    'C_Prod:Funiture',
                    'C_Prod:Part',
                    'C_Prod:Line',
                    'C_Prod:Map',
                    'C_Prod:Hard',
                    'C_Prod:add',
                    'C_Prod:onoff',
                    'C_Prod:addchild',
                    'C_Prod:rename',
                    'C_Prod:perm',
                    'C_Prod:copy',
                    'C_Prod:delete',
                    'C_Prod:sort',
                    'C_Prod:Alwindow',
                    'C_Prod:Wallboard'
                  ]
                },
                {
                  role: 'BACKEND_Prods_L_Reso',
                  auths: [
                    'L_Reso:Model',
                    'L_Reso:Map',
                    'L_Reso:Material',
                    'L_Reso:Vray',
                    'L_Reso:line',
                    'L_Reso:add',
                    'L_Reso:onoff',
                    'L_Reso:rename',
                    'L_Reso:perm',
                    'L_Reso:copy',
                    'L_Reso:delete',
                    'L_Reso:sort'
                  ]
                },
                {
                  role: 'BACKEND_Prods_L_Publ',
                  auths: [
                    'L_Publ:Model',
                    'L_Publ:Map',
                    'L_Publ:Dec_Hdws',
                    'L_Publ:add',
                    'L_Publ:onoff',
                    'L_Publ:rename',
                    'L_Publ:perm',
                    'L_Publ:copy',
                    'L_Publ:delete',
                    'L_Publ:sort'
                  ]
                },
                {
                  role: 'BACKEND_Prods_L_Prod',
                  auths: [
                    'L_Prod:Cabinet',
                    'L_Prod:Kitchen',
                    'L_Prod:Bath',
                    'L_Prod:Door',
                    'L_Prod:Curtain',
                    'L_Prod:Funiture',
                    'L_Prod:Part',
                    'L_Prod:Line',
                    'L_Prod:Map',
                    'L_Prod:Hard',
                    'L_Prod:add',
                    'L_Prod:onoff',
                    'L_Prod:rename',
                    'L_Prod:perm',
                    'L_Prod:copy',
                    'L_Prod:delete',
                    'L_Prod:sort',
                    'L_Prod:Alwindow',
                    'L_Prod:Wallboard'
                  ]
                },
                {
                  role: 'BACKEND_Prods_Mod_Publ',
                  auths: [
                    'Mod_Publ:Model',
                    'Mod_Publ:Modelcopy',
                    'Mod_Publ:Modelunlock',
                    'Mod_Publ:Modeledit',
                    'Mod_Publ:Modelreview',
                    'Mod_Publ:Modelpublish',
                    'Mod_Publ:Modelrenew',
                    'Mod_Publ:Modeldelete',
                    'Mod_Publ:Modelrecyclerenew',
                    'Mod_Publ:Modelrecycledelete',
                    'Mod_Publ:Map',
                    'Mod_Publ:Mapcopy',
                    'Mod_Publ:Mapunlock',
                    'Mod_Publ:Mapedit',
                    'Mod_Publ:Mapreview',
                    'Mod_Publ:Mappublish',
                    'Mod_Publ:Maprenew',
                    'Mod_Publ:Mapdelete',
                    'Mod_Publ:Maprecyclerenew',
                    'Mod_Publ:Maprecycledelete',
                    'Mod_Publ:Material',
                    'Mod_Publ:Materialcopy',
                    'Mod_Publ:Materialunlock',
                    'Mod_Publ:Materialedit',
                    'Mod_Publ:Materialreview',
                    'Mod_Publ:Materialpublish',
                    'Mod_Publ:Materialrenew',
                    'Mod_Publ:Materialdelete',
                    'Mod_Publ:Materialrecyclerenew',
                    'Mod_Publ:Materialrecycledelete',
                    'Mod_Publ:Vray',
                    'Mod_Publ:Vraycopy',
                    'Mod_Publ:Vrayunlock',
                    'Mod_Publ:Vrayedit',
                    'Mod_Publ:Vrayreview',
                    'Mod_Publ:Vraypublish',
                    'Mod_Publ:Vrayrenew',
                    'Mod_Publ:Vraydelete',
                    'Mod_Publ:Vrayrecyclerenew',
                    'Mod_Publ:Vrayrecycledelete',
                    'Mod_Publ:line',
                    'Mod_Publ:linecopy',
                    'Mod_Publ:lineunlock',
                    'Mod_Publ:lineedit',
                    'Mod_Publ:linereview',
                    'Mod_Publ:linepublish',
                    'Mod_Publ:linerenew',
                    'Mod_Publ:linedelete',
                    'Mod_Publ:linerecyclerenew',
                    'Mod_Publ:linerecycledelete'
                  ]
                },
                {
                  role: 'BACKEND_Prods_Mod_Users',
                  auths: [
                    'Mod_Users:Model',
                    'Mod_Users:Modelcopy',
                    'Mod_Users:Modeldelete',
                    'Mod_Users:Modelrecyclerenew',
                    'Mod_Users:Modelcycledelete',
                    'Mod_Users:Map',
                    'Mod_Users:Mapcopy',
                    'Mod_Users:Mapdelete',
                    'Mod_Users:Maprecyclerenew',
                    'Mod_Users:Mapcycledelete',
                    'Mod_Users:Line',
                    'Mod_Users:Linecopy',
                    'Mod_Users:Linedelete',
                    'Mod_Users:Linerecyclerenew',
                    'Mod_Users:Linecycledelete'
                  ]
                },
                {
                  role: 'BACKEND_Prods_Dec_Models',
                  auths: [
                    'Dec_Modelsadd',
                    'Dec_Modelsdetele',
                    'Dec_Modelsedit',
                    'Dec_Modelslock',
                    'Dec_Modelsmap',
                    'Dec_Modelslife',
                    'Dec_Modelsrecyclerenew',
                    'Dec_Modelsrecycledelete'
                  ]
                },
                {
                  role: 'BACKEND_Prods_Dec_Maps',
                  auths: [
                    'Dec_Mapsadd',
                    'Dec_Mapsdetele',
                    'Dec_Mapsedit',
                    'Dec_Mapslock',
                    'Dec_Mapslife',
                    'Dec_Mapsrecyclerenew',
                    'Dec_Mapsrecycledelete'
                  ]
                },
                {
                  role: 'BACKEND_Prods_Dec_Hdws',
                  auths: [
                    'Dec_Hdwsadd',
                    'Dec_Hdwsdetele',
                    'Dec_Hdwsedit',
                    'Dec_Hdwslock',
                    'Dec_Hdwslife',
                    'Dec_Hdwsrecyclerenew',
                    'Dec_Hdwsrecycledelete',
                    'Dec_Hmap',
                    'Dec_Hdws'
                  ]
                },
                {
                  role: 'BACKEND_Prods_Prod_Cus',
                  auths: [
                    'Prod:Cabinet',
                    'Prod:Kitchen',
                    'Prod:Bath',
                    'Prod:Door',
                    'Prod:Alwindow',
                    'Prod:Wallboard',
                    'Prod:Curtain',
                    'Prod_Cus:operate_test',
                    'Prod_Cus:operate_in',
                    'Prod_Cus:operate_on',
                    'Prod_Cus:operate_off',
                    'Prod_Cus:create',
                    'Prod_Cus:sync',
                    'Prod_Cus:from3',
                    'Prod_Cus:look',
                    'Prod_Cus:edit',
                    'Prod_Cus:veredit'
                  ]
                },
                {
                  role: 'BACKEND_Prods_Monitor_Vray',
                  auths: [
                    'Monitor_Vray:model',
                    'Monitor_Vray:modeltest',
                    'Monitor_Vray:modelretrieve',
                    'Monitor_Vray:modelrepeat',
                    'Monitor_Vray:modeltestresult',
                    'Monitor_Vray:map',
                    'Monitor_Vray:maptest',
                    'Monitor_Vray:mapretrieve',
                    'Monitor_Vray:maprepeat',
                    'Monitor_Vray:maptestresult'
                  ]
                },
                {
                  role: 'BACKEND_Prods_Monitor_Modelauto',
                  auths: [
                    'Monitor_Modelauto:repeat',
                    'Monitor_Modelauto:delete',
                    'Monitor_Modelauto:onoff',
                    'Monitor_Modelauto:predecessors'
                  ]
                },
                {
                  role: 'BACKEND_Prods_Convert_Data',
                  auths: [
                    'BACKEND_Prods_Convert_Data:RiverSea',
                    'BACKEND_Prods_Convert_Data:Drawer'
                  ]
                },
                {
                  role: 'BACKEND_Prods_Convert_ModelMerge',
                  auths: [
                    'BACKEND_Prods_Convert_ModelMerge:OneToMany',
                    'BACKEND_Prods_Convert_ModelMerge:ManyToOne'
                  ]
                },
                {
                  role: 'BACKEND_Perms_Org',
                  auths: [
                    'Perms_Org:add',
                    'Perms_Org:edit',
                    'Perms_Org:delete',
                    'Perms_Org:read',
                    'Perms_Org:empower',
                    'Perms_Org:roles',
                    'Perms_Org:updatedealer'
                  ]
                },
                {
                  role: 'BACKEND_Perms_User',
                  auths: [
                    'BACKEND_Perms_User:add',
                    'Perms_User:edit',
                    'Perms_User:delete',
                    'Perms_User:read',
                    'Perms_User:onoff',
                    'BACKEND_Perms_User:empower',
                    'Perms_User:roles',
                    'BACKEND_Perms_User:lifespan'
                  ]
                },
                {
                  role: 'BACKEND_Perms_Ugroup',
                  auths: [
                    'Perms_Ugroup:add',
                    'Perms_Ugroup:edit',
                    'Perms_Ugroup:delete',
                    'Perms_Ugroup:onoff',
                    'BACKEND_Perms_Ugroup:empower',
                    'Perms_Ugroup:roles',
                    'BACKEND_Perms_Ugroup:mbset',
                    'Perms_Ugroup:users',
                    'Perms_Ugroup:Uadd',
                    'Perms_Ugroup:Udelete',
                    'Perms_Ugroup:shops',
                    'Perms_Ugroup:Sadd',
                    'Perms_Ugroup:Sdelete',
                    'Perms_Ugroup:provinces',
                    'Perms_Ugroup:Padd',
                    'Perms_Ugroup:Pdelete',
                    'Perms_Ugroup:brands',
                    'Perms_Ugroup:Badd',
                    'Perms_Ugroup:Bdelete',
                    'Perms_Ugroup:dealers',
                    'Perms_Ugroup:Dadd',
                    'Perms_Ugroup:Ddelete'
                  ]
                }
              ],
              roles: [
                'BACKEND_Users',
                'BACKEND_Perms_Menu',
                'BACKEND_Perms_Function',
                'BACKEND_Perms_Data',
                'BACKEND_Perms_Role',
                'BACKEND_Perms_Brand',
                'BACKEND_Perms_Orgtype',
                'BACKEND_Perms_Org',
                'BACKEND_Perms_User',
                'BACKEND_Perms_Thridrole',
                'BACKEND_Perms_Ugroup',
                'BACKEND_Prods',
                'BACKEND_Prods_Basic',
                'BACKEND_Prods_Class',
                'BACKEND_Prods_Type',
                'BACKEND_Prods_Tyclass',
                'BACKEND_Prods_SysCL',
                'BACKEND_Prods_C',
                'BACKEND_Prods_C_Reso',
                'BACKEND_Prods_C_Publ',
                'BACKEND_Prods_C_Prod',
                'BACKEND_Prods_L',
                'BACKEND_Prods_L_Reso',
                'BACKEND_Prods_L_Publ',
                'BACKEND_Prods_L_Prod',
                'BACKEND_Prods_CL',
                'BACKEND_Prods_CL_Reso',
                'BACKEND_Prods_CL_Publ',
                'BACKEND_Prods_CL_Prod',
                'BACKEND_Prods_Mod',
                'BACKEND_Prods_Mod_Publ',
                'BACKEND_Prods_Mod_Users',
                'BACKEND_Prods_Dec',
                'BACKEND_Prods_Dec_Models',
                'BACKEND_Prods_Dec_Maps',
                'BACKEND_Prods_Dec_Hdws',
                'BACKEND_Prods_Prod',
                'BACKEND_Prods_Prod_Cus',
                'BACKEND_Prods_Prod_Funi',
                'BACKEND_Prods_Prod_Parts',
                'BACKEND_Prods_Prod_lines',
                'BACKEND_Prods_Prod_Maps',
                'BACKEND_Prods_Prod_Page',
                'BACKEND_Prods_Prod_Hard',
                'BACKEND_Prods_Monitor',
                'BACKEND_Prods_Monitor_Vray',
                'BACKEND_Prods_Monitor_Modelauto',
                'BACKEND_Prods_CD',
                'BACKEND_Prods_CD_Rules',
                'BACKEND_Prods_CD_Num',
                'BACKEND_Prods_Pri',
                'BACKEND_Prods_Pri_CRM',
                'BACKEND_Prods_BJ',
                'BACKEND_Prods_BJ_Units',
                'BACKEND_Prods_BJ_BJc',
                'BACKEND_Prods_BJ_Vprod',
                'BACKEND_Process',
                'BACKEND_Process_Con',
                'BACKEND_Process_Con_Ev',
                'BACKEND_Process_Con_PEv',
                'BACKEND_Process_Con_Flow',
                'BACKEND_Process_Con_Hdl',
                'BACKEND_Process_Con_Bh',
                'BACKEND_Process_Con_Bht',
                'BACKEND_Process_Con_Dt',
                'BACKEND_Operate',
                'BACKEND_Operate_FB',
                'BACKEND_Operate_FB_Data',
                'BACKEND_Operate_FB_Type',
                'BACKEND_Operate_Mes',
                'BACKEND_Operate_Mes_Sys',
                'BACKEND_Operate_Mes_Cus',
                'BACKEND_Operate_Ver',
                'BACKEND_Operate_Wc',
                'BACKEND_Operate_Load',
                'BACKEND_Operate_Car',
                'BACKEND_Operate_Wc_NF',
                'BACKEND_Operate_Wc_Tut',
                'BACKEND_Operate_Gui',
                'BACKEND_Perms_Sys',
                'BACKEND_Perms_Sys_Brds',
                'BACKEND_Perms_Sys_Dict',
                'BACKEND_Prods_Chart',
                'BACKEND_Operate_Hx',
                'BACKEND_Perms',
                'BACKEND_Operate_LOGO',
                'BACKEND_Prods_Convert',
                'BACKEND_Prods_Convert_Data',
                'BACKEND_Prods_Convert_TopLine',
                'BACKEND_Prods_Convert_ModelMerge',
                'BACKEND_TRANSLATION_HARD_CODE',
                'BACKEND_TRANSLATION_DATA_DICT',
                'BACKEND_TRANSLATION_DATA_SOURCE',
                'BACKEND_Prods_Convert',
                'BACKEND_Prods_Convert_Data',
                'BACKEND_Prods_Convert_TopLine',
                'BACKEND_Prods_Convert_ModelMerge',
                'BACKEND'
              ]
            }
          }
        }

        const $config = response.config
        // 关闭进度条动画
        NProgress.done()
        // 优先判断post/get等方法是否传入回掉，否则执行初始化设置等回掉
        if (typeof $config.beforeResponseCallback === 'function') {
          $config.beforeResponseCallback(response)
          return response.data
        }
        if (PureHttp.initConfig.beforeResponseCallback) {
          PureHttp.initConfig.beforeResponseCallback(response)
          return response.data
        }
        if (response.data.code === 4011 || response.data.code === 4012) {
          ElMessage.error(response.data.msg)
          PureHttp.redirectToLoginPage()
          return
        } else if (response.data.code === -1003) {
          ElMessage.warning(response.data.msg)
          return Promise.reject(response.data.msg)
        }

        return response.data
      },
      (error: PureHttpError) => {
        const $error = error
        $error.isCancelRequest = Axios.isCancel($error)
        NProgress.done()

        // 处理HTTP错误状态码
        if ($error.response) {
          const errorData = $error.response.data

          // 处理401未授权
          if ($error.response.status === 401) {
            const invalidCodes = ['401', '403', '405', '406', '4011', '4012']
            if (invalidCodes.includes($error.response.data?.error?.code)) {
              PureHttp.redirectToLoginPage()
              return Promise.resolve($error)
            }
            ElMessage.error($error.response.data?.error?.errorMsg)
            return Promise.reject($error)
          }

          // 处理后端返回的自定义错误格式
          if (errorData && errorData.error) {
            const errorMsg = errorData.error.message || '请求发生错误'
            ElMessage.error(errorMsg)
            return Promise.reject(errorData.error)
          }

          // 处理其他HTTP错误
          if ($error.response.data && $error.response.data.message) {
            ElMessage.error($error.response.data.message)
          } else {
            ElMessage.error($error.message || '请求发生错误')
          }
        } else if ($error.message.includes('timeout of')) {
          ElMessage.error('网络请求超时,请重试')
        } else {
          ElMessage.error($error.message || '网络错误')
        }

        return Promise.reject($error)
      }
    )
  }

  /** 通用请求工具函数 */
  public request<T>(
    method: RequestMethods,
    url: string,
    param?: AxiosRequestConfig,
    axiosConfig?: PureHttpRequestConfig
  ): Promise<T> {
    const authString = Cookies.get('authorized-token')
    if (authString) {
      const auth = JSON.parse(authString)
      if (auth.accessToken) {
        axiosConfig = {
          ...axiosConfig,
          headers: {
            ...axiosConfig?.headers,
            Authorization: formatToken(auth.accessToken)
          }
        }
      }
    }
    const config = {
      method,
      url,
      ...param,
      ...axiosConfig
    } as PureHttpRequestConfig
    config.baseURL = config.baseURL || Axios.defaults.baseURL
    // 单独处理自定义请求/响应回掉
    return new Promise((resolve, reject) => {
      PureHttp.axiosInstance
        .request(config)
        .then((response: undefined) => {
          if (response && response.code > 200) {
            if (response.code == 401) {
              PureHttp.redirectToLoginPage()
            } else if (response.code == 4011 || response.code == 4012) {
              ElMessage.error(response.code.msg)
              PureHttp.redirectToLoginPage()
              return
            }
            ElMessage.error({
              // @ts-ignore
              message: response.msg
            })
          }
          resolve(response)
        })
        .catch(error => {
          reject(error)
        })
    })
  }

  /** 单独抽离的post工具函数 */
  public post<T, P>(
    url: string,
    params?: AxiosRequestConfig<T>,
    config?: PureHttpRequestConfig
  ): Promise<P> {
    return this.request<P>('post', url, params, config)
  }

  /** 单独抽离的get工具函数 */
  public get<T, P>(
    url: string,
    params?: AxiosRequestConfig<T>,
    config?: PureHttpRequestConfig
  ): Promise<P> {
    return this.request<P>('get', url, params, config)
  }

  public put<T, P>(
    url: string,
    params?: AxiosRequestConfig<T>,
    config?: PureHttpRequestConfig
  ): Promise<P> {
    return this.request<P>('put', url, params, config)
  }

  public delete<T, P>(
    url: string,
    params?: AxiosRequestConfig<T>,
    config?: PureHttpRequestConfig
  ): Promise<P> {
    return this.request<P>('delete', url, params, config)
  }
}

export const http = new PureHttp()
