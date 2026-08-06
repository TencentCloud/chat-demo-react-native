import React, { useMemo } from 'react'
import { Image, StyleSheet, View } from 'react-native'
import { Text } from '../Text'
import { useTranslation } from 'react-i18next'
import { Avatar } from '../Avatar/Avatar'
import { rpxToPx } from '../../utils/rpxToPx'
import { iconAssets } from '../../static/iconBase64'
import {
  ConversationType,
  GroupAtType,
  GroupType,
  MessageStatus,
  MessageType,
  ReceiveMessageOpt,
  type ConversationPreviewProps,
} from './types'
import type { MessageSegment } from './types'
import {
  getSenderName,
  parseTextToSegments,
  truncateSegments,
  getMessageAbstract,
} from './utils'

const formatTime = (timestamp: number | null | undefined, t: (key: string) => string): string => {
  if (!timestamp) return ''
  const messageTime = new Date(timestamp * 1000)
  const now = new Date()

  const messageYear = messageTime.getFullYear()
  const messageMonth = messageTime.getMonth() + 1
  const messageDay = messageTime.getDate()
  const messageHours = messageTime.getHours().toString().padStart(2, '0')
  const messageMinutes = messageTime.getMinutes().toString().padStart(2, '0')
  const messageDayOfWeek = messageTime.getDay()

  const formattedMonth = messageMonth.toString().padStart(2, '0')
  const formattedDay = messageDay.toString().padStart(2, '0')
  const currentYear = now.getFullYear()

  const timeDiff = now.getTime() - messageTime.getTime()
  const dayDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24))

  if (dayDiff === 0) {
    return `${messageHours}:${messageMinutes}`
  }
  if (dayDiff === 1) {
    return `${t('conversationPreview.yesterday')} ${messageHours}:${messageMinutes}`
  }
  if (dayDiff > 1 && dayDiff < 7) {
    const weekDays = [
      t('conversationPreview.weekdaySun'),
      t('conversationPreview.weekdayMon'),
      t('conversationPreview.weekdayTue'),
      t('conversationPreview.weekdayWed'),
      t('conversationPreview.weekdayThu'),
      t('conversationPreview.weekdayFri'),
      t('conversationPreview.weekdaySat'),
    ]
    const weekDay = weekDays[messageDayOfWeek]
    return `${weekDay} ${messageHours}:${messageMinutes}`
  }
  if (messageYear === currentYear) {
    return `${formattedMonth}/${formattedDay}`
  }
  return `${messageYear}/${formattedMonth}/${formattedDay}`
}

export const ConversationPreview: React.FC<ConversationPreviewProps> = ({ conversation }) => {
  const { t } = useTranslation()
  const displayName = (conversation.title || conversation.showName) ?? ''

  const defaultAvatarType = useMemo(() => {
    if (conversation.type === ConversationType.GROUP) {
      return conversation.groupType || GroupType.WORK
    }
    return 'user'
  }, [conversation.type, conversation.groupType])

  const isMuted = useMemo(() => {
    return (
      conversation.receiveOption === ReceiveMessageOpt.NOT_RECEIVE ||
      conversation.receiveOption === ReceiveMessageOpt.NOT_NOTIFY
    )
  }, [conversation.receiveOption])

  const atFlags = useMemo(() => {
    const result = { hasAtAll: false, hasAtMe: false }
    if (conversation.type !== ConversationType.GROUP) return result
    if (!conversation.unreadCount || conversation.unreadCount <= 0) return result
    const list = conversation.groupAtInfoList
    if (!list || list.length === 0) return result
    for (const info of list) {
      if (info.atType === GroupAtType.AT_ALL) {
        result.hasAtAll = true
      } else if (info.atType === GroupAtType.AT_ME) {
        result.hasAtMe = true
      } else if (info.atType === GroupAtType.AT_ALL_AT_ME) {
        result.hasAtAll = true
        result.hasAtMe = true
      }
    }
    return result
  }, [conversation.type, conversation.unreadCount, conversation.groupAtInfoList])

  const hasAtAll = atFlags.hasAtAll
  const hasAtMe = atFlags.hasAtMe

  const messageSegments = useMemo<MessageSegment[]>(() => {
    if (conversation.draft) {
      return truncateSegments(parseTextToSegments(conversation.draft))
    }

    const lastMessage = conversation.lastMessage
    if (!lastMessage) {
      return [{ type: 'text', content: t('conversationPreview.noMessage') }]
    }

    if (lastMessage.status === MessageStatus.SEND_SUCCESS && lastMessage.messageType === MessageType.TEXT && (lastMessage.messagePayload as any)?.text) {
      let text: string = (lastMessage.messagePayload as any).text.replace(/[\r\n]+/g, ' ')
      const senderName = getSenderName(lastMessage, t)
      if (senderName) {
        text = `${senderName}: ${text}`
      }
      return truncateSegments(parseTextToSegments(text))
    }

    const abstract = getMessageAbstract(lastMessage, t)
    return [{ type: 'text', content: abstract }]
  }, [conversation.draft, conversation.lastMessage, t])

  const unreadCount = conversation.unreadCount
  const lastTimestamp =
    (conversation.lastMessage as any)?.timestamp ?? (conversation as any).lastMessageTime ?? null
  const hasUnread = unreadCount > 0
  const isPinned = !!conversation.isPinned

  return (
    <View style={[styles.convPreview, isPinned && styles.convPreviewPinned]}>
      <Avatar
        src={conversation.avatarURL}
        name={displayName}
        badgeCount={unreadCount}
        showBadgeDot={isMuted}
        defaultAvatarType={defaultAvatarType as any}
        size={96}
      />
      <View style={styles.info}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>
            {conversation.title ?? displayName}
          </Text>
          <Text style={styles.time}>{formatTime(lastTimestamp, t)}</Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.message}>
            {hasAtAll && <Text style={styles.labelMention}>{t('conversationPreview.atAll')}</Text>}
            {hasAtMe && <Text style={styles.labelMention}>{t('conversationPreview.atMe')}</Text>}
            {conversation.draft != null && conversation.draft.length > 0 ? (
              <Text style={styles.labelDraft}>{t('conversationPreview.draft')}</Text>
            ) : (
              isMuted &&
              unreadCount > 0 && <Text style={styles.labelCount}>{t('conversationPreview.unreadCount', { count: unreadCount })}</Text>
            )}

            <View style={styles.lastMsgContainer}>
              {messageSegments.map((segment, index) => {
                if (segment.type === 'emoji' && segment.src != null) {
                  return (
                    <Image
                      key={`emoji-${index}`}
                      source={{ uri: segment.src }}
                      style={styles.emoji}
                      resizeMode="contain"
                    />
                  )
                }
                return (
                  <Text key={`text-${index}`} style={styles.lastMsgText} numberOfLines={1}>
                    {segment.content ?? ''}
                  </Text>
                )
              })}
            </View>
          </View>

          <View style={styles.status}>
            {isMuted && (
              <View style={styles.iconContainer}>
                <Image
                  source={iconAssets['static/icon/mute.png']}
                  style={styles.iconImg}
                  resizeMode="cover"
                />
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  convPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: rpxToPx(22),
    backgroundColor: '#FFFFFF',
    position: 'relative',
  },
  convPreviewPinned: {
    backgroundColor: '#F0F2F7',
  },
  info: {
    paddingTop: rpxToPx(24),
    paddingRight: rpxToPx(32),
    paddingBottom: rpxToPx(24),
    paddingLeft: rpxToPx(14),
    flex: 1,
    justifyContent: 'space-between',
    borderBottomWidth: rpxToPx(2),
    borderBottomColor: '#E6E9F0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: rpxToPx(2),
  },
  name: {
    flex: 1,
    fontSize: rpxToPx(36),
    lineHeight: rpxToPx(48),
    fontWeight: '400',
    color: '#333333',
    marginRight: rpxToPx(16),
  },
  time: {
    flexShrink: 0,
    fontWeight: '400',
    fontSize: rpxToPx(24),
    lineHeight: rpxToPx(34),
    color: '#999999',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  message: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: rpxToPx(16),
  },
  labelMention: {
    fontWeight: '400',
    fontSize: rpxToPx(24),
    lineHeight: rpxToPx(40),
    color: '#FF4444',
    marginRight: rpxToPx(8),
  },
  labelDraft: {
    fontWeight: '400',
    fontSize: rpxToPx(24),
    lineHeight: rpxToPx(40),
    color: '#FF4444',
    marginRight: rpxToPx(8),
  },
  labelCount: {
    fontWeight: '400',
    fontSize: rpxToPx(28),
    lineHeight: rpxToPx(40),
    color: '#999999',
    marginRight: rpxToPx(8),
  },
  lastMsgContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  lastMsgText: {
    fontSize: rpxToPx(28),
    lineHeight: rpxToPx(40),
    color: '#999999',
  },
  emoji: {
    width: rpxToPx(32),
    height: rpxToPx(32),
    marginHorizontal: rpxToPx(4),
  },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: rpxToPx(8),
  },
  iconImg: {
    width: rpxToPx(26),
    height: rpxToPx(26),
  },
})

export default ConversationPreview
