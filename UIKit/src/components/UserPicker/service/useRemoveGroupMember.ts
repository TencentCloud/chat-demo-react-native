import { useEffect, useState } from 'react'
import {
  useGroupMemberState,
  useLoginState,
} from 'tuikit-atomicx-react-native'
import type { UserPickerHookResult } from './types'
import type { User } from '../types/user'
import { showToast } from '../../../utils/toast'
import { useTranslation } from 'react-i18next'

export interface UseRemoveGroupMemberOptions {
  conversationID?: string
  onGroupMemberChanged?: (info: { type: 'add' | 'remove'; groupID: string; count: number }) => void
  onBack?: () => void
}

function extractGroupID(conversationID: string): string {
  if (!conversationID) return ''
  return conversationID.startsWith('group_')
    ? conversationID.replace('group_', '')
    : ''
}

export function useRemoveGroupMember(
  routeParams?: any
): UserPickerHookResult {
  const { t } = useTranslation()
  const options: UseRemoveGroupMemberOptions = routeParams ?? {}
  const conversationID: string = options.conversationID ?? ''
  const groupID: string = extractGroupID(conversationID)

  const groupMemberState = useGroupMemberState(
    groupID.length > 0 ? { groupID } : null
  )
  const {
    memberList: allMembers,
    hasMoreMembers,
    deleteMember,
    loadMoreMembers,
    loadMembers,
  } = groupMemberState as any

  const { loginUserInfo, getLoginUserInfo } = useLoginState()

  const resolveMyUserID = (): string => {
    const a: any = getLoginUserInfo()
    const b: any = loginUserInfo
    const info: any = a != null ? a : b
    if (info == null) return ''
    return info.userID ?? ''
  }

  const [loginTick, setLoginTick] = useState<number>(0)
  useEffect((): void => {
    setLoginTick((t: number): number => t + 1)
  }, [loginUserInfo])

  useEffect((): void => {
    if (
      groupID.length > 0 &&
      Array.isArray(allMembers) &&
      allMembers.length === 0 &&
      typeof loadMembers === 'function'
    ) {
      ;loadMembers([0]).catch((err: unknown) => {
        console.error('[useRemoveGroupMember] loadMembers failed:', err)
      })
    }
  }, [groupID])

  const userList: User[] = (() => {
    const me: string = resolveMyUserID()
    const meEffective: string = me + (loginTick >= 0 ? '' : '')
    return (allMembers || [])
      .filter((member: any): boolean => {
        if (meEffective.length === 0) return true
        const mUID: any = member?.userID
        const mUIDStr: string = typeof mUID === 'string' ? mUID : typeof mUID === 'number' ? `${mUID}` : ''
        if (mUIDStr.length === 0) return true
        const isMatch: boolean =
          mUIDStr === meEffective ||
          mUIDStr.indexOf(meEffective) >= 0 ||
          meEffective.indexOf(mUIDStr) >= 0
        if (isMatch) return false
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
      showToast(t('userPicker.removeSelect'))
      return
    }

    const members = selectedUsers.map((user) => user.userID)

    try {
      await deleteMember(members)
      showToast(t('userPicker.removeSuccess'))
      options.onGroupMemberChanged?.({ type: 'remove', groupID, count: selectedUsers.length })
    } catch (error) {
      console.error('[useRemoveGroupMember] handleConfirm failed:', error)
      const msg: string = error instanceof Error ? error.message : String(error)
      showToast(t('userPicker.removeFailed', { msg }))
    }
  }

  const onReachEnd = async (): Promise<void> => {
    if (!hasMoreMembers) return
    try {
      await loadMoreMembers()
    } catch (error) {
      console.error(
        '[useRemoveGroupMember] onReachEnd loadMoreMembers failed:',
        error
      )
    }
  }

  return {
    userList,
    lockedItems,
    maxCount: 100,
    title: t('userPicker.removeTitle'),
    hasMore,
    handleConfirm,
    onReachEnd,
  }
}
