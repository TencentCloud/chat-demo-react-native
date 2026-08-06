import {
  type OfflinePushInfoResolver,
  type SendMessageOption,
  type SendMessagePayload,
} from 'tuikit-atomicx-react-native'

import { showToast } from '../../utils/toast'

export const MediaMessageType = {
  TEXT: 1,
  IMAGE: 2,
  VIDEO: 3,
  AUDIO: 4,
  FILE: 5,
  CUSTOM: 6,
} as const

export type MediaMessageTypeValue = typeof MediaMessageType[keyof typeof MediaMessageType]

export function getMessageTypeFromPayload(payload: SendMessagePayload): MediaMessageTypeValue {
  switch (payload.type) {
    case 'text':
      return MediaMessageType.TEXT
    case 'image':
      return MediaMessageType.IMAGE
    case 'video':
      return MediaMessageType.VIDEO
    case 'audio':
      return MediaMessageType.AUDIO
    case 'file':
      return MediaMessageType.FILE
    case 'custom':
      return MediaMessageType.CUSTOM
    case 'face':
      return MediaMessageType.CUSTOM
    default:
      return MediaMessageType.TEXT
  }
}

export interface SendMediaMessageParams {
  messageInputState: {
    sendMessage: (payload: SendMessagePayload, option: SendMessageOption) => Promise<void>
  } | null
  conversationID: string
  payload: SendMessagePayload
  setOfflinePushInfo?: OfflinePushInfoResolver | undefined
  atUserList?: string[] | undefined
}

export async function sendMediaMessage(params: SendMediaMessageParams): Promise<void> {
  const { messageInputState, conversationID, payload, setOfflinePushInfo, atUserList } = params

  if (messageInputState == null) {
    console.error('[sendMediaMessage] messageInputState is null (conversationID 缺失)')
    return
  }

  const option: SendMessageOption = {}
  if (setOfflinePushInfo != null) {
    try {
      const messageType = getMessageTypeFromPayload(payload)
      const offlinePush = setOfflinePushInfo({
        messageType: messageType as any,
        messagePayload: payload,
        conversationID,
      })
      if (offlinePush != null) {
        option.offlinePushInfo = offlinePush
      }
    } catch (e: any) {
      console.warn(`[sendMediaMessage] setOfflinePushInfo resolver threw: ${e != null ? `${e}` : 'null'}`)
    }
  }
  if (atUserList != null && atUserList.length > 0) {
    option.atUserList = atUserList
  }

  try {
    await messageInputState.sendMessage(payload, option)
  } catch (e: any | null) {
    const errMsg = e instanceof Error ? e.message : (e != null ? `${e}` : 'sendMessage failed')
    if (/only group member/i.test(errMsg)) {
      showToast('您已不在该群中，无法发送消息')
    } else {
      showToast(`发送失败：${errMsg}`)
    }
    throw e
  }
}
