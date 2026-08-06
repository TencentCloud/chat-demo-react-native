
import { emojiUrlMap, emojiBaseUrl } from './emoji'
import {
  ConversationType,
  MessageType,
  MessageStatus,
  type MessageInfo,
  type MessageSegment,
  type RichTextNode,
} from './types'

export type { RichTextNode } from './types'


export const CallType = {
  AUDIO: 0,
  VIDEO: 1,
} as const

export interface CallMessageData {
  businessID: number
  timeout?: number
  inviteID?: string
  actionType: number
  inviter?: string
  inviteeList?: string[]
  groupID?: string
  callInfo: {
    businessID?: number
    call_end?: number
    call_type?: number
    line_busy?: string
    platform?: string
    room_id?: number
  }
}

const safeJsonParse = <T,>(json: string, defaultValue: T): T => {
  try {
    if (!json || typeof json !== 'string') {
      return defaultValue
    }
    return JSON.parse(json) as T
  } catch {
    return defaultValue
  }
}

export const isCallMessage = (message: MessageInfo): boolean => {
  if (message.messageType !== MessageType.CUSTOM) return false
  const payload = message.messagePayload as any
  const businessID = payload?.businessID
  return typeof businessID === 'number' && businessID > 0
}

export const isGroupCallMessage = (message: MessageInfo, conversationID: string): boolean => {
  if (!isCallMessage(message)) return false
  return conversationID.startsWith('group_')
}

export const parseCallMessageData = (message: MessageInfo): CallMessageData | null => {
  if (!isCallMessage(message)) return null
  const payload = message.messagePayload as any
  const customData = payload?.customData ?? payload?.data
  if (typeof customData === 'string') {
    return safeJsonParse<CallMessageData>(customData, {} as CallMessageData)
  }
  if (customData && typeof customData === 'object') {
    return customData as CallMessageData
  }
  return null
}

export const isVideoCall = (data: CallMessageData | null): boolean => {
  return data?.callInfo?.call_type === CallType.VIDEO
}

export const getSenderName = (message: MessageInfo, t: TFunction): string => {
  const m = message as any
  const isGroup =
    m.conversationType === ConversationType.GROUP ||
    !!m.groupID ||
    (m.conversationID || '').startsWith('group_') ||
    ((m.to || '').length > 0 && !!m.groupID)
  if (!isGroup) return ''

  if (message.isSentBySelf) return t('common.you')

  const from = message.from
  if (!from) return ''
  return from.friendRemark || from.nameCard || from.nickname || from.userID || ''
}


export const parseTextToSegments = (text: string): MessageSegment[] => {
  const segments: MessageSegment[] = []
  if (!text) {
    return [{ type: 'text', content: '' }]
  }
  const emojiRegex = /\[TUIEmoji_[^\]]+\]/g
  let lastIndex = 0
  let match: RegExpExecArray | null = emojiRegex.exec(text)

  while (match != null) {
    if (match.index > lastIndex) {
      segments.push({
        type: 'text',
        content: text.substring(lastIndex, match.index),
      })
    }

    const emojiKey = match[0]
    const emojiFileName = emojiUrlMap[emojiKey]
    if (emojiFileName) {
      segments.push({
        type: 'emoji',
        src: emojiBaseUrl + emojiFileName,
      })
    } else {
      segments.push({
        type: 'text',
        content: emojiKey,
      })
    }

    lastIndex = emojiRegex.lastIndex
    match = emojiRegex.exec(text)
  }

  if (lastIndex < text.length) {
    segments.push({
      type: 'text',
      content: text.substring(lastIndex),
    })
  }

  if (segments.length === 0) {
    segments.push({
      type: 'text',
      content: text,
    })
  }

  return segments
}


const safeTruncateText = (text: string, n: number): string => {
  if (n <= 0) return ''
  const chars = Array.from(text)
  if (chars.length <= n) return text

  let cut = n
  while (cut > 0) {
    const prev = chars[cut - 1]
    const next = chars[cut]
    const cp = next ? next.codePointAt(0) || 0 : 0
    const prevCp = prev ? prev.codePointAt(0) || 0 : 0
    const nextIsCombiner = cp === 0x200d || cp === 0xfe0f || (cp >= 0x1f3fb && cp <= 0x1f3ff)
    const prevIsZwj = prevCp === 0x200d
    if (nextIsCombiner || prevIsZwj) {
      cut--
      continue
    }
    break
  }
  return chars.slice(0, cut).join('')
}


export const truncateSegments = (segments: MessageSegment[], maxLength = 15): MessageSegment[] => {
  let totalLength = 0
  const result: MessageSegment[] = []

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i]

    if (segment.type === 'text') {
      const chars = Array.from(segment.content || '')
      const textLength = chars.length

      if (totalLength + textLength <= maxLength) {
        result.push(segment)
        totalLength += textLength
      } else {
        const remainingLength = maxLength - totalLength
        if (remainingLength > 0) {
          result.push({
            type: 'text',
            content: safeTruncateText(segment.content || '', remainingLength) + '...',
          })
        } else {
          result.push({ type: 'text', content: '...' })
        }
        return result
      }
    } else if (segment.type === 'emoji') {
      if (totalLength + 1 <= maxLength) {
        result.push(segment)
        totalLength += 1
      } else {
        result.push({ type: 'text', content: '...' })
        return result
      }
    }
  }

  return result
}


type TFunction = (key: string, options?: any) => string

export const getMessageAbstract = (message: MessageInfo, t: TFunction): string => {
  if (message.status === MessageStatus.REVOKED) {
    const senderName = getSenderName(message, t)
    if (senderName.length > 0) {
      return `${senderName}: ${t('conversationList.messageRevoked')}`
    }
    return t('conversationList.messageRevoked')
  }
  if (message.status === MessageStatus.DELETED) {
    return t('conversationList.messageDeleted')
  }

  const payload = message.messagePayload as any
  let messageContent = ''

  switch (message.messageType) {
    case MessageType.TEXT:
      messageContent = payload?.text || t('conversationList.textDefault')
      break
    case MessageType.IMAGE:
      messageContent = t('conversationList.imageLabel')
      break
    case MessageType.VIDEO:
      messageContent = t('conversationList.videoLabel')
      break
    case MessageType.AUDIO:
      messageContent = t('conversationList.audioLabel')
      break
    case MessageType.FILE:
      messageContent = t('conversationList.fileLabel', { name: payload?.fileName || '' })
      break
    case MessageType.FACE:
      messageContent = t('conversationList.faceLabel')
      break
    case MessageType.CUSTOM:
      if (isCallMessage(message)) {
        const callData = parseCallMessageData(message)
        messageContent = isVideoCall(callData) ? t('conversationList.videoCall') : t('conversationList.voiceCall')
      } else {
        messageContent = payload?.description || t('conversationList.customDefault')
      }
      break
    case MessageType.MERGED:
      messageContent = t('conversationList.mergerLabel', { title: payload?.title || '' })
      break
    case MessageType.TIPS:
      messageContent = t('conversationList.tipsLabel')
      break
    default:
      messageContent = t('conversationList.unknownLabel')
  }

  const m = message as any
  const isGroup =
    m.conversationType === ConversationType.GROUP ||
    !!m.groupID ||
    (m.conversationID || '').startsWith('group_')
  if (isGroup && message.messageType !== MessageType.TIPS && !isCallMessage(message)) {
    const senderName = getSenderName(message, t)
    return senderName ? `${senderName}: ${messageContent}` : messageContent
  }
  return messageContent
}

export const parseMessageToRichTextNodes = (message: MessageInfo, t: TFunction): RichTextNode[] => {
  if (message.messageType === MessageType.TEXT && (message.messagePayload as any)?.text) {
    const text = (message.messagePayload as any).text
    const contentNodes = parseTextToSegments(text).map((seg) => {
      if (seg.type === 'emoji') {
        return { type: 'emoji' as const, src: seg.src || '' }
      }
      return { type: 'text' as const, text: seg.content || '' }
    })

    const senderName = getSenderName(message, t)
    if (senderName) {
      return [{ type: 'text', text: `${senderName}: ` }, ...contentNodes]
    }
    return contentNodes
  }

  const abstract = getMessageAbstract(message, t)
  return [{ type: 'text', text: abstract }]
}
