import React, { useEffect, useState } from 'react'
import { Modal, Pressable, StyleSheet, View } from 'react-native'
import { Text } from '../Text'
import { rpxToPx } from '../../utils/rpxToPx'

let _msg: string = ''
let _visible: boolean = false
let _hideTimer: ReturnType<typeof setTimeout> | null = null
const _listeners: Set<() => void> = new Set()

const notify = (): void => {
  _listeners.forEach((l) => l())
}

const showInternal = (msg: string, durationMs: number): void => {
  _msg = msg
  _visible = true
  notify()
  if (_hideTimer != null) {
    clearTimeout(_hideTimer)
  }
  _hideTimer = setTimeout(() => {
    _visible = false
    _hideTimer = null
    notify()
  }, durationMs)
}

export const showToast = (msg: string): void => {
  showInternal(msg, 2000)
}

export const showLongToast = (msg: string): void => {
  showInternal(msg, 3500)
}

export const hideToast = (): void => {
  if (_hideTimer != null) {
    clearTimeout(_hideTimer)
    _hideTimer = null
  }
  if (_visible) {
    _visible = false
    notify()
  }
}

export const ToastRoot: React.FC = () => {
  const [, setTick] = useState<number>(0)
  useEffect(() => {
    const l = (): void => setTick((t) => t + 1)
    _listeners.add(l)
    return () => {
      _listeners.delete(l)
    }
  }, [])

  return (
    <Modal
      transparent
      visible={_visible}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={hideToast}
    >
      <Pressable style={styles.mask} onPress={hideToast}>
        <View style={styles.toast}>
          <Text style={styles.text} numberOfLines={3}>
            {_msg}
          </Text>
        </View>
      </Pressable>
    </Modal>
  )
}

const styles = StyleSheet.create({
  mask: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toast: {
    minWidth: rpxToPx(200),
    maxWidth: '80%',
    paddingVertical: rpxToPx(20),
    paddingHorizontal: rpxToPx(32),
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
    borderRadius: rpxToPx(16),
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontSize: rpxToPx(28),
    lineHeight: rpxToPx(40),
    textAlign: 'center',
  },
})
