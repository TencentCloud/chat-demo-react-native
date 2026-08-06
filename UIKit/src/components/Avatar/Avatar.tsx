import React, { useEffect, useMemo, useState } from 'react'
import { Image, type ImageSourcePropType, StyleSheet, TouchableOpacity, View } from 'react-native'
import { Text } from '../Text'
import { rpxToPx } from '../../utils/rpxToPx'

export interface AvatarProps {
  
  src?: string | number | ImageSourcePropType
  name?: string
  size?: number
  showOnline?: boolean
  badgeCount?: number
  showBadgeDot?: boolean
  shape?: 'circle' | 'square'
  defaultAvatarType?: 'none' | 'user' | 'work' | 'public' | 'meeting' | 'avchatroom'
  pureMode?: boolean
  lazy?: boolean
  onClick?: () => void
}


const DEFAULT_AVATAR_URLS: Record<string, string> = {
  user: 'https://web.sdk.qcloud.com/im/assets/all-in-one/user.png',
  work: 'https://web.sdk.qcloud.com/im/assets/all-in-one/work.png',
  public: 'https://web.sdk.qcloud.com/im/assets/all-in-one/public.png',
  meeting: 'https://web.sdk.qcloud.com/im/assets/all-in-one/meeting.png',
  avchatroom: 'https://web.sdk.qcloud.com/im/assets/all-in-one/avchatroom.png',
}


const getFirstChar = (name: string): string => {
  if (!name) return '?'
  const match = name.match(/[\u4e00-\u9fa5]|[a-zA-Z]|[0-9]/)
  return match ? match[0].toUpperCase() : '?'
}


const getDefaultBgColor = (name: string): string => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name = '',
  size = 96,
  showOnline = false,
  badgeCount = 0,
  showBadgeDot = false,
  shape = 'square',
  defaultAvatarType = 'none',
  pureMode = false,
  lazy = false,
  onClick,
}) => {
  
  const [avatarSrc, setAvatarSrc] = useState<string | number | ImageSourcePropType | undefined>(
    lazy ? undefined : src
  )

  useEffect(() => {
    if (lazy && src) {
      const timer = setTimeout(() => {
        setAvatarSrc(src)
      }, 0)
      return (): void => clearTimeout(timer)
    }
  }, [lazy, src])

  useEffect(() => {
    setAvatarSrc(lazy ? undefined : src)
  }, [src, lazy])

  const defaultAvatarUrl = useMemo((): string => {
    return DEFAULT_AVATAR_URLS[defaultAvatarType] || ''
  }, [defaultAvatarType])

  const firstChar = useMemo((): string => getFirstChar(name), [name])

  const sizePx = rpxToPx(size)
  const textSizePx = Math.floor(sizePx * 0.4)
  const onlineSizePx = rpxToPx(20)
  const badgeSizePx = rpxToPx(36)
  const badgeDotSizePx = rpxToPx(20)
  const borderWidthPx = 2 
  const containerPaddingPx = rpxToPx(10)
  const avatarRadiusPx = shape === 'circle' ? sizePx / 2 : rpxToPx(10)

  const avatarStyle = {
    width: sizePx,
    height: sizePx,
    borderRadius: avatarRadiusPx,
  }

  const textStyle = {
    fontSize: textSizePx,
    color: 'rgba(0, 0, 0, 0.9)',
  }

  
  
  const hasImageSrc = (): boolean => {
    if (avatarSrc == null) return false
    if (typeof avatarSrc === 'string') return avatarSrc.length > 0
    if (typeof avatarSrc === 'number') return true
    
    if (typeof avatarSrc === 'object' && 'uri' in avatarSrc) {
      const uri = (avatarSrc as { uri: unknown }).uri
      return typeof uri === 'string' ? uri.length > 0 : false
    }
    return false
  }
  const showImage = hasImageSrc() || (defaultAvatarUrl != null && defaultAvatarUrl.length > 0)
  const showBadge = badgeCount > 0

  const handleImageError = (): void => {
    setAvatarSrc(undefined)
  }



  const isClickable = onClick != null
  const containerStyle = [
    styles.container,
    { padding: pureMode ? 0 : containerPaddingPx },
  ]
  const avatarBody = (
    <>
      {showImage ? (
        <Image
          source={
            typeof avatarSrc === 'string' || avatarSrc == null
              ? { uri: (typeof avatarSrc === 'string' ? avatarSrc : '') || defaultAvatarUrl }
              : avatarSrc
          }
          style={[styles.image, avatarStyle]}
          resizeMode="cover"
          onError={handleImageError}
        />
      ) : (
        <View
          style={[
            styles.defaultAvatar,
            avatarStyle,
            { backgroundColor: name ? getDefaultBgColor(name) : '#EBF3FF' },
          ]}
        >
          <Text style={[styles.avatarText, textStyle]} numberOfLines={1}>
            {firstChar}
          </Text>
        </View>
      )}

      {showOnline && (
        <View
          style={[
            styles.onlineIndicator,
            {
              width: onlineSizePx,
              height: onlineSizePx,
              borderRadius: onlineSizePx / 2,
              right: pureMode ? 0 : containerPaddingPx / 2,
              bottom: pureMode ? 0 : containerPaddingPx / 2,
            },
          ]}
        />
      )}

      {showBadge && (
        <View
          style={[
            styles.badge,
            showBadgeDot && {
              width: badgeDotSizePx,
              height: badgeDotSizePx,
              borderRadius: badgeDotSizePx / 2,
              paddingHorizontal: 0,
            },
            {
              right: 0,
              top: 0,
              height: showBadgeDot ? badgeDotSizePx : badgeSizePx,
              minWidth: showBadgeDot ? badgeDotSizePx : badgeSizePx,
              paddingHorizontal: showBadgeDot ? 0 : rpxToPx(8),
              borderRadius: showBadgeDot ? badgeDotSizePx / 2 : rpxToPx(36),
            },
          ]}
        >
          {!showBadgeDot && (
            <Text style={[styles.badgeText, { fontSize: rpxToPx(24), lineHeight: rpxToPx(24) }]} numberOfLines={1}>
              {badgeCount > 99 ? '99+' : String(badgeCount)}
            </Text>
          )}
        </View>
      )}
    </>
  )

  return isClickable ? (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onClick}
      style={containerStyle}
    >
      {avatarBody}
    </TouchableOpacity>
  ) : (
    <View style={containerStyle}>
      {avatarBody}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  image: {
    backgroundColor: '#F5F5F5',
  },
  defaultAvatar: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontWeight: '500',
    textAlign: 'center',
  },
  onlineIndicator: {
    position: 'absolute',
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  badge: {
    position: 'absolute',
    backgroundColor: '#FF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    
    fontWeight: '500',
    textAlign: 'center',
    color: '#FFFFFF',
  },
})
