import React, { forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Animated, DeviceEventEmitter, Easing, Image, Keyboard, KeyboardEvent, PermissionsAndroid, Platform, StyleSheet, TextInput, TouchableOpacity, View, type GestureResponderEvent } from 'react-native'
import { Text } from '../Text'
import { useMessageInputState, type OfflinePushInfoResolver } from 'tuikit-atomicx-react-native'
import Sound from 'react-native-nitro-sound'
import { rpxToPx } from '../../utils/rpxToPx'
import { theme, fontSize } from '../../utils/theme'
import { EmojiPanel } from './EmojiPanel'
import { ToolsPanel, type ToolItem, DEFAULT_TOOLS } from './ToolsPanel'
import { sendMediaMessage } from './sendMediaMessage'
import { USER_PICKER_TYPE } from '../UserPicker/const'
import type { User } from '../UserPicker/types/user'
import { AT_ALL_TAG,
  insertMention,
  scanMentions,
  tryDeleteWholeMention,
  type MentionSegment } from './utils/mention'

type SoundType = typeof Sound

export type MessageInputState = 'NONE' | 'TEXT' | 'VOICE' | 'EMOJI' | 'TOOLS'

export interface MessageInputProps {
  conversationID: string
  placeholder?: string
  disabled?: boolean
  draftText?: string
  enableVoice?: boolean
  enableEmoji?: boolean
  enableTools?: boolean
  toolList?: ToolItem[]
  setOfflinePushInfo?: OfflinePushInfoResolver
  onHeightChange?: (data: { inputToolbarHeight: number; inputPanelHeight: number }) => void
  onFocus?: () => void
  onSend?: (text: string) => void
  isInCall?: boolean
  /**
   * ponytail(v19.120): 替换 useNavigation —— 父级页面实现"@ 选人"页面跳转
   * 不传则 @ 选人按钮不响应（与原 navigation.navigate 失败的 fallback 行为一致）
   */
  onOpenUserPicker?: (info: {
    businessType: any
    routeParams: {
      conversationID: string
      enableAtAll?: boolean
      excludeSelf?: boolean
      onSelect?: (data: { selectedUsers: User[] }) => void
    }
  }) => void
}

import { iconAssets } from '../../static/iconBase64'
import { showToast } from '../../utils/toast'

const ICON_MIC = iconAssets['static/icon/message-input/nvue_mic.png']
const ICON_MORE = iconAssets['static/icon/message-input/nvue_more.png']
const ICON_FACE = iconAssets['static/icon/message-input/nvue_face.png']
const ICON_CLOSE = iconAssets['static/icon/message-input/close.png']
const ICON_AUDIO = iconAssets['static/icon/message-input/audio.png']
const ICON_RECORDING_BG = iconAssets['static/icon/message-input/recording_bg.png']

const RECORDING_MAX_SECONDS = 60
const COUNTDOWN_START_AT = 50
const MIN_RECORD_DURATION_MS = 1000
const RECORDING_CANCEL_THRESHOLD = 100
const PANEL_HEIGHT = rpxToPx(550)

const stripFileSchemePrefix = (path: string): string => {
  if (path.length === 0) return ''
  if (path.startsWith('file:///')) return path.slice(8)  
  if (path.startsWith('file://')) return path.slice(7)   
  return path
}

const WAVE_BAR_CONFIGS = [
  { size: 'xs', baseHeight: 0.2 },
  { size: 'lg', baseHeight: 0.75 },
  { size: 'md', baseHeight: 0.5 },
  { size: 'xl', baseHeight: 1.0 },
  { size: 'sm', baseHeight: 0.35 },
  { size: 'lg', baseHeight: 0.75 },
  { size: 'xs', baseHeight: 0.2 },
  { size: 'lg', baseHeight: 0.75 },
  { size: 'md', baseHeight: 0.5 },
  { size: 'xl', baseHeight: 1.0 },
  { size: 'sm', baseHeight: 0.35 },
  { size: 'lg', baseHeight: 0.75 },
] as const

const WAVE_PHASE_OFFSETS = [0, 0.5, 1.0, 1.5, 2.0, 2.5, 0, 0.5, 1.0, 1.5, 2.0, 2.5]

export interface MessageInputExpose {
  collapse: () => void
  focus: () => void
  blur: () => void
  getState: () => MessageInputState
  notifyVoiceRecordError: (err: { type: 'permission' | 'system'; message?: string }) => void
  getInputRef: () => TextInput | null
}

export const MessageInput = forwardRef<MessageInputExpose, MessageInputProps>((props, ref) => {
  const { t } = useTranslation()
  const { conversationID,
    placeholder, 
    disabled = false,
    draftText = '',
    enableVoice = true,
    enableEmoji = true,
    enableTools = true,
    toolList = DEFAULT_TOOLS,
    setOfflinePushInfo,
    onSend,
    onHeightChange,
    onFocus,
    isInCall = false } = props

  const [text, setText] = useState(draftText)
  const [inputState, setInputState] = useState<MessageInputState>('NONE')
  const [isRecording, setIsRecording] = useState(false)
  const [isCancelArea, setIsCancelArea] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)

  const [mentions, setMentions] = useState<MentionSegment[]>([])
  const [inputKey, setInputKey] = useState<number>(0)
  const selectedMembersRef = useRef<Map<string, string>>(new Map())
  const mentionAnchorRef = useRef(-1)
  const lastInputTextRef = useRef('')
  const lastInputCursorRef = useRef(0)
  const mentionDeleteCooldownUntilRef = useRef(0)

  const inputRef = useRef<TextInput>(null)
  const recordStartYRef = useRef(0)
  const recordStartXRef = useRef(0)
  const recordStartTimeRef = useRef(0)
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const isAutoStopByMaxDurationRef = useRef(false)
  const audioRecorderPlayerRef = useRef<SoundType | null>(null)
  const recordingFilePathRef = useRef<string>('')
  const panelOpacity = useRef(new Animated.Value(0)).current
  const toolbarHeightRef = useRef(0)
  const panelHeightRef = useRef(0)
  const waveBarAnimValues = useRef<Animated.Value[]>(
    WAVE_BAR_CONFIGS.map(() => new Animated.Value(0.1))
  ).current
  const waveAnimationTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const messageInputState = useMessageInputState({ conversationID })

  // ponytail(v19.120): 用 props.onOpenUserPicker 替代 useNavigation（@ 选人跳转提升到父级）

  const handleAtUserSelected = useCallback((data: { selectedUsers: User[] }): void => {
    const selectedUsers: User[] = data.selectedUsers
    if (selectedUsers.length === 0) return
    if (mentionAnchorRef.current < 0) return

    let currentText: string = lastInputTextRef.current
    let currentAnchor: number = mentionAnchorRef.current

    for (const u of selectedUsers) {
      const displayName: string = u.userID === AT_ALL_TAG
        ? t('messageInput.atAll')
        : (u.nickname != null && u.nickname.length > 0 ? u.nickname : u.userID)
      const result = insertMention(currentText, currentAnchor, 0, displayName)
      selectedMembersRef.current.set(displayName, u.userID)
      currentText = result.newText
      currentAnchor = result.newCursor
    }

    setText(currentText)
    lastInputTextRef.current = currentText
    lastInputCursorRef.current = currentAnchor
    setMentions(scanMentions(currentText, selectedMembersRef.current))
    mentionAnchorRef.current = -1
  }, [])

  const handleMentionTrigger = useCallback((): void => {
    if (!conversationID.startsWith('group_')) return
    if (typeof props.onOpenUserPicker !== 'function') return
    props.onOpenUserPicker({
      businessType: USER_PICKER_TYPE.SELECT_GROUP_AT_USER as any,
      routeParams: {
        conversationID,
        enableAtAll: true,
        excludeSelf: true,
        onSelect: handleAtUserSelected,
      },
    })
  }, [conversationID, props.onOpenUserPicker, handleAtUserSelected])


  const switchState = useCallback(
    (next: MessageInputState) => {
      if (inputState === next) return
      setInputState(next)
    },
    [inputState]
  )

  useEffect((): (() => void) => {
    const handleReEdit = (data: { conversationID: string; text: string }): void => {
      if (!data || data.conversationID !== conversationID) return
      switchState('NONE')
      setText(data.text)
    }
    const sub = DeviceEventEmitter.addListener('atomicx-reEdit', handleReEdit)
    return (): void => {
      sub.remove()
    }
  }, [conversationID, switchState])

  const handleMicTap = useCallback(() => {
    if (inputState === 'VOICE') {
      switchState('TEXT')
      inputRef.current?.focus()
    } else {
      Keyboard.dismiss()
      switchState('VOICE')
    }
  }, [inputState, switchState])

  const handleFaceTap = useCallback(() => {
    if (inputState === 'EMOJI') {
      switchState('TEXT')
      inputRef.current?.focus()
    } else {
      Keyboard.dismiss()
      if (Platform.OS === 'ios') {
        setTimeout(() => switchState('EMOJI'), 100)
      } else {
        switchState('EMOJI')
      }
    }
  }, [inputState, switchState])

  const handleMoreTap = useCallback((): void => {
    const trimmed = text.trim()
    if (trimmed.length === 0) {
      if (inputState === 'TOOLS') {
        switchState('TEXT')
        inputRef.current?.focus()
      } else {
        Keyboard.dismiss()
        if (Platform.OS === 'ios') {
          setTimeout(() => switchState('TOOLS'), 200)
        } else {
          switchState('TOOLS')
        }
      }
      return
    }
    const payload = { type: 'text' as const, text: trimmed }
    const atUserIDs: string[] = Array.from(
      new Set(mentions.map((m: MentionSegment): string => m.userID))
    )
    sendMediaMessage({ messageInputState,
      conversationID,
      payload,
      setOfflinePushInfo,
      atUserList: atUserIDs.length > 0 ? atUserIDs : undefined }).then((): void => {
      onSend?.(trimmed)
    }).catch((e: any | null): void => {
      console.error(`[MessageInput] handleMoreTap sendMediaMessage catch: ${e != null ? `${e}` : 'null'}`)
    })
    setText('')
    setMentions([])
    selectedMembersRef.current.clear()
    mentionAnchorRef.current = -1
    lastInputTextRef.current = ''
    lastInputCursorRef.current = 0
    mentionDeleteCooldownUntilRef.current = 0
    setInputKey((prev: number): number => prev + 1)
  }, [text, inputState, switchState, messageInputState, conversationID, setOfflinePushInfo, onSend, mentions])


  const handleEmojiInsert = useCallback(
    (emoji: string): void => {
      setText((prev) => {
        const cursor: number = lastInputCursorRef.current
        const safeCursor: number = Math.max(0, Math.min(cursor, prev.length))
        const newText: string = prev.slice(0, safeCursor) + emoji + prev.slice(safeCursor)
        setTimeout((): void => {
          try {
            inputRef.current?.setSelection?.(safeCursor + emoji.length, safeCursor + emoji.length)
          } catch {
          }
          lastInputCursorRef.current = safeCursor + emoji.length
        }, 0)
        return newText
      })
    },
    []
  )

  const handleEmojiDelete = useCallback((): void => {
    setText((prev) => {
      if (prev.length === 0) return prev
      return Array.from(prev).slice(0, -1).join('')
    })
  }, [])


  const startWaveAnimation = useCallback((): void => {
    if (waveAnimationTimerRef.current) return

    WAVE_BAR_CONFIGS.forEach((bar, index) => {
      const initialScale = bar.baseHeight * 0.5
      waveBarAnimValues[index].setValue(initialScale)
    })

    let phase = 0
    waveAnimationTimerRef.current = setInterval(() => { phase += 0.25
      WAVE_BAR_CONFIGS.forEach((bar, index) => {
        const waveAmplitude = 0.15 + 0.85 * Math.abs(Math.sin(phase + WAVE_PHASE_OFFSETS[index]))
        const scale = bar.baseHeight * waveAmplitude
        Animated.timing(waveBarAnimValues[index], {
          toValue: scale,
          duration: 100,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true }).start()
      })
    }, 100)
  }, [waveBarAnimValues])

  const stopWaveAnimation = useCallback((): void => {
    if (waveAnimationTimerRef.current) {
      clearInterval(waveAnimationTimerRef.current)
      waveAnimationTimerRef.current = null
    }
    WAVE_BAR_CONFIGS.forEach((_bar, index) => { Animated.timing(waveBarAnimValues[index], {
        toValue: 1,
        duration: 100,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true }).start()
    })
  }, [waveBarAnimValues])

  const resetRecordingState = useCallback((): void => {
    setIsRecording(false)
    setIsCancelArea(false)
    setRecordingDuration(0)
    isAutoStopByMaxDurationRef.current = false
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current)
      recordingTimerRef.current = null
    }
    stopWaveAnimation()
  }, [stopWaveAnimation])

  const handleVoiceRecordError = useCallback(
    (err: { type: 'permission' | 'system'; message?: string }): void => {
      resetRecordingState()
      console.warn(`[MessageInput] voice record error: ${err.type} ${err.message ?? ''}`)
    },
    [resetRecordingState]
  )

  const executeAutoStop = useCallback((): void => {
    setIsRecording(false)
    setIsCancelArea(false)
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current)
      recordingTimerRef.current = null
    }
    stopWaveAnimation()
    if (audioRecorderPlayerRef.current != null) {
      audioRecorderPlayerRef.current.stopRecorder().then((stoppedUri: string): void => {
        const rawPath = stoppedUri.length > 0 ? stoppedUri : recordingFilePathRef.current
        const filePath = stripFileSchemePrefix(rawPath)
        if (filePath.length > 0) {
          void sendMediaMessage({
            messageInputState,
            conversationID,
            payload: { type: 'audio', audioFilePath: filePath, duration: RECORDING_MAX_SECONDS },
            setOfflinePushInfo,
          })
          recordingFilePathRef.current = ''
        }
      }).catch((err: any): void => {
        handleVoiceRecordError({ type: 'system', message: String(err) })
      })
    }
  }, [stopWaveAnimation, messageInputState, conversationID, setOfflinePushInfo, handleVoiceRecordError])

  const handleVoiceTouchStart = useCallback(
    (e: GestureResponderEvent) => {
      if (disabled) return
      if (isInCall) {
        showToast(t('messageInput.callingCannotRecord'))
        return
      }
      const nativeEvent = e.nativeEvent
      recordStartYRef.current = nativeEvent.pageY
      recordStartXRef.current = nativeEvent.pageX
      recordStartTimeRef.current = Date.now()
      setIsRecording(true)
      setIsCancelArea(false)
      setRecordingDuration(0)
      isAutoStopByMaxDurationRef.current = false
      void (async (): Promise<void> => { 
        if (Platform.OS === 'android') {
          try {
            const granted = await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
              {
                title: t('messageInput.permissionTitle'),
                message: t('messageInput.permissionMessage'),
                buttonPositive: t('messageInput.permissionConfirm'),
                buttonNegative: t('messageInput.permissionCancel') }
            )
            if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
              handleVoiceRecordError({ type: 'permission', message: t('messageInput.permissionDenied') })
              return
            }
          } catch (err: any) {
            handleVoiceRecordError({ type: 'system', message: t('messageInput.permissionError', { error: String(err) }) })
            return
          }
        }
        if (audioRecorderPlayerRef.current == null) {
          audioRecorderPlayerRef.current = Sound
        }
        try {
          const uri: string = await audioRecorderPlayerRef.current.startRecorder()
          recordingFilePathRef.current = uri
        } catch (err: any) {
          handleVoiceRecordError({ type: 'system', message: String(err) })
        }
      })()
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current)
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration((d) => {
          const next = d + 1
          if (next === COUNTDOWN_START_AT) {
            stopWaveAnimation()
            setIsCancelArea(false)
          }
          if (next >= RECORDING_MAX_SECONDS) {
            isAutoStopByMaxDurationRef.current = true
            setIsCancelArea(false)
            executeAutoStop()
          }
          return next
        })
      }, 1000)
      setTimeout(() => {
        startWaveAnimation()
      }, 0)
    },
    [disabled, isInCall, startWaveAnimation, stopWaveAnimation, executeAutoStop, handleVoiceRecordError]
  )

  const handleVoiceTouchMove = useCallback(
    (e: GestureResponderEvent) => {
      if (!isRecording) return
      if (recordingDuration >= COUNTDOWN_START_AT) {
        setIsCancelArea(false)
        return
      }
      const t = e.nativeEvent
      const deltaY = recordStartYRef.current - t.pageY
      const inCancelArea = deltaY > RECORDING_CANCEL_THRESHOLD
      if (inCancelArea !== isCancelArea) {
        setIsCancelArea(inCancelArea)
      }
    },
    [isRecording, isCancelArea, recordingDuration]
  )

  const computeStopMode = useCallback((): 'normal' | 'cancel' | 'autoStop' => {
    if (isAutoStopByMaxDurationRef.current) {
      return 'autoStop'
    }
    if (isCancelArea) {
      return 'cancel'
    }
    return 'normal'
  }, [isCancelArea])

  const handleVoiceTouchEnd = useCallback(() => {
    if (!isRecording) return

    const stopMode = computeStopMode()

    if (stopMode === 'autoStop') {
      executeAutoStop()
      return
    }

    if (stopMode === 'cancel') {
      setIsRecording(false)
      setIsCancelArea(false)
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current)
        recordingTimerRef.current = null
      }
      stopWaveAnimation()
      if (audioRecorderPlayerRef.current != null) {
        audioRecorderPlayerRef.current.stopRecorder().then((): void => {
          recordingFilePathRef.current = ''
        }).catch((err: any): void => {
          handleVoiceRecordError({ type: 'system', message: String(err) })
        })
      }
      return
    }

    const durationMs = Date.now() - recordStartTimeRef.current
    if (durationMs < MIN_RECORD_DURATION_MS) {
      showToast(t('messageInput.recordTooShort'))
      resetRecordingState()
      if (audioRecorderPlayerRef.current != null) {
        void audioRecorderPlayerRef.current.stopRecorder().catch((): void => {
        })
      }
      recordingFilePathRef.current = ''
      return
    }

    setIsRecording(false)
    setIsCancelArea(false)
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current)
      recordingTimerRef.current = null
    }
    stopWaveAnimation()
    if (audioRecorderPlayerRef.current != null) {
      audioRecorderPlayerRef.current.stopRecorder().then((stoppedUri: string): void => {
        const rawPath = stoppedUri.length > 0 ? stoppedUri : recordingFilePathRef.current
        const filePath = stripFileSchemePrefix(rawPath)
        if (filePath.length > 0) {
          const durationSec = Math.max(1, Math.round(durationMs / 1000))
          void sendMediaMessage({
            messageInputState,
            conversationID,
            payload: { type: 'audio', audioFilePath: filePath, duration: durationSec },
            setOfflinePushInfo,
          })
          recordingFilePathRef.current = ''
        }
      }).catch((err: any): void => {
        handleVoiceRecordError({ type: 'system', message: String(err) })
      })
    }
  }, [isRecording, computeStopMode, stopWaveAnimation, resetRecordingState, messageInputState, conversationID, setOfflinePushInfo, executeAutoStop, handleVoiceRecordError])

  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current)
      if (waveAnimationTimerRef.current) clearInterval(waveAnimationTimerRef.current)
      if (audioRecorderPlayerRef.current != null) {
        void audioRecorderPlayerRef.current.stopRecorder().catch((): void => {})
        void audioRecorderPlayerRef.current.removeRecordBackListener()
        audioRecorderPlayerRef.current = null
      }
    }
  }, [])


  useEffect(() => {
    const onShow = (_e: KeyboardEvent): void => {
      if (inputState === 'NONE' || inputState === 'VOICE') {
        switchState('TEXT')
      }
    }
    const onHide = (_e: KeyboardEvent): void => {
      if (inputState === 'TEXT') {
        switchState('NONE')
      }
    }
    const showSub = Keyboard.addListener('keyboardDidShow', onShow)
    const hideSub = Keyboard.addListener('keyboardDidHide', onHide)
    return () => {
      showSub.remove()
      hideSub.remove()
    }
  }, [inputState, switchState])

  const reportHeight = useCallback((): void => { if (onHeightChange == null) return
    const showPanel = inputState === 'EMOJI' || inputState === 'TOOLS'
    onHeightChange({
      inputToolbarHeight: toolbarHeightRef.current,
      inputPanelHeight: showPanel ? panelHeightRef.current : 0 })
  }, [inputState, onHeightChange])

  const onToolbarLayout = useCallback(
    (e: { nativeEvent: { layout: { height: number } } }): void => {
      const h = e.nativeEvent.layout.height
      if (h > 0) {
        if (toolbarHeightRef.current !== h) {
          toolbarHeightRef.current = h
        }
        reportHeight()
      }
    },
    [reportHeight]
  )
  const onPanelLayout = useCallback(
    (e: { nativeEvent: { layout: { height: number } } }): void => {
      const h = e.nativeEvent.layout.height
      if (h > 0) {
        if (panelHeightRef.current !== h) {
          panelHeightRef.current = h
        }
        reportHeight()
      }
    },
    [reportHeight]
  )

  useEffect(() => {
    reportHeight()
  }, [reportHeight])

  useEffect(() => { const showPanel = inputState === 'EMOJI' || inputState === 'TOOLS'
    const toOpacity: number = showPanel ? 1 : 0
    Animated.timing(panelOpacity, {
      toValue: toOpacity,
      duration: 200,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true
    }).start()
  }, [inputState, panelOpacity])


  useImperativeHandle(
    ref,
    (): MessageInputExpose => ({
      collapse: () => {
        if (inputState !== 'VOICE') {
          switchState('NONE')
          Keyboard.dismiss()
        }
      },
      focus: () => {
        switchState('TEXT')
        inputRef.current?.focus()
      },
      blur: () => {
        inputRef.current?.blur()
      },
      getState: () => inputState,
      notifyVoiceRecordError: handleVoiceRecordError,
      getInputRef: () => inputRef.current,
    }),
    [inputState, switchState, handleVoiceRecordError]
  )


  const hasContent = text.trim().length > 0
  const showEmojiPanel = inputState === 'EMOJI'
  const showToolsPanel = inputState === 'TOOLS'
  const showAnyPanel = showEmojiPanel || showToolsPanel


  return (
    <View style={styles.container}>
      {isRecording && (
        <View style={styles.recordingOverlay} pointerEvents="none">
          <View style={styles.recordingGradientTop} pointerEvents="none" />
          <View style={styles.recordingGradientBottom} pointerEvents="none" />
          <View style={styles.recordingContent}>
            <View style={styles.recordingIndicatorWrapper}>
              <View
                style={[
                  styles.recordingIndicator,
                  isCancelArea && styles.recordingIndicatorCancel,
                ]}
              >
                {(() => {
                  const countdown = RECORDING_MAX_SECONDS - recordingDuration
                  if (countdown > 0 && countdown <= 10) {
                    return (
                      <Text style={styles.recordingCountdownText}>
                        {t('messageInput.countdown', { count: countdown })}
                      </Text>
                    )
                  }
                  return (
                    <View style={styles.waveformGroup}>
                      {WAVE_BAR_CONFIGS.map((bar, i) => (
                        <Animated.View
                          key={i}
                          style={[
                            styles.waveBar,
                            { transform: [{ scaleY: waveBarAnimValues[i] }] },
                          ]}
                        />
                      ))}
                    </View>
                  )
                })()}
              </View>
              <View
                style={[
                  styles.recordingArrow,
                  isCancelArea && styles.recordingArrowCancel,
                ]}
              />
            </View>
            <Text style={styles.recordingText}>
              {isCancelArea ? t('messageInput.releaseToCancel') : t('messageInput.releaseToSend')}
            </Text>
            <View
              style={[
                styles.recordingCancelBtn,
                isCancelArea && styles.recordingCancelBtnActive,
              ]}
            >
              <Image source={ICON_CLOSE} style={styles.recordingCancelIcon} resizeMode="contain" />
            </View>
            <View
              style={[
                styles.recordingBottom,
                isCancelArea && styles.recordingBottomCancel,
              ]}
            >
              <Image source={ICON_RECORDING_BG} style={styles.recordingBottomBg} resizeMode="stretch" />
              <Image source={ICON_AUDIO} style={[styles.recordingIcon, isCancelArea && styles.recordingIconCancel]} resizeMode="contain" />
            </View>
          </View>
        </View>
      )}

      <View style={styles.toolbar} onLayout={onToolbarLayout}>
        {enableVoice && (
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.btn}
            onPress={handleMicTap}
            disabled={disabled}
          >
            <Image
              source={inputState === 'VOICE' ? ICON_MORE : ICON_MIC}
              style={[styles.icon, inputState === 'VOICE' && styles.iconRotate]}
              resizeMode="contain"
            />
          </TouchableOpacity>
        )}

        <View style={styles.box}>
          {inputState === 'VOICE' ? (
            <View
              style={[
                styles.recordTrigger,
                isRecording && styles.recordTriggerActive,
              ]}
              onTouchStart={handleVoiceTouchStart}
              onTouchMove={handleVoiceTouchMove}
              onTouchEnd={handleVoiceTouchEnd}
              onTouchCancel={handleVoiceTouchEnd}
            >
              <Text style={styles.recordTriggerText}>{t('messageInput.holdToSpeak')}</Text>
            </View>
          ) : (
            <TextInput
              ref={inputRef}
              key={inputKey}
              style={styles.field}
              placeholder={placeholder ?? t('messageInput.textPlaceholder')}
              placeholderTextColor="#BBBBBB"
              value={text}
              onChangeText={(t) => {
                const oldText: string = lastInputTextRef.current
                const oldCursor: number = lastInputCursorRef.current
                const isGroup: boolean = conversationID.startsWith('group_')

                if (Date.now() < mentionDeleteCooldownUntilRef.current) {
                  if (t.length <= oldText.length) {
                    mentionDeleteCooldownUntilRef.current = 0
                  } else {
                    return
                  }
                }

                if (isGroup) {
                  const deleted = tryDeleteWholeMention(oldText, t, oldCursor, mentions)
                  if (deleted != null) {
                    setText(deleted.newText)
                    lastInputTextRef.current = deleted.newText
                    lastInputCursorRef.current = deleted.newCursor
                    setMentions(scanMentions(deleted.newText, selectedMembersRef.current))
                    mentionDeleteCooldownUntilRef.current = Date.now() + 500
                    return
                  }
                }

                if (isGroup) {
                  setMentions(scanMentions(t, selectedMembersRef.current))
                }

                if (
                  isGroup &&
                  t.length === oldText.length + 1 &&
                  t.length > 0 &&
                  t.substring(t.length - 1) === '@'
                ) {
                  mentionAnchorRef.current = t.length - 1
                  handleMentionTrigger()
                }

                lastInputTextRef.current = t
                setText(t)
              }}
              onSelectionChange={(e) => {
                lastInputCursorRef.current = e.nativeEvent.selection.start
              }}
              onFocus={() => {
                if (inputState !== 'TEXT') switchState('TEXT')
                onFocus?.()
              }}
              editable={!disabled}
              multiline
              maxLength={2000}
              blurOnSubmit={false}
            />
          )}
        </View>

        {enableEmoji && (
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.btn}
            onPress={handleFaceTap}
            disabled={disabled}
          >
            <Image source={ICON_FACE} style={styles.icon} resizeMode="contain" />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          activeOpacity={0.7}
          style={hasContent ? styles.sendBtnWrap : styles.btn}
          onPress={handleMoreTap}
          disabled={disabled}
        >
          {hasContent ? (
            <Text style={styles.sendBtnText}>{t('common.send')}</Text>
          ) : (
            enableTools && (
              <Image source={ICON_MORE} style={styles.icon} resizeMode="contain" />
            )
          )}
        </TouchableOpacity>
      </View>

      <Animated.View
        style={[
          styles.panelLayer,
          {
            height: showAnyPanel ? PANEL_HEIGHT : 0,
            opacity: panelOpacity,
          }
        ]}
        pointerEvents={showAnyPanel ? 'auto' : 'none'}
        onLayout={onPanelLayout}
      >
        {showEmojiPanel && (
          <EmojiPanel
            onEmojiSelect={handleEmojiInsert}
            onEmojiDelete={handleEmojiDelete}
          />
        )}
        {showToolsPanel && (
          <ToolsPanel
            toolList={toolList}
            conversationID={conversationID}
            setOfflinePushInfo={setOfflinePushInfo}
          />
        )}
      </Animated.View>
    </View>
  )
})

MessageInput.displayName = 'MessageInput'

const styles = StyleSheet.create({ container: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.borderLight },
  recordingOverlay: { ...StyleSheet.absoluteFill,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
    alignItems: 'center',
    zIndex: 999 },
  recordingGradientTop: { position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'transparent' },
  recordingGradientBottom: { position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: '#F9FAFC' },
  recordingContent: { width: rpxToPx(750),
    alignItems: 'center' },
  recordingIndicatorWrapper: { alignItems: 'center',
    paddingBottom: rpxToPx(7),
    marginBottom: rpxToPx(32) },
  recordingIndicator: { width: rpxToPx(320),
    height: rpxToPx(136),
    backgroundColor: '#147AFF',
    borderRadius: rpxToPx(20),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center' },
  recordingIndicatorCancel: { backgroundColor: '#FA5151' },
  recordingCountdownText: { fontSize: rpxToPx(32),
    color: '#FFFFFF',
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: rpxToPx(60),
    height: rpxToPx(60) },
  waveformGroup: { flexDirection: 'row',
    alignItems: 'center',
    height: rpxToPx(60) },
  waveBar: { width: 2,
    height: rpxToPx(56),
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
    marginHorizontal: 2, 
    transformOrigin: 'center center' },
  waveBar_xs: { transform: [{ scaleY: 0.1 }] },
  waveBar_sm: { transform: [{ scaleY: 0.175 }] },
  waveBar_md: { transform: [{ scaleY: 0.25 }] },
  waveBar_lg: { transform: [{ scaleY: 0.375 }] },
  waveBar_xl: { transform: [{ scaleY: 0.5 }] },
  recordingArrow: {
    width: rpxToPx(24),
    height: rpxToPx(24),
    backgroundColor: '#147AFF',
    transform: [{ rotate: '45deg' }],
    marginTop: rpxToPx(-17),
  },
  recordingArrowCancel: { backgroundColor: '#FA5151' },
  recordingText: { fontSize: rpxToPx(28),
    color: '#000000',
    marginBottom: rpxToPx(48) },
  recordingCancelBtn: { width: rpxToPx(80),
    height: rpxToPx(80),
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.5 },
  recordingCancelBtnActive: { opacity: 1 },
  recordingCancelIcon: { width: rpxToPx(80),
    height: rpxToPx(80) },
  recordingBottom: { width: rpxToPx(750),
    height: rpxToPx(360),
    paddingTop: rpxToPx(164),
    paddingBottom: rpxToPx(94),
    alignItems: 'center',
    justifyContent: 'center' },
  recordingBottomCancel: {
    opacity: 1,
  },
  recordingBottomBg: { position: 'absolute',
    top: 0,
    left: 0,
    width: rpxToPx(750),
    height: rpxToPx(360) },
  recordingIcon: {
    width: rpxToPx(48),
    height: rpxToPx(60),
    transform: [{ rotate: '180deg' }],
    opacity: 0.5,
  },
  recordingIconCancel: { opacity: 1 },
  toolbar: { flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8 },
  btn: { width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center' },
  icon: { width: 28,
    height: 28 },
  iconRotate: {
    transform: [{ rotate: '45deg' }],
  },
  box: { flex: 1,
    backgroundColor: '#F0F2F7',
    borderRadius: 8,
    marginHorizontal: 6 },
  field: { minHeight: 36,
    maxHeight: 100,
    lineHeight: 22,
    paddingTop: 6,
    paddingBottom: 6,
    paddingHorizontal: 12,
    fontSize: fontSize.md,
    color: theme.textPrimary },
  recordTrigger: { minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8 },
  recordTriggerActive: { backgroundColor: 'rgba(0, 0, 0, 0.05)' },
  recordTriggerText: { fontSize: fontSize.md,
    color: '#000000' },
  sendBtnWrap: { marginLeft: rpxToPx(20),
    paddingHorizontal: rpxToPx(24),
    paddingVertical: rpxToPx(8),
    backgroundColor: '#07c160',
    borderRadius: rpxToPx(8),
    justifyContent: 'center',
    alignItems: 'center' },
  sendBtnText: { color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500' },
  panelLayer: { height: PANEL_HEIGHT,
    overflow: 'hidden' },
})

export default MessageInput
