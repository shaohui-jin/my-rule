import Cookies from 'js-cookie'

const SEARCH_HISTORY_KEY = 'node-search-history'
const MAX_HISTORY_ITEMS = 20

export interface SearchHistoryItem {
  title: string
  funcId: string
  funcType: string
  type: string
}

/**
 * 获取搜索历史记录
 */
export function getSearchHistory(): SearchHistoryItem[] {
  try {
    const historyStr = Cookies.get(SEARCH_HISTORY_KEY)
    if (historyStr) {
      return JSON.parse(historyStr)
    }
  } catch (error) {
    console.error('解析搜索历史记录失败:', error)
  }
  return []
}

/**
 * 添加搜索历史记录
 */
export function addSearchHistory(item: SearchHistoryItem): void {
  try {
    const history = getSearchHistory()
    
    // 移除重复项
    const filteredHistory = history.filter(h => h.funcId !== item.funcId)
    
    // 添加到开头
    filteredHistory.unshift(item)
    
    // 限制数量
    if (filteredHistory.length > MAX_HISTORY_ITEMS) {
      filteredHistory.splice(MAX_HISTORY_ITEMS)
    }
    
    // 保存到cookie，设置7天过期
    Cookies.set(SEARCH_HISTORY_KEY, JSON.stringify(filteredHistory), { expires: 7 })
  } catch (error) {
    console.error('保存搜索历史记录失败:', error)
  }
}

/**
 * 清空搜索历史记录
 */
export function clearSearchHistory(): void {
  Cookies.remove(SEARCH_HISTORY_KEY)
}

/**
 * 移除指定的搜索历史记录
 */
export function removeSearchHistoryItem(funcId: string): void {
  try {
    const history = getSearchHistory()
    const filteredHistory = history.filter(h => h.funcId !== funcId)
    
    if (filteredHistory.length === 0) {
      clearSearchHistory()
    } else {
      Cookies.set(SEARCH_HISTORY_KEY, JSON.stringify(filteredHistory), { expires: 7 })
    }
  } catch (error) {
    console.error('移除搜索历史记录失败:', error)
  }
}
