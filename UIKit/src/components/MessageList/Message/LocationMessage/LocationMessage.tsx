import React, { useMemo } from 'react'
import { Image, StyleSheet, View } from 'react-native'
import { Text } from '../../../Text'
import { useTranslation } from 'react-i18next'
import { rpxToPx } from '../../../../utils/rpxToPx'
import { type MessageInfo } from '../MessageTypes'

const DEFAULT_MAP = 'https://picsum.photos/seed/location/400/240'

export interface LocationMessageProps {
  message: MessageInfo
  onLocationClick?: (lat: number, lng: number, desc?: string) => void
  onLongPress?: () => void
}

export const LocationMessage: React.FC<LocationMessageProps> = ({ message, onLocationClick }) => {
  const { t } = useTranslation()
  const isSelf = message.isSelf === true
  const payload = (message.messagePayload ?? {}) as any

  const title: string = useMemo((): string => {
    return payload.title || payload.name || t('location.locationInfo')
  }, [payload, t])

  const description: string = useMemo((): string => {
    return payload.description || payload.address || ''
  }, [payload])

  const mapImageUrl: string = useMemo((): string => {
    const lat: number = payload.latitude || payload.locationLat
    const lng: number = payload.longitude || payload.locationLng
    if (!lat || !lng) {
      return DEFAULT_MAP
    }
    return DEFAULT_MAP
  }, [payload])

  const handleLocationTap = (): void => {
    const lat: number = payload.latitude || payload.locationLat
    const lng: number = payload.longitude || payload.locationLng
    if (lat != null && lng != null) {
      onLocationClick?.(lat, lng, description)
    }
  }

  return (
    <View
      style={[
        styles.container,
        isSelf ? styles.containerOut : styles.containerIn,
      ]}
    >
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.description} numberOfLines={1}>
          {description}
        </Text>
      </View>
      <Image
        source={{ uri: mapImageUrl }}
        style={styles.map}
        resizeMode="cover"
        onError={(): void => undefined}
      />
      <View style={StyleSheet.absoluteFill} onTouchEnd={handleLocationTap} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderWidth: rpxToPx(2),
    borderColor: '#E6E9F0',
    backgroundColor: '#FFFFFF',
    maxWidth: rpxToPx(400),
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
  info: {
    paddingHorizontal: rpxToPx(24),
    paddingVertical: rpxToPx(20),
    borderBottomWidth: rpxToPx(2),
    borderBottomColor: '#E6E9F0',
  },
  title: {
    fontSize: rpxToPx(32),
    lineHeight: rpxToPx(42),
    color: 'rgba(0, 0, 0, 0.9)',
    marginBottom: rpxToPx(4),
    width: rpxToPx(352),
  },
  description: {
    fontSize: rpxToPx(24),
    lineHeight: rpxToPx(34),
    color: 'rgba(0, 0, 0, 0.4)',
    width: rpxToPx(352),
  },
  map: {
    width: rpxToPx(400),
    height: rpxToPx(240),
  },
})
