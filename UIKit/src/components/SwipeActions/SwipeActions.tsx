import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react'
import { Animated, StyleSheet, TouchableOpacity, View, type GestureResponderEvent } from 'react-native'
import { Text } from '../Text'
import { rpxToPx } from '../../utils/rpxToPx'
import { theme, fontSize, radius, spacing } from '../../utils/theme'

export interface SwipeAction {
  key: string
  text: string
  backgroundColor?: string
  textColor?: string
  width?: number
}

export interface SwipeActionsProps {
  children: React.ReactNode
  actionsSlot?: React.ReactNode
  actions?: SwipeAction[]
  onAction?: (key: string) => void
  contentWidth?: number
  actionsWidth?: number
  swipeThreshold?: number
  tapPreventDelay?: number
  disabled?: boolean
  currentActivator?: string | null
  selfKey?: string
  onTouchStart?: () => void
  onSwipeStart?: () => void
  onSwipeEnd?: () => void
  onContentTap?: () => void
  onContentLongPress?: () => void
  onOpen?: () => void
  onClose?: () => void
}

export interface SwipeActionsRef {
  closeRow: () => void
}

const DEFAULT_ACTIONS_WIDTH = 420 
const DEFAULT_SWIPE_THRESHOLD = 30
const DEFAULT_TAP_PREVENT_DELAY = 250
const ACTION_DEFAULT_WIDTH = 80 

function SwipeActionsInner(
  props: SwipeActionsProps,
  ref: React.Ref<SwipeActionsRef>,
): React.ReactElement {
  const {
    children,
    actionsSlot,
    actions,
    onAction,
    contentWidth,
    actionsWidth = DEFAULT_ACTIONS_WIDTH,
    swipeThreshold = DEFAULT_SWIPE_THRESHOLD,
    tapPreventDelay = DEFAULT_TAP_PREVENT_DELAY,
    disabled = false,
    currentActivator,
    selfKey,
    onTouchStart: onTouchStartProp,
    onSwipeStart,
    onSwipeEnd,
    onContentTap,
    onContentLongPress,
    onOpen,
    onClose,
  } = props

  const actualContentWidth = contentWidth ?? 750
  const actionsWidthPx = rpxToPx(actionsWidth)

  const startXRef = useRef(0)
  const startYRef = useRef(0)
  const startCurrentXRef = useRef(0)
  const startDxRef = useRef(0)
  const currentXRef = useRef(0) 
  const translateX = useRef(new Animated.Value(0)).current 
  const shouldPreventTapRef = useRef(false)
  const preventTapTimerIdRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const movedRef = useRef(false) 
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const longPressTriggeredRef = useRef(false)
  const grantTimeRef = useRef(0)

  const clearPreventTapTimer = (): void => {
    if (preventTapTimerIdRef.current != null) {
      clearTimeout(preventTapTimerIdRef.current)
      preventTapTimerIdRef.current = null
    }
  }

  const setPreventTap = (): void => {
    clearPreventTapTimer()
    shouldPreventTapRef.current = true
    preventTapTimerIdRef.current = setTimeout(() => {
      shouldPreventTapRef.current = false
      preventTapTimerIdRef.current = null
    }, tapPreventDelay)
  }

  const animateTo = (toValue: number, withSpring: boolean = true): void => {
    currentXRef.current = toValue
    translateX.stopAnimation()
    if (withSpring) {
      Animated.spring(translateX, {
        toValue,
        useNativeDriver: true,
        bounciness: 0, 
        speed: 20,
      }).start()
    } else {
      Animated.timing(translateX, {
        toValue,
        duration: 200,
        useNativeDriver: true,
      }).start()
    }
  }
  const open = (): void => animateTo(-actionsWidthPx)
  const close = (): void => animateTo(0)
  const reset = (): void => animateTo(0, false)

  const closeRow = (): void => {
    if (currentXRef.current === 0) return
    currentXRef.current = 0
    translateX.stopAnimation()
    Animated.timing(translateX, {
      toValue: 0,
      duration: 100,  
      useNativeDriver: true,
    }).start()
  }

  useImperativeHandle(ref, () => ({ closeRow }))

  const lastActivatorRef = useRef(currentActivator)
  useEffect(() => {
    if (lastActivatorRef.current === currentActivator) return
    lastActivatorRef.current = currentActivator
    const isCurrentlyActive: boolean = currentActivator != null && currentActivator === selfKey
    if (!isCurrentlyActive && currentXRef.current !== 0) {
      closeRow()
    }
  }, [currentActivator, selfKey])

  useEffect(() => {
    return (): void => {
      clearPreventTapTimer()
      clearLongPressTimer()
    }
  }, [])

  const hasActionsSlot = actionsSlot != null
  const useLegacyActions = !hasActionsSlot && actions != null && actions.length > 0
  const totalActionsWidthRpx = useMemo((): number => {
    if (!useLegacyActions || !actions) return 0
    return actions.reduce((sum, a) => sum + (a.width ?? ACTION_DEFAULT_WIDTH), 0)
  }, [useLegacyActions, actions])

  const handleActionPress = (action: SwipeAction): void => {
    console.log('handleActionPress', action)
    close()
    onAction?.(action.key)
  }

  const horizontalSwipingRef = useRef(false)
  const onTouchStart = (e: GestureResponderEvent): void => {
    if (disabled) return
    horizontalSwipingRef.current = false
    onTouchStartProp?.()
    translateX.stopAnimation()
    clearPreventTapTimer()
    clearLongPressTimer()
    longPressTriggeredRef.current = false
    grantTimeRef.current = Date.now()
    startXRef.current = e.nativeEvent.pageX
    startYRef.current = e.nativeEvent.pageY
    movedRef.current = false
    startDxRef.current = 0
    longPressTimerRef.current = setTimeout(() => {
      longPressTriggeredRef.current = true
      reset()
      onContentLongPress?.()
      clearLongPressTimer()
    }, 500)
  }

  const onTouchEnd = (e: GestureResponderEvent): void => {
    clearLongPressTimer()
    if (horizontalSwipingRef.current) {
      horizontalSwipingRef.current = false
      onSwipeEnd?.()
      if (disabled) return
      if (longPressTriggeredRef.current) return
      const lastDx: number = startDxRef.current
      const currentX: number = currentXRef.current
      const halfWidth: number = actionsWidthPx / 2
      if (lastDx < -swipeThreshold) {
        open()
        setPreventTap()
        onOpen?.()
      } else if (lastDx > swipeThreshold) {
        if (currentX !== 0) {
          close()
          setPreventTap()
        }
        onClose?.()
      } else if (currentX < -halfWidth) {
        open()
        setPreventTap()
      } else if (currentX !== 0) {
        close()
        setPreventTap()
      }
      return
    }
    if (disabled) return
    if (longPressTriggeredRef.current) return
    const endX = e.nativeEvent.pageX
    const endY = e.nativeEvent.pageY
    const deltaX = endX - startXRef.current
    const deltaY = endY - startYRef.current
    if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
      if (shouldPreventTapRef.current) return
      if (currentXRef.current < 0) {
        close()
      } else {
        onContentTap?.()
      }
    }
  }

  const onTouchMove = (e: GestureResponderEvent): void => {
    if (disabled) return
    if (longPressTriggeredRef.current) return
    const dx: number = e.nativeEvent.pageX - startXRef.current
    const dy: number = e.nativeEvent.pageY - startYRef.current
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
      movedRef.current = true
      clearLongPressTimer()
    }
    if (Math.abs(dx) > Math.abs(dy) + 5 && Math.abs(dx) > 10) {
      if (!horizontalSwipingRef.current) {
        horizontalSwipingRef.current = true
        onSwipeStart?.()
      }
      const targetX: number = startCurrentXRef.current + dx
      const v: number = Math.max(-actionsWidthPx, Math.min(0, targetX))
      currentXRef.current = v
      translateX.setValue(v)
      if (dx < 0) {
        startDxRef.current = Math.min(startDxRef.current, dx)
      } else {
        startDxRef.current = Math.max(startDxRef.current, dx)
      }
    }
  }

  const onTouchCancel = (): void => {
    clearLongPressTimer()
    if (horizontalSwipingRef.current) {
      horizontalSwipingRef.current = false
      onSwipeEnd?.()
      if (disabled) return
      if (startDxRef.current < -swipeThreshold) {
        open()
        setPreventTap()
      } else if (startDxRef.current > swipeThreshold) {
        if (currentXRef.current !== 0) {
          close()
          setPreventTap()
        }
      } else if (currentXRef.current < 0) {
        close()
      }
      return
    }
  }

  const clearLongPressTimer = (): void => {
    if (longPressTimerRef.current != null) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
  }

  const contentWidthPx = rpxToPx(actualContentWidth)
  const totalWidthPx = contentWidthPx + actionsWidthPx

  return (
    <View style={styles.container}>
      <Animated.View
        style={{
          flexDirection: 'row',
          width: totalWidthPx,
          transform: [{ translateX }],
        }}
      >
        <View
          style={{ width: contentWidthPx }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onTouchCancel={onTouchCancel}
        >
          {children}
        </View>
        <View
          style={[styles.actionsContainer, { width: actionsWidthPx }]}
        >
        {hasActionsSlot ? (
          actionsSlot
        ) : useLegacyActions ? (
          <View style={{ flexDirection: 'row', flex: 1 }}>
            {actions!.map((action) => (
              <TouchableOpacity
                key={action.key}
                activeOpacity={0.7}
                style={[
                  {
                    width: rpxToPx(action.width ?? ACTION_DEFAULT_WIDTH),
                    backgroundColor: action.backgroundColor ?? theme.bgTertiary,
                  },
                  styles.actionBtn,
                ]}
                onPress={(): void => handleActionPress(action)}
              >
                <Text
                  style={[
                    styles.actionText,
                    { color: action.textColor ?? theme.textPrimary },
                  ]}
                >
                  {action.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}
      </View>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    flexDirection: 'row', 
  },
  actionsContainer: {
    flexDirection: 'row',
  },
  actionBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  actionText: {
    fontSize: fontSize.md,
    fontWeight: '500',
  },
})

export const SwipeActions = forwardRef<SwipeActionsRef, SwipeActionsProps>(SwipeActionsInner)
export default SwipeActions
