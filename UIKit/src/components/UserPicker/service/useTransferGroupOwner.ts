import { useEffect } from 'react'
import {
  useGroupMemberState,
  useGroupState,
  useLoginState,
  GroupMemberFilterRole,
} from 'tuikit-atomicx-react-native'
import type { UserPickerHookResult } from './types'
import type { User } from '../types/user'
import { GroupMemberRole } from '../types/group'
import { showToast } from '../../../utils/toast'
import { useTranslation } from 'react-i18next'

export interface UseTransferGroupOwnerOptions {
  conversationID?: string
  onGroupOwnerChanged?: (info: { groupID: string; newOwnerID: string }) => void
  onBack?: () => void
}

function extractGroupID(conversationID: string): string {
  if (!conversationID) return ''
  return conversationID.startsWith('group_')
    ? conversationID.replace('group_', '')
    : ''
}

export function useTransferGroupOwner(
  routeParams?: any
): UserPickerHookResult {
  const options: UseTransferGroupOwnerOptions = routeParams ?? {}
  const { t } = useTranslation()
  const conversationID: string = options.conversationID ?? ''
  const groupID: string = extractGroupID(conversationID)

  const groupMemberState = useGroupMemberState(
    groupID.length > 0 ? { groupID } : null
  )
  const groupState = useGroupState()
  const {
    memberList: allMembers,
    hasMoreMembers,
    loadMoreMembers,
    loadMembers,
  } = groupMemberState as any
  const { changeOwner } = groupState

  const { loginUserInfo } = useLoginState()
  const myUserID: string = loginUserInfo?.userID ?? ''

  useEffect((): void => {
    if (
      groupID.length > 0 &&
      Array.isArray(allMembers) &&
      allMembers.length === 0 &&
      typeof loadMembers === 'function'
    ) {
      ;loadMembers([GroupMemberFilterRole.ALL]).catch((err: unknown) => {
        console.error('[useTransferGroupOwner] loadMembers failed:', err)
      })
    }
  }, [groupID])


  const userList: User[] = (allMembers || [])
    .filter((member: any) => member?.role !== GroupMemberRole.OWNER)
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
      showToast(t('userPicker.transferSelect'))
      return
    }

    const newOwnerID = selectedUsers[0].userID

    try {
      await changeOwner(groupID, newOwnerID)
      showToast(t('userPicker.transferSuccess'))
      options.onGroupOwnerChanged?.({ groupID, newOwnerID })
    } catch (error) {
      console.error('[useTransferGroupOwner] handleConfirm failed:', error)
      const msg: string = error instanceof Error ? error.message : String(error)
      showToast(t('userPicker.transferFailed', { msg }))
    }
  }

  const onReachEnd = async (): Promise<void> => {
    if (!hasMoreMembers) return
    try {
      await loadMoreMembers()
    } catch (error) {
      console.error(
        '[useTransferGroupOwner] onReachEnd loadMoreMembers failed:',
        error
      )
    }
  }

  return {
    userList,
    lockedItems,
    maxCount: 1,
    title: t('userPicker.transferTitle'),
    hasMore,
    handleConfirm,
    onReachEnd,
  }
}
