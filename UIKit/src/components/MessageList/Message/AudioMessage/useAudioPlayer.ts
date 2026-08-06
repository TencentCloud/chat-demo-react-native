import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { AppState, DeviceEventEmitter, type AppStateStatus } from 'react-native'

export const RECORDING_PSEUDO_ID = '__tuikit_audio_recording__'

export const AUDIO_PLAYER_START_EVENT = 'audioPlayerStart'
export const AUDIO_PLAYER_STOP_EVENT = 'audioPlayerStop'
export const AUDIO_PLAY_REQUEST_EVENT = 'audio:play'
export const AUDIO_PLAY_RESULT_EVENT = 'audio:playResult'
export const AUDIO_PLAY_STATE_EVENT = 'audio:playStateChange'

export type AudioPlayResultType = 'ended' | 'error' | 'stopped'

let _playingMessageId: string | null = null
export const getPlayingMessageId = (): string | null => _playingMessageId
export const setPlayingMessageId = (id: string | null): void => {
  _playingMessageId = id
}

interface AudioActiveCallbacks {
  onEnded?: () => void
  onError?: (err: any) => void
}
let _activeCallbacks: AudioActiveCallbacks = {}
export const setActiveCallbacks = (cbs: AudioActiveCallbacks): void => {
  _activeCallbacks = cbs
}

const notifyEnded = (): void => {
  try {
    _activeCallbacks.onEnded?.()
  } catch (e) {
  }
}
const notifyError = (err: any): void => {
  try {
    _activeCallbacks.onError?.(err)
  } catch (e) {
  }
}

export const stopGlobalAudioPlayer = (): void => {
  if (_playingMessageId != null) {
    DeviceEventEmitter.emit(AUDIO_PLAY_REQUEST_EVENT + ':stop', { messageId: _playingMessageId })
  }
  setActiveCallbacks({})
  setPlayingMessageId(null)
}

export const notifyAudioPlayResult = (messageId: string, result: AudioPlayResultType, error?: any): void => {
  if (getPlayingMessageId() !== messageId) return
  if (result === 'ended') {
    notifyEnded()
    setActiveCallbacks({})
  } else if (result === 'error') {
    notifyError(error)
    setActiveCallbacks({})
  } else if (result === 'stopped') {
    setPlayingMessageId(null)
    setActiveCallbacks({})
  }
}

export interface UseAudioPlayerOptions {
  messageId: string
  onComplete?: () => void
  onError?: (error: any) => void
}

export interface UseAudioPlayerReturn {
  isPlaying: boolean
  play: (url: string) => void
  stop: () => void
}

export const useAudioPlayer = (options: UseAudioPlayerOptions): UseAudioPlayerReturn => {
  const { messageId, onComplete, onError } = options
  const [isPlaying, setIsPlaying] = useState(false)

  const tokenRef = useRef(0)
  const playTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isPlayingRef = useRef(false)
  isPlayingRef.current = isPlaying

  const isTokenValid = useCallback(
    (token: number): boolean => token === tokenRef.current && getPlayingMessageId() === messageId,
    [messageId]
  )

  const setPlayingState = useCallback(
    (v: boolean): void => {
      isPlayingRef.current = v
      setIsPlaying(v)
      DeviceEventEmitter.emit(AUDIO_PLAY_STATE_EVENT, { messageId, isPlaying: v })
    },
    [messageId]
  )

  const play = useCallback(
    (url: string): void => {
      if (!url) {
        console.error('[useAudioPlayer] play: url is empty')
        return
      }
      const currentToken = ++tokenRef.current

      DeviceEventEmitter.emit(AUDIO_PLAYER_START_EVENT, { messageId })
      const prevId = getPlayingMessageId()
      if (prevId && prevId !== messageId) {
        DeviceEventEmitter.emit(AUDIO_PLAYER_STOP_EVENT, { messageId: prevId })
      }
      stopGlobalAudioPlayer()

      setPlayingMessageId(messageId)
      setPlayingState(true)

      if (playTimerRef.current) clearTimeout(playTimerRef.current)
      playTimerRef.current = setTimeout((): void => {
        playTimerRef.current = null
        if (!isTokenValid(currentToken)) return

        setActiveCallbacks({
          onEnded: (): void => {
            if (!isTokenValid(currentToken)) return
            setPlayingState(false)
            onComplete?.()
          },
          onError: (err: any): void => {
            if (!isTokenValid(currentToken)) return
            setPlayingState(false)
            onError?.(err)
          },
        })

        DeviceEventEmitter.emit(AUDIO_PLAY_REQUEST_EVENT, {
          messageId,
          url,
        })
      }, 50)
    },
    [isTokenValid, messageId, onComplete, onError, setPlayingState]
  )

  const stop = useCallback((): void => {
    tokenRef.current++
    if (playTimerRef.current) {
      clearTimeout(playTimerRef.current)
      playTimerRef.current = null
    }
    if (getPlayingMessageId() === messageId) {
      stopGlobalAudioPlayer()
    }
    setPlayingState(false)
    onComplete?.()
  }, [messageId, onComplete, setPlayingState])

  useEffect((): (() => void) => {
    const sub = DeviceEventEmitter.addListener(AUDIO_PLAYER_START_EVENT, (data: { messageId: string }): void => {
      if (data?.messageId === messageId) {
        return
      }
      tokenRef.current++
      if (playTimerRef.current) {
        clearTimeout(playTimerRef.current)
        playTimerRef.current = null
      }
      if (isPlayingRef.current) {
        setPlayingState(false)
        onComplete?.()
      }
    })
    return (): void => sub.remove()
  }, [messageId, onComplete, setPlayingState])

  useEffect((): (() => void) => {
    const handler = (next: AppStateStatus): void => {
      if (next === 'background' && isPlayingRef.current) {
        stop()
      }
    }
    const sub = AppState.addEventListener('change', handler)
    return (): void => sub.remove()
  }, [stop])

  useEffect((): (() => void) => {
    return (): void => {
      tokenRef.current++
      if (playTimerRef.current) {
        clearTimeout(playTimerRef.current)
        playTimerRef.current = null
      }
      if (getPlayingMessageId() === messageId) {
        stopGlobalAudioPlayer()
      }
    }
  }, [messageId])

  return { isPlaying, play, stop }
}
