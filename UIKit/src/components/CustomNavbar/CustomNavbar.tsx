import React from 'react'
import { Image, type ImageSourcePropType, type LayoutChangeEvent, StatusBar, StyleSheet, TouchableOpacity, View, type StyleProp, type ViewStyle } from 'react-native'
import { Text } from '../Text'
import { SafeAreaView } from 'react-native-safe-area-context'
import { iconAssets } from '../../static/iconBase64'

export interface CustomNavbarProps {
  title?: string
  showBack?: boolean
  onBack?: () => void
  rightIcon?: ImageSourcePropType
  rightText?: string
  onRightPress?: () => void
  rightElement?: React.ReactNode
  leftElement?: React.ReactNode
  centerElement?: React.ReactNode
  showShadow?: boolean
  backgroundColor?: string
  titleColor?: string
  statusBarStyle?: 'dark-content' | 'light-content'
  statusBarBackgroundColor?: string
  manageStatusBar?: boolean
  style?: StyleProp<ViewStyle>
  onLayout?: (event: LayoutChangeEvent) => void
  onRightIconLayout?: (event: LayoutChangeEvent) => void
}

export const CustomNavbar: React.FC<CustomNavbarProps> = ({
  title = '',
  showBack = true,
  onBack,
  rightIcon,
  rightText,
  onRightPress,
  rightElement,
  leftElement,
  centerElement,
  showShadow = true,
  backgroundColor = '#FFFFFF',
  titleColor = '#000000',
  statusBarStyle = 'dark-content',
  statusBarBackgroundColor = '#FFFFFF',
  manageStatusBar = true,
  style,
  onLayout,
  onRightIconLayout,
}) => {
  const hasRightContent: boolean = rightElement != null || rightIcon != null || (rightText != null && rightText.length > 0)
  const renderRight = (): React.ReactNode => {
    if (rightElement != null) return rightElement
    if (rightIcon != null) {
      return (
        <TouchableOpacity
          onLayout={onRightIconLayout}
          style={styles.menuBtn}
          onPress={onRightPress}
          activeOpacity={0.5}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Image source={rightIcon} style={styles.menuIcon} resizeMode="contain" />
        </TouchableOpacity>
      )
    }
    if (rightText != null && rightText.length > 0) {
      return (
        <TouchableOpacity
          style={styles.menuBtn}
          onPress={onRightPress}
          activeOpacity={0.5}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.menuTextIcon}>{rightText}</Text>
        </TouchableOpacity>
      )
    }
    if (showBack) {
      return <View style={styles.placeholder} />
    }
    return null
  }

  const renderLeft = (): React.ReactNode => {
    if (leftElement != null) return leftElement
    if (!showBack) return null
    return (
      <TouchableOpacity
        style={styles.backBtn}
        onPress={onBack}
        activeOpacity={0.5}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Image source={iconAssets['static/icon/arrow-left.png']} style={styles.backIcon} resizeMode="contain" />
      </TouchableOpacity>
    )
  }

  const renderCenter = (): React.ReactNode => {
    if (centerElement != null) return centerElement
    if (title.length === 0) {
      return hasRightContent || showBack ? <View style={styles.flexFill} /> : null
    }
    return (
      <Text style={[styles.title, { color: titleColor }]} numberOfLines={1}>
        {title}
      </Text>
    )
  }

  return (
    <SafeAreaView
      edges={['top']}
      onLayout={onLayout}
      style={[styles.container, { backgroundColor }, showShadow ? styles.shadow : null, style]}
    >
      {manageStatusBar ? (
        <StatusBar barStyle={statusBarStyle} backgroundColor={statusBarBackgroundColor} />
      ) : null}
      <View style={styles.row}>
        {renderLeft()}
        {renderCenter()}
        {renderRight()}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
  },
  shadow: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    paddingHorizontal: 4,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    width: 22,
    height: 22,
  },
  title: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
  },
  flexFill: {
    flex: 1,
  },
  menuBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIcon: {
    width: 22,
    height: 22,
  },
  menuTextIcon: {
    fontSize: 22,
    color: '#000000',
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
    height: 40,
  },
})
