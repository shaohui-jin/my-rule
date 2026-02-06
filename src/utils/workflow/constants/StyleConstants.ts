/**
 * 工作流节点样式常量定义
 * 统一管理所有重复的颜色、尺寸、字体等样式配置
 */

// 颜色常量
export const COLORS = {
  // 主色调
  primary: 'var(--el-color-primary, #1890ff)',
  
  // 状态颜色
  error: 'var(--el-color-danger, #ff4d4f)',
  success: 'var(--el-color-success, #52c41a)',
  warning: 'var(--el-color-warning, #faad14)',
  
  // 边框和分割线
  border: 'var(--el-border-color, #e2e2e2)',
  borderLight: 'var(--el-border-color-lighter, #f0f0f0)',
  
  // 背景色
  background: {
    white: 'var(--el-bg-color, #ffffff)',
    light: 'var(--el-fill-color-light, #f5f7fa)',
    lighter: 'var(--el-fill-color-lighter, #fafcff)',
    dark: 'var(--el-fill-color, #f0f2f5)'
  },
  
  // 文字颜色
  text: {
    primary: 'var(--el-text-color-primary, #333)',
    secondary: 'var(--el-text-color-secondary, #888)',
    disabled: 'var(--el-text-color-disabled, #ccc)',
    white: '#ffffff'
  },
  
  // 选择框颜色
  selection: 'var(--el-color-primary, #1890ff)'
} as const

// 只保留真正需要统一管理的尺寸常量
export const SIZES = {
  // 端口尺寸 - 这些确实需要统一
  port: {
    radius: 5,
    plusRadius: 8
  }
} as const

// 边样式配置
export const EDGE_STYLES = {
  error: { 
    stroke: COLORS.error, 
    strokeWidth: 2 
  },
  normal: { 
    stroke: COLORS.primary, 
    strokeWidth: 2 
  },
  pass: { 
    stroke: COLORS.primary, 
    strokeWidth: 2 
  },
  alert: { 
    stroke: COLORS.border, 
    strokeWidth: 2 
  }
}

// 端口属性配置
export const PORT_ATTRS = {
  circle: { 
    r: SIZES.port.radius, 
    magnet: true, 
    stroke: COLORS.primary, 
    strokeWidth: 2.5, 
    fill: COLORS.text.white 
  },
  plus: { 
    r: SIZES.port.plusRadius, 
    stroke: COLORS.primary, 
    strokeWidth: 2.5, 
    fill: COLORS.primary, 
    display: 'none', 
    cursor: 'pointer'
  },
  plusText: { 
    text: '+', 
    fill: COLORS.text.white, 
    fontSize: 18, 
    textAnchor: 'middle', 
    textVerticalAnchor: 'middle', 
    display: 'none', 
    pointerEvents: 'none' 
  }
} as const
