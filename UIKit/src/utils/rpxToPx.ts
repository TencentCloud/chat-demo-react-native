import { Dimensions } from 'react-native'

const DESIGN_WIDTH = 750

let _screenWidth = Dimensions.get('window').width
Dimensions.addEventListener('change', ({ window }) => {
  _screenWidth = window.width
})

export const rpxToPx = (rpx: number): number => {
  return (rpx * _screenWidth) / DESIGN_WIDTH
}

export const getScreenWidth = (): number => _screenWidth

export const staticRpxToPx = (rpx: number, screenWidth?: number): number => {
  return (rpx * (screenWidth ?? Dimensions.get('window').width)) / DESIGN_WIDTH
}
