import { useEffect } from 'react'
import {
  useGroupMemberState,
  useLoginState,
  GroupMemberFilterRole,
} from 'tuikit-atomicx-react-native'
import type { UserPickerHookResult } from './types'
import type { User } from '../types/user'
import { showToast } from '../../../utils/toast'
import { useTranslation } from 'react-i18next'

export interface UseUnmuteGroupMemberOptions {
  conversationID?: string
  onBack?: () => void
}

function extractGroupID(conversationID: string): string {
  if (!conversationID) return ''
  return conversationID.startsWith('group_')
    ? conversationID.replace('group_', '')
    : ''
}

export function useUnmuteGroupMember(
  routeParams?: any
): UserPickerHookResult {
  const options: UseUnmuteGroupMemberOptions = routeParams ?? {}
  const { t } = useTranslation()
  const conversationID: string = options.conversationID ?? ''
  const groupID: string = extractGroupID(conversationID)

  const groupMemberState = useGroupMemberState(
    groupID.length > 0 ? { groupID } : null
  )
  const {
    memberList: allMembers,
    hasMoreMembers,
    muteMember,
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
      ;loadMembers([GroupMemberFilterRole.ALL]).catch((err: unknown) => {
        console.error('[useUnmuteGroupMember] loadMembers failed:', err)
      })
    }
  }, [groupID])

  const userList: User[] = (() => {
    const now = Math.floor(Date.now() / 1000)

    return (allMembers || [])
      .filter((member: any) => member?.muteUntil && member.muteUntil > now)
      .filter((member: any) => member?.userID !== myUserID)
      .map((member: any) => ({
        userID: member?.userID ?? '',
        nickname:
          member?.nameCard || member?.nickname || member?.userID || '',
        avatarURL: member?.avatarURL || '',
      }))
  })()

  const lockedItems: string[] = []

  const hasMore: boolean = hasMoreMembers === true

  const handleConfirm = async (selectedUsers: User[]): Promise<void> => {
    if (selectedUsers.length === 0) {
      showToast(t('userPicker.unmuteSelect'))
      return
    }

    try {
      for (const user of selectedUsers) {
        await muteMember(user.userID, 0)
      }
      showToast(t('userPicker.unmuteSuccess'))
    } catch (error) {
      console.error('[useUnmuteGroupMember] handleConfirm failed:', error)
      const msg: string = error instanceof Error ? error.message : String(error)
      showToast(t('userPicker.unmuteFailed', { msg }))
    }
  }

  const onReachEnd = async (): Promise<void> => {
    if (!hasMoreMembers) return
    try {
      await loadMoreMembers()
    } catch (error) {
      console.error(
        '[useUnmuteGroupMember] onReachEnd loadMoreMembers failed:',
        error
      )
    }
  }

  return {
    userList,
    lockedItems,
    maxCount: 100,
    title: t('userPicker.unmuteTitle'),
    hasMore,
    handleConfirm,
    onReachEnd,
  }
}
