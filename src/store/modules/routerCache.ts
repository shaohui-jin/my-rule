import { defineStore } from 'pinia'

interface FunctionData {
  id: string
  funcCode: string
  funcName: string
  funcDesc: string
  configData: string
  luaScript: string
  functionStatus: string
}

/**
 * 函数编辑 页面跳转 临时存储函数数据 跳转即销
 */
export const useFunctionStore = defineStore('function', {
  state: () => ({
    currentFunction: null as FunctionData | null
  }),
  actions: {
    setCurrentFunction(data: FunctionData) {
      this.currentFunction = data
    },
    clearCurrentFunction() {
      this.currentFunction = null
    }
  }
})

interface RuleData {
  id: string
  ruleName: string
  configData: string
  luaScript: string
  variableSet: string
  funcIds?: string[]
}




/**
 * 规则编辑 页面跳转 临时存储规则数据 跳转即销
 */
export const useRuleStore = defineStore('rule', {
  state: () => ({
    currentRule: {} as Record<string, RuleData>,
    hasEditMap: {}
  }),
  actions: {
    getCurrentRule(id): RuleData | null {
      return id ? this.currentRule[id] :  null
    },
    setCurrentRule(data: RuleData) {
      this.currentRule[data.id] = data
    },
    clearCurrentRule(id) {
      delete this.currentRule[id]
    },
    setReadonly(id, bool = true) {
      this.hasEditMap[id] = bool
    },
  }
})

interface CanvasData {
  id: string
  ruleName: string
  nodeList: any[]
  edges: any[]
  groupList: any[]
  lua: string
  funcIds?: string[]
  timestamp: number
}

/**
 * 画布编辑 页面切换 临时存储画布数据 页面切换即缓存
 */
export const useCanvasStore = defineStore('canvas', {
  state: () => ({
    cachedCanvas: {} as Record<string, CanvasData>
  }),
  actions: {
    getCurrentCanvas(id): CanvasData | null {
      return id ? this.cachedCanvas[id] :  null
    },
    setCachedCanvas(data: CanvasData) {
      this.cachedCanvas[data.id] = data
    },
    clearCachedCanvas(id) {
      delete this.cachedCanvas[id]
    }
  }
})

