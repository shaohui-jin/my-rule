import { defineStore } from 'pinia'
import { store } from '@/store'
import { http } from '@/utils/http'
import { ElMessage } from "element-plus";
import dayjs from "dayjs";

export const useClassDirectoryStore = defineStore({
  id: 'class-directory',
  state: () => ({
    classTreeData: [],
  }),
  getters: {},
  actions: {
    async getClassTreeData() {
      const res: any = await http.post<any, any>('/rule-config/function-category/tree', {})
      if (res.success) {
        this.classTreeData = res.data.map(e => {
          return {
            id: e.id,
            name: e.name,
            sort: e.sort,
            level: e.level,
            modifyTime: e.modifyTime ? dayjs(e.modifyTime).format('YYYY-MM-DD HH:mm:ss') : '',
            parentId: null,
            children: e.children.map(_e => {
              return {
                id: _e.id,
                name: _e.name,
                sort: _e.sort,
                level: _e.level,
                modifyTime: _e.modifyTime ? dayjs(_e.modifyTime).format('YYYY-MM-DD HH:mm:ss') : '',
                parentId: _e.parentId
              }
            })
          }
        })
      } else {
        ElMessage.error(res.message)
      }
      return this.classTreeData
    },
    async insertOrUpdateClassData({ id, name, parentId }) {
      return new Promise(async resolve => {
        const url = id ? '/rule-config/function-category/edit' : '/rule-config/function-category/add'
        const res: any = await http.post<any, any>(url, {
          data: { id, name, parentId: parentId || 0 }
        })
        if (res.success) {
          resolve(true)
        } else {
          resolve(false)
        }
      })
    },
    async deleteClassData({ id }) {
      return new Promise(async resolve => {
        const res: any = await http.post<any, any>('/rule-config/function-category/delete', {
          data: { id }
        })
        if (res.success) {
          resolve(true)
        } else {
          resolve(false)
        }
      })
    },
    async batchUpdateClassData(data) {
      return new Promise(async resolve => {
        const res: any = await http.post<any, any>('/rule-config/function-category/move', {
          data: {
            moveResult: data.map(e => {
              return {
                parentId: e.id,
                childrenId: e.children.map(_e => _e.id)
              }
            })
          }
        })
        if (res.success) {
          resolve(true)
        } else {
          resolve(false)
        }
      })
    },
    async checkClassData({ id }) {
      return new Promise(async resolve => {
        const res: any = await http.post<any, any>('/rule-config/func/check-if-data-exist', {
          data: { id }
        })
        if (res.success) {
          resolve(res.data)
        } else {
          resolve(false)
        }
      })
    }
  }
})

export function useClassDirectoryStoreHook() {
  return useClassDirectoryStore(store)
}
