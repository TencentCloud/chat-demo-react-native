
export const theme = {
  primary: '#1F66FF',
  primaryLight: '#E5F0FF',
  primaryDark: '#0E4FCC',

  textPrimary: '#191919',
  textSecondary: '#666666',
  textTertiary: '#999999',
  textDisabled: '#CCCCCC',
  textInverse: '#FFFFFF',
  textLink: '#1F66FF',

  bgPrimary: '#FFFFFF',
  bgSecondary: '#F7F7F7',
  bgTertiary: '#EFEFEF',
  bgMask: 'rgba(0, 0, 0, 0.5)',

  borderLight: '#E5E5E5',
  borderMedium: '#CCCCCC',
  borderDark: '#999999',

  success: '#00B85C',
  warning: '#FF8800',
  danger: '#FF3B30',
  error: '#FF3B30',
  info: '#1F66FF',

  bubbleSelf: '#1F66FF',
  bubbleSelfText: '#FFFFFF',
  bubbleOther: '#FFFFFF',
  bubbleOtherText: '#191919',
} as const

export const fontSize = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 20,
  xxxl: 24,
  display: 32,
} as const

export const radius = {
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
  full: 9999,
} as const

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const

export type Theme = typeof theme
