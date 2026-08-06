import { useEffect } from 'react'
import {
  useGroupMemberState,
  useLoginState,
  GroupMemberFilterRole,
} from 'tuikit-atomicx-react-native'
import type { UserPickerHookResult } from './types'
import type { User } from '../types/user'
import { GroupMemberRole } from '../types/group'
import { showToast } from '../../../utils/toast'
import { useTranslation } from 'react-i18next'

export interface UseDemoteAdminOptions {
  conversationID?: string
  onBack?: () => void
  onMembersReloaded?: (groupID: string) => void
}

function extractGroupID(conversationID: string): string {
  if (!conversationID) return ''
  return conversationID.startsWith('group_')
    ? conversationID.replace('group_', '')
    : ''
}

export function useDemoteAdmin(routeParams?: any): UserPickerHookResult {
  const options: UseDemoteAdminOptions = routeParams ?? {}
  const { t } = useTranslation()
  const conversationID: string = options.conversationID ?? ''
  const groupID: string = extractGroupID(conversationID)

  const groupMemberState = useGroupMemberState(
    groupID.length > 0
      ? { groupID, role: GroupMemberFilterRole.ADMIN }
      : null
  )
  const {
    memberList: allMembers,
    hasMoreMembers,
    setMemberRole,
    loadMoreMembers,
    loadMembers,
  } = groupMemberState as any

  const { loginUserInfo } = useLoginState()
  const myUserID: string = loginUserInfo?.userID ?? ''

  useEffect((): void => {
    if (
      groupID.length > 0 &&
      Array.isArray(allMembers) &&
      allMembers.length === 0 &&
      typeof loadMembers === 'function'
    ) {
      ;loadMembers([GroupMemberFilterRole.ADMIN]).catch((err: unknown) => {
        console.error('[useDemoteAdmin] loadMembers failed:', err)
      })
    }
  }, [groupID])


  const userList: User[] = (allMembers || [])
    .filter((member: any) => member?.role === GroupMemberRole.ADMIN)
    .filter((member: any) => member?.userID !== myUserID)
    .map((member: any) => ({
      userID: member?.userID ?? '',
      nickname:
        member?.nameCard || member?.nickname || member?.userID || '',
      avatarURL: member?.avatarURL || '',
    }))

  const lockedItems: string[] = []

  const hasMore: boolean = hasMoreMembers === true


  const handleConfirm = async (selectedUsers: User[]): Promise<void> => {
    if (selectedUsers.length === 0) {
      showToast(t('userPicker.demoteSelect'))
      return
    }

    try {
      for (const user of selectedUsers) {
        await setMemberRole(user.userID, GroupMemberFilterRole.MEMBER)
      }

      showToast(t('userPicker.demoteSuccess'))
      options.onMembersReloaded?.(groupID)
    } catch (error) {
      console.error('[useDemoteAdmin] handleConfirm failed:', error)
      const msg: string = error instanceof Error ? error.message : String(error)
      showToast(t('userPicker.demoteFailed', { msg }))
    }
  }

  const onReachEnd = async (): Promise<void> => {
    if (!hasMoreMembers) return
    try {
      await loadMoreMembers()
    } catch (error) {
      console.error(
        '[useDemoteAdmin] onReachEnd loadMoreMembers failed:',
        error
      )
    }
  }

  return {
    userList,
    lockedItems,
    maxCount: 10,
    title: t('userPicker.demoteTitle'),
    hasMore,
    handleConfirm,
    onReachEnd,
  }
}
