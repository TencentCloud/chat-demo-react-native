import type { ComponentType, ReactNode } from 'react'


export enum KeywordListMatchMode {
  OR = 0,
  AND = 1,
}

export enum SearchType {
  FRIEND = 0,
  GROUP = 1,
  GROUP_MEMBER = 2,
  MESSAGE = 3,
}

export enum SearchTabValue {
  All = 'all',
  Message = 'message',
  Friend = 'friend',
  Group = 'group',
}

export enum Gender {
  UNKNOWN = 0,
  MALE = 1,
  FEMALE = 2,
}

export enum GroupType {
  Work = 'Work',
  Public = 'Public',
  Meeting = 'Meeting',
  AVChatRoom = 'AVChatRoom',
  Community = 'Community',
}

export enum MessageType {
  TEXT = 1,
  IMAGE = 2,
  VIDEO = 3,
  SOUND = 4,
  FILE = 5,
  FACE = 6,
  SYSTEM = 7,
  CUSTOM = 8,
  MERGED = 9,
}


export interface UserProfile {
  userID: string
  nickname?: string
  avatarURL?: string
  gender?: Gender
  birthday?: number
}

export interface FriendSearchInfo {
  userID: string
  friendRemark?: string
  friendAddTime?: number
  friendCustomInfo?: Record<string, string>
  userInfo?: UserProfile
}

export interface GroupMember {
  userID: string
  nickname?: string
  friendRemark?: string
  nameCard?: string
  avatarURL?: string
  role?: number
}

export interface GroupSearchInfo {
  groupID: string
  groupName?: string
  groupAvatarURL?: string
  groupType?: GroupType
  memberCount?: number
}

export interface MessagePayloadBase {
  text?: string
  thumbImagePath?: string
  originalImagePath?: string
  videoSnapshotPath?: string
  videoDuration?: number
  soundDuration?: number
  fileName?: string
  fileSize?: number
  faceIndex?: number
  faceName?: string
}

export interface MessageInfo {
  messageID: string
  msgID?: string
  conversationID: string
  messageType: MessageType | number
  from?: {
    userID: string
    nickname?: string
    friendRemark?: string
    nameCard?: string
    avatarURL?: string
  }
  messagePayload?: MessagePayloadBase
  timestamp?: number
}

export interface MessageSearchResultItem {
  conversationID: string
  conversationShowName: string
  conversationAvatarURL?: string
  messageCount: number
  messageList: MessageInfo[]
}

export interface ConversationInfo {
  conversationID: string
  showName?: string
  avatarURL?: string
  type?: 'C2C' | 'GROUP'
}


export interface UserSearchFilter {
  gender?: Gender
  minBirthday?: number
  maxBirthday?: number
}

export interface GroupMemberSearchFilter {
  groupIDList?: string[]
}

export interface MessageSearchFilter {
  conversationID?: string
  searchTimePosition?: number
  searchTimePeriod?: number
  senderUserIDList?: string[]
  messageTypeList?: (MessageType | number)[]
}

export interface SearchOption {
  keywordListMatchMode?: KeywordListMatchMode
  searchScope?: SearchType[]
  pageSize?: number
  userFilter?: UserSearchFilter
  groupMemberFilter?: GroupMemberSearchFilter
  messageFilter?: MessageSearchFilter
}


export interface SearchTabItem {
  label: string
  value: SearchTabValue
}

export interface SearchTabProps {
  modelValue?: SearchTabValue
  tabs?: SearchTabItem[]
}

export type SearchTabEmits = {
  'update:modelValue': (value: SearchTabValue) => void
  change: (value: SearchTabValue) => void
}


export interface SearchBarProps {
  placeholder?: string
  modelValue?: string
  autoFocus?: boolean
  showCancel?: boolean
  cancelText?: string
  debounceTime?: number
  disabled?: boolean
}

export type SearchBarEmits = {
  'update:modelValue': (value: string) => void
  input: (value: string) => void
  search: (keyword: string) => void
  cancel: () => void
  focus: () => void
  blur: () => void
  clear: () => void
}

export interface SearchBarRef {
  focus: () => void
  blur: () => void
}


export type SearchResultType = 'user' | 'friend' | 'group' | 'groupMember' | 'message'

export const SearchResultTypeMap: Record<SearchResultType, SearchType> = {
  user: SearchType.FRIEND,
  friend: SearchType.FRIEND,
  group: SearchType.GROUP,
  groupMember: SearchType.GROUP_MEMBER,
  message: SearchType.MESSAGE,
}


export interface SearchResultsProps {
  keyword?: string
  conversationID?: string
  currentTab?: SearchTabValue
  searchType?: SearchType | SearchType[]
  isLoading?: boolean
  showPresearch?: boolean
  userList?: UserProfile[]
  friendList?: FriendSearchInfo[]
  groupList?: GroupSearchInfo[]
  groupMemberList?: Record<string, GroupMember[]>
  messageResults?: MessageSearchResultItem[]
  conversationList?: ConversationInfo[]
  hasMoreUser?: boolean
  hasMoreFriend?: boolean
  hasMoreGroup?: boolean
  hasMoreGroupMember?: boolean
  hasMoreMessage?: boolean
  searchHistory?: string[]
  showCloudSearch?: boolean
  SearchResultItem?: ComponentType<any>
  PlaceholderEmpty?: ComponentType<any>
  PlaceholderLoading?: ComponentType<any>
  PlaceholderPresearch?: ComponentType<any>
  Avatar?: ComponentType<any>
}

export type SearchResultsEmits = {
  resultItemClick: (
    type: SearchResultType | 'conversation',
    data: FriendSearchInfo | UserProfile | GroupSearchInfo | GroupMember | MessageSearchResultItem
  ) => void
  viewMore: (type: SearchResultType) => void
  historyClick: (keyword: string) => void
  clearHistory: () => void
  cloudSearchClick: () => void
}


export interface SearchResultItemUserProps {
  type: 'user' | 'friend' | 'groupMember'
  user: UserProfile | FriendSearchInfo | GroupMember
  keyword?: string
  Avatar?: ComponentType<any>
}

export interface SearchResultItemFriendProps {
  friend: FriendSearchInfo
  keyword?: string
  Avatar?: ComponentType<any>
}

export interface SearchResultItemGroupProps {
  group: GroupSearchInfo
  keyword?: string
  Avatar?: ComponentType<any>
}

export interface SearchResultItemGroupMemberProps {
  member: GroupMember
  groupID?: string
  keyword?: string
  Avatar?: ComponentType<any>
}

export interface SearchResultItemMessageProps {
  messageResult: MessageSearchResultItem
  keyword?: string
  Avatar?: ComponentType<any>
}

export interface SearchResultItemConversationProps {
  conversation: ConversationInfo
  keyword?: string
  Avatar?: ComponentType<any>
}

export interface SearchResultItemProps {
  type: SearchResultType | 'conversation'
  data: FriendSearchInfo | UserProfile | GroupSearchInfo | GroupMember | MessageSearchResultItem
  keyword?: string
  Avatar?: ComponentType<any>
}

export type SearchResultItemEmits = {
  click: (
    type: SearchResultType | 'conversation',
    data: FriendSearchInfo | UserProfile | GroupSearchInfo | GroupMember | MessageSearchResultItem
  ) => void
}


export interface MessageAdvancedProps {
  startDate?: string
  endDate?: string
}

export type MessageAdvancedEmits = {
  'update:startDate': (value: string) => void
  'update:endDate': (value: string) => void
  change: (startDate: string, endDate: string) => void
}

export interface UserAdvancedProps {
  minBirthday?: number
  maxBirthday?: number
  gender?: Gender
}

export type UserAdvancedEmits = {
  'update:minBirthday': (value: number | undefined) => void
  'update:maxBirthday': (value: number | undefined) => void
  'update:gender': (value: Gender) => void
  change: (minBirthday: number | undefined, maxBirthday: number | undefined, gender: Gender) => void
  click: () => void
}

export interface SearchAdvancedProps {
  currentTab?: SearchTabValue
  conversationID?: string
  isCloudSearch?: boolean
}

export type SearchAdvancedEmits = {
  messageFilterChange: (filter: MessageSearchFilter) => void
  userFilterChange: (filter: UserSearchFilter) => void
}


export interface DateRangePickerProps {
  label?: string
  startDate?: string
  endDate?: string
  startPlaceholder?: string
  endPlaceholder?: string
  minYear?: number
  maxYear?: number
}

export type DateRangePickerEmits = {
  'update:startDate': (value: string) => void
  'update:endDate': (value: string) => void
  change: (startDate: string, endDate: string) => void
}


export interface SliderProps {
  label?: string
  min?: number
  max?: number
  minValue?: number
  maxValue?: number
  step?: number
  unit?: string
  formatValue?: (value: number) => string
}

export type SliderEmits = {
  'update:minValue': (value: number) => void
  'update:maxValue': (value: number) => void
  change: (minValue: number, maxValue: number) => void
}


export interface SearchProps {
  conversationID?: string
  initialKeyword?: string
  initialOption?: SearchOption
  placeholder?: string
  isCloud?: boolean
  autoFocus?: boolean
  showAdvanced?: boolean
  showCancel?: boolean
  debounceTime?: number
  SearchBar?: ComponentType<any>
  SearchResults?: ComponentType<any>
  SearchAdvanced?: ComponentType<any>
  SearchTab?: ComponentType<any>
  PlaceholderPresearch?: ComponentType<any>
  PlaceholderLoading?: ComponentType<any>
  PlaceholderEmpty?: ComponentType<any>
  SearchResultItem?: ComponentType<any>
  Avatar?: ComponentType<any>
}

export type SearchEmits = {
  search: (keyword: string, option: SearchOption) => void
  cancel: () => void
  tabChange: (tab: SearchTabValue) => void
  resultItemClick: (
    type: SearchResultType | 'conversation',
    data: FriendSearchInfo | UserProfile | GroupSearchInfo | GroupMember | MessageSearchResultItem
  ) => void
}


export interface PresearchPlaceholderProps {
  searchHistory?: string[]
  keyword?: string
  showCloudSearch?: boolean
}

export type PresearchPlaceholderEmits = {
  historyClick: (keyword: string) => void
  cloudSearchClick: () => void
}

export interface EmptyPlaceholderProps {
  keyword?: string
}

export interface LoadingPlaceholderProps {
  text?: string
}


export const rpxToPx = (rpx: number, screenWidth: number): number => (rpx / 750) * screenWidth

export type WithChildren<T = {}> = T & { children?: ReactNode }
