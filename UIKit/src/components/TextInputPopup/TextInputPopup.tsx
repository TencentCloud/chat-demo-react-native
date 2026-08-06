import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  Animated,
  Dimensions,
  Keyboard,
  type LayoutChangeEvent,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { Text } from '../Text'
import { useTranslation } from 'react-i18next'
import { rpxToPx } from '../../utils/rpxToPx'
import { Popup, PopupRef } from '../Popup/Popup'

const KEYBOARD_GAP = 60

export interface TextInputPopupProps {
  visible: boolean
  title?: string
  value?: string
  placeholder?: string
  maxLength?: number
  maxByteLength?: number
  onUpdateVisible?: (value: boolean) => void
  onConfirm?: (value: string) => void
  onCancel?: () => void
}

const getByteLength = (str: string): number => {
  let len = 0
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i)
    if (code <= 0x7f) {
      len += 1
    } else if (code <= 0x7ff) {
      len += 2
    } else {
      len += 3
    }
  }
  return len
}

export const TextInputPopup: React.FC<TextInputPopupProps> = ({
  visible,
  title,
  placeholder,
  value = '',
  maxLength = -1,
  maxByteLength = -1,
  onUpdateVisible,
  onConfirm,
  onCancel,
}) => {
  const { t } = useTranslation()
  const [inputValue, setInputValue] = useState<string>(value)
  const translateYAnim = useRef(new Animated.Value(0)).current
  const popupRef = useRef<PopupRef>(null)
  const inputRef = useRef<TextInput>(null)
  const [popupHeight, setPopupHeight] = useState(0)
  const handleContainerLayout = useCallback((e: LayoutChangeEvent): void => {
    setPopupHeight(e.nativeEvent.layout.height)
  }, [])
  const resolvedTitle = title ?? t('textInputPopup.title')
  const resolvedPlaceholder = placeholder ?? t('textInputPopup.placeholder')
  const resolvedCancelText = t('textInputPopup.cancel')
  const resolvedConfirmText = t('textInputPopup.confirm')

  useEffect(() => {
    if (visible) {
      setInputValue(value)
      const timer = setTimeout(() => {
        inputRef.current?.focus()
      }, 300)
      return (): void => clearTimeout(timer)
    }
    return undefined
  }, [visible, value])

  useEffect(() => {
    const showSub = Keyboard.addListener(
      'keyboardDidShow',
      (e: { endCoordinates: { height: number; screenY: number } }) => {
        const { height: kbHeight, screenY: kbTop } = e.endCoordinates
        if (popupHeight === 0) {
          const targetY = Platform.OS === 'ios' ? -kbHeight / 2 : 0
          Animated.timing(translateYAnim, {
            toValue: targetY,
            duration: 220,
            useNativeDriver: true,
          }).start()
          return
        }
        const windowH = Dimensions.get('window').height
        const popupBottom = (windowH + popupHeight) / 2
        const overlap = popupBottom - kbTop + KEYBOARD_GAP
        const targetY = overlap > 0 ? -overlap : 0
        Animated.timing(translateYAnim, {
          toValue: targetY,
          duration: 220,
          useNativeDriver: true,
        }).start()
      }
    )
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }).start()
    })
    return (): void => {
      showSub.remove()
      hideSub.remove()
    }
  }, [translateYAnim, popupHeight])

  const isOverLimit =
    maxByteLength > 0 && getByteLength(inputValue) > maxByteLength

  const handleInput = (text: string): void => {
    setInputValue(text)
  }

  const handleConfirm = (): void => {
    const v = inputValue
    popupRef.current?.close(() => {
      onConfirm?.(v)
    })
    Keyboard.dismiss()
  }

  const handleCancel = (): void => {
    popupRef.current?.close(() => {
      onCancel?.()
    })
    Keyboard.dismiss()
  }

  const handleVisibleChange = (val: boolean): void => {
    onUpdateVisible?.(val)
  }

  const handleClose = (): void => {
    onCancel?.()
    Keyboard.dismiss()
  }

  return (
    <Popup
      ref={popupRef}
      visible={visible}
      closeOnMaskTap
      onUpdateVisible={handleVisibleChange}
      onClose={handleClose}
      transformOffsetY={translateYAnim}
    >
      <View style={styles.container} onLayout={handleContainerLayout}>
        <View style={styles.content}>
          <Text style={styles.title}>{resolvedTitle}</Text>
          <TextInput
            ref={inputRef}
            value={inputValue}
            onChangeText={handleInput}
            placeholder={resolvedPlaceholder}
            placeholderTextColor="#BBBBBB"
            style={[styles.input, isOverLimit ? styles.inputError : null]}
            maxLength={maxLength > 0 ? maxLength : undefined}
          />
        </View>
        <View style={styles.buttons}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={[styles.btn, styles.btnCancel]}
            onPress={handleCancel}
          >
            <Text style={styles.btnTextCancel}>{resolvedCancelText}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            style={[styles.btn, styles.btnConfirm]}
            onPress={handleConfirm}
          >
            <Text style={styles.btnTextConfirm}>{resolvedConfirmText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Popup>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: rpxToPx(24),
    overflow: 'hidden',
    width: rpxToPx(654),
  },
  content: {
    paddingTop: rpxToPx(64),
    paddingHorizontal: rpxToPx(48),
    paddingBottom: rpxToPx(40),
  },
  title: {
    fontSize: rpxToPx(36),
    fontWeight: '500',
    color: 'rgba(0, 0, 0, 0.9)',
    textAlign: 'center',
    marginBottom: rpxToPx(32),
  },
  input: {
    height: rpxToPx(80),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5E5E5',
    borderRadius: rpxToPx(8),
    paddingHorizontal: rpxToPx(20),
    fontSize: rpxToPx(28),
    color: '#333333',
    backgroundColor: '#F5F5F5',
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  buttons: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E5E5',
  },
  btn: {
    flex: 1,
    paddingVertical: rpxToPx(32),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  btnCancel: {
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: '#E5E5E5',
    borderBottomLeftRadius: rpxToPx(24),
  },
  btnConfirm: {
    borderBottomRightRadius: rpxToPx(24),
  },
  btnTextCancel: {
    fontSize: rpxToPx(32),
    fontWeight: '500',
    color: 'rgba(0, 0, 0, 0.9)',
  },
  btnTextConfirm: {
    fontSize: rpxToPx(32),
    fontWeight: '500',
    color: '#0066FF',
  },
})

export default TextInputPopup
