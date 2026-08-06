import type { MessageInfo } from './MessageTypes'

export interface MessageSharedProps {
  message: MessageInfo
  onLongPress?: () => void
  showAvatar?: boolean
  showName?: boolean
  showTime?: boolean
  onAvatarClick?: (userID: string) => void
}
