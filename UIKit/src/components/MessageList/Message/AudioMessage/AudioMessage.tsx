import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Animated, DeviceEventEmitter, Image, Pressable, StyleSheet, View } from 'react-native'
import { Text } from '../../../Text'
import { useTranslation } from 'react-i18next'
import { MediaQuality } from 'tuikit-atomicx-react-native'
import { rpxToPx } from '../../../../utils/rpxToPx'
import { type MessageInfo } from '../MessageTypes'
import { formatMediaPlayError } from '../../../MediaPlayer/useMediaPlayer'
import { iconAssets } from '../../../../static/iconBase64'
import { setAudioConvertVisibleMapEntry,
  deleteAudioConvertVisibleMapEntry } from '../../../../utils/audioConvertVisibleMapStore'
import { useAudioPlayer,
  AUDIO_PLAYER_START_EVENT } from './useAudioPlayer'

import AsyncStorage from '@react-native-async-storage/async-storage'
import { showToast } from '../../../../utils/toast'

const inMemoryCache: Map<string, string> = new Map()
let inMemoryCacheReady: boolean = false

AsyncStorage.getItem('tuikit_audio_convert_visible_v1')
  .then((raw: string | null): void => {
    if (raw != null && raw.length > 0) {
      inMemoryCache.set('tuikit_audio_convert_visible_v1', raw)
    }
    inMemoryCacheReady = true
  })
  .catch((): void => {
    inMemoryCacheReady = true
  })

const persistHideVisible = (msgID: string): void => {
  const key = 'tuikit_audio_convert_visible_v1'
  const raw: string | null = inMemoryCache.get(key) ?? null
  let store: Record<string, boolean> = {}
  if (raw != null && raw.length > 0) {
    try {
      const parsed: any = JSON.parse(raw)
      if (parsed != null && typeof parsed === 'object') {
        store = parsed as Record<string, boolean>
      }
    } catch {
    }
  }
  if (store[msgID] !== false) {
    store[msgID] = false
    const serialized: string = JSON.stringify(store)
    inMemoryCache.set(key, serialized)  
    AsyncStorage.setItem(key, serialized).catch((): void => {
    })
  }
}

const persistClearHideVisible = (msgID: string): void => {
  const key = 'tuikit_audio_convert_visible_v1'
  const raw: string | null = inMemoryCache.get(key) ?? null
  if (raw == null || raw.length === 0) return
  try {
    const parsed: any = JSON.parse(raw)
    if (parsed == null || typeof parsed !== 'object') return
    const store: Record<string, boolean> = parsed as Record<string, boolean>
    if (store[msgID] == null) return  
    delete store[msgID]
    if (Object.keys(store).length === 0) {
      inMemoryCache.delete(key)
      AsyncStorage.removeItem(key).catch((): void => {})
    } else {
      const serialized: string = JSON.stringify(store)
      inMemoryCache.set(key, serialized)
      AsyncStorage.setItem(key, serialized).catch((): void => {})
    }
  } catch {
  }
}

const readVisibleStoreSync = (): Record<string, boolean> | null => {
  if (!inMemoryCacheReady) return null  
  const raw: string | null = inMemoryCache.get('tuikit_audio_convert_visible_v1') ?? null
  if (raw == null || raw.length === 0) return null
  try {
    const parsed: any = JSON.parse(raw)
    if (parsed != null && typeof parsed === 'object') {
      return parsed as Record<string, boolean>
    }
  } catch {
  }
  return null
}

const AUDIO_CONVERT_VISIBLE_STORAGE_KEY = 'tuikit_audio_convert_visible_v1'

const LONG_PRESS_THRESHOLD_MS = 350

const AUDIO_ICON = iconAssets['static/icon/audio.png']

const computeAudioWidth = (duration: number): number => {
  const minWidth = 220
  const maxWidth = 474
  const minDuration = 20
  const maxDuration = 60
  if (duration <= minDuration) return minWidth
  if (duration >= maxDuration) return maxWidth
  return (
    minWidth +
    ((maxWidth - minWidth) * (duration - minDuration)) / (maxDuration - minDuration)
  )
}

const formatDuration = (duration: number): string => {
  if (!duration) return `0''`
  return `${Math.floor(duration)}''`
}

export interface AudioMessageProps {
  message: MessageInfo
  onLongPress?: (position: {
    touch: { pageX: number; pageY: number }
    bubble: { x: number; y: number; width: number; height: number }
  }) => void
  onPlayAudio?: (audioPath: string, msgID: string) => void
  onVoiceToText?: (audioPath: string, msgID: string) => void
}

export const AudioMessage: React.FC<AudioMessageProps> = ({ message,
  onLongPress }) => {
  const { t } = useTranslation()
  const isSelf = message.isSelf === true
  const payload = (message.messagePayload ?? {}) as any
  const duration: number = payload.audioDuration || 0
  const audioWidth: number = computeAudioWidth(duration)

  const getRemoteSoundUrl = (): string => {
    try {
      const rawMsg: any = (message as any)?.rawMessage
      const elements: any[] = rawMsg?.message?.messageBaseElements
      if (Array.isArray(elements) && elements.length > 0) {
        return elements[0]?.soundDownloadUrl || ''
      }
    } catch {
      
    }
    return ''
  }

  const [isDownloading, setIsDownloading] = useState(false)
  const [pendingPlay, setPendingPlay] = useState(false)
  const hasTriedRemoteFallbackRef = useRef(false)

  const handlePlayComplete = useCallback((): void => {
    hasTriedRemoteFallbackRef.current = false
  }, [])
  const handlePlayError = useCallback(
    (error: any): void => {
      if (!hasTriedRemoteFallbackRef.current) {
        const remoteUrl = getRemoteSoundUrl()
        if (remoteUrl) {
          hasTriedRemoteFallbackRef.current = true
          play(remoteUrl)
          return
        }
      }
      hasTriedRemoteFallbackRef.current = false
      const tip: string = formatMediaPlayError(error, 'audio', t as any)
      showToast(tip)
    },
    [play, t]
  )
  const { isPlaying, play, stop } = useAudioPlayer({
    messageId: message.msgID,
    onComplete: handlePlayComplete,
    onError: handlePlayError,
  })

  const [waveStep, setWaveStep] = useState(0)
  useEffect(() => {
    if (!isPlaying) {
      setWaveStep(0)
      return undefined
    }
    const t = setInterval((): void => {
      setWaveStep((s) => (s + 1) % 3)
    }, 300)
    return (): void => clearInterval(t)
  }, [isPlaying])

  const waveOpacity: [number, number, number] = isPlaying
    ? waveStep === 0
      ? [1, 0, 0]
      : waveStep === 1
      ? [0, 1, 0]
      : [0, 0, 1]
    : [0, 0, 1]

  const soundUrl = payload.audioPath || ''

  const bubbleRef = useRef<View>(null)
  const handleLongPress = (e: any): void => {
    const touch = e?.nativeEvent
      ? { pageX: (e.nativeEvent as any).pageX, pageY: (e.nativeEvent as any).pageY }
      : { pageX: 0, pageY: 0 }
    const node: any = bubbleRef.current
    if (node && typeof node.measureInWindow === 'function') {
      node.measureInWindow((x: number, y: number, width: number, height: number): void => {
        const bubble =
          width > 0 && height > 0
            ? { x, y, width, height }
            : { x: touch.pageX, y: touch.pageY, width: 0, height: 0 }
        onLongPress?.({ touch, bubble })
      })
    } else {
      onLongPress?.({
        touch,
        bubble: { x: touch.pageX, y: touch.pageY, width: 0, height: 0 },
      })
    }
  }
  const handlePlayTap = (): void => {
    if (isPlaying) {
      stop()
    } else {
      if (!soundUrl) {
        setPendingPlay(true)
        if (!isDownloading) {
          preDownloadSound()
        }
      } else {
        handlePlay()
      }
    }
  }

  const actionStateRef = useRef<any>(null)

  const preDownloadSound = async (): Promise<void> => {
    if (!message?.msgID) return
    if (soundUrl) {
      if (pendingPlay) {
        setPendingPlay(false)
        handlePlay()
      }
      return
    }
    if (isDownloading) return

    setIsDownloading(true)
    try {
      if (actionStateRef.current == null) {
        const { MessageActionState } = require('tuikit-atomicx-react-native') as any
        actionStateRef.current = MessageActionState.getInstance(message as any)
      }
      await actionStateRef.current.downloadMedia(MediaQuality.ORIGINAL)
      if (pendingPlay && soundUrl) {
        setPendingPlay(false)
        handlePlay()
      }
    } catch {
      if (pendingPlay) {
        setPendingPlay(false)
        const remoteUrl = getRemoteSoundUrl()
        if (remoteUrl) {
          hasTriedRemoteFallbackRef.current = true
          play(remoteUrl)
        } else {
          showToast(t('message.audioDownloadFailed'))
        }
      }
    } finally {
      setIsDownloading(false)
    }
  }

  const normalizeLocalSoundUrl = (raw: string): string => {
    if (!raw) return ''
    if (raw.startsWith('http://') || raw.startsWith('https://')) return raw
    if (raw.startsWith('file://') || raw.startsWith('content://')) return raw
    return `file://${raw.startsWith('/') ? '' : '/'}${raw}`
  }

  const handlePlay = (): void => {
    if (isPlaying) return
    hasTriedRemoteFallbackRef.current = false
    const localUrl = normalizeLocalSoundUrl(soundUrl)
    const remoteUrl = getRemoteSoundUrl()
    if (!localUrl && !remoteUrl) {
      showToast(t('message.audioUnavailable'))
      return
    }
    if (!localUrl && remoteUrl) {
      hasTriedRemoteFallbackRef.current = true
      play(remoteUrl)
      return
    }
    play(localUrl)
  }

  useEffect((): (() => void) => {
    const sub = DeviceEventEmitter.addListener(
      AUDIO_PLAYER_START_EVENT,
      (data: { messageId: string }): void => {
        if (
          data?.messageId &&
          data.messageId !== message.msgID &&
          isPlaying
        ) {
          stop()
        }
      }
    )
    return (): void => sub.remove()
  }, [isPlaying])

  const asrText: string = useMemo((): string => {
    return ((message as any)?.messagePayload?.asrText) || ''
  }, [message])

  const [showConvertedText, setShowConvertedText] = useState<boolean>(
    (): boolean => {
      const store: Record<string, boolean> | null = readVisibleStoreSync()
      if (store != null && store[message.msgID] === false) {
        return false
      }
      return true
    }
  )

  const syncVisibleMap = useCallback((): void => {
    const visible: boolean = asrText.length > 0 && showConvertedText
    setAudioConvertVisibleMapEntry(message.msgID, visible)
  }, [asrText, showConvertedText, message.msgID])

  useEffect((): void => {
    syncVisibleMap()
  }, [syncVisibleMap])

  useEffect((): void => {
    if (!showConvertedText) {
      persistHideVisible(message.msgID)
    } else {
      persistClearHideVisible(message.msgID)
    }
  }, [showConvertedText, message.msgID])

  useEffect((): void => {
    if (asrText.length === 0) return
    if (inMemoryCacheReady) return
    AsyncStorage.getItem(AUDIO_CONVERT_VISIBLE_STORAGE_KEY)
      .then((raw: string | null): void => {
        if (raw != null && raw.length > 0) {
          inMemoryCache.set(AUDIO_CONVERT_VISIBLE_STORAGE_KEY, raw)
        }
        inMemoryCacheReady = true
        if (raw == null || raw.length === 0) return
        try {
          const parsed: any = JSON.parse(raw)
          if (parsed == null || typeof parsed !== 'object') return
          const store: Record<string, boolean> = parsed as Record<string, boolean>
          if (store[message.msgID] === false) {
            setShowConvertedText(false)
          }
        } catch {
        }
      })
      .catch((): void => {
        inMemoryCacheReady = true  
      })
  }, [asrText, message.msgID])

  useEffect((): (() => void) => {
    return (): void => {
      deleteAudioConvertVisibleMapEntry(message.msgID)
    }
  }, [message.msgID])

  const [isConverting, setIsConverting] = useState<boolean>(false)

  const dot1Opacity = useRef(new Animated.Value(0.3)).current
  const dot2Opacity = useRef(new Animated.Value(0.3)).current
  const dot3Opacity = useRef(new Animated.Value(0.3)).current
  useEffect((): (() => void) => {
    if (!isConverting) {
      dot1Opacity.setValue(0.3)
      dot2Opacity.setValue(0.3)
      dot3Opacity.setValue(0.3)
      return (): void => {}
    }
    const pulse = (val: Animated.Value, delay: number): Animated.CompositeAnimation =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(val, { toValue: 1,
            duration: 400,
            useNativeDriver: true }),
          Animated.timing(val, { toValue: 0.3,
            duration: 400,
            useNativeDriver: true }),
        ])
      )
    const a1: Animated.CompositeAnimation = pulse(dot1Opacity, 0)
    const a2: Animated.CompositeAnimation = pulse(dot2Opacity, 200)
    const a3: Animated.CompositeAnimation = pulse(dot3Opacity, 400)
    a1.start()
    a2.start()
    a3.start()
    return (): void => {
      a1.stop()
      a2.stop()
      a3.stop()
      dot1Opacity.stopAnimation()
      dot2Opacity.stopAnimation()
      dot3Opacity.stopAnimation()
    }
  }, [isConverting, dot1Opacity, dot2Opacity, dot3Opacity])

  useEffect((): void => {
    if (isConverting && asrText.length > 0) {
      setIsConverting(false)
    }
  }, [asrText, isConverting])

  useEffect((): (() => void) => {
    const startSub = DeviceEventEmitter.addListener(
      'audioConvertingStart',
      (data: { messageId: string }): void => {
        if (data?.messageId === message.msgID) {
          setShowConvertedText(true)
          setIsConverting(true)
        }
      }
    )
    const errorSub = DeviceEventEmitter.addListener(
      'audioConvertingError',
      (data: { messageId: string }): void => {
        if (data?.messageId === message.msgID) {
          setIsConverting(false)
        }
      }
    )
    const hideSub = DeviceEventEmitter.addListener(
      'audioConvertHide',
      (data: { messageId: string }): void => {
        if (data?.messageId === message.msgID) {
          setShowConvertedText(false)
        }
      }
    )
    return (): void => {
      startSub.remove()
      errorSub.remove()
      hideSub.remove()
    }
  }, [message.msgID])

  return (
    <View style={[styles.wrapper, isSelf ? styles.wrapperSelf : null]}>
      <Pressable
        ref={bubbleRef}
        onPress={handlePlayTap}
        onLongPress={handleLongPress}
        delayLongPress={LONG_PRESS_THRESHOLD_MS}
        style={[
          styles.bubble,
          isSelf ? styles.bubbleOut : styles.bubbleIn,
          { width: rpxToPx(audioWidth) },
        ]}
      >
        <View style={[styles.highlight, isSelf ? styles.highlightOut : styles.highlightIn]}>
          <View style={[styles.waveContainer, isSelf ? styles.waveOut : styles.waveIn]}>
            <View style={[styles.waveClip, { width: rpxToPx(12), opacity: waveOpacity[0] }]}>
              <Image source={AUDIO_ICON} style={styles.waveIcon} resizeMode="contain" />
            </View>
            <View style={[styles.waveClip, { width: rpxToPx(26), opacity: waveOpacity[1] }]}>
              <Image source={AUDIO_ICON} style={styles.waveIcon} resizeMode="contain" />
            </View>
            <View style={[styles.waveClip, { width: rpxToPx(40), opacity: waveOpacity[2] }]}>
              <Image source={AUDIO_ICON} style={styles.waveIcon} resizeMode="contain" />
            </View>
          </View>
          <View style={styles.duration}>
            <Text style={styles.durationText}>{formatDuration(duration)}</Text>
          </View>
        </View>
      </Pressable>

      {(isConverting || (asrText.length > 0 && showConvertedText)) && (
        <View style={styles.convertBox}>
          {isConverting ? (
            <View style={styles.convertDots}>
              <Animated.Text style={[styles.convertText, { opacity: dot1Opacity }]}>·</Animated.Text>
              <Animated.Text style={[styles.convertText, { opacity: dot2Opacity }]}>·</Animated.Text>
              <Animated.Text style={[styles.convertText, { opacity: dot3Opacity }]}>·</Animated.Text>
            </View>
          ) : (
            <Text style={styles.convertText}>{asrText}</Text>
          )}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  wrapperSelf: { alignItems: 'flex-end' },
  bubble: { minWidth: rpxToPx(200) },
  bubbleIn: { backgroundColor: '#F0F2F7',
    borderTopLeftRadius: rpxToPx(4),
    borderTopRightRadius: rpxToPx(20),
    borderBottomLeftRadius: rpxToPx(20),
    borderBottomRightRadius: rpxToPx(20) },
  bubbleOut: { backgroundColor: '#CCE2FF',
    borderTopLeftRadius: rpxToPx(20),
    borderTopRightRadius: rpxToPx(4),
    borderBottomLeftRadius: rpxToPx(20),
    borderBottomRightRadius: rpxToPx(20) },
  highlight: { flexDirection: 'row',
    alignItems: 'center',
    padding: rpxToPx(20) },
  highlightIn: { flexDirection: 'row' },
  highlightOut: { flexDirection: 'row-reverse' },
  waveContainer: { position: 'relative',
    width: rpxToPx(40),
    height: rpxToPx(40) },
  waveIn: {
    transform: [{ scaleX: -1 }],
  },
  waveOut: {},
  waveClip: { position: 'absolute',
    right: 0,
    top: 0,
    height: rpxToPx(40),
    overflow: 'hidden' },
  waveIcon: { position: 'absolute',
    right: 0,
    top: 0,
    width: rpxToPx(40),
    height: rpxToPx(40) },
  duration: { marginLeft: rpxToPx(8),
    marginRight: rpxToPx(8) },
  durationText: { paddingHorizontal: rpxToPx(4),
    fontSize: rpxToPx(28),
    lineHeight: rpxToPx(32),
    fontWeight: '500',
    color: 'rgba(0, 0, 0, 0.9)' },
  convertBox: { maxWidth: rpxToPx(474),
    marginTop: rpxToPx(12),
    paddingVertical: rpxToPx(16),
    paddingHorizontal: rpxToPx(20),
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: rpxToPx(12),
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)' },
  convertText: { fontSize: rpxToPx(28),
    lineHeight: rpxToPx(40),
    color: 'rgba(0, 0, 0, 0.85)' },
  convertDots: { flexDirection: 'row',
    alignItems: 'center',
    minHeight: rpxToPx(40) },
})
