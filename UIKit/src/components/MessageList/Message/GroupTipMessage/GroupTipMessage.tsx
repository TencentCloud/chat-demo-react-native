import React, { useMemo } from 'react'
import { StyleSheet, View } from 'react-native'
import { Text } from '../../../Text'
import { useTranslation } from 'react-i18next'
import { rpxToPx } from '../../../../utils/rpxToPx'
import { MessageType as SDKMessageType } from 'tuikit-atomicx-react-native'
import { type MessageInfo } from '../MessageTypes'
import { resolveGroupTipMessage } from './resolveGroupTipMessage'

export interface GroupTipMessageProps {
  message: MessageInfo
}

export const GroupTipMessage: React.FC<GroupTipMessageProps> = ({ message }) => {
  const { t } = useTranslation()
  const tipText = useMemo((): string => {
    const payload = (message.messagePayload ?? {}) as any
    const mt: number = (message as any).messageType
    if (mt === SDKMessageType.CUSTOM) {
      try {
        const raw: string = payload.customData
        if (raw) {
          const data = JSON.parse(raw)
          if (data?.businessID === 'group_create') {
            const senderNick: string =
              (message as any).sender?.nickname || (message as any).from?.nickname || ''
            const content: string = data?.content || t('groupTip.createContent')
            return `${senderNick} ${content}`
          }
        }
      } catch {
      }
      return t('groupTip.groupCreated')
    }
    return resolveGroupTipMessage(message, t)
  }, [message])

  return (
    <View style={styles.container}>
      <Text style={styles.text} numberOfLines={0}>
        {tipText}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: rpxToPx(16),
    paddingHorizontal: 0,
  },
  text: {
    maxWidth: rpxToPx(650),
    fontSize: rpxToPx(24),
    lineHeight: rpxToPx(34),
    color: 'rgba(0, 0, 0, 0.4)',
  },
})
