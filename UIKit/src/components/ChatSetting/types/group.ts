

export enum GroupType {
  Work = 'Work',
  Public = 'Public',
  Meeting = 'Meeting',
  AVChatRoom = 'AVChatRoom',
  Community = 'Community',
}

export enum GroupMemberRole {
  UNDEFINED = 0,
  MEMBER = 200,
  ADMIN = 300,
  OWNER = 400,
}

export enum GroupMemberFilterRole {
  ALL = 0,
  MEMBER = 200,
  ADMIN = 300,
  OWNER = 400,
}

export enum GroupJoinOption {
  FORBID = 0,
  AUTH = 1,
  ANY = 2,
}

export enum GroupInviteOption {
  FORBID = 0,
  AUTH = 1,
  ANY = 2,
}

export interface GroupInfo {
  groupID: string
  groupName?: string
  groupType?: GroupType
  avatarURL?: string
  notification?: string
  introduction?: string
  memberCount?: number
  joinOption?: GroupJoinOption
  inviteOption?: GroupInviteOption
  isAllMuted?: boolean
  selfRole?: GroupMemberRole
  ownerID?: string
  createTime?: number
}

export interface GroupMember {
  userID: string
  nickname?: string
  nameCard?: string
  avatarURL?: string
  role?: GroupMemberRole
  muteUntil?: number
  joinTime?: number
}
