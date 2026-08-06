import type {
  MessageInfo as SDKMessageInfo,
  MessagePayload as SDKMessagePayload,
  MessageSenderInfo as SDKMessageSenderInfo,
} from 'tuikit-atomicx-react-native'

export type { SDKMessageInfo, SDKMessagePayload, SDKMessageSenderInfo }

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  AUDIO = 'audio',
  VIDEO = 'video',
  FILE = 'file',
  CUSTOM = 'custom',
  LOCATION = 'location',
  MERGER = 'merger',
  GROUP_TIP = 'groupTip',
  RECALLED = 'recalled',
  FACE = 'face',
}

export interface MessageSenderInfo {
  userID: string
  nickname?: string
  avatarURL?: string
  nameCard?: string
  friendRemark?: string
  role?: 'owner' | 'admin' | 'member'
}

export interface MessagePayload {
  text?: string
  imagePath?: string
  imageWidth?: number
  imageHeight?: number
  audioPath?: string
  audioDuration?: number
  videoPath?: string
  videoSnapshotPath?: string
  videoSnapshotWidth?: number
  videoSnapshotHeight?: number
  videoDuration?: number
  fileName?: string
  filePath?: string
  fileSize?: number
  locationLat?: number
  locationLng?: number
  locationDesc?: string
  mergerTitle?: string
  mergerSummary?: string[]
  groupTipType?: string
  groupTipOperator?: MessageSenderInfo
  groupTipTargetUsers?: MessageSenderInfo[]
  customData?: string
  customDescription?: string
  faceIndex?: number
  faceData?: string
}

export interface MessageReceipt {
  readCount?: number
  unreadCount?: number
}

export interface MessageInfo {
  msgID: string
  conversationID: string
  sender?: MessageSenderInfo
  messageType: MessageType | string
  messagePayload?: MessagePayload | null
  text?: string
  timestamp: number
  isSelf?: boolean
  isRead?: boolean
  status?: string | number
  isRecalled?: boolean
  groupID?: string
  isGroup?: boolean
  mentionedUserIDs?: string[]
  needReadReceipt?: boolean
  receipt?: MessageReceipt
}

export const fromSDKMessage = (raw: any): MessageInfo => {
  if (!raw) {
    return {
      msgID: '',
      conversationID: '',
      messageType: MessageType.TEXT,
      timestamp: 0,
    }
  }
  const sdkFrom: any = raw.from ?? {}
  const sender: MessageSenderInfo = {
    userID: sdkFrom.userID ?? '',
    nickname: sdkFrom.nickname,
    avatarURL: sdkFrom.avatarURL,
    nameCard: sdkFrom.nameCard,
    friendRemark: sdkFrom.friendRemark,
    role: sdkFrom.role,
  }
  const payload: any = raw.messagePayload ?? {}
  const text: string | undefined = payload.text ?? raw.text
  const isGroup =
    raw.conversationType === 'GROUP' ||
    raw.conversationType === 2 ||
    raw.conversationType === 'group'

  return {
    msgID: raw.msgID ?? '',
    conversationID: raw.to ?? raw.conversationID ?? '',
    sender,
    messageType: raw.messageType ?? MessageType.TEXT,
    messagePayload: payload,
    text,
    timestamp: typeof raw.timestamp === 'number' ? raw.timestamp : Number(raw.timestamp ?? 0),
    isSelf: raw.isSentBySelf === true,
    status: raw.status,
    isRecalled: raw.status === 'revoked' || raw.status === 6,
    isGroup,
    groupID: isGroup ? raw.to : undefined,
    mentionedUserIDs: Array.isArray(raw.atUserList) ? raw.atUserList : undefined,
    needReadReceipt: raw.needReadReceipt === true,
    receipt: raw.readReceiptInfo,
  } as MessageInfo
}

export const isGroupCreateMessage = (m: MessageInfo): boolean => {
  const payload: any = m.messagePayload
  if (!payload) return false
  const cd = payload.customData
  if (!cd) return false
  try {
    const data = typeof cd === 'string' ? JSON.parse(cd) : cd
    return data?.businessID === 'group_create'
  } catch {
    return false
  }
}
