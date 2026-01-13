// 用于测量文本宽度的 canvas 上下文（单例模式）
let measureCanvas: HTMLCanvasElement | null = null
let measureCtx: CanvasRenderingContext2D | null = null

/**
 * 初始化用于测量文本的 canvas
 */
const initMeasureCanvas = (): void => {
  if (!measureCanvas) {
    measureCanvas = document.createElement('canvas')
    measureCtx = measureCanvas.getContext('2d')
  }
}

/**
 * 使用 canvas 测量文本宽度
 * @param text 要测量的文本
 * @param fontSize 字体大小，默认 14
 * @param fontWeight 字体粗细，默认 '400'
 * @param fontFamily 字体族，默认 'Arial'
 * @returns 文本宽度（像素）
 */
export const measureTextWidth = (
  text: string,
  fontSize = 14,
  fontWeight: string | number = '400',
  fontFamily = 'Arial'
): number => {
  if (typeof text !== 'string') {
    text = String(text || '')
  }
  initMeasureCanvas()
  if (!measureCtx) {
    // 如果 canvas 不可用，使用估算值
    return text.length * (fontSize * 0.6)
  }
  const font = `${fontWeight} ${fontSize}px ${fontFamily}`
  measureCtx.font = font
  return measureCtx.measureText(text).width
}

/**
 * 截断文本并添加省略号
 * @param text 要截断的文本
 * @param maxWidth 最大宽度（像素）
 * @param fontSize 字体大小，默认 14
 * @param fontWeight 字体粗细，默认 '400'
 * @param fontFamily 字体族，默认 'Arial'
 * @returns 截断后的文本（如果超出则添加省略号）
 */
export const truncateText = (
  text: string,
  maxWidth: number,
  fontSize = 14,
  fontWeight: string | number = '400',
  fontFamily = 'Arial'
): string => {
  if (typeof text !== 'string') {
    text = String(text || '')
  }
  const fullWidth = measureTextWidth(text, fontSize, fontWeight, fontFamily)
  if (fullWidth <= maxWidth) {
    return text
  }

  // 计算省略号的宽度
  const ellipsisWidth = measureTextWidth('...', fontSize, fontWeight, fontFamily)
  const availableWidth = maxWidth - ellipsisWidth

  // 二分查找合适的截断位置
  let left = 0
  let right = text.length
  let result = ''

  while (left < right) {
    const mid = Math.floor((left + right) / 2)
    const testText = text.substring(0, mid)
    const testWidth = measureTextWidth(testText, fontSize, fontWeight, fontFamily)

    if (testWidth <= availableWidth) {
      result = testText
      left = mid + 1
    } else {
      right = mid
    }
  }

  return result + '...'
}
