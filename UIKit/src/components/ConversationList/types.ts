export enum ConversationType {
  UNKNOWN = 0,
  C2C = 1,
  GROUP = 2,
}

export enum ReceiveMessageOpt {
  RECEIVE = 0,
  NOT_RECEIVE = 1,
  NOT_NOTIFY = 2,
  NOT_NOTIFY_EXCEPT_MENTION = 3,
  NOT_RECEIVE_EXCEPT_MENTION = 4,
}

export enum GroupAtType {
  AT_ME = 1,
  AT_ALL = 2,
  AT_ALL_AT_ME = 3,
}

export enum GroupType {
  WORK = 'Work',
  PUBLIC = 'Public',
  MEETING = 'Meeting',
  AV_CHAT_ROOM = 'AVChatRoom',
  COMMUNITY = 'Community',
}

export enum MessageType {
  UNKNOWN = 0,
  TEXT = 1,
  IMAGE = 2,
  VIDEO = 3,
  AUDIO = 4,
  FILE = 5,
  FACE = 6,
  TIPS = 7,
  CUSTOM = 8,
  MERGED = 9,
  STREAM = 10,
}

export enum MessageStatus {
  INIT = 0,
  SENDING = 1,
  SEND_SUCCESS = 2,
  SEND_FAIL = 3,
  REVOKED = 4,
  DELETED = 5,
}

export enum ConversationActionType {
  PIN = 'pin',
  MUTE = 'mute',
  DELETE = 'delete',
}


export interface MessageSegment {
  type: 'text' | 'emoji'
  content?: string
  src?: string
}

export interface RichTextNode {
  type?: 'text' | 'emoji'
  text?: string
  src?: string
}

export interface GroupAtInfo {
  atType: GroupAtType
}

export interface MessageSenderInfo {
  userID: string
  nickname?: string
  nameCard?: string
  friendRemark?: string
  avatarURL?: string
}

export interface MessagePayload {
  text?: string
  imagePath?: string
  videoPath?: string
  audioPath?: string
  audioDuration?: number
  filePath?: string
  fileName?: string
  description?: string
  title?: string
  abstract?: string
  customData?: string
  [key: string]: any
}

export interface MessageInfo {
  ID?: string
  messageType: MessageType | number
  messagePayload?: MessagePayload
  status?: MessageStatus | number
  timestamp: number  
  from?: MessageSenderInfo
  to?: string
  isSelf?: boolean
  isSentBySelf?: boolean
  groupID?: string
  conversationID?: string
  conversationType?: ConversationType | number
}

export interface ConversationInfo {
  conversationID: string
  type: ConversationType | number
  title?: string
  showName?: string  
  avatarURL?: string
  groupType?: GroupType | string
  lastMessage?: MessageInfo
  draft?: string
  draftText?: string  
  unreadCount: number
  isPinned?: boolean
  receiveOption?: ReceiveMessageOpt | number
  groupAtInfoList?: GroupAtInfo[]
}


export interface ActionItem {
  key: string
  text: string
  backgroundColor?: string
  color?: string
  onClick?: (conversationID: string) => void
}

export interface ActionsConfig {
  actions?: ActionItem[]
  isSupportPin?: boolean
  isSupportMute?: boolean
  isSupportDelete?: boolean
}


export interface ConversationActionsProps {
  conversation: ConversationInfo
  actions?: ActionItem[]
  isSupportPin?: boolean
  isSupportMute?: boolean
  isSupportDelete?: boolean
}

export interface ConversationActionsEmits {
  conversationPin: (conversationID: string, isPinned: boolean) => void
  conversationMute: (conversationID: string, isMuted: boolean) => void
  conversationDelete: (conversationID: string) => void
}

export interface ConversationPreviewProps {
  conversation: ConversationInfo
}

export interface ConversationListProps {
  actionsConfig?: ActionsConfig
  Preview?: React.ComponentType<ConversationPreviewProps>
  ConversationActions?: React.ComponentType<ConversationActionsProps>
  Avatar?: React.ComponentType<any>
  PlaceholderEmptyList?: React.ComponentType
  PlaceholderLoading?: React.ComponentType
  PlaceholderLoadError?: React.ComponentType<{ error?: Error | null }>
  filter?: (conv: ConversationInfo) => boolean
  sort?: (a: ConversationInfo, b: ConversationInfo) => number
}

export interface ConversationListEmits {
  conversationSelect: (conv: ConversationInfo) => void
  conversationPin: (conversationID: string, isPinned: boolean) => void
  conversationMute: (conversationID: string, isMuted: boolean) => void
  conversationDelete: (conversationID: string) => void
}

export interface LoadErrorPlaceholderProps {
  error?: Error | null
}
