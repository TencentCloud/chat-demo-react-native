import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DeviceEventEmitter, Modal, Pressable, StyleSheet, View } from 'react-native'
import { Text } from '../Text'
import Video, { type VideoRef } from 'react-native-video'
import {
  AUDIO_PLAY_REQUEST_EVENT,
  notifyAudioPlayResult,
} from '../MessageList/Message/AudioMessage/useAudioPlayer'
import {
  VIDEO_PLAY_REQUEST_EVENT,
  notifyVideoPlayResult,
} from '../MessageList/Message/VideoMessage/useVideoPlayer'

const HIDDEN_AUDIO_SIZE = 1
const HIDDEN_AUDIO_OPACITY = 0

export const formatMediaPlayError = (
  error: any,
  kind: 'audio' | 'video' = 'audio',
  t: (key: string, opts?: Record<string, string | number>) => string = (k) => k
): string => {
  const errObj: any =
    error && typeof error === 'object' && 'error' in error ? (error as any).error : error

  const errorString: string = `${errObj?.errorString ?? ''}`
  const errorException: string = `${errObj?.errorException ?? ''}`
  const errorStackTrace: string = `${errObj?.errorStackTrace ?? ''}`
  const kindLabel: string = kind === 'video' ? t('media.kindVideo') : t('media.kindAudio')
  if (
    errorString.includes('PARSING_CONTAINER_UNSUPPORTED') ||
    errorString.includes('PARSING_MANIFEST_UNSUPPORTED') ||
    errorStackTrace.includes('UnrecognizedInputFormatException')
  ) {
    return t('media.formatUnsupported', { kind: kindLabel })
  }
  if (
    errorString.includes('IO_NETWORK') ||
    errorString.includes('NETWORK_CONNECTION') ||
    errorStackTrace.includes('UnknownHostException') ||
    errorException.includes('IOException')
  ) {
    return t('media.networkError')
  }
  if (
    errorString.includes('DECODER_') ||
    errorString.includes('DECODING_') ||
    errorStackTrace.includes('DecoderException')
  ) {
    return t('media.decodeFailed', { kind: kindLabel })
  }
  if (
    errorString.includes('IO_NO_CONTENT') ||
    errorString.includes('NOT_FOUND') ||
    errorException.includes('FileNotFoundException') ||
    errorStackTrace.includes('FileNotFoundException')
  ) {
    return t('media.fileMissing')
  }
  return t('media.playFailed')
}

export interface UseMediaPlayerReturn {
  videoPlayer: React.ReactNode
  audioPlayer: React.ReactNode
}

export const useMediaPlayer = (): UseMediaPlayerReturn => {
  const { t } = useTranslation()
  const audioRef = useRef<VideoRef | null>(null)
  const [audioUri, setAudioUri] = useState<string | null>(null)
  const [audioPaused, setAudioPaused] = useState<boolean>(true)
  const [audioResetKey, setAudioResetKey] = useState<number>(0)
  const audioCurrentIdRef = useRef<string | null>(null)
  const videoRef = useRef<VideoRef | null>(null)
  const [videoModalVisible, setVideoModalVisible] = useState<boolean>(false)
  const [videoUri, setVideoUri] = useState<string | null>(null)
  const [videoPaused, setVideoPaused] = useState<boolean>(true)
  const videoCurrentIdRef = useRef<string | null>(null)
  useEffect((): (() => void) => {
    const sub = DeviceEventEmitter.addListener(
      AUDIO_PLAY_REQUEST_EVENT,
      (data: { messageId: string; url: string }): void => {
        const messageId = data?.messageId ?? ''
        const url = data?.url ?? ''
        if (!url) {
          console.warn('[useMediaPlayer] audio:play: url is empty, skip')
          return
        }
        console.log(`[useMediaPlayer] audio:play messageId=${messageId} url=${url}`)
        audioCurrentIdRef.current = messageId
        setAudioResetKey((k: number): number => k + 1)
        setAudioUri(url)
        setAudioPaused(false)
      }
    )
    const stopSub = DeviceEventEmitter.addListener(
      `${AUDIO_PLAY_REQUEST_EVENT}:stop`,
      (data: { messageId: string }): void => {
        console.log(`[useMediaPlayer] audio:play:stop messageId=${data?.messageId}`)
        setAudioPaused(true)
      }
    )
    return (): void => {
      sub.remove()
      stopSub.remove()
    }
  }, [])
  useEffect((): (() => void) => {
    const sub = DeviceEventEmitter.addListener(
      VIDEO_PLAY_REQUEST_EVENT,
      (data: { messageId: string; url: string }): void => {
        const messageId = data?.messageId ?? ''
        const url = data?.url ?? ''
        if (!url) {
          console.warn('[useMediaPlayer] video:play: url is empty, skip')
          return
        }
        console.log(`[useMediaPlayer] video:play messageId=${messageId} url=${url}`)
        videoCurrentIdRef.current = messageId
        setVideoUri(url)
        setVideoPaused(false)
        setVideoModalVisible(true)
      }
    )
    const stopSub = DeviceEventEmitter.addListener(
      `${VIDEO_PLAY_REQUEST_EVENT}:stop`,
      (data: { messageId: string }): void => {
        console.log(`[useMediaPlayer] video:play:stop messageId=${data?.messageId}`)
        setVideoPaused(true)
        setVideoModalVisible(false)
      }
    )
    return (): void => {
      sub.remove()
      stopSub.remove()
    }
  }, [])
  const handleAudioEnd = (): void => {
    const id = audioCurrentIdRef.current
    if (id) {
      console.log(`[useMediaPlayer] audio:onEnd messageId=${id}`)
      notifyAudioPlayResult(id, 'ended')
    }
    setAudioPaused(true)
  }
  const handleAudioError = (e: any): void => {
    const id = audioCurrentIdRef.current
    console.error(`[useMediaPlayer] audio:onError messageId=${id} error=`, e)
    if (id) {
      notifyAudioPlayResult(id, 'error', e)
    }
    setAudioPaused(true)
  }
  const handleVideoEnd = (): void => {
    const id = videoCurrentIdRef.current
    if (id) {
      console.log(`[useMediaPlayer] video:onEnd messageId=${id}`)
      notifyVideoPlayResult(id, 'ended')
    }
    setVideoPaused(true)
    setVideoModalVisible(false)
  }
  const handleVideoError = (e: any): void => {
    const id = videoCurrentIdRef.current
    console.error(`[useMediaPlayer] video:onError messageId=${id} error=`, e)
    if (id) {
      notifyVideoPlayResult(id, 'error', e)
    }
    setVideoPaused(true)
    setVideoModalVisible(false)
  }
  const closeVideoModal = (): void => {
    const id = videoCurrentIdRef.current
    if (id) {
      notifyVideoPlayResult(id, 'stopped')
    }
    setVideoPaused(true)
    setVideoModalVisible(false)
  }
  const audioPlayer = audioUri ? (
    <Video
      key={`audio-${audioResetKey}`}
      ref={audioRef}
      source={{ uri: audioUri }}
      paused={audioPaused}
      repeat={false}
      onEnd={handleAudioEnd}
      onError={handleAudioError}
      style={styles.audioHidden}
    />
  ) : null

  const videoPlayer = (
    <Modal
      visible={videoModalVisible}
      animationType="fade"
      transparent={false}
      onRequestClose={closeVideoModal}
      statusBarTranslucent
    >
      <View style={styles.videoContainer}>
        {videoUri ? (
          <Video
            ref={videoRef}
            source={{ uri: videoUri }}
            paused={videoPaused}
            repeat={false}
            resizeMode="contain"
            onEnd={handleVideoEnd}
            onError={handleVideoError}
            style={StyleSheet.absoluteFill}
          />
        ) : null}
        <Pressable style={styles.videoCloseBtn} onPress={closeVideoModal} hitSlop={20}>
          <Text style={styles.videoCloseText}>{t('common.close')}</Text>
        </Pressable>
      </View>
    </Modal>
  )

  return { audioPlayer, videoPlayer }
}

const styles = StyleSheet.create({
  audioHidden: {
    width: HIDDEN_AUDIO_SIZE,
    height: HIDDEN_AUDIO_SIZE,
    opacity: HIDDEN_AUDIO_OPACITY,
    position: 'absolute',
  },
  videoContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoCloseBtn: {
    position: 'absolute',
    top: 40,
    right: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 16,
  },
  videoCloseText: {
    color: '#FFF',
    fontSize: 14,
  },
})
