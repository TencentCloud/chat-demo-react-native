import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ResultItem } from './ResultItem'
import { MessageInfo, MessageSearchResultItem, MessageType, SearchResultItemMessageProps } from '../types'

import { Avatar as DefaultAvatar } from '../../Avatar/Avatar'

export interface MessageResultItemFullProps {
  messageResult?: MessageSearchResultItem
  message?: MessageInfo
  keyword?: string
  Avatar?: any
  onClick?: (type: 'message', data: any) => void
}

const getMessageDisplayText = (msg: MessageInfo | undefined, t: (key: string) => string): string => {
  if (!msg) return ''
  const mt = msg.messageType
  const body = msg.messagePayload
  switch (mt) {
    case MessageType.TEXT:
    case 1:
      return body?.text || ''
    case MessageType.IMAGE:
    case 2:
    case MessageType.VIDEO:
    case 3:
    case MessageType.SOUND:
    case 4:
    case MessageType.FILE:
    case 5:
    case MessageType.FACE:
    case 6:
      return ''
    case MessageType.SYSTEM:
    case 7:
      return t('searchPlaceholder.messageTypeSystem')
    case MessageType.CUSTOM:
    case 8:
      return t('searchPlaceholder.messageTypeCustom')
    case MessageType.MERGED:
    case 9:
      return t('searchPlaceholder.messageTypeMerger')
    default:
      return t('searchPlaceholder.messageTypeUnknown')
  }
}

export const MessageResultItem: React.FC<MessageResultItemFullProps> = ({
  messageResult,
  message,
  keyword = '',
  Avatar = DefaultAvatar,
}) => {
  const { t } = useTranslation()
  const isMessageMode = !!message

  const currentMessage = useMemo(() => {
    if (isMessageMode) return message
    const list = messageResult?.messageList
    if (list && list.length > 0) return list[0]
    return undefined
  }, [isMessageMode, message, messageResult])

  const avatarURL = useMemo(() => {
    if (isMessageMode) return message?.from?.avatarURL || ''
    return messageResult?.conversationAvatarURL || ''
  }, [isMessageMode, message, messageResult])

  const title = useMemo(() => {
    if (isMessageMode) {
      return (
        message?.from?.friendRemark ||
        message?.from?.nameCard ||
        message?.from?.nickname ||
        message?.from?.userID ||
        ''
      )
    }
    return messageResult?.conversationShowName || ''
  }, [isMessageMode, message, messageResult])

  const mediaType = useMemo((): 'image' | 'video' | 'file' | 'sound' | 'face' | '' => {
    if (!currentMessage) return ''
    if (!isMessageMode && (messageResult?.messageCount || 0) > 1) return ''
    const t = currentMessage.messageType
    switch (t) {
      case MessageType.IMAGE:
      case 2:
        return 'image'
      case MessageType.VIDEO:
      case 3:
        return 'video'
      case MessageType.SOUND:
      case 4:
        return 'sound'
      case MessageType.FILE:
      case 5:
        return 'file'
      case MessageType.FACE:
      case 6:
        return 'face'
      default:
        return ''
    }
  }, [currentMessage, isMessageMode, messageResult])

  const mediaSrc = useMemo(() => {
    if (!currentMessage) return ''
    const body = currentMessage.messagePayload as any
    const t = currentMessage.messageType
    switch (t) {
      case 2:
        return body?.thumbImagePath || body?.originalImagePath || ''
      case 3:
        return body?.videoSnapshotPath || ''
      default:
        return ''
    }
  }, [currentMessage])

  const mediaInfo = useMemo(() => {
    if (!currentMessage) return {}
    const body = currentMessage.messagePayload as any
    const t = currentMessage.messageType
    switch (t) {
      case 3:
        return { duration: body?.videoDuration || 0 }
      case 4:
        return { duration: body?.soundDuration || 0 }
      case 5:
        return { fileName: body?.fileName || '', fileSize: body?.fileSize || 0 }
      case 6:
        return { faceIndex: body?.faceIndex || 0, faceName: body?.faceName || '' }
      default:
        return {}
    }
  }, [currentMessage])

  const subtitleText = useMemo(() => {
    if (isMessageMode) return getMessageDisplayText(message, t)
    const count = messageResult?.messageCount || 0
    if (count === 1) {
      const list = messageResult?.messageList
      if (list && list.length > 0) return getMessageDisplayText(list[0], t)
    }
    return t('searchPlaceholder.relatedConversations', { count })
  }, [isMessageMode, message, messageResult, t])

  return (
    <ResultItem
      avatarURL={avatarURL}
      title={title}
      subtitle={subtitleText}
      keyword={keyword}
      Avatar={Avatar}
      mediaType={mediaType}
      mediaSrc={mediaSrc}
      mediaInfo={mediaInfo}
      defaultAvatarType="user"
    />
  )
}

export default MessageResultItem
