import { Dimensions } from 'react-native'

const SCREEN_WIDTH = 750
const windowWidth = Dimensions.get('window').width

export const rpxToPx = (rpx: number): number => (rpx / SCREEN_WIDTH) * windowWidth
