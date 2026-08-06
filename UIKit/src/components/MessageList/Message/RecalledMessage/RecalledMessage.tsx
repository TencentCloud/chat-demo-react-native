import React, { useMemo } from 'react'
import { DeviceEventEmitter, Pressable, StyleSheet, View } from 'react-native'
import { Text } from '../../../Text'
import { rpxToPx } from '../../../../utils/rpxToPx'
import { MessageType as SDKMessageType } from 'tuikit-atomicx-react-native'
import { useTranslation } from 'react-i18next'
import { type MessageInfo } from '../MessageTypes'

export interface RecalledMessageProps {
  message: MessageInfo
  conversationID: string
}

export const RecalledMessage: React.FC<RecalledMessageProps> = ({ message, conversationID: _conversationID }) => {
  const { t } = useTranslation()
  const isSelf = message.isSelf === true
  const mType: number = (message as any).messageType

  const displayName = useMemo((): string => {
    const sender: any = (message as any).sender ?? (message as any).from
    return sender?.nameCard || sender?.friendRemark || sender?.nickname || sender?.userID || ''
  }, [message])

  const recalledText = useMemo((): string => {
    if (isSelf) return t('message.youRecalled')
    return t('message.someoneRecalled', { name: displayName })
  }, [isSelf, displayName, t])

  const canReEdit = useMemo((): boolean => {
    if (!isSelf) return false
    if (mType !== SDKMessageType.TEXT) return false
    return true
  }, [isSelf, mType])

  const handleReEdit = (): void => {
    const originalText: string = (message.messagePayload as any)?.text || ''
    DeviceEventEmitter.emit('atomicx-reEdit', {
      conversationID: _conversationID,
      text: originalText,
    })
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{recalledText}</Text>
      {canReEdit && (
        <Pressable style={styles.reEditButton} onPress={handleReEdit}>
          <Text style={styles.reEditText}>{t('message.reEdit')}</Text>
        </Pressable>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: rpxToPx(16),
  },
  text: {
    fontSize: rpxToPx(24),
    lineHeight: rpxToPx(34),
    color: 'rgba(0, 0, 0, 0.4)',
    marginLeft: rpxToPx(8),
  },
  reEditButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  reEditText: {
    fontSize: rpxToPx(24),
    lineHeight: rpxToPx(34),
    color: '#1C66E5',
    marginLeft: rpxToPx(8),
  },
})
