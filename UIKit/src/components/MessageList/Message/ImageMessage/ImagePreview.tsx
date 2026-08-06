import React, { useEffect, useRef, useState } from 'react'
import { Animated, Modal, PanResponder, Pressable, StatusBar, StyleSheet, View, type GestureResponderEvent, type PanResponderGestureState } from 'react-native'
import { Text } from '../../../Text'
import { rpxToPx } from '../../../../utils/rpxToPx'

const MIN_SCALE = 1
const MAX_SCALE = 4
const DOUBLE_TAP_SCALE = 2

export interface ImagePreviewProps {
  visible: boolean
  urls: string[]
  currentIndex?: number
  onClose: () => void
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  visible,
  urls,
  currentIndex = 0,
  onClose,
}) => {
  const [activeIndex, setActiveIndex] = useState(currentIndex)
  const [scale, setScale] = useState(MIN_SCALE)
  const translateX = useRef(new Animated.Value(0)).current
  const translateY = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (visible) {
      setActiveIndex(currentIndex)
      setScale(MIN_SCALE)
      translateX.setValue(0)
      translateY.setValue(0)
    }
  }, [currentIndex, visible, translateX, translateY])

  useEffect(() => {
    if (!visible) {
      setScale(MIN_SCALE)
      translateX.setValue(0)
      translateY.setValue(0)
    }
  }, [visible, translateX, translateY])

  const initialDistanceRef = useRef<number>(0)
  const initialScaleRef = useRef<number>(MIN_SCALE)
  const lastTapTimeRef = useRef<number>(0)
  const isPanningRef = useRef<boolean>(false)

  const distance = (touches: GestureResponderEvent['nativeEvent']['touches']): number => {
    if (touches.length < 2) return 0
    const [a, b] = touches
    const dx = a.pageX - b.pageX
    const dy = a.pageY - b.pageY
    return Math.sqrt(dx * dx + dy * dy)
  }

  const handleDoubleTap = (): void => {
    if (scale > MIN_SCALE) {
      setScale(MIN_SCALE)
      translateX.setValue(0)
      translateY.setValue(0)
    } else {
      setScale(DOUBLE_TAP_SCALE)
    }
  }

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (): boolean => true,
      onMoveShouldSetPanResponder: (): boolean => true,
      onPanResponderGrant: (e: GestureResponderEvent): void => {
        const touches = e.nativeEvent.touches
        const now = Date.now()

        if (touches.length >= 2) {
          initialDistanceRef.current = distance(touches)
          initialScaleRef.current = scale
          isPanningRef.current = false
          return
        }

        isPanningRef.current = scale > MIN_SCALE

        if (now - lastTapTimeRef.current < 250) {
          handleDoubleTap()
          lastTapTimeRef.current = 0
        } else {
          lastTapTimeRef.current = now
        }
      },
      onPanResponderMove: (e: GestureResponderEvent, gesture: PanResponderGestureState): void => {
        const touches = e.nativeEvent.touches

        if (touches.length >= 2) {
          const d = distance(touches)
          if (initialDistanceRef.current > 0) {
            const nextScale = Math.max(
              MIN_SCALE,
              Math.min(MAX_SCALE, (initialScaleRef.current * d) / initialDistanceRef.current)
            )
            setScale(nextScale)
            if (nextScale <= MIN_SCALE) {
              translateX.setValue(0)
              translateY.setValue(0)
            }
          }
          return
        }

        if (isPanningRef.current && scale > MIN_SCALE) {
          translateX.setValue(gesture.dx)
          translateY.setValue(gesture.dy)
        }
      },
      onPanResponderRelease: (): void => {
        isPanningRef.current = false
      },
      onPanResponderTerminate: (): void => {
        isPanningRef.current = false
      },
    })
  ).current

  const currentUrl = urls[activeIndex] ?? ''
  if (!visible || !currentUrl) {
    return null
  }

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <StatusBar barStyle="light-content" backgroundColor="rgba(0,0,0,0.9)" />
      <View style={styles.container}>
        <View style={styles.imageWrapper} {...panResponder.panHandlers}>
          <Animated.Image
            source={{ uri: currentUrl }}
            style={[
              styles.image,
              {
                transform: [
                  { translateX },
                  { translateY },
                  { scale },
                ],
              },
            ]}
            resizeMode="contain"
          />
        </View>

        <Pressable
          style={styles.closeBtn}
          onPress={onClose}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.closeBtnText}>×</Text>
        </Pressable>

        {urls.length > 1 && (
          <View style={styles.indicator}>
            <Text style={styles.indicatorText}>
              {activeIndex + 1} / {urls.length}
            </Text>
          </View>
        )}
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
  },
  imageWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  closeBtn: {
    position: 'absolute',
    top: rpxToPx(88),
    left: rpxToPx(32),
    width: rpxToPx(64),
    height: rpxToPx(64),
    borderRadius: rpxToPx(32),
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: rpxToPx(48),
    color: '#FFFFFF',
    fontWeight: '300',
    lineHeight: rpxToPx(56),
  },
  indicator: {
    position: 'absolute',
    bottom: rpxToPx(60),
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  indicatorText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: rpxToPx(28),
  },
})
