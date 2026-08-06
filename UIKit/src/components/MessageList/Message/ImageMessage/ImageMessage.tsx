import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Image, StyleSheet, View } from 'react-native'
import { Text } from '../../../Text'
import { useTranslation } from 'react-i18next'
import { MediaQuality } from 'tuikit-atomicx-react-native'
import { rpxToPx } from '../../../../utils/rpxToPx'
import { type MessageInfo } from '../MessageTypes'
import { ImagePreview } from './ImagePreview'

const MAX_WIDTH = 400
const MAX_HEIGHT = 600
const MIN_WIDTH = 120
const MIN_HEIGHT = 120

const computeContainerSize = (rawW: number, rawH: number): { width: number; height: number } => {
  let w = rawW || 200
  let h = rawH || 200
  if (w === 200 && h === 200) {
    return { width: MIN_WIDTH, height: MIN_WIDTH }
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

export interface ImageMessageProps {
  message: MessageInfo
  onImageClick?: (imagePath: string, msgID: string) => void
  onLongPress?: () => void
}

export const ImageMessage: React.FC<ImageMessageProps> = ({ message }) => {
  const { t } = useTranslation()
  const [loadingState, setLoadingState] = useState<'loading' | 'loaded' | 'error'>('loading')
  const [actualSize, setActualSize] = useState({ width: 0, height: 0 })
  const [previewVisible, setPreviewVisible] = useState(false)

  const payload = (message.messagePayload ?? {}) as any
  const imageUrl = useMemo((): string => {
    const url: string =
      payload.originalImagePath || payload.largeImagePath || payload.thumbImagePath || ''
    return normalizeFileUrl(url)
  }, [payload])

  const imageWidth = payload.originalImageWidth || 0
  const imageHeight = payload.originalImageHeight || 0

  const size = useMemo((): { width: number; height: number } => {
    const w = actualSize.width || imageWidth
    const h = actualSize.height || imageHeight
    return computeContainerSize(w, h)
  }, [actualSize, imageWidth, imageHeight])

  const previewUrls = useMemo((): string[] => {
    const original: string = payload.originalImageURL || ''
    const list: string[] = []
    if (original) list.push(original)
    if (imageUrl && imageUrl !== original) list.push(imageUrl)
    return list
  }, [payload, imageUrl])

  useEffect(() => {
    if (imageUrl && loadingState === 'error') {
      setLoadingState('loading')
    }
  }, [imageUrl, loadingState])

  const actionStateRef = useRef<any>(null)

  const hasTriedDownloadRef = useRef(false)
  useEffect((): (() => void) | void => {
    if (message?.msgID && !imageUrl && !hasTriedDownloadRef.current) {
      hasTriedDownloadRef.current = true
      const timer = setTimeout((): void => {
        if (actionStateRef.current == null) {
          const { MessageActionState } = require('tuikit-atomicx-react-native') as any
          actionStateRef.current = MessageActionState.getInstance(message as any)
        }
        actionStateRef.current
          .downloadMedia(MediaQuality.ORIGINAL)
          .catch((e: any | null): void => {
            console.error(`[ImageMessage] downloadMedia failed: ${e != null ? `${e}` : 'null'}`)
            setLoadingState('error')
          })
      }, 0)
      return (): void => clearTimeout(timer)
    }
    return undefined
  }, [message?.msgID, imageUrl])

  const handleImageLoad = (e: any): void => {
    setLoadingState('loaded')
    if (e?.nativeEvent?.source) {
      setActualSize({
        width: e.nativeEvent.source.width ?? 0,
        height: e.nativeEvent.source.height ?? 0,
      })
    }
  }

  const handleImageError = (): void => {
    setLoadingState('error')
  }

  const handleImageTap = (): void => {
    if (loadingState === 'loaded') {
      setPreviewVisible(true)
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
      handleImageTap()
    }
  }

  const handlePreviewClose = (): void => {
    setPreviewVisible(false)
  }

  return (
    <>
      <View
        style={[
          styles.container,
          { width: rpxToPx(size.width), height: rpxToPx(size.height) },
        ]}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <Image
          source={imageUrl ? { uri: imageUrl } : undefined}
          style={[
            styles.image,
            { opacity: loadingState === 'loaded' ? 1 : 0 },
          ]}
          resizeMode="cover"
          onLoad={handleImageLoad}
          onError={handleImageError}
          onLoadEnd={(): void => {
            if (loadingState === 'loading') {
            }
          }}
        />
        {loadingState === 'loading' && (
          <View style={styles.loading}>
            <Text style={styles.loadingText}>{t('common.loading')}</Text>
          </View>
        )}
        {loadingState === 'error' && (
          <View style={styles.error}>
            <Text style={styles.errorText}>{t('message.imageLoadFailed')}</Text>
          </View>
        )}
      </View>

      <ImagePreview
        visible={previewVisible}
        urls={previewUrls}
        currentIndex={0}
        onClose={handlePreviewClose}
      />
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    borderRadius: rpxToPx(20),
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: rpxToPx(20),
  },
  loading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    fontSize: rpxToPx(24),
    color: '#999999',
  },
  error: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
  },
  errorText: {
    fontSize: rpxToPx(24),
    color: '#CCCCCC',
    marginTop: rpxToPx(10),
  },
})
