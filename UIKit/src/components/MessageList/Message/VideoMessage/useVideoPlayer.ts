import { useCallback, useEffect, useRef, useState } from 'react'
import { AppState, DeviceEventEmitter, type AppStateStatus } from 'react-native'

export const VIDEO_PLAYER_START_EVENT = 'videoPlayerStart'
export const VIDEO_PLAYER_STOP_EVENT = 'videoPlayerStop'
export const VIDEO_PLAY_REQUEST_EVENT = 'video:play'
export const VIDEO_PLAY_RESULT_EVENT = 'video:playResult'
export const VIDEO_PLAY_STATE_EVENT = 'video:playStateChange'

export type VideoPlayResultType = 'ended' | 'error' | 'stopped'

let _playingMessageId: string | null = null
export const getPlayingVideoId = (): string | null => _playingMessageId
export const setPlayingVideoId = (id: string | null): void => {
  _playingMessageId = id
}

interface VideoActiveCallbacks {
  onEnded?: () => void
  onError?: (err: any) => void
}
let _activeCallbacks: VideoActiveCallbacks = {}
export const setVideoActiveCallbacks = (cbs: VideoActiveCallbacks): void => {
  _activeCallbacks = cbs
}

export const stopGlobalVideoPlayer = (): void => {
  if (_playingMessageId != null) {
    DeviceEventEmitter.emit(VIDEO_PLAY_REQUEST_EVENT + ':stop', { messageId: _playingMessageId })
  }
  setVideoActiveCallbacks({})
  setPlayingVideoId(null)
}

export const notifyVideoPlayResult = (
  messageId: string,
  result: VideoPlayResultType,
  error?: any
): void => {
  if (getPlayingVideoId() !== messageId) return
  if (result === 'ended') {
    try { _activeCallbacks.onEnded?.() } catch (e) {  }
    setVideoActiveCallbacks({})
  } else if (result === 'error') {
    try { _activeCallbacks.onError?.(error) } catch (e) {  }
    setVideoActiveCallbacks({})
  } else if (result === 'stopped') {
    setPlayingVideoId(null)
    setVideoActiveCallbacks({})
  }
}

export interface UseVideoPlayerOptions {
  messageId: string
  onComplete?: () => void
  onError?: (error: any) => void
}

export interface UseVideoPlayerReturn {
  isPlaying: boolean
  play: (url: string) => void
  stop: () => void
}

export const useVideoPlayer = (options: UseVideoPlayerOptions): UseVideoPlayerReturn => {
  const { messageId, onComplete, onError } = options
  const [isPlaying, setIsPlaying] = useState(false)

  const tokenRef = useRef(0)
  const playTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isPlayingRef = useRef(false)
  isPlayingRef.current = isPlaying

  const isTokenValid = useCallback(
    (token: number): boolean => token === tokenRef.current && getPlayingVideoId() === messageId,
    [messageId]
  )

  const setPlayingState = useCallback(
    (v: boolean): void => {
      isPlayingRef.current = v
      setIsPlaying(v)
      DeviceEventEmitter.emit(VIDEO_PLAY_STATE_EVENT, { messageId, isPlaying: v })
    },
    [messageId]
  )

  const play = useCallback(
    (url: string): void => {
      if (!url) {
        console.error('[useVideoPlayer] play: url is empty')
        return
      }
      const currentToken = ++tokenRef.current

      DeviceEventEmitter.emit(VIDEO_PLAYER_START_EVENT, { messageId })
      const prevId = getPlayingVideoId()
      if (prevId && prevId !== messageId) {
        DeviceEventEmitter.emit(VIDEO_PLAYER_STOP_EVENT, { messageId: prevId })
      }
      stopGlobalVideoPlayer()

      setPlayingVideoId(messageId)
      setPlayingState(true)

      if (playTimerRef.current) clearTimeout(playTimerRef.current)
      playTimerRef.current = setTimeout((): void => {
        playTimerRef.current = null
        if (!isTokenValid(currentToken)) return

        setVideoActiveCallbacks({
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

        DeviceEventEmitter.emit(VIDEO_PLAY_REQUEST_EVENT, {
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
    if (getPlayingVideoId() === messageId) {
      stopGlobalVideoPlayer()
    }
    setPlayingState(false)
    onComplete?.()
  }, [messageId, onComplete, setPlayingState])

  useEffect((): (() => void) => {
    const sub = DeviceEventEmitter.addListener(VIDEO_PLAYER_START_EVENT, (data: { messageId: string }): void => {
      if (data?.messageId === messageId) return
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
      if (getPlayingVideoId() === messageId) {
        stopGlobalVideoPlayer()
      }
    }
  }, [messageId])

  return { isPlaying, play, stop }
}
