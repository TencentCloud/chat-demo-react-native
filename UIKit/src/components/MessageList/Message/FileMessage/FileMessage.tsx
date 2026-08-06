import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Image, Linking, Platform, StyleSheet, View } from 'react-native'
import { Text } from '../../../Text'
import { useTranslation } from 'react-i18next'
import { rpxToPx } from '../../../../utils/rpxToPx'
import { type MessageInfo } from '../MessageTypes'
import { iconAssets } from '../../../../static/iconBase64'
import { showToast } from '../../../../utils/toast'
import { MediaQuality, MessageActionState } from 'tuikit-atomicx-react-native'

const LONG_PRESS_THRESHOLD = 250

const FILE_TYPE_ICONS: Record<string, any> = {
  word: iconAssets['static/icon/file-types/word_icon.png'],
  doc: iconAssets['static/icon/file-types/word_icon.png'],
  docx: iconAssets['static/icon/file-types/word_icon.png'],
  xls: iconAssets['static/icon/file-types/excel_icon.png'],
  xlsx: iconAssets['static/icon/file-types/excel_icon.png'],
  csv: iconAssets['static/icon/file-types/excel_icon.png'],
  ppt: iconAssets['static/icon/file-types/ppt_icon.png'],
  pptx: iconAssets['static/icon/file-types/ppt_icon.png'],
  pdf: iconAssets['static/icon/file-types/pdf_icon.png'],
  txt: iconAssets['static/icon/file-types/txt_icon.png'],
  log: iconAssets['static/icon/file-types/txt_icon.png'],
  json: iconAssets['static/icon/file-types/txt_icon.png'],
  xml: iconAssets['static/icon/file-types/txt_icon.png'],
  md: iconAssets['static/icon/file-types/txt_icon.png'],
  jpg: iconAssets['static/icon/file-types/image_icon.png'],
  jpeg: iconAssets['static/icon/file-types/image_icon.png'],
  png: iconAssets['static/icon/file-types/image_icon.png'],
  gif: iconAssets['static/icon/file-types/image_icon.png'],
  bmp: iconAssets['static/icon/file-types/image_icon.png'],
  webp: iconAssets['static/icon/file-types/image_icon.png'],
  svg: iconAssets['static/icon/file-types/image_icon.png'],
  zip: iconAssets['static/icon/file-types/compress_icon.png'],
  rar: iconAssets['static/icon/file-types/compress_icon.png'],
  '7z': iconAssets['static/icon/file-types/compress_icon.png'],
  tar: iconAssets['static/icon/file-types/compress_icon.png'],
  gz: iconAssets['static/icon/file-types/compress_icon.png'],
  bz2: iconAssets['static/icon/file-types/compress_icon.png'],
}
const UNKNOWN_ICON = iconAssets['static/icon/file-types/unknown_icon.png']
const DOWNLOAD_ICON = iconAssets['static/icon/download.png']

const formatFileSize = (size: number): string => {
  if (!size) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let value = size
  let unitIndex = 0
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024
    unitIndex += 1
  }
  return `${value.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`
}

export interface FileMessageProps {
  message: MessageInfo
  onLongPress?: () => void
}

export const FileMessage: React.FC<FileMessageProps> = ({ message }) => {
  const { t } = useTranslation()
  const isSelf = message.isSelf === true
  const payload = (message.messagePayload ?? {}) as any

  const fileName: string = payload.fileName || t('file.unknown')
  const fileSize: number = payload.fileSize || 0
  const filePath: string = payload.filePath || ''
  const isDownloaded: boolean = !!filePath
  const downloadProgress: number = (message as any).progress ?? 0

  const [isDownloading, setIsDownloading] = useState<boolean>(false)
  const touchStartTimeRef = useRef<number>(0)

  useEffect(() => {
    if (isDownloading && isDownloaded) {
      setIsDownloading(false)
    }
  }, [isDownloaded, isDownloading])

  const fileExtension = useMemo((): string => {
    const parts = fileName.split('.')
    const ext = parts[parts.length - 1]?.toLowerCase() || ''
    return ext
  }, [fileName])

  const fileIcon = FILE_TYPE_ICONS[fileExtension] || UNKNOWN_ICON

  const handleTouchStart = (): void => {
    touchStartTimeRef.current = Date.now()
  }

  const handleTouchEnd = async (): Promise<void> => {
    const startTime = touchStartTimeRef.current
    touchStartTimeRef.current = 0
    if (startTime > 0 && Date.now() - startTime >= LONG_PRESS_THRESHOLD) {
      return
    }

    if (isDownloading) return

    if (isDownloaded) {
      const localPath: string = filePath.startsWith('file://') ? filePath : `file://${filePath}`
      if (Platform.OS === 'ios') {
        try {
          await Linking.openURL(localPath)
        } catch (e: any) {
          console.error(`[FileMessage] Linking.openURL failed: ${e != null ? `${e}` : 'null'}`)
          showToast(t('file.openFailed'))
        }
      } else {
        showToast(`${t('file.androidNoViewer')}\n${filePath}`)
      }
      return
    }

    if (!message?.msgID) {
      showToast(t('file.messageInvalid'))
      return
    }
    setIsDownloading(true)
    try {
      const actionState: any = MessageActionState.getInstance(message as any)
      await actionState.downloadMedia(MediaQuality.ORIGINAL)
    } catch (e: any) {
      console.error(`[FileMessage] downloadMedia failed: ${e != null ? `${e}` : 'null'}`)
      showToast(t('file.downloadFailed'))
      setIsDownloading(false)
    }
  }

  return (
    <View
      style={[
        styles.container,
        isSelf ? styles.containerOut : styles.containerIn,
      ]}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <View style={styles.highlight}>
        <Image source={fileIcon} style={styles.fileIcon} resizeMode="contain" />
        <View style={styles.info}>
          <View style={styles.nameWrap}>
            <Text style={styles.name} numberOfLines={2}>
              {fileName}
            </Text>
          </View>
          <View style={styles.footer}>
            <Text style={styles.size}>{formatFileSize(fileSize)}</Text>
            {!isDownloaded && (
              <View style={styles.downloadWrap}>
                {(downloadProgress > 0 && downloadProgress < 100) || isDownloading ? (
                  <Text style={styles.downloadPercent}>
                    {isDownloading ? `${downloadProgress}` : `${downloadProgress}`}
                    %
                  </Text>
                ) : (
                  <Image source={DOWNLOAD_ICON} style={styles.downloadIcon} resizeMode="cover" />
                )}
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    minWidth: rpxToPx(300),
    maxWidth: rpxToPx(500),
    backgroundColor: '#FFFFFF',
    borderWidth: rpxToPx(2),
    borderColor: '#E6E9F0',
  },
  containerIn: {
    borderTopLeftRadius: rpxToPx(4),
    borderTopRightRadius: rpxToPx(20),
    borderBottomLeftRadius: rpxToPx(20),
    borderBottomRightRadius: rpxToPx(20),
  },
  containerOut: {
    borderTopLeftRadius: rpxToPx(20),
    borderTopRightRadius: rpxToPx(4),
    borderBottomLeftRadius: rpxToPx(20),
    borderBottomRightRadius: rpxToPx(20),
  },
  highlight: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: rpxToPx(24),
    backgroundColor: 'transparent',
  },
  fileIcon: {
    marginRight: rpxToPx(20),
    width: rpxToPx(64),
    height: rpxToPx(64),
  },
  info: {
    flex: 1,
  },
  nameWrap: {
    flex: 1,
    marginBottom: rpxToPx(4),
  },
  name: {
    fontSize: rpxToPx(32),
    lineHeight: rpxToPx(42),
    color: 'rgba(0, 0, 0, 0.9)',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  size: {
    fontSize: rpxToPx(28),
    lineHeight: rpxToPx(39),
    color: 'rgba(0, 0, 0, 0.4)',
  },
  downloadWrap: {
    justifyContent: 'flex-end',
  },
  downloadIcon: {
    width: rpxToPx(28),
    height: rpxToPx(28),
  },
  downloadPercent: {
    fontSize: rpxToPx(24),
    lineHeight: rpxToPx(28),
    color: 'rgba(0, 0, 0, 0.55)',
    fontWeight: '500',
  },
})
