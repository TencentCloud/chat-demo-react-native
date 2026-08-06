import type { FriendInfoAction } from './types'

export const defaultFriendInfoActions: FriendInfoAction[] = [
  { key: 'sendMessage', label: 'contact.sendMessage', color: '#147AFF' },
  // { key: 'voiceCall', label: 'contact.voiceCall', color: '#147AFF' },
  // { key: 'videoCall', label: 'contact.videoCall', color: '#147AFF' },
  { key: 'deleteFriend', label: 'contact.deleteFriend', color: '#FF584C' },
]

export type { FriendInfoAction }
