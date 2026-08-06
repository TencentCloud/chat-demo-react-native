import React, { useMemo } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { Text } from '../Text'
import { useTranslation } from 'react-i18next'
import { rpxToPx } from '../../utils/rpxToPx'
import {
  ConversationActionType,
  ReceiveMessageOpt,
  type ActionItem,
  type ConversationActionsProps,
  type ConversationActionsEmits,
} from './types'

interface Props extends ConversationActionsProps {
  onPin?: (conversationID: string, isPinned: boolean) => void
  onMute?: (conversationID: string, isMuted: boolean) => void
  onDelete?: (conversationID: string) => void
}

const ACTION_WIDTH = 160

const getDefaultText = (key: string, isPinned: boolean, isMuted: boolean, t: (k: string) => string): string => {
  switch (key) {
    case ConversationActionType.PIN:
      return isPinned ? t('conversation.unpin') : t('conversation.pin')
    case ConversationActionType.MUTE:
      return isMuted ? t('conversation.unmute') : t('conversation.mute')
    case ConversationActionType.DELETE:
      return t('conversation.delete')
    default:
      return key
  }
}

const getDefaultBackgroundColor = (key: string): string => {
  switch (key) {
    case ConversationActionType.PIN:
      return '#FF7200'
    case ConversationActionType.MUTE:
      return '#1C66E5'
    case ConversationActionType.DELETE:
      return '#E54545'
    default:
      return '#999999'
  }
}

export const ConversationActions: React.FC<Props> = ({
  conversation,
  actions,
  isSupportPin = true,
  isSupportMute = true,
  isSupportDelete = true,
  onPin,
  onMute,
  onDelete,
}) => {
  const { t } = useTranslation()
  const isMuted = useMemo(() => {
    return (
      conversation.receiveOption === ReceiveMessageOpt.NOT_RECEIVE ||
      conversation.receiveOption === ReceiveMessageOpt.NOT_NOTIFY
    )
  }, [conversation.receiveOption])

  const actionList: ActionItem[] = useMemo(() => {
    if (actions != null && actions.length > 0) {
      return actions.map((action) => ({
        ...action,
        text: action.text || getDefaultText(action.key, !!conversation.isPinned, isMuted, t),
      }))
    }
    const items: ActionItem[] = []
    if (isSupportMute) {
      items.push({
        key: ConversationActionType.MUTE,
        text: isMuted ? t('conversation.unmute') : t('conversation.mute'),
      })
    }
    if (isSupportPin) {
      items.push({
        key: ConversationActionType.PIN,
        text: conversation.isPinned ? t('conversation.unpin') : t('conversation.pin'),
      })
    }
    if (isSupportDelete) {
      items.push({ key: ConversationActionType.DELETE, text: t('conversation.delete') })
    }
    return items
  }, [actions, isSupportMute, isSupportPin, isSupportDelete, conversation.isPinned, isMuted, t])

  const handleActionTap = (action: ActionItem): void => {
    const conversationID = conversation.conversationID

    if (action.onClick && typeof action.onClick === 'function') {
      action.onClick(conversationID)
      return
    }

    switch (action.key) {
      case ConversationActionType.PIN:
        onPin?.(conversationID, !conversation.isPinned)
        break
      case ConversationActionType.MUTE:
        onMute?.(conversationID, !isMuted)
        break
      case ConversationActionType.DELETE:
        onDelete?.(conversationID)
        break
    }
  }

  return (
    <View style={styles.container}>
      {actionList.map((action) => (
        <TouchableOpacity
          key={action.key}
          activeOpacity={0.7}
          style={[
            styles.action,
            { backgroundColor: action.backgroundColor || getDefaultBackgroundColor(action.key) },
          ]}
          onPress={() => handleActionTap(action)}
        >
          <Text style={[styles.actionText, { color: action.color || '#FFFFFF' }]}>
            {action.text}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  action: {
    width: rpxToPx(ACTION_WIDTH),
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    fontSize: rpxToPx(28),
    lineHeight: rpxToPx(39),
    fontWeight: '400',
  },
})

export default ConversationActions
export type { ConversationActionsProps, ConversationActionsEmits }
