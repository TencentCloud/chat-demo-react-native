import React, { useEffect, useRef, useState } from 'react'
import { DeviceEventEmitter, Image, StyleSheet, View } from 'react-native'
import { Text } from '../../../Text'
import { MediaQuality } from 'tuikit-atomicx-react-native'
import { rpxToPx } from '../../../../utils/rpxToPx'
import { type MessageInfo } from '../MessageTypes'
import { formatMediaPlayError } from '../../../MediaPlayer/useMediaPlayer'
import { iconAssets } from '../../../../static/iconBase64'
import { useVideoPlayer,
  VIDEO_PLAYER_START_EVENT } from './useVideoPlayer'
import { useTranslation } from 'react-i18next'
import { showToast } from '../../../../utils/toast'

const MAX_WIDTH = 400
const MAX_HEIGHT = 300
const MIN_WIDTH = 200
const MIN_HEIGHT = 150

const computeContainerSize = (rawW: number, rawH: number): { width: number; height: number } => {
  let w = rawW || 400
  let h = rawH || 400
  if (w === 200 && h === 200) {
    return { width: MIN_WIDTH, height: MIN_HEIGHT }
  }
  if (w > MAX_WIDTH) {
    h = (h * MAX_WIDTH) / w
    w = MAX_WIDTH
  }
  if (h > MAX_HEIGHT) {
    w = (w * MAX_HEIGHT) / h
    h = MAX_HEIGHT
  }
  if (w < MIN_WIDTH) {
    h = (h * MIN_WIDTH) / w
    w = MIN_WIDTH
  }
  if (h < MIN_HEIGHT) {
    w = (w * MIN_HEIGHT) / h
    h = MIN_HEIGHT
  }
  return { width: w, height: h }
}

const normalizeFileUrl = (url: string): string => {
  if (url && url.startsWith('/') && !url.startsWith('file://')) {
    return `file://${url}`
  }
  return url
}

const PLACEHOLDER_PREFIX = 'placeholder_video_'
const PLAY_ICON = iconAssets['static/icon/play.png']

export interface VideoMessageProps {
  message: MessageInfo
  onPlayVideo?: (videoPath: string, msgID: string) => void
  onLongPress?: () => void
}

export const VideoMessage: React.FC<VideoMessageProps> = ({ message }) => {
  const { t } = useTranslation()
  const [actualSize, setActualSize] = useState({ width: 0, height: 0 })
  const [coverError, setCoverError] = useState(false)
  const [isDownloadingSnapshot, setIsDownloadingSnapshot] = useState(false)
  const [isDownloadingVideo, setIsDownloadingVideo] = useState(false)

  const payload = (message.messagePayload ?? {}) as any
  const videoSnapshotUrl = videoSnapshotUrlCompute(payload)
  const videoUrl = videoUrlCompute(payload)
  const videoSnapshotWidth = payload.videoSnapshotWidth || 0
  const videoSnapshotHeight = payload.videoSnapshotHeight || 0
  const downloadProgress: number = (message as any).progress ?? 0

  const w = actualSize.width || videoSnapshotWidth || 400
  const h = actualSize.height || videoSnapshotHeight || 400
  const size = computeContainerSize(w, h)

  const getRemoteVideoUrl = (): string => {
    try {
      const rawMsg: any = (message as any)?.rawMessage
      const elements: any[] = rawMsg?.message?.messageBaseElements
      if (Array.isArray(elements) && elements.length > 0) {
        return elements[0]?.videoDownloadUrl || ''
      }
    } catch {
    }
    return ''
  }

  const hasTriedRemoteFallbackRef = useRef(false)

  const messageActionStateRef = useRef<any>(null)

  const getMessageActionState = (): any => {
    if (messageActionStateRef.current == null) {
      const { MessageActionState } = require('tuikit-atomicx-react-native') as any
      messageActionStateRef.current = MessageActionState.getInstance(message as any)
    }
    return messageActionStateRef.current
  }

  const { isPlaying, play, stop } = useVideoPlayer({
    messageId: message.msgID,
    onComplete: (): void => {
      hasTriedRemoteFallbackRef.current = false
    },
    onError: (error: any): void => {
      if (!hasTriedRemoteFallbackRef.current) {
        const remoteUrl = getRemoteVideoUrl()
        if (remoteUrl) {
          hasTriedRemoteFallbackRef.current = true
          play(remoteUrl)
          return
        }
      }
      hasTriedRemoteFallbackRef.current = false
      const tip: string = formatMediaPlayError(error, 'video', t as any)
      showToast(tip)
    },
  })

  const handleSizeLoad = (e: any): void => { if (e?.nativeEvent?.source) {
      setActualSize({
        width: e.nativeEvent.source.width ?? 0,
        height: e.nativeEvent.source.height ?? 0 })
    }
  }

  const handleCoverError = (): void => {
    setCoverError(true)
  }

  const handlePlayTap = (): void => {
    if (isPlaying) {
      stop()
      return
    }
    const url = videoUrl
    if (url) {
      hasTriedRemoteFallbackRef.current = false
      play(url)
      return
    }
    if (!url && !isDownloadingVideo) {
      void checkAndDownloadVideo()
    }
  }

  const touchStartTimeRef = useRef(0)
  const touchStartXRef = useRef(0)
  const touchStartYRef = useRef(0)
  const handleTouchStart = (e: any): void => {
    touchStartTimeRef.current = Date.now()
    touchStartXRef.current = e.nativeEvent.pageX
    touchStartYRef.current = e.nativeEvent.pageY
  }
  const handleTouchEnd = (e: any): void => {
    const duration: number = Date.now() - touchStartTimeRef.current
    const dx: number = Math.abs(e.nativeEvent.pageX - touchStartXRef.current)
    const dy: number = Math.abs(e.nativeEvent.pageY - touchStartYRef.current)
    if (duration < 250 && dx < 10 && dy < 10) {
      handlePlayTap()
    }
  }

  const checkAndDownloadSnapshot = async (): Promise<void> => {
    if (
      message?.msgID &&
      !videoSnapshotUrl &&
      !isDownloadingSnapshot
    ) {
      setIsDownloadingSnapshot(true)
      try {
        await new Promise<void>((resolve): void => {
          setTimeout(resolve, 0)
        })
        const actionState = getMessageActionState()
        await actionState.downloadMedia(MediaQuality.THUMBNAIL)
      } catch (e) {
        console.error(`[VideoMessage] downloadMedia snapshot failed: ${e != null ? `${e}` : 'null'}`)
        setCoverError(true)
      } finally {
        setIsDownloadingSnapshot(false)
      }
    }
  }

  const checkAndDownloadVideo = async (): Promise<void> => {
    if (!message?.msgID) {
      showToast(t('message.videoUrlInvalid'))
      return
    }
    if (isDownloadingVideo) {
      showToast(t('message.videoLoading'))
      return
    }
    setIsDownloadingVideo(true)
    try {
      await new Promise<void>((resolve): void => {
        setTimeout(resolve, 0)
      })
      const actionState = getMessageActionState()
      await actionState.downloadMedia(MediaQuality.ORIGINAL)
    } catch (e) {
    } finally {
      setIsDownloadingVideo(false)
    }
  }

  useEffect((): (() => void) | void => {
    const msgID = message?.msgID
    if (!msgID || msgID.startsWith(PLACEHOLDER_PREFIX)) return undefined
    const timer = setTimeout((): void => {
      if (!videoSnapshotUrl) {
        void checkAndDownloadSnapshot()
      }
      if (msgID && !videoUrl) {
        void checkAndDownloadVideo()
      }
    }, 0)
    return (): void => clearTimeout(timer)
  }, [message?.msgID])

  useEffect((): (() => void) => {
    if (videoSnapshotUrl && coverError) {
      setCoverError(false)
    }
    const sub = DeviceEventEmitter.addListener(
      VIDEO_PLAYER_START_EVENT,
      (data: { messageId: string }): void => {
        if (data?.messageId && data.messageId !== message.msgID && isPlaying) {
          stop()
        }
      }
    )
    return (): void => sub.remove()
  }, [videoSnapshotUrl, coverError, isPlaying])

  return (
    <View
      style={[
        styles.container,
        { width: rpxToPx(size.width), height: rpxToPx(size.height) },
      ]}
    >
      <Image
        source={videoSnapshotUrl ? { uri: videoSnapshotUrl } : undefined}
        style={styles.cover}
        resizeMode="cover"
        onLoad={handleSizeLoad}
        onError={handleCoverError}
        onLoadEnd={(): void => undefined}
      />
      <View
        style={styles.playButton}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {isDownloadingVideo ? (
          <Text style={styles.downloadPercent}>{downloadProgress}%</Text>
        ) : (
          <Image source={PLAY_ICON} style={styles.playIcon} resizeMode="cover" />
        )}
      </View>
      {downloadProgress > 0 && downloadProgress < 100 && (
        <View style={styles.progressBar}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${downloadProgress}%` }]} />
          </View>
        </View>
      )}
    </View>
  )
}

const videoSnapshotUrlCompute = (payload: any): string => {
  const url: string = payload?.videoSnapshotPath || ''
  return normalizeFileUrl(url)
}

const videoUrlCompute = (payload: any): string => {
  const url: string = payload?.videoPath || ''
  return normalizeFileUrl(url)
}

const styles = StyleSheet.create({ container: {
    position: 'relative',
    borderRadius: rpxToPx(12),
    overflow: 'hidden' },
  cover: { width: '100%',
    height: '100%',
    borderRadius: rpxToPx(20) },
  playButton: { position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: rpxToPx(20) },
  playIcon: { width: rpxToPx(80),
    height: rpxToPx(80) },
  downloadPercent: { fontSize: rpxToPx(32),
    color: '#FFFFFF',
    fontWeight: '600' },
  progressBar: { position: 'absolute',
    left: rpxToPx(20),
    right: rpxToPx(20),
    bottom: rpxToPx(20) },
  progressTrack: { height: rpxToPx(6),
    borderRadius: rpxToPx(3),
    backgroundColor: 'rgba(255, 255, 255, 0.3)' },
  progressFill: { height: rpxToPx(6),
    borderRadius: rpxToPx(3),
    backgroundColor: '#FFFFFF' },
})
