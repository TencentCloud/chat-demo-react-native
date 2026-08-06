import { useEffect } from 'react'
import { useGroupMemberState, useLoginState, GroupMemberFilterRole } from 'tuikit-atomicx-react-native'
import type { UserPickerHookResult } from './types'
import type { User } from '../types/user'
import { GroupMemberRole } from '../types/group'
import { showToast } from '../../../utils/toast'
import { useTranslation } from 'react-i18next'

const DEFAULT_MUTE_DURATION = 24 * 60 * 60 * 365

export interface UseMuteGroupMemberOptions {
  conversationID?: string
  muteDuration?: number
  onBack?: () => void
}

function extractGroupID(conversationID: string): string {
  if (!conversationID) return ''
  return conversationID.startsWith('group_')
    ? conversationID.replace('group_', '')
    : ''
}

export function useMuteGroupMember(routeParams?: any): UserPickerHookResult {
  const options: UseMuteGroupMemberOptions = routeParams ?? {}
  const { t } = useTranslation()
  const conversationID: string = options.conversationID ?? ''
  const groupID: string = extractGroupID(conversationID)
  const muteDuration: number = options.muteDuration ?? DEFAULT_MUTE_DURATION

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
        console.error('[useMuteGroupMember] loadMembers failed:', err)
      })
    }
  }, [groupID])

  const userList: User[] = (() => {
    const now = Math.floor(Date.now() / 1000)

    return (allMembers || [])
      .filter((member: any) => {
        if (member?.role !== GroupMemberRole.MEMBER) return false
        if (member?.muteUntil && member.muteUntil > now) return false
        if (member?.userID === myUserID) return false
        return true
      })
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
      showToast(t('userPicker.muteSelect'))
      return
    }

    try {
      for (const user of selectedUsers) {
        await muteMember(user.userID, muteDuration)
      }
      showToast(t('userPicker.muteSuccess'))
    } catch (error) {
      console.error('[useMuteGroupMember] handleConfirm failed:', error)
      const msg: string = error instanceof Error ? error.message : String(error)
      showToast(t('userPicker.muteFailed', { msg }))
    }
  }

  const onReachEnd = async (): Promise<void> => {
    if (!hasMoreMembers) return
    try {
      await loadMoreMembers()
    } catch (error) {
      console.error(
        '[useMuteGroupMember] onReachEnd loadMoreMembers failed:',
        error
      )
    }
  }

  return {
    userList,
    lockedItems,
    maxCount: 100,
    title: t('userPicker.muteTitle'),
    hasMore,
    handleConfirm,
    onReachEnd,
  }
}
