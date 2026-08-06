import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'
import { Text } from '../../../Text'
import { rpxToPx } from '../../../../utils/rpxToPx'
import { type MessageInfo } from '../MessageTypes'

const DEFAULT_FACE_SIZE = 120
const FACE_LABEL_KEYS = [
  'emoji.smile', 'emoji.laugh', 'emoji.cry', 'emoji.angry', 'emoji.surprise',
  'emoji.love', 'emoji.sad', 'emoji.cool', 'emoji.wink', 'emoji.kiss',
]

export interface FaceMessageProps {
  message: MessageInfo
  onLongPress?: () => void
}

export const FaceMessage: React.FC<FaceMessageProps> = ({ message }) => {
  const { t } = useTranslation()
  const payload = (message.messagePayload ?? {}) as any
  const faceIndex: number = payload.faceIndex || 0
  const faceName: string = payload.faceData || ''

  const label = useMemo((): string => {
    if (faceName) return faceName
    const key = FACE_LABEL_KEYS[faceIndex] || FACE_LABEL_KEYS[0]
    return t(key)
  }, [faceIndex, faceName, t])

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.faceCircle,
          { width: rpxToPx(DEFAULT_FACE_SIZE), height: rpxToPx(DEFAULT_FACE_SIZE) },
        ]}
      >
        <Text style={styles.faceText} numberOfLines={1}>
          {label}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  faceCircle: {
    borderRadius: rpxToPx(60),
    backgroundColor: '#FFEAA7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  faceText: {
    fontSize: rpxToPx(32),
    color: '#333333',
    fontWeight: '500',
  },
})
