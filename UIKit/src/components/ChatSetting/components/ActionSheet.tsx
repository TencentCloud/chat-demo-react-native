import React, { useEffect, useRef, useState } from 'react'
import { Animated, Easing, Pressable, StyleSheet, TouchableOpacity, View } from 'react-native'
import { Text } from '../../Text'
import { rpxToPx } from '../../../utils/rpxToPx'
import { useTranslation } from 'react-i18next'

export interface ActionSheetOption {
  label: string
  value: any
  color?: string
}

export interface ActionSheetProps {
  visible: boolean
  options: ActionSheetOption[]
  onUpdateVisible?: (value: boolean) => void
  onSelect?: (option: ActionSheetOption, index: number) => void
  onCancel?: () => void
}

export const ActionSheet: React.FC<ActionSheetProps> = ({
  visible,
  options,
  onUpdateVisible,
  onSelect,
  onCancel,
}) => {
  const { t } = useTranslation()
  const [isShow, setIsShow] = useState(false)
  const maskOpacity = useRef(new Animated.Value(0)).current
  const sheetTranslate = useRef(new Animated.Value(500)).current

  useEffect(() => {
    if (visible) {
      setIsShow(true)
      maskOpacity.setValue(0)
      sheetTranslate.setValue(500)
      Animated.parallel([
        Animated.timing(maskOpacity, {
          toValue: 1,
          duration: 180,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(sheetTranslate, {
          toValue: 0,
          duration: 280,
          easing: Easing.bezier(0.23, 1, 0.32, 1),
          useNativeDriver: true,
        }),
      ]).start()
    } else if (isShow) {
      Animated.parallel([
        Animated.timing(maskOpacity, {
          toValue: 0,
          duration: 150,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(sheetTranslate, {
          toValue: 500,
          duration: 180,
          easing: Easing.bezier(0.4, 0, 1, 1),
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsShow(false)
      })
    }
  }, [visible])

  const handleSelect = (option: ActionSheetOption, index: number): void => {
    onUpdateVisible?.(false)
    onSelect?.(option, index)
  }

  const handleCancel = (): void => {
    onUpdateVisible?.(false)
    onCancel?.()
  }

  const handleMaskTap = (): void => {
    handleCancel()
  }

  if (!isShow) return null

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Animated.View style={[styles.mask, { opacity: maskOpacity }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleMaskTap} />
      </Animated.View>
      <Animated.View
        style={[
          styles.sheet,
          { transform: [{ translateY: sheetTranslate }] },
        ]}
      >
        {options.map((item, index) => (
          <TouchableOpacity
            key={index}
            activeOpacity={0.7}
            style={styles.item}
            onPress={() => handleSelect(item, index)}
          >
            <Text
              style={[
                styles.text,
                { color: item.color || 'rgba(0, 0, 0, 0.9)' },
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
        <View style={styles.gap} />
        <TouchableOpacity
          activeOpacity={0.7}
          style={[styles.item, styles.itemCancel]}
          onPress={handleCancel}
        >
          <Text style={styles.text}>{t('common.cancel')}</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  mask: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#F5F5F5',
    borderTopLeftRadius: rpxToPx(24),
    borderTopRightRadius: rpxToPx(24),
  },
  item: {
    paddingVertical: rpxToPx(32),
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5E5',
  },
  itemCancel: {
    borderBottomWidth: 0,
  },
  text: {
    fontSize: rpxToPx(32),
    fontWeight: '500',
    color: 'rgba(0, 0, 0, 0.9)',
  },
  gap: {
    height: rpxToPx(16),
    backgroundColor: '#F5F5F5',
  },
})

export default ActionSheet
