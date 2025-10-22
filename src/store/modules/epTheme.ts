import { store } from '@/store'
import { defineStore } from 'pinia'
import { getConfig } from '@/config'
import { storageLocal } from '@pureadmin/utils'

export const useEpThemeStore = defineStore({
  id: 'pure-epTheme',
  state: () => ({
    epThemeColor:
      storageLocal().getItem<StorageConfigs>('sub-user-responsive-layout')?.epThemeColor ??
      getConfig().EpThemeColor,
    epTheme:
      storageLocal().getItem<StorageConfigs>('sub-user-responsive-layout')?.theme ??
      getConfig().Theme
  }),
  getters: {
    getEpThemeColor() {
      return this.epThemeColor
    },
    /** 用于mix导航模式下hamburger-svg的fill属性 */
    fill() {
      if (this.epTheme === 'light') {
        return 'var(--el-color-primary)'
      } else if (this.epTheme === 'yellow') {
        return '#d25f00'
      } else {
        return '#fff'
      }
    }
  },
  actions: {
    setEpThemeColor(newColor: string): void {
      const layout = storageLocal().getItem<StorageConfigs>('sub-user-responsive-layout')
      this.epTheme = layout?.theme
      this.epThemeColor = newColor
      if (!layout) return
      layout.epThemeColor = newColor
      storageLocal().setItem('sub-user-responsive-layout', layout)
    }
  }
})

export function useEpThemeStoreHook() {
  return useEpThemeStore(store)
}
