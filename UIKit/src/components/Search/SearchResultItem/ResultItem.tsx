import React, { ComponentType, useMemo } from 'react'
import { Image, ImageSourcePropType, StyleSheet, View } from 'react-native'
import { Text } from '../../Text'
import { useTranslation } from 'react-i18next'
import { rpxToPx } from '../utils/rpxToPx'

import { Avatar as DefaultAvatar } from '../../Avatar/Avatar'
import { iconAssets } from '../../../static/iconBase64'

export interface ResultItemMediaInfo {
  duration?: number
  fileName?: string
  fileSize?: number
  faceIndex?: number
  faceName?: string
}

export interface ResultItemProps {
  avatarURL?: string
  title?: string
  titleSuffix?: string
  subtitle?: string
  keyword?: string
  Avatar?: ComponentType<any>
  mediaType?: 'image' | 'video' | 'file' | 'sound' | 'face' | ''
  mediaSrc?: string
  mediaInfo?: ResultItemMediaInfo
  defaultAvatarType?: string
  RightContent?: ComponentType<any>
}

interface TextSegment {
  type: 'text'
  text: string
  highlight?: boolean
}

const FACE_MAP: Record<number, string> = {
  0: '/static/emoji/smile.png',
  1: '/static/emoji/laugh.png',
  2: '/static/emoji/cry.png',
  3: '/static/emoji/angry.png',
  4: '/static/emoji/surprise.png',
  5: '/static/emoji/love.png',
  6: '/static/emoji/sad.png',
  7: '/static/emoji/cool.png',
  8: '/static/emoji/wink.png',
  9: '/static/emoji/kiss.png',
}

const FACE_NAME_MAP: Record<string, string> = {
  smile: '/static/emoji/smile.png',
  laugh: '/static/emoji/laugh.png',
  cry: '/static/emoji/cry.png',
  angry: '/static/emoji/angry.png',
  surprise: '/static/emoji/surprise.png',
  love: '/static/emoji/love.png',
  sad: '/static/emoji/sad.png',
  cool: '/static/emoji/cool.png',
  wink: '/static/emoji/wink.png',
  kiss: '/static/emoji/kiss.png',
}

const ICON_PLAY: ImageSourcePropType = iconAssets['static/icon/play.png']
const ICON_AUDIO: ImageSourcePropType = iconAssets['static/icon/audio.png']

function splitByKeyword(text: string, keyword: string): TextSegment[] {
  if (!text) return []
  if (!keyword) return [{ type: 'text', text, highlight: false }]
  const lowerText = text.toLowerCase()
  const lowerKeyword = keyword.toLowerCase()
  const segments: TextSegment[] = []
  let lastIndex = 0
  let index = lowerText.indexOf(lowerKeyword)
  while (index !== -1) {
    if (index > lastIndex) {
      segments.push({ type: 'text', text: text.slice(lastIndex, index), highlight: false })
    }
    segments.push({ type: 'text', text: text.slice(index, index + keyword.length), highlight: true })
    lastIndex = index + keyword.length
    index = lowerText.indexOf(lowerKeyword, lastIndex)
  }
  if (lastIndex < text.length) {
    segments.push({ type: 'text', text: text.slice(lastIndex), highlight: false })
  }
  return segments.length > 0 ? segments : [{ type: 'text', text, highlight: false }]
}

const MAX_SUBTITLE_LENGTH = 30

export const ResultItem: React.FC<ResultItemProps> = ({
  avatarURL = '',
  title = '',
  titleSuffix = '',
  subtitle = '',
  keyword = '',
  Avatar = DefaultAvatar,
  mediaType = '',
  mediaSrc = '',
  mediaInfo = {},
  defaultAvatarType = 'none',
  RightContent,
}) => {
  const { t } = useTranslation()
  const formatSoundDuration = (duration?: number): string => {
    if (!duration) return "0''"
    return `${Math.floor(duration)}''`
  }

  const formatFileSize = (size?: number): string => {
    if (!size) return '0 B'
    const units = ['B', 'KB', 'MB', 'GB', 'TB']
    let value = size
    let idx = 0
    while (value >= 1024 && idx < units.length - 1) {
      value /= 1024
      idx++
    }
    return `${value.toFixed(idx === 0 ? 0 : 1)} ${units[idx]}`
  }

  const fileIconText = useMemo(() => {
    const fileName = mediaInfo?.fileName || ''
    const ext = fileName.split('.').pop()?.toLowerCase()
    if (!ext || ext === 'unknown') return 'F'
    return ext.charAt(0).toUpperCase()
  }, [mediaInfo?.fileName])

  const faceImageUrl = useMemo(() => {
    const index = mediaInfo?.faceIndex || 0
    const name = mediaInfo?.faceName || ''
    if (name && FACE_NAME_MAP[name]) return FACE_NAME_MAP[name]
    return FACE_MAP[index] || FACE_MAP[0]
  }, [mediaInfo?.faceIndex, mediaInfo?.faceName])

  const titleSegments = useMemo(() => splitByKeyword(title, keyword), [title, keyword])
  const titleSuffixSegments = useMemo(() => splitByKeyword(titleSuffix, keyword), [titleSuffix, keyword])

  const subtitleSegments = useMemo<TextSegment[]>(() => {
    if (!subtitle) return []
    return splitByKeyword(subtitle.length > MAX_SUBTITLE_LENGTH ? subtitle.slice(0, MAX_SUBTITLE_LENGTH) : subtitle, keyword)
  }, [subtitle, keyword])

  return (
    <View style={styles.container}>
      <Avatar src={avatarURL} name={title} size={72} defaultAvatarType={defaultAvatarType as any} />
      <View style={styles.info}>
        <View style={styles.titleRow}>
          {titleSegments.map((seg, i) => (
            <Text key={`t-${i}`} style={seg.highlight ? styles.titleHighlight : styles.title} numberOfLines={1}>
              {seg.text}
            </Text>
          ))}
          {titleSuffixSegments.map((seg, i) => (
            <Text
              key={`s-${i}`}
              style={[
                seg.highlight ? styles.titleSuffixHighlight : styles.titleSuffix,
                i === 0 ? styles.titleSuffixFirst : null,
              ]}
              numberOfLines={1}
            >
              {seg.text}
            </Text>
          ))}
        </View>
        {subtitle || mediaType ? (
          <View style={styles.subtitleRow}>
            {mediaType === 'image' && mediaSrc ? (
              <Image source={{ uri: mediaSrc }} style={styles.imageThumb} resizeMode="cover" />
            ) : mediaType === 'video' && mediaSrc ? (
              <View style={styles.videoThumb}>
                <Image source={{ uri: mediaSrc }} style={styles.videoCover} resizeMode="cover" />
                <View style={styles.videoPlay}>
                  <Image source={ICON_PLAY} style={styles.videoPlayIcon} resizeMode="cover" />
                </View>
              </View>
            ) : mediaType === 'sound' ? (
              <View style={styles.audio}>
                <Image source={ICON_AUDIO} style={[styles.audioIcon, { transform: [{ rotate: '180deg' }] }]} resizeMode="cover" />
                <Text style={styles.audioDuration}>{formatSoundDuration(mediaInfo?.duration)}</Text>
              </View>
            ) : mediaType === 'file' ? (
              <View style={styles.file}>
                <View style={styles.fileIcon}>
                  <Text style={styles.fileIconText}>{fileIconText}</Text>
                </View>
                <View style={styles.fileInfo}>
                  <Text style={styles.fileName} numberOfLines={1}>
                    {mediaInfo?.fileName || t('searchPlaceholder.unknownFile')}
                  </Text>
                  <Text style={styles.fileSize}>{formatFileSize(mediaInfo?.fileSize)}</Text>
                </View>
              </View>
            ) : mediaType === 'face' ? (
              <Image source={{ uri: faceImageUrl }} style={styles.face} resizeMode="contain" />
            ) : null}
            {subtitleSegments.map((seg, i) => (
              <Text key={`sub-${i}`} style={seg.highlight ? styles.subtitleHighlight : styles.subtitle} numberOfLines={1}>
                {seg.text}
              </Text>
            ))}
          </View>
        ) : null}
      </View>
      {RightContent ? (
        <View style={styles.right}>
          <RightContent />
        </View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    marginLeft: rpxToPx(16),
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: rpxToPx(32),
    lineHeight: rpxToPx(45),
    fontWeight: '400',
    color: 'rgba(0, 0, 0, 0.9)',
  },
  titleHighlight: {
    fontSize: rpxToPx(32),
    lineHeight: rpxToPx(45),
    fontWeight: '400',
    color: '#007AFF',
  },
  titleSuffix: {
    fontSize: rpxToPx(32),
    lineHeight: rpxToPx(44),
    fontWeight: '400',
    color: 'rgba(0, 0, 0, 0.9)',
  },
  titleSuffixHighlight: {
    fontSize: rpxToPx(32),
    lineHeight: rpxToPx(44),
    fontWeight: '400',
    color: '#007AFF',
  },
  titleSuffixFirst: {
    marginLeft: rpxToPx(8),
  },
  right: {
    marginLeft: rpxToPx(16),
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: rpxToPx(8),
    overflow: 'hidden',
  },
  subtitle: {
    fontSize: rpxToPx(28),
    lineHeight: rpxToPx(40),
    fontWeight: '400',
    color: 'rgba(0, 0, 0, 0.4)',
  },
  subtitleHighlight: {
    fontSize: rpxToPx(28),
    lineHeight: rpxToPx(40),
    fontWeight: '400',
    color: '#007AFF',
  },
  emoji: {
    width: rpxToPx(28),
    height: rpxToPx(28),
    marginHorizontal: rpxToPx(4),
  },
  imageThumb: {
    width: rpxToPx(80),
    height: rpxToPx(80),
    borderRadius: rpxToPx(8),
  },
  videoThumb: {
    position: 'relative',
    width: rpxToPx(80),
    height: rpxToPx(80),
  },
  videoCover: {
    width: rpxToPx(80),
    height: rpxToPx(80),
    borderRadius: rpxToPx(8),
  },
  videoPlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: rpxToPx(8),
  },
  videoPlayIcon: {
    width: rpxToPx(32),
    height: rpxToPx(32),
  },
  audio: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: rpxToPx(12),
    paddingHorizontal: rpxToPx(20),
    backgroundColor: '#F0F2F7',
    borderRadius: rpxToPx(12),
  },
  audioIcon: {
    width: rpxToPx(32),
    height: rpxToPx(32),
  },
  audioDuration: {
    marginLeft: rpxToPx(8),
    fontSize: rpxToPx(24),
    lineHeight: rpxToPx(34),
    fontWeight: '500',
    color: 'rgba(0, 0, 0, 0.9)',
  },
  file: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: rpxToPx(12),
    paddingHorizontal: rpxToPx(16),
    backgroundColor: '#FFFFFF',
    borderRadius: rpxToPx(12),
    borderWidth: rpxToPx(1),
    borderColor: '#E6E9F0',
    maxWidth: rpxToPx(400),
  },
  fileIcon: {
    width: rpxToPx(48),
    height: rpxToPx(48),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E54545',
    borderRadius: rpxToPx(8),
    marginRight: rpxToPx(12),
  },
  fileIconText: {
    fontSize: rpxToPx(24),
    color: '#FFFFFF',
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: rpxToPx(26),
    lineHeight: rpxToPx(36),
    fontWeight: '400',
    color: 'rgba(0, 0, 0, 0.9)',
  },
  fileSize: {
    fontSize: rpxToPx(22),
    lineHeight: rpxToPx(30),
    fontWeight: '400',
    color: 'rgba(0, 0, 0, 0.4)',
  },
  face: {
    width: rpxToPx(64),
    height: rpxToPx(64),
    borderRadius: rpxToPx(8),
  },
})

export default ResultItem
