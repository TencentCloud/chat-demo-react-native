import React, { useMemo } from 'react'
import { StyleSheet, View } from 'react-native'
import { Text } from '../../../Text'
import { rpxToPx } from '../../../../utils/rpxToPx'
import { type MessageInfo } from '../MessageTypes'

export interface TextMessageProps {
  message: MessageInfo
  onLongPress?: () => void
}

export const TextMessage: React.FC<TextMessageProps> = ({ message, onLongPress: _onLongPress }) => {
  const isSelf = message.isSelf === true
  const text = useMemo((): string => {
    return message.text ?? message.messagePayload?.text ?? ''
  }, [message])

  const quoteMessage = (message as any).quoteMessageInfo as
    | { msgSender?: string; msgAbstract?: string; msgID?: string }
    | undefined

  return (
    <View
      style={[styles.container, isSelf ? styles.containerOut : styles.containerIn]}
      selectable={false}
    >
      <View style={styles.highlight}>
        {quoteMessage ? (
          <View style={styles.quote}>
            <View style={styles.quoteHeader}>
              <Text style={styles.quoteSender} numberOfLines={1}>
                {quoteMessage.msgSender || ''}
              </Text>
            </View>
            <View style={styles.quoteBody}>
              <Text style={styles.quoteText} numberOfLines={1}>
                {quoteMessage.msgAbstract || ''}
              </Text>
            </View>
          </View>
        ) : null}
        <View style={styles.body}>
          <Text
            style={styles.plain}
            selectable={false}
          >
            {text}
          </Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    maxWidth: rpxToPx(476),
  },
  containerIn: {
    backgroundColor: '#F0F2F7',
    borderTopLeftRadius: rpxToPx(4),
    borderTopRightRadius: rpxToPx(20),
    borderBottomLeftRadius: rpxToPx(20),
    borderBottomRightRadius: rpxToPx(20),
  },
  containerOut: {
    backgroundColor: '#CCE2FF',
    borderTopLeftRadius: rpxToPx(20),
    borderTopRightRadius: rpxToPx(4),
    borderBottomLeftRadius: rpxToPx(20),
    borderBottomRightRadius: rpxToPx(20),
  },
  highlight: {
    paddingHorizontal: rpxToPx(24),
    paddingVertical: rpxToPx(20),
    backgroundColor: 'transparent',
  },
  quote: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderLeftWidth: rpxToPx(4),
    borderLeftColor: '#999999',
    borderRadius: rpxToPx(8),
    padding: rpxToPx(16),
    marginBottom: rpxToPx(12),
  },
  quoteHeader: {
    marginBottom: rpxToPx(8),
  },
  quoteSender: {
    fontSize: rpxToPx(24),
    color: '#333333',
    fontWeight: '500',
  },
  quoteBody: {
    maxWidth: '100%',
  },
  quoteText: {
    fontSize: rpxToPx(26),
    color: '#666666',
  },
  body: {
    flexDirection: 'column',
  },
  plain: {
    fontSize: rpxToPx(32),
    lineHeight: rpxToPx(44),
    color: '#1A1A1A',
  },
})
