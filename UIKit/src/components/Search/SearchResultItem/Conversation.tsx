import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ResultItem } from './ResultItem'
import { SearchResultItemMessageProps, MessageInfo } from '../types'

import { Avatar as DefaultAvatar } from '../../Avatar/Avatar'

const getMessageAbstract = (msg: MessageInfo | undefined, t: (key: string) => string): string => {
  if (!msg) return ''
  const body = msg.messagePayload
  if (body?.text) return body.text
  const mt = msg.messageType
  switch (mt) {
    case 2: return t('searchPlaceholder.messageTypeImage')
    case 3: return t('searchPlaceholder.messageTypeVideo')
    case 4: return t('searchPlaceholder.messageTypeVoice')
    case 5: return t('searchPlaceholder.messageTypeFile')
    case 6: return t('searchPlaceholder.messageTypeFace')
    case 7: return t('searchPlaceholder.messageTypeSystem')
    case 8: return t('searchPlaceholder.messageTypeCustom')
    case 9: return t('searchPlaceholder.messageTypeMerger')
    default: return ''
  }
}

export const ConversationResultItem: React.FC<SearchResultItemMessageProps> = ({
  messageResult,
  keyword = '',
  Avatar = DefaultAvatar,
}) => {
  const { t } = useTranslation()
  const previewText = useMemo(() => {
    const messages = messageResult.messageList
    if (!messages || messages.length === 0) return ''
    const first = messages[0]
    if (first.messagePayload?.text) return first.messagePayload.text
    return getMessageAbstract(first, t)
  }, [messageResult, t])

  const subtitleText = useMemo(() => {
    const count = messageResult.messageCount
    if (count === 1) return previewText
    return t('searchPlaceholder.relatedConversations', { count })
  }, [messageResult, previewText, t])

  const defaultAvatarType = useMemo(() => {
    return messageResult.conversationID.startsWith('group_') ? 'public' : 'user'
  }, [messageResult.conversationID])

  return (
    <ResultItem
      avatarURL={messageResult.conversationAvatarURL || ''}
      title={messageResult.conversationShowName}
      subtitle={subtitleText}
      keyword={keyword}
      Avatar={Avatar}
      defaultAvatarType={defaultAvatarType}
    />
  )
}

export default ConversationResultItem
