import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native'
import { rpxToPx } from '../../utils/rpxToPx'

export interface PopupProps {
  visible: boolean
  closeOnMaskTap?: boolean
  onUpdateVisible?: (value: boolean) => void
  onClose?: () => void
  transformOffsetY?: Animated.AnimatedInterpolation<number> | Animated.Value
  children?: React.ReactNode
}

export interface PopupRef {
  close: (callback?: () => void) => void
}

export const Popup = forwardRef<PopupRef, PopupProps>((props, ref) => {
  const { visible, closeOnMaskTap = true, onUpdateVisible, onClose, transformOffsetY, children } = props
  const [isShow, setIsShow] = useState(false)
  const maskOpacity = useRef(new Animated.Value(0)).current
  const containerScale = useRef(new Animated.Value(0.9)).current
  const containerTranslate = useRef(new Animated.Value(20)).current
  const zeroOffset = useRef(new Animated.Value(0)).current
  const composedTranslateY = Animated.add(containerTranslate, transformOffsetY ?? zeroOffset)
  const isAnimating = useRef(false)

  useEffect(() => {
    if (visible) {
      show()
    } else {
      hide()
    }
  }, [visible])

  const show = (): void => {
    if (isAnimating.current) return
    isAnimating.current = true
    setIsShow(true)
    maskOpacity.setValue(0)
    containerScale.setValue(0.9)
    containerTranslate.setValue(20)
    Animated.parallel([
      Animated.timing(maskOpacity, {
        toValue: 1,
        duration: 180,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(containerScale, {
        toValue: 1,
        duration: 240,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(containerTranslate, {
        toValue: 0,
        duration: 240,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(() => {
      isAnimating.current = false
    })
  }

  const hide = (callback?: () => void): void => {
    if (isAnimating.current) {
      callback?.()
      return
    }
    isAnimating.current = true
    Animated.parallel([
      Animated.timing(maskOpacity, {
        toValue: 0,
        duration: 150,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(containerScale, {
        toValue: 0.9,
        duration: 150,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(containerTranslate, {
        toValue: 20,
        duration: 150,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsShow(false)
      isAnimating.current = false
      callback?.()
    })
  }

  useImperativeHandle(ref, () => ({
    close: (callback?: () => void): void => {
      hide(() => {
        onUpdateVisible?.(false)
        onClose?.()
        callback?.()
      })
    },
  }))

  const handleMaskTap = (): void => {
    if (closeOnMaskTap) {
      hide(() => {
        onUpdateVisible?.(false)
        onClose?.()
      })
    }
  }

  if (!isShow) return null

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Animated.View style={[styles.mask, { opacity: maskOpacity }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleMaskTap} />
      </Animated.View>
      <View style={styles.center} pointerEvents="box-none">
        <TouchableWithoutFeedback>
          <Animated.View
            style={[
              styles.container,
              {
                opacity: maskOpacity,
                transform: [
                  { scale: containerScale },
                  { translateY: composedTranslateY },
                ],
              },
            ]}
          >
            {children}
          </Animated.View>
        </TouchableWithoutFeedback>
      </View>
    </View>
  )
})

Popup.displayName = 'Popup'

const styles = StyleSheet.create({
  mask: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  center: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: rpxToPx(654),
    backgroundColor: '#FFFFFF',
    borderRadius: rpxToPx(24),
    overflow: 'hidden',
  },
})
