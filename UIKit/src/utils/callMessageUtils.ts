
import type { MessageInfo } from '../components/MessageList/Message/MessageTypes'

export function safeJsonParse<T>(jsonString: unknown, defaultValue: T): T {
  if (typeof jsonString !== 'string') {
    return jsonString as T
  }
  let result: T
  try {
    result = JSON.parse(jsonString) as T
  } catch {
    result = defaultValue
  }
  return result
}

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
    version?: number
    data?: {
      cmd?: string
      inviter?: string
      message?: string
      room_id?: number
      str_room_id?: string
    }
  }
}

export function isCallMessage(message: MessageInfo): boolean {
  const customMessage = message.messagePayload as any
  if (!(customMessage && customMessage.customData)) {
    return false
  }
  const dataContent = safeJsonParse<any>(customMessage.customData as string, null)
  return !!(dataContent && dataContent.businessID === 1)
}

export function isGroupCallMessage(message: MessageInfo, conversationID: string): boolean {
  if (!isCallMessage(message)) {
    return false
  }
  return conversationID.startsWith('group_')
}

export function parseCallMessageData(message: MessageInfo): CallMessageData | null {
  const customMessage = message.messagePayload as any
  if (!(customMessage && customMessage.customData)) {
    return null
  }
  const dataContent = safeJsonParse<any>(customMessage.customData as string, null)
  if (!dataContent || dataContent.businessID !== 1) {
    return null
  }
  const callInfo = safeJsonParse<any>(dataContent.data, null)
  if (!callInfo) {
    return null
  }
  return {
    businessID: dataContent.businessID,
    timeout: dataContent.timeout,
    inviteID: dataContent.inviteID,
    actionType: dataContent.actionType,
    inviter: dataContent.inviter,
    inviteeList: dataContent.inviteeList,
    groupID: dataContent.groupID,
    callInfo: {
      businessID: callInfo.businessID,
      call_end: callInfo.call_end,
      call_type: callInfo.call_type,
      line_busy: callInfo.line_busy,
      platform: callInfo.platform,
      room_id: callInfo.room_id,
      version: callInfo.version,
      data: {
        cmd: callInfo.data && callInfo.data.cmd,
        inviter: callInfo.data && callInfo.data.inviter,
        message: callInfo.data && callInfo.data.message,
        room_id: callInfo.data && callInfo.data.room_id,
        str_room_id: callInfo.data && callInfo.data.str_room_id,
      },
    },
  }
}

export function isVideoCall(data: CallMessageData | null): boolean {
  if (!data) return false
  if (data.callInfo.call_type === 2) {
    return true
  }
  const cmd = data.callInfo.data && data.callInfo.data.cmd
  if (cmd === 'videoCall' || cmd === 'switchToVideo') {
    return true
  }
  return false
}

export function formatCallDuration(seconds: number): string {
  if (!seconds || seconds <= 0) {
    return '00:00'
  }
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`
  }
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

function substringByLength(str: string, maxLength = 12): string {
  if (!str || str.length <= maxLength) {
    return str
  }
  return `${str.substring(0, maxLength)}...`
}

export function getMessageSenderName(message: MessageInfo, maxLength = 12): string {
  const sender: any = (message as any).sender ?? (message as any).from ?? {}
  const name = sender.friendRemark || sender.nameCard || sender.nickname || sender.userID || ''
  return substringByLength(name, maxLength)
}

export function getCallMessageText(message: MessageInfo, showSenderName = true, t?: (key: string, opts?: Record<string, string | number>) => string): string {
  const tFn = t ?? ((k) => k)
  const data = parseCallMessageData(message)
  if (!data) {
    return tFn("callMessage.unknown")
  }
  const { actionType, callInfo, groupID } = data
  const objectData = callInfo
  const isSelfInviter = message.isSelf === true
  const senderName = showSenderName ? getMessageSenderName(message) : ""

  switch (actionType) {
    case 1: {
      const cmd = objectData.data && objectData.data.cmd
      if (cmd === "audioCall" || cmd === "videoCall") {
        if (groupID && senderName) {
          return senderName + " " + tFn("callMessage.initiate")
        }
        return tFn("callMessage.initiate")
      }
      if (cmd === "hangup") {
        if (groupID) {
          return tFn("callMessage.ended")
        }
        return formatCallDuration(objectData.call_end || 0) + " " + tFn("callMessage.duration", { duration: "" })
      }
      if (cmd === "switchToAudio") {
        return tFn("callMessage.switchToVoice")
      }
      if (cmd === "switchToVideo") {
        return tFn("callMessage.switchToVideo")
      }
      return tFn("callMessage.initiate")
    }
    case 2:
      if (groupID && senderName) {
        return senderName + " " + tFn("callMessage.cancel")
      }
      if (isSelfInviter) {
        return tFn("callMessage.cancel")
      }
      return tFn("callMessage.cancel")
    case 3: {
      const cmd = objectData.data && objectData.data.cmd
      if (cmd === "switchToAudio") {
        return tFn("callMessage.switchToVoice")
      }
      if (cmd === "switchToVideo") {
        return tFn("callMessage.switchToVideo")
      }
      if (groupID && senderName) {
        return senderName + " " + tFn("callMessage.accept")
      }
      return tFn("callMessage.accept")
    }
    case 4: {
      if (groupID && senderName) {
        return senderName + " " + tFn("callMessage.reject")
      }
      if (
        objectData.line_busy === "line_busy" ||
        (objectData.data && objectData.data.message) === "lineBusy"
      ) {
        if (isSelfInviter) {
          return tFn("callMessage.busy")
        }
        return tFn("callMessage.busy")
      }
      if (isSelfInviter) {
        return tFn("callMessage.reject")
      }
      return tFn("callMessage.reject")
    }
    case 5: {
      const cmd = objectData.data && objectData.data.cmd
      if (cmd === "switchToAudio") {
        return tFn("callMessage.switchToVoice")
      }
      if (cmd === "switchToVideo") {
        return tFn("callMessage.switchToVideo")
      }
      if (groupID && senderName) {
        return senderName + " " + tFn("callMessage.timeout")
      }
      if (isSelfInviter) {
        return tFn("callMessage.timeout")
      }
      return tFn("callMessage.timeout")
    }
    default:
      return tFn("callMessage.unknown")
  }
}
