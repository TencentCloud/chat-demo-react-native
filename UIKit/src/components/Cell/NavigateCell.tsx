import React from 'react'
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native'
import { Text } from '../Text'
import { rpxToPx } from '../../utils/rpxToPx'
import { iconAssets } from '../../static/iconBase64'

export interface NavigateCellProps {
  label: string
  value?: string
  disabled?: boolean
  onClick?: () => void
}

export const NavigateCell: React.FC<NavigateCellProps> = ({
  label,
  value = '',
  disabled = false,
  onClick,
}) => {
  const handleTap = (): void => {
    if (disabled) return
    onClick?.()
  }

  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        activeOpacity={disabled ? 1 : 0.7}
        style={styles.right}
        onPress={handleTap}
      >
        <Text style={styles.value} numberOfLines={1}>
          {value}
        </Text>
        <View style={{ minWidth: value === '' ? rpxToPx(56) : rpxToPx(16) }} />
        {!disabled && (
          <Image style={styles.arrow} source={iconAssets['static/icon/arrow-right.png']} resizeMode="contain" />
        )}
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: rpxToPx(24),
    paddingHorizontal: rpxToPx(32),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5E5',
  },
  label: {
    fontSize: rpxToPx(32),
    color: 'rgba(0, 0, 0, 0.55)',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  value: {
    fontSize: rpxToPx(32),
    color: 'rgba(0, 0, 0, 0.9)',
  },
  arrow: {
    width: rpxToPx(28),
    height: rpxToPx(28),
  },
})

export default NavigateCell
