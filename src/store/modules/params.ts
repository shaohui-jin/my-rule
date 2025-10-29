import { defineStore } from 'pinia'
import { http } from "@/axios";
import { ElMessage } from "element-plus";

export const useParamStore = defineStore({
  id: 'params-list',
  state: () => ({
    tableList: [],
    partList: [],
    paramList: [],
    canvasListMap: {
      'default': []
    },
  }),
  getters: {},
  actions: {
    async getPartList() {
      if(this.partList.length === 0) {
        const res: any = await http.post({
          url: '/rule-config/datasource/fields',
          data: {
            databaseId: 'default',
            tableName: 'part'
          }
        })
        if (res.success) {
          this.partList = res.data
        } else {
          this.partList = []
          ElMessage.error(res.message)
        }
      }
      return this.partList
    },
    async getTableList() {
      if(this.tableList.length === 0) {
        const res: any = await http.post({
          url: '/rule-config/datasource/list',
          data: {}
        })
        const tableList = []
        if (res.success) {
          const datasourceList = res.data
          const _res = await Promise.all(
            datasourceList.map(async item => {
              return http.post({
                url: '/rule-config/datasource/fields',
                data: item
              })
            })
          )
          if (_res.every(item => item.success)) {
            datasourceList.forEach((e, i) => {
              tableList.push({
                name: e.description,
                code: '',
                databaseId: e.databaseId,
                tableName: e.tableName,
                children: _res[i].data
              })
            })
          } else {
            ElMessage.error('获取参数数据源异常')
          }
        } else {
          ElMessage.error(res.message)
        }
        this.tableList = tableList
      }
      return this.tableList
    },
    async getParamList() {
      if(this.paramList.length === 0) {
        const res: any = await http.post({
          url: '/config/configParam/queryParamsByType',
          data: {}
        })
        let paramList = []
        if (res.success) {
          paramList = res.data.map(item => {
            return {
              name: item.paramTypeName,
              code: '',
              // code: item.paramTypeCode,
              children: item.paramList.map(e => {
                return {
                  name: e.name,
                  code: e.code,
                  desc: e.desc,
                  type: e.dataType === 1 ? 'string' : [2, 3].includes(e.dataType) ? 'number' : 'boolean',
                }
              })
            }
          })
        } else {
          ElMessage.error(res.message)
        }
        this.paramList = paramList
      }
      return this.paramList
    },
    setCanvasList(id, str) {
      this.canvasListMap[id] = JSON.parse(str) || []
    },
    getCanvasList(id) {
      console.log('this.canvasListMap', this.canvasListMap)
      return this.canvasListMap[id]
    },
  }
})
