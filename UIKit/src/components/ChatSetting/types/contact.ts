

export enum ReceiveMessageOpt {
  RECEIVE = 0,
  NOT_RECEIVE = 1,
  NOT_NOTIFY = 2,
  NOT_NOTIFY_EXCEPT_MENTION = 3,
  NOT_RECEIVE_EXCEPT_MENTION = 4,
}

export enum ConversationMarkType {
  STAR = 'STAR',
  UNREAD = 'UNREAD',
  HIDE = 'HIDE',
  NOTIFY = 'NOTIFY',
}

export interface ContactInfo {
  userID: string
  nickname?: string
  friendRemark?: string
  avatarURL?: string
  aboutMe?: string
  isFriend?: boolean
  isInBlacklist?: boolean
}

export interface ConversationInfo {
  conversationID: string
  showName?: string
  conversationType?: number
  receiveOption?: ReceiveMessageOpt
  isPinned?: boolean
  unreadCount?: number
  markList?: ConversationMarkType[]
  lastMessage?: unknown
}
