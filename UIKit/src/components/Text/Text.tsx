import React from 'react'
import {
  Platform,
  StyleSheet,
  Text as RNText,
  type StyleProp,
  type TextProps as RNTextProps,
  type TextStyle,
} from 'react-native'

export type TextProps = RNTextProps

const defaultStyle: TextStyle = Platform.select({
  android: { fontFamily: 'lucida grande' },
  default: {},
}) as TextStyle

export const Text: React.FC<TextProps> = ({ style, ...rest }) => {
  const mergedStyle: StyleProp<TextStyle> = StyleSheet.flatten([
    defaultStyle,
    style,
  ])
  return <RNText {...rest} style={mergedStyle} />
}

export default Text
