import type { ComponentType } from 'react'

export interface ContactInfo {
  userID?: string
  contactID?: string
  nickname?: string
  avatarURL?: string
  signature?: string
  friendRemark?: string
  isFriend?: boolean
  isInBlacklist?: boolean
}

export interface FriendApplicationInfo {
  applicationID?: string
  userID?: string
  title?: string
  avatarURL?: string
  addWording?: string
  signature?: string
  type?: number
  handledStatus?: number
}

export interface GroupApplicationInfo {
  applicationID?: string
  groupID?: string
  groupName?: string
  fromUser?: string
  fromUserNickname?: string
  fromUserAvatarURL?: string
  requestMsg?: string
  handledStatus?: number
}

export interface GroupInfo {
  groupID?: string
  groupName?: string
  avatarURL?: string
  groupType?: string
}

export type EntryType = 'newContact' | 'groupNotification' | 'myGroups' | 'blacklist'

export interface EntryItem {
  type: EntryType
  label: string
  icon: any
  visible: boolean
  badge?: number
}

export type ContactInfoType = 'addFriend' | 'newContact' | 'friend'

export type ApplicationType = 'friend' | 'group'

export interface AddFriendUserInfo {
  userID: string
  nickname?: string
  avatarURL?: string
  signature?: string
  isFriend?: boolean
  allowType?: number
}

export interface FriendInfoAction {
  key: string
  label: string
  color?: string
  click?: (userID: string) => void
}

export type ComponentPlaceholder = ComponentType<any> | undefined

export interface ContactListProps {
  Avatar?: ComponentType<any>
  PlaceholderEmptyList?: ComponentType<any>
  PlaceholderLoading?: ComponentType<any>
  showNewContact?: boolean
  showGroupNotification?: boolean
  showMyGroups?: boolean
  showBlacklist?: boolean
}

export interface ContactListEmits {
  onEntryClick?: (type: EntryType) => void
  onContactSelect?: (contact: ContactInfo) => void
}

export interface GroupListProps {
  Avatar?: ComponentType<any>
  PlaceholderEmptyList?: ComponentType<any>
  PlaceholderLoading?: ComponentType<any>
}

export interface GroupListEmits {
  onGroupSelect?: (group: GroupInfo) => void
}

export interface BlackListProps {
  Avatar?: ComponentType<any>
  PlaceholderEmptyList?: ComponentType<any>
  PlaceholderLoading?: ComponentType<any>
}

export interface BlackListEmits {
  onUserClick?: (user: ContactInfo) => void
  onRemove?: (user: ContactInfo) => void
}

export interface FriendApplicationListProps {
  Avatar?: ComponentType<any>
  PlaceholderEmptyList?: ComponentType<any>
  PlaceholderLoading?: ComponentType<any>
}

export interface FriendApplicationListEmits {
  onItemClick?: (item: FriendApplicationInfo) => void
  onAccept?: (item: FriendApplicationInfo) => void
  onReject?: (item: FriendApplicationInfo) => void
}

export interface GroupApplicationListProps {
  Avatar?: ComponentType<any>
  PlaceholderEmptyList?: ComponentType<any>
  PlaceholderLoading?: ComponentType<any>
}

export interface GroupApplicationListEmits {
  onItemClick?: (item: GroupApplicationInfo) => void
  onAccept?: (item: GroupApplicationInfo) => void
  onReject?: (item: GroupApplicationInfo) => void
}

export interface AddFriendInfoProps {
  userInfo?: ContactInfo | null
  Avatar?: ComponentType<any>
}

export interface AddFriendInfoEmits {
  onAddFriend?: (userInfo: ContactInfo) => void
  onSendMessage?: (userID: string) => void
}

export interface NewContactInfoProps {
  application?: FriendApplicationInfo | null
  Avatar?: ComponentType<any>
}

export interface NewContactInfoEmits {
  onAccept?: (application: FriendApplicationInfo) => void
  onReject?: (application: FriendApplicationInfo) => void
}

export interface FriendInfoProps {
  friendInfo?: ContactInfo | null
  Avatar?: ComponentType<any>
  actions?: FriendInfoAction[]
}

export interface FriendInfoEmits {
  onSendMessage?: (userID: string) => void
  onRemarkEdit?: (friendInfo: ContactInfo) => void
  onMuteChange?: (value: boolean) => void
  onPinChange?: (value: boolean) => void
  onBlacklistChange?: (value: boolean) => void
  onDeleteFriend?: (userID: string) => void
}

export interface ContactInfoContainerProps {
  type?: ContactInfoType
  userInfo?: AddFriendUserInfo | null
  friendInfo?: ContactInfo | null
  friendApplication?: FriendApplicationInfo | null
  canAddFriend?: boolean
  Avatar?: ComponentType<any>
  friendInfoActions?: FriendInfoAction[]
}

export interface ContactInfoContainerEmits {
  onAddFriend?: (userInfo: AddFriendUserInfo) => void
  onAcceptFriend?: (application: FriendApplicationInfo) => void
  onRejectFriend?: (application: FriendApplicationInfo) => void
  onSendMessage?: (userID: string) => void
  onRemarkEdit?: (friendInfo: ContactInfo) => void
  onDeleteFriend?: (userID: string) => void
  onMuteChange?: (value: boolean) => void
  onPinChange?: (value: boolean) => void
  onBlacklistChange?: (value: boolean) => void
}

export interface ApplicationVerifyProps {
  type?: ApplicationType
  userInfo?: ContactInfo | null
  groupInfo?: GroupInfo | null
}

export interface ApplicationVerifyEmits {
  onSuccess?: (type: ApplicationType, data: ContactInfo | GroupInfo) => void
  onFail?: (type: ApplicationType, error: any) => void
}

export interface SetRemarkProps {
  userID?: string
  remark?: string
}

export interface SetRemarkEmits {
  onSuccess?: (userID: string, remark: string) => void
  onFail?: (error: any) => void
  onCancel?: () => void
}

export interface AddFriendProps {
  Avatar?: ComponentType<any>
}

export interface AddFriendEmits {
  onUserSelect?: (user: ContactInfo) => void
  onSearch?: (userID: string) => void
}

export interface AddGroupProps {
  Avatar?: ComponentType<any>
}

export interface AddGroupEmits {
  onGroupSelect?: (group: GroupInfo) => void
  onSearch?: (groupID: string) => void
}
