import React, { useMemo } from 'react'
import { StyleSheet, View } from 'react-native'
import { Text } from '../../../Text'
import { useTranslation } from 'react-i18next'
import { rpxToPx } from '../../../../utils/rpxToPx'
import { type MessageInfo } from '../MessageTypes'
import { isCallMessage, isGroupCallMessage } from '../../../../utils/callMessageUtils'
import { CallMessage } from './CallMessage'

export interface CustomMessageProps {
  message: MessageInfo
  conversationID?: string
  onCustomClick?: (data: string) => void
  onLongPress?: () => void
}

export const CustomMessage: React.FC<CustomMessageProps> = ({
  message,
  conversationID = '',
}) => {
  const { t } = useTranslation()
  const isCall = useMemo(() => isCallMessage(message), [message])
  const isCustomCenter = useMemo(
    () => isGroupCallMessage(message, conversationID),
    [message, conversationID]
  )

  if (isCall) {
    return <CallMessage message={message} isGroupCall={isCustomCenter} />
  }

  const customText = useMemo((): string => {
    const payload = (message.messagePayload ?? {}) as any
    const raw: string | undefined = payload.customData
    if (raw) {
      try {
        const data = JSON.parse(raw)
        const content = data?.content
        if (content) return String(content)
      } catch {
      }
    }
    if (payload.description) return payload.description
    return t('customMessage.default')
  }, [message])

  return (
    <View
      style={[
        styles.container,
        isCustomCenter ? styles.containerCenter : null,
      ]}
    >
      <View style={styles.highlight}>
        <View style={styles.row}>
          <Text style={styles.text}>{customText}</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: rpxToPx(12),
    minWidth: rpxToPx(160),
    maxWidth: rpxToPx(480),
  },
  containerCenter: {
    backgroundColor: 'transparent',
    maxWidth: rpxToPx(750),
    minWidth: 0,
  },
  highlight: {
    padding: rpxToPx(20),
    backgroundColor: 'transparent',
    borderRadius: rpxToPx(12),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  text: {
    fontSize: rpxToPx(28),
    color: '#333333',
    flex: 1,
  },
})
