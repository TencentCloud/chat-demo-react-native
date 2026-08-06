
import type { User } from '../types/user'

export interface UserPickerHookResult {
  userList: User[]
  lockedItems: string[]
  maxCount: number
  title: string
  hasMore: boolean
  handleConfirm: (selectedUsers: User[]) => Promise<void>
  handleCancel?: () => Promise<void>
  onReachEnd?: () => Promise<void>
  singleSelect?: boolean
  pinnedTopItems?: User[]
  onSearchChange?: (keyword: string) => Promise<void> | void
  enableSearch?: boolean
}
export type UserPickerHook = (routeParams?: any) => UserPickerHookResult
